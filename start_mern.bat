@echo off
setlocal enabledelayedexpansion
title InterviewCoach AI - MERN Platform Launcher
color 0b

echo =====================================================================
echo       InterviewCoach AI - Placement Preparation Platform (MERN)
echo =====================================================================
echo.

set "WORKSPACE_ROOT=%~dp0"
cd /d "%WORKSPACE_ROOT%"

:: Ensure logs directory exists
if not exist "%WORKSPACE_ROOT%logs" mkdir "%WORKSPACE_ROOT%logs"
set "SERVER_LOG=%WORKSPACE_ROOT%logs\mern_server.log"

echo [1/4] Checking Node.js Environment...
where node >nul 2>nul
if errorlevel 1 (
    echo [x] Error: Node.js is not found on PATH. Please install Node.js 18+ to run the MERN stack.
    pause
    exit /b 1
)
node -v

echo [2/4] Checking Server Dependencies...
if not exist "%WORKSPACE_ROOT%server\node_modules" (
    echo [*] Installing Express server dependencies...
    cd /d "%WORKSPACE_ROOT%server"
    call npm install
    cd /d "%WORKSPACE_ROOT%"
)

echo [3/4] Checking Frontend Production Build...
if not exist "%WORKSPACE_ROOT%frontend\dist\index.html" (
    echo [*] Frontend production build not found. Building React app...
    cd /d "%WORKSPACE_ROOT%frontend"
    if not exist "node_modules" call npm install
    call npm run build
    cd /d "%WORKSPACE_ROOT%"
) else (
    echo [OK] React production build ready in frontend\dist\
)

echo [4/4] Starting MERN Server on http://127.0.0.1:5000 ...
:: Check if port 5000 is already active
set "PORT_PID="
for /f "tokens=5" %%p in ('netstat -ano -p tcp ^| findstr /R /C:":5000 .*LISTENING"') do (
    set "PORT_PID=%%p"
)

if defined PORT_PID (
    echo [*] Port 5000 is active (PID !PORT_PID!). Probing health...
    curl.exe -s -f http://127.0.0.1:5000/api/health >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] MERN Server is already running and healthy.
        goto open_browser
    )
)

echo [*] Launching Node.js Express Server...
start "InterviewCoach AI - MERN Server (Port 5000)" /min cmd /c "cd /d "%WORKSPACE_ROOT%server" && node src/server.js >> "%SERVER_LOG%" 2>&1"

:: Health check loop
set "HEALTHY=0"
for /L %%i in (1,1,20) do (
    if !HEALTHY! equ 0 (
        curl.exe -s -f http://127.0.0.1:5000/api/health >nul 2>&1
        if !errorlevel! equ 0 (
            set "HEALTHY=1"
        ) else (
            ping -n 2 127.0.0.1 >nul 2>&1
        )
    )
)

:open_browser
echo.
echo =====================================================================
echo   [SUCCESS] InterviewCoach AI (MERN Stack) is now LIVE!
echo.
echo   - Web Application: http://127.0.0.1:5000
echo   - API Health:      http://127.0.0.1:5000/api/health
echo   - Stack:           MongoDB + Express + React + Node.js
echo =====================================================================
echo.
start http://127.0.0.1:5000
pause
