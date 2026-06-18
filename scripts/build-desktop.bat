@echo off
title Build Chithra Cinema Installer
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build-desktop.ps1"
echo.
pause
