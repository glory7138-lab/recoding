@echo off
title NativeBOX AI Player
color 0A

echo ============================================================
echo   NativeBOX AI Player (Standalone App Mode) Starting...
echo ============================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b
)

if not exist "node_modules" (
    echo [Info] Installing dependencies...
    call npm install
)

echo [Info] Opening NativeBOX AI in Standalone App Window Mode...
start msedge --app=http://localhost:3000 2>nul || start chrome --app=http://localhost:3000 2>nul || start "" "http://localhost:3000"

echo [Info] Starting Next.js Dev Server...
call npm run dev

pause
