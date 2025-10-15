import { startOfDay, endOfDay } from 'date-fns';

/**
 * Calcula el período contable basado en el día de corte del mes
 * @param baseDate Fecha base para calcular el período
 * @param cutoffDay Día del mes para el corte (1-28, por defecto 1)
 * @returns Tupla con [fecha_inicio, fecha_fin] del período contable
 */
export function getPeriodFromCutoff(baseDate: Date, cutoffDay = 1): [Date, Date] {
  const d = new Date(baseDate);
  const currentCut = new Date(d.getFullYear(), d.getMonth(), cutoffDay);
  let start: Date;
  let end: Date;

  if (d >= currentCut) {
    // Período va desde el cutoff del mes actual al día previo al próximo cutoff
    start = startOfDay(currentCut);
    const nextCut = new Date(d.getFullYear(), d.getMonth() + 1, cutoffDay);
    end = endOfDay(new Date(nextCut.getTime() - 1));
  } else {
    // Período va desde el cutoff del mes anterior al día previo al cutoff actual
    const prevCut = new Date(d.getFullYear(), d.getMonth() - 1, cutoffDay);
    start = startOfDay(prevCut);
    end = endOfDay(new Date(currentCut.getTime() - 1));
  }

  return [start, end];
}

/**
 * Obtiene el período contable actual basado en el día de corte
 */
export function getCurrentPeriod(cutoffDay = 1): [Date, Date] {
  return getPeriodFromCutoff(new Date(), cutoffDay);
}

/**
 * Formatea una fecha para mostrar en la UI
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

/**
 * Formatea una fecha y hora para mostrar en la UI
 */
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}
