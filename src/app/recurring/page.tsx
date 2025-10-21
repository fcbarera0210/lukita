"use client";
import React, { useEffect, useState } from 'react';
import { getRecurring, createRecurring, updateRecurring, deleteRecurring } from '@/lib/recurring';
import { RecurringTransactionCard } from '@/components/RecurringTransactionCard';
import { useAuth } from '@/lib/auth';
import { Modal } from '@/components/ui/Modal';
import { RecurringForm } from '@/components/forms/RecurringForm';
import { getAccounts, getCategories } from '@/lib/firestore';
import type { RecurringTransaction } from '@/types/recurring';
import type { Account } from '@/types/account';
import type { Category } from '@/types/category';
import { db } from '@/lib/firebase';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { CalendarClock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CollapsibleDescription } from '@/components/CollapsibleDescription';
import { useToast } from '@/components/ui/Toast';

export default function RecurringPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);
  const [isExpanded] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'recurring'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<RecurringTransaction, 'id'>) }));
      const unique = Array.from(new Map(list.map(i => [i.id, i])).values());
      setItems(unique);
    }, console.error);
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getAccounts(user.uid),
      getCategories(user.uid),
    ]).then(([accs, cats]) => {
      setAccounts(accs);
      const filtered = cats.filter(c => c.name !== 'transferencia entre cuentas');
      setCategories(filtered);
    }).catch(console.error);
  }, [user]);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Transacciones Recurrentes</h1>
        </div>
        <Button onClick={() => setOpen(true)} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Page Description */}
      <CollapsibleDescription
        title="Gestión de Transacciones Recurrentes"
        description="Automatiza tus transacciones regulares como sueldos, rentas o suscripciones. Programa transacciones que se repitan automáticamente cada mes, semana o quincena. Pausa o modifica las transacciones cuando sea necesario."
        icon={<CalendarClock className="h-5 w-5 text-primary" />}
      />

      {/* Recurrentes */}
      {items.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <CalendarClock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground mb-4">
            No tienes transacciones recurrentes configuradas
          </p>
          <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Crear primera recurrente
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => {
            const catName = categories.find(c => c.id === item.categoryId)?.name || item.categoryId;
            const account = accounts.find(a => a.id === item.accountId);
            const display = { ...item, categoryId: catName };
            return (
              <div key={item.id} className="space-y-2">
                <RecurringTransactionCard item={display} accountColor={account?.color} />
                <div className="flex items-center justify-end gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(item)} className="text-xs">
                    Editar
                  </Button>
                      <Button size="sm" variant="outline" onClick={async () => {
                        if (!user) return;
                        const ok = typeof window !== 'undefined' ? window.confirm('¿Eliminar recurrente definitivamente?') : true;
                        if (!ok) return;
                        try {
                          await deleteRecurring(user.uid, item.id);
                          const updated = await getRecurring(user.uid);
                          const unique = Array.from(new Map(updated.map(i => [i.id, i])).values());
                          setItems(unique);
                          showToast({
                            type: 'success',
                            title: 'Transacción recurrente eliminada',
                            description: 'La transacción recurrente se ha eliminado exitosamente'
                          });
                        } catch (error) {
                          showToast({
                            type: 'error',
                            title: 'Error al eliminar transacción recurrente',
                            description: 'No se pudo eliminar la transacción recurrente'
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

      {/* Modales */}
      {open && (
        <Modal isOpen={open} onClose={() => setOpen(false)} title="Nueva Recurrente">
          <RecurringForm
            accounts={accounts}
            categories={categories}
            onSubmit={async (data) => {
              if (!user) return;
              try {
                await createRecurring(user.uid, data);
                const updated = await getRecurring(user.uid);
                const unique = Array.from(new Map(updated.map(i => [i.id, i])).values());
                setItems(unique);
                setOpen(false);
                showToast({
                  type: 'success',
                  title: 'Transacción recurrente creada',
                  description: 'La transacción recurrente se ha creado exitosamente'
                });
              } catch (error) {
                showToast({
                  type: 'error',
                  title: 'Error al crear transacción recurrente',
                  description: 'No se pudo crear la transacción recurrente'
                });
              }
            }}
            onCancel={() => setOpen(false)}
          />
        </Modal>
      )}
      {editing && (
        <Modal isOpen={true} onClose={() => setEditing(null)} title="Editar Recurrente">
          <RecurringForm
            initial={editing}
            accounts={accounts}
            categories={categories}
            onSubmit={async (data) => {
              if (!user) return;
              try {
                await updateRecurring(user.uid, editing.id, data);
                const updated = await getRecurring(user.uid);
                const unique = Array.from(new Map(updated.map(i => [i.id, i])).values());
                setItems(unique);
                setEditing(null);
                showToast({
                  type: 'success',
                  title: 'Transacción recurrente actualizada',
                  description: 'La transacción recurrente se ha actualizado exitosamente'
                });
              } catch (error) {
                showToast({
                  type: 'error',
                  title: 'Error al actualizar transacción recurrente',
                  description: 'No se pudo actualizar la transacción recurrente'
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