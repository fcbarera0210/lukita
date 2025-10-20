"use client";
import React, { useEffect, useState } from 'react';
import { getBudgets, createBudget, updateBudget, deleteBudget, getBudgetsForMonth, monthKeyFromDate } from '@/lib/budgets';
import { BudgetCard } from '@/components/BudgetCard';
import { useAuth } from '@/lib/auth';
import { Modal } from '@/components/ui/Modal';
import { BudgetForm } from '@/components/forms/BudgetForm';
import { getCategories } from '@/lib/firestore';
import type { Category } from '@/types/category';
import { db } from '@/lib/firebase';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { PieChart, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageDescription } from '@/components/PageDescription';
import { useToast } from '@/components/ui/Toast';

export default function BudgetsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const month = monthKeyFromDate(new Date());
  const [budgets, setBudgets] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadBudgets = async () => {
      try {
        const budgetsData = await getBudgetsForMonth(user.uid, month);
        setBudgets(budgetsData);
      } catch (error) {
        console.error('Error loading budgets:', error);
      }
    };
    
    loadBudgets();
    
    // Listener para actualizaciones en tiempo real
    const q = query(collection(db, 'users', user.uid, 'budgets'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, async () => {
      const budgetsData = await getBudgetsForMonth(user.uid, month);
      setBudgets(budgetsData);
    }, console.error);
    
    return () => unsub();
  }, [user, month]);

  useEffect(() => {
    if (!user) return;
    getCategories(user.uid)
      .then((cats) => cats.filter(c => c.name !== 'transferencia entre cuentas'))
      .then((cats) => setCategories(cats))
      .catch(console.error);
  }, [user]);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Presupuestos</h1>
        </div>
        <Button onClick={() => setOpen(true)} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Page Description */}
      <PageDescription
        title="Gestión de Presupuestos"
        description="Establece límites de gasto por categoría para mantener control sobre tus finanzas. Configura presupuestos mensuales, recibe alertas cuando te acerques a los límites, y visualiza tu progreso con gráficos intuitivos."
        icon={<PieChart className="h-5 w-5 text-primary" />}
      />

      {/* Presupuestos del mes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Presupuestos ({month.split('-').reverse().join('-')})</h2>
          </div>
          <Button variant="ghost" onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2">
            {isExpanded ? (<><ChevronUp className="h-4 w-4" /> Ocultar</>) : (<><ChevronDown className="h-4 w-4" /> Mostrar</>)}
          </Button>
        </div>
        
        {isExpanded && (
          <div className="bg-card border border-border rounded-lg p-6">
            {budgets.length === 0 ? (
              <div className="text-center py-8">
                <PieChart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground mb-4">
                  No tienes presupuestos configurados
                </p>
                <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Crear primer presupuesto
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {budgets.map(b => {
                  const catName = categories.find(c => c.id === b.categoryId)?.name || b.categoryId;
                  const catIcon = categories.find(c => c.id === b.categoryId)?.icon;
                  const display = { 
                    ...b, 
                    categoryId: catName,
                    categoryIcon: catIcon
                  };
                  return (
                    <div key={b.id} className="space-y-2">
                      <BudgetCard budget={display} />
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditing(b)} className="text-xs">
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" onClick={async () => {
                          if (!user) return;
                          const ok = typeof window !== 'undefined' ? window.confirm('¿Eliminar presupuesto definitivamente?') : true;
                          if (!ok) return;
                          try {
                            await deleteBudget(user.uid, b.id);
                            const updated = await getBudgetsForMonth(user.uid, month);
                            setBudgets(updated);
                            showToast({
                              type: 'success',
                              title: 'Presupuesto eliminado',
                              description: 'El presupuesto se ha eliminado exitosamente'
                            });
                          } catch (error) {
                            showToast({
                              type: 'error',
                              title: 'Error al eliminar presupuesto',
                              description: 'No se pudo eliminar el presupuesto'
                            });
                          }
                        }} className="text-xs">
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      {open && (
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Nuevo Presupuesto">
          <BudgetForm
            initial={{}}
            categories={categories}
                onSubmit={async (data) => {
                  if (!user) return;
                  try {
                    await createBudget(user.uid, data as any);
                    const updated = await getBudgetsForMonth(user.uid, month);
                    setBudgets(updated);
                    setOpen(false);
                    showToast({
                      type: 'success',
                      title: 'Presupuesto creado',
                      description: 'El presupuesto se ha creado exitosamente'
                    });
                  } catch (error) {
                    showToast({
                      type: 'error',
                      title: 'Error al crear presupuesto',
                      description: 'No se pudo crear el presupuesto'
                    });
                  }
                }}
            onCancel={() => setOpen(false)}
          />
        </Modal>
      )}
      {editing && (
        <Modal isOpen={true} onClose={() => setEditing(null)} title="Editar Presupuesto">
          <BudgetForm
            initial={{ categoryId: editing.categoryId, defaultAmount: editing.defaultAmount }}
            categories={categories}
                onSubmit={async (data) => {
                  if (!user) return;
                  try {
                    await updateBudget(user.uid, editing.id, data as any);
                    const updated = await getBudgetsForMonth(user.uid, month);
                    setBudgets(updated);
                    setEditing(null);
                    showToast({
                      type: 'success',
                      title: 'Presupuesto actualizado',
                      description: 'El presupuesto se ha actualizado exitosamente'
                    });
                  } catch (error) {
                    showToast({
                      type: 'error',
                      title: 'Error al actualizar presupuesto',
                      description: 'No se pudo actualizar el presupuesto'
                    });
                  }
                }}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  );
}