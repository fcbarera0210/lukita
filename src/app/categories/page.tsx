'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Tag, Edit, Trash2, MoreVertical, Tags } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/firestore';
import { Category } from '@/types/category';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CategoryForm } from '@/components/forms/CategoryForm';
import { useToast } from '@/components/ui/Toast';
import { useFabContext } from '@/components/ConditionalLayout';
import { ArrowRightLeft } from 'lucide-react';
import { CollapsibleDescription } from '@/components/CollapsibleDescription';
import { getCategoryIcon } from '@/lib/categoryIcons';


function CategoriesPageContent() {
  const { user } = useAuth();
  const { setIsFormOpen } = useFabContext();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadCategories = async () => {
    if (!user) return;
    
    try {
      const categoriesData = await getCategories(user.uid);
      setCategories(categoriesData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showToast({
        type: 'error',
        title: 'Error al cargar categorías',
        description: `No se pudieron cargar las categorías: ${errorMessage}`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [user]);

  // Detectar parámetro new y abrir modal automáticamente
  useEffect(() => {
    const shouldOpenModal = searchParams.get('new') === 'true';
    if (shouldOpenModal) {
      setIsModalOpen(true);
      setIsFormOpen(true);
      // Limpiar la URL sin recargar la página
      const url = new URL(window.location.href);
      url.searchParams.delete('new');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams, setIsFormOpen]);

  const handleCreateCategory = async (data: Omit<Category, 'id' | 'createdAt'>) => {
    if (!user) return;
    
    try {
      await createCategory(user.uid, data);
      setIsModalOpen(false);
      setIsFormOpen(false);
      await loadCategories();
    } catch (error) {
      throw error; // Re-throw para que el formulario maneje el error
    }
  };

  const handleEditCategory = async (data: Omit<Category, 'id' | 'createdAt'>) => {
    if (!user || !editingCategory) return;
    
    try {
      await updateCategory(user.uid, editingCategory.id, data);
      setIsModalOpen(false);
      setIsFormOpen(false);
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
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      showToast({
        type: 'error',
        title: 'Error al eliminar categoría',
        description: `No se pudo eliminar la categoría: ${errorMessage}`,
      });
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
    setIsFormOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
    setIsFormOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setIsFormOpen(false);
  };

  const toggleMenu = (categoryId: string) => {
    setOpenMenuId(openMenuId === categoryId ? null : categoryId);
  };

  const closeMenu = () => {
    setOpenMenuId(null);
  };


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
        {/* Page Description */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CollapsibleDescription
              title="Gestión de Categorías"
              description="Organiza tus gastos e ingresos con categorías personalizadas. Crea categorías con íconos únicos para clasificar tus transacciones. Personaliza nombres, íconos y tipos de categoría. La categoría 'transferencia entre cuentas' es del sistema y no se puede modificar."
              icon={<Tags className="h-5 w-5 text-primary" />}
            />
          </div>
          <Button onClick={openCreateModal} size="icon" className="h-10 w-10 flex-shrink-0">
            <Plus className="h-4 w-4" />
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
          <div className="space-y-3">
            {categories
              .filter(category => category.name !== 'transferencia entre cuentas') // Ocultar categoría del sistema
              .map((category) => {
              const IconComponent = getCategoryIcon(category.icon);
              const isMenuOpen = openMenuId === category.id;
              
              return (
                <div
                  key={category.id}
                  className="bg-card border border-border rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-muted/50">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                      </div>
                    </div>

                    {/* Menu button */}
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleMenu(category.id)}
                        className="h-8 w-8"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>

                      {/* Dropdown menu */}
                      {isMenuOpen && (
                        <>
                          {/* Overlay to close menu */}
                          <div
                            className="fixed inset-0 z-10"
                            onClick={closeMenu}
                          />
                          <div className="absolute right-0 top-8 z-20 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[120px]">
                            <button
                              onClick={() => {
                                openEditModal(category);
                                closeMenu();
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                handleDeleteCategory(category.id);
                                closeMenu();
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                              Eliminar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
            usedIcons={categories.map(cat => cat.icon).filter((icon): icon is string => icon !== undefined && icon !== editingCategory?.icon)}
          />
        </Modal>
      </div>
    );
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CategoriesPageContent />
    </Suspense>
  );
}
