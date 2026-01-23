import React, { useState, useRef, useEffect } from 'react';
import './index.css';

// API Service
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const api = {
  searchImages: async (query, page = 1, perPage = 20, orientation = 'portrait') => {
    const response = await fetch(`${BACKEND_URL}/api/images/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, page, per_page: perPage, orientation }),
    });
    return response.json();
  },
  getPopularImages: async () => {
    const response = await fetch(`${BACKEND_URL}/api/images/popular`);
    return response.json();
  },
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${BACKEND_URL}/api/images/upload`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  },
  // Brand Profile
  getBrandProfile: async () => {
    const response = await fetch(`${BACKEND_URL}/api/brand/profile`);
    return response.json();
  },
  updateBrandProfile: async (profileId, data) => {
    const response = await fetch(`${BACKEND_URL}/api/brand/profile/${profileId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  createBrandProfile: async (data) => {
    const response = await fetch(`${BACKEND_URL}/api/brand/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  seedBrandProfile: async () => {
    const response = await fetch(`${BACKEND_URL}/api/brand/profile/seed`, {
      method: 'POST',
    });
    return response.json();
  },
  // Lucresia - IA de Neurovendas para Estética
  lucresiaStories: async (procedimento, objetivo, publico, numStories = 5) => {
    const response = await fetch(`${BACKEND_URL}/api/ai/lucresia/stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ procedimento, objetivo, publico, num_stories: numStories }),
    });
    return response.json();
  },
  lucresiaTitulo: async (context, tone = 'autoridade') => {
    const response = await fetch(`${BACKEND_URL}/api/ai/lucresia/titulo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt_type: 'titulo', context, tone }),
    });
    return response.json();
  },
  lucresiaCopy: async (context, tone = 'autoridade') => {
    const response = await fetch(`${BACKEND_URL}/api/ai/lucresia/copy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt_type: 'copy', context, tone }),
    });
    return response.json();
  },
  lucresiaHashtags: async (context) => {
    const response = await fetch(`${BACKEND_URL}/api/ai/lucresia/hashtags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt_type: 'hashtags', context, tone: 'autoridade' }),
    });
    return response.json();
  },
  // Blog Posts
  getBlogPosts: async (status = null) => {
    const url = status ? `${BACKEND_URL}/api/blog/posts?status=${status}` : `${BACKEND_URL}/api/blog/posts`;
    const response = await fetch(url);
    return response.json();
  },
  getBlogPost: async (postId) => {
    const response = await fetch(`${BACKEND_URL}/api/blog/posts/${postId}`);
    return response.json();
  },
  updateBlogPost: async (postId, data) => {
    const response = await fetch(`${BACKEND_URL}/api/blog/posts/${postId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  deleteBlogPost: async (postId) => {
    const response = await fetch(`${BACKEND_URL}/api/blog/posts/${postId}`, {
      method: 'DELETE',
    });
    return response.json();
  },
  generateBlogPost: async (topico, objetivo, publicoAlvo = 'mulheres 30-50 anos', numSecoes = 3, palavrasChave = []) => {
    const response = await fetch(`${BACKEND_URL}/api/ai/lucresia/blog-post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        topico, 
        objetivo, 
        publico_alvo: publicoAlvo, 
        num_secoes: numSecoes,
        palavras_chave: palavrasChave
      }),
    });
    return response.json();
  },
  // AI Image Generation
  generateImage: async (prompt, size = '1024x1024') => {
    const response = await fetch(`${BACKEND_URL}/api/ai/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, size }),
    });
    return response.json();
  },
  // 📅 Agendamento de Publicação
  scheduleBlogPost: async (postId, data_agendamento) => {
    const response = await fetch(`${BACKEND_URL}/api/blog/posts/${postId}/agendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data_agendamento }),
    });
    return response.json();
  },
  // 📊 Validação de SEO
  validateSEO: async (postId) => {
    const response = await fetch(`${BACKEND_URL}/api/blog/posts/${postId}/validar-seo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },
  // 🔄 Versões
  saveVersion: async (postId) => {
    const response = await fetch(`${BACKEND_URL}/api/blog/posts/${postId}/salvar-versao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },
  getVersions: async (postId) => {
    const response = await fetch(`${BACKEND_URL}/api/blog/posts/${postId}/versoes`);
    return response.json();
  },
  // 📱 Preview Múltiplo
  getMultiplePreview: async (postId) => {
    const response = await fetch(`${BACKEND_URL}/api/blog/posts/${postId}/preview-multiplo`);
    return response.json();
  },
  // 📑 Autosave
  autosaveDraft: async (postId, conteudo) => {
    const response = await fetch(`${BACKEND_URL}/api/blog/posts/${postId}/autosave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conteudo }),
    });
    return response.json();
  },
  restoreAutosave: async (postId) => {
    const response = await fetch(`${BACKEND_URL}/api/blog/posts/${postId}/restaurar-autosave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },
  // 🏷️ Categorias
  getCategories: async () => {
    const response = await fetch(`${BACKEND_URL}/api/blog/categorias`);
    return response.json();
  },
  categorizePost: async (postId, categoria, subcategorias = []) => {
    const response = await fetch(`${BACKEND_URL}/api/blog/posts/${postId}/categorizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoria, subcategorias }),
    });
    return response.json();
  },
  // 🎭 Templates de Seções
  getSectionTemplates: async () => {
    const response = await fetch(`${BACKEND_URL}/api/blog/templates-secoes`);
    return response.json();
  },
  addTemplateSection: async (postId, tipo_secao, conteudo) => {
    const response = await fetch(`${BACKEND_URL}/api/blog/posts/${postId}/adicionar-secao-template`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo_secao, conteudo }),
    });
    return response.json();
  },
  // 🔗 Links Inteligentes
  suggestInternalLinks: async (postId) => {
    const response = await fetch(`${BACKEND_URL}/api/blog/posts/${postId}/sugerir-links-internos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },
  addLinks: async (postId, links_internos = [], links_externos = []) => {
    const response = await fetch(`${BACKEND_URL}/api/blog/posts/${postId}/adicionar-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ links_internos, links_externos }),
    });
    return response.json();
  },
  // 📈 Analytics
  getAnalytics: async (postId) => {
    const response = await fetch(`${BACKEND_URL}/api/blog/posts/${postId}/analytics`);
    return response.json();
  },
  incrementView: async (postId) => {
    const response = await fetch(`${BACKEND_URL}/api/blog/posts/${postId}/incrementar-view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },
  // 📤 Exportar
  exportPost: async (postId, formato = 'html') => {
    const response = await fetch(`${BACKEND_URL}/api/blog/posts/${postId}/exportar?formato=${formato}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },
  publishToPlatform: async (postId, plataforma) => {
    const response = await fetch(`${BACKEND_URL}/api/blog/posts/${postId}/publicar-plataforma`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plataforma }),
    });
    return response.json();
  },
};

// Format data
const formats = [
  { id: '1', title: 'Post para Instagram', dimensions: '1080 x 1080 px', platform: 'Instagram', icon: '🖼️', category: 'social-media', badge: 'Destaque' },
  { id: '2', title: 'Reels / TikTok', dimensions: '1080 x 1920 px', platform: 'Instagram, TikTok', icon: '🎬', category: 'social-media' },
  { id: '3', title: 'Anúncio Facebook Feed', dimensions: '1080 x 1080 px', platform: 'Facebook, Instagram', icon: '💸', category: 'ads' },
  { id: '4', title: 'Anúncio Facebook Story', dimensions: '1080 x 1920 px', platform: 'Facebook, Instagram', icon: '📱', category: 'ads' },
  { id: '5', title: 'Story Criativo', dimensions: '1080 x 1920 px', platform: 'Instagram, WhatsApp', icon: '🤳', category: 'stories' },
  { id: '6', title: 'Anúncio Stories', dimensions: '1080 x 1920 px', platform: 'Instagram, Facebook', icon: '📢', category: 'stories' },
  { id: '7', title: 'Carrossel Instagram', dimensions: '1080 x 1080 px (cada slide)', platform: 'Instagram', icon: '🔄', category: 'social-media' },
  { id: '8', title: 'Banner Google Display', dimensions: '300 x 250 px', platform: 'Google Ads', icon: '🖼️', category: 'ads' },
  { id: '9', title: 'Story Animado', dimensions: '1080 x 1920 px', platform: 'Instagram, Facebook', icon: '✨', category: 'stories' },
  { id: '10', title: 'Post para LinkedIn', dimensions: '1200 x 627 px', platform: 'LinkedIn', icon: '🌐', category: 'social-media' },
  { id: '11', title: 'Post para Twitter X', dimensions: '1600 x 900 px', platform: 'Twitter X', icon: '🐦', category: 'social-media' },
  { id: '12', title: 'Anúncio YouTube Thumbnail', dimensions: '1280 x 720 px', platform: 'YouTube', icon: '▶️', category: 'ads' },
];

const templates = [
  { id: '01', title: 'Template de lançamento de produto com foco em vendas...', badge: 'Vendas' },
  { id: '02', title: 'Template com design clean e foco em beleza...', badge: 'Estética' },
  { id: '03', title: 'Template detalhando etapas de um serviço...', badge: 'Procedimentos' },
  { id: '04', title: 'Template chamativo para ofertas e descontos...', badge: 'Promoção' },
];

const quickSearches = ['Estética', 'Clínica', 'Beleza', 'Procedimento', 'Tratamento'];

// Procedimentos de estética para o dropdown
const procedimentosEstetica = [
  'Harmonização Facial',
  'Botox',
  'Preenchimento Labial',
  'Limpeza de Pele',
  'Peeling',
  'Microagulhamento',
  'Bioestimuladores',
  'Skinbooster',
  'Fios de PDO',
  'Drenagem Linfática',
  'Massagem Modeladora',
  'Criolipólise',
  'Radiofrequência',
  'Laser CO2',
  'Depilação a Laser',
];

// Objetivos estratégicos
const objetivosEstrategicos = [
  'Gerar autoridade profissional',
  'Quebrar objeções sobre preço',
  'Quebrar objeções sobre dor',
  'Quebrar objeções sobre naturalidade',
  'Educar sobre o procedimento',
  'Mostrar bastidores da clínica',
  'Apresentar resultados (antes/depois)',
  'Construir confiança',
  'Humanizar a profissional',
  'Despertar desejo pelo procedimento',
];

function App() {
  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFormats, setSelectedFormats] = useState(['1']);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showEditor, setShowEditor] = useState(false);
  const [showBrandConfig, setShowBrandConfig] = useState(false);
  const [showBlogCreator, setShowBlogCreator] = useState(false);
  
  // Brand Profile state
  const [brandProfile, setBrandProfile] = useState(null);
  const [loadingBrand, setLoadingBrand] = useState(false);
  
  // Blog Posts state
  const [blogPosts, setBlogPosts] = useState([]);
  const [loadingBlog, setLoadingBlog] = useState(false);
  const [selectedBlogPost, setSelectedBlogPost] = useState(null);
  const [generatingBlog, setGeneratingBlog] = useState(false);
  
  // Blog form state
  const [blogTopico, setBlogTopico] = useState('Harmonização Facial');
  const [blogObjetivo, setBlogObjetivo] = useState('Educar sobre o procedimento');
  const [blogPublicoAlvo, setBlogPublicoAlvo] = useState('mulheres 30-50 anos buscando rejuvenescimento');
  const [blogNumSecoes, setBlogNumSecoes] = useState(3);
  
  // Blog editing state
  const [editingBlog, setEditingBlog] = useState(false);
  const [editedPost, setEditedPost] = useState(null);
  const [blogPalavrasChave, setBlogPalavrasChave] = useState('harmonização, rejuvenescimento, natural');
  
  // ===== NOVOS ESTADOS PARA 10 FEATURES =====
  // 📅 Agendamento
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  
  // 📊 SEO
  const [seoScore, setSeoScore] = useState(null);
  const [seoChecks, setSeoChecks] = useState(null);
  const [validatingSEO, setValidatingSEO] = useState(false);
  
  // 🔄 Versões
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  
  // 📱 Preview
  const [showMultiPreview, setShowMultiPreview] = useState(false);
  const [multiPreviewData, setMultiPreviewData] = useState(null);
  
  // 📑 Autosave
  const [autosaveInterval, setAutosaveInterval] = useState(null);
  const [lastAutosaved, setLastAutosaved] = useState(null);
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  
  // 🏷️ Categorias
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // 🎭 Templates Seções
  const [sectionTemplates, setSectionTemplates] = useState([]);
  const [loadingSectionTemplates, setLoadingSectionTemplates] = useState(false);
  const [selectedTemplateSection, setSelectedTemplateSection] = useState(null);
  
  // 🔗 Links
  const [suggestedLinks, setSuggestedLinks] = useState([]);
  const [loadingSuggestedLinks, setLoadingSuggestedLinks] = useState(false);
  const [internalLinks, setInternalLinks] = useState([]);
  const [externalLinks, setExternalLinks] = useState([]);
  
  // 📈 Analytics
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  
  // 📤 Exportar
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFormats] = useState(['html', 'markdown', 'txt']);
  const [publishedUrls, setPublishedUrls] = useState({});
  
  // AI Image Generation state
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  
  // Editor state
  const [activeTab, setActiveTab] = useState('template-templates');
  const [activeImageSource, setActiveImageSource] = useState('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [galleryImages, setGalleryImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTemplate, setActiveTemplate] = useState('01');
  
  // Text state
  const [mainText, setMainText] = useState('Descubra o poder da Estética Avançada!');
  const [subtitleText, setSubtitleText] = useState('Transforme sua autoestima com técnicas comprovadas.');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [activeEffects, setActiveEffects] = useState(['bold']);
  const [textAlign, setTextAlign] = useState('center');
  
  // Lucresia IA state
  const [showLucresiaModal, setShowLucresiaModal] = useState(false);
  const [lucresiaProcedimento, setLucresiaProcedimento] = useState('Harmonização Facial');
  const [lucresiaObjetivo, setLucresiaObjetivo] = useState('Gerar autoridade profissional');
  const [lucresiaPublico, setLucresiaPublico] = useState('mulheres 30-50 anos buscando rejuvenescimento');
  const [lucresiaNumStories, setLucresiaNumStories] = useState(5);
  const [lucresiaGenerating, setLucresiaGenerating] = useState(false);
  const [lucresiaResult, setLucresiaResult] = useState(null);
  const [lucresiaActiveType, setLucresiaActiveType] = useState('stories');
  
  // Element colors
  const elementColors = ['#111827', '#FFFFFF', '#4F46E5', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#F9FAFB', '#FFFBEB', '#EEF2FF', '#F5F3FF'];
  const [selectedColor, setSelectedColor] = useState('#4F46E5');
  
  // Background colors
  const bgColors = ['#F9FAFB', '#FFFBEB', '#EEF2FF', '#F5F3FF'];
  const [selectedBgColor, setSelectedBgColor] = useState('#F9FAFB');
  const [backgroundImage, setBackgroundImage] = useState(null);
  
  // Sliders
  const [elementSize, setElementSize] = useState(100);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(50);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [imageFilter, setImageFilter] = useState('none');
  
  const fileInputRef = useRef(null);
  const bgFileInputRef = useRef(null);

  // Load brand profile on mount
  useEffect(() => {
    loadBrandProfile();
  }, []);

  // Load images on mount
  useEffect(() => {
    if (showEditor && activeTab === 'template-images') {
      loadPopularImages();
    }
  }, [showEditor, activeTab]);

  const loadBrandProfile = async () => {
    setLoadingBrand(true);
    try {
      const data = await api.getBrandProfile();
      setBrandProfile(data);
      // Atualizar cores do editor com as cores da marca
      if (data.cores_primarias && data.cores_primarias.length > 0) {
        setSelectedColor(data.cores_primarias[0]);
      }
      if (data.fonte_principal) {
        setFontFamily(data.fonte_principal);
      }
    } catch (error) {
      console.error('Error loading brand profile:', error);
      // Se falhar, criar perfil padrão
      try {
        await api.seedBrandProfile();
        const data = await api.getBrandProfile();
        setBrandProfile(data);
      } catch (seedError) {
        console.error('Error seeding brand profile:', seedError);
      }
    }
    setLoadingBrand(false);
  };

  // ===== FUNÇÕES DE CARREGAMENTO DAS 10 FEATURES =====
  
  // 🏷️ Carregar Categorias
  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const data = await api.getCategories();
      setCategories(data.categorias || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
    setLoadingCategories(false);
  };

  // 🎭 Carregar Templates de Seções
  const loadSectionTemplates = async () => {
    setLoadingSectionTemplates(true);
    try {
      const data = await api.getSectionTemplates();
      setSectionTemplates(data.templates || []);
    } catch (error) {
      console.error('Error loading section templates:', error);
    }
    setLoadingSectionTemplates(false);
  };

  // 🔄 Carregar Versões
  const loadVersionHistory = async (postId) => {
    setLoadingVersions(true);
    try {
      const data = await api.getVersions(postId);
      setVersions(data.versoes || []);
    } catch (error) {
      console.error('Error loading versions:', error);
    }
    setLoadingVersions(false);
  };

  // 📱 Carregar Previews Múltiplos
  const loadMultiplePreview = async (postId) => {
    try {
      const data = await api.getMultiplePreview(postId);
      setMultiPreviewData(data);
      setShowMultiPreview(true);
    } catch (error) {
      console.error('Error loading preview:', error);
    }
  };

  // 📈 Carregar Analytics
  const loadPostAnalytics = async (postId) => {
    setLoadingAnalytics(true);
    try {
      const data = await api.getAnalytics(postId);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
    setLoadingAnalytics(false);
  };

  // 🔗 Carregar Links Sugeridos
  const loadSuggestedLinks = async (postId) => {
    setLoadingSuggestedLinks(true);
    try {
      const data = await api.suggestInternalLinks(postId);
      setSuggestedLinks(data.sugestoes_links || []);
    } catch (error) {
      console.error('Error loading suggested links:', error);
    }
    setLoadingSuggestedLinks(false);
  };

  // ===== FUNCIONALIDADES =====

  // 📅 Agendar Publicação
  const handleSchedulePost = async (postId) => {
    if (!scheduleDate || !scheduleTime) {
      alert('Preencha data e hora');
      return;
    }
    
    try {
      const datetime = `${scheduleDate}T${scheduleTime}:00`;
      const response = await api.scheduleBlogPost(postId, datetime);
      alert(`✅ Artigo agendado para ${scheduleDate} às ${scheduleTime}`);
      setShowScheduleModal(false);
      loadBlogPosts();
    } catch (error) {
      console.error('Error scheduling post:', error);
      alert('❌ Erro ao agendar artigo');
    }
  };

  // 📊 Validar SEO
  const handleValidateSEO = async (postId) => {
    setValidatingSEO(true);
    try {
      const data = await api.validateSEO(postId);
      setSeoScore(data.seo_score);
      setSeoChecks(data.checks);
    } catch (error) {
      console.error('Error validating SEO:', error);
      alert('❌ Erro ao validar SEO');
    }
    setValidatingSEO(false);
  };

  // 🔄 Salvar Versão
  const handleSaveVersion = async (postId) => {
    try {
      const response = await api.saveVersion(postId);
      alert(`✅ Versão ${response.versao.versao} salva com sucesso`);
      loadVersionHistory(postId);
    } catch (error) {
      console.error('Error saving version:', error);
      alert('❌ Erro ao salvar versão');
    }
  };

  // 📑 Autosave com Intervalo
  useEffect(() => {
    if (autosaveEnabled && selectedBlogPost && editingBlog) {
      const interval = setInterval(async () => {
        try {
          await api.autosaveDraft(selectedBlogPost.id, editedPost);
          setLastAutosaved(new Date().toLocaleTimeString('pt-BR'));
        } catch (error) {
          console.error('Autosave error:', error);
        }
      }, 30000); // A cada 30 segundos

      setAutosaveInterval(interval);
      return () => clearInterval(interval);
    }
  }, [autosaveEnabled, selectedBlogPost, editingBlog, editedPost]);

  // 🏷️ Categorizar Post
  const handleCategorizePost = async (postId) => {
    if (!selectedCategory) {
      alert('Selecione uma categoria');
      return;
    }

    try {
      await api.categorizePost(postId, selectedCategory, selectedSubcategories);
      alert('✅ Artigo categorizado com sucesso');
      loadBlogPosts();
    } catch (error) {
      console.error('Error categorizing post:', error);
      alert('❌ Erro ao categorizar artigo');
    }
  };

  // 🎭 Adicionar Seção Template
  const handleAddTemplateSection = async (postId, tipoSecao, conteudo) => {
    try {
      const response = await api.addTemplateSection(postId, tipoSecao, conteudo);
      alert('✅ Seção adicionada com sucesso');
      loadBlogPosts();
    } catch (error) {
      console.error('Error adding template section:', error);
      alert('❌ Erro ao adicionar seção');
    }
  };

  // 🔗 Adicionar Links
  const handleAddLinks = async (postId) => {
    try {
      await api.addLinks(postId, internalLinks, externalLinks);
      alert('✅ Links adicionados com sucesso');
    } catch (error) {
      console.error('Error adding links:', error);
      alert('❌ Erro ao adicionar links');
    }
  };

  // 📤 Exportar Post
  const handleExportPost = async (postId, formato) => {
    try {
      const response = await api.exportPost(postId, formato);
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(response.conteudo));
      element.setAttribute('download', `artigo.${formato}`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      alert(`✅ Artigo exportado em ${formato.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting post:', error);
      alert('❌ Erro ao exportar artigo');
    }
  };

  // 📤 Publicar em Plataforma
  const handlePublishToPlatform = async (postId, plataforma) => {
    try {
      const response = await api.publishToPlatform(postId, plataforma);
      setPublishedUrls(prev => ({
        ...prev,
        [plataforma]: response.url
      }));
      alert(`✅ Publicado em ${plataforma}!`);
    } catch (error) {
      console.error('Error publishing to platform:', error);
      alert(`❌ Erro ao publicar em ${plataforma}`);
    }
  };

  const handleGenerateBlogPost = async () => {
    if (!blogTopico.trim()) {
      alert('Preencha o tópico do artigo');
      return;
    }

    setGeneratingBlog(true);
    try {
      const palavrasArray = blogPalavrasChave.split(',').map(p => p.trim()).filter(p => p);
      const response = await api.generateBlogPost(
        blogTopico,
        blogObjetivo,
        blogPublicoAlvo,
        blogNumSecoes,
        palavrasArray
      );

      if (response.success && response.post) {
        setSelectedBlogPost(response.post);
        // Carregar lista atualizada
        loadBlogPosts();
      } else {
        alert('Erro ao gerar artigo: ' + (response.error || 'Tente novamente'));
      }
    } catch (error) {
      console.error('Error generating blog post:', error);
      alert('Erro ao gerar artigo. Verifique os dados e tente novamente.');
    }
    setGeneratingBlog(false);
  };

  const handleStoriesCompanion = () => {
    // Extract context from selected formats
    if (selectedFormats.length === 0) {
      alert('Selecione ao menos um formato para gerar stories');
      return;
    }

    const selectedFormat = formats.find(f => f.id === selectedFormats[0]);
    if (!selectedFormat) {
      alert('Formato não encontrado');
      return;
    }

    // Pre-fill Lucresia modal with context
    setLucresiaProcedimento(selectedFormat.title || 'Conteúdo Visual');
    setLucresiaObjetivo(selectedFormat.category === 'social-media' ? 'Engajamento em redes sociais' : 
                         selectedFormat.category === 'ads' ? 'Conversão de anúncios' : 'Gerar interesse visual');
    setLucresiaPublico(brandProfile?.publico_principal || 'público geral interessado');
    setLucresiaNumStories(5);
    setLucresiaResult(null);
    
    // Open modal
    setShowLucresiaModal(true);
  };

  const handleGenerateImage = async (prompt) => {
    if (!prompt) {
      alert('Forneça um prompt para geração de imagem');
      return;
    }

    setGeneratingImage(true);
    try {
      const response = await api.generateImage(prompt, '1024x1024');
      
      if (response.success && response.image_url) {
        // Atualizar post com imagem gerada
        if (selectedBlogPost) {
          const updatedPost = {
            ...selectedBlogPost,
            imagem_destaque: response.image_url
          };
          setSelectedBlogPost(updatedPost);
          
          // Salvar no banco
          await api.updateBlogPost(selectedBlogPost.id, updatedPost);
          
          alert('✅ Imagem gerada com sucesso!');
        }
        
        // Adicionar às imagens geradas
        setGeneratedImages(prev => [...prev, response.image_url]);
        
        return response.image_url;
      } else {
        alert('Erro ao gerar imagem: ' + (response.error || 'Tente novamente'));
      }
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Erro ao gerar imagem. Tente novamente.');
    }
    setGeneratingImage(false);
  };

  const handleCopyBlogPost = (post) => {
    const textContent = `
${post.titulo}

${post.introducao}

${post.secoes.map((s, i) => `${i + 1}. ${s.titulo}\n${s.conteudo}`).join('\n\n')}

${post.conclusao}

${post.cta}
    `.trim();
    
    navigator.clipboard.writeText(textContent).then(() => {
      alert('✅ Artigo copiado para a área de transferência!');
    }).catch(() => {
      alert('❌ Erro ao copiar. Tente selecionar e copiar manualmente.');
    });
  };

  const handleExportBlogPost = (post, format = 'html') => {
    let content = '';
    let filename = `${post.slug}.${format}`;
    let mimeType = 'text/plain';

    if (format === 'html') {
      mimeType = 'text/html';
      content = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${post.titulo}</title>
  <meta name="description" content="${post.introducao.substring(0, 150)}">
  <meta name="keywords" content="${post.palavras_chave_seo.join(', ')}">
</head>
<body>
  <article>
    <h1>${post.titulo}</h1>
    <p><em>${post.topico}</em></p>
    <p>${post.introducao}</p>
    ${post.secoes.map(s => `
    <h2>${s.titulo}</h2>
    <p>${s.conteudo}</p>
    `).join('')}
    <h2>Conclusão</h2>
    <p>${post.conclusao}</p>
    <blockquote>${post.cta}</blockquote>
    <footer>
      <p>Tags: ${post.tags.join(', ')}</p>
    </footer>
  </article>
</body>
</html>
      `;
    } else if (format === 'txt') {
      content = `${post.titulo}\n\n${post.introducao}\n\n${post.secoes.map((s, i) => `${i + 1}. ${s.titulo}\n${s.conteudo}`).join('\n\n')}\n\n${post.conclusao}\n\n${post.cta}`;
    } else if (format === 'md') {
      filename = `${post.slug}.md`;
      content = `# ${post.titulo}\n\n${post.introducao}\n\n${post.secoes.map(s => `## ${s.titulo}\n\n${s.conteudo}`).join('\n\n')}\n\n## Conclusão\n\n${post.conclusao}\n\n> ${post.cta}\n\n---\n*Tags: ${post.tags.join(', ')}*`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert(`✅ Artigo exportado como ${format.toUpperCase()}!`);
  };

  const handleEditBlogPost = (post) => {
    setEditedPost({ ...post });
    setEditingBlog(true);
  };

  const handleSaveEditedBlog = async () => {
    if (!editedPost) return;
    
    try {
      await api.updateBlogPost(editedPost.id, editedPost);
      setSelectedBlogPost(editedPost);
      setEditingBlog(false);
      loadBlogPosts();
      alert('✅ Artigo atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating blog post:', error);
      alert('❌ Erro ao atualizar artigo.');
    }
  };

  const handleCancelEdit = () => {
    setEditingBlog(false);
    setEditedPost(null);
  };

  // Função para obter estilos baseados no template de diagramação
  const getTemplateStyles = (template, corDestaque) => {
    const cor = corDestaque || '#8B5CF6';
    
    const templates = {
      // Templates originais
      clean: {
        container: { padding: '2rem', backgroundColor: '#FFFFFF', borderRadius: '12px' },
        titulo: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' },
        secaoTitulo: { fontSize: '1.125rem', fontWeight: 'bold', color: cor, marginBottom: '0.75rem' },
        texto: { lineHeight: '1.8', color: '#374151' }
      },
      magazine: {
        container: { padding: '2.5rem', backgroundColor: '#FFFFFF', borderRadius: '0', borderLeft: `6px solid ${cor}` },
        titulo: { fontSize: '2rem', fontWeight: '900', marginBottom: '0.75rem', color: '#111827', fontFamily: 'Georgia, serif' },
        secaoTitulo: { fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
        texto: { lineHeight: '2', color: '#1F2937', fontSize: '1.05rem', fontFamily: 'Georgia, serif' }
      },
      minimal: {
        container: { padding: '3rem', backgroundColor: '#FAFAFA', borderRadius: '4px' },
        titulo: { fontSize: '1.75rem', fontWeight: '300', marginBottom: '1rem', color: '#000000', letterSpacing: '-0.02em' },
        secaoTitulo: { fontSize: '1rem', fontWeight: '600', color: '#000000', marginBottom: '0.5rem', textTransform: 'lowercase' },
        texto: { lineHeight: '1.9', color: '#333333', fontSize: '0.95rem' }
      },
      bold: {
        container: { padding: '2rem', backgroundColor: '#000000', borderRadius: '16px', border: `3px solid ${cor}` },
        titulo: { fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem', color: '#FFFFFF', textTransform: 'uppercase' },
        secaoTitulo: { fontSize: '1.5rem', fontWeight: '800', color: cor, marginBottom: '1rem', textTransform: 'uppercase' },
        texto: { lineHeight: '1.8', color: '#E5E7EB', fontSize: '1.1rem', fontWeight: '500' }
      },
      
      // 🌟 NOVOS TEMPLATES ESTILO GAMMA
      gradient: {
        container: { 
          padding: '3rem', 
          background: `linear-gradient(135deg, ${cor}22 0%, #FFFFFF 100%)`, 
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)'
        },
        titulo: { 
          fontSize: '3rem', 
          fontWeight: '800', 
          marginBottom: '1rem', 
          background: `linear-gradient(135deg, ${cor} 0%, #FF6B9D 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.03em'
        },
        secaoTitulo: { 
          fontSize: '1.75rem', 
          fontWeight: '700', 
          color: '#111827', 
          marginBottom: '1.25rem',
          paddingLeft: '1rem',
          borderLeft: `4px solid ${cor}`
        },
        texto: { lineHeight: '1.9', color: '#374151', fontSize: '1.1rem' }
      },
      
      glass: {
        container: { 
          padding: '2.5rem', 
          background: 'rgba(255, 255, 255, 0.7)', 
          borderRadius: '20px',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
        },
        titulo: { 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          marginBottom: '1rem', 
          color: '#111827',
          textShadow: '0 2px 10px rgba(0,0,0,0.05)'
        },
        secaoTitulo: { 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: cor, 
          marginBottom: '1rem',
          display: 'inline-block',
          padding: '0.5rem 1rem',
          background: 'rgba(255, 255, 255, 0.5)',
          borderRadius: '12px'
        },
        texto: { lineHeight: '1.85', color: '#1F2937', fontSize: '1.05rem' }
      },
      
      slides: {
        container: { 
          padding: '4rem 3rem', 
          backgroundColor: '#0F172A', 
          borderRadius: '0',
          minHeight: '600px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        },
        titulo: { 
          fontSize: '3.5rem', 
          fontWeight: '900', 
          marginBottom: '2rem', 
          color: '#FFFFFF',
          lineHeight: '1.1',
          textAlign: 'center'
        },
        secaoTitulo: { 
          fontSize: '2rem', 
          fontWeight: '700', 
          color: cor, 
          marginTop: '3rem',
          marginBottom: '1.5rem',
          textAlign: 'center'
        },
        texto: { 
          lineHeight: '1.8', 
          color: '#CBD5E1', 
          fontSize: '1.25rem',
          textAlign: 'center',
          maxWidth: '800px',
          margin: '0 auto'
        }
      },
      
      modern: {
        container: { 
          padding: '2rem', 
          backgroundColor: '#FFFFFF', 
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)'
        },
        titulo: { 
          fontSize: '2.25rem', 
          fontWeight: '700', 
          marginBottom: '0.75rem', 
          color: '#111827',
          letterSpacing: '-0.02em'
        },
        secaoTitulo: { 
          fontSize: '1.375rem', 
          fontWeight: '600', 
          color: '#111827', 
          marginBottom: '1rem',
          padding: '0.75rem 1.25rem',
          backgroundColor: `${cor}15`,
          borderRadius: '12px',
          display: 'inline-block'
        },
        texto: { 
          lineHeight: '1.8', 
          color: '#475569', 
          fontSize: '1.05rem',
          padding: '0 0.5rem'
        }
      },
      
      neon: {
        container: { 
          padding: '2.5rem', 
          backgroundColor: '#000000', 
          borderRadius: '20px',
          border: `2px solid ${cor}`,
          boxShadow: `0 0 30px ${cor}40, inset 0 0 20px ${cor}10`
        },
        titulo: { 
          fontSize: '2.75rem', 
          fontWeight: '900', 
          marginBottom: '1rem', 
          color: cor,
          textShadow: `0 0 20px ${cor}, 0 0 40px ${cor}80`,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        },
        secaoTitulo: { 
          fontSize: '1.5rem', 
          fontWeight: '700', 
          color: '#FFFFFF', 
          marginBottom: '1rem',
          textShadow: `0 0 10px ${cor}`,
          borderBottom: `2px solid ${cor}`,
          paddingBottom: '0.5rem',
          display: 'inline-block'
        },
        texto: { 
          lineHeight: '1.8', 
          color: '#E0E0E0', 
          fontSize: '1.05rem',
          textShadow: '0 0 5px rgba(255,255,255,0.1)'
        }
      },
      
      premium: {
        container: { 
          padding: '3rem', 
          background: 'linear-gradient(180deg, #1A1A1A 0%, #0A0A0A 100%)', 
          borderRadius: '16px',
          border: '1px solid #FFD700',
          boxShadow: '0 10px 40px rgba(255, 215, 0, 0.15)'
        },
        titulo: { 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          marginBottom: '1rem', 
          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textAlign: 'center',
          letterSpacing: '0.02em'
        },
        secaoTitulo: { 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: '#FFD700', 
          marginBottom: '1rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          borderTop: '1px solid #FFD70030',
          borderBottom: '1px solid #FFD70030',
          padding: '0.75rem 0'
        },
        texto: { 
          lineHeight: '1.85', 
          color: '#D4D4D4', 
          fontSize: '1.05rem',
          fontFamily: 'Georgia, serif'
        }
      }
    };
    
    return templates[template] || templates.clean;
  };

  const loadBlogPosts = async () => {
    setLoadingBlog(true);
    try {
      const data = await api.getBlogPosts();
      setBlogPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    }
    setLoadingBlog(false);
  };

  const handleSaveBlogPost = async (post) => {
    const postToSave = post || selectedBlogPost;
    if (!postToSave) return;
    
    try {
      await api.updateBlogPost(postToSave.id, {
        status: 'publicado'
      });
      loadBlogPosts();
      setSelectedBlogPost(null);
    } catch (error) {
      console.error('Error saving blog post:', error);
      alert('Erro ao salvar artigo');
    }
  };

  const handleDeleteBlogPost = async (postId) => {
    if (!window.confirm('Tem certeza que deseja deletar este artigo?')) return;
    
    try {
      await api.deleteBlogPost(postId);
      loadBlogPosts();
      if (selectedBlogPost?.id === postId) {
        setSelectedBlogPost(null);
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      alert('Erro ao deletar artigo');
    }
  };

  const loadPopularImages = async () => {
    setLoadingImages(true);
    try {
      const data = await api.getPopularImages();
      setGalleryImages(data.images || []);
    } catch (error) {
      console.error('Error loading images:', error);
    }
    setLoadingImages(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoadingImages(true);
    try {
      const data = await api.searchImages(searchQuery);
      setGalleryImages(data.images || []);
    } catch (error) {
      console.error('Error searching images:', error);
    }
    setLoadingImages(false);
  };

  const handleQuickSearch = (term) => {
    setSearchQuery(term);
    setTimeout(async () => {
      setLoadingImages(true);
      try {
        const data = await api.searchImages(term);
        setGalleryImages(data.images || []);
      } catch (error) {
        console.error('Error searching images:', error);
      }
      setLoadingImages(false);
    }, 100);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const data = await api.uploadImage(file);
        setUploadedImages(prev => [...prev, data]);
      } catch (error) {
        console.error('Error uploading:', error);
      }
    }
    e.target.value = '';
  };

  const handleBgFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const toggleFormat = (id) => {
    setSelectedFormats(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const filteredFormats = formats.filter(f => 
    activeFilter === 'all' || f.category === activeFilter
  );

  const filterCounts = {
    all: formats.length,
    'social-media': formats.filter(f => f.category === 'social-media').length,
    ads: formats.filter(f => f.category === 'ads').length,
  };

  const toggleEffect = (effect) => {
    setActiveEffects(prev => 
      prev.includes(effect) ? prev.filter(e => e !== effect) : [...prev, effect]
    );
  };

  // STEP 1: Format Selection
  if (!showEditor && !showBrandConfig) {
    return (
      <div className="container">
        <header className="header">
          <div className="logo-container">
            <div className="logo-icon">🔥</div>
            <h1 className="logo-text">Elevare NeuroVendas</h1>
            {brandProfile && (
              <span style={{ marginLeft: '1rem', fontSize: '0.9rem', color: '#6B7280' }}>
                {brandProfile.nome_marca}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className="btn"
              onClick={() => {
                setShowBlogCreator(true);
                loadBlogPosts();
              }}
              style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}
            >
              📝 Criar Blog
            </button>
            <button
              className="btn"
              onClick={() => setShowBrandConfig(true)}
              style={{ backgroundColor: '#8B5CF6', color: '#FFFFFF' }}
            >
              ⚙️ Configurar Marca
            </button>
            <nav className="steps-container">
              <div className={`step ${currentStep === 1 ? 'active' : ''}`}>
                <span className="step-number">1</span>
                <span className="step-text">Escolha o Formato</span>
              </div>
              <div className={`step ${currentStep === 2 ? 'active' : ''}`}>
                <span className="step-number">2</span>
                <span className="step-text">Personalize o Design</span>
              </div>
              <div className={`step ${currentStep === 3 ? 'active' : ''}`}>
                <span className="step-number">3</span>
                <span className="step-text">Revise e Exporte</span>
              </div>
            </nav>
          </div>
        </header>

        <main>
          <section className="filter-section">
            <div className="filter-tabs">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'social-media', label: 'Mídia Social' },
                { id: 'ads', label: 'Anúncios' },
              ].map(filter => (
                <button
                  key={filter.id}
                  className={`filter-tab ${activeFilter === filter.id ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {filter.label}
                  <span className="filter-count">{filterCounts[filter.id]}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="format-section">
            <div className="format-grid">
              {filteredFormats.map(format => (
                <div
                  key={format.id}
                  className={`format-card ${selectedFormats.includes(format.id) ? 'selected' : ''}`}
                  onClick={() => toggleFormat(format.id)}
                >
                  {format.badge && <span className="format-badge badge-top">{format.badge}</span>}
                  <div className="selection-checkbox">
                    {selectedFormats.includes(format.id) ? '✔' : '☐'}
                  </div>
                  <div className="format-icon">{format.icon}</div>
                  <h3 className="format-title">{format.title}</h3>
                  <p className="format-dimensions">{format.dimensions}</p>
                  <span className="format-platform">{format.platform}</span>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className="bottom-actions">
          <div className="bottom-content">
            <div className="selection-info">
              <div className="selected-count">
                <span className="count-number">{selectedFormats.length}</span>
                <span>Selecionado(s)</span>
              </div>
              <div className="selected-items">
                {selectedFormats.map(id => {
                  const format = formats.find(f => f.id === id);
                  return format ? (
                    <span key={id} className="selected-chip">
                      {format.title} {format.icon}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
            <button
              className="btn btn-primary"
              disabled={selectedFormats.length === 0}
              onClick={() => { setShowEditor(true); setCurrentStep(2); }}
            >
              Continuar para Personalização
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // BRAND CONFIGURATION SCREEN
  if (showBrandConfig) {
    return (
      <div className="container">
        <header className="header">
          <div className="logo-container">
            <div className="logo-icon">⚙️</div>
            <h1 className="logo-text">Configuração da Marca</h1>
          </div>
          <button
            className="btn"
            onClick={() => setShowBrandConfig(false)}
            style={{ backgroundColor: '#6B7280', color: '#FFFFFF' }}
          >
            ← Voltar
          </button>
        </header>

        <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          {loadingBrand ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p>Carregando perfil da marca...</p>
            </div>
          ) : brandProfile ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {/* Identidade da Marca */}
              <div className="editor-section" style={{ padding: '2rem', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>
                  🎯 Identidade da Marca
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>Nome da Marca:</strong>
                    <p style={{ fontSize: '1.25rem', color: '#111827' }}>{brandProfile.nome_marca}</p>
                  </div>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>Segmento:</strong>
                    <p style={{ color: '#111827' }}>{brandProfile.segmento}</p>
                  </div>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>Tom de Voz:</strong>
                    <span style={{ display: 'inline-block', padding: '0.5rem 1rem', backgroundColor: '#8B5CF6', color: '#FFFFFF', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 'bold' }}>
                      {brandProfile.tom_de_voz}
                    </span>
                  </div>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>Personalidade:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {brandProfile.personalidade?.map((trait, idx) => (
                        <span key={idx} style={{ padding: '0.25rem 0.75rem', backgroundColor: '#EEF2FF', color: '#4F46E5', borderRadius: '12px', fontSize: '0.875rem' }}>
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>Valores:</strong>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {brandProfile.valores?.map((valor, idx) => (
                        <li key={idx} style={{ marginBottom: '0.25rem', color: '#111827' }}>✓ {valor}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Linguagem e Comunicação */}
              <div className="editor-section" style={{ padding: '2rem', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>
                  💬 Linguagem e Comunicação
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>Público Principal:</strong>
                    <p style={{ color: '#111827' }}>{brandProfile.publico_principal}</p>
                  </div>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>Faixa Etária:</strong>
                    <p style={{ color: '#111827' }}>{brandProfile.faixa_etaria_alvo}</p>
                  </div>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>Estilo de Comunicação:</strong>
                    <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.6' }}>{brandProfile.estilo_comunicacao}</p>
                  </div>
                  {brandProfile.palavras_chave && brandProfile.palavras_chave.length > 0 && (
                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>✅ Palavras-Chave Estratégicas:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {brandProfile.palavras_chave.slice(0, 6).map((palavra, idx) => (
                          <span key={idx} style={{ padding: '0.25rem 0.75rem', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '12px', fontSize: '0.75rem' }}>
                            {palavra}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {brandProfile.palavras_evitar && brandProfile.palavras_evitar.length > 0 && (
                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>❌ Palavras a Evitar:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {brandProfile.palavras_evitar.slice(0, 6).map((palavra, idx) => (
                          <span key={idx} style={{ padding: '0.25rem 0.75rem', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '12px', fontSize: '0.75rem' }}>
                            {palavra}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Identidade Visual */}
              <div className="editor-section" style={{ padding: '2rem', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>
                  🎨 Identidade Visual
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>Cores Primárias:</strong>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {brandProfile.cores_primarias?.map((cor, idx) => (
                        <div key={idx} style={{ width: '50px', height: '50px', backgroundColor: cor, borderRadius: '8px', border: '2px solid #E5E7EB' }} title={cor}></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>Cores Secundárias:</strong>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {brandProfile.cores_secundarias?.map((cor, idx) => (
                        <div key={idx} style={{ width: '40px', height: '40px', backgroundColor: cor, borderRadius: '8px', border: '2px solid #E5E7EB' }} title={cor}></div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>Fonte Principal:</strong>
                    <p style={{ fontSize: '1.25rem', fontFamily: `'${brandProfile.fonte_principal}', sans-serif`, color: '#111827' }}>
                      {brandProfile.fonte_principal}
                    </p>
                  </div>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>Fonte Secundária:</strong>
                    <p style={{ fontSize: '1.25rem', fontFamily: `'${brandProfile.fonte_secundaria}', sans-serif`, color: '#111827' }}>
                      {brandProfile.fonte_secundaria}
                    </p>
                  </div>
                </div>
              </div>

              {/* Diferenciais */}
              <div className="editor-section" style={{ padding: '2rem', backgroundColor: '#F9FAFB', borderRadius: '12px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>
                  💎 Diferenciais da Marca
                </h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {brandProfile.diferenciais?.map((diferencial, idx) => (
                    <li key={idx} style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                      <span style={{ color: '#8B5CF6', fontSize: '1.25rem' }}>✦</span>
                      <span style={{ color: '#111827', lineHeight: '1.5' }}>{diferencial}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p>Nenhum perfil de marca encontrado.</p>
              <button
                className="btn btn-primary"
                onClick={async () => {
                  await api.seedBrandProfile();
                  loadBrandProfile();
                }}
              >
                Criar Perfil Padrão
              </button>
            </div>
          )}

          <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#EEF2FF', borderRadius: '12px', border: '2px solid #8B5CF6' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#4F46E5' }}>
              🤖 Integração com Lucresia IA
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.6' }}>
              Este perfil de marca está integrado com a Lucresia, sua assistente de Neurovendas. 
              Todos os conteúdos gerados pela IA seguirão automaticamente o tom de voz, valores e diretrizes definidos aqui.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // BLOG CREATOR SCREEN
  if (showBlogCreator) {
    return (
      <div className="container">
        <header className="header">
          <div className="logo-container">
            <div className="logo-icon">📝</div>
            <h1 className="logo-text">Criar Artigo de Blog</h1>
          </div>
          <button
            className="btn"
            onClick={() => setShowBlogCreator(false)}
            style={{ backgroundColor: '#6B7280', color: '#FFFFFF' }}
          >
            ← Voltar
          </button>
        </header>

        <main style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* FORMULÁRIO */}
            <div>
              <div className="editor-section" style={{ padding: '2rem', backgroundColor: '#F9FAFB', borderRadius: '12px', borderLeft: `4px solid ${brandProfile?.cores_primarias?.[0] || '#8B5CF6'}` }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>
                  ✍️ Informações do Artigo
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>
                      📌 Tópico Principal
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Neuromarketing e Comportamento do Consumidor"
                      value={blogTopico}
                      onChange={(e) => setBlogTopico(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>
                      🎯 Objetivo do Artigo
                    </label>
                    <textarea
                      className="form-input"
                      placeholder="Ex: Explicar como o neuromarketing impacta decisões de compra"
                      value={blogObjetivo}
                      onChange={(e) => setBlogObjetivo(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', minHeight: '80px', fontFamily: 'inherit' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>
                      👥 Público-Alvo
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Empresas de e-commerce e varejistas"
                      value={blogPublicoAlvo}
                      onChange={(e) => setBlogPublicoAlvo(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>
                      📊 Número de Seções
                    </label>
                    <select
                      className="form-input"
                      value={blogNumSecoes}
                      onChange={(e) => setBlogNumSecoes(Number(e.target.value))}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                    >
                      <option value="3">3 seções</option>
                      <option value="4">4 seções</option>
                      <option value="5">5 seções</option>
                      <option value="6">6 seções</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>
                      🔑 Palavras-Chave para SEO
                    </label>
                    <textarea
                      className="form-input"
                      placeholder="Ex: neuromarketing, psicologia do consumidor, estratégia de vendas"
                      value={blogPalavrasChave}
                      onChange={(e) => setBlogPalavrasChave(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', minHeight: '60px', fontFamily: 'inherit' }}
                    />
                  </div>

                  <button
                    className="btn"
                    onClick={handleGenerateBlogPost}
                    disabled={generatingBlog || !blogTopico || !blogObjetivo}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: generatingBlog ? '#9CA3AF' : '#10B981',
                      color: '#FFFFFF',
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: generatingBlog ? 'not-allowed' : 'pointer',
                      marginTop: '1rem'
                    }}
                  >
                    {generatingBlog ? '⏳ Gerando artigo...' : '✨ Gerar Artigo com Lucresia'}
                  </button>
                </div>
              </div>

              {/* POSTS SALVOS */}
              <div className="editor-section" style={{ padding: '2rem', backgroundColor: '#F9FAFB', borderRadius: '12px', marginTop: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' }}>
                  📚 Artigos Salvos ({blogPosts.length})
                </h2>
                {blogPosts.length === 0 ? (
                  <p style={{ color: '#6B7280', textAlign: 'center', padding: '1rem' }}>Nenhum artigo salvo ainda</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {blogPosts.map(post => (
                      <div
                        key={post.id}
                        onClick={() => setSelectedBlogPost(post)}
                        style={{
                          padding: '1rem',
                          backgroundColor: selectedBlogPost?.id === post.id ? '#EEF2FF' : '#FFFFFF',
                          border: `2px solid ${selectedBlogPost?.id === post.id ? '#8B5CF6' : '#E5E7EB'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <p style={{ fontWeight: 'bold', color: '#111827' }}>{post.titulo}</p>
                        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
                          {post.topico} • Status: {post.status}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* PREVIEW DO ARTIGO */}
            <div>
              {editingBlog && editedPost ? (
                <div className="editor-section" style={{ padding: '2rem', backgroundColor: '#FFF7ED', borderRadius: '12px', border: '2px solid #F59E0B' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>✏️</span> Editando Artigo
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Título */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>Título</label>
                      <input
                        type="text"
                        value={editedPost.titulo}
                        onChange={(e) => setEditedPost({ ...editedPost, titulo: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1rem' }}
                      />
                    </div>

                    {/* Introdução */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>Introdução</label>
                      <textarea
                        value={editedPost.introducao}
                        onChange={(e) => setEditedPost({ ...editedPost, introducao: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', minHeight: '100px', fontFamily: 'inherit' }}
                      />
                    </div>

                    {/* Seções */}
                    {editedPost.secoes?.map((secao, idx) => (
                      <div key={idx} style={{ padding: '1rem', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>
                          Seção {idx + 1} - Título
                        </label>
                        <input
                          type="text"
                          value={secao.titulo}
                          onChange={(e) => {
                            const newSecoes = [...editedPost.secoes];
                            newSecoes[idx].titulo = e.target.value;
                            setEditedPost({ ...editedPost, secoes: newSecoes });
                          }}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB', marginBottom: '0.5rem' }}
                        />
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>Conteúdo</label>
                        <textarea
                          value={secao.conteudo}
                          onChange={(e) => {
                            const newSecoes = [...editedPost.secoes];
                            newSecoes[idx].conteudo = e.target.value;
                            setEditedPost({ ...editedPost, secoes: newSecoes });
                          }}
                          style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #D1D5DB', minHeight: '120px', fontFamily: 'inherit' }}
                        />
                      </div>
                    ))}

                    {/* Conclusão */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>Conclusão</label>
                      <textarea
                        value={editedPost.conclusao}
                        onChange={(e) => setEditedPost({ ...editedPost, conclusao: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', minHeight: '100px', fontFamily: 'inherit' }}
                      />
                    </div>

                    {/* CTA */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>CTA (Chamada para Ação)</label>
                      <textarea
                        value={editedPost.cta}
                        onChange={(e) => setEditedPost({ ...editedPost, cta: e.target.value })}
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', minHeight: '60px', fontFamily: 'inherit' }}
                      />
                    </div>

                    {/* Botões de Ação */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E5E7EB' }}>
                      <button
                        className="btn"
                        onClick={handleSaveEditedBlog}
                        style={{ backgroundColor: '#10B981', color: '#FFFFFF', fontWeight: 'bold', padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                      >
                        💾 Salvar Alterações
                      </button>
                      <button
                        className="btn"
                        onClick={handleCancelEdit}
                        style={{ backgroundColor: '#6B7280', color: '#FFFFFF', fontWeight: 'bold', padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                      >
                        ❌ Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              ) : selectedBlogPost ? (
                (() => {
                  const styles = getTemplateStyles(selectedBlogPost.template_diagramacao || 'clean', selectedBlogPost.cor_destaque);
                  return (
                    <div className="editor-section" style={styles.container}>
                      <h2 style={styles.titulo}>
                        {selectedBlogPost.titulo}
                      </h2>
                      <p style={{ color: '#6B7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                        Tópico: {selectedBlogPost.topico} • Publicado: {new Date(selectedBlogPost.created_at).toLocaleDateString('pt-BR')}
                      </p>

                      <div style={{ borderTop: `2px solid ${selectedBlogPost.cor_destaque || '#8B5CF6'}`, paddingTop: '1.5rem' }}>
                        {/* INTRODUÇÃO */}
                        <div style={{ marginBottom: '2rem' }}>
                          <h3 style={styles.secaoTitulo}>
                            📖 Introdução
                          </h3>
                          <p style={styles.texto}>{selectedBlogPost.introducao}</p>
                        </div>

                        {/* SEÇÕES */}
                        {selectedBlogPost.secoes?.map((secao, idx) => (
                          <div key={idx} style={{ marginBottom: '2rem' }}>
                            <h3 style={styles.secaoTitulo}>
                              {idx + 1}. {secao.titulo}
                            </h3>
                            <p style={styles.texto}>{secao.conteudo}</p>
                          </div>
                        ))}

                        {/* CONCLUSÃO */}
                        {selectedBlogPost.conclusao && (
                          <div style={{ marginBottom: '2rem' }}>
                            <h3 style={styles.secaoTitulo}>
                              ✓ Conclusão
                            </h3>
                            <p style={styles.texto}>{selectedBlogPost.conclusao}</p>
                          </div>
                        )}

                    {/* CTA */}
                    {selectedBlogPost.cta && (
                      <div style={{ padding: '1.5rem', backgroundColor: '#EEF2FF', borderLeft: `4px solid ${brandProfile?.cores_primarias?.[0] || '#8B5CF6'}`, borderRadius: '8px', marginBottom: '2rem' }}>
                        <p style={{ fontWeight: 'bold', color: '#4F46E5', marginBottom: '0.5rem' }}>🚀 Próximo Passo:</p>
                        <p style={{ color: '#374151', lineHeight: '1.6' }}>{selectedBlogPost.cta}</p>
                      </div>
                    )}

                    {/* SUGESTÕES DE IMAGENS */}
                    {selectedBlogPost.sugestoes_imagens?.length > 0 && (
                      <div style={{ padding: '1.5rem', backgroundColor: '#F0FDF4', borderLeft: '4px solid #10B981', borderRadius: '8px', marginBottom: '2rem' }}>
                        <p style={{ fontWeight: 'bold', color: '#065F46', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>🖼️</span> Sugestões de Imagens
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.75rem' }}>
                          Use estes termos para buscar imagens no Unsplash, Pexels ou banco de imagens:
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {selectedBlogPost.sugestoes_imagens.map((sugestao, idx) => (
                            <span key={idx} style={{ padding: '0.5rem 1rem', backgroundColor: '#FFFFFF', color: '#059669', borderRadius: '8px', fontSize: '0.875rem', border: '1px solid #D1FAE5', cursor: 'pointer' }}
                              onClick={() => {
                                navigator.clipboard.writeText(sugestao);
                                alert(`✅ "${sugestao}" copiado!`);
                              }}
                              title="Clique para copiar"
                            >
                              📸 {sugestao}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* GERAÇÃO DE IMAGENS COM IA */}
                    <div style={{ padding: '1.5rem', backgroundColor: '#EEF2FF', borderLeft: '4px solid #8B5CF6', borderRadius: '8px', marginBottom: '2rem' }}>
                      <p style={{ fontWeight: 'bold', color: '#5B21B6', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>🎨</span> Geração de Imagens com IA (DALL-E 3)
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1rem' }}>
                        Gere imagens únicas para seu artigo usando Inteligência Artificial
                      </p>
                      
                      {selectedBlogPost.imagem_destaque && (
                        <div style={{ marginBottom: '1rem' }}>
                          <img 
                            src={selectedBlogPost.imagem_destaque} 
                            alt="Imagem destaque"
                            style={{ maxWidth: '100%', borderRadius: '8px', border: '2px solid #E5E7EB' }}
                          />
                          <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.5rem' }}>✅ Imagem destaque atual</p>
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {selectedBlogPost.sugestoes_imagens?.map((sugestao, idx) => (
                          <button
                            key={idx}
                            className="btn"
                            onClick={() => handleGenerateImage(sugestao)}
                            disabled={generatingImage}
                            style={{
                              padding: '0.5rem 1rem',
                              backgroundColor: '#8B5CF6',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: generatingImage ? 'wait' : 'pointer',
                              fontSize: '0.75rem',
                              opacity: generatingImage ? 0.6 : 1
                            }}
                          >
                            {generatingImage ? '⏳ Gerando...' : `🎨 Gerar: ${sugestao}`}
                          </button>
                        ))}
                      </div>
                      
                      {generatedImages.length > 0 && (
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #E5E7EB' }}>
                          <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#5B21B6', marginBottom: '0.5rem' }}>📸 Imagens Geradas:</p>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                            {generatedImages.map((url, idx) => (
                              <img 
                                key={idx}
                                src={url} 
                                alt={`Gerada ${idx + 1}`}
                                style={{ width: '100%', borderRadius: '4px', cursor: 'pointer', border: '2px solid #E5E7EB' }}
                                onClick={() => {
                                  setSelectedBlogPost({ ...selectedBlogPost, imagem_destaque: url });
                                  api.updateBlogPost(selectedBlogPost.id, { imagem_destaque: url });
                                }}
                                title="Clique para definir como destaque"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* OPÇÕES DE DIAGRAMAÇÃO */}
                    {selectedBlogPost.template_diagramacao && (
                      <div style={{ padding: '1.5rem', backgroundColor: '#FEF3C7', borderLeft: '4px solid #F59E0B', borderRadius: '8px', marginBottom: '2rem' }}>
                        <p style={{ fontWeight: 'bold', color: '#92400E', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>🎨</span> Diagramação Automática - Templates Estilo Gamma
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.75rem' }}>
                          Layout atual: <strong style={{ textTransform: 'capitalize' }}>{selectedBlogPost.template_diagramacao}</strong>
                        </p>
                        <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.5rem' }}>
                          Cor de destaque: <span style={{ display: 'inline-block', width: '20px', height: '20px', backgroundColor: selectedBlogPost.cor_destaque || '#8B5CF6', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '0.5rem', border: '2px solid #E5E7EB' }}></span> {selectedBlogPost.cor_destaque || '#8B5CF6'}
                        </p>
                        
                        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Templates Clássicos:</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {['clean', 'magazine', 'minimal', 'bold'].map(template => (
                            <button
                              key={template}
                              className="btn"
                              onClick={() => {
                                setSelectedBlogPost({ ...selectedBlogPost, template_diagramacao: template });
                              }}
                              style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: selectedBlogPost.template_diagramacao === template ? '#F59E0B' : '#FFFFFF',
                                color: selectedBlogPost.template_diagramacao === template ? '#FFFFFF' : '#92400E',
                                border: '1px solid #FCD34D',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: selectedBlogPost.template_diagramacao === template ? 'bold' : 'normal'
                              }}
                            >
                              {template.charAt(0).toUpperCase() + template.slice(1)}
                            </button>
                          ))}
                        </div>
                        
                        <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>🌟 Templates Gamma (Modernos):</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {['gradient', 'glass', 'slides', 'modern', 'neon', 'premium'].map(template => (
                            <button
                              key={template}
                              className="btn"
                              onClick={() => {
                                setSelectedBlogPost({ ...selectedBlogPost, template_diagramacao: template });
                              }}
                              style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: selectedBlogPost.template_diagramacao === template ? '#8B5CF6' : '#FFFFFF',
                                color: selectedBlogPost.template_diagramacao === template ? '#FFFFFF' : '#8B5CF6',
                                border: '2px solid #8B5CF6',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: selectedBlogPost.template_diagramacao === template ? 'bold' : 'normal'
                              }}
                            >
                              {template.charAt(0).toUpperCase() + template.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* TAGS E KEYWORDS */}
                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #E5E7EB' }}>
                      {selectedBlogPost.tags?.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <p style={{ fontWeight: 'bold', color: '#374151', marginBottom: '0.5rem' }}>📌 Tags:</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {selectedBlogPost.tags.map((tag, idx) => (
                              <span key={idx} style={{ padding: '0.25rem 0.75rem', backgroundColor: '#D1FAE5', color: '#065F46', borderRadius: '12px', fontSize: '0.75rem' }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedBlogPost.palavras_chave_seo?.length > 0 && (
                        <div>
                          <p style={{ fontWeight: 'bold', color: '#374151', marginBottom: '0.5rem' }}>🔑 Palavras-Chave SEO:</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {selectedBlogPost.palavras_chave_seo.map((palavra, idx) => (
                              <span key={idx} style={{ padding: '0.25rem 0.75rem', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '12px', fontSize: '0.75rem' }}>
                                {palavra}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AÇÕES */}
                  <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #E5E7EB' }}>
                    {/* Primeira linha: Copiar e Exportar */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <button
                        className="btn"
                        onClick={() => handleCopyBlogPost(selectedBlogPost)}
                        style={{ backgroundColor: '#3B82F6', color: '#FFFFFF', fontWeight: 'bold', padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                      >
                        📋 Copiar
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleExportBlogPost(selectedBlogPost, 'html')}
                        style={{ backgroundColor: '#8B5CF6', color: '#FFFFFF', fontWeight: 'bold', padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                      >
                        📄 HTML
                      </button>
                      <button
                        className="btn"
                        onClick={() => handleExportBlogPost(selectedBlogPost, 'md')}
                        style={{ backgroundColor: '#8B5CF6', color: '#FFFFFF', fontWeight: 'bold', padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                      >
                        📝 MD
                      </button>
                    </div>

                    {/* ===== NOVOS BOTÕES DAS 10 FEATURES ===== */}
                    {/* Linha 1: SEO, Analytics, Versões, Preview */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <button
                        className="btn"
                        onClick={() => handleValidateSEO(selectedBlogPost.id)}
                        disabled={validatingSEO}
                        title="Validar checklist SEO do artigo"
                        style={{ backgroundColor: '#F59E0B', color: '#FFFFFF', fontWeight: 'bold', padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: validatingSEO ? 'not-allowed' : 'pointer', fontSize: '0.75rem', opacity: validatingSEO ? 0.6 : 1 }}
                      >
                        📊 SEO
                      </button>
                      <button
                        className="btn"
                        onClick={() => loadPostAnalytics(selectedBlogPost.id)}
                        title="Ver analytics do artigo"
                        style={{ backgroundColor: '#0EA5E9', color: '#FFFFFF', fontWeight: 'bold', padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        📈 Analytics
                      </button>
                      <button
                        className="btn"
                        onClick={() => {
                          loadVersionHistory(selectedBlogPost.id);
                          setShowVersions(true);
                        }}
                        title="Ver histórico de versões"
                        style={{ backgroundColor: '#8B5CF6', color: '#FFFFFF', fontWeight: 'bold', padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        🔄 Versões
                      </button>
                      <button
                        className="btn"
                        onClick={() => loadMultiplePreview(selectedBlogPost.id)}
                        title="Visualizar em diferentes formatos"
                        style={{ backgroundColor: '#10B981', color: '#FFFFFF', fontWeight: 'bold', padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        📱 Preview
                      </button>
                    </div>

                    {/* Linha 2: Categorias, Links, Templates, Agendar */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <button
                        className="btn"
                        onClick={() => {
                          loadCategories();
                          setShowScheduleModal(true);
                        }}
                        title="Categorizar artigo"
                        style={{ backgroundColor: '#EC4899', color: '#FFFFFF', fontWeight: 'bold', padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        🏷️ Categorias
                      </button>
                      <button
                        className="btn"
                        onClick={() => loadSuggestedLinks(selectedBlogPost.id)}
                        title="Sugerir links internos"
                        style={{ backgroundColor: '#6366F1', color: '#FFFFFF', fontWeight: 'bold', padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        🔗 Links
                      </button>
                      <button
                        className="btn"
                        onClick={() => {
                          loadSectionTemplates();
                          setSelectedTemplateSection('faq');
                        }}
                        title="Adicionar seção template"
                        style={{ backgroundColor: '#14B8A6', color: '#FFFFFF', fontWeight: 'bold', padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        🎭 Seções
                      </button>
                      <button
                        className="btn"
                        onClick={() => setShowScheduleModal(true)}
                        title="Agendar publicação"
                        style={{ backgroundColor: '#F97316', color: '#FFFFFF', fontWeight: 'bold', padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        📅 Agendar
                      </button>
                    </div>

                    {/* Linha 3: Salvar Versão, Autosave, Exportar Plataformas */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <button
                        className="btn"
                        onClick={() => handleSaveVersion(selectedBlogPost.id)}
                        title="Salvar versão atual"
                        style={{ backgroundColor: '#A855F7', color: '#FFFFFF', fontWeight: 'bold', padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        💾 Versão
                      </button>
                      <button
                        className="btn"
                        onClick={() => setAutosaveEnabled(!autosaveEnabled)}
                        title={autosaveEnabled ? 'Desativar autosave' : 'Ativar autosave'}
                        style={{ backgroundColor: autosaveEnabled ? '#22C55E' : '#9CA3AF', color: '#FFFFFF', fontWeight: 'bold', padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        💾 AutoSave {autosaveEnabled ? '✓' : '✗'}
                      </button>
                      <button
                        className="btn"
                        onClick={() => setShowExportOptions(!showExportOptions)}
                        title="Exportar para plataformas"
                        style={{ backgroundColor: '#3B82F6', color: '#FFFFFF', fontWeight: 'bold', padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        📤 Plataformas
                      </button>
                    </div>

                    {/* Exibir opções de plataforma se habilitado */}
                    {showExportOptions && (
                      <div style={{ padding: '1rem', backgroundColor: '#F0FDFB', borderRadius: '8px', marginBottom: '0.75rem', border: '1px solid #10B981' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '0.75rem', color: '#047857', fontSize: '0.875rem' }}>📤 Publicar em Plataforma:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.5rem' }}>
                          {['Medium', 'Dev.to', 'WordPress', 'Notion'].map(platform => (
                            <button
                              key={platform}
                              className="btn"
                              onClick={() => handlePublishToPlatform(selectedBlogPost.id, platform.toLowerCase())}
                              style={{ backgroundColor: '#10B981', color: '#FFFFFF', fontWeight: 'bold', padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.7rem' }}
                            >
                              {platform}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exibir SEO Score se disponível */}
                    {seoScore !== null && (
                      <div style={{ padding: '1rem', backgroundColor: '#FEF3C7', borderRadius: '8px', marginBottom: '0.75rem', border: '1px solid #F59E0B' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#92400E', fontSize: '0.875rem' }}>📊 SEO Score: {seoScore}/100</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {seoChecks && Object.entries(seoChecks).map(([check, passed]) => (
                            <span
                              key={check}
                              style={{
                                padding: '0.25rem 0.5rem',
                                backgroundColor: passed ? '#DCFCE7' : '#FEE2E2',
                                color: passed ? '#166534' : '#991B1B',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 'bold'
                              }}
                              title={check}
                            >
                              {passed ? '✓' : '✗'} {check.substring(0, 8)}...
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exibir Analytics se disponível */}
                    {analyticsData && (
                      <div style={{ padding: '1rem', backgroundColor: '#EFF6FF', borderRadius: '8px', marginBottom: '0.75rem', border: '1px solid #0EA5E9' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#0369A1', fontSize: '0.875rem' }}>📈 Analytics</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.5rem', fontSize: '0.75rem', color: '#6B7280' }}>
                          <div>👁️ Views: <strong>{analyticsData.visualizacoes}</strong></div>
                          <div>📤 Shares: <strong>{analyticsData.compartilhamentos}</strong></div>
                          <div>💬 Comments: <strong>{analyticsData.comentarios}</strong></div>
                          <div>⏱️ Reading: <strong>{analyticsData.tempo_leitura}</strong></div>
                        </div>
                      </div>
                    )}

                    {/* Exibir último autosave */}
                    {lastAutosaved && (
                      <p style={{ fontSize: '0.7rem', color: '#6B7280', marginBottom: '0.75rem', fontStyle: 'italic', textAlign: 'center' }}>
                        💾 Último autosave: {lastAutosaved}
                      </p>
                    )}

                    {/* Segunda linha: Editar, Publicar, Deletar */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                      <button
                        className="btn"
                        onClick={() => handleEditBlogPost(selectedBlogPost)}
                        style={{ backgroundColor: '#F59E0B', color: '#FFFFFF', fontWeight: 'bold', padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        className="btn"
                        onClick={async () => {
                          await handleSaveBlogPost(selectedBlogPost);
                          alert('✅ Artigo publicado com sucesso!');
                        }}
                        style={{ backgroundColor: '#10B981', color: '#FFFFFF', fontWeight: 'bold', padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                      >
                        📤 Publicar
                      </button>
                      <button
                        className="btn"
                        onClick={async () => {
                          if (window.confirm('Tem certeza que deseja deletar este artigo?')) {
                            await handleDeleteBlogPost(selectedBlogPost.id);
                            setSelectedBlogPost(null);
                            loadBlogPosts();
                        }
                      }}
                      style={{ backgroundColor: '#EF4444', color: '#FFFFFF', fontWeight: 'bold', padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                    >
                      🗑️ Deletar
                    </button>
                  </div>
                </div>
                  );
                })()
              ) : (
                <div className="editor-section" style={{ padding: '2rem', backgroundColor: '#F0FDFB', borderRadius: '12px', border: '2px dashed #10B981', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                  <p style={{ color: '#047857', fontWeight: 'bold', marginBottom: '0.5rem' }}>Nenhum artigo selecionado</p>
                  <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                    Gere um novo artigo usando o formulário ao lado ou selecione um dos artigos salvos para visualizar.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // STEP 2: Editor
  return (
    <div className="app-container">
      {/* LEFT SIDEBAR */}
      <aside className="sidebar-left">
        <div className="logo">
          <div className="logo-icon" style={{ width: 48, height: 48, fontSize: '1.5rem' }}>🔥</div>
          <h2 className="logo-text" style={{ fontSize: '1.5rem' }}>Personalização</h2>
        </div>

        <div className="editor-section">
          <h3 className="section-title">Templates</h3>
          <div className="type-grid">
            {[
              { id: 'template-templates', icon: '✨', label: 'Templates' },
              { id: 'template-images', icon: '🖼️', label: 'Imagens' },
              { id: 'template-text', icon: '📝', label: 'Texto' },
              { id: 'template-background', icon: '🎨', label: 'Fundo' },
            ].map(tab => (
              <button
                key={tab.id}
                className={`type-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="type-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TEMPLATES SECTION */}
        {activeTab === 'template-templates' && (
          <div className="editor-section">
            <h3 className="section-title">Templates de Design</h3>
            <div className="stories-list">
              {templates.map(template => (
                <div
                  key={template.id}
                  className={`story-item-mini ${activeTemplate === template.id ? 'active' : ''}`}
                  onClick={() => setActiveTemplate(template.id)}
                >
                  <div className="story-item-header">
                    <span className="story-number">{template.id}</span>
                    <span className="story-badge">{template.badge}</span>
                  </div>
                  <p className="story-preview-text">{template.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IMAGES SECTION */}
        {activeTab === 'template-images' && (
          <div className="editor-section">
            <h3 className="section-title">Imagens</h3>
            <div className="image-section">
              <div className="image-source-tabs">
                {[
                  { id: 'library', icon: '📚', label: 'Biblioteca' },
                  { id: 'upload', icon: '⬆️', label: 'Upload' },
                  { id: 'stock', icon: '🖼️', label: 'Stock' },
                  { id: 'my-images', icon: '🗂️', label: 'Minhas' },
                ].map(source => (
                  <button
                    key={source.id}
                    className={`source-tab ${activeImageSource === source.id ? 'active' : ''}`}
                    onClick={() => setActiveImageSource(source.id)}
                  >
                    <span className="source-icon">{source.icon}</span>
                    {source.label}
                  </button>
                ))}
              </div>

              <div className="search-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Pesquisar imagens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="search-btn" onClick={handleSearch}>Buscar</button>
              </div>

              <div className="quick-searches">
                {quickSearches.map(term => (
                  <span
                    key={term}
                    className="quick-search-chip"
                    onClick={() => handleQuickSearch(term)}
                  >
                    {term}
                  </span>
                ))}
              </div>

              {(activeImageSource === 'upload' || activeImageSource === 'my-images') && (
                <>
                  <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                    <div className="upload-icon">☁️</div>
                    <p className="upload-text">Arraste e solte ou clique para enviar imagens</p>
                    <p className="upload-hint">Tamanho máximo: 5MB. Formatos: JPG, PNG, GIF.</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                  </div>
                  {uploadedImages.length > 0 && (
                    <div className="uploaded-images-grid">
                      {uploadedImages.map((img, idx) => (
                        <div
                          key={idx}
                          className={`uploaded-image-item ${selectedImage === img.url ? 'selected' : ''}`}
                          onClick={() => { setSelectedImage(img.url); setBackgroundImage(img.url); }}
                        >
                          <img src={img.url} alt={img.filename || 'Uploaded'} />
                          <button
                            className="delete-image-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedImages(prev => prev.filter((_, i) => i !== idx));
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div className="image-gallery">
                {loadingImages ? (
                  <div className="gallery-loading">Carregando imagens...</div>
                ) : (
                  galleryImages.map((img, idx) => (
                    <div
                      key={img.id || idx}
                      className={`gallery-item ${selectedImage === (img.urls?.regular || img.url) ? 'selected' : ''}`}
                      onClick={() => {
                        const url = img.urls?.regular || img.url;
                        setSelectedImage(url);
                        setBackgroundImage(url);
                      }}
                    >
                      <img src={img.urls?.small || img.url} alt={img.description || ''} />
                      <span className="image-source-badge">
                        {img.user ? `📷 ${img.user.name}` : 'Stock'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TEXT SECTION */}
        {activeTab === 'template-text' && (
          <div className="editor-section">
            <h3 className="section-title">Texto e Fontes</h3>
            <div className="form-group">
              <label className="form-label">Texto Principal</label>
              <textarea
                className="form-textarea"
                value={mainText}
                onChange={(e) => setMainText(e.target.value)}
                placeholder="Insira seu texto principal aqui..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Texto Secundário</label>
              <textarea
                className="form-textarea"
                value={subtitleText}
                onChange={(e) => setSubtitleText(e.target.value)}
                placeholder="Insira seu texto secundário aqui..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Família da Fonte</label>
              <select
                className="form-input"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
              >
                <option value="Inter">Inter</option>
                <option value="Playfair Display">Playfair Display</option>
                <option value="Montserrat">Montserrat</option>
                <option value="Poppins">Poppins</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Efeitos de Texto</label>
              <div className="text-effects-grid">
                {[
                  { id: 'bold', label: 'Negrito' },
                  { id: 'italic', label: 'Itálico' },
                  { id: 'underline', label: 'Sublinhado' },
                  { id: 'strikethrough', label: 'Risca' },
                ].map(effect => (
                  <button
                    key={effect.id}
                    className={`effect-btn ${activeEffects.includes(effect.id) ? 'active' : ''}`}
                    onClick={() => toggleEffect(effect.id)}
                  >
                    {effect.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Alinhamento</label>
              <div className="text-align-grid">
                {['left', 'center', 'right', 'justify'].map(align => (
                  <button
                    key={align}
                    className={`text-align-btn ${textAlign === align ? 'active' : ''}`}
                    onClick={() => setTextAlign(align)}
                  >
                    {align === 'left' ? '⬅' : align === 'center' ? '↔' : align === 'right' ? '➡' : '≡'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BACKGROUND SECTION */}
        {activeTab === 'template-background' && (
          <div className="editor-section">
            <h3 className="section-title">Cor e Imagem de Fundo</h3>
            <div className="form-group">
              <label className="form-label">Opções de Fundo</label>
              <div className="background-controls">
                {bgColors.map((color, idx) => (
                  <div
                    key={idx}
                    className={`background-option ${selectedBgColor === color && !backgroundImage ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => { setSelectedBgColor(color); setBackgroundImage(null); }}
                  />
                ))}
                <label className="upload-background-btn" onClick={() => bgFileInputRef.current?.click()}>
                  <span style={{ fontSize: '1.25rem' }}>⬆️</span>
                  <span>Fundo</span>
                  <input
                    ref={bgFileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleBgFileUpload}
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* EDITOR AREA */}
      <main className="editor-area">
        <div className="editor-header">
          <h2 className="editor-title">Editor de Design</h2>
          <div className="toolbar-row">
            <button className="toolbar-btn active">Adicionar Elemento</button>
            <button className="toolbar-btn">Camadas</button>
            <button className="toolbar-btn">Desfazer</button>
            <button className="toolbar-btn">Refazer</button>
            <button className="toolbar-btn" onClick={() => handleStoriesCompanion()} style={{ backgroundColor: '#8B5CF6', color: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 'bold' }}>
              📱 Gerar Stories
            </button>
          </div>
        </div>
        <div
          id="canvas-container"
          style={{
            flexGrow: 1,
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: backgroundImage ? 'transparent' : selectedBgColor,
            backgroundImage: backgroundImage ? `url('${backgroundImage}')` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%)`,
          }}
        >
          <div
            id="design-canvas"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '2rem',
            }}
          >
            <div style={{ textAlign: textAlign, opacity: opacity / 100, transform: `scale(${elementSize / 100}) rotate(${rotation}deg)` }}>
              <h1
                style={{
                  fontSize: '48px',
                  fontWeight: activeEffects.includes('bold') ? 900 : 500,
                  fontStyle: activeEffects.includes('italic') ? 'italic' : 'normal',
                  textDecoration: `${activeEffects.includes('underline') ? 'underline' : ''} ${activeEffects.includes('strikethrough') ? 'line-through' : ''}`.trim() || 'none',
                  fontFamily: `'${fontFamily}', sans-serif`,
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '15px',
                }}
              >
                {mainText}
              </h1>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: 500,
                  fontFamily: `'${fontFamily}', sans-serif`,
                  color: '#374151',
                }}
              >
                {subtitleText}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="sidebar-right">
        <div className="logo">
          <div className="logo-icon" style={{ width: 48, height: 48, fontSize: '1.5rem' }}>⚙️</div>
          <h2 className="logo-text" style={{ fontSize: '1.5rem' }}>Ferramentas</h2>
        </div>

        <div className="editor-section">
          <h3 className="section-title">Estilos do Elemento</h3>
          <div className="image-editor-controls">
            <div className="form-group">
              <label className="form-label">Cor do Elemento</label>
              <div className="color-grid">
                {elementColors.map((color, idx) => (
                  <div
                    key={idx}
                    className={`color-option ${selectedColor === color ? 'active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tamanho</label>
              <div className="range-container">
                <span className="range-badge">{elementSize}%</span>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={elementSize}
                  onChange={(e) => setElementSize(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Posição</label>
              <div className="range-container">
                <span className="range-badge">X: {positionX}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={positionX}
                  onChange={(e) => setPositionX(Number(e.target.value))}
                />
              </div>
              <div className="range-container">
                <span className="range-badge">Y: {positionY}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={positionY}
                  onChange={(e) => setPositionY(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Rotação</label>
              <div className="range-container">
                <span className="range-badge">{rotation}°</span>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Opacidade</label>
              <div className="range-container">
                <span className="range-badge">{opacity}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="editor-section">
          <h3 className="section-title">Ajustes de Imagem</h3>
          <div className="image-editor-controls">
            <div className="form-group">
              <label className="form-label">Brilho</label>
              <div className="range-container">
                <span className="range-badge">{brightness}</span>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Contraste</label>
              <div className="range-container">
                <span className="range-badge">{contrast}</span>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Saturação</label>
              <div className="range-container">
                <span className="range-badge">{saturation}</span>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Filtro</label>
              <select
                className="form-input"
                value={imageFilter}
                onChange={(e) => setImageFilter(e.target.value)}
              >
                <option value="none">Nenhum</option>
                <option value="grayscale">Escala de Cinza</option>
                <option value="sepia">Sépia</option>
                <option value="invert">Inverter</option>
              </select>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== MODAIS DAS 10 FEATURES ===== */}

      {/* Modal: Agendamento */}
      {showScheduleModal && (
        <div style={{ position: 'fixed', inset: '0', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '2rem', maxWidth: '400px', width: '90%', boxShadow: '0 20px 25px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>📅 Agendar Publicação</h2>
              <button onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>Data</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>Hora</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                onClick={() => handleSchedulePost(selectedBlogPost?.id)}
                style={{ backgroundColor: '#10B981', color: '#FFFFFF', fontWeight: 'bold', padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              >
                ✓ Agendar
              </button>
              <button
                onClick={() => setShowScheduleModal(false)}
                style={{ backgroundColor: '#6B7280', color: '#FFFFFF', fontWeight: 'bold', padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              >
                ✕ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Versões */}
      {showVersions && (
        <div style={{ position: 'fixed', inset: '0', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '2rem', maxWidth: '600px', width: '90%', maxHeight: '70vh', overflow: 'auto', boxShadow: '0 20px 25px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>🔄 Histórico de Versões</h2>
              <button onClick={() => setShowVersions(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            
            {loadingVersions ? (
              <p style={{ color: '#6B7280', textAlign: 'center', padding: '2rem' }}>⏳ Carregando versões...</p>
            ) : versions.length === 0 ? (
              <p style={{ color: '#6B7280', textAlign: 'center', padding: '2rem' }}>Nenhuma versão salva ainda</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {versions.map((version, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#F9FAFB',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB'
                    }}
                  >
                    <p style={{ fontWeight: 'bold', color: '#111827', marginBottom: '0.25rem' }}>
                      Versão {version.versao}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      {new Date(version.timestamp).toLocaleDateString('pt-BR')} às {new Date(version.timestamp).toLocaleTimeString('pt-BR')}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#374151', marginTop: '0.5rem' }}>
                      {version.titulo}
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            <button
              onClick={() => setShowVersions(false)}
              style={{ width: '100%', marginTop: '1rem', backgroundColor: '#6B7280', color: '#FFFFFF', fontWeight: 'bold', padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal: Preview Múltiplo */}
      {showMultiPreview && multiPreviewData && (
        <div style={{ position: 'fixed', inset: '0', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflow: 'auto' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '2rem', maxWidth: '900px', width: '90%', boxShadow: '0 20px 25px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>📱 Preview em Múltiplos Formatos</h2>
              <button onClick={() => setShowMultiPreview(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {Object.entries(multiPreviewData).map(([format, data]) => (
                <div key={format} style={{ padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <p style={{ fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                    {format}: {data.width}x{data.height}px
                  </p>
                  <div
                    style={{
                      width: '100%',
                      height: Math.min(250, data.height),
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #D1D5DB',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      color: '#6B7280'
                    }}
                    dangerouslySetInnerHTML={{ __html: data.preview }}
                  />
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setShowMultiPreview(false)}
              style={{ width: '100%', marginTop: '1rem', backgroundColor: '#6B7280', color: '#FFFFFF', fontWeight: 'bold', padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal: Lucresia Stories Companion */}
      {showLucresiaModal && (
        <div style={{ position: 'fixed', inset: '0', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, overflow: 'auto' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '2rem', maxWidth: '600px', width: '90%', boxShadow: '0 20px 25px rgba(0,0,0,0.15)', margin: '2rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>📱 Gerar Stories com Lucresia IA</h2>
              <button onClick={() => setShowLucresiaModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Procedimento */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>
                  📌 Procedimento / Tema
                </label>
                <input
                  type="text"
                  value={lucresiaProcedimento}
                  onChange={(e) => setLucresiaProcedimento(e.target.value)}
                  placeholder="Ex: Harmonização Facial"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontFamily: 'inherit' }}
                />
              </div>

              {/* Objetivo */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>
                  🎯 Objetivo
                </label>
                <textarea
                  value={lucresiaObjetivo}
                  onChange={(e) => setLucresiaObjetivo(e.target.value)}
                  placeholder="Ex: Gerar interesse visual e engajamento em redes sociais"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', minHeight: '80px', fontFamily: 'inherit' }}
                />
              </div>

              {/* Público-Alvo */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>
                  👥 Público-Alvo
                </label>
                <input
                  type="text"
                  value={lucresiaPublico}
                  onChange={(e) => setLucresiaPublico(e.target.value)}
                  placeholder="Ex: mulheres 30-50 anos"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontFamily: 'inherit' }}
                />
              </div>

              {/* Número de Stories */}
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem', color: '#374151' }}>
                  📊 Número de Stories
                </label>
                <select
                  value={lucresiaNumStories}
                  onChange={(e) => setLucresiaNumStories(Number(e.target.value))}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }}
                >
                  <option value="3">3 stories</option>
                  <option value="5">5 stories</option>
                  <option value="7">7 stories</option>
                  <option value="10">10 stories</option>
                </select>
              </div>

              {/* Resultado */}
              {lucresiaResult && (
                <div style={{ padding: '1rem', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #D1FAE5' }}>
                  <p style={{ fontWeight: 'bold', color: '#065F46', marginBottom: '0.5rem' }}>✅ Stories Geradas:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {lucresiaResult.stories?.map((story, idx) => (
                      <div key={idx} style={{ padding: '0.75rem', backgroundColor: '#FFFFFF', borderRadius: '6px', borderLeft: '3px solid #059669' }}>
                        <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.5' }}>{story}</p>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(story);
                            alert('✅ Story copiada!');
                          }}
                          style={{ marginTop: '0.5rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          📋 Copiar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button
                onClick={async () => {
                  setLucresiaGenerating(true);
                  try {
                    const response = await api.lucresiaStories(
                      lucresiaProcedimento,
                      lucresiaObjetivo,
                      lucresiaPublico,
                      lucresiaNumStories
                    );
                    setLucresiaResult(response);
                  } catch (error) {
                    console.error('Error generating stories:', error);
                    alert('❌ Erro ao gerar stories. Tente novamente.');
                  }
                  setLucresiaGenerating(false);
                }}
                disabled={lucresiaGenerating || !lucresiaProcedimento.trim()}
                style={{
                  backgroundColor: '#8B5CF6',
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: lucresiaGenerating ? 'not-allowed' : 'pointer',
                  opacity: lucresiaGenerating ? 0.6 : 1
                }}
              >
                {lucresiaGenerating ? '⏳ Gerando...' : '✨ Gerar Stories'}
              </button>
              <button
                onClick={() => setShowLucresiaModal(false)}
                style={{
                  backgroundColor: '#6B7280',
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                ✕ Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
