"""
Configuração do Google Calendar para sincronização de posts
"""
import os
from typing import List

class GoogleCalendarConfig:
    """Configuração centralizada para Google Calendar"""
    
    # Credenciais OAuth
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI = os.getenv(
        "GOOGLE_REDIRECT_URI", 
        "http://localhost:3000/auth/google/callback"
    )
    
    # Escopos solicitados ao Google
    GOOGLE_SCOPES: List[str] = [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events"
    ]
    
    # Configurações de evento
    DEFAULT_EVENT_DURATION_MINUTES = 30
    DEFAULT_REMINDER_BEFORE_HOURS = 24  # Dia antes
    DEFAULT_REMINDER_BEFORE_MINUTES = 15  # 15 minutos antes
    
    # Timezone padrão
    DEFAULT_TIMEZONE = "America/Sao_Paulo"
    
    # Validações
    @classmethod
    def validate(cls) -> bool:
        """Valida se as credenciais estão configuradas"""
        if not cls.GOOGLE_CLIENT_ID or not cls.GOOGLE_CLIENT_SECRET:
            raise ValueError(
                "Google Calendar não está configurado. "
                "Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env"
            )
        return True
    
    @classmethod
    def is_configured(cls) -> bool:
        """Verifica se Google Calendar está configurado"""
        return bool(cls.GOOGLE_CLIENT_ID and cls.GOOGLE_CLIENT_SECRET)
