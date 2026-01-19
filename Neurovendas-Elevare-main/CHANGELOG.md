# Changelog

All notable changes to NeuroVendas by Elevare will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v2.1.0] - 2025-01-XX

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

