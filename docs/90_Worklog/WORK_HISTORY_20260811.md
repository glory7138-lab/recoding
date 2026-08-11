# WORK HISTORY - 2026-08-11

## 1. 개요
- **작업 일시**: 2026-08-11
- **작업 내용**: 좌/우 2분할 스플릿 레이아웃 구현, 우측 패널 1:1 비디오 높이 동적 바인딩, 화면 배율 슬라이더 & 인라인 미세 조절 버튼 개선, 자막 폰트 비례 스케일링, 상단 헤더 70% 콤팩트 다이어트, 고정 포트(39754)를 통한 설정/재생목록 영속성 보장, 다중 파일 동시 선택 로드, 바이너리 NBC 자막 파서 및 비중첩 영상 싱크 동기화 구현

## 2. 세부 변경 사항

### 1) 내장 HTTP 서버 고정 포트(39754) 설정 및 영속성 보장 (`main.js`)
- `main.js` 내장 HTTP 서버 포트를 `const FIXED_PORT = 39754;`로 고정.
- 앱 재실행 시마다 Chromium 오리진(Origin)이 변하지 않도록 보장하여 `LocalStorage` 및 `IndexedDB` 데이터(재생목록, 설정값)가 영구적으로 보존됨.

### 2) 좌/우 2분할 스플릿 레이아웃 (`layoutMode`) 및 토글 지원
- `app/page.js`, `app/components/NativeBoxPlayer.js`, `app/components/SubtitleScriptViewer.js`:
  - `layoutMode` 상태 (`'split'` | `'stacked'`) 추가 및 `localStorage('nb_layout_mode')`에 설정값 자동 보관.
  - `split` 모드 시 좌측(~62%) 비디오 플레이어, 우측(~38%) 대사 스크립트 뷰어로 2분할 배치.
  - 플레이어 상단 툴바에 `[ ▥ 좌우 분할 ]` ↔ `[ ▤ 상하 통합 ]` 전환 토글 버튼 추가.

### 3) 우측 제어 패널 1:1 동적 높이 바인딩 (`ResizeObserver`)
- `app/components/NativeBoxPlayer.js`:
  - `ResizeObserver`를 활용하여 비디오 뷰어 컨테이너의 실시간 픽셀 높이를 우측 제어 패널의 높이와 1:1 바인딩.

### 4) 영상+자막 동시 로드 지원 & 삭제 항목 영속 제거 (`app/page.js`, `NativeBoxPlayer.js`, `Header.js`)
- 1-Click 다중 파일 선택(`Ctrl`/`Shift` 다중 선택) 지원으로 동영상과 자막을 동시에 불러오도록 개선.
- 재생목록에서 항목 삭제 시 물리 파일은 건드리지 않고, `LocalStorage` 및 `IndexedDB`에서 완벽히 영구 제거하여 앱 재실행 시 삭제 항목 부활 문제 해결.
- 상단 헤더의 중복 로드 버튼 제거 및 플레이어 전용 로드 버튼으로 일원화.

### 5) 사용자 플레이어 설정 영속 보존
- `volume`, `fontSize`, `playerSizePercent`, `captionMode`, `screenMode` 설정값이 앱 재실행 후에도 마지막 상태 그대로 자동 복원되도록 개선.

### 6) 바이너리 NBC 자막 컨테이너 파서 및 정밀 비중첩 영상 싱크 동기화 (`app/page.js`)
- `readTextFileWithEncoding` (UTF-16LE/BE, CP949, UTF-8 BOM) 추가.
- 텍스트 파싱 실패 시 바이너리 레코드 structures에서 타임스탬프를 자동 추출하는 `parseBinaryNBCContent` 구현.
- `about1.nbc` 및 `about1.mp4` 대사의 비중첩 정밀 싱크(00:04, 00:07, 00:10...) 및 실제 영/한 대사 매핑 완성.

## 3. 배포 및 검증 결과
- **Next.js 정적 빌드 (`npm run build`)**: Compiled successfully (오류 0건).
- **Electron 포터블 실행 파일 패키징 (`npm run dist`)**: `dist/NativeBOX_AI_Player.exe` (Windows 포터블 실행 파일 생성 완료).
- **Git 병합 및 원격 저장소 동기화**: `main` 브랜치 자동 병합 및 Remote Push 성공.
