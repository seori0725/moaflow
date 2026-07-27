const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8"
};

let server;
let browser;
let baseUrl;

test.before(async () => {
  server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
    const filePath = path.resolve(root, relativePath);
    if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    response.writeHead(200, {
      "content-type": mimeTypes[path.extname(filePath)] || "application/octet-stream",
      "cache-control": "no-store"
    });
    fs.createReadStream(filePath).pipe(response);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const launchOptions = process.platform === "win32" && fs.existsSync(chromePath) ? { executablePath: chromePath } : {};
  browser = await chromium.launch({ headless: true, ...launchOptions });
});

test.after(async () => {
  await browser?.close();
  await new Promise((resolve) => server?.close(resolve));
});

async function openAs(userId, viewport = { width: 1280, height: 900 }) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript((id) => {
    sessionStorage.setItem(
      "moaflow-foundation-session",
      JSON.stringify({ userId: id, verifiedAt: new Date().toISOString() })
    );
  }, userId);
  const page = await context.newPage();
  await page.route("**/*", (route) =>
    route.request().url().startsWith(baseUrl) ? route.continue() : route.abort()
  );
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  return { context, page };
}

test("원생 상세에서 반을 변경하고 과거 기록과 이력을 유지한다", async () => {
  const { context, page } = await openAs("usr-owner");
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.locator('[data-view="students"]').click();
  assert.equal(
    await page.locator(".panel-head").filter({ hasText: "전체 원생" }).locator("p").count(),
    0
  );
  await page.locator('[data-action="open-student-detail"]').first().click();
  assert.equal(await page.locator("#page-title").textContent(), "원생 관리");
  assert.equal(await page.locator(".topbar").evaluate((element) => getComputedStyle(element).justifyContent), "flex-end");
  assert.equal(await page.locator(".student-hero").count(), 0);
  assert.equal(await page.locator(".student-detail-heading h2").textContent(), "정민준");
  assert.ok(
    await page.evaluate(() => {
      const heading = document.querySelector(".student-detail-heading").getBoundingClientRect();
      const metrics = document.querySelector(".horizontal-metrics").getBoundingClientRect();
      return metrics.top - heading.bottom >= 28;
    })
  );
  assert.equal(
    await page.locator(".panel-head").filter({ hasText: "원생 기본정보" }).locator("p").count(),
    0
  );
  assert.equal(
    await page.locator(".student-detail-heading > .badge").evaluate((element) => getComputedStyle(element).fontSize),
    "12px"
  );
  assert.equal(await page.locator(".horizontal-metrics .metric-card small").count(), 0);
  assert.equal(await page.locator(".horizontal-metrics .metric-card.textual").count(), 4);
  assert.deepEqual(
    await page.locator(".horizontal-metrics .metric-card").evaluateAll((cards) =>
      cards.slice(0, 2).map((card) => getComputedStyle(card.querySelector("strong")).fontSize)
    ),
    ["15px", "15px"]
  );
  assert.equal(
    await page.locator(".horizontal-metrics .metric-card").last().locator("strong").evaluate(
      (element) => getComputedStyle(element).fontSize
    ),
    "15px"
  );
  const classMetric = await page.locator(".horizontal-metrics .metric-card.textual").nth(2).evaluate((card) => {
    const label = card.querySelector("span").getBoundingClientRect();
    const value = card.querySelector("strong").getBoundingClientRect();
    return {
      labelWidth: label.width,
      sameRow: Math.abs(label.y - value.y) < 8,
      overflow: card.scrollWidth > card.clientWidth
    };
  });
  assert.ok(classMetric.labelWidth > 28);
  assert.equal(classMetric.sameRow, true);
  assert.equal(classMetric.overflow, false);
  await page.locator("#student-class-change").selectOption("중등 수학 기본반");
  await page.locator('[data-action="change-student-class"]').click();
  assert.equal(
    await page.locator("#student-class-change").evaluate((element) => getComputedStyle(element).fontSize),
    "13px"
  );
  assert.equal(await page.getByText("최근 반 변경일", { exact: true }).count(), 1);
  assert.equal(await page.getByText("반 변경 이력", { exact: true }).count(), 1);

  await page.locator("#student-class-change").selectOption("중등 수학 심화반");
  await page.locator('[data-action="change-student-class"]').click();

  const result = await page.evaluate(() => ({
    currentClass: state.enrollments.find(
      (item) => item.academyId === "acd-dodam" && item.studentId === "std-minjun"
    ).className,
    classHistory: state.enrollments.find(
      (item) => item.academyId === "acd-dodam" && item.studentId === "std-minjun"
    ).classHistory,
    historicalClass: state.attendanceRecords.find((item) => item.id === "att-1").className,
    audits: state.auditLogs.filter(
      (item) => item.action === "enrollment.class_changed" && item.targetId === "std-minjun"
    )
  }));
  assert.equal(result.currentClass, "중등 수학 심화반");
  assert.equal(result.historicalClass, "중등 수학 심화반");
  assert.equal(result.classHistory.length, 2);
  assert.deepEqual(
    result.classHistory.map(({ previousClassName, nextClassName }) => ({
      previousClassName,
      nextClassName
    })),
    [
      { previousClassName: "중등 수학 기본반", nextClassName: "중등 수학 심화반" },
      { previousClassName: "중등 수학 심화반", nextClassName: "중등 수학 기본반" }
    ]
  );
  assert.equal(result.classHistory.every((item) => item.changedAt && item.changedBy), true);
  assert.equal(result.audits.length, 2);
  assert.equal(await page.locator(".class-history-item").count(), 2);
  assert.deepEqual(errors, []);
  await context.close();
});

test("강사는 담당 반의 출결과 원생만 조회한다", async () => {
  const { context, page } = await openAs("usr-teacher");
  await page.locator('[data-view="attendance"]').click();
  assert.deepEqual(await page.locator("#attendance-class option").allTextContents(), ["중등 수학 심화반"]);

  await page.locator('[data-view="students"]').click();
  const rows = await page.locator(".student-table tbody tr").evaluateAll((items) =>
    items.map((row) => row.children[3]?.textContent.trim())
  );
  assert.deepEqual(rows, ["중등 수학 심화반", "중등 수학 심화반"]);
  await context.close();
});

test("운영자 오늘 입력률은 여러 날짜 기록이 있어도 100%를 넘지 않는다", async () => {
  const { context, page } = await openAs("usr-operator");
  await page.evaluate(() => {
    state.attendanceRecords.push({
      ...state.attendanceRecords[0],
      id: "test-att-next-day",
      lessonDate: "2099-01-01"
    });
    state.learningRecords.push({
      ...state.learningRecords[0],
      id: "test-lrn-next-day",
      lessonDate: "2099-01-01"
    });
    renderView();
  });
  const values = await page.locator(".horizontal-metrics .metric-card strong").allTextContents();
  assert.ok(Number.parseInt(values[1], 10) <= 100);
  assert.ok(Number.parseInt(values[2], 10) <= 100);
  await context.close();
});

test("학습기록의 과제·특이사항을 저장하고 이전 기록과 학부모 홈에 반영한다", async () => {
  const { context, page } = await openAs("usr-teacher");
  await page.locator('[data-view="learning"]').click();
  await page.locator("#learning-homework").fill("유형 3번 1~10번");
  await page.locator("#learning-special-notes").fill("다음 시간에 자와 색연필 준비");
  await page.locator("#learning-form").evaluate((form) => form.requestSubmit());

  const saved = await page.evaluate(() =>
    state.learningRecords.find(
      (item) =>
        item.academyId === "acd-dodam" &&
        item.className === "중등 수학 심화반" &&
        item.lessonDate === koreaDate()
    )
  );
  assert.equal(saved.homework, "유형 3번 1~10번");
  assert.equal(saved.specialNotes, "다음 시간에 자와 색연필 준비");

  await page.evaluate(() => {
    const date = new Date(`${koreaDate()}T00:00:00+09:00`);
    date.setDate(date.getDate() + 1);
    const input = document.querySelector("#learning-date");
    input.value = koreaDate(date);
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.locator('[data-action="load-previous-learning"]').click();
  assert.equal(await page.locator("#learning-homework").inputValue(), "유형 3번 1~10번");
  assert.equal(
    await page.locator("#learning-special-notes").inputValue(),
    "다음 시간에 자와 색연필 준비"
  );

  await page.evaluate(() => {
    sessionStorage.setItem(
      "moaflow-foundation-session",
      JSON.stringify({ userId: "usr-guardian", verifiedAt: new Date().toISOString() })
    );
    session = loadSession();
    state.activeView = "home";
    render();
  });
  const guardianHome = await page.locator("#view-root").innerText();
  assert.match(guardianHome, /과제 유형 3번 1~10번/);
  assert.match(guardianHome, /특이사항 다음 시간에 자와 색연필 준비/);
  await context.close();
});

test("CSV는 잘못된 날짜와 중복 행을 분리해 보고한다", async () => {
  const { context, page } = await openAs("usr-owner");
  await page.locator('[data-action="open-csv-modal"]').first().click();
  await page.locator("#csv-content").fill(
    [
      "학생명,생년월일,반,첫등원일",
      "잘못된날짜,2013-99-99,테스트반,2026-07-27",
      "정민준,2012-05-18,중등 수학 심화반,2026-03-04"
    ].join("\n")
  );
  await page.locator("#csv-import-form").evaluate((form) => form.requestSubmit());

  const result = await page.evaluate(() => ({
    invalidStudentCreated: state.students.some((item) => item.name === "잘못된날짜"),
    imported: state.csvImports[0]
  }));
  assert.equal(result.invalidStudentCreated, false);
  assert.equal(result.imported.importedRows, 0);
  assert.equal(result.imported.skippedRows, 1);
  assert.equal(result.imported.errorRows, 1);
  assert.match(await page.locator("#modal").innerText(), /3행|2행/);
  assert.match(await page.locator("#modal").innerText(), /실제 날짜가 아닙니다/);
  await context.close();
});

test("만료 초대는 현재 학원 기준으로 새 코드가 재발급된다", async () => {
  const { context, page } = await openAs("usr-owner");
  await page.locator('[data-view="students"]').click();
  await page.evaluate(() => {
    const invite = state.invitations.find(
      (item) => item.studentId === "std-minjun" && item.academyId === "acd-dodam"
    );
    invite.expiresAt = "2020-01-01T00:00:00Z";
    renderView();
  });
  await page
    .locator('[data-action="invite-guardian"][data-student-id="std-minjun"]')
    .click();

  const result = await page.evaluate(() => ({
    current: state.invitations.find(
      (item) =>
        item.studentId === "std-minjun" &&
        item.academyId === "acd-dodam" &&
        item.status === "sent"
    )?.code,
    bridge: state.invitations.find(
      (item) => item.studentId === "std-minjun" && item.academyId === "acd-bridge"
    )?.code
  }));
  assert.match(result.current, /^MF-\d{4}$/);
  assert.notEqual(result.current, "MF-4821");
  assert.equal(result.bridge, "MF-5932");
  assert.match(await page.locator("#modal").innerText(), new RegExp(result.current));
  await context.close();
});

test("학부모는 같은 자녀의 새 학원을 추가 연결한다", async () => {
  const { context, page } = await openAs("usr-guardian");
  async function connect(code) {
    await page.locator('[data-action="open-guardian-connect-modal"]').click();
    await page.locator("#invite-code").fill(code);
    await page.locator("#child-birth").fill("2012-05-18");
    await page.locator("#guardian-consent").check();
    await page.locator("#connect-form").evaluate((form) => form.requestSubmit());
  }
  await connect("MF-4821");
  await connect("MF-5932");
  const minjun = page.locator(".child-timeline-card").filter({ hasText: "정민준" });
  assert.match(await minjun.innerText(), /연결 학원 2곳/);
  assert.equal(await page.locator(".child-timeline-card").count(), 2);
  await context.close();
});

test("기존 저장 데이터는 schema v10 구조로 안전하게 변환된다", async () => {
  const { context, page } = await openAs("usr-owner");
  await page.evaluate(() => {
    persistState();
    const saved = JSON.parse(localStorage.getItem("moaflow-foundation-v1"));
    saved.schemaVersion = 9;
    saved.students.forEach((student) => {
      student.status = "active";
    });
    saved.staffClassAssignments = [
      {
        id: "sca-teacher-math-basic",
        academyId: "acd-dodam",
        userId: "usr-teacher",
        className: "중등 수학 기본반"
      }
    ];
    saved.learningRecords.forEach((record) => {
      delete record.homework;
      delete record.specialNotes;
    });
    saved.enrollments.forEach((enrollment) => {
      delete enrollment.classHistory;
    });
    localStorage.setItem("moaflow-foundation-v1", JSON.stringify(saved));
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  const result = await page.evaluate(() => ({
    schemaVersion: state.schemaVersion,
    studentHasStatus: state.students.some((student) =>
      Object.prototype.hasOwnProperty.call(student, "status")
    ),
    assignment: state.staffClassAssignments[0],
    learning: state.learningRecords[0],
    enrollments: state.enrollments
  }));
  assert.equal(result.schemaVersion, 10);
  assert.equal(result.studentHasStatus, false);
  assert.equal(result.assignment.id, "sca-teacher-math-advanced");
  assert.equal(result.assignment.className, "중등 수학 심화반");
  assert.equal(result.learning.homework, "");
  assert.equal(result.learning.specialNotes, "");
  assert.equal(result.enrollments.every((enrollment) => Array.isArray(enrollment.classHistory)), true);
  await context.close();
});

test("모바일 주요 화면에서 페이지 가로 넘침이 없다", async () => {
  const { context, page } = await openAs("usr-owner", { width: 390, height: 844 });
  for (const view of ["home", "attendance", "learning", "students", "academy", "audit"]) {
    await page.locator(`[data-view="${view}"]`).evaluate((element) => element.click());
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
      false,
      `${view} 화면에 가로 넘침이 있습니다.`
    );
  }
  await context.close();
});
