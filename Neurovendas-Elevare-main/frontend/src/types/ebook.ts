// Tipos centralizados para o gerador de eBooks
// Single source of truth para tipagem

export type StepId = 0 | 1 | 2 | 3 | 4;
export type NivelTecnico = "mais-tecnico" | "equilibrado" | "mais-acessivel";
export type Personalidade = "autoridade-proxima" | "cientifica-segura" | "transformadora-inspiradora" | "educadora-estrategica";
export type AlertaTipo = "critico" | "atencao" | "oportunidade";

export interface FormDataState {
  objetivoReal: string;
  tipoObjetivo: string;
  publicoEspecifico: string;
  nivelConsciencia: string;
  especialidade: string;
  nomeProfissional: string;
  nomeClinica: string;
  diferencialUnico: string;
  principalObjecao: string;
  nivelTecnico: NivelTecnico;
  personalidade: Personalidade;
  temaPrincipal: string;
  anguloEstrategico: string;
}

export interface Diagnostico {
  estruturaSugerida?: string;
  gatilhosPrincipais?: string[];
  abordagemConteudo?: string;
  alertas: Array<{ tipo: AlertaTipo; mensagem: string }>;
}

export interface EbookCapitulo {
  numero: number;
  titulo: string;
  objetivo_estrategico: string;
  conteudo_completo: string;
  gatilho_usado: string;
  transicao: string;
}

export interface EbookConteudo {
  titulo: string;
  subtitulo: string;
  introducao: {
    gancho: string;
    contexto: string;
    promessa: string;
    paragrafo_abertura: string;
  };
  capitulos: EbookCapitulo[];
  conclusao: {
    sintese: string;
    transformacao: string;
    cta_natural: string;
    paragrafo_fechamento: string;
  };
  metadata_estrategica: {
    objecoes_trabalhadas: string[];
    momentos_autoridade: string[];
    pontos_conversao: string[];
  };
}

export interface AnthropicTextBlock {
  type: "text" | string;
  text?: string;
}

export interface AnthropicResponse {
  content?: AnthropicTextBlock[];
}
