# Radar de Tendências - Backend

Backend Node.js para análise de tendências virais em plataformas sociais (YouTube, Instagram, Twitter, Reddit e Google Trends).

## Início Rápido

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas API keys

# Executar em desenvolvimento
npm run dev

# Executar em produção
npm start
```

## Documentação Completa

Consulte [docs/guia-instalacao-radar.md](../../docs/guia-instalacao-radar.md) para instruções detalhadas de:

- Configuração de todas as APIs (YouTube, Twitter, Instagram, Reddit, SerpAPI)
- Exemplos de uso
- Deploy em produção
- Troubleshooting

## Endpoints Principais

- `POST /api/tendencias` - Buscar tendências por termos
- `GET /api/tendencias/auto` - Tendências automáticas de estética
- `POST /api/hashtags/analisar` - Análise de hashtags
- `GET /health` - Health check

## Tecnologias

- Node.js + Express
- Axios para APIs externas
- node-cron para agendamento
- CORS habilitado
