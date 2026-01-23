@echo off
REM Elevare NeuroVendas - Setup Script with Gamma Features
REM This script guides you through setting up the new features

echo.
echo ============================================================
echo  🚀 ELEVARE NEUROVENDAS - SETUP COM GAMMA TEMPLATES
echo ============================================================
echo.
echo Novos recursos disponíveis:
echo   ✅ 6 Templates estilo Gamma (Gradient, Glass, Slides, etc)
echo   ✅ Geração de imagens com IA (DALL-E 3)
echo   ✅ Sugestões automáticas de imagens
echo.

REM Check if .env exists
if not exist "backend\.env" (
    echo ⚠️  ATENÇÃO: backend\.env não encontrado!
    echo Criando arquivo de configuração...
    echo.
)

REM Ask for OpenAI Key
echo ============================================================
echo CONFIGURAÇÃO OBRIGATÓRIA - CHAVE OPENAI
echo ============================================================
echo.
echo Para usar a geração de imagens com IA, você precisa de:
echo.
echo 1. Acesse: https://platform.openai.com/api-keys
echo 2. Crie uma nova API Key (ou use uma existente)
echo 3. Copie a chave
echo.
set /p openai_key="Cole sua OpenAI API Key (ou pressione Enter para pular): "

if not "%openai_key%"=="" (
    REM Update .env with OpenAI key
    powershell -Command "(Get-Content 'backend\.env') -replace 'OPENAI_API_KEY=.*', 'OPENAI_API_KEY=%openai_key%' | Set-Content 'backend\.env'"
    echo ✅ OpenAI API Key configurada!
) else (
    echo ℹ️  OpenAI não foi configurado. Você poderá fazer isso depois.
    echo   Atualize backend\.env com sua chave quando estiver pronto.
)

echo.
echo ============================================================
echo PRÓXIMOS PASSOS
echo ============================================================
echo.
echo 1. Iniciar Backend:
echo    python -m pip install -r requirements.txt
echo    python backend/server.py
echo.
echo 2. Em outro terminal, iniciar Frontend:
echo    cd frontend
echo    npm install
echo    npm start
echo.
echo 3. Abrir no navegador:
echo    http://localhost:3000
echo.
echo 4. Testar novos recursos:
echo    ✨ Blog Creator → Criar artigo → Templates (+ 6 Gamma!)
echo    🎨 Blog Creator → Artigo criado → "Geração de Imagens com IA"
echo.
echo ============================================================
echo DOCUMENTAÇÃO
echo ============================================================
echo.
echo 📖 Leia mais em:
echo    FEATURES_GAMMA.md         - Guia completo dos novos recursos
echo    TEMPLATE_GALLERY.md        - Visual reference dos templates
echo    tests/test_gamma_features.py - Script de teste
echo.
echo ============================================================
echo.
pause
