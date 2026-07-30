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
  const connectionHistoryPanel = page.locator(".student-connection-history-panel");
  assert.equal(await connectionHistoryPanel.locator("> .panel-head h2").textContent(), "보호자 연결·활동 이력");
  assert.deepEqual(
    await connectionHistoryPanel.locator(".panel-subsection-title").allTextContents(),
    ["보호자 연결", "원생 관련 이력"]
  );
  assert.equal(await connectionHistoryPanel.locator(".activity-list").count(), 1);
  assert.equal(
    await page.locator(".student-detail-heading > .badge").evaluate((element) => getComputedStyle(element).fontSize),
    "12px"
  );
  const profileMetrics = page.locator("#view-root > .horizontal-metrics");
  assert.equal(await profileMetrics.locator(".metric-card small").count(), 0);
  assert.equal(await profileMetrics.locator(".metric-card.textual").count(), 4);
  assert.deepEqual(
    await profileMetrics.locator(".metric-card").evaluateAll((cards) =>
      cards.slice(0, 2).map((card) => getComputedStyle(card.querySelector("strong")).fontSize)
    ),
    ["15px", "15px"]
  );
  assert.equal(
    await profileMetrics.locator(".metric-card").last().locator("strong").evaluate(
      (element) => getComputedStyle(element).fontSize
    ),
    "15px"
  );
  const classMetric = await profileMetrics.locator(".metric-card.textual").nth(2).evaluate((card) => {
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
  assert.equal(await page.locator(".panel-head").filter({ hasText: "반별 출결 체크" }).locator("p").count(), 0);
  assert.equal(await page.getByText("저장 대기", { exact: true }).count(), 0);
  assert.equal(
    await page.locator(".attendance-save-bar").evaluate((item) => getComputedStyle(item).justifyContent),
    "flex-end"
  );

  await page.locator('[data-view="students"]').click();
  const rows = await page.locator(".student-table tbody tr").evaluateAll((items) =>
    items.map((row) => row.children[3]?.textContent.trim())
  );
  assert.deepEqual(rows, ["중등 수학 심화반", "중등 수학 심화반"]);
  await context.close();
});

test("원생 이름 검색과 반·재원·연결 필터를 함께 적용한다", async () => {
  const { context, page } = await openAs("usr-owner");
  await page.locator('[data-view="students"]').click();
  assert.equal(await page.locator("#student-search").count(), 1);
  assert.equal(await page.locator("#student-class-filter").count(), 1);
  assert.equal(await page.locator("#student-enrollment-filter").count(), 1);
  assert.equal(await page.locator("#student-connection-filter").count(), 1);
  assert.equal(await page.locator(".student-list-controls select").count(), 0);
  assert.equal(await page.locator(".student-table thead #student-class-filter").count(), 1);
  assert.equal(await page.locator(".student-table thead #student-enrollment-filter").count(), 1);
  assert.equal(await page.locator(".student-table thead #student-connection-filter").count(), 1);
  assert.deepEqual(
    await page.locator(".student-filter-header-select option:checked").allTextContents(),
    ["반", "재원 상태", "연결 관리"]
  );

  const visibleNames = () =>
    page.locator("[data-student-row]:visible td:first-child").allTextContents();

  await page.locator("#student-search").fill("정하린");
  assert.deepEqual(await visibleNames(), ["정하린"]);
  assert.equal(await page.locator("#student-search").inputValue(), "정하린");

  await page.locator("#student-search").fill("");
  await page.locator("#student-class-filter").selectOption("중등 수학 기본반");
  assert.deepEqual(await visibleNames(), ["오지후"]);

  await page.locator("#student-enrollment-filter").selectOption("active");
  assert.deepEqual(await visibleNames(), []);
  assert.equal(await page.locator("#student-filter-empty").isVisible(), true);

  await page.locator("#student-enrollment-filter").selectOption("paused");
  await page.locator("#student-connection-filter").selectOption("unlinked");
  assert.deepEqual(await visibleNames(), ["오지후"]);

  await page.locator("#student-class-filter").selectOption("all");
  await page.locator("#student-enrollment-filter").selectOption("all");
  await page.locator("#student-connection-filter").selectOption("linked");
  assert.deepEqual(await visibleNames(), ["정하린"]);
  await page.locator("#student-connection-filter").selectOption("pending");
  assert.deepEqual(await visibleNames(), ["정민준"]);
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

test("기존 저장 데이터는 schema v11 구조로 안전하게 변환된다", async () => {
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
    delete saved.homeworkAssignments;
    delete saved.testSettings;
    delete saved.assessments;
    delete saved.consultationRecords;
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
    enrollments: state.enrollments,
    phaseThreeCollections: [
      state.homeworkAssignments,
      state.testSettings,
      state.assessments,
      state.consultationRecords
    ]
  }));
  assert.equal(result.schemaVersion, 11);
  assert.equal(result.studentHasStatus, false);
  assert.equal(result.assignment.id, "sca-teacher-math-advanced");
  assert.equal(result.assignment.className, "중등 수학 심화반");
  assert.equal(result.learning.homework, "");
  assert.equal(result.learning.specialNotes, "");
  assert.equal(result.enrollments.every((enrollment) => Array.isArray(enrollment.classHistory)), true);
  assert.equal(result.phaseThreeCollections.every((items) => Array.isArray(items) && items.length > 0), true);
  await context.close();
});

test("학생별 과제 예외를 저장하고 자동 통계에 반영한다", async () => {
  const { context, page } = await openAs("usr-teacher");
  await page.locator('[data-view="homework"]').click();
  assert.deepEqual(
    await page.locator(".homework-metrics .metric-card strong").evaluateAll((items) =>
      items.map((item) => getComputedStyle(item).fontSize)
    ),
    ["16px", "16px", "16px", "16px"]
  );
  const homeworkColumnWidths = await page
    .locator(".homework-table tbody tr")
    .first()
    .locator("td")
    .evaluateAll((items) => items.map((item) => Math.round(item.getBoundingClientRect().width)));
  assert.ok(homeworkColumnWidths[0] >= 100 && homeworkColumnWidths[0] <= 120);
  assert.ok(homeworkColumnWidths[1] >= 110 && homeworkColumnWidths[1] <= 130);
  assert.ok(homeworkColumnWidths[2] >= 270 && homeworkColumnWidths[2] <= 290);
  assert.ok(homeworkColumnWidths[4] >= 100 && homeworkColumnWidths[4] <= 120);
  await page.locator('[name="homework-status-std-harin"]').selectOption("incomplete");
  await page.locator('[name="homework-note-std-harin"]').fill("보강 후 재확인");
  await page.locator("#homework-form").evaluate((form) => form.requestSubmit());

  const saved = await page.evaluate(() => {
    const assignment = state.homeworkAssignments.find(
      (item) =>
        item.academyId === "acd-dodam" &&
        item.className === "중등 수학 심화반" &&
        item.assignedDate === koreaDate()
    );
    return assignment.statuses.find((item) => item.studentId === "std-harin");
  });
  assert.deepEqual(saved, {
    studentId: "std-harin",
    status: "incomplete",
    note: "보강 후 재확인"
  });

  await page.locator('[data-view="analytics"]').click();
  await page.locator("#analytics-student").selectOption("std-harin");
  assert.match(await page.locator("#view-root").innerText(), /과제 수행률/);
  assert.match(await page.locator("#view-root").innerText(), /0%/);
  await context.close();
});

test("원생 상세에서 해당 학생의 과제 수행 이력을 확인하고 관리한다", async () => {
  const { context, page } = await openAs("usr-owner");
  await page.locator('[data-view="students"]').click();
  await page.locator('[data-action="open-student-detail"]').first().click();

  const homeworkPanel = page.locator(".student-homework-panel");
  assert.match(await homeworkPanel.innerText(), /유형 3번 1~10번 풀기/);
  assert.match(await homeworkPanel.innerText(), /완료/);

  await homeworkPanel.locator('[data-action="open-student-homework"]').click();
  assert.equal(await page.locator("#page-title").textContent(), "과제 관리");
  assert.equal(await page.locator(".panel-head h2").filter({ hasText: "정민준 과제 수행" }).count(), 1);
  assert.equal(await page.locator(".homework-row-check").count(), 1);
  assert.equal(await page.locator("#homework-class").count(), 0);
  assert.match(await page.locator(".homework-table tbody").innerText(), /정민준/);

  await page.locator('[name="homework-status-std-minjun"]').selectOption("missing");
  await page.locator('[name="homework-note-std-minjun"]').fill("다음 수업 확인");
  await page.locator("#homework-form").evaluate((form) => form.requestSubmit());

  assert.deepEqual(
    await page.evaluate(() => {
      const statuses = state.homeworkAssignments.find((item) => item.id === "hw-1").statuses;
      return statuses.map((item) => ({ studentId: item.studentId, status: item.status, note: item.note }));
    }),
    [
      { studentId: "std-minjun", status: "missing", note: "다음 수업 확인" },
      { studentId: "std-harin", status: "partial", note: "7번까지 완료" }
    ]
  );

  await page.locator('[data-view="students"]').click();
  await page.locator('[data-action="open-student-detail"]').first().click();
  assert.match(await page.locator(".student-homework-panel").innerText(), /미제출/);
  assert.match(await page.locator(".student-homework-panel").innerText(), /다음 수업 확인/);
  await context.close();
});

test("선택한 학생의 과제 수행 상태를 일괄 변경하고 저장한다", async () => {
  const { context, page } = await openAs("usr-teacher");
  await page.locator('[data-view="homework"]').click();
  assert.equal(await page.locator(".homework-bulk-toolbar").count(), 0);
  assert.equal(await page.locator('[data-action="apply-homework-status"]').count(), 0);
  assert.equal(await page.getByText("자동 통계 반영", { exact: true }).count(), 0);
  assert.equal(
    await page.getByText("저장한 상태는 주·월·누적 과제 수행률에 즉시 반영됩니다.", {
      exact: true
    }).count(),
    0
  );
  assert.equal(
    await page.locator(".attendance-save-bar").evaluate((item) => getComputedStyle(item).justifyContent),
    "flex-end"
  );
  assert.equal(
    await page.getByText("반 전체 완료를 기본값으로 두고 예외 학생만 수정합니다.", {
      exact: true
    }).count(),
    0
  );
  assert.equal(await page.locator(".homework-table thead #homework-select-all").count(), 1);
  assert.equal(await page.locator(".homework-table thead #homework-bulk-status").count(), 1);
  assert.equal(await page.locator(".homework-table thead #homework-status-filter").count(), 1);
  assert.equal(
    await page.locator("#homework-bulk-status option:checked").textContent(),
    "수행 상태"
  );
  assert.equal(
    await page.locator("#homework-status-filter option:checked").textContent(),
    "상태 필터"
  );

  await page.locator(".homework-row-check").first().check();
  assert.equal(await page.locator("#homework-selected-count").textContent(), "1명");
  assert.equal(
    await page.locator("#homework-select-all").evaluate((item) => item.indeterminate),
    true
  );

  await page.locator("#homework-select-all").check();
  assert.equal(await page.locator("#homework-selected-count").textContent(), "2명");
  await page.locator("#homework-bulk-status").selectOption("incomplete");
  await page.locator("#homework-form").evaluate((form) => form.requestSubmit());
  const statuses = await page.evaluate(() =>
    state.homeworkAssignments
      .find((item) => item.academyId === "acd-dodam" && item.assignedDate === koreaDate())
      .statuses.map((item) => item.status)
  );
  assert.deepEqual(statuses, ["incomplete", "incomplete"]);
  assert.deepEqual(
    await page.locator(".homework-status-select").evaluateAll((items) =>
      items.map((item) => item.value)
    ),
    ["incomplete", "incomplete"]
  );
  assert.deepEqual(
    await page.locator("[data-homework-current]").allTextContents(),
    ["미완료", "미완료"]
  );

  await page.locator(".homework-status-select").first().selectOption("completed");
  await page.locator("#homework-form").evaluate((form) => form.requestSubmit());
  await page.locator("#homework-status-filter").selectOption("incomplete");
  assert.equal(await page.locator(".homework-row-check").count(), 1);
  await page.locator('[name^="homework-note-"]').fill("필터 상태에서 저장");
  await page.locator("#homework-form").evaluate((form) => form.requestSubmit());
  assert.deepEqual(
    await page.evaluate(() =>
      state.homeworkAssignments
        .find((item) => item.academyId === "acd-dodam" && item.assignedDate === koreaDate())
        .statuses.map((item) => item.status)
    ),
    ["completed", "incomplete"]
  );
  await page.locator("#homework-status-filter").selectOption("completed");
  assert.equal(await page.locator(".homework-row-check").count(), 1);
  await context.close();
});

test("원생 상세에서 해당 학생의 테스트 결과를 확인하고 관리한다", async () => {
  const { context, page } = await openAs("usr-owner");
  await page.locator('[data-view="students"]').click();
  await page.locator('[data-action="open-student-detail"]').first().click();

  const testPanel = page.locator(".student-test-panel");
  assert.match(await testPanel.innerText(), /7월 4주 주간테스트/);
  assert.match(await testPanel.innerText(), /76\/100/);
  assert.match(await testPanel.innerText(), /응시/);

  await testPanel.locator('[data-action="open-student-tests"]').click();
  assert.equal(await page.locator("#page-title").textContent(), "테스트 관리");
  assert.equal(await page.locator(".panel-head h2").filter({ hasText: "정민준 테스트 결과" }).count(), 1);
  assert.equal(await page.locator(".test-result-table tbody tr").count(), 1);
  assert.equal(await page.locator("#test-class").count(), 0);
  assert.match(await page.locator(".test-result-table tbody").innerText(), /정민준/);

  await page.locator('[name="test-score-std-minjun"]').fill("81");
  await page.locator("#test-form").evaluate((form) => form.requestSubmit());

  assert.deepEqual(
    await page.evaluate(() => {
      const assessment = state.assessments.find((item) => item.id === "asm-1");
      return {
        minjun: assessment.attempts.find(
          (item) => item.studentId === "std-minjun" && item.attemptNo === 1
        ),
        harin: assessment.attempts.find(
          (item) => item.studentId === "std-harin" && item.attemptNo === 1
        ),
        minjunHistory: assessment.scoreHistory.filter((item) => item.studentId === "std-minjun").length
      };
    }).then(({ minjun, harin, minjunHistory }) => ({
      minjun: { status: minjun.status, score: minjun.score },
      harin: { status: harin.status, score: harin.score, note: harin.note },
      minjunHistory
    })),
    {
      minjun: { status: "taken", score: 81 },
      harin: { status: "absent", score: null, note: "학교 행사" },
      minjunHistory: 1
    }
  );

  await page.locator('[data-view="students"]').click();
  await page.locator('[data-action="open-student-detail"]').first().click();
  assert.match(await page.locator(".student-test-panel").innerText(), /81\/100/);
  assert.match(await page.locator(".student-test-panel").innerText(), /1건/);
  await context.close();
});

test("테스트 결시와 재시험을 별도 시도로 보존하고 점수 수정이력을 남긴다", async () => {
  const { context, page } = await openAs("usr-owner");
  await page.locator('[data-view="tests"]').click();
  assert.equal(
    await page.getByText("최초 응시와 결시·재시험을 별도 시도로 보존합니다.", {
      exact: true
    }).count(),
    0
  );
  assert.equal(await page.getByText("시도별 이력 보존", { exact: true }).count(), 0);
  assert.equal(
    await page.locator(".attendance-save-bar").evaluate((item) => getComputedStyle(item).justifyContent),
    "flex-end"
  );
  assert.equal(
    await page.locator('[name="test-note-std-harin"]').getAttribute("aria-label"),
    "정하린 결시·관찰 메모"
  );
  assert.equal(
    await page.locator('[name="retest-score-std-harin"]').getAttribute("placeholder"),
    "점수 입력"
  );
  assert.equal(
    await page.locator("#test-title").evaluate((item) => getComputedStyle(item).fontSize),
    "13px"
  );
  await page.locator('[name="retest-score-std-harin"]').fill("82");
  await page.locator("#test-form").evaluate((form) => form.requestSubmit());

  let result = await page.evaluate(() => {
    const assessment = state.assessments.find((item) => item.id === "asm-1");
    return assessment.attempts
      .filter((item) => item.studentId === "std-harin")
      .map(({ attemptNo, status, score }) => ({ attemptNo, status, score }));
  });
  assert.deepEqual(result, [
    { attemptNo: 1, status: "absent", score: null },
    { attemptNo: 2, status: "taken", score: 82 }
  ]);

  await page.locator('[name="test-score-std-minjun"]').fill("79");
  await page.locator("#test-form").evaluate((form) => form.requestSubmit());
  result = await page.evaluate(() => {
    const assessment = state.assessments.find((item) => item.id === "asm-1");
    return {
      score: assessment.attempts.find(
        (item) => item.studentId === "std-minjun" && item.attemptNo === 1
      ).score,
      history: assessment.scoreHistory
    };
  });
  assert.equal(result.score, 79);
  assert.equal(result.history.length, 1);
  assert.deepEqual(
    {
      previousScore: result.history[0].previousScore,
      nextScore: result.history[0].nextScore
    },
    { previousScore: 76, nextScore: 79 }
  );
  assert.equal(await page.locator('[data-action="view-score-history"]').count(), 1);
  await context.close();
});

test("주간·월간·누적 자동 통계가 실제 집계기간을 표시한다", async () => {
  const { context, page } = await openAs("usr-owner");
  await page.evaluate(() => {
    state.attendanceRecords.push({
      id: "att-other-academy-future",
      academyId: "acd-bridge",
      studentId: "std-jihu",
      className: "초등 수학",
      lessonDate: "2030-01-01",
      status: "present",
      note: ""
    });
  });
  await page.locator('[data-view="analytics"]').click();
  for (const period of ["weekly", "monthly", "cumulative"]) {
    await page.locator(`[data-action="analytics-period"][data-period="${period}"]`).click();
    assert.equal(
      await page.locator(`[data-action="analytics-period"][data-period="${period}"]`).getAttribute("class"),
      "tab-button active"
    );
  }
  const text = await page.locator("#view-root").innerText();
  assert.match(text, /최초 기록/);
  assert.match(text, /출석률/);
  assert.match(text, /과제 수행률/);
  assert.match(text, /평가 성취도/);
  assert.doesNotMatch(text, /2030-01-01/);
  await context.close();
});

test("원생 상세 분석과 반별 학생 필터가 같은 집계를 사용한다", async () => {
  const { context, page } = await openAs("usr-owner");
  await page.locator('[data-view="students"]').click();
  await page.locator('[data-action="open-student-detail"]').first().click();

  const detailAnalytics = page.locator(".student-analytics-section");
  assert.equal(await detailAnalytics.locator(".analytics-control-panel h2").textContent(), "학습 분석");
  assert.equal(
    await detailAnalytics.locator(".analytics-control-panel > .analytics-metrics").count(),
    1
  );
  assert.equal(await detailAnalytics.locator("> .analytics-metrics").count(), 0);
  const detailMetrics = await detailAnalytics
    .locator(".analytics-control-panel > .analytics-metrics .metric-card strong")
    .allTextContents();
  assert.equal(
    await detailAnalytics.locator(".analytics-control-panel .student-recent-learning").count(),
    1
  );
  assert.match(await detailAnalytics.locator(".student-recent-learning").innerText(), /개념원리 중2-1/);
  assert.equal(await detailAnalytics.getByText("자동 생성 요약", { exact: true }).count(), 0);
  assert.equal(await detailAnalytics.getByText("상담 후속조치", { exact: true }).count(), 0);
  await detailAnalytics.locator('[data-action="analytics-period"][data-period="cumulative"]').click();
  assert.match(
    await page.locator(".student-analytics-section .analytics-control-panel").innerText(),
    /최초 기록/
  );

  await page.evaluate(() => {
    state.students.push({
      id: "std-seoyeon",
      name: "이서연",
      birthDate: "2015-03-11",
      createdBy: "usr-owner",
      createdAt: new Date().toISOString()
    });
    state.enrollments.push({
      id: "enr-seoyeon",
      academyId: "acd-dodam",
      studentId: "std-seoyeon",
      className: "초등 수학 기본반",
      status: "active",
      startedAt: "2026-07-30",
      classHistory: []
    });
    state.analyticsPeriod = "monthly";
    persistState();
  });
  await page.locator('[data-view="analytics"]').click();

  assert.deepEqual(
    await page.locator(".analytics-control-panel .compact-filters select").evaluateAll((items) =>
      items.map((item) => item.id)
    ),
    ["analytics-class", "analytics-student"]
  );
  assert.deepEqual(
    await page.locator("#analytics-student option").evaluateAll((items) =>
      items.map((item) => item.value)
    ),
    ["std-minjun", "std-harin"]
  );
  assert.deepEqual(
    await page.locator("#view-root > .horizontal-metrics .metric-card strong").allTextContents(),
    detailMetrics
  );
  assert.equal(await page.getByText("상담 후속조치", { exact: true }).count(), 0);

  await page.locator("#analytics-class").selectOption("초등 수학 기본반");
  assert.deepEqual(
    await page.locator("#analytics-student option").evaluateAll((items) =>
      items.map((item) => item.value)
    ),
    ["std-seoyeon"]
  );
  assert.equal(await page.locator("#analytics-student option:checked").textContent(), "이서연");
  await page.locator("#analytics-class").selectOption("중등 수학 심화반");
  assert.deepEqual(
    await page.locator("#analytics-student option").evaluateAll((items) =>
      items.map((item) => item.value)
    ),
    ["std-minjun", "std-harin"]
  );
  await context.close();
});

test("원생 상세에서 권한에 따라 상담 이력을 확인하고 관리한다", async () => {
  const ownerSession = await openAs("usr-owner");
  const ownerPage = ownerSession.page;
  await ownerPage.locator('[data-view="students"]').click();
  await ownerPage.locator('[data-action="open-student-detail"]').first().click();

  const consultationPanel = ownerPage.locator(".student-consultation-panel");
  const consultationText = await consultationPanel.innerText();
  assert.match(consultationText, /2026-07-26/);
  assert.match(consultationText, /학부모 상담/);
  assert.match(consultationText, /8월 첫째 주 단원 목표 공유/);
  assert.match(consultationText, /최근 테스트 향상폭과 과제 수행 흐름/);
  assert.equal(await consultationPanel.locator(".student-consultation-followup").count(), 1);
  assert.match(await consultationPanel.locator(".student-consultation-followup").innerText(), /최근 후속조치/);

  await consultationPanel.locator('[data-action="open-student-consultations"]').click();
  assert.equal(await ownerPage.locator("#page-title").textContent(), "상담 기록");
  assert.equal(await ownerPage.locator("#consultation-student").inputValue(), "std-minjun");
  await ownerPage.locator("#consultation-type").selectOption("student");
  await ownerPage.locator("#consultation-internal").fill("학습 계획을 학생과 점검함.");
  await ownerPage.locator("#consultation-action").fill("다음 주 계획 이행 확인");
  await ownerPage.locator("#consultation-summary").fill("학습 계획을 함께 세웠습니다.");
  await ownerPage.locator("#consultation-form").evaluate((form) => form.requestSubmit());

  await ownerPage.locator('[data-view="students"]').click();
  await ownerPage.locator('[data-action="open-student-detail"]').first().click();
  assert.match(await ownerPage.locator(".student-consultation-panel").innerText(), /학생 상담/);
  assert.match(await ownerPage.locator(".student-consultation-panel").innerText(), /다음 주 계획 이행 확인/);
  await ownerSession.context.close();

  const teacherSession = await openAs("usr-teacher");
  const teacherPage = teacherSession.page;
  await teacherPage.locator('[data-view="students"]').click();
  await teacherPage.locator('[data-action="open-student-detail"]').first().click();
  const protectedPanel = teacherPage.locator(".student-consultation-panel");
  assert.match(await protectedPanel.innerText(), /상담 기록을 열람할 권한이 없습니다/);
  assert.equal(await protectedPanel.locator('[data-action="open-student-consultations"]').count(), 0);
  assert.doesNotMatch(await protectedPanel.innerText(), /최근 테스트 향상폭과 과제 수행 흐름/);
  await teacherSession.context.close();
});

test("상담 내부 메모와 보호자 공유 요약을 분리해 저장한다", async () => {
  const { context, page } = await openAs("usr-owner");
  await page.locator('[data-view="consultations"]').click();
  await page.locator("#consultation-student").selectOption("std-harin");
  await page.locator("#consultation-internal").fill("과제 미완료 원인과 학습 시간을 확인함.");
  await page.locator("#consultation-action").fill("다음 수업 후 수행 상태 재확인");
  await page.locator("#consultation-summary").fill("과제 습관을 함께 점검했습니다.");
  await page.locator("#consultation-form").evaluate((form) => form.requestSubmit());

  const saved = await page.evaluate(() =>
    state.consultationRecords.find(
      (item) =>
        item.studentId === "std-harin" &&
        item.nextAction === "다음 수업 후 수행 상태 재확인"
    )
  );
  assert.equal(saved.internalMemo, "과제 미완료 원인과 학습 시간을 확인함.");
  assert.equal(saved.guardianSummary, "과제 습관을 함께 점검했습니다.");
  assert.match(await page.locator("#view-root").innerText(), /보호자 공유: 과제 습관/);
  await context.close();
});

test("모바일 주요 화면에서 페이지 가로 넘침이 없다", async () => {
  const { context, page } = await openAs("usr-owner", { width: 390, height: 844 });
  for (const view of [
    "home",
    "attendance",
    "learning",
    "homework",
    "tests",
    "analytics",
    "consultations",
    "students",
    "academy",
    "audit"
  ]) {
    await page.locator(`[data-view="${view}"]`).evaluate((element) => element.click());
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
      false,
      `${view} 화면에 가로 넘침이 있습니다.`
    );
  }
  await context.close();
});
