@echo off
echo ================================================
echo  ELEVARE NEUROVENDAS - INICIANDO TODOS SERVIDORES
echo ================================================
echo.

REM Definir diretório base
set BASE_DIR=%~dp0

echo [1/4] Ativando ambiente Python...
call "%BASE_DIR%.venv\Scripts\activate.bat"

echo.
echo [2/4] Iniciando Backend Python (FastAPI - Porta 8000)...
start "Backend Python" cmd /k "cd /d "%BASE_DIR%backend" && python -m uvicorn server:app --reload --port 8000"
timeout /t 3 >nul

echo.
echo [3/4] Iniciando Backend Radar (Node.js - Porta 3000)...
start "Backend Radar" cmd /k "cd /d "%BASE_DIR%backend\radar-tendencias" && npm run dev"
timeout /t 3 >nul

echo.
echo [4/4] Iniciando Frontend (React - Porta 3001)...
start "Frontend React" cmd /k "cd /d "%BASE_DIR%frontend" && set REACT_APP_BACKEND_URL=http://localhost:8000 && set REACT_APP_RADAR_URL=http://localhost:3000 && set PORT=3001 && npm start"

echo.
echo ================================================
echo  TODOS OS SERVIDORES INICIADOS!
echo ================================================
echo.
echo  - Backend Python:  http://localhost:8000/api
echo  - Backend Radar:   http://localhost:3000/health
echo  - Frontend React:  http://localhost:3001
echo.
echo  Aguarde alguns segundos para os servidores iniciarem...
echo  Pressione qualquer tecla para sair deste terminal
echo  (Os servidores continuarão rodando nas janelas abertas)
echo ================================================
pause
