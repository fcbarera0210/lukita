'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Filter, Calendar, BarChart3 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getTrendData, TrendData } from '@/lib/firestore';
import { TrendChart } from '@/components/charts';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { CollapsibleDescription } from '@/components/CollapsibleDescription';

export default function TrendsPage() {
  const { user } = useAuth();
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [selectedMonths, setSelectedMonths] = useState<number>(6);

  const loadTrendData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await getTrendData(user.uid, selectedPeriod, selectedMonths);
      setTrendData(data);
    } catch (error) {
      console.error('Error loading trend data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrendData();
  }, [user, selectedPeriod, selectedMonths]);

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'daily': return 'Diario';
      case 'weekly': return 'Semanal';
      case 'monthly': return 'Mensual';
      default: return '';
    }
  };

  const getMonthsLabel = () => {
    switch (selectedPeriod) {
      case 'daily': return '30 días';
      case 'weekly': return `${selectedMonths} semanas`;
      case 'monthly': return `${selectedMonths} meses`;
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Tendencias Financieras</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-card rounded-lg border animate-pulse">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <TrendingUp className="h-8 w-8 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Tendencias Financieras</h1>
      </div>

      {/* Page Description */}
      <CollapsibleDescription
        title="Análisis de Tendencias Financieras"
        description="Analiza la evolución de tus finanzas a lo largo del tiempo. Visualiza tendencias de ingresos, gastos y balance con diferentes períodos de tiempo. Usa los filtros para ajustar el rango de fechas y el tipo de análisis que necesites."
        icon={<BarChart3 className="h-5 w-5 text-primary" />}
      />

      {/* Filtros */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Filtros</h2>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Período */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Período de Análisis
              </label>
              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'daily' | 'weekly' | 'monthly')}
              >
                <option value="daily">Diario (últimos 30 días)</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </Select>
            </div>

            {/* Rango de tiempo */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Rango de Tiempo
              </label>
              <Select
                value={selectedMonths.toString()}
                onChange={(e) => setSelectedMonths(parseInt(e.target.value))}
              >
                {selectedPeriod === 'daily' ? (
                  <>
                    <option value="7">7 días</option>
                    <option value="15">15 días</option>
                    <option value="30">30 días</option>
                  </>
                ) : selectedPeriod === 'weekly' ? (
                  <>
                    <option value="4">4 semanas</option>
                    <option value="8">8 semanas</option>
                    <option value="12">12 semanas</option>
                    <option value="24">24 semanas</option>
                  </>
                ) : (
                  <>
                    <option value="3">3 meses</option>
                    <option value="6">6 meses</option>
                    <option value="12">12 meses</option>
                    <option value="24">24 meses</option>
                  </>
                )}
              </Select>
            </div>
          </div>

          {/* Información del filtro actual */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Mostrando análisis {getPeriodLabel().toLowerCase()} de los últimos {getMonthsLabel()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos de Tendencias */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Análisis de Tendencias</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TrendChart
            data={trendData}
            type="income"
            period={selectedPeriod}
          />
          <TrendChart
            data={trendData}
            type="expense"
            period={selectedPeriod}
          />
          <TrendChart
            data={trendData}
            type="balance"
            period={selectedPeriod}
          />
        </div>
      </div>

      {/* Información adicional */}
      {trendData.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay datos disponibles</h3>
          <p className="text-muted-foreground">
            No se encontraron transacciones para el período seleccionado.
          </p>
        </div>
      )}
    </div>
  );
}
