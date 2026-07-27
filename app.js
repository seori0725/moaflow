const STORAGE_KEY = "moaflow-foundation-v1";
const SESSION_KEY = "moaflow-foundation-session";
const DEMO_CODE = "123456";

const roleMeta = {
  academy_owner: { label: "원장", context: "ACADEMY", title: "학원 시작하기" },
  academy_instructor: { label: "강사", context: "ACADEMY", title: "강사 로그인" },
  guardian: { label: "학부모", context: "PARENT", title: "학부모 시작하기" },
  operator: { label: "운영자", context: "OPERATOR", title: "운영자 로그인" }
};

const permissions = {
  academy_owner: [
    "academy.read",
    "academy.manage",
    "student.read",
    "student.manage",
    "invite.manage",
    "member.manage",
    "permission.manage",
    "attendance.manage",
    "learning.manage",
    "csv.import",
    "audit.read"
  ],
  academy_instructor: ["academy.read", "student.read", "attendance.manage", "learning.manage"],
  guardian: ["child.read", "connection.manage", "consent.manage"],
  operator: ["pilot.read", "audit.read", "request.manage"]
};

const initialState = {
  schemaVersion: 10,
  activeView: "home",
  selectedStudentId: null,
  users: [
    { id: "usr-owner", name: "한도담", phone: "010-1234-5678", role: "academy_owner", status: "active" },
    { id: "usr-teacher", name: "김선생", phone: "010-2222-3333", role: "academy_instructor", status: "active" },
    { id: "usr-guardian", name: "박지연", phone: "010-9876-5432", role: "guardian", status: "active" },
    { id: "usr-operator", name: "모아플로 운영", phone: "010-0000-0000", role: "operator", status: "active" }
  ],
  academies: [
    {
      id: "acd-dodam",
      name: "에듀수학학원",
      ownerUserId: "usr-owner",
      businessRegistrationNumber: "123-45-67890",
      phone: "02-123-4567",
      address: "서울시 마포구 월드컵로 12",
      pilotStatus: "active",
      createdAt: "2026-07-20T09:00:00+09:00"
    },
    {
      id: "acd-bridge",
      name: "브릿지영어학원",
      ownerUserId: "usr-owner-2",
      businessRegistrationNumber: "234-56-78901",
      phone: "02-765-4321",
      address: "서울시 마포구 성산로 42",
      pilotStatus: "pending",
      createdAt: "2026-07-22T10:00:00+09:00"
    }
  ],
  staffMemberships: [
    {
      id: "stm-owner",
      academyId: "acd-dodam",
      userId: "usr-owner",
      role: "academy_owner",
      grants: [],
      status: "active"
    },
    {
      id: "stm-teacher",
      academyId: "acd-dodam",
      userId: "usr-teacher",
      role: "academy_instructor",
      grants: ["student.manage"],
      status: "active"
    }
  ],
  staffClassAssignments: [
    {
      id: "sca-owner-math-advanced",
      academyId: "acd-dodam",
      userId: "usr-owner",
      className: "중등 수학 심화반"
    },
    {
      id: "sca-teacher-math-advanced",
      academyId: "acd-dodam",
      userId: "usr-teacher",
      className: "중등 수학 심화반"
    }
  ],
  students: [
    {
      id: "std-minjun",
      name: "정민준",
      birthDate: "2012-05-18",
      createdBy: "usr-owner",
      createdAt: "2026-07-20T10:00:00+09:00"
    },
    {
      id: "std-harin",
      name: "정하린",
      birthDate: "2014-09-02",
      createdBy: "usr-owner",
      createdAt: "2026-07-20T10:04:00+09:00"
    },
    {
      id: "std-jihoo",
      name: "오지후",
      birthDate: "2013-11-21",
      createdBy: "usr-owner",
      createdAt: "2026-07-20T10:07:00+09:00"
    }
  ],
  enrollments: [
    { id: "enr-1", academyId: "acd-dodam", studentId: "std-minjun", className: "중등 수학 심화반", startedAt: "2026-03-04", status: "active", classHistory: [] },
    { id: "enr-2", academyId: "acd-dodam", studentId: "std-harin", className: "중등 수학 심화반", startedAt: "2026-04-01", status: "active", classHistory: [] },
    { id: "enr-3", academyId: "acd-dodam", studentId: "std-jihoo", className: "중등 수학 기본반", startedAt: "2026-02-10", status: "paused", classHistory: [] },
    { id: "enr-4", academyId: "acd-bridge", studentId: "std-minjun", className: "중등 영어 B반", startedAt: "2026-05-12", status: "active", classHistory: [] }
  ],
  guardianLinks: [
    {
      id: "gln-1",
      guardianUserId: "usr-guardian",
      studentId: "std-harin",
      academyId: "acd-dodam",
      relationship: "부모",
      status: "verified",
      verifiedAt: "2026-07-21T14:30:00+09:00"
    }
  ],
  invitations: [
    {
      id: "inv-minjun",
      academyId: "acd-dodam",
      studentId: "std-minjun",
      code: "MF-4821",
      token: "secure-demo-token-minjun",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      maxUses: 1,
      usedAt: null,
      status: "sent",
      createdBy: "usr-owner",
      createdAt: "2026-07-24T09:10:00+09:00"
    },
    {
      id: "inv-harin",
      academyId: "acd-dodam",
      studentId: "std-harin",
      code: "MF-7710",
      token: "secure-demo-token-harin",
      expiresAt: "2026-07-25T09:10:00+09:00",
      maxUses: 1,
      usedAt: "2026-07-21T14:30:00+09:00",
      status: "accepted",
      createdBy: "usr-owner",
      createdAt: "2026-07-21T09:10:00+09:00"
    },
    {
      id: "inv-minjun-bridge",
      academyId: "acd-bridge",
      studentId: "std-minjun",
      code: "MF-5932",
      token: "secure-demo-token-minjun-bridge",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      maxUses: 1,
      usedAt: null,
      status: "sent",
      createdBy: "usr-owner-2",
      createdAt: "2026-07-27T09:30:00+09:00"
    }
  ],
  consents: [
    {
      id: "cns-1",
      guardianUserId: "usr-guardian",
      studentId: "std-harin",
      academyId: "acd-dodam",
      type: "guardian_link",
      version: "2026.07",
      status: "granted",
      method: "phone_verification",
      grantedAt: "2026-07-21T14:30:00+09:00"
    }
  ],
  csvImports: [
    {
      id: "csv-demo-1",
      academyId: "acd-dodam",
      fileName: "원생_초기등록.csv",
      totalRows: 3,
      importedRows: 3,
      errorRows: 0,
      skippedRows: 0,
      errorDetails: [],
      importedBy: "usr-owner",
      createdAt: "2026-07-20T10:08:00+09:00"
    }
  ],
  attendanceRecords: [
    { id: "att-1", academyId: "acd-dodam", studentId: "std-minjun", className: "중등 수학 심화반", lessonDate: "2026-07-27", status: "present", arrivalTime: "15:58", reason: "", checkedAt: "2026-07-27T15:58:00+09:00", checkedBy: "usr-teacher", history: [] },
    { id: "att-2", academyId: "acd-dodam", studentId: "std-harin", className: "중등 수학 심화반", lessonDate: "2026-07-27", status: "late", arrivalTime: "16:08", reason: "교통 지연", checkedAt: "2026-07-27T16:08:00+09:00", checkedBy: "usr-teacher", history: [] },
    { id: "att-bridge-1", academyId: "acd-bridge", studentId: "std-minjun", className: "중등 영어 B반", lessonDate: "2026-07-27", status: "present", arrivalTime: "17:55", reason: "", checkedAt: "2026-07-27T17:55:00+09:00", checkedBy: "usr-owner-2", history: [] }
  ],
  learningRecords: [
    {
      id: "lrn-1",
      academyId: "acd-dodam",
      className: "중등 수학 심화반",
      lessonDate: "2026-07-27",
      textbook: "개념원리 중2-1",
      unit: "일차함수",
      pages: "42~47쪽",
      content: "기울기의 의미를 그래프와 표로 비교했습니다.",
      homework: "유형 3번 1~10번 풀기",
      specialNotes: "다음 수업에 자와 색연필을 준비해주세요.",
      nextPlan: "일차함수 식 세우기와 유형 3번을 진행합니다.",
      createdBy: "usr-teacher",
      createdAt: "2026-07-27T18:02:00+09:00"
    },
    {
      id: "lrn-bridge-1",
      academyId: "acd-bridge",
      className: "중등 영어 B반",
      lessonDate: "2026-07-27",
      textbook: "Grammar Zone 2",
      unit: "Unit 6 Review",
      pages: "88~93쪽",
      content: "관계대명사 핵심 문장을 복습했습니다.",
      homework: "88~93쪽 오답 문장 다시 쓰기",
      specialNotes: "",
      nextPlan: "서술형 문장 완성 문제를 진행합니다.",
      createdBy: "usr-owner-2",
      createdAt: "2026-07-27T19:05:00+09:00"
    }
  ],
  usageEvents: [
    { id: "evt-1", academyId: "acd-dodam", userId: "usr-guardian", type: "guardian.home_viewed", createdAt: "2026-07-27T18:12:00+09:00" }
  ],
  auditLogs: [
    {
      id: "aud-1",
      academyId: "acd-dodam",
      actorUserId: "usr-owner",
      action: "invitation.created",
      targetType: "invitation",
      targetId: "inv-minjun",
      summary: "정민준 보호자 초대 발급",
      createdAt: "2026-07-24T09:10:00+09:00"
    },
    {
      id: "aud-2",
      academyId: "acd-dodam",
      actorUserId: "usr-guardian",
      action: "guardian_link.verified",
      targetType: "student",
      targetId: "std-harin",
      summary: "정하린 보호자 관계 확인",
      createdAt: "2026-07-21T14:30:00+09:00"
    },
    {
      id: "aud-3",
      academyId: "acd-dodam",
      actorUserId: "usr-owner",
      action: "staff.permission_changed",
      targetType: "staff_membership",
      targetId: "stm-teacher",
      summary: "김선생 원생 관리 권한 부여",
      createdAt: "2026-07-20T11:20:00+09:00"
    }
  ]
};

const navigation = {
  academy_owner: [
    ["home", "오늘 운영"],
    ["attendance", "출결 관리"],
    ["learning", "학습 기록"],
    ["students", "원생 관리"],
    ["academy", "학원 설정"],
    ["audit", "활동 기록"]
  ],
  academy_instructor: [
    ["home", "오늘 운영"],
    ["attendance", "출결 관리"],
    ["learning", "학습 기록"],
    ["students", "원생 관리"],
    ["permissions", "권한 확인"]
  ],
  guardian: [
    ["home", "자녀 통합 홈"],
    ["data", "내 정보·동의"]
  ],
  operator: [
    ["home", "파일럿 지표"],
    ["pilots", "파일럿 학원"],
    ["data", "공통 데이터 구조"],
    ["audit", "전체 감사 이력"]
  ]
};

let state = loadState();
let session = loadSession();
let selectedAuthRole = "academy_owner";
let verificationInterval = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeMissingById(current, defaults) {
  const items = current || [];
  return [...items, ...clone(defaults).filter((item) => !items.some((entry) => entry.id === item.id))];
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved) return clone(initialState);
    return {
      ...saved,
      schemaVersion: 10,
      selectedStudentId: null,
      students: saved.students.map(({ status: _legacyStatus, ...student }) =>
        student.id === "std-minjun" && student.name === "김민준" ? { ...student, name: "정민준" } : student
      ),
      academies: saved.academies.map((academy) => ({
        ...academy,
        businessRegistrationNumber:
          academy.businessRegistrationNumber ||
          initialState.academies.find((item) => item.id === academy.id)?.businessRegistrationNumber ||
          ""
      })),
      staffClassAssignments: (saved.staffClassAssignments || clone(initialState.staffClassAssignments)).map((item) =>
        item.id === "sca-teacher-math-basic"
          ? { ...item, id: "sca-teacher-math-advanced", className: "중등 수학 심화반" }
          : item
      ),
      csvImports: (saved.csvImports || clone(initialState.csvImports)).map((item) => ({
        ...item,
        skippedRows: item.skippedRows || 0,
        errorDetails: item.errorDetails || []
      })),
      guardianLinks: (saved.guardianLinks || []).map((link) => ({
        ...link,
        academyId:
          link.academyId ||
          saved.invitations?.find(
            (invitation) => invitation.studentId === link.studentId && invitation.status === "accepted"
          )?.academyId ||
          saved.enrollments.find((enrollment) => enrollment.studentId === link.studentId)?.academyId ||
          null
      })),
      consents: (saved.consents || []).map((consent) => ({
        ...consent,
        academyId:
          consent.academyId ||
          saved.guardianLinks?.find(
            (link) =>
              link.guardianUserId === consent.guardianUserId &&
              link.studentId === consent.studentId
          )?.academyId ||
          saved.invitations?.find(
            (invitation) => invitation.studentId === consent.studentId && invitation.status === "accepted"
          )?.academyId ||
          null
      })),
      attendanceRecords: mergeMissingById(saved.attendanceRecords, initialState.attendanceRecords).map((record) => ({
        ...record,
        arrivalTime: record.arrivalTime || (record.checkedAt ? new Date(record.checkedAt).toTimeString().slice(0, 5) : ""),
        reason: record.reason || "",
        history: record.history || []
      })),
      learningRecords: mergeMissingById(saved.learningRecords, initialState.learningRecords).map((record) => ({
        ...record,
        homework: record.homework || "",
        specialNotes: record.specialNotes || ""
      })),
      usageEvents: saved.usageEvents || clone(initialState.usageEvents),
      invitations: mergeMissingById(saved.invitations, initialState.invitations).map((invitation) =>
        ["MF-4821", "MF-5932"].includes(invitation.code) &&
        invitation.status === "sent" &&
        new Date(invitation.expiresAt).getTime() < Date.now()
          ? { ...invitation, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }
          : invitation
      ),
      auditLogs: saved.auditLogs.map((log) => {
        const actorMembership = saved.staffMemberships.find(
          (membership) => membership.userId === log.actorUserId && membership.status === "active"
        );
        const targetInvitation = saved.invitations.find((invitation) => invitation.id === log.targetId);
        const targetEnrollment = saved.enrollments.find((enrollment) => enrollment.studentId === log.targetId);
        return {
          ...log,
          summary: log.summary?.replaceAll("김민준", "정민준"),
          academyId:
            log.academyId ||
            actorMembership?.academyId ||
            targetInvitation?.academyId ||
            targetEnrollment?.academyId ||
            null
        };
      }),
      enrollments: saved.enrollments.map((enrollment) => {
        if (enrollment.startedAt) {
          return { ...enrollment, classHistory: enrollment.classHistory || [] };
        }
        const student = saved.students.find((item) => item.id === enrollment.studentId);
        return {
          ...enrollment,
          startedAt: student?.createdAt?.slice(0, 10) || "2026-07-20",
          classHistory: enrollment.classHistory || []
        };
      })
    };
  } catch {
    return clone(initialState);
  }
}

function loadSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function persistSession() {
  if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else sessionStorage.removeItem(SESSION_KEY);
}

function currentUser() {
  return state.users.find((user) => user.id === session?.userId);
}

function currentRole() {
  return currentUser()?.role || null;
}

function currentAcademy() {
  const membership = state.staffMemberships.find((item) => item.userId === currentUser()?.id && item.status === "active");
  return state.academies.find((academy) => academy.id === membership?.academyId) || state.academies[0];
}

function userById(id) {
  return state.users.find((user) => user.id === id);
}

function userRoleName(user) {
  if (!user) return "시스템";
  return `${roleMeta[user.role]?.label || ""} ${user.name}`.trim();
}

function auditActionLabel(action) {
  return (
    {
      "auth.login_succeeded": "로그인 완료",
      "auth.signed_out": "로그아웃",
      "academy.updated": "학원 정보 수정",
      "student.created": "원생 등록",
      "enrollment.class_changed": "반 변경",
      "csv.imported": "CSV 원생 등록",
      "attendance.saved": "출결 저장",
      "learning.saved": "학습기록 저장",
      "invitation.created": "보호자 초대 발급",
      "guardian_link.verified": "보호자 연결 완료",
      "staff.permission_changed": "구성원 권한 변경",
      "privacy.rights_requested": "개인정보 요청 접수"
    }[action] || "기타 활동"
  );
}

function studentById(id) {
  return state.students.find((student) => student.id === id);
}

function academyById(id) {
  return state.academies.find((academy) => academy.id === id);
}

function koreaDate(value = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(value);
}

function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function assignedClassNames(user = currentUser()) {
  if (!user || user.role !== "academy_instructor") return null;
  return new Set(
    state.staffClassAssignments
      .filter(
        (item) =>
          item.academyId === currentAcademy().id &&
          item.userId === user.id
      )
      .map((item) => item.className)
  );
}

function accessibleAcademyEnrollments() {
  const academyId = currentAcademy().id;
  const assigned = assignedClassNames();
  return state.enrollments.filter(
    (item) =>
      item.academyId === academyId &&
      (!assigned || assigned.has(item.className))
  );
}

function activeInvitationFor(studentId, academyId) {
  return state.invitations.find(
    (item) =>
      item.studentId === studentId &&
      item.academyId === academyId &&
      item.status === "sent" &&
      new Date(item.expiresAt).getTime() >= Date.now()
  );
}

function createInvitationCode() {
  let code;
  do {
    code = `MF-${String(Math.floor(1000 + Math.random() * 9000))}`;
  } while (state.invitations.some((item) => item.code === code));
  return code;
}

function hasPermission(permission) {
  const user = currentUser();
  if (!user) return false;
  const base = permissions[user.role] || [];
  if (base.includes(permission)) return true;
  const membership = state.staffMemberships.find((item) => item.userId === user.id && item.status === "active");
  return membership?.grants?.includes(permission) || false;
}

function addAudit(action, targetType, targetId, summary, academyId = null) {
  const actorMembership = state.staffMemberships.find(
    (membership) => membership.userId === currentUser()?.id && membership.status === "active"
  );
  state.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    academyId: academyId || actorMembership?.academyId || null,
    actorUserId: currentUser()?.id || "system",
    action,
    targetType,
    targetId,
    summary,
    createdAt: new Date().toISOString()
  });
}

function trackUsageOnce(type, academyId = null) {
  const marker = `${type}:${currentUser()?.id}:${koreaDate()}`;
  if (sessionStorage.getItem(marker)) return;
  state.usageEvents.push({
    id: `evt-${Date.now()}`,
    academyId,
    userId: currentUser()?.id,
    type,
    createdAt: new Date().toISOString()
  });
  sessionStorage.setItem(marker, "1");
  persistState();
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function maskPhone(phone) {
  return phone?.replace(/(\d{3})-(\d{4})-(\d{4})/, "$1-****-$3") || "—";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toast(message, type = "default") {
  const region = document.querySelector("#toast-region");
  const node = document.createElement("div");
  node.className = `toast ${type === "error" ? "error" : ""}`;
  node.textContent = message;
  region.append(node);
  window.setTimeout(() => node.remove(), 3200);
}

function setAuthRole(role) {
  selectedAuthRole = role;
  document.querySelectorAll("[data-auth-role]").forEach((button) => {
    const active = button.dataset.authRole === role;
    button.classList.toggle("active", active);
    button.setAttribute("aria-checked", String(active));
  });

  const demoPhones = {
    academy_owner: "010-1234-5678",
    academy_instructor: "010-2222-3333",
    guardian: "010-9876-5432",
    operator: "010-0000-0000"
  };
  document.querySelector("#phone").value = demoPhones[role];
}

function showPhoneStep() {
  document.querySelector("#auth-role-step").classList.add("hidden");
  document.querySelector("#auth-phone-step").classList.remove("hidden");
  document.querySelector("#auth-form-title").textContent = roleMeta[selectedAuthRole].title;
  document.querySelector("#phone").focus();
}

function showRoleStep() {
  clearInterval(verificationInterval);
  document.querySelector("#auth-phone-step").classList.add("hidden");
  document.querySelector("#auth-role-step").classList.remove("hidden");
  document.querySelector("#verification-wrap").classList.add("hidden");
  document.querySelector("#verification-code").value = "";
}

function requestVerification() {
  const phone = document.querySelector("#phone").value.trim();
  if (!/^010-\d{4}-\d{4}$/.test(phone)) {
    toast("휴대전화 번호 형식을 확인해주세요.", "error");
    return;
  }

  document.querySelector("#verification-wrap").classList.remove("hidden");
  document.querySelector("#verification-code").focus();
  toast("인증번호를 발송했습니다. 데모에서는 123456을 입력하세요.");

  clearInterval(verificationInterval);
  let remaining = 179;
  const timer = document.querySelector("#verification-timer");
  timer.textContent = "02:59";
  verificationInterval = window.setInterval(() => {
    remaining -= 1;
    const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
    const seconds = String(remaining % 60).padStart(2, "0");
    timer.textContent = `${minutes}:${seconds}`;
    if (remaining <= 0) {
      clearInterval(verificationInterval);
      timer.textContent = "만료";
    }
  }, 1000);
}

function completeLogin(event) {
  event.preventDefault();
  const code = document.querySelector("#verification-code").value.trim();
  if (code !== DEMO_CODE) {
    toast("인증번호가 일치하지 않습니다.", "error");
    return;
  }

  const user = state.users.find((item) => item.role === selectedAuthRole);
  session = { userId: user.id, verifiedAt: new Date().toISOString() };
  state.activeView = selectedAuthRole === "academy_instructor" ? "students" : "home";
  addAudit("auth.login_succeeded", "user", user.id, `${user.name} 휴대전화 로그인`);
  persistSession();
  persistState();
  clearInterval(verificationInterval);
  render();
  toast(`${user.name}님, 안전하게 로그인됐습니다.`);
}

function signOut() {
  if (currentUser()) addAudit("auth.signed_out", "user", currentUser().id, `${currentUser().name} 로그아웃`);
  persistState();
  session = null;
  persistSession();
  document.querySelector("#workspace").classList.remove("nav-open");
  showRoleStep();
  render();
}

function render() {
  const loggedIn = Boolean(currentUser());
  document.querySelector("#auth-screen").classList.toggle("hidden", loggedIn);
  document.querySelector("#workspace").classList.toggle("hidden", !loggedIn);
  if (!loggedIn) return;

  renderShell();
  renderView();
}

function renderShell() {
  const user = currentUser();
  const role = user.role;
  const academy = currentAcademy();
  const accountBadge = roleMeta[role].label;
  document.body.dataset.role = role;
  document.querySelector("#account-name").textContent = user.name;
  document.querySelector("#account-avatar").textContent = accountBadge;
  document.querySelector("#account-avatar").setAttribute("aria-label", `${accountBadge} ${user.name}`);
  document.querySelector("#context-label").textContent = roleMeta[role].context;
  const contextName = document.querySelector("#context-name");
  contextName.classList.toggle("academy-name", role.startsWith("academy"));
  contextName.removeAttribute("aria-label");

  if (role.startsWith("academy")) {
    document.querySelector("#context-label").textContent = "";
    contextName.textContent = academy.name;
    document.querySelector("#context-detail").textContent = "";
  } else if (role === "guardian") {
    const linked = new Set(
      state.guardianLinks
        .filter((link) => link.guardianUserId === user.id && link.status === "verified")
        .map((link) => link.studentId)
    ).size;
    contextName.textContent = `${user.name} 학부모`;
    document.querySelector("#context-detail").textContent = `연결 자녀 ${linked}명`;
  } else {
    contextName.textContent = "파일럿 운영";
    document.querySelector("#context-detail").textContent = `학원 ${state.academies.length}곳`;
  }

  const allowedViews = navigation[role];
  if (!allowedViews.some(([id]) => id === state.activeView)) state.activeView = allowedViews[0][0];
  document.querySelector("#main-nav").innerHTML = allowedViews
    .map(
      ([id, label]) => `
        <button class="nav-item ${state.activeView === id ? "active" : ""}" data-view="${id}">
          ${label}
        </button>`
    )
    .join("");
}

function setPage(_eyebrow, title) {
  document.querySelector("#page-title").textContent = title;
  document.querySelector(".topbar").classList.remove("detail-page");
}

function renderView() {
  const role = currentRole();
  const root = document.querySelector("#view-root");
  const views = {
    home: () => renderHome(role),
    academy: renderAcademy,
    attendance: renderAttendance,
    learning: renderLearning,
    students: renderStudents,
    permissions: renderPermissions,
    pilots: renderPilots,
    data: renderData,
    audit: renderAudit
  };
  root.innerHTML = views[state.activeView]?.() || renderHome(role);
}

function renderHome(role) {
  if (role === "guardian") return renderGuardianHome();
  if (role === "operator") return renderOperatorHome();

  setPage("학원 운영", "오늘 운영");
  const academy = currentAcademy();
  const academyEnrollments = accessibleAcademyEnrollments();
  const activeEnrollments = academyEnrollments.filter((item) => item.status === "active");
  const classNames = [...new Set(activeEnrollments.map((item) => item.className))];
  const today = koreaDate();
  const attendance = state.attendanceRecords.filter(
    (item) => item.academyId === academy.id && item.lessonDate === today
  );
  const learning = state.learningRecords.filter(
    (item) => item.academyId === academy.id && item.lessonDate === today
  );
  const connectedStudentIds = new Set(
    state.guardianLinks
      .filter((item) => item.status === "verified" && item.academyId === academy.id)
      .map((item) => item.studentId)
  );
  const connected = academyEnrollments.filter((item) => connectedStudentIds.has(item.studentId)).length;
  const attendanceRate = Math.round((attendance.length / Math.max(activeEnrollments.length, 1)) * 100);

  return `
    <section class="hero-panel">
      <div>
        <p class="eyebrow eyebrow-accent">TODAY · CORE FLOW</p>
        <h2>${escapeHtml(academy.name)}의 오늘 업무를 이어가세요</h2>
        <p>CSV 원생 등록부터 출결·학습기록, 보호자 연결까지 한 흐름에서 처리합니다.</p>
      </div>
      <div class="hero-progress"><strong>${attendanceRate}%</strong><span>오늘 출결 처리율</span></div>
    </section>

    <section class="grid four horizontal-metrics">
      ${metricCard("오늘 수업", `${classNames.length}개 반`, "", false, true)}
      ${metricCard("출결 처리", `${attendance.length}/${activeEnrollments.length}`, "", true)}
      ${metricCard("학습기록", `${learning.length}/${classNames.length}`, "", false)}
      ${metricCard("보호자 연결", `${connected}/${academyEnrollments.length}`, "")}
    </section>

    <article class="panel">
      <div class="panel-head"><div><h2>반별 운영 현황</h2><p>미처리 항목에서 바로 이어서 입력할 수 있습니다.</p></div>${hasPermission("csv.import") ? '<button class="button secondary compact" data-action="open-csv-modal">CSV 가져오기</button>' : ""}</div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>반</th><th>원생</th><th>출결</th><th>학습기록</th><th>바로가기</th></tr></thead>
          <tbody>
            ${classNames.map((className) => {
              const classEnrollments = activeEnrollments.filter((item) => item.className === className);
              const classAttendance = attendance.filter((item) => item.className === className).length;
              const classLearning = learning.some((item) => item.className === className);
              return `<tr>
                <td><strong>${escapeHtml(className)}</strong></td>
                <td>${classEnrollments.length}명</td>
                <td><span class="badge ${classAttendance === classEnrollments.length ? "green" : "orange"}">${classAttendance}/${classEnrollments.length}</span></td>
                <td><span class="badge ${classLearning ? "green" : "gray"}">${classLearning ? "입력 완료" : "미입력"}</span></td>
                <td><div class="row-actions"><button class="button tertiary compact" data-view-target="attendance">출결</button><button class="button tertiary compact" data-view-target="learning">학습</button></div></td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function formatDate(value) {
  return value ? koreaDate(new Date(value)) : "—";
}

function academyClassNames() {
  return [...new Set(
    accessibleAcademyEnrollments()
      .filter((item) => item.status === "active")
      .map((item) => item.className)
  )];
}

function renderAttendance() {
  setPage("학원 운영", "출결 관리");
  const academy = currentAcademy();
  const classes = academyClassNames();
  if (!classes.length) {
    return '<article class="panel"><div class="empty-state">담당 반에 출결을 입력할 재원 원생이 없습니다.</div></article>';
  }
  const className = classes.includes(state.selectedClassName) ? state.selectedClassName : classes[0];
  const lessonDate = state.selectedLessonDate || koreaDate();
  const filter = state.attendanceFilter || "all";
  const enrollments = state.enrollments.filter(
    (item) => item.academyId === academy.id && item.className === className && item.status === "active"
  );
  const records = state.attendanceRecords.filter(
    (item) => item.academyId === academy.id && item.className === className && item.lessonDate === lessonDate
  );
  const statusCount = (status) => records.filter((item) => item.status === status).length;
  const visibleEnrollments = filter === "unprocessed"
    ? enrollments.filter((item) => !records.some((record) => record.studentId === item.studentId))
    : enrollments;
  const completionRate = Math.round((records.length / Math.max(enrollments.length, 1)) * 100);
  const lastSavedAt = records.map((item) => item.checkedAt).filter(Boolean).sort().at(-1);
  const statusLabel = (status) =>
    ({ present: "출석", late: "지각", absent: "결석", early_leave: "조퇴" })[status] || "미처리";
  const statusTone = (status) =>
    status === "present" ? "green" : ["late", "early_leave"].includes(status) ? "orange" : status === "absent" ? "red" : "gray";

  return `
    <section class="grid four horizontal-metrics">
      ${metricCard("출석", statusCount("present"), "")}
      ${metricCard("지각", statusCount("late"), "", true)}
      ${metricCard("결석·조퇴", statusCount("absent") + statusCount("early_leave"), "")}
      ${metricCard("처리 완료율", `${completionRate}%`, "")}
    </section>
    <article class="panel">
      <div class="panel-head">
        <div><h2>반별 출결 체크</h2><p>전체 출석을 기본으로 처리하고 지각·결석·조퇴 학생만 수정합니다.</p></div>
        <div class="compact-filters">
          <select id="attendance-class" aria-label="반 선택">${classes.map((item) => `<option ${item === className ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select>
          <input id="attendance-date" type="date" value="${lessonDate}" aria-label="수업일 선택" />
        </div>
      </div>
      <form id="attendance-form">
        <div class="attendance-toolbar">
          <label class="bulk-check"><input id="attendance-select-all" type="checkbox" checked /> 전체 선택</label>
          <div class="attendance-filters">
            <button class="tab-button ${filter === "all" ? "active" : ""}" type="button" data-action="attendance-filter" data-filter="all">전체 ${enrollments.length}</button>
            <button class="tab-button ${filter === "unprocessed" ? "active" : ""}" type="button" data-action="attendance-filter" data-filter="unprocessed">미처리 ${Math.max(enrollments.length - records.length, 0)}</button>
          </div>
          <div class="row-actions">
            <button class="button secondary compact" type="button" data-action="bulk-attendance" data-status="present">선택 출석</button>
            <button class="button secondary compact" type="button" data-action="bulk-attendance" data-status="late">선택 지각</button>
            <button class="button secondary compact" type="button" data-action="bulk-attendance" data-status="absent">선택 결석</button>
            <button class="button secondary compact" type="button" data-action="bulk-attendance" data-status="early_leave">선택 조퇴</button>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table attendance-table">
            <thead><tr><th>선택</th><th>학생</th><th>현재 상태</th><th>등원 시각</th><th>출석 상태</th><th>사유·메모</th><th>수정 이력</th></tr></thead>
            <tbody>
              ${visibleEnrollments.map((enrollment) => {
                const student = studentById(enrollment.studentId);
                const record = records.find((item) => item.studentId === enrollment.studentId);
                const status = record?.status || "present";
                return `<tr>
                  <td><input class="attendance-row-check" type="checkbox" data-student-id="${student.id}" checked aria-label="${escapeHtml(student.name)} 선택" /></td>
                  <td><strong>${escapeHtml(student.name)}</strong></td>
                  <td><span class="badge ${statusTone(record?.status)}">${statusLabel(record?.status)}</span></td>
                  <td><input class="attendance-time" name="arrival-${student.id}" type="time" value="${escapeHtml(record?.arrivalTime || "")}" aria-label="${escapeHtml(student.name)} 등원 시각" /></td>
                  <td>
                    <select class="attendance-status-select" name="attendance-${student.id}" aria-label="${escapeHtml(student.name)} 출석 상태">
                      <option value="present" ${status === "present" ? "selected" : ""}>출석</option>
                      <option value="late" ${status === "late" ? "selected" : ""}>지각</option>
                      <option value="absent" ${status === "absent" ? "selected" : ""}>결석</option>
                      <option value="early_leave" ${status === "early_leave" ? "selected" : ""}>조퇴</option>
                    </select>
                  </td>
                  <td><input class="attendance-reason" name="reason-${student.id}" value="${escapeHtml(record?.reason || "")}" placeholder="지각·결석·조퇴 사유" aria-label="${escapeHtml(student.name)} 출결 사유" /></td>
                  <td>${record?.history?.length ? `<button class="button tertiary compact" type="button" data-action="view-attendance-history" data-record-id="${record.id}">${record.history.length}건 보기</button>` : '<span class="muted-cell">변경 없음</span>'}</td>
                </tr>`;
              }).join("") || '<tr><td colspan="7"><div class="empty-state">미처리 학생이 없습니다.</div></td></tr>'}
            </tbody>
          </table>
        </div>
        <input type="hidden" name="class-name" value="${escapeHtml(className)}" />
        <input type="hidden" name="lesson-date" value="${lessonDate}" />
        <div class="attendance-save-bar">
          <div><strong>${lastSavedAt ? "보호자 반영 완료" : "저장 대기"}</strong><small>${lastSavedAt ? `${formatDateTime(lastSavedAt)} 마지막 저장` : "저장하면 연결된 보호자 홈에 즉시 표시됩니다."}</small></div>
          <button class="button primary" type="submit">저장 · 보호자 홈에 반영</button>
        </div>
      </form>
    </article>
  `;
}

function renderLearning() {
  setPage("학원 운영", "학습 기록");
  const classes = academyClassNames();
  if (!classes.length) {
    return '<article class="panel"><div class="empty-state">담당 반에 학습기록을 입력할 재원 원생이 없습니다.</div></article>';
  }
  const className = classes.includes(state.selectedClassName) ? state.selectedClassName : classes[0];
  const lessonDate = state.selectedLessonDate || koreaDate();
  const existing = state.learningRecords.find(
    (item) => item.academyId === currentAcademy().id && item.className === className && item.lessonDate === lessonDate
  );
  const previous = state.learningRecords
    .filter((item) => item.academyId === currentAcademy().id && item.className === className && item.lessonDate < lessonDate)
    .sort((a, b) => b.lessonDate.localeCompare(a.lessonDate))[0];
  const value = (key) => escapeHtml(existing?.[key] || "");

  return `
    <article class="panel">
      <div class="panel-head">
        <div><h2>일별 학습기록</h2><p>교재·진도·수업내용을 한 번 입력하면 연결된 학부모 홈에 표시됩니다.</p></div>
        <div class="compact-filters">
          <select id="learning-class" aria-label="반 선택">${classes.map((item) => `<option ${item === className ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select>
          <input id="learning-date" type="date" value="${lessonDate}" aria-label="수업일 선택" />
        </div>
      </div>
      <form id="learning-form">
        <div class="learning-layout">
          <div class="form-grid">
            <div><label for="learning-textbook">교재</label><input id="learning-textbook" name="textbook" required value="${value("textbook")}" placeholder="예: 개념원리 중2-1" /></div>
            <div><label for="learning-unit">단원</label><input id="learning-unit" name="unit" required value="${value("unit")}" placeholder="예: 일차함수" /></div>
            <div class="full"><label for="learning-pages">페이지·진도</label><input id="learning-pages" name="pages" required value="${value("pages")}" placeholder="예: 42~47쪽" /></div>
            <div class="full"><label for="learning-content">오늘 학습내용</label><textarea id="learning-content" name="content" required>${value("content")}</textarea></div>
            <div class="full"><label for="learning-homework">과제 <span class="optional-label">선택</span></label><textarea id="learning-homework" name="homework" placeholder="예: 유형 3번 1~10번 풀기 · 과제 없음">${value("homework")}</textarea></div>
            <div class="full"><label for="learning-special-notes">특이사항 <span class="optional-label">선택</span></label><textarea id="learning-special-notes" name="special-notes" placeholder="반 공통 공지, 준비물, 보강 안내 등을 입력합니다.">${value("specialNotes")}</textarea></div>
            <div class="full"><label for="learning-next-plan">다음 계획</label><textarea id="learning-next-plan" name="next-plan" required>${value("nextPlan")}</textarea></div>
          </div>
          <aside class="quick-panel">
            <strong>빠른 작성</strong>
            <p>${previous ? `${escapeHtml(previous.lessonDate)} 기록을 불러올 수 있습니다.` : "이전 학습기록이 없습니다."}</p>
            <button class="button secondary block" type="button" data-action="load-previous-learning" ${previous ? "" : "disabled"}>이전 기록 불러오기</button>
            <div class="notice">이번 단계는 일별 원본 저장까지만 지원합니다. 자동 주·월 통계는 다음 개발 단계입니다.</div>
          </aside>
        </div>
        <input type="hidden" name="class-name" value="${escapeHtml(className)}" />
        <input type="hidden" name="lesson-date" value="${lessonDate}" />
        <div class="form-actions"><button class="button primary" type="submit">${existing ? "수정 저장" : "학습기록 저장"}</button></div>
      </form>
    </article>
  `;
}

function guardianConnectionForm() {
  return `
    <form id="connect-form" class="invite-code-form">
      <label for="invite-code">초대 코드</label>
      <input id="invite-code" name="invite-code" placeholder="예: MF-4821" value="MF-4821" autocomplete="off" />
      <div class="form-grid">
        <div><label for="child-birth">자녀 생년월일</label><input id="child-birth" name="child-birth" type="date" value="2012-05-18" /></div>
        <div><label for="relationship">자녀와의 관계</label><select id="relationship" name="relationship"><option>부모</option><option>조부모</option><option>법정대리인</option></select></div>
      </div>
      <div class="consent-box">
        <input id="guardian-consent" name="guardian-consent" type="checkbox" />
        <label for="guardian-consent">필수 확인 및 동의<small>서비스 이용과 자녀 정보 연결에 필요한 항목을 확인했습니다.</small></label>
      </div>
      <button class="button primary block" type="submit" style="margin-top:16px;">확인하고 연결하기</button>
      <p class="field-hint">데모: 새 자녀 MF-4821 · 새 학원 MF-5932 · 생년월일 2012-05-18</p>
    </form>`;
}

function openGuardianConnectModal() {
  openModal(`
    <header><div><h2 id="modal-title">자녀·학원 연결</h2><p>새 자녀 또는 기존 자녀의 새 학원 초대 코드를 연결합니다.</p></div><button class="icon-button" data-action="close-modal" aria-label="닫기">×</button></header>
    ${guardianConnectionForm()}`);
}

function renderGuardianHome() {
  setPage("PARENT", "자녀 통합 홈");
  const academyLinks = state.guardianLinks.filter(
    (item) => item.guardianUserId === currentUser().id && item.status === "verified"
  );
  const childLinks = [...new Map(academyLinks.map((item) => [item.studentId, item])).values()];
  const linkedPairs = new Set(academyLinks.map((item) => `${item.studentId}:${item.academyId}`));
  const events = [
    ...state.attendanceRecords
      .filter((item) => linkedPairs.has(`${item.studentId}:${item.academyId}`))
      .map((item) => {
        const enrollment = state.enrollments.find(
          (entry) => entry.academyId === item.academyId && entry.studentId === item.studentId
        );
        const statusLabel =
          item.status === "present"
            ? "정상 등원"
            : item.status === "late"
              ? "지각 등원"
              : item.status === "early_leave"
                ? "조퇴"
                : "결석";
        return {
          studentId: item.studentId,
          type: "출결",
          tone: item.status === "absent" ? "red" : ["late", "early_leave"].includes(item.status) ? "orange" : "green",
          title: statusLabel,
          detail: `${enrollment?.className || item.className}${item.arrivalTime ? ` · ${item.arrivalTime}` : ""}${item.reason ? ` · ${item.reason}` : ""}`,
          academyId: item.academyId,
          createdAt: item.checkedAt
        };
      }),
    ...state.learningRecords.flatMap((item) => {
      const targetEnrollments = state.enrollments.filter(
        (entry) =>
          entry.academyId === item.academyId &&
          entry.className === item.className &&
          linkedPairs.has(`${entry.studentId}:${entry.academyId}`)
      );
      return targetEnrollments.map((entry) => ({
        studentId: entry.studentId,
        type: "학습",
        tone: "green",
        title: `${escapeHtml(item.unit)} · ${escapeHtml(item.pages)}`,
        detail: [
          item.content,
          item.homework ? `과제 ${item.homework}` : "",
          item.specialNotes ? `특이사항 ${item.specialNotes}` : ""
        ].filter(Boolean).join(" · "),
        academyId: item.academyId,
        createdAt: item.createdAt
      }));
    })
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  trackUsageOnce("guardian.home_viewed", academyLinks[0]?.academyId || null);

  return `
    <section class="hero-panel">
      <div>
        <p class="eyebrow eyebrow-accent">CHILD TIMELINE</p>
        <h2>${childLinks.length ? "자녀들의 학원 소식을 한곳에서 확인하세요" : "초대 코드를 연결해주세요"}</h2>
        <p>연결된 학원의 출결과 일별 학습기록을 시간순으로 모아 보여드립니다.</p>
      </div>
      <div class="hero-progress"><strong>${events.length}</strong><span>새 학원 소식</span></div>
    </section>
    ${childLinks.length ? `
      <section>
        <div class="section-heading">
          <div><h2>오늘 한눈에</h2><p>자녀별로 구분해 놓치는 소식 없이 확인합니다.</p></div>
          <div class="section-heading-actions">
            <span class="badge green">연결 자녀 ${childLinks.length}명</span>
            <button class="button secondary compact" data-action="open-guardian-connect-modal">자녀·학원 추가 연결</button>
          </div>
        </div>
        <div class="child-timeline-grid">
          ${childLinks.map((link) => {
            const student = studentById(link.studentId);
            const childEvents = events.filter((item) => item.studentId === link.studentId);
            const academyIds = new Set(
              academyLinks
                .filter((item) => item.studentId === link.studentId)
                .map((item) => item.academyId)
            );
            return `
              <article class="panel child-timeline-card">
                <header class="child-card-head">
                  <div class="child-identity"><h3>${escapeHtml(student?.name || "자녀")}</h3><span class="child-academy-count">연결 학원 ${academyIds.size}곳</span></div>
                  <span class="child-event-count"><strong>${childEvents.length}</strong><small>오늘 소식</small></span>
                </header>
                <div class="timeline-list">
                  ${childEvents.length ? childEvents.map((item) => `
                    <div class="timeline-event">
                      <span class="source-tag">${escapeHtml(academyById(item.academyId)?.name || "학원")}</span>
                      <div><strong>${item.title}</strong><small>${escapeHtml(item.detail)} · ${formatDateTime(item.createdAt)}</small></div>
                      <span class="badge ${item.tone}">${item.type}</span>
                    </div>
                  `).join("") : '<div class="empty-state">아직 도착한 출결·학습 소식이 없습니다.</div>'}
                </div>
              </article>`;
          }).join("")}
        </div>
      </section>
    ` : ""}
      ${!childLinks.length ? `<article class="panel guardian-connect-panel">
        <div class="panel-head"><div><h2>자녀·학원 연결</h2><p>학원에서 받은 초대 코드로 자녀 또는 새 학원을 연결합니다.</p></div></div>
        ${guardianConnectionForm()}
      </article>` : ""}
  `;
}

function renderOperatorHome() {
  setPage("OPERATOR", "파일럿 지표");
  const active = state.academies.filter((item) => item.pilotStatus === "active").length;
  const activeEnrollments = state.enrollments.filter((item) => item.status === "active");
  const today = koreaDate();
  const activeEnrollmentKeys = new Set(
    activeEnrollments.map((item) => `${item.academyId}:${item.studentId}`)
  );
  const attendanceInputs = new Set(
    state.attendanceRecords
      .filter(
        (item) =>
          item.lessonDate === today &&
          activeEnrollmentKeys.has(`${item.academyId}:${item.studentId}`)
      )
      .map((item) => `${item.academyId}:${item.studentId}`)
  );
  const attendanceInputRate = Math.round(
    (attendanceInputs.size / Math.max(activeEnrollmentKeys.size, 1)) *
      100
  );
  const classKeys = new Set(activeEnrollments.map((item) => `${item.academyId}:${item.className}`));
  const learningInputs = new Set(
    state.learningRecords
      .filter(
        (item) =>
          item.lessonDate === today &&
          classKeys.has(`${item.academyId}:${item.className}`)
      )
      .map((item) => `${item.academyId}:${item.className}`)
  );
  const learningInputRate = Math.round(
    (learningInputs.size / Math.max(classKeys.size, 1)) *
      100
  );
  const verifiedLinks = state.guardianLinks.filter((item) => item.status === "verified").length;
  const homeViews = state.usageEvents.filter((item) => item.type === "guardian.home_viewed").length;

  return `
    <section class="hero-panel">
      <div>
        <p class="eyebrow eyebrow-accent">MINIMUM FULL FLOW</p>
        <h2>파일럿의 전체 흐름 전환을 확인합니다</h2>
        <p>CSV 등록, 출결·학습 입력, 보호자 연결과 통합 홈 조회가 실제로 이어지는지 확인합니다.</p>
      </div>
      <div class="hero-progress"><strong>${active}</strong><span>활성 학원</span></div>
    </section>
    <section class="grid four horizontal-metrics">
      ${metricCard("CSV 등록", state.csvImports.reduce((sum, item) => sum + item.importedRows, 0), `${state.csvImports.length}회 가져오기`)}
      ${metricCard("출결 입력률", `${attendanceInputRate}%`, "재원 원생 기준", true)}
      ${metricCard("학습기록률", `${learningInputRate}%`, "운영 반 기준")}
      ${metricCard("통합 홈 조회", homeViews, `보호자 연결 ${verifiedLinks}건`)}
    </section>
    <article class="panel">
      <div class="panel-head"><div><h2>학원별 핵심 흐름</h2><p>운영자는 원본을 수정하지 않고 단계별 완료 상태만 확인합니다.</p></div><button class="button tertiary compact" data-view-target="pilots">학원 계정 보기</button></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>학원</th><th>CSV 원생</th><th>출결 입력</th><th>학습기록</th><th>보호자 연결</th><th>상태</th></tr></thead>
          <tbody>
            ${state.academies.map((academy) => {
              const enrollments = state.enrollments.filter((item) => item.academyId === academy.id);
              const studentIds = new Set(enrollments.map((item) => item.studentId));
              const attendance = state.attendanceRecords.filter((item) => item.academyId === academy.id).length;
              const learning = state.learningRecords.filter((item) => item.academyId === academy.id).length;
              const links = state.guardianLinks.filter(
                (item) => item.status === "verified" && item.academyId === academy.id && studentIds.has(item.studentId)
              ).length;
              const isHealthy = enrollments.length > 0 && attendance > 0 && learning > 0 && links > 0;
              return `<tr>
                <td><strong>${escapeHtml(academy.name)}</strong></td>
                <td>${enrollments.length}명</td>
                <td>${attendance}건</td>
                <td>${learning}건</td>
                <td>${links}건</td>
                <td><span class="badge ${isHealthy ? "green" : "orange"}">${isHealthy ? "전체 흐름 확인" : "진행 필요"}</span></td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function metricCard(label, value, hint, accent = false, textual = false) {
  return `<article class="metric-card ${accent ? "accent" : ""} ${textual ? "textual" : ""}"><span>${label}</span><strong>${value}</strong>${hint ? `<small>${escapeHtml(hint)}</small>` : ""}</article>`;
}

function statusSummaryCard(label, items, accent = false) {
  return `
    <article class="metric-card status-summary ${accent ? "accent" : ""}">
      <span>${escapeHtml(label)}</span>
      <div class="summary-items">
        ${items
          .map(
            (item) => `
              <div class="summary-item ${item.tone}">
                <strong>${item.value}</strong>
                <small>${escapeHtml(item.label)}</small>
              </div>`
          )
          .join("")}
      </div>
    </article>`;
}

function checkItem(title, detail) {
  return `<div class="check-item"><span class="check-mark">✓</span><div><strong>${escapeHtml(title)}</strong><small>${escapeHtml(detail)}</small></div></div>`;
}

function auditItems(logs) {
  if (!logs.length) return '<div class="empty-state">기록이 없습니다.</div>';
  return logs
    .map((log) => {
      const actor = userById(log.actorUserId);
      const actorRole = actor ? roleMeta[actor.role]?.label || "사용자" : "시스템";
      return `
        <div class="activity-item">
          <span class="activity-icon activity-role">${escapeHtml(actorRole)}</span>
          <div><strong>${escapeHtml(log.summary)}</strong><small>${escapeHtml(userRoleName(actor))} · ${formatDateTime(log.createdAt)}</small></div>
        </div>`;
    })
    .join("");
}

function renderAcademy() {
  setPage("학원 관리", "학원 설정");
  const academy = currentAcademy();
  return `
      <article class="panel academy-profile-panel">
        <div class="panel-head"><div><h2>학원 기본 정보</h2><p>학원 운영에 사용하는 기본 정보를 관리합니다.</p></div></div>
        <div class="form-grid">
          <div class="full"><label for="academy-name">학원명</label><input id="academy-name" value="${escapeHtml(academy.name)}" /></div>
          <div class="full"><label for="academy-business-number">사업자등록번호</label><input id="academy-business-number" value="${escapeHtml(academy.businessRegistrationNumber)}" inputmode="numeric" maxlength="12" placeholder="000-00-00000" /></div>
          <div><label for="academy-phone">대표번호</label><input id="academy-phone" value="${escapeHtml(academy.phone)}" /></div>
          <div><label for="academy-owner">대표자</label><input id="academy-owner" value="${escapeHtml(userById(academy.ownerUserId)?.name || "한도담")}" disabled /></div>
          <div class="full"><label for="academy-address">주소</label><input id="academy-address" value="${escapeHtml(academy.address)}" /></div>
        </div>
        <div class="form-actions"><button class="button primary" data-action="save-academy">학원 정보 저장</button></div>
      </article>
    ${renderPermissionsContent(true)}
  `;
}

function relationshipMap() {
  const academy = currentAcademy();
  const enrollmentCount = state.enrollments.filter((item) => item.academyId === academy.id).length;
  const linkCount = new Set(
    state.guardianLinks
      .filter((item) => item.status === "verified" && item.academyId === academy.id)
      .map((item) => item.guardianUserId)
  ).size;
  return `
    <div class="relationship-map">
      <div class="relation-node"><strong>${escapeHtml(academy.name)}</strong><span>academy · 원본 소유</span></div>
      <div class="relation-arrow">→</div>
      <div class="relation-node"><strong>원생 ${enrollmentCount}명</strong><span>enrollment · 재원 관계</span></div>
      <div class="relation-arrow">←</div>
      <div class="relation-node"><strong>보호자 ${linkCount}명</strong><span>guardian_link · 관계 확인</span></div>
    </div>`;
}

function renderStudents() {
  if (state.selectedStudentId) return renderStudentDetail(state.selectedStudentId);

  setPage(currentRole() === "academy_owner" ? "학원 운영" : "담당 원생", "원생 관리");
  const academy = currentAcademy();
  const enrollments = accessibleAcademyEnrollments();
  const canManage = hasPermission("student.manage");
  const canInvite = hasPermission("invite.manage");
  const currentMonth = koreaDate().slice(0, 7);
  const newThisMonth = enrollments.filter(
    (item) => studentById(item.studentId)?.createdAt?.slice(0, 7) === currentMonth
  ).length;
  const activeCount = enrollments.filter((item) => item.status === "active").length;
  const pausedCount = enrollments.filter((item) => item.status === "paused").length;
  const linkedCount = enrollments.filter((item) =>
    state.guardianLinks.some(
      (link) =>
        link.studentId === item.studentId &&
        link.academyId === academy.id &&
        link.status === "verified"
    )
  ).length;
  const pendingCount = enrollments.filter((item) =>
    Boolean(activeInvitationFor(item.studentId, academy.id))
  ).length;
  const unlinkedCount = enrollments.length - linkedCount - pendingCount;
  return `
    <section class="student-summary-grid">
      ${statusSummaryCard("전체 원생", [
        { label: "등록 원생", value: enrollments.length, tone: "blue" },
        { label: "이번 달 신규", value: newThisMonth, tone: "green" }
      ])}
      ${statusSummaryCard("재원 현황", [
        { label: "재원", value: activeCount, tone: "green" },
        { label: "휴원", value: pausedCount, tone: "purple" }
      ])}
      ${statusSummaryCard(
        "보호자 연결 관리",
        [
          { label: "연결 완료", value: linkedCount, tone: "green" },
          { label: "초대 대기", value: pendingCount, tone: "orange" },
          { label: "미연결", value: unlinkedCount, tone: "gray" }
        ],
        true
      )}
    </section>
    <article class="panel">
      <div class="panel-head">
        <div><h2>전체 원생</h2></div>
        ${canManage ? '<div class="row-actions"><button class="button secondary compact" data-action="open-csv-modal">CSV 가져오기</button><button class="button primary compact" data-action="open-student-modal">원생 등록</button></div>' : ""}
      </div>
      <div class="table-wrap">
        <table class="data-table student-table">
          <colgroup>
            <col class="col-student" />
            <col class="col-birth" />
            <col class="col-started" />
            <col class="col-class" />
            <col class="col-status" />
            <col class="col-guardian" />
            <col class="col-connection" />
            <col class="col-manage" />
          </colgroup>
          <thead><tr><th>원생</th><th>생년월일</th><th>첫 등원일</th><th>반</th><th>재원 상태</th><th>보호자 정보</th><th>연결 관리</th><th>관리</th></tr></thead>
          <tbody>
            ${enrollments
              .map((enrollment) => {
                const student = studentById(enrollment.studentId);
                const link = state.guardianLinks.find(
                  (item) =>
                    item.studentId === student.id &&
                    item.academyId === academy.id &&
                    item.status === "verified"
                );
                const guardian = link ? userById(link.guardianUserId) : null;
                const invite = activeInvitationFor(student.id, academy.id);
                return `
                  <tr>
                    <td><strong>${escapeHtml(student.name)}</strong></td>
                    <td>${escapeHtml(student.birthDate)}</td>
                    <td>${escapeHtml(enrollment.startedAt)}</td>
                    <td>${escapeHtml(enrollment.className)}</td>
                    <td><span class="badge ${enrollment.status === "active" ? "green" : "purple"}">${enrollment.status === "active" ? "재원" : "휴원"}</span></td>
                    <td>
                      ${
                        guardian
                          ? `<div class="cell-stack"><strong>${escapeHtml(guardian.name)}</strong><small>${maskPhone(guardian.phone)}</small></div>`
                          : '<span class="muted-cell">연결 후 표시</span>'
                      }
                    </td>
                    <td>
                      <div class="connection-cell">
                        ${
                          link
                            ? '<span class="badge green">연결 완료</span>'
                            : invite?.status === "sent"
                              ? '<span class="badge orange">초대 대기</span>'
                              : '<span class="badge gray">미연결</span>'
                        }
                        ${
                          canInvite && !link
                            ? `<button class="button secondary compact connection-action" data-action="invite-guardian" data-student-id="${student.id}">${invite?.status === "sent" ? "초대 확인" : "초대 발급"}</button>`
                            : ""
                        }
                      </div>
                    </td>
                    <td>
                      <button class="button tertiary compact" data-action="open-student-detail" data-student-id="${student.id}">원생 상세</button>
                    </td>
                  </tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function renderStudentDetail(studentId) {
  const student = studentById(studentId);
  const academy = currentAcademy();
  const enrollment = accessibleAcademyEnrollments().find((item) => item.studentId === studentId);
  if (!student || !enrollment) {
    state.selectedStudentId = null;
    return renderStudents();
  }

  const link = state.guardianLinks.find(
    (item) =>
      item.studentId === studentId &&
      item.academyId === academy.id &&
      item.status === "verified"
  );
  const guardian = link ? userById(link.guardianUserId) : null;
  const invite = activeInvitationFor(studentId, academy.id);
  const canInvite = hasPermission("invite.manage");
  const canManage = hasPermission("student.manage");
  const assigned = assignedClassNames();
  const availableClassNames = [...new Set([
    enrollment.className,
    ...state.enrollments
      .filter(
        (item) =>
          item.academyId === academy.id &&
          (!assigned || assigned.has(item.className))
      )
      .map((item) => item.className)
  ])];
  const classHistory = [...(enrollment.classHistory || [])].sort(
    (a, b) => new Date(b.changedAt) - new Date(a.changedAt)
  );
  const latestClassChange = classHistory[0];
  const relatedAudits = state.auditLogs.filter(
    (item) =>
      item.academyId === academy.id &&
      (item.targetId === studentId ||
        (item.targetType === "invitation" &&
          state.invitations.some((entry) => entry.id === item.targetId && entry.studentId === studentId)))
  );

  setPage("원생 관리", "원생 관리");
  document.querySelector(".topbar").classList.add("detail-page");
  return `
    <div class="detail-toolbar">
      <button class="text-button" data-action="back-to-students">← 전체 원생으로</button>
      <div class="row-actions">
        ${
          canInvite && !link
            ? `<button class="button primary compact" data-action="invite-guardian" data-student-id="${student.id}">${invite?.status === "sent" ? "초대 확인" : "보호자 초대"}</button>`
            : ""
        }
      </div>
    </div>

    <div class="student-detail-heading">
      <h2>${escapeHtml(student.name)}</h2>
      <span class="badge ${enrollment.status === "active" ? "green" : "purple"}">${enrollment.status === "active" ? "재원" : "휴원"}</span>
    </div>

    <section class="grid four horizontal-metrics">
      ${metricCard("생년월일", student.birthDate, "", false, true)}
      ${metricCard("첫 등원일", enrollment.startedAt, "", false, true)}
      ${metricCard("소속 반", enrollment.className, "", false, true)}
      ${metricCard("보호자 연결", link ? "완료" : invite?.status === "sent" ? "초대 대기" : "미연결", "", !link, true)}
    </section>

    <section class="grid two">
      <article class="panel">
        <div class="panel-head"><div><h2>원생 기본정보</h2></div></div>
        <dl class="detail-list">
          <div><dt>원생명</dt><dd>${escapeHtml(student.name)}</dd></div>
          <div><dt>생년월일</dt><dd>${escapeHtml(student.birthDate)}</dd></div>
          <div><dt>반</dt><dd>${escapeHtml(enrollment.className)}</dd></div>
          <div><dt>첫 등원일</dt><dd>${escapeHtml(enrollment.startedAt)}</dd></div>
          <div><dt>재원 상태</dt><dd>${enrollment.status === "active" ? "재원" : "휴원"}</dd></div>
          ${latestClassChange ? `<div><dt>최근 반 변경일</dt><dd>${formatDate(latestClassChange.changedAt)}</dd></div>` : ""}
        </dl>
        ${
          canManage
            ? `<div class="class-change-control">
                <div><label for="student-class-change">반 변경</label><small>과거 출결·학습기록은 기존 반으로 유지됩니다.</small></div>
                <select id="student-class-change">${availableClassNames
                  .map(
                    (className) =>
                      `<option value="${escapeHtml(className)}" ${className === enrollment.className ? "selected" : ""}>${escapeHtml(className)}</option>`
                  )
                  .join("")}</select>
                <button class="button secondary compact" data-action="change-student-class" data-student-id="${student.id}">변경 저장</button>
              </div>`
            : ""
        }
        ${
          classHistory.length
            ? `<section class="class-history-section">
                <h3>반 변경 이력</h3>
                <div class="class-history-list">${classHistory
                  .map(
                    (item) => `<div class="class-history-item">
                      <span>${formatDate(item.changedAt)}</span>
                      <strong>${escapeHtml(item.previousClassName)} → ${escapeHtml(item.nextClassName)}</strong>
                      <small>${escapeHtml(userById(item.changedBy)?.name || "사용자")} 변경</small>
                    </div>`
                  )
                  .join("")}</div>
              </section>`
            : ""
        }
      </article>

      <article class="panel">
        <div class="panel-head"><div><h2>보호자 연결</h2><p>본인확인과 관계 확인을 마친 연결만 표시합니다.</p></div></div>
        ${
          link
            ? `<div class="list-card">
                <div><strong>${escapeHtml(guardian?.name || "확인된 보호자")}</strong><small>${maskPhone(guardian?.phone)} · 관계 ${escapeHtml(link.relationship)} · ${formatDateTime(link.verifiedAt)} 확인</small></div>
                <span class="badge green">연결 완료</span>
              </div>`
            : `<div class="empty-state compact-empty">
                <strong>${invite?.status === "sent" ? "보호자 초대 대기 중" : "연결된 보호자가 없습니다."}</strong>
                <span>${invite?.status === "sent" ? `${invite.code} · ${formatDateTime(invite.expiresAt)} 만료` : "초대를 발급해 보호자 연결을 시작하세요."}</span>
              </div>`
        }
      </article>
    </section>

    <article class="panel">
      <div class="panel-head"><div><h2>원생 관련 이력</h2><p>등록·초대·연결 변경을 추적합니다.</p></div></div>
      <div class="activity-list">${auditItems(relatedAudits)}</div>
    </article>
  `;
}

function renderPermissions() {
  const isOwner = currentRole() === "academy_owner";
  setPage(isOwner ? "구성원 관리" : "내 권한", isOwner ? "구성원·권한" : "권한 확인");
  return renderPermissionsContent(isOwner);
}

function renderPermissionsContent(isOwner) {
  const members = state.staffMemberships
    .filter((item) => item.academyId === currentAcademy().id)
    .map((item) => ({ ...item, user: userById(item.userId) }));
  const permissionRows = [
    ["academy.manage", "학원 정보 관리", "학원 기본정보 수정"],
    ["student.manage", "원생 관리", "원생 등록·수정"],
    ["attendance.manage", "출결 관리", "반별 출결 입력"],
    ["learning.manage", "학습 기록", "일별 수업내용 입력"],
    ["csv.import", "CSV 가져오기", "원생 일괄 등록"],
    ["invite.manage", "보호자 초대", "보안 링크 발급"],
    ["permission.manage", "권한 관리", "구성원 위임"],
    ["audit.read", "활동 기록", "변경 내역 조회"]
  ];
  const instructor = members.find((item) => item.role === "academy_instructor");
  const instructorName = instructor?.user?.name || "강사";
  return `
    <section class="grid two">
      <article class="panel">
        <div class="panel-head"><div><h2>학원 구성원</h2></div></div>
        <div class="card-list">
          ${members
            .map((member) => {
              const assignedClasses = state.staffClassAssignments
                .filter(
                  (item) =>
                    item.academyId === currentAcademy().id &&
                    item.userId === member.userId
                )
                .map((item) => item.className);
              return `
                <div class="list-card staff-member-card">
                  <span class="staff-role-label ${member.role === "academy_owner" ? "owner" : "instructor"}">${roleMeta[member.role].label}</span>
                  <div class="staff-member-info">
                    <strong>${escapeHtml(member.user.name)}</strong>
                    <span class="staff-phone">${maskPhone(member.user.phone)}</span>
                    <div class="staff-assignments">
                      <small>담당 반</small>
                      ${
                        assignedClasses.length
                          ? assignedClasses
                              .map((className) => `<span class="class-chip">${escapeHtml(className)}</span>`)
                              .join("")
                          : '<span class="class-chip empty">미배정</span>'
                      }
                    </div>
                  </div>
                </div>`;
            })
            .join("")}
        </div>
      </article>
      <article class="panel">
        <div class="panel-head"><div><h2>권한 설정</h2><p>${isOwner ? `${escapeHtml(instructorName)}에게 필요한 권한만 선택해 허용합니다.` : "내 계정에 현재 적용된 접근 범위입니다."}</p></div></div>
        <div class="permission-grid">
          <div class="permission-row header"><span>권한</span><span>원장</span><span>${isOwner ? escapeHtml(instructorName) : "내 권한"}</span></div>
          ${permissionRows
            .map(([key, label, detail]) => {
              const instructorAllowed = permissions.academy_instructor.includes(key) || instructor?.grants?.includes(key);
              const myAllowed = hasPermission(key);
              return `
                <div class="permission-row">
                  <div class="permission-name"><strong>${label}</strong><small>${detail}</small></div>
                  <span class="permission-state allowed">항상 허용</span>
                  ${
                    isOwner
                      ? `<button class="switch ${instructorAllowed ? "on" : ""}" data-action="toggle-permission" data-permission="${key}" aria-label="${label} ${instructorAllowed ? "회수" : "부여"}"></button>`
                      : `<span class="permission-state ${myAllowed ? "allowed" : "denied"}">${myAllowed ? "허용" : "제한"}</span>`
                  }
                </div>`;
            })
            .join("")}
        </div>
      </article>
    </section>
  `;
}

function permissionLabel(key) {
  return (
    {
      "academy.read": "학원 정보 조회",
      "academy.manage": "학원 정보 관리",
      "student.read": "원생 조회",
      "student.manage": "원생 관리",
      "attendance.manage": "출결 관리",
      "learning.manage": "학습 기록",
      "csv.import": "CSV 가져오기",
      "invite.manage": "보호자 초대",
      "member.manage": "구성원 관리",
      "permission.manage": "권한 위임",
      "audit.read": "활동 기록 조회"
    }[key] || key
  );
}

function renderPilots() {
  setPage("PILOT ACCOUNT", "파일럿 학원");
  return `
    <section class="grid three horizontal-metrics">
      ${metricCard("전체 학원", state.academies.length, "파일럿 계정")}
      ${metricCard("인증 완료", state.academies.filter((item) => item.pilotStatus === "active").length, "운영 가능")}
      ${metricCard("확인 필요", state.academies.filter((item) => item.pilotStatus !== "active").length, "운영자 검토", true)}
    </section>
    <article class="panel">
      <div class="panel-head"><div><h2>학원 계정 상태</h2><p>운영자는 상태를 확인하되 학원 원본은 직접 수정하지 않습니다.</p></div></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>학원</th><th>연락처</th><th>등록일</th><th>파일럿</th><th>원생</th></tr></thead>
          <tbody>
            ${state.academies
              .map(
                (academy) => `
                <tr>
                  <td><div class="cell-stack"><strong>${escapeHtml(academy.name)}</strong><small>${escapeHtml(academy.address)}</small></div></td>
                  <td>${escapeHtml(academy.phone)}</td>
                  <td>${formatDateTime(academy.createdAt)}</td>
                  <td><span class="badge ${academy.pilotStatus === "active" ? "green" : "orange"}">${academy.pilotStatus === "active" ? "활성" : "확인 중"}</span></td>
                  <td>${state.enrollments.filter((item) => item.academyId === academy.id).length}명</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function renderData() {
  if (currentRole() === "guardian") return renderGuardianData();
  setPage("COMMON DATA MODEL", "공통 데이터 구조");
  const schemas = [
    ["users", state.users.length, ["id · 휴대전화", "role · 계정 역할", "status · 활성 상태"]],
    ["academies", state.academies.length, ["owner_user_id", "business_registration_number", "pilot_status · created_at"]],
    ["staff_memberships", state.staffMemberships.length, ["academy_id", "user_id · role", "grants · 위임 권한"]],
    ["staff_class_assignments", state.staffClassAssignments.length, ["academy_id", "user_id", "class_name · 복수 담당"]],
    ["students", state.students.length, ["id · 최소 식별정보", "name · birth_date", "created_by · created_at"]],
    ["enrollments", state.enrollments.length, ["academy_id · student_id", "class_name · status", "class_history · changed_at · changed_by"]],
    ["guardian_links", state.guardianLinks.length, ["guardian_user_id · student_id", "academy_id · relationship", "verified_at"]],
    ["invitations", state.invitations.length, ["token · expires_at", "max_uses = 1", "status · used_at"]],
    ["consents", state.consents.length, ["academy_id · student_id", "type · version · method", "status · granted_at"]],
    ["csv_imports", state.csvImports.length, ["academy_id · file_name", "imported_rows · skipped_rows · error_rows", "error_details · created_at"]],
    ["attendance_records", state.attendanceRecords.length, ["academy_id · student_id", "lesson_date · status · arrival_time", "reason · history · parent_reflected_at"]],
    ["learning_records", state.learningRecords.length, ["academy_id · class_name", "lesson_date · textbook · unit · pages", "content · homework · special_notes · next_plan"]],
    ["usage_events", state.usageEvents.length, ["academy_id · user_id", "type", "created_at"]],
    ["audit_logs", state.auditLogs.length, ["academy_id", "actor_user_id", "action · target · created_at"]]
  ];
  return `
    <article class="panel">
      <div class="panel-head"><div><h2>관계 중심 공통 모델</h2><p>학생 계정에 학원·보호자를 직접 덧붙이지 않고 관계 테이블로 분리합니다.</p></div><span class="badge green">schema v${state.schemaVersion}</span></div>
      ${relationshipMap()}
    </article>
    <article class="panel">
      <div class="panel-head"><div><h2>핵심 엔터티</h2><p>2~5단계 기능이 같은 식별자와 권한 경계를 사용합니다.</p></div></div>
      <div class="schema-grid">
        ${schemas
          .map(
            ([name, count, fields]) => `
            <section class="schema-card">
              <header><h3>${name}</h3><span class="badge gray">${count}</span></header>
              <ul>${fields.map((field) => `<li>${field}</li>`).join("")}</ul>
            </section>`
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderGuardianData() {
  setPage("PRIVACY & CONSENT", "내 정보·동의");
  const userConsents = state.consents.filter((item) => item.guardianUserId === currentUser().id);
  const userLinks = state.guardianLinks.filter(
    (item) => item.guardianUserId === currentUser().id && item.status === "verified"
  );
  const linkedChildren = new Set(userLinks.map((item) => item.studentId)).size;
  return `
    <section class="grid two">
      <article class="panel">
        <div class="panel-head"><div><h2>계정 정보</h2><p>본인확인된 최소 정보만 저장합니다.</p></div></div>
        <div class="check-list account-info-list">
          ${checkItem("이름", currentUser().name)}
          ${checkItem("휴대전화", maskPhone(currentUser().phone))}
          ${checkItem("연결 자녀", `${linkedChildren}명 · 학원 연결 ${userLinks.length}건`)}
        </div>
      </article>
      <article class="panel">
        <div class="panel-head"><div><h2>보호·동의 현황</h2><p>보호 상태와 자녀별 동의 기록을 함께 확인합니다.</p></div></div>
        <section class="panel-subsection">
          <h3 class="panel-subsection-title">내 정보 보호</h3>
          <div class="check-list">
            ${checkItem("휴대전화 본인확인 완료", maskPhone(currentUser().phone))}
            ${checkItem("학생 정보 최소 수집", "연결 확인에 필요한 항목만 저장")}
            ${checkItem("동의 이력 보관", `유효 동의 ${userConsents.filter((item) => item.status === "granted").length}건`)}
          </div>
        </section>
        <section class="panel-subsection">
          <h3 class="panel-subsection-title">자녀 연결 동의 이력</h3>
          <div class="card-list">
            ${
              userConsents.length
                ? userConsents
                    .map((consent) => {
                      const student = studentById(consent.studentId);
                      return `<div class="list-card"><div class="activity-icon">동의</div><div><strong>${student?.name || "자녀"} 정보 연결</strong><small>v${consent.version} · ${formatDateTime(consent.grantedAt)} · 휴대전화 인증</small></div><span class="badge green">유효</span></div>`;
                    })
                    .join("")
                : '<div class="empty-state">저장된 동의가 없습니다.</div>'
            }
          </div>
        </section>
      </article>
    </section>
    <article class="panel">
      <div class="panel-head"><div><h2>권리 요청</h2><p>열람·정정·삭제·처리정지·동의철회 절차는 운영 요청함과 감사로그로 연결됩니다.</p></div><button class="button tertiary compact" data-action="request-rights">권리 요청 접수</button></div>
    </article>
  `;
}

function renderAudit() {
  const isOperator = currentRole() === "operator";
  const visibleAuditLogs = isOperator
    ? state.auditLogs
    : state.auditLogs.filter((log) => log.academyId === currentAcademy().id);
  setPage(isOperator ? "AUDIT LOG" : "학원 활동", isOperator ? "전체 감사 이력" : "활동 기록");
  return `
    <section class="grid three horizontal-metrics">
      ${metricCard(isOperator ? "전체 이벤트" : "전체 활동", visibleAuditLogs.length, isOperator ? "현재 데모" : "")}
      ${metricCard(isOperator ? "인증 이벤트" : "로그인 활동", visibleAuditLogs.filter((item) => item.action.startsWith("auth.")).length, isOperator ? "로그인·로그아웃" : "")}
      ${metricCard(isOperator ? "민감 변경" : "권한·연결 변경", visibleAuditLogs.filter((item) => item.action.includes("permission") || item.action.includes("guardian_link")).length, isOperator ? "권한·연결" : "", true)}
    </section>
    <article class="panel">
      <div class="panel-head"><div><h2>${isOperator ? "변경·접근 이력" : "상세 활동 내역"}</h2><p>행위자, 대상, 시각과 목적을 함께 기록합니다.</p></div></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>시각</th><th>행위자</th><th>${isOperator ? "이벤트" : "활동 유형"}</th><th>내용</th>${isOperator ? "<th>대상</th>" : ""}</tr></thead>
          <tbody>
            ${visibleAuditLogs
              .map((log) => {
                const actor = userById(log.actorUserId);
                return `<tr><td>${formatDateTime(log.createdAt)}</td><td>${escapeHtml(userRoleName(actor))}</td><td><span class="badge gray">${escapeHtml(isOperator ? log.action : auditActionLabel(log.action))}</span></td><td>${escapeHtml(log.summary)}</td>${isOperator ? `<td>${escapeHtml(log.targetType)} · ${escapeHtml(log.targetId)}</td>` : ""}</tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function openModal(content) {
  const backdrop = document.querySelector("#modal-backdrop");
  document.querySelector("#modal").innerHTML = content;
  backdrop.classList.remove("hidden");
  backdrop.setAttribute("aria-hidden", "false");
  document.querySelector("#modal input, #modal button")?.focus();
}

function closeModal() {
  const backdrop = document.querySelector("#modal-backdrop");
  backdrop.classList.add("hidden");
  backdrop.setAttribute("aria-hidden", "true");
  document.querySelector("#modal").innerHTML = "";
}

function openStudentModal() {
  if (!hasPermission("student.manage")) {
    toast("원생 관리 권한이 없습니다.", "error");
    return;
  }
  openModal(`
    <header><div><h2 id="modal-title">원생 등록</h2></div><button class="icon-button" data-action="close-modal" aria-label="닫기">×</button></header>
    <form id="student-form">
      <div class="form-grid">
        <div><label for="student-name">학생 이름</label><input id="student-name" name="student-name" required placeholder="예: 이서연" /></div>
        <div><label for="student-birth">생년월일</label><input id="student-birth" name="student-birth" type="date" required /></div>
        <div><label for="student-started">첫 등원일</label><input id="student-started" name="student-started" type="date" required /></div>
        <div class="full"><label for="student-class">반</label><input id="student-class" name="student-class" required placeholder="예: 중등 수학 기본반" /></div>
      </div>
      <div class="notice">같은 원생이 여러 학원에 등록될 수 있으며, 학원별 정보는 분리 관리됩니다.</div>
      <div class="form-actions"><button type="button" class="button tertiary" data-action="close-modal">취소</button><button class="button primary" type="submit">등록하기</button></div>
    </form>`);
}

function openCsvModal() {
  if (!hasPermission("csv.import")) {
    toast("CSV 가져오기 권한이 없습니다.", "error");
    return;
  }
  openModal(`
    <header><div><h2 id="modal-title">원생 CSV 가져오기</h2><p>기존 프로그램 자료를 유지한 채 최소 필드만 등록합니다.</p></div><button class="icon-button" data-action="close-modal" aria-label="닫기">×</button></header>
    <form id="csv-import-form">
      <label for="csv-file">CSV 파일</label>
      <input id="csv-file" type="file" accept=".csv,text/csv" />
      <label for="csv-content">가져올 내용</label>
      <textarea id="csv-content" name="csv-content" class="csv-editor" required>학생명,생년월일,반,첫등원일
윤서아,2013-03-12,중등 수학 기본반,2026-07-27
최도윤,2012-10-06,중등 수학 심화반,2026-07-27</textarea>
      <div class="notice">필수 열: 학생명, 생년월일, 반, 첫등원일. 중복 원생은 건너뛰고 오류 행은 등록하지 않습니다.</div>
      <div class="form-actions"><button type="button" class="button tertiary" data-action="close-modal">취소</button><button class="button primary" type="submit">검증하고 등록</button></div>
    </form>`);
}

function parseCsvLine(line) {
  const cells = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"' && line[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      cells.push(value.trim());
      value = "";
    } else {
      value += character;
    }
  }
  cells.push(value.trim());
  return cells;
}

function showCsvImportResult(importResult) {
  openModal(`
    <header><div><h2 id="modal-title">CSV 가져오기 결과</h2><p>등록·중복 제외·오류 행을 구분해 확인합니다.</p></div><button class="icon-button" data-action="close-modal" aria-label="닫기">×</button></header>
    <div class="csv-result-summary">
      <span><strong>${importResult.importedRows}</strong>등록</span>
      <span><strong>${importResult.skippedRows}</strong>중복 제외</span>
      <span><strong>${importResult.errorRows}</strong>오류</span>
    </div>
    ${
      importResult.errorDetails.length
        ? `<div class="csv-error-list">${importResult.errorDetails
            .map(
              (error) =>
                `<div><strong>${error.row}행</strong><span>${escapeHtml(error.reason)}</span></div>`
            )
            .join("")}</div>`
        : '<div class="empty-state compact-empty">형식 오류 없이 검증을 마쳤습니다.</div>'
    }
    <div class="form-actions"><button class="button primary" data-action="close-modal">확인</button></div>
  `);
}

function importCsv(event) {
  event.preventDefault();
  const content = document.querySelector("#csv-content").value.trim().replace(/^\uFEFF/, "");
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  const headers = parseCsvLine(lines.shift() || "");
  const requiredHeaders = ["학생명", "생년월일", "반", "첫등원일"];
  if (!requiredHeaders.every((header) => headers.includes(header))) {
    toast("필수 열 이름을 확인해주세요.", "error");
    return;
  }
  const indexes = Object.fromEntries(requiredHeaders.map((header) => [header, headers.indexOf(header)]));
  const academy = currentAcademy();
  let importedRows = 0;
  let errorRows = 0;
  let skippedRows = 0;
  const errorDetails = [];

  lines.forEach((line, index) => {
    const cells = parseCsvLine(line);
    const name = cells[indexes["학생명"]]?.trim();
    const birthDate = cells[indexes["생년월일"]]?.trim();
    const className = cells[indexes["반"]]?.trim();
    const startedAt = cells[indexes["첫등원일"]]?.trim();
    let reason = "";
    if (!name) reason = "학생명이 비어 있습니다.";
    else if (!className) reason = "반이 비어 있습니다.";
    else if (!isValidDateString(birthDate)) reason = "생년월일이 실제 날짜가 아닙니다.";
    else if (!isValidDateString(startedAt)) reason = "첫 등원일이 실제 날짜가 아닙니다.";
    if (reason) {
      errorRows += 1;
      errorDetails.push({ row: index + 2, reason });
      return;
    }
    const duplicate = state.students.find(
      (student) =>
        student.name === name &&
        student.birthDate === birthDate &&
        state.enrollments.some((item) => item.academyId === academy.id && item.studentId === student.id)
    );
    if (duplicate) {
      skippedRows += 1;
      return;
    }
    const id = `std-${Date.now()}-${importedRows}`;
    state.students.push({
      id,
      name,
      birthDate,
      createdBy: currentUser().id,
      createdAt: new Date().toISOString()
    });
    state.enrollments.push({
      id: `enr-${Date.now()}-${importedRows}`,
      academyId: academy.id,
      studentId: id,
      className,
      startedAt,
      status: "active",
      classHistory: []
    });
    importedRows += 1;
  });

  const fileName = document.querySelector("#csv-file").files[0]?.name || "직접입력.csv";
  const importResult = {
    id: `csv-${Date.now()}`,
    academyId: academy.id,
    fileName,
    totalRows: lines.length,
    importedRows,
    errorRows,
    skippedRows,
    errorDetails,
    importedBy: currentUser().id,
    createdAt: new Date().toISOString()
  };
  state.csvImports.unshift(importResult);
  addAudit(
    "csv.imported",
    "academy",
    academy.id,
    `CSV 원생 ${importedRows}명 등록 · 중복 ${skippedRows}행 제외 · 오류 ${errorRows}행`
  );
  persistState();
  renderShell();
  renderView();
  if (errorRows || skippedRows) showCsvImportResult(importResult);
  else closeModal();
  toast(`CSV 등록 완료: ${importedRows}명 등록, 중복 ${skippedRows}행 제외, 오류 ${errorRows}행`);
}

function saveAttendance(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const className = formData.get("class-name");
  const lessonDate = formData.get("lesson-date");
  const academy = currentAcademy();
  const selectedStudentIds = new Set(
    [...event.target.querySelectorAll(".attendance-row-check:checked")].map((item) => item.dataset.studentId)
  );
  const enrollments = state.enrollments.filter(
    (item) => item.academyId === academy.id && item.className === className && item.status === "active"
  ).filter((item) => selectedStudentIds.has(item.studentId));
  if (!enrollments.length) {
    toast("저장할 학생을 선택해주세요.", "error");
    return;
  }
  const missingReason = enrollments.some((enrollment) => {
    const status = formData.get(`attendance-${enrollment.studentId}`);
    const reason = formData.get(`reason-${enrollment.studentId}`)?.trim();
    return ["late", "absent", "early_leave"].includes(status) && !reason;
  });
  if (missingReason) {
    toast("지각·결석·조퇴 학생의 사유를 입력해주세요.", "error");
    return;
  }
  const now = new Date().toISOString();
  enrollments.forEach((enrollment) => {
    const status = formData.get(`attendance-${enrollment.studentId}`);
    const arrivalTime = formData.get(`arrival-${enrollment.studentId}`) || "";
    const reason = formData.get(`reason-${enrollment.studentId}`)?.trim() || "";
    const existing = state.attendanceRecords.find(
      (item) =>
        item.academyId === academy.id &&
        item.studentId === enrollment.studentId &&
        item.lessonDate === lessonDate
    );
    if (existing) {
      const changed =
        existing.status !== status ||
        (existing.arrivalTime || "") !== arrivalTime ||
        (existing.reason || "") !== reason;
      if (changed) {
        existing.history = existing.history || [];
        existing.history.unshift({
          id: `ath-${Date.now()}-${enrollment.studentId}`,
          previousStatus: existing.status,
          nextStatus: status,
          previousArrivalTime: existing.arrivalTime || "",
          nextArrivalTime: arrivalTime,
          previousReason: existing.reason || "",
          nextReason: reason,
          changedBy: currentUser().id,
          changedAt: now
        });
      }
      Object.assign(existing, {
        className,
        status,
        arrivalTime,
        reason,
        checkedAt: now,
        checkedBy: currentUser().id,
        parentReflectedAt: now
      });
    } else {
      state.attendanceRecords.push({
        id: `att-${Date.now()}-${enrollment.studentId}`,
        academyId: academy.id,
        studentId: enrollment.studentId,
        className,
        lessonDate,
        status,
        arrivalTime,
        reason,
        checkedAt: now,
        checkedBy: currentUser().id,
        parentReflectedAt: now,
        history: []
      });
    }
  });
  addAudit("attendance.saved", "class", className, `${className} 출결 ${enrollments.length}명 저장`);
  persistState();
  renderView();
  toast("출결을 저장하고 보호자 홈에 반영했습니다.");
}

function applyBulkAttendance(status) {
  const selectedRows = [...document.querySelectorAll(".attendance-row-check:checked")];
  if (!selectedRows.length) {
    toast("변경할 학생을 선택해주세요.", "error");
    return;
  }
  selectedRows.forEach((checkbox) => {
    const studentId = checkbox.dataset.studentId;
    const select = document.querySelector(`[name="attendance-${studentId}"]`);
    if (select) select.value = status;
    if (status === "present") {
      const reason = document.querySelector(`[name="reason-${studentId}"]`);
      if (reason) reason.value = "";
    }
  });
  const label = ({ present: "출석", late: "지각", absent: "결석", early_leave: "조퇴" })[status];
  toast(`선택한 ${selectedRows.length}명을 ${label}으로 설정했습니다.`);
}

function showAttendanceHistory(recordId) {
  const record = state.attendanceRecords.find((item) => item.id === recordId);
  if (!record) return;
  const student = studentById(record.studentId);
  const label = (status) =>
    ({ present: "출석", late: "지각", absent: "결석", early_leave: "조퇴" })[status] || "미처리";
  openModal(`
    <header><div><h2 id="modal-title">출결 수정 이력</h2><p>${escapeHtml(student?.name || "학생")} · ${escapeHtml(record.lessonDate)} · ${escapeHtml(record.className)}</p></div><button class="icon-button" data-action="close-modal" aria-label="닫기">×</button></header>
    <div class="history-list">
      ${(record.history || []).map((item) => `
        <div class="history-item">
          <div><strong>${label(item.previousStatus)} → ${label(item.nextStatus)}</strong><small>${escapeHtml(userById(item.changedBy)?.name || "사용자")} · ${formatDateTime(item.changedAt)}</small></div>
          <p>시각 ${escapeHtml(item.previousArrivalTime || "—")} → ${escapeHtml(item.nextArrivalTime || "—")} · 사유 ${escapeHtml(item.nextReason || "없음")}</p>
        </div>
      `).join("") || '<div class="empty-state">수정 이력이 없습니다.</div>'}
    </div>`);
}

function saveLearning(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const academy = currentAcademy();
  const className = formData.get("class-name");
  const lessonDate = formData.get("lesson-date");
  const values = {
    textbook: formData.get("textbook").trim(),
    unit: formData.get("unit").trim(),
    pages: formData.get("pages").trim(),
    content: formData.get("content").trim(),
    homework: formData.get("homework")?.trim() || "",
    specialNotes: formData.get("special-notes")?.trim() || "",
    nextPlan: formData.get("next-plan").trim()
  };
  const existing = state.learningRecords.find(
    (item) => item.academyId === academy.id && item.className === className && item.lessonDate === lessonDate
  );
  if (existing) {
    Object.assign(existing, values, { updatedBy: currentUser().id, updatedAt: new Date().toISOString() });
  } else {
    state.learningRecords.push({
      id: `lrn-${Date.now()}`,
      academyId: academy.id,
      className,
      lessonDate,
      ...values,
      createdBy: currentUser().id,
      createdAt: new Date().toISOString()
    });
  }
  addAudit("learning.saved", "class", className, `${className} 일별 학습기록 저장`);
  persistState();
  renderView();
  toast("학습기록을 저장하고 보호자 홈에 반영했습니다.");
}

function loadPreviousLearning() {
  const classes = academyClassNames();
  const className = classes.includes(state.selectedClassName) ? state.selectedClassName : classes[0];
  const lessonDate = state.selectedLessonDate || koreaDate();
  const previous = state.learningRecords
    .filter((item) => item.academyId === currentAcademy().id && item.className === className && item.lessonDate < lessonDate)
    .sort((a, b) => b.lessonDate.localeCompare(a.lessonDate))[0];
  if (!previous) return;
  document.querySelector("#learning-textbook").value = previous.textbook;
  document.querySelector("#learning-unit").value = previous.unit;
  document.querySelector("#learning-pages").value = previous.pages;
  document.querySelector("#learning-content").value = previous.content;
  document.querySelector("#learning-homework").value = previous.homework || "";
  document.querySelector("#learning-special-notes").value = previous.specialNotes || "";
  document.querySelector("#learning-next-plan").value = previous.nextPlan;
  toast("이전 학습기록을 불러왔습니다.");
}

function createStudent(event) {
  event.preventDefault();
  const name = document.querySelector("#student-name").value.trim();
  const birthDate = document.querySelector("#student-birth").value;
  const startedAt = document.querySelector("#student-started").value;
  const className = document.querySelector("#student-class").value.trim();
  if (!name || !birthDate || !startedAt || !className) {
    toast("필수 정보를 모두 입력해주세요.", "error");
    return;
  }
  const id = `std-${Date.now()}`;
  state.students.push({
    id,
    name,
    birthDate,
    createdBy: currentUser().id,
    createdAt: new Date().toISOString()
  });
  state.enrollments.push({
    id: `enr-${Date.now()}`,
    academyId: currentAcademy().id,
    studentId: id,
    className,
    startedAt,
    status: "active",
    classHistory: []
  });
  addAudit("student.created", "student", id, `${name} 원생 등록`);
  persistState();
  closeModal();
  renderView();
  toast(`${name} 원생을 등록했습니다.`);
}

function changeStudentClass(studentId) {
  if (!hasPermission("student.manage")) {
    toast("반을 변경할 권한이 없습니다.", "error");
    return;
  }
  const academy = currentAcademy();
  const enrollment = accessibleAcademyEnrollments().find((item) => item.studentId === studentId);
  const nextClassName = document.querySelector("#student-class-change")?.value.trim();
  if (!enrollment || !nextClassName) {
    toast("변경할 반을 확인해주세요.", "error");
    return;
  }
  const assigned = assignedClassNames();
  if (assigned && !assigned.has(nextClassName)) {
    toast("담당 반으로만 변경할 수 있습니다.", "error");
    return;
  }
  if (enrollment.className === nextClassName) {
    toast("현재 반과 동일합니다.", "error");
    return;
  }
  const previousClassName = enrollment.className;
  const changedAt = new Date().toISOString();
  enrollment.className = nextClassName;
  enrollment.classHistory = enrollment.classHistory || [];
  enrollment.classHistory.unshift({
    id: `ech-${Date.now()}`,
    previousClassName,
    nextClassName,
    changedAt,
    changedBy: currentUser().id
  });
  addAudit(
    "enrollment.class_changed",
    "student",
    studentId,
    `${studentById(studentId)?.name || "원생"} 반 변경 · ${previousClassName} → ${nextClassName}`,
    academy.id
  );
  persistState();
  renderShell();
  renderView();
  toast(`${nextClassName}으로 반을 변경했습니다.`);
}

function showInvitation(studentId) {
  if (!hasPermission("invite.manage")) {
    toast("보호자 초대 권한이 없습니다.", "error");
    return;
  }
  const student = studentById(studentId);
  const academy = currentAcademy();
  state.invitations
    .filter(
      (item) =>
        item.studentId === studentId &&
        item.academyId === academy.id &&
        item.status === "sent" &&
        new Date(item.expiresAt).getTime() < Date.now()
    )
    .forEach((item) => {
      item.status = "expired";
    });
  let invite = activeInvitationFor(studentId, academy.id);
  if (!invite) {
    const code = createInvitationCode();
    invite = {
      id: `inv-${Date.now()}`,
      academyId: academy.id,
      studentId,
      code,
      token: `secure-${crypto.randomUUID?.() || Date.now()}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      maxUses: 1,
      usedAt: null,
      status: "sent",
      createdBy: currentUser().id,
      createdAt: new Date().toISOString()
    };
    state.invitations.push(invite);
    addAudit("invitation.created", "invitation", invite.id, `${student.name} 보호자 초대 발급`);
    persistState();
  }

  openModal(`
    <header><div><h2 id="modal-title">보호자 초대</h2><p>${escapeHtml(student.name)} 학생 · 인증 전 상세정보 비노출</p></div><button class="icon-button" data-action="close-modal" aria-label="닫기">×</button></header>
    <div class="secure-invite">
      <div class="secure-icon">↗</div>
      <span class="badge orange">24시간 · 1회 사용</span>
      <h2 style="margin-top:12px;">${invite.code}</h2>
      <p>보호자가 휴대전화 본인확인, 생년월일·관계 확인과 필수 동의를 마쳐야 연결됩니다.</p>
      <div class="notice">만료: ${formatDateTime(invite.expiresAt)} · 발급 후 학생 이름과 학원명은 인증 전 표시되지 않습니다.</div>
      <button class="button primary block" style="margin-top:16px;" data-action="copy-invite" data-code="${invite.code}">초대 코드 복사</button>
    </div>`);
}

function togglePermission(permission) {
  if (!hasPermission("permission.manage")) {
    toast("권한을 변경할 수 없습니다.", "error");
    return;
  }
  const membership = state.staffMemberships.find((item) => item.role === "academy_instructor" && item.academyId === currentAcademy().id);
  const instructorName = userById(membership.userId)?.name || "강사";
  const hasGrant = membership.grants.includes(permission);
  membership.grants = hasGrant ? membership.grants.filter((item) => item !== permission) : [...membership.grants, permission];
  addAudit(
    "staff.permission_changed",
    "staff_membership",
    membership.id,
    `${instructorName} ${permissionLabel(permission)} 권한 ${hasGrant ? "회수" : "부여"}`
  );
  persistState();
  renderView();
  toast(`${permissionLabel(permission)} 권한을 ${hasGrant ? "회수" : "부여"}했습니다.`);
}

function saveAcademy() {
  if (!hasPermission("academy.manage")) {
    toast("학원 정보 관리 권한이 없습니다.", "error");
    return;
  }
  const academy = currentAcademy();
  const name = document.querySelector("#academy-name").value.trim();
  const businessRegistrationNumber = document.querySelector("#academy-business-number").value.trim();
  const phone = document.querySelector("#academy-phone").value.trim();
  const address = document.querySelector("#academy-address").value.trim();
  if (!name || !businessRegistrationNumber || !phone || !address) {
    toast("학원 정보를 모두 입력해주세요.", "error");
    return;
  }
  if (!/^\d{3}-\d{2}-\d{5}$/.test(businessRegistrationNumber)) {
    toast("사업자등록번호를 000-00-00000 형식으로 입력해주세요.", "error");
    return;
  }
  academy.name = name;
  academy.businessRegistrationNumber = businessRegistrationNumber;
  academy.phone = phone;
  academy.address = address;
  addAudit("academy.updated", "academy", academy.id, `${name} 기본 정보 수정`);
  persistState();
  renderShell();
  renderView();
  toast("학원 정보를 저장했습니다.");
}

function connectGuardian(event) {
  event.preventDefault();
  const code = document.querySelector("#invite-code").value.trim().toUpperCase();
  const birthDate = document.querySelector("#child-birth").value;
  const relationship = document.querySelector("#relationship").value;
  const consented = document.querySelector("#guardian-consent").checked;
  const invite = state.invitations.find((item) => item.code === code);

  if (!invite || invite.status !== "sent") {
    toast("사용할 수 없는 초대 코드입니다.", "error");
    return;
  }
  if (new Date(invite.expiresAt).getTime() < Date.now()) {
    invite.status = "expired";
    persistState();
    toast("초대 코드가 만료됐습니다. 학원에 재발급을 요청해주세요.", "error");
    return;
  }
  const student = studentById(invite.studentId);
  if (student.birthDate !== birthDate) {
    toast("자녀 관계 확인 정보가 일치하지 않습니다.", "error");
    return;
  }
  if (!consented) {
    toast("필수 확인 및 동의가 필요합니다.", "error");
    return;
  }
  if (
    state.guardianLinks.some(
      (item) =>
        item.guardianUserId === currentUser().id &&
        item.studentId === student.id &&
        item.academyId === invite.academyId &&
        item.status === "verified"
    )
  ) {
    toast("이미 연결된 자녀·학원입니다.", "error");
    return;
  }

  const now = new Date().toISOString();
  const hasExistingChild = state.guardianLinks.some(
    (item) =>
      item.guardianUserId === currentUser().id &&
      item.studentId === student.id &&
      item.status === "verified"
  );
  state.guardianLinks.unshift({
    id: `gln-${Date.now()}`,
    guardianUserId: currentUser().id,
    studentId: student.id,
    academyId: invite.academyId,
    relationship,
    status: "verified",
    verifiedAt: now
  });
  state.consents.push({
    id: `cns-${Date.now()}`,
    guardianUserId: currentUser().id,
    studentId: student.id,
    academyId: invite.academyId,
    type: "guardian_link",
    version: "2026.07",
    status: "granted",
    method: "phone_verification",
    grantedAt: now
  });
  invite.usedAt = now;
  invite.status = "accepted";
  const academy = academyById(invite.academyId);
  addAudit(
    "guardian_link.verified",
    "student",
    student.id,
    hasExistingChild
      ? `${student.name} ${academy?.name || "학원"} 추가 연결`
      : `${student.name} 보호자 관계 확인`,
    invite.academyId
  );
  persistState();
  state.activeView = "home";
  closeModal();
  renderShell();
  renderView();
  toast(
    hasExistingChild
      ? `${student.name} 학생의 ${academy?.name || "새 학원"} 연결이 추가됐습니다.`
      : `${student.name} 학생과 안전하게 연결됐습니다.`
  );
}

function requestRights() {
  addAudit("privacy.rights_requested", "user", currentUser().id, `${currentUser().name} 개인정보 권리 요청 접수`);
  persistState();
  renderView();
  toast("권리 요청을 접수했습니다. 운영자가 확인합니다.");
}

document.addEventListener("click", (event) => {
  const authRole = event.target.closest("[data-auth-role]");
  if (authRole) setAuthRole(authRole.dataset.authRole);

  const viewTarget = event.target.closest("[data-view], [data-view-target]");
  if (viewTarget && currentUser()) {
    state.activeView = viewTarget.dataset.view || viewTarget.dataset.viewTarget;
    state.selectedStudentId = null;
    persistState();
    document.querySelector("#workspace").classList.remove("nav-open");
    renderShell();
    renderView();
  }

  const action = event.target.closest("[data-action]");
  if (!action) return;
  const actionName = action.dataset.action;
  if (actionName === "save-academy") saveAcademy();
  if (actionName === "open-student-modal") openStudentModal();
  if (actionName === "open-csv-modal") openCsvModal();
  if (actionName === "open-guardian-connect-modal") openGuardianConnectModal();
  if (actionName === "load-previous-learning") loadPreviousLearning();
  if (actionName === "bulk-attendance") applyBulkAttendance(action.dataset.status);
  if (actionName === "attendance-filter") {
    state.attendanceFilter = action.dataset.filter;
    persistState();
    renderView();
  }
  if (actionName === "view-attendance-history") showAttendanceHistory(action.dataset.recordId);
  if (actionName === "open-student-detail") {
    state.selectedStudentId = action.dataset.studentId;
    persistState();
    renderView();
  }
  if (actionName === "back-to-students") {
    state.selectedStudentId = null;
    persistState();
    renderView();
  }
  if (actionName === "change-student-class") changeStudentClass(action.dataset.studentId);
  if (actionName === "close-modal") closeModal();
  if (actionName === "invite-guardian") showInvitation(action.dataset.studentId);
  if (actionName === "toggle-permission") togglePermission(action.dataset.permission);
  if (actionName === "copy-invite") {
    navigator.clipboard?.writeText(action.dataset.code);
    toast(`초대 코드 ${action.dataset.code}를 복사했습니다.`);
  }
  if (actionName === "request-rights") requestRights();
});

document.addEventListener("submit", (event) => {
  if (event.target.id === "student-form") createStudent(event);
  if (event.target.id === "csv-import-form") importCsv(event);
  if (event.target.id === "attendance-form") saveAttendance(event);
  if (event.target.id === "learning-form") saveLearning(event);
  if (event.target.id === "connect-form") connectGuardian(event);
});

document.addEventListener("change", (event) => {
  if (event.target.id === "attendance-select-all") {
    document.querySelectorAll(".attendance-row-check").forEach((checkbox) => {
      checkbox.checked = event.target.checked;
    });
  }
  if (event.target.id === "csv-file" && event.target.files[0]) {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      document.querySelector("#csv-content").value = String(reader.result || "");
    });
    reader.readAsText(event.target.files[0], "UTF-8");
  }
  if (["attendance-class", "learning-class"].includes(event.target.id)) {
    state.selectedClassName = event.target.value;
    persistState();
    renderView();
  }
  if (["attendance-date", "learning-date"].includes(event.target.id)) {
    state.selectedLessonDate = event.target.value;
    persistState();
    renderView();
  }
});

document.querySelector("#continue-to-phone").addEventListener("click", showPhoneStep);
document.querySelector("#back-to-role").addEventListener("click", showRoleStep);
document.querySelector("#request-code").addEventListener("click", requestVerification);
document.querySelector("#auth-phone-step").addEventListener("submit", completeLogin);
document.querySelector("#sign-out").addEventListener("click", signOut);
document.querySelector("#mobile-nav-toggle").addEventListener("click", () => document.querySelector("#workspace").classList.toggle("nav-open"));
document.querySelector("#modal-backdrop").addEventListener("click", (event) => {
  if (event.target.id === "modal-backdrop") closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

setAuthRole(selectedAuthRole);
render();
