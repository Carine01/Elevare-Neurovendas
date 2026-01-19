"""
Sistema de créditos para controle de quota de uso.
Não é monetização, é rate limiting com pool pessoal.
"""
from sqlalchemy import Column, Integer, Float, DateTime, String
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from enum import Enum

class CreditAction(str, Enum):
    """Tipos de ações que consomem créditos"""
    EBOOK_GENERATION = "ebook_generation"
    EBOOK_REGENERATION = "ebook_regeneration"
    CHAPTER_REFINEMENT = "chapter_refinement"
    PDF_EXPORT = "pdf_export"

class UserCredits:
    """
    Modelo para rastreamento de créditos por usuário.
    
    Créditos são consumidos ao:
    - Gerar e-book completo: 10 créditos
    - Regenerar capítulo: 2 créditos
    - Refinar um capítulo: 3 créditos
    - Exportar PDF: 0 créditos (grátis, já gerado)
    
    Créditos se renovam mensalmente (nunca expiram dentro do mês).
    """
    
    __tablename__ = "user_credits"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, unique=True, index=True)
    
    # Créditos disponíveis agora
    balance = Column(Float, default=0.0, nullable=False)
    
    # Histórico
    total_used_month = Column(Float, default=0.0, nullable=False)
    total_available_month = Column(Float, default=100.0, nullable=False)  # Default SaaS plan
    
    # Reset mensal
    month_reset_date = Column(DateTime, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relacionamento com transações
    transactions = relationship("CreditTransaction", back_populates="user_credits", cascade="all, delete-orphan")
    
    def __init__(self, user_id: int, monthly_quota: float = 100.0):
        self.user_id = user_id
        self.balance = monthly_quota
        self.total_available_month = monthly_quota
        self.month_reset_date = self._next_month_reset()
    
    @staticmethod
    def _next_month_reset() -> datetime:
        """Próximo dia 1º do mês às 00:00"""
        today = datetime.utcnow()
        next_month = today.replace(day=1) + timedelta(days=32)
        return next_month.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    def check_reset(self) -> bool:
        """Verifica se mês passou e reseta se necessário. Retorna True se resettou."""
        if datetime.utcnow() >= self.month_reset_date:
            self.balance = self.total_available_month
            self.total_used_month = 0.0
            self.month_reset_date = self._next_month_reset()
            return True
        return False
    
    def has_sufficient_balance(self, required: float) -> bool:
        """Verifica se usuário tem créditos suficientes"""
        self.check_reset()
        return self.balance >= required
    
    def consume(self, action: CreditAction, amount: float, metadata: dict = None) -> bool:
        """
        Consome créditos. Retorna True se sucesso, False se saldo insuficiente.
        """
        self.check_reset()
        
        if not self.has_sufficient_balance(amount):
            return False
        
        self.balance -= amount
        self.total_used_month += amount
        self.updated_at = datetime.utcnow()
        
        return True
    
    def refund(self, action: CreditAction, amount: float, reason: str = None) -> None:
        """Reembolsa créditos (ex: geração falhou)"""
        self.balance += amount
        self.total_used_month -= amount
        self.updated_at = datetime.utcnow()
    
    def get_remaining_percent(self) -> float:
        """Porcentagem de créditos restantes neste mês"""
        if self.total_available_month == 0:
            return 0.0
        return (self.balance / self.total_available_month) * 100
    
    def to_dict(self):
        """Serializa para API response"""
        self.check_reset()
        return {
            "balance": round(self.balance, 2),
            "total_available_month": round(self.total_available_month, 2),
            "total_used_month": round(self.total_used_month, 2),
            "remaining_percent": round(self.get_remaining_percent(), 1),
            "month_reset_date": self.month_reset_date.isoformat(),
        }


class CreditTransaction:
    """Auditoria de todas as transações de crédito"""
    
    __tablename__ = "credit_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_credits_id = Column(Integer, nullable=False, index=True)
    
    action = Column(String(50), nullable=False)  # CreditAction
    amount = Column(Float, nullable=False)
    balance_before = Column(Float, nullable=False)
    balance_after = Column(Float, nullable=False)
    
    metadata = Column(String(500), nullable=True)  # JSON serializado
    reason = Column(String(200), nullable=True)  # "ebook_generation", "refund", etc
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relacionamento
    user_credits = relationship("UserCredits", back_populates="transactions")
