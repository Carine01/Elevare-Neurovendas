# GUIA COMPLETO - RADAR DE TENDÊNCIAS

## Índice

1. [Instalação Inicial](#instalação-inicial)
2. [Configuração das APIs](#configuração-das-apis)
3. [Executando o Servidor](#executando-o-servidor)
4. [Endpoints da API](#endpoints-da-api)
5. [Exemplos de Uso](#exemplos-de-uso)
6. [Deploy em Produção](#deploy-em-produção)

---

## Instalação Inicial

### Pré-requisitos

- Node.js v16 ou superior
- npm ou yarn
- Conta Gmail (para notificações)

### Passo 1: Navegar até a pasta do projeto

```bash
cd backend/radar-tendencias
```

### Passo 2: Instalar dependências

```bash
npm install
```

### Passo 3: Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` e preencha com suas API keys (veja seção abaixo).

---

## Configuração das APIs

### 1. YouTube Data API (GRATUITA)

**Limite gratuito:** 10.000 unidades/dia (≈ 10.000 buscas)

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto
3. Vá em **APIs & Services > Library**
4. Busque "YouTube Data API v3" e ative
5. Vá em **Credentials > Create Credentials > API Key**
6. Copie a API Key e adicione no `.env`:
   ```
   YOUTUBE_API_KEY=AIzaSy...
   ```

### 2. Twitter/X API (GRATUITA - Limitada)

**Limite gratuito:** 500.000 tweets/mês

1. Acesse: https://developer.twitter.com/
2. Crie uma conta de desenvolvedor
3. Crie um novo App
4. Vá em **Keys and Tokens**
5. Gere um **Bearer Token**
6. Adicione no `.env`:
   ```
   TWITTER_BEARER_TOKEN=AAAAAAA...
   ```

### 3. Instagram Graph API (GRATUITA)

**Requisito:** Conta Instagram Business conectada a uma Página do Facebook

1. Acesse: https://developers.facebook.com/
2. Crie um App > Tipo: Business
3. Adicione **Instagram Graph API**
4. Conecte sua conta Instagram Business
5. Gere um Access Token de longa duração
6. Adicione no `.env`:
   ```
   INSTAGRAM_ACCESS_TOKEN=IGQ...
   INSTAGRAM_USER_ID=1234567890
   ```

**Como obter User ID:**
```bash
curl -X GET "https://graph.facebook.com/v18.0/me?fields=id&access_token=SEU_TOKEN"
```

### 4. Reddit API (GRATUITA)

**Limite:** 60 requisições/minuto

1. Acesse: https://www.reddit.com/prefs/apps
2. Clique em **Create App** ou **Create another app**
3. Escolha tipo: **script**
4. Preencha nome e descrição
5. Copie **client_id** (abaixo do nome do app) e **secret**
6. Adicione no `.env`:
   ```
   REDDIT_CLIENT_ID=abc123
   REDDIT_SECRET=xyz789
   ```

### 5. SerpAPI - Google Trends (FREEMIUM)

**Limite gratuito:** 100 buscas/mês

1. Acesse: https://serpapi.com/
2. Crie uma conta
3. Copie sua API Key do dashboard
4. Adicione no `.env`:
   ```
   SERPAPI_KEY=sua_chave_aqui
   ```

**Alternativa GRATUITA:** Use a biblioteca `google-trends-api` (já incluída no package.json) - sem limites mas menos estável.

---

## Executando o Servidor

### Modo Desenvolvimento

```bash
cd backend/radar-tendencias
npm run dev
```

### Modo Produção

```bash
npm start
```

### Verificar se está funcionando

Abra o navegador em: http://localhost:3000/health

Resposta esperada:
```json
{
  "status": "online",
  "timestamp": "2026-01-23T...",
  "apis": {
    "youtube": true,
    "twitter": true,
    "instagram": true,
    "serpapi": true,
    "reddit": true
  }
}
```

---

## Endpoints da API

### 1. Buscar Tendências por Termo

**POST** `/api/tendencias`

**Body:**
```json
{
  "termos": ["skincare", "limpeza de pele", "buccal massage"],
  "categoria": "skincare",
  "periodo": "7dias"
}
```

**Resposta:**
```json
{
  "sucesso": true,
  "total": 3,
  "data": [
    {
      "termo": "skincare",
      "categoria": "skincare",
      "pontuacaoGeral": 92,
      "plataformas": {
        "youtube": { "pontuacao": 95, "visualizacoes": 2500000 },
        "instagram": { "pontuacao": 88, "engajamentoTotal": 45000 }
      },
      "recomendacoes": [
        {
          "plataforma": "YouTube",
          "acao": "CRIAR CONTEÚDO URGENTE",
          "prioridade": "alta"
        }
      ]
    }
  ]
}
```

### 2. Tendências Automáticas

**GET** `/api/tendencias/auto`

Retorna tendências dos termos mais populares de estética automaticamente.

### 3. Análise de Hashtags

**POST** `/api/hashtags/analisar`

**Body:**
```json
{
  "hashtags": ["#skincare", "#estetica", "#limpezadepele"]
}
```

---

## Exemplos de Uso

### Exemplo 1: Buscar tendências com cURL

```bash
curl -X POST http://localhost:3000/api/tendencias \
  -H "Content-Type: application/json" \
  -d '{
    "termos": ["gua sha", "skin cycling"],
    "categoria": "skincare",
    "periodo": "7dias"
  }'
```

### Exemplo 2: JavaScript/Fetch

```javascript
const buscarTendencias = async () => {
  const response = await fetch('http://localhost:3000/api/tendencias', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      termos: ['peeling de diamante', 'harmonização facial'],
      categoria: 'procedimentos',
      periodo: '30dias'
    })
  });
  
  const dados = await response.json();
  console.log(dados);
};

buscarTendencias();
```

### Exemplo 3: Conectar com o Frontend React

```javascript
// No seu componente React
const buscarTendencias = async () => {
  setLoading(true);
  
  try {
    const response = await fetch('http://localhost:3000/api/tendencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        termos: ['skincare coreano'],
        categoria: 'skincare',
        periodo: '7dias'
      })
    });
    
    const dados = await response.json();
    setTendencias(dados.data);
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    setLoading(false);
  }
};
```

---

## Deploy em Produção

### Opção 1: Heroku

```bash
# Instalar Heroku CLI
npm install -g heroku

# Login
heroku login

# Criar app
heroku create radar-tendencias

# Adicionar variáveis de ambiente
heroku config:set YOUTUBE_API_KEY=sua_chave
heroku config:set TWITTER_BEARER_TOKEN=seu_token
# ... adicionar todas as variáveis do .env

# Deploy
git push heroku main
```

### Opção 2: Render.com (Recomendado - Gratuito)

1. Faça commit do código no GitHub
2. Acesse: https://render.com/
3. Clique em **New > Web Service**
4. Conecte seu repositório GitHub
5. Configure:
   - **Build Command:** `cd backend/radar-tendencias && npm install`
   - **Start Command:** `cd backend/radar-tendencias && npm start`
6. Adicione as variáveis de ambiente no painel
7. Clique em **Create Web Service**

### Opção 3: Railway

1. Acesse: https://railway.app/
2. Clique em **Start a New Project**
3. Escolha **Deploy from GitHub repo**
4. Selecione seu repositório
5. Configure root directory: `backend/radar-tendencias`
6. Adicione variáveis de ambiente
7. Deploy automático!

### Opção 4: VPS (DigitalOcean, Linode)

```bash
# Conectar ao servidor
ssh root@seu-ip

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clonar repositório
git clone seu-repositorio.git
cd Elevare-Neurovendas-main/backend/radar-tendencias

# Instalar dependências
npm install

# Configurar .env
nano .env
# Cole suas variáveis

# Instalar PM2 (gerenciador de processos)
npm install -g pm2

# Iniciar aplicação
pm2 start server.js --name radar-tendencias

# Configurar para iniciar no boot
pm2 startup
pm2 save
```

---

## Segurança

### Proteger suas API Keys

1. **NUNCA** commite o arquivo `.env`
2. Use variáveis de ambiente em produção
3. Adicione rate limiting:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite de 100 requisições
});

app.use('/api/', limiter);
```

4. Adicione CORS específico:

```javascript
app.use(cors({
  origin: 'https://seu-dominio.com'
}));
```

---

## Monitoramento

### Adicionar Logs

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usar no código
logger.info('Tendência buscada:', { termo: 'skincare' });
```

---

## Resolução de Problemas

### Erro: "API Key inválida"

- Verifique se a chave está correta no `.env`
- Confirme que a API está ativada no console da plataforma

### Erro: "Rate limit exceeded"

- Você atingiu o limite de requisições
- Aguarde o período de reset (geralmente 1 hora)
- Considere upgrade do plano

### Erro: "CORS policy"

- Adicione o domínio do frontend no CORS
- Verifique se está enviando headers corretos

---

## Recursos Adicionais

- [YouTube API Docs](https://developers.google.com/youtube/v3)
- [Twitter API Docs](https://developer.twitter.com/en/docs)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Reddit API Docs](https://www.reddit.com/dev/api)
- [SerpAPI Docs](https://serpapi.com/google-trends-api)

---

## Próximas Melhorias

- [ ] Adicionar cache Redis para economizar API calls
- [ ] Implementar webhook para notificações em tempo real
- [ ] Criar dashboard web para visualização
- [ ] Adicionar mais plataformas (Pinterest, LinkedIn)
- [ ] Machine Learning para prever tendências
- [ ] Sistema de relatórios PDF automatizados

---

## Suporte

Dúvidas? Entre em contato ou abra uma issue no GitHub!

---

**Desenvolvido com ❤️ para esteticistas que querem viralizar!** 🚀
