@echo off
cd /d "C:\Users\Carine\Downloads\Elevare-Neurovendas-main (6)\Elevare-Neurovendas-main\frontend"

echo Instalando dependências do frontend...
npm install --quiet

echo Iniciando React app...
set REACT_APP_BACKEND_URL=http://localhost:8000
npm start
