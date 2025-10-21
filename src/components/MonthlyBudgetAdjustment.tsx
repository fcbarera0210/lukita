import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { createMonthlyAdjustment, updateMonthlyAdjustment, getMonthlyAdjustments, deleteMonthlyAdjustment } from '@/lib/budgets';
import { useAuth } from '@/lib/auth';
import { Save, XCircle, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface MonthlyBudgetAdjustmentProps {
  budgetId: string;
  defaultAmount: number;
  month: string;
  currentAmount?: number;
  onUpdate: () => void;
  textColor?: string; // Agregar prop para color de texto
  iconColor?: string; // Agregar prop para color del ícono
}

export function MonthlyBudgetAdjustment({ 
  budgetId, 
  defaultAmount, 
  month,
  currentAmount,
  onUpdate,
  textColor = 'text-foreground', // Valor por defecto
  iconColor = 'text-muted-foreground' // Valor por defecto
}: MonthlyBudgetAdjustmentProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(currentAmount || defaultAmount);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Si el monto es igual al default, eliminar el ajuste si existe
      if (amount === defaultAmount) {
        const adjustments = await getMonthlyAdjustments(user.uid, month);
        const existingAdjustment = adjustments.find(a => a.budgetId === budgetId);
        if (existingAdjustment) {
          await deleteMonthlyAdjustment(user.uid, existingAdjustment.id);
        }
        showToast({
          type: 'success',
          title: 'Ajuste mensual eliminado',
          description: 'Se ha restaurado el monto por defecto'
        });
      } else {
        // Crear o actualizar ajuste
        const adjustments = await getMonthlyAdjustments(user.uid, month);
        const existingAdjustment = adjustments.find(a => a.budgetId === budgetId);
        
        if (existingAdjustment) {
          await updateMonthlyAdjustment(user.uid, existingAdjustment.id, { adjustedAmount: amount });
          showToast({
            type: 'success',
            title: 'Ajuste mensual actualizado',
            description: 'El presupuesto mensual se ha actualizado'
          });
        } else {
          await createMonthlyAdjustment(user.uid, {
            budgetId,
            month,
            adjustedAmount: amount
          });
          showToast({
            type: 'success',
            title: 'Ajuste mensual creado',
            description: 'Se ha creado un ajuste para este mes'
          });
        }
      }
      
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating monthly adjustment:', error);
      showToast({
        type: 'error',
        title: 'Error al guardar ajuste',
        description: 'No se pudo guardar el ajuste mensual'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setAmount(currentAmount || defaultAmount);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className={`w-24 px-2 py-1 text-sm border rounded ${textColor}`}
          min="0"
        />
        <Button size="sm" onClick={handleSave} disabled={loading}>
          {loading ? '...' : '✓'}
        </Button>
        <Button size="sm" variant="outline" onClick={handleCancel}>
          ✕
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setIsEditing(true)}
        className="flex items-center gap-1 hover:opacity-70 transition-opacity"
      >
        <Edit className={`h-3 w-3 ${iconColor}`} />
        <span className={`text-sm font-medium ${textColor}`}>
          ${(currentAmount || defaultAmount).toLocaleString('es-CL')}
        </span>
      </button>
    </div>
  );
}
