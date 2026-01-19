# NeuroVendas by Elevare - AI Coding Guide

## Architecture Overview

**Full-stack AI-powered SaaS for aesthetic professionals** with FastAPI backend + React/TypeScript frontend.

- **Backend**: Monolithic `server.py` (7257 lines) being refactored → modular routers architecture
- **Frontend**: Vite + React 18 + TypeScript + TailwindCSS + shadcn/ui components
- **Database**: MongoDB (Motor async driver) - collection naming: `users`, `ebooks`, `leads`, `campaigns`, etc.
- **AI Core**: Multi-provider LLM integration via `emergentintegrations` package (Gemini, GPT-4o)
- **Authentication**: JWT (7-day tokens), bcrypt password hashing
- **Payments**: Stripe integration via `emergentintegrations.payments.stripe`

## Critical Environment Variables

```bash
# Backend (.env)
MONGO_URL="mongodb://localhost:27017"
DB_NAME="elevare_db"
JWT_SECRET="your-secret-key"
EMERGENT_LLM_KEY="..." # Primary AI provider
OPENAI_API_KEY="..."    # Fallback AI provider
STRIPE_API_KEY="..."
RESEND_API_KEY="..."    # Email service

# Frontend (.env)
VITE_BACKEND_URL="https://api.neurovendas.com"
```

## Development Workflow

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python server.py  # Runs on port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev  # Runs on port 3000 (Vite)
```

### Testing
```bash
# Backend tests
pytest backend/tests/test_neurovendas_features.py

# Frontend - no test suite currently configured
```

## Code Patterns & Conventions

### Backend Patterns

**1. Router Structure (New Modular Approach)**
```python
# backend/routers/ai.py example
from fastapi import APIRouter, Depends
from routers.auth import get_current_user  # Shared auth dependency
from utils.ai_retry import ai_call_with_retry  # Resilient AI calls
from utils.plan_limits import check_and_raise_limit  # Credit system

router = APIRouter(prefix="/api/ai", tags=["ai"])

@router.post("/generate-content")
async def generate_content(
    request: ContentGenerationRequest,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    check_and_raise_limit(current_user, "ai_generation")
    # Implementation with retry logic
```

**2. AI Service Pattern (LucresIA)**
```python
# All AI calls use emergentintegrations.llm.chat
from emergentintegrations.llm.chat import LlmChat, UserMessage

llm = LlmChat(model="gemini/gemini-2.0-flash-exp")
response = await llm.chat_async([
    UserMessage(content=prompt)
])
```

**3. Database Operations**
```python
# Always use async Motor operations
user = await db.users.find_one({"email": email})
await db.ebooks.insert_one(ebook_doc)
```

**4. Credits System**
```python
# backend/utils/plan_limits.py
COST_MAP = {
    "ai_generation": 5,
    "ebook_generation": 100,
    "carousel": 20
}
# Check before operation: check_and_raise_limit(user, operation_key)
```

### Frontend Patterns

**1. API Layer**
```typescript
// src/lib/api.ts - centralized axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 300000  // 5 min for AI operations
});

// Auto-attaches JWT from localStorage
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

**2. Auth Context Pattern**
```typescript
// src/hooks/useAuth.tsx
const { user, loading } = useAuth();
// Provides: user, login, logout, loading state
// Used in: ProtectedRoute wrapper
```

**3. Component Structure**
```
src/pages/          # Full pages (Dashboard.tsx, EbooksPage.tsx)
src/components/     # Reusable UI (dashboard/, ebook/, landing/, ui/)
src/components/ui/  # shadcn/ui primitives (button, dialog, etc.)
```

**4. Routing Pattern**
```typescript
// src/App.tsx - two route groups:
// 1. Public: /login, /register, /landing, /hub
// 2. Protected: /dashboard/* wrapped in <ProtectedRoute>
```

## Key Service Integrations

**1. E-book Generator V2** (Internal PDF system)
- Path: `backend/services/ebook_generator_v2.py`
- Uses: GPT-4o + fpdf2 (NO external Gamma API)
- Entry: `POST /api/ebooks/generate-v2`

**2. LucresIA AI System**
- Path: `backend/services/lucresia.py`
- Strategic prompt library: `backend/services/biblioteca_prompts.py`
- 7+ prompt categories: authority, sales, education, social proof

**3. Gamma Service (DEPRECATED)**
- Path: `backend/services/gamma_service.py`
- Status: Maintained for compatibility, prefer V2 generator

**4. Multi-platform Content**
- `carousel_generator.py` - Instagram carousels
- `seo_blog_generator.py` - SEO-optimized articles
- `content_verifier.py` - Content validation

## Refactoring Roadmap (In Progress)

See `PLANO_REFACTORING_BACKEND.md` for full plan. Key transitions:

1. **Current State**: Monolithic `server.py` (7257 lines)
2. **Target State**: 
   - `backend/core/` - Config, DB, security
   - `backend/routers/` - Modular endpoints (ai.py, auth.py, ebooks.py, etc.)
   - `backend/services/` - Business logic layers
   - `backend/models/` - Pydantic schemas

**When adding routes**: Use new modular routers, NOT `server.py` directly.

## Common Tasks

**Add new AI endpoint:**
1. Create route in `backend/routers/ai.py`
2. Use `ai_call_with_retry()` for resilience
3. Check credits: `check_and_raise_limit(user, "operation_key")`
4. Add to frontend `src/lib/api.ts`

**Add frontend page:**
1. Create in `src/pages/PageName.tsx`
2. Add route in `src/App.tsx` (public or protected)
3. Import reusable components from `src/components/`

**Database schema change:**
1. Update Pydantic models in `backend/routers/` or `backend/schemas/`
2. No migrations needed (MongoDB schema-less)

**Add prompt template:**
1. Add to `backend/services/biblioteca_prompts.py` → `PROMPTS_ESTRATEGICOS`
2. Reference in LucresIA calls

## Deployment (Emergent Platform)

### Required Environment Variables at Deploy Time
```bash
# Core services (must be set)
MONGO_URL="mongodb://..."
JWT_SECRET="crypto-random-secret"
EMERGENT_LLM_KEY="..."  # Primary AI provider
STRIPE_API_KEY="..."
RESEND_API_KEY="..."

# Optional fallbacks
OPENAI_API_KEY="..."    # Used if EMERGENT_LLM_KEY fails
```

### Runtime Constraints
- **Cold start latency**: First request after deploy may take 15-30s (motor.motor_asyncio connection pooling)
- **Long-running requests**: AI generation endpoints may take 60-180s - ensure platform timeout ≥ 300s
- **Memory usage**: Peak ~512MB during concurrent AI calls - recommend 1GB minimum allocation
- **Database connections**: Motor maintains connection pool - set `maxPoolSize=50` for production load

### Known Emergent-Specific Behaviors
- Health check endpoint (`/api/health`) must respond in <5s or platform marks as unhealthy
- Websocket support not available - long operations use polling via `/api/status/{job_id}`
- Static file serving handled by platform CDN - frontend build outputs to `/frontend/dist`

---

## Testing Strategy

### Current Test Coverage
Minimal baseline established in `backend/tests/test_neurovendas_features.py` - functional tests against live API.

### Testing Priorities (Start Here)
1. **Router-level tests first** - validate auth, credits, AI endpoints in isolation
2. **Mock `emergentintegrations`** - avoid real LLM calls in tests:
   ```python
   from unittest.mock import AsyncMock, patch
   
   @patch('emergentintegrations.llm.chat.LlmChat.chat_async')
   async def test_content_generation(mock_chat):
       mock_chat.return_value = AsyncMock(content="Mock response")
       # Test logic...
   ```
3. **Credit consumption verification** - ensure `check_and_raise_limit()` correctly enforces plan boundaries
4. **Baseline health checks** - validate DB connectivity, JWT token generation, auth flow

### Not Currently Tested
- Frontend UI (no Jest/Vitest setup)
- PDF generation output validation
- Stripe webhook handling (requires test mode webhooks)

Use `pytest backend/tests/ -v` to run existing tests.

---

## Frontend State Management

### Multi-Step Wizard Pattern (E-book Generator)
The 5-step e-book wizard (`src/components/ebook/*`) demonstrates the canonical pattern for complex form flows:

**Single Source of Truth**
```typescript
// Centralized state in parent component (EbooksPage)
const [formData, setFormData] = useState<EbookFormData>({
  step0: { objetivo: "", publico: "", ... },
  step1: { nome_profissional: "", tema_principal: "", ... },
  // ... other steps
});
const [currentStep, setCurrentStep] = useState(0);
```

**Step Navigation with Validation**
```typescript
const canProceed = () => {
  if (currentStep === 0) return formData.step0.objetivo && formData.step0.publico;
  if (currentStep === 1) return formData.step1.nome_profissional && formData.step1.tema_principal;
  // ... per-step requirements
};

const nextStep = () => {
  if (canProceed()) setCurrentStep(prev => prev + 1);
};
```

**Recovery/Reset Rules**
- **On failure mid-generation**: Preserve formData, allow user to retry from current step (don't reset)
- **On success**: Reset only after user confirms "Create New" action
- **On navigation away**: Warn if `currentStep > 0` and formData contains unsaved changes

**Handling Long Async Steps**
```typescript
const [isGenerating, setIsGenerating] = useState(false);

const handleGenerate = async () => {
  setIsGenerating(true);
  try {
    const response = await api.post('/api/ebooks/generate-v2', formData);
    // Show success, don't block UI
  } catch (error) {
    // Show error, preserve state for retry
  } finally {
    setIsGenerating(false);
  }
};
```

Key insight: Disable navigation during `isGenerating`, but allow cancellation via abort controller.

---

## Error Handling & Retry Logic

### Backend Retry Strategy (`utils/ai_retry.py`)

**Retryable Failures**
- Timeout errors (`asyncio.TimeoutError`)
- Rate limit errors (HTTP 429)
- Transient LLM failures (5xx responses from AI provider)

**Terminal Failures (No Retry)**
- Authentication errors (invalid API key)
- Validation errors (malformed prompts)
- Credit limit exceeded (`LimitExceededError`)

**Exponential Backoff Configuration**
```python
await ai_call_with_retry(
    func=llm.chat_async,
    timeout=60,           # Per-attempt timeout
    max_retries=3,        # Total attempts
    retry_delay=2,        # Initial delay
    backoff_multiplier=2  # 2s → 4s → 8s
)
```

### Frontend Error Recovery

**User-Triggered Retry Pattern**
```typescript
// After AI call failure
catch (error) {
  if (error.response?.status === 429) {
    toast.error('Rate limit - try again in 60s');
    // Don't auto-retry, let user decide
  } else if (error.code === 'ECONNABORTED') {
    toast.error('Timeout - click Retry to continue');
    // Preserve form state for manual retry
  } else {
    toast.error(error.response?.data?.detail || 'Unknown error');
  }
}
```

**State Rollback Rules**
- **Ebook generation failure**: Don't decrement credits (backend handles atomicity)
- **Payment failure**: Redirect to `/plans` with error context preserved in URL params
- **Auth token expired**: Trigger logout + redirect, clear localStorage, reset app state

**No Auto-Retry in Frontend**: Long AI operations (60-180s) should not auto-retry on timeout - inform user and require explicit retry click to prevent duplicate operations.

---

## Testing & Debugging

- **Backend health**: `GET /api/health/detailed` - checks DB, AI, Stripe
- **Frontend auth issues**: Check browser localStorage for `token`
- **AI timeout**: Increase `AI_TIMEOUT` in `backend/routers/ai.py`
- **Credits debugging**: Check `user.credits_remaining` and `COST_MAP`

## Security Notes

- JWT tokens expire after 7 days (`ACCESS_TOKEN_EXPIRE_DAYS`)
- CORS currently set to `allow_origins=["*"]` - restrict in production
- Passwords use bcrypt with 12 rounds
- API keys from env vars - never commit `.env` files

---

## Branching Strategy

### Core Principle
**Trade-off decision**: Speed vs. safety. AI-first products need fast iteration + production stability.

### Branch Model (Simplified Trunk-Based)

```
main (production)
  ↓
feature/* (short-lived, < 3 days)
hotfix/* (urgent production fixes)
```

No `develop` branch. No long-running feature branches. No GitFlow ceremony.

---

### Rule 1: When to Commit Directly to `main`

**Safe scenarios** (no branch needed):
- Documentation updates (`README.md`, `copilot-instructions.md`)
- Configuration tweaks (env var names, timeout values)
- Hotfixes < 5 lines of code
- Dependency version bumps (security patches)

**Requirements**:
- ✅ Tested locally
- ✅ No breaking changes
- ✅ Clear commit message (follows guidelines)

**Example**:
```bash
git add copilot-instructions.md
git commit -m "Adiciona seção de branching strategy ao guia técnico"
git push origin main
```

---

### Rule 2: When to Create Feature Branch

**Required scenarios** (branch needed):
- New API endpoints or routes
- UI component refactors
- Database schema changes
- AI prompt library additions
- Multi-file changes spanning > 2 modules

**Branch naming**:
```
feature/ebook-copy-divulgacao
feature/aperfeicoar-capitulo-modal
hotfix/pdf-encoding-unicode
refactor/monolithic-server-routers
```

**Pattern**: `<type>/<slug-description>`

**Lifecycle**:
```bash
# Create and switch
git checkout -b feature/ebook-biblioteca-assuntos

# Work + commit (use commit guidelines)
git add src/components/ebook/BibliotecaAssuntos.tsx
git commit -m "Adiciona biblioteca de 18 assuntos categorizada para ebooks"

# Push to remote
git push origin feature/ebook-biblioteca-assuntos

# After merge: delete immediately
git branch -d feature/ebook-biblioteca-assuntos
git push origin --delete feature/ebook-biblioteca-assuntos
```

---

### Rule 3: Branch Lifespan Limits

| Branch Type | Max Duration | Reason |
|-------------|--------------|--------|
| `feature/*` | **3 days** | Avoid merge conflicts + integration debt |
| `hotfix/*` | **4 hours** | Production is broken, speed matters |
| `refactor/*` | **5 days** | High risk, needs careful testing |

**If branch exceeds limit**: Break into smaller features or merge partial work.

---

### Rule 4: Integration Pattern

**Small features** (< 100 lines changed):
```bash
# Direct merge to main (no PR)
git checkout main
git merge feature/small-fix
git push origin main
```

**Medium/Large features** (> 100 lines or cross-cutting):
```bash
# Open PR for review (even if self-review)
# Merge via GitHub/GitLab UI
# Squash commits if > 5 commits on branch
```

**Why PR for large changes**: Creates audit trail + forces second look.

---

### Rule 5: Hotfix Protocol

**When production breaks**:
```bash
# Create from main
git checkout main
git pull
git checkout -b hotfix/pdf-generation-crash

# Fix + test
# ... code changes ...

# Commit with urgency marker
git commit -m "🔥 Corrige crash em geração de PDF: valida encoding antes de fpdf2"

# Deploy immediately
git checkout main
git merge hotfix/pdf-generation-crash
git push origin main

# Delete branch
git branch -d hotfix/pdf-generation-crash
```

**Hotfix commit emoji**: `🔥` signals production urgency in history.

---

### Rule 6: When to Rebase vs. Merge

**Rebase** (clean history):
- Feature branch behind main by < 10 commits
- No one else working on same branch
- Before opening PR

```bash
git checkout feature/my-feature
git rebase main
git push --force-with-lease origin feature/my-feature
```

**Merge** (preserve context):
- Shared branch with multiple devs
- Already opened PR with comments
- Hotfix (speed > cleanliness)

```bash
git checkout feature/my-feature
git merge main
git push origin feature/my-feature
```

**Default stance**: Prefer rebase for solo work, merge for collaboration.

---

### Rule 7: Protection Rules for `main`

**Minimum safeguards** (configure in GitHub/GitLab):
- ✅ Require passing CI before merge (if CI exists)
- ✅ Require 1 approval for changes > 500 lines
- ❌ Don't block direct commits for small changes (avoid bureaucracy)

**Rationale**: AI-first products need velocity. Over-protection kills iteration speed.

---

### Anti-Patterns (Avoid)

❌ **Long-running branches** (> 1 week) → merge hell  
❌ **Generic branch names** (`fix`, `update`, `test`) → no context  
❌ **Keeping merged branches** → clutter  
❌ **Working directly on `main` for large features** → rollback nightmare  
❌ **Creating branches for typo fixes** → overhead  

---

### Decision Tree (Quick Reference)

```
Is it a hotfix?
  ├─ Yes → hotfix/* branch, merge in < 4h
  └─ No → Is it > 100 lines or touches > 2 modules?
      ├─ Yes → feature/* branch, PR review
      └─ No → Is it breaking or risky?
          ├─ Yes → feature/* branch, test thoroughly
          └─ No → Commit directly to main
```

---

## PR Review Checklist

### Purpose
PRs exist to catch **architectural drift** before it reaches `main`. Not bureaucracy — risk mitigation.

### When to Skip PR
- Changes < 100 lines
- Single-file documentation updates
- Hotfixes already tested locally
- Configuration tweaks with zero logic

**Rule**: If decision tree says "commit directly", skip PR.

---

### Pre-Merge Validation (Technical)

#### 1. **Code Follows Commit Guidelines**
- [ ] Commit message matches one of the documented patterns
- [ ] No generic messages (`fix`, `update`, `changes`)
- [ ] One commit = one architectural decision

**Why**: Git history = architectural documentation.

---

#### 2. **Type Safety Enforced**
- [ ] No `@ts-nocheck` or `@ts-ignore` added
- [ ] No `any` types unless justified in PR description
- [ ] Pydantic/Zod schemas for API contracts

**Why**: Type errors in production = user-facing bugs.

---

#### 3. **Error Handling Present**
- [ ] API calls wrapped in try/catch
- [ ] User-facing error messages (not raw error objects)
- [ ] Retry mechanism for transient failures (AI, network)

**Why**: Silent failures = abandonment.

---

#### 4. **Environment Variables Used**
- [ ] No hardcoded URLs, API keys, or model names
- [ ] New secrets added to `.env.example`
- [ ] Config centralized in `config.py` (backend) or `api.ts` (frontend)

**Why**: Security + deployment flexibility.

---

#### 5. **Credits System Respected** (if applicable)
- [ ] New operations check `check_and_raise_limit()`
- [ ] Cost added to `COST_MAP` in `plan_limits.py`
- [ ] Credit refund on failure (atomic operations)

**Why**: Business model integrity.

---

#### 6. **UI State Management**
- [ ] Loading states visible to user
- [ ] Error states with retry option
- [ ] No infinite spinners (timeout + fallback)

**Why**: User needs control.

---

#### 7. **Tests Updated** (if test coverage exists)
- [ ] Router-level tests for new endpoints
- [ ] Mock `emergentintegrations` to avoid real AI calls
- [ ] Health check still passes

**Why**: Regression prevention.

---

### Pre-Merge Validation (Non-Functional)

#### 8. **Performance Not Degraded**
- [ ] No N+1 queries introduced
- [ ] AI timeout still ≤ 300s
- [ ] Frontend bundle size not increased > 10%

**Why**: User experience = perception of speed.

---

#### 9. **Security Checklist**
- [ ] User input sanitized before DB/AI
- [ ] JWT validation on protected routes
- [ ] No secrets in Git diff

**Why**: Production breach = existential risk.

---

#### 10. **Documentation Updated**
- [ ] New endpoints added to `DOCUMENTACAO_API.md`
- [ ] Breaking changes noted in PR description
- [ ] `copilot-instructions.md` updated if architectural change

**Why**: Future contributors (human or AI) need context.

---

### PR Size Guidelines

| Lines Changed | Review Time | Approval Requirement |
|---------------|-------------|----------------------|
| < 100 | Self-review OK | Optional |
| 100-500 | ~15 min review | 1 approval |
| 500-1000 | ~30 min review | 1 approval + discussion |
| > 1000 | Split into smaller PRs | Block until refactored |

**Rationale**: Large PRs = rubber-stamp risk.

---

### Approval Criteria

**Merge when**:
- ✅ All checklist items verified
- ✅ No open questions in PR comments
- ✅ CI passes (if configured)
- ✅ No merge conflicts with `main`

**Block when**:
- ❌ Adds `@ts-nocheck` without justification
- ❌ Hardcodes secrets or URLs
- ❌ Breaks existing tests
- ❌ Introduces credit bypass

---

### Post-Merge Actions

**Immediately after merge**:
1. Delete feature branch (local + remote)
2. Verify deploy to staging/production
3. Monitor error logs for 24h

**If production breaks**:
1. Revert merge commit
2. Create hotfix branch
3. Fix + redeploy
4. Post-mortem (document in PR)

---

### Review Efficiency Tips

**For reviewer**:
- Read commit message first (explains "why")
- Focus on architectural decisions, not syntax
- Use GitHub suggestions for small fixes

**For author**:
- Self-review before requesting review
- Add screenshots for UI changes
- Link to related issue/ticket

---

### Anti-Patterns (Avoid)

❌ **"LGTM" without reading code** → rubber stamp  
❌ **Blocking PR for style preferences** → bike-shedding  
❌ **Requesting changes after approval** → confusing state  
❌ **Merging with unresolved comments** → debt accumulation  
❌ **Approving without running locally** → blind trust  

---

## Release Discipline

### Purpose
Releases are **commitment points** to users. They signal: "This version is stable enough for production".

### Semantic Versioning (Simplified)

```
MAJOR.MINOR.PATCH
  2  .  1  .  3
```

**MAJOR** (2.x.x): Breaking changes  
**MINOR** (x.1.x): New features, backward-compatible  
**PATCH** (x.x.3): Bug fixes only  

---

### Rule 1: When to Release

**PATCH release** (x.x.+1):
- Hotfixes deployed to production
- Bug fixes without new behavior
- Security patches
- Performance improvements

**Frequency**: As needed (can be same-day)

**Example commits**:
```
🔥 Corrige crash em geração de PDF: valida encoding antes de fpdf2
Corrige timeout em chamadas de IA: aumenta de 60s para 120s
```

---

**MINOR release** (x.+1.0):
- New features added
- New API endpoints
- UI components added
- Backward-compatible changes

**Frequency**: Weekly or bi-weekly

**Example commits**:
```
Adiciona biblioteca de 18 assuntos categorizada para ebooks
Adiciona modal de copy de divulgação com 4 canais
Adiciona 8 estilos de capa personalizáveis
```

---

**MAJOR release** (+1.0.0):
- Breaking API changes
- Database schema migrations
- Authentication system overhaul
- Architectural refactors

**Frequency**: Quarterly or as needed

**Example commits**:
```
Refatora server.py monolítico para arquitetura modular de routers
Migra autenticação de JWT simples para refresh token system
Remove suporte a Gamma API (deprecated)
```

---

### Rule 2: Release Naming

**Tag format**:
```
v2.1.3
```

**Release title format**:
```
v2.1.3 - Estabilidade PDF + Copy de Divulgação
```

**Pattern**: `v<version> - <2-3 word summary>`

---

### Rule 3: Grouping Commits

**What goes in a release**:
- All commits merged to `main` since last release
- Feature branches merged with PRs
- Hotfixes deployed to production

**What gets highlighted in release notes**:
- New features (user-facing)
- Breaking changes (developer-facing)
- Critical bug fixes

**What to omit from notes**:
- Internal refactors (unless breaking)
- Dependency bumps (unless security)
- Documentation updates

---

### Rule 4: Release Notes Template

```markdown
## v2.1.3 - Estabilidade PDF + Copy de Divulgação

### 🎉 Novidades
- **Copy de Divulgação Automática**: Gera copy pronta para Instagram, Stories, Email e WhatsApp
- **8 Estilos de Capa**: Minimalista, Bold, Elegante, Moderno, Profissional, Natural, Sunset, Oceano
- **Biblioteca de Assuntos**: 18 assuntos categorizados em 3 grupos estratégicos

### 🐛 Correções
- Corrige encoding de PDF com caracteres especiais (fpdf2 unicode)
- Corrige timeout em geração de ebooks longos (120s → 180s)
- Corrige estado de loading infinito ao cancelar request

### ⚡ Melhorias
- Reduz bundle size do frontend em 12% (lazy loading de modais)
- Melhora performance de listagem de ebooks (pagination backend)

### 🔒 Segurança
- Remove hardcoded API keys (migra para env vars)
- Adiciona sanitização de input em campos de texto livre

### ⚠️ Breaking Changes
Nenhuma mudança incompatível nesta versão.

### 📚 Documentação
- Atualiza `copilot-instructions.md` com branching strategy e PR checklist
- Adiciona `EBOOK_GENERATOR_DOCS.md` com fluxo de 5 passos
```

---

### Rule 5: Release Cadence

| Release Type | Typical Frequency | Emergency Override |
|--------------|-------------------|-------------------|
| PATCH | As needed | Immediate (production broken) |
| MINOR | Weekly | Can wait for next cycle |
| MAJOR | Quarterly | Never rush |

**Emergency PATCH protocol**:
1. Hotfix branch → fix → merge
2. Tag immediately: `v2.1.4`
3. Deploy to production
4. Write release notes post-deploy

**Planned MINOR protocol**:
1. Accumulate features during week
2. Friday: cut release branch `release/v2.2.0`
3. Test on staging
4. Monday: merge to main + tag + deploy

**Planned MAJOR protocol**:
1. Create RFC (Request for Comments) document
2. Review with team
3. Break into milestones
4. Ship as series of MINOR releases
5. Final MAJOR when all breaking changes merged

---

### Rule 6: Changelog Automation

**Recommended tools**:
- **Manual**: Edit `CHANGELOG.md` directly
- **Semi-auto**: Use GitHub Releases UI (groups by PR)
- **Full-auto**: `conventional-changelog` (if using conventional commits)

**For Elevare** (current state):
- Manual changelog recommended
- Group commits by category (✨ New, 🐛 Fix, ⚡ Improve, 🔒 Security)
- Review notes before publish

---

### Rule 7: Rollback Strategy

**If release breaks production**:
```bash
# Immediate rollback
git revert <merge-commit-sha>
git push origin main

# Or revert to previous tag
git checkout v2.1.2
git tag v2.1.4-rollback
git push origin v2.1.4-rollback
```

**Then**:
1. Investigate root cause
2. Create hotfix branch
3. Fix + test thoroughly
4. Release as PATCH (v2.1.5)

---

### Anti-Patterns (Avoid)

❌ **Releasing without testing on staging** → production surprise  
❌ **Empty release notes** → users confused  
❌ **Skipping version numbers** (v2.1.2 → v2.1.4) → breaks semver tools  
❌ **Mixing MAJOR and MINOR in one release** → unclear commitment  
❌ **Releasing Friday afternoon** → no one to fix if breaks  

---

### Decision Tree (Quick Reference)

```
Did production break?
  ├─ Yes → PATCH release immediately
  └─ No → Did we add new features?
      ├─ Yes → MINOR release (plan for week-end)
      └─ No → Did we break compatibility?
          ├─ Yes → MAJOR release (plan carefully)
          └─ No → Wait, accumulate more changes
```

---

## Commit Guidelines

Git history is architectural documentation. Commits should reflect **conscious technical decisions**, not just "changes made".

### Pattern 1: Security & Configuration Isolation
**Problem**: Hardcoded URLs, models, or API keys = vendor lock + security risk  
**Solution**: Environment variables + centralized config  
**Commit format**:
```
Corrige autenticação e configuração: remove URL/modelo hardcoded, usa env/config e requisição autenticada
```
**When to use**: Moving secrets to `.env`, centralizing API configs, removing hardcoded values

---

### Pattern 2: Defensive Parsing & Validation
**Problem**: Unvalidated API responses = runtime crashes on schema drift  
**Solution**: Schema validation + safe parsing + error boundaries  
**Commit format**:
```
Melhora parsing de respostas: adiciona tipagem estruturada, parse seguro e validação de schema
```
**When to use**: Adding Pydantic/Zod validation, handling JSON parse errors, API contract changes

---

### Pattern 3: Type Safety Enforcement
**Problem**: `@ts-nocheck` or `any` types = silent errors until production  
**Solution**: Strict TypeScript interfaces for requests/responses/state  
**Commit format**:
```
Remove @ts-nocheck e adiciona tipagem forte para requests, responses e estado
```
**When to use**: Removing escape hatches, adding proper interfaces, eliminating `any` usage

---

### Pattern 4: UX Resilience for Async Flows
**Problem**: Silent failures, blocking spinners, no recovery path  
**Solution**: Inline error states, retry mechanisms, cancellation support  
**Commit format**:
```
Aprimora UX de erro e carregamento: estados inline, feedback ao usuário e opções de retry
```
**When to use**: Improving long-running operations (AI calls, PDF generation), adding error recovery

---

### Pattern 5: Shared Theming & Performance
**Problem**: Inline styles, CSS duplication, multiple font loads  
**Solution**: Centralized design system, shared theme tokens  
**Commit format**:
```
Move estilos inline para tema compartilhado e elimina injeção local de fontes/animações
```
**When to use**: Consolidating styling, migrating to design system, performance optimizations

---

### Pattern 6: Production-Grade Exports
**Problem**: PDF encoding failures, pagination breaks, missing error feedback  
**Solution**: Embedded fonts, overflow guards, pagination logic, user-facing errors  
**Commit format**:
```
Torna exportação de PDF mais robusta: paginação, fontes embutidas, guards e feedback de erro
```
**When to use**: Hardening file generation, fixing encoding issues, improving export reliability

---

### Additional Patterns

**Secret Protection**:
```
Adiciona proteção de segredos: padroniza uso de variáveis de ambiente e ignora arquivos sensíveis
```

**Flow Resilience**:
```
Garante resiliência do wizard: resets seguros de estado, cancelamento de requests e recuperação de fluxo
```

**Technical Documentation**:
```
Adiciona documentação técnica central (copilot-instructions) com arquitetura, fluxos e roadmap
```

---

### Anti-Patterns (Avoid)
❌ `git commit -m "fix stuff"`  
❌ `git commit -m "adjustments"`  
❌ `git commit -m "updates"`  
❌ Mixing unrelated changes in one commit  
❌ Committing without testing the specific change  

**Rule**: One commit = one architectural decision. Git history should explain *why*, not just *what*.

---

## Documentation References

- API endpoints: `DOCUMENTACAO_API.md`
- E-book system: `EBOOK_GENERATOR_DOCS.md`
- Deployment: `GUIA_DEPLOYMENT_EMERGENT.md`
- Security improvements: `MELHORIAS_SEGURANCA.md`
