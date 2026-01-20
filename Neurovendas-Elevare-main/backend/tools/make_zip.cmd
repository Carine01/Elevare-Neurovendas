@echo off
setlocal
REM Wrapper to zip the app using PowerShell without profile
set SCRIPT_DIR=%~dp0
set PS_SCRIPT=%SCRIPT_DIR%make_zip.ps1

if not exist "%PS_SCRIPT%" (
  echo Zip script not found: %PS_SCRIPT%
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%PS_SCRIPT%" || (
  echo PowerShell zip failed.
  exit /b 1
)

echo === ZIP gerado (veja o arquivo .zip na pasta pai) ===
endlocal
