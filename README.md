# 🔥 Elevare NeuroVendas - Plataforma Completa de Marketing para Estética

Sistema completo de geração de conteúdo, análise de tendências e gestão de marketing digital para clínicas e profissionais de estética.

---

## 🚀 Início Rápido

### Pré-requisitos
- Python 3.10+
- Node.js 16+
- MongoDB
- Conta Unsplash (API key gratuita)
- Chave de IA (Emergent LLM ou OpenAI)

### Instalação Rápida

```bash
# 1. Clone o repositório
git clone https://github.com/Carine01/Elevare-Neurovendas.git
cd Elevare-Neurovendas-main

# 2. Configure o Backend Python
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Crie .env com suas chaves:
# MONGO_URL=mongodb+srv://...
# UNSPLASH_ACCESS_KEY=...
# EMERGENT_LLM_KEY=...

# 3. Configure o Backend Node.js (Radar)
cd ../backend/radar-tendencias
npm install

# Configure .env com APIs (YouTube, Twitter, Instagram, etc)

# 4. Configure o Frontend
cd ../../frontend
npm install

# 5. Inicie TUDO com 1 comando
cd ..
start-all.bat
```

Acesse:
- **Frontend**: http://localhost:3000
- **Backend Python**: http://localhost:8000
- **Radar API**: http://localhost:3000/health

---

## 🎯 Funcionalidades Principais

### 1. 📝 Gerador de Conteúdo Visual
- Editor de design para Posts, Stories e Carrosséis
- Templates profissionais pré-configurados
- Busca de imagens via Unsplash
- Exportação em múltiplos formatos

### 2. 🤖 Lucresia IA - Neurovendas para Estética
- Geração de stories estratégicos (5-7 slides)
- Copywriting otimizado para conversão
- Tom de voz profissional (autoridade/acolhedor/educativo)
- Quebra de objeções automatizada
- Hashtags estratégicas

### 3. 📰 Sistema de Blog Completo
- Geração de artigos com IA
- Editor visual integrado
- SEO otimizado (meta description, keywords)
- Agendamento de publicação
- Exportação para Medium, Dev.to, WordPress
- Analytics integrado

### 4. 📊 Radar de Tendências (NOVO!)
- Análise em tempo real de **5 plataformas**:
  - YouTube (visualizações, engajamento)
  - Instagram (hashtags, posts)
  - Twitter/X (tweets, retweets)
  - Reddit (discussões, upvotes)
  - Google Trends (volume de buscas)
- Pontuação de viralização (0-100)
- Recomendações automáticas de conteúdo
- Monitoramento automático a cada hora

### 5. 🎨 Brand Profile
- Configuração da identidade da marca
- Tom de voz consistente
- Paleta de cores personalizada
- Valores e diferenciais da clínica

### 6. 📅 Google Calendar Sync
- Sincronização de publicações agendadas
- Lembretes automáticos
- Integração com Gmail

---

## 🏗️ Arquitetura do Sistema

```
Elevare-Neurovendas/
│
├── backend/                    # Backend Python (FastAPI)
│   ├── server.py              # API principal (porta 8000)
│   ├── requirements.txt       # Dependências Python
│   ├── .env                   # Configurações (MongoDB, APIs)
│   │
│   └── radar-tendencias/      # Backend Node.js (Express)
│       ├── server.js          # API Radar (porta 3000)
│       ├── package.json       # Dependências Node.js
│       └── .env               # APIs sociais (YouTube, Twitter, etc)
│
├── frontend/                   # Frontend React
│   ├── src/
│   │   ├── App.js            # Componente principal
│   │   └── index.css         # Estilos
│   ├── content-generator-advanced.html  # Editor standalone
│   └── package.json          # Dependências React
│
├── docs/                       # Documentação
│   └── guia-instalacao-radar.md
│
├── start-all.bat              # Inicia tudo de uma vez
├── start-backend.bat          # Apenas backend Python
├── start-radar.bat            # Apenas backend Node.js
└── start-frontend.bat         # Apenas frontend React
```

---

## 🔧 Configuração Detalhada

### Backend Python (.env)

```env
# MongoDB
MONGO_URL=mongodb+srv://usuario:senha@cluster.mongodb.net/elevare_db
DB_NAME=elevare_db

# Unsplash (imagens)
UNSPLASH_ACCESS_KEY=sua_chave_aqui

# IA (escolha um)
EMERGENT_LLM_KEY=sua_chave_emergent
# OU
OPENAI_API_KEY=sua_chave_openai

# Google Calendar (opcional)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Backend Radar (.env)

```env
# YouTube Data API
YOUTUBE_API_KEY=AIza...

# Twitter/X
TWITTER_BEARER_TOKEN=AAAAA...

# Instagram Graph API
INSTAGRAM_ACCESS_TOKEN=IGQ...
INSTAGRAM_USER_ID=123456

# Reddit
REDDIT_CLIENT_ID=abc123
REDDIT_SECRET=xyz789

# SerpAPI (Google Trends)
SERPAPI_KEY=sua_chave
```

**📖 Guia completo**: Veja [docs/guia-instalacao-radar.md](docs/guia-instalacao-radar.md)

---

## 📡 Endpoints da API

### Backend Python (http://localhost:8000/api)

#### Lucresia IA
- `POST /ai/lucresia/stories` - Gerar sequência de stories
- `POST /ai/lucresia/titulo` - Gerar títulos estratégicos
- `POST /ai/lucresia/copy` - Gerar copy persuasivo
- `POST /ai/lucresia/hashtags` - Gerar hashtags

#### Blog
- `GET /blog/posts` - Listar artigos
- `POST /blog/posts/generate` - Gerar artigo com IA
- `PUT /blog/posts/{id}` - Atualizar artigo
- `DELETE /blog/posts/{id}` - Deletar artigo
- `POST /blog/posts/{id}/agendar` - Agendar publicação

#### Imagens
- `POST /images/search` - Buscar no Unsplash
- `POST /images/upload` - Upload de imagem
- `GET /images/popular` - Imagens populares

#### Brand Profile
- `GET /brand/profile` - Obter perfil ativo
- `POST /brand/profile` - Criar perfil
- `PUT /brand/profile/{id}` - Atualizar perfil

### Backend Radar (http://localhost:3000/api)

- `POST /tendencias` - Buscar tendências por termo
- `GET /tendencias/auto` - Tendências automáticas
- `POST /hashtags/analisar` - Análise de hashtags
- `GET /health` - Status das APIs

---

## 🎨 Como Usar

### 1. Criar Conteúdo Visual

1. Clique em "Escolha o Formato"
2. Selecione Post/Story/Carrossel
3. Personalize cores, textos e imagens
4. Exporte em PNG/JPG

### 2. Gerar Stories com Lucresia IA

1. Clique no botão **"✨ Lucresia IA"**
2. Preencha:
   - Procedimento: "Harmonização Facial"
   - Objetivo: "Gerar autoridade profissional"
   - Público: "mulheres 30-50 anos"
3. Clique em "Gerar Stories"
4. Receba sequência completa (5-7 slides)

### 3. Criar Artigo de Blog

1. Clique em **"📝 Criar Blog"**
2. Preencha:
   - Tópico: "Harmonização Facial"
   - Objetivo: "Educar"
   - Palavras-chave: "harmonização, natural"
3. Clique em "Gerar Artigo"
4. Edite e publique

### 4. Analisar Tendências

1. Clique em **"📊 Radar de Tendências"**
2. Digite termos: "skincare, botox"
3. Escolha categoria: "Skincare"
4. Clique em "Buscar Tendências"
5. Veja pontuação em cada plataforma
6. Siga recomendações de conteúdo

---

## 🚀 Deploy em Produção

### Opção 1: Render.com (Recomendado - Gratuito)

**Backend Python:**
1. Conecte repositório GitHub
2. Build Command: `pip install -r backend/requirements.txt`
3. Start Command: `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`
4. Adicione variáveis de ambiente

**Backend Radar:**
1. Novo Web Service
2. Build Command: `cd backend/radar-tendencias && npm install`
3. Start Command: `cd backend/radar-tendencias && npm start`
4. Adicione variáveis de ambiente

**Frontend:**
1. Novo Static Site
2. Build Command: `cd frontend && npm install && npm run build`
3. Publish Directory: `frontend/build`

### Opção 2: Railway / Heroku
Veja instruções em [docs/guia-instalacao-radar.md](docs/guia-instalacao-radar.md)

---

## 🧪 Testes

```bash
# Backend Python
cd backend
pytest

# Backend Radar
cd backend/radar-tendencias
npm test

# Frontend
cd frontend
npm test
```

---

## 📊 Analytics & Monitoramento

- **Dashboard de Conteúdo**: Visualizações, cliques, conversões
- **Radar Automático**: Executa a cada hora
- **Google Calendar**: Sincroniza publicações agendadas
- **Logs**: Winston (Node.js) + Python logging

---

## 🛠️ Tecnologias

### Backend Python
- FastAPI
- Motor (MongoDB async)
- Aiohttp
- Pydantic

### Backend Node.js
- Express
- Axios
- node-cron
- google-trends-api

### Frontend
- React 18
- Hooks (useState, useEffect)
- Fetch API
- CSS Modules

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/MinhaFeature`
3. Commit: `git commit -m 'Adiciona MinhaFeature'`
4. Push: `git push origin feature/MinhaFeature`
5. Abra um Pull Request

---

## 📄 Licença

MIT License - veja [LICENSE](LICENSE)

---

## 📞 Suporte

- 📧 Email: suporte@elevare.com
- 📚 Docs: [docs/](docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/Carine01/Elevare-Neurovendas/issues)

---

## 🎉 Recursos Extras

- ✅ **10+ Templates** de design profissionais
- ✅ **Lucresia IA** treinada em neurovendas
- ✅ **Radar** de 5 plataformas sociais
- ✅ **SEO** otimizado para blog
- ✅ **Google Calendar** integrado
- ✅ **Brand Profile** configurável
- ✅ **Export** para múltiplas plataformas

---

**Desenvolvido com ❤️ para profissionais de estética que querem dominar o marketing digital** 🚀✨
