@echo off
chcp 65001 >nul
title NativeBOX AI Player

echo ============================================================
echo   NativeBOX AI Player Starting...
echo ============================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    pause
    exit /b
)

if not exist "out" (
    echo [Info] Building production files...
    call npm run build
)

echo [Info] Opening App Window...
start msedge --app=http://localhost:3000 2>nul || start chrome --app=http://localhost:3000 2>nul || start "" "http://localhost:3000"

echo [Info] Starting Server...
call npm run dev
