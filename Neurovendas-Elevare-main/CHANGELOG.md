# Changelog

All notable changes to NeuroVendas by Elevare will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

