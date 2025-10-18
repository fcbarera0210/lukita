// Sistema de eventos personalizados para comunicación entre componentes

export const CUSTOM_EVENTS = {
  REFRESH_DASHBOARD: 'refreshDashboard',
  REFRESH_ACCOUNTS: 'refreshAccounts',
  REFRESH_TRANSACTIONS: 'refreshTransactions',
  REFRESH_CATEGORIES: 'refreshCategories',
} as const;

// Función helper para disparar eventos personalizados
export const dispatchCustomEvent = (eventName: string, detail?: unknown) => {
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
};

// Función helper para escuchar eventos personalizados
export const addCustomEventListener = (
  eventName: string, 
  callback: (event: CustomEvent) => void
) => {
  window.addEventListener(eventName, callback as EventListener);
  return () => window.removeEventListener(eventName, callback as EventListener);
};
