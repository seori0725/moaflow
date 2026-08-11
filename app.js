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
    "homework.manage",
    "test.manage",
    "analytics.read",
    "consultation.manage",
    "comment.manage",
    "request.create",
    "csv.import",
    "audit.read"
  ],
  academy_instructor: [
    "academy.read",
    "student.read",
    "attendance.manage",
    "learning.manage",
    "homework.manage",
    "test.manage",
    "analytics.read",
    "comment.manage",
    "request.create"
  ],
  guardian: ["child.read", "connection.manage", "consent.manage", "request.create"],
  operator: ["pilot.read", "audit.read", "request.manage"]
};

const nationalAchievement2025 = {
  middle3: {
    label: "중3",
    subjects: [
      { name: "국어", levelThree: 64.5, levelOne: 10.8 },
      { name: "수학", levelThree: 49.6, levelOne: 14.9 },
      { name: "영어", levelThree: 60.5, levelOne: 6.5 }
    ]
  },
  high2: {
    label: "고2",
    subjects: [
      { name: "국어", levelThree: 53.0, levelOne: 10.4 },
      { name: "수학", levelThree: 56.2, levelOne: 11.6 },
      { name: "영어", levelThree: 72.8, levelOne: 6.8 }
    ]
  }
};

const initialState = {
  schemaVersion: 15,
  activeView: "home",
  selectedStudentId: null,
  selectedHomeworkStudentId: null,
  selectedTestStudentId: null,
  selectedStaffMemberId: null,
  analyticsClassName: null,
  studentSearch: "",
  studentClassFilter: "all",
  studentEnrollmentFilter: "all",
  studentConnectionFilter: "all",
  guardianTimelineStudentId: "all",
  guardianTimelineAcademyId: "all",
  guardianGrowthStudentId: null,
  guardianGrowthAcademyId: "all",
  guardianGrowthSubject: "all",
  guardianNationalGrade: "middle3",
  guardianNotificationReads: [],
  guardianCommentReplies: [],
  academyCommentReplyReads: {},
  privacyRightsRequests: [],
  consultationStudentId: null,
  consultationSearch: "",
  consultationClassFilter: "all",
  consultationRecordFilter: "all",
  academyCommentStudentId: null,
  academyCommentSearch: "",
  academyCommentClassFilter: "all",
  academyCommentUnreadFilter: "all",
  operatorMetricWindow: "7",
  operatorUsageWindow: "7",
  operatorPilotFilter: "all",
  operatorSupportStatusFilter: "all",
  operatorSupportTypeFilter: "all",
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
      mainProgram: "중등 수학 심화·내신 대비",
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
      mainProgram: "중등 영어 독해·내신 대비",
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
    { id: "att-1", academyId: "acd-dodam", studentId: "std-minjun", className: "중등 수학 심화반", lessonDate: koreaDate(), status: "present", arrivalTime: "15:58", reason: "", checkedAt: "2026-07-27T15:58:00+09:00", checkedBy: "usr-teacher", history: [] },
    { id: "att-2", academyId: "acd-dodam", studentId: "std-harin", className: "중등 수학 심화반", lessonDate: koreaDate(), status: "late", arrivalTime: "16:08", reason: "교통 지연", checkedAt: "2026-07-27T16:08:00+09:00", checkedBy: "usr-teacher", history: [] },
    { id: "att-bridge-1", academyId: "acd-bridge", studentId: "std-minjun", className: "중등 영어 B반", lessonDate: koreaDate(), status: "present", arrivalTime: "17:55", reason: "", checkedAt: "2026-07-27T17:55:00+09:00", checkedBy: "usr-owner-2", history: [] }
  ],
  learningRecords: [
    {
      id: "lrn-1",
      academyId: "acd-dodam",
      className: "중등 수학 심화반",
      lessonDate: koreaDate(),
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
      lessonDate: koreaDate(),
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
  homeworkAssignments: [
    {
      id: "hw-1",
      academyId: "acd-dodam",
      className: "중등 수학 심화반",
      assignedDate: koreaDate(),
      title: "유형 3번 1~10번 풀기",
      statuses: [
        { studentId: "std-minjun", status: "completed", note: "" },
        { studentId: "std-harin", status: "partial", note: "7번까지 완료" }
      ],
      createdBy: "usr-teacher",
      createdAt: "2026-07-27T18:03:00+09:00"
    }
  ],
  testSettings: [
    {
      id: "tst-setting-1",
      academyId: "acd-dodam",
      className: "중등 수학 심화반",
      subject: "수학",
      frequency: "weekly_monthly",
      averageVisibility: "private",
      updatedBy: "usr-owner",
      updatedAt: "2026-07-20T11:00:00+09:00"
    }
  ],
  assessments: [
    {
      id: "asm-history-1",
      academyId: "acd-dodam",
      className: "중등 수학 심화반",
      subject: "수학",
      title: "6월 월간테스트",
      type: "monthly",
      scope: "교재 1단원",
      testDate: "2026-06-28",
      maxScore: 100,
      attempts: [
        { id: "atm-history-1", studentId: "std-harin", attemptNo: 1, status: "taken", score: 68, note: "", recordedAt: "2026-06-28T18:00:00+09:00", recordedBy: "usr-teacher" }
      ],
      scoreHistory: [],
      createdBy: "usr-teacher",
      createdAt: "2026-06-28T18:00:00+09:00"
    },
    {
      id: "asm-history-2",
      academyId: "acd-dodam",
      className: "중등 수학 심화반",
      subject: "수학",
      title: "7월 2주 주간테스트",
      type: "weekly",
      scope: "교재 2단원",
      testDate: "2026-07-11",
      maxScore: 100,
      attempts: [
        { id: "atm-history-2", studentId: "std-harin", attemptNo: 1, status: "taken", score: 74, note: "", recordedAt: "2026-07-11T18:00:00+09:00", recordedBy: "usr-teacher" }
      ],
      scoreHistory: [],
      createdBy: "usr-teacher",
      createdAt: "2026-07-11T18:00:00+09:00"
    },
    {
      id: "asm-history-3",
      academyId: "acd-dodam",
      className: "중등 수학 심화반",
      subject: "수학",
      title: "7월 3주 주간테스트",
      type: "weekly",
      scope: "교재 2~3단원",
      testDate: "2026-07-18",
      maxScore: 100,
      attempts: [
        { id: "atm-history-3", studentId: "std-harin", attemptNo: 1, status: "taken", score: 81, note: "", recordedAt: "2026-07-18T18:00:00+09:00", recordedBy: "usr-teacher" }
      ],
      scoreHistory: [],
      createdBy: "usr-teacher",
      createdAt: "2026-07-18T18:00:00+09:00"
    },
    {
      id: "asm-1",
      academyId: "acd-dodam",
      className: "중등 수학 심화반",
      subject: "수학",
      title: "7월 4주 주간테스트",
      type: "weekly",
      scope: "교재 3단원",
      testDate: "2026-07-25",
      maxScore: 100,
      attempts: [
        { id: "atm-1", studentId: "std-minjun", attemptNo: 1, status: "taken", score: 76, note: "", recordedAt: "2026-07-25T18:00:00+09:00", recordedBy: "usr-teacher" },
        { id: "atm-2", studentId: "std-harin", attemptNo: 1, status: "absent", score: null, note: "학교 행사", recordedAt: "2026-07-25T18:00:00+09:00", recordedBy: "usr-teacher" }
      ],
      scoreHistory: [],
      createdBy: "usr-teacher",
      createdAt: "2026-07-25T18:00:00+09:00"
    }
  ],
  consultationRecords: [
    {
      id: "csl-harin-1",
      academyId: "acd-dodam",
      studentId: "std-harin",
      consultationDate: "2026-07-24",
      type: "student",
      internalMemo: "수업 참여도와 질문 빈도가 좋아짐.",
      nextAction: "다음 주 오답 정리 습관 확인",
      guardianSummary: "최근 스스로 질문하고 오답을 정리하는 힘이 좋아지고 있습니다.",
      createdBy: "usr-teacher",
      createdAt: "2026-07-24T17:40:00+09:00"
    },
    {
      id: "csl-1",
      academyId: "acd-dodam",
      studentId: "std-minjun",
      consultationDate: "2026-07-26",
      type: "guardian",
      internalMemo: "최근 테스트 향상폭과 과제 수행 흐름을 함께 안내함.",
      nextAction: "8월 첫째 주 단원 목표 공유",
      guardianSummary: "일차함수 단원의 기본 개념이 안정되고 있습니다.",
      createdBy: "usr-owner",
      createdAt: "2026-07-26T14:00:00+09:00"
    }
  ],
  usageEvents: [
    { id: "evt-1", academyId: "acd-dodam", userId: "usr-guardian", type: "guardian.home_viewed", createdAt: relativeKoreaDateTime(3, "18:12:00") },
    { id: "evt-analytics-1", academyId: "acd-dodam", userId: "usr-owner", type: "academy.analytics_viewed", createdAt: relativeKoreaDateTime(3, "17:10:00") },
    { id: "evt-analytics-2", academyId: "acd-dodam", userId: "usr-owner", type: "academy.analytics_viewed", createdAt: relativeKoreaDateTime(2, "17:20:00") },
    { id: "evt-analytics-3", academyId: "acd-dodam", userId: "usr-teacher", type: "academy.analytics_viewed", createdAt: relativeKoreaDateTime(1, "12:30:00") },
    { id: "evt-analytics-filter-1", academyId: "acd-dodam", userId: "usr-owner", type: "academy.analytics_filter_used", createdAt: relativeKoreaDateTime(2, "17:21:00") },
    { id: "evt-growth-1", academyId: "acd-dodam", userId: "usr-guardian", type: "guardian.growth_viewed", createdAt: relativeKoreaDateTime(3, "20:10:00") },
    { id: "evt-growth-2", academyId: "acd-dodam", userId: "usr-guardian", type: "guardian.growth_viewed", createdAt: relativeKoreaDateTime(1, "08:40:00") },
    { id: "evt-growth-filter-1", academyId: "acd-dodam", userId: "usr-guardian", type: "guardian.growth_filter_used", createdAt: relativeKoreaDateTime(1, "08:42:00") }
  ],
  supportRequests: [
    {
      id: "req-1",
      academyId: "acd-dodam",
      type: "error",
      status: "in_progress",
      title: "출결 저장 후 일부 학생 상태가 늦게 반영됨",
      detail: "저장 직후 두 명의 상태가 이전 값으로 보여 새로고침 후 확인했습니다.",
      reporterName: "한도담",
      assigneeUserId: "usr-operator",
      resolution: "재현 조건을 확인하고 있습니다.",
      createdAt: "2026-07-29T10:20:00+09:00",
      updatedAt: "2026-07-29T13:10:00+09:00",
      history: [
        {
          status: "in_progress",
          note: "재현 조건 확인 시작",
          updatedBy: "usr-operator",
          updatedAt: "2026-07-29T13:10:00+09:00"
        }
      ]
    },
    {
      id: "req-2",
      academyId: "acd-bridge",
      type: "inquiry",
      status: "open",
      title: "서비스 도입 전 원생 CSV 형식 문의",
      detail: "기존 원생 파일의 반 이름을 그대로 사용할 수 있는지 확인이 필요합니다.",
      reporterName: "브릿지영어학원",
      assigneeUserId: null,
      resolution: "",
      createdAt: "2026-07-29T16:40:00+09:00",
      updatedAt: "2026-07-29T16:40:00+09:00",
      history: []
    },
    {
      id: "req-3",
      academyId: "acd-dodam",
      type: "inquiry",
      status: "resolved",
      title: "학부모 초대 코드 유효시간 확인",
      detail: "초대 코드 재발급 기준을 문의했습니다.",
      reporterName: "한도담",
      assigneeUserId: "usr-operator",
      resolution: "초대 코드는 발급 후 24시간 동안 유효하다고 안내했습니다.",
      createdAt: "2026-07-28T11:00:00+09:00",
      updatedAt: "2026-07-28T11:35:00+09:00",
      history: [
        {
          status: "resolved",
          note: "24시간 유효 및 재발급 방법 안내",
          updatedBy: "usr-operator",
          updatedAt: "2026-07-28T11:35:00+09:00"
        }
      ]
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
    ["home", "오늘 운영"],
    ["attendance", "출결 관리"],
    ["learning", "학습 기록"],
    ["homework", "과제 관리"],
    ["tests", "테스트 관리"],
    ["analytics", "학습 분석"],
    ["consultations", "상담 기록"],
    ["academy_comments", "학부모 소통"],
    ["students", "원생 관리"],
    ["academy", "학원 설정"],
    ["audit", "활동 기록"],
    ["support", "오류·문의"]
  ],
  academy_instructor: [
    ["home", "오늘 운영"],
    ["attendance", "출결 관리"],
    ["learning", "학습 기록"],
    ["homework", "과제 관리"],
    ["tests", "테스트 관리"],
    ["analytics", "학습 분석"],
    ["academy_comments", "학부모 소통"],
    ["students", "원생 관리"],
    ["permissions", "권한 확인"],
    ["support", "오류·문의"]
  ],
  guardian: [
    ["home", "통합 타임라인"],
    ["notifications", "알림"],
    ["growth", "성장 추이"],
    ["comments", "코멘트"],
    ["support", "오류·문의"],
    ["data", "내 정보·동의"]
  ],
  operator: [
    ["home", "운영 현황"],
    ["usage", "서비스 이용"],
    ["pilots", "학원 관리"],
    ["support", "오류·문의"],
    ["data", "공통 데이터 구조"],
    ["audit", "전체 감사 이력"]
  ]
};

const ownerNavigationGroups = [
  {
    id: "classes",
    label: "수업 관리",
    items: [
      ["attendance", "출결 관리"],
      ["learning", "학습 기록"],
      ["homework", "과제 관리"],
      ["tests", "테스트 관리"]
    ]
  },
  {
    id: "students",
    label: "원생 관리",
    items: [
      ["students", "원생 목록"],
      ["analytics", "학습 분석"],
      ["consultations", "상담 기록"],
      ["academy_comments", "학부모 소통"]
    ]
  },
  {
    id: "academy",
    label: "학원 설정",
    items: [
      ["academy", "학원 정보"],
      ["audit", "활동 기록"],
      ["support", "오류·문의"]
    ]
  }
];

const instructorNavigationGroups = [
  {
    id: "classes",
    label: "수업 관리",
    items: [
      ["attendance", "출결 관리"],
      ["learning", "학습 기록"],
      ["homework", "과제 관리"],
      ["tests", "테스트 관리"]
    ]
  },
  {
    id: "students",
    label: "원생 관리",
    items: [
      ["students", "원생 목록"],
      ["analytics", "학습 분석"],
      ["academy_comments", "학부모 소통"]
    ]
  }
];

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
      schemaVersion: 15,
      selectedStudentId: null,
      selectedHomeworkStudentId: null,
      selectedTestStudentId: null,
      selectedStaffMemberId: saved.selectedStaffMemberId || null,
      guardianTimelineStudentId: saved.guardianTimelineStudentId || "all",
      guardianTimelineAcademyId: saved.guardianTimelineAcademyId || "all",
      guardianGrowthStudentId: saved.guardianGrowthStudentId || null,
      guardianGrowthAcademyId: saved.guardianGrowthAcademyId || "all",
      guardianGrowthSubject: saved.guardianGrowthSubject || "all",
      guardianNationalGrade: nationalAchievement2025[saved.guardianNationalGrade] ? saved.guardianNationalGrade : "middle3",
      guardianNotificationReads: saved.guardianNotificationReads || [],
      guardianCommentReplies: saved.guardianCommentReplies || [],
      academyCommentReplyReads: saved.academyCommentReplyReads || {},
      privacyRightsRequests: saved.privacyRightsRequests || [],
      consultationStudentId: saved.consultationStudentId || null,
      consultationSearch: saved.consultationSearch || "",
      consultationClassFilter: saved.consultationClassFilter || "all",
      consultationRecordFilter: saved.consultationRecordFilter || "all",
      academyCommentStudentId: null,
      academyCommentSearch: saved.academyCommentSearch || "",
      academyCommentClassFilter: saved.academyCommentClassFilter || "all",
      academyCommentUnreadFilter: saved.academyCommentUnreadFilter || "all",
      operatorMetricWindow: saved.operatorMetricWindow || "7",
      operatorUsageWindow: saved.operatorUsageWindow || "7",
      operatorPilotFilter: saved.operatorPilotFilter || "all",
      operatorSupportStatusFilter: saved.operatorSupportStatusFilter || "all",
      operatorSupportTypeFilter: saved.operatorSupportTypeFilter || "all",
      students: saved.students.map(({ status: _legacyStatus, ...student }) =>
        student.id === "std-minjun" && student.name === "김민준" ? { ...student, name: "정민준" } : student
      ),
      academies: saved.academies.map((academy) => ({
        ...academy,
        businessRegistrationNumber:
          academy.businessRegistrationNumber ||
          initialState.academies.find((item) => item.id === academy.id)?.businessRegistrationNumber ||
          "",
        mainProgram:
          academy.mainProgram ||
          initialState.academies.find((item) => item.id === academy.id)?.mainProgram ||
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
      homeworkAssignments: mergeMissingById(saved.homeworkAssignments, initialState.homeworkAssignments).map((item) => ({
        ...item,
        statuses: item.statuses || []
      })),
      testSettings: mergeMissingById(saved.testSettings, initialState.testSettings),
      assessments: mergeMissingById(saved.assessments, initialState.assessments).map((item) => ({
        ...item,
        attempts: item.attempts || [],
        scoreHistory: item.scoreHistory || []
      })),
      consultationRecords: mergeMissingById(saved.consultationRecords, initialState.consultationRecords),
      usageEvents: saved.usageEvents || clone(initialState.usageEvents),
      supportRequests: mergeMissingById(saved.supportRequests, initialState.supportRequests).map(({ priority: _legacyPriority, ...item }) => ({
        ...item,
        history: item.history || [],
        resolution: item.resolution || ""
      })),
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
      "homework.saved": "과제 상태 저장",
      "assessment.saved": "테스트 결과 저장",
      "consultation.saved": "상담 기록 저장",
      "consultation.reply_added": "코멘트 답변 등록",
      "pilot.status_changed": "운영 상태 변경",
      "support.created": "오류·문의 접수",
      "support.updated": "오류·문의 처리",
      "invitation.created": "보호자 초대 발급",
      "guardian_link.verified": "보호자 연결 완료",
      "staff.permission_changed": "구성원 권한 변경",
      "staff.member_added": "구성원 추가",
      "staff.member_removed": "구성원 제외",
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

function koreaTime(value = new Date()) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(value);
}

function relativeKoreaDateTime(daysAgo, time) {
  return `${koreaDate(new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000))}T${time}+09:00`;
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
  const marker = `${type}:${currentUser()?.id}:${academyId || "all"}:${koreaDate()}`;
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
  document.querySelectorAll(".role-option[data-auth-role]").forEach((button) => {
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

function navigationItemMarkup(id, label, nested = false) {
  const unread = id === "academy_comments"
    ? academyUnreadGuardianReplies().length
    : id === "comments"
      ? guardianUnreadCommentEvents().length
      : 0;
  return `
    <button class="nav-item ${nested ? "nested" : ""} ${state.activeView === id ? "active" : ""}" data-view="${id}">
      <span>${label}</span>${unread ? `<strong class="nav-unread-count">${unread}</strong>` : ""}
    </button>`;
}

function renderGroupedNavigation(groups, trailingItems = []) {
  return `
    ${navigationItemMarkup("home", "오늘 운영")}
    ${groups
      .map((group) => {
        const expanded = group.items.some(([id]) => id === state.activeView);
        return `
          <section class="nav-group ${expanded ? "expanded" : ""}" data-nav-group-container="${group.id}">
            <button class="nav-group-toggle" type="button" data-nav-group="${group.id}" aria-expanded="${expanded}">
              <span>${group.label}</span><i aria-hidden="true">⌄</i>
            </button>
            <div class="nav-submenu ${expanded ? "" : "collapsed"}">
              ${group.items.map(([id, label]) => navigationItemMarkup(id, label, true)).join("")}
            </div>
          </section>`;
      })
      .join("")}
    ${trailingItems.map(([id, label]) => navigationItemMarkup(id, label)).join("")}
  `;
}

function toggleNavigationGroup(groupId) {
  document.querySelectorAll("[data-nav-group-container]").forEach((group) => {
    const isTarget = group.dataset.navGroupContainer === groupId;
    const shouldExpand = isTarget && !group.classList.contains("expanded");
    group.classList.toggle("expanded", shouldExpand);
    group.querySelector("[data-nav-group]").setAttribute("aria-expanded", String(shouldExpand));
    group.querySelector(".nav-submenu").classList.toggle("collapsed", !shouldExpand);
  });
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
    document.querySelector("#context-label").textContent = "";
    const linked = new Set(
      state.guardianLinks
        .filter((link) => link.guardianUserId === user.id && link.status === "verified")
        .map((link) => link.studentId)
    ).size;
    contextName.textContent = `${user.name} 학부모`;
    document.querySelector("#context-detail").textContent = `연결 자녀 ${linked}명`;
  } else {
    document.querySelector("#context-label").textContent = "";
    contextName.textContent = user.name;
    document.querySelector("#context-detail").textContent = `등록 학원 수 ${state.academies.length}`;
  }

  const allowedViews = navigation[role];
  if (!allowedViews.some(([id]) => id === state.activeView)) state.activeView = allowedViews[0][0];
  document.querySelector("#main-nav").innerHTML =
    role === "academy_owner"
      ? renderGroupedNavigation(ownerNavigationGroups)
      : role === "academy_instructor"
        ? renderGroupedNavigation(instructorNavigationGroups, [["permissions", "내 권한"], ["support", "오류·문의"]])
      : allowedViews.map(([id, label]) => navigationItemMarkup(id, label)).join("");
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
    homework: renderHomework,
    tests: renderTests,
    analytics: renderAnalytics,
    growth: renderGuardianGrowth,
    comments: renderGuardianComments,
    academy_comments: renderAcademyComments,
    notifications: renderGuardianNotifications,
    consultations: renderConsultations,
    students: renderStudents,
    permissions: renderPermissions,
    pilots: renderPilots,
    support: renderSupport,
    usage: renderOperatorUsage,
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
  return `
    <section class="grid four horizontal-metrics">
      ${metricCard("오늘 수업", `${classNames.length}개 반`, "", false)}
      ${metricCard("출결 처리율", `${attendance.length}/${activeEnrollments.length}`, "", true)}
      ${metricCard("학습기록", `${learning.length}/${classNames.length}`, "", false)}
      ${metricCard("보호자 연결", `${connected}/${academyEnrollments.length}`, "")}
    </section>

    <article class="panel">
      <div class="panel-head"><div><h2>반별 운영 현황</h2></div>${hasPermission("csv.import") ? '<button class="button secondary compact" data-action="open-csv-modal">CSV 가져오기</button>' : ""}</div>
      <div class="table-wrap record-scroll">
        <table class="data-table">
          <thead><tr><th>반</th><th>원생</th><th>출결</th><th>학습기록</th><th>과제</th><th>테스트</th><th>바로가기</th></tr></thead>
          <tbody>
            ${classNames.map((className) => {
              const classEnrollments = activeEnrollments.filter((item) => item.className === className);
              const classAttendance = attendance.filter((item) => item.className === className).length;
              const classLearning = learning.some((item) => item.className === className);
              const classHomework = state.homeworkAssignments.find(
                (item) =>
                  item.academyId === academy.id &&
                  item.className === className &&
                  item.assignedDate === today
              );
              const homeworkExceptions = (classHomework?.statuses || []).filter(
                (item) => item.status !== "completed"
              ).length;
              const classTest = state.assessments.find(
                (item) =>
                  item.academyId === academy.id &&
                  item.className === className &&
                  item.testDate === today
              );
              return `<tr>
                <td><strong>${escapeHtml(className)}</strong></td>
                <td>${classEnrollments.length}명</td>
                <td><span class="badge ${classAttendance === classEnrollments.length ? "green" : "orange"}">${classAttendance}/${classEnrollments.length}</span></td>
                <td><span class="badge ${classLearning ? "green" : "gray"}">${classLearning ? "입력 완료" : "미입력"}</span></td>
                <td><span class="badge ${classHomework ? homeworkExceptions ? "orange" : "green" : "gray"}">${classHomework ? homeworkExceptions ? `예외 ${homeworkExceptions}명` : "전원 완료" : "미입력"}</span></td>
                <td><span class="badge ${classTest ? "orange" : "gray"}">${classTest ? "결과 확인" : "일정 없음"}</span></td>
                <td><div class="row-actions"><button class="button tertiary compact" data-view-target="attendance">출결</button><button class="button tertiary compact" data-view-target="learning">학습</button><button class="button tertiary compact" data-view-target="homework">과제</button></div></td>
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
        <div><h2>반별 출결 체크</h2></div>
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
        <div class="table-wrap record-scroll">
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
        <div class="attendance-save-bar action-only">
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
        <div><h2>일별 학습기록</h2></div>
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
          </aside>
        </div>
        <input type="hidden" name="class-name" value="${escapeHtml(className)}" />
        <input type="hidden" name="lesson-date" value="${lessonDate}" />
        <div class="form-actions"><button class="button primary" type="submit">${existing ? "수정 저장" : "학습기록 저장"}</button></div>
      </form>
    </article>
  `;
}

function homeworkStatusLabel(status) {
  return (
    {
      completed: "완료",
      partial: "일부 완료",
      incomplete: "미완료",
      missing: "미제출",
      exempt: "면제",
      replacement: "대체"
    }[status] || "완료"
  );
}

function homeworkStatusTone(status) {
  if (status === "completed") return "green";
  if (["partial", "replacement"].includes(status)) return "orange";
  if (["incomplete", "missing"].includes(status)) return "red";
  return "gray";
}

function renderHomework() {
  setPage("학원 운영", "과제 관리");
  const academy = currentAcademy();
  const classes = academyClassNames();
  if (!classes.length) {
    return '<article class="panel"><div class="empty-state">담당 반에 과제를 입력할 재원 원생이 없습니다.</div></article>';
  }
  const focusedEnrollment = state.selectedHomeworkStudentId
    ? accessibleAcademyEnrollments().find(
        (item) => item.studentId === state.selectedHomeworkStudentId && item.status === "active"
      )
    : null;
  const focusedStudent = focusedEnrollment ? studentById(focusedEnrollment.studentId) : null;
  const className =
    focusedEnrollment?.className ||
    (classes.includes(state.selectedHomeworkClass) ? state.selectedHomeworkClass : classes[0]);
  const latest = state.homeworkAssignments
    .filter((item) => item.academyId === academy.id && item.className === className)
    .sort((a, b) => b.assignedDate.localeCompare(a.assignedDate))[0];
  const assignedDate = state.selectedHomeworkDate || latest?.assignedDate || koreaDate();
  const existing = state.homeworkAssignments.find(
    (item) => item.academyId === academy.id && item.className === className && item.assignedDate === assignedDate
  );
  const classEnrollments = state.enrollments.filter(
    (item) => item.academyId === academy.id && item.className === className && item.status === "active"
  );
  const enrollments = focusedStudent
    ? classEnrollments.filter((item) => item.studentId === focusedStudent.id)
    : classEnrollments;
  const statusFor = (studentId) =>
    existing?.statuses?.find((item) => item.studentId === studentId)?.status || "completed";
  const completed = enrollments.filter((item) => statusFor(item.studentId) === "completed").length;
  const exceptions = Math.max(enrollments.length - completed, 0);
  const statusFilter = [
    "completed",
    "partial",
    "incomplete",
    "missing",
    "exempt",
    "replacement"
  ].includes(state.homeworkStatusFilter)
    ? state.homeworkStatusFilter
    : "all";
  const visibleEnrollments =
    statusFilter === "all"
      ? enrollments
      : enrollments.filter((item) => statusFor(item.studentId) === statusFilter);

  return `
    <section class="grid four horizontal-metrics homework-metrics">
      ${metricCard("과제 대상", `${enrollments.length}명`, "", false, true)}
      ${metricCard("완료", `${completed}명`, "")}
      ${metricCard("예외 확인", `${exceptions}명`, "", exceptions > 0)}
      ${metricCard("최근 확인일", existing?.assignedDate || "미입력", "", false, true)}
    </section>
    <article class="panel">
      <div class="panel-head">
        <div><h2>${focusedStudent ? `${escapeHtml(focusedStudent.name)} 과제 수행` : "학생별 과제 수행"}</h2></div>
        <div class="compact-filters">
          ${
            focusedStudent
              ? '<button class="button secondary compact" type="button" data-action="clear-homework-student">전체 학생 보기</button>'
              : `<select id="homework-class" aria-label="과제 반 선택">${classes.map((item) => `<option ${item === className ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select>`
          }
          <input id="homework-date" type="date" value="${assignedDate}" aria-label="과제 확인일 선택" />
        </div>
      </div>
      <form id="homework-form">
        <div class="form-grid homework-head-fields">
          <div class="full"><label for="homework-title">과제명</label><input id="homework-title" name="title" required value="${escapeHtml(existing?.title || latest?.title || "")}" placeholder="예: 유형 3번 1~10번 풀기" /></div>
        </div>
        <div class="table-wrap record-scroll">
          <table class="data-table phase-three-table homework-table">
            <colgroup>
              <col class="homework-col-selection" />
              <col class="homework-col-student" />
              <col class="homework-col-status" />
              <col class="homework-col-note" />
              <col class="homework-col-current" />
            </colgroup>
            <thead><tr>
              <th class="selection-column">
                <label class="homework-select-all-label">
                  <input id="homework-select-all" type="checkbox" />
                  <span>전체</span>
                  <small id="homework-selected-count">0명</small>
                </label>
              </th>
              <th>학생</th>
              <th class="homework-status-header">
                <select id="homework-bulk-status" class="homework-header-select" aria-label="선택 학생 수행 상태 일괄 변경">
                  <option value="">수행 상태</option>
                  ${["completed", "partial", "incomplete", "missing", "exempt", "replacement"].map((item) => `<option value="${item}">${homeworkStatusLabel(item)}</option>`).join("")}
                </select>
              </th>
              <th>예외 메모</th>
              <th class="homework-current-header">
                <select id="homework-status-filter" class="homework-header-select" aria-label="과제 상태 필터">
                  <option value="all" ${statusFilter === "all" ? "selected" : ""}>상태 필터</option>
                  ${["completed", "partial", "incomplete", "missing", "exempt", "replacement"].map((item) => `<option value="${item}" ${statusFilter === item ? "selected" : ""}>${homeworkStatusLabel(item)}</option>`).join("")}
                </select>
              </th>
            </tr></thead>
            <tbody>
              ${visibleEnrollments.map((enrollment) => {
                const student = studentById(enrollment.studentId);
                const saved = existing?.statuses?.find((item) => item.studentId === student.id);
                const status = saved?.status || "completed";
                return `<tr>
                  <td class="selection-column"><input class="homework-row-check" type="checkbox" data-student-id="${student.id}" aria-label="${escapeHtml(student.name)} 선택" /></td>
                  <td><strong>${escapeHtml(student.name)}</strong></td>
                  <td><select class="homework-status-select" name="homework-status-${student.id}" data-student-id="${student.id}" aria-label="${escapeHtml(student.name)} 과제 상태">
                    ${["completed", "partial", "incomplete", "missing", "exempt", "replacement"].map((item) => `<option value="${item}" ${item === status ? "selected" : ""}>${homeworkStatusLabel(item)}</option>`).join("")}
                  </select></td>
                  <td><input name="homework-note-${student.id}" value="${escapeHtml(saved?.note || "")}" placeholder="예외 학생만 입력" aria-label="${escapeHtml(student.name)} 과제 메모" /></td>
                  <td><span class="badge ${homeworkStatusTone(status)}" data-homework-current="${student.id}">${homeworkStatusLabel(status)}</span></td>
                </tr>`;
              }).join("") || '<tr><td colspan="5"><div class="empty-state">선택한 상태의 학생이 없습니다.</div></td></tr>'}
            </tbody>
          </table>
        </div>
        <input type="hidden" name="class-name" value="${escapeHtml(className)}" />
        <input type="hidden" name="assigned-date" value="${assignedDate}" />
        <div class="attendance-save-bar action-only">
          <button class="button primary" type="submit">${existing ? "과제 상태 수정" : "과제 상태 저장"}</button>
        </div>
      </form>
    </article>
  `;
}

function testStatusLabel(status) {
  return ({ taken: "응시", absent: "결시", exempt: "면제" })[status] || "응시";
}

function renderTests() {
  setPage("학원 운영", "테스트 관리");
  const academy = currentAcademy();
  const classes = academyClassNames();
  if (!classes.length) {
    return '<article class="panel"><div class="empty-state">담당 반에 테스트를 입력할 재원 원생이 없습니다.</div></article>';
  }
  const focusedEnrollment = state.selectedTestStudentId
    ? accessibleAcademyEnrollments().find(
        (item) => item.studentId === state.selectedTestStudentId && item.status === "active"
      )
    : null;
  const focusedStudent = focusedEnrollment ? studentById(focusedEnrollment.studentId) : null;
  const className =
    focusedEnrollment?.className ||
    (classes.includes(state.selectedTestClass) ? state.selectedTestClass : classes[0]);
  const setting = state.testSettings.find(
    (item) => item.academyId === academy.id && item.className === className
  );
  const classAssessments = state.assessments
    .filter((item) => item.academyId === academy.id && item.className === className)
    .sort((a, b) => b.testDate.localeCompare(a.testDate));
  const assessment = state.selectedAssessmentId
    ? classAssessments.find((item) => item.id === state.selectedAssessmentId)
    : classAssessments[0];
  const classEnrollments = state.enrollments.filter(
    (item) => item.academyId === academy.id && item.className === className && item.status === "active"
  );
  const enrollments = focusedStudent
    ? classEnrollments.filter((item) => item.studentId === focusedStudent.id)
    : classEnrollments;
  const metricAttempts = focusedStudent
    ? (assessment?.attempts || []).filter((item) => item.studentId === focusedStudent.id)
    : assessment?.attempts || [];
  const firstScores = metricAttempts.filter(
    (item) => item.attemptNo === 1 && item.status === "taken" && Number.isFinite(item.score)
  );
  const average = firstScores.length
    ? Math.round(firstScores.reduce((sum, item) => sum + item.score, 0) / firstScores.length)
    : null;
  const absentCount = metricAttempts.filter(
    (item) => item.attemptNo === 1 && item.status === "absent"
  ).length;
  const assessmentCount = focusedStudent
    ? classAssessments.filter((item) =>
        item.attempts?.some((attempt) => attempt.studentId === focusedStudent.id)
      ).length
    : classAssessments.length;

  return `
    <section class="grid four horizontal-metrics test-metrics">
      ${metricCard("사용 주기", ({ none: "미사용", weekly: "주간", monthly: "월간", weekly_monthly: "주간+월간", irregular: "비정기" })[setting?.frequency] || "미설정", "", false, true)}
      ${metricCard("1차 반 평균", average === null ? "미집계" : `${average}점`, "", false, true)}
      ${metricCard("결시", `${absentCount}명`, "", absentCount > 0)}
      ${metricCard("저장된 평가", `${assessmentCount}회`, "")}
    </section>
    <article class="panel">
      <div class="panel-head">
        <div><h2>${focusedStudent ? `${escapeHtml(focusedStudent.name)} 테스트 결과` : "주·월 테스트 결과"}</h2></div>
        <div class="compact-filters">
          ${
            focusedStudent
              ? '<button class="button secondary compact" type="button" data-action="clear-test-student">전체 학생 보기</button>'
              : `<select id="test-class" aria-label="테스트 반 선택">${classes.map((item) => `<option ${item === className ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select>`
          }
          <select id="assessment-select" aria-label="평가 선택">
            <option value="">${focusedStudent ? "평가 선택" : "새 평가 입력"}</option>
            ${classAssessments.map((item) => `<option value="${item.id}" ${assessment?.id === item.id ? "selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}
          </select>
        </div>
      </div>
      <form id="test-form">
        <div class="settings-strip">
          <div><label for="test-frequency">반·과목 사용 설정</label><select id="test-frequency" name="frequency">
            ${[["none", "미사용"], ["weekly", "주간"], ["monthly", "월간"], ["weekly_monthly", "주간+월간"], ["irregular", "비정기"]].map(([value, label]) => `<option value="${value}" ${setting?.frequency === value ? "selected" : ""}>${label}</option>`).join("")}
          </select></div>
          <div><label for="test-subject">과목</label><input id="test-subject" name="subject" required value="${escapeHtml(assessment?.subject || setting?.subject || "수학")}" /></div>
          <div><label for="test-visibility">반 평균 공개</label><select id="test-visibility" name="average-visibility"><option value="private" ${setting?.averageVisibility !== "guardian" ? "selected" : ""}>비공개</option><option value="guardian" ${setting?.averageVisibility === "guardian" ? "selected" : ""}>보호자 공개</option></select></div>
        </div>
        <div class="form-grid test-meta-fields">
          <div><label for="test-title">평가명</label><input id="test-title" name="title" required value="${escapeHtml(assessment?.title || "")}" placeholder="예: 7월 4주 주간테스트" /></div>
          <div><label for="test-type">유형</label><select id="test-type" name="type"><option value="weekly" ${assessment?.type !== "monthly" && assessment?.type !== "irregular" ? "selected" : ""}>주간</option><option value="monthly" ${assessment?.type === "monthly" ? "selected" : ""}>월간</option><option value="irregular" ${assessment?.type === "irregular" ? "selected" : ""}>비정기</option></select></div>
          <div><label for="test-date">시행일</label><input id="test-date" name="test-date" type="date" required value="${assessment?.testDate || koreaDate()}" /></div>
          <div><label for="test-max-score">만점</label><input id="test-max-score" name="max-score" type="number" min="1" required value="${assessment?.maxScore || 100}" /></div>
          <div class="full"><label for="test-scope">평가 범위</label><input id="test-scope" name="scope" required value="${escapeHtml(assessment?.scope || "")}" placeholder="예: 교재 3단원" /></div>
        </div>
        <div class="table-wrap record-scroll">
          <table class="data-table phase-three-table test-result-table">
            <thead><tr><th>학생</th><th>1차 상태</th><th>1차 점수</th><th>결시·관찰 메모</th><th>재시험 점수</th><th>시도</th></tr></thead>
            <tbody>
              ${enrollments.map((enrollment) => {
                const student = studentById(enrollment.studentId);
                const attempts = (assessment?.attempts || []).filter((item) => item.studentId === student.id).sort((a, b) => a.attemptNo - b.attemptNo);
                const first = attempts.find((item) => item.attemptNo === 1);
                const latestRetest = attempts.filter((item) => item.attemptNo > 1).at(-1);
                return `<tr>
                  <td><strong>${escapeHtml(student.name)}</strong></td>
                  <td><select name="test-status-${student.id}" aria-label="${escapeHtml(student.name)} 응시 상태"><option value="taken" ${first?.status !== "absent" && first?.status !== "exempt" ? "selected" : ""}>응시</option><option value="absent" ${first?.status === "absent" ? "selected" : ""}>결시</option><option value="exempt" ${first?.status === "exempt" ? "selected" : ""}>면제</option></select></td>
                  <td><input name="test-score-${student.id}" type="number" min="0" max="${assessment?.maxScore || 100}" value="${first?.score ?? ""}" aria-label="${escapeHtml(student.name)} 1차 점수" /></td>
                  <td><input name="test-note-${student.id}" value="${escapeHtml(first?.note || "")}" placeholder="결시 사유·관찰" aria-label="${escapeHtml(student.name)} 결시·관찰 메모" /></td>
                  <td><input name="retest-score-${student.id}" type="number" min="0" max="${assessment?.maxScore || 100}" value="" placeholder="${Number.isFinite(latestRetest?.score) ? `최근 ${latestRetest.score}점` : "점수 입력"}" aria-label="${escapeHtml(student.name)} 재시험 점수" /></td>
                  <td><span class="badge ${attempts.length > 1 ? "orange" : first ? "green" : "gray"}">${attempts.length ? `${attempts.length}회` : "미입력"}</span></td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
        <input type="hidden" name="class-name" value="${escapeHtml(className)}" />
        <input type="hidden" name="assessment-id" value="${assessment?.id || ""}" />
        <div class="attendance-save-bar action-only">
          <button class="button primary" type="submit">테스트 결과 저장</button>
        </div>
      </form>
      ${assessment?.scoreHistory?.length && currentRole() === "academy_owner" ? `<div class="history-summary"><strong>점수 수정이력 ${assessment.scoreHistory.length}건</strong><button class="button tertiary compact" data-action="view-score-history" data-assessment-id="${assessment.id}">이력 보기</button></div>` : ""}
    </article>
  `;
}

function analyticsPeriodBounds(period, academyId) {
  const dates = [
    ...state.attendanceRecords.filter((item) => item.academyId === academyId).map((item) => item.lessonDate),
    ...state.homeworkAssignments.filter((item) => item.academyId === academyId).map((item) => item.assignedDate),
    ...state.assessments.filter((item) => item.academyId === academyId).map((item) => item.testDate),
    ...state.learningRecords.filter((item) => item.academyId === academyId).map((item) => item.lessonDate)
  ].filter(Boolean).sort();
  const end = dates.at(-1) || koreaDate();
  if (period === "cumulative") return { start: null, end };
  const endDate = new Date(`${end}T00:00:00+09:00`);
  if (period === "weekly") endDate.setDate(endDate.getDate() - 6);
  else endDate.setDate(1);
  return { start: koreaDate(endDate), end };
}

function analyticsSnapshot(studentId, period) {
  const academy = currentAcademy();
  const enrollment = accessibleAcademyEnrollments().find((item) => item.studentId === studentId);
  const { start, end } = analyticsPeriodBounds(period, academy.id);
  const inRange = (date) => date <= end && (!start || date >= start);
  const attendance = state.attendanceRecords.filter(
    (item) => item.academyId === academy.id && item.studentId === studentId && inRange(item.lessonDate)
  );
  const attended = attendance.filter((item) => ["present", "late", "early_leave"].includes(item.status)).length;
  const homework = state.homeworkAssignments
    .filter((item) => item.academyId === academy.id && inRange(item.assignedDate))
    .flatMap((item) => item.statuses.filter((status) => status.studentId === studentId));
  const homeworkEligible = homework.filter((item) => item.status !== "exempt");
  const homeworkCompleted = homeworkEligible.filter((item) => ["completed", "replacement"].includes(item.status)).length;
  const attempts = state.assessments
    .filter((item) => item.academyId === academy.id && inRange(item.testDate))
    .sort((a, b) => a.testDate.localeCompare(b.testDate))
    .flatMap((item) =>
      item.attempts
        .filter((attempt) => attempt.studentId === studentId && attempt.status === "taken" && Number.isFinite(attempt.score))
        .map((attempt) => ({ ...attempt, normalized: Math.round((attempt.score / item.maxScore) * 100), title: item.title }))
    );
  const learning = state.learningRecords.filter(
    (item) => item.academyId === academy.id && item.className === enrollment?.className && inRange(item.lessonDate)
  );
  const attendanceRate = attendance.length ? Math.round((attended / attendance.length) * 100) : null;
  const homeworkRate = homeworkEligible.length ? Math.round((homeworkCompleted / homeworkEligible.length) * 100) : null;
  const latestScore = attempts.at(-1)?.normalized ?? null;
  const scoreDelta = attempts.length > 1 ? latestScore - attempts[0].normalized : null;
  const rangeLabel = start ? `${start} ~ ${end}` : `최초 기록 ~ ${end}`;
  const latestConsultation = state.consultationRecords
    .filter((item) => item.academyId === academy.id && item.studentId === studentId)
    .sort((a, b) => b.consultationDate.localeCompare(a.consultationDate))[0];
  return {
    enrollment,
    attendanceRate,
    attended,
    attendanceTotal: attendance.length,
    homeworkRate,
    latestScore,
    scoreDelta,
    learning,
    homeworkCompleted,
    homeworkEligible,
    attempts,
    latestConsultation,
    rangeLabel
  };
}

function classAnalyticsSnapshot(className, period) {
  const enrollments = accessibleAcademyEnrollments().filter(
    (item) => item.status === "active" && item.className === className
  );
  const students = enrollments.map((enrollment) => ({
    enrollment,
    student: studentById(enrollment.studentId),
    snapshot: analyticsSnapshot(enrollment.studentId, period)
  }));
  const attendanceTotal = students.reduce((sum, item) => sum + item.snapshot.attendanceTotal, 0);
  const attended = students.reduce((sum, item) => sum + item.snapshot.attended, 0);
  const homeworkTotal = students.reduce((sum, item) => sum + item.snapshot.homeworkEligible.length, 0);
  const homeworkCompleted = students.reduce((sum, item) => sum + item.snapshot.homeworkCompleted, 0);
  const scores = students.map((item) => item.snapshot.latestScore).filter(Number.isFinite);
  const deltas = students.map((item) => item.snapshot.scoreDelta).filter(Number.isFinite);
  const average = (values) => values.length
    ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
    : null;
  const distribution = [
    { label: "90점 이상", count: scores.filter((score) => score >= 90).length },
    { label: "80~89점", count: scores.filter((score) => score >= 80 && score < 90).length },
    { label: "70~79점", count: scores.filter((score) => score >= 70 && score < 80).length },
    { label: "70점 미만", count: scores.filter((score) => score < 70).length }
  ];
  const { start, end } = analyticsPeriodBounds(period, currentAcademy().id);
  return {
    students,
    attendanceRate: attendanceTotal ? Math.round((attended / attendanceTotal) * 100) : null,
    homeworkRate: homeworkTotal ? Math.round((homeworkCompleted / homeworkTotal) * 100) : null,
    averageScore: average(scores),
    averageDelta: average(deltas),
    scoreCount: scores.length,
    distribution,
    rangeLabel: start ? `${start} ~ ${end}` : `최초 기록 ~ ${end}`
  };
}

function renderAnalyticsMetrics(snapshot, embedded = false) {
  return `<section class="grid four horizontal-metrics analytics-metrics ${embedded ? "embedded" : ""}">
      ${metricCard("출석률", snapshot.attendanceRate === null ? "데이터 부족" : `${snapshot.attendanceRate}%`, "", false, true)}
      ${metricCard("과제 수행률", snapshot.homeworkRate === null ? "데이터 부족" : `${snapshot.homeworkRate}%`, "", snapshot.homeworkRate !== null && snapshot.homeworkRate < 70, true)}
      ${metricCard("평가 성취도", snapshot.latestScore === null ? "테스트 미사용" : `${snapshot.latestScore}점`, "", false, true)}
      ${metricCard("교재 진도 기록", `${snapshot.learning.length}회`, "")}
    </section>`;
}

function renderAnalyticsBody(studentId, period, includeMetrics = true) {
  const snapshot = analyticsSnapshot(studentId, period);
  return `
    ${includeMetrics ? renderAnalyticsMetrics(snapshot) : ""}
    <section class="analytics-summary-panel analytics-group-section">
      <div class="panel-head"><div><h2>학습 현황 요약</h2></div><span class="badge green">${period === "weekly" ? "주간" : period === "monthly" ? "월간" : "누적"} 자동 집계</span></div>
      <div class="summary-strip phase-three-summary">
        <div class="summary-cell"><span>수업 기록</span><strong>${snapshot.learning.length}회</strong></div>
        <div class="summary-cell"><span>과제</span><strong>${snapshot.homeworkCompleted}/${snapshot.homeworkEligible.length || 0}회</strong></div>
        <div class="summary-cell"><span>테스트 시도</span><strong>${snapshot.attempts.length}회</strong></div>
        <div class="summary-cell"><span>향상폭</span><strong>${snapshot.scoreDelta === null ? "자료 부족" : `${snapshot.scoreDelta >= 0 ? "+" : ""}${snapshot.scoreDelta}점`}</strong></div>
      </div>
      ${snapshot.learning.length ? `<div class="analysis-list">${snapshot.learning.slice(-4).reverse().map((item) => `<div><span>${item.lessonDate}</span><strong>${escapeHtml(item.textbook)} · ${escapeHtml(item.unit)}</strong><small>${escapeHtml(item.pages)}</small></div>`).join("")}</div>` : '<div class="empty-state compact-empty">선택 기간의 학습기록이 없습니다.</div>'}
    </section>
  `;
}

function renderClassAnalyticsBody(className, period) {
  const snapshot = classAnalyticsSnapshot(className, period);
  return `
    <section class="grid four horizontal-metrics analytics-metrics class-analytics-metrics analytics-group-section">
      ${metricCard("평균 점수", snapshot.averageScore === null ? "테스트 미사용" : `${snapshot.averageScore}점`, `${snapshot.scoreCount}/${snapshot.students.length}명`, false, true)}
      ${metricCard("과제 수행률", snapshot.homeworkRate === null ? "데이터 부족" : `${snapshot.homeworkRate}%`, "반 전체 과제 기준", snapshot.homeworkRate !== null && snapshot.homeworkRate < 70, true)}
      ${metricCard("출석률", snapshot.attendanceRate === null ? "데이터 부족" : `${snapshot.attendanceRate}%`, "반 전체 출결 기준", false, true)}
      ${metricCard("평균 향상도", snapshot.averageDelta === null ? "자료 부족" : `${snapshot.averageDelta >= 0 ? "+" : ""}${snapshot.averageDelta}점`, "첫 평가 대비 최근 평가", false, true)}
    </section>
    <section class="class-analytics-panel analytics-group-section">
      <div class="panel-head">
        <div><h2>점수 분포</h2><p>최근 평가가 있는 ${snapshot.scoreCount}/${snapshot.students.length}명 기준</p></div>
        <span class="badge green">${period === "weekly" ? "주간" : period === "monthly" ? "월간" : "누적"} 자동 집계</span>
      </div>
      <div class="class-score-distribution">
        ${snapshot.distribution.map((item) => {
          const width = snapshot.scoreCount ? Math.round((item.count / snapshot.scoreCount) * 100) : 0;
          return `<div class="score-distribution-item" data-score-band="${escapeHtml(item.label)}">
            <div><span>${escapeHtml(item.label)}</span><strong>${item.count}명</strong></div>
            <span class="score-distribution-bar"><i style="width: ${width}%"></i></span>
          </div>`;
        }).join("")}
      </div>
    </section>
  `;
}

function renderComparisonMetric(label, studentValue, classValue, suffix, emptyLabel = "데이터 부족") {
  const studentDisplay = Number.isFinite(studentValue)
    ? `${studentValue >= 0 && label === "향상도" ? "+" : ""}${studentValue}${suffix}`
    : emptyLabel;
  const classDisplay = Number.isFinite(classValue)
    ? `${classValue >= 0 && label === "향상도" ? "+" : ""}${classValue}${suffix}`
    : emptyLabel;
  const difference = Number.isFinite(studentValue) && Number.isFinite(classValue)
    ? studentValue - classValue
    : null;
  const differenceSuffix = suffix === "%" ? "%p" : suffix;
  const differenceLabel = difference === null
    ? "비교 자료 부족"
    : difference === 0
      ? "동일"
      : `${difference > 0 ? "+" : ""}${difference}${differenceSuffix}`;
  const differenceTone = difference === null || difference === 0 ? "neutral" : difference > 0 ? "positive" : "negative";
  return `<article class="metric-card comparison-metric-card textual">
    <span>${escapeHtml(label)}</span>
    <strong>${studentDisplay}</strong>
    <small class="comparison-summary ${differenceTone}">반 기준 ${classDisplay} (${differenceLabel})</small>
  </article>`;
}

function renderStudentClassComparison(studentId, period, classSnapshot) {
  const student = studentById(studentId);
  const snapshot = analyticsSnapshot(studentId, period);
  return `
    <section class="student-comparison-panel analytics-group-section">
      <div class="selected-student-context"><strong>${escapeHtml(student?.name || "원생")}</strong><span>${escapeHtml(snapshot.enrollment?.className || "")} · ${snapshot.rangeLabel}</span></div>
      <section class="grid four horizontal-metrics analytics-metrics student-comparison-metrics">
        ${renderComparisonMetric("출석률", snapshot.attendanceRate, classSnapshot.attendanceRate, "%")}
        ${renderComparisonMetric("과제 수행률", snapshot.homeworkRate, classSnapshot.homeworkRate, "%")}
        ${renderComparisonMetric("평가 성취도", snapshot.latestScore, classSnapshot.averageScore, "점", "테스트 미사용")}
        ${renderComparisonMetric("향상도", snapshot.scoreDelta, classSnapshot.averageDelta, "점", "자료 부족")}
      </section>
    </section>
  `;
}

function analyticsPeriodTabs(period) {
  return `<div class="period-tabs">
    ${[["weekly", "주간"], ["monthly", "월간"], ["cumulative", "누적"]].map(([value, label]) => `<button class="tab-button ${period === value ? "active" : ""}" data-action="analytics-period" data-period="${value}">${label}</button>`).join("")}
  </div>`;
}

function renderStudentAnalytics(studentId) {
  const period = ["weekly", "monthly", "cumulative"].includes(state.analyticsPeriod)
    ? state.analyticsPeriod
    : "monthly";
  const snapshot = analyticsSnapshot(studentId, period);
  return `<section class="student-analytics-section">
    <article class="panel analytics-control-panel">
      <div class="panel-head">
        <div><h2>학습 분석</h2><p>${escapeHtml(snapshot.enrollment?.className || "")} · ${snapshot.rangeLabel}</p></div>
      </div>
      ${analyticsPeriodTabs(period)}
      ${renderAnalyticsMetrics(snapshot, true)}
      <section class="panel-subsection student-recent-learning">
        <h3 class="panel-subsection-title">최근 학습 기록</h3>
        ${snapshot.learning.length ? `<div class="analysis-list">${snapshot.learning.slice(-4).reverse().map((item) => `<div><span>${item.lessonDate}</span><strong>${escapeHtml(item.textbook)} · ${escapeHtml(item.unit)}</strong><small>${escapeHtml(item.pages)}</small></div>`).join("")}</div>` : '<div class="empty-state compact-empty">선택 기간의 학습기록이 없습니다.</div>'}
      </section>
    </article>
  </section>`;
}

function renderAnalytics() {
  setPage("학원 운영", "학습 분석");
  const classes = academyClassNames();
  if (!classes.length) {
    return '<article class="panel"><div class="empty-state">분석할 재원 원생이 없습니다.</div></article>';
  }
  trackUsageOnce("academy.analytics_viewed", currentAcademy().id);
  const className = classes.includes(state.analyticsClassName) ? state.analyticsClassName : classes[0];
  const enrollments = accessibleAcademyEnrollments().filter(
    (item) => item.status === "active" && item.className === className
  );
  const selectedId = enrollments.some((item) => item.studentId === state.analyticsStudentId)
    ? state.analyticsStudentId
    : enrollments[0]?.studentId;
  if (!selectedId) {
    return '<article class="panel"><div class="empty-state">선택한 반에 분석할 재원 원생이 없습니다.</div></article>';
  }
  const period = ["weekly", "monthly", "cumulative"].includes(state.analyticsPeriod)
    ? state.analyticsPeriod
    : "monthly";
  const classSnapshot = classAnalyticsSnapshot(className, period);
  return `
    <article class="panel analytics-control-panel">
      <div class="panel-head analytics-control-head">
        <div class="analytics-class-control">
          <label for="analytics-class">반별 학습 분석 ·</label>
          <select id="analytics-class" class="analytics-class-heading" aria-label="분석 반 선택">${classes.map((item) => `<option value="${escapeHtml(item)}" ${item === className ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}</select>
          <p>(${classSnapshot.rangeLabel})</p>
        </div>
        ${analyticsPeriodTabs(period)}
      </div>
    </article>
    <section class="analytics-comparison-layout">
      <section class="analytics-group-panel class-analytics-column">
        <header class="analytics-group-head"><h2>반 전체 현황</h2><span class="badge green">${classSnapshot.students.length}명</span></header>
        ${renderClassAnalyticsBody(className, period)}
      </section>
      <section class="analytics-group-panel student-analytics-column">
        <header class="analytics-group-head">
          <h2>원생별 분석</h2>
          <select id="analytics-student" aria-label="분석 원생 선택">${enrollments.map((item) => `<option value="${item.studentId}" ${item.studentId === selectedId ? "selected" : ""}>${escapeHtml(studentById(item.studentId)?.name)}</option>`).join("")}</select>
        </header>
        ${renderStudentClassComparison(selectedId, period, classSnapshot)}
        ${renderAnalyticsBody(selectedId, period, false)}
      </section>
    </section>
  `;
}

function consultationTypeLabel(type) {
  return ({ guardian: "학부모 상담", student: "학생 상담", internal: "내부 협의" })[type] || "상담";
}

function commentRepliesFor(consultationId) {
  return state.guardianCommentReplies
    .filter((item) => item.consultationId === consultationId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function renderCommentReplies(consultation, context) {
  const replies = commentRepliesFor(consultation.id);
  const isGuardian = context === "guardian";
  const guardianReadIds = new Set(state.guardianNotificationReads);
  return `
    <section class="comment-thread">
      <div class="comment-thread-list">
        ${replies.map((reply) => {
          const author = userById(reply.authorUserId);
          const isUnread = isGuardian && reply.authorRole === "academy" && !guardianReadIds.has(`reply-${reply.id}`);
          const authorLabel = reply.authorRole === "guardian"
            ? `학부모 ${author?.name || ""}`.trim()
            : userRoleName(author);
          return `
            <div class="comment-reply ${reply.authorRole === "guardian" ? "guardian-reply" : "academy-reply"} ${isUnread ? "unread" : ""}">
              <div><strong>${escapeHtml(authorLabel)}</strong><time>${formatDateTime(reply.createdAt)}</time></div>
              <p>${escapeHtml(reply.body)}</p>
            </div>`;
        }).join("") || '<p class="comment-thread-empty">아직 등록된 답변이 없습니다.</p>'}
      </div>
      <form class="comment-reply-form" data-reply-context="${context}">
        <input type="hidden" name="consultation-id" value="${consultation.id}" />
        <label>
          <span>${isGuardian ? "선생님께 답변" : "학부모에게 답변"}</span>
          <textarea name="reply-body" maxlength="500" required placeholder="${isGuardian ? "확인한 내용이나 궁금한 점을 남겨주세요." : "추가 안내 내용을 남겨주세요."}"></textarea>
        </label>
        <button class="button primary compact" type="submit">답변 보내기</button>
      </form>
    </section>`;
}

function communicationDirectoryMatches(entry, search, classFilter, statusFilter) {
  const normalizedSearch = String(search || "").trim().toLocaleLowerCase("ko-KR");
  return (
    (!normalizedSearch || entry.searchText.includes(normalizedSearch)) &&
    (classFilter === "all" || entry.className === classFilter) &&
    (statusFilter === "all" || entry.status === statusFilter)
  );
}

function applyCommunicationDirectoryFilters(kind) {
  const isConsultation = kind === "consultation";
  const idPrefix = isConsultation ? "consultation" : "academy-comment";
  const statePrefix = isConsultation ? "consultation" : "academyComment";
  const statusKey = isConsultation ? "RecordFilter" : "UnreadFilter";
  const search = document.querySelector(`#${idPrefix}-directory-search`)?.value || "";
  const classFilter = document.querySelector(`#${idPrefix}-directory-class`)?.value || "all";
  const statusFilter = document.querySelector(`#${idPrefix}-directory-status`)?.value || "all";
  const normalizedSearch = search.trim().toLocaleLowerCase("ko-KR");
  let visibleCount = 0;

  document.querySelectorAll(`[data-directory-kind="${kind}"]`).forEach((row) => {
    const visible =
      (!normalizedSearch || row.dataset.directorySearch.includes(normalizedSearch)) &&
      (classFilter === "all" || row.dataset.directoryClass === classFilter) &&
      (statusFilter === "all" || row.dataset.directoryStatus === statusFilter);
    row.classList.toggle("hidden", !visible);
    if (visible) visibleCount += 1;
  });

  state[`${statePrefix}Search`] = search;
  state[`${statePrefix}ClassFilter`] = classFilter;
  state[`${statePrefix}${statusKey}`] = statusFilter;
  const count = document.querySelector(`#${idPrefix}-directory-count`);
  if (count) count.textContent = String(visibleCount);
  document.querySelector(`#${idPrefix}-directory-empty`)?.classList.toggle("hidden", visibleCount > 0);
  persistState();
}

function renderConsultations() {
  setPage("학원 운영", "상담 기록");
  if (!hasPermission("consultation.manage")) {
    return '<article class="panel"><div class="empty-state">상담 기록을 열람하거나 작성할 권한이 없습니다.</div></article>';
  }
  const academy = currentAcademy();
  const enrollments = accessibleAcademyEnrollments();
  const selectedId = enrollments.some((item) => item.studentId === state.consultationStudentId)
    ? state.consultationStudentId
    : enrollments[0]?.studentId;
  const selectedEnrollment = enrollments.find((item) => item.studentId === selectedId);
  const records = state.consultationRecords
    .filter((item) => item.academyId === academy.id && (!selectedId || item.studentId === selectedId))
    .sort((a, b) => b.consultationDate.localeCompare(a.consultationDate));
  const classNames = [...new Set(enrollments.map((item) => item.className))].sort((a, b) => a.localeCompare(b, "ko"));
  const consultationSearch = state.consultationSearch || "";
  const consultationClassFilter = classNames.includes(state.consultationClassFilter)
    ? state.consultationClassFilter
    : "all";
  const consultationRecordFilter = ["all", "shared", "internal", "none"].includes(state.consultationRecordFilter)
    ? state.consultationRecordFilter
    : "all";
  const directoryEntries = enrollments.map((enrollment) => {
    const student = studentById(enrollment.studentId);
    const studentRecords = state.consultationRecords
      .filter((item) => item.academyId === academy.id && item.studentId === enrollment.studentId)
      .sort((a, b) => b.consultationDate.localeCompare(a.consultationDate));
    const latest = studentRecords[0];
    return {
      studentId: enrollment.studentId,
      studentName: student?.name || "원생",
      className: enrollment.className,
      latest,
      recordCount: studentRecords.length,
      status: !latest ? "none" : studentRecords.some((item) => item.guardianSummary) ? "shared" : "internal",
      searchText: `${student?.name || ""} ${enrollment.className}`.toLocaleLowerCase("ko-KR")
    };
  });
  const visibleDirectoryEntries = directoryEntries.filter((entry) =>
    communicationDirectoryMatches(
      entry,
      consultationSearch,
      consultationClassFilter,
      consultationRecordFilter
    )
  );
  return `
    <article class="panel management-directory-panel">
      <div class="panel-head directory-panel-head">
        <div><h2>전체 원생 상담 현황</h2><p>원생을 선택하면 아래 기록 작성과 상담 이력이 함께 바뀝니다.</p></div>
        <strong><span id="consultation-directory-count">${visibleDirectoryEntries.length}</span>/${directoryEntries.length}명</strong>
      </div>
      <div class="directory-controls">
        <input id="consultation-directory-search" type="search" value="${escapeHtml(consultationSearch)}" placeholder="원생명·반 검색" aria-label="상담 원생 검색" />
        <select id="consultation-directory-class" aria-label="상담 반 필터">
          <option value="all">전체 반</option>
          ${classNames.map((className) => `<option value="${escapeHtml(className)}" ${consultationClassFilter === className ? "selected" : ""}>${escapeHtml(className)}</option>`).join("")}
        </select>
        <select id="consultation-directory-status" aria-label="상담 기록 필터">
          <option value="all" ${consultationRecordFilter === "all" ? "selected" : ""}>전체 기록</option>
          <option value="shared" ${consultationRecordFilter === "shared" ? "selected" : ""}>보호자 공유 있음</option>
          <option value="internal" ${consultationRecordFilter === "internal" ? "selected" : ""}>내부 기록만</option>
          <option value="none" ${consultationRecordFilter === "none" ? "selected" : ""}>기록 없음</option>
        </select>
      </div>
      <div class="table-wrap directory-table-wrap">
        <table class="data-table management-directory-table consultation-directory-table">
          <thead><tr><th>원생</th><th>반</th><th>최근 상담일</th><th>상담 유형</th><th>다음 후속조치</th><th>공유</th><th>관리</th></tr></thead>
          <tbody>
            ${directoryEntries.map((entry) => {
              const visible = communicationDirectoryMatches(
                entry,
                consultationSearch,
                consultationClassFilter,
                consultationRecordFilter
              );
              return `<tr class="${entry.studentId === selectedId ? "active" : ""} ${visible ? "" : "hidden"}" data-directory-kind="consultation" data-directory-search="${escapeHtml(entry.searchText)}" data-directory-class="${escapeHtml(entry.className)}" data-directory-status="${entry.status}">
                <td><strong>${escapeHtml(entry.studentName)}</strong></td>
                <td>${escapeHtml(entry.className)}</td>
                <td>${entry.latest ? escapeHtml(entry.latest.consultationDate) : "—"}</td>
                <td>${entry.latest ? consultationTypeLabel(entry.latest.type) : "—"}</td>
                <td class="directory-preview">${entry.latest ? escapeHtml(entry.latest.nextAction) : "상담 기록 없음"}</td>
                <td><span class="badge ${entry.status === "shared" ? "green" : "gray"}">${entry.status === "shared" ? "공유 있음" : entry.status === "internal" ? "내부 기록" : "미기록"}</span></td>
                <td><button class="button ${entry.studentId === selectedId ? "primary" : "tertiary"} compact" type="button" data-action="select-consultation-student" data-student-id="${entry.studentId}">${entry.studentId === selectedId ? "선택됨" : "상담 관리"}</button></td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
      <div id="consultation-directory-empty" class="empty-state ${visibleDirectoryEntries.length ? "hidden" : ""}">조건에 맞는 원생이 없습니다.</div>
    </article>
    <section class="grid two consultation-layout">
      <article class="panel">
        <div class="panel-head"><div><h2>상담 내용 기록</h2></div></div>
        ${selectedEnrollment ? `<form id="consultation-form">
          <div class="form-grid">
            <div><label>선택 원생</label><div class="selected-student-context"><strong>${escapeHtml(studentById(selectedId)?.name || "원생")}</strong><span>${escapeHtml(selectedEnrollment.className)}</span></div><input id="consultation-student" name="student-id" type="hidden" value="${selectedId}" /></div>
            <div><label for="consultation-date">상담일</label><input id="consultation-date" name="consultation-date" type="date" required value="${koreaDate()}" /></div>
            <div class="full"><label for="consultation-type">상담 유형</label><select id="consultation-type" name="type"><option value="guardian">학부모 상담</option><option value="student">학생 상담</option><option value="internal">내부 협의</option></select></div>
            <div class="full"><label for="consultation-internal">내부 메모</label><textarea id="consultation-internal" name="internal-memo" required placeholder="학습 흐름, 관찰 내용, 상담 맥락을 기록합니다."></textarea></div>
            <div class="full"><label for="consultation-action">다음 후속조치</label><input id="consultation-action" name="next-action" required placeholder="예: 8월 첫째 주 단원 목표 공유" /></div>
            <div class="full"><label for="consultation-summary">보호자 공유 요약 <span class="optional-label">선택</span></label><textarea id="consultation-summary" name="guardian-summary" placeholder="내부 메모와 구분해 공개 가능한 내용만 작성합니다."></textarea></div>
          </div>
          <div class="form-actions"><button class="button primary" type="submit">상담 기록 저장</button></div>
        </form>` : '<div class="empty-state">관리할 원생이 없습니다.</div>'}
      </article>
      <article class="panel">
        <div class="panel-head consultation-history-head"><div><h2>상담 이력</h2></div>${recordSearchControl("consultation-records", "상담 내용 검색")}</div>
        <div class="consultation-list" data-record-list="consultation-records">
          ${records.map((item) => `<div class="consultation-item" data-record-date="${escapeHtml(item.consultationDate)}" data-record-search="${escapeHtml(recordSearchText(item.consultationDate, consultationTypeLabel(item.type), item.nextAction, item.internalMemo, item.guardianSummary))}">
            <div><span>${item.consultationDate}</span><span class="badge ${item.guardianSummary ? "green" : "gray"}">${item.guardianSummary ? "공유 요약 있음" : "내부 기록"}</span></div>
            <strong>${escapeHtml(item.nextAction)}</strong>
            <p>${escapeHtml(item.internalMemo)}</p>
            ${item.guardianSummary ? `<small>보호자 공유: ${escapeHtml(item.guardianSummary)}</small>` : ""}
            ${item.guardianSummary ? renderCommentReplies(item, "academy") : ""}
          </div>`).join("") || '<div class="empty-state">상담 기록이 없습니다.</div>'}
        </div>
        <div class="empty-state hidden" data-record-empty="consultation-records">검색 결과가 없습니다.</div>
      </article>
    </section>
  `;
}

function academyCommentEnrollments() {
  return accessibleAcademyEnrollments().filter((item) => item.status === "active");
}

function canAccessAcademyComment(consultation) {
  return Boolean(
    consultation &&
    hasPermission("comment.manage") &&
    academyCommentEnrollments().some(
      (item) =>
        item.academyId === consultation.academyId &&
        item.studentId === consultation.studentId
    )
  );
}

function academyUnreadGuardianReplies(consultationId = null) {
  if (!currentUser() || !hasPermission("comment.manage")) return [];
  const readIds = new Set(state.academyCommentReplyReads[currentUser().id] || []);
  return state.guardianCommentReplies.filter(
    (item) =>
      item.authorRole === "guardian" &&
      !readIds.has(item.id) &&
      (!consultationId || item.consultationId === consultationId) &&
      academyCommentEnrollments().some(
        (enrollment) =>
          enrollment.academyId === item.academyId &&
          enrollment.studentId === item.studentId
      )
  );
}

function renderAcademyComments() {
  setPage("학원 운영", "학부모 소통");
  if (!hasPermission("comment.manage")) {
    return '<article class="panel"><div class="empty-state">공개 코멘트를 작성하거나 답변할 권한이 없습니다.</div></article>';
  }
  const enrollments = academyCommentEnrollments();
  const selectedId = enrollments.some((item) => item.studentId === state.academyCommentStudentId)
    ? state.academyCommentStudentId
    : enrollments[0]?.studentId;
  const selectedEnrollment = enrollments.find((item) => item.studentId === selectedId);
  const records = state.consultationRecords
    .filter(
      (item) =>
        item.academyId === currentAcademy().id &&
        item.studentId === selectedId &&
        item.guardianSummary
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const allUnread = academyUnreadGuardianReplies();
  const classNames = [...new Set(enrollments.map((item) => item.className))].sort((a, b) => a.localeCompare(b, "ko"));
  const academyCommentSearch = state.academyCommentSearch || "";
  const academyCommentClassFilter = classNames.includes(state.academyCommentClassFilter)
    ? state.academyCommentClassFilter
    : "all";
  const academyCommentUnreadFilter = ["all", "unread", "clear", "none"].includes(state.academyCommentUnreadFilter)
    ? state.academyCommentUnreadFilter
    : "all";
  const directoryEntries = enrollments
    .map((enrollment) => {
      const student = studentById(enrollment.studentId);
      const studentRecords = state.consultationRecords
        .filter(
          (item) =>
            item.academyId === currentAcademy().id &&
            item.studentId === enrollment.studentId &&
            item.guardianSummary
        )
        .sort((a, b) => new Date(b.createdAt || `${b.consultationDate}T12:00:00+09:00`) - new Date(a.createdAt || `${a.consultationDate}T12:00:00+09:00`));
      const recordIds = new Set(studentRecords.map((item) => item.id));
      const replies = state.guardianCommentReplies
        .filter((item) => recordIds.has(item.consultationId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const latestRecord = studentRecords[0];
      const latestReply = replies[0];
      const latestRecordAt = latestRecord?.createdAt || (latestRecord ? `${latestRecord.consultationDate}T12:00:00+09:00` : null);
      const latestActivity = [
        latestRecordAt ? { createdAt: latestRecordAt, body: latestRecord.guardianSummary } : null,
        latestReply ? { createdAt: latestReply.createdAt, body: latestReply.body } : null
      ].filter(Boolean).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      const unread = allUnread.filter((item) => recordIds.has(item.consultationId));
      return {
        studentId: enrollment.studentId,
        studentName: student?.name || "원생",
        className: enrollment.className,
        preview: latestActivity?.body || "대화 없음",
        lastActivityAt: latestActivity?.createdAt || null,
        unreadCount: unread.length,
        status: unread.length ? "unread" : studentRecords.length ? "clear" : "none",
        searchText: `${student?.name || ""} ${enrollment.className}`.toLocaleLowerCase("ko-KR")
      };
    })
    .sort((a, b) => b.unreadCount - a.unreadCount || new Date(b.lastActivityAt || 0) - new Date(a.lastActivityAt || 0) || a.studentName.localeCompare(b.studentName, "ko"));
  const visibleDirectoryEntries = directoryEntries.filter((entry) =>
    communicationDirectoryMatches(
      entry,
      academyCommentSearch,
      academyCommentClassFilter,
      academyCommentUnreadFilter
    )
  );

  return `
    <article class="panel management-directory-panel academy-comment-directory-panel">
      <div class="panel-head directory-panel-head">
        <div><h2>전체 원생 대화 목록</h2><p>미확인 답변이 있는 원생을 먼저 표시합니다.</p></div>
        <strong><span id="academy-comment-directory-count">${visibleDirectoryEntries.length}</span>/${directoryEntries.length}명</strong>
      </div>
      <div class="directory-controls">
        <input id="academy-comment-directory-search" type="search" value="${escapeHtml(academyCommentSearch)}" placeholder="원생명·반 검색" aria-label="학부모 소통 원생 검색" />
        <select id="academy-comment-directory-class" aria-label="학부모 소통 반 필터">
          <option value="all">전체 반</option>
          ${classNames.map((className) => `<option value="${escapeHtml(className)}" ${academyCommentClassFilter === className ? "selected" : ""}>${escapeHtml(className)}</option>`).join("")}
        </select>
        <select id="academy-comment-directory-status" aria-label="학부모 소통 상태 필터">
          <option value="all" ${academyCommentUnreadFilter === "all" ? "selected" : ""}>전체 상태</option>
          <option value="unread" ${academyCommentUnreadFilter === "unread" ? "selected" : ""}>미확인 답변</option>
          <option value="clear" ${academyCommentUnreadFilter === "clear" ? "selected" : ""}>확인 완료</option>
          <option value="none" ${academyCommentUnreadFilter === "none" ? "selected" : ""}>대화 없음</option>
        </select>
      </div>
      <div class="table-wrap directory-table-wrap">
        <table class="data-table management-directory-table academy-comment-directory-table">
          <thead><tr><th>원생</th><th>반</th><th>최근 내용</th><th>최근 대화</th><th>미확인</th><th>상태</th><th>관리</th></tr></thead>
          <tbody>
            ${directoryEntries.map((entry) => {
              const visible = communicationDirectoryMatches(
                entry,
                academyCommentSearch,
                academyCommentClassFilter,
                academyCommentUnreadFilter
              );
              return `<tr class="${entry.studentId === selectedId ? "active" : ""} ${visible ? "" : "hidden"}" data-directory-kind="academy-comment" data-directory-search="${escapeHtml(entry.searchText)}" data-directory-class="${escapeHtml(entry.className)}" data-directory-status="${entry.status}">
                <td><strong>${escapeHtml(entry.studentName)}</strong></td>
                <td>${escapeHtml(entry.className)}</td>
                <td class="directory-preview">${escapeHtml(entry.preview)}</td>
                <td>${entry.lastActivityAt ? formatDateTime(entry.lastActivityAt) : "—"}</td>
                <td>${entry.unreadCount ? `<span class="badge orange">${entry.unreadCount}건</span>` : "—"}</td>
                <td><span class="badge ${entry.status === "unread" ? "orange" : entry.status === "clear" ? "green" : "gray"}">${entry.status === "unread" ? "답변 확인 필요" : entry.status === "clear" ? "확인 완료" : "대화 없음"}</span></td>
                <td><button class="button ${entry.studentId === selectedId ? "primary" : "tertiary"} compact" type="button" data-action="select-academy-comment-student" data-student-id="${entry.studentId}">${entry.studentId === selectedId ? "선택됨" : "대화 열기"}</button></td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
      <div id="academy-comment-directory-empty" class="empty-state ${visibleDirectoryEntries.length ? "hidden" : ""}">조건에 맞는 원생이 없습니다.</div>
    </article>
    <section class="grid two academy-comment-layout">
      <article class="panel">
        <div class="panel-head"><div><h2>새 코멘트 작성</h2><p>학부모에게 공개되는 내용만 입력합니다.</p></div></div>
        ${selectedEnrollment ? `<form id="academy-comment-form">
          <div class="form-grid">
            <div class="full">
              <label>선택 원생</label>
              <div class="selected-student-context"><strong>${escapeHtml(studentById(selectedId)?.name || "원생")}</strong><span>${escapeHtml(selectedEnrollment.className)}</span></div>
              <input id="academy-comment-student" name="student-id" type="hidden" value="${selectedId}" />
            </div>
            <div class="full">
              <label for="academy-comment-body">보호자 공개 코멘트</label>
              <textarea id="academy-comment-body" name="comment-body" maxlength="1000" required placeholder="학습 변화, 강점, 가정에서 확인할 내용을 입력하세요."></textarea>
            </div>
          </div>
          <div class="form-actions"><button class="button primary" type="submit">코멘트 보내기</button></div>
        </form>` : '<div class="empty-state">소통할 재원 원생이 없습니다.</div>'}
      </article>
      <article class="panel">
        <div class="panel-head">
          <div><h2>${selectedId ? `${escapeHtml(studentById(selectedId)?.name || "원생")} 코멘트 대화` : "코멘트 대화"}</h2><p>선택한 원생의 공개 내용과 답변만 표시됩니다.</p></div>
        </div>
        <div class="academy-comment-list">
          ${records.map((item) => {
            const unread = academyUnreadGuardianReplies(item.id);
            return `
              <article class="academy-comment-item">
                <div class="academy-comment-meta">
                  <span class="source-tag">${escapeHtml(studentById(item.studentId)?.name || "학생")}</span>
                  <time>${formatDateTime(item.createdAt)}</time>
                  ${unread.length ? `<span class="badge orange">새 답변 ${unread.length}</span><button class="button tertiary compact" data-action="mark-academy-comment-read" data-consultation-id="${item.id}">답변 확인</button>` : '<span class="badge gray">확인 완료</span>'}
                </div>
                <p>${escapeHtml(item.guardianSummary)}</p>
                ${renderCommentReplies(item, "academy")}
              </article>`;
          }).join("") || '<div class="empty-state">선택한 학생에게 보낸 코멘트가 없습니다.</div>'}
        </div>
      </article>
    </section>`;
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

function guardianScope() {
  const links = state.guardianLinks.filter(
    (item) => item.guardianUserId === currentUser().id && item.status === "verified"
  );
  return {
    links,
    linkedPairs: new Set(links.map((item) => `${item.studentId}:${item.academyId}`)),
    studentIds: [...new Set(links.map((item) => item.studentId))].sort((a, b) =>
      (studentById(a)?.name || "").localeCompare(studentById(b)?.name || "", "ko")
    ),
    academyIds: [...new Set(links.map((item) => item.academyId))].sort((a, b) =>
      (academyById(a)?.name || "").localeCompare(academyById(b)?.name || "", "ko")
    )
  };
}

function guardianTimelineEvents() {
  const { linkedPairs } = guardianScope();
  const events = [
    ...state.attendanceRecords
      .filter((item) => linkedPairs.has(`${item.studentId}:${item.academyId}`))
      .map((item) => {
        const enrollment = state.enrollments.find(
          (entry) => entry.academyId === item.academyId && entry.studentId === item.studentId
        );
        const title = ({ present: "정상 등원", late: "지각 등원", early_leave: "조퇴", absent: "결석" })[item.status] || "출결 확인";
        return {
          id: `attendance-${item.id}`,
          studentId: item.studentId,
          academyId: item.academyId,
          type: "출결",
          tone: item.status === "absent" ? "red" : ["late", "early_leave"].includes(item.status) ? "orange" : "green",
          title,
          detail: `${enrollment?.className || item.className}${item.arrivalTime ? ` · ${item.arrivalTime}` : ""}${item.reason ? ` · ${item.reason}` : ""}`,
          createdAt: item.checkedAt
        };
      }),
    ...state.learningRecords.flatMap((item) =>
      state.enrollments
        .filter(
          (entry) =>
            entry.academyId === item.academyId &&
            entry.className === item.className &&
            linkedPairs.has(`${entry.studentId}:${entry.academyId}`)
        )
        .map((entry) => ({
          id: `learning-${item.id}-${entry.studentId}`,
          studentId: entry.studentId,
          academyId: item.academyId,
          type: "학습",
          tone: "green",
          title: `${item.unit} · ${item.pages}`,
          detail: [
            item.content,
            item.homework ? `과제 ${item.homework}` : "",
            item.specialNotes ? `특이사항 ${item.specialNotes}` : ""
          ].filter(Boolean).join(" · "),
          createdAt: item.createdAt
        }))
    ),
    ...state.homeworkAssignments.flatMap((item) =>
      (item.statuses || [])
        .filter((status) => linkedPairs.has(`${status.studentId}:${item.academyId}`))
        .map((status) => ({
          id: `homework-${item.id}-${status.studentId}`,
          studentId: status.studentId,
          academyId: item.academyId,
          type: "과제",
          tone: ["completed", "replacement", "exempt"].includes(status.status) ? "green" : status.status === "partial" ? "orange" : "red",
          title: `${item.title} · ${homeworkStatusLabel(status.status)}`,
          detail: status.note || "과제 수행 상태가 반영됐습니다.",
          createdAt: item.createdAt
        }))
    ),
    ...state.assessments.flatMap((item) =>
      (item.attempts || [])
        .filter((attempt) => linkedPairs.has(`${attempt.studentId}:${item.academyId}`))
        .map((attempt) => ({
          id: `assessment-${item.id}-${attempt.id}`,
          studentId: attempt.studentId,
          academyId: item.academyId,
          type: "테스트",
          tone: attempt.status === "taken" ? "green" : "orange",
          title: item.title,
          detail: attempt.status === "taken"
            ? `${item.subject} ${attempt.score}점 / ${item.maxScore}점${attempt.attemptNo > 1 ? ` · ${attempt.attemptNo}차 응시` : ""}`
            : `${testStatusLabel(attempt.status)}${attempt.note ? ` · ${attempt.note}` : ""}`,
          createdAt: attempt.recordedAt || `${item.testDate}T12:00:00+09:00`
        }))
    ),
    ...state.consultationRecords
      .filter((item) => item.guardianSummary && linkedPairs.has(`${item.studentId}:${item.academyId}`))
      .map((item) => ({
        id: `comment-${item.id}`,
        studentId: item.studentId,
        academyId: item.academyId,
        type: "코멘트",
        tone: "green",
        title: "선생님 코멘트가 도착했습니다",
        detail: item.guardianSummary,
        createdAt: item.createdAt || `${item.consultationDate}T12:00:00+09:00`
      }))
  ];
  return events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function guardianNotificationEvents() {
  const { linkedPairs } = guardianScope();
  const actionEvents = guardianTimelineEvents().filter((item) => {
    if (item.type === "출결") return ["지각 등원", "조퇴", "결석"].includes(item.title);
    if (item.type === "과제") return ["orange", "red"].includes(item.tone);
    return ["테스트", "코멘트"].includes(item.type);
  });
  const replyEvents = state.guardianCommentReplies
    .filter(
      (item) =>
        item.authorRole === "academy" &&
        linkedPairs.has(`${item.studentId}:${item.academyId}`)
    )
    .map((item) => ({
      id: `reply-${item.id}`,
      studentId: item.studentId,
      academyId: item.academyId,
      type: "답변",
      tone: "green",
      title: "선생님 답변이 도착했습니다",
      detail: item.body,
      createdAt: item.createdAt
    }));
  return [...actionEvents, ...replyEvents].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

function guardianFilters(events) {
  const { studentIds, academyIds } = guardianScope();
  const studentId = studentIds.includes(state.guardianTimelineStudentId) ? state.guardianTimelineStudentId : "all";
  const academyId = academyIds.includes(state.guardianTimelineAcademyId) ? state.guardianTimelineAcademyId : "all";
  return {
    studentId,
    academyId,
    events: events.filter(
      (item) =>
        (studentId === "all" || item.studentId === studentId) &&
        (academyId === "all" || item.academyId === academyId)
    )
  };
}

function renderGuardianFilters(events, actionMarkup = "") {
  const { studentIds, academyIds } = guardianScope();
  const filters = guardianFilters(events);
  return `
    <div class="guardian-filters">
      <label class="guardian-filter-field">
        <span>자녀</span>
        <select id="guardian-student-filter" aria-label="자녀 선택">
          <option value="all">모든 자녀</option>
          ${studentIds.map((id) => `<option value="${id}" ${filters.studentId === id ? "selected" : ""}>${escapeHtml(studentById(id)?.name || "자녀")}</option>`).join("")}
        </select>
      </label>
      <label class="guardian-filter-field">
        <span>학원</span>
        <select id="guardian-academy-filter" aria-label="학원 선택">
          <option value="all">모든 학원</option>
          ${academyIds.map((id) => `<option value="${id}" ${filters.academyId === id ? "selected" : ""}>${escapeHtml(academyById(id)?.name || "학원")}</option>`).join("")}
        </select>
      </label>
      ${actionMarkup ? `<span class="guardian-filter-divider" aria-hidden="true"></span>${actionMarkup}` : ""}
    </div>`;
}

function renderGuardianHome() {
  setPage("PARENT", "통합 타임라인");
  const scope = guardianScope();
  const allEvents = guardianTimelineEvents();
  const filtered = guardianFilters(allEvents).events;
  const unread = guardianNotificationEvents().filter(
    (item) => !state.guardianNotificationReads.includes(item.id)
  ).length;
  scope.academyIds.forEach((academyId) => trackUsageOnce("guardian.home_viewed", academyId));

  return `
    ${scope.studentIds.length ? `
      <section class="guardian-summary-strip">
        <span class="badge green">자녀 ${scope.studentIds.length}명</span>
        <span class="badge gray">연결 학원 ${scope.academyIds.length}곳</span>
        <span class="badge orange guardian-unread-badge">읽지 않은 알림 ${unread}</span>
        <button class="button secondary compact" data-action="open-guardian-connect-modal">자녀·학원 추가 연결</button>
      </section>
      <section class="child-timeline-grid guardian-child-overview">
        ${scope.studentIds.map((studentId) => {
          const academyCount = scope.links.filter((item) => item.studentId === studentId).length;
          const eventCount = allEvents.filter((item) => item.studentId === studentId).length;
          return `
            <article class="panel child-timeline-card">
              <header class="child-card-head">
                <div class="child-identity">
                  <h3>${escapeHtml(studentById(studentId)?.name || "자녀")}</h3>
                  <span class="child-academy-count">연결 학원 ${academyCount}곳</span>
                </div>
                <span class="child-event-count"><strong>${eventCount}</strong><small>전체 소식</small></span>
              </header>
            </article>`;
        }).join("")}
      </section>
      <article class="panel guardian-timeline-panel">
        <div class="guardian-timeline-filters">${renderGuardianFilters(allEvents)}</div>
        <div class="timeline-list guardian-timeline-scroll">
          ${filtered.length ? filtered.map((item) => `
            <div class="timeline-event guardian-event">
              <div class="guardian-event-source">
                <span class="source-tag">${escapeHtml(academyById(item.academyId)?.name || "학원")}</span>
                <small>${escapeHtml(studentById(item.studentId)?.name || "자녀")}</small>
              </div>
              <div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)} · ${formatDateTime(item.createdAt)}</small></div>
              <span class="badge ${item.tone}">${item.type}</span>
            </div>
          `).join("") : '<div class="empty-state">선택한 조건의 학원 소식이 없습니다.</div>'}
        </div>
      </article>
    ` : `<article class="panel guardian-connect-panel">
      <div class="panel-head"><div><h2>자녀·학원 연결</h2></div></div>
      ${guardianConnectionForm()}
    </article>`}
  `;
}

function guardianChildSnapshot(studentId) {
  const { links, linkedPairs } = guardianScope();
  const childLinks = links.filter((item) => item.studentId === studentId);
  const attendance = state.attendanceRecords.filter((item) => linkedPairs.has(`${studentId}:${item.academyId}`));
  const homework = state.homeworkAssignments.flatMap((item) =>
    (item.statuses || [])
      .filter((status) => status.studentId === studentId && linkedPairs.has(`${studentId}:${item.academyId}`))
      .map((status) => status)
  );
  const scores = state.assessments.flatMap((assessment) => {
    if (!linkedPairs.has(`${studentId}:${assessment.academyId}`)) return [];
    const attempts = (assessment.attempts || [])
      .filter((attempt) => attempt.studentId === studentId && attempt.status === "taken" && Number.isFinite(attempt.score))
      .sort((a, b) => b.attemptNo - a.attemptNo);
    if (!attempts.length) return [];
    const attempt = attempts[0];
    return [{
      id: `${assessment.id}-${attempt.id}`,
      academyId: assessment.academyId,
      title: assessment.title,
      subject: assessment.subject,
      testDate: assessment.testDate,
      score: attempt.score,
      maxScore: assessment.maxScore,
      percent: Math.round((attempt.score / assessment.maxScore) * 100)
    }];
  }).sort((a, b) => a.testDate.localeCompare(b.testDate));
  const attendanceRate = attendance.length
    ? Math.round((attendance.filter((item) => ["present", "late"].includes(item.status)).length / attendance.length) * 100)
    : null;
  const homeworkRate = homework.length
    ? Math.round((homework.filter((item) => ["completed", "replacement", "exempt"].includes(item.status)).length / homework.length) * 100)
    : null;
  return { childLinks, attendanceRate, homeworkRate, scores };
}

function studentSchoolGrade(studentId) {
  const birthYear = Number(studentById(studentId)?.birthDate?.slice(0, 4));
  const currentYear = Number(koreaDate().slice(0, 4));
  const grade = currentYear - birthYear - 6;
  if (grade >= 1 && grade <= 6) return `초등 ${grade}학년`;
  if (grade >= 7 && grade <= 9) return `중등 ${grade - 6}학년`;
  if (grade >= 10 && grade <= 12) return `고등 ${grade - 9}학년`;
  return "학년 정보 없음";
}

function guardianMoaflowBenchmark(studentId, latest) {
  const grade = studentSchoolGrade(studentId);
  const subject = latest?.subject || "과목 정보 없음";
  const latestByStudent = new Map();
  state.assessments
    .filter((assessment) => assessment.subject === latest?.subject)
    .sort((a, b) => a.testDate.localeCompare(b.testDate))
    .forEach((assessment) => {
      (assessment.attempts || [])
        .filter((attempt) => attempt.status === "taken" && Number.isFinite(attempt.score))
        .sort((a, b) => a.attemptNo - b.attemptNo)
        .forEach((attempt) => {
          if (studentSchoolGrade(attempt.studentId) !== grade) return;
          latestByStudent.set(attempt.studentId, Math.round((attempt.score / assessment.maxScore) * 100));
        });
    });
  const scores = [...latestByStudent.values()].sort((a, b) => b - a);
  const averageMinimum = 2;
  const rankingMinimum = 30;
  const canAverage = Boolean(latest) && scores.length >= averageMinimum;
  const canRank = Boolean(latest) && scores.length >= rankingMinimum;
  const rank = canRank ? scores.findIndex((score) => score <= latest.percent) + 1 : null;
  const sampleLevel = scores.length < averageMinimum
    ? "single"
    : scores.length < 5
      ? "very_small"
      : scores.length < rankingMinimum
        ? "small"
        : "sufficient";
  return {
    grade,
    subject,
    cohortSize: scores.length,
    sampleLevel,
    average: canAverage ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null,
    topPercent: canRank ? Math.max(1, Math.ceil((rank / scores.length) * 100)) : null
  };
}

function renderGuardianGrowthChart(snapshot, studentName) {
  const linkedAcademyIds = [...new Set(snapshot.childLinks.map((item) => item.academyId))]
    .sort((a, b) => (academyById(a)?.name || "").localeCompare(academyById(b)?.name || "", "ko"));
  const selectedAcademyId = linkedAcademyIds.includes(state.guardianGrowthAcademyId)
    ? state.guardianGrowthAcademyId
    : "all";
  const academyScores = selectedAcademyId === "all"
    ? snapshot.scores
    : snapshot.scores.filter((item) => item.academyId === selectedAcademyId);
  const subjects = [...new Set(academyScores.map((item) => item.subject))];
  const selectedSubject = selectedAcademyId === "all"
    ? "all"
    : subjects.includes(state.guardianGrowthSubject)
      ? state.guardianGrowthSubject
      : subjects[0] || "all";
  const scores = selectedSubject === "all"
    ? academyScores
    : academyScores.filter((item) => item.subject === selectedSubject);
  const allSeriesKeys = [...new Set(snapshot.scores.map((item) => `${item.academyId}::${item.subject}`))];
  const plotWidth = 800;
  const plotTop = 18;
  const plotBottom = 160;
  const gridLeft = 58;
  const gridRight = plotWidth - 26;
  const plotLeft = 104;
  const plotRight = 62;
  const xRange = plotWidth - plotLeft - plotRight;
  const seriesItemIndexes = new Map();
  const seriesItemCounts = new Map();
  scores.forEach((item) => {
    const seriesKey = `${item.academyId}::${item.subject}`;
    seriesItemCounts.set(seriesKey, (seriesItemCounts.get(seriesKey) || 0) + 1);
  });
  const evaluationCount = Math.max(...seriesItemCounts.values(), 1);
  const scoreValues = scores.map((item) => item.percent);
  const minimumScore = scoreValues.length ? Math.min(...scoreValues) : 0;
  const maximumScore = scoreValues.length ? Math.max(...scoreValues) : 100;
  let axisMinimum = Math.max(0, Math.floor((minimumScore - 5) / 10) * 10);
  let axisMaximum = Math.min(100, Math.ceil((maximumScore + 5) / 10) * 10);
  if (axisMaximum - axisMinimum < 20) {
    if (axisMinimum >= 10) axisMinimum -= 10;
    else axisMaximum = Math.min(100, axisMaximum + 10);
  }
  const axisStep = axisMaximum - axisMinimum > 50 ? 20 : 10;
  const axisTicks = [];
  for (let value = axisMinimum; value <= axisMaximum; value += axisStep) axisTicks.push(value);
  const chartPoints = scores.map((item) => {
    const seriesKey = `${item.academyId}::${item.subject}`;
    const seriesItemIndex = seriesItemIndexes.get(seriesKey) || 0;
    seriesItemIndexes.set(seriesKey, seriesItemIndex + 1);
    return {
      ...item,
      x: evaluationCount === 1 ? plotLeft + xRange / 2 : plotLeft + (seriesItemIndex / (evaluationCount - 1)) * xRange,
      y: plotTop + ((axisMaximum - item.percent) / Math.max(axisMaximum - axisMinimum, 1)) * (plotBottom - plotTop),
      seriesKey,
      seriesItemIndex,
      seriesIndex: Math.max(allSeriesKeys.indexOf(seriesKey), 0)
    };
  });
  const chartSeries = [...new Set(chartPoints.map((item) => item.seriesKey))].map((seriesKey) => ({
    seriesKey,
    points: chartPoints.filter((item) => item.seriesKey === seriesKey)
  }));
  const pointChanges = new Map();
  chartSeries.forEach((series) => series.points.forEach((item, index) => {
    if (index > 0) pointChanges.set(item.id, item.percent - series.points[index - 1].percent);
  }));
  const seriesSummaries = chartSeries.map((series) => {
    const firstPoint = series.points[0];
    const lastPoint = series.points.at(-1);
    return {
      seriesIndex: firstPoint.seriesIndex,
      label: `${academyById(firstPoint.academyId)?.name || "학원"} · ${firstPoint.subject}`,
      change: lastPoint.percent - firstPoint.percent
    };
  });
  const description = selectedAcademyId === "all"
    ? "같은 학원·같은 과목 기록끼리 각각 선으로 연결합니다."
    : `${academyById(selectedAcademyId)?.name || "학원"}의 ${selectedSubject === "all" ? "평가" : selectedSubject} 기록만 연결합니다.`;

  return `
    <section class="growth-chart-section">
      <div class="growth-chart-head">
        <div><h3>학습 성장 그래프</h3><p>${escapeHtml(description)}</p></div>
        ${selectedAcademyId !== "all" && selectedSubject !== "all" ? `<span class="badge green">${escapeHtml(selectedSubject)}</span>` : ""}
      </div>
      <div class="growth-chart-tabs" role="tablist" aria-label="성장 그래프 학원 선택">
        <button type="button" role="tab" aria-selected="${selectedAcademyId === "all"}" class="${selectedAcademyId === "all" ? "active" : ""}" data-action="select-growth-academy" data-academy-id="all">전체</button>
        ${linkedAcademyIds.map((academyId) => `
          <button type="button" role="tab" aria-selected="${selectedAcademyId === academyId}" class="${selectedAcademyId === academyId ? "active" : ""}" data-action="select-growth-academy" data-academy-id="${academyId}">${escapeHtml(academyById(academyId)?.name || "학원")}</button>
        `).join("")}
      </div>
      ${selectedAcademyId !== "all" && subjects.length > 1 ? `
        <div class="growth-subject-filters" aria-label="성장 그래프 과목 선택">
          ${subjects.map((subject) => `<button type="button" class="${selectedSubject === subject ? "active" : ""}" data-action="select-growth-subject" data-subject="${escapeHtml(subject)}">${escapeHtml(subject)}</button>`).join("")}
        </div>
      ` : ""}
      <div class="growth-report-entry">
        <strong>${selectedAcademyId === "all" ? "전체 학원" : escapeHtml(academyById(selectedAcademyId)?.name || "학원")}</strong>
        <button type="button" class="button secondary compact" data-action="open-growth-report" data-academy-id="${selectedAcademyId}" data-subject="${escapeHtml(selectedSubject)}">상세 확인</button>
      </div>
      ${selectedAcademyId === "all" && allSeriesKeys.length > 1 ? `
        <div class="growth-chart-legend">
          ${allSeriesKeys.map((seriesKey, index) => {
            const [academyId, subject] = seriesKey.split("::");
            return `<span><i class="series-${index % 6}"></i>${escapeHtml(academyById(academyId)?.name || "학원")} · ${escapeHtml(subject)}</span>`;
          }).join("")}
        </div>
      ` : ""}
      ${seriesSummaries.length ? `
        <div class="growth-chart-summary" aria-label="첫 평가 대비 총 변화">
          ${seriesSummaries.map((summary) => `
            <span class="series-${summary.seriesIndex % 6}">
              ${seriesSummaries.length > 1 ? `<i></i><small>${escapeHtml(summary.label)}</small>` : ""}
              <small>첫 평가 대비</small>
              <strong class="${summary.change > 0 ? "positive" : summary.change < 0 ? "negative" : "neutral"}">총 ${summary.change > 0 ? "+" : ""}${summary.change}점</strong>
            </span>
          `).join("")}
        </div>
      ` : ""}
      <div class="growth-chart ${selectedAcademyId === "all" ? "multi-line-chart" : "line-chart"}" aria-label="${escapeHtml(studentName || "자녀")} 평가 성장 그래프">
        ${chartPoints.length ? `
          <svg viewBox="0 0 ${plotWidth} 232" role="img" aria-label="${selectedAcademyId === "all" ? "학원과 과목별 평가 다중 꺾은선그래프" : "선택 학원 평가 꺾은선그래프"}">
            ${axisTicks.map((value) => {
              const y = plotTop + ((axisMaximum - value) / Math.max(axisMaximum - axisMinimum, 1)) * (plotBottom - plotTop);
              return `<line class="growth-grid-line" x1="${gridLeft}" y1="${y}" x2="${gridRight}" y2="${y}"></line><text class="growth-axis-value" x="${gridLeft - 12}" y="${y + 4}">${value}</text>`;
            }).join("")}
            ${chartSeries.map((series) => series.points.length > 1
              ? `<polyline class="growth-chart-line series-${series.points[0].seriesIndex % 6}" points="${series.points.map((item) => `${item.x},${item.y}`).join(" ")}"></polyline>`
              : "").join("")}
            ${Array.from({ length: evaluationCount }, (_, index) => {
              const x = evaluationCount === 1 ? plotLeft + xRange / 2 : plotLeft + (index / (evaluationCount - 1)) * xRange;
              const testDate = chartSeries.length === 1 ? chartSeries[0].points[index]?.testDate : "";
              const formattedTestDate = testDate
                ? testDate.slice(5).split("-").map(Number).join("/")
                : "";
              return `
                <text class="growth-point-date" x="${x}" y="202">
                  <tspan x="${x}">${index + 1}차 평가</tspan>
                  ${formattedTestDate ? `<tspan class="growth-point-test-date" x="${x}" dy="15">${formattedTestDate}</tspan>` : ""}
                </text>
              `;
            }).join("")}
            ${chartPoints.map((item) => `
              <g class="growth-chart-point series-${item.seriesIndex % 6}">
                <title>${escapeHtml(academyById(item.academyId)?.name || "학원")} · ${escapeHtml(item.subject)} · ${item.testDate} · ${item.percent}점</title>
                <circle cx="${item.x}" cy="${item.y}" r="6"></circle>
                <text class="growth-point-score" x="${item.x}" y="${item.y - 13}">${item.percent}</text>
                ${chartSeries.length === 1 && pointChanges.has(item.id) ? `
                  <g class="growth-point-change ${pointChanges.get(item.id) >= 0 ? "positive" : "negative"}" transform="translate(${item.x - 48} ${Math.min(item.y + 17, 170)})">
                    <rect width="96" height="20" rx="10"></rect>
                    <text x="48" y="14">직전 대비 ${pointChanges.get(item.id) > 0 ? "+" : ""}${pointChanges.get(item.id)}점</text>
                  </g>
                ` : ""}
              </g>
            `).join("")}
          </svg>
        ` : '<div class="empty-state">선택한 학원과 과목에 응시 완료된 테스트가 없습니다.</div>'}
      </div>
    </section>`;
}

function openGuardianGrowthReport(academyId, subject) {
  const { studentIds } = guardianScope();
  const studentId = studentIds.includes(state.guardianGrowthStudentId) ? state.guardianGrowthStudentId : studentIds[0];
  const student = studentById(studentId);
  const snapshot = studentId ? guardianChildSnapshot(studentId) : null;
  if (!snapshot) return;
  const scores = snapshot.scores.filter((item) =>
    (academyId === "all" || item.academyId === academyId) &&
    (subject === "all" || item.subject === subject)
  );
  const series = [...new Set(scores.map((item) => `${item.academyId}::${item.subject}`))].map((seriesKey) => {
    const [seriesAcademyId, seriesSubject] = seriesKey.split("::");
    return {
      academyId: seriesAcademyId,
      subject: seriesSubject,
      items: scores.filter((item) => item.academyId === seriesAcademyId && item.subject === seriesSubject)
    };
  });
  const periodLabel = scores.length
    ? `${scores[0].testDate.replaceAll("-", ".")} ~ ${scores.at(-1).testDate.replaceAll("-", ".")}`
    : "기록 없음";
  openModal(`
    <header><div><h2 id="modal-title">${escapeHtml(student?.name || "자녀")} 학습 리포트</h2><p>${academyId === "all" ? "전체 학원" : escapeHtml(academyById(academyId)?.name || "학원")} · ${subject === "all" ? "전체 과목" : escapeHtml(subject)}</p></div><button class="icon-button" data-action="close-modal" aria-label="닫기">×</button></header>
    <section class="growth-report-summary">
      <div><span>평가 기록</span><strong>${scores.length}건</strong></div>
      <div><span>학원·과목 흐름</span><strong>${series.length}개</strong></div>
      <div><span>조회 기간</span><strong>${periodLabel}</strong></div>
    </section>
    <div class="growth-report-groups">
      ${series.map((group) => {
        const first = group.items[0];
        const latest = group.items.at(-1);
        const change = latest.percent - first.percent;
        return `
          <section class="growth-report-group">
            <header><div><h3>${escapeHtml(academyById(group.academyId)?.name || "학원")} · ${escapeHtml(group.subject)}</h3><p>${first.percent}점 → ${latest.percent}점 · ${change >= 0 ? "+" : ""}${change}점</p></div></header>
            <div class="growth-report-list">
              ${group.items.map((item, index) => {
                const previous = group.items[index - 1];
                const itemChange = previous ? item.percent - previous.percent : null;
                return `<div><time>${item.testDate.replaceAll("-", ".")}</time><span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(academyById(item.academyId)?.name || "학원")} · ${escapeHtml(item.subject)}</small></span><b>${item.percent}점</b><em>${itemChange === null ? "기준" : `${itemChange >= 0 ? "+" : ""}${itemChange}점`}</em></div>`;
              }).join("")}
            </div>
          </section>`;
      }).join("") || '<div class="empty-state">표시할 평가 기록이 없습니다.</div>'}
    </div>`);
}

function renderGuardianGrowth() {
  setPage("PARENT", "성장 추이");
  const { studentIds, academyIds } = guardianScope();
  academyIds.forEach((academyId) => trackUsageOnce("guardian.growth_viewed", academyId));
  const selectedStudentId = studentIds.includes(state.guardianGrowthStudentId)
    ? state.guardianGrowthStudentId
    : studentIds[0];
  const student = studentById(selectedStudentId);
  const snapshot = selectedStudentId ? guardianChildSnapshot(selectedStudentId) : null;
  const latest = snapshot?.scores.at(-1);
  const previous = latest
    ? snapshot.scores.slice(0, -1).reverse().find((item) => item.academyId === latest.academyId && item.subject === latest.subject)
    : null;
  const change = latest && previous ? latest.percent - previous.percent : null;
  const benchmark = selectedStudentId ? guardianMoaflowBenchmark(selectedStudentId, latest) : null;
  const nationalGradeId = nationalAchievement2025[state.guardianNationalGrade] ? state.guardianNationalGrade : "middle3";
  const nationalGrade = nationalAchievement2025[nationalGradeId];
  return `
    <article class="panel national-education-panel">
      <div class="panel-head national-education-head">
        <div><h2>국가 학업성취도 참고지표</h2></div>
        <span class="badge gray">2025년</span>
      </div>
      <div class="national-grade-tabs" role="tablist" aria-label="국가 학업성취도 참고지표 학년 선택">
        ${Object.entries(nationalAchievement2025).map(([gradeId, grade]) => `
          <button type="button" role="tab" class="${gradeId === nationalGradeId ? "active" : ""}" aria-selected="${gradeId === nationalGradeId}" data-action="select-national-grade" data-grade="${gradeId}">${grade.label}</button>
        `).join("")}
      </div>
      <section class="national-indicator-grid">
        ${nationalGrade.subjects.map((subject) => `
          <div class="national-indicator">
            <h3>${subject.name}</h3>
            <div class="national-stat-block achievement">
              <div class="national-stat-heading"><span><b>보통학력 이상</b><small>3수준 이상</small></span><strong>${subject.levelThree.toFixed(1)}%</strong></div>
              <div class="national-stat-track" aria-hidden="true"><i style="width:${subject.levelThree}%"></i></div>
            </div>
            <div class="national-stat-block below-basic">
              <div class="national-stat-heading"><span><b>기초학력 미달</b><small>1수준</small></span><strong>${subject.levelOne.toFixed(1)}%</strong></div>
              <div class="national-stat-track" aria-hidden="true"><i style="width:${subject.levelOne}%"></i></div>
            </div>
          </div>
        `).join("")}
      </section>
      <footer class="national-education-source">
        <span>표집 25,992명 · 539개교 · 출처: 교육부·한국교육과정평가원</span>
        <a href="https://www.moe.go.kr/boardCnts/viewRenew.do?boardID=294&amp;boardSeq=106502&amp;lev=0&amp;m=020402&amp;opType=N&amp;page=1&amp;s=moe&amp;searchType=null&amp;statusYN=W" target="_blank" rel="noopener noreferrer">교육부 원문 보기</a>
      </footer>
    </article>
    ${studentIds.length ? `
      <fieldset class="guardian-growth-selector">
        <legend>학생 선택</legend>
        <div class="guardian-growth-options">
          ${studentIds.map((studentId) => `
            <label class="guardian-growth-option">
              <input type="radio" name="guardian-growth-student" value="${studentId}" ${studentId === selectedStudentId ? "checked" : ""} />
              <span class="guardian-growth-check" aria-hidden="true"></span>
              <span><strong>${escapeHtml(studentById(studentId)?.name || "자녀")}</strong><small>${studentSchoolGrade(studentId)}</small></span>
            </label>
          `).join("")}
        </div>
      </fieldset>
      <article class="panel guardian-growth-card">
        <div class="panel-head"><div><h2>${escapeHtml(student?.name || "자녀")} 성장 리포트</h2><p>연결 학원 ${snapshot.childLinks.length}곳의 실제 기록 기준</p></div></div>
        <section class="grid four horizontal-metrics guardian-growth-metrics">
          ${metricCard("최근 성취도", latest ? `${latest.percent}점` : "데이터 부족", latest ? academyById(latest.academyId)?.name || "" : "", false, true)}
          ${metricCard("직전 대비", change === null ? "비교 전" : `${change >= 0 ? "+" : ""}${change}점`, "평가 성취도", change !== null && change < 0, true)}
          ${metricCard("출석률", snapshot.attendanceRate === null ? "데이터 부족" : `${snapshot.attendanceRate}%`, "출석·지각 포함", false, true)}
          ${metricCard("과제 완료율", snapshot.homeworkRate === null ? "데이터 부족" : `${snapshot.homeworkRate}%`, "완료·대체·면제", snapshot.homeworkRate !== null && snapshot.homeworkRate < 70, true)}
        </section>
        <section class="moaflow-benchmark-section">
          <div class="subsection-head"><h3>MoaFlow 학습 비교</h3><span class="badge green">${escapeHtml(benchmark.grade)} · ${escapeHtml(benchmark.subject)}</span></div>
          <div class="grid four horizontal-metrics moaflow-benchmark-metrics">
            ${metricCard("비교 학생", `${benchmark.cohortSize}명`, benchmark.sampleLevel === "single" ? "평가 기록 1명" : benchmark.sampleLevel === "very_small" ? "소규모 표본 · 평균만 제공" : benchmark.sampleLevel === "small" ? "소규모 표본 참고용" : "충분한 비교 표본", false, true)}
            ${metricCard("평균", benchmark.average === null ? "비교 불가" : `${benchmark.average}점`, benchmark.average === null ? "평가 기록 2명 이상 필요" : `동일 학년·과목${benchmark.sampleLevel === "sufficient" ? "" : " · 참고용"}`, false, true)}
            ${metricCard("상위", benchmark.topPercent === null ? "비교 불가" : `${benchmark.topPercent}%`, benchmark.topPercent === null ? "30명 미만" : "동일 학년·과목", false, true)}
            ${metricCard("비교 기준", "최근 평가", "학생별 최신 성취도", false, true)}
          </div>
        </section>
        ${renderGuardianGrowthChart(snapshot, student?.name)}
      </article>
    ` : '<article class="panel"><div class="empty-state">연결된 자녀가 없습니다.</div></article>'}
  `;
}

function renderGuardianComments() {
  setPage("PARENT", "코멘트");
  const { linkedPairs } = guardianScope();
  const comments = state.consultationRecords
    .filter((item) => item.guardianSummary && linkedPairs.has(`${item.studentId}:${item.academyId}`))
    .map((item) => ({
      id: `comment-${item.id}`,
      consultationId: item.id,
      studentId: item.studentId,
      academyId: item.academyId,
      type: "코멘트",
      detail: item.guardianSummary,
      createdAt: item.createdAt || `${item.consultationDate}T12:00:00+09:00`
    }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const filtered = guardianFilters(comments).events;
  const unreadMessages = guardianUnreadCommentEvents();
  return `
    <section class="guardian-summary-strip">
      <span class="badge gray">공유 코멘트 ${comments.length}</span>
      ${unreadMessages.length ? `<span class="badge orange">새 메시지 ${unreadMessages.length}</span>` : ""}
    </section>
    <article class="panel guardian-comments-panel">
      <div class="panel-head"><div><h2>선생님 코멘트</h2><p>학원 내부 메모는 표시되지 않습니다.</p></div>${renderGuardianFilters(comments)}</div>
      <div class="guardian-comment-list">
        ${filtered.length ? filtered.map((item) => {
          const unread = guardianUnreadCommentEvents(item.consultationId);
          const originalUnread = unread.some((message) => message.id === item.id);
          return `
          <article class="guardian-comment ${unread.length ? "unread" : ""}">
            <div>
              <span class="source-tag">${escapeHtml(academyById(item.academyId)?.name || "학원")}</span>
              <span class="badge gray">${escapeHtml(studentById(item.studentId)?.name || "자녀")}</span>
              <time>${formatDateTime(item.createdAt)}</time>
              ${unread.length ? `<span class="badge orange">새 메시지 ${unread.length}</span><button class="button tertiary compact" data-action="mark-guardian-comment-read" data-consultation-id="${item.consultationId}">대화 확인</button>` : '<span class="badge gray">확인 완료</span>'}
            </div>
            <p class="${originalUnread ? "unread-message" : ""}">${escapeHtml(item.detail)}</p>
            ${renderCommentReplies(
              state.consultationRecords.find((record) => record.id === item.consultationId),
              "guardian"
            )}
          </article>`;
        }).join("") : '<div class="empty-state">공유된 코멘트가 없습니다.</div>'}
      </div>
    </article>`;
}

function renderGuardianNotifications() {
  setPage("PARENT", "알림");
  const events = guardianNotificationEvents();
  const filtered = guardianFilters(events).events;
  const unread = events.filter((item) => !state.guardianNotificationReads.includes(item.id)).length;
  return `
    <section class="guardian-summary-strip">
      <span class="badge ${unread ? "orange" : "gray"}">읽지 않은 알림 ${unread}</span>
    </section>
    <article class="panel guardian-notification-panel">
      <div class="panel-head">
        <div><h2>전체 알림</h2><p>연결된 자녀와 학원의 알림만 표시됩니다.</p></div>
        <div class="guardian-notification-actions">${renderGuardianFilters(events, `<button class="button secondary compact guardian-filter-action" data-action="mark-all-notifications-read" ${unread ? "" : "disabled"}>모두 읽음</button>`)}</div>
      </div>
      <div class="notification-list guardian-notification-scroll">
        ${filtered.length ? filtered.map((item) => {
          const isRead = state.guardianNotificationReads.includes(item.id);
          return `
            <button class="notification-item ${isRead ? "read" : "unread"}" data-action="read-notification" data-notification-id="${item.id}">
              <span class="notification-dot" aria-hidden="true"></span>
              <span>
                <small>${escapeHtml(studentById(item.studentId)?.name || "자녀")} · ${escapeHtml(academyById(item.academyId)?.name || "학원")} · ${item.type}</small>
                <strong>${escapeHtml(item.title)}</strong>
                <em>${escapeHtml(item.detail)}</em>
              </span>
              <time>${formatDateTime(item.createdAt)}</time>
            </button>`;
        }).join("") : '<div class="empty-state">선택한 조건의 알림이 없습니다.</div>'}
      </div>
    </article>`;
}

function operatorDateRange(daysValue = state.operatorMetricWindow || 7) {
  const days = Number(daysValue);
  const end = new Date(`${koreaDate()}T00:00:00+09:00`);
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  return {
    days,
    startDate: koreaDate(start),
    endDate: koreaDate(end),
    includes(date) {
      return date >= this.startDate && date <= this.endDate;
    }
  };
}

function featureUsageByAcademy(academy, range) {
  const staffUsers = new Set(
    state.staffMemberships
      .filter(
        (item) =>
          item.academyId === academy.id &&
          item.status === "active" &&
          ["academy_owner", "academy_instructor"].includes(item.role)
      )
      .map((item) => item.userId)
  );
  staffUsers.add(academy.ownerUserId);
  const linkedGuardians = new Set(
    state.guardianLinks
      .filter((item) => item.academyId === academy.id && item.status === "verified")
      .map((item) => item.guardianUserId)
  );
  const events = state.usageEvents.filter(
    (item) =>
      item.academyId === academy.id &&
      range.includes(koreaDate(new Date(item.createdAt)))
  );
  const analyticsEvents = events.filter(
    (item) => item.type === "academy.analytics_viewed" && staffUsers.has(item.userId)
  );
  const growthEvents = events.filter(
    (item) => item.type === "guardian.growth_viewed" && linkedGuardians.has(item.userId)
  );
  const analyticsUsers = new Set(analyticsEvents.map((item) => item.userId));
  const growthUsers = new Set(growthEvents.map((item) => item.userId));
  const usageGroups = new Map();
  [...analyticsEvents, ...growthEvents].forEach((item) => {
    const key = `${item.type}:${item.userId}`;
    if (!usageGroups.has(key)) usageGroups.set(key, new Set());
    usageGroups.get(key).add(koreaDate(new Date(item.createdAt)));
  });
  const repeatUsers = [...usageGroups.values()].filter((dates) => dates.size >= 2).length;
  const allUsage = [...analyticsEvents, ...growthEvents].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );
  const analyticsFilterUsed = events.some((item) => item.type === "academy.analytics_filter_used");
  const growthFilterUsed = events.some((item) => item.type === "guardian.growth_filter_used");
  const analyticsRate = rate(analyticsUsers.size, staffUsers.size);
  const growthRate = rate(growthUsers.size, linkedGuardians.size);
  const repeatRate = rate(repeatUsers, usageGroups.size);
  const averageRate = Math.round((analyticsRate + growthRate) / 2);
  return {
    academy,
    eligibleStaff: staffUsers.size,
    analyticsUsers: analyticsUsers.size,
    linkedGuardians: linkedGuardians.size,
    growthUsers: growthUsers.size,
    analyticsRate,
    growthRate,
    repeatUsers,
    usageUsers: usageGroups.size,
    repeatRate,
    analyticsFilterUsed,
    growthFilterUsed,
    lastUsedAt: allUsage.at(-1)?.createdAt || null,
    status: averageRate >= 70 && repeatRate > 0 ? "active" : averageRate > 0 ? "using" : "inactive"
  };
}

function featureUsageStatusLabel(status) {
  return ({ active: "활발", using: "사용 중", inactive: "미활용" })[status] || "미활용";
}

function featureUsageStatusTone(status) {
  return status === "active" ? "green" : status === "using" ? "blue" : "orange";
}

function renderOperatorUsage() {
  setPage("OPERATOR", "서비스 이용 현황");
  const range = operatorDateRange(state.operatorUsageWindow || "7");
  const metrics = state.academies.map((academy) => featureUsageByAcademy(academy, range));
  const eligibleStaff = metrics.reduce((sum, item) => sum + item.eligibleStaff, 0);
  const analyticsUsers = metrics.reduce((sum, item) => sum + item.analyticsUsers, 0);
  const linkedGuardians = metrics.reduce((sum, item) => sum + item.linkedGuardians, 0);
  const growthUsers = metrics.reduce((sum, item) => sum + item.growthUsers, 0);
  const usageUsers = metrics.reduce((sum, item) => sum + item.usageUsers, 0);
  const repeatUsers = metrics.reduce((sum, item) => sum + item.repeatUsers, 0);
  return `
    <section class="grid four horizontal-metrics">
      ${metricCard("학습분석 활용률", `${rate(analyticsUsers, eligibleStaff)}%`, `${analyticsUsers}/${eligibleStaff}명`)}
      ${metricCard("성장추이 조회율", `${rate(growthUsers, linkedGuardians)}%`, `${growthUsers}/${linkedGuardians}명`, true)}
      ${metricCard("재방문율", `${rate(repeatUsers, usageUsers)}%`, "2일 이상 이용")}
      ${metricCard("미활용 학원", metrics.filter((item) => item.status === "inactive").length, `전체 ${metrics.length}곳`)}
    </section>
    <article class="panel">
      <div class="panel-head">
        <div><h2>학원별 서비스 이용 현황</h2></div>
        <div class="compact-filters">
          <select id="operator-usage-window" aria-label="서비스 이용 기간">
            <option value="7" ${range.days === 7 ? "selected" : ""}>최근 7일</option>
            <option value="30" ${range.days === 30 ? "selected" : ""}>최근 30일</option>
          </select>
        </div>
      </div>
      <div class="table-wrap record-scroll">
        <table class="data-table usage-table">
          <thead><tr><th>학원</th><th>학습분석</th><th>성장추이</th><th>재방문</th><th>기능 탐색</th><th>최근 사용</th><th>상태</th></tr></thead>
          <tbody>
            ${metrics.map((item) => `
              <tr>
                <td><strong>${escapeHtml(item.academy.name)}</strong></td>
                <td><strong>${item.analyticsRate}%</strong><small>${item.analyticsUsers}/${item.eligibleStaff}명</small></td>
                <td><strong>${item.growthRate}%</strong><small>${item.growthUsers}/${item.linkedGuardians}명</small></td>
                <td>${item.repeatRate}%</td>
                <td>
                  <span class="badge ${item.analyticsFilterUsed ? "green" : "gray"}">분석 필터</span>
                  <span class="badge ${item.growthFilterUsed ? "green" : "gray"}">성장 필터</span>
                </td>
                <td>${formatDateTime(item.lastUsedAt)}</td>
                <td><span class="badge ${featureUsageStatusTone(item.status)}">${featureUsageStatusLabel(item.status)}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function rate(actual, expected) {
  return expected ? Math.min(100, Math.round((actual / expected) * 100)) : 0;
}

function academyPilotMetrics(academy, range = operatorDateRange()) {
  const activeEnrollments = state.enrollments.filter(
    (item) => item.academyId === academy.id && item.status === "active"
  );
  const activeStudents = new Set(activeEnrollments.map((item) => item.studentId));
  const activeClasses = new Set(activeEnrollments.map((item) => item.className));
  const attendance = new Set(
    state.attendanceRecords
      .filter(
        (item) =>
          item.academyId === academy.id &&
          range.includes(item.lessonDate) &&
          activeStudents.has(item.studentId)
      )
      .map((item) => `${item.studentId}:${item.lessonDate}`)
  );
  const learning = new Set(
    state.learningRecords
      .filter(
        (item) =>
          item.academyId === academy.id &&
          range.includes(item.lessonDate) &&
          activeClasses.has(item.className)
      )
      .map((item) => `${item.className}:${item.lessonDate}`)
  );
  const verifiedLinks = state.guardianLinks.filter(
    (item) =>
      item.academyId === academy.id &&
      item.status === "verified" &&
      activeStudents.has(item.studentId)
  );
  const linkedGuardians = new Set(verifiedLinks.map((item) => item.guardianUserId));
  const viewers = new Set(
    state.usageEvents
      .filter(
        (item) =>
          item.academyId === academy.id &&
          item.type === "guardian.home_viewed" &&
          range.includes(koreaDate(new Date(item.createdAt))) &&
          linkedGuardians.has(item.userId)
      )
      .map((item) => item.userId)
  );
  const csvRows = state.csvImports
    .filter((item) => item.academyId === academy.id)
    .reduce((sum, item) => sum + item.importedRows, 0);
  const steps = [
    csvRows > 0,
    attendance.size > 0,
    learning.size > 0,
    verifiedLinks.length > 0,
    viewers.size > 0
  ];
  const activityDates = [
    ...state.csvImports.filter((item) => item.academyId === academy.id).map((item) => item.createdAt),
    ...state.attendanceRecords.filter((item) => item.academyId === academy.id).map((item) => item.checkedAt),
    ...state.learningRecords.filter((item) => item.academyId === academy.id).map((item) => item.updatedAt),
    ...state.usageEvents.filter((item) => item.academyId === academy.id).map((item) => item.createdAt)
  ].filter(Boolean).sort();
  return {
    academy,
    activeStudents: activeStudents.size,
    attendanceCount: attendance.size,
    expectedAttendance: activeStudents.size * range.days,
    attendanceRate: rate(attendance.size, activeStudents.size * range.days),
    learningCount: learning.size,
    expectedLearning: activeClasses.size * range.days,
    learningRate: rate(learning.size, activeClasses.size * range.days),
    viewerCount: viewers.size,
    linkedGuardianCount: linkedGuardians.size,
    viewRate: rate(viewers.size, linkedGuardians.size),
    completedSteps: steps.filter(Boolean).length,
    openRequests: state.supportRequests.filter(
      (item) => item.academyId === academy.id && item.status !== "resolved"
    ).length,
    lastActivityAt: activityDates.at(-1) || null
  };
}

function operatorSummary(metrics) {
  const attendanceCount = metrics.reduce((sum, item) => sum + item.attendanceCount, 0);
  const expectedAttendance = metrics.reduce((sum, item) => sum + item.expectedAttendance, 0);
  const learningCount = metrics.reduce((sum, item) => sum + item.learningCount, 0);
  const expectedLearning = metrics.reduce((sum, item) => sum + item.expectedLearning, 0);
  const viewerCount = metrics.reduce((sum, item) => sum + item.viewerCount, 0);
  const linkedGuardianCount = metrics.reduce((sum, item) => sum + item.linkedGuardianCount, 0);
  return {
    attendanceRate: rate(attendanceCount, expectedAttendance),
    learningRate: rate(learningCount, expectedLearning),
    viewRate: rate(viewerCount, linkedGuardianCount)
  };
}

function pilotStatusLabel(status) {
  return (
    {
      pending: "도입 준비",
      active: "운영 중",
      paused: "일시 중지",
      completed: "운영 종료"
    }[status] || "도입 준비"
  );
}

function guardianUnreadCommentEvents(consultationId = null) {
  if (!currentUser() || currentRole() !== "guardian") return [];
  const { linkedPairs } = guardianScope();
  const readIds = new Set(state.guardianNotificationReads);
  const commentEvents = state.consultationRecords
    .filter(
      (item) =>
        item.guardianSummary &&
        linkedPairs.has(`${item.studentId}:${item.academyId}`) &&
        (!consultationId || item.id === consultationId)
    )
    .map((item) => ({ id: `comment-${item.id}`, consultationId: item.id }));
  const replyEvents = state.guardianCommentReplies
    .filter(
      (item) =>
        item.authorRole === "academy" &&
        linkedPairs.has(`${item.studentId}:${item.academyId}`) &&
        (!consultationId || item.consultationId === consultationId)
    )
    .map((item) => ({ id: `reply-${item.id}`, consultationId: item.consultationId }));
  return [...commentEvents, ...replyEvents].filter((item) => !readIds.has(item.id));
}

function pilotStatusTone(status) {
  if (status === "active") return "green";
  if (status === "paused") return "orange";
  if (status === "completed") return "gray";
  return "blue";
}

function renderOperatorHome() {
  setPage("OPERATOR", "운영 현황");
  const range = operatorDateRange();
  const metrics = state.academies.map((academy) => academyPilotMetrics(academy, range));
  const summary = operatorSummary(metrics);
  const active = state.academies.filter((item) => item.pilotStatus === "active").length;

  return `
    <section class="grid four horizontal-metrics">
      ${metricCard("운영 중", active, `전체 ${state.academies.length}곳`)}
      ${metricCard("출결 입력률", `${summary.attendanceRate}%`, `${range.days}일 재원 원생 기준`, true)}
      ${metricCard("학습 입력률", `${summary.learningRate}%`, `${range.days}일 운영 반 기준`)}
      ${metricCard("학부모 조회율", `${summary.viewRate}%`, "연결 학부모 기준")}
    </section>
    <article class="panel">
      <div class="panel-head">
        <div><h2>학원별 운영 현황</h2></div>
        <div class="compact-filters">
          <select id="operator-metric-window" aria-label="운영 지표 기간">
            <option value="1" ${range.days === 1 ? "selected" : ""}>오늘</option>
            <option value="7" ${range.days === 7 ? "selected" : ""}>최근 7일</option>
            <option value="30" ${range.days === 30 ? "selected" : ""}>최근 30일</option>
          </select>
          <button class="button tertiary compact" data-view-target="pilots">학원 관리</button>
        </div>
      </div>
      <div class="table-wrap record-scroll">
        <table class="data-table">
          <thead><tr><th>학원</th><th>전환 단계</th><th>출결 입력률</th><th>학습 입력률</th><th>조회율</th><th>미처리</th><th>운영 상태</th></tr></thead>
          <tbody>
            ${metrics.map((item) => {
              return `<tr>
                <td><div class="cell-stack"><button class="academy-name-button" data-action="open-academy-info" data-academy-id="${item.academy.id}" aria-label="${escapeHtml(item.academy.name)} 등록 정보 보기">${escapeHtml(item.academy.name)}</button><small>최근 활동 ${formatDateTime(item.lastActivityAt)}</small></div></td>
                <td><strong>${item.completedSteps}/5</strong></td>
                <td>${item.attendanceRate}%</td>
                <td>${item.learningRate}%</td>
                <td>${item.viewRate}%</td>
                <td><span class="badge ${item.openRequests ? "orange" : "gray"}">${item.openRequests}건</span></td>
                <td><span class="badge ${pilotStatusTone(item.academy.pilotStatus)}">${pilotStatusLabel(item.academy.pilotStatus)}</span></td>
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
        <div class="activity-item" data-record-date="${escapeHtml(log.createdAt.slice(0, 10))}" data-record-search="${escapeHtml(`${log.summary} ${userRoleName(actor)} ${actorRole} ${formatDateTime(log.createdAt)}`.toLocaleLowerCase("ko-KR"))}">
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
        <div class="panel-head"><div><h2>학원 기본 정보</h2></div></div>
        <div class="form-grid">
          <div class="full"><label for="academy-name">학원명</label><input id="academy-name" value="${escapeHtml(academy.name)}" /></div>
          <div><label for="academy-business-number">사업자등록번호</label><input id="academy-business-number" value="${escapeHtml(academy.businessRegistrationNumber)}" inputmode="numeric" maxlength="12" placeholder="000-00-00000" /></div>
          <div><label for="academy-owner">대표자</label><input id="academy-owner" value="${escapeHtml(userById(academy.ownerUserId)?.name || "한도담")}" disabled /></div>
          <div><label for="academy-phone">대표번호</label><input id="academy-phone" value="${escapeHtml(academy.phone)}" /></div>
          <div><label for="academy-main-program">주요 프로그램</label><input id="academy-main-program" value="${escapeHtml(academy.mainProgram || "")}" maxlength="80" placeholder="예: 중등 수학 심화·내신 대비" /></div>
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

function applyStudentListFilters() {
  const search = document.querySelector("#student-search")?.value || "";
  const className = document.querySelector("#student-class-filter")?.value || "all";
  const enrollmentStatus = document.querySelector("#student-enrollment-filter")?.value || "all";
  const connectionStatus = document.querySelector("#student-connection-filter")?.value || "all";
  const normalizedSearch = search.trim().toLocaleLowerCase("ko-KR");
  let visibleCount = 0;
  document.querySelectorAll("[data-student-row]").forEach((row) => {
    const visible =
      (!normalizedSearch || row.dataset.studentName.includes(normalizedSearch)) &&
      (className === "all" || row.dataset.className === className) &&
      (enrollmentStatus === "all" || row.dataset.enrollmentStatus === enrollmentStatus) &&
      (connectionStatus === "all" || row.dataset.connectionStatus === connectionStatus);
    row.hidden = !visible;
    if (visible) visibleCount += 1;
  });
  const empty = document.querySelector("#student-filter-empty");
  if (empty) empty.hidden = visibleCount > 0;
  state.studentSearch = search;
  state.studentClassFilter = className;
  state.studentEnrollmentFilter = enrollmentStatus;
  state.studentConnectionFilter = connectionStatus;
  persistState();
}

function renderStudents() {
  if (state.selectedStudentId) return renderStudentDetail(state.selectedStudentId);

  setPage(currentRole() === "academy_owner" ? "학원 운영" : "담당 원생", "원생 관리");
  const academy = currentAcademy();
  const enrollments = accessibleAcademyEnrollments();
  const canManage = hasPermission("student.manage");
  const canInvite = hasPermission("invite.manage");
  const classNames = [...new Set(enrollments.map((item) => item.className))];
  const searchQuery = String(state.studentSearch || "").trim().toLocaleLowerCase("ko-KR");
  const classFilter = classNames.includes(state.studentClassFilter) ? state.studentClassFilter : "all";
  const enrollmentFilter = ["active", "paused"].includes(state.studentEnrollmentFilter)
    ? state.studentEnrollmentFilter
    : "all";
  const connectionFilter = ["linked", "pending", "unlinked"].includes(state.studentConnectionFilter)
    ? state.studentConnectionFilter
    : "all";
  const connectionStatusFor = (enrollment) => {
    const linked = state.guardianLinks.some(
      (link) =>
        link.studentId === enrollment.studentId &&
        link.academyId === academy.id &&
        link.status === "verified"
    );
    if (linked) return "linked";
    return activeInvitationFor(enrollment.studentId, academy.id) ? "pending" : "unlinked";
  };
  const matchesStudentFilters = (enrollment) => {
    const student = studentById(enrollment.studentId);
    return (
      (!searchQuery || student?.name?.toLocaleLowerCase("ko-KR").includes(searchQuery)) &&
      (classFilter === "all" || enrollment.className === classFilter) &&
      (enrollmentFilter === "all" || enrollment.status === enrollmentFilter) &&
      (connectionFilter === "all" || connectionStatusFor(enrollment) === connectionFilter)
    );
  };
  const currentMonth = koreaDate().slice(0, 7);
  const newThisMonth = enrollments.filter(
    (item) => studentById(item.studentId)?.createdAt?.slice(0, 7) === currentMonth
  ).length;
  const activeCount = enrollments.filter((item) => item.status === "active").length;
  const pausedCount = enrollments.filter((item) => item.status === "paused").length;
  const linkedCount = enrollments.filter((item) => connectionStatusFor(item) === "linked").length;
  const pendingCount = enrollments.filter((item) => connectionStatusFor(item) === "pending").length;
  const unlinkedCount = enrollments.length - linkedCount - pendingCount;
  const visibleCount = enrollments.filter(matchesStudentFilters).length;
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
    <article class="panel student-list-panel">
      <div class="panel-head student-list-panel-head">
        <div><h2>전체 원생</h2></div>
        <div class="student-list-controls">
          <input id="student-search" type="search" value="${escapeHtml(state.studentSearch || "")}" placeholder="원생 이름 검색" aria-label="원생 이름 검색" />
        </div>
        ${canManage ? '<div class="row-actions"><button class="button secondary compact" data-action="open-csv-modal">CSV 가져오기</button><button class="button primary compact" data-action="open-student-modal">원생 등록</button></div>' : ""}
      </div>
      <div class="table-wrap record-scroll">
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
          <thead><tr>
            <th>원생</th>
            <th>생년월일</th>
            <th>첫 등원일</th>
            <th>
              <select id="student-class-filter" class="student-filter-header-select" aria-label="반 필터">
                <option value="all">반</option>
                ${classNames.map((item) => `<option value="${escapeHtml(item)}" ${item === classFilter ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}
              </select>
            </th>
            <th>
              <select id="student-enrollment-filter" class="student-filter-header-select" aria-label="재원 상태 필터">
                <option value="all" ${enrollmentFilter === "all" ? "selected" : ""}>재원 상태</option>
                <option value="active" ${enrollmentFilter === "active" ? "selected" : ""}>재원</option>
                <option value="paused" ${enrollmentFilter === "paused" ? "selected" : ""}>휴원</option>
              </select>
            </th>
            <th>보호자 정보</th>
            <th>
              <select id="student-connection-filter" class="student-filter-header-select" aria-label="연결 관리 필터">
                <option value="all" ${connectionFilter === "all" ? "selected" : ""}>연결 관리</option>
                <option value="linked" ${connectionFilter === "linked" ? "selected" : ""}>연결 완료</option>
                <option value="pending" ${connectionFilter === "pending" ? "selected" : ""}>초대 대기</option>
                <option value="unlinked" ${connectionFilter === "unlinked" ? "selected" : ""}>미연결</option>
              </select>
            </th>
            <th>관리</th>
          </tr></thead>
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
                const connectionStatus = connectionStatusFor(enrollment);
                const visible = matchesStudentFilters(enrollment);
                return `
                  <tr data-student-row data-student-name="${escapeHtml(student.name.toLocaleLowerCase("ko-KR"))}" data-class-name="${escapeHtml(enrollment.className)}" data-enrollment-status="${enrollment.status}" data-connection-status="${connectionStatus}" ${visible ? "" : "hidden"}>
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
      <div id="student-filter-empty" class="empty-state" ${visibleCount ? "hidden" : ""}>조건에 맞는 원생이 없습니다.</div>
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
  const homeworkHistory = state.homeworkAssignments
    .filter((item) => item.academyId === academy.id)
    .map((item) => ({
      ...item,
      studentStatus: item.statuses?.find((status) => status.studentId === studentId)
    }))
    .filter((item) => item.studentStatus)
    .sort((a, b) => b.assignedDate.localeCompare(a.assignedDate));
  const testHistory = state.assessments
    .filter((item) => item.academyId === academy.id)
    .map((item) => {
      const attempts = (item.attempts || [])
        .filter((attempt) => attempt.studentId === studentId)
        .sort((a, b) => a.attemptNo - b.attemptNo);
      return {
        ...item,
        studentAttempts: attempts,
        firstAttempt: attempts.find((attempt) => attempt.attemptNo === 1),
        latestRetest: attempts.filter((attempt) => attempt.attemptNo > 1).at(-1),
        correctionCount: (item.scoreHistory || []).filter((entry) => entry.studentId === studentId).length
      };
    })
    .filter((item) => item.studentAttempts.length)
    .sort((a, b) => b.testDate.localeCompare(a.testDate));
  const canViewConsultations = hasPermission("consultation.manage");
  const canManageComments = hasPermission("comment.manage") && enrollment.status === "active";
  const consultationHistory = canViewConsultations
    ? state.consultationRecords
        .filter((item) => item.academyId === academy.id && item.studentId === studentId)
        .sort((a, b) => b.consultationDate.localeCompare(a.consultationDate))
    : [];

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

    <section class="grid four horizontal-metrics student-profile-metrics">
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
                <div class="class-history-list record-scroll">${classHistory
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

      <article class="panel student-connection-history-panel">
        <div class="panel-head"><div><h2>보호자 연결·활동 이력</h2></div></div>
        <section class="panel-subsection">
          <h3 class="panel-subsection-title">보호자 연결</h3>
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
        </section>
        <section class="panel-subsection">
          <div class="record-subsection-head student-activity-head"><h3 class="panel-subsection-title">원생 관련 이력</h3>${recordSearchControl("student-activity-records", "활동 내용 검색")}</div>
          <div class="activity-list record-scroll" data-record-list="student-activity-records">${auditItems(relatedAudits)}</div>
          <div class="empty-state hidden" data-record-empty="student-activity-records">검색 결과가 없습니다.</div>
        </section>
      </article>
    </section>

    ${hasPermission("analytics.read") ? renderStudentAnalytics(student.id) : ""}

    <article class="panel student-homework-panel">
      <div class="panel-head">
        <div><h2>과제 수행</h2></div>
        ${
          hasPermission("homework.manage") && enrollment.status === "active"
            ? `<button class="button secondary compact" data-action="open-student-homework" data-student-id="${student.id}">과제 수행 관리</button>`
            : ""
        }
      </div>
      ${homeworkHistory.length ? recordSearchControl("student-homework-records", "과제명·상태 검색") : ""}
      ${
        homeworkHistory.length
          ? `<div class="table-wrap record-scroll">
              <table class="data-table student-homework-history">
                <thead><tr><th>날짜</th><th>과제명</th><th>반</th><th>수행 상태</th><th>예외 메모</th></tr></thead>
                <tbody data-record-list="student-homework-records">${homeworkHistory
                  .map(
                    (item) => `<tr data-record-date="${escapeHtml(item.assignedDate)}" data-record-search="${escapeHtml(recordSearchText(item.assignedDate, item.title, item.className, homeworkStatusLabel(item.studentStatus.status), item.studentStatus.note))}">
                      <td>${escapeHtml(item.assignedDate)}</td>
                      <td><strong>${escapeHtml(item.title)}</strong></td>
                      <td>${escapeHtml(item.className)}</td>
                      <td><span class="badge ${homeworkStatusTone(item.studentStatus.status)}">${homeworkStatusLabel(item.studentStatus.status)}</span></td>
                      <td>${escapeHtml(item.studentStatus.note || "—")}</td>
                    </tr>`
                  )
                  .join("")}</tbody>
              </table>
            </div><div class="empty-state hidden" data-record-empty="student-homework-records">검색 결과가 없습니다.</div>`
          : '<div class="empty-state">등록된 과제 수행 기록이 없습니다.</div>'
      }
    </article>

    <article class="panel student-test-panel">
      <div class="panel-head">
        <div><h2>테스트 결과</h2></div>
        ${
          hasPermission("test.manage") && enrollment.status === "active"
            ? `<button class="button secondary compact" data-action="open-student-tests" data-student-id="${student.id}">테스트 결과 관리</button>`
            : ""
        }
      </div>
      ${testHistory.length ? recordSearchControl("student-test-records", "평가명·상태 검색") : ""}
      ${
        testHistory.length
          ? `<div class="table-wrap record-scroll">
              <table class="data-table student-test-history">
                <thead><tr><th>시행일</th><th>평가명</th><th>상태</th><th>1차 점수</th><th>재시험</th><th>응시 횟수</th><th>수정 이력</th></tr></thead>
                <tbody data-record-list="student-test-records">${testHistory
                  .map((item) => {
                    const first = item.firstAttempt;
                    const status = first?.status || "taken";
                    const tone = status === "taken" ? "green" : status === "absent" ? "red" : "gray";
                    return `<tr data-record-date="${escapeHtml(item.testDate)}" data-record-search="${escapeHtml(recordSearchText(item.testDate, item.title, testStatusLabel(status), first?.score, item.latestRetest?.score))}">
                      <td>${escapeHtml(item.testDate)}</td>
                      <td><strong>${escapeHtml(item.title)}</strong></td>
                      <td><span class="badge ${tone}">${testStatusLabel(status)}</span></td>
                      <td>${first?.status === "taken" && Number.isFinite(first.score) ? `${first.score}/${item.maxScore}` : "—"}</td>
                      <td>${Number.isFinite(item.latestRetest?.score) ? `${item.latestRetest.score}/${item.maxScore}` : "—"}</td>
                      <td>${item.studentAttempts.length}회</td>
                      <td>${item.correctionCount}건</td>
                    </tr>`;
                  })
                  .join("")}</tbody>
              </table>
            </div><div class="empty-state hidden" data-record-empty="student-test-records">검색 결과가 없습니다.</div>`
          : '<div class="empty-state">등록된 테스트 결과가 없습니다.</div>'
      }
    </article>

    <article class="panel student-consultation-panel">
      <div class="panel-head">
        <div><h2>상담 기록</h2></div>
        <div class="row-actions">
          ${canViewConsultations && enrollment.status === "active" ? `<button class="button secondary compact" data-action="open-student-consultations" data-student-id="${student.id}">상담 기록 관리</button>` : ""}
          ${canManageComments ? `<button class="button secondary compact" data-action="open-student-comments" data-student-id="${student.id}">학부모 대화 열기</button>` : ""}
        </div>
      </div>
      ${
        !canViewConsultations
          ? '<div class="empty-state">상담 기록을 열람할 권한이 없습니다.</div>'
          : `${
              consultationHistory.length
                ? `<section class="panel-subsection student-consultation-followup">
                    <h3 class="panel-subsection-title">최근 후속조치</h3>
                    <div class="consultation-highlight">
                      <span>${formatDate(consultationHistory[0].consultationDate)}</span>
                      <strong>${escapeHtml(consultationHistory[0].nextAction)}</strong>
                      <p>${escapeHtml(consultationHistory[0].guardianSummary || consultationHistory[0].internalMemo)}</p>
                    </div>
                  </section>`
                : ""
            }
            <section class="panel-subsection">
              <div class="record-subsection-head"><h3 class="panel-subsection-title">상담 이력</h3>${consultationHistory.length ? recordSearchControl("student-consultation-records", "상담 내용 검색") : ""}</div>
              ${
                consultationHistory.length
                  ? `<div class="table-wrap record-scroll">
                      <table class="data-table student-consultation-history">
                        <thead><tr><th>상담일</th><th>상담 유형</th><th>후속조치</th><th>보호자 공유 요약</th><th>내부 메모</th></tr></thead>
                        <tbody data-record-list="student-consultation-records">${consultationHistory
                          .map(
                            (item) => `<tr data-record-date="${escapeHtml(item.consultationDate)}" data-record-search="${escapeHtml(recordSearchText(item.consultationDate, consultationTypeLabel(item.type), item.nextAction, item.guardianSummary, item.internalMemo))}">
                              <td>${escapeHtml(item.consultationDate)}</td>
                              <td><span class="badge gray">${consultationTypeLabel(item.type)}</span></td>
                              <td><strong>${escapeHtml(item.nextAction)}</strong></td>
                              <td>${escapeHtml(item.guardianSummary || "—")}</td>
                              <td>${escapeHtml(item.internalMemo)}</td>
                            </tr>`
                          )
                          .join("")}</tbody>
                      </table>
                    </div><div class="empty-state hidden" data-record-empty="student-consultation-records">검색 결과가 없습니다.</div>`
                  : '<div class="empty-state">등록된 상담 기록이 없습니다.</div>'
              }
            </section>`
      }
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
    .filter((item) => item.academyId === currentAcademy().id && item.status === "active")
    .map((item) => ({ ...item, user: userById(item.userId) }))
    .filter((item) => item.user);
  const permissionRows = [
    ["academy.manage", "학원 정보 관리", "학원 기본정보 수정"],
    ["student.manage", "원생 관리", "원생 등록·수정"],
    ["attendance.manage", "출결 관리", "반별 출결 입력"],
    ["learning.manage", "학습 기록", "일별 수업내용 입력"],
    ["homework.manage", "과제 관리", "학생별 수행 상태 입력"],
    ["test.manage", "테스트 관리", "점수·결시·재시험 입력"],
    ["analytics.read", "학습 분석", "주·월·누적 통계 조회"],
    ["consultation.manage", "상담 기록", "내부 메모·후속조치 작성"],
    ["csv.import", "CSV 가져오기", "원생 일괄 등록"],
    ["invite.manage", "보호자 초대", "보안 링크 발급"],
    ["permission.manage", "권한 관리", "구성원 위임"],
    ["audit.read", "활동 기록", "변경 내역 조회"]
  ];
  const instructors = members.filter((item) => item.role === "academy_instructor");
  const instructor = isOwner
    ? instructors.find((item) => item.id === state.selectedStaffMemberId) || instructors[0]
    : instructors.find((item) => item.userId === currentUser().id);
  const instructorName = instructor?.user?.name || "강사";
  return `
    <section class="grid two">
      <article class="panel">
        <div class="panel-head"><div><h2>학원 구성원</h2><p>강사 계정과 담당 반을 관리합니다.</p></div>${isOwner && hasPermission("member.manage") ? '<button class="button secondary compact" data-action="open-staff-member-modal">구성원 추가</button>' : ""}</div>
        <div class="card-list record-scroll">
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
                    <div class="staff-name-actions">
                      <strong>${escapeHtml(member.user.name)}</strong>
                      ${isOwner && member.role === "academy_instructor" ? `<button class="button tertiary compact staff-delete-button" data-action="open-remove-staff-member" data-membership-id="${member.id}">삭제</button>` : ""}
                    </div>
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
        <div class="panel-head"><div><h2>권한 설정</h2><p>${isOwner ? "강사별 권한을 선택해 관리합니다." : "현재 계정에 허용된 권한입니다."}</p></div>${isOwner && instructors.length > 1 ? `<select id="permission-member-select" aria-label="권한을 설정할 강사">${instructors.map((item) => `<option value="${item.id}" ${item.id === instructor?.id ? "selected" : ""}>${escapeHtml(item.user.name)}</option>`).join("")}</select>` : ""}</div>
        ${instructor ? `<div class="permission-grid">
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
                      ? `<button class="switch ${instructorAllowed ? "on" : ""}" data-action="toggle-permission" data-membership-id="${instructor.id}" data-permission="${key}" aria-label="${escapeHtml(instructorName)} ${label} ${instructorAllowed ? "회수" : "부여"}"></button>`
                      : `<span class="permission-state ${myAllowed ? "allowed" : "denied"}">${myAllowed ? "허용" : "제한"}</span>`
                  }
                </div>`;
            })
            .join("")}
        </div>` : '<div class="empty-state compact-empty">강사를 추가하면 권한을 설정할 수 있습니다.</div>'}
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
      "homework.manage": "과제 관리",
      "test.manage": "테스트 관리",
      "analytics.read": "학습 분석",
      "consultation.manage": "상담 기록",
      "csv.import": "CSV 가져오기",
      "invite.manage": "보호자 초대",
      "member.manage": "구성원 관리",
      "permission.manage": "권한 위임",
      "audit.read": "활동 기록 조회"
    }[key] || key
  );
}

function renderPilots() {
  setPage("ACADEMY OPERATIONS", "학원 관리");
  const filter = state.operatorPilotFilter || "all";
  const academies = state.academies.filter(
    (academy) => filter === "all" || academy.pilotStatus === filter
  );
  return `
    <section class="grid four horizontal-metrics">
      ${metricCard("전체 학원", state.academies.length, "등록 학원")}
      ${metricCard("운영 중", state.academies.filter((item) => item.pilotStatus === "active").length, "")}
      ${metricCard("도입 준비", state.academies.filter((item) => item.pilotStatus === "pending").length, "")}
      ${metricCard("일시 중지", state.academies.filter((item) => item.pilotStatus === "paused").length, "", true)}
    </section>
    <article class="panel">
      <div class="panel-head">
        <div><h2>학원 계정 상태</h2></div>
        <div class="compact-filters">
          <select id="operator-pilot-filter" aria-label="운영 상태 필터">
            <option value="all" ${filter === "all" ? "selected" : ""}>전체 상태</option>
            <option value="pending" ${filter === "pending" ? "selected" : ""}>도입 준비</option>
            <option value="active" ${filter === "active" ? "selected" : ""}>운영 중</option>
            <option value="paused" ${filter === "paused" ? "selected" : ""}>일시 중지</option>
            <option value="completed" ${filter === "completed" ? "selected" : ""}>운영 종료</option>
          </select>
        </div>
      </div>
      <div class="table-wrap record-scroll">
        <table class="data-table academy-status-table">
          <colgroup>
            <col class="academy-status-col-name" />
            <col class="academy-status-col-phone" />
            <col class="academy-status-col-date" />
            <col class="academy-status-col-students" />
            <col class="academy-status-col-state" />
            <col class="academy-status-col-change" />
            <col class="academy-status-col-info" />
          </colgroup>
          <thead><tr><th>학원</th><th>연락처</th><th>등록일</th><th>원생</th><th>운영 상태</th><th>변경</th><th>학원 정보</th></tr></thead>
          <tbody>
            ${academies
              .map(
                (academy) => `
                <tr>
                  <td><strong>${escapeHtml(academy.name)}</strong></td>
                  <td>${escapeHtml(academy.phone)}</td>
                  <td>${formatDateTime(academy.createdAt)}</td>
                  <td>${state.enrollments.filter((item) => item.academyId === academy.id).length}명</td>
                  <td><span class="badge ${pilotStatusTone(academy.pilotStatus)}">${pilotStatusLabel(academy.pilotStatus)}</span></td>
                  <td>
                    <div class="row-actions pilot-status-actions">
                      <select data-pilot-status="${academy.id}" aria-label="${escapeHtml(academy.name)} 운영 상태">
                        ${["pending", "active", "paused", "completed"].map((status) => `<option value="${status}" ${academy.pilotStatus === status ? "selected" : ""}>${pilotStatusLabel(status)}</option>`).join("")}
                      </select>
                      <button class="button tertiary compact" data-action="save-pilot-status" data-academy-id="${academy.id}">저장</button>
                    </div>
                  </td>
                  <td><button class="button secondary compact" data-action="open-academy-info" data-academy-id="${academy.id}">학원 정보</button></td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function recordSearchControl(listId, placeholder = "기록 내용 검색") {
  return `<div class="record-search-control">
    <input type="search" data-record-search-input="${listId}" placeholder="${escapeHtml(placeholder)}" aria-label="${escapeHtml(placeholder)}" />
    <div class="record-date-range">
      <span>기간</span>
      <input type="date" data-record-date-from="${listId}" aria-label="검색 시작일" />
      <span aria-hidden="true">~</span>
      <input type="date" data-record-date-to="${listId}" aria-label="검색 종료일" />
    </div>
  </div>`;
}

function recordSearchText(...values) {
  return values.filter(Boolean).join(" ").toLocaleLowerCase("ko-KR");
}

function applyRecordSearch(input) {
  const listId = input.dataset.recordSearchInput || input.dataset.recordDateFrom || input.dataset.recordDateTo;
  const list = document.querySelector(`[data-record-list="${listId}"]`);
  if (!list) return;
  const query = document.querySelector(`[data-record-search-input="${listId}"]`)?.value.trim().toLocaleLowerCase("ko-KR") || "";
  const dateFrom = document.querySelector(`[data-record-date-from="${listId}"]`)?.value || "";
  const dateTo = document.querySelector(`[data-record-date-to="${listId}"]`)?.value || "";
  let visibleCount = 0;
  list.querySelectorAll("[data-record-search]").forEach((item) => {
    const itemDate = item.dataset.recordDate || "";
    const visible =
      (!query || item.dataset.recordSearch.includes(query)) &&
      (!dateFrom || itemDate >= dateFrom) &&
      (!dateTo || itemDate <= dateTo);
    item.classList.toggle("hidden", !visible);
    if (visible) visibleCount += 1;
  });
  document.querySelector(`[data-record-empty="${listId}"]`)?.classList.toggle("hidden", visibleCount > 0);
}

function showAcademyInfo(academyId) {
  if (!hasPermission("pilot.read")) return;
  const academy = academyById(academyId);
  if (!academy) return;
  const owner = userById(academy.ownerUserId);
  const enrollmentCount = state.enrollments.filter((item) => item.academyId === academy.id).length;
  openModal(`
    <header>
      <div><h2 id="modal-title">${escapeHtml(academy.name)}</h2></div>
      <button class="icon-button" data-action="close-modal" aria-label="닫기">×</button>
    </header>
    <dl class="detail-list academy-info-list">
      <div><dt>대표자</dt><dd>${escapeHtml(owner?.name || "미등록")}</dd></div>
      <div><dt>사업자등록번호</dt><dd>${escapeHtml(academy.businessRegistrationNumber || "미등록")}</dd></div>
      <div><dt>연락처</dt><dd>${escapeHtml(academy.phone || "미등록")}</dd></div>
      <div><dt>주요 프로그램</dt><dd>${escapeHtml(academy.mainProgram || "미등록")}</dd></div>
      <div><dt>주소</dt><dd>${escapeHtml(academy.address || "미등록")}</dd></div>
      <div><dt>등록일</dt><dd>${formatDateTime(academy.createdAt)}</dd></div>
      <div><dt>원생</dt><dd>${enrollmentCount}명</dd></div>
      <div><dt>운영 상태</dt><dd><span class="badge ${pilotStatusTone(academy.pilotStatus)}">${pilotStatusLabel(academy.pilotStatus)}</span></dd></div>
    </dl>
  `);
}

function supportTypeLabel(type) {
  return (
    {
      error: "서비스 오류",
      inquiry: "사용 문의",
      suggestion: "기능 제안",
      other: "기타"
    }[type] || "기타"
  );
}

function supportStatusLabel(status) {
  return (
    {
      open: "접수",
      in_progress: "처리 중",
      resolved: "완료"
    }[status] || "접수"
  );
}

function supportStatusTone(status) {
  if (status === "resolved") return "green";
  if (status === "in_progress") return "blue";
  return "orange";
}

function supportAcademiesForCurrentUser() {
  if (currentRole() === "academy_owner" || currentRole() === "academy_instructor") {
    return [currentAcademy()].filter(Boolean);
  }
  if (currentRole() === "guardian") {
    const academyIds = [
      ...new Set(
        state.guardianLinks
          .filter((item) => item.guardianUserId === currentUser().id && item.status === "verified")
          .map((item) => item.academyId)
          .filter(Boolean)
      )
    ];
    return academyIds.map(academyById).filter(Boolean);
  }
  return [];
}

function renderSupport() {
  setPage("SUPPORT", "오류·문의");
  const isOperator = currentRole() === "operator";
  const statusFilter = state.operatorSupportStatusFilter || "all";
  const typeFilter = state.operatorSupportTypeFilter || "all";
  const academy = currentAcademy();
  const scopedRequests = isOperator
    ? state.supportRequests
    : currentRole() === "academy_owner"
      ? state.supportRequests.filter((item) => item.academyId === academy?.id)
      : state.supportRequests.filter((item) => item.reporterUserId === currentUser().id);
  const requests = scopedRequests
    .filter(
      (item) =>
        !isOperator ||
        ((statusFilter === "all" || item.status === statusFilter) &&
          (typeFilter === "all" || item.type === typeFilter))
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const supportAcademies = supportAcademiesForCurrentUser();
  const canCreate = hasPermission("request.create") && supportAcademies.length > 0;
  const academyField = supportAcademies.length > 1
    ? `<label>문의 학원
        <select id="support-academy" required>
          ${supportAcademies.map((item) => `<option value="${item.id}">${escapeHtml(item.name)}</option>`).join("")}
        </select>
      </label>`
    : supportAcademies.length === 1
      ? `<input id="support-academy" type="hidden" value="${supportAcademies[0].id}">`
      : "";
  return `
    <section class="grid four horizontal-metrics">
      ${metricCard("전체 접수", scopedRequests.length, "")}
      ${metricCard("신규", scopedRequests.filter((item) => item.status === "open").length, "")}
      ${metricCard("처리 중", scopedRequests.filter((item) => item.status === "in_progress").length, "", true)}
      ${metricCard("완료", scopedRequests.filter((item) => item.status === "resolved").length, "")}
    </section>
    <section class="${isOperator ? "" : "support-layout"}">
      ${isOperator ? "" : `
        <article class="panel">
          <div class="panel-head"><div><h2>새 문의 등록</h2><p>오류나 이용 문의를 등록하면 운영자가 확인 후 답변합니다.</p></div></div>
          ${canCreate ? `<form id="support-create-form" class="form-grid">
          ${academyField}
          <label>문의 유형
            <select id="support-type" required>
              <option value="error">서비스 오류</option>
              <option value="inquiry">사용 문의</option>
              <option value="suggestion">기능 제안</option>
              <option value="other">기타</option>
            </select>
          </label>
          <label class="full">제목
            <input id="support-title" maxlength="80" required>
          </label>
          <label class="full">내용
            <textarea id="support-detail" rows="4" maxlength="500" required></textarea>
          </label>
          <div class="form-actions full"><button class="button primary" type="submit">접수 등록</button></div>
          </form>` : '<div class="empty-state compact-empty">연결된 학원이 없어 문의를 등록할 수 없습니다.</div>'}
        </article>
      `}
      <article class="panel support-list-panel">
        <div class="panel-head">
          <div><h2>${isOperator ? "처리 목록" : currentRole() === "academy_owner" ? "학원 요청 내역" : "내 요청 내역"}</h2></div>
          ${isOperator ? `<div class="compact-filters">
            <select id="operator-support-type-filter" aria-label="문의 유형 필터">
              <option value="all" ${typeFilter === "all" ? "selected" : ""}>전체 유형</option>
              <option value="error" ${typeFilter === "error" ? "selected" : ""}>서비스 오류</option>
              <option value="inquiry" ${typeFilter === "inquiry" ? "selected" : ""}>사용 문의</option>
              <option value="suggestion" ${typeFilter === "suggestion" ? "selected" : ""}>기능 제안</option>
              <option value="other" ${typeFilter === "other" ? "selected" : ""}>기타</option>
            </select>
            <select id="operator-support-status-filter" aria-label="처리 상태 필터">
              <option value="all" ${statusFilter === "all" ? "selected" : ""}>전체 상태</option>
              <option value="open" ${statusFilter === "open" ? "selected" : ""}>접수</option>
              <option value="in_progress" ${statusFilter === "in_progress" ? "selected" : ""}>처리 중</option>
              <option value="resolved" ${statusFilter === "resolved" ? "selected" : ""}>완료</option>
            </select>
          </div>` : ""}
        </div>
        <div class="support-list record-scroll">
          ${requests.length ? requests.map((item) => `
            <article class="support-card">
              <header>
                <div>
                  <span class="badge ${item.type === "error" ? "orange" : "gray"}">${supportTypeLabel(item.type)}</span>
                  <span class="badge ${supportStatusTone(item.status)}">${supportStatusLabel(item.status)}</span>
                  <strong>${escapeHtml(item.title)}</strong>
                </div>
                <time>${formatDateTime(item.updatedAt)}</time>
              </header>
              <p>${escapeHtml(item.detail)}</p>
              <small>${escapeHtml(academyById(item.academyId)?.name || "학원")} · ${escapeHtml(item.reporterName)}</small>
              ${isOperator ? `<div class="support-update-row">
                <select data-support-status="${item.id}" aria-label="${escapeHtml(item.title)} 처리 상태">
                  ${["open", "in_progress", "resolved"].map((status) => `<option value="${status}" ${item.status === status ? "selected" : ""}>${supportStatusLabel(status)}</option>`).join("")}
                </select>
                <input data-support-note="${item.id}" value="${escapeHtml(item.resolution)}" placeholder="처리 내용">
                <button class="button tertiary compact" data-action="save-support-request" data-request-id="${item.id}">저장</button>
              </div>` : `<div class="support-response ${item.resolution ? "answered" : ""}"><strong>운영자 답변</strong><span>${escapeHtml(item.resolution || "답변을 기다리고 있습니다.")}</span></div>`}
              ${item.history.length ? `<details><summary>처리 이력 ${item.history.length}건</summary><div class="support-history">${item.history.map((history) => `<span><strong>${supportStatusLabel(history.status)}</strong>${escapeHtml(history.note)} · ${formatDateTime(history.updatedAt)}</span>`).join("")}</div></details>` : ""}
            </article>
          `).join("") : `<div class="empty-state">${isOperator ? "선택한 조건의 접수 내역이 없습니다." : "등록된 오류·문의가 없습니다."}</div>`}
        </div>
      </article>
    </section>
  `;
}

function renderData() {
  if (currentRole() === "guardian") return renderGuardianData();
  setPage("COMMON DATA MODEL", "공통 데이터 구조");
  const schemas = [
    ["users", state.users.length, ["id · 휴대전화", "role · 계정 역할", "status · 활성 상태"]],
    ["academies", state.academies.length, ["owner_user_id", "business_registration_number", "main_program · pilot_status · created_at"]],
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
    ["homework_assignments", state.homeworkAssignments.length, ["academy_id · class_name · assigned_date", "title · student_id", "status · note · confirmed_at"]],
    ["test_settings", state.testSettings.length, ["academy_id · class_name · subject", "frequency · average_visibility", "updated_by · updated_at"]],
    ["assessments", state.assessments.length, ["academy_id · class_name · test_date", "type · scope · max_score", "attempts · score_history"]],
    ["consultation_records", state.consultationRecords.length, ["academy_id · student_id", "internal_memo · guardian_summary", "next_action · consultation_date"]],
    ["guardian_comment_replies", state.guardianCommentReplies.length, ["consultation_id · academy_id · student_id", "author_user_id · author_role", "body · created_at"]],
    ["academy_comment_reply_reads", Object.values(state.academyCommentReplyReads).reduce((sum, items) => sum + items.length, 0), ["user_id", "reply_ids", "per-user unread state"]],
    ["usage_events", state.usageEvents.length, ["academy_id · user_id", "type", "created_at"]],
    ["support_requests", state.supportRequests.length, ["academy_id · type", "status · resolution", "history · updated_at"]],
    ["audit_logs", state.auditLogs.length, ["academy_id", "actor_user_id", "action · target · created_at"]]
  ];
  return `
    <article class="panel">
      <div class="panel-head"><div><h2>관계 중심 공통 모델</h2></div><span class="badge green">schema v${state.schemaVersion}</span></div>
      ${relationshipMap()}
    </article>
    <article class="panel">
      <div class="panel-head"><div><h2>핵심 엔터티</h2></div></div>
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

function privacyRightTypeLabel(type) {
  return (
    {
      access: "열람",
      correction: "정정",
      deletion: "삭제",
      restriction: "처리 정지",
      withdrawal: "동의 철회"
    }[type] || "기타"
  );
}

function privacyRightStatusLabel(status) {
  return ({ received: "접수", reviewing: "검토 중", completed: "처리 완료" })[status] || "접수";
}

function privacyRightStatusTone(status) {
  if (status === "completed") return "green";
  if (status === "reviewing") return "blue";
  return "orange";
}

function renderGuardianData() {
  setPage("PRIVACY & CONSENT", "내 정보·동의");
  const userConsents = state.consents.filter((item) => item.guardianUserId === currentUser().id);
  const userLinks = state.guardianLinks.filter(
    (item) => item.guardianUserId === currentUser().id && item.status === "verified"
  );
  const linkedChildren = new Set(userLinks.map((item) => item.studentId)).size;
  const grantedConsents = userConsents.filter((item) => item.status === "granted").length;
  const privacyRequests = (state.privacyRightsRequests || [])
    .filter((item) => item.requesterUserId === currentUser().id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return `
    <section class="guardian-summary-strip">
      <span class="badge green">연결 자녀 ${linkedChildren}명</span>
      <span class="badge gray">유효 동의 ${grantedConsents}건</span>
    </section>
    <section class="grid two">
      <article class="panel">
        <div class="panel-head"><div><h2>계정 정보</h2></div></div>
        <div class="check-list account-info-list">
          ${checkItem("이름", currentUser().name)}
          ${checkItem("휴대전화", maskPhone(currentUser().phone))}
          ${checkItem("연결 자녀", `${linkedChildren}명 · 학원 연결 ${userLinks.length}건`)}
        </div>
      </article>
      <article class="panel">
        <div class="panel-head"><div><h2>보호·동의 현황</h2></div></div>
        <section class="panel-subsection">
          <h3 class="panel-subsection-title">내 정보 보호</h3>
          <div class="check-list">
            ${checkItem("휴대전화 본인확인 완료", maskPhone(currentUser().phone))}
            ${checkItem("학생 정보 최소 수집", "연결 확인에 필요한 항목만 저장")}
            ${checkItem("동의 이력 보관", `유효 동의 ${grantedConsents}건`)}
          </div>
        </section>
        <section class="panel-subsection">
          <h3 class="panel-subsection-title">자녀 연결 동의 이력</h3>
          <div class="card-list record-scroll">
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
    <article class="panel privacy-rights-panel">
      <div class="panel-head">
        <div>
          <h2>개인정보 권리 요청</h2>
          <p>본인 및 연결된 자녀의 개인정보에 대해 필요한 조치를 요청할 수 있습니다.</p>
        </div>
        <button class="button tertiary compact" data-action="request-rights">권리 요청하기</button>
      </div>
      <div class="privacy-rights-guide">
        <p>개인정보의 열람, 정정, 삭제, 처리 정지 또는 동의 철회를 요청하면 운영자가 본인 확인과 처리 가능 여부를 검토한 뒤 결과를 안내합니다.</p>
        <div class="privacy-rights-types" aria-label="요청 가능한 개인정보 권리">
          <span>열람</span><span>정정</span><span>삭제</span><span>처리 정지</span><span>동의 철회</span>
        </div>
        <div class="notice">관련 법령에 따라 보관 의무가 있는 정보는 삭제 또는 처리 정지가 제한될 수 있습니다.</div>
      </div>
      <section class="panel-subsection privacy-rights-history">
        <h3 class="panel-subsection-title">요청 내역</h3>
        <div class="card-list record-scroll">
          ${privacyRequests.length
            ? privacyRequests.map((request) => {
                const target = request.studentId ? `${studentById(request.studentId)?.name || "자녀"} 학생` : "본인";
                return `
                  <div class="list-card privacy-rights-request-card">
                    <div class="activity-icon">권리</div>
                    <div>
                      <strong>${privacyRightTypeLabel(request.type)} 요청</strong>
                      <small>${escapeHtml(target)} · ${formatDateTime(request.createdAt)} · ${maskPhone(request.contact)}</small>
                      <p>${escapeHtml(request.detail)}</p>
                    </div>
                    <span class="badge ${privacyRightStatusTone(request.status)}">${privacyRightStatusLabel(request.status)}</span>
                  </div>
                `;
              }).join("")
            : '<div class="empty-state compact-empty">접수된 개인정보 권리 요청이 없습니다.</div>'}
        </div>
      </section>
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
      <div class="panel-head"><div><h2>${isOperator ? "변경·접근 이력" : "상세 활동 내역"}</h2></div>${recordSearchControl("audit-records", "활동 내용·행위자 검색")}</div>
      <div class="table-wrap record-scroll audit-record-scroll">
        <table class="data-table">
          <thead><tr><th>시각</th><th>행위자</th><th>${isOperator ? "이벤트" : "활동 유형"}</th><th>내용</th>${isOperator ? "<th>대상</th>" : ""}</tr></thead>
          <tbody data-record-list="audit-records">
            ${visibleAuditLogs
              .map((log) => {
                const actor = userById(log.actorUserId);
                const activityType = isOperator ? log.action : auditActionLabel(log.action);
                return `<tr data-record-date="${escapeHtml(log.createdAt.slice(0, 10))}" data-record-search="${escapeHtml(recordSearchText(formatDateTime(log.createdAt), userRoleName(actor), activityType, log.summary, log.targetType, log.targetId))}"><td>${formatDateTime(log.createdAt)}</td><td>${escapeHtml(userRoleName(actor))}</td><td><span class="badge gray">${escapeHtml(activityType)}</span></td><td>${escapeHtml(log.summary)}</td>${isOperator ? `<td>${escapeHtml(log.targetType)} · ${escapeHtml(log.targetId)}</td>` : ""}</tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>
      <div class="empty-state hidden" data-record-empty="audit-records">검색 결과가 없습니다.</div>
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
    <header><div><h2 id="modal-title">원생 CSV 가져오기</h2></div><button class="icon-button" data-action="close-modal" aria-label="닫기">×</button></header>
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
    <header><div><h2 id="modal-title">CSV 가져오기 결과</h2></div><button class="icon-button" data-action="close-modal" aria-label="닫기">×</button></header>
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
  const currentTime = koreaTime();
  selectedRows.forEach((checkbox) => {
    const studentId = checkbox.dataset.studentId;
    const select = document.querySelector(`[name="attendance-${studentId}"]`);
    const arrivalTime = document.querySelector(`[name="arrival-${studentId}"]`);
    if (select) select.value = status;
    if (["present", "late"].includes(status) && arrivalTime && !arrivalTime.value) {
      arrivalTime.value = currentTime;
    }
    if (status === "absent" && arrivalTime) arrivalTime.value = "";
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
    ${recordSearchControl("attendance-change-records", "수정 내용 검색")}
    <div class="history-list record-scroll" data-record-list="attendance-change-records">
      ${(record.history || []).map((item) => `
        <div class="history-item" data-record-date="${escapeHtml(item.changedAt.slice(0, 10))}" data-record-search="${escapeHtml(recordSearchText(label(item.previousStatus), label(item.nextStatus), userById(item.changedBy)?.name, formatDateTime(item.changedAt), item.previousArrivalTime, item.nextArrivalTime, item.nextReason))}">
          <div><strong>${label(item.previousStatus)} → ${label(item.nextStatus)}</strong><small>${escapeHtml(userById(item.changedBy)?.name || "사용자")} · ${formatDateTime(item.changedAt)}</small></div>
          <p>시각 ${escapeHtml(item.previousArrivalTime || "—")} → ${escapeHtml(item.nextArrivalTime || "—")} · 사유 ${escapeHtml(item.nextReason || "없음")}</p>
        </div>
      `).join("") || '<div class="empty-state">수정 이력이 없습니다.</div>'}
    </div>
    <div class="empty-state hidden" data-record-empty="attendance-change-records">검색 결과가 없습니다.</div>`);
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

function updateHomeworkSelectionCount() {
  const checkboxes = [...document.querySelectorAll(".homework-row-check")];
  const selected = checkboxes.filter((item) => item.checked);
  const count = document.querySelector("#homework-selected-count");
  const selectAll = document.querySelector("#homework-select-all");
  if (count) count.textContent = `${selected.length}명`;
  if (selectAll) {
    selectAll.checked = checkboxes.length > 0 && selected.length === checkboxes.length;
    selectAll.indeterminate = selected.length > 0 && selected.length < checkboxes.length;
  }
}

function updateHomeworkStatusBadge(studentId, status) {
  const badge = document.querySelector(`[data-homework-current="${studentId}"]`);
  if (!badge) return;
  badge.className = `badge ${homeworkStatusTone(status)}`;
  badge.textContent = homeworkStatusLabel(status);
}

function saveHomework(event) {
  event.preventDefault();
  const selected = [...event.target.querySelectorAll(".homework-row-check:checked")];
  if (selected.length) {
    const bulkStatus = document.querySelector("#homework-bulk-status")?.value;
    if (!bulkStatus) {
      toast("수행 상태를 선택해주세요.", "error");
      return;
    }
    selected.forEach((checkbox) => {
      const studentId = checkbox.dataset.studentId;
      const select = event.target.querySelector(`[name="homework-status-${studentId}"]`);
      if (select) select.value = bulkStatus;
      updateHomeworkStatusBadge(studentId, bulkStatus);
    });
  }
  const formData = new FormData(event.target);
  const academy = currentAcademy();
  const className = formData.get("class-name");
  const assignedDate = formData.get("assigned-date");
  const title = formData.get("title").trim();
  const enrollments = state.enrollments.filter(
    (item) => item.academyId === academy.id && item.className === className && item.status === "active"
  );
  const existing = state.homeworkAssignments.find(
    (item) => item.academyId === academy.id && item.className === className && item.assignedDate === assignedDate
  );
  const statuses = enrollments.map((enrollment) => {
    const statusName = `homework-status-${enrollment.studentId}`;
    const noteName = `homework-note-${enrollment.studentId}`;
    const saved = existing?.statuses?.find((item) => item.studentId === enrollment.studentId);
    return {
      studentId: enrollment.studentId,
      status: formData.has(statusName) ? formData.get(statusName) : saved?.status || "completed",
      note: formData.has(noteName) ? formData.get(noteName).trim() : saved?.note || ""
    };
  });
  if (existing) {
    Object.assign(existing, {
      title,
      statuses,
      updatedBy: currentUser().id,
      updatedAt: new Date().toISOString()
    });
  } else {
    state.homeworkAssignments.push({
      id: `hw-${Date.now()}`,
      academyId: academy.id,
      className,
      assignedDate,
      title,
      statuses,
      createdBy: currentUser().id,
      createdAt: new Date().toISOString()
    });
  }
  addAudit("homework.saved", "class", className, `${className} 과제 상태 ${statuses.length}명 저장`);
  persistState();
  renderView();
  toast(
    selected.length
      ? `선택한 ${selected.length}명의 과제 상태를 일괄 변경하고 저장했습니다.`
      : "과제 상태를 저장하고 자동 통계에 반영했습니다."
  );
}

function saveTests(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const academy = currentAcademy();
  const className = formData.get("class-name");
  const subject = formData.get("subject").trim();
  const frequency = formData.get("frequency");
  const averageVisibility = formData.get("average-visibility");
  const now = new Date().toISOString();
  let setting = state.testSettings.find(
    (item) => item.academyId === academy.id && item.className === className
  );
  if (setting) {
    Object.assign(setting, { subject, frequency, averageVisibility, updatedBy: currentUser().id, updatedAt: now });
  } else {
    setting = {
      id: `tst-setting-${Date.now()}`,
      academyId: academy.id,
      className,
      subject,
      frequency,
      averageVisibility,
      updatedBy: currentUser().id,
      updatedAt: now
    };
    state.testSettings.push(setting);
  }

  const maxScore = Number(formData.get("max-score"));
  let assessment = state.assessments.find((item) => item.id === formData.get("assessment-id"));
  if (!assessment) {
    assessment = {
      id: `asm-${Date.now()}`,
      academyId: academy.id,
      className,
      subject,
      title: formData.get("title").trim(),
      type: formData.get("type"),
      scope: formData.get("scope").trim(),
      testDate: formData.get("test-date"),
      maxScore,
      attempts: [],
      scoreHistory: [],
      createdBy: currentUser().id,
      createdAt: now
    };
    state.assessments.push(assessment);
  } else {
    Object.assign(assessment, {
      subject,
      title: formData.get("title").trim(),
      type: formData.get("type"),
      scope: formData.get("scope").trim(),
      testDate: formData.get("test-date"),
      maxScore,
      updatedBy: currentUser().id,
      updatedAt: now
    });
  }

  const enrollments = state.enrollments.filter(
    (item) => item.academyId === academy.id && item.className === className && item.status === "active"
  );
  for (const enrollment of enrollments) {
    const statusName = `test-status-${enrollment.studentId}`;
    if (!formData.has(statusName)) continue;
    const status = formData.get(statusName);
    const rawScore = formData.get(`test-score-${enrollment.studentId}`);
    const score = status === "taken" && rawScore !== "" ? Number(rawScore) : null;
    const note = formData.get(`test-note-${enrollment.studentId}`)?.trim() || "";
    if (status === "taken" && (score === null || score < 0 || score > maxScore)) {
      toast(`${studentById(enrollment.studentId)?.name} 학생의 점수를 확인해주세요.`, "error");
      return;
    }
    let first = assessment.attempts.find(
      (item) => item.studentId === enrollment.studentId && item.attemptNo === 1
    );
    if (first) {
      if (first.status !== status || first.score !== score) {
        assessment.scoreHistory.unshift({
          id: `tsh-${Date.now()}-${enrollment.studentId}`,
          studentId: enrollment.studentId,
          previousStatus: first.status,
          nextStatus: status,
          previousScore: first.score,
          nextScore: score,
          changedBy: currentUser().id,
          changedAt: now,
          reason: note || "결과 정정"
        });
      }
      Object.assign(first, { status, score, note, updatedBy: currentUser().id, updatedAt: now });
    } else {
      first = {
        id: `atm-${Date.now()}-${enrollment.studentId}`,
        studentId: enrollment.studentId,
        attemptNo: 1,
        status,
        score,
        note,
        recordedAt: now,
        recordedBy: currentUser().id
      };
      assessment.attempts.push(first);
    }
    const rawRetestScore = formData.get(`retest-score-${enrollment.studentId}`);
    if (rawRetestScore !== "") {
      const retestScore = Number(rawRetestScore);
      if (retestScore < 0 || retestScore > maxScore) {
        toast(`${studentById(enrollment.studentId)?.name} 학생의 재시험 점수를 확인해주세요.`, "error");
        return;
      }
      const studentAttempts = assessment.attempts.filter(
        (item) => item.studentId === enrollment.studentId
      );
      assessment.attempts.push({
        id: `atm-${Date.now()}-${enrollment.studentId}-${studentAttempts.length + 1}`,
        studentId: enrollment.studentId,
        attemptNo: Math.max(...studentAttempts.map((item) => item.attemptNo), 0) + 1,
        status: "taken",
        score: retestScore,
        note: "재시험",
        recordedAt: now,
        recordedBy: currentUser().id
      });
    }
  }
  state.selectedAssessmentId = assessment.id;
  addAudit("assessment.saved", "assessment", assessment.id, `${assessment.title} 결과 저장`);
  persistState();
  renderView();
  toast("테스트 결과와 모든 응시 시도를 저장했습니다.");
}

function showScoreHistory(assessmentId) {
  if (currentRole() !== "academy_owner") {
    toast("점수 수정이력은 원장만 확인할 수 있습니다.", "error");
    return;
  }
  const assessment = state.assessments.find((item) => item.id === assessmentId);
  if (!assessment) return;
  openModal(`
    <header><div><h2 id="modal-title">점수 수정이력</h2><p>${escapeHtml(assessment.title)} · 원장 전용</p></div><button class="icon-button" data-action="close-modal" aria-label="닫기">×</button></header>
    ${recordSearchControl("score-change-records", "학생명·수정 내용 검색")}
    <div class="history-list record-scroll" data-record-list="score-change-records">
      ${(assessment.scoreHistory || []).map((item) => `<div class="history-item" data-record-date="${escapeHtml(item.changedAt.slice(0, 10))}" data-record-search="${escapeHtml(recordSearchText(studentById(item.studentId)?.name, testStatusLabel(item.previousStatus), testStatusLabel(item.nextStatus), userById(item.changedBy)?.name, formatDateTime(item.changedAt), item.previousScore, item.nextScore, item.reason))}">
        <div><strong>${escapeHtml(studentById(item.studentId)?.name || "학생")} · ${testStatusLabel(item.previousStatus)} → ${testStatusLabel(item.nextStatus)}</strong><small>${escapeHtml(userById(item.changedBy)?.name || "사용자")} · ${formatDateTime(item.changedAt)}</small></div>
        <p>점수 ${item.previousScore ?? "—"} → ${item.nextScore ?? "—"} · ${escapeHtml(item.reason)}</p>
      </div>`).join("") || '<div class="empty-state">수정 이력이 없습니다.</div>'}
    </div>
    <div class="empty-state hidden" data-record-empty="score-change-records">검색 결과가 없습니다.</div>
  `);
}

function saveConsultation(event) {
  event.preventDefault();
  if (!hasPermission("consultation.manage")) {
    toast("상담 기록을 작성할 권한이 없습니다.", "error");
    return;
  }
  const formData = new FormData(event.target);
  const studentId = formData.get("student-id");
  const record = {
    id: `csl-${Date.now()}`,
    academyId: currentAcademy().id,
    studentId,
    consultationDate: formData.get("consultation-date"),
    type: formData.get("type"),
    internalMemo: formData.get("internal-memo").trim(),
    nextAction: formData.get("next-action").trim(),
    guardianSummary: formData.get("guardian-summary")?.trim() || "",
    createdBy: currentUser().id,
    createdAt: new Date().toISOString()
  };
  state.consultationRecords.push(record);
  state.consultationStudentId = studentId;
  addAudit("consultation.saved", "student", studentId, `${studentById(studentId)?.name} 상담 기록 저장`);
  persistState();
  renderView();
  toast("상담 내용과 후속조치를 저장했습니다.");
}

function saveAcademyComment(event) {
  event.preventDefault();
  if (!hasPermission("comment.manage")) {
    toast("공개 코멘트를 작성할 권한이 없습니다.", "error");
    return;
  }
  const formData = new FormData(event.target);
  const studentId = formData.get("student-id");
  const enrollment = academyCommentEnrollments().find((item) => item.studentId === studentId);
  const body = formData.get("comment-body")?.trim() || "";
  if (!enrollment || !body) {
    toast("원생과 코멘트 내용을 확인해주세요.", "error");
    return;
  }
  const record = {
    id: `csl-comment-${Date.now()}`,
    academyId: enrollment.academyId,
    studentId,
    consultationDate: koreaDate(),
    type: "guardian_comment",
    internalMemo: "",
    nextAction: "",
    guardianSummary: body,
    createdBy: currentUser().id,
    createdAt: new Date().toISOString()
  };
  state.consultationRecords.push(record);
  state.academyCommentStudentId = studentId;
  addAudit(
    "consultation.saved",
    "student",
    studentId,
    `${studentById(studentId)?.name} 보호자 공개 코멘트 저장`,
    enrollment.academyId
  );
  persistState();
  renderView();
  toast("학부모에게 공개 코멘트를 보냈습니다.");
}

function saveCommentReply(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const consultation = state.consultationRecords.find(
    (item) => item.id === formData.get("consultation-id") && item.guardianSummary
  );
  const body = formData.get("reply-body")?.trim() || "";
  if (!consultation || !body) {
    toast("답변 내용을 확인해주세요.", "error");
    return;
  }

  const isGuardian = currentRole() === "guardian";
  const canReply = isGuardian
    ? state.guardianLinks.some(
        (item) =>
          item.guardianUserId === currentUser().id &&
          item.studentId === consultation.studentId &&
          item.academyId === consultation.academyId &&
          item.status === "verified"
      )
    : canAccessAcademyComment(consultation);
  if (!canReply) {
    toast("이 코멘트에 답변할 권한이 없습니다.", "error");
    return;
  }

  if (isGuardian) {
    const unread = guardianUnreadCommentEvents(consultation.id);
    state.guardianNotificationReads = [
      ...new Set([...state.guardianNotificationReads, ...unread.map((item) => item.id)])
    ];
  }

  const reply = {
    id: `cmt-reply-${Date.now()}`,
    consultationId: consultation.id,
    academyId: consultation.academyId,
    studentId: consultation.studentId,
    authorUserId: currentUser().id,
    authorRole: isGuardian ? "guardian" : "academy",
    body,
    createdAt: new Date().toISOString()
  };
  state.guardianCommentReplies.push(reply);
  addAudit(
    "consultation.reply_added",
    "consultation",
    consultation.id,
    `${studentById(consultation.studentId)?.name} 코멘트 ${isGuardian ? "학부모" : "학원"} 답변`,
    consultation.academyId
  );
  persistState();
  renderView();
  toast("답변을 등록했습니다.");
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

function openStaffMemberModal() {
  if (!hasPermission("member.manage")) {
    toast("구성원을 추가할 권한이 없습니다.", "error");
    return;
  }
  const classes = academyClassNames();
  openModal(`
    <header><div><h2 id="modal-title">구성원 추가</h2><p>강사 계정과 담당 반을 한 번에 등록합니다.</p></div><button class="icon-button" data-action="close-modal" aria-label="닫기">×</button></header>
    <form id="staff-member-form">
      <div class="form-grid">
        <label>이름<input id="staff-member-name" required maxlength="30" placeholder="예: 이지현"></label>
        <label>휴대전화<input id="staff-member-phone" type="tel" required placeholder="010-0000-0000"></label>
        <div class="full"><span class="form-label">담당 반</span>
          <div class="staff-class-options">
            ${classes.length
              ? classes.map((className) => `<label><input type="checkbox" name="staff-classes" value="${escapeHtml(className)}"><span>${escapeHtml(className)}</span></label>`).join("")
              : '<span class="field-hint">등록된 반이 없어 구성원을 먼저 추가한 뒤 담당 반을 배정할 수 있습니다.</span>'}
          </div>
        </div>
      </div>
      <div class="notice">추가된 구성원은 강사 계정으로 등록되며, 필요한 권한은 구성원별로 설정할 수 있습니다.</div>
      <div class="form-actions"><button type="button" class="button tertiary" data-action="close-modal">취소</button><button class="button primary" type="submit">구성원 추가</button></div>
    </form>
  `);
}

function createStaffMember(event) {
  event.preventDefault();
  if (!hasPermission("member.manage")) return;
  const name = document.querySelector("#staff-member-name")?.value.trim();
  const phone = document.querySelector("#staff-member-phone")?.value.trim();
  const classNames = [...document.querySelectorAll('input[name="staff-classes"]:checked')].map((item) => item.value);
  if (!name || !/^010-\d{4}-\d{4}$/.test(phone || "")) {
    toast("이름과 휴대전화 번호를 확인해 주세요.", "error");
    return;
  }
  const academy = currentAcademy();
  let user = state.users.find((item) => item.phone === phone);
  if (user && user.role !== "academy_instructor") {
    toast("다른 역할로 사용 중인 휴대전화 번호입니다.", "error");
    return;
  }
  let membership = user
    ? state.staffMemberships.find((item) => item.academyId === academy.id && item.userId === user.id)
    : null;
  if (membership?.status === "active") {
    toast("이미 등록된 학원 구성원입니다.", "error");
    return;
  }
  if (!user) {
    user = {
      id: `usr-staff-${Date.now()}`,
      name,
      phone,
      role: "academy_instructor",
      status: "active"
    };
    state.users.push(user);
  } else {
    user.name = name;
    user.status = "active";
  }
  if (membership) {
    membership.status = "active";
    membership.grants = [];
    delete membership.endedAt;
  } else {
    membership = {
      id: `stm-${Date.now()}`,
      academyId: academy.id,
      userId: user.id,
      role: "academy_instructor",
      grants: [],
      status: "active"
    };
    state.staffMemberships.push(membership);
  }
  state.staffClassAssignments = state.staffClassAssignments.filter(
    (item) => !(item.academyId === academy.id && item.userId === user.id)
  );
  classNames.forEach((className, index) => state.staffClassAssignments.push({
    id: `sca-${Date.now()}-${index}`,
    academyId: academy.id,
    userId: user.id,
    className
  }));
  state.selectedStaffMemberId = membership.id;
  addAudit("staff.member_added", "staff_membership", membership.id, `${name} 강사 구성원 추가`, academy.id);
  persistState();
  closeModal();
  renderView();
  toast(`${name} 강사를 학원 구성원으로 추가했습니다.`);
}

function openRemoveStaffMember(membershipId) {
  if (!hasPermission("member.manage")) return;
  const membership = state.staffMemberships.find(
    (item) => item.id === membershipId && item.academyId === currentAcademy().id && item.role === "academy_instructor" && item.status === "active"
  );
  if (!membership) return;
  const user = userById(membership.userId);
  const classCount = state.staffClassAssignments.filter(
    (item) => item.academyId === currentAcademy().id && item.userId === membership.userId
  ).length;
  openModal(`
    <header><div><h2 id="modal-title">구성원 제외</h2><p>${escapeHtml(user?.name || "강사")} 강사의 학원 접근을 종료합니다.</p></div><button class="icon-button" data-action="close-modal" aria-label="닫기">×</button></header>
    <div class="notice">담당 반 ${classCount}개와 부여된 권한이 해제됩니다. 계정과 감사 이력은 안전하게 보존됩니다.</div>
    <div class="form-actions"><button class="button tertiary" data-action="close-modal">취소</button><button class="button danger" data-action="confirm-remove-staff-member" data-membership-id="${membership.id}">구성원 제외</button></div>
  `);
}

function removeStaffMember(membershipId) {
  if (!hasPermission("member.manage")) return;
  const academy = currentAcademy();
  const membership = state.staffMemberships.find(
    (item) => item.id === membershipId && item.academyId === academy.id && item.role === "academy_instructor" && item.status === "active"
  );
  if (!membership) return;
  const user = userById(membership.userId);
  membership.status = "inactive";
  membership.grants = [];
  membership.endedAt = new Date().toISOString();
  state.staffClassAssignments = state.staffClassAssignments.filter(
    (item) => !(item.academyId === academy.id && item.userId === membership.userId)
  );
  if (state.selectedStaffMemberId === membership.id) state.selectedStaffMemberId = null;
  addAudit("staff.member_removed", "staff_membership", membership.id, `${user?.name || "강사"} 구성원 제외`, academy.id);
  persistState();
  closeModal();
  renderView();
  toast(`${user?.name || "강사"} 강사를 학원 구성원에서 제외했습니다.`);
}

function togglePermission(permission, membershipId) {
  if (!hasPermission("permission.manage")) {
    toast("권한을 변경할 수 없습니다.", "error");
    return;
  }
  const membership = state.staffMemberships.find(
    (item) => item.id === membershipId && item.role === "academy_instructor" && item.academyId === currentAcademy().id && item.status === "active"
  );
  if (!membership) return;
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
  const mainProgram = document.querySelector("#academy-main-program").value.trim();
  const address = document.querySelector("#academy-address").value.trim();
  if (!name || !businessRegistrationNumber || !phone || !mainProgram || !address) {
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
  academy.mainProgram = mainProgram;
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

function openPrivacyRightsModal() {
  const linkedStudentIds = [
    ...new Set(
      state.guardianLinks
        .filter((item) => item.guardianUserId === currentUser().id && item.status === "verified")
        .map((item) => item.studentId)
    )
  ];
  openModal(`
    <header><div><h2 id="modal-title">개인정보 권리 요청</h2><p>요청 내용을 확인한 뒤 운영자가 처리 결과를 안내합니다.</p></div><button class="icon-button" data-action="close-modal" aria-label="닫기">×</button></header>
    <form id="privacy-rights-form">
      <div class="form-grid">
        <label>요청 대상
          <select id="privacy-rights-target" required>
            <option value="self">본인 (${escapeHtml(currentUser().name)})</option>
            ${linkedStudentIds.map((studentId) => `<option value="${studentId}">자녀 (${escapeHtml(studentById(studentId)?.name || "학생")})</option>`).join("")}
          </select>
        </label>
        <label>요청 유형
          <select id="privacy-rights-type" required>
            <option value="access">열람</option>
            <option value="correction">정정</option>
            <option value="deletion">삭제</option>
            <option value="restriction">처리 정지</option>
            <option value="withdrawal">동의 철회</option>
          </select>
        </label>
        <label class="full">요청 사유 및 상세 내용
          <textarea id="privacy-rights-detail" required maxlength="500" placeholder="확인이 필요한 정보와 요청 내용을 구체적으로 입력해 주세요."></textarea>
        </label>
        <label class="full">처리 결과를 받을 연락처
          <input id="privacy-rights-contact" type="tel" required value="${escapeHtml(currentUser().phone || "")}" placeholder="010-0000-0000" />
        </label>
      </div>
      <div class="notice">관련 법령에 따른 보관 의무가 있는 정보는 삭제 또는 처리 정지가 제한될 수 있습니다.</div>
      <div class="form-actions"><button type="button" class="button tertiary" data-action="close-modal">취소</button><button class="button primary" type="submit">요청 접수</button></div>
    </form>
  `);
}

function createPrivacyRightsRequest(event) {
  event.preventDefault();
  const target = document.querySelector("#privacy-rights-target")?.value;
  const type = document.querySelector("#privacy-rights-type")?.value;
  const detail = document.querySelector("#privacy-rights-detail")?.value.trim();
  const contact = document.querySelector("#privacy-rights-contact")?.value.trim();
  const linkedStudentIds = state.guardianLinks
    .filter((item) => item.guardianUserId === currentUser().id && item.status === "verified")
    .map((item) => item.studentId);
  const studentId = target === "self" ? null : target;
  if (!target || !type || !detail || !contact || (studentId && !linkedStudentIds.includes(studentId))) {
    toast("요청 대상, 유형, 상세 내용과 연락처를 확인해 주세요.", "error");
    return;
  }
  const now = new Date().toISOString();
  const request = {
    id: `privacy-request-${Date.now()}`,
    requesterUserId: currentUser().id,
    studentId,
    type,
    detail,
    contact,
    status: "received",
    createdAt: now,
    updatedAt: now
  };
  state.privacyRightsRequests.unshift(request);
  addAudit(
    "privacy.rights_requested",
    "privacy_rights_request",
    request.id,
    `${currentUser().name} 개인정보 ${privacyRightTypeLabel(type)} 요청 접수`
  );
  persistState();
  closeModal();
  renderView();
  toast("개인정보 권리 요청을 접수했습니다. 운영자가 확인합니다.");
}

function savePilotStatus(academyId) {
  if (!hasPermission("request.manage")) return;
  const academy = academyById(academyId);
  const select = document.querySelector(`[data-pilot-status="${academyId}"]`);
  if (!academy || !select || academy.pilotStatus === select.value) return;
  const previous = pilotStatusLabel(academy.pilotStatus);
  academy.pilotStatus = select.value;
  addAudit(
    "pilot.status_changed",
    "academy",
    academy.id,
    `${academy.name} 운영 상태 ${previous} → ${pilotStatusLabel(academy.pilotStatus)}`,
    academy.id
  );
  persistState();
  renderShell();
  renderView();
  toast("운영 상태를 변경했습니다.");
}

function createSupportRequest(event) {
  event.preventDefault();
  if (!hasPermission("request.create")) return;
  const academyId = document.querySelector("#support-academy").value;
  const title = document.querySelector("#support-title").value.trim();
  const detail = document.querySelector("#support-detail").value.trim();
  const allowedAcademyIds = supportAcademiesForCurrentUser().map((item) => item.id);
  if (!allowedAcademyIds.includes(academyId) || !title || !detail) {
    toast("학원, 제목, 내용을 입력해주세요.", "error");
    return;
  }
  const now = new Date().toISOString();
  const request = {
    id: `req-${Date.now()}`,
    academyId,
    type: document.querySelector("#support-type").value,
    status: "open",
    title,
    detail,
    reporterName: currentUser().name,
    reporterUserId: currentUser().id,
    reporterRole: currentRole(),
    assigneeUserId: null,
    resolution: "",
    createdAt: now,
    updatedAt: now,
    history: []
  };
  state.supportRequests.unshift(request);
  addAudit("support.created", "support_request", request.id, `${supportTypeLabel(request.type)} 접수: ${title}`, academyId);
  persistState();
  renderView();
  toast("오류·문의를 접수했습니다.");
}

function saveSupportRequest(requestId) {
  if (!hasPermission("request.manage")) return;
  const request = state.supportRequests.find((item) => item.id === requestId);
  const status = document.querySelector(`[data-support-status="${requestId}"]`)?.value;
  const note = document.querySelector(`[data-support-note="${requestId}"]`)?.value.trim() || "";
  if (!request || !status) return;
  if (status === "resolved" && !note) {
    toast("완료 처리 내용을 입력해주세요.", "error");
    return;
  }
  const now = new Date().toISOString();
  request.status = status;
  request.resolution = note;
  request.assigneeUserId = currentUser().id;
  request.updatedAt = now;
  request.history.unshift({
    status,
    note: note || supportStatusLabel(status),
    updatedBy: currentUser().id,
    updatedAt: now
  });
  addAudit(
    "support.updated",
    "support_request",
    request.id,
    `${request.title} · ${supportStatusLabel(status)}`,
    request.academyId
  );
  persistState();
  if (isGuardian) renderShell();
  renderView();
  toast("처리 상태를 저장했습니다.");
}

document.addEventListener("click", (event) => {
  const authRole = event.target.closest("[data-auth-role]");
  if (authRole) {
    setAuthRole(authRole.dataset.authRole);
    if (authRole.dataset.authDirect === "true") showPhoneStep();
  }

  const navigationGroup = event.target.closest("[data-nav-group]");
  if (navigationGroup && ["academy_owner", "academy_instructor"].includes(currentRole())) {
    toggleNavigationGroup(navigationGroup.dataset.navGroup);
    return;
  }

  const viewTarget = event.target.closest("[data-view], [data-view-target]");
  if (viewTarget && currentUser()) {
    const nextView = viewTarget.dataset.view || viewTarget.dataset.viewTarget;
    state.activeView = nextView;
    state.selectedStudentId = null;
    if (nextView === "homework") state.selectedHomeworkStudentId = null;
    if (nextView === "tests") state.selectedTestStudentId = null;
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
  if (actionName === "select-national-grade") {
    if (nationalAchievement2025[action.dataset.grade]) {
      state.guardianNationalGrade = action.dataset.grade;
      persistState();
      renderView();
    }
  }
  if (actionName === "select-growth-academy") {
    state.guardianGrowthAcademyId = action.dataset.academyId || "all";
    state.guardianGrowthSubject = "all";
    persistState();
    renderView();
  }
  if (actionName === "select-growth-subject") {
    state.guardianGrowthSubject = action.dataset.subject || "all";
    persistState();
    renderView();
  }
  if (actionName === "open-growth-report") {
    openGuardianGrowthReport(action.dataset.academyId || "all", action.dataset.subject || "all");
  }
  if (actionName === "load-previous-learning") loadPreviousLearning();
  if (actionName === "bulk-attendance") applyBulkAttendance(action.dataset.status);
  if (actionName === "attendance-filter") {
    state.attendanceFilter = action.dataset.filter;
    persistState();
    renderView();
  }
  if (actionName === "view-attendance-history") showAttendanceHistory(action.dataset.recordId);
  if (actionName === "view-score-history") showScoreHistory(action.dataset.assessmentId);
  if (actionName === "analytics-period") {
    trackUsageOnce("academy.analytics_filter_used", currentAcademy().id);
    state.analyticsPeriod = action.dataset.period;
    persistState();
    renderView();
  }
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
  if (actionName === "open-student-homework") {
    const enrollment = accessibleAcademyEnrollments().find(
      (item) => item.studentId === action.dataset.studentId && item.status === "active"
    );
    if (!enrollment) {
      toast("과제를 관리할 수 있는 재원 정보가 없습니다.", "error");
      return;
    }
    const latest = state.homeworkAssignments
      .filter(
        (item) =>
          item.academyId === enrollment.academyId &&
          item.className === enrollment.className &&
          item.statuses?.some((status) => status.studentId === enrollment.studentId)
      )
      .sort((a, b) => b.assignedDate.localeCompare(a.assignedDate))[0];
    state.activeView = "homework";
    state.selectedStudentId = null;
    state.selectedHomeworkStudentId = enrollment.studentId;
    state.selectedHomeworkClass = enrollment.className;
    state.selectedHomeworkDate = latest?.assignedDate || null;
    state.homeworkStatusFilter = "all";
    persistState();
    renderShell();
    renderView();
  }
  if (actionName === "clear-homework-student") {
    state.selectedHomeworkStudentId = null;
    state.homeworkStatusFilter = "all";
    persistState();
    renderView();
  }
  if (actionName === "open-student-tests") {
    const enrollment = accessibleAcademyEnrollments().find(
      (item) => item.studentId === action.dataset.studentId && item.status === "active"
    );
    if (!enrollment) {
      toast("테스트를 관리할 수 있는 재원 정보가 없습니다.", "error");
      return;
    }
    const latest = state.assessments
      .filter(
        (item) =>
          item.academyId === enrollment.academyId &&
          item.className === enrollment.className &&
          item.attempts?.some((attempt) => attempt.studentId === enrollment.studentId)
      )
      .sort((a, b) => b.testDate.localeCompare(a.testDate))[0];
    state.activeView = "tests";
    state.selectedStudentId = null;
    state.selectedTestStudentId = enrollment.studentId;
    state.selectedTestClass = enrollment.className;
    state.selectedAssessmentId = latest?.id || null;
    persistState();
    renderShell();
    renderView();
  }
  if (actionName === "clear-test-student") {
    state.selectedTestStudentId = null;
    persistState();
    renderView();
  }
  if (actionName === "open-student-consultations") {
    const enrollment = accessibleAcademyEnrollments().find(
      (item) => item.studentId === action.dataset.studentId && item.status === "active"
    );
    if (!enrollment || !hasPermission("consultation.manage")) {
      toast("상담 기록을 관리할 권한이 없습니다.", "error");
      return;
    }
    state.activeView = "consultations";
    state.selectedStudentId = null;
    state.consultationStudentId = enrollment.studentId;
    persistState();
    renderShell();
    renderView();
  }
  if (actionName === "select-consultation-student") {
    state.consultationStudentId = action.dataset.studentId;
    persistState();
    renderView();
  }
  if (actionName === "select-academy-comment-student") {
    state.academyCommentStudentId = action.dataset.studentId;
    persistState();
    renderView();
  }
  if (actionName === "open-student-comments") {
    const enrollment = academyCommentEnrollments().find((item) => item.studentId === action.dataset.studentId);
    if (!enrollment || !hasPermission("comment.manage")) {
      toast("학부모 소통을 관리할 권한이 없습니다.", "error");
      return;
    }
    state.activeView = "academy_comments";
    state.selectedStudentId = null;
    state.academyCommentStudentId = enrollment.studentId;
    persistState();
    renderShell();
    renderView();
  }
  if (actionName === "change-student-class") changeStudentClass(action.dataset.studentId);
  if (actionName === "close-modal") closeModal();
  if (actionName === "invite-guardian") showInvitation(action.dataset.studentId);
  if (actionName === "open-staff-member-modal") openStaffMemberModal();
  if (actionName === "open-remove-staff-member") openRemoveStaffMember(action.dataset.membershipId);
  if (actionName === "confirm-remove-staff-member") removeStaffMember(action.dataset.membershipId);
  if (actionName === "toggle-permission") togglePermission(action.dataset.permission, action.dataset.membershipId);
  if (actionName === "copy-invite") {
    navigator.clipboard?.writeText(action.dataset.code);
    toast(`초대 코드 ${action.dataset.code}를 복사했습니다.`);
  }
  if (actionName === "read-notification") {
    if (!state.guardianNotificationReads.includes(action.dataset.notificationId)) {
      state.guardianNotificationReads.push(action.dataset.notificationId);
      persistState();
      renderShell();
      renderView();
    }
  }
  if (actionName === "mark-all-notifications-read") {
    state.guardianNotificationReads = [
      ...new Set([...state.guardianNotificationReads, ...guardianNotificationEvents().map((item) => item.id)])
    ];
    persistState();
    renderShell();
    renderView();
    toast("모든 알림을 읽음 처리했습니다.");
  }
  if (actionName === "mark-guardian-comment-read") {
    const unread = guardianUnreadCommentEvents(action.dataset.consultationId);
    if (unread.length) {
      state.guardianNotificationReads = [
        ...new Set([...state.guardianNotificationReads, ...unread.map((item) => item.id)])
      ];
      persistState();
      renderShell();
      renderView();
      toast("새 코멘트를 확인했습니다.");
    }
  }
  if (actionName === "mark-academy-comment-read") {
    const unread = academyUnreadGuardianReplies(action.dataset.consultationId);
    if (unread.length) {
      state.academyCommentReplyReads[currentUser().id] = [
        ...new Set([
          ...(state.academyCommentReplyReads[currentUser().id] || []),
          ...unread.map((item) => item.id)
        ])
      ];
      persistState();
      renderShell();
      renderView();
      toast("학부모 답변을 확인했습니다.");
    }
  }
  if (actionName === "request-rights") openPrivacyRightsModal();
  if (actionName === "save-pilot-status") savePilotStatus(action.dataset.academyId);
  if (actionName === "open-academy-info") showAcademyInfo(action.dataset.academyId);
  if (actionName === "save-support-request") saveSupportRequest(action.dataset.requestId);
});

document.addEventListener("submit", (event) => {
  if (event.target.id === "student-form") createStudent(event);
  if (event.target.id === "csv-import-form") importCsv(event);
  if (event.target.id === "attendance-form") saveAttendance(event);
  if (event.target.id === "learning-form") saveLearning(event);
  if (event.target.id === "homework-form") saveHomework(event);
  if (event.target.id === "test-form") saveTests(event);
  if (event.target.id === "consultation-form") saveConsultation(event);
  if (event.target.id === "academy-comment-form") saveAcademyComment(event);
  if (event.target.id === "connect-form") connectGuardian(event);
  if (event.target.classList.contains("comment-reply-form")) saveCommentReply(event);
  if (event.target.id === "support-create-form") createSupportRequest(event);
  if (event.target.id === "privacy-rights-form") createPrivacyRightsRequest(event);
  if (event.target.id === "staff-member-form") createStaffMember(event);
});

document.addEventListener("input", (event) => {
  if (event.target.id === "student-search") applyStudentListFilters();
  if (event.target.id === "consultation-directory-search") applyCommunicationDirectoryFilters("consultation");
  if (event.target.id === "academy-comment-directory-search") applyCommunicationDirectoryFilters("academy-comment");
  if (event.target.matches("[data-record-search-input]")) applyRecordSearch(event.target);
});

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-record-date-from], [data-record-date-to]")) applyRecordSearch(event.target);
  if (event.target.name === "guardian-growth-student") {
    guardianScope().academyIds.forEach((academyId) =>
      trackUsageOnce("guardian.growth_filter_used", academyId)
    );
    state.guardianGrowthStudentId = event.target.value;
    state.guardianGrowthAcademyId = "all";
    state.guardianGrowthSubject = "all";
    persistState();
    renderView();
  }
  if (event.target.id === "guardian-student-filter") {
    if (state.activeView === "growth") {
      guardianScope().academyIds.forEach((academyId) =>
        trackUsageOnce("guardian.growth_filter_used", academyId)
      );
    }
    state.guardianTimelineStudentId = event.target.value;
    persistState();
    renderView();
  }
  if (event.target.id === "guardian-academy-filter") {
    if (state.activeView === "growth") {
      guardianScope().academyIds.forEach((academyId) =>
        trackUsageOnce("guardian.growth_filter_used", academyId)
      );
    }
    state.guardianTimelineAcademyId = event.target.value;
    persistState();
    renderView();
  }
  if (event.target.id === "operator-metric-window") {
    state.operatorMetricWindow = event.target.value;
    persistState();
    renderView();
  }
  if (event.target.id === "operator-usage-window") {
    state.operatorUsageWindow = event.target.value;
    persistState();
    renderView();
  }
  if (event.target.id === "operator-pilot-filter") {
    state.operatorPilotFilter = event.target.value;
    persistState();
    renderView();
  }
  if (event.target.id === "operator-support-status-filter") {
    state.operatorSupportStatusFilter = event.target.value;
    persistState();
    renderView();
  }
  if (event.target.id === "operator-support-type-filter") {
    state.operatorSupportTypeFilter = event.target.value;
    persistState();
    renderView();
  }
  if (event.target.id === "permission-member-select") {
    state.selectedStaffMemberId = event.target.value;
    persistState();
    renderView();
  }
  if (
    ["student-class-filter", "student-enrollment-filter", "student-connection-filter"].includes(
      event.target.id
    )
  ) {
    applyStudentListFilters();
  }
  if (["consultation-directory-class", "consultation-directory-status"].includes(event.target.id)) {
    applyCommunicationDirectoryFilters("consultation");
  }
  if (["academy-comment-directory-class", "academy-comment-directory-status"].includes(event.target.id)) {
    applyCommunicationDirectoryFilters("academy-comment");
  }
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
  if (event.target.id === "homework-select-all") {
    document.querySelectorAll(".homework-row-check").forEach((checkbox) => {
      checkbox.checked = event.target.checked;
    });
    updateHomeworkSelectionCount();
  }
  if (event.target.classList.contains("homework-row-check")) {
    updateHomeworkSelectionCount();
  }
  if (event.target.classList.contains("homework-status-select")) {
    updateHomeworkStatusBadge(event.target.dataset.studentId, event.target.value);
  }
  if (event.target.id === "homework-class") {
    state.selectedHomeworkClass = event.target.value;
    state.selectedHomeworkDate = null;
    state.homeworkStatusFilter = "all";
    persistState();
    renderView();
  }
  if (event.target.id === "homework-date") {
    state.selectedHomeworkDate = event.target.value;
    state.homeworkStatusFilter = "all";
    persistState();
    renderView();
  }
  if (event.target.id === "homework-status-filter") {
    state.homeworkStatusFilter = event.target.value;
    persistState();
    renderView();
  }
  if (event.target.id === "test-class") {
    state.selectedTestClass = event.target.value;
    state.selectedAssessmentId = null;
    persistState();
    renderView();
  }
  if (event.target.id === "assessment-select") {
    state.selectedAssessmentId = event.target.value || null;
    persistState();
    renderView();
  }
  if (event.target.id === "analytics-class") {
    trackUsageOnce("academy.analytics_filter_used", currentAcademy().id);
    state.analyticsClassName = event.target.value;
    state.analyticsStudentId =
      accessibleAcademyEnrollments().find(
        (item) => item.status === "active" && item.className === event.target.value
      )?.studentId || null;
    persistState();
    renderView();
  }
  if (event.target.id === "analytics-student") {
    trackUsageOnce("academy.analytics_filter_used", currentAcademy().id);
    state.analyticsStudentId = event.target.value;
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
