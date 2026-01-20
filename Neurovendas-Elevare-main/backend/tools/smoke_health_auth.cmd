@echo off
setlocal
REM Wrapper to run PowerShell smoke script with NoProfile and bypass execution policy
set SCRIPT_DIR=%~dp0
set PS_SCRIPT=%SCRIPT_DIR%smoke_health_auth.ps1

if not exist "%PS_SCRIPT%" (
  echo Smoke script not found: %PS_SCRIPT%
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" || (
  echo PowerShell execution failed.
  exit /b 1
)

echo === Done. Check output file in backend\smoke_output.txt ===
endlocal
