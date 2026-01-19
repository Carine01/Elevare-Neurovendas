import React, { useState, useEffect } from 'react';
import { X, Instagram, Mail, MessageCircle, Zap, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CopyDivulgacao {
  instagram: string;
  stories: string;
  email: string;
  whatsapp: string;
}

interface CopyDivulgacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  ebookTitulo: string;
  assunto: string;
  nomeProfissional: string;
  especialidade: string;
}

export const CopyDivulgacaoModal: React.FC<CopyDivulgacaoModalProps> = ({
  isOpen,
  onClose,
  ebookTitulo,
  assunto,
  nomeProfissional,
  especialidade
}) => {
  const [generatedCopy, setGeneratedCopy] = useState<CopyDivulgacao | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string>('');

  useEffect(() => {
    if (isOpen && !generatedCopy) {
      gerarCopy();
    }
  }, [isOpen]);

  const gerarCopy = async () => {
    setIsGenerating(true);
    
    // Simular geração (em produção usar API)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const assuntoSimplificado = assunto.replace(/\[.*?\]/g, '').trim();
    
    setGeneratedCopy({
      instagram: `📸 POST INSTAGRAM

🌟 Slide 1:
Você sabia que 80% das pessoas têm dúvidas sobre ${assuntoSimplificado}?

Eu criei um guia COMPLETO e GRATUITO!

✨ Slide 2:
O que você vai aprender:
• Como funciona na prática
• Cuidados essenciais  
• Resultados reais

👉 Slide 3:
Baixe AGORA (link na bio)
ou mande "QUERO" no direct!

#${especialidade.replace(/\s/g, '')} #${assuntoSimplificado.replace(/\s/g, '')}`,

      stories: `📱 SEQUÊNCIA DE STORIES

Story 1:
"Recebo TODA SEMANA perguntas sobre ${assuntoSimplificado}...
Então criei algo especial! 
[Deslize]"

Story 2:
"🎁 MEU NOVO E-BOOK!
'${ebookTitulo}'
→ Completo
→ Fácil de entender
→ 100% grátis"

Story 3:
"Link nos destaques! ⬆️
Ou manda 'QUERO' que eu envio 💌"`,

      email: `📧 EMAIL MARKETING

ASSUNTO: 🎁 ${ebookTitulo}

Oi!

Acabei de lançar meu e-book sobre ${assuntoSimplificado}.

Nele você descobre tudo de forma clara e prática!

E é 100% GRATUITO 🎉

👉 [BAIXAR AGORA]

Qualquer dúvida, responda este email!

Com carinho,
${nomeProfissional}

P.S.: Essa é minha forma de compartilhar conhecimento de qualidade e ajudar você a tomar decisões mais conscientes sobre ${especialidade.toLowerCase()}.`,

      whatsapp: `💬 MENSAGEM WHATSAPP

Oi! Tudo bem? 😊

Criei um e-book COMPLETO sobre ${assuntoSimplificado}!

É o "${ebookTitulo}" - totalmente gratuito.

Te interessa? Posso te enviar agora 💙

[Link do e-book]

${nomeProfissional}
${especialidade}`
    });

    setIsGenerating(false);
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Copy de Divulgação</h3>
            <p className="text-gray-600 mt-1">Pronto para usar nas redes sociais</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <p className="text-gray-600">Gerando copy personalizada...</p>
            </div>
          ) : generatedCopy ? (
            <div className="space-y-6">
              {/* Instagram */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                      <Instagram className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Post Instagram</h4>
                      <p className="text-sm text-gray-500">Carrossel de 3 slides</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(generatedCopy.instagram, 'instagram')}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {copiedId === 'instagram' ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans bg-gray-50 p-4 rounded-lg">
                  {generatedCopy.instagram}
                </pre>
              </div>

              {/* Stories */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Stories</h4>
                      <p className="text-sm text-gray-500">Sequência de 3 stories</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(generatedCopy.stories, 'stories')}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {copiedId === 'stories' ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans bg-gray-50 p-4 rounded-lg">
                  {generatedCopy.stories}
                </pre>
              </div>

              {/* Email */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Email Marketing</h4>
                      <p className="text-sm text-gray-500">Completo com assunto</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(generatedCopy.email, 'email')}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {copiedId === 'email' ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans bg-gray-50 p-4 rounded-lg">
                  {generatedCopy.email}
                </pre>
              </div>

              {/* WhatsApp */}
              <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">WhatsApp</h4>
                      <p className="text-sm text-gray-500">Mensagem direta</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(generatedCopy.whatsapp, 'whatsapp')}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {copiedId === 'whatsapp' ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans bg-gray-50 p-4 rounded-lg">
                  {generatedCopy.whatsapp}
                </pre>
              </div>
            </div>
          ) : null}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
          <Button onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};
