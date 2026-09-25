# InterviewCoach AI - PowerShell Launcher (MERN Stack)
param (
    [switch]$Dev = $false
)

$scriptRoot = $PSScriptRoot
Set-Location $scriptRoot

$batScript = Join-Path $scriptRoot "start_app.bat"
if (Test-Path $batScript) {
    & cmd.exe /c $batScript
} else {
    Write-Host "[*] Starting MERN Express Server on http://127.0.0.1:5000..." -ForegroundColor Cyan
    Set-Location (Join-Path $scriptRoot "server")
    node src/server.js
}
