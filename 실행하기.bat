@echo off
chcp 65001 >nul
title NativeBOX AI Player - 소스 실행기

echo ============================================================
echo   NativeBOX AI Player 자동 설치 및 실행기
echo ============================================================
echo.

:: 1. Node.js 설치 확인
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ [오류] Node.js가 설치되어 있지 않습니다!
    echo.
    echo 💡 설치 방법:
    echo 1. 브라우저가 열리면 Node.js 최신 버전(LTS)을 다운로드하여 설치해 주세요.
    echo 2. 설치 완료 후 이 bat 파일을 다시 더블클릭하세요.
    echo.
    start https://nodejs.org/
    pause
    exit /b
)

echo ✅ [1/3] Node.js 감지됨 (버전: )
node -v

:: 2. 필수 패키지(node_modules) 자동 설치 확인
if not exist "node_modules" (
    echo.
    echo 📦 [2/3] 필요한 라이브러리(node_modules)를 설치하는 중입니다...
    echo (최초 1회만 진행되며 1~2분 정도 소요됩니다. 잠시만 기다려주세요!)
    echo.
    call npm install --loglevel=error
    if %errorlevel% neq 0 (
        echo ❌ 패키지 설치 중 오류가 발생했습니다. 네트워크 연결을 확인하세요.
        pause
        exit /b
    )
    echo ✅ 패키지 설치 완료!
) else (
    echo ✅ [2/3] 라이브러리(node_modules) 준비 완료.
)

echo.
echo 🚀 [3/3] NativeBOX AI 플레이어 서버를 시작합니다...
echo.

:: 3. 전용 브라우저 앱 창 자동 오픈
start msedge --app=http://localhost:3000 2>nul || start chrome --app=http://localhost:3000 2>nul || start "" "http://localhost:3000"

:: 4. Next.js 개발/경량 서버 실행
call npm run dev

pause
