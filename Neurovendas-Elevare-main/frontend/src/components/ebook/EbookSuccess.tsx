import { useState } from "react";
import { CheckCircle2, Download, Edit2, ArrowRight, Sparkles, Loader2, Palette, Share2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { CopyDivulgacaoModal } from "./CopyDivulgacaoModal";
import { estilosCapas, EstiloCapa } from "./EstilosCapas";

interface EbookSuccessProps {
  ebookId: string;
  title: string;
  subtitle: string;
  assunto?: string;
  nomeProfissional?: string;
  especialidade?: string;
  onEdit: () => void;
  onCreateAnother: () => void;
  onGoToLibrary: () => void;
}

export default function EbookSuccess({
  ebookId,
  title,
  subtitle,
  assunto = "",
  nomeProfissional = "",
  especialidade = "",
  onEdit,
  onCreateAnother,
  onGoToLibrary,
}: EbookSuccessProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showCapasModal, setShowCapasModal] = useState(false);
  const [selectedEstilo, setSelectedEstilo] = useState<EstiloCapa>(estilosCapas[0]);
  const { toast } = useToast();

  const handleGeneratePDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const response = await api.post("/api/ebook-new/generate-pdf", {
        ebook_id: ebookId,
      });
      
      if (response.data.success && response.data.pdf_url) {
        setPdfUrl(response.data.pdf_url);
        toast({ title: "Sucesso!", description: "PDF gerado com sucesso!" });
      } else {
        throw new Error("Erro ao gerar PDF");
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.response?.data?.detail || "Erro ao gerar PDF.", variant: "destructive" });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      // Se for base64, criar link de download
      if (pdfUrl.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = `${title.replace(/\s+/g, "-")}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(pdfUrl, "_blank");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-12 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">E-book Criado!</h1>
          <p className="text-green-100">Seu material foi gerado com sucesso</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* E-book Info */}
          <div className="bg-slate-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
            <p className="text-slate-600">{subtitle}</p>
          </div>

          {/* PDF Generation Section */}
          {!pdfUrl ? (
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 mb-8 border border-violet-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-violet-900">Finalize seu E-book</h3>
                  <p className="text-sm text-violet-700">
                    Gere o PDF profissional com capa, sumário e capítulos organizados
                  </p>
                </div>
              </div>
              <Button
                onClick={handleGeneratePDF}
                disabled={isGeneratingPdf}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                size="lg"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Gerando PDF...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Gerar PDF Profissional
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border border-green-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-green-900">Material Finalizado!</h3>
                  <p className="text-sm text-green-700">
                    Seu e-book está pronto para download
                  </p>
                </div>
              </div>
              <Button
                onClick={handleDownload}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Baixar PDF
              </Button>
            </div>
          )}

          {/* New Actions: Copy & Capa */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Button
              onClick={() => setShowCopyModal(true)}
              variant="outline"
              className="flex items-center justify-center gap-2 border-pink-200 text-pink-700 hover:bg-pink-50"
            >
              <Share2 className="w-4 h-4" />
              Copy de Divulgação
            </Button>
            <Button
              onClick={() => setShowCapasModal(true)}
              variant="outline"
              className="flex items-center justify-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
            >
              <Palette className="w-4 h-4" />
              Trocar Capa
            </Button>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={onEdit}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Editar Conteúdo
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={onCreateAnother}
                variant="ghost"
                className="flex items-center justify-center gap-2 text-slate-600"
              >
                <Sparkles className="w-4 h-4" />
                Criar Outro
              </Button>
              <Button
                onClick={onGoToLibrary}
                variant="ghost"
                className="flex items-center justify-center gap-2 text-slate-600"
              >
                Ver Biblioteca
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modais */}
      <CopyDivulgacaoModal
        isOpen={showCopyModal}
        onClose={() => setShowCopyModal(false)}
        ebookTitulo={title}
        assunto={assunto}
        nomeProfissional={nomeProfissional}
        especialidade={especialidade}
      />

      {/* Modal Capas */}
      {showCapasModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Escolha o Estilo da Capa</h3>
                <p className="text-gray-600 mt-1">{estilosCapas.length} estilos profissionais</p>
              </div>
              <button
                onClick={() => setShowCapasModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Fechar modal de capas"
              >
                <Download className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {estilosCapas.map((estilo) => (
                  <button
                    key={estilo.id}
                    onClick={() => {
                      setSelectedEstilo(estilo);
                      toast({ title: "Capa alterada!", description: `Estilo: ${estilo.nome}` });
                    }}
                    className={`group p-4 rounded-xl border-2 transition-all text-left ${
                      selectedEstilo.id === estilo.id
                        ? 'border-indigo-600 shadow-lg ring-2 ring-indigo-200'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div 
                      className="w-full aspect-[3/4] rounded-lg mb-4 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden"
                      style={{ 
                        background: estilo.cores.gradiente || estilo.cores.bg,
                        color: estilo.cores.primary 
                      }}
                    >
                      <div className="relative z-10">
                        <div className="text-xs font-semibold mb-2" style={{ color: estilo.cores.accent }}>
                          {especialidade || "Estética"}
                        </div>
                        <div className="text-lg font-bold mb-2 line-clamp-3">{title}</div>
                        <div className="text-sm opacity-90">{nomeProfissional || "Profissional"}</div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{estilo.nome}</h4>
                    <p className="text-sm text-gray-600">{estilo.descricao}</p>
                    {selectedEstilo.id === estilo.id && (
                      <div className="mt-3 flex items-center gap-2 text-indigo-600">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-semibold text-sm">Selecionado</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
              <Button onClick={() => setShowCapasModal(false)} className="w-full">
                Aplicar e Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
