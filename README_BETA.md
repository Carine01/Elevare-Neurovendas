# 🔥 Elevare NeuroVendas - Versão BETA

## 🎯 Plataforma de Criação de Conteúdo Visual com IA para Estética Avançada

> **Versão Beta** - Sistema completo de geração de conteúdo coerente com perfil de marca e IA especializada em Neurovendas.

---

## ✨ NOVIDADES DA VERSÃO BETA

### 🎨 **Sistema de Perfil de Marca**
- Defina identidade completa da sua marca (tom, valores, linguagem)
- Cores e fontes personalizadas aplicadas automaticamente
- Palavras-chave estratégicas e termos a evitar

### 🤖 **Lucresia - IA de Neurovendas Personalizada**
- Clone de IA treinado para estética avançada
- Gera conteúdo 100% coerente com seu perfil de marca
- Stories, títulos, copy e hashtags estratégicas
- Tom de voz e linguagem adaptados automaticamente

### 🖼️ **Editor Visual Avançado**
- 12 formatos pré-configurados (Instagram, TikTok, Facebook, etc.)
- Integração com Unsplash (milhões de imagens profissionais)
- Upload de imagens próprias
- Ajustes de cor, texto, filtros e efeitos

---

## 🚀 INSTALAÇÃO RÁPIDA

### **Requisitos**
- Python 3.9+
- Node.js 16+
- MongoDB (local ou Atlas)
- Chaves de API:
  - `EMERGENT_LLM_KEY` (para IA)
  - `UNSPLASH_ACCESS_KEY` (para imagens)

### **1. Backend Setup**

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente (.env)
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=elevare_db
EMERGENT_LLM_KEY=sua_chave_emergent
UNSPLASH_ACCESS_KEY=sua_chave_unsplash
CORS_ORIGINS=http://localhost:3000
EOF

# Iniciar servidor
uvicorn server:app --reload --port 8000
```

### **2. Frontend Setup**

```bash
cd frontend

# Instalar dependências
npm install

# Configurar variável de ambiente (.env)
echo "REACT_APP_BACKEND_URL=http://localhost:8000" > .env

# Iniciar aplicação
npm start
```

### **3. Inicializar Perfil de Marca**

```bash
# Criar perfil padrão via API
curl -X POST http://localhost:8000/api/brand/profile/seed
```

Ou pela interface:
1. Abrir `http://localhost:3000`
2. Clicar em **"⚙️ Configurar Marca"**
3. Visualizar perfil padrão criado automaticamente

---

## 📋 FUNCIONALIDADES PRINCIPAIS

### 1. **Seleção de Formato**
- 12 formatos otimizados para redes sociais
- Filtros por categoria: Social Media, Ads, Stories
- Seleção múltipla de formatos

### 2. **Configuração de Marca**
Acesse via botão **"⚙️ Configurar Marca"** e visualize:
- ✅ Identidade da Marca (nome, tom, valores)
- ✅ Linguagem e Comunicação (público-alvo, palavras-chave)
- ✅ Identidade Visual (cores, fontes)
- ✅ Diferenciais competitivos

### 3. **Editor Visual**
- **Templates:** Design pré-configurados para estética
- **Imagens:** Busca no Unsplash ou upload próprio
- **Texto:** Edição completa com fontes e efeitos
- **Fundo:** Cores sólidas ou imagens personalizadas
- **Ajustes:** Brilho, contraste, saturação, filtros

### 4. **Geração de Conteúdo com IA (Lucresia)**
Todos os conteúdos seguem automaticamente o perfil da marca!

```javascript
// Stories estratégicos (5-7 sequências)
api.lucresiaStories(
  'Harmonização Facial',
  'Gerar autoridade profissional',
  'mulheres 30-50 anos',
  5
);

// Títulos para posts
api.lucresiaTitulo('Procedimento de Botox', 'autoridade');

// Copy completo
api.lucresiaCopy('Lançamento novo procedimento', 'premium');

// Hashtags estratégicas
api.lucresiaHashtags('Harmonização facial');
```

---

## 🎯 FLUXO DE TRABALHO RECOMENDADO

### Para profissionais de estética:

1. **Configurar Perfil da Marca** (uma vez)
   - Definir identidade, valores, linguagem
   - Escolher cores e fontes
   - Listar diferenciais

2. **Gerar Conteúdo com Lucresia**
   - Stories para stories do Instagram
   - Títulos e copy para posts
   - Hashtags estratégicas

3. **Criar Designs no Editor**
   - Escolher formato (post, story, reel)
   - Adicionar imagem do Unsplash ou upload
   - Inserir texto gerado pela IA
   - Ajustar cores da marca
   - Aplicar efeitos visuais

4. **Exportar e Publicar**
   - Download em alta qualidade
   - Publicar nas redes sociais

---

## 🔧 API ENDPOINTS

### Perfil de Marca
```
GET    /api/brand/profile              - Buscar perfil ativo
POST   /api/brand/profile              - Criar novo perfil
PUT    /api/brand/profile/{id}         - Atualizar perfil
POST   /api/brand/profile/seed         - Criar perfil padrão
```

### IA (Lucresia)
```
POST   /api/ai/lucresia/stories        - Gerar sequência de stories
POST   /api/ai/lucresia/titulo         - Gerar títulos
POST   /api/ai/lucresia/copy           - Gerar copy completo
POST   /api/ai/lucresia/hashtags       - Gerar hashtags
```

### Imagens
```
POST   /api/images/search              - Buscar no Unsplash
GET    /api/images/popular             - Imagens populares
POST   /api/images/upload              - Upload próprio
```

### Templates e Projetos
```
GET    /api/templates                  - Listar templates
GET    /api/projects                   - Listar projetos
POST   /api/projects                   - Criar projeto
PUT    /api/projects/{id}              - Atualizar projeto
```

---

## 📊 ESTRUTURA DO PROJETO

```
Elevare-Neurovendas-main/
│
├── backend/                    # API FastAPI + MongoDB
│   ├── server.py              # Servidor principal
│   ├── requirements.txt       # Dependências Python
│   └── .env                   # Variáveis de ambiente
│
├── frontend/                   # React App
│   ├── src/
│   │   ├── App.js             # Componente principal
│   │   ├── index.js           # Entry point
│   │   └── index.css          # Estilos globais
│   ├── public/
│   ├── package.json           # Dependências Node
│   └── .env                   # Config do backend URL
│
├── BRAND_PROFILE_SYSTEM.md    # Documentação técnica
└── README.md                  # Este arquivo
```

---

## 🎓 EXEMPLO DE USO COMPLETO

```javascript
// 1. Carregar perfil da marca
const brandProfile = await api.getBrandProfile();
console.log(brandProfile.nome_marca); // "Elevare Estética"
console.log(brandProfile.tom_de_voz); // "autoridade"

// 2. Gerar stories com IA (usa perfil automaticamente)
const stories = await api.lucresiaStories(
  'Harmonização Facial',
  'Quebrar objeções sobre naturalidade',
  'mulheres 30-45 anos',
  5
);

// Resultado: 5 stories com tom de autoridade,
// linguagem da marca, sem palavras proibidas

// 3. Usar no editor
stories.forEach((story, idx) => {
  console.log(`Story ${idx + 1}:`, story.texto_principal);
  console.log(`Gatilho:`, story.gatilho_psicologico);
  console.log(`CTA:`, story.cta_discreto);
});
```

---

## ⚠️ NOTAS IMPORTANTES PARA BETA

### **O que funciona:**
- ✅ Sistema de perfil de marca completo
- ✅ Geração de conteúdo com IA personalizada
- ✅ Editor visual com templates
- ✅ Integração com Unsplash
- ✅ Upload de imagens
- ✅ Exportação de designs

### **Limitações conhecidas:**
- ⚠️ Edição do perfil de marca via UI (somente visualização)
- ⚠️ Export em múltiplos formatos (apenas PNG)
- ⚠️ Histórico de projetos salvos

### **Próximas versões:**
- 🔜 Edição completa de perfil pela interface
- 🔜 Templates personalizados por usuário
- 🔜 Calendário de conteúdo
- 🔜 Analytics de performance
- 🔜 Integração direta com redes sociais

---

## 🐛 TROUBLESHOOTING

### Backend não inicia
```bash
# Verificar MongoDB
mongod --version

# Verificar porta 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Verificar variáveis de ambiente
cat backend/.env
```

### Frontend não conecta ao backend
```bash
# Verificar REACT_APP_BACKEND_URL
cat frontend/.env

# Verificar CORS no backend
# server.py deve ter: allow_origins=['http://localhost:3000']
```

### IA não gera conteúdo
```bash
# Verificar chave da API
echo $EMERGENT_LLM_KEY

# Testar endpoint
curl -X POST http://localhost:8000/api/brand/profile/seed
```

---

## 📞 SUPORTE

- **Documentação Técnica:** `BRAND_PROFILE_SYSTEM.md`
- **API Docs:** `http://localhost:8000/docs` (quando servidor rodando)
- **Issues:** Reportar problemas no repositório

---

## 📝 LICENÇA

Este projeto está em fase BETA e é propriedade de Elevare NeuroVendas.

---

## 🎉 PRONTO PARA COMEÇAR!

1. Configure o backend e frontend
2. Inicialize o perfil de marca
3. Gere seu primeiro conteúdo com Lucresia
4. Crie designs incríveis no editor

**Bem-vindo à nova era da criação de conteúdo para estética! 🚀**
