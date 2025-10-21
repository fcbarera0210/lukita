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
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
    green: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900',
    red: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900',
    yellow: 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900',
    pink: 'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900',
    cyan: 'bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900',
    orange: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900'
  };
  
  return colorMap[colorId] || 'bg-card';
};

export const getAccountTextClass = (colorId: AccountColorId): string => {
  const colorMap: Record<AccountColorId, string> = {
    blue: 'text-blue-900 dark:text-blue-100',
    green: 'text-green-900 dark:text-green-100',
    red: 'text-red-900 dark:text-red-100',
    yellow: 'text-yellow-900 dark:text-yellow-100',
    purple: 'text-purple-900 dark:text-purple-100',
    pink: 'text-pink-900 dark:text-pink-100',
    cyan: 'text-cyan-900 dark:text-cyan-100',
    orange: 'text-orange-900 dark:text-orange-100'
  };
  
  return colorMap[colorId] || 'text-foreground';
};

export const getAccountIconColor = (colorId: AccountColorId): string => {
  const colorMap: Record<AccountColorId, string> = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    purple: 'text-purple-500',
    pink: 'text-pink-500',
    cyan: 'text-cyan-500',
    orange: 'text-orange-500'
  };
  
  return colorMap[colorId] || 'text-muted-foreground';
};

// Constantes para límites
export const MAX_ACCOUNTS = 8;
export const MIN_ACCOUNTS_FOR_TRANSFER = 2;
