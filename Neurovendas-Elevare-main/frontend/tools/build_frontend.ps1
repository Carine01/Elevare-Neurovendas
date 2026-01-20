param(
    [string]$ProjectDir
)

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not $ProjectDir) {
    $ProjectDir = Resolve-Path (Join-Path $scriptDir "..\")
}

Write-Host "Frontend dir: $ProjectDir" -ForegroundColor Cyan

Push-Location $ProjectDir
try {
    Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "Building frontend..." -ForegroundColor Yellow
    npm run build
    Write-Host "Build finished. Output in: $(Join-Path $ProjectDir 'dist')" -ForegroundColor Green
} finally {
    Pop-Location
}
