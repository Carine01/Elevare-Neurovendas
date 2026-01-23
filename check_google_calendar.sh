#!/bin/bash

# Verificar Google Calendar Integration Setup
echo "🔍 Verificando Google Calendar Integration..."
echo "========================================"
echo ""

# Verificar arquivos criados
echo "✅ Verificando arquivos..."
files=(
    "backend/google_calendar_config.py"
    "backend/google_calendar_manager.py"
    "frontend/src/GoogleCalendarSync.js"
    "GOOGLE_CALENDAR_SETUP.md"
    "GOOGLE_CALENDAR_INTEGRATION.md"
    "backend/.env.example"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file"
    fi
done

echo ""
echo "✅ Verificando requirements.txt..."
if grep -q "google-auth-oauthlib" backend/requirements.txt; then
    echo "  ✅ google-auth-oauthlib está em requirements.txt"
else
    echo "  ❌ google-auth-oauthlib NÃO está em requirements.txt"
fi

echo ""
echo "========================================"
echo "📋 Próximos Passos:"
echo "1. Configure variáveis em backend/.env:"
echo "   - GOOGLE_CLIENT_ID"
echo "   - GOOGLE_CLIENT_SECRET"
echo "   - GOOGLE_REDIRECT_URI"
echo "   - ENCRYPTION_KEY"
echo ""
echo "2. Instale dependências:"
echo "   pip install -r backend/requirements.txt"
echo ""
echo "3. Inicie o servidor:"
echo "   cd backend && python -m uvicorn server:app --reload"
echo ""
echo "4. Importe o componente React no seu App.js"
echo ""
echo "📖 Para mais informações, consulte GOOGLE_CALENDAR_SETUP.md"
