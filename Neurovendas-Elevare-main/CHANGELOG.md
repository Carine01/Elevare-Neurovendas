# Changelog

All notable changes to NeuroVendas by Elevare will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v2.3.0] - 2025-01-19

### 🎉 Novidades

**Sistema de Clone de Voz - Integração Backend Completa**
- **API REST Brand Identity**: 5 novos endpoints para gestão de identidade de marca
  - `POST /api/brand-identity/` - Criar/atualizar identidade completa
  - `GET /api/brand-identity/` - Buscar identidade do usuário
  - `POST /api/brand-identity/analyze-voice` - Análise de voz automática (10 métricas)
  - `GET /api/brand-identity/status` - Verificar completude e status
  - `DELETE /api/brand-identity/` - Deletar identidade
  
- **Voice Clone Analyzer**: Sistema NLP de análise de escrita com 10 métricas
  - Tamanho médio de frases (palavras por frase)
  - Frequência de emojis (por 100 caracteres)
  - Taxa de perguntas e exclamações
  - Média de linhas por parágrafo
  - Detecção de CAPS e reticências
  - Extração de frases comuns (n-grams 2-5 palavras)
  - Análise de vocabulário (simple/moderate/complex)
  - Detecção de formalidade (5 níveis: muito_informal → muito_formal)
  
- **Prompt Builder**: Construtor de system prompts personalizados
  - 6 seções dinâmicas (identidade, voz, estilo, restrições, exemplos, contexto)
  - Integração automática com análise de voz
  - Suporte a múltiplos contextos (ebook, carrossel, legenda, email)
  - System prompts de ~2000 tokens
  
- **Integração com 15+ Endpoints Existentes**:
  - ✅ `/api/ebook-new/generate` - E-books com estilo do usuário
  - ✅ `/api/ebook-new/refine-chapter` - Aperfeiçoamento mantendo voz
  - ✅ `/api/ai/generate-carousel` - Carrosséis personalizados
  - ✅ `/api/ai/generate-carousel-sequence` - Sequências com tom único
  - ✅ `/api/ai/generate-content` - Conteúdo genérico (via LucresIA)
  - ✅ Todos endpoints que usam `LucresIA` (10+ endpoints)
  - ✅ Todos endpoints que usam `CarouselGenerator` (2 endpoints)

### ⚡ Melhorias

**LucresIA e CarouselGenerator Atualizados**
- Detecção automática de `voice_samples` em `brand_identity`
- Substituição automática de system prompt por versão personalizada
- Fallback inteligente para prompt genérico quando identidade não existe
- Método `_build_basic_system_prompt()` para compatibilidade

**Sistema de Limites Atualizado**
- `brand_identity_creation`: 1 (Free), Ilimitado (Essencial+)
- `voice_analysis`: 3/mês (Free), 10/mês (Essencial), Ilimitado (Pro+)
- Mapeamento em `CONTENT_TYPE_TO_LIMIT` para brand_identity

**Validação Pydantic Robusta**
- `voice_samples`: min 100 caracteres
- `tone_of_voice`: max 3 itens
- `bio_text`: max 150 caracteres
- Validação automática de todos os 35+ campos

### 📚 Documentação

**4 Novos Documentos Técnicos**
- `VOICE_CLONE_SYSTEM.md` - Documentação completa do sistema (500+ linhas)
- `INTEGRATION_ENDPOINTS.md` - Guia de integração com endpoints (300+ linhas)
- `INTEGRATION_SUMMARY.md` - Resumo executivo das integrações
- `QUICKSTART_VOICE_CLONE.md` - Guia rápido para desenvolvedores, testadores e usuários

**Schemas e Testes**
- `backend/schemas/brand_identity.py` - 4 modelos Pydantic (204 linhas)
- `tests/test_voice_integration.py` - Suite de 6 testes (200+ linhas)

### 🛠️ Arquitetura

**Novos Serviços**
- `backend/services/voice_clone_analyzer.py` (268 linhas)
- `backend/services/prompt_builder.py` (380 linhas)
- `backend/routers/brand_identity.py` (180 linhas)

**Padrão de Integração**
```python
# Busca identidade
brand_identity = await db.brand_identities.find_one({"user_id": user_id})

# Se existir voice_samples, usa clone
if brand_identity and brand_identity.get('voice_samples'):
    from services.prompt_builder import VoiceClonePromptBuilder
    builder = VoiceClonePromptBuilder(brand_identity)
    system_prompt = builder.build_system_prompt(context="ebook")
else:
    # Fallback
    system_prompt = "Você é LucresIA..."
```

### 🔒 Segurança

- Análise de voz custa 5 créditos (proteção contra abuso)
- Criação de identidade custa 10 créditos
- Validação de min/max em todos os campos
- User ID obrigatório em todas as queries (isolamento de dados)

### 🐛 Correções

- Nenhuma quebra de compatibilidade com código existente
- Fallback automático quando `voice_samples` ausente
- Try/catch em integrações para não quebrar fluxo existente

---

## [v2.2.0] - 2025-01-19

### 🎉 Novidades

**Construtor de Marca Completo com Clone de Voz IA**
- **Preview Sidebar em Tempo Real**: Visualização instantânea de todos os dados preenchidos (logo, arquétipo, posicionamento, tom de voz, tratamentos, cores, tipografia)
- **Clone de Voz IA Completo**: Sistema avançado para IA reproduzir exatamente o estilo de escrita do usuário:
  - Amostras de texto (mínimo 500 caracteres recomendado)
  - 10 estilos de comunicação selecionáveis (emojis, perguntas retóricas, storytelling, termos técnicos, metáforas, analogias, humor, vulnerabilidade, dados/stats)
  - 4 opções de tamanho de frases (curtas, médias, longas, misto)
  - 3 estruturas de parágrafos (curtos, médios, longos)
  - Expressões e bordões personalizados (tag input)
  - Estilo de abertura e encerramento de textos
  - 5 níveis de formalidade (bem informal até muito formal)
  - 6 opções de pontuação (reticências, exclamações, quebras de linha, CAPS, travessões, tradicional)
  - 6 traços de personalidade (empática, motivadora, sincera, didática, confiante, bem-humorada)
  - Notas adicionais sobre estilo próprio
- **Tag Inputs Interativos**: Subespecialidades, tratamentos, keywords, palavras proibidas, catchphrases com visual moderno e remover tags com um clique
- **Posicionamento Multi-Select**: Permite selecionar múltiplos posicionamentos de mercado (não apenas um)
- **6 Tipos de Conteúdo Preferidos**: Carrosséis, Reels, Stories, Antes/Depois, Bastidores, Depoimentos
- **Auto-Save Indicator**: Salvamento automático a cada 3 segundos com timestamp visível
- **Contador de Caracteres**: Bio do Instagram com limite de 150 caracteres
- **4 Fontes Premium**: Inter, Playfair Display, Montserrat, Lora com preview e descrição
- **Color Picker Avançado**: 3 cores (primária, secundária, destaque) com preview e valor hex

**Componentização Reutilizável**
- `Section`: Wrapper de seções com título e subtítulo
- `FormField`: Label, hint e required indicator padronizados
- `SelectionCard`: Card de seleção com ícone, título, descrição e estado selected
- `TagInput`: Input com tags removíveis e variante danger para palavras proibidas
- `ColorPicker`: Seletor de cor com preview hex
- `PreviewSection`: Item de preview sidebar com label e children

### 📚 Documentação
- **Guia Técnico Central**: `.github/copilot-instructions.md` com arquitetura completa, padrões de código, workflow Git (commits, branching, PR, releases), estratégias de deployment e testes

### 🔧 Melhorias Técnicas
- **Interface BrandIdentity Expandida**: 18 novos campos (voice_samples, communication_style, sentence_length, paragraph_style, catchphrases, opening_style, closing_style, formality, punctuation, personality, style_notes, keywords, content_types, positioning como array)
- **Type Guards**: Validação segura para evitar erros de undefined em arrays
- **Acessibilidade**: Aria-labels em inputs de arquivo e botões de remoção
- **Auto-Save com Debounce**: 3 segundos após última mudança
- **Validação de Campos Obrigatórios**: Toast com mensagem clara ao salvar sem campos requeridos

### ⚠️ Breaking Changes
- `positioning` mudou de `string` para `string[]` (multi-select)
- `tone_of_voice` mudou de `string` para `string[]` (multi-select)

---

## [v2.1.0] - 2025-01-15

### 🎉 Novidades

**Sistema de E-books Aprimorado**
- **Biblioteca de 18 Assuntos Categorizados**: Temas estratégicos organizados em 3 grupos (Educar Público, Ajudar a Decidir, Posicionar Expertise) com níveis de consciência e estruturas sugeridas
- **Copy de Divulgação Automática**: Geração de texto promocional pronto para 4 canais (Instagram Post, Stories, Email, WhatsApp) com botões de cópia rápida
- **8 Estilos de Capa Profissionais**: Paletas de cores pré-definidas (Minimalista, Bold, Elegante, Moderno, Profissional, Natural, Sunset, Oceano) para personalização visual
- **Modal de Aperfeiçoamento de Capítulos**: 6 opções de IA para melhorar conteúdo (expandir texto, tornar mais atrativo, adicionar exemplos, storytelling, dados científicos, didática)

**APIs de IA com Sistema de Créditos**
- **Endpoint POST /api/ebooks/generate-copy**: Gera copy de marketing usando LLM (custo: 20 créditos)
- **Endpoint POST /api/ebooks/improve-chapter**: Aperfeiçoa capítulos com 6 estratégias de IA (custo: 15 créditos)
- **Checagem Automática de Créditos**: Validação antes de operações de IA com mensagens de upgrade
- **Fallback e Retry**: Tratamento robusto de erros com feedback ao usuário

### 📚 Documentação
- **Guia Técnico Central**: `.github/copilot-instructions.md` com arquitetura completa, padrões de código, workflow Git (commits, branching, PR, releases), estratégias de deployment e testes

### 🔧 Melhorias Técnicas
- **Sistema de Créditos Ampliado**: COST_MAP com custos para copy_divulgacao (20) e aperfeicoar_capitulo (15)
- **Integração Frontend-Backend**: Modals conectados às APIs reais, sem mocks
- **Error Handling**: Estados de erro e loading com UI de retry

### ⚠️ Breaking Changes
Nenhuma mudança incompatível nesta versão.

---

## Release Metadata

**Tag**: `v2.1.0`  
**Branch**: `master`  
**Commits**: 8 (b060190, f3928a2, 84bc544, a49c2ae, 7eb2635, 39381bc, 9b8ab9c)  
**Total Lines Changed**: +2,090 insertions, -90 deletions

