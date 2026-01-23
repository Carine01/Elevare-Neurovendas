# 📤 Automação de Publicação - Guia Completo

## Visão Geral

Sistema completo de **automação de publicação** em múltiplas plataformas com **API integrations** para Medium, Dev.to, WordPress, LinkedIn, Twitter/X e Notion.

---

## 🚀 APIs Suportadas

### 1. 📝 Medium
- **Tipo:** OAuth 2.0
- **Documentação:** https://github.com/Medium/medium-api-docs
- **Endpoints:** `/users/{userId}/posts`
- **Features:**
  - Publicar em rascunho ou automático
  - Suporte a Markdown
  - Tags automáticas

**Como obter token:**
1. Ir para https://medium.com/me/settings/security
2. Gerar "Integration tokens"
3. Copiar token

**Variável .env:**
```bash
MEDIUM_API_TOKEN=seu_token_aqui
```

---

### 2. 🎯 Dev.to
- **Tipo:** API Key
- **Documentação:** https://developers.forem.com/api
- **Endpoints:** `/articles`
- **Features:**
  - Publicar como rascunho
  - Markdown completo
  - Máximo 4 tags
  - URL canônica

**Como obter chave:**
1. Ir para https://dev.to/settings/account
2. Scroll para "DEV Community API Keys"
3. Gerar chave
4. Copiar

**Variável .env:**
```bash
DEVTO_API_KEY=sua_chave_aqui
```

---

### 3. 🔵 WordPress
- **Tipo:** REST API + HTTP Basic Auth
- **Documentação:** https://developer.wordpress.org/rest-api/
- **Endpoints:** `/wp-json/wp/v2/posts`
- **Features:**
  - CRUD completo
  - Status (draft, publish, scheduled)
  - Categorias e tags
  - Imagem de destaque

**Como configurar:**
1. Ativar REST API no WordPress (geralmente ativada por padrão)
2. Criar usuário com permissões de admin/editor
3. Usar credenciais básicas (user:password em base64)

**Variáveis .env:**
```bash
WORDPRESS_URL=https://seu-site.com/wp-json
WORDPRESS_USER=seu_usuario
WORDPRESS_PASSWORD=sua_senha
```

---

### 4. 💼 LinkedIn
- **Tipo:** OAuth 2.0
- **Documentação:** https://docs.microsoft.com/en-us/linkedin/
- **Endpoints:** `/ugcPosts`
- **Features:**
  - Compartilhar artigos
  - Visibilidade pública
  - Rich text content

**Como obter token:**
1. Ir para https://www.linkedin.com/developers/apps
2. Criar nova app
3. Obter "Access Token"
4. Solicitar permissão `w_member_social`

**Variável .env:**
```bash
LINKEDIN_ACCESS_TOKEN=seu_token_aqui
```

---

### 5. 𝕏 Twitter/X
- **Tipo:** Bearer Token (v2 API)
- **Documentação:** https://developer.twitter.com/en/docs/twitter-api/
- **Endpoints:** `/tweets`
- **Features:**
  - Limite 280 caracteres
  - Threads de tweets
  - Hashtags e mentions
  - Media (imagens/vídeos)

**Como obter token:**
1. Ir para https://developer.twitter.com/en/portal/dashboard
2. Criar projeto
3. Obter "Bearer Token"
4. Habilitar "Write" permissions

**Variável .env:**
```bash
TWITTER_BEARER_TOKEN=seu_bearer_token_aqui
```

---

### 6. 💡 Notion
- **Tipo:** OAuth 2.0 + API Key
- **Documentação:** https://developers.notion.com/reference/
- **Endpoints:** `/pages`, `/databases`
- **Features:**
  - Criar páginas
  - Blocos ricos
  - Propriedades customizadas
  - Imagens

**Como obter token:**
1. Ir para https://www.notion.so/my-integrations
2. Criar "New integration"
3. Gerar token
4. Copiar "Internal Integration Token"

**Variáveis .env:**
```bash
NOTION_API_TOKEN=seu_token_aqui
NOTION_DATABASE_ID=seu_database_id_aqui
```

---

## 📋 Endpoints da API

### 1. Publicar Automaticamente
```http
POST /api/blog/posts/{post_id}/publicar-automatico

Body:
{
  "platforms": ["medium", "devto", "wordpress", "linkedin", "twitter", "notion"]
}

Response:
{
  "success": true,
  "results": {
    "success": [
      {
        "platform": "medium",
        "post_id": "abc123",
        "url": "https://medium.com/@user/abc123",
        "status": "success"
      },
      {
        "platform": "devto",
        "post_id": 12345,
        "url": "https://dev.to/user/slug-12345",
        "status": "success"
      }
    ],
    "failed": [
      {
        "platform": "linkedin",
        "error": "Token expirado"
      }
    ],
    "timestamp": "2026-02-15T10:30:00Z"
  },
  "post_id": "post-uuid"
}
```

### 2. Status de Publicação
```http
GET /api/blog/publicar-status

Response:
{
  "platforms": {
    "medium": {
      "enabled": true,
      "name": "Medium",
      "icon": "📝",
      "description": "Plataforma de blog"
    },
    "devto": {
      "enabled": true,
      "name": "Dev.to",
      "icon": "🎯",
      "description": "Comunidade de desenvolvedores"
    },
    ...
  }
}
```

### 3. Agendar Publicação
```http
POST /api/blog/posts/{post_id}/agendar-publicacao

Body:
{
  "data_publicacao": "2026-02-20T14:30:00Z",
  "platforms": ["medium", "devto"]
}

Response:
{
  "success": true,
  "message": "Publicação agendada para 2026-02-20T14:30:00Z",
  "job_id": "job-uuid",
  "platforms": ["medium", "devto"]
}
```

### 4. Listar Publicações Agendadas
```http
GET /api/blog/publicacoes-agendadas

Response:
{
  "total": 3,
  "publications": [
    {
      "id": "job-uuid",
      "post_id": "post-uuid",
      "scheduled_at": "2026-02-20T14:30:00Z",
      "platforms": ["medium", "devto"],
      "status": "agendado",
      "created_at": "2026-02-15T10:00:00Z"
    }
  ]
}
```

---

## 🎯 Fluxo de Uso

### Opção 1: Publicação Imediata
```
1. Gerar artigo
   ↓
2. Clique "📤 Publicar Automaticamente"
   ↓
3. Selecione plataformas
   ↓
4. Sistema publica em todas as plataformas
   ↓
5. Receba URLs de cada plataforma
```

### Opção 2: Publicação Agendada
```
1. Gerar artigo
   ↓
2. Clique "📅 Agendar Publicação"
   ↓
3. Escolha data/hora e plataformas
   ↓
4. Sistema publica automaticamente na hora
   ↓
5. Acompanhe status em "Publicações Agendadas"
```

---

## 🔧 Configuração por Plataforma

### Medium
```env
MEDIUM_API_TOKEN=sk_live_abc123...
```

**Teste:**
```bash
curl -H "Authorization: Bearer sk_live_abc123..." \
  https://api.medium.com/v1/me
```

### Dev.to
```env
DEVTO_API_KEY=abc123...
```

**Teste:**
```bash
curl -H "api-key: abc123..." \
  https://dev.to/api/articles
```

### WordPress
```env
WORDPRESS_URL=https://seu-site.com/wp-json
WORDPRESS_USER=admin
WORDPRESS_PASSWORD=senha123
```

**Teste:**
```bash
curl -u admin:senha123 \
  https://seu-site.com/wp-json/wp/v2/posts
```

### LinkedIn
```env
LINKEDIN_ACCESS_TOKEN=ABC123XYZ...
```

**Teste:**
```bash
curl -H "Authorization: Bearer ABC123XYZ..." \
  https://api.linkedin.com/v2/me
```

### Twitter/X
```env
TWITTER_BEARER_TOKEN=AAAAB3NzaC1...
```

**Teste:**
```bash
curl -H "Authorization: Bearer AAAAB3NzaC1..." \
  https://api.twitter.com/2/tweets
```

### Notion
```env
NOTION_API_TOKEN=secret_abc123...
NOTION_DATABASE_ID=abc123def456...
```

**Teste:**
```bash
curl -H "Authorization: Bearer secret_abc123..." \
  https://api.notion.com/v1/databases/abc123def456
```

---

## 📊 Transformação de Conteúdo por Plataforma

### Medium
- Aceita: Markdown
- Limite: Sem limite
- Status: Draft ou Public

### Dev.to
- Aceita: Markdown
- Limite: Sem limite técnico
- Tags: Máximo 4
- Requer: `body_markdown`

### WordPress
- Aceita: HTML ou Plaintext
- Limite: Sem limite
- Categorias: Múltiplas
- Imagem: URL ou upload

### LinkedIn
- Aceita: Rich text
- Limite: 3000 caracteres para commentary
- Imagem: Obrigatória (article link)
- Visibilidade: PUBLIC/CONNECTIONS/PRIVATE

### Twitter/X
- Aceita: Plaintext
- Limite: 280 caracteres (ou 10k com subscription)
- Thread: Múltiplos tweets
- Media: Suportado

### Notion
- Aceita: Blocos ricos (texto, heading, imagens)
- Limite: 2000 caracteres por bloco
- Propriedades: Customizáveis
- Banco de dados: Necessário

---

## ⚙️ Agendador de Tarefas (Background Jobs)

### Implementação com APScheduler
```python
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.date import DateTrigger

scheduler = BackgroundScheduler()

async def publish_scheduled_posts():
    """Verifica e publica posts agendados"""
    now = datetime.now(timezone.utc)
    scheduled = await db.scheduled_publications.find({
        "scheduled_at": {"$lte": now.isoformat()},
        "status": "agendado"
    }).to_list(100)
    
    for job in scheduled:
        # Publicar
        result = await PublisherOrchestrator.publish_to_platforms(
            post_data,
            job["platforms"]
        )
        
        # Atualizar status
        await db.scheduled_publications.update_one(
            {"id": job["id"]},
            {"$set": {"status": "publicado"}}
        )

# Executar a cada 5 minutos
scheduler.add_job(
    publish_scheduled_posts,
    trigger=IntervalTrigger(minutes=5)
)
scheduler.start()
```

---

## 🔐 Segurança

### ✅ Armazenar Tokens com Segurança
```python
from cryptography.fernet import Fernet

cipher = Fernet(ENCRYPTION_KEY)
encrypted_token = cipher.encrypt(token.encode())
# Salvar no banco: encrypted_token
```

### ✅ Validar Plataformas
```python
valid_platforms = ["medium", "devto", "wordpress", "linkedin", "twitter", "notion"]
platforms = [p for p in platforms if p in valid_platforms]
```

### ✅ Rate Limiting
```python
# Implementar rate limiting por plataforma
# Medium: 3 posts por hora
# Dev.to: 5 posts por dia
# Twitter: 300 tweets por 15 minutos
```

### ✅ Retry Logic
```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1))
async def publish_with_retry(platform, post_data):
    return await publishers[platform](post_data)
```

---

## 🧪 Testes

### 1. Testar Medium
```bash
# Teste de autenticação
curl -H "Authorization: Bearer $MEDIUM_API_TOKEN" \
  https://api.medium.com/v1/me

# Deve retornar seu perfil
```

### 2. Testar Dev.to
```bash
# Listar artigos
curl -H "api-key: $DEVTO_API_KEY" \
  https://dev.to/api/articles/me
```

### 3. Testar WordPress
```bash
# Listar posts
curl -u $WORDPRESS_USER:$WORDPRESS_PASSWORD \
  $WORDPRESS_URL/wp/v2/posts
```

---

## 📈 Monitoramento

### Logs de Publicação
```python
logger.info(f"Publicação iniciada para {len(platforms)} plataformas")
logger.info(f"Plataforma {platform}: sucesso")
logger.error(f"Plataforma {platform}: falha - {error}")
```

### Dashboard de Status
```
Criar endpoint para mostrar:
- Total de posts publicados
- Posts agendados
- Falhas de publicação
- Próximas publicações
```

---

## 🚀 Próximos Passos

- [ ] Interface React para publicação
- [ ] Agendador de background jobs (APScheduler)
- [ ] Retry automático em caso de falha
- [ ] Analytics de cada plataforma
- [ ] Rate limiting inteligente
- [ ] Webhook para sincronização bidirecional
- [ ] Template customizável por plataforma

---

## 🆘 Troubleshooting

### "Token expirado"
```
Solução: Renovar token na plataforma
```

### "Falha de conexão"
```
Solução: 
1. Verificar internet
2. Validar URL da plataforma
3. Checar se API está disponível
```

### "Limite de taxa excedido"
```
Solução:
1. Implementar backoff exponencial
2. Distribuir publicações ao longo do tempo
3. Respeitar limites da API
```

---

## 📚 Referências

- [Medium API](https://github.com/Medium/medium-api-docs)
- [Dev.to API](https://developers.forem.com/api)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)
- [LinkedIn API](https://docs.microsoft.com/en-us/linkedin/)
- [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api/)
- [Notion API](https://developers.notion.com/)

---

**Desenvolvido com ❤️ para Elevare NeuroVendas**
