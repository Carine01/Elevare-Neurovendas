"""
Voice Clone Analyzer - Análise de Amostras de Voz

Analisa os textos de exemplo fornecidos pelo usuário para extrair
padrões de escrita que serão usados pela IA para replicar o estilo.
"""

import re
from typing import List, Dict, Tuple
from collections import Counter
import emoji


class VoiceCloneAnalyzer:
    """Analisador de padrões de escrita para clone de voz IA"""
    
    def __init__(self, voice_samples: str):
        """
        Inicializa o analisador com as amostras de texto.
        
        Args:
            voice_samples: Texto com 3-5 exemplos de escrita do usuário
        """
        self.voice_samples = voice_samples.strip()
        self.sentences = self._split_sentences()
        self.paragraphs = self._split_paragraphs()
        self.words = self._extract_words()
    
    def _split_sentences(self) -> List[str]:
        """Divide o texto em frases individuais"""
        # Regex que respeita reticências, mas separa por . ! ?
        pattern = r'(?<!\.\.)(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])|(?<=[.!?])\n'
        sentences = re.split(pattern, self.voice_samples)
        return [s.strip() for s in sentences if s.strip()]
    
    def _split_paragraphs(self) -> List[str]:
        """Divide o texto em parágrafos"""
        paragraphs = re.split(r'\n\s*\n', self.voice_samples)
        return [p.strip() for p in paragraphs if p.strip()]
    
    def _extract_words(self) -> List[str]:
        """Extrai todas as palavras do texto (sem pontuação)"""
        # Remove emojis primeiro
        text_no_emoji = emoji.replace_emoji(self.voice_samples, replace='')
        # Remove pontuação e divide em palavras
        words = re.findall(r'\b[a-záéíóúâêôãõçA-ZÁÉÍÓÚÂÊÔÃÕÇ]+\b', text_no_emoji)
        return [w.lower() for w in words]
    
    def calculate_avg_sentence_length(self) -> float:
        """Calcula comprimento médio das frases em palavras"""
        if not self.sentences:
            return 0.0
        
        total_words = sum(len(s.split()) for s in self.sentences)
        return round(total_words / len(self.sentences), 1)
    
    def calculate_emoji_frequency(self) -> float:
        """Calcula frequência de emojis (emojis por 100 caracteres)"""
        emoji_count = len([c for c in self.voice_samples if c in emoji.EMOJI_DATA])
        text_length = len(self.voice_samples)
        
        if text_length == 0:
            return 0.0
        
        return round((emoji_count / text_length) * 100, 2)
    
    def calculate_question_ratio(self) -> float:
        """Calcula proporção de frases interrogativas"""
        if not self.sentences:
            return 0.0
        
        questions = sum(1 for s in self.sentences if '?' in s)
        return round(questions / len(self.sentences), 2)
    
    def calculate_exclamation_ratio(self) -> float:
        """Calcula proporção de frases exclamativas"""
        if not self.sentences:
            return 0.0
        
        exclamations = sum(1 for s in self.sentences if '!' in s)
        return round(exclamations / len(self.sentences), 2)
    
    def calculate_paragraph_avg_lines(self) -> float:
        """Calcula média de linhas por parágrafo"""
        if not self.paragraphs:
            return 0.0
        
        total_lines = sum(p.count('\n') + 1 for p in self.paragraphs)
        return round(total_lines / len(self.paragraphs), 1)
    
    def detect_caps_usage(self) -> bool:
        """Detecta se usa CAPS para ênfase"""
        # Procura por palavras inteiras em maiúsculas (mínimo 2 letras)
        caps_pattern = r'\b[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{2,}\b'
        caps_matches = re.findall(caps_pattern, self.voice_samples)
        
        # Ignora siglas comuns
        common_acronyms = {'DRA', 'DR', 'USA', 'EUA', 'CNPJ', 'CPF', 'RG'}
        real_caps = [w for w in caps_matches if w not in common_acronyms]
        
        return len(real_caps) > 0
    
    def detect_ellipsis_usage(self) -> bool:
        """Detecta se usa reticências (...)"""
        return '...' in self.voice_samples or '…' in self.voice_samples
    
    def extract_common_phrases(self, min_frequency: int = 2) -> List[str]:
        """
        Extrai frases/expressões mais comuns (2-5 palavras).
        
        Args:
            min_frequency: Frequência mínima para considerar comum
            
        Returns:
            Lista de frases comuns ordenadas por frequência
        """
        # Gera n-grams de 2 a 5 palavras
        ngrams = []
        
        for n in range(2, 6):  # 2, 3, 4, 5 palavras
            for i in range(len(self.words) - n + 1):
                ngram = ' '.join(self.words[i:i+n])
                ngrams.append(ngram)
        
        # Conta frequências
        counter = Counter(ngrams)
        
        # Filtra por frequência mínima e pega top 10
        common = [phrase for phrase, count in counter.most_common() if count >= min_frequency]
        
        return common[:10]
    
    def assess_vocabulary_level(self) -> str:
        """
        Avalia nível de vocabulário: simples, moderado, complexo.
        
        Baseado em:
        - Tamanho médio das palavras
        - Diversidade lexical (type-token ratio)
        """
        if not self.words:
            return "simples"
        
        # Tamanho médio das palavras
        avg_word_length = sum(len(w) for w in self.words) / len(self.words)
        
        # Diversidade lexical (palavras únicas / total de palavras)
        unique_words = len(set(self.words))
        lexical_diversity = unique_words / len(self.words)
        
        # Classificação
        if avg_word_length > 6 and lexical_diversity > 0.6:
            return "complexo"
        elif avg_word_length > 5 or lexical_diversity > 0.5:
            return "moderado"
        else:
            return "simples"
    
    def detect_formality(self) -> str:
        """
        Detecta nível de formalidade do texto automaticamente.
        
        Returns:
            'muito_informal', 'informal', 'equilibrada', 'formal', 'muito_formal'
        """
        # Indicadores de informalidade
        informal_markers = [
            r'\bó\b', r'\bué\b', r'\bné\b', r'\btipo\b', r'\btá\b',
            r'\bvc\b', r'\bvcs\b', r'\bpq\b', r'\btbm\b',
            'rsrs', 'kkk', 'haha',
        ]
        
        # Indicadores de formalidade
        formal_markers = [
            r'\bpor favor\b', r'\bsolicito\b', r'\bcorresponder\b',
            r'\batenciosamente\b', r'\bcordialmente\b',
            r'\bconsidera-se\b', r'\bobserva-se\b', r'\bconclui-se\b',
        ]
        
        informal_count = sum(
            len(re.findall(marker, self.voice_samples.lower()))
            for marker in informal_markers
        )
        
        formal_count = sum(
            len(re.findall(marker, self.voice_samples.lower()))
            for marker in formal_markers
        )
        
        # Verifica uso de emojis (indicador de informalidade)
        has_emojis = self.calculate_emoji_frequency() > 1.0
        
        # Verifica contrações (tá, pra, né - indicador de informalidade)
        contraction_pattern = r"\b(tá|né|pra|pro|tô|cê)\b"
        has_contractions = bool(re.search(contraction_pattern, self.voice_samples.lower()))
        
        # Lógica de decisão
        if informal_count >= 3 or (has_emojis and has_contractions):
            return "muito_informal"
        elif informal_count >= 1 or has_emojis or has_contractions:
            return "informal"
        elif formal_count >= 3:
            return "muito_formal"
        elif formal_count >= 1:
            return "formal"
        else:
            return "equilibrada"
    
    def analyze(self) -> Dict:
        """
        Executa análise completa e retorna todos os resultados.
        
        Returns:
            Dict com todas as métricas de análise
        """
        return {
            "avg_sentence_length": self.calculate_avg_sentence_length(),
            "emoji_frequency": self.calculate_emoji_frequency(),
            "question_ratio": self.calculate_question_ratio(),
            "exclamation_ratio": self.calculate_exclamation_ratio(),
            "paragraph_avg_lines": self.calculate_paragraph_avg_lines(),
            "uses_caps": self.detect_caps_usage(),
            "uses_ellipsis": self.detect_ellipsis_usage(),
            "common_phrases": self.extract_common_phrases(),
            "vocabulary_level": self.assess_vocabulary_level(),
            "formality_detected": self.detect_formality(),
        }


def analyze_voice_samples(voice_samples: str) -> Dict:
    """
    Função helper para análise rápida de amostras de voz.
    
    Args:
        voice_samples: Texto com exemplos de escrita
        
    Returns:
        Dict com métricas de análise
        
    Example:
        >>> samples = "Olha, vou ser sincera... Harmonização não é milagre! 💎"
        >>> result = analyze_voice_samples(samples)
        >>> print(result['formality_detected'])
        'informal'
    """
    analyzer = VoiceCloneAnalyzer(voice_samples)
    return analyzer.analyze()
