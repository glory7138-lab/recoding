@echo off
chcp 65001 > nul
title NativeBOX AI - 설치 및 실행 스크립트
color 0A

echo.
echo ============================================================
echo   NativeBOX AI - 동영상 문장 자동 분할 어학 플레이어
echo ============================================================
echo.

REM ── Node.js 설치 확인 ──
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [오류] Node.js가 설치되어 있지 않습니다!
    echo.
    echo 아래 주소에서 Node.js 20 LTS 버전을 먼저 설치해주세요:
    echo https://nodejs.org/ko
    echo.
    echo 설치 후 이 파일을 다시 실행해주세요.
    pause
    exit /b
)

echo [✓] Node.js 버전 확인:
node --version
echo.

REM ── node_modules 없으면 패키지 설치 ──
if not exist "node_modules" (
    echo [설치 중] 필요한 라이브러리를 설치합니다... (최초 1회, 약 1~3분 소요)
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo [오류] 패키지 설치에 실패했습니다.
        pause
        exit /b
    )
    echo.
    echo [✓] 라이브러리 설치 완료!
    echo.
)

REM ── Next.js 빌드 (out/ 폴더가 없을 때만) ──
if not exist "out" (
    echo [빌드 중] 앱을 빌드합니다... (최초 1회, 약 30초~1분 소요)
    echo.
    npm run build
    if %errorlevel% neq 0 (
        echo [오류] 빌드에 실패했습니다.
        pause
        exit /b
    )
    echo.
    echo [✓] 빌드 완료!
    echo.
)

echo ============================================================
echo   NativeBOX AI 앱을 실행합니다!
echo   앱 창이 열리면 이 창을 닫지 마세요.
echo   앱을 종료하려면 앱 창을 닫으면 됩니다.
echo ============================================================
echo.

REM ── Electron 앱 실행 ──
npm run electron

echo.
echo [종료됨] NativeBOX AI가 종료되었습니다.
pause
