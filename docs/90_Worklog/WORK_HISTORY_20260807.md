# WORK HISTORY - 2026-08-07

## 1. 개요
- **작업 일시**: 2026-08-07
- **작업 내용**: GitHub 저장소 연결, 초기 소스코드 푸시 및 SoT(Source of Truth) 문서 체계 수립

## 2. 세부 변경 사항

### 1) GitHub 저장소 생성 및 초기 커밋
- 저장소: `https://github.com/glory7138-lab/recoding`
- `main` 브랜치에 초기 프로젝트 소스코드 커밋 및 푸시 완료.
- PR 생성 및 연동 테스트 진행 (`https://github.com/glory7138-lab/recoding/pull/1`).

### 2) SoT (Source of Truth) 문서 체계 구축
- `llms.txt`: AI Agent 및 개발자를 위한 전역 가이드라인 작성.
- `docs/INDEX.md`: 전체 문서 목차 및 분류 인덱스 작성.
- `docs/00_SOT/product-scope.md`: 제품 범위, MVP 기능 및 스택 가이드 작성.
- `docs/00_SOT/collaboration-rules.md`: GitHub 브랜치 전략, PR 및 문서 반영 규칙 수립.
- `docs/90_Worklog/WORK_HISTORY_20260807.md`: 최초 작업 이력 작성.

### 3) 워크플로우 규칙 보완 ("마무리 해" 실행 시 main 동기화 의무화)
- `.agents/AGENTS.md` 및 `docs/00_SOT/collaboration-rules.md` 개정.
- 작업 종료 명령어("마무리 해", "pr 생성해") 실행 시 작업 브랜치 커밋/Push뿐만 아니라 `main` 브랜치 자동 Merge 및 `origin/main` Push를 의무화하여 항상 최신 `main` 브랜치 유지를 보장.

### 4) NativeBOX 클래식 레트로 UI 스킨 및 플레이어 구현
- `app/globals.css`: 3D 메탈 베젤 스킨, 파란색 문장 하이라이트 CSS 시스템 적용.
- `app/components/NativeBoxPlayer.js`: NativeBOX 전용 상단 비디오 화면 및 스크린/캡션 조작 패널 구현.
- `app/components/SubtitleScriptViewer.js`: 하단 대형 문장 스크립트 뷰어 (파란색 문장 하이라이트, 폰트 조절, 대형 이동 화살표) 구현.
- `app/components/ContentsListModal.js`: 우측 하단 `Contents List` 미니 윈도우 팝업 구현.
- `app/page.js`: NativeBOX 스킨 레이아웃 메인 뷰 통합.

### 5) NativeBoxPlayer 문장 반복 조작부 추가 및 오디오 업로드 안전장치
- `app/components/NativeBoxPlayer.js`: 우측 조작 패널에 `↺ 1회` (현재 문장 1회 재시작) 및 `🔁 무한` (구간반복 ON/OFF) 컴팩트 가로 배치 버튼 추가.
- `app/components/AiSegmenter.js`: `FileReader` 2중 세이프가드 버퍼 로직 적용 (`[DLBunny]...mp4` 같은 임시 다운로드 파일 접근 오류 해결), 오디오 전용 확장자(`.mp3`, `.wav`, `.m4a`, `.aac`, `.flac`, `.ogg`, `.wma`) 드래그&드롭 허용.

### 6) AI Auto-Segmenter 모듈 (WhisperX) SOT 및 PoC 구축
- `docs/00_SOT/ai-auto-segmenter.md`: WhisperX + Wav2Vec2 음소 강제 정렬 기반의 4단계 파이프라인 및 4주 로드맵 수립.
- `auto-segmenter/poc_segmenter.py`: Python + WhisperX + FFmpeg 로컬 테스트 환경 세팅 완료 및 `sample.mp4` 정밀 밀리초(ms) 타임스탬프 추출 검증 완료.

### 7) 플레이어 UX/UI 전면 개편 및 단독 어학기 모드 완성
- **다중 문장 범위 구간 반복 & 슬라이더**: 자막 스크립트 각 문장에 체크박스 및 `☐ 전체 선택` 마스터 체크박스 제공. 1~10회 및 ∞ 무한 반복을 미세 가로 슬라이더로 조절할 수 있도록 고시인성 카드형 레이아웃 구현. 설정값 `localStorage` 영속화.
- **하단 메인 컨트롤바 1:1 비디오 폭 정렬**:
  - `[ ⏱️ 타임라인 Scrubber 바 ]`를 상단 동영상 가로폭과 100% 동일하게 배치.
  - `[ ▷ 재생 / ⏹️ 정지 / 🔊 음량 ]` 버튼 그룹을 우측 반복 카드에 맞춘 밸런스 규격으로 우측 배치.
- **상단 메뉴 툴바 글로벌 헤더 통합 & 상시 노출**:
  - `[ 🎛️ 레트로 스킨 뷰 ]`, `[ ☰ 자막 에디터 ]`, `[ ⚛️ AI 문장 분할기 ]` 모드 전환 버튼을 최상단 헤더 바 안으로 통합하여 수직 공간 40px 절약.
  - `현재 파일:` 라벨 정리 및 상단 메뉴 툴바 상시 노출.
- **하단 대본 리스트 4개 이상 동시 보기 (14px 디폴트)**:
  - 디폴트 폰트 크기 14px 및 대본 상자 `maxHeight` 확장으로 스크롤 없이 최소 4개 이상의 문장을 동시에 확인 가능.
- **단독 어학기 standalone 앱 실행 모드**:
  - `실행하기.bat` 및 `run.bat`에 `--app=http://localhost:3000` 옵션 적용. 웹 브라우저 탭, 주소창, 북마크 바 없이 순수 전용 데스크톱 어학기 앱 형태로 바로 실행.

### 8) UI 배율/글자 2x~1.5x 확대, 재생속도, 유니버설 자막 파서 및 무설치 포터블 ZIP 배포 완성
- **재생 속도 조절 0.5x ~ 3.0x**: `MediaPlayer.js`에 0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 1.75x, 2.0x, 2.25x, 2.5x, 3.0x 조절 옵션 탑재.
- **기본 100% 화면 배율 핏팅**: `page.js` 디폴트 `playerSizePercent`를 100%로 설정.
- **헤더/컨트롤바/대본 폰트 & UI 요소 2x/1.5x 스케일업**: `Header.js`, `NativeBoxPlayer.js`, `SubtitleScriptViewer.js` 내 버튼, 아이콘, 체크박스 및 글자 크기 시각적 시원함 확보.
- **유니버설 자막 파서 (Universal Subtitle Engine)**: `SRT`, `SMI/SAMI`, `WebVTT`, `ASS/SSA`, `JSON/NBC`, `CSV/TSV` 등 모든 자막 파일 형식 자동 파싱 및 연동 지원.
- **자막 갱신 및 삭제 버퍼 버그 수정**: 영상 삭제/전환 시 이전 자막이 메모리에 남아있던 버그 완전 해결.
- **무설치 배포 파일 생성**: `dist/NativeBOX_AI_Player.zip` (Node.js 미설치 환경에서도 `NativeBOX_AI_Player.exe` 더블클릭만으로 무설치 포터블 구동).

### 9) Electron EXE 체크 선택 구간 반복 시 1번 문장 선재생 버그 수정
- **원인 분석**: Electron/Chromium 데스크톱 환경에서 비디오 시작 지점 변경(`currentTime = checkedStartTime`) 시 비동기 media seek 처리 중 `play()`가 호출되면, 첫 1회차에 0초(1번 문장)부터 재생이 이루어지는 현상 확인.
- **수정 내용**: `NativeBoxPlayer.js` 내 `handleTimeUpdate`, `togglePlay`, `handlePlayOnce` 및 `🔁 반복 실행` 버튼 클릭 시 `time < targetStartTime - 0.3` 조건 판단 세이프가드를 추가하여, 재생 시점이 선택 구간 시작보다 이전일 경우 즉시 `targetStartTime`으로 강제 보정하도록 개선.

## 3. 검증 결과
- Next.js 프로덕션 정적 빌드(`npm run build`) 성공 (오류 0건).
- Electron 포터블 실행 파일 패키징(`npm run dist`) 성공 (`dist/NativeBOX_AI_Player-win32-x64`).
- 최신 포터블 무설치 ZIP 생성 완료 (`dist/NativeBOX_AI_Player.zip`).


