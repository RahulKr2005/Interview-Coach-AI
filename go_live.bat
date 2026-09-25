@echo off
setlocal enabledelayedexpansion
title InterviewCoach AI - Go Live
color 0b

echo =====================================================================
echo                InterviewCoach AI - Go Live Launcher
echo =====================================================================
echo.

:: 1. Handle directory and paths (safe for spaces)
set "WORKSPACE_ROOT=%~dp0"
cd /d "%WORKSPACE_ROOT%"

:: Ensure logs directory exists
if not exist "%WORKSPACE_ROOT%logs" mkdir "%WORKSPACE_ROOT%logs"
set "BACKEND_LOG=%WORKSPACE_ROOT%logs\backend.log"
set "FRONTEND_LOG=%WORKSPACE_ROOT%logs\frontend.log"

:: Check for optional dev mode flag (--dev)
set "DEV_MODE=0"
if "%~1"=="--dev" set "DEV_MODE=1"
if "%~1"=="-d" set "DEV_MODE=1"

echo [1/5] Checking Python Virtual Environment...
set "PYTHON_EXE=%WORKSPACE_ROOT%venv\Scripts\python.exe"
if not exist "%PYTHON_EXE%" (
    echo [!] Virtual environment not detected at .\venv\
    echo [*] Creating virtual environment...
    python -m venv "%WORKSPACE_ROOT%venv"
    if errorlevel 1 (
        echo [x] Error: Failed to create virtual environment. Ensure Python 3.11+ is installed.
        pause
        exit /b 1
    )
    echo [*] Installing backend dependencies...
    "%PYTHON_EXE%" -m pip install --upgrade pip
    "%PYTHON_EXE%" -m pip install -r "%WORKSPACE_ROOT%backend\requirements.txt"
    if errorlevel 1 (
        echo [x] Error installing dependencies.
        pause
        exit /b 1
    )
)

echo [2/5] Checking Frontend Production Build...
if not exist "%WORKSPACE_ROOT%frontend\dist\index.html" (
    echo [*] Frontend production build not found. Building React app...
    where npm >nul 2>nul
    if !errorlevel! equ 0 (
        cd /d "%WORKSPACE_ROOT%frontend"
        if not exist "node_modules" (
            echo [*] Installing frontend dependencies...
            call npm install
        )
        echo [*] Running npm run build...
        call npm run build
        cd /d "%WORKSPACE_ROOT%"
    ) else (
        echo [!] Warning: npm not found on PATH. Frontend build could not be compiled.
    )
) else (
    echo [OK] Frontend production build detected at frontend\dist\
)

echo [3/5] Checking Port Conflicts...
:: Check if port 8000 is listening
set "EXISTING_PID="
for /f "tokens=5" %%p in ('netstat -ano -p tcp ^| findstr /R /C:":8000 .*LISTENING"') do (
    set "EXISTING_PID=%%p"
)

set "BACKEND_ALREADY_RUNNING=0"
if defined EXISTING_PID (
    echo [*] Port 8000 is currently occupied by PID !EXISTING_PID!.
    echo [*] Probing if it is an existing InterviewCoach AI backend...
    curl.exe -s -f http://127.0.0.1:8000/api/health >nul 2>&1
    if !errorlevel! equ 0 (
        echo [OK] InterviewCoach AI Backend is already running and healthy on port 8000.
        set "BACKEND_ALREADY_RUNNING=1"
    ) else (
        echo [x] Port 8000 is occupied by an unrelated or unresponsive process - PID: !EXISTING_PID!
        echo     Process details:
        tasklist /fi "PID eq !EXISTING_PID!" /fo table /nh
        echo.
        echo [x] Cannot start FastAPI backend on port 8000 without conflict.
        echo     Please terminate the conflicting process or change BACKEND_PORT in .env.
        pause
        exit /b 1
    )
)

echo [4/5] Starting Backend Server...
if !BACKEND_ALREADY_RUNNING! equ 0 (
    echo [*] Launching FastAPI Backend on http://127.0.0.1:8000 ...
    echo --- Backend Startup: %DATE% %TIME% --- > "%BACKEND_LOG%"
    start "InterviewCoach AI - Backend (Port 8000)" /min cmd /c ""%PYTHON_EXE%" "%WORKSPACE_ROOT%backend\app\main.py" >> "%BACKEND_LOG%" 2>&1"
)

:: Optional Dev Mode for Vite
if !DEV_MODE! equ 1 (
    echo [*] Optional Dev Mode enabled: Starting Vite on http://127.0.0.1:5173 ...
    echo --- Frontend Startup: %DATE% %TIME% --- > "%FRONTEND_LOG%"
    start "InterviewCoach AI - Vite Dev (Port 5173)" /min cmd /c "cd /d "%WORKSPACE_ROOT%frontend" && npm run dev >> "%FRONTEND_LOG%" 2>&1"
)

echo [5/5] Waiting for Application to be ready...
set "IS_HEALTHY=0"
for /L %%i in (1,1,25) do (
    if !IS_HEALTHY! equ 0 (
        curl.exe -s -f http://127.0.0.1:8000/api/health >nul 2>&1
        if !errorlevel! equ 0 (
            set "IS_HEALTHY=1"
        ) else (
            ping -n 2 127.0.0.1 >nul 2>&1
        )
    )
)

if !IS_HEALTHY! equ 0 (
    echo.
    echo =====================================================================
    echo [x] ERROR: FastAPI Backend failed to start or pass health check.
    echo     Startup log location: %BACKEND_LOG%
    echo ---------------------------------------------------------------------
    echo Recent Backend Log Entries:
    if exist "%BACKEND_LOG%" (
        type "%BACKEND_LOG%"
    ) else (
        echo [No log file generated]
    )
    echo =====================================================================
    pause
    exit /b 1
)

echo.
echo [OK] InterviewCoach AI Backend is healthy and ready!

:: Launch Browser to Standalone Port 8000 (or Dev Server if dev mode requested)
if !DEV_MODE! equ 1 (
    echo [*] Opening Vite Dev Server at http://127.0.0.1:5173 ...
    start http://127.0.0.1:5173
) else (
    echo [*] Opening Standalone Application at http://127.0.0.1:8000 ...
    start http://127.0.0.1:8000
)

echo.
echo =====================================================================
echo   [SUCCESS] InterviewCoach AI is now LIVE!
echo.
echo   - Web Application:  http://127.0.0.1:8000 (Standalone Production)
if !DEV_MODE! equ 1 echo   - Vite Dev Server:  http://127.0.0.1:5173 (Dev Mode)
echo   - Backend API Docs: http://127.0.0.1:8000/docs
echo   - Storage:          Local SQLite Database (100%% offline)
echo   - Startup Log:      %BACKEND_LOG%
echo =====================================================================
echo.
echo Leave background service windows running while using the app.
echo Press any key to close this launcher console.
pause >nul
