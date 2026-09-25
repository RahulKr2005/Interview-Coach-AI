# InterviewCoach AI - PowerShell Go Live Launcher
param (
    [switch]$Dev = $false
)

$ErrorActionPreference = "Continue"

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "               InterviewCoach AI - Go Live Launcher                  " -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RootDir

$LogsDir = Join-Path $RootDir "logs"
if (-not (Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir -Force | Out-Null
}
$BackendLog = Join-Path $LogsDir "backend.log"
$FrontendLog = Join-Path $LogsDir "frontend.log"

# 1. Check Python Venv
Write-Host "[1/5] Checking Python virtual environment..." -ForegroundColor Yellow
$PythonExe = Join-Path $RootDir "venv\Scripts\python.exe"

if (-not (Test-Path $PythonExe)) {
    Write-Host "Creating virtual environment..." -ForegroundColor White
    python -m venv (Join-Path $RootDir "venv")
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[x] Error creating Python virtual environment." -ForegroundColor Red
        return
    }
    Write-Host "Installing backend dependencies..." -ForegroundColor White
    & $PythonExe -m pip install --upgrade pip
    & $PythonExe -m pip install -r (Join-Path $RootDir "backend\requirements.txt")
}

# 2. Check Frontend Production Build
Write-Host "[2/5] Checking Frontend production build..." -ForegroundColor Yellow
$FrontendDistIndex = Join-Path $RootDir "frontend\dist\index.html"
if (-not (Test-Path $FrontendDistIndex)) {
    Write-Host "Frontend build not detected. Building React application..." -ForegroundColor White
    $NpmCmd = Get-Command npm -ErrorAction SilentlyContinue
    if ($NpmCmd) {
        $FrontendDir = Join-Path $RootDir "frontend"
        if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
            Push-Location $FrontendDir
            npm install
            Pop-Location
        }
        Push-Location $FrontendDir
        npm run build
        Pop-Location
    } else {
        Write-Host "[!] Warning: npm not found on PATH. Frontend build skipped." -ForegroundColor Yellow
    }
} else {
    Write-Host "[OK] Frontend build detected at frontend\dist\" -ForegroundColor Green
}

# 3. Port Conflict Detection for Port 8000
Write-Host "[3/5] Checking port 8000 availability..." -ForegroundColor Yellow
$Port8000Used = $false
$ExistingPid = $null

$TcpConnections = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
if ($TcpConnections) {
    $ExistingPid = $TcpConnections[0].OwningProcess
    $Port8000Used = $true
}

$BackendAlreadyRunning = $false
if ($Port8000Used) {
    Write-Host "[*] Port 8000 is occupied by PID $ExistingPid. Probing health endpoint..." -ForegroundColor Cyan
    try {
        $health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health" -TimeoutSec 2 -ErrorAction Stop
        if ($health.status -eq "healthy") {
            Write-Host "[OK] InterviewCoach AI Backend is already running and healthy!" -ForegroundColor Green
            $BackendAlreadyRunning = $true
        } else {
            Write-Host "[!] Port 8000 responded with non-healthy status." -ForegroundColor Red
            return
        }
    } catch {
        $proc = Get-Process -Id $ExistingPid -ErrorAction SilentlyContinue
        $procName = if ($proc) { $proc.ProcessName } else { "Unknown" }
        Write-Host "[x] Port 8000 is occupied by unrelated process: $procName (PID $ExistingPid)" -ForegroundColor Red
        Write-Host "    Please terminate that application or configure BACKEND_PORT in .env." -ForegroundColor Yellow
        return
    }
}

# 4. Start Backend Server
Write-Host "[4/5] Starting Backend Server..." -ForegroundColor Yellow
if (-not $BackendAlreadyRunning) {
    "--- Backend Startup: $(Get-Date) ---" | Out-File -FilePath $BackendLog -Encoding utf8
    $MainScript = Join-Path $RootDir "backend\app\main.py"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c `"`"$PythonExe`" `"$MainScript`" >> `"$BackendLog`" 2>&1`"" -WindowStyle Minimized
}

if ($Dev) {
    Write-Host "[*] Dev mode enabled: Starting Vite on http://127.0.0.1:5173 ..." -ForegroundColor White
    $FrontendDir = Join-Path $RootDir "frontend"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$FrontendDir`" && npm run dev >> `"$FrontendLog`" 2>&1" -WindowStyle Minimized
}

# 5. Wait for Backend Health
Write-Host "[5/5] Waiting for Application to become ready..." -ForegroundColor Yellow
$isHealthy = $false
for ($i = 0; $i -lt 20; $i++) {
    try {
        $res = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health" -TimeoutSec 1 -ErrorAction Stop
        if ($res.status -eq "healthy") {
            $isHealthy = $true
            break
        }
    } catch {
        Start-Sleep -Seconds 1
    }
}

if (-not $isHealthy) {
    Write-Host ""
    Write-Host "=====================================================================" -ForegroundColor Red
    Write-Host "[x] ERROR: FastAPI Backend failed to start or pass health check." -ForegroundColor Red
    Write-Host "    Startup log: $BackendLog" -ForegroundColor Yellow
    if (Test-Path $BackendLog) {
        Write-Host "Recent Log Entries:" -ForegroundColor White
        Get-Content $BackendLog -Tail 15
    }
    Write-Host "=====================================================================" -ForegroundColor Red
    return
}

Write-Host "[OK] Backend is healthy and ready!" -ForegroundColor Green

if ($Dev) {
    Write-Host "Opening Dev Server at http://127.0.0.1:5173 ..." -ForegroundColor Green
    Start-Process "http://127.0.0.1:5173"
} else {
    Write-Host "Opening Standalone Application at http://127.0.0.1:8000 ..." -ForegroundColor Green
    Start-Process "http://127.0.0.1:8000"
}

Write-Host ""
Write-Host "=====================================================================" -ForegroundColor Green
Write-Host "  [SUCCESS] InterviewCoach AI is now LIVE!" -ForegroundColor Green
Write-Host "  - Web Application:  http://127.0.0.1:8000 (Standalone Production)" -ForegroundColor Green
if ($Dev) {
    Write-Host "  - Vite Dev Server:  http://127.0.0.1:5173 (Dev Mode)" -ForegroundColor Green
}
Write-Host "  - Backend API Docs: http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host "  - Storage:          Local SQLite Database (100% offline)" -ForegroundColor Green
Write-Host "  - Startup Log:      $BackendLog" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Green
