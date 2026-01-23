"""
ENDPOINTS AVANÇADOS PARA STORY, CARROSSEL E FEED

Implementa:
- POST /api/content/generate (gera conteúdo com IA)
- POST /api/content/stories (cria/salva story)
- POST /api/content/carrosseis (cria/salva carrossel)
- POST /api/content/feeds (cria/salva feed post)
- GET /api/content/all (lista tudo)
- POST /api/content/batch (publica em lote)
"""

from fastapi import APIRouter, HTTPException
from models_advanced import (
    StoryContent, StoryContentCreate,
    CarrosselContent, CarrosselContentCreate,
    FeedContent, FeedContentCreate,
    GenerateContentRequest, ContentBatch, ContentTemplate
)
from datetime import datetime, timezone
import uuid
import logging

logger = logging.getLogger(__name__)

# Router para conteúdo
content_router = APIRouter(prefix="/content", tags=["content"])


# ============= STORIES =============

@content_router.post("/stories", response_model=StoryContent)
async def create_story(story_data: StoryContentCreate, db=None):
    """Criar um novo story"""
    story = StoryContent(
        titulo=story_data.titulo,
        tipo_story=story_data.tipo_story,
        texto_principal=story_data.texto_principal,
        texto_secundario=story_data.texto_secundario,
        cta=story_data.cta,
        link_cta=story_data.link_cta,
        imagem_url=story_data.imagem_url,
        imagem_descricao=story_data.imagem_descricao,
        background=story_data.background or "#F5F5F5",
        procedimento=story_data.procedimento,
        objetivo=story_data.objetivo,
        publico_alvo=story_data.publico_alvo or "público geral",
        gerado_por_ia=story_data.gerado_por_ia,
        agendado_para=story_data.agendado_para,
        status="agendado" if story_data.agendado_para else "rascunho"
    )
    
    # Salvar no MongoDB
    if db:
        doc = story.model_dump()
        doc['criado_em'] = doc['criado_em'].isoformat()
        doc['atualizado_em'] = doc['atualizado_em'].isoformat()
        await db.stories.insert_one(doc)
    
    return story


@content_router.get("/stories")
async def list_stories(skip: int = 0, limit: int = 20, db=None):
    """Listar todos os stories"""
    if not db:
        return {"error": "Database not configured"}
    
    stories = await db.stories.find(
        {},
        {"_id": 0}
    ).skip(skip).limit(limit).to_list(length=limit)
    
    total = await db.stories.count_documents({})
    
    return {
        "total": total,
        "items": stories,
        "skip": skip,
        "limit": limit
    }


@content_router.get("/stories/{story_id}", response_model=StoryContent)
async def get_story(story_id: str, db=None):
    """Obter um story específico"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    story = await db.stories.find_one({"id": story_id}, {"_id": 0})
    if not story:
        raise HTTPException(status_code=404, detail="Story não encontrado")
    
    return story


@content_router.put("/stories/{story_id}", response_model=StoryContent)
async def update_story(story_id: str, story_data: dict, db=None):
    """Atualizar um story"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    story_data['atualizado_em'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.stories.update_one(
        {"id": story_id},
        {"$set": story_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Story não encontrado")
    
    updated = await db.stories.find_one({"id": story_id}, {"_id": 0})
    return updated


@content_router.delete("/stories/{story_id}")
async def delete_story(story_id: str, db=None):
    """Deletar um story"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    result = await db.stories.delete_one({"id": story_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Story não encontrado")
    
    return {"message": "Story deletado com sucesso"}


# ============= CARROSSEIS =============

@content_router.post("/carrosseis", response_model=CarrosselContent)
async def create_carrossel(carrossel_data: CarrosselContentCreate, db=None):
    """Criar um novo carrossel"""
    carrossel = CarrosselContent(
        titulo=carrossel_data.titulo,
        descricao=carrossel_data.descricao,
        slides=carrossel_data.slides,
        estilo=carrossel_data.estilo,
        layout_slides=carrossel_data.layout_slides,
        procedimento=carrossel_data.procedimento,
        objetivo=carrossel_data.objetivo,
        tipo_carrossel=carrossel_data.tipo_carrossel,
        gerado_por_ia=carrossel_data.gerado_por_ia,
        agendado_para=carrossel_data.agendado_para,
        status="agendado" if carrossel_data.agendado_para else "rascunho"
    )
    
    if db:
        doc = carrossel.model_dump()
        doc['criado_em'] = doc['criado_em'].isoformat()
        doc['atualizado_em'] = doc['atualizado_em'].isoformat()
        await db.carrosseis.insert_one(doc)
    
    return carrossel


@content_router.get("/carrosseis")
async def list_carrosseis(skip: int = 0, limit: int = 20, db=None):
    """Listar todos os carrosseis"""
    if not db:
        return {"error": "Database not configured"}
    
    carrosseis = await db.carrosseis.find(
        {},
        {"_id": 0}
    ).skip(skip).limit(limit).to_list(length=limit)
    
    total = await db.carrosseis.count_documents({})
    
    return {
        "total": total,
        "items": carrosseis,
        "skip": skip,
        "limit": limit
    }


@content_router.get("/carrosseis/{carrossel_id}", response_model=CarrosselContent)
async def get_carrossel(carrossel_id: str, db=None):
    """Obter um carrossel específico"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    carrossel = await db.carrosseis.find_one({"id": carrossel_id}, {"_id": 0})
    if not carrossel:
        raise HTTPException(status_code=404, detail="Carrossel não encontrado")
    
    return carrossel


@content_router.put("/carrosseis/{carrossel_id}", response_model=CarrosselContent)
async def update_carrossel(carrossel_id: str, carrossel_data: dict, db=None):
    """Atualizar um carrossel"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    carrossel_data['atualizado_em'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.carrosseis.update_one(
        {"id": carrossel_id},
        {"$set": carrossel_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Carrossel não encontrado")
    
    updated = await db.carrosseis.find_one({"id": carrossel_id}, {"_id": 0})
    return updated


@content_router.delete("/carrosseis/{carrossel_id}")
async def delete_carrossel(carrossel_id: str, db=None):
    """Deletar um carrossel"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    result = await db.carrosseis.delete_one({"id": carrossel_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Carrossel não encontrado")
    
    return {"message": "Carrossel deletado com sucesso"}


# ============= FEED POSTS =============

@content_router.post("/feeds", response_model=FeedContent)
async def create_feed(feed_data: FeedContentCreate, db=None):
    """Criar um novo feed post"""
    feed = FeedContent(
        titulo=feed_data.titulo,
        legenda=feed_data.legenda,
        midia_url=feed_data.midia_url,
        midia_tipo=feed_data.midia_tipo,
        hashtags=feed_data.hashtags or [],
        cta=feed_data.cta,
        link_cta=feed_data.link_cta,
        procedimento=feed_data.procedimento,
        objetivo=feed_data.objetivo,
        publico_alvo=feed_data.publico_alvo or "público geral",
        emocao_alvo=feed_data.emocao_alvo or "inspiração",
        gerado_por_ia=feed_data.gerado_por_ia,
        agendado_para=feed_data.agendado_para,
        status="agendado" if feed_data.agendado_para else "rascunho"
    )
    
    if db:
        doc = feed.model_dump()
        doc['criado_em'] = doc['criado_em'].isoformat()
        doc['atualizado_em'] = doc['atualizado_em'].isoformat()
        await db.feeds.insert_one(doc)
    
    return feed


@content_router.get("/feeds")
async def list_feeds(skip: int = 0, limit: int = 20, db=None):
    """Listar todos os feed posts"""
    if not db:
        return {"error": "Database not configured"}
    
    feeds = await db.feeds.find(
        {},
        {"_id": 0}
    ).skip(skip).limit(limit).to_list(length=limit)
    
    total = await db.feeds.count_documents({})
    
    return {
        "total": total,
        "items": feeds,
        "skip": skip,
        "limit": limit
    }


@content_router.get("/feeds/{feed_id}", response_model=FeedContent)
async def get_feed(feed_id: str, db=None):
    """Obter um feed post específico"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    feed = await db.feeds.find_one({"id": feed_id}, {"_id": 0})
    if not feed:
        raise HTTPException(status_code=404, detail="Feed post não encontrado")
    
    return feed


@content_router.put("/feeds/{feed_id}", response_model=FeedContent)
async def update_feed(feed_id: str, feed_data: dict, db=None):
    """Atualizar um feed post"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    feed_data['atualizado_em'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.feeds.update_one(
        {"id": feed_id},
        {"$set": feed_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Feed post não encontrado")
    
    updated = await db.feeds.find_one({"id": feed_id}, {"_id": 0})
    return updated


@content_router.delete("/feeds/{feed_id}")
async def delete_feed(feed_id: str, db=None):
    """Deletar um feed post"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    result = await db.feeds.delete_one({"id": feed_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Feed post não encontrado")
    
    return {"message": "Feed post deletado com sucesso"}


# ============= GERAÇÃO COM IA =============

@content_router.post("/generate")
async def generate_content(request: GenerateContentRequest):
    """
    Gerar conteúdo com IA Lucresia
    
    Tipos suportados:
    - story: Gera um story Instagram/Facebook
    - carrossel: Gera um carrossel educativo
    - feed: Gera um feed post
    """
    
    if request.tipo not in ["story", "carrossel", "feed"]:
        raise HTTPException(status_code=400, detail="Tipo de conteúdo inválido")
    
    # Aqui você integraria com a API Lucresia
    # Por enquanto, retorna um template
    
    if request.tipo == "story":
        return {
            "tipo": "story",
            "opcoes": [
                {
                    "titulo": f"Story sobre {request.procedimento} - Opção 1",
                    "texto_principal": f"Descubra como {request.procedimento} pode transformar seu visual",
                    "objetivo": request.objetivo,
                    "cta": "Saiba mais"
                },
                {
                    "titulo": f"Story sobre {request.procedimento} - Opção 2",
                    "texto_principal": f"{request.procedimento}: {request.objetivo}",
                    "objetivo": request.objetivo,
                    "cta": "Clique aqui"
                },
                {
                    "titulo": f"Story sobre {request.procedimento} - Opção 3",
                    "texto_principal": f"Você já conhece os benefícios do {request.procedimento}?",
                    "objetivo": request.objetivo,
                    "cta": "Descubra"
                }
            ]
        }
    
    elif request.tipo == "carrossel":
        return {
            "tipo": "carrossel",
            "opcoes": [
                {
                    "titulo": f"Carrossel: {request.procedimento}",
                    "slides": [
                        {"numero": 1, "titulo": "O que é", "texto": f"Saiba o que é {request.procedimento}"},
                        {"numero": 2, "titulo": "Benefícios", "texto": "Conheça os principais benefícios"},
                        {"numero": 3, "titulo": "Resultado", "texto": "Veja os resultados esperados"},
                        {"numero": 4, "titulo": "CTA", "texto": "Marque sua consulta!"}
                    ]
                }
            ]
        }
    
    elif request.tipo == "feed":
        return {
            "tipo": "feed",
            "opcoes": [
                {
                    "titulo": f"Feed: {request.procedimento}",
                    "legenda": f"✨ {request.procedimento}\n\n{request.objetivo}\n\nVenha descobrir!\n\n#procedimento #beleza",
                    "cta": "Saiba mais"
                }
            ]
        }


@content_router.post("/batch", response_model=ContentBatch)
async def create_content_batch(batch_data: dict, db=None):
    """
    Criar um lote de conteúdo para publicação
    """
    batch = ContentBatch(
        nome=batch_data.get("nome", f"Lote {datetime.now().strftime('%d/%m/%Y')}"),
        descricao=batch_data.get("descricao"),
        stories=batch_data.get("stories", []),
        carrosseis=batch_data.get("carrosseis", []),
        feeds=batch_data.get("feeds", []),
        datas_publicacao=batch_data.get("datas_publicacao", []),
        frequencia=batch_data.get("frequencia")
    )
    
    if db:
        doc = batch.model_dump()
        doc['criado_em'] = doc['criado_em'].isoformat()
        doc['atualizado_em'] = doc['atualizado_em'].isoformat()
        await db.content_batches.insert_one(doc)
    
    return batch


@content_router.get("/dashboard")
async def get_content_dashboard(db=None):
    """Dashboard com estatísticas de conteúdo"""
    if not db:
        return {"error": "Database not configured"}
    
    total_stories = await db.stories.count_documents({})
    total_carrosseis = await db.carrosseis.count_documents({})
    total_feeds = await db.feeds.count_documents({})
    
    stories_publicados = await db.stories.count_documents({"status": "publicado"})
    carrosseis_publicados = await db.carrosseis.count_documents({"status": "publicado"})
    feeds_publicados = await db.feeds.count_documents({"status": "publicado"})
    
    return {
        "stories": {
            "total": total_stories,
            "publicados": stories_publicados,
            "rascunhos": total_stories - stories_publicados
        },
        "carrosseis": {
            "total": total_carrosseis,
            "publicados": carrosseis_publicados,
            "rascunhos": total_carrosseis - carrosseis_publicados
        },
        "feeds": {
            "total": total_feeds,
            "publicados": feeds_publicados,
            "rascunhos": total_feeds - feeds_publicados
        },
        "total_geral": total_stories + total_carrosseis + total_feeds
    }

