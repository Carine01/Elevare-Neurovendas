export interface EstiloCapa {
  id: string;
  nome: string;
  descricao: string;
  preview: string;
  cores: {
    bg: string;
    primary: string;
    accent: string;
    gradiente?: string;
  };
}

export const estilosCapas: EstiloCapa[] = [
  {
    id: 'minimalista',
    nome: 'Minimalista Clean',
    descricao: 'Fundo branco, tipografia elegante',
    preview: 'Design limpo e profissional',
    cores: {
      bg: '#FFFFFF',
      primary: '#1F2937',
      accent: '#6366F1',
      gradiente: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)'
    }
  },
  {
    id: 'bold',
    nome: 'Bold & Impactante',
    descricao: 'Gradiente vibrante, alto contraste',
    preview: 'Visual marcante e moderno',
    cores: {
      bg: '#4F46E5',
      primary: '#FFFFFF',
      accent: '#FCD34D',
      gradiente: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
  },
  {
    id: 'elegante',
    nome: 'Elegante Premium',
    descricao: 'Tons neutros, detalhes dourados',
    preview: 'Sofisticado e luxuoso',
    cores: {
      bg: '#1F1F1F',
      primary: '#D4AF37',
      accent: '#F5F5F5',
      gradiente: 'linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%)'
    }
  },
  {
    id: 'moderno',
    nome: 'Moderno Gradient',
    descricao: 'Gradiente suave, contemporâneo',
    preview: 'Fresh e atual',
    cores: {
      bg: '#EC4899',
      primary: '#374151',
      accent: '#FBBF24',
      gradiente: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    }
  },
  {
    id: 'profissional',
    nome: 'Profissional Corporate',
    descricao: 'Azul marinho, confiável',
    preview: 'Sério e credível',
    cores: {
      bg: '#1E3A8A',
      primary: '#FFFFFF',
      accent: '#60A5FA',
      gradiente: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)'
    }
  },
  {
    id: 'natural',
    nome: 'Natural Orgânico',
    descricao: 'Verde suave, tons terrosos',
    preview: 'Calmo e acolhedor',
    cores: {
      bg: '#065F46',
      primary: '#FFFFFF',
      accent: '#6EE7B7',
      gradiente: 'linear-gradient(135deg, #065F46 0%, #10B981 100%)'
    }
  },
  {
    id: 'sunset',
    nome: 'Sunset Warm',
    descricao: 'Laranja e rosa, vibrante',
    preview: 'Energético e caloroso',
    cores: {
      bg: '#EA580C',
      primary: '#FFFFFF',
      accent: '#FDE68A',
      gradiente: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)'
    }
  },
  {
    id: 'oceano',
    nome: 'Oceano Sereno',
    descricao: 'Azul turquesa, refrescante',
    preview: 'Tranquilo e inspirador',
    cores: {
      bg: '#0891B2',
      primary: '#FFFFFF',
      accent: '#FDE047',
      gradiente: 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)'
    }
  }
];

export const getEstiloPorId = (id: string): EstiloCapa | undefined => {
  return estilosCapas.find(estilo => estilo.id === id);
};
