"""
Prompt Builder - Construtor de Prompts Personalizados para Clone de Voz

Constrói system prompts hiperpersonalizados baseados na identidade de marca
e análise de voz para que a IA escreva EXATAMENTE como o profissional.
"""

from typing import Dict, List, Optional
from services.voice_clone_analyzer import analyze_voice_samples


class VoiceClonePromptBuilder:
    """Construtor de prompts para clone de voz personalizado"""
    
    def __init__(self, brand_identity: Dict):
        """
        Inicializa o builder com dados da identidade de marca.
        
        Args:
            brand_identity: Dict completo com todos os dados do BrandIdentity
        """
        self.identity = brand_identity
        self.voice_analysis = None
        
        # Analisa amostras de voz se existirem
        if brand_identity.get('voice_samples'):
            self.voice_analysis = analyze_voice_samples(brand_identity['voice_samples'])
    
    def build_system_prompt(self, context: str = "conteúdo geral") -> str:
        """
        Constrói system prompt completo para geração de conteúdo.
        
        Args:
            context: Contexto específico (ex: "legenda instagram", "ebook", "email")
            
        Returns:
            System prompt formatado e pronto para uso com LLM
        """
        sections = [
            self._build_identity_section(),
            self._build_voice_section(),
            self._build_style_section(),
            self._build_restrictions_section(),
            self._build_examples_section(),
            self._build_context_section(context),
        ]
        
        # Une todas as seções com separadores
        return "\n\n" + "="*80 + "\n\n".join(filter(None, sections)) + "\n" + "="*80
    
    def _build_identity_section(self) -> str:
        """Seção de identidade da marca"""
        brand_name = self.identity.get('brand_name', 'esta marca')
        archetype = self.identity.get('brand_archetype', '')
        positioning = ', '.join(self.identity.get('positioning', []))
        team_type = self.identity.get('team_type', 'Voz Individual')
        
        voice_perspective = "primeira pessoa do singular" if "Individual" in team_type else \
                           "primeira pessoa do plural" if "Equipe" in team_type else \
                           "terceira pessoa"
        
        return f"""
🎯 IDENTIDADE DA MARCA

Você é um ghostwriter profissional que escreve EXATAMENTE como {brand_name}.

ARQUÉTIPO: {archetype}
POSICIONAMENTO: {positioning}
PERSPECTIVA NARRATIVA: {voice_perspective} ({team_type})

Sua missão é absorver a ESSÊNCIA da comunicação e replicar o estilo com perfeição.
NÃO imite superficialmente. Escreva como se VOCÊ FOSSE {brand_name}.
"""
    
    def _build_voice_section(self) -> str:
        """Seção de características de voz"""
        if not self.voice_analysis:
            return ""
        
        formality = self.identity.get('formality', '')
        sentence_length = self.identity.get('sentence_length', '')
        paragraph_style = self.identity.get('paragraph_style', '')
        
        formality_map = {
            "Muito informal - como conversa entre amigas": "MUITO INFORMAL - Use gírias, contrações (tá, né, pra), seja coloquial",
            "Informal mas respeitosa": "INFORMAL - Amigável mas mantém respeito, pode usar 'você' ao invés de 'tu'",
            "Equilibrada - nem formal nem informal": "EQUILIBRADA - Nem muito formal nem muito casual, natural",
            "Formal mas acessível": "FORMAL - Profissional mas não engessado, evite gírias",
            "Muito formal e técnica": "MUITO FORMAL - Linguagem técnica, científica, sem contrações"
        }
        
        return f"""
📝 CARACTERÍSTICAS DE VOZ OBRIGATÓRIAS

FORMALIDADE: {formality_map.get(formality, formality)}

ESTRUTURA DAS FRASES: {sentence_length}
- Tamanho médio detectado: {self.voice_analysis['avg_sentence_length']:.1f} palavras
- Mantenha esse padrão!

ESTRUTURA DOS PARÁGRAFOS: {paragraph_style}
- Média detectada: {self.voice_analysis['paragraph_avg_lines']:.1f} linhas por parágrafo
- Respeite essa estrutura!

VOCABULÁRIO: {self.voice_analysis['vocabulary_level'].upper()}
- Use palavras do mesmo nível de complexidade
"""
    
    def _build_style_section(self) -> str:
        """Seção de elementos estilísticos"""
        communication_styles = self.identity.get('communication_style', [])
        punctuation = self.identity.get('punctuation', [])
        personality = self.identity.get('personality', [])
        catchphrases = self.identity.get('catchphrases', [])
        opening_style = self.identity.get('opening_style', '')
        closing_style = self.identity.get('closing_style', '')
        
        # Mapeia estilos de comunicação para instruções
        style_instructions = {
            "Uso emojis frequentemente": f"✅ Use emojis (frequência: {self.voice_analysis['emoji_frequency']:.1f} por 100 chars)" if self.voice_analysis else "✅ Use emojis com frequência",
            "Faço perguntas retóricas": f"✅ Faça perguntas retóricas ({self.voice_analysis['question_ratio']*100:.0f}% das frases)" if self.voice_analysis else "✅ Inclua perguntas retóricas",
            "Conto histórias/cases": "✅ Use storytelling e exemplos reais de casos",
            "Uso termos técnicos": "✅ Inclua termos técnicos quando relevante",
            "Sou direta e objetiva": "✅ Seja direto e objetivo, sem rodeios",
            "Uso metáforas": "✅ Use metáforas para explicar conceitos",
            "Faço analogias do dia a dia": "✅ Faça analogias com situações cotidianas",
            "Uso humor leve": "✅ Inclua toques de humor quando apropriado",
            "Compartilho vulnerabilidades": "✅ Seja autêntico, compartilhe desafios e aprendizados",
            "Uso dados e estatísticas": "✅ Inclua dados e estatísticas para embasar pontos",
        }
        
        # Mapeia pontuação para instruções
        punctuation_instructions = {
            "Uso muitas reticências...": "✅ Use reticências... para pausas e suspense",
            "Uso exclamações!": f"✅ Use exclamações! ({self.voice_analysis['exclamation_ratio']*100:.0f}% das frases)" if self.voice_analysis else "✅ Use exclamações!",
            "Faço quebras de linha": "✅ Faça quebras de linha para respiração visual",
            "Uso CAPS para ênfase": "✅ Use CAPS para ÊNFASE em palavras-chave",
            "Uso travessões —": "✅ Use travessões — para explicações intercaladas",
            "Pontuação tradicional": "✅ Use pontuação tradicional e correta",
        }
        
        styles_text = "\n".join(style_instructions.get(s, f"✅ {s}") for s in communication_styles)
        punct_text = "\n".join(punctuation_instructions.get(p, f"✅ {p}") for p in punctuation)
        personality_text = "\n".join(f"✅ {trait}" for trait in personality)
        
        catchphrases_section = ""
        if catchphrases:
            catchphrases_section = f"""
EXPRESSÕES CARACTERÍSTICAS (use naturalmente):
{chr(10).join(f'• "{phrase}"' for phrase in catchphrases)}
"""
        
        opening_section = f"\nCOMO INICIAR TEXTOS:\n{opening_style}\n" if opening_style else ""
        closing_section = f"\nCOMO ENCERRAR TEXTOS:\n{closing_style}\n" if closing_style else ""
        
        return f"""
🎨 ELEMENTOS ESTILÍSTICOS

ESTILO DE COMUNICAÇÃO:
{styles_text}

PONTUAÇÃO:
{punct_text}

PERSONALIDADE:
{personality_text}
{catchphrases_section}{opening_section}{closing_section}
"""
    
    def _build_restrictions_section(self) -> str:
        """Seção de restrições e palavras proibidas"""
        forbidden = self.identity.get('forbidden_words', [])
        
        if not forbidden:
            return ""
        
        forbidden_list = "\n".join(f"❌ {word}" for word in forbidden)
        
        return f"""
🚫 PALAVRAS E TERMOS ABSOLUTAMENTE PROIBIDOS

NUNCA, EM HIPÓTESE ALGUMA, use estas palavras/termos:

{forbidden_list}

Se você usar qualquer uma dessas palavras, o texto será REJEITADO.
Encontre alternativas criativas que mantenham o significado sem usar termos proibidos.
"""
    
    def _build_examples_section(self) -> str:
        """Seção com exemplos reais de escrita"""
        voice_samples = self.identity.get('voice_samples', '')
        
        if not voice_samples:
            return ""
        
        # Detecta frases comuns da análise
        common_phrases = ""
        if self.voice_analysis and self.voice_analysis.get('common_phrases'):
            phrases = self.voice_analysis['common_phrases'][:5]
            common_phrases = "\n\nFRASES/EXPRESSÕES MAIS COMUNS:\n" + "\n".join(f"• {p}" for p in phrases)
        
        return f"""
📚 EXEMPLOS REAIS DO SEU ESTILO DE ESCRITA

Analise profundamente estes textos escritos por {self.identity.get('brand_name', 'você')}:

---
{voice_samples}
---
{common_phrases}

ABSORVA:
• O ritmo e cadência das frases
• A escolha de palavras
• Como constrói argumentos
• Como conecta ideias
• O tom emocional
• A estrutura de parágrafos
• Como usa pontuação

Replique essa ESSÊNCIA em tudo que escrever.
"""
    
    def _build_context_section(self, context: str) -> str:
        """Seção com contexto específico da tarefa"""
        tone_of_voice = ', '.join(self.identity.get('tone_of_voice', []))
        
        return f"""
🎯 CONTEXTO DESTA TAREFA

Você está escrevendo: {context}

TOM DE VOZ PARA ESTE CONTEÚDO: {tone_of_voice}

LEMBRE-SE:
• Você não é uma IA genérica. Você é {self.identity.get('brand_name', 'esta marca')}.
• Cada palavra deve soar autêntica, como se viesse diretamente da profissional.
• Não escreva "de forma genérica" - use o estilo específico aprendido.
• Se não tiver certeza, releia os exemplos e absorva mais da essência.

Agora escreva com a voz de {self.identity.get('brand_name', 'você')}!
"""
    
    def build_user_prompt(self, task: str, additional_context: str = "") -> str:
        """
        Constrói user prompt específico para a tarefa.
        
        Args:
            task: Descrição da tarefa (ex: "escreva uma legenda sobre preenchimento labial")
            additional_context: Contexto adicional opcional
            
        Returns:
            User prompt formatado
        """
        context_part = f"\n\nCONTEXTO ADICIONAL:\n{additional_context}" if additional_context else ""
        
        return f"""
{task}
{context_part}

IMPORTANTE: Escreva EXATAMENTE no estilo de {self.identity.get('brand_name', 'você')}, 
usando todos os elementos estilísticos definidos no system prompt.
"""


def build_voice_clone_prompt(brand_identity: Dict, task: str, context: str = "conteúdo geral") -> tuple[str, str]:
    """
    Helper function para construção rápida de prompts.
    
    Args:
        brand_identity: Dict completo com dados da identidade
        task: Descrição da tarefa
        context: Contexto do conteúdo
        
    Returns:
        Tupla (system_prompt, user_prompt)
        
    Example:
        >>> system, user = build_voice_clone_prompt(
        ...     brand_identity=identity_data,
        ...     task="Escreva uma legenda sobre skincare",
        ...     context="legenda instagram"
        ... )
    """
    builder = VoiceClonePromptBuilder(brand_identity)
    system_prompt = builder.build_system_prompt(context)
    user_prompt = builder.build_user_prompt(task)
    
    return system_prompt, user_prompt
