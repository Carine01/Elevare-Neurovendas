# Mock temporário para emergentintegrations até o pacote real estar disponível
import os
from typing import List, Dict, Any, Optional

class UserMessage:
    """Mock de UserMessage para LLM"""
    def __init__(self, content: str):
        self.content = content
        
class SystemMessage:
    """Mock de SystemMessage para LLM"""
    def __init__(self, content: str):
        self.content = content

class ImageContent:
    """Mock de ImageContent para LLM com imagens"""
    def __init__(self, url: str = None, image_data: bytes = None):
        self.url = url
        self.image_data = image_data

class LlmChat:
    """Mock de LlmChat que usa OpenAI ou Gemini via API direta"""
    def __init__(self, model: str = "gemini/gemini-2.0-flash-exp"):
        self.model = model
        
    async def chat_async(self, messages: List[Any]) -> Any:
        """Chama API de IA baseado no modelo configurado"""
        # Para teste sem IA configurada, retorna resposta mock
        if not os.getenv("GEMINI_API_KEY") and not os.getenv("OPENAI_API_KEY") and not os.getenv("EMERGENT_LLM_KEY"):
            return self._mock_response(messages)
        
        # Extrai conteúdo das mensagens
        prompt_parts = []
        for msg in messages:
            if hasattr(msg, 'content'):
                prompt_parts.append(msg.content)
        
        full_prompt = "\n".join(prompt_parts)
        
        # Determina qual API usar
        if "gemini" in self.model.lower() and os.getenv("GEMINI_API_KEY"):
            return await self._call_gemini(full_prompt)
        elif ("gpt" in self.model.lower() or "openai" in self.model.lower()) and os.getenv("OPENAI_API_KEY"):
            return await self._call_openai(full_prompt)
        else:
            # Fallback para mock se nenhuma chave configurada
            return self._mock_response(messages)
    
    def _mock_response(self, messages):
        """Retorna resposta mock para teste sem IA"""
        class Response:
            def __init__(self):
                self.content = """Este é um conteúdo de teste gerado pelo mock do sistema de IA.

Em um ambiente de produção, este conteúdo seria gerado por Gemini ou GPT-4 baseado na sua marca e estilo de comunicação.

Configure GEMINI_API_KEY ou OPENAI_API_KEY no arquivo .env para habilitar a geração real de conteúdo."""
                
        return Response()
    
    async def _call_gemini(self, prompt: str):
        """Chama Gemini API"""
        try:
            import google.generativeai as genai
            
            api_key = os.getenv("GEMINI_API_KEY") or os.getenv("EMERGENT_LLM_KEY")
            genai.configure(api_key=api_key)
            
            model = genai.GenerativeModel('gemini-2.0-flash-exp')
            response = await model.generate_content_async(prompt)
            
            class Response:
                def __init__(self, content):
                    self.content = content
                    
            return Response(response.text)
        except Exception as e:
            print(f"Erro ao chamar Gemini: {e}")
            return self._mock_response([])
    
    async def _call_openai(self, prompt: str):
        """Chama OpenAI API"""
        try:
            from openai import AsyncOpenAI
            
            client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            
            response = await client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            
            class Response:
                def __init__(self, content):
                    self.content = content
                    
            return Response(response.choices[0].message.content)
        except Exception as e:
            print(f"Erro ao chamar OpenAI: {e}")
            return self._mock_response([])

# Mock para geração de imagens
class OpenAIImageGeneration:
    """Mock de OpenAIImageGeneration"""
    async def generate(self, prompt: str, **kwargs):
        """Retorna URL de placeholder"""
        class ImageResponse:
            def __init__(self):
                self.url = "https://via.placeholder.com/1024x1024?text=Mock+Image"
        return ImageResponse()

# Mock para Stripe
class CheckoutSessionRequest:
    pass

class CheckoutSessionResponse:
    pass

class CheckoutStatusResponse:
    pass

class StripeCheckout:
    """Mock de StripeCheckout"""
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    async def create_session(self, request):
        return {"url": "https://checkout.stripe.com/test", "id": "test-session"}
    
    async def get_session_status(self, session_id: str):
        return {"status": "complete", "payment_status": "paid"}

# Estrutura de módulos mock
class MockChat:
    LlmChat = LlmChat
    UserMessage = UserMessage
    SystemMessage = SystemMessage
    ImageContent = ImageContent

class MockOpenAI:
    LlmChat = LlmChat
    UserMessage = UserMessage
    SystemMessage = SystemMessage
    
class MockImageGeneration:
    OpenAIImageGeneration = OpenAIImageGeneration

class MockLlm:
    chat = MockChat()
    openai = MockOpenAI()
    
class MockOpenAIModule:
    image_generation = MockImageGeneration()

class MockStripeCheckout:
    checkout = type('checkout', (), {
        'StripeCheckout': StripeCheckout,
        'CheckoutSessionRequest': CheckoutSessionRequest,
        'CheckoutSessionResponse': CheckoutSessionResponse,
        'CheckoutStatusResponse': CheckoutStatusResponse
    })()

class MockPayments:
    stripe = MockStripeCheckout()

class MockEmergentIntegrations:
    """Mock do módulo emergentintegrations"""
    llm = MockLlm()
    payments = MockPayments()

# Exporta módulos para importação
llm = MockLlm()
payments = MockPayments()
