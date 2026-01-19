# 🚀 Guia Rápido - Clone de Voz

## Para Desenvolvedores

### Setup Inicial
```bash
# 1. Instalar dependência
pip install emoji

# 2. Verificar se router está registrado em server.py
# Linha ~820: app.include_router(brand_identity_router)

# 3. Iniciar servidor
cd backend
python server.py
```

### Uso em Novos Endpoints

**Opção 1: Integração Automática (via LucresIA)**
```python
# Seus endpoints já estão integrados automaticamente!
lucresia = LucresIA(
    session_id=session_id,
    brand_identity=await db.brand_identities.find_one({"user_id": user_id})
)
```

**Opção 2: Integração Manual**
```python
from services.prompt_builder import build_voice_clone_prompt

# Buscar identidade
brand_identity = await db.brand_identities.find_one({"user_id": user_id})

if brand_identity and brand_identity.get('voice_samples'):
    # Usar clone de voz
    system_prompt, user_prompt = build_voice_clone_prompt(
        brand_identity=brand_identity,
        task="Escreva uma legenda sobre skincare",
        context="legenda instagram"
    )
else:
    # Fallback
    system_prompt = "Você é LucresIA..."
```

---

## Para Testadores

### 1. Criar Identidade de Marca

**Endpoint**: `POST /api/brand-identity/`

**Body mínimo**:
```json
{
  "brand_name": "Dra. Test",
  "main_specialty": "Harmonização",
  "brand_archetype": "O Sábio",
  "positioning": ["Técnica Avançada"],
  "target_audience": "Mulheres 25-45",
  "voice_samples": "Oi gente! ✨ Hoje vou falar sobre algo SUPER importante... Você sabia que harmonização facial não é só sobre preenchimento? É sobre EQUILÍBRIO! Cada rosto é único, e eu analiso cada detalhe. Vem comigo nessa jornada! 💕",
  "formality": "Muito informal - como conversa entre amigas",
  "communication_style": ["Uso emojis frequentemente", "Faço perguntas retóricas"],
  "sentence_length": "Frases curtas e diretas",
  "paragraph_style": "Parágrafos curtos (1-2 linhas)",
  "punctuation": ["Uso exclamações!", "Uso CAPS para ênfase"],
  "personality": ["Empática e acolhedora"],
  "tone_of_voice": ["Educativo", "Próximo"]
}
```

### 2. Analisar Voz

**Endpoint**: `POST /api/brand-identity/analyze-voice`

**Resposta esperada**:
```json
{
  "avg_sentence_length": 12.5,
  "emoji_frequency": 4.2,
  "question_ratio": 0.25,
  "uses_caps": true,
  "formality_detected": "muito_informal",
  "common_phrases": ["olha que incrível", "vem comigo"]
}
```

### 3. Gerar Conteúdo Personalizado

**Endpoint**: `POST /api/ebook-new/generate`

**Validação**: O e-book gerado deve:
- Conter emojis (✨, 💕, etc.)
- Usar exclamações frequentes
- Ter frases curtas
- Soar informal e próximo
- Incluir catchphrases se definidas

---

## Para Product Owners

### Features Implementadas

**✅ Identidade de Marca Completa**
- 35+ campos configuráveis
- 11 campos específicos de clone de voz
- Preview em tempo real
- Auto-save a cada 3 segundos

**✅ Análise de Voz Automática**
- 10 métricas NLP
- Detecção de formalidade (5 níveis)
- Extração de frases comuns
- Análise de vocabulário

**✅ Geração de Conteúdo Personalizada**
- E-books com estilo do usuário
- Carrosséis personalizados
- Posts e legendas customizados
- Aperfeiçoamento mantendo voz

**✅ Sistema de Créditos**
- Free: 1 identidade, 3 análises/mês
- Essencial: Ilimitado identidades, 10 análises/mês
- Pro/Premium: Tudo ilimitado

### User Stories Completas

1. ✅ Como profissional de estética, quero criar minha identidade de marca para que a IA escreva como eu
2. ✅ Como usuário, quero que a IA analise meu estilo de escrita para replicá-lo fielmente
3. ✅ Como criadora de conteúdo, quero gerar e-books que soem como meus posts no Instagram
4. ✅ Como gestora de clínica, quero que todos os materiais tenham minha voz autoral
5. ✅ Como assinante premium, quero análises ilimitadas para refinar meu clone de voz

### Métricas de Sucesso

**Qualidade do Clone**:
- Taxa de similaridade > 80% (a implementar)
- Usuários identificam conteúdo como "seu estilo"
- Redução de edições manuais em 60%+

**Engajamento**:
- Aumento de 40%+ em conteúdo gerado com clone vs genérico
- Usuários premium usam clone em 90%+ das gerações
- NPS de feature > 8.5

**Performance**:
- Análise de voz < 3 segundos
- Geração de e-book < 45 segundos
- System prompt < 3000 tokens

---

## Para Usuários Finais

### Como Usar o Clone de Voz

**1. Acesse Construtor de Marca**
```
Dashboard → Construtor de Marca
```

**2. Preencha Identidade**
- Informações básicas (nome, especialidade)
- Posicionamento estratégico
- **Clone de Voz IA** (11 campos)
- Identidade visual
- Comunicação

**3. Seção Clone de Voz IA**

**Campo Obrigatório**: Amostras de Voz
- Cole 2-3 legendas suas do Instagram
- Ou trechos de e-mails/mensagens
- Mínimo 100 caracteres
- **Dica**: Quanto mais texto, melhor a análise!

**Opcional**: Configure detalhes
- Como você se comunica
- Tamanho de frases
- Estilo de parágrafos
- Suas expressões favoritas
- Como inicia e encerra textos
- Nível de formalidade
- Pontuação característica
- Traços de personalidade

**4. Clique "Analisar Voz" (Opcional)**
- Sistema analisa seu estilo automaticamente
- Mostra métricas no preview
- Valida se configuração manual está correta

**5. Gere Conteúdo**
```
E-books → Novo E-book
Carrosséis → Criar Carrossel
Posts → Gerar Legenda
```

**O conteúdo virá com SEU estilo! 🎉**

### Dicas para Melhor Resultado

**✅ Faça**:
- Use textos reais seus (Instagram, e-mails, WhatsApp)
- Seja consistente no estilo das amostras
- Revise se as configurações batem com as métricas
- Atualize periodicamente conforme seu estilo evolui

**❌ Evite**:
- Copiar textos de outras pessoas
- Misturar estilos muito diferentes
- Usar apenas 1 frase curta
- Incluir textos formais se você é informal

### Planos e Limites

| Plano | Identidades | Análises/mês | Atualizações |
|-------|-------------|--------------|--------------|
| Free | 1 | 3 | Limitadas |
| Essencial | Ilimitadas | 10 | Ilimitadas |
| Profissional | Ilimitadas | Ilimitadas | Ilimitadas |
| Premium | Ilimitadas | Ilimitadas | Ilimitadas |

---

## Troubleshooting

### "Voice samples muito curto"
**Solução**: Adicione mais texto. Mínimo 100 caracteres, ideal 300+.

### "Clone não parece comigo"
**Solução**: 
1. Adicione mais amostras de voz
2. Clique "Analisar Voz" para ver métricas
3. Ajuste configurações manualmente
4. Use textos mais representativos do seu estilo

### "Análise de voz falhou"
**Solução**: Verifique se há caracteres especiais ou emojis quebrados.

### "Conteúdo ainda genérico"
**Solução**: 
1. Confirme que identidade foi salva
2. Verifique se `voice_samples` está preenchido
3. Tente gerar novamente
4. Entre em contato com suporte

---

## Suporte

**Documentação técnica**: `VOICE_CLONE_SYSTEM.md`  
**Integração**: `INTEGRATION_ENDPOINTS.md`  
**Resumo**: `INTEGRATION_SUMMARY.md`

**Contato**: suporte@neurovendas.com
