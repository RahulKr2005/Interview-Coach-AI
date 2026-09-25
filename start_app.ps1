# Forward to go_live.ps1 with any arguments
param (
    [switch]$Dev = $false
)
$script = Join-Path $PSScriptRoot "go_live.ps1"
if ($Dev) {
    & $script -Dev
} else {
    & $script
}
