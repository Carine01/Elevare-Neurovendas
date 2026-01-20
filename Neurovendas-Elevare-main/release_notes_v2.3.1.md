## v2.3.1 - Docs + Auth beta + Smoke tests

### 🎉 Novidades
- Endpoint `/api/auth/me`: rota protegida por JWT para retornar dados do usuário.
- Fluxo de autenticação beta em memória: helper `POST /api/auth/mock-create-beta` para dev local sem MongoDB.

### 🛠️ Ferramentas/Dev & Testes
- Scripts locais:
  - `backend/start_server.py` e `backend/run_server.bat` (HOST/PORT via env)
  - `backend/smoke_auth.py` e `backend/smoke_ebook.py` (saúde, auth e ebook V2)
  - `backend/tests/` com `conftest.py`, `test_local_auth.py`, `test_local_ebook.py`
- Mocks de integrações:
  - `backend/emergentintegrations/` (módulo local) e `emergentintegrations_mock.py`

### 📚 Documentação
- `.github/copilot-instructions.md`: Quickstart do agente, mapa de endpoints, limites/créditos, retries e créditos.
- `DOCUMENTACAO_API.md`: Fluxos, smoke tests, troubleshooting e payloads JSON.

### ⚠️ Notas
- `emergentintegrations` é local (não precisa PyPI).
- Em Windows/PowerShell, se ver erro PSReadLine, use `-NoProfile` ou `cmd.exe`.
## v2.3.1 - Docs + Auth beta + Smoke tests

### 🎉 Novidades
- Endpoint /api/auth/me: rota protegida por JWT para retornar dados do usuário.
- Fluxo de autenticação beta em memória: helper POST /api/auth/mock-create-beta para dev local sem MongoDB.

### 🛠️ Ferramentas/Dev & Testes
- Scripts locais:
  - ackend/start_server.py e ackend/run_server.bat (HOST/PORT via env)
  - ackend/smoke_auth.py e ackend/smoke_ebook.py (saúde, auth e ebook V2)
  - ackend/tests/ com conftest.py, 	est_local_auth.py, 	est_local_ebook.py
- Mocks de integrações:
  - ackend/emergentintegrations/ (módulo local) e emergentintegrations_mock.py

### 📚 Documentação
- .github/copilot-instructions.md: Quickstart do agente, mapa de endpoints, limites/créditos, retries e créditos.
- DOCUMENTACAO_API.md: Fluxos, smoke tests, troubleshooting e payloads JSON.

### ⚠️ Notas
- emergentintegrations é local (não precisa PyPI).
- Em Windows/PowerShell, se ver erro PSReadLine, use -NoProfile ou cmd.exe.
