# 🔥 Elevare NeuroVendas - Plataforma Completa

## 📱 Versão Atual: 3.0

Plataforma all-in-one para criação de conteúdo, automação de publicação e gestão integrada de campanhas de Neurovendas.

---

## 🎯 Principais Features

### 📝 Blog System v2.0 ✅
Sistema completo de blog com 10 features avançadas:
- 🤖 Geração automática com Lucresia IA
- 📊 Análise SEO integrada
- 📈 Analytics por artigo
- 🔄 Controle de versões
- 🔗 Sugestão de links internos
- 🎨 8 templates de diagramação
- 🏷️ Categorização automática
- 📱 Preview múltiplos formatos
- ⏰ Agendamento de publicações
- 📤 Exportação (HTML, Markdown)

### 🌐 Google Calendar Integration ✅
Sincronização total com Google Calendar:
- 🔐 OAuth 2.0 com tokens encriptados
- 📅 CRUD completo de eventos
- 🔔 Lembretes automáticos
- 🎯 Integração com publicações
- 📊 Visualização mensal/semanal

### 🚀 Social Publishing Automation ✅
Publicação automática em 6 plataformas:
- 📝 Medium
- 🛠️ Dev.to
- 📰 WordPress
- 💼 LinkedIn
- 𝕏 Twitter/X
- 💭 Notion

**Recursos:**
- 🔄 Publicação simultânea
- ⏰ Agendamento futuro
- 📋 Status em tempo real
- 🎯 Otimização por plataforma

### 📱 Stories Companion ✅ **NOVO!**
Nova forma unificada de gerar Stories:
- 🎨 Um único botão inteligente
- 🧠 Contexto automático pré-preenchido
- ✨ Lucresia IA integrada
- 📋 Copiar stories com 1 clique
- 🎯 Funciona com qualquer formato

**Fluxo simplificado:**
```
Selecionar formato → Clicar "📱 Gerar Stories" 
→ Modal abre com CONTEXTO → Gerar → Copiar
```

### 🎨 Design Editor Avançado
- 🎭 Múltiplos templates
- 🖼️ Galeria de imagens
- ✏️ Editor de texto customizado
- 🎨 Controle de cores
- 📐 Ajustes de posição/tamanho/rotação

### 👤 Gestão de Marca
- 🏷️ Identidade completa da marca
- 💬 Tom de voz customizado
- 🎨 Paleta de cores
- 👥 Definição de público
- ✦ Diferenciais únicos

---

## 🏗️ Arquitetura

### Backend
- **Framework**: FastAPI (async)
- **Database**: MongoDB com Motor
- **IA**: Lucresia NeuroVendas
- **APIs Externas**: Google Calendar, Medium, Dev.to, WordPress, LinkedIn, Twitter, Notion

### Frontend
- **Framework**: React Hooks
- **Styling**: CSS Modules + Tailwind
- **State**: React useState/useContext
- **APIs**: Fetch API

---

## 📦 Instalação

### Backend
```bash
cd backend
pip install -r requirements.txt
python server.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## 📚 Documentação por Feature

### Blog System
- [`BLOG_SYSTEM_V2_GUIDE.md`](BLOG_SYSTEM_V2_GUIDE.md) - Guia completo
- [`BLOG_V2_QUICKSTART.md`](BLOG_V2_QUICKSTART.md) - Acesso rápido
- [`BLOG_V2_SUMMARY.md`](BLOG_V2_SUMMARY.md) - Resumo técnico

### Google Calendar
- [`GOOGLE_CALENDAR_SETUP.md`](GOOGLE_CALENDAR_SETUP.md) - Setup inicial
- [`GOOGLE_CALENDAR_INTEGRATION.md`](GOOGLE_CALENDAR_INTEGRATION.md) - Guia completo

### Social Publishing
- [`SOCIAL_PUBLISHING_GUIDE.md`](SOCIAL_PUBLISHING_GUIDE.md) - Guia completo
- [`QUICKSTART_AUTO_PUBLISH.md`](QUICKSTART_AUTO_PUBLISH.md) - Acesso rápido
- [`AUTO_PUBLISH_SUMMARY.md`](AUTO_PUBLISH_SUMMARY.md) - Resumo técnico

### Stories Companion ✨ **NOVO!**
- [`STORIES_COMPANION_GUIDE.md`](STORIES_COMPANION_GUIDE.md) - Guia completo
- [`QUICKSTART_STORIES_COMPANION.md`](QUICKSTART_STORIES_COMPANION.md) - 30 segundos
- [`STORIES_COMPANION_TECHNICAL.md`](STORIES_COMPANION_TECHNICAL.md) - Detalhes técnicos

---

## 🎯 Fluxos Principais

### 1️⃣ Criar Conteúdo Visual
```
1. Selecionar formato (Post, Reels, Carrossel, etc)
2. Abrir editor de design
3. Customizar (cores, textos, imagens)
4. Gerar stories associadas (novo!)
5. Salvar e publicar
```

### 2️⃣ Criar Artigo de Blog
```
1. Informar tópico e objetivo
2. Lucresia IA gera conteúdo completo
3. Editar/customizar
4. Publicar em múltiplas plataformas
5. Analytics automático
```

### 3️⃣ Sincronizar com Calendário
```
1. Conectar Google Calendar (OAuth)
2. Criar evento no sistema
3. Sincronizar automaticamente
4. Receber lembretes
5. Status em tempo real
```

### 4️⃣ Gerar Stories (Novo!)
```
1. Criar qualquer projeto
2. Clicar "📱 Gerar Stories"
3. Modal abre com contexto automático
4. Ajustar se quiser
5. Gerar e copiar
```

---

## 🔌 Endpoints Principais

### Blog
- `POST /api/blog/posts` - Criar artigo
- `GET /api/blog/posts` - Listar artigos
- `PUT /api/blog/posts/{id}` - Editar artigo
- `POST /api/blog/posts/{id}/validar-seo` - Validar SEO
- `POST /api/blog/posts/{id}/agendar` - Agendar publicação
- `POST /api/blog/posts/{id}/publicar-automatico` - Publicar em múltiplas plataformas

### Google Calendar
- `POST /api/calendar/auth/callback` - OAuth callback
- `POST /api/calendar/events` - Criar evento
- `GET /api/calendar/events` - Listar eventos
- `PUT /api/calendar/events/{id}` - Editar evento
- `DELETE /api/calendar/events/{id}` - Deletar evento

### Social Publishing
- `POST /api/blog/posts/{id}/publicar-automatico` - Publicar automático
- `GET /api/blog/publicar-status` - Status de publicações
- `POST /api/blog/posts/{id}/agendar-publicacao` - Agendar publicação
- `GET /api/blog/publicacoes-agendadas` - Listar agendadas

### IA (Lucresia)
- `POST /api/ai/lucresia/stories` - Gerar stories
- `POST /api/ai/lucresia/titulo` - Gerar títulos
- `POST /api/ai/lucresia/copy` - Gerar copy
- `POST /api/ai/lucresia/hashtags` - Gerar hashtags
- `POST /api/ai/lucresia/blog-post` - Gerar blog post

---

## 🧠 Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Backend | FastAPI, Motor (MongoDB async), Pydantic |
| Frontend | React, Fetch API, CSS3 |
| Database | MongoDB |
| Autenticação | OAuth 2.0 (Google) |
| IA | Lucresia (Neurovendas) |
| APIs | Medium, Dev.to, WordPress, LinkedIn, Twitter/X, Notion |

---

## 📊 Estatísticas

| Métrica | Valor |
|---------|-------|
| Features Principais | 4 |
| Sub-features | 20+ |
| Endpoints | 50+ |
| Plataformas de Publicação | 6 |
| Templates de Design | 8 |
| Templates de Blog | 10 |
| Linhas de Código (Backend) | 3000+ |
| Linhas de Código (Frontend) | 3000+ |

---

## 🚀 Roadmap

### ✅ Implementado
- [x] Blog System v2.0 (10 features)
- [x] Google Calendar Integration
- [x] Social Publishing Automation
- [x] Stories Companion

### 📅 Em Planejamento
- [ ] Analytics Dashboard (detalhado)
- [ ] A/B Testing automático
- [ ] Scheduling avançado
- [ ] WhatsApp Business API
- [ ] Notion Database Integration
- [ ] Zapier/Make.com Integration
- [ ] SMS Marketing
- [ ] Email Marketing

---

## 🔐 Segurança

- ✅ OAuth 2.0 para Google Calendar
- ✅ Tokens encriptados com Fernet
- ✅ Validação de entrada (Pydantic)
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Sanitização de conteúdo

---

## 📞 Suporte

### Documentação
Consulte os arquivos `.md` específicos para cada feature.

### Estrutura de Documentação
```
README.md (este arquivo)
├── BLOG_SYSTEM_V2_GUIDE.md
├── GOOGLE_CALENDAR_SETUP.md
├── SOCIAL_PUBLISHING_GUIDE.md
├── STORIES_COMPANION_GUIDE.md
├── *_QUICKSTART.md (acesso rápido)
├── *_TECHNICAL.md (detalhes técnicos)
└── *_SUMMARY.md (resumo)
```

---

## 🎓 Padrões de Código

### Backend
```python
# FastAPI com validação Pydantic
@app.post("/api/blog/posts")
async def create_blog_post(post: BlogPostRequest):
    # Validação automática
    # Async/await
    # Error handling
```

### Frontend
```javascript
// React Hooks + Fetch API
const [state, setState] = useState(initialValue);
const handleAction = async () => {
  const response = await api.endpoint();
  setState(response);
};
```

---

## 📈 Performance

- ⚡ Async/await no backend
- ⚡ Lazy loading no frontend
- ⚡ Caching de imagens
- ⚡ Compressão de respostas
- ⚡ Database indexing
- ⚡ API rate limiting

---

## 🤝 Contribuindo

Para contribuir:
1. Criar branch feature
2. Fazer commits atômicos
3. Abrir PR com descrição
4. Aguardar review
5. Merge após aprovação

---

## 📄 Licença

Proprietary - Elevare Neurovendas

---

## 👥 Time

**Desenvolvido por**: Elevare Development Team  
**Versão Atual**: 3.0  
**Última Atualização**: 2025  

---

## 🎉 Destaques Recentes

### v3.0 - Stories Companion Release ✨
- ✅ Adicionada forma unificada de criar stories
- ✅ Contexto automático pré-preenchido
- ✅ Integração com Lucresia IA
- ✅ UX significativamente melhorada
- ✅ Documentação completa

### v2.0 - Social Publishing
- ✅ Publicação em 6 plataformas
- ✅ Agendamento de posts
- ✅ Status em tempo real
- ✅ Otimização por plataforma

### v1.0 - Blog System + Google Calendar
- ✅ Blog system com 10 features
- ✅ Google Calendar OAuth integration
- ✅ Eventos sincronizados

---

**Obrigado por usar Elevare NeuroVendas! 🚀**
