# 🚀 Guia de Deployment no Emergent - NeuroVendas

## 🎯 **Visão Geral**
Este guia detalha o processo de deploy da aplicação NeuroVendas na plataforma Emergent.

## 📋 **Pré-requisitos**

### **1. Conta Emergent**
- ✅ Conta ativa na plataforma Emergent
- ✅ Projeto criado no painel
- ✅ Acesso aos logs e métricas

### **2. Configurações de Ambiente**
```bash
# Variáveis obrigatórias
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-super-secret-key-here
RESEND_API_KEY=re_...
STRIPE_SECRET_KEY=sk_...
OPENAI_API_KEY=sk-...
```

### **3. Arquivos de Configuração**
```
neurovendas-elevare/
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   └── ...
├── .env.example
├── Procfile
├── runtime.txt
└── emergent.yml
```

---

## 📁 **Estrutura de Arquivos para Deploy**

### **1. Procfile** (Obrigatório)
```procfile
# Procfile - Define processos da aplicação
web: python backend/server.py
worker: python backend/worker.py
```

**Para FastAPI:**
```procfile
web: uvicorn backend.server:app --host 0.0.0.0 --port $PORT
```

**Com Gunicorn (Recomendado para produção):**
```procfile
web: gunicorn backend.server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
```

### **2. runtime.txt** (Obrigatório)
```txt
# Python version
python-3.11.7
```

### **3. requirements.txt** (Obrigatório)
```txt
# Core dependencies
fastapi==0.104.1
uvicorn[standard]==0.24.0
gunicorn==21.2.0
motor==3.3.2
pymongo==4.6.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
python-dotenv==1.0.0

# AI & External APIs
openai==1.3.7
resend==0.7.0
stripe==7.4.0

# Image processing
Pillow==10.1.0
requests==2.31.0

# PDF generation
reportlab==4.0.7
fpdf==1.7.2

# Development (remover em produção)
pytest==7.4.3
pytest-cov==4.1.0
```

### **4. emergent.yml** (Configuração da Plataforma)
```yaml
# emergent.yml - Configuração específica do Emergent
app: neurovendas-elevare
version: "2.0.0"

# Environment
env:
  - MONGODB_URI
  - JWT_SECRET
  - RESEND_API_KEY
  - STRIPE_SECRET_KEY
  - OPENAI_API_KEY
  - DB_NAME=neurovendas_prod

# Build settings
build:
  dockerfile: Dockerfile
  context: .

# Health checks
healthcheck:
  path: /api/health
  interval: 30s
  timeout: 10s

# Scaling
scaling:
  web:
    min: 1
    max: 10
    target_cpu: 70
    target_memory: 80

# Database
databases:
  - type: mongodb
    name: neurovendas_prod
    version: "6.0"

# Add-ons
addons:
  - redis
  - papertrail
  - rollbar

# Domains
domains:
  - api.neurovendas.com
  - app.neurovendas.com
```

### **5. Dockerfile** (Opcional, mas recomendado)
```dockerfile
# Dockerfile multi-stage para otimização
FROM python:3.11-slim as builder

WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

FROM python:3.11-slim as runtime

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
USER app

WORKDIR /home/app
COPY --from=builder /root/.local /home/app/.local
COPY . .

# Add local bin to PATH
ENV PATH=/home/app/.local/bin:$PATH

EXPOSE 8001
CMD ["uvicorn", "backend.server:app", "--host", "0.0.0.0", "--port", "8001"]
```

---

## 🚀 **Passos para Deploy**

### **Passo 1: Preparar o Código**
```bash
# 1. Criar branch de produção
git checkout -b production

# 2. Atualizar versão
echo "2.0.0" > VERSION

# 3. Commit das mudanças
git add .
git commit -m "chore: prepare for production deployment"
```

### **Passo 2: Configurar Ambiente no Emergent**
```bash
# 1. Login no Emergent CLI
emergent login

# 2. Criar aplicação
emergent create neurovendas-elevare --stack python

# 3. Configurar variáveis de ambiente
emergent config:set MONGODB_URI="mongodb+srv://..."
emergent config:set JWT_SECRET="$(openssl rand -hex 32)"
emergent config:set RESEND_API_KEY="re_..."
emergent config:set STRIPE_SECRET_KEY="sk_..."
emergent config:set OPENAI_API_KEY="sk-..."
```

### **Passo 3: Deploy**
```bash
# Deploy via Git
git push emergent production:main

# Ou via CLI
emergent deploy
```

### **Passo 4: Verificar Deploy**
```bash
# Verificar status
emergent ps

# Ver logs
emergent logs --tail

# Health check
curl https://api.neurovendas.com/api/health
```

---

## 🔧 **Configurações Avançadas**

### **1. Database Connection**
```python
# backend/core/database.py
from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME", "neurovendas_prod")

client = AsyncIOMotorClient(MONGODB_URI)
db = client[DB_NAME]

async def get_db():
    return db
```

### **2. CORS Configuration**
```python
# backend/core/middleware.py
from fastapi.middleware.cors import CORSMiddleware

CORS_ORIGINS = [
    "https://app.neurovendas.com",
    "https://neurovendas.com",
    "https://www.neurovendas.com"
]

def setup_cors(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["*"],
    )
```

### **3. Security Headers**
```python
# backend/core/security.py
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

def setup_security(app):
    # HTTPS apenas em produção
    if os.getenv("ENVIRONMENT") == "production":
        app.add_middleware(HTTPSRedirectMiddleware)

    # Trusted hosts
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["api.neurovendas.com", "*.neurovendas.com"]
    )
```

### **4. Monitoring & Logging**
```python
# backend/core/monitoring.py
import logging
import rollbar
from emergent.monitoring import EmergentMetrics

# Rollbar para error tracking
rollbar.init(access_token=os.getenv("ROLLBAR_TOKEN"))

# Logging estruturado
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Métricas do Emergent
metrics = EmergentMetrics(app_name="neurovendas")
```

---

## 📊 **Monitoramento & Observabilidade**

### **1. Health Checks**
```python
# GET /api/health/detailed
@app.get("/api/health/detailed")
async def health_detailed():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0",
        "checks": {
            "database": await check_database(),
            "redis": await check_redis(),
            "external_apis": await check_external_apis()
        }
    }
```

### **2. Métricas**
```python
# backend/core/metrics.py
from emergent.metrics import Counter, Histogram

# Counters
api_requests = Counter("api_requests_total", "Total API requests")
active_users = Counter("active_users", "Active users")

# Histograms
request_duration = Histogram("request_duration_seconds", "Request duration")
db_query_time = Histogram("db_query_duration_seconds", "Database query time")
```

### **3. Logs**
```python
# Structured logging
import structlog

logger = structlog.get_logger()

@app.middleware("http")
async def log_requests(request, call_next):
    start_time = time.time()

    response = await call_next(request)

    process_time = time.time() - start_time
    logger.info(
        "request_completed",
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        duration=process_time
    )

    return response
```

---

## 🔄 **Estratégias de Deploy**

### **1. Blue-Green Deployment**
```bash
# Criar nova versão
emergent deploy --version v2.0.1

# Testar nova versão
curl https://api-staging.neurovendas.com/api/health

# Switch traffic
emergent promote v2.0.1
```

### **2. Canary Deployment**
```bash
# Deploy para 10% do tráfego
emergent deploy --canary 10

# Monitorar métricas
emergent metrics

# Se OK, aumentar para 100%
emergent promote
```

### **3. Rollback**
```bash
# Rollback imediato
emergent rollback

# Rollback para versão específica
emergent rollback --version v1.9.8
```

---

## 🚨 **Troubleshooting**

### **Problema: Application não inicia**
```bash
# Verificar logs
emergent logs --tail 100

# Verificar variáveis de ambiente
emergent config

# Verificar Procfile
cat Procfile
```

### **Problema: Database connection falha**
```bash
# Testar conexão manualmente
emergent run python -c "
import os
from motor.motor_asyncio import AsyncIOMotorClient
client = AsyncIOMotorClient(os.getenv('MONGODB_URI'))
print('Conexão OK' if client else 'Falhou')
"
```

### **Problema: Timeout nas requests**
```bash
# Aumentar timeout no Gunicorn
web: gunicorn backend.server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT --timeout 120
```

### **Problema: Memória insuficiente**
```bash
# Ajustar scaling
emergent scale web=2-8

# Ou ajustar worker class
web: gunicorn backend.server:app -w 2 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
```

---

## 📈 **Otimização de Performance**

### **1. Database Optimization**
```python
# Indexes no MongoDB
await db.users.create_index("email", unique=True)
await db.ebooks.create_index("user_id")
await db.posts.create_index([("scheduled_date", 1), ("status", 1)])
```

### **2. Caching Strategy**
```python
# Redis para cache
import redis
redis_client = redis.from_url(os.getenv("REDIS_URL"))

# Cache de templates
@cache(expire=3600)
async def get_template(template_id: str):
    return await db.templates.find_one({"_id": template_id})
```

### **3. CDN para Assets**
```yaml
# emergent.yml
cdn:
  - static_files
  - uploaded_images
  - generated_pdfs
```

---

## 🔒 **Segurança em Produção**

### **1. Secrets Management**
```bash
# Nunca commite secrets
emergent config:set JWT_SECRET="$(openssl rand -hex 32)"
emergent config:set ENCRYPTION_KEY="$(openssl rand -hex 32)"
```

### **2. Network Security**
```yaml
# emergent.yml
network:
  vpc: true
  firewall:
    - allow: 443/tcp    # HTTPS
    - allow: 80/tcp     # HTTP (redirect)
    - deny: all
```

### **3. Backup Strategy**
```yaml
# emergent.yml
backups:
  database:
    schedule: "0 2 * * *"  # Daily at 2 AM
    retention: 30
  files:
    schedule: "0 3 * * *"  # Daily at 3 AM
    retention: 90
```

---

## 📞 **Suporte & Contato**

### **Emergent Support**
- 📧 **Email**: support@emergent.com
- 📚 **Docs**: https://docs.emergent.com
- 💬 **Chat**: https://chat.emergent.com

### **NeuroVendas Team**
- 📧 **DevOps**: devops@neurovendas.com
- 📱 **On-call**: +55 11 99999-9999
- 🚨 **Incidentes**: #incidents Slack

---

## ✅ **Checklist de Deploy**

### **Pré-deploy**
- [ ] Código testado localmente
- [ ] Variáveis de ambiente configuradas
- [ ] Database migrations executadas
- [ ] Backup do banco atual
- [ ] Rollback plan definido

### **Durante deploy**
- [ ] Health checks passando
- [ ] Métricas monitoradas
- [ ] Logs verificados
- [ ] Performance testada

### **Pós-deploy**
- [ ] Funcionalidades testadas
- [ ] Usuários notificados
- [ ] Documentação atualizada
- [ ] Métricas baselines estabelecidas

**🎉 Deploy bem-sucedido! Sua aplicação NeuroVendas está no ar!**</content>
<parameter name="filePath">c:\Users\Carine\Downloads\Neurovendas-Elevare-main\GUIA_DEPLOYMENT_EMERGENT.md