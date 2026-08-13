(function () {
  "use strict";

  const pad = (value, length = 2) => String(value).padStart(length, "0");
  const dateOnly = (date) => `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
  const addDays = (date, days) => new Date(date.getTime() + days * 86400000);
  const atTime = (date, time = "09:00:00") => `${dateOnly(date)}T${time}+09:00`;
  const id = (prefix, number, length = 3) => `${prefix}-${pad(number, length)}`;

  function createLargeQaState(baseState) {
    const today = new Date();
    const baseDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const startDate = addDays(baseDate, -90);
    const surnames = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오"];
    const givenNames = ["민준", "서준", "도윤", "예준", "시우", "하준", "주원", "지호", "서연", "서윤", "지우", "하윤", "채원", "수아", "예은", "다은", "유진", "현우", "지민", "은우"];
    const academyPrefixes = ["한빛", "새봄", "다온", "푸른", "가온", "이룸", "해솔", "큰나무", "라온", "브릿지"];
    const academyAreas = ["강남", "서초", "송파", "마포", "목동", "분당", "일산", "수원", "용인", "인천"];
    const subjects = ["수학", "영어", "국어", "과학"];
    const statuses = ["present", "present", "present", "present", "late", "early_leave", "absent"];
    const classCountByAcademy = Array.from({ length: 30 }, (_, index) => 1 + ((index * 7 + 3) % 10));

    const academies = Array.from({ length: 30 }, (_, index) => ({
      id: id("qa-acd", index + 1),
      name: `${academyAreas[index % academyAreas.length]} ${academyPrefixes[(index * 3) % academyPrefixes.length]}학원 ${pad(index + 1)}`,
      ownerUserId: id("qa-owner", index + 1),
      businessRegistrationNumber: `${pad(110 + index, 3)}-${pad(20 + (index % 70))}-${pad(10000 + index * 137, 5)}`,
      phone: `02-${pad(2100 + index * 19, 4)}-${pad(3000 + index * 23, 4)}`,
      mainProgram: `${subjects[index % subjects.length]} 중심 초중등 맞춤 학습`,
      address: `서울특별시 ${academyAreas[index % academyAreas.length]}구 모아로 ${10 + index}`,
      pilotStatus: index % 9 === 0 ? "pending" : index % 13 === 0 ? "paused" : "active",
      createdAt: atTime(addDays(startDate, index % 35), "09:00:00")
    }));

    const owners = academies.map((academy, index) => ({
      id: academy.ownerUserId,
      name: `${surnames[index % surnames.length]}원장`,
      phone: `010-${pad(1000 + index, 4)}-${pad(2000 + index * 7, 4)}`,
      role: "academy_owner",
      status: "active"
    }));
    const instructors = [];
    const staffMemberships = [];
    const staffClassAssignments = [];
    academies.forEach((academy, academyIndex) => {
      staffMemberships.push({
        id: id("qa-stm-owner", academyIndex + 1),
        academyId: academy.id,
        userId: academy.ownerUserId,
        role: "academy_owner",
        grants: [],
        status: "active"
      });
      const instructorCount = academyIndex % 6;
      for (let index = 0; index < instructorCount; index += 1) {
        const sequence = instructors.length + 1;
        const userId = id("qa-teacher", sequence);
        instructors.push({
          id: userId,
          name: `${surnames[(academyIndex + index + 2) % surnames.length]}${givenNames[(academyIndex * 2 + index) % givenNames.length]} 강사`,
          phone: `010-${pad(3000 + sequence, 4)}-${pad(4000 + sequence * 11, 4)}`,
          role: "academy_instructor",
          status: sequence % 29 === 0 ? "inactive" : "active"
        });
        staffMemberships.push({
          id: id("qa-stm-teacher", sequence),
          academyId: academy.id,
          userId,
          role: "academy_instructor",
          grants: sequence % 3 === 0 ? [] : ["student.manage"],
          status: sequence % 29 === 0 ? "inactive" : "active"
        });
      }
    });

    const students = Array.from({ length: 240 }, (_, index) => ({
      id: id("qa-student", index + 1),
      name: `${surnames[index % surnames.length]}${givenNames[(index * 7) % givenNames.length]}${index >= 220 ? `-${index + 1}` : ""}`,
      birthDate: `${index < 160 ? 2010 : 2011 + (index % 6)}-${pad(1 + ((index * 5) % 12))}-${pad(1 + ((index * 11) % 27))}`,
      createdBy: academies[index % academies.length].ownerUserId,
      createdAt: atTime(addDays(startDate, index % 45), "10:00:00")
    }));

    const academyClasses = new Map();
    academies.forEach((academy, academyIndex) => {
      const count = classCountByAcademy[academyIndex];
      academyClasses.set(academy.id, Array.from({ length: count }, (_, classIndex) => {
        const subject = subjects[(academyIndex + classIndex) % subjects.length];
        return `${subject} ${classIndex + 1}반`;
      }));
    });

    const enrollments = [];
    const enrollmentKeys = new Set();
    function addEnrollment(academyIndex, studentIndex, classIndex, status = "active") {
      const academy = academies[academyIndex];
      const student = students[studentIndex];
      const key = `${academy.id}:${student.id}`;
      if (enrollmentKeys.has(key)) return false;
      const classes = academyClasses.get(academy.id);
      const sequence = enrollments.length + 1;
      enrollments.push({
        id: id("qa-enrollment", sequence, 4),
        academyId: academy.id,
        studentId: student.id,
        className: classes[classIndex % classes.length],
        startedAt: dateOnly(addDays(startDate, (academyIndex + studentIndex) % 30)),
        status,
        classHistory: []
      });
      enrollmentKeys.add(key);
      return true;
    }
    academies.forEach((academy, academyIndex) => {
      const classes = academyClasses.get(academy.id);
      const targetCount = Math.max(classes.length * 3, 18 + (academyIndex % 9));
      let candidate = academyIndex * 19;
      for (let classIndex = 0; classIndex < classes.length; classIndex += 1) {
        while (!addEnrollment(academyIndex, candidate % students.length, classIndex)) candidate += 1;
        candidate += 13;
      }
      while (enrollments.filter((item) => item.academyId === academy.id).length < targetCount) {
        const status = candidate % 31 === 0 ? "paused" : candidate % 47 === 0 ? "withdrawn" : "active";
        addEnrollment(academyIndex, candidate % students.length, candidate, status);
        candidate += 17;
      }
    });
    students.forEach((student, studentIndex) => {
      if (!enrollments.some((item) => item.studentId === student.id && item.status === "active")) {
        addEnrollment(studentIndex % academies.length, studentIndex, studentIndex, "active");
      }
    });
    [0, 1, 2, 3].forEach((academyIndex) => addEnrollment(academyIndex, 0, 0));
    [0, 4, 8].forEach((academyIndex) => addEnrollment(academyIndex, 1, 1));

    academies.forEach((academy, academyIndex) => {
      const members = staffMemberships.filter((item) => item.academyId === academy.id && item.role === "academy_instructor" && item.status === "active");
      const classes = academyClasses.get(academy.id);
      members.forEach((member, memberIndex) => {
        classes.forEach((className, classIndex) => {
          if (classIndex % Math.max(members.length, 1) === memberIndex) {
            staffClassAssignments.push({
              id: id("qa-assignment", staffClassAssignments.length + 1, 4),
              academyId: academy.id,
              userId: member.userId,
              className
            });
          }
        });
      });
    });

    const guardians = Array.from({ length: 160 }, (_, index) => ({
      id: id("qa-guardian", index + 1),
      name: `${surnames[(index + 4) % surnames.length]}${givenNames[(index * 3 + 1) % givenNames.length]} 학부모`,
      phone: `010-${pad(6000 + index, 4)}-${pad(7000 + index * 13, 4)}`,
      role: "guardian",
      status: "active"
    }));
    const guardianLinks = [];
    const consents = [];
    let childIndex = 0;
    guardians.forEach((guardian, guardianIndex) => {
      const childCount = guardianIndex < 30 ? 3 : guardianIndex < 40 ? 2 : 1;
      for (let childOffset = 0; childOffset < childCount; childOffset += 1) {
        const studentIndex = childIndex;
        childIndex += 1;
        const childEnrollments = enrollments.filter((item) => item.studentId === students[studentIndex].id && item.status === "active");
        childEnrollments.slice(0, guardianIndex === 0 ? 3 : 1).forEach((enrollment) => {
          const sequence = guardianLinks.length + 1;
          const linkStatus = studentIndex >= 220 ? "pending" : "verified";
          guardianLinks.push({
            id: id("qa-link", sequence, 4),
            guardianUserId: guardian.id,
            studentId: students[studentIndex].id,
            academyId: enrollment.academyId,
            relationship: childOffset === 2 ? "보호자" : "부모",
            status: linkStatus,
            verifiedAt: linkStatus === "verified" ? atTime(addDays(startDate, 5 + guardianIndex), "14:30:00") : null
          });
          if (linkStatus === "verified") {
            consents.push({
              id: id("qa-consent", consents.length + 1, 4),
              guardianUserId: guardian.id,
              studentId: students[studentIndex].id,
              academyId: enrollment.academyId,
              type: "guardian_link",
              version: "2026.08",
              status: "granted",
              method: "phone_verification",
              grantedAt: atTime(addDays(startDate, 5 + guardianIndex), "14:30:00")
            });
          }
        });
      }
    });

    const attendanceRecords = [];
    const learningRecords = [];
    const homeworkAssignments = [];
    const testSettings = [];
    const assessments = [];
    academies.forEach((academy, academyIndex) => {
      academyClasses.get(academy.id).forEach((className, classIndex) => {
        const classEnrollments = enrollments.filter((item) => item.academyId === academy.id && item.className === className && item.status === "active");
        testSettings.push({
          id: id("qa-test-setting", testSettings.length + 1, 4),
          academyId: academy.id,
          className,
          subject: className.split(" ")[0],
          frequency: classIndex % 2 ? "monthly" : "weekly_monthly",
          averageVisibility: "guardian",
          updatedBy: academy.ownerUserId,
          updatedAt: atTime(addDays(baseDate, -2), "11:00:00")
        });
        for (let week = 0; week < 13; week += 1) {
          const lessonDate = addDays(startDate, week * 7 + ((academyIndex + classIndex) % 5));
          learningRecords.push({
            id: id("qa-learning", learningRecords.length + 1, 5),
            academyId: academy.id,
            className,
            lessonDate: dateOnly(lessonDate),
            textbook: `${className.split(" ")[0]} 개념서 ${1 + (week % 3)}`,
            unit: `${week + 1}주차 핵심 단원`,
            pages: `${20 + week * 4}~${23 + week * 4}쪽`,
            content: "핵심 개념 설명과 유형별 문제 풀이를 진행했습니다.",
            homework: "수업 복습 문제와 오답 정리",
            specialNotes: week % 5 === 0 ? "다음 시간 단원평가 예정" : "",
            nextPlan: "다음 단원 개념과 응용 문제 학습",
            createdBy: academy.ownerUserId,
            createdAt: atTime(lessonDate, "18:10:00")
          });
          const homework = {
            id: id("qa-homework", homeworkAssignments.length + 1, 5),
            academyId: academy.id,
            className,
            assignedDate: dateOnly(lessonDate),
            title: `${week + 1}주차 복습 과제`,
            statuses: classEnrollments.map((enrollment, studentOffset) => ({
              studentId: enrollment.studentId,
              status: ["completed", "completed", "partial", "missing", "replacement", "exempt"][(week + studentOffset) % 6],
              note: (week + studentOffset) % 6 === 3 ? "미제출 확인 필요" : ""
            })),
            createdBy: academy.ownerUserId,
            createdAt: atTime(lessonDate, "18:15:00")
          };
          homeworkAssignments.push(homework);
          classEnrollments.forEach((enrollment, studentOffset) => {
            const status = statuses[(academyIndex + classIndex + week + studentOffset) % statuses.length];
            attendanceRecords.push({
              id: id("qa-attendance", attendanceRecords.length + 1, 5),
              academyId: academy.id,
              studentId: enrollment.studentId,
              className,
              lessonDate: dateOnly(lessonDate),
              status,
              arrivalTime: status === "absent" ? "" : status === "late" ? "16:12" : "15:58",
              reason: status === "absent" ? "가정 일정" : status === "late" ? "교통 지연" : status === "early_leave" ? "병원 예약" : "",
              checkedAt: atTime(lessonDate, status === "late" ? "16:12:00" : "15:58:00"),
              checkedBy: academy.ownerUserId,
              history: []
            });
          });
          if (week % 3 === 0) {
            const subject = className.split(" ")[0];
            const assessmentDate = addDays(lessonDate, 2);
            assessments.push({
              id: id("qa-assessment", assessments.length + 1, 5),
              academyId: academy.id,
              className,
              subject,
              title: `${week + 1}주차 ${subject} 평가`,
              type: week % 6 === 0 ? "monthly" : "weekly",
              scope: `${week + 1}주차 학습 범위`,
              testDate: dateOnly(assessmentDate),
              maxScore: 100,
              attempts: classEnrollments.map((enrollment, studentOffset) => ({
                id: id("qa-attempt", assessments.length * 100 + studentOffset + 1, 6),
                studentId: enrollment.studentId,
                attemptNo: 1,
                status: studentOffset % 19 === 0 ? "absent" : "taken",
                score: studentOffset % 19 === 0 ? null : 55 + ((academyIndex * 7 + classIndex * 5 + week + studentOffset * 3) % 46),
                note: studentOffset % 19 === 0 ? "결석" : "",
                recordedAt: atTime(assessmentDate, "18:00:00"),
                recordedBy: academy.ownerUserId
              })),
              scoreHistory: [],
              createdBy: academy.ownerUserId,
              createdAt: atTime(assessmentDate, "18:00:00")
            });
          }
        }
      });
    });

    const consultationRecords = enrollments.filter((_, index) => index % 5 === 0).map((enrollment, index) => ({
      id: id("qa-consultation", index + 1, 4),
      academyId: enrollment.academyId,
      studentId: enrollment.studentId,
      consultationDate: dateOnly(addDays(startDate, (index * 7) % 90)),
      type: index % 2 ? "guardian" : "student",
      internalMemo: "최근 수업 참여도와 과제 수행 흐름을 확인했습니다.",
      nextAction: "다음 평가 후 학습 계획을 다시 점검합니다.",
      guardianSummary: "학습 진도와 보완할 내용을 보호자에게 안내했습니다.",
      createdBy: academies.find((item) => item.id === enrollment.academyId).ownerUserId,
      createdAt: atTime(addDays(startDate, (index * 7) % 90), "17:40:00")
    }));

    const usageEvents = [];
    academies.forEach((academy, academyIndex) => {
      for (let day = 0; day < 90; day += 3) {
        usageEvents.push({
          id: id("qa-usage", usageEvents.length + 1, 5),
          academyId: academy.id,
          userId: academy.ownerUserId,
          type: ["academy.analytics_viewed", "academy.attendance_viewed", "academy.students_viewed"][day % 3],
          createdAt: atTime(addDays(startDate, day), "17:20:00")
        });
      }
    });
    guardianLinks.filter((item) => item.status === "verified").forEach((link, index) => {
      usageEvents.push({
        id: id("qa-usage", usageEvents.length + 1, 5),
        academyId: link.academyId,
        userId: link.guardianUserId,
        type: index % 2 ? "guardian.growth_viewed" : "guardian.home_viewed",
        createdAt: atTime(addDays(baseDate, -(index % 30)), "20:10:00")
      });
    });

    const supportTypes = ["error", "inquiry", "suggestion", "other"];
    const supportStatuses = ["open", "in_progress", "resolved"];
    const supportRequests = Array.from({ length: 90 }, (_, index) => ({
      id: id("qa-support", index + 1, 4),
      academyId: academies[index % academies.length].id,
      type: supportTypes[index % supportTypes.length],
      status: supportStatuses[index % supportStatuses.length],
      title: `${supportTypes[index % supportTypes.length] === "error" ? "출결 저장 확인" : "서비스 이용 문의"} ${index + 1}`,
      detail: index % 10 === 0 ? "긴 문의 내용을 확인하기 위한 테스트입니다. ".repeat(8) : "사용 중 확인이 필요한 내용을 접수했습니다.",
      reporterName: academies[index % academies.length].name,
      assigneeUserId: index % 3 === 0 ? "qa-operator" : null,
      resolution: index % 3 === 2 ? "확인 후 처리 내용을 안내했습니다." : "",
      createdAt: atTime(addDays(startDate, index % 90), "10:20:00"),
      updatedAt: atTime(addDays(startDate, Math.min(89, (index % 90) + 1)), "13:10:00"),
      history: []
    }));

    const invitations = enrollments.filter((_, index) => index % 7 === 0).map((enrollment, index) => ({
      id: id("qa-invitation", index + 1, 4),
      academyId: enrollment.academyId,
      studentId: enrollment.studentId,
      code: `QA-${pad(1000 + index, 4)}`,
      token: `qa-token-${index + 1}`,
      expiresAt: atTime(addDays(baseDate, 7), "23:59:59"),
      maxUses: 1,
      usedAt: index % 3 === 0 ? atTime(addDays(baseDate, -2), "14:00:00") : null,
      status: index % 3 === 0 ? "accepted" : "sent",
      createdBy: academies.find((item) => item.id === enrollment.academyId).ownerUserId,
      createdAt: atTime(addDays(baseDate, -4), "09:10:00")
    }));

    const guardianCommentReplies = consultationRecords.slice(0, 80).map((consultation, index) => ({
      id: id("qa-reply", index + 1, 4),
      consultationId: consultation.id,
      academyId: consultation.academyId,
      studentId: consultation.studentId,
      authorUserId: index % 2 ? academies.find((item) => item.id === consultation.academyId).ownerUserId : guardians[index % guardians.length].id,
      authorRole: index % 2 ? "academy" : "guardian",
      body: index % 12 === 0 ? "학습 방향과 다음 평가 계획에 대해 자세히 확인하고 싶습니다. ".repeat(5) : "안내 내용을 확인했습니다.",
      createdAt: atTime(addDays(startDate, index % 90), "15:37:00")
    }));

    const auditLogs = usageEvents.slice(0, 420).map((event, index) => ({
      id: id("qa-audit", index + 1, 4),
      academyId: event.academyId,
      actorUserId: event.userId,
      action: index % 4 === 0 ? "attendance.saved" : index % 4 === 1 ? "learning.saved" : index % 4 === 2 ? "assessment.saved" : "auth.login_succeeded",
      targetType: "qa_record",
      targetId: event.id,
      summary: `${academies.find((item) => item.id === event.academyId).name} QA 활동 기록`,
      createdAt: event.createdAt
    }));

    const csvImports = academies.map((academy, index) => ({
      id: id("qa-csv", index + 1),
      academyId: academy.id,
      fileName: `${academy.name}_원생.csv`,
      totalRows: 20 + (index % 8),
      importedRows: 18 + (index % 8),
      errorRows: index % 4,
      skippedRows: index % 3,
      errorDetails: [],
      importedBy: academy.ownerUserId,
      createdAt: atTime(addDays(startDate, index), "10:08:00")
    }));

    return {
      ...JSON.parse(JSON.stringify(baseState)),
      schemaVersion: 15,
      activeView: "home",
      selectedStudentId: null,
      selectedHomeworkStudentId: null,
      selectedTestStudentId: null,
      selectedStaffMemberId: null,
      analyticsClassName: null,
      analyticsStudentId: null,
      users: [...owners, ...instructors, ...guardians, { id: "qa-operator", name: "모아플로 운영", phone: "010-0000-0000", role: "operator", status: "active" }],
      academies,
      staffMemberships,
      staffClassAssignments,
      students,
      enrollments,
      guardianLinks,
      invitations,
      consents,
      csvImports,
      attendanceRecords,
      learningRecords,
      homeworkAssignments,
      testSettings,
      assessments,
      consultationRecords,
      usageEvents,
      supportRequests,
      guardianCommentReplies,
      guardianNotificationReads: [],
      academyCommentReplyReads: {},
      privacyRightsRequests: [],
      auditLogs,
      qaMetadata: {
        generatedAt: atTime(baseDate, "00:00:00"),
        periodStart: dateOnly(startDate),
        periodEnd: dateOnly(baseDate),
        academyCount: academies.length,
        studentCount: students.length,
        guardianCount: guardians.length,
        duplicateAcademyStudentIds: [students[0].id, students[1].id]
      }
    };
  }

  window.MoaFlowQaData = { createLargeQaState };
})();
