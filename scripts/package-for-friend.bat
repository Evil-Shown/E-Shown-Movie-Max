@echo off
title Package Chithra for friend
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0package-for-friend.ps1"
echo.
pause
