"""
Schemas Pydantic para Brand Identity com Clone de Voz IA

Define todos os modelos de dados para o construtor de marca completo,
incluindo os 11 campos do sistema de clone de voz.
"""

from typing import List, Optional
from pydantic import BaseModel, Field, validator


class BrandColors(BaseModel):
    """Paleta de cores da marca (3 cores principais)"""
    primary: str = Field(default="#4F46E5", description="Cor primária (hex)")
    secondary: str = Field(default="#7C3AED", description="Cor secundária (hex)")
    accent: str = Field(default="#D4A853", description="Cor de destaque (hex)")


class BrandIdentityCreate(BaseModel):
    """Schema para criação/atualização de identidade de marca completa"""
    
    # ===== INFORMAÇÕES BÁSICAS =====
    brand_name: str = Field(..., min_length=1, max_length=200, description="Nome da marca/clínica")
    instagram_handle: str = Field(..., min_length=1, max_length=100, description="@ do Instagram")
    main_specialty: str = Field(..., min_length=1, max_length=300, description="Especialidade principal")
    sub_specialties: List[str] = Field(default_factory=list, description="Subespecialidades e títulos")
    treatments: List[str] = Field(default_factory=list, description="Tratamentos oferecidos")
    
    # ===== POSICIONAMENTO ESTRATÉGICO =====
    brand_archetype: str = Field(..., description="Arquétipo da marca (O Sábio, O Mago, etc)")
    positioning: List[str] = Field(default_factory=list, description="Posicionamento de mercado (multi-select)")
    team_type: str = Field(..., description="Tipo de equipe (Voz Individual, Voz de Equipe, etc)")
    target_audience: str = Field(default="", description="Público-alvo específico")
    differentiator: str = Field(default="", description="Diferencial único da marca")
    brand_promise: str = Field(default="", description="Promessa da marca")
    
    # ===== CLONE DE VOZ IA (11 CAMPOS) =====
    voice_samples: str = Field(..., min_length=100, description="Exemplos de textos reais (mínimo 500 chars recomendado)")
    communication_style: List[str] = Field(default_factory=list, description="Estilos de comunicação (até 10)")
    sentence_length: str = Field(default="", description="Tamanho preferido das frases")
    paragraph_style: str = Field(default="", description="Estrutura dos parágrafos")
    catchphrases: List[str] = Field(default_factory=list, description="Expressões e bordões característicos")
    opening_style: str = Field(default="", description="Como inicia textos")
    closing_style: str = Field(default="", description="Como encerra textos")
    formality: str = Field(default="", description="Nível de formalidade (5 opções)")
    punctuation: List[str] = Field(default_factory=list, description="Padrões de pontuação")
    personality: List[str] = Field(default_factory=list, description="Traços de personalidade (até 6)")
    style_notes: str = Field(default="", description="Notas adicionais sobre estilo")
    
    # ===== COMUNICAÇÃO =====
    tone_of_voice: List[str] = Field(default_factory=list, max_items=3, description="Tom de voz (até 3)")
    keywords: List[str] = Field(default_factory=list, description="Palavras-chave da marca")
    forbidden_words: List[str] = Field(default_factory=list, description="Palavras/termos proibidos")
    content_types: List[str] = Field(default_factory=list, description="Tipos de conteúdo preferidos")
    bio_text: str = Field(default="", max_length=150, description="Bio do Instagram")
    
    # ===== IDENTIDADE VISUAL =====
    colors: BrandColors = Field(default_factory=BrandColors, description="Paleta de cores")
    font1: str = Field(default="", description="Fonte primária")
    font2: str = Field(default="", description="Fonte secundária (opcional)")
    logo: Optional[str] = Field(default=None, description="Logo em base64 (opcional)")
    
    # ===== METADADOS =====
    setup_completed: bool = Field(default=False, description="Se o setup foi concluído")
    
    @validator('voice_samples')
    def validate_voice_samples_length(cls, v):
        """Valida que voice_samples tem pelo menos 100 caracteres"""
        if len(v.strip()) < 100:
            raise ValueError("voice_samples deve ter pelo menos 100 caracteres para análise efetiva")
        return v.strip()
    
    @validator('tone_of_voice')
    def validate_tone_limit(cls, v):
        """Valida que não há mais de 3 tons de voz selecionados"""
        if len(v) > 3:
            raise ValueError("Máximo de 3 tons de voz permitidos")
        return v
    
    @validator('bio_text')
    def validate_bio_length(cls, v):
        """Valida tamanho da bio do Instagram"""
        if len(v) > 150:
            raise ValueError("Bio do Instagram deve ter no máximo 150 caracteres")
        return v


class BrandIdentityResponse(BrandIdentityCreate):
    """Schema de resposta com metadados adicionais"""
    
    user_id: str = Field(..., description="ID do usuário dono da identidade")
    created_at: str = Field(..., description="Data de criação (ISO 8601)")
    updated_at: str = Field(..., description="Data de última atualização (ISO 8601)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "brand_name": "Clínica Dra. Ana Silva",
                "instagram_handle": "@dra.anasilva",
                "main_specialty": "Harmonização Facial",
                "sub_specialties": ["Especialista em Bioestimuladores", "Mentora em Estética Integrativa"],
                "treatments": ["Botox", "Preenchimento", "Skinbooster"],
                "brand_archetype": "O Sábio",
                "positioning": ["Premium", "Especialista"],
                "team_type": "Voz Individual",
                "target_audience": "Mulheres executivas 35-50 anos",
                "voice_samples": "Olha, vou ser sincera com você: harmonização não é milagre...",
                "communication_style": ["Uso emojis frequentemente", "Faço perguntas retóricas"],
                "formality": "Informal mas respeitosa",
                "tone_of_voice": ["Profissional", "Acolhedor"],
                "setup_completed": True
            }
        }


class VoiceAnalysisResult(BaseModel):
    """Resultado da análise dos exemplos de voz"""
    
    avg_sentence_length: float = Field(..., description="Comprimento médio das frases em palavras")
    emoji_frequency: float = Field(..., description="Frequência de emojis (emojis por 100 caracteres)")
    question_ratio: float = Field(..., description="Proporção de frases interrogativas (0-1)")
    exclamation_ratio: float = Field(..., description="Proporção de frases exclamativas (0-1)")
    paragraph_avg_lines: float = Field(..., description="Média de linhas por parágrafo")
    uses_caps: bool = Field(..., description="Usa CAPS para ênfase")
    uses_ellipsis: bool = Field(..., description="Usa reticências...")
    common_phrases: List[str] = Field(..., description="Frases/expressões mais comuns")
    vocabulary_level: str = Field(..., description="Nível de vocabulário: simples, moderado, complexo")
    formality_detected: str = Field(..., description="Formalidade detectada automaticamente")
    
    class Config:
        json_schema_extra = {
            "example": {
                "avg_sentence_length": 12.5,
                "emoji_frequency": 2.3,
                "question_ratio": 0.25,
                "exclamation_ratio": 0.15,
                "paragraph_avg_lines": 2.1,
                "uses_caps": True,
                "uses_ellipsis": True,
                "common_phrases": ["vou ser sincera", "a real é que", "olha só"],
                "vocabulary_level": "moderado",
                "formality_detected": "informal"
            }
        }
