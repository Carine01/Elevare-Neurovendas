# Checklist de Deploy - Emergent Platform

## ✅ Pré-requisitos Validados

### Variáveis de Ambiente (Obrigatórias)
```bash
# Core
MONGO_URL="mongodb://..."           # ✅ Conexão MongoDB
DB_NAME="elevare_db"               # ✅ Nome do banco
JWT_SECRET="<crypto-random>"       # ✅ Segredo JWT (gerado)

# AI Providers
EMERGENT_LLM_KEY="..."             # ✅ Provider primário (Gemini/GPT)
OPENAI_API_KEY="..."               # ✅ Fallback opcional

# Pagamentos
STRIPE_API_KEY="..."               # ✅ Stripe (produção ou test)

# Email
RESEND_API_KEY="..."               # ✅ Resend para emails
```

### Variáveis Opcionais
```bash
# Gamma (deprecated, mas mantido para compatibilidade)
GAMMA_API_KEY="..."                # Pode ser omitido

# Configurações de Servidor
PORT=8000                          # Emergent define automaticamente
HOST=0.0.0.0                       # Emergent define automaticamente
```

---

## 🚀 Deploy Automático (Emergent)

### O que o Emergent faz automaticamente:

1. **Detecção de Stack**
   - Detecta `requirements.txt` → instala Python deps
   - Detecta `frontend/package.json` → instala Node deps
   - Executa `npm run build` no frontend

2. **Build do Frontend**
   ```bash
   cd frontend
   npm install
   npm run build  # → dist/
   ```

3. **Inicialização do Backend**
   ```bash
   cd backend
   python server.py  # Porta 8000
   ```

4. **Health Checks**
   - Verifica `/api/health` a cada 30s
   - Timeout configurado: 5s
   - Falhas consecutivas: 3 → restart automático

5. **Static Files**
   - CDN serve `/frontend/dist` automaticamente
   - CORS configurado para domínio Emergent

---

## 🔧 Configuração Manual (Se Necessário)

### 1. Build Local (Validação)
```bash
# Backend
cd backend
pip install -r requirements.txt
python -c "import fastapi; print('OK')"

# Frontend
cd frontend
npm install
npm run build
ls -la dist/  # Verificar saída
```

### 2. Testar Health Endpoint
```bash
curl http://localhost:8000/api/health

# Esperado:
{
  "status": "healthy",
  "database": "connected",
  "ai_service": "available"
}
```

### 3. Validar Env Vars
```bash
# Backend
python -c "import os; print(os.environ.get('MONGO_URL', 'MISSING'))"

# Frontend (build time)
grep VITE_BACKEND_URL frontend/.env
```

---

## 📦 Assets Estáticos

### Frontend Build Output
- Path: `frontend/dist/`
- Size: ~1.2MB (comprimido)
- Estrutura:
  ```
  dist/
  ├── index.html
  ├── assets/
  │   ├── index-*.css      (~157KB)
  │   ├── index-*.js       (~1MB)
  │   └── [chunks]
  ```

### Servido pelo Emergent CDN
- URL Base: `https://<app-name>.emergent.run`
- Cache: 24h para assets versionados
- Gzip automático

---

## 🔒 Segurança

### Secrets Validation
```bash
# JWT Secret deve ter 32+ caracteres
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Nunca commitar:
- .env
- .env.production
- backend/.env
- frontend/.env
```

### CORS (Produção)
```python
# backend/server.py linha ~50
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://<app-name>.emergent.run",  # Domínio Emergent
        "https://neurovendas.com"           # Domínio custom
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🐛 Troubleshooting

### Problema: Build do Frontend Falha
**Sintoma**: Erro "VITE_BACKEND_URL is not defined"
**Solução**:
```bash
# Criar frontend/.env com:
VITE_BACKEND_URL="https://<app-name>.emergent.run"
```

### Problema: Backend Crash no Startup
**Sintoma**: "MongoDB connection timeout"
**Solução**:
1. Verificar se `MONGO_URL` está no Emergent secrets
2. Testar conexão: `mongosh "<MONGO_URL>"`
3. Verificar IP whitelist no MongoDB Atlas

### Problema: Health Check Failing
**Sintoma**: Emergent marca app como unhealthy
**Solução**:
```python
# backend/server.py - garantir resposta <5s
@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}  # Resposta imediata
```

### Problema: AI Endpoints Timeout
**Sintoma**: Requests de /api/ebooks/generate-copy falham com 504
**Solução**:
1. Verificar `EMERGENT_LLM_KEY` está configurada
2. Aumentar timeout do Emergent para 300s (5 min)
3. Adicionar retry logic no frontend

---

## 📊 Monitoramento

### Logs do Emergent
```bash
# Via CLI
emergent logs <app-name> --tail 100

# Via Dashboard
https://emergent.run/apps/<app-name>/logs
```

### Métricas Chave
- **Response Time**: /api/health < 50ms
- **AI Endpoints**: /api/ebooks/* < 120s
- **Memory**: Pico ~512MB (ok com 1GB allocation)
- **CPU**: ~10-20% idle, 60-80% durante AI calls

---

## ✅ Checklist Pré-Deploy

- [ ] Todas env vars configuradas no Emergent dashboard
- [ ] `frontend/dist/` gerado localmente sem erros
- [ ] `backend/requirements.txt` atualizado com deps
- [ ] Health check retorna 200 OK em <5s
- [ ] CORS configurado com domínio Emergent
- [ ] JWT_SECRET é único e secreto
- [ ] MongoDB connection string válida
- [ ] Stripe keys são de produção (não test)
- [ ] Tests rodando com `pytest backend/tests/`
- [ ] CHANGELOG.md atualizado com v2.1.0

---

## 🚦 Pós-Deploy

### Validação Imediata (5 min)
1. Acessar `https://<app-name>.emergent.run`
2. Testar login com usuário beta
3. Criar ebook teste
4. Gerar copy de divulgação (testar endpoint novo)
5. Verificar logs por erros

### Validação Completa (30 min)
- [ ] Todos endpoints de ebooks funcionando
- [ ] Sistema de créditos deduzindo corretamente
- [ ] AI timeouts manejados com retry
- [ ] Frontend carrega em <3s
- [ ] PDFs gerando sem encoding issues
- [ ] Emails de boas-vindas sendo enviados

---

## 📌 Notas Importantes

1. **Cold Start**: Primeiros requests após deploy podem levar 15-30s (Motor connection pooling)
2. **AI Timeouts**: Operações de IA podem levar 60-180s - configure timeout adequado
3. **Créditos**: Validar que COST_MAP está atualizado com copy_divulgacao (20) e aperfeicoar_capitulo (15)
4. **Banco**: MongoDB Atlas deve ter IP 0.0.0.0/0 whitelisted para Emergent
5. **Stripe Webhooks**: Configurar URL do Emergent no dashboard Stripe

---

## 🔗 Recursos

- Dashboard Emergent: https://emergent.run/dashboard
- Docs MongoDB: https://docs.atlas.mongodb.com
- Stripe Dashboard: https://dashboard.stripe.com
- Logs Backend: `python server.py` output
- Logs Frontend: Browser console

---

**Última atualização**: v2.1.0 (Janeiro 2026)
