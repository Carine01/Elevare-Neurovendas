@echo off
setlocal
REM Wrapper to build frontend using PowerShell without profile
set SCRIPT_DIR=%~dp0
set PS_SCRIPT=%SCRIPT_DIR%build_frontend.ps1

if not exist "%PS_SCRIPT%" (
  echo Build script not found: %PS_SCRIPT%
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" || (
  echo Frontend build failed.
  exit /b 1
)

echo === Build concluido. Veja a pasta dist ===
endlocal
