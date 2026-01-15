'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema, CategoryFormData } from '@/schemas/category.schema';
import { Category } from '@/types/category';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { IconSelector } from '@/components/IconSelector';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
  usedIcons?: string[];
}


export function CategoryForm({ category, onSubmit, onCancel, usedIcons = [] }: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      icon: category?.icon || 'utensils',
    },
  });

  const selectedIcon = watch('icon');

  const onFormSubmit = async (data: CategoryFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
      showToast({
        type: 'success',
        title: category ? 'Categoría actualizada' : 'Categoría creada',
        description: `La categoría "${data.name}" ha sido ${category ? 'actualizada' : 'creada'} exitosamente`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showToast({
        type: 'error',
        title: 'Error al guardar categoría',
        description: `No se pudo guardar la categoría: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const SelectedIcon = getCategoryIcon(selectedIcon);

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Nombre de la categoría
        </label>
        <Input
          id="name"
          placeholder="Ej: Alimentación"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>


      <div>
        <label className="block text-sm font-medium mb-2">
          Ícono
        </label>
        <IconSelector
          selectedIcon={selectedIcon || 'utensils'}
          onIconSelect={(iconId) => setValue('icon', iconId, { shouldValidate: false, shouldDirty: false })}
          usedIcons={usedIcons}
        />
        <input type="hidden" {...register('icon')} />
        {errors.icon && (
          <p className="text-sm text-destructive mt-1">{errors.icon.message}</p>
        )}
      </div>

      {/* Preview */}
      <div className="bg-muted/50 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/20 text-primary">
            <SelectedIcon className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium">Vista previa</p>
            <p className="text-sm text-muted-foreground">
              {watch('name') || 'Nombre de la categoría'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Guardando...' : category ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
}
