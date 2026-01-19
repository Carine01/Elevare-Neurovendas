import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { BackButton, HomeButton } from "@/components/ui/page-header";
import {
  CheckCircle,
  Crown,
  Loader2,
  X,
  Save,
  Camera,
  RotateCcw,
} from "lucide-react";

// ========== TIPOS ==========
interface BrandIdentity {
  brand_name: string;
  instagram_handle: string;
  main_specialty: string;
  sub_specialties: string[];
  treatments: string[];
  brand_archetype: string;
  positioning: string[];
  team_type: string;
  target_audience: string;
  differentiator: string;
  brand_promise: string;
  tone_of_voice: string[];
  keywords: string[];
  forbidden_words: string[];
  content_types: string[];
  bio_text: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  font1: string;
  font2: string;
  logo?: string;
  // Voice Clone fields
  voice_samples: string;
  communication_style: string[];
  sentence_length: string;
  paragraph_style: string;
  catchphrases: string[];
  opening_style: string;
  closing_style: string;
  formality: string;
  punctuation: string[];
  personality: string[];
  style_notes: string;
}

// ========== OPÇÕES ==========
const ARCHETYPES = [
  { id: "O Sábio", label: "O Sábio", desc: "Autoridade científica", icon: "🎓" },
  { id: "O Mago", label: "O Mago", desc: "Transformação visível", icon: "✨" },
  { id: "O Cuidador", label: "O Cuidador", desc: "Acolhimento genuíno", icon: "💝" },
  { id: "O Criador", label: "O Criador", desc: "Inovação exclusiva", icon: "🎨" },
  { id: "O Herói", label: "O Herói", desc: "Empoderamento", icon: "⚡" },
];

const POSITIONING_OPTIONS = [
  { id: "Premium", label: "Premium", desc: "Alta exclusividade", icon: "🎯" },
  { id: "Especialista", label: "Especialista", desc: "Referência técnica", icon: "🔬" },
  { id: "Humanizado", label: "Humanizado", desc: "Relação próxima", icon: "💜" },
  { id: "Resultado", label: "Resultado", desc: "Foco em transformação", icon: "📈" },
  { id: "Inovador", label: "Inovador", desc: "Tecnologia de ponta", icon: "🚀" },
];

const TEAM_TYPES = [
  { id: "Voz Individual", label: "Voz Individual", desc: '"Eu atendo", "eu explico"', icon: "👤" },
  { id: "Voz de Equipe", label: "Voz de Equipe", desc: '"Nós atendemos", "nossa clínica"', icon: "👥" },
  { id: "Voz Institucional", label: "Voz Institucional", desc: '"A clínica trabalha", "o protocolo"', icon: "👨‍👩‍👧‍👦" },
];

const COMMUNICATION_STYLES = [
  { id: "Uso emojis frequentemente", label: "Uso Emojis", icon: "😊" },
  { id: "Faço perguntas retóricas", label: "Perguntas Retóricas", icon: "❓" },
  { id: "Conto histórias/cases", label: "Storytelling", icon: "📖" },
  { id: "Uso termos técnicos", label: "Termos Técnicos", icon: "🔬" },
  { id: "Sou direta e objetiva", label: "Direta", icon: "🎯" },
  { id: "Uso metáforas", label: "Metáforas", icon: "🌟" },
  { id: "Faço analogias do dia a dia", label: "Analogias", icon: "☕" },
  { id: "Uso humor leve", label: "Humor", icon: "😄" },
  { id: "Compartilho vulnerabilidades", label: "Vulnerável", icon: "💝" },
  { id: "Uso dados e estatísticas", label: "Dados/Stats", icon: "📊" },
];

const SENTENCE_LENGTHS = [
  { id: "Frases curtas e diretas", label: "Curtas", desc: "5-10 palavras. Impacto rápido." },
  { id: "Frases médias e equilibradas", label: "Médias", desc: "10-20 palavras. Fluidez natural." },
  { id: "Frases longas e elaboradas", label: "Longas", desc: "20+ palavras. Complexas e ricas." },
  { id: "Mistura variada de tamanhos", label: "Misto", desc: "Varia bastante. Dinâmico." },
];

const PARAGRAPH_STYLES = [
  { id: "Parágrafos curtos (1-2 linhas)", label: "Curtos", desc: "Leitura rápida e dinâmica" },
  { id: "Parágrafos médios (3-5 linhas)", label: "Médios", desc: "Equilíbrio e respiração" },
  { id: "Parágrafos longos (6+ linhas)", label: "Longos", desc: "Desenvolvimento profundo" },
];

const FORMALITY_LEVELS = [
  { id: "Muito informal - como conversa entre amigas", label: "Bem Informal", desc: '"Ó, vou te contar..."', icon: "🗣️" },
  { id: "Informal mas respeitosa", label: "Informal", desc: '"Olha, deixa eu explicar..."', icon: "💬" },
  { id: "Equilibrada - nem formal nem informal", label: "Equilibrada", desc: '"Vou te explicar melhor..."', icon: "⚖️" },
  { id: "Formal mas acessível", label: "Formal", desc: '"É importante entender..."', icon: "💼" },
  { id: "Muito formal e técnica", label: "Muito Formal", desc: '"Considerando os aspectos..."', icon: "🎓" },
];

const PUNCTUATION_STYLES = [
  { id: "Uso muitas reticências...", label: "Reticências..." },
  { id: "Uso exclamações!", label: "Exclamações!" },
  { id: "Faço quebras de linha", label: "Quebras de linha" },
  { id: "Uso CAPS para ênfase", label: "MAIÚSCULAS" },
  { id: "Uso travessões —", label: "Travessões —" },
  { id: "Pontuação tradicional", label: "Tradicional" },
];

const PERSONALITY_TRAITS = [
  { id: "Empática e acolhedora", label: "Empática", icon: "🤗" },
  { id: "Motivadora e inspiradora", label: "Motivadora", icon: "🌟" },
  { id: "Sincera e transparente", label: "Sincera", icon: "💯" },
  { id: "Didática e explicativa", label: "Didática", icon: "👩‍🏫" },
  { id: "Confiante e assertiva", label: "Confiante", icon: "💪" },
  { id: "Leve e bem-humorada", label: "Bem-humorada", icon: "😊" },
];

const TONE_OPTIONS = [
  { id: "Profissional", label: "Profissional", icon: "💼" },
  { id: "Acolhedor", label: "Acolhedor", icon: "🤗" },
  { id: "Educativo", label: "Educativo", icon: "📚" },
  { id: "Inspirador", label: "Inspirador", icon: "✨" },
  { id: "Descontraído", label: "Descontraído", icon: "😊" },
  { id: "Sofisticado", label: "Sofisticado", icon: "💎" },
];

const CONTENT_TYPES = [
  { id: "Carrosséis Educativos", label: "Carrosséis", icon: "📊" },
  { id: "Reels Curtos", label: "Reels", icon: "🎬" },
  { id: "Stories", label: "Stories", icon: "📱" },
  { id: "Antes e Depois", label: "Antes/Depois", icon: "🔄" },
  { id: "Bastidores", label: "Bastidores", icon: "🎥" },
  { id: "Depoimentos", label: "Depoimentos", icon: "💬" },
];

const FONT_OPTIONS = [
  { id: "Inter", label: "Inter", desc: "Moderna e clean" },
  { id: "Playfair Display", label: "Playfair", desc: "Elegante e serifada" },
  { id: "Montserrat", label: "Montserrat", desc: "Versátil e forte" },
  { id: "Lora", label: "Lora", desc: "Sofisticada" },
];

export default function ConstrutorMarcaCompleto() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Tag input temporary values
  const [subSpecialtyInput, setSubSpecialtyInput] = useState("");
  const [treatmentInput, setTreatmentInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [forbiddenInput, setForbiddenInput] = useState("");
  const [catchphraseInput, setCatchphraseInput] = useState("");

  const [identity, setIdentity] = useState<BrandIdentity>({
    brand_name: "",
    instagram_handle: "",
    main_specialty: "",
    sub_specialties: [],
    treatments: [],
    brand_archetype: "",
    positioning: [],
    team_type: "",
    target_audience: "",
    differentiator: "",
    brand_promise: "",
    tone_of_voice: [],
    keywords: [],
    forbidden_words: [],
    content_types: [],
    bio_text: "",
    colors: {
      primary: "#4F46E5",
      secondary: "#7C3AED",
      accent: "#D4A853",
    },
    font1: "",
    font2: "",
    logo: "",
    voice_samples: "",
    communication_style: [],
    sentence_length: "",
    paragraph_style: "",
    catchphrases: [],
    opening_style: "",
    closing_style: "",
    formality: "",
    punctuation: [],
    personality: [],
    style_notes: "",
  });

  useEffect(() => {
    loadExistingData();
  }, []);

  // Auto-save effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (identity.brand_name || identity.instagram_handle) {
        autoSave();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [identity]);

  const loadExistingData = async () => {
    try {
      const response = await api.get("/api/brand-identity");
      if (response.data.identity) {
        setIdentity(response.data.identity);
      }
    } catch (error) {
      console.log("No existing identity");
    }
  };

  const autoSave = async () => {
    setAutoSaving(true);
    try {
      await api.post("/api/brand-identity", identity);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Auto-save failed");
    } finally {
      setAutoSaving(false);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!identity.brand_name || !identity.instagram_handle || !identity.main_specialty || 
        !identity.brand_archetype || !identity.team_type) {
      toast({
        title: "Campos obrigatórios faltando",
        description: "Preencha: Nome da Marca, Instagram, Especialidade Principal, Arquétipo e Voz do Conteúdo",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await api.post("/api/brand-identity", {
        ...identity,
        setup_completed: true,
      });
      
      toast({
        title: "✅ Perfil Completo Salvo!",
        description: "Sua identidade está pronta para uso em todas as ferramentas.",
      });
      
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Tem certeza que deseja limpar todos os dados?")) {
      setIdentity({
        brand_name: "",
        instagram_handle: "",
        main_specialty: "",
        sub_specialties: [],
        treatments: [],
        brand_archetype: "",
        positioning: [],
        team_type: "",
        target_audience: "",
        differentiator: "",
        brand_promise: "",
        tone_of_voice: [],
        keywords: [],
        forbidden_words: [],
        content_types: [],
        bio_text: "",
        colors: {
          primary: "#4F46E5",
          secondary: "#7C3AED",
          accent: "#D4A853",
        },
        font1: "",
        font2: "",
        logo: "",
        voice_samples: "",
        communication_style: [],
        sentence_length: "",
        paragraph_style: "",
        catchphrases: [],
        opening_style: "",
        closing_style: "",
        formality: "",
        punctuation: [],
        personality: [],
        style_notes: "",
      });
      localStorage.removeItem("elevare_brand_profile");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setIdentity(prev => ({ ...prev, logo: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Tag management functions
  const addTag = (field: keyof BrandIdentity, value: string) => {
    const fieldValue = identity[field];
    if (value.trim() && Array.isArray(fieldValue) && !fieldValue.includes(value.trim())) {
      setIdentity(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()],
      }));
    }
  };

  const removeTag = (field: keyof BrandIdentity, value: string) => {
    setIdentity(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter(item => item !== value),
    }));
  };

  // Multi-select toggle
  const toggleMultiSelect = (field: keyof BrandIdentity, value: string) => {
    const currentValues = identity[field] as string[];
    if (currentValues.includes(value)) {
      setIdentity(prev => ({
        ...prev,
        [field]: currentValues.filter(item => item !== value),
      }));
    } else {
      setIdentity(prev => ({
        ...prev,
        [field]: [...currentValues, value],
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BackButton />
            <HomeButton />
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold rounded-xl tracking-wide">
              <Crown className="w-4 h-4" />
              ELEVARE
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 bg-white rounded-xl border transition-opacity ${
            autoSaving || lastSaved ? "opacity-100" : "opacity-0"
          }`}>
            <span className="text-sm text-gray-600">
              {autoSaving ? "Salvando..." : lastSaved ? "✓ Salvo" : ""}
            </span>
          </div>
        </header>

        <div className="grid lg:grid-cols-[360px_1fr] gap-6">
          {/* Preview Sidebar */}
          <aside className="lg:sticky lg:top-6 h-fit">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="text-center pb-4 mb-4 border-b-2 border-gray-200">
                <h3 className="text-lg font-bold mb-1">Perfil de Marca</h3>
                <p className="text-xs text-gray-500">Preview em tempo real</p>
              </div>

              {/* Logo */}
              <div className="text-center mb-4 pb-4 border-b border-gray-200">
                <div 
                  className="w-24 h-24 mx-auto mb-3 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 cursor-pointer hover:border-indigo-500 transition-colors overflow-hidden"
                  onClick={() => document.getElementById("logoInput")?.click()}
                >
                  {identity.logo ? (
                    <img src={identity.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-gray-400">
                      <Camera className="w-8 h-8 mx-auto mb-1" />
                      <div className="text-xs">Logo</div>
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  {identity.brand_name || "Sua Marca"}
                </h2>
                <p className="text-sm text-violet-600 font-semibold">
                  {identity.main_specialty || "—"}
                </p>
              </div>

              {/* Preview Sections */}
              <div className="space-y-3 text-sm">
                <PreviewSection label="Arquétipo">
                  <span className={identity.brand_archetype ? "text-gray-900 font-semibold" : "text-gray-400"}>
                    {identity.brand_archetype || "—"}
                  </span>
                </PreviewSection>

                <PreviewSection label="Voz Narrativa">
                  <span className={identity.team_type ? "text-gray-900 font-semibold" : "text-gray-400"}>
                    {identity.team_type || "—"}
                  </span>
                </PreviewSection>

                <PreviewSection label="Posicionamento">
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {identity.positioning.length > 0 ? (
                      identity.positioning.map(p => (
                        <span key={p} className="px-2 py-0.5 bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-700 rounded-md text-xs font-semibold">
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">Nenhum selecionado</span>
                    )}
                  </div>
                </PreviewSection>

                <PreviewSection label="Clone de Voz IA">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amostras</span>
                      <span className={identity.voice_samples ? "text-gray-900 font-semibold" : "text-gray-400"}>
                        {identity.voice_samples ? "Preenchido" : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Formalidade</span>
                      <span className={identity.formality ? "text-gray-900 font-semibold" : "text-gray-400"}>
                        {identity.formality ? FORMALITY_LEVELS.find(f => f.id === identity.formality)?.label : "—"}
                      </span>
                    </div>
                  </div>
                  {identity.communication_style.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {identity.communication_style.slice(0, 3).map(s => (
                        <span key={s} className="px-2 py-0.5 bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-700 rounded-md text-xs font-semibold">
                          {COMMUNICATION_STYLES.find(cs => cs.id === s)?.label}
                        </span>
                      ))}
                      {identity.communication_style.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">
                          +{identity.communication_style.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </PreviewSection>

                <PreviewSection label="Tom de Voz">
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {identity.tone_of_voice.length > 0 ? (
                      identity.tone_of_voice.map(t => (
                        <span key={t} className="px-2 py-0.5 bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-700 rounded-md text-xs font-semibold">
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </div>
                </PreviewSection>

                <PreviewSection label="Tratamentos">
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {identity.treatments.length > 0 ? (
                      identity.treatments.slice(0, 3).map(t => (
                        <span key={t} className="px-2 py-0.5 bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-700 rounded-md text-xs font-semibold">
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                    {identity.treatments.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">
                        +{identity.treatments.length - 3}
                      </span>
                    )}
                  </div>
                </PreviewSection>

                <PreviewSection label="Palavras-Chave">
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {identity.keywords.length > 0 ? (
                      identity.keywords.slice(0, 3).map(k => (
                        <span key={k} className="px-2 py-0.5 bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-700 rounded-md text-xs font-semibold">
                          {k}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                    {identity.keywords.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-semibold">
                        +{identity.keywords.length - 3}
                      </span>
                    )}
                  </div>
                </PreviewSection>

                <PreviewSection label="Tipografia">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Fonte Primária</span>
                      <span className={identity.font1 ? "text-gray-900 font-semibold" : "text-gray-400"}>
                        {identity.font1 || "—"}
                      </span>
                    </div>
                    {identity.font2 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Fonte Secundária</span>
                        <span className="text-gray-900 font-semibold">{identity.font2}</span>
                      </div>
                    )}
                  </div>
                </PreviewSection>

                <PreviewSection label="Paleta de Cores">
                  <div className="flex gap-2 mt-2">
                    <div className="w-8 h-8 rounded-lg border-2 border-gray-200" style={{ backgroundColor: identity.colors.primary }} />
                    <div className="w-8 h-8 rounded-lg border-2 border-gray-200" style={{ backgroundColor: identity.colors.secondary }} />
                    <div className="w-8 h-8 rounded-lg border-2 border-gray-200" style={{ backgroundColor: identity.colors.accent }} />
                  </div>
                </PreviewSection>
              </div>
            </div>
          </aside>

          {/* Form Content */}
          <main className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Construtor de Marca Completo</h1>
            <p className="text-gray-600 mb-8">Preencha todos os campos para criar o perfil completo que vai guiar a produção de conteúdo</p>

            <form className="space-y-8">
              {/* Logo Upload Hidden Input */}
              <input
                type="file"
                id="logoInput"
                className="hidden"
                accept="image/*"
                onChange={handleLogoUpload}
                aria-label="Upload logo da marca"
              />

              {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
              <Section title="📋 Informações Básicas" subtitle="Dados fundamentais da sua marca">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField label="Nome da Marca/Clínica" required>
                    <input
                      type="text"
                      placeholder="Ex: Clínica Dra. Ana Silva"
                      value={identity.brand_name}
                      onChange={(e) => setIdentity(prev => ({ ...prev, brand_name: e.target.value }))}
                      className="input-primary"
                    />
                  </FormField>

                  <FormField label="Instagram (@)" required>
                    <input
                      type="text"
                      placeholder="@seuperfil"
                      value={identity.instagram_handle}
                      onChange={(e) => setIdentity(prev => ({ ...prev, instagram_handle: e.target.value }))}
                      className="input-primary"
                    />
                  </FormField>
                </div>

                <FormField label="Defina sua área de atuação" required>
                  <input
                    type="text"
                    placeholder="Ex: Fisioterapia Dermatofuncional"
                    value={identity.main_specialty}
                    onChange={(e) => setIdentity(prev => ({ ...prev, main_specialty: e.target.value }))}
                    className="input-primary"
                  />
                </FormField>

                <FormField label="Subespecialidades" hint="Adicione áreas complementares e títulos (pressione Enter após cada uma)">
                  <TagInput
                    tags={identity.sub_specialties}
                    inputValue={subSpecialtyInput}
                    onInputChange={setSubSpecialtyInput}
                    onAdd={() => { addTag("sub_specialties", subSpecialtyInput); setSubSpecialtyInput(""); }}
                    onRemove={(tag) => removeTag("sub_specialties", tag)}
                    placeholder="Ex: Especialista em Estética Integrativa"
                  />
                </FormField>

                <FormField label="Tratamentos Oferecidos" hint="Liste os principais procedimentos (pressione Enter após cada um)">
                  <TagInput
                    tags={identity.treatments}
                    inputValue={treatmentInput}
                    onInputChange={setTreatmentInput}
                    onAdd={() => { addTag("treatments", treatmentInput); setTreatmentInput(""); }}
                    onRemove={(tag) => removeTag("treatments", tag)}
                    placeholder="Ex: Botox, Preenchimento, Peeling"
                  />
                </FormField>
              </Section>

              {/* SEÇÃO 2: POSICIONAMENTO ESTRATÉGICO */}
              <Section title="🎯 Posicionamento Estratégico" subtitle="Como você quer ser percebida">
                <FormField label="Arquétipo da Marca" required>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ARCHETYPES.map((arch) => (
                      <SelectionCard
                        key={arch.id}
                        isSelected={identity.brand_archetype === arch.id}
                        onClick={() => setIdentity(prev => ({ ...prev, brand_archetype: arch.id }))}
                        icon={arch.icon}
                        title={arch.label}
                        description={arch.desc}
                      />
                    ))}
                  </div>
                </FormField>

                <FormField label="Posicionamento de Mercado (múltipla escolha)">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {POSITIONING_OPTIONS.map((pos) => (
                      <SelectionCard
                        key={pos.id}
                        isSelected={identity.positioning.includes(pos.id)}
                        onClick={() => toggleMultiSelect("positioning", pos.id)}
                        icon={pos.icon}
                        title={pos.label}
                        description={pos.desc}
                      />
                    ))}
                  </div>
                </FormField>

                <FormField label="Voz do Conteúdo" required hint="Como a marca se comunica nos conteúdos">
                  <div className="grid md:grid-cols-3 gap-3">
                    {TEAM_TYPES.map((team) => (
                      <SelectionCard
                        key={team.id}
                        isSelected={identity.team_type === team.id}
                        onClick={() => setIdentity(prev => ({ ...prev, team_type: team.id }))}
                        icon={team.icon}
                        title={team.label}
                        description={team.desc}
                      />
                    ))}
                  </div>
                </FormField>
              </Section>

              {/* SEÇÃO 3: CLONE DE VOZ IA */}
              <Section title="🎙️ Clone de Tom de Voz (IA)" subtitle="Ensine a IA a escrever EXATAMENTE como você escreve">
                <FormField label="Exemplos de Textos Seus" required hint="Cole 3-5 legendas/textos que você já escreveu. Quanto mais exemplos, melhor a IA aprende seu estilo!">
                  <textarea
                    rows={8}
                    placeholder="Exemplo 1:&#10;Olha, vou ser sincera com você: harmonização não é sobre mudar quem você é. É sobre realçar o que você já tem de mais bonito! 💎&#10;&#10;Cole mais 2-4 exemplos seus aqui..."
                    value={identity.voice_samples}
                    onChange={(e) => setIdentity(prev => ({ ...prev, voice_samples: e.target.value }))}
                    className="input-primary resize-none"
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    Mínimo recomendado: 500 caracteres
                  </div>
                </FormField>

                <FormField label="Como você se comunica?" hint="Selecione todas as características que definem sua comunicação">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {COMMUNICATION_STYLES.map((style) => (
                      <SelectionCard
                        key={style.id}
                        isSelected={identity.communication_style.includes(style.id)}
                        onClick={() => toggleMultiSelect("communication_style", style.id)}
                        icon={style.icon}
                        title={style.label}
                        compact
                      />
                    ))}
                  </div>
                </FormField>

                <FormField label="Tamanho das frases">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {SENTENCE_LENGTHS.map((length) => (
                      <SelectionCard
                        key={length.id}
                        isSelected={identity.sentence_length === length.id}
                        onClick={() => setIdentity(prev => ({ ...prev, sentence_length: length.id }))}
                        title={length.label}
                        description={length.desc}
                      />
                    ))}
                  </div>
                </FormField>

                <FormField label="Estrutura dos parágrafos">
                  <div className="grid md:grid-cols-3 gap-3">
                    {PARAGRAPH_STYLES.map((style) => (
                      <SelectionCard
                        key={style.id}
                        isSelected={identity.paragraph_style === style.id}
                        onClick={() => setIdentity(prev => ({ ...prev, paragraph_style: style.id }))}
                        title={style.label}
                        description={style.desc}
                      />
                    ))}
                  </div>
                </FormField>

                <FormField label="Expressões e bordões que você usa" hint='Frases características, jargões, expressões que você repete (pressione Enter após cada)'>
                  <TagInput
                    tags={identity.catchphrases}
                    inputValue={catchphraseInput}
                    onInputChange={setCatchphraseInput}
                    onAdd={() => { addTag("catchphrases", catchphraseInput); setCatchphraseInput(""); }}
                    onRemove={(tag) => removeTag("catchphrases", tag)}
                    placeholder='Ex: "Vou ser sincera com você", "Olha só"'
                  />
                </FormField>

                <FormField label="Como você inicia os textos?">
                  <textarea
                    rows={3}
                    placeholder="Ex: Geralmente começo com uma pergunta direta, tipo 'Você já parou pra pensar...'"
                    value={identity.opening_style}
                    onChange={(e) => setIdentity(prev => ({ ...prev, opening_style: e.target.value }))}
                    className="input-primary resize-none"
                  />
                </FormField>

                <FormField label="Como você encerra os textos?">
                  <textarea
                    rows={3}
                    placeholder="Ex: Costumo terminar com uma pergunta ou convite pra ação"
                    value={identity.closing_style}
                    onChange={(e) => setIdentity(prev => ({ ...prev, closing_style: e.target.value }))}
                    className="input-primary resize-none"
                  />
                </FormField>

                <FormField label="Nível de formalidade">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {FORMALITY_LEVELS.map((level) => (
                      <SelectionCard
                        key={level.id}
                        isSelected={identity.formality === level.id}
                        onClick={() => setIdentity(prev => ({ ...prev, formality: level.id }))}
                        icon={level.icon}
                        title={level.label}
                        description={level.desc}
                      />
                    ))}
                  </div>
                </FormField>

                <FormField label="Uso de pontuação" hint="Como você usa pontuação nos textos?">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {PUNCTUATION_STYLES.map((punct) => (
                      <SelectionCard
                        key={punct.id}
                        isSelected={identity.punctuation.includes(punct.id)}
                        onClick={() => toggleMultiSelect("punctuation", punct.id)}
                        title={punct.label}
                        compact
                      />
                    ))}
                  </div>
                </FormField>

                <FormField label="Personalidade da comunicação" hint="Como as pessoas descreveriam sua forma de escrever?">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {PERSONALITY_TRAITS.map((trait) => (
                      <SelectionCard
                        key={trait.id}
                        isSelected={identity.personality.includes(trait.id)}
                        onClick={() => toggleMultiSelect("personality", trait.id)}
                        icon={trait.icon}
                        title={trait.label}
                        compact
                      />
                    ))}
                  </div>
                </FormField>

                <FormField label="Notas adicionais sobre seu estilo">
                  <textarea
                    rows={4}
                    placeholder="Ex: Sempre contextualizo antes de falar do procedimento. Gosto de usar comparações..."
                    value={identity.style_notes}
                    onChange={(e) => setIdentity(prev => ({ ...prev, style_notes: e.target.value }))}
                    className="input-primary resize-none"
                  />
                </FormField>
              </Section>

              {/* SEÇÃO 4: IDENTIDADE VISUAL */}
              <Section title="🎨 Identidade Visual" subtitle="Cores e tipografia da sua marca">
                <FormField label="Paleta de Cores">
                  <div className="grid grid-cols-3 gap-4">
                    <ColorPicker
                      label="Primária"
                      value={identity.colors.primary}
                      onChange={(color) => setIdentity(prev => ({
                        ...prev,
                        colors: { ...prev.colors, primary: color },
                      }))}
                    />
                    <ColorPicker
                      label="Secundária"
                      value={identity.colors.secondary}
                      onChange={(color) => setIdentity(prev => ({
                        ...prev,
                        colors: { ...prev.colors, secondary: color },
                      }))}
                    />
                    <ColorPicker
                      label="Destaque"
                      value={identity.colors.accent}
                      onChange={(color) => setIdentity(prev => ({
                        ...prev,
                        colors: { ...prev.colors, accent: color },
                      }))}
                    />
                  </div>
                </FormField>

                <FormField label="Fontes de Preferência">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {FONT_OPTIONS.map((font) => (
                      <SelectionCard
                        key={font.id}
                        isSelected={identity.font1 === font.id}
                        onClick={() => setIdentity(prev => ({ ...prev, font1: font.id }))}
                        title={font.label}
                        description={font.desc}
                      />
                    ))}
                  </div>
                </FormField>

                <FormField label="Fonte Secundária (opcional)">
                  <input
                    type="text"
                    placeholder="Ex: Roboto, Open Sans"
                    value={identity.font2}
                    onChange={(e) => setIdentity(prev => ({ ...prev, font2: e.target.value }))}
                    className="input-primary"
                  />
                </FormField>
              </Section>

              {/* SEÇÃO 5: COMUNICAÇÃO */}
              <Section title="💬 Tom de Voz e Valores" subtitle="Como sua marca se comunica">
                <FormField label="Diferencial Único">
                  <textarea
                    rows={3}
                    placeholder="O que torna sua clínica única? Ex: Protocolos exclusivos desenvolvidos..."
                    value={identity.differentiator}
                    onChange={(e) => setIdentity(prev => ({ ...prev, differentiator: e.target.value }))}
                    className="input-primary resize-none"
                  />
                </FormField>

                <FormField label="Promessa da Marca">
                  <textarea
                    rows={3}
                    placeholder="O que você garante entregar? Ex: Resultados visíveis em 30 dias..."
                    value={identity.brand_promise}
                    onChange={(e) => setIdentity(prev => ({ ...prev, brand_promise: e.target.value }))}
                    className="input-primary resize-none"
                  />
                </FormField>

                <FormField label="Público-Alvo Principal">
                  <textarea
                    rows={2}
                    placeholder="Ex: Mulheres executivas 35-50 anos que buscam procedimentos discretos"
                    value={identity.target_audience}
                    onChange={(e) => setIdentity(prev => ({ ...prev, target_audience: e.target.value }))}
                    className="input-primary resize-none"
                  />
                </FormField>

                <FormField label="Tom de Voz" hint="Escolha até 3 características do tom de comunicação">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {TONE_OPTIONS.map((tone) => (
                      <SelectionCard
                        key={tone.id}
                        isSelected={identity.tone_of_voice.includes(tone.id)}
                        onClick={() => {
                          if (identity.tone_of_voice.length >= 3 && !identity.tone_of_voice.includes(tone.id)) {
                            toast({
                              title: "Limite atingido",
                              description: "Máximo de 3 tons de voz",
                              variant: "destructive",
                            });
                            return;
                          }
                          toggleMultiSelect("tone_of_voice", tone.id);
                        }}
                        icon={tone.icon}
                        title={tone.label}
                        compact
                      />
                    ))}
                  </div>
                </FormField>

                <FormField label="Palavras-Chave da Marca" hint="Termos que definem sua essência (pressione Enter após cada uma)">
                  <TagInput
                    tags={identity.keywords}
                    inputValue={keywordInput}
                    onInputChange={setKeywordInput}
                    onAdd={() => { addTag("keywords", keywordInput); setKeywordInput(""); }}
                    onRemove={(tag) => removeTag("keywords", tag)}
                    placeholder="Ex: Transformação, Bem-estar, Ciência"
                  />
                </FormField>

                <FormField label="Palavras/Termos Proibidos" hint="O que sua marca NUNCA deve dizer (pressione Enter após cada)">
                  <TagInput
                    tags={identity.forbidden_words}
                    inputValue={forbiddenInput}
                    onInputChange={setForbiddenInput}
                    onAdd={() => { addTag("forbidden_words", forbiddenInput); setForbiddenInput(""); }}
                    onRemove={(tag) => removeTag("forbidden_words", tag)}
                    placeholder="Ex: Milagre, Baratinho, Promoção"
                    variant="danger"
                  />
                </FormField>

                <FormField label="Tipos de Conteúdo Preferidos" hint="Formatos que você mais produz ou quer produzir">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {CONTENT_TYPES.map((type) => (
                      <SelectionCard
                        key={type.id}
                        isSelected={identity.content_types.includes(type.id)}
                        onClick={() => toggleMultiSelect("content_types", type.id)}
                        icon={type.icon}
                        title={type.label}
                        compact
                      />
                    ))}
                  </div>
                </FormField>

                <FormField label="Bio do Instagram (opcional)">
                  <textarea
                    rows={3}
                    placeholder="Ex: 💎 Harmonização Orofacial Premium&#10;📍 São Paulo - Jardins&#10;👩‍⚕️ Dra. Ana Silva"
                    value={identity.bio_text}
                    onChange={(e) => setIdentity(prev => ({ ...prev, bio_text: e.target.value }))}
                    className="input-primary resize-none"
                    maxLength={150}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {identity.bio_text.length} / 150 caracteres
                  </div>
                </FormField>
              </Section>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-3 text-gray-700 font-semibold border-2 border-gray-300 rounded-xl hover:border-indigo-600 hover:bg-gray-50 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Limpar Tudo
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Salvar Perfil Completo
                    </>
                  )}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}

// ========== COMPONENTES AUXILIARES ==========

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="space-y-6 pb-8 border-b border-gray-200 last:border-0">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

function FormField({ label, hint, required, children }: { 
  label: string; 
  hint?: string; 
  required?: boolean; 
  children: React.ReactNode 
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        {label} {required && <span className="text-indigo-600">*</span>}
      </label>
      {hint && <p className="text-sm text-gray-500 mb-3">{hint}</p>}
      {children}
    </div>
  );
}

function SelectionCard({ 
  isSelected, 
  onClick, 
  icon, 
  title, 
  description, 
  compact 
}: { 
  isSelected: boolean; 
  onClick: () => void; 
  icon?: string; 
  title: string; 
  description?: string; 
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 transition-all text-left ${
        isSelected
          ? "border-indigo-600 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-lg"
          : "border-gray-300 bg-white hover:border-indigo-300 hover:shadow-md"
      } ${compact ? "text-center" : ""}`}
    >
      {icon && (
        <div className={`text-2xl mb-2 ${compact ? "mx-auto" : ""}`}>
          {icon}
        </div>
      )}
      <div className={`font-semibold text-gray-900 ${compact ? "text-sm" : ""}`}>
        {title}
      </div>
      {description && (
        <div className="text-xs text-gray-600 mt-1 leading-relaxed">
          {description}
        </div>
      )}
      {isSelected && (
        <div className="absolute top-2 right-2">
          <CheckCircle className="w-5 h-5 text-indigo-600" />
        </div>
      )}
    </button>
  );
}

function TagInput({ 
  tags, 
  inputValue, 
  onInputChange, 
  onAdd, 
  onRemove, 
  placeholder,
  variant = "default" 
}: { 
  tags: string[]; 
  inputValue: string; 
  onInputChange: (value: string) => void; 
  onAdd: () => void; 
  onRemove: (tag: string) => void; 
  placeholder: string;
  variant?: "default" | "danger";
}) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAdd();
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 border-2 border-gray-300 rounded-xl min-h-[48px] focus-within:border-indigo-600 transition-all">
      {tags.map((tag) => (
        <span
          key={tag}
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-md text-sm font-semibold ${
            variant === "danger" 
              ? "bg-red-50 text-red-600" 
              : "bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
          }`}
        >
          {tag}
          <button
            type="button"
            onClick={() => onRemove(tag)}
            className="hover:opacity-70 transition-opacity"
            aria-label={`Remover ${tag}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] border-none outline-none text-sm"
      />
    </div>
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (color: string) => void }) {
  return (
    <div className="text-center">
      <label className="block text-xs font-semibold text-gray-600 mb-2">{label}</label>
      <div className="relative h-16 rounded-xl overflow-hidden border-2 border-gray-300 cursor-pointer">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full cursor-pointer"
          aria-label={`Selecionar cor ${label.toLowerCase()}`}
        />
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-black/70 text-white px-2 py-0.5 rounded text-xs font-mono pointer-events-none">
          {value.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

function PreviewSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pb-3 border-b border-gray-200 last:border-0">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</div>
      {children}
    </div>
  );
}
