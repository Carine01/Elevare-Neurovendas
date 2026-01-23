# 📋 Guia de Implementação - Sistema Avançado de Stories

## 🎯 Resumo Executivo

O sistema foi totalmente restruturado com base na análise do arquivo enviado (`elevare-app-com-galeria-avancada.html`). Implementamos:

✅ **6 Sequências de Neurovendas** (Atrair, Aquecer, Converter, Educar, Reposicionar, Reativar)
✅ **Galeria Avançada de Imagens** (Unsplash, Pexels, Pixabay, IA)
✅ **Preview em Tempo Real** com customização completa
✅ **Sistema Multi-Formato** (Instagram, Facebook, LinkedIn)
✅ **Integração Backend** pronta para FastAPI
✅ **Psicologia de Vendas** aplicada em cada sequência

---

## 📂 Arquivos Criados/Modificados

### Frontend:
- ✅ `frontend/content-generator-advanced.html` - Interface principal (ATUALIZADO)
- ✅ `frontend/STORIES_MELHORIAS.md` - Documentação de melhorias

### Backend:
- ✅ `backend/integration_stories_advanced.py` - Endpoints e modelos

### Este arquivo:
- ✅ `IMPLEMENTACAO_GUIA.md` - Instruções passo-a-passo

---

## 🚀 Passos de Implementação

### FASE 1: SETUP INICIAL (15 min)

#### 1.1 Clonar/Atualizar Repositório
```bash
cd c:\Users\Carine\Downloads\Elevare-Neurovendas-main (6)\Elevare-Neurovendas-main
git pull origin main
```

#### 1.2 Verificar Node.js e npm
```bash
node --version  # v18+ recomendado
npm --version   # v8+ recomendado
```

#### 1.3 Instalar dependências Frontend (se necessário)
```bash
cd frontend
npm install
```

#### 1.4 Verificar Python e FastAPI
```bash
python --version  # Python 3.9+
pip list | grep fastapi
```

---

### FASE 2: INTEGRAÇÃO BACKEND (30 min)

#### 2.1 Adicionar Models no server.py

No `backend/server.py`, adicione:

```python
# Após os imports existentes
from integration_stories_advanced import router as stories_router, AdvancedStory

# Na seção de routers (após os outros routers)
api.include_router(stories_router)
```

#### 2.2 Criar Coleções MongoDB

```bash
# Conectar ao MongoDB (local ou Atlas)
mongosh

# Criar índices para performance
db.stories.createIndex({ "criado_em": -1 })
db.stories.createIndex({ "procedimento": 1 })
db.stories.createIndex({ "status": 1 })
db.stories.createIndex({ "sequencia": 1 })
```

#### 2.3 Testar Endpoints Básicos

```bash
# Terminal 1: Iniciar servidor
cd backend
python server.py

# Terminal 2: Testar API
curl http://localhost:8000/api/content/stories/sequencias/all
```

Resposta esperada:
```json
{
  "atrair": { "name": "🎯 Atrair", "description": "..." },
  "aquecer": { "name": "🔥 Aquecer", "description": "..." },
  ...
}
```

---

### FASE 3: INTEGRAÇÃO APIS EXTERNAS (45 min)

#### 3.1 Configurar Unsplash

```bash
# 1. Ir para https://unsplash.com/developers
# 2. Criar nova aplicação
# 3. Copiar Access Key
# 4. Adicionar ao .env

UNSPLASH_ACCESS_KEY=your_key_here
```

#### 3.2 Configurar Pexels

```bash
# 1. Ir para https://www.pexels.com/api/
# 2. Registrar e gerar API Key
# 3. Adicionar ao .env

PEXELS_API_KEY=your_key_here
```

#### 3.3 Configurar Pixabay

```bash
# 1. Ir para https://pixabay.com/api/
# 2. Registrar e gerar API Key
# 3. Adicionar ao .env

PIXABAY_API_KEY=your_key_here
```

#### 3.4 Implementar Chamadas no Código

No `frontend/content-generator-advanced.html`, procure por `TODO: Integrar com APIs reais` e implemente:

```javascript
// Exemplo para Unsplash
async function searchUnsplash(query) {
    const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=12`,
        {
            headers: {
                'Authorization': `Client-ID ${UNSPLASH_KEY}`
            }
        }
    );
    const data = await response.json();
    return data.results.map(img => ({
        url: img.urls.regular,
        source: 'Unsplash',
        id: img.id
    }));
}
```

---

### FASE 4: INTEGRAÇÃO LUCRESIA IA (40 min)

#### 4.1 Obter API Key da Lucresia

```bash
# Contatar Lucresia para API Key
# Adicionar ao .env

LUCRESIA_API_KEY=your_key_here
LUCRESIA_API_URL=https://api.lucresia.com/v1
```

#### 4.2 Implementar Integração

No `backend/integration_stories_advanced.py`:

```python
async def call_lucresia_api(prompt: str, model: str = "neurovendas"):
    """Chama Lucresia para gerar conteúdo"""
    headers = {
        "Authorization": f"Bearer {os.getenv('LUCRESIA_API_KEY')}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "prompt": prompt,
        "model": model,
        "language": "pt-BR",
        "max_tokens": 500
    }
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{os.getenv('LUCRESIA_API_URL')}/generate",
            json=payload,
            headers=headers
        ) as response:
            if response.status == 200:
                return await response.json()
            else:
                raise Exception(f"Erro Lucresia: {response.status}")
```

#### 4.3 Testar Geração

```bash
# POST http://localhost:8000/api/content/stories/generate
# Body:
{
  "sequencia": "converter",
  "procedimento": "botox",
  "quantidade": 5
}
```

---

### FASE 5: INTEGRAÇÃO SOCIAL MEDIA (1 hora)

#### 5.1 Configurar Instagram Graph API

```bash
# 1. Ir para https://developers.facebook.com/
# 2. Criar aplicação
# 3. Adicionar Instagram Graph API
# 4. Gerar Access Token com permissions: instagram_basic, instagram_content_publish

INSTAGRAM_BUSINESS_ACCOUNT_ID=your_id
INSTAGRAM_ACCESS_TOKEN=your_token
```

#### 5.2 Configurar Facebook Graph API

```bash
FACEBOOK_PAGE_ID=your_id
FACEBOOK_ACCESS_TOKEN=your_token
```

#### 5.3 Implementar Publicação

```python
async def publish_to_instagram(story: AdvancedStory):
    """Publica story no Instagram"""
    
    # Preparar media
    with open(story.imagem_url, 'rb') as f:
        files = {'file': f}
    
    # Upload media container
    response = await post_to_ig_api(
        f"/{os.getenv('INSTAGRAM_BUSINESS_ACCOUNT_ID')}/media",
        {
            "media_type": "STORIES",
            "image_url": story.imagem_url,
            "user_tags": [],
        }
    )
    
    media_id = response['id']
    
    # Publish
    await post_to_ig_api(
        f"/{os.getenv('INSTAGRAM_BUSINESS_ACCOUNT_ID')}/media_publish",
        {"creation_id": media_id}
    )
```

---

### FASE 6: INTERFACE FRONTEND (20 min)

#### 6.1 Conectar Endpoints

No `frontend/content-generator-advanced.html`, substituir funções de IA:

```javascript
async function generateStoryAI() {
    const sequence = document.getElementById('story-type').value;
    const procedure = document.getElementById('story-procedure').value;
    
    const response = await fetch(`${API_BASE}/content/stories/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sequencia: sequence,
            procedimento: procedure,
            quantidade: 5
        })
    });
    
    const data = await response.json();
    displayStories(data.stories);
}
```

#### 6.2 Implementar Save

```javascript
async function saveStory() {
    const storyData = {
        titulo: document.getElementById('story-title').value,
        sequencia: document.getElementById('story-type').value,
        procedimento: document.getElementById('story-procedure').value,
        texto_principal: document.getElementById('story-text').value,
        // ... outros campos
    };
    
    const response = await fetch(`${API_BASE}/content/stories/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyData)
    });
    
    showNotification('✅ Story salvo!', 'success');
}
```

---

### FASE 7: TESTES (30 min)

#### 7.1 Teste Manual de Fluxo Completo

```
1. Acessar: http://localhost:3000/content-generator-advanced.html
2. Selecionar sequência: "Atrair"
3. Procedimento: "Botox"
4. Clicar: "Gerar Opções com IA"
5. Verificar: 5 stories geradas
6. Customizar: Fonte, cor, imagem
7. Salvar: Deve aparecer no MongoDB
8. Publicar: Agendar para depois
9. Dashboard: Ver estatísticas
```

#### 7.2 Teste de APIs

```bash
# Testar geração
curl -X POST http://localhost:8000/api/content/stories/generate \
  -H "Content-Type: application/json" \
  -d '{"sequencia": "converter", "procedimento": "botox", "quantidade": 5}'

# Testar save
curl -X POST http://localhost:8000/api/content/stories/save \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Test", "sequencia": "atrair", ...}'

# Testar dashboard
curl http://localhost:8000/api/content/stories/dashboard
```

#### 7.3 Teste de Performance

```bash
# Gerar 100 stories em paralelo
for i in {1..100}; do
  curl -X POST http://localhost:8000/api/content/stories/generate \
    -H "Content-Type: application/json" \
    -d "{\"sequencia\": \"atrair\", \"procedimento\": \"botox\", \"quantidade\": 1}" &
done
wait
```

---

### FASE 8: DEPLOY (20 min)

#### 8.1 Build Frontend

```bash
cd frontend
npm run build
```

#### 8.2 Setup Environment

```bash
# .env.production
REACT_APP_API_URL=https://sua-api.com
UNSPLASH_KEY=...
PEXELS_KEY=...
LUCRESIA_KEY=...
```

#### 8.3 Deploy Backend

```bash
# Heroku
heroku login
heroku create elevare-neurovendas
git push heroku main

# ou Docker
docker build -t elevare:latest .
docker run -p 8000:8000 elevare:latest
```

---

## 🔍 Troubleshooting

### Problema: "API Key inválida Unsplash"
```
Solução:
1. Verificar se a chave está no .env
2. Conferir em https://unsplash.com/developers
3. Regenerar se necessário
```

### Problema: "Erro ao conectar MongoDB"
```
Solução:
1. Verificar conexão: mongosh
2. Conferir string de conexão em .env
3. Verificar firewall/VPN
```

### Problema: "Stories não aparecem em preview"
```
Solução:
1. Abrir DevTools (F12)
2. Verificar Console para erros
3. Confirmar que geração foi chamada
4. Verificar CSS do preview-container
```

### Problema: "Instagram não publica"
```
Solução:
1. Verificar Access Token validade
2. Confirmar permissions corretas
3. Testar em Graph API Explorer
4. Verificar account settings Instagram
```

---

## 📊 Métricas de Sucesso

### Após Implementação Completa:

| Métrica | Meta | Status |
|---------|------|--------|
| Tempo de geração de story | < 3 segundos | ⏳ |
| Taxa de sucesso de publicação | > 95% | ⏳ |
| Compatibilidade multi-formato | 100% | ⏳ |
| Cobertura de testes | > 80% | ⏳ |
| Performance (QA) | Lighthouse > 90 | ⏳ |

---

## 📚 Recursos Adicionais

### Documentação:
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Motor (MongoDB Async)](https://motor.readthedocs.io/)
- [React Hooks](https://react.dev/reference/react)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)

### Exemplos de Código:
- Veja `backend/integration_stories_advanced.py`
- Veja `frontend/content-generator-advanced.html`
- Veja `frontend/STORIES_MELHORIAS.md`

### Tutoriais:
- [Neurovendas 101](https://www.livro-neurovendas.com/)
- [Social Media Marketing](https://buffer.com/library/social-media-marketing)

---

## 🎯 Próximos Passos Recomendados

### Curto Prazo (1-2 semanas):
- [ ] Implementar integração Unsplash/Pexels
- [ ] Testar geração Lucresia
- [ ] Conectar Instagram API
- [ ] Criar testes unitários

### Médio Prazo (1 mês):
- [ ] Dashboard completo
- [ ] Analytics em tempo real
- [ ] A/B testing de sequências
- [ ] Sistema de templates

### Longo Prazo (2-3 meses):
- [ ] IA customizada por vertical
- [ ] Integração com CRM
- [ ] Automação completa
- [ ] Mobile app

---

## 💬 Suporte

### Dúvidas sobre:
- **Backend**: Verificar `backend/integration_stories_advanced.py`
- **Frontend**: Verificar `frontend/content-generator-advanced.html`
- **Neurovendas**: Ler `frontend/STORIES_MELHORIAS.md`
- **Implementação**: Este arquivo

---

**Última Atualização**: Janeiro 2026
**Versão**: 2.0
**Autor**: GitHub Copilot + Elevare Team
**Status**: ✅ Pronto para Implementação
