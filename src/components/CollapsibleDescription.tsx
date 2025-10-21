'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CollapsibleDescriptionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function CollapsibleDescription({ title, description, icon }: CollapsibleDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary/10">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {isExpanded ? '' : 'Información adicional disponible'}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          {isExpanded ? (
            <>
              <EyeOff className="h-4 w-4" />
              Ocultar
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Ver info
            </>
          )}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
