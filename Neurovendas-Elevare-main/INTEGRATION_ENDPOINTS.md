# Integração de Endpoints - Clone de Voz

## ✅ Endpoints Integrados

### 1. `/api/ebook-new/generate` (Geração de E-book)
**Arquivo**: `backend/server.py` (linha ~6740)

**Integração**:
- Busca `brand_identity` do MongoDB usando `current_user["id"]`
- Se `voice_samples` existir, usa `VoiceClonePromptBuilder`
- System prompt personalizado substitui prompt genérico
- Fallback: prompt genérico se identidade não existir

**Código**:
```python
# Buscar identidade de marca para personalização
brand_identity = await db.brand_identities.find_one({"user_id": current_user["id"]})

# Se existe identidade de marca, usa prompt personalizado
if brand_identity and brand_identity.get('voice_samples'):
    from services.prompt_builder import VoiceClonePromptBuilder
    builder = VoiceClonePromptBuilder(brand_identity)
    system_prompt = builder.build_system_prompt(context="ebook")
```

---

### 2. `/api/ebook-new/refine-chapter` (Aperfeiçoamento de Capítulo)
**Arquivo**: `backend/server.py` (linha ~7196)

**Integração**:
- Busca `brand_identity` antes de aperfeiçoar
- Usa `build_voice_clone_prompt()` helper function
- Mantém estilo do usuário no refinamento
- Fallback: prompt genérico

**Código**:
```python
# Buscar identidade de marca para personalização
brand_identity = await db.brand_identities.find_one({"user_id": current_user["id"]})

if brand_identity and brand_identity.get('voice_samples'):
    from services.prompt_builder import build_voice_clone_prompt
    
    system_prompt, user_prompt = build_voice_clone_prompt(
        brand_identity=brand_identity,
        task=f"Aperfeiçoe capítulo com base em: {data.refinement_prompt}",
        context="aperfeiçoamento de capítulo de ebook"
    )
```

---

### 3. `LucresIA.__init__()` (Sistema de IA Central)
**Arquivo**: `backend/services/lucresia.py` (linha ~81)

**Integração**:
- Detecta automaticamente se `brand_identity` tem `voice_samples`
- Substitui system prompt padrão por `VoiceClonePromptBuilder.build_system_prompt()`
- Método `_build_basic_system_prompt()` como fallback
- Aplicado a TODOS os endpoints que usam LucresIA:
  - `/api/ai/generate-content`
  - Diagnósticos
  - Análises de bio
  - Qualquer geração via LucresIA

**Código**:
```python
# SE brand_identity tem voice_samples, usar VoiceClonePromptBuilder
if brand_identity and brand_identity.get('voice_samples'):
    try:
        from services.prompt_builder import VoiceClonePromptBuilder
        builder = VoiceClonePromptBuilder(brand_identity)
        system_message = builder.build_system_prompt(context="conteúdo geral")
    except Exception as e:
        # Fallback: usa método antigo
        system_message = self._build_basic_system_prompt(...)
```

---

### 4. `CarouselGenerator.__init__()` (Gerador de Carrosséis)
**Arquivo**: `backend/services/carousel_generator.py` (linha ~58)

**Integração**:
- Detecta `voice_samples` em `brand_identity`
- Usa `VoiceClonePromptBuilder` com context="carrossel instagram"
- Fallback: identidade básica
- Aplicado a:
  - `/api/ai/generate-carousel`
  - `/api/ai/generate-carousel-sequence`

**Código**:
```python
# SE brand_identity tem voice_samples, usar VoiceClonePromptBuilder
if brand_identity and brand_identity.get('voice_samples'):
    try:
        from services.prompt_builder import VoiceClonePromptBuilder
        builder = VoiceClonePromptBuilder(brand_identity)
        system_message = builder.build_system_prompt(context="carrossel instagram")
    except Exception as e:
        # Fallback: identidade básica
```

---

## 🔄 Fluxo de Integração

```
1. Usuário cria/edita identidade em /dashboard/construtor-marca
   ↓
2. Frontend salva via POST /api/brand-identity/
   ↓
3. Backend salva em MongoDB: collection brand_identities
   ↓
4. Análise de voz opcional via POST /api/brand-identity/analyze-voice
   ↓
5. Usuário gera conteúdo (ebook, carrossel, post, etc.)
   ↓
6. Endpoint busca brand_identity do MongoDB
   ↓
7. Se voice_samples existir:
      VoiceClonePromptBuilder constrói system prompt personalizado
   Senão:
      Usa prompt genérico
   ↓
8. LLM gera conteúdo COM estilo do usuário
   ↓
9. Conteúdo salvo com flag brand_identity_used: true
```

---

## 📡 Endpoints Que Já Usam Brand Identity

### Automáticos (via LucresIA)
Todos endpoints que instanciam `LucresIA` automaticamente usam clone de voz:

- ✅ `/api/ai/generate-content` - Geração de conteúdo genérico
- ✅ `/api/diagnosis/bio` - Análise de bio do Instagram
- ✅ `/api/diagnosis/presenca-digital` - Diagnóstico de presença digital
- ✅ Qualquer endpoint que use `LucresIA(brand_identity=...)`

### Automáticos (via CarouselGenerator)
- ✅ `/api/ai/generate-carousel` - Carrossel único
- ✅ `/api/ai/generate-carousel-sequence` - Sequência de carrosséis

### Integrados Manualmente
- ✅ `/api/ebook-new/generate` - Geração de e-book
- ✅ `/api/ebook-new/refine-chapter` - Aperfeiçoamento de capítulo

---

## 🧪 Como Testar

### 1. Criar Identidade de Marca
```bash
POST http://localhost:8000/api/brand-identity/
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "brand_name": "Dra. Carolina Santos",
  "instagram_handle": "@dracarol_estetica",
  "main_specialty": "Harmonização Facial",
  "brand_archetype": "O Sábio",
  "positioning": ["Técnica Avançada", "Resultados Naturais"],
  "target_audience": "Mulheres 25-45 anos que buscam naturalidade",
  "voice_samples": "Oi gente! ✨ Hoje vou contar uma coisa que muita gente não sabe... O preenchimento labial NÃO é só sobre volume, tá? É sobre equilíbrio! Cada rosto é único e eu analiso CADA detalhe antes de aplicar. E olha que incrível: quando a gente entende a anatomia da face, o resultado fica muito mais natural! Sabe aquele medo de ficar artificial? Pois é, quando feito por profissional capacitado, isso não acontece! Vem comigo nessa jornada de beleza natural 💋",
  "formality": "Muito informal - como conversa entre amigas",
  "communication_style": ["Uso emojis frequentemente", "Faço perguntas retóricas", "Sou direta e objetiva"],
  "sentence_length": "Frases curtas e diretas",
  "paragraph_style": "Parágrafos curtos (1-2 linhas)",
  "catchphrases": ["gente linda", "olha que incrível", "vem comigo nessa"],
  "opening_style": "Sempre inicio com saudação calorosa seguida de emoji e pergunta impactante",
  "closing_style": "Encerro com CTA direto e emojis relacionados",
  "punctuation": ["Uso muitas reticências...", "Uso exclamações!", "Uso CAPS para ênfase"],
  "personality": ["Empática e acolhedora", "Enérgica e motivadora"],
  "tone_of_voice": ["Educativo", "Inspirador", "Próximo"],
  "bio_text": "Harmonização Facial | Resultados Naturais | Dra Carolina Santos"
}
```

### 2. Analisar Voz (Opcional)
```bash
POST http://localhost:8000/api/brand-identity/analyze-voice
Authorization: Bearer <JWT>
```

**Resposta**:
```json
{
  "avg_sentence_length": 12.5,
  "emoji_frequency": 3.8,
  "question_ratio": 0.25,
  "exclamation_ratio": 0.4,
  "paragraph_avg_lines": 1.5,
  "uses_caps": true,
  "uses_ellipsis": true,
  "common_phrases": ["olha que incrível", "vem comigo nessa", "gente linda"],
  "vocabulary_level": "simple",
  "formality_detected": "muito_informal"
}
```

### 3. Gerar E-book com Clone de Voz
```bash
POST http://localhost:8000/api/ebook-new/generate
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "professional_name": "Dra. Carolina Santos",
  "specialty": "Harmonização Facial",
  "main_topic": "Preenchimento Labial Natural",
  "objective": "Educar sobre técnicas de preenchimento",
  "structure_type": "educativa-explicativa",
  "selected_chapters": [...],
  "writing_tone": "educativo",
  "visual_style": "clean-profissional"
}
```

**Resultado esperado**: E-book escrito com o estilo da Dra. Carolina (emojis, reticências, frases curtas, "olha que incrível", etc.)

### 4. Gerar Carrossel com Clone de Voz
```bash
POST http://localhost:8000/api/ai/generate-carousel
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "niche": "estética",
  "carousel_objective": "educação",
  "target_audience": "mulheres 25-45",
  "tone_of_voice": "próximo",
  "offer_or_theme": "Mitos sobre preenchimento labial",
  "audience_awareness": "ciente",
  "number_of_slides": 7
}
```

**Resultado esperado**: Carrossel com linguagem informal, emojis, exclamações, catchphrases da profissional

---

## 🔍 Verificação de Integração

### Checklist de Validação

1. **Brand Identity Salva**:
   ```bash
   GET http://localhost:8000/api/brand-identity/
   ```
   Deve retornar identidade completa

2. **Voice Samples Detectados**:
   Verificar se `voice_samples` tem min 100 chars

3. **Análise de Voz Executada**:
   Campo `voice_analysis` presente na identidade

4. **Conteúdo Gerado com Personalização**:
   - E-book deve conter frases características da profissional
   - Carrossel deve ter tom de voz personalizado
   - Posts devem seguir padrão de pontuação (emojis, exclamações, etc.)

5. **Flag de Rastreamento**:
   Conteúdo salvo com `brand_identity_used: true`

---

## 🚀 Próximos Endpoints para Integrar

### Prioridade Alta
- [ ] `/api/ai/generate-caption` - Legendas para posts
- [ ] `/api/ai/generate-all-captions` - Múltiplas legendas
- [ ] `/api/seo/generate-blog` - Artigos de blog SEO

### Prioridade Média
- [ ] `/api/ai/generate-persona` - Geração de personas
- [ ] `/api/diagnosis/presenca-simples` - Diagnóstico simplificado
- [ ] Endpoints de WhatsApp scripts

### Prioridade Baixa (já têm identidade básica)
- Endpoints legados que não precisam de clone de voz
- Endpoints administrativos

---

## 🐛 Troubleshooting

### Erro: "brand_identity not found"
- Usuário não criou identidade ainda
- Verificar se `user_id` está correto na query MongoDB

### Clone de voz não aplicado
- Verificar se `voice_samples` tem min 100 chars
- Checar logs: deve mostrar "✅ Using VoiceClonePromptBuilder"
- Se fallback, verá: "⚠️ Erro ao construir prompt personalizado"

### System prompt muito longo
- VoiceClonePromptBuilder gera ~2000 tokens
- Verificar se LLM suporta context window suficiente
- GPT-4o: 128k tokens (OK)
- Gemini 2.0 Flash: 1M tokens (OK)

### Conteúdo gerado não parece personalizado
- Validar análise de voz com `POST /analyze-voice`
- Verificar se métricas fazem sentido
- Refinar `voice_samples` com mais exemplos

---

## 📊 Métricas de Uso

### Logs para Monitoramento
```python
# Em cada endpoint integrado, log:
if brand_identity and brand_identity.get('voice_samples'):
    print(f"✅ Clone de voz ativado para user {current_user['id']}")
else:
    print(f"⚠️ Clone de voz NÃO disponível para user {current_user['id']}")
```

### Campos para Analytics
- `brand_identity_used: bool` - Flag em conteúdo gerado
- `voice_analysis_version: str` - Versão do analyzer usado
- `prompt_builder_version: str` - Versão do builder

---

## 📝 Changelog de Integrações

### v2.2.0 (2025-01-19)
- ✅ Integrado `/api/ebook-new/generate`
- ✅ Integrado `/api/ebook-new/refine-chapter`
- ✅ Integrado `LucresIA` (afeta 10+ endpoints)
- ✅ Integrado `CarouselGenerator` (2 endpoints)
- ✅ Criado sistema de fallback para compatibilidade
- ✅ Documentação completa em `VOICE_CLONE_SYSTEM.md`

### Próxima versão (v2.3.0)
- [ ] Integrar legendas e captions
- [ ] Integrar blog SEO
- [ ] Métricas de similaridade (antes/depois)
- [ ] Dashboard de performance do clone
