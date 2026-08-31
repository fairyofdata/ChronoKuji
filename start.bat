@echo off
setlocal
cd /d "%~dp0"
title O_miku_Z Server

echo ====================================================
echo   🔮 O_miku_Z Server Starting...
echo ====================================================
echo.

set "PATH=C:\Program Files\nodejs;%APPDATA%\npm;%LOCALAPPDATA%\Programs\node;%PATH%"

start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:5173"

call npm.cmd run dev

if errorlevel 1 (
    echo.
    echo [Server Stopped or Error] Code: %errorlevel%
)

pause