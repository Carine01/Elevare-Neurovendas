# 🚀 Quick Start - Publicação Automática

## 30 segundos para começar

### 1. Configurar .env (3 minutos)
```bash
# Copiar template
cp backend/.env.example backend/.env

# Adicionar suas credenciais:
MEDIUM_API_TOKEN=seu_token
DEVTO_API_KEY=sua_chave
WORDPRESS_URL=https://seu-site.com/wp-json
WORDPRESS_USER=seu_user
WORDPRESS_PASSWORD=sua_senha
LINKEDIN_ACCESS_TOKEN=seu_token
TWITTER_BEARER_TOKEN=seu_token
NOTION_API_TOKEN=seu_token
NOTION_DATABASE_ID=seu_id
```

### 2. Instalar Dependências (1 minuto)
```bash
pip install -r backend/requirements.txt
# Dependências já incluem: aiohttp, requests
```

### 3. Iniciar Backend (1 minuto)
```bash
cd backend
python -m uvicorn server:app --reload
```

### 4. Usar no Frontend (2 minutos)
```javascript
import AutoPublishComponent from './AutoPublishComponent';

// No seu App.js ou componente de post:
<AutoPublishComponent postId={postId} />
```

---

## 📊 APIs por Plataforma (Resume)

| Plataforma | Token/Chave | Onde Obter | Rate Limit |
|-----------|-----------|-----------|-----------|
| Medium | `sk_live_...` | medium.com/me/settings | 3/hora |
| Dev.to | `api_abc123` | dev.to/settings | 5/dia |
| WordPress | user:pass | Seu site | Ilimitado |
| LinkedIn | `AQX...` | linkedin.com/developers | Ilimitado |
| Twitter | `AAAAB...` | developer.twitter.com | 300/15min |
| Notion | `secret_...` | notion.so/my-integrations | Ilimitado |

---

## 🎯 Uso em 3 Cliques

### Opção A: Publicar Agora
1. Click: "📤 Publicação Automática"
2. Click: Selecionar plataformas
3. Click: "🚀 Publicar Agora"
✅ Pronto! Publicado em todas

### Opção B: Agendar
1. Click: "📅 Agendar"
2. Data/Hora + Plataformas
3. Click: "✅ Agendar"
✅ Sistema publica na hora certa

---

## 📚 Documentação Completa

- **Setup Completo:** [SOCIAL_PUBLISHING_GUIDE.md](SOCIAL_PUBLISHING_GUIDE.md)
- **Exemplos de Código:** Veja arquivo acima
- **Troubleshooting:** Seção "Problemas Comuns" abaixo

---

## ⚡ Endpoints da API

```bash
# Publicar agora
POST /api/blog/posts/{id}/publicar-automatico
{"platforms": ["medium", "devto"]}

# Agendar
POST /api/blog/posts/{id}/agendar-publicacao
{"data_publicacao": "2026-02-20T14:30:00Z", "platforms": ["medium"]}

# Ver status
GET /api/blog/publicar-status

# Ver agendados
GET /api/blog/publicacoes-agendadas
```

---

## 🔧 Problemas Comuns

### "Token inválido"
✅ Copiar token **exatamente** como fornecido  
✅ Verificar se não tem espaços em branco  
✅ Se token expirou, gerar novo

### "Falha de conexão"
✅ Verificar internet  
✅ Testar `curl` para API  
✅ Confirmar .env está correto

### "Plataforma não aparece"
✅ Verificar se token está configurado  
✅ Reiniciar backend  
✅ Verificar se API está ativa

---

## 💡 Dicas Importantes

**✅ Formatos Automáticos**
- Medium: Markdown
- Dev.to: Markdown
- WordPress: HTML + plaintext
- LinkedIn: Rich text
- Twitter: Plaintext (280 chars)
- Notion: Blocos ricos

**✅ Quando Publicar?**
- LinkedIn: Terça-quinta, 8-10h
- Twitter: Múltiplas vezes/dia
- Medium: Quinta-sexta
- Dev.to: Matinal (EST)

**✅ Tags por Plataforma**
- Medium: Sem limite
- Dev.to: Máximo 4
- WordPress: Ilimitado
- Notion: Customizável

---

## 🎓 Exemplo Completo

```javascript
// 1. Criar post
const post = await generateBlogPost({
  topico: "AI em Marketing",
  objetivo: "Educar"
});

// 2. Selecionar plataformas
const platforms = ['medium', 'devto', 'linkedin'];

// 3. Publicar
const response = await fetch(
  `/api/blog/posts/${post.id}/publicar-automatico`,
  {
    method: 'POST',
    body: JSON.stringify({ platforms })
  }
);

// 4. Resultados
const results = await response.json();
results.results.success.forEach(r => {
  console.log(`✅ ${r.platform}: ${r.url}`);
});
```

---

## 🚀 Próximos Passos

1. ✅ Configurar .env com seus tokens
2. ✅ Testar publicação em 1 plataforma
3. ✅ Adicionar mais plataformas
4. ✅ Usar agendador
5. ✅ Integrar com Google Calendar
6. ✅ Monitorar analytics

---

## 📞 Suporte Rápido

| Problema | Solução |
|----------|---------|
| Token não funciona | Gerar novo token em settings |
| API retorna erro | Testar curl manualmente |
| Publicação falha | Verificar logs do servidor |
| Rate limit | Aguardar 15 minutos |
| Artigo não aparece | Verificar status (draft/published) |

---

## ✨ Features

✅ Publicar em 6 plataformas com 1 clique  
✅ Formatação automática por plataforma  
✅ Agendador para hora otimizada  
✅ Retry automático em falhas  
✅ Links diretos para cada artigo  
✅ Status em tempo real  
✅ Sem cobranças adicionais  

---

**Pronto para usar! 🎉**

---

**Documentação Completa:** [SOCIAL_PUBLISHING_GUIDE.md](SOCIAL_PUBLISHING_GUIDE.md)
