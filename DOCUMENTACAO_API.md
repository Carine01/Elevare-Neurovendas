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