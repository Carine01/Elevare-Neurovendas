import React, { useEffect, useState } from "react";
import NeuroVendasLayout from "@/components/dashboard/NeuroVendasLayout";
import { useCredits } from "@/hooks/useCredits";
import {
  Brain,
  Target,
  Users,
  Zap,
  TrendingUp,
  MessageCircle,
  Award,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
  BookOpen,
  Lightbulb,
  Shield,
  ArrowRight,
} from "lucide-react";

type StepId = 0 | 1 | 2 | 3 | 4;
type NivelTecnico = "mais-tecnico" | "equilibrado" | "mais-acessivel";
type Personalidade = "autoridade-proxima" | "cientifica-segura" | "transformadora-inspiradora" | "educadora-estrategica";

interface FormDataState {
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

type AlertaTipo = "critico" | "atencao" | "oportunidade";

interface Diagnostico {
  estruturaSugerida?: string;
  gatilhosPrincipais?: string[];
  abordagemConteudo?: string;
  alertas: Array<{ tipo: AlertaTipo; mensagem: string }>;
}

interface EbookCapitulo {
  numero: number;
  titulo: string;
  objetivo_estrategico: string;
  conteudo_completo: string;
  gatilho_usado: string;
  transicao: string;
}

interface EbookConteudo {
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

interface AnthropicTextBlock {
  type: "text" | string;
  text?: string;
}

interface AnthropicResponse {
  content?: AnthropicTextBlock[];
}

const ANTHROPIC_API_URL = import.meta.env.VITE_ANTHROPIC_API_URL || "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = import.meta.env.VITE_ANTHROPIC_MODEL || "claude-3-5-sonnet-20240620";
const ANTHROPIC_API_VERSION = import.meta.env.VITE_ANTHROPIC_API_VERSION || "2023-06-01";
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

const ElevareEbookGenerator = () => {
  const [currentStep, setCurrentStep] = useState<StepId>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<EbookConteudo | null>(null);
  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Créditos
  const { balance, fetchBalance, checkCredits, consumeCredits, refundCredits } = useCredits();
  const EBOOK_GENERATION_COST = 10.0;

  const [formData, setFormData] = useState<FormDataState>({
    objetivoReal: "",
    tipoObjetivo: "",
    publicoEspecifico: "",
    nivelConsciencia: "",
    especialidade: "",
    nomeProfissional: "",
    nomeClinica: "",
    diferencialUnico: "",
    principalObjecao: "",
    nivelTecnico: "equilibrado",
    personalidade: "autoridade-proxima",
    temaPrincipal: "",
    anguloEstrategico: "",
  });

  // Buscar saldo de créditos ao montar
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const steps = [
    { id: 0, title: "Diagnóstico Estratégico", icon: Brain },
    { id: 1, title: "Posicionamento", icon: Award },
    { id: 2, title: "Contexto da Profissional", icon: Users },
    { id: 3, title: "Arquitetura do Conteúdo", icon: BookOpen },
    { id: 4, title: "Geração Inteligente", icon: Zap },
  ];

  const objetivosReais = [
    {
      value: "captar-leads-qualificados",
      label: "Captar Leads Qualificados",
      icon: Target,
      desc: "Atrair potenciais clientes prontos para agendar",
      estrutura: "educacao-desejo-cta",
      gatilhos: ["prova-social", "escassez-sutil", "beneficio-especifico"],
    },
    {
      value: "educar-mercado",
      label: "Educar o Mercado",
      icon: Lightbulb,
      desc: "Elevar consciência sobre um procedimento/conceito",
      estrutura: "problema-solucao-autoridade",
      gatilhos: ["autoridade-tecnica", "cases-reais", "desmistificacao"],
    },
    {
      value: "vender-procedimento",
      label: "Vender Procedimento Específico",
      icon: TrendingUp,
      desc: "Conduzir para decisão de compra de um serviço",
      estrutura: "storytelling-transformacao-oferta",
      gatilhos: ["transformacao-visual", "urgencia-natural", "quebra-objecoes"],
    },
    {
      value: "reativar-base",
      label: "Reativar Base Existente",
      icon: MessageCircle,
      desc: "Reconectar com clientes antigos ou inativos",
      estrutura: "novidade-valor-reconexao",
      gatilhos: ["exclusividade", "atualizacao", "relacionamento"],
    },
    {
      value: "posicionar-autoridade",
      label: "Posicionar como Autoridade",
      icon: Shield,
      desc: "Estabelecer liderança de pensamento na área",
      estrutura: "visao-expertise-manifesto",
      gatilhos: ["opiniao-forte", "metodologia-propria", "visao-futura"],
    },
  ];

  const niveisConsciencia = [
    {
      value: "inconsciente",
      label: "Inconsciente",
      desc: "Nem sabe que tem um problema",
      abordagem: "Despertar consciência → Nomear o problema → Mostrar que é solucionável",
    },
    {
      value: "consciente-problema",
      label: "Consciente do Problema",
      desc: "Sabe que tem o problema, não conhece soluções",
      abordagem: "Educar sobre soluções → Mostrar que funciona → Posicionar sua abordagem",
    },
    {
      value: "consciente-solucao",
      label: "Consciente da Solução",
      desc: "Conhece soluções, ainda não escolheu uma",
      abordagem: "Diferenciar sua solução → Quebrar objeções → Facilitar decisão",
    },
    {
      value: "consciente-produto",
      label: "Consciente do Produto",
      desc: "Conhece você, está decidindo se compra",
      abordagem: "Prova social → Reduzir risco → Empurrar decisão",
    },
    {
      value: "mais-consciente",
      label: "Mais Consciente",
      desc: "Cliente pronto, só precisa do empurrão final",
      abordagem: "Oferta direta → Urgência → Facilitação máxima",
    },
  ];

  const especialidades = [
    { value: "crioterapia", label: "Crioterapia", tags: ["emagrecimento", "dor", "recuperacao"] },
    { value: "facial", label: "Estética Facial", tags: ["rejuvenescimento", "harmonizacao", "tratamentos"] },
    { value: "corporal", label: "Estética Corporal", tags: ["modelagem", "gordura-localizada", "flacidez"] },
    { value: "integrativa", label: "Estética Integrativa", tags: ["holistico", "saude", "bem-estar"] },
    { value: "capilar", label: "Estética Capilar", tags: ["queda", "crescimento", "saude-capilar"] },
    { value: "pos-operatorio", label: "Pós-Operatório", tags: ["recuperacao", "drenagem", "cicatrizacao"] },
    { value: "nutriestetica", label: "Nutriestética", tags: ["nutricao", "pele", "suplementacao"] },
  ];

  const personalidades = [
    {
      value: "autoridade-proxima",
      label: "Autoridade Próxima",
      desc: "Especialista acessível, que explica com clareza",
      tom: "Você, parceria, didático, confiante mas humano",
    },
    {
      value: "cientifica-segura",
      label: "Científica Segura",
      desc: "Baseada em evidências, referências técnicas",
      tom: "Estudos mostram, evidências, protocolos, precisão",
    },
    {
      value: "transformadora-inspiradora",
      label: "Transformadora Inspiradora",
      desc: "Foco em resultados e histórias de transformação",
      tom: "Histórias reais, antes e depois, jornada, empoderamento",
    },
    {
      value: "educadora-estrategica",
      label: "Educadora Estratégica",
      desc: "Ensina o mercado, desmistifica, lidera pensamento",
      tom: "A verdade é, o que ninguém conta, estratégia, visão",
    },
  ];

  const updateFormData = <K extends keyof FormDataState>(field: K, value: FormDataState[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const gerarDiagnostico = () => {
    const objetivo = objetivosReais.find((o) => o.value === formData.tipoObjetivo);
    const consciencia = niveisConsciencia.find((n) => n.value === formData.nivelConsciencia);

    const diag: Diagnostico = {
      estruturaSugerida: objetivo?.estrutura,
      gatilhosPrincipais: objetivo?.gatilhos ?? [],
      abordagemConteudo: consciencia?.abordagem,
      alertas: [],
    };

    if (formData.tipoObjetivo === "vender-procedimento" && formData.nivelConsciencia === "inconsciente") {
      diag.alertas.push({
        tipo: "critico",
        mensagem:
          "Conflito estratégico: Impossível vender diretamente para quem não sabe que tem problema. Recomendo: primeiro educar (e-book 1) → depois vender (e-book 2).",
      });
    }

    if (formData.tipoObjetivo === "posicionar-autoridade" && !formData.diferencialUnico) {
      diag.alertas.push({
        tipo: "atencao",
        mensagem: "Para posicionar autoridade, você PRECISA de um diferencial claro. Sem isso, vira só mais uma voz.",
      });
    }

    if (formData.nivelConsciencia === "mais-consciente" && !formData.principalObjecao) {
      diag.alertas.push({
        tipo: "oportunidade",
        mensagem: "Cliente quente sem trabalhar objeção = conversão baixa. Defina qual a principal trava dele.",
      });
    }

    setDiagnostico(diag);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return (
          formData.objetivoReal &&
          formData.tipoObjetivo &&
          formData.publicoEspecifico &&
          formData.nivelConsciencia &&
          formData.especialidade
        );
      case 1:
        return true;
      case 2:
        return formData.nomeProfissional && formData.temaPrincipal;
      case 3:
        return formData.anguloEstrategico;
      default:
        return true;
    }
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(4, (prev + 1) as StepId));
  const previousStep = () => setCurrentStep((prev) => Math.max(0, (prev - 1) as StepId));

  const extractJsonFromText = (text: string) => {
    const withoutFences = text.replace(/```json|```/g, "").trim();
    const match = withoutFences.match(/\{[\s\S]*\}/);
    return match ? match[0] : "";
  };

  const isEbookConteudo = (payload: unknown): payload is EbookConteudo => {
    if (!payload || typeof payload !== "object") return false;
    const data = payload as Partial<EbookConteudo>;
    return (
      typeof data.titulo === "string" &&
      typeof data.subtitulo === "string" &&
      Array.isArray(data.capitulos) &&
      data.capitulos.length > 0 &&
      typeof data.introducao === "object" &&
      typeof data.conclusao === "object" &&
      typeof data.metadata_estrategica === "object"
    );
  };

  const parseEbookPayload = (rawText: string): EbookConteudo => {
    const jsonText = extractJsonFromText(rawText);
    if (!jsonText) {
      throw new Error("Nenhum JSON encontrado na resposta do modelo.");
    }

    const parsed = JSON.parse(jsonText);
    if (!isEbookConteudo(parsed)) {
      throw new Error("Resposta do modelo fora do formato esperado.");
    }

    return {
      ...parsed,
      capitulos: parsed.capitulos ?? [],
      introducao: parsed.introducao ?? { gancho: "", contexto: "", promessa: "", paragrafo_abertura: "" },
      conclusao: parsed.conclusao ?? { sintese: "", transformacao: "", cta_natural: "", paragrafo_fechamento: "" },
      metadata_estrategica: {
        objecoes_trabalhadas: parsed.metadata_estrategica?.objecoes_trabalhadas ?? [],
        momentos_autoridade: parsed.metadata_estrategica?.momentos_autoridade ?? [],
        pontos_conversao: parsed.metadata_estrategica?.pontos_conversao ?? [],
      },
    };
  };

  const handleRetry = () => {
    setApiError(null);
    setGeneratedContent(null);
    setIsGenerating(false);
    setCurrentStep(3);
  };

  const gerarEbookInteligente = async () => {
    // Verificar créditos ANTES de iniciar
    const creditCheck = await checkCredits("ebook_generation");
    if (!creditCheck?.available) {
      setApiError(`Créditos insuficientes. Necessário: ${creditCheck?.required_credits || EBOOK_GENERATION_COST} créditos.`);
      return;
    }

    setIsGenerating(true);
    setApiError(null);
    setPdfError(null);
    setGeneratedContent(null);
    setCurrentStep(4);

    if (!ANTHROPIC_API_KEY) {
      setApiError("Chave da API Anthropic não configurada (VITE_ANTHROPIC_API_KEY).");
      setIsGenerating(false);
      return;
    }

    try {
      const objetivo = objetivosReais.find((o) => o.value === formData.tipoObjetivo);
      const consciencia = niveisConsciencia.find((n) => n.value === formData.nivelConsciencia);
      const especialidadeData = especialidades.find((e) => e.value === formData.especialidade);
      const personalidadeData = personalidades.find((p) => p.value === formData.personalidade);

      const promptEstrategico = `Você é o sistema editorial inteligente da Elevare, especializado em criar e-books que geram AUTORIDADE e CONVERSÃO para profissionais da estética.

NUNCA escreva texto genérico. Cada palavra precisa servir ao objetivo estratégico.

═══════════════════════════════════════════════════════════════
📊 INTELIGÊNCIA ESTRATÉGICA DO E-BOOK
═══════════════════════════════════════════════════════════════

OBJETIVO REAL: ${objetivo?.label ?? "Objetivo não definido"}
→ ${objetivo?.desc ?? ""}

ESTRUTURA MENTAL: ${objetivo?.estrutura ?? "Estrutura não definida"}
GATILHOS A USAR: ${(objetivo?.gatilhos ?? []).join(", ")}

PÚBLICO: ${formData.publicoEspecifico}
NÍVEL DE CONSCIÊNCIA: ${consciencia?.label ?? "Nível não definido"}
→ ${consciencia?.desc ?? ""}
→ ABORDAGEM: ${consciencia?.abordagem ?? ""}

ESPECIALIDADE: ${especialidadeData?.label ?? "Especialidade não definida"}
TAGS RELEVANTES: ${(especialidadeData?.tags ?? []).join(", ") || "—"}

═══════════════════════════════════════════════════════════════
👤 CONTEXTO DA PROFISSIONAL
═══════════════════════════════════════════════════════════════

PROFISSIONAL: ${formData.nomeProfissional}
CLÍNICA: ${formData.nomeClinica || "Nome não informado"}
DIFERENCIAL ÚNICO: ${formData.diferencialUnico || "A definir no conteúdo"}
PRINCIPAL OBJEÇÃO DO CLIENTE: ${formData.principalObjecao || "Identificar no conteúdo"}

PERSONALIDADE DA MARCA: ${personalidadeData?.label ?? "Personalidade não definida"}
→ ${personalidadeData?.desc ?? ""}
→ TOM: ${personalidadeData?.tom ?? ""}

NÍVEL TÉCNICO: ${
        formData.nivelTecnico === "mais-tecnico"
          ? "Mais técnico (evidências, estudos)"
          : formData.nivelTecnico === "mais-acessivel"
            ? "Mais acessível (analogias, exemplos)"
            : "Equilibrado (didático + técnico)"
      }

═══════════════════════════════════════════════════════════════
📖 TEMA E ÂNGULO
═══════════════════════════════════════════════════════════════

TEMA: ${formData.temaPrincipal}
ÂNGULO ESTRATÉGICO: ${formData.anguloEstrategico}

═══════════════════════════════════════════════════════════════
⚡ MANDAMENTOS ELEVARE
═══════════════════════════════════════════════════════════════

1. LINGUAGEM
   ✓ Profissional SEM ser acadêmica
   ✓ Humana SEM ser superficial
   ✓ Didática SEM ser condescendente
   ✓ Com autoridade tranquila (não grita expertise)

2. ESTRUTURA
   ✓ Cada capítulo conduz ao próximo naturalmente
   ✓ CTA invisível (leitor nem percebe que está sendo guiado)
   ✓ Quebra de objeções distribuída organicamente
   ✓ Prova social contextualizada (não forçada)

3. CONTEÚDO
   ✓ ZERO conteúdo de preenchimento
   ✓ Cada parágrafo tem função estratégica
   ✓ Exemplos REAIS da especialidade (não genéricos)
   ✓ Dados quando agregam autoridade, não por enfeite

4. CONVERSÃO
   ✓ Semear desejo antes de oferecer solução
   ✓ Próximo passo ÓBVIO ao fim de cada capítulo
   ✓ WhatsApp ou agendamento integrado naturalmente
   ✓ Leitor termina QUERENDO conversar, não sentindo que foi vendido

═══════════════════════════════════════════════════════════════
📋 FORMATO DE SAÍDA (JSON)
═══════════════════════════════════════════════════════════════

{
  "titulo": "Título magnético (não óbvio, gera curiosidade)",
  "subtitulo": "Promessa clara + benefício específico",
  "introducao": {
    "gancho": "Primeira frase que prende (história, dado surpreendente, pergunta)",
    "contexto": "Por que isso importa AGORA",
    "promessa": "O que o leitor vai saber/conseguir depois",
    "paragrafo_abertura": "Texto completo de abertura (3-4 parágrafos conectados)"
  },
  "capitulos": [
    {
      "numero": 1,
      "titulo": "Título que gera vontade de ler",
      "objetivo_estrategico": "O que esse capítulo FAZ no cérebro do leitor",
      "conteudo_completo": "Texto desenvolvido (5-8 parágrafos) - didático, fluido, com exemplos reais",
      "gatilho_usado": "Qual gatilho mental está ativado aqui",
      "transicao": "Como ele conecta com o próximo capítulo"
    }
  ],
  "conclusao": {
    "sintese": "Recapitulação do valor entregue",
    "transformacao": "Diferença entre antes e depois de ler",
    "cta_natural": "Próximo passo óbvio (não parece vendas)",
    "paragrafo_fechamento": "Texto completo de fechamento (3 parágrafos)"
  },
  "metadata_estrategica": {
    "objecoes_trabalhadas": ["Lista de objeções quebradas no conteúdo"],
    "momentos_autoridade": ["Onde você estabeleceu expertise"],
    "pontos_conversao": ["Momentos onde semeou desejo de agir"]
  }
}

═══════════════════════════════════════════════════════════════

IMPORTANTE:
- Escreva como se fosse ${formData.nomeProfissional} falando
- Use casos da especialidade ${especialidadeData.label}
- Mantenha o tom ${personalidadeData.label}
- Cada frase serve ao objetivo: ${objetivo.label}
- O leitor está em: ${consciencia?.label ?? "N/A"} - ajuste sua abordagem

Retorne APENAS o JSON completo. Nada de markdown, explicações ou texto adicional.`;

      const response = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": ANTHROPIC_API_VERSION,
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 6000,
          messages: [
            {
              role: "user",
              content: promptEstrategico,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha na geração (${response.status}): ${errorText.slice(0, 400)}`);
      }

      const data: AnthropicResponse = await response.json();
      const contentText = (data.content ?? [])
        .filter((item) => item.type === "text" && item.text)
        .map((item) => item.text ?? "")
        .join("\n")
        .trim();

      if (!contentText) {
        throw new Error("Resposta vazia do modelo.");
      }

      const ebookData = parseEbookPayload(contentText);

      setGeneratedContent(ebookData);

      // SUCESSO: Consumir créditos
      try {
        await consumeCredits("ebook_generation");
      } catch (creditError) {
        console.warn("Aviso: E-book gerado mas falha ao debitar créditos:", creditError);
        // Não falhar geração por erro de créditos
      }
    } catch (error) {
      console.error("Erro ao gerar e-book:", error);
      setApiError(error instanceof Error ? error.message : "Erro desconhecido ao gerar o e-book.");
      
      // FALHA: Reembolsar créditos
      try {
        await refundCredits("ebook_generation", "Geração falhou");
      } catch (refundError) {
        console.warn("Erro ao reembolsar créditos:", refundError);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDFEstrategico = async () => {
    if (!generatedContent) return;

    setPdfError(null);
    setIsDownloadingPdf(true);

    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF();
      pdf.setFont("helvetica", "normal");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      let yPosition = margin;

      const ensureSpace = (linesCount: number, fontSize: number) => {
        const needed = linesCount * fontSize * 0.6 + 6;
        if (yPosition + needed > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
      };

      const addText = (text: string, fontSize: number, options?: { bold?: boolean; center?: boolean; color?: [number, number, number] }) => {
        const { bold = false, center = false, color = [0, 0, 0] } = options || {};
        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", bold ? "bold" : "normal");
        pdf.setTextColor(...color);

        const lines = pdf.splitTextToSize(text, maxWidth);
        ensureSpace(lines.length, fontSize);

        lines.forEach((line) => {
          const xPosition = center ? pageWidth / 2 : margin;
          const align = center ? "center" : "left";
          pdf.text(line, xPosition, yPosition, { align });
          yPosition += fontSize * 0.6;
        });

        yPosition += 6;
      };

      const addSection = (title: string, content: string) => {
        addText(title, 14, { bold: true, color: [79, 70, 229] });
        addText(content, 11);
      };

      if (!generatedContent.capitulos?.length) {
        throw new Error("Conteúdo incompleto para exportação.");
      }

      pdf.setFillColor(249, 250, 251);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      pdf.setTextColor(79, 70, 229);
      addText("ELEVARE", 10, { bold: true, center: true });

      yPosition = pageHeight / 3;
      pdf.setTextColor(30, 41, 59);
      addText(generatedContent.titulo, 22, { bold: true, center: true });
      yPosition += 6;
      pdf.setTextColor(71, 85, 105);
      addText(generatedContent.subtitulo, 14, { center: true });

      yPosition = pageHeight - 55;
      pdf.setTextColor(100, 116, 139);
      addText(`Por ${formData.nomeProfissional}`, 11, { center: true });
      if (formData.nomeClinica) {
        addText(formData.nomeClinica, 10, { center: true });
      }

      pdf.addPage();
      yPosition = margin;

      addSection("POR QUE VOCÊ PRECISA LER ISSO", generatedContent.introducao?.paragrafo_abertura ?? "");

      generatedContent.capitulos.forEach((cap) => {
        addSection(cap.titulo, cap.conteudo_completo);
      });

      addSection("PRÓXIMOS PASSOS", generatedContent.conclusao?.paragrafo_fechamento ?? "");

      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFillColor(249, 250, 251);
      pdf.rect(0, pageHeight - 50, pageWidth, 50, "F");
      yPosition = pageHeight - 35;
      pdf.setTextColor(79, 70, 229);
      addText("Material estratégico criado pelo sistema Elevare", 9, { center: true });
      addText("Designed for conversion, not decoration.", 8, { center: true, color: [100, 116, 139] });

      pdf.save(`${generatedContent.titulo.toLowerCase().replace(/\s+/g, "-")}-elevare.pdf`);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      setPdfError(error instanceof Error ? error.message : "Erro ao gerar PDF.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const exportarParaWhatsApp = () => {
    if (!generatedContent) return;
    const mensagem = `Olá! Acabei de criar um e-book estratégico: "${generatedContent.titulo}". Quer saber mais sobre ${formData.temaPrincipal}?`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 animate-slide-in">
          <div className="inline-block mb-6">
            <div className="text-indigo-400 font-bold text-sm tracking-[0.3em] mb-2">ELEVARE</div>
            <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded"></div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">Gerador de E-books</h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Sistema editorial inteligente que transforma conhecimento em <span className="text-indigo-400 font-semibold">autoridade</span> e autoridade em <span className="text-purple-400 font-semibold">conversão</span>.
          </p>
          <div className="mt-6 flex flex-col md:flex-row gap-3 items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 rounded-full border border-indigo-500/30">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-indigo-300">Inteligência Estratégica Ativa</span>
            </div>
            {balance && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-300">{balance.balance.toFixed(0)} / {balance.total_available_month.toFixed(0)} créditos</span>
              </div>
            )}
          </div>
        </div>

        <div className="glass-dark rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 transition-all ${
                        isActive
                          ? "bg-indigo-600 glow-pulse"
                          : isCompleted
                            ? "bg-green-600"
                            : "bg-slate-700/50 border border-slate-600"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-7 h-7 text-white" />
                      ) : (
                        <Icon className={`w-7 h-7 ${isActive ? "text-white" : "text-slate-400"}`} />
                      )}
                    </div>
                    <div className={`text-center transition-all ${isActive || isCompleted ? "opacity-100" : "opacity-50"}`}>
                      <div
                        className={`font-semibold text-xs mb-1 ${
                          isActive ? "text-indigo-400" : isCompleted ? "text-green-400" : "text-slate-400"
                        }`}
                      >
                        PASSO {idx + 1}
                      </div>
                      <div className="text-white text-xs font-medium hidden md:block">{step.title}</div>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 rounded transition-all ${isCompleted ? "bg-green-600" : "bg-slate-700"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="glass-dark rounded-3xl p-8 md:p-12 animate-slide-in">
          {currentStep === 0 && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Brain className="w-8 h-8 text-indigo-400" />
                  <h2 className="text-3xl font-bold text-white">Diagnóstico Estratégico</h2>
                </div>
                <p className="text-slate-300 text-lg">
                  Antes de escrever qualquer palavra, vamos definir a estratégia que vai fazer esse e-book <span className="text-indigo-400 font-semibold">converter</span>.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-indigo-400 mb-4 tracking-wide">
                    <Target className="w-5 h-5" />
                    1. QUAL O OBJETIVO REAL DESSE E-BOOK?
                  </label>
                  <div className="grid grid-cols-1 gap-3">
                    {objetivosReais.map((obj) => {
                      const Icon = obj.icon;
                      return (
                        <button
                          key={obj.value}
                          onClick={() => updateFormData("tipoObjetivo", obj.value)}
                          className={`card-hover p-5 rounded-xl border-2 text-left transition-all ${
                            formData.tipoObjetivo === obj.value
                              ? "border-indigo-500 bg-indigo-500/20"
                              : "border-slate-600 bg-slate-800/30 hover:border-indigo-400/50"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${formData.tipoObjetivo === obj.value ? "bg-indigo-600" : "bg-slate-700"}`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-white mb-1">{obj.label}</div>
                              <div className="text-sm text-slate-400">{obj.desc}</div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded">{obj.estrutura}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {formData.tipoObjetivo && (
                  <div>
                    <label className="text-sm font-semibold text-slate-300 mb-2 block">Descreva o objetivo específico:</label>
                    <textarea
                      value={formData.objetivoReal}
                      onChange={(e) => updateFormData("objetivoReal", e.target.value)}
                      placeholder="Ex: Quero que agendem consulta de crioterapia para emagrecimento"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-800/50 text-white focus:border-indigo-500 focus:outline-none resize-none"
                    />
                  </div>
                )}

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-indigo-400 mb-3 tracking-wide">
                    <Users className="w-5 h-5" />
                    2. QUEM EXATAMENTE É O PÚBLICO?
                  </label>
                  <input
                    type="text"
                    value={formData.publicoEspecifico}
                    onChange={(e) => updateFormData("publicoEspecifico", e.target.value)}
                    placeholder="Ex: Mulheres 30-45 anos, pós-parto, querem emagrecer mas têm pouco tempo"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-800/50 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-indigo-400 mb-4 tracking-wide">
                    <Lightbulb className="w-5 h-5" />
                    3. NÍVEL DE CONSCIÊNCIA DO PÚBLICO
                  </label>
                  <div className="space-y-3">
                    {niveisConsciencia.map((nivel) => (
                      <button
                        key={nivel.value}
                        onClick={() => updateFormData("nivelConsciencia", nivel.value)}
                        className={`card-hover w-full p-4 rounded-xl border-2 text-left transition-all ${
                          formData.nivelConsciencia === nivel.value
                            ? "border-purple-500 bg-purple-500/20"
                            : "border-slate-600 bg-slate-800/30 hover:border-purple-400/50"
                        }`}
                      >
                        <div className="font-bold text-white mb-1">{nivel.label}</div>
                        <div className="text-sm text-slate-400 mb-2">{nivel.desc}</div>
                        <div className="text-xs text-purple-400 flex items-center gap-2">
                          <ArrowRight className="w-3 h-3" />
                          {nivel.abordagem}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-indigo-400 mb-3 tracking-wide">
                    <Award className="w-5 h-5" />
                    4. SUA ESPECIALIDADE
                  </label>
                  <select
                    value={formData.especialidade}
                    onChange={(e) => updateFormData("especialidade", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-800/50 text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Selecione sua especialidade</option>
                    {especialidades.map((esp) => (
                      <option key={esp.value} value={esp.value}>
                        {esp.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.tipoObjetivo && formData.nivelConsciencia && (
                <div className="mt-8">
                  <button
                    onClick={gerarDiagnostico}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all"
                  >
                    <Brain className="w-5 h-5" />
                    Gerar Diagnóstico Estratégico
                  </button>
                </div>
              )}

              {diagnostico && (
                <div className="mt-6 space-y-4">
                  {diagnostico.alertas.map((alerta, idx) => (
                    <div
                      key={idx}
                      className={`p-5 rounded-xl border-2 ${
                        alerta.tipo === "critico"
                          ? "border-red-500 bg-red-500/10"
                          : alerta.tipo === "atencao"
                            ? "border-yellow-500 bg-yellow-500/10"
                            : "border-green-500 bg-green-500/10"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle
                          className={`w-5 h-5 mt-0.5 ${
                            alerta.tipo === "critico"
                              ? "text-red-400"
                              : alerta.tipo === "atencao"
                                ? "text-yellow-400"
                                : "text-green-400"
                          }`}
                        />
                        <div className="text-sm text-white">{alerta.mensagem}</div>
                      </div>
                    </div>
                  ))}

                  <div className="p-5 rounded-xl border-2 border-indigo-500 bg-indigo-500/10">
                    <div className="font-bold text-indigo-400 mb-2">📐 Estrutura Recomendada:</div>
                    <div className="text-white text-sm">{diagnostico.estruturaSugerida}</div>
                    <div className="font-bold text-indigo-400 mt-3 mb-2">⚡ Gatilhos a Usar:</div>
                    <div className="flex flex-wrap gap-2">
                      {(diagnostico.gatilhosPrincipais ?? []).map((gatilho, idx) => (
                        <span key={idx} className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-full">
                          {gatilho}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Award className="w-8 h-8 text-indigo-400" />
                  <h2 className="text-3xl font-bold text-white">Posicionamento</h2>
                </div>
                <p className="text-slate-300 text-lg">Como você quer que o público te perceba através deste conteúdo?</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold text-indigo-400 mb-4 block tracking-wide">PERSONALIDADE DA MARCA</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {personalidades.map((pers) => (
                      <button
                        key={pers.value}
                        onClick={() => updateFormData("personalidade", pers.value)}
                        className={`card-hover p-5 rounded-xl border-2 text-left transition-all ${
                          formData.personalidade === pers.value
                            ? "border-indigo-500 bg-indigo-500/20"
                            : "border-slate-600 bg-slate-800/30 hover:border-indigo-400/50"
                        }`}
                      >
                        <div className="font-bold text-white mb-2">{pers.label}</div>
                        <div className="text-sm text-slate-400 mb-3">{pers.desc}</div>
                        <div className="text-xs text-indigo-400 italic">Tom: {pers.tom}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-indigo-400 mb-4 block tracking-wide">NÍVEL TÉCNICO DO CONTEÚDO</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { value: "mais-tecnico", label: "Mais Técnico", desc: "Estudos, evidências, protocolos" },
                      { value: "equilibrado", label: "Equilibrado", desc: "Didático + técnico" },
                      { value: "mais-acessivel", label: "Mais Acessível", desc: "Analogias, exemplos práticos" },
                    ].map((nivel) => (
                      <button
                        key={nivel.value}
                        onClick={() => updateFormData("nivelTecnico", nivel.value)}
                        className={`card-hover p-4 rounded-xl border-2 text-center transition-all ${
                          formData.nivelTecnico === nivel.value
                            ? "border-purple-500 bg-purple-500/20"
                            : "border-slate-600 bg-slate-800/30 hover:border-purple-400/50"
                        }`}
                      >
                        <div className="font-bold text-white mb-1">{nivel.label}</div>
                        <div className="text-xs text-slate-400">{nivel.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-8 h-8 text-indigo-400" />
                  <h2 className="text-3xl font-bold text-white">Contexto da Profissional</h2>
                </div>
                <p className="text-slate-300 text-lg">Essas informações personalizam o conteúdo para soar autêntico.</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-300 mb-2 block">Seu Nome *</label>
                    <input
                      type="text"
                      value={formData.nomeProfissional}
                      onChange={(e) => updateFormData("nomeProfissional", e.target.value)}
                      placeholder="Ex: Dra. Ana Silva"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-800/50 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-300 mb-2 block">Nome da Clínica (opcional)</label>
                    <input
                      type="text"
                      value={formData.nomeClinica}
                      onChange={(e) => updateFormData("nomeClinica", e.target.value)}
                      placeholder="Ex: Clínica Beleza & Saúde"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-800/50 text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block">Tema Principal do E-book *</label>
                  <input
                    type="text"
                    value={formData.temaPrincipal}
                    onChange={(e) => updateFormData("temaPrincipal", e.target.value)}
                    placeholder="Ex: Crioterapia para emagrecimento localizado"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-800/50 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block">Seu Diferencial Único</label>
                  <textarea
                    value={formData.diferencialUnico}
                    onChange={(e) => updateFormData("diferencialUnico", e.target.value)}
                    placeholder="Ex: Único protocolo que combina crioterapia com drenagem linfática personalizada"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-800/50 text-white focus:border-indigo-500 focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block">Principal Objeção do Cliente</label>
                  <input
                    type="text"
                    value={formData.principalObjecao}
                    onChange={(e) => updateFormData("principalObjecao", e.target.value)}
                    placeholder="Ex: Acham que crioterapia dói ou não funciona"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-800/50 text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <BookOpen className="w-8 h-8 text-indigo-400" />
                  <h2 className="text-3xl font-bold text-white">Arquitetura do Conteúdo</h2>
                </div>
                <p className="text-slate-300 text-lg">Qual ângulo estratégico vai tornar esse conteúdo magnético?</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-3 block">Ângulo Estratégico *</label>
                  <textarea
                    value={formData.anguloEstrategico}
                    onChange={(e) => updateFormData("anguloEstrategico", e.target.value)}
                    placeholder="Ex: Mostrar que crioterapia não é só 'gelo na barriga', mas ciência que ativa metabolismo de forma mensurável"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-600 bg-slate-800/50 text-white focus:border-indigo-500 focus:outline-none resize-none"
                  />
                  <div className="mt-2 text-xs text-slate-400">
                    💡 Dica: O melhor ângulo desmistifica um mito, revela um segredo ou mostra uma verdade contraintuitiva
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-6 border border-indigo-500/30">
                  <div className="font-bold text-indigo-400 mb-3">📋 Resumo Estratégico</div>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div>
                      <span className="text-indigo-400">Objetivo:</span> {formData.objetivoReal || "—"}
                    </div>
                    <div>
                      <span className="text-indigo-400">Público:</span> {formData.publicoEspecifico || "—"}
                    </div>
                    <div>
                      <span className="text-indigo-400">Consciência:</span> {formData.nivelConsciencia || "—"}
                    </div>
                    <div>
                      <span className="text-indigo-400">Especialidade:</span> {formData.especialidade || "—"}
                    </div>
                    <div>
                      <span className="text-indigo-400">Profissional:</span> {formData.nomeProfissional || "—"}
                    </div>
                    <div>
                      <span className="text-indigo-400">Tema:</span> {formData.temaPrincipal || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8">
              {apiError ? (
                <div className="text-center py-16">
                  <div className="mb-6 inline-flex items-center justify-center rounded-full border-2 border-red-500/60 bg-red-500/10 p-4">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3">Algo deu errado na geração</h2>
                  <p className="text-slate-300 max-w-2xl mx-auto mb-6">{apiError}</p>
                  <div className="flex flex-col md:flex-row gap-3 justify-center">
                    <button
                      onClick={handleRetry}
                      className="bg-slate-800/60 text-white px-6 py-3 rounded-xl font-semibold border border-slate-600 hover:border-slate-500"
                    >
                      Voltar e ajustar parâmetros
                    </button>
                    <button
                      onClick={gerarEbookInteligente}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 transition-all"
                    >
                      <Zap className="w-5 h-5" />
                      Tentar gerar novamente
                    </button>
                  </div>
                </div>
              ) : !generatedContent ? (
                <div className="text-center py-16">
                  <div className="glow-pulse mb-8 inline-block">
                    <Zap className="w-20 h-20 text-indigo-400" />
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-4">Sistema editorial em ação...</h2>
                  <p className="text-slate-300 text-lg mb-12">Gerando conteúdo estratégico que converte.</p>
                  <div className="max-w-md mx-auto space-y-4">
                    {["Analisando objetivo e público...", "Estruturando arquitetura persuasiva...", "Personalizando linguagem...", "Inserindo gatilhos de conversão...", "Quebrando objeções estrategicamente..."].map((text, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-slate-300">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500">
                      <CheckCircle2 className="w-10 h-10 text-green-400" />
                    </div>
                    <h2 className="text-4xl font-bold text-white mb-3">E-book Estratégico Pronto</h2>
                    <p className="text-slate-300 text-lg">Conteúdo otimizado para {formData.tipoObjetivo?.replace("-", " ")}</p>
                  </div>

                  <div className="bg-slate-800/50 rounded-2xl p-8 border-2 border-slate-700">
                    <h3 className="text-2xl font-bold text-white mb-2">{generatedContent.titulo}</h3>
                    <p className="text-slate-300 mb-6">{generatedContent.subtitulo}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-400">{generatedContent.capitulos.length}</div>
                        <div className="text-xs text-slate-400">Capítulos</div>
                      </div>
                      <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                        <div className="text-2xl font-bold text-purple-400">{generatedContent.metadata_estrategica.objecoes_trabalhadas.length}</div>
                        <div className="text-xs text-slate-400">Objeções Quebradas</div>
                      </div>
                      <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                        <div className="text-2xl font-bold text-green-400">{generatedContent.metadata_estrategica.momentos_autoridade.length}</div>
                        <div className="text-xs text-slate-400">Provas de Autoridade</div>
                      </div>
                      <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-400">{generatedContent.metadata_estrategica.pontos_conversao.length}</div>
                        <div className="text-xs text-slate-400">Pontos de Conversão</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={downloadPDFEstrategico}
                        disabled={isDownloadingPdf}
                        className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                          isDownloadingPdf ? "opacity-70 cursor-not-allowed" : "hover:from-indigo-700 hover:to-purple-700"
                        }`}
                      >
                        <BookOpen className="w-5 h-5" />
                        {isDownloadingPdf ? "Gerando PDF..." : "Baixar E-book em PDF"}
                      </button>

                      <button
                        onClick={exportarParaWhatsApp}
                        className="w-full bg-green-600 text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Compartilhar no WhatsApp
                      </button>

                      {pdfError && <div className="text-sm text-red-300 text-center">{pdfError}</div>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-indigo-500/10 rounded-xl p-4 border border-indigo-500/30">
                      <div className="font-bold text-indigo-400 mb-2 text-sm">OBJEÇÕES TRABALHADAS</div>
                      <ul className="space-y-1">
                        {generatedContent.metadata_estrategica.objecoes_trabalhadas.map((obj, idx) => (
                          <li key={idx} className="text-xs text-slate-300">• {obj}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30">
                      <div className="font-bold text-purple-400 mb-2 text-sm">MOMENTOS DE AUTORIDADE</div>
                      <ul className="space-y-1">
                        {generatedContent.metadata_estrategica.momentos_autoridade.map((mom, idx) => (
                          <li key={idx} className="text-xs text-slate-300">• {mom}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                      <div className="font-bold text-green-400 mb-2 text-sm">PONTOS DE CONVERSÃO</div>
                      <ul className="space-y-1">
                        {generatedContent.metadata_estrategica.pontos_conversao.map((ponto, idx) => (
                          <li key={idx} className="text-xs text-slate-300">• {ponto}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl p-6 border border-yellow-500/30">
                    <div className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      PRÓXIMOS PASSOS NO ECOSSISTEMA ELEVARE
                    </div>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400">→</span>
                        <span>Use como isca digital em landing page otimizada</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400">→</span>
                        <span>Integre com WhatsApp Business para qualificação automática</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400">→</span>
                        <span>Alimente funil de e-mail marketing com sequência de nutrição</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-400">→</span>
                        <span>Use em consultas para reforçar posicionamento</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentStep(0);
                      setGeneratedContent(null);
                      setDiagnostico(null);
                      setFormData({
                        objetivoReal: "",
                        tipoObjetivo: "",
                        publicoEspecifico: "",
                        nivelConsciencia: "",
                        especialidade: "",
                        nomeProfissional: "",
                        nomeClinica: "",
                        diferencialUnico: "",
                        principalObjecao: "",
                        nivelTecnico: "equilibrado",
                        personalidade: "autoridade-proxima",
                        temaPrincipal: "",
                        anguloEstrategico: "",
                      });
                    }}
                    className="w-full border-2 border-indigo-500 text-indigo-400 px-6 py-3 rounded-xl font-bold hover:bg-indigo-500/10 transition-all"
                  >
                    Criar Novo E-book Estratégico
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-700">
            {currentStep > 0 && currentStep < 4 && (
              <button
                onClick={previousStep}
                className="flex items-center gap-2 px-6 py-3 text-slate-300 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="font-medium">Voltar</span>
              </button>
            )}

            {currentStep === 0 && <div />}

            {currentStep < 3 && (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`ml-auto flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
                  canProceed()
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                    : "bg-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                <span>Continuar</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {currentStep === 3 && (
              <div className="ml-auto space-y-2">
                {balance && balance.remaining_percent < 20 && (
                  <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30 text-yellow-300 text-sm text-right">
                    ⚠️ Você tem apenas {balance.balance.toFixed(0)} créditos. Cada e-book custa {EBOOK_GENERATION_COST} créditos.
                  </div>
                )}
                <button
                  onClick={gerarEbookInteligente}
                  disabled={!canProceed() || isGenerating || (balance !== null && balance.balance < EBOOK_GENERATION_COST)}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${
                    canProceed() && !isGenerating && (!balance || balance.balance >= EBOOK_GENERATION_COST)
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700"
                      : "bg-slate-700 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Gerando... ({EBOOK_GENERATION_COST} créditos)</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Gerar E-book Estratégico ({EBOOK_GENERATION_COST} créditos)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-12 text-slate-400 text-sm">
          <div className="mb-2">ELEVARE · Sistema Editorial Inteligente</div>
          <div className="italic">Designed for conversion, not decoration.</div>
        </div>
      </div>
    </div>
  );
};

export default function EbooksPage() {
  return (
    <NeuroVendasLayout>
      <ElevareEbookGenerator />
    </NeuroVendasLayout>
  );
}
