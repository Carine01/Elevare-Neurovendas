import React, { useState } from 'react';
import { X, FileText, Sparkles, Target, Heart, TrendingUp, Lightbulb, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AperfeicoarCapituloModalProps {
  isOpen: boolean;
  onClose: () => void;
  capituloTitulo: string;
  conteudoAtual: string;
  onAperfeicoar: (novoConteudo: string, tipoAperfeicoamento: string) => void;
}

interface OpcaoAperfeicoamento {
  id: string;
  titulo: string;
  descricao: string;
  icon: typeof FileText;
  color: string;
}

const opcoesAperfeicoamento: OpcaoAperfeicoamento[] = [
  {
    id: 'mais-longo',
    titulo: 'Expandir Conteúdo',
    descricao: 'Adicionar mais detalhes, exemplos e profundidade',
    icon: FileText,
    color: 'indigo'
  },
  {
    id: 'mais-atrativo',
    titulo: 'Mais Envolvente',
    descricao: 'Tornar a linguagem mais cativante e persuasiva',
    icon: Sparkles,
    color: 'purple'
  },
  {
    id: 'adicionar-exemplos',
    titulo: 'Exemplos Práticos',
    descricao: 'Incluir casos reais e situações do dia a dia',
    icon: Target,
    color: 'green'
  },
  {
    id: 'storytelling',
    titulo: 'Narrativa Emocional',
    descricao: 'Usar storytelling para conectar emocionalmente',
    icon: Heart,
    color: 'pink'
  },
  {
    id: 'mais-dados',
    titulo: 'Baseado em Evidências',
    descricao: 'Adicionar dados, estatísticas e referências',
    icon: TrendingUp,
    color: 'blue'
  },
  {
    id: 'mais-didatico',
    titulo: 'Mais Didático',
    descricao: 'Simplificar e tornar mais acessível',
    icon: Lightbulb,
    color: 'amber'
  }
];

export const AperfeicoarCapituloModal: React.FC<AperfeicoarCapituloModalProps> = ({
  isOpen,
  onClose,
  capituloTitulo,
  conteudoAtual,
  onAperfeicoar
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleAperfeicoar = async (opcaoId: string) => {
    setSelectedOption(opcaoId);
    setIsProcessing(true);

    // Simular processamento (em produção usar API)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const opcao = opcoesAperfeicoamento.find(o => o.id === opcaoId);
    const novoConteudo = `${conteudoAtual}\n\n[APERFEIÇOADO COM: ${opcao?.titulo}]\n\n✨ Conteúdo expandido com ${opcao?.descricao.toLowerCase()}...\n\n[Aqui seria o conteúdo gerado pela IA com base na opção escolhida]`;

    onAperfeicoar(novoConteudo, opcaoId);
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Aperfeiçoar Capítulo</h3>
            <p className="text-gray-600 mt-1">
              Capítulo: <span className="font-semibold">{capituloTitulo}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isProcessing}
            aria-label="Fechar modal"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <p className="text-gray-900 font-semibold mb-2">Lucrésia está aperfeiçoando...</p>
              <p className="text-gray-600 text-sm">
                Aplicando: {opcoesAperfeicoamento.find(o => o.id === selectedOption)?.titulo}
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                Escolha como deseja aperfeiçoar este capítulo com a Lucrésia IA:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {opcoesAperfeicoamento.map((opcao) => {
                  const IconComponent = opcao.icon;
                  return (
                    <button
                      key={opcao.id}
                      onClick={() => handleAperfeicoar(opcao.id)}
                      className={`
                        group p-6 border-2 border-gray-200 rounded-xl 
                        hover:border-${opcao.color}-500 hover:bg-${opcao.color}-50 
                        transition-all text-left
                        focus:outline-none focus:ring-2 focus:ring-${opcao.color}-500
                      `}
                    >
                      <div className={`
                        w-12 h-12 rounded-lg bg-${opcao.color}-100 
                        flex items-center justify-center mb-4
                        group-hover:scale-110 transition-transform
                      `}>
                        <IconComponent className={`w-6 h-6 text-${opcao.color}-600`} />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{opcao.titulo}</h4>
                      <p className="text-sm text-gray-600">{opcao.descricao}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-indigo-900">
                      Dica da Lucrésia
                    </p>
                    <p className="text-sm text-indigo-700 mt-1">
                      Você pode aperfeiçoar o mesmo capítulo múltiplas vezes com opções diferentes 
                      para criar a versão perfeita!
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
            disabled={isProcessing}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};
