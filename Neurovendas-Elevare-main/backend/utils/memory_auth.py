"""
Fallback de autenticação em memória para modo BETA
Usado quando MongoDB não está disponível
"""
import logging
from datetime import datetime, timezone
from typing import Optional, Dict

logger = logging.getLogger("elevare.auth.fallback")

# Banco de dados em memória (para testes)
MEMORY_DB = {
    "users": {},  # email -> user_dict
}

def get_memory_user(email: str) -> Optional[Dict]:
    """Busca usuário no banco em memória"""
    return MEMORY_DB["users"].get(email.lower())

def create_memory_user(email: str, name: str, password_hash: str, user_id: str) -> Dict:
    """Cria usuário no banco em memória"""
    user = {
        "id": user_id,
        "email": email.lower(),
        "name": name,
        "password": password_hash,
        "role": "user",
        "subscription_plan": "beta_unlimited",
        "credits_remaining": 99999,
        "onboarding_completed": True,
        "diagnosis_completed": True,
        "landing_quiz_completed": True,
        "xp": 500,
        "level": 5,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    MEMORY_DB["users"][email.lower()] = user
    logger.info(f"✅ Usuário criado em memória: {email}")
    return user

def update_memory_user(email: str, updates: Dict) -> None:
    """Atualiza usuário no banco em memória"""
    if email.lower() in MEMORY_DB["users"]:
        MEMORY_DB["users"][email.lower()].update(updates)
        logger.info(f"✅ Usuário atualizado em memória: {email}")

# Cria usuário beta padrão
def init_beta_user():
    """Inicializa usuário beta padrão"""
    from uuid import uuid4
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    beta_email = "beta@elevare.com"
    if beta_email not in MEMORY_DB["users"]:
        create_memory_user(
            email=beta_email,
            name="Usuário Beta",
            password_hash=pwd_context.hash("beta2026"),
            user_id=str(uuid4())
        )

# Inicializa ao importar
init_beta_user()
