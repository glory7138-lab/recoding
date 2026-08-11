# WORK HISTORY - 2026-08-11

## 1. 개요
- **작업 일시**: 2026-08-11
- **작업 내용**: 좌/우 2분할 스플릿 레이아웃 구현, 우측 패널 1:1 비디오 높이 동적 바인딩, 화면 배율 슬라이더 & 인라인 미세 조절 버튼 개선, 자막 폰트 비례 스케일링, 상단 헤더 70% 콤팩트 다이어트 및 재생 목록 수직 공간 확장

## 2. 세부 변경 사항

### 1) 좌/우 2분할 스플릿 레이아웃 (`layoutMode`) 및 토글 지원
- `app/page.js`, `app/components/NativeBoxPlayer.js`, `app/components/SubtitleScriptViewer.js`:
  - `layoutMode` 상태 (`'split'` | `'stacked'`) 추가 및 `localStorage('nb_layout_mode')`에 설정값 자동 보관.
  - `split` 모드 시 좌측(~62%) 비디오 플레이어, 우측(~38%) 대사 5~7개 고정 노출 스크립트 뷰어로 2분할 배치.
  - 플레이어 상단 툴바에 `[ ▥ 좌우 분할 ]` ↔ `[ ▤ 상하 통합 ]` 전환 토글 버튼 추가.

### 2) 우측 제어 패널 1:1 동적 높이 바인딩 (`ResizeObserver`)
- `app/components/NativeBoxPlayer.js`:
  - `ResizeObserver`를 활용하여 비디오 뷰어 컨테이너(`videoContainerRef`)의 실시간 픽셀 높이를 우측 제어 패널의 `height`/`maxHeight`와 1:1 바인딩.
  - 화면 배율(60%~140%)이나 창 크기 변경 시 우측 메뉴 패널의 하단 라인이 비디오 하단 라인과 완벽히 일치하도록 연동.

### 3) 화면 배율 슬라이더 10% 단위 조절 및 인라인 미세 조절 버튼 배치
- `app/components/NativeBoxPlayer.js`:
  - 화면 배율 슬라이더 `step="10"` (60%~140%, 10% 단위)으로 변경.
  - 기존 70%, 100%, 120%, 140% 고정 버튼 삭제 후, 슬라이더 바 오른쪽 끝에 `-10%`, `100%`, `+10%` 미세 조절 인라인 콤팩트 버튼 배치.

### 4) 자막 폰트 화면 배율 동적 비례 스케일링 (Dynamic Font Scaling)
- `app/components/SubtitleScriptViewer.js`:
  - `getFontSizePx` 함수 개선: `playerSizePercent` 비율에 따라 자막 스크립트 폰트 크기가 비례하여 실시간 확대/축소되도록 구현 (최소 가독성 10px 유지).

### 5) 상단 툴바 및 타이틀바 폰트/버튼 70% 콤팩트 다이어트
- `app/components/Header.js`, `app/components/NativeBoxPlayer.js`:
  - 상단 앱 헤더 툴바 및 플레이어 타이틀바 폰트 크기 및 아이콘/버튼 규격을 기존 대비 70% 수준으로 축소하여 수직 공간 절감.

### 6) 강의/재생 목록 수직 공간 확장
- `app/components/NativeBoxPlayer.js`:
  - 재생 목록 상자 `maxHeight`를 180px에서 260px로 확장하여 버튼 이동으로 확보된 공간을 꽉 채우도록 개선.

## 3. 검증 결과
- Next.js 프로덕션 정적 빌드(`npm run build`) 성공 (오류 0건).
- Electron 포터블 실행 파일 패키징(`npm run dist`) 성공 (`dist/NativeBOX_AI_Player.exe`).
- GitHub `main` 브랜치 자동 병합 및 Remote Sync 완료.
