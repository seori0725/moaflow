(function () {
  "use strict";

  const PAYMENT_METHODS = { card: "신용카드", virtual_account: "가상계좌" };
  const STATUS_LABELS = {
    issued: "납부 전",
    paid: "납부 완료",
    overdue: "미납",
    failed: "결제 실패",
    void: "청구 취소"
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const pad = (value, length = 2) => String(value).padStart(length, "0");
  const money = (value) => `${Number(value || 0).toLocaleString("ko-KR")}원`;
  const escape = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
  const dateOnly = (value = new Date()) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(value);
  const monthKey = (date) => dateOnly(date).slice(0, 7);
  const addDays = (value, days) => {
    const date = new Date(`${value}T00:00:00+09:00`);
    date.setDate(date.getDate() + days);
    return dateOnly(date);
  };
  const monthDate = (month, day) => {
    const [year, monthNumber] = month.split("-").map(Number);
    const lastDay = new Date(year, monthNumber, 0).getDate();
    return `${month}-${pad(Math.min(Math.max(Number(day) || 1, 1), lastDay))}`;
  };
  const shiftMonth = (baseMonth, offset) => {
    const [year, month] = baseMonth.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1 + offset, 1));
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
  };
  const nowIso = () => new Date().toISOString();
  const uniqueId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  function defaultPolicy(academyId) {
    return {
      id: `bill-policy-${academyId}`,
      academyId,
      scheduleType: "fixed_monthly",
      billingTiming: "month_start",
      billingDay: 1,
      dueDays: 7,
      allowedMethods: ["card", "virtual_account"],
      autoNotify: true,
      reminderDays: [3, 0],
      overdueReminderDays: 3,
      active: true,
      updatedAt: nowIso()
    };
  }

  function seedDemo(state) {
    const billingPolicies = state.academies.map((academy, index) => ({
      ...defaultPolicy(academy.id),
      scheduleType: index % 2 ? "first_attendance" : "fixed_monthly",
      billingTiming: index % 3 === 0 ? "month_end" : "month_start"
    }));
    const tuitionPlans = [...new Set(state.enrollments.map((item) => `${item.academyId}::${item.className}`))].map((key, index) => {
      const [academyId, className] = key.split("::");
      return { id: `tuition-${index + 1}`, academyId, className, amount: 180000 + (index % 4) * 30000, active: true };
    });
    const invoices = [];
    const payments = [];
    const billingNotifications = [];
    const currentMonth = monthKey(new Date());
    state.guardianLinks.filter((item) => item.status === "verified").forEach((link, linkIndex) => {
      const enrollment = state.enrollments.find((item) => item.academyId === link.academyId && item.studentId === link.studentId && item.status === "active");
      if (!enrollment) return;
      for (let offset = -2; offset <= 0; offset += 1) {
        const billingMonth = shiftMonth(currentMonth, offset);
        const plan = tuitionPlans.find((item) => item.academyId === link.academyId && item.className === enrollment.className);
        const status = offset < 0 ? "paid" : linkIndex % 3 === 0 ? "overdue" : "issued";
        const invoice = {
          id: `invoice-${link.id}-${billingMonth}`,
          academyId: link.academyId,
          guardianUserId: link.guardianUserId,
          studentId: link.studentId,
          enrollmentId: enrollment.id,
          billingMonth,
          amount: plan?.amount || 200000,
          issuedAt: `${billingMonth}-01T09:00:00+09:00`,
          dueDate: monthDate(billingMonth, 8),
          status,
          paidAmount: status === "paid" ? (plan?.amount || 200000) : 0,
          paidAt: status === "paid" ? `${billingMonth}-05T11:20:00+09:00` : null,
          paymentMethod: status === "paid" ? (linkIndex % 2 ? "virtual_account" : "card") : null,
          updatedAt: nowIso()
        };
        invoices.push(invoice);
        if (status === "paid") {
          payments.push({
            id: `payment-${invoice.id}`,
            batchId: `batch-${invoice.id}`,
            invoiceIds: [invoice.id],
            academyId: invoice.academyId,
            guardianUserId: invoice.guardianUserId,
            method: invoice.paymentMethod,
            provider: invoice.paymentMethod === "card" ? "MOCK_CARD" : "KCP_VIRTUAL_ACCOUNT_MOCK",
            amount: invoice.amount,
            status: "paid",
            transactionId: `MOCK-${billingMonth.replace("-", "")}-${linkIndex + 1}`,
            paidAt: invoice.paidAt,
            createdAt: invoice.paidAt
          });
        }
      }
    });
    return { billingPolicies, tuitionPlans, invoices, paymentBatches: [], payments, billingNotifications, paymentEvents: [] };
  }

  function ensureState(state) {
    const defaults = seedDemo(state);
    const next = {
      ...state,
      billingPolicies: state.billingPolicies || defaults.billingPolicies,
      tuitionPlans: state.tuitionPlans || defaults.tuitionPlans,
      invoices: state.invoices || defaults.invoices,
      paymentBatches: state.paymentBatches || defaults.paymentBatches,
      payments: state.payments || defaults.payments,
      billingNotifications: state.billingNotifications || defaults.billingNotifications,
      paymentEvents: state.paymentEvents || defaults.paymentEvents,
      guardianPaymentSettings: state.guardianPaymentSettings || [],
      guardianVirtualAccounts: state.guardianVirtualAccounts || [],
      billingPeriodMode: state.billingPeriodMode || "monthly",
      billingSelectedMonth: state.billingSelectedMonth || monthKey(new Date()),
      billingSelectedYear: state.billingSelectedYear || dateOnly().slice(0, 4),
      selectedPaymentInvoiceIds: state.selectedPaymentInvoiceIds || [],
      selectedOverdueInvoiceIds: state.selectedOverdueInvoiceIds || [],
      billingOwnerStatusFilter: state.billingOwnerStatusFilter || "all",
      guardianHistoryStudentFilter: state.guardianHistoryStudentFilter || "all",
      guardianHistoryAcademyFilter: state.guardianHistoryAcademyFilter || "all",
      guardianHistoryStatusFilter: state.guardianHistoryStatusFilter || "all",
      paymentCheckoutStudentFilter: state.paymentCheckoutStudentFilter || "all",
      paymentCheckoutAcademyFilter: state.paymentCheckoutAcademyFilter || "all",
      mockCardOutcome: state.mockCardOutcome || "success"
    };
    if (state.qaMetadata && !state.billingQaSeeded) seedLargeQa(next);
    next.payments.filter((item) => item.method === "virtual_account" && item.status === "awaiting_deposit").forEach((payment) => {
      const account = ensureGuardianVirtualAccount(next, payment.guardianUserId);
      payment.provider = "KCP_FIXED_VIRTUAL_ACCOUNT";
      payment.virtualAccountId = account.id;
      delete payment.virtualAccount;
    });
    next.invoices.forEach((invoice) => {
      if (invoice.status === "awaiting_deposit") { invoice.status = invoice.dueDate < dateOnly() ? "overdue" : "issued"; invoice.paymentMethod = null; }
      if (invoice.paidAmount === undefined || invoice.paidAmount === null) invoice.paidAmount = invoice.status === "paid" ? invoice.amount : 0;
    });
    runAutomation(next, dateOnly());
    return next;
  }

  function ensureGuardianVirtualAccount(state, guardianUserId) {
    let account = state.guardianVirtualAccounts.find((item) => item.guardianUserId === guardianUserId && item.status === "active");
    if (account) { if (account.creditBalance === undefined) account.creditBalance = 0; return account; }
    const accountIndex = state.guardianVirtualAccounts.length + 1;
    account = { id: `guardian-vaccount-${guardianUserId}`, guardianUserId, provider: "KCP_FIXED_VIRTUAL_ACCOUNT", bankName: "국민은행", accountNumber: `999-01-${pad(accountIndex, 6)}`, depositorName: "모아플로", status: "active", creditBalance: 0, issuedAt: nowIso(), closedAt: null };
    state.guardianVirtualAccounts.push(account);
    return account;
  }

  function seedLargeQa(state) {
    state.billingPolicies = state.academies.map((academy, index) => ({
      ...defaultPolicy(academy.id),
      scheduleType: index % 3 === 0 ? "first_attendance" : "fixed_monthly",
      billingTiming: index % 2 ? "month_end" : "month_start",
      billingDay: index % 2 ? 25 : 1,
      dueDays: 7 + (index % 5)
    }));
    const classKeys = [...new Set(state.enrollments.filter((item) => item.status === "active").map((item) => `${item.academyId}::${item.className}`))];
    state.tuitionPlans = classKeys.map((key, index) => {
      const [academyId, className] = key.split("::");
      return { id: `qa-tuition-${index + 1}`, academyId, className, amount: 160000 + (index % 7) * 25000, active: true };
    });
    state.invoices = [];
    state.payments = [];
    state.paymentBatches = [];
    state.billingNotifications = [];
    state.paymentEvents = [];
    const currentMonth = monthKey(new Date());
    state.guardianLinks.filter((item) => item.status === "verified").forEach((link, linkIndex) => {
      const enrollment = state.enrollments.find((item) => item.academyId === link.academyId && item.studentId === link.studentId && item.status === "active");
      if (!enrollment) return;
      for (let offset = -2; offset <= 0; offset += 1) {
        const billingMonth = shiftMonth(currentMonth, offset);
        const plan = state.tuitionPlans.find((item) => item.academyId === link.academyId && item.className === enrollment.className);
        const status = offset < 0 ? (linkIndex % 11 === 0 ? "overdue" : "paid") : linkIndex % 7 === 0 ? "overdue" : "issued";
        const amount = plan?.amount || 200000;
        const invoice = {
          id: `qa-invoice-${linkIndex + 1}-${billingMonth}`,
          academyId: link.academyId,
          guardianUserId: link.guardianUserId,
          studentId: link.studentId,
          enrollmentId: enrollment.id,
          billingMonth,
          amount,
          issuedAt: `${billingMonth}-01T09:00:00+09:00`,
          dueDate: monthDate(billingMonth, 8 + (linkIndex % 8)),
          status,
          paidAmount: status === "paid" ? amount : status !== "paid" && linkIndex % 9 === 0 ? Math.round(amount * 0.4) : 0,
          paidAt: status === "paid" ? `${billingMonth}-05T11:20:00+09:00` : null,
          paymentMethod: status === "paid" ? (linkIndex % 2 ? "virtual_account" : "card") : null,
          updatedAt: nowIso()
        };
        state.invoices.push(invoice);
        if (status === "paid") createHistoricalPayment(state, invoice, linkIndex);
      }
    });
    state.billingQaSeeded = true;
  }

  function createHistoricalPayment(state, invoice, index) {
    state.payments.push({
      id: `qa-payment-${invoice.id}`,
      batchId: `qa-batch-${invoice.id}`,
      invoiceIds: [invoice.id],
      academyId: invoice.academyId,
      guardianUserId: invoice.guardianUserId,
      method: invoice.paymentMethod,
      provider: invoice.paymentMethod === "card" ? "MOCK_CARD" : "KCP_VIRTUAL_ACCOUNT_MOCK",
      amount: invoice.amount,
      status: "paid",
      transactionId: `QA-${invoice.billingMonth.replace("-", "")}-${index + 1}`,
      paidAt: invoice.paidAt,
      createdAt: invoice.paidAt
    });
  }

  function billingDateFor(state, policy, enrollment, billingMonth) {
    if (policy.scheduleType === "first_attendance") {
      const firstAttendance = state.attendanceRecords
        .filter((item) => item.academyId === enrollment.academyId && item.studentId === enrollment.studentId && item.lessonDate.startsWith(billingMonth))
        .sort((a, b) => a.lessonDate.localeCompare(b.lessonDate))[0];
      return firstAttendance?.lessonDate || monthDate(billingMonth, 1);
    }
    return policy.billingTiming === "month_end" ? monthDate(billingMonth, policy.billingDay || 25) : monthDate(billingMonth, policy.billingDay || 1);
  }

  function runAutomation(state, today) {
    const currentMonth = today.slice(0, 7);
    state.billingPolicies.filter((item) => item.active).forEach((policy) => {
      const academyEnrollments = state.enrollments.filter((item) => item.academyId === policy.academyId && item.status === "active");
      academyEnrollments.forEach((enrollment) => {
        const link = state.guardianLinks.find((item) => item.academyId === enrollment.academyId && item.studentId === enrollment.studentId && item.status === "verified");
        const plan = state.tuitionPlans.find((item) => item.academyId === enrollment.academyId && item.className === enrollment.className && item.active);
        if (!link || !plan) return;
        const issueDate = billingDateFor(state, policy, enrollment, currentMonth);
        if (issueDate > today) return;
        const invoiceId = `invoice-auto-${enrollment.id}-${currentMonth}`;
        if (!state.invoices.some((item) => item.id === invoiceId || (item.enrollmentId === enrollment.id && item.billingMonth === currentMonth))) {
          const invoice = {
            id: invoiceId,
            academyId: enrollment.academyId,
            guardianUserId: link.guardianUserId,
            studentId: enrollment.studentId,
            enrollmentId: enrollment.id,
            billingMonth: currentMonth,
            amount: plan.amount,
            issuedAt: `${issueDate}T09:00:00+09:00`,
            dueDate: addDays(issueDate, policy.dueDays),
            status: "issued",
            paidAmount: 0,
            paidAt: null,
            paymentMethod: null,
            updatedAt: nowIso()
          };
          state.invoices.push(invoice);
          addNotification(state, invoice, "invoice_issued", "수강료 청구서가 도착했습니다.", `${currentMonth} 수강료 ${money(invoice.amount)} · ${invoice.dueDate}까지`);
        }
      });
    });
    state.invoices.forEach((invoice) => {
      if (invoice.status === "issued" && invoice.dueDate < today) {
        invoice.status = "overdue";
        invoice.updatedAt = nowIso();
        addNotification(state, invoice, "invoice_overdue", "수강료가 미납 상태입니다.", `${invoice.billingMonth} 수강료 ${money(invoice.amount)}를 확인해 주세요.`);
      }
    });
    processAutomaticPayments(state, today);
  }

  function processAutomaticPayments(state, today) {
    state.guardianPaymentSettings.filter((item) => item.autoPay && (item.paymentMode === "automatic" || (!item.paymentMode && item.defaultMethod === "card")) && item.consentAt).forEach((setting) => {
      const consentedAt = new Date(setting.consentAt).getTime();
      const invoices = state.invoices.filter((item) => item.guardianUserId === setting.guardianUserId
        && ["issued", "overdue", "failed"].includes(item.status)
        && item.dueDate <= today
        && new Date(item.issuedAt).getTime() >= consentedAt);
      if (!invoices.length) return;
      const chargeAmount = (invoice) => invoice.amount - (invoice.paidAmount || 0);
      const batchId = uniqueId("auto-card-batch");
      state.paymentBatches.push({ id: batchId, guardianUserId: setting.guardianUserId, method: "card", invoiceIds: invoices.map((item) => item.id), amount: invoices.reduce((sum, item) => sum + chargeAmount(item), 0), status: "paid", automatic: true, createdAt: nowIso() });
      [...new Set(invoices.map((item) => item.academyId))].forEach((academyId, index) => {
        const academyInvoices = invoices.filter((item) => item.academyId === academyId);
        const paidAt = nowIso();
        state.payments.push({ id: uniqueId("auto-card-payment"), batchId, invoiceIds: academyInvoices.map((item) => item.id), academyId, guardianUserId: setting.guardianUserId, method: "card", provider: "MOCK_CARD", amount: academyInvoices.reduce((sum, item) => sum + chargeAmount(item), 0), status: "paid", transactionId: `AUTO-CARD-MOCK-${Date.now()}-${index + 1}`, automatic: true, paidAt, createdAt: paidAt });
        addPaymentEvent(state, "automatic_card_paid", state.payments.at(-1), "모의 카드 자동결제 승인");
        academyInvoices.forEach((invoice) => { invoice.paidAmount = invoice.amount; invoice.status = "paid"; invoice.paymentMethod = "card"; invoice.paidAt = paidAt; invoice.updatedAt = paidAt; addNotification(state, invoice, "automatic_payment_paid", "등록된 카드로 자동결제가 완료되었습니다.", `${invoice.billingMonth} 수강료 ${money(invoice.amount)}`); });
      });
    });
  }

  function addNotification(state, invoice, eventType, title, detail) {
    const id = `billing-${eventType}-${invoice.id}`;
    if (state.billingNotifications.some((item) => item.id === id)) return;
    state.billingNotifications.unshift({ id, guardianUserId: invoice.guardianUserId, studentId: invoice.studentId, academyId: invoice.academyId, invoiceId: invoice.id, type: "결제", tone: eventType.includes("overdue") || eventType.includes("failed") ? "red" : "green", title, detail, createdAt: nowIso() });
  }

  function addPaymentEvent(state, type, payment, detail) {
    state.paymentEvents.unshift({ id: uniqueId("payment-event"), type, paymentId: payment?.id || null, batchId: payment?.batchId || null, academyId: payment?.academyId || null, guardianUserId: payment?.guardianUserId || null, detail, createdAt: nowIso() });
  }

  function periodInvoices(state, invoices) {
    return invoices.filter((item) => state.billingPeriodMode === "yearly" ? item.billingMonth.startsWith(state.billingSelectedYear) : item.billingMonth === state.billingSelectedMonth);
  }

  function periodControls(state) {
    return `<div class="billing-period-controls">
      <div class="period-tabs"><button class="${state.billingPeriodMode === "monthly" ? "active" : ""}" data-payment-action="period-mode" data-mode="monthly">월별</button><button class="${state.billingPeriodMode === "yearly" ? "active" : ""}" data-payment-action="period-mode" data-mode="yearly">연별</button></div>
      ${state.billingPeriodMode === "monthly" ? `<select id="billing-month" aria-label="조회 월">${(() => { const currentTotal = Number(dateOnly().slice(0, 4)) * 12 + (Number(dateOnly().slice(5, 7)) - 1); return [...Array(24)].map((_, offset) => { const total = currentTotal - offset; const year = Math.floor(total / 12); const month = (total % 12) + 1; const value = `${year}-${String(month).padStart(2, "0")}`; return `<option value="${value}" ${value === state.billingSelectedMonth ? "selected" : ""}>${year}년 ${String(month).padStart(2, "0")}월</option>`; }).join(""); })()}</select>` : `<select id="billing-year" aria-label="조회 연도">${[0, 1, 2].map((offset) => { const year = Number(dateOnly().slice(0, 4)) - offset; return `<option value="${year}" ${String(year) === state.billingSelectedYear ? "selected" : ""}>${year}년</option>`; }).join("")}</select>`}
    </div>`;
  }

  function statusBadge(status) {
    const tone = status === "paid" ? "green" : status === "overdue" || status === "failed" ? "orange" : "gray";
    return `<span class="badge ${tone}">${STATUS_LABELS[status] || status}</span>`;
  }

  function invoiceAmountCell(invoice) {
    const paidAmount = invoice.paidAmount || 0;
    if (paidAmount > 0 && paidAmount < invoice.amount) {
      return `<span class="amount-with-balance"><strong>${money(invoice.amount - paidAmount)}</strong><small>잔액 · 총 ${money(invoice.amount)}</small></span>`;
    }
    return money(invoice.amount);
  }

  function renderMetric(label, value, hint = "", accent = false) {
    return `<article class="metric-card ${accent ? "accent" : ""}"><span>${escape(hint ? `${label} · ${hint}` : label)}</span><strong>${value}</strong></article>`;
  }

  function filterSelect(id, label, value, options) {
    return `<label class="billing-filter"><select id="${id}"><option value="all" ${value === "all" ? "selected" : ""}>${escape(label)} 전체</option>${options.map((option) => `<option value="${escape(option.value)}" ${value === option.value ? "selected" : ""}>${escape(option.label)}</option>`).join("")}</select></label>`;
  }

  function classNameForInvoice(state, invoice) {
    return state.enrollments.find((item) => item.id === invoice.enrollmentId)?.className
      || state.enrollments.find((item) => item.academyId === invoice.academyId && item.studentId === invoice.studentId)?.className
      || "미지정";
  }

  function render(state, role, context) {
    runAutomation(state, dateOnly());
    context.persistState();
    if (role === "academy_owner") return renderOwner(state, context);
    if (role === "guardian") return renderGuardian(state, context);
    if (role === "operator") return renderOperator(state, context);
    return `<article class="panel"><div class="empty-state">결제 관리 권한이 없습니다.</div></article>`;
  }

  function renderOwner(state, context) {
    context.setPage("결제", "학원비 관리");
    const academy = context.academy;
    const policy = state.billingPolicies.find((item) => item.academyId === academy.id) || defaultPolicy(academy.id);
    const allInvoices = state.invoices.filter((item) => item.academyId === academy.id);
    const periodItems = periodInvoices(state, allInvoices).sort((a, b) => b.billingMonth.localeCompare(a.billingMonth));
    const invoices = periodItems.filter((item) => state.billingOwnerStatusFilter === "all" || item.status === state.billingOwnerStatusFilter);
    const billed = periodItems.reduce((sum, item) => sum + item.amount, 0);
    const paid = periodItems.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amount, 0);
    const overdue = periodItems.filter((item) => item.status === "overdue").reduce((sum, item) => sum + item.amount, 0);
    return `<section class="grid four horizontal-metrics billing-metrics owner-billing-metrics">
      ${renderMetric("청구액", money(billed))}${renderMetric("납부액", money(paid))}${renderMetric("미납액", money(overdue), `${periodItems.filter((item) => item.status === "overdue").length}건`, true)}${renderMetric("납부율", billed ? `${Math.round(paid / billed * 100)}%` : "0%")}
    </section>
    <section class="grid two billing-owner-layout">
      <article class="panel billing-policy-panel"><div class="panel-head"><div><h2>자동 청구 설정</h2></div></div>
        <form id="billing-policy-form" class="form-grid">
          <label class="full"><span class="billing-field-title">결제 기준</span><select id="billing-schedule-type"><option value="fixed_monthly" ${policy.scheduleType === "fixed_monthly" ? "selected" : ""}>월초·월말 일괄 청구</option><option value="first_attendance" ${policy.scheduleType === "first_attendance" ? "selected" : ""}>학생의 첫 등교일 기준</option></select></label>
          <label><span class="billing-field-title">일괄 청구 시점</span><select id="billing-timing" ${policy.scheduleType === "first_attendance" ? "disabled" : ""}><option value="month_start" ${policy.billingTiming === "month_start" ? "selected" : ""}>월초</option><option value="month_end" ${policy.billingTiming === "month_end" ? "selected" : ""}>월말</option></select></label>
          <label><span class="billing-field-title">청구일</span><input id="billing-day" type="number" min="1" max="28" value="${policy.billingDay}" ${policy.scheduleType === "first_attendance" ? "disabled" : ""}></label>
          <label><span class="billing-field-title">납부기한 <small>청구 후 며칠 이내</small></span><input id="billing-due-days" type="number" min="1" max="30" value="${policy.dueDays}"></label>
          <label><span class="billing-field-title">미납 재알림 <small>미납 후 반복 간격</small></span><input id="billing-overdue-days" type="number" min="1" max="30" value="${policy.overdueReminderDays}"></label>
          <div class="full payment-method-summary"><strong>제공 결제수단</strong><span>신용카드</span><span>KCP 가상계좌</span></div>
          <div class="form-actions full"><button class="button primary" type="submit">설정 저장</button><button class="button secondary" type="button" data-payment-action="run-automation">자동 처리 실행</button></div>
        </form>
      </article>
    </section>
    <article class="panel billing-history-panel owner-billing-history"><div class="panel-head billing-history-head"><div><h2>청구·납부 내역</h2></div><div class="billing-history-actions"><button class="button secondary" data-payment-action="send-bulk-reminders" ${state.selectedOverdueInvoiceIds.length ? "" : "disabled"}>미납알림발송</button>${periodControls(state)}</div></div>${renderOwnerInvoiceTable(state, invoices, context)}</article>`;
  }

  function renderOwnerInvoiceTable(state, invoices, context) {
    const overdueInvoices = invoices.filter((item) => item.status === "overdue");
    const allOverdueSelected = overdueInvoices.length > 0 && overdueInvoices.every((item) => state.selectedOverdueInvoiceIds.includes(item.id));
    return `<div class="table-wrap record-scroll"><table class="data-table billing-table"><thead><tr><th>청구월</th><th>원생</th><th>반</th><th>청구액</th><th>납부기한</th><th>결제수단</th><th><select id="billing-owner-status-filter" class="billing-status-filter" aria-label="상태별 조회"><option value="all" ${state.billingOwnerStatusFilter === "all" ? "selected" : ""}>상태 필터</option>${Object.entries(STATUS_LABELS).map(([value, label]) => `<option value="${value}" ${state.billingOwnerStatusFilter === value ? "selected" : ""}>${label}</option>`).join("")}</select></th><th class="billing-process-column"><label class="table-check-label"><input id="billing-overdue-select-all" type="checkbox" ${allOverdueSelected ? "checked" : ""} ${overdueInvoices.length ? "" : "disabled"}>전체선택</label></th></tr></thead><tbody>${invoices.map((invoice) => {
      const payment = state.payments.find((item) => item.invoiceIds.includes(invoice.id));
      return `<tr><td>${invoice.billingMonth}</td><td><strong>${escape(context.studentById(invoice.studentId)?.name || "원생")}</strong></td><td>${escape(classNameForInvoice(state, invoice))}</td><td>${invoiceAmountCell(invoice)}</td><td>${invoice.dueDate}</td><td>${PAYMENT_METHODS[invoice.paymentMethod] || "-"}</td><td>${statusBadge(invoice.status)}</td><td class="billing-process-column">${invoice.status === "overdue" ? `<label class="table-check-label"><input class="billing-overdue-check" type="checkbox" value="${invoice.id}" ${state.selectedOverdueInvoiceIds.includes(invoice.id) ? "checked" : ""}><span>알림발송</span></label>` : payment?.transactionId ? `<small>${escape(payment.transactionId)}</small>` : "-"}</td></tr>`;
    }).join("") || `<tr><td colspan="8"><div class="empty-state">조회 기간의 청구 내역이 없습니다.</div></td></tr>`}</tbody></table></div>`;
  }

  function guardianInvoices(state, context) {
    return state.invoices.filter((item) => item.guardianUserId === context.user.id);
  }

  function renderGuardian(state, context) {
    context.setPage("결제", "학원비 결제");
    const allInvoices = guardianInvoices(state, context);
    const periodItems = periodInvoices(state, allInvoices).sort((a, b) => b.billingMonth.localeCompare(a.billingMonth));
    const invoices = periodItems.filter((item) => (state.guardianHistoryStudentFilter === "all" || item.studentId === state.guardianHistoryStudentFilter)
      && (state.guardianHistoryAcademyFilter === "all" || item.academyId === state.guardianHistoryAcademyFilter)
      && (state.guardianHistoryStatusFilter === "all" || item.status === state.guardianHistoryStatusFilter));
    const payable = allInvoices.filter((item) => ["issued", "overdue", "failed"].includes(item.status));
    const remainingOf = (invoice) => invoice.amount - (invoice.paidAmount || 0);
    const periodBilled = invoices.reduce((sum, item) => sum + item.amount, 0);
    const overdueInvoices = allInvoices.filter((item) => item.status === "overdue");
    const overdueRemaining = overdueInvoices.reduce((sum, item) => sum + remainingOf(item), 0);
    const paymentSetting = state.guardianPaymentSettings.find((item) => item.guardianUserId === context.user.id) || { paymentMode: "manual", autoPay: false, consentAt: null };
    const paymentMode = paymentSetting.paymentMode || (paymentSetting.autoPay ? "automatic" : "manual");
    const selected = payable.filter((item) => state.selectedPaymentInvoiceIds.includes(item.id));
    const selectedTotal = selected.reduce((sum, item) => sum + remainingOf(item), 0);
    const payableFiltered = payable.filter((item) => (state.paymentCheckoutStudentFilter === "all" || item.studentId === state.paymentCheckoutStudentFilter)
      && (state.paymentCheckoutAcademyFilter === "all" || item.academyId === state.paymentCheckoutAcademyFilter));
    const allPayableSelected = payableFiltered.length > 0 && payableFiltered.every((item) => state.selectedPaymentInvoiceIds.includes(item.id));
    const payableStudentOptions = [...new Set(payable.map((item) => item.studentId))].map((value) => ({ value, label: context.studentById(value)?.name || "원생" }));
    const payableAcademyOptions = [...new Set(payable.map((item) => item.academyId))].map((value) => ({ value, label: context.academyById(value)?.name || "학원" }));
    return `<section class="grid three horizontal-metrics billing-metrics">${renderMetric("조회 기간 청구", money(periodBilled), `${invoices.length}건`)}${renderMetric("미납", money(overdueRemaining), `${overdueInvoices.length}건`, true)}${renderMetric("연결 자녀", `${new Set(allInvoices.map((item) => item.studentId)).size}명`)}</section>
    <article class="panel guardian-payment-setting"><div class="panel-head"><div><h2>결제 설정</h2></div><div class="panel-head-actions"><span class="badge ${paymentMode === "automatic" ? "green" : "purple"}">${paymentMode === "automatic" ? "매월 자동결제" : "매월 직접결제"}</span></div></div><form id="guardian-payment-setting-form" class="guardian-payment-setting-form"><div class="payment-mode-control"><label><select id="guardian-payment-mode"><optgroup label="결제 방식"><option value="automatic" ${paymentMode === "automatic" ? "selected" : ""}>매월 자동결제</option><option value="manual" ${paymentMode === "manual" ? "selected" : ""}>매월 직접결제</option></optgroup></select></label></div><div id="guardian-payment-mode-detail" class="payment-mode-detail ${paymentMode === "automatic" ? "is-hidden" : "detail-wide"}"><strong>청구 건별 직접결제</strong><span>일부 청구서를 선택해 카드 또는 고정 가상계좌로 나누어 납부합니다.</span></div><label id="guardian-auto-pay-consent" class="auto-pay-consent ${paymentMode === "automatic" ? "consent-wide" : "is-hidden"}"><span class="consent-checkbox-row"><input id="guardian-auto-pay" type="checkbox" ${paymentSetting.autoPay ? "checked" : ""}><span>등록 카드의 매월 자동결제에 동의합니다.</span></span><small class="payment-sandbox-note">설정 저장만으로 결제되지 않습니다. 자동결제는 동의 후 새로 발행된 청구서부터 적용됩니다.</small></label><button id="guardian-card-registration" class="button secondary" type="button" data-payment-action="card-registration-placeholder">카드 등록</button><button class="button primary" type="submit">저장</button></form></article>
    ${paymentMode === "manual" && payable.length ? `<article class="panel consolidated-checkout"><div class="panel-head"><div><h2>직접 결제</h2></div><strong>${selected.length}건 · ${money(selectedTotal)}</strong></div>
      <div class="table-wrap record-scroll"><table class="data-table billing-table"><thead><tr><th>청구월</th><th><select id="payment-checkout-student-filter" class="billing-status-filter" aria-label="원생별 조회"><option value="all" ${state.paymentCheckoutStudentFilter === "all" ? "selected" : ""}>원생</option>${payableStudentOptions.map((option) => `<option value="${escape(option.value)}" ${state.paymentCheckoutStudentFilter === option.value ? "selected" : ""}>${escape(option.label)}</option>`).join("")}</select></th><th><select id="payment-checkout-academy-filter" class="billing-status-filter" aria-label="학원별 조회"><option value="all" ${state.paymentCheckoutAcademyFilter === "all" ? "selected" : ""}>학원</option>${payableAcademyOptions.map((option) => `<option value="${escape(option.value)}" ${state.paymentCheckoutAcademyFilter === option.value ? "selected" : ""}>${escape(option.label)}</option>`).join("")}</select></th><th>금액</th><th>납부기한</th><th>상태</th><th class="billing-process-column"><label class="table-check-label"><input id="payment-invoice-select-all" type="checkbox" ${allPayableSelected ? "checked" : ""} ${payableFiltered.length ? "" : "disabled"}>전체선택</label></th></tr></thead><tbody>${payableFiltered.map((invoice) => `<tr><td>${invoice.billingMonth}</td><td><strong>${escape(context.studentById(invoice.studentId)?.name || "원생")}</strong></td><td>${escape(context.academyById(invoice.academyId)?.name || "학원")}</td><td>${invoiceAmountCell(invoice)}</td><td>${invoice.dueDate}까지</td><td>${statusBadge(invoice.status)}</td><td class="billing-process-column"><label class="table-check-label"><input class="payment-invoice-check" type="checkbox" value="${invoice.id}" ${state.selectedPaymentInvoiceIds.includes(invoice.id) ? "checked" : ""}></label></td></tr>`).join("") || `<tr><td colspan="7"><div class="empty-state">조건에 맞는 청구 건이 없습니다.</div></td></tr>`}</tbody></table></div>
      <div class="mock-payment-toolbar"><label>카드 테스트 결과<select id="mock-card-outcome"><option value="success" ${state.mockCardOutcome === "success" ? "selected" : ""}>승인 성공</option><option value="declined" ${state.mockCardOutcome === "declined" ? "selected" : ""}>승인 거절</option></select></label><button class="button primary" data-payment-action="pay-card" ${selected.length ? "" : "disabled"}>선택 항목 카드결제</button></div>
      <p class="payment-sandbox-note">테스트 모드입니다. 실제 카드 승인은 발생하지 않습니다.</p></article>` : ""}
    ${paymentMode === "manual" ? renderVirtualAccounts(state, context) : ""}
    <article class="panel billing-history-panel"><div class="panel-head billing-history-head"><div><h2>결제 내역</h2></div><div class="billing-history-actions">${filterSelect("guardian-history-student-filter", "원생", state.guardianHistoryStudentFilter, [...new Set(allInvoices.map((item) => item.studentId))].map((value) => ({ value, label: context.studentById(value)?.name || "원생" })))}${filterSelect("guardian-history-academy-filter", "학원", state.guardianHistoryAcademyFilter, [...new Set(allInvoices.map((item) => item.academyId))].map((value) => ({ value, label: context.academyById(value)?.name || "학원" })))}${filterSelect("guardian-history-status-filter", "상태", state.guardianHistoryStatusFilter, Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })))}${periodControls(state)}</div></div>${renderGuardianHistory(state, invoices, context)}</article>`;
  }

  function renderVirtualAccounts(state, context) {
    const account = ensureGuardianVirtualAccount(state, context.user.id);
    const outstanding = state.invoices.filter((item) => item.guardianUserId === context.user.id && ["issued", "overdue", "failed"].includes(item.status));
    const remainingTotal = outstanding.reduce((sum, item) => sum + (item.amount - (item.paidAmount || 0)), 0);
    const depositedTotal = state.payments.filter((item) => item.guardianUserId === context.user.id && item.method === "virtual_account" && item.status === "paid").reduce((sum, item) => sum + item.amount, 0);
    const totalAmount = depositedTotal + remainingTotal;
    return `<article class="panel"><div class="panel-head"><div><h2>학부모 고정 가상계좌</h2></div><span class="badge green">사용 중</span></div><section class="fixed-virtual-account"><div><span>${escape(account.bankName)}</span><strong>${escape(account.accountNumber)}</strong><small>예금주 ${escape(account.depositorName)}</small></div><div class="fixed-account-stats"><div><span>총 입금예정액</span><strong>${money(totalAmount)}</strong></div><div><span>입금액</span><strong class="stat-positive">${money(depositedTotal)}</strong></div><div><span>미납액</span><strong class="stat-warning">${money(remainingTotal)}</strong></div></div></section>
      <p class="payment-sandbox-note">이 계좌로 입금하면 청구서에 순차적으로 자동 납부 처리됩니다.</p>
    </article>`;
  }

  function renderGuardianHistory(state, invoices, context) {
    return `<div class="table-wrap record-scroll"><table class="data-table billing-table"><thead><tr><th>청구월</th><th>원생</th><th>학원</th><th>금액</th><th>결제수단</th><th>상태</th><th>결제일</th><th>승인·거래번호</th></tr></thead><tbody>${invoices.map((invoice) => { const payment = state.payments.find((item) => item.invoiceIds.includes(invoice.id)); return `<tr><td>${invoice.billingMonth}</td><td><strong>${escape(context.studentById(invoice.studentId)?.name || "원생")}</strong></td><td>${escape(context.academyById(invoice.academyId)?.name || "학원")}</td><td>${invoiceAmountCell(invoice)}</td><td>${PAYMENT_METHODS[invoice.paymentMethod] || "-"}</td><td>${statusBadge(invoice.status)}</td><td>${invoice.paidAt?.slice(0, 10) || "-"}</td><td><small>${escape(payment?.transactionId || "-")}</small></td></tr>`; }).join("") || `<tr><td colspan="8"><div class="empty-state">조회 기간의 결제 내역이 없습니다.</div></td></tr>`}</tbody></table></div>`;
  }

  function renderOperator(state, context) {
    context.setPage("운영", "결제 운영 현황");
    const invoices = periodInvoices(state, state.invoices);
    const billed = invoices.reduce((sum, item) => sum + item.amount, 0);
    const paid = invoices.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amount, 0);
    const overdue = invoices.filter((item) => item.status === "overdue").reduce((sum, item) => sum + item.amount, 0);
    const rows = state.academies.map((academy) => { const items = invoices.filter((item) => item.academyId === academy.id); return { academy, billed: items.reduce((sum, item) => sum + item.amount, 0), paid: items.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amount, 0), overdue: items.filter((item) => item.status === "overdue").reduce((sum, item) => sum + item.amount, 0), overdueCount: items.filter((item) => item.status === "overdue").length }; });
    return `<section class="grid four horizontal-metrics billing-metrics">${renderMetric("전체 청구", money(billed))}${renderMetric("납부 완료", money(paid))}${renderMetric("미납", money(overdue), `${invoices.filter((item) => item.status === "overdue").length}건`, true)}${renderMetric("납부율", billed ? `${Math.round(paid / billed * 100)}%` : "0%")}</section><article class="panel"><div class="panel-head"><div><h2>학원별 결제 현황</h2></div>${periodControls(state)}</div><div class="table-wrap record-scroll"><table class="data-table billing-table"><thead><tr><th>학원</th><th>청구액</th><th>납부액</th><th>미납액</th><th>미납 건수</th><th>자동 청구 기준</th></tr></thead><tbody>${rows.map((row) => { const policy = state.billingPolicies.find((item) => item.academyId === row.academy.id); return `<tr><td><strong>${escape(row.academy.name)}</strong></td><td>${money(row.billed)}</td><td>${money(row.paid)}</td><td>${money(row.overdue)}</td><td>${row.overdueCount}건</td><td>${policy?.scheduleType === "first_attendance" ? "첫 등교일" : policy?.billingTiming === "month_end" ? "월말 일괄" : "월초 일괄"}</td></tr>`; }).join("")}</tbody></table></div></article>`;
  }

  function groupedSelectedInvoices(state, context) {
    const selected = state.invoices.filter((item) => item.guardianUserId === context.user.id
      && ["issued", "overdue", "failed"].includes(item.status)
      && state.selectedPaymentInvoiceIds.includes(item.id));
    return [...new Set(selected.map((item) => item.academyId))].map((academyId) => ({ academyId, invoices: selected.filter((item) => item.academyId === academyId) }));
  }

  function sendOverdueReminders(state, invoiceIds, context) {
    const invoices = state.invoices.filter((item) => invoiceIds.includes(item.id) && item.academyId === context.academy.id && item.status === "overdue");
    invoices.forEach((invoice) => {
      state.billingNotifications.unshift({ id: uniqueId("billing-reminder"), guardianUserId: invoice.guardianUserId, studentId: invoice.studentId, academyId: invoice.academyId, invoiceId: invoice.id, type: "결제", tone: "red", title: "수강료 미납 안내입니다.", detail: `${invoice.billingMonth} 수강료 ${money(invoice.amount)}`, createdAt: nowIso() });
    });
    state.selectedOverdueInvoiceIds = [];
    context.persistState();
    context.renderView();
    context.toast(`${invoices.length}건의 미납 알림을 발송했습니다.`);
  }

  function payCard(state, context) {
    const groups = groupedSelectedInvoices(state, context);
    if (!groups.length) return context.toast("결제할 청구서를 선택해 주세요.", "error");
    const batchId = uniqueId("card-batch");
    const declined = state.mockCardOutcome === "declined";
    const chargeAmount = (invoice) => invoice.amount - (invoice.paidAmount || 0);
    state.paymentBatches.push({ id: batchId, guardianUserId: context.user.id, method: "card", invoiceIds: groups.flatMap((group) => group.invoices.map((item) => item.id)), amount: groups.flatMap((group) => group.invoices).reduce((sum, item) => sum + chargeAmount(item), 0), status: declined ? "failed" : "paid", createdAt: nowIso() });
    groups.forEach((group) => {
      const payment = { id: uniqueId("card-payment"), batchId, invoiceIds: group.invoices.map((item) => item.id), academyId: group.academyId, guardianUserId: context.user.id, method: "card", provider: "MOCK_CARD", amount: group.invoices.reduce((sum, item) => sum + chargeAmount(item), 0), status: declined ? "failed" : "paid", transactionId: declined ? `DECLINED-${Date.now()}` : `CARD-MOCK-${Date.now()}-${group.academyId}`, failureCode: declined ? "CARD_DECLINED" : null, paidAt: declined ? null : nowIso(), createdAt: nowIso() };
      state.payments.push(payment);
      addPaymentEvent(state, declined ? "card_failed" : "card_paid", payment, declined ? "모의 카드 승인 거절" : "모의 카드 승인 완료");
      group.invoices.forEach((invoice) => {
        if (!declined) invoice.paidAmount = invoice.amount;
        invoice.status = declined ? "failed" : "paid";
        invoice.paymentMethod = "card";
        invoice.paidAt = payment.paidAt;
        invoice.updatedAt = nowIso();
        addNotification(state, invoice, declined ? "payment_failed" : "payment_paid", declined ? "카드 결제가 승인되지 않았습니다." : "수강료 결제가 완료되었습니다.", `${context.academyById(invoice.academyId)?.name || "학원"} · ${money(invoice.amount)}`);
      });
    });
    state.selectedPaymentInvoiceIds = [];
    context.persistState(); context.renderShell(); context.renderView(); context.toast(declined ? "카드 승인 거절을 테스트했습니다." : "학원별로 분리해 카드 결제를 완료했습니다.", declined ? "error" : "default");
  }

  function allocateVirtualAccountDeposit(state, guardianUserId, amount, context) {
    const account = ensureGuardianVirtualAccount(state, guardianUserId);
    let available = amount + (account.creditBalance || 0);
    account.creditBalance = 0;
    const outstanding = state.invoices
      .filter((item) => item.guardianUserId === guardianUserId && ["issued", "overdue", "failed"].includes(item.status))
      .sort((a, b) => (a.issuedAt || "").localeCompare(b.issuedAt || "") || a.billingMonth.localeCompare(b.billingMonth));
    const touchedInvoiceIds = [];
    const paidAt = nowIso();
    outstanding.forEach((invoice) => {
      if (available <= 0) return;
      const already = invoice.paidAmount || 0;
      const remaining = invoice.amount - already;
      if (remaining <= 0) return;
      const apply = Math.min(available, remaining);
      invoice.paidAmount = already + apply;
      available -= apply;
      invoice.updatedAt = paidAt;
      invoice.paymentMethod = "virtual_account";
      touchedInvoiceIds.push(invoice.id);
      if (invoice.paidAmount >= invoice.amount) {
        invoice.status = "paid";
        invoice.paidAt = paidAt;
        addNotification(state, invoice, "virtual_account_deposited", "가상계좌 입금으로 완납되었습니다.", `${context.academyById(invoice.academyId)?.name || "학원"} · ${money(invoice.amount)}`);
      } else {
        addNotification(state, invoice, `virtual_account_partial_${invoice.paidAmount}`, "가상계좌 입금이 일부 반영됐습니다.", `${context.academyById(invoice.academyId)?.name || "학원"} · ${money(invoice.paidAmount)} / ${money(invoice.amount)}`);
      }
    });
    if (available > 0) account.creditBalance = (account.creditBalance || 0) + available;
    const payment = { id: uniqueId("kcp-vaccount-payment"), invoiceIds: touchedInvoiceIds, academyId: null, guardianUserId, method: "virtual_account", provider: "KCP_FIXED_VIRTUAL_ACCOUNT", amount, status: "paid", transactionId: `KCP-FIXED-${Date.now()}`, virtualAccountId: account.id, paidAt, createdAt: paidAt };
    state.payments.push(payment);
    addPaymentEvent(state, "virtual_account_deposited", payment, "KCP 고정 가상계좌 입금 반영 (청구일 순 자동배분)");
    return payment;
  }

  function handleAction(actionName, action, context) {
    const state = context.state;
    if (actionName === "period-mode") { state.billingPeriodMode = action.dataset.mode; state.selectedOverdueInvoiceIds = []; context.persistState(); context.renderView(); return true; }
    if (actionName === "run-automation") { runAutomation(state, dateOnly()); context.persistState(); context.renderView(); context.toast("자동 청구·알림·미납 처리를 실행했습니다."); return true; }
    if (actionName === "send-bulk-reminders") { sendOverdueReminders(state, state.selectedOverdueInvoiceIds, context); return true; }
    if (actionName === "card-registration-placeholder") { context.toast("카드 등록 페이지는 추후 제공됩니다."); return true; }
    if (actionName === "pay-card") { payCard(state, context); return true; }
    return false;
  }

  function handleSubmit(form, context) {
    const state = context.state;
    if (form.id === "billing-policy-form") {
      const policy = state.billingPolicies.find((item) => item.academyId === context.academy.id) || defaultPolicy(context.academy.id);
      policy.scheduleType = form.querySelector("#billing-schedule-type").value;
      policy.billingTiming = form.querySelector("#billing-timing").value;
      policy.billingDay = Number(form.querySelector("#billing-day").value || 1);
      policy.dueDays = Number(form.querySelector("#billing-due-days").value || 7);
      policy.overdueReminderDays = Number(form.querySelector("#billing-overdue-days").value || 3);
      policy.updatedAt = nowIso();
      if (!state.billingPolicies.some((item) => item.id === policy.id)) state.billingPolicies.push(policy);
      context.addAudit("billing.policy_updated", "billing_policy", policy.id, "자동 청구 설정 변경", context.academy.id);
      context.persistState(); context.renderView(); context.toast("자동 청구 설정을 저장했습니다."); return true;
    }
    if (form.id === "guardian-payment-setting-form") {
      let setting = state.guardianPaymentSettings.find((item) => item.guardianUserId === context.user.id);
      if (!setting) { setting = { id: uniqueId("guardian-payment-setting"), guardianUserId: context.user.id }; state.guardianPaymentSettings.push(setting); }
      const paymentMode = form.querySelector("#guardian-payment-mode").value;
      const requestedAutoPay = form.querySelector("#guardian-auto-pay").checked;
      if (paymentMode === "automatic" && !requestedAutoPay) { context.toast("자동결제 동의 후 설정을 저장해 주세요.", "error"); return true; }
      const wasAutoPayEnabled = Boolean(setting.autoPay && setting.consentAt);
      setting.paymentMode = paymentMode;
      setting.defaultMethod = paymentMode === "automatic" ? "card" : null;
      setting.autoPay = paymentMode === "automatic" && requestedAutoPay;
      setting.splitPayment = paymentMode === "manual";
      setting.consentAt = setting.autoPay ? (wasAutoPayEnabled ? setting.consentAt : nowIso()) : null;
      setting.updatedAt = nowIso();
      state.selectedPaymentInvoiceIds = [];
      context.persistState(); context.renderView(); context.toast("결제 설정을 저장했습니다. 결제는 실행되지 않았습니다."); return true;
    }
    return false;
  }

  function handleChange(target, context) {
    const state = context.state;
    if (target.classList.contains("payment-invoice-check")) { state.selectedPaymentInvoiceIds = [...document.querySelectorAll(".payment-invoice-check:checked")].map((item) => item.value); context.persistState(); context.renderView(); return true; }
    if (target.classList.contains("billing-overdue-check")) { state.selectedOverdueInvoiceIds = [...document.querySelectorAll(".billing-overdue-check:checked")].map((item) => item.value); context.persistState(); context.renderView(); return true; }
    if (target.id === "billing-overdue-select-all") { state.selectedOverdueInvoiceIds = target.checked ? [...document.querySelectorAll(".billing-overdue-check")].map((item) => item.value) : []; context.persistState(); context.renderView(); return true; }
    if (target.id === "payment-invoice-select-all") { state.selectedPaymentInvoiceIds = target.checked ? [...document.querySelectorAll(".payment-invoice-check")].map((item) => item.value) : []; context.persistState(); context.renderView(); return true; }
    if (target.id === "payment-checkout-student-filter") { state.paymentCheckoutStudentFilter = target.value; state.selectedPaymentInvoiceIds = []; context.persistState(); context.renderView(); return true; }
    if (target.id === "payment-checkout-academy-filter") { state.paymentCheckoutAcademyFilter = target.value; state.selectedPaymentInvoiceIds = []; context.persistState(); context.renderView(); return true; }
    if (target.id === "mock-card-outcome") { state.mockCardOutcome = target.value; context.persistState(); return true; }
    if (target.id === "billing-month") { state.billingSelectedMonth = target.value; state.selectedOverdueInvoiceIds = []; context.persistState(); context.renderView(); return true; }
    if (target.id === "billing-year") { state.billingSelectedYear = target.value; state.selectedOverdueInvoiceIds = []; context.persistState(); context.renderView(); return true; }
    if (target.id === "billing-owner-status-filter") { state.billingOwnerStatusFilter = target.value; state.selectedOverdueInvoiceIds = []; context.persistState(); context.renderView(); return true; }
    if (target.id === "guardian-history-student-filter") { state.guardianHistoryStudentFilter = target.value; context.persistState(); context.renderView(); return true; }
    if (target.id === "guardian-history-academy-filter") { state.guardianHistoryAcademyFilter = target.value; context.persistState(); context.renderView(); return true; }
    if (target.id === "guardian-history-status-filter") { state.guardianHistoryStatusFilter = target.value; context.persistState(); context.renderView(); return true; }
    if (target.id === "guardian-payment-mode") {
      const automatic = target.value === "automatic";
      const consent = document.querySelector("#guardian-auto-pay-consent");
      const autoPay = document.querySelector("#guardian-auto-pay");
      const detail = document.querySelector("#guardian-payment-mode-detail");
      consent?.classList.toggle("is-hidden", !automatic);
      consent?.classList.toggle("consent-wide", automatic);
      detail?.classList.toggle("is-hidden", automatic);
      detail?.classList.toggle("detail-wide", !automatic);
      if (!automatic && autoPay) autoPay.checked = false;
      return true;
    }
    if (target.id === "billing-schedule-type") { const timing = document.querySelector("#billing-timing"); const day = document.querySelector("#billing-day"); const disabled = target.value === "first_attendance"; if (timing) timing.disabled = disabled; if (day) day.disabled = disabled; return true; }
    return false;
  }

  function notificationEvents(state, guardianUserId, linkedPairs) {
    return state.billingNotifications.filter((item) => item.guardianUserId === guardianUserId && linkedPairs.has(`${item.studentId}:${item.academyId}`));
  }

  window.MoaFlowPayments = { ensureState, render, handleAction, handleSubmit, handleChange, notificationEvents, runAutomation, allocateVirtualAccountDeposit };
})();
