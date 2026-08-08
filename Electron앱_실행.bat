@echo off
chcp 65001 >nul
title NativeBOX AI Player (Desktop App)

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

echo [Info] Launching NativeBOX AI Player...
call npx electron .
