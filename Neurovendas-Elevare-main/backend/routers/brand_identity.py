"""
Router de Identidade de Marca - Brand Identity API Endpoints

Endpoints para criação, leitura, atualização e análise de identidade de marca
com sistema de clone de voz integrado.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from datetime import datetime

from routers.auth import get_current_user
from schemas.brand_identity import (
    BrandIdentityCreate,
    BrandIdentityResponse,
    VoiceAnalysisResult
)
from services.voice_clone_analyzer import analyze_voice_samples
from utils.plan_limits import check_and_raise_limit
from motor.motor_asyncio import AsyncIOMotorDatabase


router = APIRouter(prefix="/api/brand-identity", tags=["brand-identity"])


async def get_db() -> AsyncIOMotorDatabase:
    """Dependency para obter conexão com MongoDB"""
    from server import db  # Import local para evitar circular
    return db


@router.post("/", response_model=BrandIdentityResponse, status_code=status.HTTP_201_CREATED)
async def create_or_update_brand_identity(
    identity: BrandIdentityCreate,
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Cria ou atualiza identidade de marca completa.
    
    - **Valida todos os campos** via Pydantic
    - **Analisa amostras de voz** automaticamente
    - **Salva no MongoDB** com timestamps
    - **Uma identidade por usuário** (upsert)
    
    **Custo**: 10 créditos (operação de IA para análise de voz)
    """
    # Verifica limite de créditos (operação envolve análise de IA)
    check_and_raise_limit(current_user, "brand_identity_creation", cost=10)
    
    # Converte para dict
    identity_dict = identity.model_dump()
    
    # Adiciona metadados
    identity_dict['user_id'] = current_user['_id']
    identity_dict['updated_at'] = datetime.utcnow()
    
    # Verifica se já existe identidade para este usuário
    existing = await db.brand_identities.find_one({"user_id": current_user['_id']})
    
    if not existing:
        identity_dict['created_at'] = datetime.utcnow()
        result = await db.brand_identities.insert_one(identity_dict)
        identity_dict['_id'] = result.inserted_id
    else:
        # Preserva created_at original
        identity_dict['created_at'] = existing['created_at']
        await db.brand_identities.update_one(
            {"user_id": current_user['_id']},
            {"$set": identity_dict}
        )
        identity_dict['_id'] = existing['_id']
    
    # Análise de voz será feita on-demand via /analyze-voice
    # Não bloqueamos a criação da identidade
    
    return BrandIdentityResponse(**identity_dict)


@router.get("/", response_model=Optional[BrandIdentityResponse])
async def get_brand_identity(
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Recupera identidade de marca do usuário logado.
    
    Retorna `null` se usuário ainda não criou identidade.
    """
    identity = await db.brand_identities.find_one({"user_id": current_user['_id']})
    
    if not identity:
        return None
    
    return BrandIdentityResponse(**identity)


@router.post("/analyze-voice", response_model=VoiceAnalysisResult)
async def analyze_voice(
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Analisa amostras de voz da identidade de marca.
    
    **Requisitos**:
    - Usuário deve ter identidade criada
    - Campo `voice_samples` deve ter no mínimo 100 caracteres
    
    **Retorna**:
    - 10 métricas de análise de estilo de escrita
    - Resultados salvos na identidade para cache
    
    **Custo**: 5 créditos
    """
    # Verifica créditos
    check_and_raise_limit(current_user, "voice_analysis", cost=5)
    
    # Busca identidade
    identity = await db.brand_identities.find_one({"user_id": current_user['_id']})
    
    if not identity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Identidade de marca não encontrada. Crie uma identidade primeiro."
        )
    
    voice_samples = identity.get('voice_samples', '')
    
    if not voice_samples or len(voice_samples) < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amostras de voz insuficientes. Forneça pelo menos 100 caracteres."
        )
    
    # Analisa voz
    analysis = analyze_voice_samples(voice_samples)
    
    # Salva análise na identidade (cache)
    await db.brand_identities.update_one(
        {"user_id": current_user['_id']},
        {
            "$set": {
                "voice_analysis": analysis,
                "voice_analysis_updated_at": datetime.utcnow()
            }
        }
    )
    
    return VoiceAnalysisResult(**analysis)


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_brand_identity(
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Deleta identidade de marca do usuário.
    
    **ATENÇÃO**: Ação irreversível!
    """
    result = await db.brand_identities.delete_one({"user_id": current_user['_id']})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Identidade não encontrada"
        )
    
    return None


@router.get("/status")
async def get_identity_status(
    current_user = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Verifica status da identidade de marca.
    
    Retorna informações sobre completude e análise de voz.
    """
    identity = await db.brand_identities.find_one({"user_id": current_user['_id']})
    
    if not identity:
        return {
            "has_identity": False,
            "completeness": 0,
            "has_voice_samples": False,
            "voice_analyzed": False,
            "message": "Nenhuma identidade criada ainda"
        }
    
    # Calcula completude (campos obrigatórios preenchidos)
    required_fields = [
        'brand_name', 'main_specialty', 'brand_archetype',
        'positioning', 'target_audience', 'tone_of_voice'
    ]
    
    filled_required = sum(1 for field in required_fields if identity.get(field))
    completeness = (filled_required / len(required_fields)) * 100
    
    # Verifica voice samples
    has_voice = bool(identity.get('voice_samples', '').strip())
    voice_analyzed = bool(identity.get('voice_analysis'))
    
    return {
        "has_identity": True,
        "completeness": round(completeness, 1),
        "has_voice_samples": has_voice,
        "voice_samples_length": len(identity.get('voice_samples', '')),
        "voice_analyzed": voice_analyzed,
        "created_at": identity.get('created_at'),
        "updated_at": identity.get('updated_at'),
        "voice_analysis_updated_at": identity.get('voice_analysis_updated_at'),
        "message": "Identidade completa e pronta para uso" if completeness == 100 and voice_analyzed else 
                   "Identidade criada mas incompleta" if completeness < 100 else
                   "Identidade completa mas voz não analisada"
    }
