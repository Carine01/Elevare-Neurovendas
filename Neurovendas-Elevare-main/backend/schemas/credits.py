"""
Schemas de validação para endpoints de créditos.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CreditBalanceResponse(BaseModel):
    """Resposta do endpoint /credits/balance"""
    balance: float
    total_available_month: float
    total_used_month: float
    remaining_percent: float
    month_reset_date: str  # ISO format datetime

    class Config:
        from_attributes = True


class CreditCheckResponse(BaseModel):
    """Resposta do endpoint /credits/check/{action}"""
    available: bool
    required_credits: float
    current_balance: float
    error: Optional[str] = None


class CreditConsumeResponse(BaseModel):
    """Resposta do endpoint /credits/consume/{action}"""
    success: bool
    credits_consumed: float
    new_balance: float
    message: str


class CreditHistoryResponse(BaseModel):
    """Item do histórico de transações"""
    action: str
    amount: float
    balance_before: float
    balance_after: float
    reason: Optional[str]
    created_at: str  # ISO format datetime

    class Config:
        from_attributes = True
