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

async function navigateTo(page, view) {
  const target = page.locator(`[data-view="${view}"]`);
  if (!(await target.isVisible())) {
    const groupToggle = page.locator(
      `[data-nav-group-container]:has([data-view="${view}"]) [data-nav-group]`
    );
    if (await groupToggle.count()) await groupToggle.click();
  }
  await target.click();
}

test("로그인 화면은 역할 선택을 우선하고 소개 문구를 간결하게 표시한다", async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });

  assert.equal(await page.locator("#auth-role-step h2").textContent(), "모아플로 시작하기");
  assert.equal(await page.locator(".auth-story h1").count(), 0);
  assert.equal(
    await page.locator(".auth-brand-lockup > p").textContent(),
    "학원을 간편하게 운영하고학부모와 자녀의 출결·학습 현황을 공유하며 소통하세요."
  );
  assert.equal(await page.locator(".role-option").count(), 3);
  assert.equal(await page.locator(".operator-login-link").textContent(), "운영자 로그인");
  assert.doesNotMatch(
    await page.locator("#auth-role-step").innerText(),
    /사용할 역할을 선택해 주세요|역할에 따라 필요한 정보와 접근 범위/
  );
  assert.equal(
    await page.locator(".role-options").evaluate((element) =>
      getComputedStyle(element).gridTemplateColumns.split(" ").length
    ),
    1
  );
  const panelTop = await page.locator(".auth-panel").evaluate((element) => element.offsetTop);
  const storyTop = await page.locator(".auth-story").evaluate((element) => element.offsetTop);
  assert.equal(panelTop, 0);
  assert.ok(storyTop > panelTop);

  await page.locator(".operator-login-link").click();
  assert.equal(await page.locator("#auth-phone-step").isVisible(), true);
  assert.equal(await page.locator("#auth-form-title").textContent(), "운영자 로그인");
  assert.equal(await page.locator("#phone").inputValue(), "010-0000-0000");
  await page.locator("#back-to-role").click();

  await page.locator('[data-auth-role="guardian"]').click();
  assert.equal(await page.locator('[data-auth-role="guardian"]').getAttribute("aria-checked"), "true");
  await page.locator("#continue-to-phone").click();
  assert.equal(await page.locator("#auth-phone-step").isVisible(), true);
  assert.equal(await page.locator("#back-to-role").textContent(), "← 로그인 유형 변경");
  await page.locator("#back-to-role").click();
  await page.setViewportSize({ width: 1280, height: 900 });
  const brandAlignment = await page.evaluate(() => {
    const story = document.querySelector(".auth-story").getBoundingClientRect();
    const lockup = document.querySelector(".auth-brand-lockup").getBoundingClientRect();
    return {
      horizontal: Math.abs(story.left + story.width / 2 - (lockup.left + lockup.width / 2)),
      verticalOffset: story.top + story.height / 2 - (lockup.top + lockup.height / 2)
    };
  });
  assert.ok(brandAlignment.horizontal < 2);
  assert.ok(brandAlignment.verticalOffset > 50);
  assert.equal(await page.locator(".auth-brand-lockup .brand-symbol").evaluate((element) => getComputedStyle(element).width), "78px");
  assert.equal(
    await page.locator(".role-options").evaluate((element) =>
      getComputedStyle(element).gridTemplateColumns.split(" ").length
    ),
    3
  );
  assert.equal(await page.locator(".operator-login-row").evaluate((element) => getComputedStyle(element).justifyContent), "flex-end");
  assert.equal(await page.locator(".operator-login-link").evaluate((element) => getComputedStyle(element).fontSize), "11px");
  await context.close();
});

test("원장 메뉴는 업무 특성별 그룹을 한 번에 하나씩 펼친다", async () => {
  const { context, page } = await openAs("usr-owner");
  const academyContextStyle = await page.locator(".workspace-context").evaluate((element) => ({
    borderRadius: getComputedStyle(element).borderRadius,
    boxShadow: getComputedStyle(element).boxShadow,
    backgroundColor: getComputedStyle(element).backgroundColor
  }));
  assert.deepEqual(academyContextStyle, {
    borderRadius: "0px",
    boxShadow: "none",
    backgroundColor: "rgba(0, 0, 0, 0)"
  });
  assert.equal(await page.locator(".workspace-context").evaluate((element) => getComputedStyle(element).paddingTop), "10px");
  assert.equal(await page.locator(".workspace-context").evaluate((element) => getComputedStyle(element).paddingBottom), "22px");
  assert.equal(await page.locator("#context-name").evaluate((element) => getComputedStyle(element).textAlign), "left");
  assert.equal(await page.locator("#context-name").evaluate((element) => getComputedStyle(element).fontSize), "16px");
  assert.equal(await page.locator(".hero-panel").count(), 0);
  assert.match(await page.locator(".horizontal-metrics").first().innerText(), /출결 처리율\s+100%/);
  assert.equal((await page.locator('#main-nav > [data-view="home"]').textContent()).trim(), "오늘 운영");
  assert.deepEqual(
    (await page.locator("[data-nav-group]").allTextContents()).map((label) => label.trim()),
    ["수업 관리⌄", "원생 관리⌄", "학원 설정⌄"]
  );
  assert.deepEqual(await page.locator("[data-nav-group]").evaluateAll((items) =>
    items.map((item) => item.getAttribute("aria-expanded"))
  ), ["false", "false", "false"]);

  await page.locator('[data-nav-group="classes"]').click();
  assert.equal(await page.locator('[data-nav-group="classes"]').getAttribute("aria-expanded"), "true");
  assert.deepEqual(
    (await page.locator('[data-nav-group-container="classes"] .nav-item').allTextContents()).map((label) => label.trim()),
    ["출결 관리", "학습 기록", "과제 관리", "테스트 관리"]
  );

  await page.locator('[data-nav-group="students"]').click();
  assert.equal(await page.locator('[data-nav-group="classes"]').getAttribute("aria-expanded"), "false");
  assert.equal(await page.locator('[data-nav-group="students"]').getAttribute("aria-expanded"), "true");
  await page.locator('[data-view="analytics"]').click();
  assert.equal(await page.locator("#page-title").textContent(), "학습 분석");
  assert.equal(await page.locator('[data-nav-group="students"]').getAttribute("aria-expanded"), "true");
  await context.close();

  const mobile = await openAs("usr-owner", { width: 390, height: 844 });
  await mobile.page.locator("#mobile-nav-toggle").click();
  await mobile.page.locator('[data-nav-group="classes"]').click();
  assert.equal(await mobile.page.locator("#workspace").evaluate((item) => item.classList.contains("nav-open")), true);
  await mobile.page.locator('[data-view="attendance"]').click();
  assert.equal(await mobile.page.locator("#workspace").evaluate((item) => item.classList.contains("nav-open")), false);
  await mobile.context.close();
});

test("기록 목록은 일정 높이 이후 스크롤되고 기간·내용 검색이 가능하다", async () => {
  const { context, page } = await openAs("usr-owner");
  await navigateTo(page, "audit");

  const recordScroll = page.locator(".record-scroll");
  assert.equal(await recordScroll.evaluate((element) => getComputedStyle(element).maxHeight), "630px");
  assert.equal(await recordScroll.evaluate((element) => getComputedStyle(element).overflowY), "auto");

  const search = page.locator('[data-record-search-input="audit-records"]');
  await search.fill("정민준");
  assert.equal(await page.locator('[data-record-list="audit-records"] [data-record-search]:not(.hidden)').count(), 1);
  assert.match(
    await page.locator('[data-record-list="audit-records"] [data-record-search]:not(.hidden)').innerText(),
    /정민준 보호자 초대 발급/
  );

  await search.fill("검색되지 않는 기록");
  assert.equal(await page.locator('[data-record-empty="audit-records"]').isVisible(), true);

  await search.fill("");
  const dateFrom = page.locator('[data-record-date-from="audit-records"]');
  const dateTo = page.locator('[data-record-date-to="audit-records"]');
  await dateFrom.fill("2026-07-21");
  await dateFrom.dispatchEvent("change");
  await dateTo.fill("2026-07-21");
  await dateTo.dispatchEvent("change");
  assert.equal(await page.locator('[data-record-list="audit-records"] [data-record-search]:not(.hidden)').count(), 1);
  assert.match(
    await page.locator('[data-record-list="audit-records"] [data-record-search]:not(.hidden)').innerText(),
    /정하린 보호자 관계 확인/
  );
  await search.fill("정민준");
  assert.equal(await page.locator('[data-record-empty="audit-records"]').isVisible(), true);

  await search.fill("");
  await dateFrom.fill("");
  await dateFrom.dispatchEvent("change");
  await dateTo.fill("");
  await dateTo.dispatchEvent("change");
  await page.locator('[data-record-list="audit-records"]').evaluate((body) => {
    const rows = [...body.querySelectorAll("tr")];
    for (let repeat = 0; repeat < 12; repeat += 1) {
      rows.forEach((row) => body.append(row.cloneNode(true)));
    }
  });
  const scrollMetrics = await recordScroll.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    headerPosition: getComputedStyle(element.querySelector("th")).position
  }));
  assert.ok(scrollMetrics.scrollHeight > scrollMetrics.clientHeight);
  assert.equal(scrollMetrics.headerPosition, "sticky");

  await navigateTo(page, "consultations");
  const consultationSearch = page.locator('[data-record-search-input="consultation-records"]');
  await consultationSearch.fill("단원 목표");
  assert.equal(
    await page.locator('[data-record-list="consultation-records"] [data-record-search]:not(.hidden)').count(),
    1
  );

  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
    false
  );
  await context.close();
});

test("강사 메뉴도 수업·원생 그룹과 단독 내 권한 메뉴를 사용한다", async () => {
  const { context, page } = await openAs("usr-teacher");
  assert.equal((await page.locator('#main-nav > [data-view="home"]').textContent()).trim(), "오늘 운영");
  assert.deepEqual(
    (await page.locator("[data-nav-group]").allTextContents()).map((label) => label.trim()),
    ["수업 관리⌄", "원생 관리⌄"]
  );
  assert.equal((await page.locator('#main-nav > [data-view="permissions"]').textContent()).trim(), "내 권한");

  await page.locator('[data-nav-group="classes"]').click();
  assert.deepEqual(
    (await page.locator('[data-nav-group-container="classes"] .nav-item').allTextContents()).map((label) => label.trim()),
    ["출결 관리", "학습 기록", "과제 관리", "테스트 관리"]
  );
  await page.locator('[data-nav-group="students"]').click();
  assert.equal(await page.locator('[data-nav-group="classes"]').getAttribute("aria-expanded"), "false");
  assert.deepEqual(
    (await page.locator('[data-nav-group-container="students"] .nav-item').allTextContents()).map((label) => label.trim()),
    ["원생 목록", "학습 분석", "학부모 소통"]
  );
  assert.equal(await page.locator('[data-view="consultations"]').count(), 0);

  await page.locator('[data-view="academy_comments"]').click();
  assert.equal(await page.locator("#page-title").textContent(), "학부모 소통");
  await page.locator('#main-nav > [data-view="permissions"]').click();
  assert.equal(await page.locator("#page-title").textContent(), "권한 확인");
  await context.close();
});

test("출결관리 조작 영역은 같은 글자 크기를 사용한다", async () => {
  const { context, page } = await openAs("usr-owner");
  await navigateTo(page, "attendance");
  const fontSizes = await page.locator([
    "#attendance-class",
    "#attendance-date",
    ".bulk-check",
    ".attendance-filters .tab-button",
    ".attendance-toolbar .button.compact",
    ".attendance-table th",
    ".attendance-table td strong",
    ".attendance-table .badge",
    ".attendance-time",
    ".attendance-status-select",
    ".attendance-reason",
    ".attendance-save-bar .button"
  ].join(", ")).evaluateAll((items) => items.map((item) => getComputedStyle(item).fontSize));

  assert.deepEqual([...new Set(fontSizes)], ["12px"]);
  await context.close();
});

test("테스트관리 조작 영역은 같은 글자 크기를 사용한다", async () => {
  const { context, page } = await openAs("usr-owner");
  await navigateTo(page, "tests");
  assert.deepEqual(
    await page.locator(".test-metrics .metric-card strong").evaluateAll((items) =>
      items.map((item) => getComputedStyle(item).fontSize)
    ),
    ["22px", "22px", "22px", "22px"]
  );
  const fontSizes = await page.locator([
    "#test-class",
    "#assessment-select",
    ".settings-strip label",
    ".settings-strip select",
    ".settings-strip input",
    ".test-meta-fields label",
    ".test-meta-fields input",
    ".test-meta-fields select",
    ".test-result-table th",
    ".test-result-table td strong",
    ".test-result-table select",
    ".test-result-table input",
    ".test-result-table .badge",
    ".attendance-save-bar .button"
  ].join(", ")).evaluateAll((items) => items.map((item) => getComputedStyle(item).fontSize));

  assert.deepEqual([...new Set(fontSizes)], ["12px"]);
  await context.close();
});

test("학원 기본정보는 요청한 두 항목씩 배치하고 주요 프로그램을 저장한다", async () => {
  const { context, page } = await openAs("usr-owner");
  await navigateTo(page, "academy");
  const sameRow = async (firstSelector, secondSelector) => {
    const [firstTop, secondTop] = await Promise.all([
      page.locator(firstSelector).evaluate((item) => item.parentElement.getBoundingClientRect().top),
      page.locator(secondSelector).evaluate((item) => item.parentElement.getBoundingClientRect().top)
    ]);
    return Math.abs(firstTop - secondTop) < 4;
  };

  assert.equal(await sameRow("#academy-business-number", "#academy-owner"), true);
  assert.equal(await sameRow("#academy-phone", "#academy-main-program"), true);
  assert.equal(await page.locator("#academy-main-program").inputValue(), "중등 수학 심화·내신 대비");
  await page.locator("#academy-main-program").fill("중등 수학 심화·고등 선행");
  await page.locator('[data-action="save-academy"]').click();
  assert.equal(
    await page.evaluate(() => state.academies.find((item) => item.id === "acd-dodam").mainProgram),
    "중등 수학 심화·고등 선행"
  );
  await context.close();
});

test("원생 상세에서 반을 변경하고 과거 기록과 이력을 유지한다", async () => {
  const { context, page } = await openAs("usr-owner");
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await navigateTo(page, "students");
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
  const classChangeHeights = await page.locator(".class-change-control").evaluate((control) => ({
    select: control.querySelector("select").getBoundingClientRect().height,
    button: control.querySelector("button").getBoundingClientRect().height
  }));
  assert.equal(classChangeHeights.select, classChangeHeights.button);
  const connectionHistoryPanel = page.locator(".student-connection-history-panel");
  assert.equal(await connectionHistoryPanel.locator("> .panel-head h2").textContent(), "보호자 연결·활동 이력");
  assert.deepEqual(
    await connectionHistoryPanel.locator(".panel-subsection-title").allTextContents(),
    ["보호자 연결", "원생 관련 이력"]
  );
  assert.equal(
    await connectionHistoryPanel.locator(".student-activity-head").evaluate((element) => getComputedStyle(element).flexDirection),
    "column"
  );
  assert.equal(
    await connectionHistoryPanel.locator(".student-activity-head .panel-subsection-title").evaluate((element) => getComputedStyle(element).whiteSpace),
    "nowrap"
  );
  assert.equal(
    await connectionHistoryPanel.locator(".student-activity-head").evaluate((head) => {
      const title = head.querySelector("h3").getBoundingClientRect();
      const controls = [...head.querySelectorAll("input")].map((input) => input.getBoundingClientRect());
      return title.bottom < controls[0].top && controls.every((control) => Math.abs(control.top - controls[0].top) < 4);
    }),
    true
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
    await profileMetrics.locator(".metric-card > span, .metric-card > strong").evaluateAll((items) =>
      items.map((item) => getComputedStyle(item).fontSize)
    ),
    ["15px", "15px", "15px", "15px", "15px", "15px", "15px", "15px"]
  );
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
  await navigateTo(page, "attendance");
  assert.deepEqual(await page.locator("#attendance-class option").allTextContents(), ["중등 수학 심화반"]);
  assert.equal(await page.locator(".panel-head").filter({ hasText: "반별 출결 체크" }).locator("p").count(), 0);
  assert.equal(await page.getByText("저장 대기", { exact: true }).count(), 0);
  assert.equal(
    await page.locator(".attendance-save-bar").evaluate((item) => getComputedStyle(item).justifyContent),
    "flex-end"
  );

  await navigateTo(page, "students");
  const rows = await page.locator(".student-table tbody tr").evaluateAll((items) =>
    items.map((row) => row.children[3]?.textContent.trim())
  );
  assert.deepEqual(rows, ["중등 수학 심화반", "중등 수학 심화반"]);
  await context.close();
});

test("원생 이름 검색과 반·재원·연결 필터를 함께 적용한다", async () => {
  const { context, page } = await openAs("usr-owner");
  await navigateTo(page, "students");
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

test("운영자는 기간별 입력·조회율과 파일럿 상태를 관리한다", async () => {
  const { context, page } = await openAs("usr-operator");
  assert.equal(await page.locator("#page-title").textContent(), "운영 현황");
  assert.deepEqual(
    (await page.locator("#main-nav .nav-item").allTextContents()).map((item) => item.trim()),
    ["운영 현황", "서비스 이용", "파일럿 학원", "오류·문의", "공통 데이터 구조", "전체 감사 이력"]
  );
  assert.equal(await page.locator("#operator-metric-window").inputValue(), "7");
  assert.equal(await page.locator(".data-table tbody tr").count(), 2);
  const rates = await page.locator(".horizontal-metrics .metric-card strong").allTextContents();
  assert.equal(rates.slice(1).every((value) => Number.parseInt(value, 10) <= 100), true);

  await page.locator("#operator-metric-window").selectOption("30");
  assert.equal(await page.locator("#operator-metric-window").inputValue(), "30");
  assert.equal(await page.evaluate(() => state.operatorMetricWindow), "30");

  await navigateTo(page, "pilots");
  const dodamRow = page.locator(".data-table tbody tr").filter({ hasText: "에듀수학학원" });
  assert.equal(await dodamRow.locator("td").first().innerText(), "에듀수학학원");
  assert.doesNotMatch(await dodamRow.innerText(), /서울시 마포구 월드컵로 12/);
  await dodamRow.getByRole("button", { name: "학원 정보" }).click();
  assert.equal(await page.locator("#modal-title").textContent(), "에듀수학학원");
  assert.match(await page.locator("#modal").innerText(), /한도담/);
  assert.match(await page.locator("#modal").innerText(), /123-45-67890/);
  assert.match(await page.locator("#modal").innerText(), /중등 수학 심화·내신 대비/);
  assert.match(await page.locator("#modal").innerText(), /서울시 마포구 월드컵로 12/);
  await page.locator('[data-action="close-modal"]').click();
  const bridgeRow = page.locator(".data-table tbody tr").filter({ hasText: "브릿지영어학원" });
  await bridgeRow.locator("[data-pilot-status]").selectOption("active");
  await bridgeRow.locator('[data-action="save-pilot-status"]').click();
  const result = await page.evaluate(() => ({
    status: state.academies.find((item) => item.id === "acd-bridge").pilotStatus,
    audit: state.auditLogs.find(
      (item) => item.action === "pilot.status_changed" && item.targetId === "acd-bridge"
    )
  }));
  assert.equal(result.status, "active");
  assert.match(result.audit.summary, /준비 중 → 운영 중/);
  assert.match(await bridgeRow.innerText(), /운영 중/);
  await context.close();
});

test("운영자 전체 조회율은 학원별 보호자 연결 단위로 집계한다", async () => {
  const { context, page } = await openAs("usr-operator");
  await page.evaluate(() => {
    state.guardianLinks.push({
      id: "gln-cross-academy",
      academyId: "acd-bridge",
      guardianUserId: "usr-guardian",
      studentId: "std-minjun",
      relationship: "부",
      status: "verified",
      verifiedAt: new Date().toISOString()
    });
    state.usageEvents.push({
      id: "evt-current-guardian-home",
      academyId: "acd-dodam",
      userId: "usr-guardian",
      type: "guardian.home_viewed",
      createdAt: new Date().toISOString()
    });
    renderView();
  });
  const viewRate = await page.locator(".horizontal-metrics .metric-card strong").nth(3).textContent();
  assert.equal(viewRate, "50%");
  await context.close();
});

test("운영자는 오류·문의를 접수하고 처리 이력을 남긴다", async () => {
  const { context, page } = await openAs("usr-operator");
  await navigateTo(page, "support");
  assert.equal(await page.locator("#page-title").textContent(), "오류·문의");
  assert.equal(
    await page.locator("#support-create-form").evaluate((form) => getComputedStyle(form).rowGap),
    "20px"
  );
  assert.deepEqual(
    await page.locator("#support-create-form > label").evaluateAll((labels) =>
      labels.map((label) => ({
        display: getComputedStyle(label).display,
        gap: getComputedStyle(label).gap,
        marginTop: getComputedStyle(label).marginTop
      }))
    ),
    Array(5).fill({ display: "grid", gap: "8px", marginTop: "0px" })
  );

  await page.locator("#support-academy").selectOption("acd-bridge");
  await page.locator("#support-type").selectOption("error");
  await page.locator("#support-priority").selectOption("high");
  await page.locator("#support-title").fill("CSV 업로드 완료 화면 확인 필요");
  await page.locator("#support-detail").fill("오류 행 표시가 접힌 상태로 보여 확인을 요청합니다.");
  await page.locator("#support-create-form").evaluate((form) => form.requestSubmit());

  const created = await page.evaluate(() =>
    state.supportRequests.find((item) => item.title === "CSV 업로드 완료 화면 확인 필요")
  );
  assert.equal(created.status, "open");
  assert.equal(created.academyId, "acd-bridge");

  const card = page.locator(".support-card").filter({ hasText: "CSV 업로드 완료 화면 확인 필요" });
  assert.match(await card.innerText(), /긴급/);
  await card.locator("[data-support-status]").selectOption("resolved");
  await card.locator("[data-support-note]").fill("오류 행을 자동으로 펼치도록 안내했습니다.");
  await card.locator('[data-action="save-support-request"]').click();

  const resolved = await page.evaluate(() => {
    const request = state.supportRequests.find(
      (item) => item.title === "CSV 업로드 완료 화면 확인 필요"
    );
    return {
      status: request.status,
      resolution: request.resolution,
      history: request.history,
      audits: state.auditLogs.filter(
        (item) => item.targetId === request.id && item.action.startsWith("support.")
      )
    };
  });
  assert.equal(resolved.status, "resolved");
  assert.match(resolved.resolution, /자동으로 펼치도록 안내/);
  assert.equal(resolved.history.length, 1);
  assert.equal(resolved.audits.length, 2);
  assert.match(await card.innerText(), /완료/);
  await context.close();
});

test("운영자는 학습분석과 성장추이의 활용률·재방문을 확인한다", async () => {
  const { context, page } = await openAs("usr-owner");
  await navigateTo(page, "analytics");
  await page.locator('[data-action="analytics-period"][data-period="weekly"]').click();
  assert.equal(
    await page.evaluate(() =>
      state.usageEvents.some(
        (item) =>
          item.userId === "usr-owner" &&
          item.type === "academy.analytics_viewed"
      )
    ),
    true
  );
  assert.equal(
    await page.evaluate(() =>
      state.usageEvents.some(
        (item) =>
          item.userId === "usr-owner" &&
          item.type === "academy.analytics_filter_used"
      )
    ),
    true
  );

  await page.evaluate(() => {
    session = { userId: "usr-guardian", verifiedAt: new Date().toISOString() };
    state.activeView = "growth";
    persistSession();
    persistState();
    render();
  });
  assert.equal(
    await page.evaluate(() =>
      state.usageEvents.some(
        (item) =>
          item.userId === "usr-guardian" &&
          item.type === "guardian.growth_viewed"
      )
    ),
    true
  );

  await page.evaluate(() => {
    session = { userId: "usr-operator", verifiedAt: new Date().toISOString() };
    state.activeView = "usage";
    persistSession();
    persistState();
    render();
  });
  assert.equal(await page.locator("#page-title").textContent(), "서비스 이용 현황");
  assert.deepEqual(
    await page.locator(".horizontal-metrics .metric-card > span").allTextContents(),
    ["학습분석 활용률", "성장추이 조회율", "재방문율", "미활용 학원"]
  );
  assert.equal(await page.locator("#operator-usage-window").inputValue(), "7");
  assert.equal(await page.locator(".usage-table tbody tr").count(), 2);
  assert.match(
    await page.locator(".usage-table tbody tr").filter({ hasText: "에듀수학학원" }).innerText(),
    /활발/
  );
  const operatorText = await page.locator("#view-root").innerText();
  assert.doesNotMatch(operatorText, /정민준|정하린|오지후|92점|85점/);
  await page.locator("#operator-usage-window").selectOption("30");
  assert.equal(await page.evaluate(() => state.operatorUsageWindow), "30");
  await context.close();
});

test("운영자 주요 화면은 모바일에서 가로 넘침이 없다", async () => {
  const { context, page } = await openAs("usr-operator", { width: 390, height: 844 });
  for (const view of ["home", "usage", "pilots", "support"]) {
    await page.locator(`[data-view="${view}"]`).evaluate((element) => element.click());
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
      false,
      `${view} 화면에 가로 넘침이 있습니다.`
    );
  }
  await context.close();
});

test("학습기록의 과제·특이사항을 저장하고 이전 기록과 학부모 홈에 반영한다", async () => {
  const { context, page } = await openAs("usr-teacher");
  await navigateTo(page, "learning");
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
  await navigateTo(page, "students");
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

test("학부모는 여러 학원 타임라인과 성장·코멘트·알림을 확인한다", async () => {
  const { context, page } = await openAs("usr-guardian");
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  assert.equal(await page.locator("#context-label").textContent(), "");
  assert.equal(await page.locator("#context-name").textContent(), "박지연 학부모");
  assert.equal(await page.locator(".workspace-context").evaluate((element) => getComputedStyle(element).borderRadius), "0px");
  assert.equal(await page.locator(".workspace-context").evaluate((element) => getComputedStyle(element).boxShadow), "none");

  async function connect(code) {
    await page.locator('[data-action="open-guardian-connect-modal"]').click();
    await page.locator("#invite-code").fill(code);
    await page.locator("#child-birth").fill("2012-05-18");
    await page.locator("#guardian-consent").check();
    await page.locator("#connect-form").evaluate((form) => form.requestSubmit());
  }

  await connect("MF-4821");
  await connect("MF-5932");
  await page.evaluate(() => {
    state.assessments.push(
      {
        id: "asm-bridge-growth-1",
        academyId: "acd-bridge",
        className: "중등 영어 B반",
        subject: "영어",
        title: "7월 1주 영어 평가",
        type: "weekly",
        scope: "Unit 5",
        testDate: "2026-07-05",
        maxScore: 100,
        attempts: [{ id: "atm-bridge-growth-1", studentId: "std-minjun", attemptNo: 1, status: "taken", score: 72 }]
      },
      {
        id: "asm-bridge-growth-2",
        academyId: "acd-bridge",
        className: "중등 영어 B반",
        subject: "국어",
        title: "7월 독해 평가",
        type: "weekly",
        scope: "독해",
        testDate: "2026-07-12",
        maxScore: 100,
        attempts: [{ id: "atm-bridge-growth-2", studentId: "std-minjun", attemptNo: 1, status: "taken", score: 75 }]
      },
      {
        id: "asm-bridge-growth-3",
        academyId: "acd-bridge",
        className: "중등 영어 B반",
        subject: "영어",
        title: "7월 3주 영어 평가",
        type: "weekly",
        scope: "Unit 6",
        testDate: "2026-07-20",
        maxScore: 100,
        attempts: [{ id: "atm-bridge-growth-3", studentId: "std-minjun", attemptNo: 1, status: "taken", score: 79 }]
      },
      {
        id: "asm-bridge-growth-4",
        academyId: "acd-bridge",
        className: "중등 영어 B반",
        subject: "영어",
        title: "7월 4주 영어 평가",
        type: "weekly",
        scope: "Unit 6 Review",
        testDate: "2026-07-22",
        maxScore: 100,
        attempts: [{ id: "atm-bridge-growth-4", studentId: "std-minjun", attemptNo: 1, status: "taken", score: 76 }]
      }
    );
    persistState();
  });
  assert.equal(await page.locator("#view-root > .guardian-hero").count(), 0);
  assert.match(await page.locator(".guardian-unread-badge").textContent(), /^읽지 않은 알림 \d+$/);
  const timelineScroll = await page.locator(".guardian-timeline-scroll").evaluate((element) => ({
    maxHeight: getComputedStyle(element).maxHeight,
    overflowY: getComputedStyle(element).overflowY,
    scrolls: element.scrollHeight > element.clientHeight
  }));
  assert.deepEqual(timelineScroll, { maxHeight: "600px", overflowY: "auto", scrolls: true });
  assert.deepEqual(
    await page.evaluate(() =>
      [...new Set(
        state.usageEvents
          .filter(
            (item) =>
              item.userId === "usr-guardian" &&
              item.type === "guardian.home_viewed"
          )
          .map((item) => item.academyId)
      )].sort()
    ),
    ["acd-bridge", "acd-dodam"]
  );
  assert.deepEqual(await page.locator("#guardian-academy-filter option").allTextContents(), [
    "모든 학원",
    "브릿지영어학원",
    "에듀수학학원"
  ]);
  await page.locator("#guardian-academy-filter").selectOption("acd-bridge");
  assert.deepEqual(
    [...new Set(await page.locator(".guardian-event .source-tag").allTextContents())],
    ["브릿지영어학원"]
  );

  await navigateTo(page, "growth");
  assert.equal(await page.locator("#view-root > .guardian-hero").count(), 0);
  const nationalIndicators = page.locator(".national-education-panel");
  let nationalIndicatorText = await nationalIndicators.innerText();
  assert.match(nationalIndicatorText, /국가 교육지표.*2025년.*중3.*국어.*64\.5%.*10\.8%.*수학.*49\.6%.*14\.9%.*영어.*60\.5%.*6\.5%/s);
  assert.match(nationalIndicatorText, /표집 25,992명 · 539개교 · 출처: 교육부·한국교육과정평가원/);
  assert.equal((nationalIndicatorText.match(/2025년/g) || []).length, 1);
  assert.doesNotMatch(nationalIndicatorText, /PUBLIC EDUCATION DATA|학생 개인과 비교하지 않는|우수·보통·기초/);
  assert.equal(await nationalIndicators.locator(".national-indicator").count(), 3);
  assert.equal(await nationalIndicators.locator(".national-stat-block").count(), 6);
  assert.equal(await nationalIndicators.locator(".national-stat-track").count(), 6);
  assert.match(await nationalIndicators.innerText(), /보통학력 이상/);
  assert.match(await nationalIndicators.innerText(), /기초학력 미달/);
  assert.equal(await nationalIndicators.locator('[data-grade="middle3"]').getAttribute("aria-selected"), "true");
  await nationalIndicators.locator('[data-grade="high2"]').click();
  nationalIndicatorText = await nationalIndicators.innerText();
  assert.match(nationalIndicatorText, /고2.*국어.*53\.0%.*10\.4%.*수학.*56\.2%.*11\.6%.*영어.*72\.8%.*6\.8%/s);
  assert.equal(await nationalIndicators.locator('[data-grade="high2"]').getAttribute("aria-selected"), "true");
  await nationalIndicators.locator('[data-grade="middle3"]').click();
  const educationSource = nationalIndicators.locator(".national-education-source a");
  assert.match(await educationSource.getAttribute("href"), /boardSeq=106502/);
  assert.equal(await educationSource.getAttribute("target"), "_blank");
  assert.equal(await page.locator(".national-education-panel + .guardian-growth-selector").count(), 1);
  assert.equal(await page.locator('input[name="guardian-growth-student"]').count(), 2);
  assert.equal(await page.locator(".guardian-growth-card").count(), 1);
  await page.locator('.guardian-growth-option:has(input[value="std-harin"])').click();
  const harinGrowth = page.locator(".guardian-growth-card");
  assert.match(await harinGrowth.innerText(), /정하린 성장 리포트/);
  assert.equal(await harinGrowth.locator(".growth-chart-point").count(), 3);
  assert.equal(await harinGrowth.locator(".growth-chart-line").count(), 1);
  assert.match(await harinGrowth.innerText(), /같은 학원·같은 과목 기록끼리 각각 선으로 연결합니다/);
  assert.equal(await harinGrowth.locator(".growth-chart-summary").count(), 0);
  assert.deepEqual(await harinGrowth.locator(".growth-point-change").allTextContents(), ["+6", "+7"]);
  assert.equal(await harinGrowth.locator(".growth-latest-ring").count(), 1);
  assert.deepEqual(
    await harinGrowth.locator(".growth-axis-value, .growth-point-score").evaluateAll((items) =>
      items.slice(0, 2).map((item) => getComputedStyle(item).fontSize)
    ),
    ["9px", "9px"]
  );
  assert.equal(await harinGrowth.locator(".growth-point-score").first().evaluate((item) => getComputedStyle(item).fontSize), "11px");
  const chartStartGap = await harinGrowth.locator(".growth-chart svg").evaluate((svg) => ({
    gridStart: Number(svg.querySelector(".growth-grid-line").getAttribute("x1")),
    firstPoint: Number(svg.querySelector(".growth-chart-point circle").getAttribute("cx"))
  }));
  assert.equal(chartStartGap.firstPoint - chartStartGap.gridStart >= 40, true);
  assert.equal(await harinGrowth.locator(".growth-chart-records").count(), 0);
  assert.match(await harinGrowth.innerText(), /\+7점/);
  assert.match(await harinGrowth.innerText(), /MoaFlow 학습 비교.*동일 학년·과목.*표본 부족/s);
  assert.equal(await page.locator('input[name="guardian-growth-student"][value="std-harin"]').isChecked(), true);
  await page.locator('.guardian-growth-option:has(input[value="std-minjun"])').click();
  const minjunGrowth = page.locator(".guardian-growth-card");
  assert.match(await minjunGrowth.innerText(), /정민준 성장 리포트.*연결 학원 2곳/s);
  assert.equal(await minjunGrowth.locator(".growth-chart-tabs button").count(), 3);
  assert.equal(await minjunGrowth.locator(".growth-chart.multi-line-chart .growth-chart-point").count(), 5);
  assert.equal(await minjunGrowth.locator(".growth-chart-line").count(), 1);
  assert.equal(await minjunGrowth.locator(".growth-chart-legend span").count(), 3);
  assert.equal(await minjunGrowth.locator(".growth-chart-summary").count(), 0);
  assert.deepEqual(await minjunGrowth.locator(".growth-point-change").allTextContents(), ["+7", "-3"]);
  assert.equal(await minjunGrowth.locator(".growth-latest-ring").count(), 3);
  await minjunGrowth.locator('[data-action="select-growth-academy"][data-academy-id="acd-bridge"]').click();
  assert.equal(await minjunGrowth.locator(".growth-subject-filters button").count(), 2);
  assert.equal(await minjunGrowth.locator(".growth-chart.line-chart .growth-chart-point").count(), 3);
  assert.equal(await minjunGrowth.locator(".growth-chart-line").count(), 1);
  assert.match(await minjunGrowth.innerText(), /브릿지영어학원의 영어 기록만 연결합니다/);
  assert.deepEqual(await minjunGrowth.locator(".growth-point-change").allTextContents(), ["+7", "-3"]);
  assert.match(await minjunGrowth.locator(".growth-report-entry").innerText(), /브릿지영어학원.*상세 확인/s);
  await minjunGrowth.locator('[data-action="open-growth-report"]').click();
  assert.match(await page.locator("#modal").innerText(), /정민준 학습 리포트.*브릿지영어학원 · 영어.*평가 기록.*3건.*72점 → 76점 · \+4점.*7월 1주 영어 평가.*7월 3주 영어 평가.*7월 4주 영어 평가/s);
  if (process.env.QA_SCREENSHOT_DIR) {
    await page.screenshot({ path: path.join(process.env.QA_SCREENSHOT_DIR, "guardian-growth-report-desktop.png"), fullPage: true });
  }
  await page.locator('[data-action="close-modal"]').click();
  if (process.env.QA_SCREENSHOT_DIR) {
    await page.screenshot({ path: path.join(process.env.QA_SCREENSHOT_DIR, "guardian-growth-line-desktop.png"), fullPage: true });
  }
  await minjunGrowth.locator('[data-action="select-growth-academy"][data-academy-id="all"]').click();
  if (process.env.QA_SCREENSHOT_DIR) {
    await page.waitForTimeout(3500);
    await page.screenshot({ path: path.join(process.env.QA_SCREENSHOT_DIR, "guardian-growth-desktop.png"), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator(".workspace").evaluate((element) => element.classList.remove("nav-open"));
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(process.env.QA_SCREENSHOT_DIR, "guardian-growth-mobile.png"), fullPage: true });
    await page.setViewportSize({ width: 1280, height: 900 });
  }

  await navigateTo(page, "comments");
  assert.equal(await page.locator("#view-root > .guardian-hero").count(), 0);
  assert.match(await page.locator("#view-root > .guardian-summary-strip").innerText(), /공유 코멘트 \d+/);
  await page.locator("#guardian-academy-filter").selectOption("all");
  assert.match(await page.locator("#view-root").innerText(), /스스로 질문하고 오답을 정리하는 힘/);
  assert.doesNotMatch(await page.locator("#view-root").innerText(), /수업 참여도와 질문 빈도/);

  await navigateTo(page, "notifications");
  assert.equal(await page.locator("#view-root > .guardian-hero").count(), 0);
  assert.match(await page.locator("#view-root > .guardian-summary-strip").innerText(), /읽지 않은 알림 \d+/);
  const notificationScroll = await page.locator(".guardian-notification-scroll").evaluate((element) => ({
    maxHeight: getComputedStyle(element).maxHeight,
    overflowY: getComputedStyle(element).overflowY,
    scrolls: element.scrollHeight > element.clientHeight
  }));
  assert.deepEqual(notificationScroll, { maxHeight: "600px", overflowY: "auto", scrolls: true });
  const notificationControlHeights = await page.locator(".guardian-notification-actions").evaluate((actions) => ({
    select: actions.querySelector("select").getBoundingClientRect().height,
    button: actions.querySelector("button").getBoundingClientRect().height
  }));
  assert.equal(notificationControlHeights.select, notificationControlHeights.button);
  assert.equal(await page.locator('[data-action="mark-all-notifications-read"]').evaluate((button) => button.parentElement.classList.contains("guardian-filters")), true);
  assert.equal(await page.locator(".guardian-notification-actions .guardian-filter-divider").count(), 1);
  const notificationScope = await page.evaluate(() => {
    const events = guardianNotificationEvents();
    return {
      types: [...new Set(events.map((item) => item.type))],
      onlyActionRequired: events.every((item) => {
        if (item.type === "출결") return ["지각 등원", "조퇴", "결석"].includes(item.title);
        if (item.type === "과제") return ["orange", "red"].includes(item.tone);
        return ["테스트", "코멘트", "답변"].includes(item.type);
      })
    };
  });
  assert.deepEqual(notificationScope.types.sort(), ["과제", "출결", "코멘트", "테스트"].sort());
  assert.equal(notificationScope.onlyActionRequired, true);
  assert.doesNotMatch(await page.locator("#view-root").innerText(), /정상 등원|일차함수 · 42~47쪽/);
  const before = await page.locator(".notification-item.unread").count();
  assert.ok(before > 0);
  await page.locator(".notification-item.unread").first().click();
  assert.equal(await page.locator(".notification-item.unread").count(), before - 1);
  await page.locator('[data-action="mark-all-notifications-read"]').click();
  assert.equal(await page.locator(".notification-item.unread").count(), 0);
  await navigateTo(page, "data");
  assert.equal(await page.locator("#view-root > .guardian-hero").count(), 0);
  assert.match(await page.locator("#view-root > .guardian-summary-strip").innerText(), /연결 자녀 2명.*유효 동의 3건/s);
  assert.deepEqual(errors, []);
  await context.close();
});

test("학부모와 학원은 공개 코멘트에서 답변을 주고받고 새 답변 알림을 확인한다", async () => {
  const { context, page } = await openAs("usr-guardian");
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  async function switchUser(userId) {
    await page.evaluate((id) => {
      session = { userId: id, verifiedAt: new Date().toISOString() };
      state.activeView = "home";
      persistSession();
      persistState();
      render();
    }, userId);
  }

  assert.ok(Number(await page.locator('[data-view="comments"] .nav-unread-count').textContent()) > 0);
  await navigateTo(page, "comments");
  const guardianComment = page
    .locator(".guardian-comment")
    .filter({ hasText: "스스로 질문하고 오답을 정리하는 힘" });
  assert.match(await guardianComment.innerText(), /새 메시지 1/);
  assert.equal(await guardianComment.locator(".unread-message").count(), 1);
  await guardianComment.locator('textarea[name="reply-body"]').fill("집에서도 오답 정리를 이어가겠습니다.");
  await guardianComment.locator(".comment-reply-form").evaluate((form) => form.requestSubmit());
  assert.match(await guardianComment.innerText(), /학부모 박지연/);
  assert.match(await guardianComment.innerText(), /집에서도 오답 정리를 이어가겠습니다/);
  assert.doesNotMatch(await guardianComment.innerText(), /새 메시지/);

  await switchUser("usr-owner");
  await navigateTo(page, "consultations");
  await page.locator('[data-action="select-consultation-student"][data-student-id="std-harin"]').click();
  const academyComment = page
    .locator(".consultation-item")
    .filter({ hasText: "스스로 질문하고 오답을 정리하는 힘" });
  assert.match(await academyComment.innerText(), /집에서도 오답 정리를 이어가겠습니다/);
  await academyComment.locator('textarea[name="reply-body"]').fill("다음 수업에서 오답 노트를 함께 확인하겠습니다.");
  await academyComment.locator(".comment-reply-form").evaluate((form) => form.requestSubmit());
  assert.match(await academyComment.innerText(), /원장 한도담/);

  await switchUser("usr-guardian");
  assert.equal(await page.locator('[data-view="comments"] .nav-unread-count').textContent(), "1");
  await navigateTo(page, "comments");
  assert.match(await page.locator("#view-root").innerText(), /다음 수업에서 오답 노트를 함께 확인하겠습니다/);
  assert.match(await guardianComment.innerText(), /새 메시지 1/);
  assert.match(await guardianComment.locator(".comment-reply.unread").innerText(), /오답 노트를 함께 확인/);
  assert.equal(
    await guardianComment.locator(".comment-reply.unread p").evaluate((element) => getComputedStyle(element).fontWeight),
    "800"
  );
  await guardianComment.locator('[data-action="mark-guardian-comment-read"]').click();
  assert.equal(await page.locator('[data-view="comments"] .nav-unread-count').count(), 0);
  assert.doesNotMatch(await guardianComment.innerText(), /새 메시지/);
  assert.equal(await guardianComment.locator(".comment-reply.unread").count(), 0);
  await navigateTo(page, "notifications");
  const replyNotification = page
    .locator(".notification-item")
    .filter({ hasText: "선생님 답변이 도착했습니다" });
  assert.equal(await replyNotification.count(), 1);
  assert.match(await replyNotification.innerText(), /오답 노트를 함께 확인/);
  assert.equal(await replyNotification.evaluate((element) => element.classList.contains("read")), true);

  const saved = await page.evaluate(() => ({
    replies: state.guardianCommentReplies,
    replyAudits: state.auditLogs.filter((item) => item.action === "consultation.reply_added")
  }));
  assert.deepEqual(saved.replies.map((item) => item.authorRole), ["guardian", "academy"]);
  assert.equal(saved.replyAudits.length, 2);
  assert.deepEqual(errors, []);
  await context.close();
});

test("강사는 담당 학생에게 공개 코멘트를 보내고 학부모 답변을 확인한다", async () => {
  const { context, page } = await openAs("usr-teacher");
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  async function switchUser(userId) {
    await page.evaluate((id) => {
      session = { userId: id, verifiedAt: new Date().toISOString() };
      state.activeView = "home";
      persistSession();
      persistState();
      render();
    }, userId);
  }

  assert.equal(await page.locator('[data-view="consultations"]').count(), 0);
  await navigateTo(page, "academy_comments");
  assert.equal(await page.locator(".academy-comment-hero").count(), 0);
  assert.doesNotMatch(await page.locator("#view-root").innerText(), /GUARDIAN COMMUNICATION/);
  assert.deepEqual(
    await page.locator(".academy-comment-directory-table tbody tr td:first-child").allTextContents(),
    ["정민준", "정하린"]
  );
  await page.locator('[data-action="select-academy-comment-student"][data-student-id="std-harin"]').click();
  await page
    .locator("#academy-comment-body")
    .fill("수업 집중도가 좋아졌고 스스로 질문하는 횟수가 늘었습니다.");
  await page.locator("#academy-comment-form").evaluate((form) => form.requestSubmit());
  assert.match(await page.locator("#view-root").innerText(), /수업 집중도가 좋아졌고/);

  await switchUser("usr-guardian");
  await navigateTo(page, "comments");
  const guardianComment = page
    .locator(".guardian-comment")
    .filter({ hasText: "수업 집중도가 좋아졌고" });
  await guardianComment.locator('textarea[name="reply-body"]').fill("가정에서도 질문 내용을 함께 확인하겠습니다.");
  await guardianComment.locator(".comment-reply-form").evaluate((form) => form.requestSubmit());

  await switchUser("usr-teacher");
  assert.equal(await page.locator('[data-view="academy_comments"] .nav-unread-count').textContent(), "1");
  await navigateTo(page, "academy_comments");
  const unreadDirectoryRow = page.locator('[data-directory-kind="academy-comment"][data-directory-status="unread"]');
  assert.equal(await unreadDirectoryRow.count(), 1);
  assert.match(await unreadDirectoryRow.innerText(), /정하린/);
  assert.match(await unreadDirectoryRow.innerText(), /1건/);
  assert.match(await unreadDirectoryRow.innerText(), /답변 확인 필요/);
  const academyComment = page
    .locator(".academy-comment-item")
    .filter({ hasText: "수업 집중도가 좋아졌고" });
  assert.match(await academyComment.innerText(), /새 답변 1/);
  assert.match(await academyComment.innerText(), /가정에서도 질문 내용을 함께 확인/);
  await academyComment.locator('[data-action="mark-academy-comment-read"]').click();
  assert.equal(await page.locator('[data-view="academy_comments"] .nav-unread-count').count(), 0);
  assert.doesNotMatch(await academyComment.innerText(), /새 답변/);
  await academyComment.locator('textarea[name="reply-body"]').fill("확인해주셔서 감사합니다.");
  await academyComment.locator(".comment-reply-form").evaluate((form) => form.requestSubmit());

  await switchUser("usr-guardian");
  await navigateTo(page, "notifications");
  assert.equal(
    await page
      .locator(".notification-item")
      .filter({ hasText: "확인해주셔서 감사합니다." })
      .count(),
    1
  );
  assert.deepEqual(errors, []);
  await context.close();
});

test("기존 저장 데이터는 schema v15 구조로 안전하게 변환된다", async () => {
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
    saved.academies.forEach((academy) => {
      delete academy.mainProgram;
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
    academyMainProgram: state.academies.find((item) => item.id === "acd-dodam").mainProgram,
    enrollments: state.enrollments,
    phaseThreeCollections: [
      state.homeworkAssignments,
      state.testSettings,
      state.assessments,
      state.consultationRecords
    ]
  }));
  assert.equal(result.schemaVersion, 15);
  assert.equal(result.studentHasStatus, false);
  assert.equal(result.assignment.id, "sca-teacher-math-advanced");
  assert.equal(result.assignment.className, "중등 수학 심화반");
  assert.equal(result.learning.homework, "");
  assert.equal(result.learning.specialNotes, "");
  assert.equal(result.academyMainProgram, "중등 수학 심화·내신 대비");
  assert.equal(result.enrollments.every((enrollment) => Array.isArray(enrollment.classHistory)), true);
  assert.equal(result.phaseThreeCollections.every((items) => Array.isArray(items) && items.length > 0), true);
  await context.close();
});

test("학생별 과제 예외를 저장하고 자동 통계에 반영한다", async () => {
  const { context, page } = await openAs("usr-teacher");
  await navigateTo(page, "homework");
  assert.deepEqual(
    await page.locator([
      ".homework-select-all-label > span",
      ".homework-table thead th:nth-child(2)",
      "#homework-bulk-status",
      ".homework-table thead th:nth-child(4)",
      "#homework-status-filter"
    ].join(", ")).evaluateAll((items) =>
      items.map((item) => [getComputedStyle(item).fontSize, getComputedStyle(item).fontWeight])
    ),
    [["12px", "700"], ["12px", "700"], ["12px", "700"], ["12px", "700"], ["12px", "700"]]
  );
  assert.deepEqual(
    await page.locator("#homework-selected-count").evaluate((item) => [
      getComputedStyle(item).fontSize,
      getComputedStyle(item).fontWeight
    ]),
    ["10px", "500"]
  );
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

  await navigateTo(page, "analytics");
  await page.locator("#analytics-student").selectOption("std-harin");
  assert.match(await page.locator("#view-root").innerText(), /과제 수행률/);
  assert.match(await page.locator("#view-root").innerText(), /0%/);
  await context.close();
});

test("원생 상세에서 해당 학생의 과제 수행 이력을 확인하고 관리한다", async () => {
  const { context, page } = await openAs("usr-owner");
  await navigateTo(page, "students");
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

  await navigateTo(page, "students");
  await page.locator('[data-action="open-student-detail"]').first().click();
  assert.match(await page.locator(".student-homework-panel").innerText(), /미제출/);
  assert.match(await page.locator(".student-homework-panel").innerText(), /다음 수업 확인/);
  await context.close();
});

test("선택한 학생의 과제 수행 상태를 일괄 변경하고 저장한다", async () => {
  const { context, page } = await openAs("usr-teacher");
  await navigateTo(page, "homework");
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
  await navigateTo(page, "students");
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

  await navigateTo(page, "students");
  await page.locator('[data-action="open-student-detail"]').first().click();
  assert.match(await page.locator(".student-test-panel").innerText(), /81\/100/);
  assert.match(await page.locator(".student-test-panel").innerText(), /1건/);
  await context.close();
});

test("테스트 결시와 재시험을 별도 시도로 보존하고 점수 수정이력을 남긴다", async () => {
  const { context, page } = await openAs("usr-owner");
  await navigateTo(page, "tests");
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
    "12px"
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
  await navigateTo(page, "analytics");
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
  await navigateTo(page, "students");
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
  await navigateTo(page, "analytics");

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
  await navigateTo(ownerPage, "students");
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

  await navigateTo(ownerPage, "students");
  await ownerPage.locator('[data-action="open-student-detail"]').first().click();
  assert.match(await ownerPage.locator(".student-consultation-panel").innerText(), /학생 상담/);
  assert.match(await ownerPage.locator(".student-consultation-panel").innerText(), /다음 주 계획 이행 확인/);
  await ownerSession.context.close();

  const teacherSession = await openAs("usr-teacher");
  const teacherPage = teacherSession.page;
  await navigateTo(teacherPage, "students");
  await teacherPage.locator('[data-action="open-student-detail"]').first().click();
  const protectedPanel = teacherPage.locator(".student-consultation-panel");
  assert.match(await protectedPanel.innerText(), /상담 기록을 열람할 권한이 없습니다/);
  assert.equal(await protectedPanel.locator('[data-action="open-student-consultations"]').count(), 0);
  assert.equal(await protectedPanel.locator('[data-action="open-student-comments"]').count(), 1);
  assert.doesNotMatch(await protectedPanel.innerText(), /최근 테스트 향상폭과 과제 수행 흐름/);
  await protectedPanel.locator('[data-action="open-student-comments"]').click();
  assert.equal(await teacherPage.locator("#page-title").textContent(), "학부모 소통");
  assert.equal(await teacherPage.locator("#academy-comment-student").inputValue(), "std-minjun");
  await teacherSession.context.close();
});

test("상담 내부 메모와 보호자 공유 요약을 분리해 저장한다", async () => {
  const { context, page } = await openAs("usr-owner");
  await navigateTo(page, "consultations");
  await page.locator("#consultation-directory-search").fill("정하린");
  assert.equal(await page.locator("#consultation-directory-count").textContent(), "1");
  assert.equal(await page.locator('[data-directory-kind="consultation"]:not(.hidden)').count(), 1);
  await page.locator('[data-action="select-consultation-student"][data-student-id="std-harin"]').click();
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
