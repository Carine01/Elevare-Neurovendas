// Mock data para Elevare NeuroVendas Landing Page
// LINGUAGEM HUMANIZADA: Termos que uma esteticista realmente usa

export const heroData = {
  headline: "Pare de se sentir perdida no Instagram. Saiba o que postar, quando postar e como vender seus serviços de estética.",
  subheadline: "Organize sua comunicação, crie posts em minutos e saiba exatamente o que falar para fechar mais clientes. Mesmo que você não entenda nada de marketing ou tecnologia.",
  microProof: [
    "Usado por 1.300+ esteticistas no Brasil e exterior",
    "Resultados médios em até 90 dias",
    "Plano gratuito • Sem cartão de crédito"
  ],
  ctaText: "Começar Grátis Agora",
  ctaSubtext: "Sem cartão • Acesso em menos de 2 minutos",
  heroImage: "https://customer-assets.emergentagent.com/job_cf253d20-308c-4b29-8e54-b2ea7c71ddad/artifacts/q1tfgx1a_3a03ae59-16b9-416b-868d-2468eb6bd3a1%20%281%29.png",
  imageAlt: "Dashboard Elevare - Plataforma de gestão para estética"
};

export const diagnosticoPillars = [
  {
    id: 1,
    number: "1",
    title: "Como você se apresenta",
    question: "Sua clínica passa profissionalismo?",
    description: "Veja se seu perfil transmite confiança ou se parece com mais uma clínica qualquer",
    icon: "Target"
  },
  {
    id: 2,
    number: "2",
    title: "Seus preços fazem sentido?",
    question: "Você cobra pelo seu conhecimento ou só pelo tempo?",
    description: "Descubra se você está deixando dinheiro na mesa por medo de cobrar mais",
    icon: "DollarSign"
  },
  {
    id: 3,
    number: "3",
    title: "Sua rotina está saudável?",
    question: "Você é dona do negócio ou escrava dele?",
    description: "Entenda se você está construindo algo ou só trabalhando demais",
    icon: "Briefcase"
  }
];

export const funcionalidades = [
  {
    category: "Entender meu Negócio",
    items: [
      {
        name: "Diagnóstico Gratuito",
        description: "Responda perguntas rápidas e descubra onde seu negócio está travando",
        icon: "LineChart"
      },
      {
        name: "Análise do Instagram",
        description: "Veja se seu perfil está passando a imagem certa para suas clientes",
        icon: "Globe"
      },
      {
        name: "Deixar o Perfil Bonito",
        description: "Ferramentas para criar uma identidade visual profissional",
        icon: "Palette"
      }
    ]
  },
  {
    category: "Criar Conteúdo Sem Sofrimento",
    items: [
      {
        name: "Criar Posts com IA",
        description: "Digite uma ideia e a IA cria o post completo pra você em segundos",
        icon: "Sparkles"
      },
      {
        name: "Stories Prontos",
        description: "Roteiros de stories que engajam e vendem, só copiar e gravar",
        icon: "Film"
      },
      {
        name: "Aparecer no Google",
        description: "Artigos que fazem clientes te encontrarem quando buscam por serviços",
        icon: "Search"
      },
      {
        name: "E-books para Captar Clientes",
        description: "Crie materiais para trocar pelo contato de clientes interessadas",
        icon: "BookOpen"
      }
    ]
  },
  {
    category: "Vender Mais",
    items: [
      {
        name: "Mensagens WhatsApp Prontas",
        description: "Textos testados para responder clientes e fechar mais agendamentos",
        icon: "MessageSquare"
      },
      {
        name: "Materiais de Apoio",
        description: "Dicas e técnicas de vendas aplicadas ao mercado de estética",
        icon: "Zap"
      },
      {
        name: "Calendário de Posts",
        description: "Saiba o que postar cada dia, com sugestões prontas",
        icon: "Calendar"
      }
    ]
  },
  {
    category: "Organizar Clientes",
    items: [
      {
        name: "Lista de Clientes Interessadas",
        description: "Organize contatos que pediram informação para não perder vendas",
        icon: "Users"
      },
      {
        name: "Lembretes Automáticos",
        description: "Acompanhamentos que funcionam mesmo quando você está atendendo",
        icon: "Mail"
      }
    ]
  }
];

export const planos = [
  {
    id: "free",
    name: "Gratuito",
    price: "0",
    period: "/mês",
    description: "Para começar a entender seu negócio",
    subtitle: "Descubra onde você pode melhorar, sem pagar nada",
    features: [
      "100 créditos/mês (renovam todo mês!)",
      "Diagnóstico completo do seu negócio",
      "Análise do seu Instagram",
      "Conversar com a IA sobre seu negócio",
      "Ideias prontas para posts",
      "Ver como está sua bio",
      "Mensagens prontas para WhatsApp",
      "Suporte humano por WhatsApp"
    ],
    highlighted: false,
    ctaText: "Começar Grátis",
    hotmartLink: "#",
    nota: "Sem cartão de crédito. Cancela quando quiser."
  },
  {
    id: "starter",
    name: "Elevare Starter",
    price: "47,00",
    period: "/mês",
    description: "Para quem quer parar de improvisar",
    subtitle: "Organize seu conteúdo e comece a vender com mais confiança",
    features: [
      "Tudo do plano Gratuito",
      "Criar posts com IA (50 por mês)",
      "Ferramentas para deixar perfil bonito",
      "Stories prontos para copiar",
      "Aparecer no Google com artigos",
      "Criar E-books (até 5 por mês)",
      "Materiais de apoio para vendas",
      "Cursos e materiais exclusivos",
      "Suporte por email"
    ],
    highlighted: false,
    ctaText: "Começar Agora",
    hotmartLink: "#"
  },
  {
    id: "pro",
    name: "Elevare Pro",
    price: "97,00",
    period: "/mês",
    description: "Para quem quer crescer de verdade",
    subtitle: "Todas as ferramentas + acompanhamento para você não ficar perdida",
    features: [
      "Tudo do plano Starter",
      "Criar posts com IA (ilimitado)",
      "Criar E-books (ilimitado)",
      "Calendário de posts completo",
      "Lista de clientes ilimitada",
      "Lembretes automáticos",
      "Suporte rápido pelo WhatsApp",
      "Encontros mensais em grupo para tirar dúvidas",
      "Acesso primeiro a novidades"
    ],
    highlighted: true,
    ctaText: "Quero Crescer Agora",
    hotmartLink: "#",
    badge: "MAIS POPULAR"
  }
];

export const faqData = [
  {
    question: "Como funciona o pagamento? Posso cancelar quando quiser?",
    answer: "O pagamento é mensal pela Hotmart, totalmente seguro. Você pode cancelar quando quiser, sem multas. É só entrar na sua área de assinante e cancelar com um clique."
  },
  {
    question: "Quanto tempo leva para ver resultados?",
    answer: "Depende de quanto você se dedica. Quem aplica as ferramentas do Elevare percebe melhora na organização e confiança já nas primeiras semanas. Para resultados no faturamento, recomendamos uns 90 dias usando as ferramentas com consistência."
  },
  {
    question: "Preciso entender de tecnologia para usar?",
    answer: "Não! A plataforma foi feita para ser simples. Se você consegue usar WhatsApp e Instagram, consegue usar o Elevare. E se travar em algo, tem suporte para ajudar."
  },
  {
    question: "E se eu tiver dúvidas ou precisar de ajuda?",
    answer: "Estamos aqui! No plano Starter, você tem suporte por email com resposta em até 24h. No plano Pro, tem suporte rápido pelo WhatsApp e ainda participa de encontros mensais em grupo para tirar dúvidas ao vivo."
  }
];

export const testimonials = [
  {
    id: 1,
    name: "Ludimila Lopes",
    role: "Beauty e Brows - Hillside, NJ",
    image: null,
    text: "Eu cobrava barato e mesmo assim vivia com a agenda vazia. Com o Elevare, consegui organizar minha comunicação e reajustar meus preços. Hoje tenho lista de espera. Não foi mágica — foi parar de improvisar.",
    rating: 5
  },
  {
    id: 2,
    name: "Tainna Basileu",
    role: "Esteticista - Vitória, ES",
    image: null,
    text: "Antes eu perdia muito tempo tentando decidir o que postar e quase sempre desistia. Agora em 15 minutos planejo a semana inteira. A IA me dá ideias e eu só ajusto pro meu jeito.",
    rating: 5
  },
  {
    id: 3,
    name: "Juliana Pegas",
    role: "Fisioterapeuta - Governador Valadares, MG",
    image: null,
    text: "Mudei completamente a forma como apresento meus serviços. Aprendi a falar de valor, não só de preço. Minha taxa de fechamento aumentou muito e o investimento se pagou rapidinho.",
    rating: 5
  }
];

export const socialProof = {
  stats: [
    { number: "1.300+", label: "Profissionais usando" },
    { number: "Até 2x", label: "Aumento de preços entre usuárias ativas" },
    { number: "9 em 10", label: "Se sentem mais seguras para vender" },
    { number: "15 min", label: "Para planejar a semana de conteúdo" }
  ]
};
