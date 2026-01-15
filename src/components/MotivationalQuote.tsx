import React from 'react';
import { RefreshCw, Lightbulb, Languages } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useMotivationalAdvice } from '@/hooks/useMotivationalAdvice';

export const MotivationalQuote = () => {
  const { advice, loading, error, isTranslated, refetch, toggleLanguage } = useMotivationalAdvice();

  return (
    <div 
      className="rounded-lg p-4 border"
      style={{
        background: 'linear-gradient(135deg, rgba(150, 225, 72, 0.1) 0%, rgba(0, 198, 219, 0.1) 100%)',
        borderColor: 'rgba(150, 225, 72, 0.2)',
      }}
    >
      <div className="flex items-start gap-3">
        <Lightbulb 
          className="h-5 w-5 mt-0.5 flex-shrink-0" 
          style={{ color: '#00C6DB' }}
        />
        <div className="flex-1">
          {loading ? (
            <div className="animate-pulse">
              <div 
                className="h-4 rounded w-3/4 mb-2"
                style={{ backgroundColor: 'rgba(150, 225, 72, 0.2)' }}
              ></div>
              <div 
                className="h-3 rounded w-1/2"
                style={{ backgroundColor: 'rgba(0, 198, 219, 0.2)' }}
              ></div>
            </div>
          ) : (
            <>
              <p 
                className="text-sm italic leading-relaxed"
                style={{ color: '#375A64' }}
              >
                &ldquo;{advice}&rdquo;
              </p>
              <div className="flex items-center justify-between mt-2">
                <span 
                  className="text-xs"
                  style={{ color: '#00C6DB' }}
                >
                  Consejo del día
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleLanguage}
                    className="h-6 w-6 p-0 hover:opacity-80 transition-opacity"
                    title={isTranslated ? "Ver en inglés" : "Ver en español"}
                  >
                    <Languages 
                      className="h-3 w-3" 
                      style={{ color: '#00C6DB' }}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refetch}
                    className="h-6 w-6 p-0 hover:opacity-80 transition-opacity"
                    title="Nueva frase"
                  >
                    <RefreshCw 
                      className="h-3 w-3" 
                      style={{ color: '#96E148' }}
                    />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
