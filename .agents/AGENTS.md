# Recoding AI Agent Rules & Workflow Protocol

이 규칙은 `recoding` 프로젝트에서 AI Agent(Antigravity)가 사용자와 협업할 때 반드시 준수해야 하는 **워크플로우 원칙**입니다.

---

## 1. 시작 명령어: "여기서 할게" (Context Synchronization & Resumption)

사용자가 **"여기서 할게"** 또는 동등한 표현을 사용해 작업을 시작할 때 AI Agent는 다음 단계를 즉시 수행한다:

1. **원격/로컬 상태 동기화 확인**:
   - `git fetch origin` 및 `git status` 실행
   - `main` 브랜치가 최신인지 확인하고 필요시 최신 상태로 마이그레이션/동기화
2. **SoT 및 이력 점검**:
   - `llms.txt` 및 `docs/INDEX.md` 확인
   - `docs/90_Worklog/` 디렉터리의 가장 최근 작업 일지(`WORK_HISTORY_YYYYMMDD.md`)를 읽고 이전 작업 맥락과 미완료 항목 파악
3. **상태 보고**:
   - 사용자에게 현재 브랜치 상태, 최근 작업 요약 및 진행할 준비 상태를 간결하게 보고

---

## 2. 종료/완료 명령어: "pr 생성해" / "마무리 해" (PR & History Persistence)

사용자가 **"pr 생성해"**, **"마무리 해"** 또는 동등한 표현으로 작업을 마칠 때 AI Agent는 다음 작업을 차례대로 실행한다:

1. **코드 및 문서 통합 확인**:
   - 변경된 모든 코드 및 추가된 기능 확인
   - `docs/90_Worklog/WORK_HISTORY_YYYYMMDD.md`에 오늘 작업 이력 작성/갱신
   - `llms.txt` 및 관련 SoT 문서(`docs/00_SOT/` 등)가 변경 사항을 정확히 반영했는지 검증
2. **작업 브랜치 생성 및 커밋**:
   - 목적에 맞는 작업 브랜치(`feature/...`, `fix/...`, `docs/...`) 생성
   - 의미 있는 커밋 메시지로 변경 사항 커밋
3. **Remote Push & Pull Request 생성**:
   - GitHub 원격 저장소로 브랜치 `push`
   - GitHub Pull Request 자동 생성 (제목, 핵심 변경사항, 검증 결과 포함)
4. **결과 공유**:
   - 생성된 PR 링크와 작업 요약을 사용자에게 전달

---

## 3. 영속성 및 타 PC 호환성 원칙

- **단일 진실 공급원(SoT) 보장**: 모든 기능/구조 변경은 즉시 `docs/` 및 `llms.txt`에 기록되어, 어떤 환경이나 새로운 AI 대화 세션에서도 동일한 컨텍스트를 로드할 수 있어야 한다.
- **Git 기반 이력 영속성**: 로컬 임시 파일에 의존하지 않고 모든 변경과 작업 기록을 GitHub 브랜치/PR/Worklog에 남긴다.
