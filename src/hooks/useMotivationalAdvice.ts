import { useState, useEffect } from 'react';

interface AdviceResponse {
  slip: {
    id: number;
    advice: string;
  };
}

interface TranslationResponse {
  data: {
    translations: Array<{
      translatedText: string;
    }>;
  };
}

export const useMotivationalAdvice = () => {
  const [advice, setAdvice] = useState<string>('');
  const [translatedAdvice, setTranslatedAdvice] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTranslated, setIsTranslated] = useState(true); // Por defecto en español

  const translateText = async (text: string): Promise<string> => {
    try {
      // Usar Google Translate API gratuita
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(text)}`
      );
      
      if (!response.ok) {
        throw new Error('Error en la traducción');
      }
      
      const data = await response.json();
      return data[0][0][0];
    } catch (error) {
      console.error('Error translating:', error);
      return text; // Devolver texto original si falla la traducción
    }
  };

  const fetchAdvice = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://api.adviceslip.com/advice');
      
      if (!response.ok) {
        throw new Error('No se pudo obtener el consejo');
      }
      
      const data: AdviceResponse = await response.json();
      const originalAdvice = data.slip.advice;
      
      setAdvice(originalAdvice);
      
      // Traducir al español
      const translated = await translateText(originalAdvice);
      setTranslatedAdvice(translated);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      // Frases de respaldo en caso de error
      setAdvice('Financial success begins with small consistent steps.');
      setTranslatedAdvice('El éxito financiero comienza con pequeños pasos consistentes.');
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setIsTranslated(!isTranslated);
  };

  useEffect(() => {
    fetchAdvice();
  }, []);

  return { 
    advice: isTranslated ? translatedAdvice : advice,
    originalAdvice: advice,
    translatedAdvice,
    loading, 
    error, 
    isTranslated,
    refetch: fetchAdvice,
    toggleLanguage
  };
};