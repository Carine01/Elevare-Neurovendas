"""
Gerenciador de sincronização com Google Calendar
Responsável por autenticação OAuth 2.0 e operações de eventos
"""
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, List
import logging
from functools import lru_cache

try:
    from google_auth_oauthlib.flow import Flow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False
    logging.warning("Google Calendar libraries not available. Install google-auth-oauthlib")

from google_calendar_config import GoogleCalendarConfig

logger = logging.getLogger(__name__)


class GoogleCalendarManager:
    """
    Gerencia autenticação OAuth e sincronização com Google Calendar
    """
    
    def __init__(self):
        if not GOOGLE_AVAILABLE:
            raise ImportError("Google libraries not installed. Run: pip install google-auth-oauthlib")
        
        self.config = GoogleCalendarConfig
        self.flow = None
    
    def get_auth_url(self, state: str) -> tuple[str, str]:
        """
        Gera URL para autenticação com Google
        
        Args:
            state: Identificador único para o usuário (user_id)
        
        Returns:
            Tuple com (auth_url, state)
        """
        try:
            flow = Flow.from_client_config(
                {
                    "installed": {
                        "client_id": self.config.GOOGLE_CLIENT_ID,
                        "client_secret": self.config.GOOGLE_CLIENT_SECRET,
                        "redirect_uris": [self.config.GOOGLE_REDIRECT_URI],
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                    }
                },
                scopes=self.config.GOOGLE_SCOPES,
                redirect_uri=self.config.GOOGLE_REDIRECT_URI,
                state=state
            )
            
            auth_url, state = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true'
            )
            
            self.flow = flow
            return auth_url, state
            
        except Exception as e:
            logger.error(f"Erro ao gerar URL de autenticação: {str(e)}")
            raise
    
    async def exchange_code_for_tokens(self, code: str, state: str) -> Dict[str, str]:
        """
        Troca código de autorização por tokens
        
        Args:
            code: Código retornado pelo Google
            state: Identificador do usuário
        
        Returns:
            Dict com access_token, refresh_token e expiry
        """
        try:
            flow = Flow.from_client_config(
                {
                    "installed": {
                        "client_id": self.config.GOOGLE_CLIENT_ID,
                        "client_secret": self.config.GOOGLE_CLIENT_SECRET,
                        "redirect_uris": [self.config.GOOGLE_REDIRECT_URI],
                    }
                },
                scopes=self.config.GOOGLE_SCOPES,
                redirect_uri=self.config.GOOGLE_REDIRECT_URI,
                state=state
            )
            
            flow.fetch_token(code=code)
            credentials = flow.credentials
            
            return {
                "access_token": credentials.token,
                "refresh_token": credentials.refresh_token or "",
                "token_expiry": credentials.expiry.isoformat() if credentials.expiry else "",
                "token_type": "Bearer"
            }
            
        except Exception as e:
            logger.error(f"Erro ao trocar código por tokens: {str(e)}")
            raise
    
    async def create_calendar_event(
        self, 
        access_token: str,
        titulo: str,
        data_agendamento: datetime,
        categoria: Optional[str] = None,
        descricao: Optional[str] = None,
        blog_post_id: Optional[str] = None,
        seo_score: Optional[float] = None
    ) -> str:
        """
        Cria evento no Google Calendar
        
        Args:
            access_token: Token de acesso do Google
            titulo: Título do post do blog
            data_agendamento: Data/hora da publicação
            categoria: Categoria do post
            descricao: Descrição do post
            blog_post_id: ID do post no Elevare
            seo_score: Score SEO do post
        
        Returns:
            ID do evento criado no Google Calendar
        """
        try:
            # Garantir que data está em UTC
            if data_agendamento.tzinfo is None:
                data_agendamento = data_agendamento.replace(tzinfo=timezone.utc)
            
            service = build('calendar', 'v3', credentials=self._get_credentials(access_token))
            
            # Calcular horário de término
            data_fim = data_agendamento + timedelta(minutes=self.config.DEFAULT_EVENT_DURATION_MINUTES)
            
            event = {
                'summary': f"📝 Publicar: {titulo}",
                'description': descricao or f"Post agendado para publicação em {data_agendamento.strftime('%d/%m/%Y %H:%M')}",
                'start': {
                    'dateTime': data_agendamento.isoformat(),
                    'timeZone': self.config.DEFAULT_TIMEZONE
                },
                'end': {
                    'dateTime': data_fim.isoformat(),
                    'timeZone': self.config.DEFAULT_TIMEZONE
                },
                'location': f"Blog Elevare - {categoria}" if categoria else "Blog Elevare",
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {
                            'method': 'email',
                            'minutes': self.config.DEFAULT_REMINDER_BEFORE_HOURS * 60
                        },
                        {
                            'method': 'popup',
                            'minutes': self.config.DEFAULT_REMINDER_BEFORE_MINUTES
                        }
                    ]
                },
                'extendedProperties': {
                    'private': {
                        'blog_post_id': blog_post_id or '',
                        'categoria': categoria or '',
                        'seo_score': str(seo_score) if seo_score else '0'
                    }
                }
            }
            
            result = service.events().insert(
                calendarId='primary',
                body=event
            ).execute()
            
            logger.info(f"Evento criado no Google Calendar: {result['id']}")
            return result['id']
            
        except Exception as e:
            logger.error(f"Erro ao criar evento no Google Calendar: {str(e)}")
            raise
    
    async def update_calendar_event(
        self,
        access_token: str,
        event_id: str,
        titulo: Optional[str] = None,
        data_agendamento: Optional[datetime] = None,
        descricao: Optional[str] = None,
        categoria: Optional[str] = None
    ) -> Dict:
        """
        Atualiza evento existente no Google Calendar
        
        Args:
            access_token: Token de acesso
            event_id: ID do evento no Google Calendar
            titulo: Novo título
            data_agendamento: Nova data/hora
            descricao: Nova descrição
            categoria: Nova categoria
        
        Returns:
            Dados do evento atualizado
        """
        try:
            service = build('calendar', 'v3', credentials=self._get_credentials(access_token))
            
            event = service.events().get(
                calendarId='primary',
                eventId=event_id
            ).execute()
            
            # Atualizar campos fornecidos
            if titulo:
                event['summary'] = f"📝 Publicar: {titulo}"
            
            if data_agendamento:
                if data_agendamento.tzinfo is None:
                    data_agendamento = data_agendamento.replace(tzinfo=timezone.utc)
                
                event['start']['dateTime'] = data_agendamento.isoformat()
                data_fim = data_agendamento + timedelta(
                    minutes=self.config.DEFAULT_EVENT_DURATION_MINUTES
                )
                event['end']['dateTime'] = data_fim.isoformat()
            
            if descricao:
                event['description'] = descricao
            
            if categoria:
                event['location'] = f"Blog Elevare - {categoria}"
            
            result = service.events().update(
                calendarId='primary',
                eventId=event_id,
                body=event
            ).execute()
            
            logger.info(f"Evento atualizado no Google Calendar: {event_id}")
            return result
            
        except Exception as e:
            logger.error(f"Erro ao atualizar evento no Google Calendar: {str(e)}")
            raise
    
    async def delete_calendar_event(self, access_token: str, event_id: str) -> bool:
        """
        Deleta evento do Google Calendar
        
        Args:
            access_token: Token de acesso
            event_id: ID do evento
        
        Returns:
            True se deletado com sucesso
        """
        try:
            service = build('calendar', 'v3', credentials=self._get_credentials(access_token))
            
            service.events().delete(
                calendarId='primary',
                eventId=event_id
            ).execute()
            
            logger.info(f"Evento deletado do Google Calendar: {event_id}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao deletar evento do Google Calendar: {str(e)}")
            raise
    
    async def list_calendar_events(
        self,
        access_token: str,
        max_results: int = 10
    ) -> List[Dict]:
        """
        Lista próximos eventos do calendário
        
        Args:
            access_token: Token de acesso
            max_results: Número máximo de resultados
        
        Returns:
            Lista de eventos
        """
        try:
            service = build('calendar', 'v3', credentials=self._get_credentials(access_token))
            
            now = datetime.now(timezone.utc).isoformat()
            
            events_result = service.events().list(
                calendarId='primary',
                timeMin=now,
                maxResults=max_results,
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            return events
            
        except Exception as e:
            logger.error(f"Erro ao listar eventos do Google Calendar: {str(e)}")
            raise
    
    def refresh_token(self, refresh_token: str) -> Dict[str, str]:
        """
        Renova um token expirado
        
        Args:
            refresh_token: Token de refresh
        
        Returns:
            Novo access token
        """
        try:
            from google.auth.transport.requests import Request as GoogleRequest
            from google.oauth2.credentials import Credentials
            
            credentials = Credentials(
                token=None,
                refresh_token=refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=self.config.GOOGLE_CLIENT_ID,
                client_secret=self.config.GOOGLE_CLIENT_SECRET
            )
            
            credentials.refresh(GoogleRequest())
            
            return {
                "access_token": credentials.token,
                "token_expiry": credentials.expiry.isoformat() if credentials.expiry else ""
            }
            
        except Exception as e:
            logger.error(f"Erro ao renovar token: {str(e)}")
            raise
    
    def _get_credentials(self, access_token: str):
        """
        Cria objeto de credentials a partir do access token
        
        Args:
            access_token: Token de acesso
        
        Returns:
            Objeto de credentials
        """
        from google.oauth2.credentials import Credentials
        
        return Credentials(token=access_token)
