#!/usr/bin/env python
"""
Script de inicialização que injeta o mock do emergentintegrations antes de importar o servidor
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

print("[OK] Mock emergentintegrations carregado com sucesso!")
print("[INFO] Configure GEMINI_API_KEY ou OPENAI_API_KEY no .env para habilitar IA real")
print("")

# Agora importa e inicia o servidor
from server import app
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run(
        "server:app",
        host=host,
        port=port,
        reload=False,
        log_level="info"
    )
