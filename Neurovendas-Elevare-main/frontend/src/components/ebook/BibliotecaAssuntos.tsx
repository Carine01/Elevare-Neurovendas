import { BookOpen, Target, Award } from 'lucide-react';

export interface AssuntoEbook {
  id: number;
  nome: string;
  estado: string;
  energia: 'alta' | 'média' | 'baixa';
  exemplo: string;
  estruturaSugerida?: string;
}

export interface CategoriaAssuntos {
  nome: string;
  icon: typeof BookOpen;
  color: string;
  descricao: string;
  assuntos: AssuntoEbook[];
}

export const bibliotecaAssuntosCompleta: Record<string, CategoriaAssuntos> = {
  'educar-publico': {
    nome: 'Educar o Público',
    icon: BookOpen,
    color: 'blue',
    descricao: 'Conteúdos educativos para aumentar consciência',
    assuntos: [
      {
        id: 1,
        nome: 'O que é [procedimento]',
        estado: 'curiosidade',
        energia: 'alta',
        exemplo: 'O que é Microagulhamento',
        estruturaSugerida: 'educacao-desejo-cta'
      },
      {
        id: 2,
        nome: 'Como funciona [técnica]',
        estado: 'interesse',
        energia: 'alta',
        exemplo: 'Como funciona o Peeling Químico',
        estruturaSugerida: 'educacao-desejo-cta'
      },
      {
        id: 3,
        nome: 'Benefícios de [tratamento]',
        estado: 'pesquisa',
        energia: 'média',
        exemplo: 'Benefícios da Criolipólise',
        estruturaSugerida: 'problematizacao-solucao'
      },
      {
        id: 4,
        nome: 'Mitos e verdades sobre [tema]',
        estado: 'dúvida',
        energia: 'média',
        exemplo: 'Mitos sobre Botox',
        estruturaSugerida: 'destruicao-objecoes'
      },
      {
        id: 5,
        nome: 'Cuidados essenciais com [área]',
        estado: 'prevenção',
        energia: 'baixa',
        exemplo: 'Cuidados com a Pele no Verão',
        estruturaSugerida: 'educacao-desejo-cta'
      },
      {
        id: 6,
        nome: 'Passo a passo de [rotina]',
        estado: 'ação',
        energia: 'alta',
        exemplo: 'Rotina de Skincare Noturna',
        estruturaSugerida: 'educacao-desejo-cta'
      }
    ]
  },
  'ajudar-decidir': {
    nome: 'Ajudar a Decidir',
    icon: Target,
    color: 'purple',
    descricao: 'Facilitar decisões de compra informadas',
    assuntos: [
      {
        id: 7,
        nome: '[Tratamento A] ou [B]: qual escolher?',
        estado: 'comparação',
        energia: 'alta',
        exemplo: 'Harmonização ou Botox: qual escolher?',
        estruturaSugerida: 'problematizacao-solucao'
      },
      {
        id: 8,
        nome: 'Quando fazer [procedimento]',
        estado: 'timing',
        energia: 'média',
        exemplo: 'Quando fazer Preenchimento',
        estruturaSugerida: 'educacao-desejo-cta'
      },
      {
        id: 9,
        nome: '[Tratamento] é para você?',
        estado: 'identificação',
        energia: 'média',
        exemplo: 'Lipo LAD é para você?',
        estruturaSugerida: 'problematizacao-solucao'
      },
      {
        id: 10,
        nome: 'Sinais de que você precisa de [solução]',
        estado: 'reconhecimento',
        energia: 'alta',
        exemplo: 'Sinais de flacidez facial',
        estruturaSugerida: 'problematizacao-solucao'
      },
      {
        id: 11,
        nome: 'Como escolher o profissional certo',
        estado: 'segurança',
        energia: 'alta',
        exemplo: 'Como escolher esteticista',
        estruturaSugerida: 'autoridade-expertise'
      },
      {
        id: 12,
        nome: 'Expectativas realistas sobre [resultado]',
        estado: 'conscientização',
        energia: 'média',
        exemplo: 'Expectativas de Harmonização',
        estruturaSugerida: 'educacao-desejo-cta'
      }
    ]
  },
  'posicionar-expertise': {
    nome: 'Posicionar sua Expertise',
    icon: Award,
    color: 'indigo',
    descricao: 'Demonstrar autoridade e diferenciação',
    assuntos: [
      {
        id: 13,
        nome: 'Minha abordagem para [problema]',
        estado: 'autoridade',
        energia: 'alta',
        exemplo: 'Como trato olheiras profundas',
        estruturaSugerida: 'autoridade-expertise'
      },
      {
        id: 14,
        nome: 'Por que eu escolhi [especialização]',
        estado: 'conexão',
        energia: 'média',
        exemplo: 'Por que harmonização facial',
        estruturaSugerida: 'historia-transformacao'
      },
      {
        id: 15,
        nome: 'Casos reais que transformei',
        estado: 'prova',
        energia: 'alta',
        exemplo: 'Transformações em Micropigmentação',
        estruturaSugerida: 'historia-transformacao'
      },
      {
        id: 16,
        nome: 'O que me diferencia no mercado',
        estado: 'diferenciação',
        energia: 'alta',
        exemplo: 'Meu protocolo exclusivo',
        estruturaSugerida: 'autoridade-expertise'
      },
      {
        id: 17,
        nome: 'Minha história com [área]',
        estado: 'storytelling',
        energia: 'baixa',
        exemplo: 'Como me tornei especialista',
        estruturaSugerida: 'historia-transformacao'
      },
      {
        id: 18,
        nome: 'Valores que guiam meu trabalho',
        estado: 'valores',
        energia: 'média',
        exemplo: 'Naturalidade acima de tudo',
        estruturaSugerida: 'autoridade-expertise'
      }
    ]
  }
};

export const getAssuntoPorId = (id: number): AssuntoEbook | undefined => {
  for (const categoria of Object.values(bibliotecaAssuntosCompleta)) {
    const assunto = categoria.assuntos.find(a => a.id === id);
    if (assunto) return assunto;
  }
  return undefined;
};

export const getCategoriaPorAssunto = (assuntoId: number): CategoriaAssuntos | undefined => {
  for (const categoria of Object.values(bibliotecaAssuntosCompleta)) {
    if (categoria.assuntos.some(a => a.id === assuntoId)) {
      return categoria;
    }
  }
  return undefined;
};
