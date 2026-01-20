"""
Rotas de autenticação
Gerencia: registro, login, logout, verificação de email
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timezone, timedelta
from typing import Optional
import os
import logging

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
logger = logging.getLogger("elevare.auth")

# Config
BETA_MODE = os.environ.get("BETA_MODE", "true").lower() == "true"
BETA_PASSWORD = "beta2026"  # Senha padrão para todos no modo beta
BETA_CREDITS = 99999  # Créditos praticamente ilimitados para beta

JWT_SECRET = os.environ.get("JWT_SECRET", "elevare-secret-key-change-this")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# Pydantic Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    onboarding_completed: bool = False
    diagnosis_completed: bool = False
    subscription_plan: str = "free"
    xp: int = 0
    level: int = 1
    credits_remaining: int = 0

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Dependency injection para database
async def get_db():
    from server import db
    return db

# Helper Functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db = Depends(get_db)
):
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise credentials_exception
    return user

# Routes
@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate, db = Depends(get_db)):
    """Registrar novo usuário"""
    logger.info(f"Tentativa de registro: {user_data.email}")
    
    existing_user = await db.users.find_one({"email": user_data.email.lower()})
    if existing_user:
        logger.warning(f"Registro falhou - email já existe: {user_data.email}")
        
        # No modo BETA, se usuário já existe, retorna login ao invés de erro
        if BETA_MODE:
            logger.info(f"BETA MODE: Fazendo login automático para {user_data.email}")
            access_token = create_access_token(data={"sub": existing_user["id"]})
            
            # Atualiza créditos se estiverem baixos
            if existing_user.get("credits_remaining", 0) < 1000:
                await db.users.update_one(
                    {"email": user_data.email.lower()},
                    {"$set": {"credits_remaining": BETA_CREDITS, "subscription_plan": "beta_unlimited"}}
                )
                existing_user["credits_remaining"] = BETA_CREDITS
                existing_user["subscription_plan"] = "beta_unlimited"
            
            user_response = UserResponse(
                id=existing_user["id"],
                email=existing_user["email"],
                name=existing_user["name"],
                role=existing_user.get("role", "user"),
                onboarding_completed=existing_user.get("onboarding_completed", True),
                diagnosis_completed=existing_user.get("diagnosis_completed", False),
                subscription_plan=existing_user.get("subscription_plan", "beta_unlimited"),
                xp=existing_user.get("xp", 0),
                level=existing_user.get("level", 1),
                credits_remaining=existing_user.get("credits_remaining", BETA_CREDITS),
            )
            
            return TokenResponse(access_token=access_token, user=user_response)
        else:
            raise HTTPException(status_code=400, detail="Email already registered")

    from uuid import uuid4
    user_id = str(uuid4())
    hashed_password = hash_password(user_data.password)
    
    new_user = {
        "id": user_id,
        "email": user_data.email.lower(),
        "name": user_data.name,
        "password": hashed_password,
        "role": "user",
        "subscription_plan": "beta_unlimited",
        "credits_remaining": BETA_CREDITS if BETA_MODE else 100,
        "onboarding_completed": True,  # Usuário que se registra já completou onboarding básico
        "diagnosis_completed": False,  # Diagnóstico Premium ainda não feito
        "landing_quiz_completed": True, # Veio do quiz da landing
        "xp": 0,
        "level": 1,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    
    try:
        await db.users.insert_one(new_user)
        logger.info(f"Usuário registrado com sucesso: {user_data.email}, id={user_id}")
    except Exception as e:
        logger.error(f"Erro ao inserir usuário no MongoDB: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    # Enviar email de boas-vindas (async, não bloqueia) - apenas se não for beta
    if not BETA_MODE:
        try:
            from services.email_service import get_email_service
            email_service = get_email_service()
            await email_service.send_welcome_email(user_data.email, user_data.name)
            logger.info(f"Email de boas-vindas enviado para: {user_data.email}")
        except Exception as e:
            logger.warning(f"Falha ao enviar email de boas-vindas: {str(e)}")
    
    access_token = create_access_token(data={"sub": user_id})
    
    user_response = UserResponse(
        id=new_user["id"],
        email=new_user["email"],
        name=new_user["name"],
        role=new_user["role"],
        onboarding_completed=new_user.get("onboarding_completed", False),
        diagnosis_completed=new_user.get("diagnosis_completed", False),
        subscription_plan=new_user.get("subscription_plan", "free"),
        xp=new_user.get("xp", 0),
        level=new_user.get("level", 1),
        credits_remaining=new_user.get("credits_remaining", 0),
    )
    
    return TokenResponse(access_token=access_token, user=user_response)

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db = Depends(get_db)):
    """Login de usuário"""
    logger.info(f"Tentativa de login: {credentials.email}")
    
    user = await db.users.find_one({"email": credentials.email.lower()})
    
    # Modo BETA: aceita senha beta OU senha real
    if BETA_MODE:
        password_valid = (credentials.password == BETA_PASSWORD) or (user and verify_password(credentials.password, user["password"]))
    else:
        password_valid = user and verify_password(credentials.password, user["password"])
    
    if not user or not password_valid:
        logger.warning(f"Login falhou - credenciais inválidas: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password (BETA: use 'beta2026' como senha)"
        )
    
    access_token = create_access_token(data={"sub": user["id"]})
    logger.info(f"Login bem-sucedido: {credentials.email}")
    
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user.get("role", "user"),
        onboarding_completed=user.get("onboarding_completed", False),
        diagnosis_completed=user.get("diagnosis_completed", False),
        subscription_plan=user.get("subscription_plan", "free"),
        xp=user.get("xp", 0),
        level=user.get("level", 1),
        credits_remaining=user.get("credits_remaining", 0),
    )
    
    return TokenResponse(access_token=access_token, user=user_response)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Obter dados do usuário atual"""
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        role=current_user.get("role", "user"),
        onboarding_completed=current_user.get("onboarding_completed", False),
        diagnosis_completed=current_user.get("diagnosis_completed", False),
        subscription_plan=current_user.get("subscription_plan", "free"),
        xp=current_user.get("xp", 0),
        level=current_user.get("level", 1),
        credits_remaining=current_user.get("credits_remaining", 0),
    )

@router.post("/beta-login", response_model=TokenResponse)
async def beta_quick_login(db = Depends(get_db)):
    """
    Login rápido para BETA - cria/retorna usuário de teste automaticamente
    Senha universal: beta2026
    """
    if not BETA_MODE:
        raise HTTPException(status_code=403, detail="Beta mode not enabled")
    
    beta_email = "beta@elevare.com"
    
    # Busca ou cria usuário beta
    user = await db.users.find_one({"email": beta_email})
    
    if not user:
        from uuid import uuid4
        user_id = str(uuid4())
        user = {
            "id": user_id,
            "email": beta_email,
            "name": "Usuário Beta",
            "password": hash_password(BETA_PASSWORD),
            "role": "user",
            "subscription_plan": "beta_unlimited",
            "credits_remaining": BETA_CREDITS,
            "onboarding_completed": True,
            "diagnosis_completed": True,
            "landing_quiz_completed": True,
            "xp": 500,
            "level": 5,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        await db.users.insert_one(user)
        logger.info(f"Usuário beta criado: {beta_email}")
    else:
        # Atualiza créditos se necessário
        if user.get("credits_remaining", 0) < 1000:
            await db.users.update_one(
                {"email": beta_email},
                {"$set": {"credits_remaining": BETA_CREDITS, "subscription_plan": "beta_unlimited"}}
            )
            user["credits_remaining"] = BETA_CREDITS
            user["subscription_plan"] = "beta_unlimited"
    
    access_token = create_access_token(data={"sub": user["id"]})
    
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user.get("role", "user"),
        onboarding_completed=user.get("onboarding_completed", False),
        diagnosis_completed=user.get("diagnosis_completed", False),
        subscription_plan=user.get("subscription_plan", "free"),
        xp=user.get("xp", 0),
        level=user.get("level", 1),
        credits_remaining=user.get("credits_remaining", 0),
    )
    
    return TokenResponse(access_token=access_token, user=user_response)
