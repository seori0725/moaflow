const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const mimeTypes = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
let server;
let browser;
let baseUrl;

test.before(async () => {
  server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const filePath = path.resolve(root, pathname === "/" ? "index.html" : pathname.slice(1));
    if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      response.writeHead(404); response.end("Not found"); return;
    }
    response.writeHead(200, { "content-type": mimeTypes[path.extname(filePath)] || "application/octet-stream", "cache-control": "no-store" });
    fs.createReadStream(filePath).pipe(response);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  browser = await chromium.launch(process.platform === "win32" && fs.existsSync(chromePath) ? { executablePath: chromePath } : {});
});

test.after(async () => {
  await browser?.close();
  await new Promise((resolve) => server?.close(resolve));
});

async function openAs(userId, qa = false, viewport = { width: 1440, height: 1000 }) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript((id) => sessionStorage.setItem("moaflow-foundation-session", JSON.stringify({ userId: id, verifiedAt: new Date().toISOString() })), userId);
  const page = await context.newPage();
  await page.goto(`${baseUrl}/${qa ? "?qa=large" : ""}`, { waitUntil: "domcontentloaded" });
  await page.locator("#workspace:not(.hidden)").waitFor();
  return { context, page };
}

async function navigate(page, view) {
  const target = page.locator(`[data-view="${view}"]`);
  if (!(await target.isVisible())) {
    const mobileToggle = page.locator("#mobile-nav-toggle");
    if (await mobileToggle.isVisible()) await mobileToggle.click();
    const group = page.locator(`[data-nav-group-container]:has([data-view="${view}"]) [data-nav-group]`);
    if (await group.count()) await group.click();
  }
  await target.dispatchEvent("click");
}

async function switchToManual(page) {
  await page.locator("#guardian-payment-mode").selectOption("manual");
  await page.locator("#guardian-payment-setting-form button[type=submit]").click();
}

test("원장은 월초·월말 또는 첫 등교일 기준과 반별 수강료를 저장한다", async () => {
  const { context, page } = await openAs("usr-owner");
  await navigate(page, "billing");
  assert.equal(await page.locator("#page-title").textContent(), "학원비 관리");
  await page.locator("#billing-schedule-type").selectOption("first_attendance");
  assert.equal(await page.locator("#billing-timing").isDisabled(), true);
  await page.locator("#billing-due-days").fill("10");
  await page.locator("#billing-policy-form button[type=submit]").click();
  assert.deepEqual(await page.evaluate(() => {
    const policy = state.billingPolicies.find((item) => item.academyId === currentAcademy().id);
    return { scheduleType: policy.scheduleType, dueDays: policy.dueDays };
  }), { scheduleType: "first_attendance", dueDays: 10 });
  await navigate(page, "academy");
  const tuitionInput = page.locator(".academy-class-tuition").first();
  const classId = await tuitionInput.getAttribute("data-class-id");
  await tuitionInput.fill("260000");
  await page.locator(`[data-action="save-academy-class"][data-class-id="${classId}"]`).click();
  const amount = await page.evaluate((id) => {
    const academyClass = state.academyClasses.find((item) => item.id === id);
    return state.tuitionPlans.find((item) => item.academyId === academyClass.academyId && item.className === academyClass.name)?.amount;
  }, classId);
  assert.equal(amount, 260000);
  await context.close();
});

test("원장은 반을 확인하고 상태별 조회 후 미납 알림을 일괄 발송한다", async () => {
  const { context, page } = await openAs("usr-owner");
  await navigate(page, "billing");
  assert.equal(await page.locator(".billing-table thead").getByText("반", { exact: true }).count(), 1);
  assert.equal(await page.locator(".billing-table thead").getByText("학부모", { exact: true }).count(), 0);
  await page.locator("#billing-owner-status-filter").selectOption("overdue");
  const rows = page.locator(".billing-table tbody tr");
  assert.ok(await rows.count() >= 1);
  assert.equal(await rows.locator(".badge", { hasText: "미납" }).count(), await rows.count());
  await page.locator("#billing-overdue-select-all").check();
  const selected = await page.locator(".billing-overdue-check:checked").count();
  const before = await page.evaluate(() => state.billingNotifications.length);
  await page.locator('[data-payment-action="send-bulk-reminders"]').click();
  assert.equal(await page.evaluate(() => state.billingNotifications.length), before + selected);
  await context.close();
});

test("학부모는 여러 자녀·학원 청구서를 한 번 선택하고 카드는 학원별 결제로 분리한다", async () => {
  const { context, page } = await openAs("qa-guardian-001", true);
  await navigate(page, "billing");
  await switchToManual(page);
  const selectable = page.locator(".payment-invoice-check");
  assert.ok(await selectable.count() >= 2);
  const targetIds = await page.evaluate(() => {
    const invoices = state.invoices.filter((item) => item.guardianUserId === currentUser().id && ["issued", "overdue", "failed"].includes(item.status));
    const first = invoices[0];
    const second = invoices.find((item) => item.academyId !== first.academyId);
    return [first.id, second.id];
  });
  for (const invoiceId of targetIds) await page.locator(`.payment-invoice-check[value="${invoiceId}"]`).check();
  await page.locator("#mock-card-outcome").selectOption("success");
  await page.locator('[data-payment-action="pay-card"]').click();
  const result = await page.evaluate((invoiceIds) => {
    const batch = state.paymentBatches.at(-1);
    const payments = state.payments.filter((item) => item.batchId === batch.id);
    return { batchStatus: batch.status, batchInvoiceCount: batch.invoiceIds.length, paymentCount: payments.length, academyCount: new Set(payments.map((item) => item.academyId)).size, invoiceStatuses: invoiceIds.map((id) => state.invoices.find((item) => item.id === id).status) };
  }, targetIds);
  assert.equal(result.batchStatus, "paid");
  assert.equal(result.batchInvoiceCount, 2);
  assert.equal(result.paymentCount, result.academyCount);
  assert.deepEqual(result.invoiceStatuses, ["paid", "paid"]);
  await context.close();
});

test("카드 자동결제 동의 저장은 결제하지 않고 이후 새 청구서의 납부일에만 처리한다", async () => {
  const { context, page } = await openAs("usr-guardian");
  await navigate(page, "billing");
  const payableIds = await page.evaluate(() => state.invoices.filter((item) => item.guardianUserId === currentUser().id && ["issued", "overdue", "failed"].includes(item.status)).map((item) => item.id));
  assert.ok(payableIds.length >= 1);
  const paymentsBefore = await page.evaluate(() => state.payments.length);
  await page.locator("#guardian-payment-mode").selectOption("automatic");
  await page.locator("#guardian-auto-pay").check();
  await page.locator("#guardian-payment-setting-form button[type=submit]").click();
  const result = await page.evaluate((invoiceIds) => ({
    setting: state.guardianPaymentSettings.find((item) => item.guardianUserId === currentUser().id),
    statuses: invoiceIds.map((id) => state.invoices.find((item) => item.id === id).status),
    paymentCount: state.payments.length
  }), payableIds);
  assert.equal(result.setting.autoPay, true);
  assert.ok(result.setting.consentAt);
  assert.ok(result.statuses.some((status) => status !== "paid"));
  assert.equal(result.paymentCount, paymentsBefore);
  const automatic = await page.evaluate(() => {
    const setting = state.guardianPaymentSettings.find((item) => item.guardianUserId === currentUser().id);
    const source = state.invoices.find((item) => item.guardianUserId === currentUser().id);
    const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date());
    const invoice = { ...source, id: `test-auto-${Date.now()}`, billingMonth: today.slice(0, 7), status: "issued", paidAmount: 0, issuedAt: new Date(new Date(setting.consentAt).getTime() + 1000).toISOString(), dueDate: today, paidAt: null, paymentMethod: null };
    state.invoices.push(invoice);
    window.MoaFlowPayments.runAutomation(state, today);
    return { status: invoice.status, automaticPayments: state.payments.filter((item) => item.invoiceIds.includes(invoice.id) && item.automatic).length };
  });
  assert.deepEqual(automatic, { status: "paid", automaticPayments: 1 });
  await context.close();
});

test("결제 설정을 매월 직접결제로 저장해도 즉시 결제되지 않는다", async () => {
  const { context, page } = await openAs("usr-guardian");
  await navigate(page, "billing");
  const paymentsBefore = await page.evaluate(() => state.payments.length);
  await switchToManual(page);
  const result = await page.evaluate(() => ({
    setting: state.guardianPaymentSettings.find((item) => item.guardianUserId === currentUser().id),
    payments: state.payments.length
  }));
  assert.equal(result.setting.paymentMode, "manual");
  assert.equal(result.setting.autoPay, false);
  assert.equal(result.payments, paymentsBefore);
  await context.close();
});

test("카드 승인 거절은 실패로 남고 다시 결제할 수 있다", async () => {
  const { context, page } = await openAs("usr-guardian");
  await navigate(page, "billing");
  await switchToManual(page);
  const checkbox = page.locator(".payment-invoice-check").first();
  assert.ok(await checkbox.count() >= 1);
  const invoiceId = await checkbox.getAttribute("value");
  await checkbox.check();
  await page.locator("#mock-card-outcome").selectOption("declined");
  await page.locator('[data-payment-action="pay-card"]').click();
  assert.deepEqual(await page.evaluate((id) => { const invoice = state.invoices.find((item) => item.id === id); const payment = state.payments.at(-1); return { invoiceStatus: invoice.status, paymentStatus: payment.status, failureCode: payment.failureCode }; }, invoiceId), { invoiceStatus: "failed", paymentStatus: "failed", failureCode: "CARD_DECLINED" });
  await context.close();
});

test("고정 가상계좌 입금은 청구일이 오래된 청구서부터 자동 배분되고 초과분은 다음 청구서로 넘어간다", async () => {
  const { context, page } = await openAs("qa-guardian-001", true);
  await navigate(page, "billing");
  await switchToManual(page);
  const [first, second] = await page.evaluate(() => state.invoices
    .filter((item) => item.guardianUserId === currentUser().id && ["issued", "overdue", "failed"].includes(item.status))
    .sort((a, b) => (a.issuedAt || "").localeCompare(b.issuedAt || ""))
    .slice(0, 2)
    .map((item) => ({ id: item.id, amount: item.amount, paidAmount: item.paidAmount || 0 })));
  assert.ok(first && second);
  const overflow = 5000;
  const depositAmount = (first.amount - first.paidAmount) + overflow;
  await page.evaluate((amount) => {
    window.MoaFlowPayments.allocateVirtualAccountDeposit(state, currentUser().id, amount, paymentContext());
    persistState(); renderShell(); renderView();
  }, depositAmount);
  const result = await page.evaluate(([firstId, secondId]) => {
    const invFirst = state.invoices.find((item) => item.id === firstId);
    const invSecond = state.invoices.find((item) => item.id === secondId);
    return { firstStatus: invFirst.status, firstPaidAmount: invFirst.paidAmount, firstMethod: invFirst.paymentMethod, secondPaidAmount: invSecond.paidAmount };
  }, [first.id, second.id]);
  assert.equal(result.firstStatus, "paid");
  assert.equal(result.firstPaidAmount, first.amount);
  assert.equal(result.firstMethod, "virtual_account");
  assert.equal(result.secondPaidAmount, second.paidAmount + overflow);
  await context.close();
});

test("가상계좌로 일부 납부된 청구서를 카드결제하면 남은 금액만 청구한다", async () => {
  const { context, page } = await openAs("usr-guardian");
  await navigate(page, "billing");
  await switchToManual(page);
  const target = await page.evaluate(() => {
    const invoice = state.invoices.find((item) => item.guardianUserId === currentUser().id && ["issued", "overdue", "failed"].includes(item.status));
    invoice.paidAmount = Math.round(invoice.amount * 0.5);
    renderView();
    return { id: invoice.id, amount: invoice.amount, paidAmount: invoice.paidAmount };
  });
  await page.locator(`.payment-invoice-check[value="${target.id}"]`).check();
  await page.locator("#mock-card-outcome").selectOption("success");
  await page.locator('[data-payment-action="pay-card"]').click();
  const result = await page.evaluate((id) => {
    const invoice = state.invoices.find((item) => item.id === id);
    const payment = state.payments.at(-1);
    return { status: invoice.status, paidAmount: invoice.paidAmount, chargedAmount: payment.amount };
  }, target.id);
  assert.equal(result.status, "paid");
  assert.equal(result.paidAmount, target.amount);
  assert.equal(result.chargedAmount, target.amount - target.paidAmount);
  await context.close();
});

test("학부모 직접결제 표는 원생·학원 필터와 전체선택이 필터된 항목에만 적용된다", async () => {
  const { context, page } = await openAs("qa-guardian-001", true);
  await navigate(page, "billing");
  await switchToManual(page);
  const totalRows = await page.locator(".consolidated-checkout .payment-invoice-check").count();
  assert.ok(totalRows >= 2);
  const studentId = await page.evaluate(() => state.invoices.filter((item) => item.guardianUserId === currentUser().id && ["issued", "overdue", "failed"].includes(item.status))[0].studentId);
  await page.locator("#payment-checkout-student-filter").selectOption(studentId);
  const filteredRows = await page.locator(".consolidated-checkout .payment-invoice-check").count();
  assert.ok(filteredRows > 0 && filteredRows <= totalRows);
  await page.locator("#payment-invoice-select-all").check();
  const checkedCount = await page.locator(".consolidated-checkout .payment-invoice-check:checked").count();
  assert.equal(checkedCount, filteredRows);
  await context.close();
});

test("원장·학부모·운영자는 월별과 연별 결제 내역을 조회하고 모바일에서 넘치지 않는다", async () => {
  for (const [userId, qa] of [["usr-owner", false], ["usr-guardian", false], ["qa-operator", true]]) {
    const { context, page } = await openAs(userId, qa, { width: 390, height: 844 });
    await navigate(page, "billing");
    await page.locator('[data-payment-action="period-mode"][data-mode="yearly"]').click();
    assert.equal(await page.locator("#billing-year").isVisible(), true);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert.ok(overflow <= 1, `${userId} horizontal overflow ${overflow}`);
    await context.close();
  }
});

test("자녀별 학원 수가 서로 다른 여러 조합에서도 필터·전체선택·카드결제·가상계좌 배분이 올바르게 동작한다", async () => {
  const { context, page } = await openAs("qa-guardian-001", true);
  await navigate(page, "billing");
  await switchToManual(page);
  const setup = await page.evaluate(() => {
    const guardianId = currentUser().id;
    state.invoices = state.invoices.filter((item) => item.guardianUserId !== guardianId);
    state.guardianLinks = state.guardianLinks.filter((item) => item.guardianUserId !== guardianId);
    state.selectedPaymentInvoiceIds = [];
    state.paymentCheckoutStudentFilter = "all";
    state.paymentCheckoutAcademyFilter = "all";
    const students = state.students.slice(0, 3);
    const academies = state.academies.slice(0, 8);
    const plan = [
      { student: students[0], academyCount: 4 },
      { student: students[1], academyCount: 2 },
      { student: students[2], academyCount: 1 }
    ];
    let academyPointer = 0;
    const created = [];
    plan.forEach((entry, childIndex) => {
      for (let i = 0; i < entry.academyCount; i += 1) {
        const academy = academies[academyPointer % academies.length];
        academyPointer += 1;
        const invoice = {
          id: `synthetic-asym-${childIndex}-${i}`,
          academyId: academy.id,
          guardianUserId: guardianId,
          studentId: entry.student.id,
          enrollmentId: `synthetic-enrollment-${childIndex}-${i}`,
          billingMonth: "2026-08",
          amount: 100000 + i * 10000,
          issuedAt: `2026-08-${String(((childIndex * 4 + i) % 27) + 1).padStart(2, "0")}T09:00:00+09:00`,
          dueDate: "2026-08-25",
          status: "issued",
          paidAmount: 0,
          paidAt: null,
          paymentMethod: null,
          updatedAt: new Date(0).toISOString()
        };
        state.invoices.push(invoice);
        created.push(invoice.id);
      }
    });
    persistState();
    renderView();
    return { studentIds: plan.map((p) => p.student.id), totalCreated: created.length };
  });
  assert.equal(setup.totalCreated, 7);
  const connectedChildrenText = await page.locator(".billing-metrics .metric-card").nth(2).locator("strong").textContent();
  assert.equal(connectedChildrenText.trim(), "3명");
  assert.equal(await page.locator(".consolidated-checkout .payment-invoice-check").count(), 7);

  await page.locator("#payment-checkout-student-filter").selectOption(setup.studentIds[0]);
  assert.equal(await page.locator(".consolidated-checkout .payment-invoice-check").count(), 4, "4개 학원인 자녀로 필터링하면 4건만 남아야 한다");

  await page.locator("#payment-checkout-student-filter").selectOption(setup.studentIds[2]);
  assert.equal(await page.locator(".consolidated-checkout .payment-invoice-check").count(), 1, "1개 학원인 자녀로 필터링하면 1건만 남아야 한다");

  await page.locator("#payment-checkout-student-filter").selectOption("all");
  await page.locator("#payment-invoice-select-all").check();
  assert.equal(await page.locator(".consolidated-checkout .payment-invoice-check:checked").count(), 7);

  await page.locator("#payment-checkout-student-filter").selectOption(setup.studentIds[0]);
  await page.locator("#payment-invoice-select-all").check();
  await page.locator("#mock-card-outcome").selectOption("success");
  await page.locator('[data-payment-action="pay-card"]').click();
  const cardResult = await page.evaluate(() => {
    const batch = state.paymentBatches.at(-1);
    const payments = state.payments.filter((item) => item.batchId === batch.id);
    return { invoiceCount: batch.invoiceIds.length, paymentCount: payments.length, academyCount: new Set(payments.map((item) => item.academyId)).size };
  });
  assert.equal(cardResult.invoiceCount, 4, "4개 학원 자녀의 청구서 4건이 결제 대상이어야 한다");
  assert.equal(cardResult.paymentCount, 4, "학원이 4개로 다르므로 결제 건도 4건으로 분리돼야 한다");
  assert.equal(cardResult.academyCount, 4);

  await page.locator("#payment-checkout-student-filter").selectOption("all");
  const remaining = await page.evaluate(() => state.invoices.filter((item) => item.guardianUserId === currentUser().id && ["issued", "overdue", "failed"].includes(item.status)));
  assert.equal(remaining.length, 3, "남은 두 자녀(학원 2개·1개)의 청구서 3건이 남아 있어야 한다");
  const totalRemaining = remaining.reduce((sum, item) => sum + item.amount, 0);
  await page.evaluate((amount) => {
    window.MoaFlowPayments.allocateVirtualAccountDeposit(state, currentUser().id, amount, paymentContext());
    persistState(); renderShell(); renderView();
  }, totalRemaining);
  const finalCheck = await page.evaluate((ids) => {
    const invoices = ids.map((id) => state.invoices.find((item) => item.id === id));
    const account = state.guardianVirtualAccounts.find((item) => item.guardianUserId === currentUser().id);
    return { allPaid: invoices.every((item) => item.status === "paid"), creditBalance: account.creditBalance };
  }, remaining.map((item) => item.id));
  assert.equal(finalCheck.allPaid, true, "남은 두 자녀(학원 개수가 다름)의 청구서가 모두 자녀·학원 구분 없이 완납돼야 한다");
  assert.equal(finalCheck.creditBalance, 0, "입금액이 남은 청구액과 정확히 일치하면 예치금이 0이어야 한다(초과분 없음)");
  await context.close();
});

test("가상계좌 배분과 예치금은 다른 학부모의 데이터에 영향을 주지 않는다", async () => {
  const { context, page } = await openAs("qa-guardian-001", true);
  await navigate(page, "billing");
  await switchToManual(page);
  const setup = await page.evaluate(() => {
    const guardianId = currentUser().id;
    const otherInvoice = state.invoices.find((item) => item.guardianUserId !== guardianId && ["issued", "overdue", "failed"].includes(item.status));
    const myTotalOutstanding = state.invoices
      .filter((item) => item.guardianUserId === guardianId && ["issued", "overdue", "failed"].includes(item.status))
      .reduce((sum, item) => sum + (item.amount - (item.paidAmount || 0)), 0);
    return {
      otherGuardianId: otherInvoice?.guardianUserId,
      otherInvoiceId: otherInvoice?.id,
      otherPaidAmountBefore: otherInvoice?.paidAmount || 0,
      myTotalOutstanding
    };
  });
  assert.ok(setup.otherInvoiceId, "다른 학부모의 미납 청구서를 찾지 못함");
  await page.evaluate((amount) => {
    window.MoaFlowPayments.allocateVirtualAccountDeposit(state, currentUser().id, amount, paymentContext());
    persistState(); renderShell(); renderView();
  }, setup.myTotalOutstanding + 999999);
  const result = await page.evaluate(([otherGuardianId, otherInvoiceId]) => {
    const otherInvoice = state.invoices.find((item) => item.id === otherInvoiceId);
    const myAccount = state.guardianVirtualAccounts.find((item) => item.guardianUserId === currentUser().id);
    const otherAccount = state.guardianVirtualAccounts.find((item) => item.guardianUserId === otherGuardianId);
    return {
      otherInvoicePaidAmount: otherInvoice.paidAmount || 0,
      otherInvoiceStatus: otherInvoice.status,
      myCreditBalance: myAccount.creditBalance,
      otherCreditBalance: otherAccount ? otherAccount.creditBalance : 0
    };
  }, [setup.otherGuardianId, setup.otherInvoiceId]);
  assert.equal(result.otherInvoicePaidAmount, setup.otherPaidAmountBefore, "다른 학부모 청구서의 납부 진행 금액이 변하면 안 된다");
  assert.notEqual(result.otherInvoiceStatus, "paid");
  assert.ok(result.myCreditBalance > 0, "초과분은 내 계좌 예치금으로 쌓여야 한다");
  assert.equal(result.otherCreditBalance, 0, "다른 학부모의 예치금은 영향받으면 안 된다");
  await context.close();
});

test("학부모 결제 내역은 원생·학원·상태를 각각 선택해 조회한다", async () => {
  const { context, page } = await openAs("qa-guardian-001", true);
  await navigate(page, "billing");
  const target = await page.evaluate(() => state.invoices.find((item) => item.guardianUserId === currentUser().id));
  await page.locator("#guardian-history-student-filter").selectOption(target.studentId);
  await page.locator("#guardian-history-academy-filter").selectOption(target.academyId);
  await page.locator("#guardian-history-status-filter").selectOption(target.status);
  const result = await page.evaluate(() => ({
    student: state.guardianHistoryStudentFilter,
    academy: state.guardianHistoryAcademyFilter,
    status: state.guardianHistoryStatusFilter
  }));
  assert.deepEqual(result, { student: target.studentId, academy: target.academyId, status: target.status });
  assert.equal(await page.locator(".billing-history-panel th").nth(1).textContent(), "원생");
  assert.equal(await page.locator(".billing-history-panel th").nth(2).textContent(), "학원");
  await context.close();
});
