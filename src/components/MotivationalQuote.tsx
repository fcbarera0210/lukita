import React from 'react';
import { RefreshCw, Lightbulb, Languages } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useMotivationalAdvice } from '@/hooks/useMotivationalAdvice';

export const MotivationalQuote = () => {
  const { advice, loading, error, isTranslated, refetch, toggleLanguage } = useMotivationalAdvice();

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-3">
        <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-blue-200 dark:bg-blue-800 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-blue-200 dark:bg-blue-800 rounded w-1/2"></div>
            </div>
          ) : (
            <>
              <p className="text-sm text-blue-900 dark:text-blue-100 italic leading-relaxed">
                &ldquo;{advice}&rdquo;
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  Consejo del día
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleLanguage}
                    className="h-6 w-6 p-0 hover:bg-blue-200 dark:hover:bg-blue-800"
                    title={isTranslated ? "Ver en inglés" : "Ver en español"}
                  >
                    <Languages className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refetch}
                    className="h-6 w-6 p-0 hover:bg-blue-200 dark:hover:bg-blue-800"
                    title="Nueva frase"
                  >
                    <RefreshCw className="h-3 w-3 text-blue-600 dark:text-blue-400" />
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
