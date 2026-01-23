# 🎉 Google Calendar Integration - Guia Rápido

## O que foi feito?

Integração **completa e funcional** do Google Calendar com o sistema de Blog da Elevare NeuroVendas.

### ✅ Implementado

1. **Backend (Python/FastAPI)**
   - ✅ OAuth 2.0 completo
   - ✅ CRUD de eventos
   - ✅ 5 novos endpoints
   - ✅ Criptografia de tokens
   - ✅ Modelos atualizados

2. **Frontend (React)**
   - ✅ Componente GoogleCalendarSync.js
   - ✅ Interface de autenticação
   - ✅ Sincronizar/Desincronizar posts
   - ✅ Status visual

3. **Segurança**
   - ✅ Tokens criptografados (Fernet)
   - ✅ CSRF protection
   - ✅ OAuth 2.0 compliant

4. **Documentação**
   - ✅ GOOGLE_CALENDAR_SETUP.md (setup completo)
   - ✅ GOOGLE_CALENDAR_INTEGRATION.md (resumo)
   - ✅ .env.example (variáveis necessárias)

---

## 🚀 Como Começar (3 passos)

### 1️⃣ Configure Google Cloud

```bash
# Acesse: https://console.cloud.google.com/
# 1. Criar novo projeto
# 2. Ir para APIs e Serviços
# 3. Ativar Google Calendar API
# 4. Criar Credenciais OAuth 2.0 (Aplicação Web)
# 5. Adicionar URIs autorizadas
# 6. Copiar Client ID e Client Secret
```

### 2️⃣ Configure Variáveis de Ambiente

```bash
# Abrir: backend/.env

# Copiar essas linhas:
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Gerar encryption key (em Python):
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Adicionar ao .env:
ENCRYPTION_KEY=sua_chave_aqui
```

### 3️⃣ Instale e Rode

```bash
# Terminal 1 - Backend
cd backend
pip install -r requirements.txt
python -m uvicorn server:app --reload

# Terminal 2 - Frontend
cd frontend
npm start

# Acessar: http://localhost:3000
```

---

## 📖 Documentação

- **GOOGLE_CALENDAR_SETUP.md** - Guia completo com screenshots
- **GOOGLE_CALENDAR_INTEGRATION.md** - Resumo técnico
- **backend/.env.example** - Variáveis necessárias

---

## 🎯 Recursos

### Para Usuários
- 🔐 Conectar Google Calendar com 1 clique
- 📅 Sincronizar posts como eventos
- 🔄 Atualizar automaticamente quando post muda
- ❌ Remover evento quando post é deletado

### Para Desenvolvedores
- 📡 5 novos endpoints REST
- 🔒 Tokens criptografados no MongoDB
- 🏗️ Arquitetura modular
- 📚 Código bem documentado

---

## 🔗 Arquivos Novos/Modificados

**Backend:**
- ✨ `backend/google_calendar_config.py` (novo)
- ✨ `backend/google_calendar_manager.py` (novo)
- 📝 `backend/server.py` (adicionados 5 endpoints + modelos)
- 📝 `backend/requirements.txt` (adicionada dependência)

**Frontend:**
- ✨ `frontend/src/GoogleCalendarSync.js` (novo)

**Documentação:**
- 📖 `GOOGLE_CALENDAR_SETUP.md` (novo)
- 📖 `GOOGLE_CALENDAR_INTEGRATION.md` (novo)
- 📝 `backend/.env.example` (atualizado)

---

## ⚙️ Endpoints

| Método | URL | Descrição |
|--------|-----|-----------|
| GET | `/api/google-calendar/auth-url` | Obter URL de autenticação |
| POST | `/api/google-calendar/callback` | Processar callback OAuth |
| POST | `/api/blog/posts/{post_id}/sync-google-calendar` | Sincronizar post |
| POST | `/api/blog/posts/{post_id}/disconnect-google-calendar` | Desincronizar post |
| GET | `/api/google-calendar/events` | Listar eventos |

---

## 🧪 Testar Agora

```bash
# 1. Iniciar backend
cd backend && python -m uvicorn server:app --reload

# 2. Em outro terminal, testar
curl http://localhost:8000/api/google-calendar/auth-url

# 3. Ou acessar frontend
cd frontend && npm start
# Ir para http://localhost:3000
```

---

## 🆘 Problemas Comuns

### ❌ "Google Calendar não configurado"
```
✅ Verifique GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET em .env
✅ Restart do servidor backend
```

### ❌ "Erro ao conectar"
```
✅ Verifique URIs no Google Console
✅ Confirme que Google Calendar API está ativada
✅ Verifique .env variables
```

### ❌ "Tokens inválidos"
```
✅ Gere nova ENCRYPTION_KEY
✅ Limpe dados antigos do banco
```

---

## 📚 Estrutura do Projeto

```
Elevare-Neurovendas/
├── backend/
│   ├── google_calendar_config.py      ← Configuração
│   ├── google_calendar_manager.py     ← Lógica OAuth + API
│   ├── server.py                      ← 5 novos endpoints
│   ├── requirements.txt               ← Dependências
│   └── .env.example                   ← Variáveis
├── frontend/
│   └── src/
│       └── GoogleCalendarSync.js      ← Componente React
├── GOOGLE_CALENDAR_SETUP.md           ← Guia detalhado
├── GOOGLE_CALENDAR_INTEGRATION.md     ← Resumo técnico
└── README.md (este arquivo)
```

---

## 🎓 Como Usar no App

```javascript
// App.js
import GoogleCalendarSync from './GoogleCalendarSync';

function BlogPostEditor() {
  return (
    <div>
      {/* Seu editor de blog */}
      
      {/* Adicione o componente */}
      <GoogleCalendarSync 
        postId={currentPostId}
        onSyncSuccess={(data) => {
          console.log('Post sincronizado!', data);
        }}
      />
    </div>
  );
}
```

---

## 🔒 Segurança

- ✅ OAuth 2.0 (não salvamos senha)
- ✅ Tokens criptografados com Fernet
- ✅ CSRF protection com state token
- ✅ Refresh token para renovação automática

---

## 📈 Próximas Melhorias

- [ ] Dashboard com próximos eventos
- [ ] Notificações de eventos
- [ ] Suporte a múltiplos calendários
- [ ] Sincronização bidirecional
- [ ] Webhooks do Google
- [ ] Analytics

---

## 💡 Dicas

1. **Teste primeiro em ambiente local**
2. **Use .env para credenciais (nunca commit!)**
3. **Consulte GOOGLE_CALENDAR_SETUP.md para troubleshooting**
4. **Os componentes estão prontos para produção**

---

## 📞 Suporte

Encontrou um problema?
1. Consulte `GOOGLE_CALENDAR_SETUP.md`
2. Verifique logs do servidor
3. Teste com Postman/cURL
4. Revise documentação do Google Calendar API

---

**✨ Integração pronta para usar! Boa sorte! 🚀**
