# Product Scope & Rules

## 제품 요약
- **이름**: Recoding (NativeBOX AI Sentence Segmenter & Subtitle Editor)
- **목적**: 미디어(동영상/음성) 파일에 대한 자동 자막 생성, 시간축 분할, 에디팅 및 자막 파일(VTT, SRT, ASS) 추출을 지원하는 모던 데스크톱/웹 통합 자막 작업 환경 제공.
- **주요 사용자**:
  - **콘텐츠 크리에이터 / 자막 편집자**: 영상에 자막을 신속하게 생성하고 타임코드를 정밀 편집하려는 사용자.
  - **언어 학습자**: NativeBOX 스타일 문장 분할 기반 미디어 플레이어로 회화 및 미디어 기반 학습을 수행하는 사용자.

## 주요 기능 및 규칙 (MVP)
1. **미디어 재생 및 타임라인 컨트롤**
   - HTML5 / Custom Video Player (`MediaPlayer.js`)를 통한 오디오 및 비디오 제어.
   - 자막 타임코드 클릭 시 해당 재생 지점으로 이송.

2. **AI 자막 자동 생성 & 문장 분할**
   - OpenAI Whisper API 라우트 (`app/api/whisper/route.js`)를 통한 자막 추출.
   - AI 분할기 (`AiSegmenter.js`)를 통한 문장 단위 자막 자동 커팅.

3. **자막 에디터 & 데이터 관리**
   - 타임코드(시작 시간 - 종료 시간) 및 자막 텍스트 실시간 수정 (`SubtitleEditor.js`).
   - 자막 항목 추가, 삭제, 이동 및 타임라인 싱크 조절.

4. **자막 내보내기 & 가져오기**
   - `.vtt`, `.srt`, `.ass` 등 표준 자막 포맷 추출 (`ExportModal.js`).

5. **데스크톱 독립 실행 (Electron)**
   - Electron main 프로세스(`main.js`)를 통한 데스크톱 윈도우 지원 및 Portable 빌드.

## 기술 제약 사항 및 스택
- **웹 프레임워크**: Next.js 14 (App Router)
- **데스크톱 래퍼**: Electron 31
- **스타일링**: Vanilla CSS (`app/globals.css`)
- **실행 스크립트**: `run_app.bat` 또는 `npm run dev` / `npm run app:dev`
