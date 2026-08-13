const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const screenshotDirectory = process.env.QA_SCREENSHOT_DIR || "";
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
    const filePath = path.resolve(root, pathname === "/" ? "index.html" : pathname.slice(1));
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
  browser = await chromium.launch(process.platform === "win32" && fs.existsSync(chromePath) ? { executablePath: chromePath } : {});
  if (screenshotDirectory) fs.mkdirSync(screenshotDirectory, { recursive: true });
});

test.after(async () => {
  await browser?.close();
  await new Promise((resolve) => server?.close(resolve));
});

async function openAs(userId, viewport = { width: 1440, height: 1000 }) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript((id) => {
    sessionStorage.setItem("moaflow-foundation-session", JSON.stringify({ userId: id, verifiedAt: new Date().toISOString() }));
  }, userId);
  const page = await context.newPage();
  await page.goto(`${baseUrl}/?qa=large`, { waitUntil: "domcontentloaded" });
  await page.locator("#workspace:not(.hidden)").waitFor();
  return { context, page };
}

async function navigateTo(page, view) {
  const target = page.locator(`[data-view="${view}"]`);
  if (!(await target.isVisible())) {
    const groupToggle = page.locator(`[data-nav-group-container]:has([data-view="${view}"]) [data-nav-group]`);
    if (await groupToggle.count()) await groupToggle.click();
  }
  await target.click();
}

async function assertNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => ({ width: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  assert.ok(dimensions.scrollWidth <= dimensions.width + 1, `horizontal overflow: ${dimensions.scrollWidth} > ${dimensions.width}`);
}

async function capture(page, fileName) {
  if (!screenshotDirectory) return;
  await page.screenshot({ path: path.join(screenshotDirectory, fileName), fullPage: true });
}

test("대규모 QA 데이터는 요구 수량과 3개월 범위, 중복 학원 등록을 보장한다", async () => {
  const { context, page } = await openAs("qa-operator");
  const summary = await page.evaluate(() => {
    const classCounts = state.academies.map((academy) => new Set(
      state.enrollments.filter((item) => item.academyId === academy.id && item.status === "active").map((item) => item.className)
    ).size);
    const academyCountsByStudent = state.students.map((student) => new Set(
      state.enrollments.filter((item) => item.studentId === student.id).map((item) => item.academyId)
    ).size);
    const attendanceDates = state.attendanceRecords.map((item) => item.lessonDate).sort();
    const verifiedStudentIds = new Set(state.guardianLinks.filter((item) => item.status === "verified").map((item) => item.studentId));
    const pendingStudentIds = new Set(state.guardianLinks.filter((item) => item.status === "pending").map((item) => item.studentId));
    const linkedStudentIds = new Set(state.guardianLinks.map((item) => item.studentId));
    const childCounts = state.users.filter((item) => item.role === "guardian").map((guardian) => new Set(
      state.guardianLinks.filter((item) => item.guardianUserId === guardian.id).map((item) => item.studentId)
    ).size);
    return {
      academyCount: state.academies.length,
      ownerCount: state.users.filter((item) => item.role === "academy_owner").length,
      instructorCounts: state.academies.map((academy) => state.staffMemberships.filter((item) => item.academyId === academy.id && item.role === "academy_instructor").length),
      studentCount: state.students.length,
      guardianCount: state.users.filter((item) => item.role === "guardian").length,
      verifiedStudentCount: verifiedStudentIds.size,
      pendingStudentCount: pendingStudentIds.size,
      unlinkedStudentCount: state.students.filter((item) => !linkedStudentIds.has(item.id)).length,
      childCounts,
      classCounts,
      duplicateAcademyStudents: academyCountsByStudent.filter((count) => count >= 2).length,
      maximumAcademiesPerStudent: Math.max(...academyCountsByStudent),
      firstAttendanceDate: attendanceDates[0],
      lastAttendanceDate: attendanceDates.at(-1),
      attendanceCount: state.attendanceRecords.length,
      homeworkCount: state.homeworkAssignments.length,
      assessmentCount: state.assessments.length,
      consultationCount: state.consultationRecords.length,
      supportCount: state.supportRequests.length
    };
  });
  assert.equal(summary.academyCount, 30);
  assert.equal(summary.ownerCount, 30);
  assert.deepEqual([...new Set(summary.instructorCounts)].sort((a, b) => a - b), [0, 1, 2, 3, 4, 5]);
  assert.equal(summary.studentCount, 240);
  assert.equal(summary.guardianCount, 160);
  assert.equal(summary.verifiedStudentCount, 220);
  assert.equal(summary.pendingStudentCount, 10);
  assert.equal(summary.unlinkedStudentCount, 10);
  assert.deepEqual([...new Set(summary.childCounts)].sort((a, b) => a - b), [1, 2, 3]);
  assert.equal(Math.min(...summary.classCounts), 1);
  assert.equal(Math.max(...summary.classCounts), 10);
  assert.ok(summary.duplicateAcademyStudents >= 100);
  assert.ok(summary.maximumAcademiesPerStudent >= 3);
  assert.ok((new Date(summary.lastAttendanceDate) - new Date(summary.firstAttendanceDate)) / 86400000 >= 84);
  assert.ok(summary.attendanceCount > 5000);
  assert.ok(summary.homeworkCount > 1500);
  assert.ok(summary.assessmentCount > 500);
  assert.ok(summary.consultationCount > 100);
  assert.equal(summary.supportCount, 90);
  assert.equal(await page.locator("#qa-mode-banner").isVisible(), true);
  await context.close();
});

test("운영자는 30개 학원과 장문 문의 목록을 조회하고 스크롤할 수 있다", async () => {
  const { context, page } = await openAs("qa-operator");
  assert.equal(await page.locator(".academy-name-button").count(), 30);
  await navigateTo(page, "support");
  assert.equal(await page.locator(".support-card").count() > 10, true);
  const scrollContainers = await page.locator("#view-root").evaluate((root) => [...root.querySelectorAll("*")].filter((element) => {
    const style = getComputedStyle(element);
    return ["auto", "scroll"].includes(style.overflowY) && element.scrollHeight > element.clientHeight;
  }).length);
  assert.ok(scrollContainers >= 1);
  await assertNoHorizontalOverflow(page);
  await capture(page, "operator-support.png");
  await context.close();
});

test("원장과 강사는 다수 반·원생 데이터를 권한 범위에 맞게 조회한다", async () => {
  const owner = await openAs("qa-owner-008");
  await navigateTo(owner.page, "students");
  assert.ok(await owner.page.locator("[data-student-row]").count() >= 10);
  await navigateTo(owner.page, "attendance");
  assert.ok(await owner.page.locator("#attendance-class option").count() >= 2);
  await navigateTo(owner.page, "analytics");
  assert.ok(await owner.page.locator(".analytics-comparison-layout").count() >= 1);
  await assertNoHorizontalOverflow(owner.page);
  await capture(owner.page, "owner-analytics.png");
  await owner.context.close();

  const instructor = await openAs("qa-teacher-001");
  const access = await instructor.page.evaluate(() => ({
    academyId: currentAcademy().id,
    assignedClasses: [...assignedClassNames()],
    visibleEnrollmentCount: accessibleAcademyEnrollments().length,
    otherAcademyEnrollmentCount: accessibleAcademyEnrollments().filter((item) => item.academyId !== currentAcademy().id).length
  }));
  assert.ok(access.assignedClasses.length >= 1);
  assert.ok(access.visibleEnrollmentCount >= 1);
  assert.equal(access.otherAcademyEnrollmentCount, 0);
  await navigateTo(instructor.page, "students");
  await assertNoHorizontalOverflow(instructor.page);
  await instructor.context.close();
});

test("학부모는 다자녀와 중복 학원 기록을 분리해 성장 추이에서 확인한다", async () => {
  const { context, page } = await openAs("qa-guardian-001");
  const scope = await page.evaluate(() => {
    const result = guardianScope();
    return {
      studentCount: result.studentIds.length,
      academyCount: result.academyIds.length,
      firstChildAcademyCount: result.links.filter((item) => item.studentId === result.studentIds[0]).length
    };
  });
  assert.equal(scope.studentCount, 3);
  assert.ok(scope.academyCount >= 2);
  assert.ok(scope.firstChildAcademyCount >= 2);
  await navigateTo(page, "growth");
  assert.equal(await page.locator(".guardian-growth-option").count(), 3);
  assert.ok(await page.locator(".growth-chart-tabs [role=tab]").count() >= 3);
  const benchmark = await page.evaluate(() => {
    const studentId = guardianScope().studentIds[0];
    const snapshot = guardianChildSnapshot(studentId);
    return guardianMoaflowBenchmark(studentId, snapshot.scores.at(-1));
  });
  assert.ok(benchmark.cohortSize >= 30);
  assert.equal(benchmark.sampleLevel, "sufficient");
  assert.ok(Number.isFinite(benchmark.topPercent));
  await assertNoHorizontalOverflow(page);
  await capture(page, "guardian-growth.png");
  await context.close();
});

test("모바일에서도 QA 데이터 화면에 가로 넘침이 없다", async () => {
  for (const userId of ["qa-owner-001", "qa-guardian-001", "qa-operator"]) {
    const { context, page } = await openAs(userId, { width: 390, height: 844 });
    await assertNoHorizontalOverflow(page);
    await context.close();
  }
});
