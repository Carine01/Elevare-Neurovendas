
# ⚡ Fluxos Principais e Endpoints (Resumo Prático)

Guia rápido para produto/atendimento: o que cada página faz e quais endpoints usa. Para detalhes técnicos, consulte os arquivos de router no backend e as páginas no frontend.

## Autenticação
- POST /api/auth/register — cria conta
- POST /api/auth/login — autentica e retorna token
- GET /api/auth/me — dados do usuário logado
- POST /api/auth/beta-login — login rápido (modo beta)

## Dashboard e Métricas
- GET /api/dashboard/stats — números exibidos na página inicial

## Conteúdo com IA (Robo Produtor)
- GET /api/ai/carousel-options — carrega opções de carrossel (monólito)
- POST /api/ai/generate-content — gera post/reels/stories
- POST /api/ai/generate-carousel — gera carrossel

## E-books
- GET /api/ebooks/list — lista e-books do usuário
- POST /api/ebook/generate-v2 — gera e-book (motor interno V2, monólito)
- POST /api/ebooks/generate-copy — copy de divulgação (consome créditos)
- POST /api/ebooks/improve-chapter — aperfeiçoar capítulo (consome créditos)

## Identidade de Marca
- GET /api/brand-identity — carregar identidade
- POST /api/brand-identity — salvar/atualizar
- POST /api/brand-identity/analyze-voice — analisar voz

## Leads (CRM básico)
- GET /api/leads — listar
- POST /api/leads — criar
- PUT /api/leads/{lead_id} — atualizar
- DELETE /api/leads/{lead_id} — excluir

## Pagamentos
- GET /api/payments/plans — planos
- POST /api/payments/create-checkout — iniciar checkout
- GET /api/payments/status/{session_id} — status do checkout
- POST /api/payments/webhook — webhook Stripe
- GET /api/payments/subscription — assinatura atual
- GET /api/payments/history — histórico

## Saúde da Plataforma
- GET /api/health — checagem rápida
- GET /api/health/detailed — checagens de integrações

---

## Mapa Rápido: Página → Ações → Endpoints
- Dashboard
    - Criar Post Estratégico → abre Robo Produtor → POST /api/ai/generate-content; POST /api/ai/generate-carousel
    - Gerenciar Leads → GET/POST/PUT/DELETE /api/leads
- Robo Produtor
    - Carregar opções → GET /api/ai/carousel-options
    - Gerar conteúdo → POST /api/ai/generate-content
    - Gerar carrossel → POST /api/ai/generate-carousel
- E-books
    - Gerar e-book V2 → POST /api/ebook/generate-v2
    - Listar → GET /api/ebooks/list
    - Copy divulgação → POST /api/ebooks/generate-copy
    - Aperfeiçoar capítulo → POST /api/ebooks/improve-chapter
- Construtor de Marca
    - GET/POST /api/brand-identity; POST /api/brand-identity/analyze-voice

Notas
- JWT é enviado automaticamente pelo frontend; chamadas diretas à API precisam do header Authorization: Bearer <token>.
- Operações de IA podem levar até 60–180s.

---

# 🧪 Smoke Tests Locais (5 minutos)

Backend (porta 8000):
```powershell
cd backend
pip install -r requirements.txt
python server.py
```

Health básico e detalhado:
```powershell
Invoke-RestMethod http://localhost:8000/api/health -Method GET
Invoke-RestMethod http://localhost:8000/api/health/detailed -Method GET
```

Token rápido (BETA):
```powershell
$login = Invoke-RestMethod http://localhost:8000/api/auth/beta-login -Method POST
$token = $login.access_token
```

Conferir usuário logado:
```powershell
Invoke-RestMethod http://localhost:8000/api/auth/me -Headers @{ Authorization = "Bearer $token" } -Method GET
```

Gerar E-book V2 (motor interno):
```powershell
$body = @{ title = "Guia Rápido"; topic = "Marketing de Estética"; audience = "Dermatos e esteticistas"; tone = "profissional"; num_chapters = 3 } | ConvertTo-Json
Invoke-RestMethod http://localhost:8000/api/ebook/generate-v2 -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" } -Method POST -Body $body
```

# IA (Robo Produtor): opções e geração
```powershell
# Carregar opções de carrossel (monólito)
Invoke-RestMethod http://localhost:8000/api/ai/carousel-options -Headers @{ Authorization = "Bearer $token" } -Method GET

# Gerar conteúdo (post/reels/stories)
$content = @{ tema = "Dicas de skincare para pele oleosa"; tipo = "post"; tom = "profissional" } | ConvertTo-Json
Invoke-RestMethod http://localhost:8000/api/ai/generate-content -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" } -Method POST -Body $content

# Gerar carrossel
$carousel = @{ 
    offer_or_theme = "Tratamentos avançados para melasma"; 
    tone = "profissional"; 
    cta_type = "direct"; 
    target_audience = "cliente_final"; 
    pain_points = @("manchas recorrentes", "baixa autoestima"); 
    desired_results = @("tom de pele uniforme", "segurança no tratamento") 
} | ConvertTo-Json
Invoke-RestMethod http://localhost:8000/api/ai/generate-carousel -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" } -Method POST -Body $carousel
```

# 🛠️ Troubleshooting Rápido
- 401 Unauthorized:
    - Causa: token ausente/expirado.
    - Ação: refaça login (ou `POST /api/auth/beta-login`) e envie `Authorization: Bearer <token>`.

- 403 limit_exceeded / insufficient_credits:
    - Causa: limite do plano atingido ou créditos insuficientes.
    - Ação: verifique limites em `GET /api/ai/usage` ou saldo/créditos; ajuste plano/consumo.

- 503 ai_generation_failed:
    - Causa: falha transitória/timeout no provedor de IA.
    - Ação: tente novamente em 30–60s; operações de IA podem levar 60–180s.

- 503 Serviço de IA não configurado:
    - Causa: ausência de `EMERGENT_LLM_KEY` e `OPENAI_API_KEY`.
    - Ação: defina uma dessas variáveis no backend e reinicie.

- 500 generation_failed / improvement_failed:
    - Causa: erro inesperado na geração de copy/capítulo.
    - Ação: revise o payload; tente novamente; se persistir, verificar logs do backend.

- 504/timeout no cliente:
    - Causa: operação longa; rede lenta.
    - Ação: aumente timeout do cliente (frontend já usa 300s) e reenvie.

# Apêndice — Exemplos de Payloads (JSON)

Cabeçalhos comuns para endpoints protegidos:

```
Authorization: Bearer <seu_token_jwt>
Content-Type: application/json
```

## 1) POST /api/ai/generate-content
Corpo mínimo (gera post, reels ou stories):

```json
{
    "tema": "Preenchimento labial para iniciantes",
    "tipo": "post",
    "tom": "profissional"
}
```

Variação para stories:

```json
{
    "tema": "5 sinais de pele desidratada",
    "tipo": "stories",
    "tom": "conversacional"
}
```

Observações:
- `tipo`: "post" | "reels" | "story" | "stories" (limites variam por tipo).
- Respostas 403 indicam limite excedido; 503 indicam falha transitória do provedor de IA.

## 2) POST /api/ai/generate-carousel
Corpo típico para carrossel NeuroVendas:

```json
{
    "offer_or_theme": "Pacote de bioestimuladores para flacidez",
    "tone": "profissional",
    "cta_type": "direct",
    "target_audience": "Mulheres 35-55 anos, pós-gestação",
    "pain_points": [
        "Flacidez no pescoço",
        "Perda de colágeno",
        "Medo de aspecto artificial"
    ],
    "desired_results": [
        "Efeito natural",
        "Pele mais firme",
        "Procedimento rápido"
    ]
}
```

Observações:
- `cta_type`: exemplos comuns "direct" (DM/WhatsApp) ou "lead" (captação).
- `target_audience`, `pain_points` e `desired_results` são opcionais, mas melhoram a precisão.

## 3) POST /api/ebook/generate-v2
Cria e-book via motor interno (monólito):

```json
{
    "title": "Guia Essencial de Bioestimuladores",
    "topic": "Bioestimuladores de colágeno para flacidez facial",
    "audience": "Dermatologistas e biomédicos estetas",
    "tone": "profissional",
    "num_chapters": 6,
    "author": "Dra. Ana Silva"
}
```

Observações:
- Requer chave de IA configurada (`EMERGENT_LLM_KEY` ou `OPENAI_API_KEY`).
- Consome créditos conforme `COST_MAP['ebook_generation']`.

## 4) POST /api/brand-identity
Cria/atualiza identidade de marca completa (validação Pydantic). Exemplo mínimo funcional com campos principais:

```json
{
    "brand_name": "Clínica Dra. Ana Silva",
    "instagram_handle": "@dra.anasilva",
    "main_specialty": "Harmonização Facial",
    "sub_specialties": ["Bioestimuladores", "Toxina botulínica"],
    "treatments": ["Botox", "Preenchimento", "Skinbooster"],
    "brand_archetype": "O Sábio",
    "positioning": ["Premium", "Especialista"],
    "team_type": "Voz Individual",
    "target_audience": "Mulheres executivas 35-50 anos",
    "differentiator": "Atendimento personalizado com foco em naturalidade",
    "brand_promise": "Resultados naturais com segurança e técnica",
    "voice_samples": "Vou ser direta: procedimentos estéticos não são milagre. O segredo está no plano certo para cada caso, com avaliação técnica, segurança e foco em naturalidade. Minha prioridade é que você se sinta confiante, sem exageros e com resultado sustentável ao longo do tempo.",
    "communication_style": ["Clara", "Direta", "Educativa"],
    "sentence_length": "Médio",
    "paragraph_style": "Parágrafos curtos e objetivos",
    "catchphrases": ["Vamos lá", "A verdade é que"],
    "opening_style": "Começo com uma pergunta instigante",
    "closing_style": "Encerramento com CTA suave",
    "formality": "Informal respeitosa",
    "punctuation": ["Uso de reticências", "Exclamações moderadas"],
    "personality": ["Confiável", "Empática"],
    "style_notes": "Evitar termos técnicos excessivos; usar exemplos práticos.",
    "tone_of_voice": ["Profissional", "Acolhedor"],
    "keywords": ["bioestimuladores", "harmonização", "naturalidade"],
    "forbidden_words": ["milagre", "sem riscos", "garantido"],
    "content_types": ["Carrossel", "Reels", "Blog"],
    "bio_text": "Harmonização com naturalidade. Segurança, técnica e acolhimento.",
    "colors": { "primary": "#4F46E5", "secondary": "#7C3AED", "accent": "#D4A853" },
    "font1": "Inter",
    "font2": "Playfair Display",
    "logo": null,
    "setup_completed": true
}
```

Observações:
- `voice_samples` deve conter ≥ 100 caracteres.
- Custos/limites: cria/edita identidade pode consumir limites conforme plano; análise de voz é cobrada à parte.

## 5) POST /api/brand-identity/analyze-voice
Sem corpo (usa a identidade salva). Apenas envie o header `Authorization`.

---

Dica: Para carregar opções de carrossel (UI), `GET /api/ai/carousel-options` (monólito) não requer corpo.
# 📋 Plano de Refatoração Backend - NeuroVendas
# 📋 Plano de Refatoração Backend - NeuroVendas

## 🎯 **Objetivo**
Transformar o `server.py` monolítico (7257 linhas) em uma arquitetura modular, escalável e manutenível.

## 📊 **Estado Atual**
- **Arquivo principal**: `server.py` (7257 linhas) - contém tudo
- **Estrutura atual**:
  ```
  backend/
  ├── server.py (monolítico)
  ├── routers/ (8 módulos não utilizados)
  ├── services/ (13 serviços)
  ├── schemas/ (1 schema)
  ├── utils/ (2 utilitários)
  └── tests/ (1 arquivo de teste)
  ```

## 🚀 **Plano de Refatoração**

### **FASE 1: Separação de Responsabilidades**
#### **1.1 Criar `core/` - Configurações Centrais**
```
backend/core/
├── __init__.py
├── config.py          # Configurações (env, database, JWT)
├── database.py        # Conexão MongoDB + dependências
├── security.py        # JWT, hashing, validações
└── middleware.py      # CORS, rate limiting, logging
```

#### **1.2 Criar `models/` - Schemas de Dados**
```
backend/models/
├── __init__.py
├── user.py            # UserCreate, UserLogin, UserResponse
├── auth.py            # TokenResponse, etc.
├── ebook.py           # Ebook schemas
├── campaign.py        # Campaign schemas
└── common.py          # Base models, enums
```

#### **1.3 Migrar Rotas para `routers/`**
- ✅ `auth.py` - Autenticação (já existe)
- ✅ `users.py` - Perfil do usuário
- ✅ `diagnosis.py` - Diagnósticos
- ✅ `ai.py` - Geração de conteúdo AI
- ✅ `ebooks.py` - Sistema de ebooks
- ✅ `calendar.py` - Calendário de posts
- ✅ `campaigns.py` - Campanhas
- ✅ `gamification.py` - Gamificação
- ✅ `payments.py` - Pagamentos
- ✅ `webhooks.py` - Webhooks externos

### **FASE 2: Services Layer**
#### **2.1 Reorganizar `services/`**
```
backend/services/
├── __init__.py
├── ai/
│   ├── __init__.py
│   ├── lucresia.py
│   ├── content_generator.py
│   └── image_generator.py
├── external/
│   ├── __init__.py
│   ├── gamma.py
│   ├── stripe.py
│   └── resend.py
├── business/
│   ├── __init__.py
│   ├── diagnosis.py
│   ├── gamification.py
│   └── campaigns.py
└── utils/
    ├── __init__.py
    ├── email.py
    ├── pdf.py
    └── validation.py
```

### **FASE 3: Application Structure**
#### **3.1 Novo `main.py`**
```python
# backend/main.py
from fastapi import FastAPI
from core.config import settings
from core.database import init_db
from routers import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Middleware
app.add_middleware(CORSMiddleware, **settings.CORS_CONFIG)

# Database
@app.on_event("startup")
async def startup_event():
    await init_db()

# Routes
app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

#### **3.2 Router Principal**
```python
# backend/routers/__init__.py
from fastapi import APIRouter
from .auth import router as auth_router
from .users import router as users_router
from .diagnosis import router as diagnosis_router
# ... outros imports

api_router = APIRouter()

# Incluir todos os routers
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(diagnosis_router)
# ... outros includes
```

### **FASE 4: Dependências e Injeção**
#### **4.1 Criar `dependencies/`**
```
backend/dependencies/
├── __init__.py
├── auth.py             # get_current_user, get_current_active_user
├── database.py         # get_db, get_user_db
└── services.py         # get_ai_service, get_email_service
```

#### **4.2 Exemplo de Uso**
```python
from fastapi import Depends
from dependencies import get_current_user, get_db

@app.get("/api/user/profile")
async def get_user_profile(
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    # Lógica aqui
    pass
```

### **FASE 5: Testes e Qualidade**
#### **5.1 Estrutura de Testes**
```
backend/tests/
├── __init__.py
├── conftest.py         # Fixtures compartilhadas
├── test_auth.py
├── test_users.py
├── test_ebooks.py
├── integration/
│   ├── test_api.py
│   └── test_database.py
└── fixtures/
    ├── users.json
    └── ebooks.json
```

#### **5.2 Cobertura de Testes**
- **Unitários**: 80%+ cobertura
- **Integração**: APIs completas
- **E2E**: Fluxos críticos

### **FASE 6: Configuração e Deploy**
#### **6.1 Environment Management**
```
backend/
├── .env.example        # ✅ Já existe
├── .env.local          # Desenvolvimento
├── .env.staging        # Staging
└── .env.production    # Produção
```

#### **6.2 Docker e Deploy**
```
backend/
├── Dockerfile          # Multi-stage build
├── docker-compose.yml  # Desenvolvimento
└── deploy/
    ├── Procfile       # Emergent
    ├── runtime.txt    # Python version
    └── requirements.txt
```

## 📈 **Benefícios Esperados**

### **Manutenibilidade**
- ✅ Código organizado por responsabilidade
- ✅ Facilita debugging e troubleshooting
- ✅ Reduz complexidade cognitiva

### **Escalabilidade**
- ✅ Fácil adicionar novas features
- ✅ Separação clara de concerns
- ✅ Reutilização de componentes

### **Testabilidade**
- ✅ Testes unitários isolados
- ✅ Mocks para dependências externas
- ✅ CI/CD automatizado

### **Performance**
- ✅ Lazy loading de serviços
- ✅ Cache inteligente
- ✅ Otimização de queries

## 🎯 **Próximos Passos**

1. **✅ FASE 1**: Criar estrutura `core/` e `models/`
2. **🔄 FASE 2**: Migrar rotas existentes para `routers/`
3. **⏳ FASE 3**: Refatorar `services/` em módulos
4. **⏳ FASE 4**: Implementar injeção de dependências
5. **⏳ FASE 5**: Escrever testes abrangentes
6. **⏳ FASE 6**: Configurar deploy production-ready

## 📋 **Checklist de Migração**

### **Rotas a Migrar (120+ endpoints)**
- [ ] Auth (register, login, me, forgot-password)
- [ ] Users (profile, settings, delete)
- [ ] Diagnosis (generate, complete, status)
- [ ] AI (chat, generate-content, analyze-bio)
- [ ] Ebooks (generate, list, download, pdf)
- [ ] Calendar (posts, schedule, stats)
- [ ] Campaigns (create, manage, generate-sequence)
- [ ] Payments (checkout, webhooks, history)
- [ ] Gamification (rewards, leaderboard, referral)

### **Services a Reorganizar**
- [ ] LucresIA → `services/ai/lucresia.py`
- [ ] Gamma → `services/external/gamma.py`
- [ ] Stripe → `services/external/stripe.py`
- [ ] Email → `services/utils/email.py`

**Tempo estimado**: 2-3 semanas para refatoração completa
**Risco**: Baixo (refatoração gradual)
**Benefício**: Código 10x mais manutenível</content>
<parameter name="filePath">c:\Users\Carine\Downloads\Neurovendas-Elevare-main\PLANO_REFACTORING_BACKEND.md