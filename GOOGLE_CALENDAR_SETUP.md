# 📅 Google Calendar Integration Setup

## Visão Geral

Integração completa entre o sistema de Blog e Google Calendar, permitindo sincronizar posts de blog como eventos no calendário do usuário.

## Recursos

- ✅ Autenticação OAuth 2.0 com Google
- ✅ Sincronizar posts de blog como eventos
- ✅ Atualizar eventos quando posts são editados
- ✅ Deletar eventos quando posts são removidos
- ✅ Listar eventos sincronizados
- ✅ Tokens criptografados no banco de dados
- ✅ Suporte a timezone customizável

## Pré-requisitos

1. **Google Cloud Project**
   - Acesso ao [Google Cloud Console](https://console.cloud.google.com/)
   - Habilitar Google Calendar API
   - Criar credenciais OAuth 2.0

2. **Chave de Criptografia**
   - Gerar com Fernet para segurança dos tokens

3. **Dependências Python**
   ```bash
   pip install google-auth-oauthlib google-api-python-client google-auth-httplib2 cryptography
   ```

## Setup Passo a Passo

### 1. Configurar Google Cloud Console

#### a) Criar Projeto
```
1. Ir para Google Cloud Console: https://console.cloud.google.com/
2. Criar novo projeto: "Elevare NeuroVendas"
3. Aguardar criação do projeto
```

#### b) Habilitar Google Calendar API
```
1. No console, ir para "APIs e Serviços"
2. Clicar "Ativar APIs e Serviços"
3. Buscar "Google Calendar API"
4. Clicar "Ativar"
5. Clicar em "Credenciais"
```

#### c) Criar Credenciais OAuth 2.0
```
1. Ir para "Credenciais"
2. Clicar "Criar Credenciais" → "ID do Cliente OAuth"
3. Selecionar "Aplicativo Web"
4. Adicionar URIs autorizados:
   - Origem autorizada: http://localhost:3000
   - URI de redirecionamento autorizados:
     - http://localhost:3000/auth/google/callback
     - http://localhost:3001/auth/google/callback (se usando outro port)
5. Copiar Client ID e Client Secret
```

### 2. Configurar Variáveis de Ambiente

#### a) Criar arquivo `.env` no diretório backend
```bash
# Copiar do .env.example
cp .env.example .env
```

#### b) Preencher variáveis de Google Calendar
```bash
# .env
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Gerar chave de criptografia
# No terminal Python:
from cryptography.fernet import Fernet
print(Fernet.generate_key().decode())

# Copiar saída e adicionar ao .env:
ENCRYPTION_KEY=sua_chave_aqui
```

### 3. Preparar Cliente Secrets (Alternativa)

Se preferir usar arquivo `client_secrets.json`:

```bash
# Baixar JSON do Google Console e salvar em backend/
# Renomear para client_secrets.json (se necessário)
```

### 4. Instalar Dependências

```bash
pip install -r requirements.txt
```

## Endpoints Disponíveis

### 1. Obter URL de Autenticação
```
GET /api/google-calendar/auth-url

Response:
{
  "success": true,
  "auth_url": "https://accounts.google.com/o/oauth2/v2/auth?...",
  "state": "uuid-state-value"
}
```

### 2. Processar Callback OAuth
```
POST /api/google-calendar/callback

Body:
{
  "code": "codigo-do-google",
  "state": "uuid-state-value",
  "user_id": "id-do-usuario"
}

Response:
{
  "success": true,
  "message": "Google Calendar conectado com sucesso",
  "google_calendar_email": "usuario@gmail.com",
  "expires_in": 3600
}
```

### 3. Sincronizar Post ao Google Calendar
```
POST /api/blog/posts/{post_id}/sync-google-calendar

Body:
{
  "user_id": "id-do-usuario"
}

Response:
{
  "success": true,
  "message": "Post sincronizado com Google Calendar",
  "event_id": "google-event-id",
  "calendar_url": "https://calendar.google.com/calendar/u/0/r/eventedit/event-id"
}
```

### 4. Desconectar Post do Google Calendar
```
POST /api/blog/posts/{post_id}/disconnect-google-calendar

Body:
{
  "user_id": "id-do-usuario"
}

Response:
{
  "success": true,
  "message": "Sincronização com Google Calendar removida"
}
```

### 5. Listar Eventos Sincronizados
```
GET /api/google-calendar/events?user_id=id-do-usuario

Response:
{
  "success": true,
  "events": [
    {
      "id": "google-event-id",
      "summary": "Titulo do Post",
      "description": "Introdução do post",
      "start": {"dateTime": "2026-02-15T14:00:00Z"},
      "end": {"dateTime": "2026-02-15T15:00:00Z"}
    }
  ],
  "total": 5
}
```

## Modelo de Dados

### User (novo)
```python
{
  "id": "uuid",
  "email": "usuario@email.com",
  "nome": "Nome do Usuário",
  "google_calendar_connected": true,
  "google_calendar_token": "encrypted_access_token",
  "google_calendar_refresh": "encrypted_refresh_token",
  "google_calendar_expiry": "2026-02-20T10:00:00Z",
  "google_calendar_email": "usuario@gmail.com",
  "timezone": "America/Sao_Paulo",
  "created_at": "2026-02-15T10:00:00Z",
  "updated_at": "2026-02-15T10:00:00Z"
}
```

### BlogPost (campos adicionados)
```python
{
  # ... campos existentes
  "google_calendar_event_id": "google-event-id",
  "google_calendar_synced": true,
  "google_calendar_sync_date": "2026-02-15T10:00:00Z",
  "google_calendar_calendar_url": "https://calendar.google.com/..."
}
```

## Fluxo de Autenticação (Frontend)

### 1. User clica em "Conectar Google Calendar"

```javascript
// Obter URL de autenticação
const response = await fetch('/api/google-calendar/auth-url');
const data = await response.json();
// Redirecionar para auth_url
window.location.href = data.auth_url;
```

### 2. Google redireciona para callback

```javascript
// URL: http://localhost:3000/auth/google/callback?code=...&state=...
const params = new URLSearchParams(window.location.search);
const code = params.get('code');
const state = params.get('state');

// Enviar para backend
await fetch('/api/google-calendar/callback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ code, state, user_id: currentUserId })
});
```

### 3. Sincronizar post após conexão

```javascript
// User clica em "Sincronizar ao Google Calendar"
await fetch(`/api/blog/posts/${postId}/sync-google-calendar`, {
  method: 'POST',
  body: JSON.stringify({ user_id: currentUserId })
});
```

## Segurança

### ✅ Tokens Criptografados
- Tokens de acesso e refresh são criptografados com Fernet
- Armazenados de forma segura no MongoDB

### ✅ State Token para CSRF
- Cada autenticação gera um state único
- Validado durante callback

### ✅ Timezone Seguro
- America/Sao_Paulo padrão (configurável)
- Timestamps em UTC no banco

### ✅ Escopo Mínimo
- Apenas permissões necessárias solicitadas
- `calendar` e `calendar.events` scopes

## Troubleshooting

### Erro: "Google Calendar não configurado"
```
Verifique se GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET estão em .env
Restart backend server
```

### Erro: "Tokens inválidos"
```
Verifique ENCRYPTION_KEY em .env
Gere nova chave se necessário
```

### Erro: "Falha na autenticação OAuth"
```
1. Verifique URIs no Google Console
2. Confirme GOOGLE_REDIRECT_URI em .env
3. Verifique se Google Calendar API está habilitada
```

### Erro: "Evento não criado"
```
1. Verifique se usuário tem calendário primary
2. Verifique permissões no Google Console
3. Verifique logs do servidor
```

## Próximos Passos

- [ ] Frontend component para conexão Google Calendar
- [ ] UI para sincronizar/desincronizar posts
- [ ] Dashboard com eventos sincronizados
- [ ] Webhook para atualizar posts quando evento é modificado
- [ ] Suporte a múltiplos calendários
- [ ] Sincronização bidirecional

## Referências

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [google-auth-oauthlib Documentation](https://github.com/googleapis/google-auth-library-python-oauthlib)
