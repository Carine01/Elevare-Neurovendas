@echo off
cd /d "C:\Users\Carine\Downloads\Elevare-Neurovendas-main (6)\Elevare-Neurovendas-main\backend"

REM Criar e ativar venv
if not exist venv (
    echo Criando ambiente virtual...
    python -m venv venv
)

echo Ativando venv...
call venv\Scripts\activate.bat

echo Instalando dependências...
python -m pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet

echo Iniciando servidor FastAPI...
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
