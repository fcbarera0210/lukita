// Paleta de colores para cuentas - 8 colores contrastados para ambos temas
export const ACCOUNT_COLORS = [
  {
    id: 'blue',
    name: 'Azul',
    value: '#3B82F6',
    class: 'border-blue-500',
    bgClass: 'bg-blue-500',
    textClass: 'text-blue-500'
  },
  {
    id: 'green',
    name: 'Verde',
    value: '#10B981',
    class: 'border-green-500',
    bgClass: 'bg-green-500',
    textClass: 'text-green-500'
  },
  {
    id: 'red',
    name: 'Rojo',
    value: '#EF4444',
    class: 'border-red-500',
    bgClass: 'bg-red-500',
    textClass: 'text-red-500'
  },
  {
    id: 'yellow',
    name: 'Amarillo',
    value: '#F59E0B',
    class: 'border-yellow-500',
    bgClass: 'bg-yellow-500',
    textClass: 'text-yellow-500'
  },
  {
    id: 'purple',
    name: 'Púrpura',
    value: '#8B5CF6',
    class: 'border-purple-500',
    bgClass: 'bg-purple-500',
    textClass: 'text-purple-500'
  },
  {
    id: 'pink',
    name: 'Rosa',
    value: '#EC4899',
    class: 'border-pink-500',
    bgClass: 'bg-pink-500',
    textClass: 'text-pink-500'
  },
  {
    id: 'cyan',
    name: 'Cian',
    value: '#06B6D4',
    class: 'border-cyan-500',
    bgClass: 'bg-cyan-500',
    textClass: 'text-cyan-500'
  },
  {
    id: 'orange',
    name: 'Naranja',
    value: '#F97316',
    class: 'border-orange-500',
    bgClass: 'bg-orange-500',
    textClass: 'text-orange-500'
  }
] as const;

export type AccountColorId = typeof ACCOUNT_COLORS[number]['id'];

// Utilidades para gestión de colores
export const getColorById = (id: AccountColorId) => {
  return ACCOUNT_COLORS.find(color => color.id === id);
};

export const getAvailableColors = (usedColors: AccountColorId[]) => {
  return ACCOUNT_COLORS.filter(color => !usedColors.includes(color.id));
};

export const getNextAvailableColor = (usedColors: AccountColorId[]): AccountColorId => {
  const available = getAvailableColors(usedColors);
  return available.length > 0 ? available[0].id : 'blue';
};

export const getAccountColorClass = (colorId: AccountColorId): string => {
  const color = getColorById(colorId);
  return color ? color.class : 'border-border';
};

export const getAccountBackgroundClass = (colorId: AccountColorId): string => {
  const colorMap: Record<AccountColorId, string> = {
    blue: 'bg-blue-50 dark:bg-blue-950',
    green: 'bg-green-50 dark:bg-green-950',
    red: 'bg-red-50 dark:bg-red-950',
    yellow: 'bg-yellow-50 dark:bg-yellow-950',
    purple: 'bg-purple-50 dark:bg-purple-950',
    pink: 'bg-pink-50 dark:bg-pink-950',
    cyan: 'bg-cyan-50 dark:bg-cyan-950',
    orange: 'bg-orange-50 dark:bg-orange-950'
  };
  
  return colorMap[colorId] || 'bg-card';
};

export const getAccountColorValue = (colorId: AccountColorId): string => {
  const color = getColorById(colorId);
  return color ? color.value : '#6B7280'; // Default fallback (gray-500)
};

// Constantes para límites
export const MAX_ACCOUNTS = 8;
export const MIN_ACCOUNTS_FOR_TRANSFER = 2;
