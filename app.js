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
    "audit.read"
  ],
  academy_instructor: ["academy.read", "student.read"],
  guardian: ["child.read", "connection.manage", "consent.manage"],
  operator: ["pilot.read", "audit.read", "request.manage"]
};

const initialState = {
  schemaVersion: 5,
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
      id: "sca-teacher-math-basic",
      academyId: "acd-dodam",
      userId: "usr-teacher",
      className: "중등 수학 기본반"
    }
  ],
  students: [
    {
      id: "std-minjun",
      name: "정민준",
      birthDate: "2012-05-18",
      status: "active",
      createdBy: "usr-owner",
      createdAt: "2026-07-20T10:00:00+09:00"
    },
    {
      id: "std-harin",
      name: "정하린",
      birthDate: "2014-09-02",
      status: "active",
      createdBy: "usr-owner",
      createdAt: "2026-07-20T10:04:00+09:00"
    },
    {
      id: "std-jihoo",
      name: "오지후",
      birthDate: "2013-11-21",
      status: "paused",
      createdBy: "usr-owner",
      createdAt: "2026-07-20T10:07:00+09:00"
    }
  ],
  enrollments: [
    { id: "enr-1", academyId: "acd-dodam", studentId: "std-minjun", className: "중등 수학 심화반", startedAt: "2026-03-04", status: "active" },
    { id: "enr-2", academyId: "acd-dodam", studentId: "std-harin", className: "중등 수학 심화반", startedAt: "2026-04-01", status: "active" },
    { id: "enr-3", academyId: "acd-dodam", studentId: "std-jihoo", className: "중등 수학 기본반", startedAt: "2026-02-10", status: "paused" },
    { id: "enr-4", academyId: "acd-bridge", studentId: "std-minjun", className: "중등 영어 B반", startedAt: "2026-05-12", status: "active" }
  ],
  guardianLinks: [
    {
      id: "gln-1",
      guardianUserId: "usr-guardian",
      studentId: "std-harin",
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
    }
  ],
  consents: [
    {
      id: "cns-1",
      guardianUserId: "usr-guardian",
      studentId: "std-harin",
      type: "guardian_link",
      version: "2026.07",
      status: "granted",
      method: "phone_verification",
      grantedAt: "2026-07-21T14:30:00+09:00"
    }
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
    ["home", "학원 홈"],
    ["academy", "학원 설정"],
    ["students", "원생 관리"],
    ["audit", "활동 기록"]
  ],
  academy_instructor: [
    ["students", "원생 관리"],
    ["permissions", "권한 확인"]
  ],
  guardian: [
    ["home", "자녀 연결 현황"],
    ["data", "내 정보·동의"]
  ],
  operator: [
    ["home", "공통 기반 현황"],
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

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved) return clone(initialState);
    return {
      ...saved,
      schemaVersion: 5,
      selectedStudentId: null,
      students: saved.students.map((student) =>
        student.id === "std-minjun" && student.name === "김민준" ? { ...student, name: "정민준" } : student
      ),
      academies: saved.academies.map((academy) => ({
        ...academy,
        businessRegistrationNumber:
          academy.businessRegistrationNumber ||
          initialState.academies.find((item) => item.id === academy.id)?.businessRegistrationNumber ||
          ""
      })),
      staffClassAssignments: saved.staffClassAssignments || clone(initialState.staffClassAssignments),
      invitations: saved.invitations.map((invitation) =>
        invitation.code === "MF-4821" &&
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
        if (enrollment.startedAt) return enrollment;
        const student = saved.students.find((item) => item.id === enrollment.studentId);
        return { ...enrollment, startedAt: student?.createdAt?.slice(0, 10) || "2026-07-20" };
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
    const linked = state.guardianLinks.filter((link) => link.guardianUserId === user.id && link.status === "verified").length;
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
}

function renderView() {
  const role = currentRole();
  const root = document.querySelector("#view-root");
  const views = {
    home: () => renderHome(role),
    academy: renderAcademy,
    students: renderStudents,
    permissions: renderPermissions,
    connect: renderConnect,
    pilots: renderPilots,
    data: renderData,
    audit: renderAudit
  };
  root.innerHTML = views[state.activeView]?.() || renderHome(role);
}

function renderHome(role) {
  if (role === "guardian") return renderGuardianHome();
  if (role === "academy_instructor") return renderStudents();
  if (role === "operator") return renderOperatorHome();

  setPage("학원 운영", "학원 홈");
  const academy = currentAcademy();
  const academyEnrollments = state.enrollments.filter((item) => item.academyId === academy.id);
  const academyMembers = state.staffMemberships.filter(
    (item) => item.academyId === academy.id && item.status === "active"
  );
  const academyAuditLogs = state.auditLogs.filter((item) => item.academyId === academy.id);
  const connectedStudentIds = new Set(state.guardianLinks.filter((item) => item.status === "verified").map((item) => item.studentId));
  const connected = academyEnrollments.filter((item) => connectedStudentIds.has(item.studentId)).length;
  const foundationProgress = Math.round(((1 + 1 + connected / Math.max(academyEnrollments.length, 1) + 1) / 4) * 100);

  return `
    <section class="hero-panel">
      <div>
        <p class="eyebrow eyebrow-accent">오늘의 학원 현황</p>
        <h2>${escapeHtml(academy.name)} 운영 현황을 확인하세요</h2>
        <p>구성원 권한, 원생 등록, 보호자 연결과 최근 변경 내역을 한눈에 확인합니다.</p>
      </div>
      <div class="hero-progress"><strong>${foundationProgress}%</strong><span>기반 준비도</span></div>
    </section>

    <section class="grid four">
      ${metricCard("등록 구성원", academyMembers.length, "원장·강사")}
      ${metricCard("학원 원생", academyEnrollments.length, "재원·휴원 포함")}
      ${metricCard("보호자 연결", connected, `${academyEnrollments.length - connected}명 연결 대기`, true)}
      ${metricCard("활동 기록", academyAuditLogs.length, "로그인·권한·연결")}
    </section>

    <section class="grid two">
      <article class="panel">
        <div class="panel-head"><div><h2>운영 준비 현황</h2><p>학원 운영에 필요한 계정과 연결 상태입니다.</p></div></div>
        <div class="check-list">
          ${checkItem("휴대전화 본인확인", "원장·강사·학부모·운영자 역할별 세션")}
          ${checkItem("역할·권한 분리", "원장 기본 권한과 강사 위임 권한")}
          ${checkItem("학원·원생 구조", "학원 원본 소유와 재원 상태 분리")}
          ${checkItem("보호자 보안 연결", "24시간 1회용 초대와 동의 이력")}
        </div>
      </article>
      <article class="panel">
        <div class="panel-head"><div><h2>최근 활동</h2><p>누가 무엇을 변경했는지 기록합니다.</p></div><button class="button tertiary compact" data-view-target="audit">전체 보기</button></div>
        <div class="activity-list">${auditItems(academyAuditLogs.slice(0, 4))}</div>
      </article>
    </section>
  `;
}

function renderGuardianHome() {
  setPage("PARENT FOUNDATION", "자녀 연결 현황");
  const links = state.guardianLinks.filter((item) => item.guardianUserId === currentUser().id && item.status === "verified");
  return `
    <section class="hero-panel">
      <div>
        <p class="eyebrow eyebrow-accent">VERIFIED GUARDIAN</p>
        <h2>${links.length ? `${escapeHtml(studentById(links[0].studentId).name)} 학생과 안전하게 연결됐어요` : "초대 코드를 연결해주세요"}</h2>
        <p>본인확인과 자녀 관계 확인을 마친 연결만 표시됩니다. 학원별 원본 정보는 다음 단계에서 통합됩니다.</p>
      </div>
      <div class="hero-progress"><strong>${links.length}</strong><span>연결 자녀</span></div>
    </section>
    <section class="grid two">
      <article class="panel">
        <div class="panel-head"><div><h2>연결된 자녀</h2><p>복수 자녀를 같은 계정에 연결할 수 있습니다.</p></div></div>
        <div class="card-list">
          ${
            links.length
              ? links
                  .map((link) => {
                    const student = studentById(link.studentId);
                    const academies = state.enrollments
                      .filter((item) => item.studentId === student.id)
                      .map((item) => academyById(item.academyId)?.name)
                      .filter(Boolean);
                    return `
                      <div class="list-card">
                        <div class="person-avatar">학생</div>
                        <div><strong>${escapeHtml(student.name)}</strong><small>${escapeHtml(academies.join(" · "))} · 학생과의 관계 ${escapeHtml(link.relationship)}</small></div>
                        <span class="badge green">관계 확인</span>
                      </div>`;
                  })
                  .join("")
              : '<div class="empty-state">아직 연결된 자녀가 없습니다.</div>'
          }
        </div>
      </article>
      <article class="panel">
        <div class="panel-head"><div><h2>새 자녀 연결</h2><p>학원에서 받은 초대 코드로 자녀를 추가합니다.</p></div></div>
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
          <p class="field-hint">데모 연결: MF-4821 · 2012-05-18</p>
        </form>
      </article>
    </section>
  `;
}

function renderOperatorHome() {
  setPage("OPERATOR FOUNDATION", "공통 기반 현황");
  const active = state.academies.filter((item) => item.pilotStatus === "active").length;
  const pendingInvites = state.invitations.filter((item) => item.status === "sent").length;
  return `
    <section class="hero-panel">
      <div>
        <p class="eyebrow eyebrow-accent">INTERNAL OPERATION</p>
        <h2>파일럿의 계정과 연결 상태를 확인합니다</h2>
        <p>운영자는 학원 원본을 수정하지 않고 파일럿 상태, 초대 예외와 감사 이벤트를 확인합니다.</p>
      </div>
      <div class="hero-progress"><strong>${active}</strong><span>활성 학원</span></div>
    </section>
    <section class="grid four">
      ${metricCard("파일럿 학원", state.academies.length, "전체")}
      ${metricCard("활성 학원", active, "본인확인 완료")}
      ${metricCard("연결 대기", pendingInvites, "발송·미수락", true)}
      ${metricCard("감사 이벤트", state.auditLogs.length, "전체 역할")}
    </section>
    <section class="grid two">
      <article class="panel">
        <div class="panel-head"><div><h2>파일럿 상태</h2><p>학원별 공통 기반 준비 현황</p></div><button class="button tertiary compact" data-view-target="pilots">전체 보기</button></div>
        <div class="card-list">
          ${state.academies
            .map(
              (academy) => `
              <div class="list-card">
                <div class="activity-icon">A</div>
                <div><strong>${escapeHtml(academy.name)}</strong><small>${escapeHtml(academy.address)}</small></div>
                <span class="badge ${academy.pilotStatus === "active" ? "green" : "orange"}">${academy.pilotStatus === "active" ? "활성" : "확인 중"}</span>
              </div>`
            )
            .join("")}
        </div>
      </article>
      <article class="panel">
        <div class="panel-head"><div><h2>최근 감사 이벤트</h2><p>민감 작업은 행위자와 시각을 남깁니다.</p></div></div>
        <div class="activity-list">${auditItems(state.auditLogs.slice(0, 4))}</div>
      </article>
    </section>
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
  const linkCount = state.guardianLinks.filter((item) => item.status === "verified").length;
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
  const enrollments = state.enrollments.filter((item) => item.academyId === academy.id);
  const canManage = hasPermission("student.manage");
  const canInvite = hasPermission("invite.manage");
  const currentMonth = new Date().toISOString().slice(0, 7);
  const newThisMonth = enrollments.filter(
    (item) => studentById(item.studentId)?.createdAt?.slice(0, 7) === currentMonth
  ).length;
  const activeCount = enrollments.filter((item) => item.status === "active").length;
  const pausedCount = enrollments.filter((item) => item.status === "paused").length;
  const linkedCount = enrollments.filter((item) =>
    state.guardianLinks.some((link) => link.studentId === item.studentId && link.status === "verified")
  ).length;
  const pendingCount = enrollments.filter((item) =>
    state.invitations.some((invite) => invite.studentId === item.studentId && invite.status === "sent")
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
        <div><h2>전체 원생</h2><p>생년월일과 첫 등원일을 분리하고, 보호자 연결 상태를 같은 행에서 관리합니다.</p></div>
        ${canManage ? '<button class="button primary compact" data-action="open-student-modal">원생 등록</button>' : ""}
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
                const link = state.guardianLinks.find((item) => item.studentId === student.id && item.status === "verified");
                const guardian = link ? userById(link.guardianUserId) : null;
                const invite = state.invitations.find((item) => item.studentId === student.id && ["sent", "accepted"].includes(item.status));
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
  const enrollment = state.enrollments.find(
    (item) => item.studentId === studentId && item.academyId === currentAcademy().id
  );
  if (!student || !enrollment) {
    state.selectedStudentId = null;
    return renderStudents();
  }

  const link = state.guardianLinks.find((item) => item.studentId === studentId && item.status === "verified");
  const guardian = link ? userById(link.guardianUserId) : null;
  const invite = state.invitations.find((item) => item.studentId === studentId && ["sent", "accepted"].includes(item.status));
  const canInvite = hasPermission("invite.manage");
  const relatedAudits = state.auditLogs.filter(
    (item) =>
      item.academyId === academy.id &&
      (item.targetId === studentId ||
        (item.targetType === "invitation" &&
          state.invitations.some((entry) => entry.id === item.targetId && entry.studentId === studentId)))
  );

  setPage("원생 관리", `${student.name} 원생 관리`);
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

    <section class="hero-panel student-hero">
      <div>
        <p class="eyebrow eyebrow-accent">${enrollment.status === "active" ? "재원 원생" : "휴원 원생"}</p>
        <h2>${escapeHtml(student.name)}</h2>
        <p>${escapeHtml(enrollment.className)} · 첫 등원 ${escapeHtml(enrollment.startedAt)}</p>
      </div>
      <span class="badge ${enrollment.status === "active" ? "green" : "purple"}">${enrollment.status === "active" ? "재원" : "휴원"}</span>
    </section>

    <section class="grid four">
      ${metricCard("생년월일", student.birthDate, "학생 기본정보")}
      ${metricCard("첫 등원일", enrollment.startedAt, "현재 학원 기준")}
      ${metricCard("소속 반", enrollment.className, "현재 배정", false, true)}
      ${metricCard("보호자 연결", link ? "완료" : invite?.status === "sent" ? "초대 대기" : "미연결", link ? link.relationship : "연결 관리", !link)}
    </section>

    <section class="grid two">
      <article class="panel">
        <div class="panel-head"><div><h2>원생 기본정보</h2><p>학생과 학원의 재원 관계를 분리해 저장합니다.</p></div></div>
        <dl class="detail-list">
          <div><dt>원생명</dt><dd>${escapeHtml(student.name)}</dd></div>
          <div><dt>생년월일</dt><dd>${escapeHtml(student.birthDate)}</dd></div>
          <div><dt>반</dt><dd>${escapeHtml(enrollment.className)}</dd></div>
          <div><dt>첫 등원일</dt><dd>${escapeHtml(enrollment.startedAt)}</dd></div>
          <div><dt>재원 상태</dt><dd>${enrollment.status === "active" ? "재원" : "휴원"}</dd></div>
        </dl>
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
    ["invite.manage", "보호자 초대", "보안 링크 발급"],
    ["permission.manage", "권한 관리", "구성원 위임"],
    ["audit.read", "활동 기록", "변경 내역 조회"]
  ];
  const instructor = members.find((item) => item.role === "academy_instructor");
  const instructorName = instructor?.user?.name || "강사";
  return `
    <section class="grid two">
      <article class="panel">
        <div class="panel-head"><div><h2>학원 구성원</h2><p>한 사용자가 학원마다 다른 역할을 가질 수 있습니다.</p></div></div>
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
      "invite.manage": "보호자 초대",
      "member.manage": "구성원 관리",
      "permission.manage": "권한 위임",
      "audit.read": "활동 기록 조회"
    }[key] || key
  );
}

function renderConnect() {
  setPage("SECURE CONNECTION", "초대 코드 연결");
  const userLinks = state.guardianLinks.filter((item) => item.guardianUserId === currentUser().id && item.status === "verified");
  return `
    <article class="panel secure-invite">
      <div class="secure-icon">✓</div>
      <p class="eyebrow">ONE-TIME SECURE LINK</p>
      <h2>자녀의 새로운 학원 소식이 도착했어요</h2>
      <p>인증 전에는 학생과 학원 상세정보를 표시하지 않습니다. 초대 코드와 관계 정보를 확인한 뒤 연결합니다.</p>
      <form id="connect-form" class="invite-code-form">
        <label for="invite-code">초대 코드</label>
        <input id="invite-code" name="invite-code" placeholder="예: MF-4821" value="MF-4821" autocomplete="off" />
        <div class="form-grid">
          <div><label for="child-birth">자녀 생년월일</label><input id="child-birth" name="child-birth" type="date" value="2012-05-18" /></div>
          <div><label for="relationship">자녀와의 관계</label><select id="relationship" name="relationship"><option>부모</option><option>조부모</option><option>법정대리인</option></select></div>
        </div>
        <div class="consent-box">
          <input id="guardian-consent" name="guardian-consent" type="checkbox" />
          <label for="guardian-consent">필수 확인 및 동의<small>서비스 이용과 자녀 정보 연결에 필요한 항목을 확인했습니다. 동의 버전·시각·방법이 저장됩니다.</small></label>
        </div>
        <button class="button primary block" type="submit" style="margin-top:16px;">확인하고 연결하기</button>
        <p class="field-hint">데모 연결: MF-4821 · 2012-05-18</p>
      </form>
    </article>
    ${
      userLinks.length
        ? `<article class="panel"><div class="panel-head"><div><h2>기존 연결</h2><p>이미 확인된 자녀 관계입니다.</p></div></div><div class="card-list">${userLinks
            .map((link) => {
              const student = studentById(link.studentId);
              return `<div class="list-card"><div class="person-avatar">학생</div><div><strong>${escapeHtml(student.name)}</strong><small>${escapeHtml(link.relationship)} · ${formatDateTime(link.verifiedAt)} 확인</small></div><span class="badge green">연결 완료</span></div>`;
            })
            .join("")}</div></article>`
        : ""
    }
  `;
}

function renderPilots() {
  setPage("PILOT ACCOUNT", "파일럿 학원");
  return `
    <section class="grid three">
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
    ["students", state.students.length, ["id · 최소 식별정보", "birth_date", "status · 재원 상태 아님"]],
    ["enrollments", state.enrollments.length, ["academy_id", "student_id", "class_name · status"]],
    ["guardian_links", state.guardianLinks.length, ["guardian_user_id", "student_id · relationship", "verified_at"]],
    ["invitations", state.invitations.length, ["token · expires_at", "max_uses = 1", "status · used_at"]],
    ["consents", state.consents.length, ["type · version", "method · status", "granted_at"]],
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
  return `
    <section class="grid two">
      <article class="panel">
        <div class="panel-head"><div><h2>계정 정보</h2><p>본인확인된 최소 정보만 저장합니다.</p></div></div>
        <div class="check-list account-info-list">
          ${checkItem("이름", currentUser().name)}
          ${checkItem("휴대전화", maskPhone(currentUser().phone))}
          ${checkItem("연결 자녀", `${userLinks.length}명`)}
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
    <section class="grid three ${isOperator ? "" : "activity-metric-grid"}">
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
    <header><div><h2 id="modal-title">원생 등록</h2><p>학생 최소정보와 학원 재원 관계를 함께 생성합니다.</p></div><button class="icon-button" data-action="close-modal" aria-label="닫기">×</button></header>
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
    status: "active",
    createdBy: currentUser().id,
    createdAt: new Date().toISOString()
  });
  state.enrollments.push({
    id: `enr-${Date.now()}`,
    academyId: currentAcademy().id,
    studentId: id,
    className,
    startedAt,
    status: "active"
  });
  addAudit("student.created", "student", id, `${name} 원생 등록`);
  persistState();
  closeModal();
  renderView();
  toast(`${name} 원생을 등록했습니다.`);
}

function showInvitation(studentId) {
  if (!hasPermission("invite.manage")) {
    toast("보호자 초대 권한이 없습니다.", "error");
    return;
  }
  const student = studentById(studentId);
  let invite = state.invitations.find((item) => item.studentId === studentId && item.status === "sent");
  if (!invite) {
    const code = `MF-${String(Math.floor(1000 + Math.random() * 9000))}`;
    invite = {
      id: `inv-${Date.now()}`,
      academyId: currentAcademy().id,
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
  if (state.guardianLinks.some((item) => item.guardianUserId === currentUser().id && item.studentId === student.id && item.status === "verified")) {
    toast("이미 연결된 자녀입니다.", "error");
    return;
  }

  const now = new Date().toISOString();
  state.guardianLinks.unshift({
    id: `gln-${Date.now()}`,
    guardianUserId: currentUser().id,
    studentId: student.id,
    relationship,
    status: "verified",
    verifiedAt: now
  });
  state.consents.push({
    id: `cns-${Date.now()}`,
    guardianUserId: currentUser().id,
    studentId: student.id,
    type: "guardian_link",
    version: "2026.07",
    status: "granted",
    method: "phone_verification",
    grantedAt: now
  });
  invite.usedAt = now;
  invite.status = "accepted";
  addAudit("guardian_link.verified", "student", student.id, `${student.name} 보호자 관계 확인`, invite.academyId);
  persistState();
  state.activeView = "home";
  renderShell();
  renderView();
  toast(`${student.name} 학생과 안전하게 연결됐습니다.`);
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
  if (event.target.id === "connect-form") connectGuardian(event);
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
