"""
NOVOS MODELOS E ENDPOINTS PARA:
- Story (1080x1920px)
- Carrossel (1080x1350px)
- Feed Post (1080x1080px)

Com suporte a:
- Geração com IA Lucresia
- Templates pré-definidos
- Preview em tempo real
- Agendamento
- Publicação automática
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid

# ============= MODELS PARA STORY, CARROSSEL E FEED =============

class ContentTemplate(BaseModel):
    """Template reutilizável para diferentes formatos"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: str
    tipo: str  # story, carrossel, feed, landing
    descricao: str
    layout: str  # grid, carousel, overlay, centered, bottom_text
    elementos: List[Dict[str, Any]] = Field(default_factory=list)  # [{"tipo": "text", "posição": "top", ...}]
    cores_destacadas: List[str] = Field(default_factory=list)
    criado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    thumbnail: Optional[str] = None  # URL preview do template


class StoryContent(BaseModel):
    """Story Instagram/Facebook (1080x1920px - Vertical)"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    titulo: str
    tipo_story: str  # simple, questao, cta, carousel, video  
    
    # Conteúdo Principal
    texto_principal: str  # Texto do story (25-100 caracteres)
    texto_secundario: Optional[str] = None  # Opcional, menor
    cta: Optional[str] = None  # "Saiba mais", "Acesse", etc
    link_cta: Optional[str] = None
    emoji: Optional[str] = None
    
    # Imagem/Vídeo
    imagem_url: Optional[str] = None
    imagem_descricao: Optional[str] = None  # Para IA gerar
    video_url: Optional[str] = None
    duracao_video: Optional[int] = None  # segundos
    
    # Design
    background: str = "#F5F5F5"  # cor ou URL
    cor_texto: str = "#000000"
    cor_cta: str = "#8B5CF6"
    fonte: str = "Poppins"
    tamanho_fonte: int = 24
    alinhamento: str = "center"  # center, left, right
    overlay_opacity: Optional[float] = None
    
    # Metadata
    procedimento: str  # Harmonização Facial, Botox, etc
    objetivo: str  # Educar, Vender, Engajar, etc
    publico_alvo: str = "mulheres 30-50 anos"
    
    # IA & Contexto
    gerado_por_ia: bool = False
    prompt_ia: Optional[str] = None
    versao_numero: int = 1
    
    # Publicação
    agendado_para: Optional[datetime] = None
    publicado_em: Optional[datetime] = None
    status: str = "rascunho"  # rascunho, agendado, publicado
    plataformas: List[str] = Field(default_factory=lambda: ["instagram"])  # instagram, facebook
    urls_publicadas: Dict[str, str] = Field(default_factory=dict)
    
    # Performance
    visualizacoes: int = 0
    cliques_cta: int = 0
    compartilhamentos: int = 0
    conversoes: int = 0
    taxa_engajamento: Optional[float] = None
    
    # Metadados
    marca_id: Optional[str] = None
    criado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    atualizado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CarrosselContent(BaseModel):
    """Carrossel/Carousel (1080x1350px por página - Horizontal Scrolling)"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    titulo: str
    descricao: Optional[str] = None
    
    # Slides
    slides: List[Dict[str, Any]] = Field(default_factory=list)
    # Cada slide: {
    #   "numero": 1,
    #   "titulo": "Slide 1",
    #   "texto": "Conteúdo do slide",
    #   "imagem_url": "...",
    #   "background": "#FFF",
    #   "cta": "...",
    #   "link": "..."
    # }
    
    # Design
    estilo: str = "moderno"  # moderno, clássico, premium, educativo, comparacao
    layout_slides: str = "texto_top"  # texto_top, texto_bottom, imagem_full, split
    cor_primaria: str = "#8B5CF6"
    cor_secundaria: str = "#F5F5F5"
    fonte_titulo: str = "Playfair Display"
    fonte_texto: str = "Inter"
    
    # Indicadores
    mostrar_numeracao: bool = True
    mostrar_progress_bar: bool = True
    animacao_entrada: str = "slide"  # slide, fade, zoom
    
    # Contexto
    procedimento: str
    objetivo: str  # Educar, Persuadir, Comparar, etc
    publico_alvo: str = "mulheres 30-50 anos"
    tipo_carrossel: str = "educativo"  # educativo, antes_depois, beneficios, comparacao, faq
    
    # IA
    gerado_por_ia: bool = False
    prompt_ia: Optional[str] = None
    
    # Publicação
    agendado_para: Optional[datetime] = None
    publicado_em: Optional[datetime] = None
    status: str = "rascunho"  # rascunho, agendado, publicado
    plataformas: List[str] = Field(default_factory=lambda: ["instagram", "linkedin"])
    urls_publicadas: Dict[str, str] = Field(default_factory=dict)
    
    # Analytics
    visualizacoes: int = 0
    scroll_medio: Optional[float] = None  # Média de slides visualizados
    taxa_conclusao: Optional[float] = None  # % que vê até o final
    cliques_cta: int = 0
    salva: int = 0  # Número de salvamentos
    compartilhamentos: int = 0
    conversoes: int = 0
    
    # Metadados
    marca_id: Optional[str] = None
    criado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    atualizado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class FeedContent(BaseModel):
    """Feed Post (1080x1080px - Quadrado)"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    titulo: str
    
    # Conteúdo
    legenda: str  # Texto do post (descrição)
    legenda_resumida: Optional[str] = None  # Para preview
    hashtags: List[str] = Field(default_factory=list)  # #harmonização #botox etc
    mencoes: List[str] = Field(default_factory=list)  # @usuario1 @usuario2
    cta: Optional[str] = None  # "Acesse", "Saiba mais"
    link_cta: Optional[str] = None
    
    # Imagem/Vídeo
    midia_url: str  # URL da imagem ou vídeo
    midia_tipo: str = "imagem"  # imagem, video, carrossel_video
    video_duracao: Optional[int] = None
    midia_descricao: Optional[str] = None
    alt_text: Optional[str] = None  # Acessibilidade
    
    # Design
    filtro: str = "none"  # none, clarendon, juno, lark, ludwig, etc (Instagram filters)
    saturacao: float = 1.0  # 0-2
    contraste: float = 1.0  # 0-2
    brilho: float = 1.0  # 0-2
    overlay_cor: Optional[str] = None
    overlay_opacity: Optional[float] = None
    
    # Contexto
    procedimento: str
    objetivo: str  # Vender, Educar, Engajar, Construir Comunidade
    publico_alvo: str = "mulheres 30-50 anos"
    emocao_alvo: str  # inspiração, confiança, curiosidade, desejo, medo, esperança
    
    # IA
    gerado_por_ia: bool = False
    prompt_ia: Optional[str] = None
    
    # Publicação
    agendado_para: Optional[datetime] = None
    publicado_em: Optional[datetime] = None
    status: str = "rascunho"  # rascunho, agendado, publicado
    plataformas: List[str] = Field(default_factory=lambda: ["instagram"])
    urls_publicadas: Dict[str, str] = Field(default_factory=dict)
    
    # Configurações por Plataforma
    config_linkedin: Optional[Dict[str, Any]] = None
    config_facebook: Optional[Dict[str, Any]] = None
    config_tiktok: Optional[Dict[str, Any]] = None
    
    # Analytics
    curtidas: int = 0
    comentarios: int = 0
    compartilhamentos: int = 0
    salvamentos: int = 0
    cliques_link: int = 0
    conversoes: int = 0
    impressoes: int = 0
    alcance: int = 0
    taxa_engajamento: Optional[float] = None
    taxa_cliques: Optional[float] = None
    
    # Metadados
    marca_id: Optional[str] = None
    criado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    atualizado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    

# ============= CREATE/UPDATE MODELS =============

class StoryContentCreate(BaseModel):
    titulo: str
    tipo_story: str = "simple"
    texto_principal: str
    texto_secundario: Optional[str] = None
    cta: Optional[str] = None
    link_cta: Optional[str] = None
    imagem_url: Optional[str] = None
    imagem_descricao: Optional[str] = None
    background: Optional[str] = None
    procedimento: str
    objetivo: str
    publico_alvo: Optional[str] = None
    gerado_por_ia: bool = False
    agendado_para: Optional[datetime] = None


class CarrosselContentCreate(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    slides: List[Dict[str, Any]]
    estilo: str = "moderno"
    layout_slides: str = "texto_top"
    procedimento: str
    objetivo: str
    tipo_carrossel: str = "educativo"
    gerado_por_ia: bool = False
    agendado_para: Optional[datetime] = None


class FeedContentCreate(BaseModel):
    titulo: str
    legenda: str
    midia_url: str
    midia_tipo: str = "imagem"
    hashtags: Optional[List[str]] = None
    cta: Optional[str] = None
    link_cta: Optional[str] = None
    procedimento: str
    objetivo: str
    publico_alvo: Optional[str] = None
    emocao_alvo: Optional[str] = None
    gerado_por_ia: bool = False
    agendado_para: Optional[datetime] = None


class GenerateContentRequest(BaseModel):
    """Request para gerar conteúdo com IA"""
    tipo: str  # story, carrossel, feed
    procedimento: str
    objetivo: str
    publico_alvo: Optional[str] = None
    contexto_adicional: Optional[str] = None
    emocao_alvo: Optional[str] = None
    num_opcoes: int = 3  # Quantas opções gerar
    

class ContentBatch(BaseModel):
    """Lote de conteúdo para publicação em massa"""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: str
    descricao: Optional[str] = None
    
    # Conteúdo
    stories: List[str] = Field(default_factory=list)  # IDs de stories
    carrosseis: List[str] = Field(default_factory=list)  # IDs de carrosseis
    feeds: List[str] = Field(default_factory=list)  # IDs de feed posts
    
    # Calendário
    datas_publicacao: List[datetime] = Field(default_factory=list)
    frequencia: Optional[str] = None  # daily, weekly, custom
    
    # Performance
    total_alcance_estimado: int = 0
    total_engajamento_estimado: int = 0
    
    # Status
    status: str = "planejamento"  # planejamento, agendado, publicado, concluído
    publicacoes_concluidas: int = 0
    publicacoes_agendadas: int = 0
    
    criado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    atualizado_em: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

