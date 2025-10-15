'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema, CategoryFormData } from '@/schemas/category.schema';
import { Category, CategoryKind } from '@/types/category';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { 
  Utensils, 
  Car, 
  Home, 
  ShoppingBag, 
  Heart, 
  GraduationCap,
  Gamepad2,
  Coffee,
  Plane,
  Gift,
  DollarSign,
  Briefcase
} from 'lucide-react';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: Omit<Category, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
}

const categoryIcons = [
  { value: 'utensils', label: 'Comida', icon: Utensils },
  { value: 'car', label: 'Transporte', icon: Car },
  { value: 'home', label: 'Casa', icon: Home },
  { value: 'shopping-bag', label: 'Compras', icon: ShoppingBag },
  { value: 'heart', label: 'Salud', icon: Heart },
  { value: 'graduation-cap', label: 'Educación', icon: GraduationCap },
  { value: 'gamepad-2', label: 'Entretenimiento', icon: Gamepad2 },
  { value: 'coffee', label: 'Café', icon: Coffee },
  { value: 'plane', label: 'Viajes', icon: Plane },
  { value: 'gift', label: 'Regalos', icon: Gift },
  { value: 'dollar-sign', label: 'Dinero', icon: DollarSign },
  { value: 'briefcase', label: 'Trabajo', icon: Briefcase },
];

const categoryKinds: { value: CategoryKind; label: string }[] = [
  { value: 'ingreso', label: 'Ingreso' },
  { value: 'gasto', label: 'Gasto' },
];

export function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {
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
      kind: category?.kind || 'gasto',
      icon: category?.icon || 'utensils',
    },
  });

  const selectedIcon = watch('icon');
  const selectedKind = watch('kind');

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
      showToast({
        type: 'error',
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo guardar la categoría',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const SelectedIcon = categoryIcons.find(icon => icon.value === selectedIcon)?.icon || Utensils;

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
        <label htmlFor="kind" className="block text-sm font-medium mb-2">
          Tipo
        </label>
        <Select
          id="kind"
          {...register('kind')}
        >
          {categoryKinds.map((kind) => (
            <option key={kind.value} value={kind.value}>
              {kind.label}
            </option>
          ))}
        </Select>
        {errors.kind && (
          <p className="text-sm text-destructive mt-1">{errors.kind.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Ícono
        </label>
        <div className="grid grid-cols-6 gap-2">
          {categoryIcons.map((iconOption) => {
            const IconComponent = iconOption.icon;
            const isSelected = selectedIcon === iconOption.value;
            
            return (
              <button
                key={iconOption.value}
                type="button"
                onClick={() => setValue('icon', iconOption.value)}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
                title={iconOption.label}
              >
                <IconComponent className="h-5 w-5 mx-auto" />
              </button>
            );
          })}
        </div>
        <input type="hidden" {...register('icon')} />
        {errors.icon && (
          <p className="text-sm text-destructive mt-1">{errors.icon.message}</p>
        )}
      </div>

      {/* Preview */}
      <div className="bg-muted/50 rounded-lg p-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            selectedKind === 'ingreso' 
              ? 'bg-green-500/20 text-green-500' 
              : 'bg-red-500/20 text-red-500'
          }`}>
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
