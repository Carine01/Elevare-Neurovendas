# ⚡ Quick Start - Sistema de Blog

## 🚀 Iniciar os Servidores

### 1. Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python server.py
```
Será disponível em: `http://localhost:8000`

### 2. Frontend
```bash
cd frontend
npm install  # (apenas primeira vez)
npm start
```
Será disponível em: `http://localhost:3000`

---

## 📝 Testar Criação de Artigo

### Passo 1: Preparar Dados (Opcional)
Se não tiver perfil de marca, crie um:
```bash
curl -X POST http://localhost:8000/api/brand/profile/seed
```

### Passo 2: Acessar Interface
1. Abra: `http://localhost:3000`
2. Clique em **"📝 Criar Blog"** (botão verde no header)

### Passo 3: Preencher Formulário
- **📌 Tópico Principal**: `Neuromarketing e Comportamento do Consumidor`
- **🎯 Objetivo**: `Explicar como decisões de compra são influenciadas pelo cérebro`
- **👥 Público-Alvo**: `Empresários e gerentes de marketing` (deixe padrão se preferir)
- **📊 Seções**: Deixe 3 (padrão)
- **🔑 Palavras-chave**: `neuromarketing, vendas, psicologia do consumidor`

### Passo 4: Gerar Artigo
- Clique em **"✨ Gerar Artigo com Lucresia"**
- ⏳ Aguarde 10-30 segundos (IA está processando)

### Passo 5: Visualizar e Publicar
- Artigo aparece no **preview à direita**
- Revise: Introdução → Seções → Conclusão → CTA
- Clique **"📤 Publicar"** para confirmar

### Passo 6: Verificar Salvamento
- Artigo aparece em **"📚 Artigos Salvos"** na lista esquerda
- Clique nele para visualizar novamente

---

## 🔍 Resposta Esperada

Quando a IA gera o artigo, você receberá algo como:

```json
{
  "success": true,
  "post": {
    "id": "uuid-único",
    "titulo": "Neuromarketing: O Segredo por Trás das Decisões de Compra",
    "introducao": "Você já parou para pensar por que compra?...",
    "secoes": [
      {
        "titulo": "O que é Neuromarketing?",
        "conteudo": "Neuromarketing é a ciência que estuda..."
      },
      {
        "titulo": "Como o Cérebro Influencia Decisões",
        "conteudo": "Nosso cérebro processa informações..."
      }
    ],
    "conclusao": "O neuromarketing não é manipulação...",
    "cta": "Descubra como aplicar estes princípios em seu negócio",
    "status": "rascunho",
    "topico": "Neuromarketing e Comportamento do Consumidor",
    "marca_nome": "Sua Marca"
  }
}
```

---

## ❌ Se Algo Falhar

### Erro: "AI API não configurada"
```
✓ Solução: Verifique se EMERGENT_LLM_KEY está em backend/.env
```

### Erro: "Não foi possível fazer parse do conteúdo"
```
✓ Solução: IA pode ter retornado texto sem JSON
✓ Tente novamente com descrição mais clara
```

### Artigo não aparece
```
✓ Verifique: MongoDB está rodando?
✓ Verifique: Backend está respondendo? (curl http://localhost:8000/api/health)
✓ Revise console do navegador (F12) para erros
```

### Interface não carrega
```
✓ Limpe cache: Ctrl+Shift+Del
✓ Reinicie frontend: npm start
✓ Verifique REACT_APP_BACKEND_URL em frontend/.env
```

---

## 📊 Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/ai/lucresia/blog-post` | Gera novo artigo |
| GET | `/api/blog/posts` | Lista todos artigos |
| GET | `/api/blog/posts/{id}` | Recupera artigo específico |
| POST | `/api/blog/posts/{id}` | Atualiza/publica artigo |
| DELETE | `/api/blog/posts/{id}` | Deleta artigo |

---

## 💡 Dicas

1. **Primeira geração pode ser mais lenta** (warm-up da API)
2. **Tópicos mais específicos = artigos melhores** (ex: não use só "vendas", use "vendas B2B para SaaS")
3. **Palavras-chave importam** - Separe com vírgula
4. **Revise sempre** antes de publicar
5. **Múltiplas gerações criam artigos diferentes** - mesmo com mesmo input

---

## ✅ Checklist antes de Beta

- [ ] Backend iniciado sem erros
- [ ] Frontend iniciado sem erros
- [ ] Botão "📝 Criar Blog" visível
- [ ] Formulário aceita entradas
- [ ] Geração cria JSON válido
- [ ] Artigo aparece em preview
- [ ] Lista de artigos atualiza após publicar
- [ ] Todos artigos têm seções corretas
- [ ] CTA está presente
- [ ] Status mostra "rascunho" → "publicado"

---

**Pronto! Seu sistema de blog está funcionando! 🎉**
