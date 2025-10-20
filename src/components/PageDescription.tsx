'use client';

import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PageDescriptionProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function PageDescription({ title, description, icon }: PageDescriptionProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <Info className="h-4 w-4 mr-2" />
          Mostrar información
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border/50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          {icon && (
            <div className="flex-shrink-0 mt-0.5">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <h2 className="font-semibold text-foreground mb-1">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground p-1 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
