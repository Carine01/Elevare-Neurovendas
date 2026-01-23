from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import aiohttp
import base64
import io

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'elevare_db')]

# API Keys
UNSPLASH_ACCESS_KEY = os.environ.get('UNSPLASH_ACCESS_KEY', '')
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')

# Create the main app
app = FastAPI(title="Elevare NeuroVendas API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============= MODELS =============

class Template(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str  # vendas, engajamento, lancamentos
    format: str  # square, story, horizontal, vertical
    description: str
    preview_url: Optional[str] = None
    canvas_data: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    format: str
    width: int
    height: int
    canvas_data: Dict[str, Any]
    thumbnail: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProjectCreate(BaseModel):
    name: str
    format: str
    width: int
    height: int
    canvas_data: Dict[str, Any]
    thumbnail: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    canvas_data: Optional[Dict[str, Any]] = None
    thumbnail: Optional[str] = None

class AITextRequest(BaseModel):
    prompt_type: str  # stories, titulo, descricao, cta, hashtags
    context: str  # procedimento/serviço de estética
    tone: str = "autoridade"  # autoridade, acolhedor, educativo, premium
    num_stories: int = 5  # número de stories (5-7)

class LucresiaRequest(BaseModel):
    procedimento: str  # Ex: "Harmonização facial", "Botox", "Limpeza de pele"
    objetivo: str  # Ex: "Gerar autoridade", "Quebrar objeções", "Educar"
    publico: str = "mulheres 30-50 anos buscando rejuvenescimento"
    num_stories: int = 5

class UnsplashSearchRequest(BaseModel):
    query: str
    page: int = 1
    per_page: int = 20
    orientation: str = "portrait"  # portrait, landscape, squarish

class UploadedImage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    data: str  # base64
    mime_type: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class User(BaseModel):
    """Modelo de usuário com integração Google Calendar"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: Optional[str] = None
    nome: Optional[str] = None
    
    # Google Calendar Integration
    google_calendar_connected: bool = False
    google_calendar_token: Optional[str] = None  # Encrypted access token
    google_calendar_refresh: Optional[str] = None  # Encrypted refresh token
    google_calendar_expiry: Optional[datetime] = None
    google_calendar_email: Optional[str] = None  # Gmail account email
    
    # Timezone preferences
    timezone: str = "America/Sao_Paulo"
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: Optional[str] = None
    nome: Optional[str] = None
    timezone: Optional[str] = "America/Sao_Paulo"

class BrandProfile(BaseModel):
    """Perfil completo da marca para garantir coerência em todos os conteúdos"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome_marca: str  # Nome da clínica/profissional
    segmento: str = "estética avançada"  # Área de atuação
    
    # Identidade Verbal
    tom_de_voz: str = "autoridade"  # autoridade, acolhedor, educativo, premium, técnico
    personalidade: List[str] = Field(default_factory=lambda: ["profissional", "confiável", "moderno"])
    valores: List[str] = Field(default_factory=lambda: ["excelência", "segurança", "resultados"])
    
    # Linguagem
    palavras_chave: List[str] = Field(default_factory=list)  # Ex: "rejuvenescimento", "natural"
    palavras_evitar: List[str] = Field(default_factory=lambda: ["barato", "promoção", "corra"])
    faixa_etaria_alvo: str = "30-50 anos"
    publico_principal: str = "mulheres buscando rejuvenescimento natural"
    
    # Identidade Visual
    cores_primarias: List[str] = Field(default_factory=lambda: ["#4F46E5", "#7C3AED"])
    cores_secundarias: List[str] = Field(default_factory=lambda: ["#3B82F6", "#8B5CF6"])
    fonte_principal: str = "Inter"
    fonte_secundaria: str = "Playfair Display"
    
    # Diretrizes de Conteúdo
    estilo_comunicacao: str = "Direta, técnica, sem apelação comercial"
    diferenciais: List[str] = Field(default_factory=list)  # O que torna a marca única
    
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BrandProfileCreate(BaseModel):
    nome_marca: str
    segmento: Optional[str] = "estética avançada"
    tom_de_voz: Optional[str] = "autoridade"
    personalidade: Optional[List[str]] = None
    valores: Optional[List[str]] = None
    palavras_chave: Optional[List[str]] = None
    palavras_evitar: Optional[List[str]] = None
    faixa_etaria_alvo: Optional[str] = "30-50 anos"
    publico_principal: Optional[str] = "mulheres buscando rejuvenescimento natural"
    cores_primarias: Optional[List[str]] = None
    cores_secundarias: Optional[List[str]] = None
    fonte_principal: Optional[str] = "Inter"
    fonte_secundaria: Optional[str] = "Playfair Display"
    estilo_comunicacao: Optional[str] = "Direta, técnica, sem apelação comercial"
    diferenciais: Optional[List[str]] = None

class BrandProfileUpdate(BaseModel):
    nome_marca: Optional[str] = None
    segmento: Optional[str] = None
    tom_de_voz: Optional[str] = None
    personalidade: Optional[List[str]] = None
    valores: Optional[List[str]] = None
    palavras_chave: Optional[List[str]] = None
    palavras_evitar: Optional[List[str]] = None
    faixa_etaria_alvo: Optional[str] = None
    publico_principal: Optional[str] = None
    cores_primarias: Optional[List[str]] = None
    cores_secundarias: Optional[List[str]] = None
    fonte_principal: Optional[str] = None
    fonte_secundaria: Optional[str] = None
    estilo_comunicacao: Optional[str] = None
    diferenciais: Optional[List[str]] = None

class BlogPost(BaseModel):
    """Artigo de blog gerado pela Lucresia"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    titulo: str
    slug: str  # URL-friendly version
    introducao: str  # Abertura do artigo
    secoes: List[Dict[str, str]] = Field(default_factory=list)  # [{"titulo": "...", "conteudo": "..."}, ...]
    conclusao: str
    cta: str  # Call-to-action
    
    # Metadados
    topico: str  # Tema principal (ex: "Harmonização Facial")
    objetivo: str  # Objetivo da estratégia (ex: "Educar")
    palavras_chave_seo: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)
    
    # Imagens e Mídia
    imagem_destaque: Optional[str] = None  # URL da imagem principal
    sugestoes_imagens: List[str] = Field(default_factory=list)  # Prompts/queries de busca
    
    # Diagramação
    template_diagramacao: str = "clean"  # clean, magazine, minimal, bold
    cor_destaque: Optional[str] = None  # Cor extraída do brand profile
    
    # Perfil da marca utilizado
    marca_id: Optional[str] = None
    marca_nome: str = "Sua Clínica"
    
    # Status
    status: str = "rascunho"  # rascunho, publicado, agendado
    status_publicacao: Optional[datetime] = None
    data_agendamento: Optional[datetime] = None  # Data/hora para publicação agendada
    
    # Validação SEO
    meta_description: Optional[str] = None
    foco_keyword: Optional[str] = None
    densidade_keyword: Optional[float] = None
    tempo_leitura_minutos: Optional[int] = None
    alt_text_imagem: Optional[str] = None
    
    # Histórico de Versões
    versoes: List[Dict[str, Any]] = Field(default_factory=list)  # Histórico de edições
    versao_atual: int = 1
    
    # Categorias e Tags Expandidas
    categoria: Optional[str] = None  # categoria principal
    subcategorias: List[str] = Field(default_factory=list)
    
    # Templates de Seções
    tipos_secoes: List[str] = Field(default_factory=list)  # "padrão", "antes-depois", "faq", "case", "comparacao"
    
    # Links SEO
    links_internos: List[Dict[str, str]] = Field(default_factory=list)  # [{"texto": "...", "url": "..."}]
    links_externos: List[Dict[str, str]] = Field(default_factory=list)
    cta_customizado: Optional[Dict[str, str]] = None  # {"texto": "...", "url": "...", "tipo": "..."}
    
    # Analytics Básico
    visualizacoes: int = 0
    compartilhamentos: int = 0
    comentarios: int = 0
    data_primeira_publicacao: Optional[datetime] = None
    
    # Exportação
    formatos_exportados: List[str] = Field(default_factory=list)  # "medium", "devto", "wordpress", "notion"
    urls_publicadas: Dict[str, str] = Field(default_factory=dict)  # {"medium": "https://...", ...}
    
    # Rascunhos Automáticos
    ultimo_autosave: Optional[datetime] = None
    conteudo_autosalvo: Optional[Dict[str, Any]] = None
    
    # Google Calendar Integration
    google_calendar_event_id: Optional[str] = None
    google_calendar_synced: bool = False
    google_calendar_sync_date: Optional[datetime] = None
    google_calendar_calendar_url: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BlogPostCreate(BaseModel):
    topico: str
    objetivo: str
    publico_alvo: Optional[str] = None
    palavras_chave: Optional[List[str]] = None
    num_secoes: int = 3  # Número de seções do artigo

class BlogPostUpdate(BaseModel):
    titulo: Optional[str] = None
    introducao: Optional[str] = None
    secoes: Optional[List[Dict[str, str]]] = None
    conclusao: Optional[str] = None
    cta: Optional[str] = None
    status: Optional[str] = None
    tags: Optional[List[str]] = None

class BlogPostRequest(BaseModel):
    """Request para gerar artigo com Lucresia"""
    topico: str
    objetivo: str
    publico_alvo: str = "mulheres 30-50 anos buscando rejuvenescimento"
    num_secoes: int = 3
    palavras_chave: Optional[List[str]] = None

# ============= HEALTH CHECK =============

@api_router.get("/")
async def root():
    return {"message": "Elevare NeuroVendas API v2.0", "status": "online"}

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "unsplash_configured": bool(UNSPLASH_ACCESS_KEY),
        "ai_configured": bool(EMERGENT_LLM_KEY)
    }

# ============= BRAND PROFILE =============

@api_router.get("/brand/profile", response_model=BrandProfile)
async def get_brand_profile():
    """Recupera o perfil de marca ativo"""
    profile = await db.brand_profiles.find_one({"is_active": True}, {"_id": 0})
    if not profile:
        # Retornar perfil padrão se não houver nenhum configurado
        return BrandProfile(
            nome_marca="Sua Clínica",
            segmento="estética avançada"
        )
    
    # Converter timestamps
    if isinstance(profile.get('created_at'), str):
        profile['created_at'] = datetime.fromisoformat(profile['created_at'])
    if isinstance(profile.get('updated_at'), str):
        profile['updated_at'] = datetime.fromisoformat(profile['updated_at'])
    
    return profile

@api_router.post("/brand/profile", response_model=BrandProfile)
async def create_brand_profile(profile_data: BrandProfileCreate):
    """Cria um novo perfil de marca"""
    # Desativar perfis anteriores
    await db.brand_profiles.update_many({}, {"$set": {"is_active": False}})
    
    # Criar novo perfil
    profile = BrandProfile(**profile_data.model_dump(exclude_none=True))
    doc = profile.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.brand_profiles.insert_one(doc)
    return profile

@api_router.put("/brand/profile/{profile_id}", response_model=BrandProfile)
async def update_brand_profile(profile_id: str, profile_data: BrandProfileUpdate):
    """Atualiza o perfil de marca existente"""
    existing = await db.brand_profiles.find_one({"id": profile_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Perfil de marca não encontrado")
    
    update_data = {k: v for k, v in profile_data.model_dump(exclude_none=True).items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.brand_profiles.update_one({"id": profile_id}, {"$set": update_data})
    
    updated = await db.brand_profiles.find_one({"id": profile_id}, {"_id": 0})
    return updated

@api_router.delete("/brand/profile/{profile_id}")
async def delete_brand_profile(profile_id: str):
    """Remove um perfil de marca"""
    result = await db.brand_profiles.delete_one({"id": profile_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Perfil de marca não encontrado")
    return {"message": "Perfil de marca deletado com sucesso"}

@api_router.post("/brand/profile/seed")
async def seed_default_brand_profile():
    """Cria perfil de marca padrão para estética"""
    default_profile = {
        "id": str(uuid.uuid4()),
        "nome_marca": "Elevare Estética",
        "segmento": "estética avançada",
        "tom_de_voz": "autoridade",
        "personalidade": ["profissional", "confiável", "inovadora", "elegante"],
        "valores": ["excelência técnica", "resultados naturais", "segurança", "ética"],
        "palavras_chave": [
            "harmonização", "rejuvenescimento natural", "técnicas avançadas",
            "resultados comprovados", "expertise", "procedimentos seguros"
        ],
        "palavras_evitar": [
            "barato", "promoção relâmpago", "corra", "últimas vagas",
            "milagroso", "perfeito", "melhor de todos"
        ],
        "faixa_etaria_alvo": "30-50 anos",
        "publico_principal": "Mulheres e homens que buscam rejuvenescimento natural com técnicas comprovadas",
        "cores_primarias": ["#4F46E5", "#7C3AED"],
        "cores_secundarias": ["#3B82F6", "#8B5CF6", "#10B981"],
        "fonte_principal": "Inter",
        "fonte_secundaria": "Playfair Display",
        "estilo_comunicacao": "Comunicação técnica, direta e profissional. Evitamos apelos comerciais e linguagem apelativa. Focamos em educar, gerar autoridade e construir confiança.",
        "diferenciais": [
            "Equipe com certificação internacional",
            "Protocolos personalizados",
            "Acompanhamento pós-procedimento",
            "Resultados naturais e harmoniosos"
        ],
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Desativar outros perfis
    await db.brand_profiles.update_many({}, {"$set": {"is_active": False}})
    await db.brand_profiles.insert_one(default_profile)
    
    return {"message": "Perfil de marca padrão criado com sucesso", "profile": default_profile}

# ============= TEMPLATES =============

@api_router.get("/templates", response_model=List[Template])
async def get_templates(category: Optional[str] = None, format: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if format:
        query["format"] = format
    
    templates = await db.templates.find(query, {"_id": 0}).to_list(100)
    
    # Convert timestamps
    for t in templates:
        if isinstance(t.get('created_at'), str):
            t['created_at'] = datetime.fromisoformat(t['created_at'])
    
    return templates

@api_router.get("/templates/{template_id}", response_model=Template)
async def get_template(template_id: str):
    template = await db.templates.find_one({"id": template_id}, {"_id": 0})
    if not template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    return template

@api_router.post("/templates/seed")
async def seed_templates():
    """Seed database with default templates"""
    default_templates = [
        {
            "id": str(uuid.uuid4()),
            "name": "Promoção Impactante",
            "category": "vendas",
            "format": "story",
            "description": "Template moderno com foto e CTA para impulsionar vendas.",
            "preview_url": None,
            "canvas_data": {
                "background": "#4F46E5",
                "elements": [
                    {"type": "text", "content": "OFERTA ESPECIAL", "fontSize": 48, "fontWeight": "bold", "color": "#FFFFFF", "top": 100, "left": 50},
                    {"type": "text", "content": "50% OFF", "fontSize": 72, "fontWeight": "900", "color": "#FDE68A", "top": 200, "left": 50},
                    {"type": "text", "content": "Por tempo limitado!", "fontSize": 24, "color": "#FFFFFF", "top": 300, "left": 50},
                    {"type": "button", "content": "COMPRE AGORA", "backgroundColor": "#F59E0B", "color": "#FFFFFF", "top": 400, "left": 50}
                ]
            },
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Enquete Interativa",
            "category": "engajamento",
            "format": "story",
            "description": "Design vibrante para perguntas e respostas, incentivando interação.",
            "preview_url": None,
            "canvas_data": {
                "background": "linear-gradient(135deg, #7C3AED, #EC4899)",
                "elements": [
                    {"type": "text", "content": "O QUE VOCÊ PREFERE?", "fontSize": 36, "fontWeight": "bold", "color": "#FFFFFF", "top": 150, "left": 50},
                    {"type": "button", "content": "OPÇÃO A", "backgroundColor": "#FFFFFF", "color": "#7C3AED", "top": 300, "left": 50},
                    {"type": "button", "content": "OPÇÃO B", "backgroundColor": "#FFFFFF", "color": "#7C3AED", "top": 380, "left": 50}
                ]
            },
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Lançamento Exclusivo",
            "category": "lancamentos",
            "format": "story",
            "description": "Visual impactante para teasers e contagem regressiva de novos produtos.",
            "preview_url": None,
            "canvas_data": {
                "background": "#111827",
                "elements": [
                    {"type": "text", "content": "EM BREVE", "fontSize": 24, "color": "#F59E0B", "top": 100, "left": 50},
                    {"type": "text", "content": "NOVIDADE", "fontSize": 64, "fontWeight": "900", "color": "#FFFFFF", "top": 180, "left": 50},
                    {"type": "text", "content": "Prepare-se para o lançamento", "fontSize": 20, "color": "#9CA3AF", "top": 280, "left": 50},
                    {"type": "text", "content": "🚀", "fontSize": 80, "top": 350, "left": 150}
                ]
            },
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Produto em Destaque",
            "category": "vendas",
            "format": "square",
            "description": "Layout clean com foco no produto e botão de compra direto.",
            "preview_url": None,
            "canvas_data": {
                "background": "#FFFFFF",
                "elements": [
                    {"type": "text", "content": "NOVO", "fontSize": 18, "fontWeight": "bold", "color": "#EF4444", "top": 50, "left": 50},
                    {"type": "text", "content": "Nome do Produto", "fontSize": 32, "fontWeight": "bold", "color": "#111827", "top": 100, "left": 50},
                    {"type": "text", "content": "R$ 99,90", "fontSize": 48, "fontWeight": "900", "color": "#10B981", "top": 180, "left": 50},
                    {"type": "button", "content": "VER MAIS", "backgroundColor": "#4F46E5", "color": "#FFFFFF", "top": 280, "left": 50}
                ]
            },
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Caixa de Perguntas",
            "category": "engajamento",
            "format": "story",
            "description": "Modelo interativo com enquetes e caixas de perguntas.",
            "preview_url": None,
            "canvas_data": {
                "background": "linear-gradient(135deg, #3B82F6, #8B5CF6)",
                "elements": [
                    {"type": "text", "content": "ME PERGUNTE", "fontSize": 42, "fontWeight": "bold", "color": "#FFFFFF", "top": 150, "left": 50},
                    {"type": "text", "content": "QUALQUER COISA", "fontSize": 42, "fontWeight": "bold", "color": "#FDE68A", "top": 210, "left": 50},
                    {"type": "rect", "backgroundColor": "#FFFFFF", "width": 300, "height": 100, "top": 320, "left": 50, "borderRadius": 12}
                ]
            },
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Clear existing and insert new
    await db.templates.delete_many({})
    await db.templates.insert_many(default_templates)
    
    return {"message": f"{len(default_templates)} templates criados com sucesso"}

# ============= PROJECTS =============

@api_router.get("/projects", response_model=List[Project])
async def get_projects():
    projects = await db.projects.find({}, {"_id": 0}).sort("updated_at", -1).to_list(100)
    for p in projects:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
        if isinstance(p.get('updated_at'), str):
            p['updated_at'] = datetime.fromisoformat(p['updated_at'])
    return projects

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    project = await db.projects.find_one({"id": project_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return project

@api_router.post("/projects", response_model=Project)
async def create_project(project_data: ProjectCreate):
    project = Project(**project_data.model_dump())
    doc = project.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.projects.insert_one(doc)
    return project

@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, project_data: ProjectUpdate):
    existing = await db.projects.find_one({"id": project_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    
    update_data = {k: v for k, v in project_data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.projects.update_one({"id": project_id}, {"$set": update_data})
    
    updated = await db.projects.find_one({"id": project_id}, {"_id": 0})
    return updated

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    result = await db.projects.delete_one({"id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return {"message": "Projeto deletado com sucesso"}

# ============= UNSPLASH IMAGES =============

@api_router.post("/images/search")
async def search_unsplash_images(request: UnsplashSearchRequest):
    if not UNSPLASH_ACCESS_KEY:
        raise HTTPException(status_code=500, detail="Unsplash API não configurada")
    
    async with aiohttp.ClientSession() as session:
        params = {
            "query": request.query,
            "page": request.page,
            "per_page": request.per_page,
            "orientation": request.orientation
        }
        headers = {"Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"}
        
        async with session.get(
            "https://api.unsplash.com/search/photos",
            params=params,
            headers=headers
        ) as response:
            if response.status != 200:
                error_text = await response.text()
                logger.error(f"Unsplash API error: {error_text}")
                raise HTTPException(status_code=response.status, detail="Erro ao buscar imagens")
            
            data = await response.json()
            
            # Format response
            images = []
            for photo in data.get("results", []):
                images.append({
                    "id": photo["id"],
                    "description": photo.get("description") or photo.get("alt_description") or "",
                    "urls": {
                        "thumb": photo["urls"]["thumb"],
                        "small": photo["urls"]["small"],
                        "regular": photo["urls"]["regular"],
                        "full": photo["urls"]["full"]
                    },
                    "user": {
                        "name": photo["user"]["name"],
                        "username": photo["user"]["username"]
                    },
                    "width": photo["width"],
                    "height": photo["height"],
                    "color": photo["color"]
                })
            
            return {
                "images": images,
                "total": data.get("total", 0),
                "total_pages": data.get("total_pages", 0)
            }

@api_router.post("/ai/generate-image")
async def generate_image(
    prompt: str = Body(..., embed=True),
    size: str = Body("1024x1024", embed=True)
):
    """Generate an image using DALL-E 3 (OpenAI API or Emergent API)"""
    
    if not OPENAI_API_KEY and not EMERGENT_LLM_KEY:
        return {
            "success": False, 
            "error": "Nenhuma chave de API configurada. Configure OPENAI_API_KEY ou EMERGENT_LLM_KEY no .env"
        }
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            # Tentar com OpenAI primeiro
            if OPENAI_API_KEY:
                try:
                    response = await client.post(
                        "https://api.openai.com/v1/images/generations",
                        headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
                        json={
                            "model": "dall-e-3",
                            "prompt": prompt,
                            "n": 1,
                            "size": size,
                            "quality": "standard"
                        }
                    )
                    response.raise_for_status()
                    data = response.json()
                    
                    if data.get("data") and len(data["data"]) > 0:
                        return {
                            "success": True,
                            "image_url": data["data"][0]["url"],
                            "revised_prompt": data["data"][0].get("revised_prompt"),
                            "provider": "OpenAI DALL-E 3"
                        }
                except Exception as e:
                    print(f"OpenAI DALL-E falhou: {str(e)}")
                    # Continuar para próxima opção
            
            # Fallback: Tentar com Emergent API (se disponível)
            if EMERGENT_LLM_KEY:
                try:
                    response = await client.post(
                        "https://api.openai.com/v1/images/generations",
                        headers={"Authorization": f"Bearer {EMERGENT_LLM_KEY}"},
                        json={
                            "model": "dall-e-3",
                            "prompt": prompt,
                            "n": 1,
                            "size": size,
                            "quality": "standard"
                        }
                    )
                    response.raise_for_status()
                    data = response.json()
                    
                    if data.get("data") and len(data["data"]) > 0:
                        return {
                            "success": True,
                            "image_url": data["data"][0]["url"],
                            "revised_prompt": data["data"][0].get("revised_prompt"),
                            "provider": "Emergent API DALL-E 3"
                        }
                except Exception as e:
                    print(f"Emergent API falhou: {str(e)}")
            
            # Se nenhuma API funcionou
            return {
                "success": False, 
                "error": "Nenhum provedor de IA de imagem disponível. Configure OPENAI_API_KEY no .env"
            }
                
    except Exception as e:
        print(f"Erro na geração de imagem: {str(e)}")
        return {"success": False, "error": str(e)}

@api_router.get("/images/popular")
async def get_popular_images():
    """Get popular/curated images from Unsplash"""
    if not UNSPLASH_ACCESS_KEY:
        raise HTTPException(status_code=500, detail="Unsplash API não configurada")
    
    async with aiohttp.ClientSession() as session:
        headers = {"Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"}
        
        async with session.get(
            "https://api.unsplash.com/photos",
            params={"per_page": 20, "order_by": "popular"},
            headers=headers
        ) as response:
            if response.status != 200:
                raise HTTPException(status_code=response.status, detail="Erro ao buscar imagens")
            
            photos = await response.json()
            
            images = []
            for photo in photos:
                images.append({
                    "id": photo["id"],
                    "description": photo.get("description") or photo.get("alt_description") or "",
                    "urls": {
                        "thumb": photo["urls"]["thumb"],
                        "small": photo["urls"]["small"],
                        "regular": photo["urls"]["regular"],
                        "full": photo["urls"]["full"]
                    },
                    "user": {
                        "name": photo["user"]["name"],
                        "username": photo["user"]["username"]
                    },
                    "width": photo["width"],
                    "height": photo["height"],
                    "color": photo["color"]
                })
            
            return {"images": images}

# ============= IMAGE UPLOAD =============

@api_router.post("/images/upload")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Arquivo deve ser uma imagem")
    
    # Read and encode to base64
    content = await file.read()
    if len(content) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="Imagem muito grande. Máximo 5MB.")
    
    base64_data = base64.b64encode(content).decode('utf-8')
    
    image = UploadedImage(
        filename=file.filename,
        data=base64_data,
        mime_type=file.content_type
    )
    
    doc = image.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.uploaded_images.insert_one(doc)
    
    return {
        "id": image.id,
        "filename": image.filename,
        "url": f"data:{image.mime_type};base64,{base64_data}"
    }

@api_router.get("/images/uploaded")
async def get_uploaded_images():
    images = await db.uploaded_images.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    
    result = []
    for img in images:
        result.append({
            "id": img["id"],
            "filename": img["filename"],
            "url": f"data:{img['mime_type']};base64,{img['data']}"
        })
    
    return {"images": result}

@api_router.delete("/images/uploaded/{image_id}")
async def delete_uploaded_image(image_id: str):
    result = await db.uploaded_images.delete_one({"id": image_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Imagem não encontrada")
    return {"message": "Imagem deletada com sucesso"}

# ============= AI TEXT GENERATION - LUCRESIA =============

# System prompt da Lucresia - IA de Neurovendas para Estética
def get_lucresia_system_prompt(brand_profile: BrandProfile) -> str:
    """Gera system prompt personalizado baseado no perfil da marca"""
    
    personalidade_str = ", ".join(brand_profile.personalidade)
    valores_str = ", ".join(brand_profile.valores)
    palavras_chave_str = ", ".join(brand_profile.palavras_chave) if brand_profile.palavras_chave else "harmonização, rejuvenescimento, técnicas avançadas"
    palavras_evitar_str = ", ".join(brand_profile.palavras_evitar)
    diferenciais_str = "\n- ".join(brand_profile.diferenciais) if brand_profile.diferenciais else "Excelência técnica\n- Resultados naturais"
    
    return f"""Você é Lucresia, estrategista sênior em Neurovendas para {brand_profile.nome_marca}.

🎯 PERFIL DA MARCA:
Nome: {brand_profile.nome_marca}
Segmento: {brand_profile.segmento}
Tom de Voz: {brand_profile.tom_de_voz}
Personalidade: {personalidade_str}
Valores: {valores_str}

👥 PÚBLICO-ALVO:
{brand_profile.publico_principal}
Faixa etária: {brand_profile.faixa_etaria_alvo}

📝 ESTILO DE COMUNICAÇÃO:
{brand_profile.estilo_comunicacao}

✅ PALAVRAS E CONCEITOS ESTRATÉGICOS:
{palavras_chave_str}

❌ PALAVRAS E EXPRESSÕES PROIBIDAS:
{palavras_evitar_str}

💎 DIFERENCIAIS DA MARCA:
- {diferenciais_str}

🧠 SUA FUNÇÃO:
- Aumentar percepção de autoridade da marca
- Gerar segurança emocional no público
- Preparar a cliente para comprar sem pressão
- Reforçar os valores e diferenciais da marca

Antes de criar qualquer conteúdo, pergunte-se:
1. Isso está alinhado com o tom de voz "{brand_profile.tom_de_voz}"?
2. Isso reflete os valores: {valores_str}?
3. Estou usando as palavras estratégicas da marca?
4. Estou evitando as palavras proibidas?
5. Isso posiciona {brand_profile.nome_marca} como autoridade?

REGRAS OBRIGATÓRIAS:
- SEMPRE use o tom de voz: {brand_profile.tom_de_voz}
- SEMPRE reflita a personalidade: {personalidade_str}
- NUNCA use as palavras proibidas
- Linguagem firme, elegante e estratégica
- Frases curtas, impactantes e humanas
- Cada palavra tem uma função estratégica

Você trabalha exclusivamente para {brand_profile.nome_marca}.
Seja clara, direta e cirúrgica."""

@api_router.post("/ai/lucresia/stories")
async def generate_lucresia_stories(request: LucresiaRequest):
    """Gera sequência de stories estratégicos com a Lucresia"""
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="AI API não configurada")
    
    # Buscar perfil de marca ativo
    brand_profile_doc = await db.brand_profiles.find_one({"is_active": True}, {"_id": 0})
    if not brand_profile_doc:
        # Usar perfil padrão se não houver configurado
        brand_profile = BrandProfile(
            nome_marca="Sua Clínica",
            segmento="estética avançada"
        )
    else:
        # Converter timestamps se necessário
        if isinstance(brand_profile_doc.get('created_at'), str):
            brand_profile_doc['created_at'] = datetime.fromisoformat(brand_profile_doc['created_at'])
        if isinstance(brand_profile_doc.get('updated_at'), str):
            brand_profile_doc['updated_at'] = datetime.fromisoformat(brand_profile_doc['updated_at'])
        brand_profile = BrandProfile(**brand_profile_doc)
    
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    prompt = f"""Crie uma sequência de {request.num_stories} stories estratégicos para Instagram.

PROCEDIMENTO/SERVIÇO: {request.procedimento}
OBJETIVO ESTRATÉGICO: {request.objetivo}
PÚBLICO-ALVO: {request.publico}

Para cada story, forneça EXATAMENTE neste formato JSON:

{{
  "stories": [
    {{
      "numero": 1,
      "texto_principal": "O texto que aparecerá no story",
      "intencao_estrategica": "O que queremos que a cliente sinta/pense",
      "gatilho_psicologico": "Qual gatilho está sendo ativado (autoridade, prova social, escassez, etc)",
      "cta_discreto": "Ação sutil que queremos provocar"
    }}
  ]
}}

Lembre-se:
- Cada story deve ter uma função específica na jornada
- A sequência deve construir confiança progressivamente
- O último story deve ter um CTA mais direto (mas nunca apelativo)
- Use linguagem que transmita: "Essa profissional sabe exatamente o que está fazendo."

Responda APENAS com o JSON, sem explicações adicionais."""

    try:
        # Gerar system prompt personalizado com o perfil da marca
        system_prompt = get_lucresia_system_prompt(brand_profile)
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"lucresia-{str(uuid.uuid4())[:8]}",
            system_message=system_prompt
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Try to parse JSON response
        import json
        try:
            # Clean response if needed
            cleaned = response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            
            result = json.loads(cleaned)
            return {
                "success": True,
                "procedimento": request.procedimento,
                "objetivo": request.objetivo,
                "stories": result.get("stories", [])
            }
        except json.JSONDecodeError:
            # Return raw text if JSON parsing fails
            return {
                "success": True,
                "procedimento": request.procedimento,
                "objetivo": request.objetivo,
                "raw_content": response
            }
        
    except Exception as e:
        logger.error(f"Lucresia generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao gerar conteúdo: {str(e)}")


@api_router.post("/ai/lucresia/titulo")
async def generate_lucresia_titulo(request: AITextRequest):
    """Gera títulos estratégicos para posts de estética"""
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="AI API não configurada")
    
    # Buscar perfil de marca ativo
    brand_profile_doc = await db.brand_profiles.find_one({"is_active": True}, {"_id": 0})
    if not brand_profile_doc:
        brand_profile = BrandProfile(nome_marca="Sua Clínica", segmento="estética avançada")
    else:
        if isinstance(brand_profile_doc.get('created_at'), str):
            brand_profile_doc['created_at'] = datetime.fromisoformat(brand_profile_doc['created_at'])
        if isinstance(brand_profile_doc.get('updated_at'), str):
            brand_profile_doc['updated_at'] = datetime.fromisoformat(brand_profile_doc['updated_at'])
        brand_profile = BrandProfile(**brand_profile_doc)
    
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    prompt = f"""Crie 5 títulos estratégicos para post sobre: {request.context}

Regras:
- Máximo 50 caracteres cada
- Tom de autoridade, não apelativo
- Linguagem elegante e profissional
- Foco em resultado, não em promoção

Formato de resposta (uma linha por título):
TÍTULO 1: [título]
TÍTULO 2: [título]
TÍTULO 3: [título]
TÍTULO 4: [título]
TÍTULO 5: [título]"""

    try:
        system_prompt = get_lucresia_system_prompt(brand_profile)
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"lucresia-titulo-{str(uuid.uuid4())[:8]}",
            system_message=system_prompt
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return {
            "success": True,
            "type": "titulos",
            "context": request.context,
            "brand": brand_profile.nome_marca,
            "content": response
        }
        
    except Exception as e:
        logger.error(f"Lucresia titulo error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao gerar títulos: {str(e)}")


@api_router.post("/ai/lucresia/copy")
async def generate_lucresia_copy(request: AITextRequest):
    """Gera copy estratégico para posts de estética"""
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="AI API não configurada")
    
    # Buscar perfil de marca ativo
    brand_profile_doc = await db.brand_profiles.find_one({"is_active": True}, {"_id": 0})
    if not brand_profile_doc:
        brand_profile = BrandProfile(nome_marca="Sua Clínica", segmento="estética avançada")
    else:
        if isinstance(brand_profile_doc.get('created_at'), str):
            brand_profile_doc['created_at'] = datetime.fromisoformat(brand_profile_doc['created_at'])
        if isinstance(brand_profile_doc.get('updated_at'), str):
            brand_profile_doc['updated_at'] = datetime.fromisoformat(brand_profile_doc['updated_at'])
        brand_profile = BrandProfile(**brand_profile_doc)
    
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    prompt = f"""Crie um copy estratégico para post sobre: {request.context}

Tom desejado: {request.tone}

Estrutura:
1. GANCHO (frase de abertura que captura atenção sem ser apelativa)
2. DESENVOLVIMENTO (2-3 frases que constroem autoridade)
3. PROVA/CREDIBILIDADE (elemento que gera confiança)
4. CTA DISCRETO (chamada para ação elegante)

Regras:
- Nunca use "corra", "últimas vagas", "promoção imperdível"
- Linguagem firme e profissional
- Frases curtas e impactantes
- Tom de quem não precisa convencer

Formato de resposta:
GANCHO: [texto]
DESENVOLVIMENTO: [texto]
CREDIBILIDADE: [texto]
CTA: [texto]"""

    try:
        system_prompt = get_lucresia_system_prompt(brand_profile)
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"lucresia-copy-{str(uuid.uuid4())[:8]}",
            system_message=system_prompt
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return {
            "success": True,
            "type": "copy",
            "context": request.context,
            "tone": request.tone,
            "brand": brand_profile.nome_marca,
            "content": response
        }
        
    except Exception as e:
        logger.error(f"Lucresia copy error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao gerar copy: {str(e)}")


@api_router.post("/ai/lucresia/hashtags")
async def generate_lucresia_hashtags(request: AITextRequest):
    """Gera hashtags estratégicas para o nicho de estética"""
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="AI API não configurada")
    
    # Buscar perfil de marca ativo
    brand_profile_doc = await db.brand_profiles.find_one({"is_active": True}, {"_id": 0})
    if not brand_profile_doc:
        brand_profile = BrandProfile(nome_marca="Sua Clínica", segmento="estética avançada")
    else:
        if isinstance(brand_profile_doc.get('created_at'), str):
            brand_profile_doc['created_at'] = datetime.fromisoformat(brand_profile_doc['created_at'])
        if isinstance(brand_profile_doc.get('updated_at'), str):
            brand_profile_doc['updated_at'] = datetime.fromisoformat(brand_profile_doc['updated_at'])
        brand_profile = BrandProfile(**brand_profile_doc)
    
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    prompt = f"""Crie 15 hashtags estratégicas para post sobre: {request.context}

Distribua assim:
- 5 hashtags de alto volume (populares no nicho de estética)
- 5 hashtags de médio volume (mais específicas)
- 5 hashtags de nicho (bem direcionadas ao procedimento)

Regras:
- Foco no mercado de estética profissional
- Hashtags que atraem clientes, não curiosos
- Mix entre português e termos técnicos conhecidos

Formato (uma por linha, sem #):
ALTO VOLUME:
[hashtag1]
[hashtag2]
...

MÉDIO VOLUME:
[hashtag1]
...

NICHO:
[hashtag1]
..."""

    try:
        system_prompt = get_lucresia_system_prompt(brand_profile)
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"lucresia-hash-{str(uuid.uuid4())[:8]}",
            system_message=system_prompt
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return {
            "success": True,
            "type": "hashtags",
            "context": request.context,
            "brand": brand_profile.nome_marca,
            "content": response
        }
        
    except Exception as e:
        logger.error(f"Lucresia hashtags error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao gerar hashtags: {str(e)}")


# Manter endpoint antigo para compatibilidade
@api_router.post("/ai/generate-text")
async def generate_marketing_text(request: AITextRequest):
    """Endpoint de compatibilidade - redireciona para Lucresia"""
    if request.prompt_type == "titulo":
        return await generate_lucresia_titulo(request)
    elif request.prompt_type == "hashtags":
        return await generate_lucresia_hashtags(request)
    else:
        return await generate_lucresia_copy(request)

# ============= BLOG POSTS =============

@api_router.get("/blog/posts", response_model=List[BlogPost])
async def get_blog_posts(status: Optional[str] = None):
    """Lista todos os artigos de blog"""
    query = {}
    if status:
        query["status"] = status
    
    posts = await db.blog_posts.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for p in posts:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
        if isinstance(p.get('updated_at'), str):
            p['updated_at'] = datetime.fromisoformat(p['updated_at'])
    
    return posts

@api_router.get("/blog/posts/{post_id}", response_model=BlogPost)
async def get_blog_post(post_id: str):
    """Recupera um artigo específico"""
    post = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    return post

@api_router.post("/blog/posts/{post_id}", response_model=BlogPost)
async def update_blog_post(post_id: str, post_data: BlogPostUpdate):
    """Atualiza um artigo"""
    existing = await db.blog_posts.find_one({"id": post_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    
    update_data = {k: v for k, v in post_data.model_dump().items() if v is not None}
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
    
    updated = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    return updated

@api_router.delete("/blog/posts/{post_id}")
async def delete_blog_post(post_id: str):
    """Deleta um artigo"""
    result = await db.blog_posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    return {"message": "Artigo deletado com sucesso"}

# ============= NOVAS FUNCIONALIDADES =============

# 📅 Agendamento de Publicação
@api_router.post("/blog/posts/{post_id}/agendar")
async def schedule_blog_post(post_id: str, data_agendamento: str):
    """Agenda a publicação de um artigo para data/hora específica"""
    try:
        scheduled_datetime = datetime.fromisoformat(data_agendamento)
    except:
        raise HTTPException(status_code=400, detail="Data inválida. Use formato ISO: 2026-02-15T14:30:00")
    
    update_data = {
        "status": "agendado",
        "data_agendamento": scheduled_datetime.isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    
    updated = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    return {"message": f"Artigo agendado para {data_agendamento}", "post": updated}

# 📊 Validação de SEO
@api_router.post("/blog/posts/{post_id}/validar-seo")
async def validate_seo(post_id: str):
    """Valida checklist de SEO do artigo"""
    post = await db.blog_posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    
    checks = {
        "meta_description": len(post.get("meta_description", "")) >= 50 and len(post.get("meta_description", "")) <= 160,
        "foco_keyword_no_titulo": (post.get("foco_keyword", "").lower() in post.get("titulo", "").lower()),
        "tem_imagem": bool(post.get("imagem_destaque")),
        "tem_alt_text": bool(post.get("alt_text_imagem")),
        "tem_cta": bool(post.get("cta")),
        "tem_palavras_chave": len(post.get("palavras_chave_seo", [])) >= 3,
        "tempo_leitura": post.get("tempo_leitura_minutos", 0) > 0
    }
    
    score = sum(checks.values()) / len(checks) * 100
    
    update_data = {
        "densidade_keyword": score,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
    
    return {
        "seo_score": round(score, 1),
        "checks": checks,
        "recomendacoes": [k for k, v in checks.items() if not v]
    }

# 🔄 Histórico de Versões
@api_router.post("/blog/posts/{post_id}/salvar-versao")
async def save_version(post_id: str):
    """Salva versão atual do artigo no histórico"""
    post = await db.blog_posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    
    version_data = {
        "versao": post.get("versao_atual", 1) + 1,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "titulo": post.get("titulo"),
        "introducao": post.get("introducao"),
        "conteudo_preview": post.get("conclusao")[:100] if post.get("conclusao") else ""
    }
    
    update_data = {
        "versoes": post.get("versoes", []) + [version_data],
        "versao_atual": version_data["versao"],
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
    return {"message": f"Versão {version_data['versao']} salva com sucesso", "versao": version_data}

@api_router.get("/blog/posts/{post_id}/versoes")
async def get_versions(post_id: str):
    """Retorna histórico de versões"""
    post = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    
    return {
        "versao_atual": post.get("versao_atual", 1),
        "versoes": post.get("versoes", [])
    }

# 📱 Preview em Múltiplos Formatos
@api_router.get("/blog/posts/{post_id}/preview-multiplo")
async def get_multiple_previews(post_id: str):
    """Retorna preview em diferentes formatos e dispositivos"""
    post = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    
    return {
        "desktop": {
            "width": 1920,
            "height": 1080,
            "preview": f"<h1>{post.get('titulo')}</h1><p>{post.get('introducao')}</p>"
        },
        "tablet": {
            "width": 768,
            "height": 1024,
            "preview": f"<h1 style='font-size:24px'>{post.get('titulo')}</h1><p>{post.get('introducao')}</p>"
        },
        "mobile": {
            "width": 375,
            "height": 667,
            "preview": f"<h1 style='font-size:18px'>{post.get('titulo')}</h1><p style='font-size:14px'>{post.get('introducao')}</p>"
        },
        "instagram": {
            "width": 1080,
            "height": 1350,
            "preview": f"<div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);'><h1 style='color:white;text-align:center'>{post.get('titulo')}</h1></div>"
        },
        "linkedin": {
            "width": 1200,
            "height": 627,
            "preview": f"<div style='background:#F3F6F9;padding:20px'><h1>{post.get('titulo')}</h1><p>{post.get('introducao')}</p></div>"
        }
    }

# 📑 Rascunhos Automáticos
@api_router.post("/blog/posts/{post_id}/autosave")
async def autosave_draft(post_id: str, conteudo: Dict[str, Any]):
    """Salva rascunho automático"""
    update_data = {
        "conteudo_autosalvo": conteudo,
        "ultimo_autosave": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    
    return {"message": "Rascunho salvo automaticamente"}

@api_router.post("/blog/posts/{post_id}/restaurar-autosave")
async def restore_autosave(post_id: str):
    """Restaura último rascunho automático"""
    post = await db.blog_posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    
    if not post.get("conteudo_autosalvo"):
        raise HTTPException(status_code=400, detail="Nenhum rascunho salvo disponível")
    
    return {
        "conteudo": post.get("conteudo_autosalvo"),
        "salvo_em": post.get("ultimo_autosave")
    }

# 🏷️ Categorias e Subcategorias
@api_router.get("/blog/categorias")
async def get_categories():
    """Retorna categorias padrão"""
    return {
        "categorias": [
            {"id": "procedimentos", "nome": "Procedimentos", "subcategorias": ["harmonização", "botox", "preenchimento", "pele"]},
            {"id": "resultados", "nome": "Resultados", "subcategorias": ["antes-depois", "testimonios", "cases"]},
            {"id": "educacao", "nome": "Educação", "subcategorias": ["guias", "dicas", "faq", "tutorial"]},
            {"id": "tendencias", "nome": "Tendências", "subcategorias": ["beleza-2026", "inovacoes", "pesquisas"]},
            {"id": "bem-estar", "nome": "Bem-estar", "subcategorias": ["saude", "lifestyle", "skincare"]}
        ]
    }

@api_router.post("/blog/posts/{post_id}/categorizar")
async def categorize_post(post_id: str, categoria: str, subcategorias: List[str] = []):
    """Atribui categoria e subcategorias a um artigo"""
    update_data = {
        "categoria": categoria,
        "subcategorias": subcategorias,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    
    return {"message": "Artigo categorizado com sucesso"}

# 🎭 Templates de Seções
@api_router.get("/blog/templates-secoes")
async def get_section_templates():
    """Retorna templates de seções disponíveis"""
    return {
        "templates": [
            {
                "tipo": "antes-depois",
                "nome": "Antes e Depois",
                "descricao": "Comparação de resultados com imagens",
                "estrutura": {"titulo": "str", "resultado_antes": "str", "resultado_depois": "str"}
            },
            {
                "tipo": "faq",
                "nome": "Perguntas Frequentes",
                "descricao": "FAQ sobre o procedimento",
                "estrutura": {"pergunta": "str", "resposta": "str"}
            },
            {
                "tipo": "case",
                "nome": "Case de Sucesso",
                "descricao": "História de sucesso de um paciente",
                "estrutura": {"paciente": "str", "problema": "str", "solucao": "str", "resultado": "str"}
            },
            {
                "tipo": "comparacao",
                "nome": "Comparação",
                "descricao": "Comparar dois procedimentos ou produtos",
                "estrutura": {"opcao1": "str", "opcao2": "str", "vencedor": "str"}
            }
        ]
    }

@api_router.post("/blog/posts/{post_id}/adicionar-secao-template")
async def add_template_section(post_id: str, tipo_secao: str, conteudo: Dict[str, str]):
    """Adiciona uma seção baseada em template"""
    post = await db.blog_posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    
    nova_secao = {
        "titulo": conteudo.get("titulo", tipo_secao),
        "conteudo": str(conteudo),
        "tipo": tipo_secao
    }
    
    update_data = {
        "secoes": post.get("secoes", []) + [nova_secao],
        "tipos_secoes": list(set(post.get("tipos_secoes", []) + [tipo_secao])),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
    return {"message": "Seção adicionada com sucesso", "secao": nova_secao}

# 🔗 Links Inteligentes para SEO
@api_router.post("/blog/posts/{post_id}/sugerir-links-internos")
async def suggest_internal_links(post_id: str):
    """Sugere links internos baseado no conteúdo"""
    post = await db.blog_posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    
    # Buscar artigos relacionados pela palavra-chave
    keywords = post.get("palavras_chave_seo", [])
    
    related_posts = await db.blog_posts.find({
        "id": {"$ne": post_id},
        "palavras_chave_seo": {"$in": keywords}
    }, {"_id": 0, "id": 1, "titulo": 1}).to_list(5)
    
    suggestions = []
    for related in related_posts:
        suggestions.append({
            "texto": related.get("titulo"),
            "url": f"/blog/{related.get('id')}",
            "relevancia": "alta"
        })
    
    return {"sugestoes_links": suggestions}

@api_router.post("/blog/posts/{post_id}/adicionar-links")
async def add_links(post_id: str, links_internos: List[Dict[str, str]] = [], links_externos: List[Dict[str, str]] = []):
    """Adiciona links internos e externos"""
    update_data = {
        "links_internos": links_internos,
        "links_externos": links_externos,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    
    return {"message": "Links adicionados com sucesso"}

# 📈 Analytics Básico
@api_router.get("/blog/posts/{post_id}/analytics")
async def get_post_analytics(post_id: str):
    """Retorna analytics do artigo"""
    post = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    
    return {
        "titulo": post.get("titulo"),
        "visualizacoes": post.get("visualizacoes", 0),
        "compartilhamentos": post.get("compartilhamentos", 0),
        "comentarios": post.get("comentarios", 0),
        "data_criacao": post.get("created_at"),
        "data_primeira_publicacao": post.get("data_primeira_publicacao"),
        "status": post.get("status"),
        "tempo_leitura": f"{post.get('tempo_leitura_minutos', 5)} min"
    }

@api_router.post("/blog/posts/{post_id}/incrementar-view")
async def increment_view(post_id: str):
    """Incrementa contador de visualizações"""
    post = await db.blog_posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    
    novo_count = post.get("visualizacoes", 0) + 1
    await db.blog_posts.update_one({"id": post_id}, {"$set": {"visualizacoes": novo_count}})
    
    return {"visualizacoes": novo_count}

# 📤 Exportar para Plataformas
@api_router.post("/blog/posts/{post_id}/exportar")
async def export_post(post_id: str, formato: str = "html"):
    """Exporta artigo em diferentes formatos"""
    post = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    
    if formato == "html":
        html_content = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{post.get('titulo')}</title>
    <meta name="description" content="{post.get('meta_description', post.get('introducao', '')[:160])}">
</head>
<body>
    <h1>{post.get('titulo')}</h1>
    <p>{post.get('introducao')}</p>
    {"".join([f"<h2>{s.get('titulo')}</h2><p>{s.get('conteudo')}</p>" for s in post.get('secoes', [])])}
    <p>{post.get('conclusao')}</p>
    <p><strong>CTA:</strong> {post.get('cta')}</p>
</body>
</html>"""
        return {"formato": "html", "conteudo": html_content}
    
    elif formato == "markdown":
        md_content = f"""# {post.get('titulo')}

{post.get('introducao')}

{"".join([f"## {s.get('titulo')}\\n{s.get('conteudo')}\\n\\n" for s in post.get('secoes', [])])}

## Conclusão
{post.get('conclusao')}

### CTA
{post.get('cta')}

---
Palavras-chave: {', '.join(post.get('palavras_chave_seo', []))}
"""
        return {"formato": "markdown", "conteudo": md_content}
    
    else:
        return {"erro": "Formato não suportado"}

@api_router.post("/blog/posts/{post_id}/publicar-plataforma")
async def publish_to_platform(post_id: str, plataforma: str):
    """Registra publicação em plataforma externa"""
    post = await db.blog_posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    
    urls_publicadas = post.get("urls_publicadas", {})
    urls_publicadas[plataforma] = f"https://{plataforma}.com/seu-artigo-{post_id[:8]}"
    
    formatos_exportados = post.get("formatos_exportados", [])
    if plataforma not in formatos_exportados:
        formatos_exportados.append(plataforma)
    
    update_data = {
        "urls_publicadas": urls_publicadas,
        "formatos_exportados": formatos_exportados,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
    
    return {
        "message": f"Publicação registrada em {plataforma}",
        "url": urls_publicadas[plataforma]
    }

@api_router.post("/ai/lucresia/blog-post")
async def generate_lucresia_blog_post(request: BlogPostRequest):
    """Gera artigo completo de blog com Lucresia"""
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="AI API não configurada")
    
    # Buscar perfil de marca ativo
    brand_profile_doc = await db.brand_profiles.find_one({"is_active": True}, {"_id": 0})
    if not brand_profile_doc:
        brand_profile = BrandProfile(nome_marca="Sua Clínica", segmento="estética avançada")
    else:
        if isinstance(brand_profile_doc.get('created_at'), str):
            brand_profile_doc['created_at'] = datetime.fromisoformat(brand_profile_doc['created_at'])
        if isinstance(brand_profile_doc.get('updated_at'), str):
            brand_profile_doc['updated_at'] = datetime.fromisoformat(brand_profile_doc['updated_at'])
        brand_profile = BrandProfile(**brand_profile_doc)
    
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    # Criar slug a partir do tópico
    slug = request.topico.lower().replace(" ", "-").replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u")
    
    palavras_chave_str = ", ".join(request.palavras_chave) if request.palavras_chave else request.topico
    
    prompt = f"""Crie um artigo de blog estratégico e de qualidade sobre: {request.topico}

OBJETIVO: {request.objetivo}
PÚBLICO-ALVO: {request.publico_alvo}
PALAVRAS-CHAVE: {palavras_chave_str}
NÚMERO DE SEÇÕES: {request.num_secoes}

Estrutura obrigatória (responda APENAS em JSON):

{{
  "titulo": "Título impactante do artigo (máx 60 caracteres)",
  "introducao": "Parágrafo de introdução (2-3 frases) que captura atenção",
  "secoes": [
    {{
      "titulo": "Título da seção 1",
      "conteudo": "Conteúdo completo da seção (3-5 parágrafos, bem desenvolvido)"
    }},
    {{
      "titulo": "Título da seção 2",
      "conteudo": "Conteúdo..."
    }}
  ],
  "conclusao": "Conclusão estratégica (2-3 parágrafos)",
  "cta": "Chamada para ação elegante e discreta",
  "palavras_chave_seo": ["palavra1", "palavra2", "palavra3"],
  "sugestoes_imagens": ["termo de busca para imagem 1", "termo de busca para imagem 2", "termo de busca para imagem de capa"]
}}

REGRAS OBRIGATÓRIAS:
- Tom: {brand_profile.tom_de_voz}
- Linguagem: {brand_profile.estilo_comunicacao}
- Evitar: {', '.join(brand_profile.palavras_evitar)}
- Usar palavras-chave: {', '.join(brand_profile.palavras_chave[:5])}
- Cada seção deve ter 250-400 palavras
- Foco em educação e autoridade, não em vendas diretas
- Estrutura: problema → solução → benefícios → ação

Responda APENAS com o JSON, sem explicações adicionais."""

    try:
        system_prompt = get_lucresia_system_prompt(brand_profile)
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"lucresia-blog-{str(uuid.uuid4())[:8]}",
            system_message=system_prompt
        ).with_model("openai", "gpt-4o")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        import json
        try:
            cleaned = response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            
            blog_data = json.loads(cleaned)
            
            # Extrair cor de destaque do perfil
            cor_destaque = brand_profile.cores_primarias[0] if brand_profile.cores_primarias else "#8B5CF6"
            
            # Criar post
            post = BlogPost(
                titulo=blog_data.get("titulo", request.topico),
                slug=slug,
                introducao=blog_data.get("introducao", ""),
                secoes=blog_data.get("secoes", []),
                conclusao=blog_data.get("conclusao", ""),
                cta=blog_data.get("cta", ""),
                topico=request.topico,
                objetivo=request.objetivo,
                palavras_chave_seo=blog_data.get("palavras_chave_seo", []),
                tags=[request.topico, brand_profile.nome_marca],
                sugestoes_imagens=blog_data.get("sugestoes_imagens", [request.topico, f"{request.topico} conceito", f"{request.topico} ilustração"]),
                template_diagramacao="clean",
                cor_destaque=cor_destaque,
                marca_id=brand_profile_doc.get("id") if brand_profile_doc else None,
                marca_nome=brand_profile.nome_marca,
                status="rascunho"
            )
            
            # Salvar no banco
            doc = post.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            doc['updated_at'] = doc['updated_at'].isoformat()
            await db.blog_posts.insert_one(doc)
            
            return {
                "success": True,
                "post": post.model_dump()
            }
        except json.JSONDecodeError:
            # Se não conseguir parsear JSON, retornar conteúdo raw
            return {
                "success": False,
                "error": "Não foi possível fazer parse do conteúdo gerado",
                "raw_content": response
            }
        
    except Exception as e:
        logger.error(f"Blog generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao gerar artigo: {str(e)}")

# ============= SOCIAL PUBLISHING =============

@api_router.post("/blog/posts/{post_id}/publicar-automatico")
async def publish_to_platforms_auto(post_id: str, platforms: List[str]):
    """Publica automaticamente em múltiplas plataformas"""
    from social_publisher import PublisherOrchestrator
    
    try:
        # Buscar post
        post = await db.blog_posts.find_one({"id": post_id}, {"_id": 0})
        if not post:
            raise HTTPException(status_code=404, detail="Post não encontrado")
        
        # Validar plataformas
        valid_platforms = ["medium", "devto", "wordpress", "linkedin", "twitter", "notion"]
        platforms = [p for p in platforms if p in valid_platforms]
        
        if not platforms:
            raise HTTPException(status_code=400, detail="Nenhuma plataforma válida fornecida")
        
        # Obter database ID do Notion (se necessário)
        notion_db_id = None
        if "notion" in platforms:
            notion_db_id = os.environ.get('NOTION_DATABASE_ID', '')
        
        # Publicar
        results = await PublisherOrchestrator.publish_to_platforms(
            post.model_dump() if hasattr(post, 'model_dump') else post,
            platforms,
            notion_db_id
        )
        
        # Atualizar post com URLs publicadas
        urls_publicadas = post.get("urls_publicadas", {})
        formatos_exportados = post.get("formatos_exportados", [])
        
        for success in results.get("success", []):
            platform = success.get("platform")
            url = success.get("url") or success.get("post_id")
            if platform and url:
                urls_publicadas[platform] = url
                if platform not in formatos_exportados:
                    formatos_exportados.append(platform)
        
        update_data = {
            "urls_publicadas": urls_publicadas,
            "formatos_exportados": formatos_exportados,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
        
        return {
            "success": True,
            "results": results,
            "post_id": post_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao publicar automaticamente: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao publicar: {str(e)}")

@api_router.get("/blog/publicar-status")
async def get_publishing_config():
    """Retorna status e configuração de publicação"""
    return {
        "platforms": {
            "medium": {
                "enabled": bool(os.environ.get("MEDIUM_API_TOKEN")),
                "name": "Medium",
                "icon": "📝",
                "description": "Plataforma de blog"
            },
            "devto": {
                "enabled": bool(os.environ.get("DEVTO_API_KEY")),
                "name": "Dev.to",
                "icon": "🎯",
                "description": "Comunidade de desenvolvedores"
            },
            "wordpress": {
                "enabled": bool(os.environ.get("WORDPRESS_URL")),
                "name": "WordPress",
                "icon": "🔵",
                "description": "CMS personalizado"
            },
            "linkedin": {
                "enabled": bool(os.environ.get("LINKEDIN_ACCESS_TOKEN")),
                "name": "LinkedIn",
                "icon": "💼",
                "description": "Rede profissional"
            },
            "twitter": {
                "enabled": bool(os.environ.get("TWITTER_BEARER_TOKEN")),
                "name": "Twitter/X",
                "icon": "𝕏",
                "description": "Rede social"
            },
            "notion": {
                "enabled": bool(os.environ.get("NOTION_API_TOKEN")),
                "name": "Notion",
                "icon": "💡",
                "description": "Wiki e documentação"
            }
        }
    }

@api_router.post("/blog/posts/{post_id}/agendar-publicacao")
async def schedule_publication(post_id: str, data_publicacao: str, platforms: List[str] = ["medium"]):
    """Agenda publicação automática para data/hora específica"""
    try:
        scheduled_datetime = datetime.fromisoformat(data_publicacao)
    except:
        raise HTTPException(status_code=400, detail="Data inválida. Use formato ISO: 2026-02-15T14:30:00")
    
    if scheduled_datetime <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Data não pode ser no passado")
    
    post = await db.blog_posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    
    # Criar job de agendamento
    scheduled_job = {
        "id": str(uuid.uuid4()),
        "post_id": post_id,
        "scheduled_at": scheduled_datetime.isoformat(),
        "platforms": platforms,
        "status": "agendado",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Salvar no banco
    await db.scheduled_publications.insert_one(scheduled_job)
    
    update_data = {
        "data_agendamento": scheduled_datetime.isoformat(),
        "status": "agendado",
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
    
    return {
        "success": True,
        "message": f"Publicação agendada para {data_publicacao}",
        "job_id": scheduled_job["id"],
        "platforms": platforms
    }

@api_router.get("/blog/publicacoes-agendadas")
async def get_scheduled_publications():
    """Lista todas as publicações agendadas"""
    scheduled = await db.scheduled_publications.find(
        {"status": "agendado"},
        {"_id": 0}
    ).sort("scheduled_at", 1).to_list(100)
    
    return {
        "total": len(scheduled),
        "publications": scheduled
    }

# ============= GOOGLE CALENDAR INTEGRATION =============

@api_router.get("/google-calendar/auth-url")
async def get_google_calendar_auth_url():
    """Retorna URL de autenticação do Google Calendar"""
    from google_calendar_config import GoogleCalendarConfig
    
    try:
        config = GoogleCalendarConfig()
        if not config.is_configured():
            raise HTTPException(status_code=500, detail="Google Calendar não configurado")
        
        # Gerar state para CSRF protection
        state = str(uuid.uuid4())
        
        # Construir URL OAuth
        auth_url = config.get_auth_url(state)
        
        return {
            "success": True,
            "auth_url": auth_url,
            "state": state
        }
    except Exception as e:
        logger.error(f"Google Calendar auth URL error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao gerar URL de autenticação: {str(e)}")

@api_router.post("/google-calendar/callback")
async def handle_google_calendar_callback(code: str, state: str, user_id: Optional[str] = None):
    """Manipula callback OAuth do Google Calendar"""
    from google_calendar_manager import GoogleCalendarManager
    
    try:
        manager = GoogleCalendarManager()
        
        # Trocar código por tokens
        tokens = manager.exchange_code_for_tokens(code, state)
        
        if not tokens:
            raise HTTPException(status_code=400, detail="Falha ao obter tokens do Google")
        
        # Se user_id fornecido, salvar tokens no banco
        if user_id:
            from cryptography.fernet import Fernet
            
            # Usar chave de criptografia do ambiente ou gerar uma
            encryption_key = os.environ.get('ENCRYPTION_KEY', Fernet.generate_key().decode())
            cipher = Fernet(encryption_key)
            
            # Criptografar tokens
            access_token_encrypted = cipher.encrypt(tokens['access_token'].encode()).decode()
            refresh_token_encrypted = cipher.encrypt(tokens['refresh_token'].encode()).decode()
            
            # Salvar ou atualizar usuário
            user_update = {
                "google_calendar_connected": True,
                "google_calendar_token": access_token_encrypted,
                "google_calendar_refresh": refresh_token_encrypted,
                "google_calendar_expiry": tokens.get('expiry'),
                "google_calendar_email": tokens.get('email'),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.users.update_one(
                {"id": user_id},
                {"$set": user_update},
                upsert=True
            )
        
        return {
            "success": True,
            "message": "Google Calendar conectado com sucesso",
            "google_calendar_email": tokens.get('email'),
            "expires_in": tokens.get('expires_in')
        }
    except Exception as e:
        logger.error(f"Google Calendar callback error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao processar callback: {str(e)}")

@api_router.post("/blog/posts/{post_id}/sync-google-calendar")
async def sync_post_to_google_calendar(post_id: str, user_id: str):
    """Sincroniza um post de blog com Google Calendar"""
    from google_calendar_manager import GoogleCalendarManager
    from cryptography.fernet import Fernet
    
    try:
        # Buscar post
        post = await db.blog_posts.find_one({"id": post_id})
        if not post:
            raise HTTPException(status_code=404, detail="Post não encontrado")
        
        # Buscar usuário
        user = await db.users.find_one({"id": user_id})
        if not user or not user.get("google_calendar_connected"):
            raise HTTPException(status_code=401, detail="Google Calendar não conectado")
        
        # Descriptografar tokens
        encryption_key = os.environ.get('ENCRYPTION_KEY', Fernet.generate_key().decode())
        cipher = Fernet(encryption_key)
        
        access_token = cipher.decrypt(user["google_calendar_token"].encode()).decode()
        refresh_token = cipher.decrypt(user["google_calendar_refresh"].encode()).decode()
        
        # Criar manager com tokens do usuário
        manager = GoogleCalendarManager()
        manager.service.credentials.token = access_token
        manager.service.credentials.refresh_token = refresh_token
        
        # Criar evento no Google Calendar
        event_data = {
            "title": post.get("titulo"),
            "description": post.get("introducao"),
            "start_time": post.get("data_agendamento") or datetime.now(timezone.utc),
            "category": post.get("categoria", "Blog"),
            "seo_score": post.get("densidade_keyword", 0)
        }
        
        event = manager.create_calendar_event(event_data)
        
        if not event:
            raise HTTPException(status_code=500, detail="Erro ao criar evento no Google Calendar")
        
        # Atualizar post com referência do evento
        event_id = event.get("id")
        update_data = {
            "google_calendar_event_id": event_id,
            "google_calendar_synced": True,
            "google_calendar_sync_date": datetime.now(timezone.utc).isoformat(),
            "google_calendar_calendar_url": f"https://calendar.google.com/calendar/u/0/r/eventedit/{event_id}",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
        
        return {
            "success": True,
            "message": "Post sincronizado com Google Calendar",
            "event_id": event_id,
            "calendar_url": update_data["google_calendar_calendar_url"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google Calendar sync error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao sincronizar: {str(e)}")

@api_router.post("/blog/posts/{post_id}/disconnect-google-calendar")
async def disconnect_post_from_google_calendar(post_id: str, user_id: str):
    """Remove sincronização de um post com Google Calendar"""
    from google_calendar_manager import GoogleCalendarManager
    from cryptography.fernet import Fernet
    
    try:
        # Buscar post
        post = await db.blog_posts.find_one({"id": post_id})
        if not post:
            raise HTTPException(status_code=404, detail="Post não encontrado")
        
        if not post.get("google_calendar_event_id"):
            raise HTTPException(status_code=400, detail="Post não está sincronizado com Google Calendar")
        
        # Buscar usuário
        user = await db.users.find_one({"id": user_id})
        if not user or not user.get("google_calendar_connected"):
            raise HTTPException(status_code=401, detail="Google Calendar não conectado")
        
        # Descriptografar tokens
        encryption_key = os.environ.get('ENCRYPTION_KEY', Fernet.generate_key().decode())
        cipher = Fernet(encryption_key)
        
        access_token = cipher.decrypt(user["google_calendar_token"].encode()).decode()
        refresh_token = cipher.decrypt(user["google_calendar_refresh"].encode()).decode()
        
        # Criar manager com tokens do usuário
        manager = GoogleCalendarManager()
        manager.service.credentials.token = access_token
        manager.service.credentials.refresh_token = refresh_token
        
        # Deletar evento do Google Calendar
        success = manager.delete_calendar_event(post["google_calendar_event_id"])
        
        if not success:
            raise HTTPException(status_code=500, detail="Erro ao deletar evento do Google Calendar")
        
        # Atualizar post
        update_data = {
            "google_calendar_event_id": None,
            "google_calendar_synced": False,
            "google_calendar_sync_date": None,
            "google_calendar_calendar_url": None,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.blog_posts.update_one({"id": post_id}, {"$set": update_data})
        
        return {
            "success": True,
            "message": "Sincronização com Google Calendar removida"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google Calendar disconnect error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao desconectar: {str(e)}")

@api_router.get("/google-calendar/events")
async def get_google_calendar_events(user_id: str):
    """Lista eventos de blog sincronizados no Google Calendar"""
    from google_calendar_manager import GoogleCalendarManager
    from cryptography.fernet import Fernet
    
    try:
        # Buscar usuário
        user = await db.users.find_one({"id": user_id})
        if not user or not user.get("google_calendar_connected"):
            raise HTTPException(status_code=401, detail="Google Calendar não conectado")
        
        # Descriptografar tokens
        encryption_key = os.environ.get('ENCRYPTION_KEY', Fernet.generate_key().decode())
        cipher = Fernet(encryption_key)
        
        access_token = cipher.decrypt(user["google_calendar_token"].encode()).decode()
        refresh_token = cipher.decrypt(user["google_calendar_refresh"].encode()).decode()
        
        # Criar manager com tokens do usuário
        manager = GoogleCalendarManager()
        manager.service.credentials.token = access_token
        manager.service.credentials.refresh_token = refresh_token
        
        # Listar eventos
        events = manager.list_calendar_events()
        
        return {
            "success": True,
            "events": events,
            "total": len(events)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Google Calendar events error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao listar eventos: {str(e)}")

# ============= EXPORT =============

@api_router.post("/export/canvas")
async def export_canvas(data: dict):
    """Receive canvas data and return info for client-side export"""
    # The actual export happens client-side with html2canvas/fabric
    # This endpoint can be used to save export history or process server-side if needed
    return {
        "message": "Use client-side export with Fabric.js toDataURL()",
        "formats": ["png", "jpeg", "svg"],
        "tip": "Para melhor qualidade, use multiplier: 2 no toDataURL"
    }

# ============= INCLUDE ROUTER =============

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
