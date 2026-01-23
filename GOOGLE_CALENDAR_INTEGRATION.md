# 📅 Google Calendar Integration - Implementação Completa

## ✅ Status: IMPLEMENTADO

Integração funcional do Google Calendar com o sistema de Blog está completa e pronta para uso.

---

## 📋 O que foi implementado

### 1. Backend - Configuração (google_calendar_config.py)
- ✅ Gerenciamento centralizado de credenciais OAuth 2.0
- ✅ Validação de configuração
- ✅ Geração de URLs de autenticação
- ✅ Suporte a timezone customizável

### 2. Backend - Manager (google_calendar_manager.py)
- ✅ Autenticação OAuth 2.0 completa
- ✅ Troca de código por tokens
- ✅ Criação de eventos no Google Calendar
- ✅ Atualização de eventos existentes
- ✅ Deleção de eventos
- ✅ Listagem de eventos
- ✅ Renovação de tokens expirados
- ✅ Tratamento de erros

### 3. Backend - Endpoints (server.py)
```
GET  /api/google-calendar/auth-url
POST /api/google-calendar/callback
POST /api/blog/posts/{post_id}/sync-google-calendar
POST /api/blog/posts/{post_id}/disconnect-google-calendar
GET  /api/google-calendar/events
```

### 4. Backend - Modelos
- ✅ User model com campos de Google Calendar
- ✅ BlogPost model com campos de sincronização
- ✅ Criptografia de tokens

### 5. Frontend - Componente React
- ✅ GoogleCalendarSync.js component
- ✅ Interface de conexão OAuth
- ✅ UI para sincronizar/desincronizar
- ✅ Status visual
- ✅ Tratamento de erros
- ✅ Feedback do usuário

### 6. Frontend - Recursos
- ✅ Autenticação OAuth 2.0 flow
- ✅ Callback handling
- ✅ Local storage para user ID
- ✅ Redirecionamento para Google Calendar
- ✅ Botões de ação
- ✅ Status badges

### 7. Documentação
- ✅ GOOGLE_CALENDAR_SETUP.md (guia completo)
- ✅ .env.example com todas as variáveis
- ✅ Endpoints documentados
- ✅ Modelos de dados
- ✅ Fluxo de autenticação
- ✅ Troubleshooting

### 8. Segurança
- ✅ Tokens criptografados com Fernet
- ✅ State token para CSRF protection
- ✅ OAuth 2.0 compliant
- ✅ Escopo mínimo solicitado
- ✅ Tokens de refresh

---

## 🚀 Como usar

### Setup Inicial

1. **Configurar Google Cloud Console**
   ```
   1. Criar projeto em https://console.cloud.google.com/
   2. Habilitar Google Calendar API
   3. Criar credenciais OAuth 2.0 (Aplicação Web)
   4. Adicionar URIs autorizados
   ```

2. **Configurar Variáveis de Ambiente**
   ```bash
   # backend/.env
   GOOGLE_CLIENT_ID=seu_client_id
   GOOGLE_CLIENT_SECRET=seu_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
   ENCRYPTION_KEY=sua_chave_criptografia
   ```

3. **Instalar Dependências**
   ```bash
   pip install -r requirements.txt
   ```

4. **Iniciar Backend**
   ```bash
   cd backend
   python -m uvicorn server:app --reload
   ```

### Usar no Frontend

1. **Importar componente**
   ```javascript
   import GoogleCalendarSync from './GoogleCalendarSync';
   ```

2. **Renderizar no App**
   ```javascript
   <GoogleCalendarSync 
     postId={currentPostId}
     onSyncSuccess={(data) => {
       // Fazer algo após sincronização
     }}
   />
   ```

3. **Fluxo de usuário**
   - Usuário clica em "Conectar Google Calendar"
   - Redireciona para Google Login
   - Google redireciona para callback
   - Sistema salva tokens (criptografados)
   - Usuário pode sincronizar posts

---

## 📊 Arquitetura

```
┌─────────────────────────────────────────────────────┐
│              Frontend (React)                        │
│  ┌────────────────────────────────────────────┐     │
│  │  GoogleCalendarSync.js                     │     │
│  │  - OAuth Flow                              │     │
│  │  - Sync/Unsync UI                          │     │
│  │  - Status Management                       │     │
│  └────────────────────────────────────────────┘     │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓ API Calls
┌─────────────────────────────────────────────────────┐
│           Backend (FastAPI)                         │
│  ┌────────────────────────────────────────────┐     │
│  │  Endpoints                                 │     │
│  │  - auth-url                                │     │
│  │  - callback                                │     │
│  │  - sync-google-calendar                    │     │
│  │  - disconnect-google-calendar              │     │
│  │  - events                                  │     │
│  └────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────┐     │
│  │  GoogleCalendarManager                     │     │
│  │  - OAuth Token Exchange                    │     │
│  │  - Event CRUD                              │     │
│  │  - Token Refresh                           │     │
│  └────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────┐     │
│  │  GoogleCalendarConfig                      │     │
│  │  - Credentials Management                  │     │
│  │  - Scope Configuration                     │     │
│  └────────────────────────────────────────────┘     │
└──────────────────┬──────────────────────────────────┘
                   │
                   ↓ Encrypted Tokens
┌─────────────────────────────────────────────────────┐
│              MongoDB                                │
│  ┌────────────────────────────────────────────┐     │
│  │  users collection                          │     │
│  │  - google_calendar_token (encrypted)       │     │
│  │  - google_calendar_refresh (encrypted)     │     │
│  │  - google_calendar_connected               │     │
│  └────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────┐     │
│  │  blog_posts collection                     │     │
│  │  - google_calendar_event_id                │     │
│  │  - google_calendar_synced                  │     │
│  │  - google_calendar_sync_date               │     │
│  └────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
                   │
                   ↓ API Calls
┌─────────────────────────────────────────────────────┐
│         Google Calendar API                         │
│  - Create Events                                    │
│  - Update Events                                    │
│  - Delete Events                                    │
│  - List Events                                      │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Segurança

### Criptografia de Tokens
```python
from cryptography.fernet import Fernet

# Gerar chave (uma única vez)
key = Fernet.generate_key()  # Salvar em .env

# Criptografar token
cipher = Fernet(key)
encrypted = cipher.encrypt(token.encode())

# Descriptografar token
decrypted = cipher.decrypt(encrypted).decode()
```

### OAuth 2.0 Flow
1. User autoriza acesso no Google
2. Google retorna código
3. Backend troca código por tokens
4. Tokens criptografados e salvos
5. Tokens usados apenas no backend

### CSRF Protection
- State token gerado para cada autenticação
- Validado durante callback
- Evita CSRF attacks

---

## 📚 Documentação Completa

Ver arquivo: `GOOGLE_CALENDAR_SETUP.md`

---

## 🧪 Testes Sugeridos

### 1. OAuth Flow
```bash
# 1. Acessar /api/google-calendar/auth-url
# 2. Clicar no link
# 3. Autorizar no Google
# 4. Verificar callback
```

### 2. Sincronização de Post
```bash
# 1. Criar post de blog
# 2. Conectar Google Calendar
# 3. Clicar em "Sincronizar ao Calendário"
# 4. Verificar evento no Google Calendar
```

### 3. Atualização de Post
```bash
# 1. Editar post sincronizado
# 2. Verificar se evento foi atualizado no Google
```

### 4. Deleção de Sincronização
```bash
# 1. Desincronizar post
# 2. Verificar se evento foi removido do Google Calendar
```

---

## 📈 Próximas Melhorias

- [ ] Webhook para atualizar posts quando evento é modificado
- [ ] Dashboard com próximos eventos
- [ ] Suporte a múltiplos calendários
- [ ] Sincronização bidirecional completa
- [ ] Notificações de eventos próximos
- [ ] Integração com ferramentas de automação
- [ ] Analytics de eventos criados

---

## 🆘 Troubleshooting

### Erro: "Google Calendar não configurado"
```
Solução: Verificar GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET em .env
```

### Erro: "Falha ao conectar"
```
Solução: 
1. Verificar URIs no Google Console
2. Confirmar que API está habilitada
3. Verificar .env variables
```

### Erro: "Tokens inválidos"
```
Solução:
1. Verificar ENCRYPTION_KEY em .env
2. Gerar nova chave se necessário
3. Limpar tokens antigos do banco
```

### Evento não criado
```
Solução:
1. Verificar permissões da API
2. Testar manualmente com Google Calendar API
3. Verificar logs do servidor
```

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consultar GOOGLE_CALENDAR_SETUP.md
2. Verificar logs do servidor
3. Testar endpoints com Postman/cURL
4. Revisar documentação do Google Calendar API

---

## 📝 Changelog

### v1.0 (Atual)
- ✅ Autenticação OAuth 2.0
- ✅ Sincronização de posts
- ✅ CRUD de eventos
- ✅ Criptografia de tokens
- ✅ Componente React
- ✅ Documentação completa

---

**Desenvolvido com ❤️ para Elevare NeuroVendas**
