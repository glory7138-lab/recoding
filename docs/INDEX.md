# Recoding SoT Index

이 디렉터리는 Recoding (NativeBOX AI 자막 분할 & 편집기) 프로젝트의 **단일 진실 공급원(SoT)**입니다.
코드는 이 문서를 따라야 하며, 기능이나 구조가 변경될 때 항상 SoT 문서도 함께 수정해야 합니다.

## 분류
- `00_SOT/` : 제품 정의, 개발 표준, 협업 및 문서화 규칙 (`product-scope.md`, `collaboration-rules.md`)
- `10_Architecture/` : Next.js App Router, Electron 통합 프로세스, 컴포넌트 아키텍처
- `20_Domain/` : 자막 규격(VTT, SRT, ASS), 타임코드 연산 및 AI 문장 분할 규칙
- `30_Data/` : 자막 데이터구조 및 템플릿 정보
- `40_API/` : Whisper API 및 내부 라우트 연동 계약
- `50_User_Scenarios/` : 미디어 로드, AI 자막 분할, 자막 편집 및 내보내기 시나리오
- `60_ADRs/` : 아키텍처 결정 기록 (Architecture Decision Records)
- `70_Runbooks/` : 개발, 실행 (`run_app.bat`), Electron 빌드 및 배포 절차
- `80_Lessons/` : 문제 해결 경험 및 이슈 기록
- `90_Worklog/` : 작업 내용 기록 및 변경 이력
- `templates/` : PR, ADR, Worklog용 표준 작성 템플릿
