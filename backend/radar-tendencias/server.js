// ===================================
// BACKEND COMPLETO - RADAR DE TENDÊNCIAS
// Node.js + Express + APIs Reais
// ===================================

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// ===================================
// CONFIGURAÇÃO DAS APIs
// ===================================

const API_KEYS = {
  YOUTUBE: process.env.YOUTUBE_API_KEY,
  TWITTER: process.env.TWITTER_BEARER_TOKEN,
  INSTAGRAM: process.env.INSTAGRAM_ACCESS_TOKEN,
  SERPAPI: process.env.SERPAPI_KEY, // Para Google Trends
  REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
  REDDIT_SECRET: process.env.REDDIT_SECRET
};

// ===================================
// SERVIÇO: GOOGLE TRENDS
// ===================================

const buscarGoogleTrends = async (termo, regiao = 'BR') => {
  try {
    // Usando SerpAPI para Google Trends (alternativa oficial)
    const response = await axios.get('https://serpapi.com/search', {
      params: {
        engine: 'google_trends',
        q: termo,
        geo: regiao,
        api_key: API_KEYS.SERPAPI
      }
    });

    const trendData = response.data.interest_over_time;
    
    return {
      termo,
      plataforma: 'Google Trends',
      volume: calcularVolume(trendData),
      crescimento: calcularCrescimento(trendData),
      pontuacao: calcularPontuacao(trendData),
      dados: trendData
    };
  } catch (error) {
    console.error('Erro Google Trends:', error.message);
    return null;
  }
};

// ===================================
// SERVIÇO: YOUTUBE
// ===================================

const buscarYouTubeTrends = async (termo) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: termo,
        type: 'video',
        order: 'viewCount',
        maxResults: 50,
        publishedAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        key: API_KEYS.YOUTUBE
      }
    });

    const videos = response.data.items;
    const videoIds = videos.map(v => v.id.videoId).join(',');

    // Buscar estatísticas detalhadas
    const statsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'statistics',
        id: videoIds,
        key: API_KEYS.YOUTUBE
      }
    });

    const totalViews = statsResponse.data.items.reduce((sum, item) => 
      sum + parseInt(item.statistics.viewCount || 0), 0
    );

    const totalLikes = statsResponse.data.items.reduce((sum, item) => 
      sum + parseInt(item.statistics.likeCount || 0), 0
    );

    return {
      termo,
      plataforma: 'YouTube',
      totalVideos: videos.length,
      visualizacoes: totalViews,
      curtidas: totalLikes,
      engajamento: ((totalLikes / totalViews) * 100).toFixed(2) + '%',
      pontuacao: calcularPontuacaoYouTube(totalViews, totalLikes),
      videos: videos.slice(0, 5).map(v => ({
        titulo: v.snippet.title,
        canal: v.snippet.channelTitle,
        publicado: v.snippet.publishedAt
      }))
    };
  } catch (error) {
    console.error('Erro YouTube:', error.message);
    return null;
  }
};

// ===================================
// SERVIÇO: INSTAGRAM (via Graph API)
// ===================================

const buscarInstagramTrends = async (hashtag) => {
  try {
    // Buscar hashtag insights
    const response = await axios.get(`https://graph.facebook.com/v18.0/ig_hashtag_search`, {
      params: {
        user_id: process.env.INSTAGRAM_USER_ID,
        q: hashtag.replace('#', ''),
        access_token: API_KEYS.INSTAGRAM
      }
    });

    if (!response.data.data || response.data.data.length === 0) {
      return null;
    }

    const hashtagId = response.data.data[0].id;

    // Buscar posts recentes da hashtag
    const postsResponse = await axios.get(`https://graph.facebook.com/v18.0/${hashtagId}/recent_media`, {
      params: {
        user_id: process.env.INSTAGRAM_USER_ID,
        fields: 'id,caption,media_type,timestamp,like_count,comments_count',
        access_token: API_KEYS.INSTAGRAM,
        limit: 50
      }
    });

    const posts = postsResponse.data.data || [];
    const totalEngajamento = posts.reduce((sum, post) => 
      sum + (post.like_count || 0) + (post.comments_count || 0), 0
    );

    return {
      termo: hashtag,
      plataforma: 'Instagram',
      totalPosts: posts.length,
      engajamentoTotal: totalEngajamento,
      mediaEngajamento: Math.floor(totalEngajamento / posts.length),
      pontuacao: calcularPontuacaoInstagram(posts.length, totalEngajamento),
      topPosts: posts.slice(0, 3)
    };
  } catch (error) {
    console.error('Erro Instagram:', error.message);
    return null;
  }
};

// ===================================
// SERVIÇO: REDDIT
// ===================================

const buscarRedditTrends = async (termo) => {
  try {
    // Autenticação Reddit
    const authResponse = await axios.post('https://www.reddit.com/api/v1/access_token', 
      'grant_type=client_credentials',
      {
        auth: {
          username: API_KEYS.REDDIT_CLIENT_ID,
          password: API_KEYS.REDDIT_SECRET
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = authResponse.data.access_token;

    // Buscar posts
    const response = await axios.get('https://oauth.reddit.com/search', {
      params: {
        q: termo,
        sort: 'hot',
        limit: 50,
        t: 'week'
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'RadarTendencias/1.0'
      }
    });

    const posts = response.data.data.children;
    const totalUpvotes = posts.reduce((sum, post) => sum + post.data.ups, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.data.num_comments, 0);

    return {
      termo,
      plataforma: 'Reddit',
      totalDiscussoes: posts.length,
      upvotes: totalUpvotes,
      comentarios: totalComments,
      pontuacao: calcularPontuacaoReddit(totalUpvotes, totalComments),
      topPosts: posts.slice(0, 5).map(p => ({
        titulo: p.data.title,
        subreddit: p.data.subreddit,
        upvotes: p.data.ups,
        comentarios: p.data.num_comments
      }))
    };
  } catch (error) {
    console.error('Erro Reddit:', error.message);
    return null;
  }
};

// ===================================
// SERVIÇO: TWITTER/X
// ===================================

const buscarTwitterTrends = async (termo) => {
  try {
    const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
      params: {
        query: termo,
        max_results: 100,
        'tweet.fields': 'public_metrics,created_at'
      },
      headers: {
        Authorization: `Bearer ${API_KEYS.TWITTER}`
      }
    });

    const tweets = response.data.data || [];
    const metricas = tweets.reduce((acc, tweet) => ({
      retweets: acc.retweets + (tweet.public_metrics?.retweet_count || 0),
      likes: acc.likes + (tweet.public_metrics?.like_count || 0),
      replies: acc.replies + (tweet.public_metrics?.reply_count || 0)
    }), { retweets: 0, likes: 0, replies: 0 });

    return {
      termo,
      plataforma: 'Twitter/X',
      totalTweets: tweets.length,
      retweets: metricas.retweets,
      curtidas: metricas.likes,
      respostas: metricas.replies,
      pontuacao: calcularPontuacaoTwitter(metricas),
      topTweets: tweets.slice(0, 5)
    };
  } catch (error) {
    console.error('Erro Twitter:', error.message);
    return null;
  }
};

// ===================================
// FUNÇÕES AUXILIARES
// ===================================

const calcularVolume = (dados) => {
  if (!dados || dados.length === 0) return '0';
  const soma = dados.reduce((acc, d) => acc + d.value, 0);
  return formatarNumero(soma * 1000);
};

const calcularCrescimento = (dados) => {
  if (!dados || dados.length < 2) return '+0%';
  const primeiro = dados[0].value;
  const ultimo = dados[dados.length - 1].value;
  const percentual = ((ultimo - primeiro) / primeiro) * 100;
  return `${percentual > 0 ? '+' : ''}${percentual.toFixed(0)}%`;
};

const calcularPontuacao = (dados) => {
  if (!dados || dados.length === 0) return 0;
  const media = dados.reduce((acc, d) => acc + d.value, 0) / dados.length;
  return Math.min(100, Math.floor(media * 1.5));
};

const calcularPontuacaoYouTube = (views, likes) => {
  const score = (views / 100000) + (likes / 1000);
  return Math.min(100, Math.floor(score));
};

const calcularPontuacaoInstagram = (posts, engajamento) => {
  const score = (posts * 0.5) + (engajamento / 1000);
  return Math.min(100, Math.floor(score));
};

const calcularPontuacaoReddit = (upvotes, comments) => {
  const score = (upvotes / 100) + (comments / 50);
  return Math.min(100, Math.floor(score));
};

const calcularPontuacaoTwitter = (metricas) => {
  const score = (metricas.retweets / 100) + (metricas.likes / 500);
  return Math.min(100, Math.floor(score));
};

const formatarNumero = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// ===================================
// ANÁLISE DE SENTIMENTO (IA Básica)
// ===================================

const analisarSentimento = (textos) => {
  // Palavras-chave positivas e negativas
  const positivas = ['ótimo', 'excelente', 'maravilhoso', 'incrível', 'amei', 'perfeito', 'melhor', 'wow', 'lindo'];
  const negativas = ['ruim', 'horrível', 'péssimo', 'terrível', 'odeio', 'pior', 'decepção', 'fraude'];

  let positivo = 0, negativo = 0, neutro = 0;

  textos.forEach(texto => {
    const textoLower = texto.toLowerCase();
    let score = 0;

    positivas.forEach(palavra => {
      if (textoLower.includes(palavra)) score++;
    });

    negativas.forEach(palavra => {
      if (textoLower.includes(palavra)) score--;
    });

    if (score > 0) positivo++;
    else if (score < 0) negativo++;
    else neutro++;
  });

  const total = textos.length;
  return {
    positivo: ((positivo / total) * 100).toFixed(0),
    neutro: ((neutro / total) * 100).toFixed(0),
    negativo: ((negativo / total) * 100).toFixed(0)
  };
};

// ===================================
// ROTAS DA API
// ===================================

// Rota principal: buscar todas as tendências
app.post('/api/tendencias', async (req, res) => {
  try {
    const { termos, categoria, periodo } = req.body;

    if (!termos || termos.length === 0) {
      return res.status(400).json({ erro: 'Termos de busca são obrigatórios' });
    }

    const resultados = [];

    for (const termo of termos) {
      const [google, youtube, instagram, reddit, twitter] = await Promise.all([
        buscarGoogleTrends(termo),
        buscarYouTubeTrends(termo),
        buscarInstagramTrends(`#${termo.replace(/\s+/g, '')}`),
        buscarRedditTrends(termo),
        buscarTwitterTrends(termo)
      ]);

      // Combinar resultados
      const tendencia = {
        termo,
        categoria,
        timestamp: new Date().toISOString(),
        plataformas: {
          google,
          youtube,
          instagram,
          reddit,
          twitter
        },
        pontuacaoGeral: calcularPontuacaoGeral([google, youtube, instagram, reddit, twitter]),
        recomendacoes: gerarRecomendacoes(termo, [google, youtube, instagram, reddit, twitter])
      };

      resultados.push(tendencia);
    }

    // Ordenar por pontuação
    resultados.sort((a, b) => b.pontuacaoGeral - a.pontuacaoGeral);

    res.json({
      sucesso: true,
      total: resultados.length,
      data: resultados
    });

  } catch (error) {
    console.error('Erro na busca:', error);
    res.status(500).json({ erro: 'Erro ao buscar tendências', detalhes: error.message });
  }
});

// Rota: buscar tendências automáticas (sem termo específico)
app.get('/api/tendencias/auto', async (req, res) => {
  try {
    const termosEstetica = [
      'skincare',
      'limpeza de pele',
      'massagem facial',
      'peeling',
      'harmonização facial',
      'buccal massage',
      'gua sha',
      'skin cycling',
      'preenchimento labial'
    ];

    const resultados = [];

    for (const termo of termosEstetica.slice(0, 5)) {
      const dados = await buscarYouTubeTrends(termo);
      if (dados) resultados.push(dados);
    }

    res.json({
      sucesso: true,
      total: resultados.length,
      data: resultados
    });

  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar tendências automáticas' });
  }
});

// Rota: análise de hashtags
app.post('/api/hashtags/analisar', async (req, res) => {
  try {
    const { hashtags } = req.body;

    const resultados = await Promise.all(
      hashtags.map(tag => buscarInstagramTrends(tag))
    );

    res.json({
      sucesso: true,
      hashtags: resultados.filter(r => r !== null)
    });

  } catch (error) {
    res.status(500).json({ erro: 'Erro ao analisar hashtags' });
  }
});

// ===================================
// FUNÇÕES DE ANÁLISE
// ===================================

const calcularPontuacaoGeral = (plataformas) => {
  const pontuacoes = plataformas
    .filter(p => p !== null)
    .map(p => p.pontuacao || 0);
  
  if (pontuacoes.length === 0) return 0;
  
  return Math.floor(pontuacoes.reduce((a, b) => a + b, 0) / pontuacoes.length);
};

const gerarRecomendacoes = (termo, plataformas) => {
  const recomendacoes = [];

  plataformas.forEach(plat => {
    if (!plat) return;

    if (plat.pontuacao >= 80) {
      recomendacoes.push({
        plataforma: plat.plataforma,
        acao: 'CRIAR CONTEÚDO URGENTE',
        prioridade: 'alta',
        sugestao: `${termo} está viral no ${plat.plataforma}! Crie conteúdo agora.`
      });
    } else if (plat.pontuacao >= 60) {
      recomendacoes.push({
        plataforma: plat.plataforma,
        acao: 'Considerar criação',
        prioridade: 'média',
        sugestao: `${termo} tem bom potencial no ${plat.plataforma}.`
      });
    }
  });

  return recomendacoes;
};

// ===================================
// AGENDADOR AUTOMÁTICO
// ===================================

// Executa análise automática a cada 1 hora
cron.schedule('0 * * * *', async () => {
  console.log('🔄 Executando análise automática de tendências...');
  
  const termosMonitorar = [
    'skincare',
    'estética facial',
    'harmonização'
  ];

  for (const termo of termosMonitorar) {
    const youtube = await buscarYouTubeTrends(termo);
    if (youtube && youtube.pontuacao >= 85) {
      console.log(`🔥 ALERTA: ${termo} está viral no YouTube com pontuação ${youtube.pontuacao}`);
      // Aqui você pode enviar email/notificação
    }
  }
});

// ===================================
// INICIAR SERVIDOR
// ===================================

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 API disponível em http://localhost:${PORT}`);
  console.log(`✅ Pronto para analisar tendências!`);
});

// ===================================
// HEALTH CHECK
// ===================================

app.get('/health', (req, res) => {
  res.json({ 
    status: 'online',
    timestamp: new Date().toISOString(),
    apis: {
      youtube: !!API_KEYS.YOUTUBE,
      twitter: !!API_KEYS.TWITTER,
      instagram: !!API_KEYS.INSTAGRAM,
      serpapi: !!API_KEYS.SERPAPI,
      reddit: !!API_KEYS.REDDIT_CLIENT_ID
    }
  });
});
