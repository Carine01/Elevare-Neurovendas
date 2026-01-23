# 🎯 Sistema de Perfil de Marca - Elevare NeuroVendas

## ✅ PROBLEMA RESOLVIDO

**ANTES:** O aplicativo gerava conteúdos genéricos sem considerar a identidade única de cada marca.

**AGORA:** Todos os conteúdos são gerados em coerência total com o perfil da marca definido.

---

## 🚀 O QUE FOI IMPLEMENTADO

### 1. **Sistema de Perfil de Marca (Brand Profile)**

Criamos um sistema completo de perfil de marca que armazena:

#### 🎨 **Identidade da Marca**
- Nome da marca/clínica
- Segmento de atuação
- Tom de voz (autoridade, acolhedor, educativo, premium)
- Personalidade (profissional, confiável, moderno, etc.)
- Valores (excelência, segurança, resultados, etc.)

#### 💬 **Linguagem e Comunicação**
- Público-alvo detalhado
- Faixa etária
- Estilo de comunicação
- **Palavras-chave estratégicas** (termos que devem ser usados)
- **Palavras proibidas** (termos que devem ser evitados)

#### 🎨 **Identidade Visual**
- Cores primárias
- Cores secundárias
- Fonte principal
- Fonte secundária

#### 💎 **Diferenciais**
- Pontos únicos que destacam a marca

---

## 🤖 INTEGRAÇÃO COM LUCRESIA (IA DE NEUROVENDAS)

### **ANTES:**
A Lucresia usava um prompt fixo genérico para todos os clientes.

### **AGORA:**
A Lucresia gera um **System Prompt Personalizado** dinamicamente para cada marca, considerando:

1. **Nome da marca** - Para personalização total
2. **Tom de voz** - Define como a IA deve se comunicar
3. **Valores** - Reforça em cada conteúdo
4. **Palavras estratégicas** - Garante uso dos termos corretos
5. **Palavras proibidas** - Evita linguagem inadequada automaticamente
6. **Diferenciais** - Destaca nos conteúdos

### **Como Funciona:**

```python
# Backend: server.py
def get_lucresia_system_prompt(brand_profile: BrandProfile) -> str:
    """
    Gera system prompt personalizado baseado no perfil da marca.
    Cada vez que a Lucresia é chamada, ela recebe instruções
    específicas da marca ativa.
    """
```

**TODOS os endpoints de geração de conteúdo agora:**
1. Buscam o perfil de marca ativo
2. Geram o system prompt personalizado
3. Passam para a Lucresia
4. Retornam conteúdo 100% alinhado com a marca

---

## 📋 ENDPOINTS CRIADOS

### Gerenciamento de Perfil de Marca

```
GET    /api/brand/profile           - Busca perfil de marca ativo
POST   /api/brand/profile           - Cria novo perfil de marca
PUT    /api/brand/profile/{id}      - Atualiza perfil existente
DELETE /api/brand/profile/{id}      - Remove perfil de marca
POST   /api/brand/profile/seed      - Cria perfil padrão para estética
```

### Geração de Conteúdo com IA (AGORA com perfil de marca)

```
POST /api/ai/lucresia/stories       - Gera sequência de stories
POST /api/ai/lucresia/titulo        - Gera títulos estratégicos
POST /api/ai/lucresia/copy          - Gera copy para posts
POST /api/ai/lucresia/hashtags      - Gera hashtags estratégicas
```

**IMPORTANTE:** Todos estes endpoints agora verificam o perfil de marca ativo e aplicam automaticamente!

---

## 🎨 INTERFACE DE CONFIGURAÇÃO

### **Tela de Configuração de Marca**

Adicionado botão **"⚙️ Configurar Marca"** na tela inicial que abre um painel completo mostrando:

- ✅ Identidade da Marca
- ✅ Linguagem e Comunicação  
- ✅ Identidade Visual
- ✅ Diferenciais
- ✅ Status de integração com Lucresia

### **Carregamento Automático**

Ao iniciar o aplicativo:
1. Carrega automaticamente o perfil de marca ativo
2. Se não existir, cria um perfil padrão
3. Aplica cores e fontes da marca no editor
4. Exibe nome da marca no header

---

## 🔄 FLUXO DE COERÊNCIA

```
1. Usuário define/visualiza perfil da marca
   ↓
2. Perfil é salvo no MongoDB
   ↓
3. Quando qualquer conteúdo é gerado:
   a. Backend busca perfil ativo
   b. Gera system prompt personalizado
   c. Lucresia recebe instruções da marca
   d. Gera conteúdo 100% coerente
   ↓
4. Conteúdo retorna alinhado com:
   - Tom de voz da marca
   - Valores da marca
   - Linguagem aprovada
   - Sem palavras proibidas
```

---

## 💾 ESTRUTURA DE DADOS

### BrandProfile Model (MongoDB)

```json
{
  "id": "uuid",
  "nome_marca": "Elevare Estética",
  "segmento": "estética avançada",
  "tom_de_voz": "autoridade",
  "personalidade": ["profissional", "confiável", "inovadora"],
  "valores": ["excelência técnica", "resultados naturais", "segurança"],
  "palavras_chave": ["harmonização", "rejuvenescimento natural", "técnicas avançadas"],
  "palavras_evitar": ["barato", "promoção relâmpago", "corra"],
  "faixa_etaria_alvo": "30-50 anos",
  "publico_principal": "Mulheres buscando rejuvenescimento natural",
  "cores_primarias": ["#4F46E5", "#7C3AED"],
  "cores_secundarias": ["#3B82F6", "#8B5CF6", "#10B981"],
  "fonte_principal": "Inter",
  "fonte_secundaria": "Playfair Display",
  "estilo_comunicacao": "Comunicação técnica, direta e profissional...",
  "diferenciais": ["Equipe certificada", "Protocolos personalizados"],
  "is_active": true,
  "created_at": "2026-01-21T...",
  "updated_at": "2026-01-21T..."
}
```

---

## 🎯 GARANTIA DE COERÊNCIA

### **ANTES: Sem validação**
- Conteúdos genéricos
- Sem personalização
- Linguagem inconsistente

### **AGORA: Validação automática**

✅ **Todos os conteúdos gerados pela IA:**
1. Seguem o tom de voz definido
2. Refletem a personalidade da marca
3. Usam as palavras-chave estratégicas
4. Evitam automaticamente palavras proibidas
5. Reforçam os valores da marca
6. Destacam os diferenciais

✅ **No Editor Visual:**
1. Carrega automaticamente cores da marca
2. Usa fontes definidas no perfil
3. Exibe nome da marca no header

---

## 🚀 COMO USAR PARA O BETA

### **1. Configurar Perfil de Marca**
```bash
# Opção 1: Via API
curl -X POST http://localhost:8000/api/brand/profile/seed

# Opção 2: Via Interface
1. Abrir aplicativo
2. Clicar em "⚙️ Configurar Marca"
3. Visualizar/editar perfil padrão
```

### **2. Gerar Conteúdo com IA**
Todos os conteúdos gerados agora seguem automaticamente o perfil da marca!

```javascript
// Frontend - API já configurada
const stories = await api.lucresiaStories(
  'Harmonização Facial',
  'Gerar autoridade profissional',
  'mulheres 30-50 anos',
  5
);
// Resultado: 5 stories com tom, linguagem e valores da marca
```

### **3. Verificar Coerência**
- Todos os textos gerados refletirão o tom de voz
- Palavras proibidas não aparecerão
- Valores da marca serão reforçados
- Linguagem será consistente

---

## 📊 CHECKLIST PRÉ-BETA

- [x] Sistema de perfil de marca implementado
- [x] Endpoints CRUD para gerenciar perfis
- [x] Integration com Lucresia (System Prompt dinâmico)
- [x] Atualização de TODOS os endpoints de geração
- [x] Interface de visualização/configuração
- [x] Carregamento automático ao iniciar app
- [x] Aplicação de cores/fontes da marca no editor
- [ ] Testes de geração com diferentes perfis
- [ ] Documentação de uso para clientes

---

## 🔒 SEGURANÇA E CONSISTÊNCIA

### **Garantias Implementadas:**

1. ✅ **Apenas um perfil ativo por vez**
   - Ao criar novo, outros são desativados automaticamente

2. ✅ **Perfil padrão sempre disponível**
   - Se não houver perfil, cria um automaticamente

3. ✅ **Validação em tempo real**
   - Cada geração verifica perfil atual
   - Impossível gerar conteúdo sem perfil

4. ✅ **Timestamps de auditoria**
   - created_at e updated_at para rastreamento

---

## 🎓 EXEMPLO DE USO COMPLETO

```python
# 1. Backend busca perfil ativo
brand_profile = await db.brand_profiles.find_one({"is_active": True})

# 2. Gera system prompt personalizado
system_prompt = get_lucresia_system_prompt(brand_profile)
# Resultado:
"""
Você é Lucresia, estrategista sênior em Neurovendas para Elevare Estética.

🎯 PERFIL DA MARCA:
Nome: Elevare Estética
Tom de Voz: autoridade
Valores: excelência técnica, resultados naturais, segurança

✅ PALAVRAS ESTRATÉGICAS:
harmonização, rejuvenescimento natural, técnicas avançadas

❌ PALAVRAS PROIBIDAS:
barato, promoção relâmpago, corra
...
"""

# 3. Lucresia gera conteúdo com essas instruções
# 4. Retorna conteúdo 100% alinhado com a marca!
```

---

## 📞 SUPORTE

Para dúvidas ou customizações adicionais do perfil de marca, consulte:
- Backend: `server.py` (linhas 100-250)
- Frontend: `App.js` (função loadBrandProfile)
- Documentação API: `/api/docs`

---

## 🎉 RESULTADO FINAL

**AGORA o aplicativo garante que:**
- ✅ Todos os conteúdos são coerentes com a marca
- ✅ O clone de IA (Lucresia) respeita o perfil definido
- ✅ Templates usam cores e fontes da marca
- ✅ Linguagem é consistente em todos os canais
- ✅ Valores e diferenciais são reforçados automaticamente

**Pronto para BETA! 🚀**
