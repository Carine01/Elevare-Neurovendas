# Runs backend health + beta login + me, avoiding PSReadLine crashes
param(
    [string]$HostUrl = "http://127.0.0.1:8001"
)

$ErrorActionPreference = "Stop"

# Resolve paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Resolve-Path (Join-Path $scriptDir "..\")
$runBat = Join-Path $backendDir "run_server.bat"
$outputFile = Join-Path $backendDir "smoke_output.txt"

Write-Host "Starting backend via: $runBat" -ForegroundColor Cyan
if (-not (Test-Path $runBat)) {
    throw "run_server.bat not found at $runBat"
}

# Start backend minimized in a separate cmd.exe
Start-Process -FilePath "cmd.exe" -ArgumentList "/c `"$runBat`"" -WindowStyle Minimized | Out-Null

# Wait and retry health
$maxAttempts = 5
$attempt = 0
$healthOk = $false
$healthUrl = "$HostUrl/api/health"

while (-not $healthOk -and $attempt -lt $maxAttempts) {
    $attempt += 1
    Start-Sleep -Seconds 4
    try {
        $health = Invoke-RestMethod $healthUrl -Method GET -TimeoutSec 5
        $healthOk = $true
        Write-Host "Health OK on attempt $attempt" -ForegroundColor Green
    } catch {
        Write-Host "Health attempt $attempt failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Prepare output buffer
$lines = @()
$lines += "=== Smoke Run: $(Get-Date -Format o) ==="
$lines += "Health URL: $healthUrl"
if ($healthOk) { $lines += (ConvertTo-Json $health -Depth 6) } else { $lines += "Health FAILED" }

# Beta login
$betaUrl = "$HostUrl/api/auth/mock-create-beta"
$lines += "Beta URL: $betaUrl"
try {
    $mock = Invoke-RestMethod $betaUrl -Method POST -TimeoutSec 30
    $token = $mock.access_token
    $lines += "Token: $token"
    Write-Host "Beta login OK" -ForegroundColor Green
} catch {
    $lines += "Beta login FAILED: $($_.Exception.Message)"
    Write-Host "Beta login FAILED: $($_.Exception.Message)" -ForegroundColor Red
}

# Me
$meUrl = "$HostUrl/api/auth/me"
$lines += "Me URL: $meUrl"
if ($token) {
    try {
        $me = Invoke-RestMethod $meUrl -Headers @{ Authorization = "Bearer $token" } -Method GET -TimeoutSec 15
        $lines += (ConvertTo-Json $me -Depth 8)
        Write-Host "Me OK" -ForegroundColor Green
    } catch {
        $lines += "Me FAILED: $($_.Exception.Message)"
        Write-Host "Me FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    $lines += "Me SKIPPED (no token)"
}

# Write output
$lines | Out-File -FilePath $outputFile -Encoding UTF8
Write-Host "Saved output to: $outputFile" -ForegroundColor Cyan
