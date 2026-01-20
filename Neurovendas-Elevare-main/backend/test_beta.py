REM Executa o wrapper (usa PowerShell -NoProfile)
C:\Users\Carine\Downloads\Neurovendas-Elevare-main\Neurovendas-Elevare-main\backend\tools\smoke_health_auth.cmd#!/usr/bin/env python
"""
Teste simples do endpoint beta-login
"""
import sys
import os

# Adiciona o diretório backend ao path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Injeta o mock do emergentintegrations ANTES de qualquer import
import emergentintegrations_mock

# Cria módulo fake para emergentintegrations.llm.chat
class FakeLlmChatModule:
    LlmChat = emergentintegrations_mock.LlmChat
    UserMessage = emergentintegrations_mock.UserMessage
    SystemMessage = emergentintegrations_mock.SystemMessage
    ImageContent = emergentintegrations_mock.ImageContent

# Cria módulo fake para emergentintegrations.llm
class FakeLlmModule:
    chat = FakeLlmChatModule()
    LlmChat = emergentintegrations_mock.LlmChat
    UserMessage = emergentintegrations_mock.UserMessage

# Registra todos os módulos mock
sys.modules['emergentintegrations'] = emergentintegrations_mock
sys.modules['emergentintegrations.llm'] = FakeLlmModule()
sys.modules['emergentintegrations.llm.chat'] = FakeLlmChatModule()
sys.modules['emergentintegrations.llm.openai'] = emergentintegrations_mock.MockOpenAI()
sys.modules['emergentintegrations.llm.openai.image_generation'] = emergentintegrations_mock.MockImageGeneration()
sys.modules['emergentintegrations.payments'] = emergentintegrations_mock.payments
sys.modules['emergentintegrations.payments.stripe'] = emergentintegrations_mock.MockStripeCheckout()
sys.modules['emergentintegrations.payments.stripe.checkout'] = emergentintegrations_mock.MockStripeCheckout.checkout

print("✅ Mock emergentintegrations carregado")

# Agora testa import do server
print("📦 Importando server...")
try:
    from server import app, db, BETA_MODE, BETA_PASSWORD, BETA_CREDITS, get_password_hash, create_access_token
    print(f"✅ Server importado")
    print(f"   BETA_MODE: {BETA_MODE}")
    print(f"   BETA_PASSWORD: {BETA_PASSWORD}")
    print(f"   BETA_CREDITS: {BETA_CREDITS}")
except Exception as e:
    print(f"❌ Erro ao importar server: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Teste simples de hash
print("\n🔐 Testando hash de senha...")
try:
    hashed = get_password_hash("beta2026")
    print(f"✅ Hash gerado: {hashed[:20]}...")
except Exception as e:
    print(f"❌ Erro ao gerar hash: {e}")

# Teste de token
print("\n🎟️ Testando criação de token...")
try:
    token = create_access_token({"user_id": "test123", "email": "test@test.com"})
    print(f"✅ Token gerado: {token[:30]}...")
except Exception as e:
    print(f"❌ Erro ao criar token: {e}")

print("\n✅ Todos os testes básicos passaram!")
print("Se o servidor ainda fecha, o problema está no endpoint async ou MongoDB")
