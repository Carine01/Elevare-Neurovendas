# Mock de emergentintegrations.payments.stripe.checkout
from typing import Optional, Dict, Any


class CheckoutSessionRequest:
    def __init__(self, amount: int, currency: str, success_url: str, cancel_url: str, metadata: Optional[Dict[str, Any]] = None):
        self.amount = amount
        self.currency = currency
        self.success_url = success_url
        self.cancel_url = cancel_url
        self.metadata = metadata or {}


class CheckoutSessionResponse:
    def __init__(self, session_id: str, url: str):
        self.session_id = session_id
        self.url = url


class CheckoutStatusResponse:
    def __init__(self, status: str, payment_status: str):
        self.status = status
        self.payment_status = payment_status


class WebhookResponse:
    def __init__(self, session_id: str, payment_status: str):
        self.session_id = session_id
        self.payment_status = payment_status


class StripeCheckout:
    def __init__(self, api_key: Optional[str] = None, webhook_url: str = "", webhook_secret: Optional[str] = None):
        self.api_key = api_key
        self.webhook_url = webhook_url
        self.webhook_secret = webhook_secret

    async def create_checkout_session(self, request: CheckoutSessionRequest) -> CheckoutSessionResponse:
        # Retorna sessão mockada
        return CheckoutSessionResponse(session_id="mock_session", url="https://mock-stripe.url/checkout/mock_session")

    async def get_checkout_status(self, session_id: str) -> CheckoutStatusResponse:
        # Retorna status mockado (pendente por padrão)
        return CheckoutStatusResponse(status="pending", payment_status="unpaid")

    async def handle_webhook(self, body: bytes, signature: str) -> WebhookResponse:
        # Retorna resposta mockada
        return WebhookResponse(session_id="mock_session", payment_status="paid")

async def create_checkout(**kwargs) -> CheckoutSessionResponse:
    """Função compatível com import antigo; retorna sessão mockada."""
    return CheckoutSessionResponse(session_id="mock_session", url="https://mock-stripe.url/checkout/mock_session")

__all__ = [
    "StripeCheckout",
    "CheckoutSessionRequest",
    "CheckoutSessionResponse",
    "CheckoutStatusResponse",
    "create_checkout",
]
