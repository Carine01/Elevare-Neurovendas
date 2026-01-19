# Documentação: Gerador de E-books Estratégico (Elevare)

## Visão Geral

O **Gerador de E-books Estratégico** é um wizard de 5 passos que transforma conhecimento e posicionamento de profissionais da estética em e-books otimizados para autoridade e conversão. Ele integra inteligência artificial (Anthropic API) para gerar conteúdo altamente personalizado baseado em estratégia.

---

## Arquitetura

```
EbooksPage (UI Container)
├── ElevareEbookGenerator (Orquestrador de Estado)
│   ├── FormDataState (Estado de formulário)
│   ├── Diagnostico (Análise estratégica)
│   ├── GeneratedContent (Payload do e-book)
│   ├── ebookApiService (Chamadas à API)
│   ├── ebookObservability (Métricas e logging)
│   └── UI Components (5 Steps)
│
└── Shared
    ├── types/ebook.ts (Tipagem centralizada)
    ├── services/ebookApiService.ts (Camada de API com retry)
    ├── services/ebookObservability.ts (Instrumentação)
    └── index.css (Temas e animações globais)
```

---

## Fluxo dos 5 Passos

### Passo 0: **Diagnóstico Estratégico**
- **O quê?** Coleta objetivo real, público, nível de consciência, especialidade
- **Saída:** Diagnóstico com alertas, estrutura sugerida, gatilhos principais
- **Validação:** Todos os 5 campos obrigatórios preenchidos

### Passo 1: **Posicionamento**
- **O quê?** Escolhe personalidade da marca (autoridade, científica, inspiradora, educadora) e nível técnico do conteúdo
- **Saída:** Contexto de tom e linguagem
- **Validação:** Nenhuma (skip seguro)

### Passo 2: **Contexto da Profissional**
- **O quê?** Nome, clínica, tema principal, diferencial único, principal objeção
- **Saída:** Contexto humano e pessoal para personalização
- **Validação:** Nome profissional + Tema principal (mínimo)

### Passo 3: **Arquitetura do Conteúdo**
- **O quê?** Ângulo estratégico do e-book (o "gancho" único)
- **Saída:** Prompt estruturado pronto para IA
- **Validação:** Ângulo estratégico preenchido

### Passo 4: **Geração Inteligente → Resultado**
- **O quê?** Chama Anthropic API com prompt completo, aguarda resposta
- **Saída:** E-book JSON com título, subtítulo, capítulos, conclusão, metadata
- **UX:** 
  - Loading: spinner + mensagens de progresso (0-100%)
  - Erro: tela com mensagem, botões "Tentar novamente" e "Voltar e ajustar"
  - Sucesso: preview com estatísticas (capítulos, objeções, autoridade, conversão)
  - Ações: Download PDF, Compartilhar WhatsApp, Criar novo

---

## Decisões Técnicas Críticas

### 1. **Autenticação e Config via Environment**
- API Key, URL, modelo e versão da API **não são hardcoded**
- Usam `import.meta.env.VITE_*` para variáveis de ambiente
- `.env.example` documenta todas as variáveis necessárias
- `.gitignore` protege `.env.local` e arquivos sensíveis

**Benefício:** Segurança, facilita múltiplos ambientes (dev, staging, prod)

### 2. **Camada de API com Retry Automático**
- `ebookApiService.ts` encapsula toda lógica de chamada
- Retry automático até 3 vezes com backoff exponencial
- Suporte para `AbortController` (cancelamento de requests)
- Erros normalizados em `EbookApiError` com code, statusCode, originalError

**Benefício:** Resiliência contra falhas temporárias, suporte a cancelamento, debugging simplificado

### 3. **Tipagem Forte e Centralizada**
- Tipos consolidados em `types/ebook.ts`
- Validação de schema via `isValidEbookConteudo()` antes de setar estado
- Remoção de `@ts-nocheck` → type safety completa

**Benefício:** Menos bugs em runtime, autocomplete do IDE, refactoring seguro

### 4. **Tratamento de Erro Unificado**
- Erros surfacem como toast inline (não alert/console)
- Estados separados para erro de geração (`apiError`) e erro de PDF (`pdfError`)
- Contexto de erro sempre presente para observabilidade

**Benefício:** UX melhor, auditoria facilitada, rastreamento de problemas

### 5. **Resiliência de Fluxo**
- Reset seguro de estado ao voltar de erro ou criar novo
- Bloqueios contra double-submission (flags `isGenerating`, `isDownloadingPdf`)
- Transições de estado claras (step 4 é "processamento")
- Cancelamento de requests inline

**Benefício:** Sem travamentos, sem estados inconsistentes, UX previsível

### 6. **Instrumentação Preparada**
- `ebookObservability.ts` fornece hooks para métricas
- Eventos: `start`, `step_complete`, `error`, `success`, `cancel`
- Fire-and-forget via fetch (não bloqueia UX)
- Session ID para correlacionar fluxo do usuário

**Benefício:** Base pronta para métricas de funil, conversão, tomada de decisão

### 7. **Estilos Globais e Tema**
- Animações (`slideInFromBottom`, `pulse-glow`) em `index.css`
- Classes reutilizáveis (`.glass-dark`, `.card-hover`)
- Font Inter importada globalmente
- Evita injeção de CSS no componente

**Benefício:** Manutenção centralizada, performance, consistência visual

---

## Variáveis de Ambiente Obrigatórias

```bash
# Backend
VITE_BACKEND_URL=http://localhost:8000

# Anthropic AI (gerador)
VITE_ANTHROPIC_API_URL=https://api.anthropic.com/v1/messages
VITE_ANTHROPIC_MODEL=claude-3-5-sonnet-20240620
VITE_ANTHROPIC_API_VERSION=2023-06-01
VITE_ANTHROPIC_API_KEY=your-api-key-here

# Analytics (opcional)
VITE_ANALYTICS_ENABLED=false
VITE_ANALYTICS_ENDPOINT=http://localhost:3001/metrics
```

---

## Fluxo de Erro e Recuperação

```
[Passo 0-3] Validação de formulário
    ↓ (tudo ok)
[Passo 4] Chama API com AbortController
    ↓ (falha ou timeout)
[setApiError] Exibe erro inline + botões
    ├─ "Tentar novamente" → refaz chamada (retry automático)
    └─ "Voltar e ajustar" → reset state, volta ao passo 3
```

---

## Performance e Segurança

| Aspecto | Implementado |
|---------|-------------|
| **Auth Header** | ✅ `x-api-key` no Anthropic |
| **Timeout** | ✅ Implícito no AbortController (60s recomendado) |
| **Retry** | ✅ 3 tentativas com backoff |
| **Rate Limit** | ⚠️ Implementação futura (quotas por usuário) |
| **Secrets** | ✅ Protegidos em env, não em código |
| **CORS** | ✅ Backend responsável |
| **Data Validation** | ✅ Schema check antes de setState |

---

## Métricas Disponíveis

Com `VITE_ANALYTICS_ENABLED=true` e endpoint configurado:

- `ebook:generation:start` → Marca início da geração
- `ebook:generation:step_complete` → Duração de cada passo
- `ebook:generation:error` → Captura erros com contexto
- `ebook:generation:success` → Total de capítulos gerados, tempo total
- `ebook:generation:cancel` → Rastreamento de cancelamentos

---

## Próximas Melhorias

1. **Rate Limiting** → Implementar quota por usuário/sessão
2. **Caching** → Guardar e-books gerados localmente
3. **Templates** → Ofertar variações de estrutura
4. **Versionamento** → Rastreamento de versões de e-books
5. **Analytics Avançada** → Funil completo (início → sucesso → PDF → share)
6. **Integração com Backend** → Salvar e-books no banco, rastrear histórico
7. **A/B Testing** → Testar variações de prompt/estrutura

---

## Dúvidas Frequentes

**P: Por que não usar SWR ou React Query?**
A: O fluxo é simples (chamada única ao final). Para múltiplas chamadas assíncronas, considerar.

**P: E se a API cair?**
A: Retry automático 3x com backoff. Depois, usuário vê erro com opção de tentar novamente.

**P: Onde guardar o e-book gerado?**
A: Hoje em memória (durante sessão). Próximo: Backend + localStorage fallback.

**P: Como rastrear conversão?**
A: Usar `ebookObservability.trackSuccess()` ao final. Backend correlaciona com PDF download.

---

**Documento:** 19 de janeiro de 2026  
**Status:** MVP com fundações para escala  
**Responsável:** Equipe de Engenharia Elevare
