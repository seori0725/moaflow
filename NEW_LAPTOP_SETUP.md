# MoaFlow 새 노트북 작업 환경

## 저장소와 기준 브랜치

- GitHub: `https://github.com/seori0725/moaflow.git`
- 기준 브랜치: `main`
- 새 작업 브랜치: Codex는 `codex/작업명`, Claude는 `claude/작업명`
- Firebase 프로젝트: `moaflow-1b9c8`
- 배포 주소: `https://moaflow-1b9c8.web.app/`

## 새 노트북 최초 설정

1. Git, Node.js LTS, GitHub CLI, Firebase CLI, Codex 또는 Claude Code를 설치합니다.
2. GitHub 개인계정으로 로그인하고 저장소 접근 권한을 확인합니다.
3. 저장소를 복제한 뒤 프로젝트 폴더로 이동합니다.
4. 의존성을 설치하고 전체 테스트를 실행합니다.
5. 로컬 서버를 실행하고 `http://127.0.0.1:4173`을 확인합니다.
6. Firebase 개인계정으로 로그인하고 `moaflow-1b9c8` 프로젝트 접근 권한을 확인합니다.

## 필수 명령 순서

```text
gh auth login
git clone https://github.com/seori0725/moaflow.git
cd moaflow
npm install
npm test
npm run test:qa
npm start
firebase login
firebase use moaflow-1b9c8
```

QA 가상 데이터는 `http://127.0.0.1:4173/?qa=large`에서 확인합니다. 인증번호는 `123456`입니다.

## 작업과 배포

1. `main`을 최신 상태로 받은 뒤 새 작업 브랜치를 만듭니다.
2. 변경 후 `npm test`, `npm run test:qa`, `git diff --check`를 실행합니다.
3. 작업 브랜치를 푸시하고 검증된 변경만 `main`에 병합합니다.
4. `main`에서 `firebase deploy --only hosting`으로 배포합니다.

## 계정 이전 전 확인

- 개인 GitHub 계정이 비공개 저장소 `seori0725/moaflow`를 열 수 있어야 합니다.
- 개인 Firebase 계정이 프로젝트 `moaflow-1b9c8`에 배포 권한을 가져야 합니다.
- GitHub 및 Firebase 로그인 토큰은 저장소에 보관하지 않습니다. 새 노트북에서 각각 다시 로그인합니다.
- Claude Code는 저장소 루트에서 실행하면 `CLAUDE.md`의 작업 원칙을 자동으로 확인할 수 있습니다.
- `moaflow_brand_update/`, `tools/`는 현재 Git 추적 대상이 아니므로 별도 백업이 필요합니다.
