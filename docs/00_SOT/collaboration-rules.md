# Standard GitHub Collaboration Process & Rules

이 문서는 Recoding 프로젝트의 모든 코드 변경, 구조 개선, 기능 추가, 문서 수정에 필수적으로 적용되는 협업 절차와 규칙을 규정합니다.

---

## 1. Standard GitHub Collaboration Process

이 프로젝트의 모든 코드 변경, 구조 개선, 기능 추가, 문서 수정은 다음 협업 절차를 따른다.

### 1) Branch from main
- `main`은 항상 배포 가능하거나 기준이 되는 안정 브랜치로 유지한다.
- 직접 `main`에 커밋하지 않고, 모든 작업은 개별 작업 브랜치에서 수행한다.
- 브랜치명은 작업 목적이 드러나도록 작성한다.
- 예:
  - `feature/subtitle-export`
  - `fix/whisper-timecode`
  - `refactor/player-component`
  - `docs/update-sot`

### 2) Commit in meaningful units
- 변경 사항은 의미 있는 단위로 나누어 자주 커밋한다.
- 커밋 메시지는 직관적이고 커밋 분류(feature, fix, docs, refactor 등)를 포함한다.
- 서로 다른 성격의 변경을 하나의 커밋에 섞지 않는다.

### 3) Submit a Pull Request
- 작업 완료 후 `main`으로 바로 반영하지 않고 Pull Request를 생성한다.
- PR에는 다음 내용을 포함한다.
  - 변경 목적
  - 핵심 변경 사항
  - 영향 범위
  - 검증 결과 (테스트 및 빌드 결과)
  - SoT 문서 업데이트 필요 여부

### 4) Review before merge
- 모든 변경은 리뷰 또는 PR 검증을 거친 후 머지한다.
- 코드 품질, Electron 패키징 호환성, SoT 문서 반영 여부를 함께 확인한다.

### 5) Update documentation after merge-ready changes
- 기능, 구조, 정책, 사용 방법이 변경되면 관련 문서를 반드시 함께 갱신한다.
- 문서 업데이트 대상은 다음을 포함한다.
  - `README.md`
  - `llms.txt`
  - `docs/` 내 SOT, 아키텍처, 사용법 문서
- 코드와 문서 간 불일치를 허용하지 않는다.

---

## 2. Documentation Rule

다음 항목이 바뀌면 문서 업데이트를 필수로 수행한다.
- 기능 추가, 변경 또는 제거
- 폴더 구조 및 컴포넌트 구조 변경
- Whisper API 연동 방식 변경
- 자막 내보내기 포맷 지원 변경
- Electron 빌드 및 실행 환경 변경

---

## 3. Collaboration Principle

이 프로젝트에서는 "코드 변경"과 "문서 반영"을 하나의 작업으로 본다.
구현만 완료되고 문서가 최신화되지 않은 작업은 완료된 것으로 간주하지 않는다.
