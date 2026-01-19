"""
Endpoints de créditos: verificar saldo, histórico, etc.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from models.credits import UserCredits, CreditTransaction, CreditAction
from schemas.credits import CreditBalanceResponse, CreditHistoryResponse
from utils.dependencies import get_current_user, get_db

router = APIRouter(prefix="/api/credits", tags=["credits"])

CREDIT_COSTS = {
    CreditAction.EBOOK_GENERATION: 10.0,
    CreditAction.EBOOK_REGENERATION: 10.0,
    CreditAction.CHAPTER_REFINEMENT: 3.0,
    CreditAction.PDF_EXPORT: 0.0,  # Grátis
}

@router.get("/balance", response_model=CreditBalanceResponse)
def get_credit_balance(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retorna saldo de créditos do usuário atual.
    
    Response:
    {
        "balance": 87.0,
        "total_available_month": 100.0,
        "total_used_month": 13.0,
        "remaining_percent": 87.0,
        "month_reset_date": "2026-02-01T00:00:00"
    }
    """
    credits = db.query(UserCredits).filter_by(user_id=current_user.id).first()
    
    if not credits:
        # Criar se não existir
        credits = UserCredits(user_id=current_user.id)
        db.add(credits)
        db.commit()
        db.refresh(credits)
    
    return credits.to_dict()


@router.post("/check/{action}")
def check_credit_availability(
    action: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Verifica se usuário tem créditos para uma ação.
    
    Parâmetros:
    - action: "ebook_generation", "chapter_refinement", etc
    
    Response:
    {
        "available": true,
        "required_credits": 10.0,
        "current_balance": 87.0,
        "error": null
    }
    """
    try:
        action_enum = CreditAction(action)
        required = CREDIT_COSTS.get(action_enum, 10.0)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ação inválida: {action}"
        )
    
    credits = db.query(UserCredits).filter_by(user_id=current_user.id).first()
    if not credits:
        credits = UserCredits(user_id=current_user.id)
        db.add(credits)
        db.commit()
        db.refresh(credits)
    
    available = credits.has_sufficient_balance(required)
    
    return {
        "available": available,
        "required_credits": required,
        "current_balance": round(credits.balance, 2),
        "error": "Créditos insuficientes" if not available else None,
    }


@router.post("/consume/{action}")
def consume_credits(
    action: str,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Consome créditos para uma ação. Chamada internamente após sucesso de geração.
    
    Retorna:
    - 200: Créditos debitados com sucesso
    - 402: Créditos insuficientes
    """
    try:
        action_enum = CreditAction(action)
        required = CREDIT_COSTS.get(action_enum, 10.0)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ação inválida: {action}"
        )
    
    credits = db.query(UserCredits).filter_by(user_id=current_user.id).first()
    if not credits:
        credits = UserCredits(user_id=current_user.id)
        db.add(credits)
        db.commit()
    
    if not credits.consume(action_enum, required):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Créditos insuficientes. Necessário: {required}, Disponível: {credits.balance}"
        )
    
    # Log da transação
    transaction = CreditTransaction(
        user_credits_id=credits.id,
        action=action,
        amount=required,
        balance_before=credits.balance + required,
        balance_after=credits.balance,
        reason=f"User consumed {action}",
    )
    db.add(transaction)
    db.commit()
    
    return {
        "success": True,
        "credits_consumed": required,
        "new_balance": round(credits.balance, 2),
        "message": f"{required} créditos debitados. Saldo: {round(credits.balance, 2)}"
    }


@router.post("/refund/{action}")
def refund_credits(
    action: str,
    reason: str = "Geração falhou",
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Reembolsa créditos (ex: geração falhou, usuário cancelou, etc)
    """
    try:
        action_enum = CreditAction(action)
        required = CREDIT_COSTS.get(action_enum, 10.0)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ação inválida: {action}"
        )
    
    credits = db.query(UserCredits).filter_by(user_id=current_user.id).first()
    if not credits:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário sem registro de créditos"
        )
    
    credits.refund(action_enum, required, reason)
    
    # Log da transação
    transaction = CreditTransaction(
        user_credits_id=credits.id,
        action=action,
        amount=-required,  # Negativo indica reembolso
        balance_before=credits.balance - required,
        balance_after=credits.balance,
        reason=reason,
    )
    db.add(transaction)
    db.commit()
    
    return {
        "success": True,
        "credits_refunded": required,
        "new_balance": round(credits.balance, 2),
        "message": f"Reembolso de {required} créditos. Novo saldo: {round(credits.balance, 2)}"
    }


@router.get("/history", response_model=list[CreditHistoryResponse])
def get_credit_history(
    limit: int = 20,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retorna histórico de transações de crédito do usuário.
    """
    credits = db.query(UserCredits).filter_by(user_id=current_user.id).first()
    if not credits:
        return []
    
    transactions = (
        db.query(CreditTransaction)
        .filter_by(user_credits_id=credits.id)
        .order_by(CreditTransaction.created_at.desc())
        .limit(limit)
        .all()
    )
    
    return [
        {
            "action": t.action,
            "amount": t.amount,
            "balance_before": t.balance_before,
            "balance_after": t.balance_after,
            "reason": t.reason,
            "created_at": t.created_at.isoformat(),
        }
        for t in transactions
    ]
