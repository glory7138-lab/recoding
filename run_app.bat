@echo off
title NativeBOX AI Desktop App
echo ========================================================
echo   NativeBOX AI - Starting Electron Desktop App...
echo ========================================================
echo.
if exist .next rmdir /s /q .next
npx electron .
