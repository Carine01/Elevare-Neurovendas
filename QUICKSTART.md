# 🚀 GUIA RÁPIDO - NOVOS RECURSOS (5 MINUTOS)

## ⏱️ Quick Start

### 1️⃣ Configuração (2 min)

```bash
# 1. Editar backend/.env
# Procure por: OPENAI_API_KEY=
# Adicione sua chave: OPENAI_API_KEY=sk_seu_token_aqui
# Obtém em: https://platform.openai.com/api-keys

# Salve o arquivo
```

### 2️⃣ Iniciar Sistema (2 min)

```bash
# Terminal 1 - Backend
cd backend
python server.py
# Deve mostrar: Uvicorn running on http://localhost:8000

# Terminal 2 - Frontend  
cd frontend
npm start
# Deve abrir automaticamente: http://localhost:3000
```

### 3️⃣ Testar (1 min)

```
1. No navegador: http://localhost:3000
2. Clique em "📝 Blog Creator"
3. Preencha os campos:
   - Tópico: "Harmonização Facial"
   - Objetivo: "Educar sobre procedimento"
   - Público: "Mulheres 25-50 anos"
4. Clique: "🚀 Gerar Artigo com IA"
5. Aguarde ~10 segundos
```

---

## 🎨 10 Novos Templates

Após gerar artigo, vá a seção **"🎨 Diagramação Automática"**:

### Clássicos (4):
- **Clean** ← Recomendado para começar
- **Magazine** ← Elegante
- **Minimal** ← Zen
- **Bold** ← Impactante

### 🌟 Gamma Novo (6):
- **Gradient** ← Cores vibrantes
- **Glass** ← Premium moderno
- **Slides** ← Estilo apresentação
- **Modern** ← SaaS profissional
- **Neon** ← Futurista
- **Premium** ← Luxury com ouro

**Um clique para trocar!** A prévia atualiza em tempo real.

---

## 🎨 Gerar Imagens com IA

Após criar artigo, procure por:

### **"🎨 Geração de Imagens com IA (DALL-E 3)"**

1. Clique em um botão: **"🎨 Gerar: [termo]"**
2. Aguarde ⏳ (30-60 segundos)
3. Imagem aparecerá em **"📸 Imagens Geradas"**
4. Clique na imagem para **usar como destaque**
5. Pronto! Salva automaticamente

### Exemplo:
```
Artigo: "Harmonização Facial"
→ Clicou: "Gerar: rosto harmonizado profissional"
→ DALL-E criou imagem
→ Clicou na imagem
→ Agora é a "Imagem Destaque" do artigo
```

---

## 📊 Recomendações Rápidas

### Estética/Saúde
- Template: **Premium** (elegante)
- Imagem: Rosto, pele, procedimento

### Tech/Startup
- Template: **Neon** (futurista) 
- Imagem: Código, dashboard, AI

### E-commerce
- Template: **Modern** (profissional)
- Imagem: Produto, lifestyle

### Educação
- Template: **Slides** (apresentação)
- Imagem: Conceito, infográfico

### Editorial
- Template: **Magazine** (elegante)
- Imagem: Ambiente, pessoas

---

## ✅ Checklist Funcionalidade

- [ ] Artigo criado com sucesso
- [ ] Sugestões de imagens aparecem
- [ ] Botões de templates estão visíveis
- [ ] Clicar em template troca a prévia
- [ ] Cor de destaque reflete em todo template
- [ ] Se tiver OpenAI Key: Clicar em "Gerar" funciona
- [ ] Imagem gerada aparece na galeria
- [ ] Clique em imagem salva como destaque

---

## 🆘 Se Algo Não Funcionar

### Botões de template não funcionam
```
→ Limpe cache: Ctrl+Shift+Delete
→ Recarregue: Ctrl+R
→ Verifique console: F12 → Console
```

### Gerar imagem não funciona
```
→ Verifique se tem OpenAI Key no .env
→ Reinicie backend (Ctrl+C em Terminal 1)
→ Tente novamente
```

### App carrega em branco
```
→ Verifique se backend está rodando
→ Verifique console: F12 → Console
→ Reinicie frontend: Ctrl+C em Terminal 2, depois npm start
```

### Artigo não salva
```
→ Verifique se MongoDB está rodando
→ Verifique conexão: http://localhost:27017
→ Tente novamente
```

---

## 📚 Mais Informações

- **Guia Completo**: `FEATURES_GAMMA.md`
- **Visual Reference**: `TEMPLATE_GALLERY.md`  
- **Implementação Técnica**: `IMPLEMENTATION_SUMMARY.md`
- **Script de Teste**: `tests/test_gamma_features.py`

---

## 🎯 Próximos Passos Após Testar

1. **Exportar artigo** (botão "Export HTML")
2. **Publicar** no seu site
3. **Compartilhar** nas redes sociais
4. **Coletar feedback** dos usuários
5. **Criar mais artigos** com diferentes templates

---

## 💡 Dicas Pro

### Combinar templates por setor
```
E-commerce: Modern ou Gradient
Estética: Premium ou Glass
Tech: Neon ou Modern
Educação: Slides ou Clean
Editorial: Magazine ou Premium
```

### Usar cores da marca
```
Brand Profile define cor_destaque
Todos os templates herdam essa cor
Exemplo: Roxo (#8B5CF6) em todos os designs
```

### Gerar múltiplas imagens
```
1. Clique em vários termos de sugestão
2. DALL-E gera diferentes imagens
3. Compare na galeria
4. Escolha a melhor
```

### Editar após gerar
```
1. Clique no artigo na lista
2. Edite título, conteúdo, etc
3. Mude o template
4. Gere nova imagem se quiser
5. Salve
```

---

## 🎉 Bom Uso!

Você tem tudo que precisa para criar conteúdo profissional com IA!

**Dúvidas?** Consulte os arquivos `.md` nesta pasta.

**Precisou de suporte?** Verifique a seção Troubleshooting em `FEATURES_GAMMA.md`.

---

**Elevare NeuroVendas - Versão 1.1 com Gamma Templates**

Desenvolvido com ❤️ para você
