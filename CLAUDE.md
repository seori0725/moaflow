# MoaFlow 작업 인계

## 프로젝트

- 단일 페이지 정적 프로토타입: `index.html`, `app.js`, `styles.css`
- 로컬 서버: `npm start` 후 `http://127.0.0.1:4173`
- 테스트: `npm test`
- Firebase Hosting 프로젝트: `moaflow-1b9c8`
- 배포 준비: `npm run prepare:hosting`
- 배포: `firebase deploy --only hosting`

## 작업 원칙

- 기존 사용자 변경과 다른 작업자의 변경을 되돌리지 않는다.
- `moaflow_brand_update/`, `tools/` 등 작업 범위 밖의 미추적 파일은 임의로 추가·수정·삭제하지 않는다.
- 역할별 화면은 원장, 강사, 학부모, 운영자를 모두 확인한다.
- 데스크톱과 모바일에서 실제 화면을 확인하고 가로 넘침과 부분 스크롤을 점검한다.
- 변경 후 `node --check app.js`, `npm test`, `git diff --check`를 실행한다.
- 현재 전체 테스트에는 운영자 학습분석 상태 문구 기대값(`활발`)과 실제값(`사용 중`)이 다른 기존 실패 1건이 있다. 관련 기능을 수정하지 않는 작업에서는 임의로 문구나 테스트를 바꾸지 않는다.

## Git 작업 흐름

- 기준 브랜치는 `main`이고 기능 작업은 `codex/` 또는 `claude/` 접두사 브랜치에서 진행한다.
- 변경 전 `git status`로 사용자 작업이 있는지 확인한다.
- 커밋에는 작업한 파일만 명시적으로 추가한다.
- 작업 완료 후 기능 브랜치를 원격에 푸시하고 검증된 변경만 `main`에 병합한다.

## 개인 계정과 Claude에서 이어하기

1. 개인 GitHub 계정에 이 저장소 접근 권한을 부여하거나 개인 계정으로 포크한다.
2. 개인 환경에서 저장소를 복제하고 Node.js와 Firebase CLI를 준비한다.
3. `npm install`, `npm start`, `npm test` 순서로 상태를 확인한다.
4. Claude Code는 저장소 루트에서 실행한다. 이 파일을 자동으로 읽어 동일한 작업 원칙과 명령을 사용한다.
5. 포크를 쓰는 경우 개인 포크를 `origin`, 원본 `seori0725/moaflow`를 `upstream`으로 두고 작업 전 `upstream/main`을 동기화한다.

GitHub나 Firebase 로그인 토큰은 저장소에 저장하지 않는다. 각 개인 환경에서 `gh auth login`과 `firebase login`으로 별도 인증한다.
