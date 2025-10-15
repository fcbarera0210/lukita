'use client';

import { useEffect, useState } from 'react';
import { Plus, Tag, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/firestore';
import { Category } from '@/types/category';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CategoryForm } from '@/components/forms/CategoryForm';
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

const iconMap = {
  utensils: Utensils,
  car: Car,
  home: Home,
  'shopping-bag': ShoppingBag,
  heart: Heart,
  'graduation-cap': GraduationCap,
  'gamepad-2': Gamepad2,
  coffee: Coffee,
  plane: Plane,
  gift: Gift,
  'dollar-sign': DollarSign,
  briefcase: Briefcase,
};

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { showToast } = useToast();

  const loadCategories = async () => {
    if (!user) return;
    
    try {
      const categoriesData = await getCategories(user.uid);
      setCategories(categoriesData);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        description: 'No se pudieron cargar las categorías',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [user]);

  const handleCreateCategory = async (data: Omit<Category, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      await createCategory(user.uid, data);
      setIsModalOpen(false);
      await loadCategories();
    } catch (error) {
      throw error; // Re-throw para que el formulario maneje el error
    }
  };

  const handleEditCategory = async (data: Omit<Category, 'id' | 'createdAt'>) => {
    if (!user || !editingCategory) return;
    
    try {
      await updateCategory(user.uid, editingCategory.id, data);
      setEditingCategory(null);
      await loadCategories();
    } catch (error) {
      throw error; // Re-throw para que el formulario maneje el error
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!user) return;
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      return;
    }

    try {
      await deleteCategory(user.uid, categoryId);
      showToast({
        type: 'success',
        title: 'Categoría eliminada',
        description: 'La categoría ha sido eliminada exitosamente',
      });
      await loadCategories();
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        description: 'No se pudo eliminar la categoría',
      });
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const incomeCategories = categories.filter(cat => cat.kind === 'ingreso');
  const expenseCategories = categories.filter(cat => cat.kind === 'gasto');

  if (loading) {
    return (
      
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-card rounded-lg"></div>
            ))}
          </div>
        </div>
      
    );
  }

  return (
    
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Categorías</h1>
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva categoría
          </Button>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No tienes categorías</h3>
            <p className="text-muted-foreground mb-4">
              Crea categorías para organizar tus ingresos y gastos
            </p>
            <Button onClick={openCreateModal}>
              Crear primera categoría
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Categorías de Ingreso */}
            {incomeCategories.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <h2 className="text-lg font-semibold">Ingresos</h2>
                </div>
                <div className="space-y-3">
                  {incomeCategories.map((category) => {
                    const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Tag;
                    return (
                      <div
                        key={category.id}
                        className="bg-card border border-border rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-green-500/20 text-green-500">
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div>
                              <h3 className="font-medium">{category.name}</h3>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditModal(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Categorías de Gasto */}
            {expenseCategories.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  <h2 className="text-lg font-semibold">Gastos</h2>
                </div>
                <div className="space-y-3">
                  {expenseCategories.map((category) => {
                    const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Tag;
                    return (
                      <div
                        key={category.id}
                        className="bg-card border border-border rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-red-500/20 text-red-500">
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div>
                              <h3 className="font-medium">{category.name}</h3>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditModal(category)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingCategory ? 'Editar categoría' : 'Nueva categoría'}
        >
          <CategoryForm
            category={editingCategory || undefined}
            onSubmit={editingCategory ? handleEditCategory : handleCreateCategory}
            onCancel={closeModal}
          />
        </Modal>
      </div>
    
  );
}
