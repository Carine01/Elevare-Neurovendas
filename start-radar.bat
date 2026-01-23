@echo off
echo ================================================
echo  INICIANDO BACKEND RADAR DE TENDENCIAS
echo ================================================
echo.

cd /d "%~dp0backend\radar-tendencias"

echo Verificando se node_modules existe...
if not exist "node_modules\" (
    echo Instalando dependencias...
    call npm install
)

echo.
echo Iniciando servidor Node.js na porta 3000...
call npm run dev

pause
