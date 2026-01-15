'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CollapsibleDescriptionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function CollapsibleDescription({ title, description, icon }: CollapsibleDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Detectar si el icono es una imagen
  const isImage = React.isValidElement(icon) && icon.type === 'img';

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            isImage ? (
              icon
            ) : (
              <div className="p-2 rounded-full bg-primary/10">
                {icon}
              </div>
            )
          )}
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
          aria-label={isExpanded ? 'Ocultar información' : 'Mostrar información'}
        >
          {isExpanded ? (
            <>
              <EyeOff className="h-4 w-4" />
              <span className="hidden sm:inline">Ocultar</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Ver info</span>
            </>
          )}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}
