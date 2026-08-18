# MoaFlow 학원비 결제 작업 인수인계

## 반드시 먼저 확인

- 저장소: `C:\Users\PCuser\Documents\edutong`
- 원격 저장소: `https://github.com/seori0725/moaflow.git`
- 현재 브랜치: `codex/tuition-payments`
- 기준 커밋: `aa122fc` (`main`, `origin/main`과 동일한 지점에서 시작)
- Firebase 프로젝트: `moaflow-1b9c8`
- 배포 주소: `https://moaflow-1b9c8.web.app/`
- 로컬 주소: `http://127.0.0.1:4173/`
- 대용량 QA 주소: `http://127.0.0.1:4173/?qa=large`
- 데모 인증번호: `123456`

이 브랜치에는 아직 커밋하지 않은 사용자 작업이 많다. 다른 브랜치로 이동하거나 변경을 초기화하지 말고 현재 작업 폴더와 브랜치에서 그대로 이어간다. `git reset --hard`, `git checkout --`, 대량 삭제는 사용하지 않는다.

## 사용자가 확정한 결제 정책

### 결제 방식

1. `매월 자동결제`
   - 학부모가 카드를 연결하고 자동결제에 동의한다.
   - 매월 납부일에 등록 카드로 자동결제한다.
   - 설정 저장만으로 즉시 결제하면 안 된다.
2. `매월 직접결제`
   - 학부모가 청구 건을 일부 선택해 카드로 결제할 수 있다. 카드는 선택한 청구 건의 금액을 정확히 청구한다(이미 가상계좌로 일부 납부된 청구 건이면 남은 잔액만 청구).
   - 가상계좌 입금은 청구 건을 선택하는 방식이 아니다. 학부모 고정 가상계좌로 들어온 입금액은 자동으로 배분된다(아래 고정형 가상계좌 항목 참고).

### 고정형 가상계좌

- 사용자가 KCP에서 계약·사용한 상품은 일반 일회성 가상계좌가 아니라 고정형 가상계좌다.
- 학원별 계좌가 아니라 `학부모 1명당 고정형 가상계좌 1개`를 발급한다. `매월 직접결제` 모드로 전환하는 순간 자동 발급된다(선택 행위 불필요).
- 해지 전까지 같은 계좌를 계속 사용한다.
- 자녀와 학원이 달라도 같은 학부모 계좌로 입금한다.
- **입금 배분 정책(2026-08-14 변경)**: 학부모가 특정 청구 건을 선택해 입금을 요청하는 방식은 폐기했다. 대신 이 계좌로 들어온 입금액은 **청구일(issuedAt)이 오래된 청구 건부터 자동으로 배분**된다.
  - 한 청구 건 안에서 임의 금액 쪼개기(부분 납부)를 지원한다. 청구 건은 `paidAmount` 필드로 진행 금액을 추적하며, `paidAmount < amount`인 동안은 상태가 `paid`로 바뀌지 않고 표에 `잔액 · 총 OOO원`으로 표시된다.
  - 한 청구 건을 다 채우고 남는 초과분은 다음(청구일이 그다음으로 오래된) 청구 건에 이어서 배분된다.
  - 현재 미납 청구 건을 모두 채우고도 남는 금액은 `guardianVirtualAccounts[].creditBalance`에 예치되고, 다음 입금 때 그 입금액과 합산되어 다시 배분된다.
  - `payments.js`의 `allocateVirtualAccountDeposit(state, guardianUserId, amount, context)`가 이 배분 로직의 핵심이다. 실제 KCP 웹훅이 붙으면 이 함수를 그대로 호출하면 된다.
  - 학부모 화면에는 이 계좌로 들어온 입금 시뮬레이션 버튼이 없다. 필요하면 `window.MoaFlowPayments.allocateVirtualAccountDeposit`을 테스트/콘솔에서 직접 호출해 검증한다(`tests/payment-flow.test.cjs`의 FIFO 배분 테스트 참고).
- KCP는 발급 계좌 수에 따른 비용과 입금 정산 수수료가 발생하므로 중복 계좌를 발급하지 않는다.
- 현재는 실제 KCP·카드 승인을 호출하지 않는 모의 구현이다.

### 학부모 고정 가상계좌 화면 표시

- 계좌 정보(은행명·계좌번호·예금주) 옆에 `총 입금예정액`(=입금액+미납액) / `입금액`(이 계좌로 지금까지 실제 입금된 누적액) / `미납액`(아직 안 낸 남은 금액) 3개를 표시한다.
- 입금 시뮬레이션 입력창·버튼은 사용자 요청으로 삭제했다(실제 KCP 연동 전까지는 브라우저에서 이 화면을 통해 입금을 재현할 방법이 없다).

### 카드 등록 버튼 현재 상태

- `매월 자동결제` 선택칸 오른쪽에 `카드 등록` 버튼이 있다.
- 클릭하면 `카드 등록 페이지는 추후 제공됩니다.` 안내만 표시한다.
- 실제 카드 등록 페이지는 아직 만들지 않는다. 사용자가 추후 별도 개발할 예정이다.

## 현재 구현 내용

- 원장: 자동 청구 기준, 반별 수강료(학원 정보 화면의 반 관리에서 관리), 청구·납부 내역(표, 잔액 표시 포함), 미납 알림 선택 발송
- 학부모: 자동결제/직접결제 설정, 직접결제 표(원생·학원 헤더 내장 필터 + 전체선택, 카드결제만 지원), 학부모 고정 가상계좌(총 입금예정액/입금액/미납액 표시), 결제 내역(원생·학원·상태 필터 + 월별·연별 조회)
- 운영자: 학원별 결제 운영 현황
- 가상계좌 입금 자동 배분(청구일 순, 부분납부, 초과분 이월, 예치금) — `allocateVirtualAccountDeposit` 참고
- 결제 상태·알림·모의 자동처리(카드 자동결제)
- 대용량 QA 결제 데이터와 결제 전용 테스트(`tests/payment-flow.test.cjs`)
- 학원 정보의 반 관리·수강료 관리 및 여러 UI 정리
- `app.js`의 `renderView()`에 렌더링 오류 안전장치 추가: 화면이 비거나 이전 화면이 남는 대신 오류 메시지를 화면에 표시한다.

### 오늘(2026-08-14) 되돌린/삭제한 것

- 학부모가 청구 건을 선택해 "고정 가상계좌로 입금" 요청하던 버튼과 흐름(`issueVirtualAccounts`) — 위 배분 정책 변경으로 대체
- 가상계좌 입금 완료를 수동으로 확인 처리하던 "입금 완료 통보 테스트" 버튼(`depositWebhook`)과, 그 후 추가했던 "테스트 입금액" 시뮬레이션 입력창·버튼 — 둘 다 사용자 요청으로 삭제. 실제 KCP 웹훅이 붙기 전까지 학부모 화면에서 입금을 재현할 UI 수단이 없다.
- `payments.js`의 `tuition-plan-form` 제출 핸들러 — 실제 반별 수강료 UI가 이미 `app.js`의 학원 정보/반 관리 화면(`.academy-class-tuition`)으로 옮겨져 있었고 이 핸들러는 참조되지 않는 죽은 코드였다.
- `STATUS_LABELS.awaiting_deposit` — 위 정책 변경으로 어떤 청구 건도 이 상태를 갖지 않게 되어 필터 드롭다운에서 제거.

주요 결제 구현은 `payments.js`에 있다. 앱 연결은 `app.js`, 화면 스타일은 `styles.css`, 배포 자산 연결은 `index.html`과 `scripts/prepare-firebase-hosting.cjs`에 있다.

## 현재 Git 상태와 커밋 대상

수정된 추적 파일:

- `app.js`
- `index.html`
- `package.json`
- `scripts/prepare-firebase-hosting.cjs`
- `styles.css`
- `tests/core-flow.test.cjs`

반드시 추가해야 하는 미추적 파일:

- `payments.js`
- `tests/payment-flow.test.cjs`
- `CLAUDE_PAYMENT_HANDOFF.md`

작업 범위 밖이므로 명시적인 사용자 요청 없이 추가·수정·삭제하지 않을 항목:

- `moaflow_brand_update/`
- `tools/`

`git add .`를 사용하지 말고 커밋 대상 파일만 명시적으로 추가한다.

## 이어서 수정할 때의 확인 순서

1. `CLAUDE.md`와 이 문서를 모두 읽는다.
2. `git branch --show-current`가 `codex/tuition-payments`인지 확인한다.
3. `git status --short`로 위 변경이 그대로 있는지 확인한다.
4. `npm start`로 4173 서버를 실행한다.
5. 일반 주소와 `?qa=large`에서 수정 요청을 이어서 반영한다.
6. 원장, 강사, 학부모, 운영자 로그인을 모두 확인한다.
7. 사용자에게서 수정 완료 지시를 받은 뒤 전체 검증과 배포 절차를 진행한다.

## 완료 전 필수 검증

사용자가 이전에는 수정 완료 후 한 번에 테스트하라고 했으므로 현재 전체 테스트는 아직 실행하지 않았다. 최종 수정이 끝나면 다음을 모두 실행한다.

```text
node --check app.js
node --check payments.js
npm test
npm run test:qa
npm run test:payments
git diff --check
```

브라우저에서 다음을 직접 확인한다.

- 일반 화면과 `?qa=large`에서 네 역할 모두 인증번호 `123456`으로 로그인
- 원장 결제 설정·반별 수강료(학원 정보 화면)·청구납부 내역
- 학부모 자동결제 설정 저장 시 즉시 결제되지 않는지
- 직접결제 표에서 원생·학원 헤더 필터, 전체선택, 카드결제(선택 금액만 정확히 청구)
- 동일 학부모가 여러 자녀·여러 학원을 가진 경우에도 고정계좌가 하나만 유지되는지
- `allocateVirtualAccountDeposit`을 콘솔/테스트로 호출해 청구일 오래된 순 자동 배분, 부분납부 잔액 표시(`잔액 · 총 OOO원`), 초과분이 다음 청구서로 이월되는지, 모두 채우고 남으면 `creditBalance`에 예치되어 다음 호출에 합산되는지
- 이미 가상계좌로 일부 납부된 청구 건을 카드로 결제하면 남은 잔액만 청구되는지
- 월별·연별·원생·학원·상태 필터
- 데스크톱과 모바일 레이아웃 및 부분 스크롤(특히 상단 지표 카드가 375px~1280px 사이에서 겹치거나 라벨이 사라지지 않는지)

실패가 나오면 테스트를 약화하거나 삭제하지 말고 구현을 수정한다. `CLAUDE.md`에 적힌 기존 실패 안내가 현재도 유효한지는 실제 실행 결과로 다시 확인한다.

## 배포 전 캐시 버전 갱신

`index.html`의 자산 쿼리 버전이 현재 서로 다르다. Firebase 배포 전 `styles.css`, `payments.js`, `qa-data.js`, `app.js`의 `?v=` 값을 동일한 새 버전으로 올린다. 예: 실제 배포 시점 기준 `YYYYMMDD-번호`. 그렇지 않으면 배포 후 브라우저에 이전 JS·CSS가 최대 1시간 남을 수 있다.

## GitHub 커밋·푸시·main 병합

사용자는 최종 검증 후 기능 브랜치 푸시, `main` 병합, `main` 푸시를 명시적으로 요청했다. 인증 상태를 먼저 확인하고 다음 순서로 진행한다.

```text
gh auth status
git status --short
git add app.js index.html package.json payments.js scripts/prepare-firebase-hosting.cjs styles.css tests/core-flow.test.cjs tests/payment-flow.test.cjs CLAUDE.md CLAUDE_PAYMENT_HANDOFF.md
git diff --cached --check
git commit -m "feat: add tuition billing and guardian payment flows"
git push -u origin codex/tuition-payments
git switch main
git pull --ff-only origin main
git merge --no-ff codex/tuition-payments -m "merge: tuition payment flows"
npm test
npm run test:qa
npm run test:payments
git push origin main
```

원격 `main`이 변경되어 충돌이 나면 사용자 작업을 덮어쓰지 말고 충돌 파일을 확인해 양쪽 변경을 보존한다. 병합이 성공하기 전에는 Firebase 배포하지 않는다.

## Firebase Hosting 배포

GitHub `main` 푸시와 전체 검증 성공 후 진행한다.

```text
firebase login
firebase use moaflow-1b9c8
firebase deploy --only hosting --project moaflow-1b9c8
```

`firebase.json`의 predeploy가 `scripts/prepare-firebase-hosting.cjs`를 실행해 `firebase-public/`을 새로 만든다. `payments.js`가 배포 자산 목록에 포함되어 있다. 배포 후 아래를 확인한다.

- `https://moaflow-1b9c8.web.app/`
- 로그인 네 역할
- 학부모 학원비 결제 화면
- 브라우저 콘솔 오류와 404 없음
- 배포 버전이 최신 자산 쿼리를 사용하는지

## 계정과 보안

- GitHub와 Firebase 토큰을 파일이나 커밋에 저장하지 않는다.
- 새 장치에서는 `gh auth login`, `firebase login`으로 각각 다시 인증한다.
- 인증 또는 권한이 없으면 임의 계정을 사용하지 말고 사용자에게 로그인만 요청한다.

