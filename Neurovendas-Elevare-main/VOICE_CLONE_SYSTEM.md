# Sistema de Clone de Voz - Brand Identity

Sistema completo de clonagem de voz baseado em análise de escrita para personalização de conteúdo por IA.

## 📋 Visão Geral

O **Clone de Voz** permite que profissionais de estética ensinem a IA a escrever EXATAMENTE como eles, capturando seu estilo único através de análise profunda de amostras de texto.

### Componentes

1. **Frontend**: `ConstrutorMarcaCompleto.tsx` - Interface de 5 etapas
2. **Backend API**: `routers/brand_identity.py` - Endpoints CRUD
3. **Schemas**: `schemas/brand_identity.py` - Validação Pydantic
4. **Análise de Voz**: `services/voice_clone_analyzer.py` - 10 métricas NLP
5. **Prompt Builder**: `services/prompt_builder.py` - Construção de system prompts

---

## 🧠 Campos do Clone de Voz (11 campos)

### 1. `voice_samples` (string, min 100 chars, obrigatório)
Amostras reais de texto escrito pela profissional. Mínimo 100 caracteres para análise confiável.

**Exemplo**:
```
Oi, gente linda! ✨ Vim aqui falar sobre um assunto SUPER importante... 
Você sabia que o preenchimento labial não é só sobre volume? É sobre 
equilíbrio e naturalidade! 💋 Cada rosto é único, e eu analiso cada 
detalhe antes de aplicar.
```

**Análise extraída**:
- Tamanho médio de frase: 12 palavras
- Frequência de emoji: 3.5 por 100 chars
- Taxa de perguntas retóricas: 20%
- Formalidade: muito_informal
- Vocabulário: simples
- Uso de CAPS: sim
- Uso de reticências: sim

---

### 2. `communication_style` (array, múltipla escolha, 10 opções)
Estratégias de comunicação usadas no texto.

**Opções**:
- "Uso emojis frequentemente"
- "Faço perguntas retóricas"
- "Conto histórias/cases"
- "Uso termos técnicos"
- "Sou direta e objetiva"
- "Uso metáforas"
- "Faço analogias do dia a dia"
- "Uso humor leve"
- "Compartilho vulnerabilidades"
- "Uso dados e estatísticas"

**Uso no prompt**:
```python
if "Uso emojis frequentemente" in communication_style:
    prompt += "✅ Use emojis (frequência: 3.5 por 100 chars)\n"
```

---

### 3. `sentence_length` (string, escolha única)
Padrão de tamanho de frases.

**Opções**:
- "Frases curtas e diretas"
- "Frases médias e equilibradas"
- "Frases longas e elaboradas"

**Análise**:
Calcula média de palavras por frase (split em `.!?`)

---

### 4. `paragraph_style` (string, escolha única)
Estrutura de parágrafos.

**Opções**:
- "Parágrafos curtos (1-2 linhas)"
- "Parágrafos médios (3-4 linhas)"
- "Parágrafos longos (5+ linhas)"

**Análise**:
Calcula média de linhas por parágrafo (split em `\n\n`)

---

### 5. `catchphrases` (array de strings, tag input)
Expressões características únicas da profissional.

**Exemplo**:
```json
[
  "gente linda",
  "olha que incrível",
  "vem comigo nessa",
  "tá pronta para transformar?",
  "ahhhh isso aqui é tudo"
]
```

**Uso no prompt**:
Injetadas como "EXPRESSÕES CARACTERÍSTICAS (use naturalmente)"

**Análise automática**:
`extract_common_phrases()` extrai n-grams de 2-5 palavras com frequência mínima

---

### 6. `opening_style` (string, texto livre)
Como a profissional costuma iniciar textos.

**Exemplo**:
```
Sempre inicio com uma saudação calorosa (oi gente, olá, e aí), 
seguida de um emoji e uma pergunta ou afirmação impactante que 
gera curiosidade.
```

**Uso no prompt**:
Seção "COMO INICIAR TEXTOS" no system prompt

---

### 7. `closing_style` (string, texto livre)
Como a profissional costuma encerrar textos.

**Exemplo**:
```
Encerro com call-to-action direto (vem pro direct, marca aquela 
amiga, salva esse post), seguido de emojis relacionados ao tema 
e um lembrete de cuidado ou empoderamento.
```

**Uso no prompt**:
Seção "COMO ENCERRAR TEXTOS" no system prompt

---

### 8. `formality` (string, escolha única, obrigatório)
Nível de formalidade geral da comunicação.

**Opções**:
- "Muito informal - como conversa entre amigas"
- "Informal mas respeitosa"
- "Equilibrada - nem formal nem informal"
- "Formal mas acessível"
- "Muito formal e técnica"

**Análise automática**:
`detect_formality()` usa regex para:
- Marcadores informais: `ó`, `ué`, `né`, `tipo`, `pra`, `tá`, emojis, contrações
- Marcadores formais: `por favor`, `solicito`, `atenciosamente`, `cordialmente`

**Classificação**:
```python
if emoji_freq > 2 and informal_markers > 3:
    return "muito_informal"
elif formal_markers > 2 and emoji_freq == 0:
    return "muito_formal"
else:
    return "equilibrada"
```

---

### 9. `punctuation` (array, múltipla escolha, 6 opções)
Preferências de pontuação.

**Opções**:
- "Uso muitas reticências..."
- "Uso exclamações!"
- "Faço quebras de linha"
- "Uso CAPS para ênfase"
- "Uso travessões —"
- "Pontuação tradicional"

**Análise automática**:
- `detect_ellipsis_usage()`: busca `...` ou `…`
- `calculate_exclamation_ratio()`: proporção de frases com `!`
- `detect_caps_usage()`: encontra palavras em CAPS (exclui siglas comuns)

---

### 10. `personality` (array, múltipla escolha, 6 opções)
Traços de personalidade no texto.

**Opções**:
- "Empática e acolhedora"
- "Enérgica e motivadora"
- "Educadora e didática"
- "Inspiradora e visionária"
- "Autêntica e transparente"
- "Bem-humorada e leve"

**Uso no prompt**:
```
PERSONALIDADE:
✅ Empática e acolhedora
✅ Enérgica e motivadora
✅ Bem-humorada e leve
```

---

### 11. `style_notes` (string, texto livre, opcional)
Observações adicionais sobre estilo que não se encaixam nos outros campos.

**Exemplo**:
```
Evito usar jargões técnicos sem explicação. Sempre dou contexto. 
Gosto de criar senso de comunidade usando "nós" e "nossa". Uso muito 
o recurso de contar histórias reais de pacientes (anonimizadas).
```

**Uso no prompt**:
Apêndice na seção de estilo como instruções adicionais

---

## 🔬 Análise de Voz (VoiceCloneAnalyzer)

### Métricas Extraídas

#### 1. `avg_sentence_length` (float)
Média de palavras por frase.

**Cálculo**:
```python
sentences = re.split(r'(?<!\.\.\.)(?<=[.!?])\s+(?=[A-Z])', text)
words = [len(s.split()) for s in sentences]
avg = sum(words) / len(words)
```

**Uso**: Instruir IA a manter padrão (curto/médio/longo)

---

#### 2. `emoji_frequency` (float)
Emojis por 100 caracteres.

**Cálculo**:
```python
emoji_count = emoji.emoji_count(text)
freq = (emoji_count / len(text)) * 100
```

**Uso**: "Use emojis (frequência: X por 100 chars)"

---

#### 3. `question_ratio` (float 0-1)
Proporção de frases que são perguntas.

**Cálculo**:
```python
questions = [s for s in sentences if '?' in s]
ratio = len(questions) / len(sentences)
```

**Uso**: "Faça perguntas retóricas (X% das frases)"

---

#### 4. `exclamation_ratio` (float 0-1)
Proporção de frases com exclamação.

**Cálculo**:
```python
exclamations = [s for s in sentences if '!' in s]
ratio = len(exclamations) / len(sentences)
```

**Uso**: "Use exclamações! (X% das frases)"

---

#### 5. `paragraph_avg_lines` (float)
Média de linhas por parágrafo.

**Cálculo**:
```python
paragraphs = text.split('\n\n')
lines_per_para = [p.count('\n') + 1 for p in paragraphs]
avg = sum(lines_per_para) / len(lines_per_para)
```

**Uso**: Validar escolha de `paragraph_style`

---

#### 6. `uses_caps` (bool)
Se usa palavras em CAPS para ênfase.

**Cálculo**:
```python
words = text.split()
caps_words = [w for w in words if w.isupper() and len(w) > 2]
# Exclui siglas comuns: DRA, CPF, CNPJ, etc.
caps_words = [w for w in caps_words if w not in SIGLAS_COMUNS]
return len(caps_words) > 0
```

**Uso**: "Use CAPS para ÊNFASE em palavras-chave"

---

#### 7. `uses_ellipsis` (bool)
Se usa reticências.

**Cálculo**:
```python
return '...' in text or '…' in text
```

**Uso**: "Use reticências... para pausas e suspense"

---

#### 8. `common_phrases` (array de strings)
Frases/expressões mais frequentes (n-grams 2-5 palavras).

**Cálculo**:
```python
from collections import Counter

words = text.lower().split()
ngrams = []
for n in range(2, 6):  # 2 a 5 palavras
    for i in range(len(words) - n + 1):
        ngrams.append(' '.join(words[i:i+n]))

freq = Counter(ngrams)
common = [phrase for phrase, count in freq.most_common(10) if count >= 2]
return common
```

**Uso**: Sugerir para `catchphrases` ou usar diretamente no prompt

---

#### 9. `vocabulary_level` (string: simple/moderate/complex)
Complexidade do vocabulário.

**Cálculo**:
```python
words = extract_words(text)
avg_word_len = sum(len(w) for w in words) / len(words)
lexical_diversity = len(set(words)) / len(words)  # type-token ratio

if avg_word_len < 5 and lexical_diversity < 0.5:
    return "simple"
elif avg_word_len > 7 or lexical_diversity > 0.7:
    return "complex"
else:
    return "moderate"
```

**Uso**: "Use palavras do mesmo nível de complexidade"

---

#### 10. `formality_detected` (string: 5 níveis)
Formalidade detectada automaticamente.

**Cálculo**:
```python
informal_markers = ['ó', 'ué', 'né', 'tipo', 'pra', 'tá', 'vc', 'tb']
formal_markers = ['por favor', 'solicito', 'atenciosamente', 'cordialmente']

informal_count = sum(text.lower().count(m) for m in informal_markers)
formal_count = sum(text.lower().count(m) for m in formal_markers)
contractions = text.lower().count("'")  # Ex: tá, 'cê

if emoji_freq > 2 and informal_count > 3:
    return "muito_informal"
elif informal_count > formal_count and emoji_freq > 0:
    return "informal"
elif formal_count > 2 and emoji_freq == 0:
    return "muito_formal"
elif formal_count > informal_count:
    return "formal"
else:
    return "equilibrada"
```

**Uso**: Validar/sugerir campo `formality`

---

## 🛠️ Prompt Builder (VoiceClonePromptBuilder)

### Estrutura do System Prompt

```
================================================================================

🎯 IDENTIDADE DA MARCA
Você é um ghostwriter profissional que escreve EXATAMENTE como [brand_name].
ARQUÉTIPO: [brand_archetype]
POSICIONAMENTO: [positioning]
PERSPECTIVA NARRATIVA: primeira pessoa do singular (Voz Individual)

================================================================================

📝 CARACTERÍSTICAS DE VOZ OBRIGATÓRIAS

FORMALIDADE: MUITO INFORMAL - Use gírias, contrações (tá, né, pra), seja coloquial

ESTRUTURA DAS FRASES: Frases curtas e diretas
- Tamanho médio detectado: 12.3 palavras
- Mantenha esse padrão!

ESTRUTURA DOS PARÁGRAFOS: Parágrafos curtos (1-2 linhas)
- Média detectada: 1.8 linhas por parágrafo
- Respeite essa estrutura!

VOCABULÁRIO: SIMPLE
- Use palavras do mesmo nível de complexidade

================================================================================

🎨 ELEMENTOS ESTILÍSTICOS

ESTILO DE COMUNICAÇÃO:
✅ Use emojis (frequência: 3.5 por 100 chars)
✅ Faça perguntas retóricas (20% das frases)
✅ Seja direto e objetivo, sem rodeios

PONTUAÇÃO:
✅ Use reticências... para pausas e suspense
✅ Use exclamações! (15% das frases)
✅ Use CAPS para ÊNFASE em palavras-chave

PERSONALIDADE:
✅ Empática e acolhedora
✅ Enérgica e motivadora
✅ Bem-humorada e leve

EXPRESSÕES CARACTERÍSTICAS (use naturalmente):
• "gente linda"
• "olha que incrível"
• "vem comigo nessa"

COMO INICIAR TEXTOS:
Sempre inicio com uma saudação calorosa (oi gente, olá, e aí), seguida de 
um emoji e uma pergunta ou afirmação impactante.

COMO ENCERRAR TEXTOS:
Encerro com call-to-action direto (vem pro direct, marca aquela amiga), 
seguido de emojis relacionados ao tema.

================================================================================

🚫 PALAVRAS E TERMOS ABSOLUTAMENTE PROIBIDOS

NUNCA, EM HIPÓTESE ALGUMA, use estas palavras/termos:

❌ revolucionário
❌ inovador
❌ game changer
❌ expertise

Se você usar qualquer uma dessas palavras, o texto será REJEITADO.

================================================================================

📚 EXEMPLOS REAIS DO SEU ESTILO DE ESCRITA

Analise profundamente estes textos escritos por Dra. Carolina:

---
[voice_samples aqui]
---

FRASES/EXPRESSÕES MAIS COMUNS:
• que incrível isso
• vem comigo nessa
• olha só que
• você sabia que
• é super importante

ABSORVA:
• O ritmo e cadência das frases
• A escolha de palavras
• Como constrói argumentos
• Como conecta ideias
• O tom emocional
• A estrutura de parágrafos
• Como usa pontuação

Replique essa ESSÊNCIA em tudo que escrever.

================================================================================

🎯 CONTEXTO DESTA TAREFA

Você está escrevendo: legenda instagram

TOM DE VOZ PARA ESTE CONTEÚDO: Educativo, Inspirador, Próximo

LEMBRE-SE:
• Você não é uma IA genérica. Você é Dra. Carolina.
• Cada palavra deve soar autêntica, como se viesse diretamente da profissional.
• Não escreva "de forma genérica" - use o estilo específico aprendido.

Agora escreva com a voz de Dra. Carolina!

================================================================================
```

### Uso Programático

```python
from services.prompt_builder import build_voice_clone_prompt

# Busca identidade do MongoDB
brand_identity = await db.brand_identities.find_one({"user_id": user_id})

# Constrói prompts
system_prompt, user_prompt = build_voice_clone_prompt(
    brand_identity=brand_identity,
    task="Escreva uma legenda sobre preenchimento labial de 200 palavras",
    context="legenda instagram"
)

# Usa com LLM
from emergentintegrations.llm.chat import LlmChat, UserMessage, SystemMessage

llm = LlmChat(model="gemini/gemini-2.0-flash-exp")
response = await llm.chat_async([
    SystemMessage(content=system_prompt),
    UserMessage(content=user_prompt)
])

content = response.content
```

---

## 📡 API Endpoints

### 1. `POST /api/brand-identity/`
Cria ou atualiza identidade de marca.

**Request Body**: `BrandIdentityCreate` (schema Pydantic)

**Validações**:
- `voice_samples`: min 100 chars
- `tone_of_voice`: max 3 itens
- `bio_text`: max 150 chars
- `positioning`, `personality`, `communication_style`: arrays não vazios

**Resposta**:
```json
{
  "brand_name": "Dra. Carolina Santos",
  "instagram_handle": "@dracarol_estetica",
  "voice_samples": "...",
  "formality": "Muito informal - como conversa entre amigas",
  "communication_style": ["Uso emojis frequentemente", "Faço perguntas retóricas"],
  "user_id": "507f1f77bcf86cd799439011",
  "created_at": "2025-01-19T14:30:00Z",
  "updated_at": "2025-01-19T14:30:00Z"
}
```

**Custo**: 10 créditos

---

### 2. `GET /api/brand-identity/`
Recupera identidade do usuário logado.

**Headers**: `Authorization: Bearer <JWT>`

**Resposta**: `BrandIdentityResponse` ou `null`

---

### 3. `POST /api/brand-identity/analyze-voice`
Analisa amostras de voz e retorna 10 métricas.

**Requisito**: Identidade já criada com `voice_samples` >= 100 chars

**Resposta**:
```json
{
  "avg_sentence_length": 12.3,
  "emoji_frequency": 3.5,
  "question_ratio": 0.2,
  "exclamation_ratio": 0.15,
  "paragraph_avg_lines": 1.8,
  "uses_caps": true,
  "uses_ellipsis": true,
  "common_phrases": ["gente linda", "olha que incrível", "vem comigo nessa"],
  "vocabulary_level": "simple",
  "formality_detected": "muito_informal"
}
```

**Cache**: Resultados salvos em `voice_analysis` na identidade

**Custo**: 5 créditos

---

### 4. `GET /api/brand-identity/status`
Verifica completude e status da identidade.

**Resposta**:
```json
{
  "has_identity": true,
  "completeness": 85.7,
  "has_voice_samples": true,
  "voice_samples_length": 487,
  "voice_analyzed": true,
  "created_at": "2025-01-19T14:30:00Z",
  "updated_at": "2025-01-19T14:35:00Z",
  "voice_analysis_updated_at": "2025-01-19T14:36:00Z",
  "message": "Identidade completa mas voz não analisada"
}
```

**Completude**: % de campos obrigatórios preenchidos

---

### 5. `DELETE /api/brand-identity/`
Deleta identidade (irreversível).

**Resposta**: `204 No Content`

---

## 🔄 Integração com Geração de Conteúdo

### Modificar Endpoints Existentes

#### `/api/ebooks/generate-v2`
```python
@router.post("/generate-v2")
async def generate_ebook_v2(
    request: EbookRequest,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    # Busca identidade de marca
    brand_identity = await db.brand_identities.find_one({"user_id": current_user['_id']})
    
    # Se existir, usa prompt personalizado
    if brand_identity:
        from services.prompt_builder import VoiceClonePromptBuilder
        builder = VoiceClonePromptBuilder(brand_identity)
        system_prompt = builder.build_system_prompt(context="ebook")
    else:
        # Fallback: prompt genérico
        system_prompt = "Você é LucresIA, especialista em estética..."
    
    # Resto da geração...
```

#### `/api/ebooks/generate-copy`
```python
@router.post("/generate-copy")
async def generate_copy(
    request: CopyRequest,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    brand_identity = await db.brand_identities.find_one({"user_id": current_user['_id']})
    
    if brand_identity:
        system_prompt, user_prompt = build_voice_clone_prompt(
            brand_identity=brand_identity,
            task=f"Escreva copy de divulgação para {request.canal}",
            context=f"copy {request.canal}"
        )
        
        llm = LlmChat(model="gemini/gemini-2.0-flash-exp")
        response = await llm.chat_async([
            SystemMessage(content=system_prompt),
            UserMessage(content=user_prompt)
        ])
        
        copy = response.content
    else:
        # Fallback sem personalização
        copy = await lucresia.generate(f"Escreva copy para {request.canal}")
    
    return {"copy": copy}
```

---

## 🧪 Testing

### 1. Testar Análise de Voz

```python
# backend/tests/test_voice_analyzer.py
from services.voice_clone_analyzer import analyze_voice_samples

def test_emoji_frequency():
    text = "Oi gente! 😍 Olha que incrível 💕 Adorei! ✨"
    analysis = analyze_voice_samples(text)
    
    assert analysis['emoji_frequency'] > 5  # Alta frequência
    assert analysis['exclamation_ratio'] > 0.5
    assert analysis['formality_detected'] == "muito_informal"

def test_formality_detection():
    formal_text = """
    Prezado cliente, solicito a gentileza de comparecer à clínica.
    Atenciosamente, Dr. Silva
    """
    analysis = analyze_voice_samples(formal_text)
    
    assert analysis['formality_detected'] in ["formal", "muito_formal"]
    assert analysis['emoji_frequency'] == 0
```

### 2. Testar Prompt Builder

```python
def test_prompt_builder():
    brand_identity = {
        "brand_name": "Dra. Test",
        "voice_samples": "Oi gente! Como vocês estão? ✨",
        "formality": "Muito informal - como conversa entre amigas",
        "communication_style": ["Uso emojis frequentemente"],
        "forbidden_words": ["revolucionário"]
    }
    
    from services.prompt_builder import build_voice_clone_prompt
    system, user = build_voice_clone_prompt(
        brand_identity,
        task="Escreva legenda",
        context="instagram"
    )
    
    assert "Dra. Test" in system
    assert "MUITO INFORMAL" in system
    assert "❌ revolucionário" in system
    assert "Use emojis" in system
```

---

## 📊 Limites de Plano

Atualizado em `utils/plan_limits.py`:

```python
PLAN_LIMITS = {
    "free": {
        "brand_identity_creation": 1,  # Apenas 1 identidade
        "voice_analysis": 3,           # 3 análises/mês
    },
    "essencial": {
        "brand_identity_creation": -1,  # Ilimitado edições
        "voice_analysis": 10,           # 10 análises/mês
    },
    "profissional": {
        "brand_identity_creation": -1,
        "voice_analysis": -1,  # Ilimitado
    },
    "premium": {
        "brand_identity_creation": -1,
        "voice_analysis": -1,
    }
}
```

---

## 🚀 Deploy Checklist

1. ✅ Criar collection `brand_identities` no MongoDB
2. ✅ Instalar pacote `emoji`: `pip install emoji`
3. ✅ Registrar router em `server.py`: `app.include_router(brand_identity_router)`
4. ✅ Testar endpoint `/api/brand-identity/status` (deve retornar `has_identity: false`)
5. ✅ Frontend deve chamar `POST /api/brand-identity/` no save
6. ✅ Modificar endpoints de conteúdo para buscar `brand_identities` e usar prompt_builder

---

## 📝 Próximos Passos

1. **Integração Frontend-Backend**:
   - Atualizar `ConstrutorMarcaCompleto.tsx` para chamar novos endpoints
   - Adicionar botão "Analisar Voz" que chama `/analyze-voice`
   - Mostrar métricas de análise no preview sidebar

2. **Gamification**:
   - Badge "Voz Única" ao completar análise de voz
   - XP por editar identidade de marca

3. **Content Generation**:
   - Integrar com `/api/ebooks/generate-v2`
   - Adicionar toggle "Usar meu tom de voz" nos formulários
   - Preview de antes/depois (genérico vs personalizado)

4. **Advanced Features**:
   - Similaridade entre texto gerado e amostras (cosine similarity)
   - Sugestões de melhoria da identidade (ex: "Adicione mais catchphrases")
   - Múltiplas identidades (persona profissional vs casual)

---

## 🔗 Arquivos Relacionados

- Frontend: `frontend/src/pages/ConstrutorMarcaCompleto.tsx`
- Backend Router: `backend/routers/brand_identity.py`
- Schemas: `backend/schemas/brand_identity.py`
- Voice Analyzer: `backend/services/voice_clone_analyzer.py`
- Prompt Builder: `backend/services/prompt_builder.py`
- Plan Limits: `backend/utils/plan_limits.py`
- Server: `backend/server.py` (registra router)

---

## 📖 Referências

- Análise de Formalidade: [Paper sobre detecção de registro linguístico](https://aclanthology.org/)
- N-grams: [Wikipedia - N-gram](https://en.wikipedia.org/wiki/N-gram)
- Lexical Diversity: [Type-Token Ratio](https://en.wikipedia.org/wiki/Lexical_diversity)
- Emoji Detection: [emoji Python package](https://pypi.org/project/emoji/)
