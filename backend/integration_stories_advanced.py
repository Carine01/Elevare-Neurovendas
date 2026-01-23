"""
integration_stories_advanced.py
Integração do Sistema Avançado de Stories com o Backend FastAPI
Arquivo para adicionar ao backend/server.py
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import uuid

# ===== MODELOS PYDANTIC =====

class StorySequence(BaseModel):
    """Sequência de neurovendas para stories"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str  # Atrair, Aquecer, Converter, etc
    description: str
    stories: List[Dict] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Atrair",
                "description": "Capturar atenção e curiosidade",
                "stories": [
                    {
                        "text": "Você acha que precisa de 10k seguidores?",
                        "trigger": "Quebra de Padrão",
                        "psychology": "Contraste"
                    }
                ]
            }
        }


class AdvancedStory(BaseModel):
    """Story avançado com suporte multi-formato"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    titulo: str
    sequencia: str  # atrair, aquecer, converter, educar, reposicionar, reativar
    procedimento: str  # botox, harmonização, etc
    texto_principal: str
    imagem_url: Optional[str] = None
    cor_fundo: str = "#000000"
    fonte: str = "Inter"
    tamanho_fonte: int = 28
    cor_texto: str = "#FFFFFF"
    alinhamento: str = "center"
    sombra_texto: bool = True
    
    # Multi-formato
    formatos: List[str] = ["instagram_stories"]  # instagram_stories, facebook_stories, etc
    
    # Meta
    status: str = "rascunho"  # rascunho, agendado, publicado
    agendado_para: Optional[datetime] = None
    plataformas_publicadas: Dict[str, str] = {}  # { "instagram": "url_post", "facebook": "url_post" }
    
    # Analytics
    visualizacoes: int = 0
    cliques: int = 0
    conversoes: int = 0
    
    # Timestamps
    criado_em: datetime = Field(default_factory=datetime.utcnow)
    atualizado_em: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "titulo": "Harmonização Facial - Atrair",
                "sequencia": "atrair",
                "procedimento": "harmonização",
                "texto_principal": "Você acha que precisa de 10k seguidores pra vender bem?",
                "formatos": ["instagram_stories", "facebook_stories"],
                "status": "agendado"
            }
        }


class GenerateStoryRequest(BaseModel):
    """Request para gerar stories com IA"""
    sequencia: str  # atrair, aquecer, converter, etc
    procedimento: str
    publico_alvo: Optional[str] = None
    objetivos: Optional[List[str]] = None
    quantidade: int = 5
    
    class Config:
        json_schema_extra = {
            "example": {
                "sequencia": "converter",
                "procedimento": "botox",
                "quantidade": 5
            }
        }


class PublishStoryRequest(BaseModel):
    """Request para publicar stories"""
    story_id: str
    plataformas: List[str]  # instagram, facebook, linkedin
    agendar_para: Optional[datetime] = None
    

class StoryDashboard(BaseModel):
    """Dashboard de estatísticas"""
    total_stories: int
    stories_publicados: int
    total_visualizacoes: int
    total_cliques: int
    total_conversoes: int
    media_engajamento: float
    sequencias_mais_usadas: Dict[str, int]


# ===== ROUTER =====

router = APIRouter(prefix="/api/content/stories", tags=["stories"])


# ===== ENDPOINTS =====

@router.post("/generate")
async def generate_stories(request: GenerateStoryRequest, background_tasks: BackgroundTasks):
    """
    Gera stories com IA Lucresia baseado na sequência de neurovendas
    
    Exemplo:
    {
        "sequencia": "converter",
        "procedimento": "botox",
        "quantidade": 5
    }
    """
    try:
        # TODO: Integrar com Lucresia API
        # response = await call_lucresia_api(
        #     prompt=f"Gere 5 stories {request.sequencia} sobre {request.procedimento}",
        #     model="neurovendas"
        # )
        
        # Resposta simulada para teste
        generated_stories = {
            "sequencia": request.sequencia,
            "procedimento": request.procedimento,
            "stories": [
                {
                    "numero": i,
                    "texto": f"Story {i} sobre {request.procedimento}",
                    "gatilho": "Exemplo",
                    "psicologia": "Teste"
                }
                for i in range(1, request.quantidade + 1)
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
        
        return generated_stories
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar: {str(e)}")


@router.post("/save")
async def save_story(story: AdvancedStory):
    """Salva um story no banco de dados"""
    try:
        # TODO: Substituir pela conexão real do MongoDB
        # db = client.elevare.stories
        # result = await db.insert_one(story.model_dump())
        
        return {
            "id": story.id,
            "status": "salvo",
            "mensagem": "Story salvo com sucesso",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar: {str(e)}")


@router.post("/publish")
async def publish_story(request: PublishStoryRequest, background_tasks: BackgroundTasks):
    """Publica um story nas plataformas selecionadas"""
    try:
        # TODO: Integrar com APIs de publicação (Instagram, Facebook, LinkedIn)
        
        # Estrutura de publicação
        publish_data = {
            "story_id": request.story_id,
            "plataformas": request.plataformas,
            "agendar_para": request.agendar_para,
            "status": "agendado" if request.agendar_para else "publicado",
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Se agendado, adicionar a fila
        if request.agendar_para:
            background_tasks.add_task(schedule_publish, request.story_id, request.plataformas, request.agendar_para)
        
        return publish_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao publicar: {str(e)}")


@router.get("/dashboard")
async def get_dashboard() -> StoryDashboard:
    """Retorna dashboard com estatísticas de stories"""
    try:
        # TODO: Integrar com MongoDB para buscar dados reais
        
        dashboard = StoryDashboard(
            total_stories=0,
            stories_publicados=0,
            total_visualizacoes=0,
            total_cliques=0,
            total_conversoes=0,
            media_engajamento=0.0,
            sequencias_mais_usadas={
                "atrair": 0,
                "aquecer": 0,
                "converter": 0,
                "educar": 0,
                "reposicionar": 0,
                "reativar": 0
            }
        )
        
        return dashboard
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar dashboard: {str(e)}")


@router.get("/{story_id}")
async def get_story(story_id: str):
    """Busca um story específico"""
    try:
        # TODO: Buscar no MongoDB
        return {"id": story_id, "mensagem": "Story encontrado"}
    except Exception as e:
        raise HTTPException(status_code=404, detail="Story não encontrado")


@router.put("/{story_id}")
async def update_story(story_id: str, story: AdvancedStory):
    """Atualiza um story"""
    try:
        # TODO: Atualizar no MongoDB
        return {
            "id": story_id,
            "status": "atualizado",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar: {str(e)}")


@router.delete("/{story_id}")
async def delete_story(story_id: str):
    """Deleta um story"""
    try:
        # TODO: Deletar do MongoDB
        return {
            "id": story_id,
            "status": "deletado",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao deletar: {str(e)}")


@router.get("/sequencias/all")
async def get_all_sequences():
    """Retorna todas as sequências de neurovendas disponíveis"""
    sequences = {
        "atrair": {
            "name": "🎯 Atrair",
            "description": "Capturar atenção e quebrar padrões",
            "icon": "🎯"
        },
        "aquecer": {
            "name": "🔥 Aquecer",
            "description": "Construir confiança e relacionamento",
            "icon": "🔥"
        },
        "converter": {
            "name": "💰 Converter",
            "description": "Gerar vendas e ações imediatas",
            "icon": "💰"
        },
        "educar": {
            "name": "📚 Educar",
            "description": "Ensinar e estabelecer autoridade",
            "icon": "📚"
        },
        "reposicionar": {
            "name": "⚡ Reposicionar",
            "description": "Redefinir marca e posicionamento",
            "icon": "⚡"
        },
        "reativar": {
            "name": "🔄 Reativar",
            "description": "Reconectar com público antigo",
            "icon": "🔄"
        }
    }
    return sequences


# ===== FUNÇÕES AUXILIARES =====

async def schedule_publish(story_id: str, plataformas: List[str], publish_at: datetime):
    """Função para ser executada em background para publicar no horário agendado"""
    # TODO: Implementar com Bull Queue ou APScheduler
    import asyncio
    from datetime import datetime, timedelta
    
    now = datetime.utcnow()
    wait_time = (publish_at - now).total_seconds()
    
    if wait_time > 0:
        await asyncio.sleep(wait_time)
        # Publicar aqui
        print(f"Publicando story {story_id} em {plataformas}")


async def call_lucresia_api(prompt: str, model: str = "neurovendas"):
    """Chama a API Lucresia para gerar conteúdo com IA"""
    # TODO: Implementar integração real com Lucresia
    pass


async def publish_to_instagram(story_id: str, content: AdvancedStory):
    """Publica story no Instagram"""
    # TODO: Integrar com Instagram Graph API
    pass


async def publish_to_facebook(story_id: str, content: AdvancedStory):
    """Publica story no Facebook"""
    # TODO: Integrar com Facebook Graph API
    pass


async def publish_to_linkedin(story_id: str, content: AdvancedStory):
    """Publica post no LinkedIn"""
    # TODO: Integrar com LinkedIn API
    pass


# ===== COMO INTEGRAR NO SERVER.PY =====
"""
1. Adicionar ao server.py:

from integration_stories_advanced import router as stories_router

# No main app:
app.include_router(stories_router)

2. Criar coleções no MongoDB:

db.stories.create_index([("criado_em", -1)])
db.stories.create_index([("procedimento", 1)])
db.stories.create_index([("status", 1)])

3. Substituir TODOs pelas implementações reais

4. Adicionar variáveis de ambiente:

UNSPLASH_KEY=...
PEXELS_KEY=...
PIXABAY_KEY=...
LUCRESIA_API_KEY=...
INSTAGRAM_ACCESS_TOKEN=...
FACEBOOK_ACCESS_TOKEN=...
LINKEDIN_ACCESS_TOKEN=...
"""
