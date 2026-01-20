@echo off
REM NeuroVendas - Inicialização rápida do backend (Windows)
REM Este script evita problemas do PSReadLine iniciando em processo separado

setlocal ENABLEDELAYEDEXPANSION
cd /d "%~dp0"

REM Configuração de ambiente (ajuste conforme necessário)
if not defined HOST set HOST=127.0.0.1
if not defined PORT set PORT=8001
if not defined JWT_SECRET set JWT_SECRET=dev-secret
if not defined EMERGENT_LLM_KEY set EMERGENT_LLM_KEY=test-key

REM Verifica venv
set VENV_PY=C:\Users\Carine\Downloads\Neurovendas-Elevare-main\.venv\Scripts\python.exe
if not exist "%VENV_PY%" (
	echo [WARN] Venv nao encontrado em %VENV_PY% . Usando python do sistema.
	set VENV_PY=python
)

echo [INFO] Iniciando backend em !HOST!:!PORT!
start "NeuroVendas Backend" "%VENV_PY%" start_server.py
echo [INFO] Processo iniciado. Pressione qualquer tecla para sair desta janela.
pause >nul
