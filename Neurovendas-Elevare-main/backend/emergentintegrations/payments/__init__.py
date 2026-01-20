# Mock de emergentintegrations.payments
import os

class StripePayment:
    """Mock de Stripe"""
    def __init__(self):
        self.api_key = os.getenv("STRIPE_API_KEY", "test_key")
    
    async def create_checkout(self, **kwargs):
        return {"session_id": "mock_session", "url": "https://mock-stripe.url"}

class stripe:
    """Mock de stripe integration"""
    @staticmethod
    def create_checkout(**kwargs):
        return {"session_id": "mock_session", "url": "https://mock-stripe.url"}

__all__ = ["StripePayment", "stripe"]
