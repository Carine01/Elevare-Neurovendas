# Mock de emergentintegrations.llm
import sys
import os

# Adicionar o caminho correto
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

try:
    from emergentintegrations_mock import (
        UserMessage,
        SystemMessage,
        ImageContent,
        LlmChat,
    )
except ImportError:
    # Fallback classes
    class UserMessage:
        def __init__(self, content: str):
            self.content = content
    
    class SystemMessage:
        def __init__(self, content: str):
            self.content = content
    
    class ImageContent:
        def __init__(self, url: str = None, image_data: bytes = None):
            self.url = url
            self.image_data = image_data
    
    class LlmChat:
        def __init__(self, model: str = "gemini/gemini-2.0-flash-exp"):
            self.model = model
        
        async def chat_async(self, messages):
            return type('obj', (object,), {'content': 'Mock response'})()

class chat:
    UserMessage = UserMessage
    SystemMessage = SystemMessage
    ImageContent = ImageContent
    LlmChat = LlmChat

__all__ = ["chat", "UserMessage", "SystemMessage", "ImageContent", "LlmChat"]
