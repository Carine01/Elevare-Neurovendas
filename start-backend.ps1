# Script para iniciar o backend Elevare
Write-Host "🚀 Iniciando Elevare Backend..." -ForegroundColor Cyan

# Ativar venv
& "..\.venv\Scripts\Activate.ps1"

# Ir para pasta backend
cd backend

# Verificar se .env existe
if (-not (Test-Path ".env")) {
    Write-Host "❌ Arquivo .env não encontrado!" -ForegroundColor Red
    exit 1
}

# Subir servidor
Write-Host "✅ Subindo servidor FastAPI em http://localhost:8000" -ForegroundColor Green
Write-Host "📚 Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "" 

uvicorn server:app --reload --host 0.0.0.0 --port 8000
