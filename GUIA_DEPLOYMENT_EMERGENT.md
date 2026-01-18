# 📚 Documentação da API - NeuroVendas

## 🎯 **Visão Geral**
API REST desenvolvida com FastAPI para a plataforma NeuroVendas by Elevare.

**Base URL**: `https://api.neurovendas.com`  
**Versão**: 2.0.0  
**Autenticação**: JWT Bearer Token

## 🔐 **Autenticação**

### **Headers Necessários**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### **Obter Token**
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## 📋 **Endpoints da API**

### **🏥 Health & Monitoring**

#### **GET /api/health**
Verifica status da aplicação
```json
{
  "status": "healthy",
  "timestamp": "2024-01-18T10:00:00Z",
  "version": "2.0.0"
}
```

#### **GET /api/health/detailed**
Status detalhado de todos os serviços
```json
{
  "status": "healthy",
  "checks": {
    "database": {"status": "ok", "response_time": "45ms"},
    "redis": {"status": "ok", "response_time": "12ms"},
    "external_apis": {"status": "ok"}
  }
}
```

---

### **🔐 Autenticação**

#### **POST /api/auth/register**
Registrar novo usuário
```json
// Request
{
  "email": "user@example.com",
  "password": "securePass123",
  "name": "João Silva"
}

// Response
{
  "access_token": "eyJ0eXAi...",
  "token_type": "bearer"
}
```

#### **POST /api/auth/login**
Fazer login
```json
// Request
{
  "email": "user@example.com",
  "password": "securePass123"
}

// Response
{
  "access_token": "eyJ0eXAi...",
  "token_type": "bearer"
}
```

#### **GET /api/auth/me**
Obter dados do usuário atual
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "João Silva",
  "role": "user",
  "onboarding_completed": true,
  "diagnosis_completed": true,
  "subscription_plan": "premium",
  "xp": 1250,
  "level": 5,
  "credits_remaining": 500
}
```

#### **POST /api/auth/forgot-password**
Solicitar reset de senha
```json
// Request
{
  "email": "user@example.com"
}

// Response
{
  "message": "Email de recuperação enviado"
}
```

#### **POST /api/auth/reset-password**
Resetar senha com token
```json
// Request
{
  "token": "reset_token_here",
  "new_password": "newSecurePass123"
}

// Response
{
  "message": "Senha alterada com sucesso"
}
```

---

### **📊 Diagnóstico**

#### **POST /api/public/diagnostico/gerar**
Gerar diagnóstico gratuito
```json
// Request
{
  "respostas": {
    "pergunta1": "resposta",
    "pergunta2": "resposta"
  },
  "dados_empresa": {
    "nome": "Clínica Exemplo",
    "segmento": "Estética",
    "tamanho": "Pequena"
  }
}

// Response
{
  "diagnostico_id": "diag_123",
  "resultado": {
    "pontuacao_total": 75,
    "categorias": [...],
    "recomendacoes": [...]
  }
}
```

#### **POST /api/diagnosis/complete**
Completar diagnóstico premium
```json
// Request
{
  "respostas": {...},
  "dados_completos": {...}
}

// Response
{
  "success": true,
  "diagnostico_final": {...}
}
```

#### **GET /api/diagnosis/status**
Status do diagnóstico do usuário
```json
{
  "completed": true,
  "last_updated": "2024-01-18T10:00:00Z",
  "progress": 100
}
```

---

### **🤖 Inteligência Artificial**

#### **POST /api/ai/chat**
Chat com LucresIA
```json
// Request
{
  "message": "Como melhorar minhas vendas?",
  "context": "estetica"
}

// Response
{
  "response": "Para melhorar suas vendas...",
  "suggestions": [...],
  "follow_up_questions": [...]
}
```

#### **POST /api/ai/generate-content**
Gerar conteúdo para redes sociais
```json
// Request
{
  "tipo_conteudo": "post_instagram",
  "tema": "promoção de produto",
  "tom": "profissional",
  "plataforma": "instagram"
}

// Response
{
  "content": "Texto gerado aqui...",
  "hashtags": ["#estetica", "#beleza"],
  "emoji_suggestions": ["💅", "✨"]
}
```

#### **POST /api/ai/generate-carousel**
Gerar carrossel para Instagram
```json
// Request
{
  "tema": "antes_depois",
  "numero_slides": 4,
  "estilo": "minimalista"
}

// Response
{
  "slides": [
    {"titulo": "Slide 1", "conteudo": "..."},
    {"titulo": "Slide 2", "conteudo": "..."}
  ],
  "dicas_formatacao": [...]
}
```

#### **POST /api/ai/generate-ebook**
Gerar e-book estruturado
```json
// Request
{
  "titulo": "Guia Completo de Vendas em Estética",
  "topico_principal": "técnicas de venda",
  "numero_capitulos": 8,
  "estilo": "profissional"
}

// Response
{
  "ebook_id": "ebook_123",
  "status": "generating",
  "estimated_time": "5min"
}
```

---

### **📚 E-books**

#### **GET /api/ebook**
Listar e-books do usuário
```json
[
  {
    "id": "ebook_123",
    "titulo": "Guia de Vendas",
    "status": "completed",
    "created_at": "2024-01-18T10:00:00Z",
    "download_url": "/api/ebook/download/ebook_123"
  }
]
```

#### **GET /api/ebook/{ebook_id}**
Obter detalhes do e-book
```json
{
  "id": "ebook_123",
  "titulo": "Guia de Vendas",
  "capitulos": [
    {
      "id": "cap_1",
      "titulo": "Introdução",
      "conteudo": "Texto do capítulo...",
      "ordem": 1
    }
  ],
  "metadata": {
    "palavras_chave": ["vendas", "estetica"],
    "tamanho": "45 páginas"
  }
}
```

#### **POST /api/ebook/generate-pdf**
Gerar PDF do e-book
```json
// Request
{
  "ebook_id": "ebook_123",
  "template": "moderno",
  "incluir_capa": true
}

// Response
{
  "pdf_url": "/api/ebook/download/ebook_123/pdf",
  "status": "processing"
}
```

#### **GET /api/ebook/download/{ebook_id}**
Download do e-book (HTML/PDF)

---

### **📅 Calendário de Posts**

#### **GET /api/calendario/posts**
Listar posts agendados
```json
[
  {
    "id": "post_123",
    "conteudo": "Texto do post...",
    "plataforma": "instagram",
    "data_agendada": "2024-01-20T10:00:00Z",
    "status": "scheduled"
  }
]
```

#### **POST /api/calendario/posts**
Criar post agendado
```json
// Request
{
  "conteudo": "Novo post sobre promoção",
  "plataforma": "instagram",
  "data_agendada": "2024-01-20T10:00:00Z",
  "midia": ["url_imagem1.jpg"],
  "hashtags": ["#promo", "#estetica"]
}

// Response
{
  "post_id": "post_123",
  "status": "scheduled"
}
```

#### **GET /api/calendario/stats**
Estatísticas do calendário
```json
{
  "total_posts": 45,
  "posts_mes": 12,
  "plataformas": {
    "instagram": 30,
    "facebook": 10,
    "tiktok": 5
  },
  "taxa_engagement": 4.2
}
```

---

### **🎯 Campanhas**

#### **GET /api/campanhas**
Listar campanhas ativas
```json
[
  {
    "id": "camp_123",
    "nome": "Campanha Janeiro",
    "objetivo": "aumentar_leads",
    "status": "active",
    "posts_gerados": 15,
    "leads_gerados": 8
  }
]
```

#### **POST /api/campanhas**
Criar nova campanha
```json
// Request
{
  "nome": "Campanha Verão 2024",
  "objetivo": "promocao_produto",
  "duracao_dias": 30,
  "orcamento": 500,
  "plataformas": ["instagram", "facebook"]
}

// Response
{
  "campanha_id": "camp_123",
  "status": "created"
}
```

#### **POST /api/campanhas/{campanha_id}/gerar-sequencia**
Gerar sequência de posts para campanha
```json
// Request
{
  "tipo_sequencia": "neurovendas",
  "numero_posts": 10,
  "tema": "lançamento_produto"
}

// Response
{
  "sequencia_id": "seq_123",
  "posts_gerados": 10,
  "status": "completed"
}
```

---

### **🎮 Gamificação**

#### **GET /api/gamification/rewards**
Listar recompensas disponíveis
```json
[
  {
    "id": "reward_123",
    "nome": "Template Premium",
    "custo_xp": 500,
    "tipo": "template",
    "disponivel": true
  }
]
```

#### **POST /api/gamification/claim**
Reclamar recompensa
```json
// Request
{
  "reward_id": "reward_123"
}

// Response
{
  "success": true,
  "xp_gasto": 500,
  "xp_restante": 750
}
```

#### **GET /api/gamification/leaderboard**
Ranking de usuários
```json
[
  {
    "posicao": 1,
    "nome": "João Silva",
    "xp": 2500,
    "level": 8,
    "badge": "expert"
  }
]
```

---

### **💳 Pagamentos**

#### **POST /api/payments/create-checkout**
Criar sessão de checkout Stripe
```json
// Request
{
  "plan_id": "premium_monthly",
  "success_url": "https://app.neurovendas.com/success",
  "cancel_url": "https://app.neurovendas.com/cancel"
}

// Response
{
  "checkout_url": "https://checkout.stripe.com/...",
  "session_id": "cs_test_..."
}
```

#### **GET /api/payments/status/{session_id}**
Verificar status do pagamento
```json
{
  "status": "paid",
  "plan": "premium",
  "amount": 97.00,
  "currency": "brl"
}
```

#### **GET /api/payments/history**
Histórico de pagamentos
```json
[
  {
    "id": "pay_123",
    "amount": 97.00,
    "currency": "brl",
    "status": "succeeded",
    "date": "2024-01-15T10:00:00Z",
    "plan": "premium_monthly"
  }
]
```

---

### **📈 Dashboard & Analytics**

#### **GET /api/dashboard/stats**
Estatísticas gerais do usuário
```json
{
  "total_ebooks": 5,
  "total_posts": 120,
  "total_campanhas": 3,
  "leads_gerados": 45,
  "taxa_conversao": 12.5,
  "xp_atual": 1250,
  "level": 5,
  "credits": 500
}
```

#### **GET /api/credits/balance**
Saldo de créditos
```json
{
  "balance": 500,
  "history": [
    {
      "action": "used",
      "amount": -10,
      "description": "Geração de e-book",
      "date": "2024-01-18T09:00:00Z"
    }
  ]
}
```

---

### **⚙️ Configurações**

#### **GET /api/brand-identity**
Identidade da marca
```json
{
  "nome_empresa": "Clínica Silva",
  "segmento": "Estética",
  "tom_voz": "profissional",
  "cores": ["#FF6B6B", "#4ECDC4"],
  "logos": ["url_logo1.jpg"],
  "fotos_profissional": ["url_foto1.jpg"],
  "fotos_clinica": ["url_clinica1.jpg"]
}
```

#### **POST /api/brand-identity**
Atualizar identidade da marca
```json
// Request
{
  "nome_empresa": "Clínica Silva Estética",
  "tom_voz": "amigável",
  "cores": ["#FF6B6B", "#4ECDC4", "#45B7D1"]
}

// Response
{
  "success": true,
  "message": "Identidade atualizada"
}
```

---

### **🔍 SEO & Conteúdo**

#### **POST /api/seo/generate-article**
Gerar artigo otimizado para SEO
```json
// Request
{
  "keyword": "harmonização facial",
  "article_type": "guia_completo",
  "awareness_level": "consideration",
  "word_count": 2000
}

// Response
{
  "article_id": "art_123",
  "titulo": "Guia Completo de Harmonização Facial 2024",
  "conteudo": "Conteúdo otimizado...",
  "seo_score": 85,
  "keywords": ["harmonização facial", "estética", "procedimentos"]
}
```

#### **GET /api/seo/stats**
Estatísticas de SEO
```json
{
  "total_artigos": 12,
  "palavras_escritas": 25000,
  "media_seo_score": 82,
  "top_keywords": ["estética", "harmonização", "skincare"]
}
```

---

## 📊 **Códigos de Status**

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado |
| 400 | Requisição inválida |
| 401 | Não autorizado |
| 403 | Proibido |
| 404 | Não encontrado |
| 422 | Dados inválidos |
| 429 | Muitas requisições |
| 500 | Erro interno |

## 🔒 **Rate Limiting**

- **Autenticação**: 5 tentativas/minuto
- **Geração de conteúdo**: 10/minuto (free), 50/minuto (premium)
- **API geral**: 100/minuto

## 📝 **Versionamento**

- **v1**: Legacy (descontinuada)
- **v2**: Atual (FastAPI, MongoDB)

## 🆘 **Suporte**

Para dúvidas sobre a API:
- 📧 **Email**: api@neurovendas.com
- 📚 **Docs**: https://docs.neurovendas.com
- 💬 **Discord**: https://discord.gg/neurovendas</content>
<parameter name="filePath">c:\Users\Carine\Downloads\Neurovendas-Elevare-main\DOCUMENTACAO_API.md