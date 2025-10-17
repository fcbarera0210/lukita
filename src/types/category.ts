export type CategoryKind = 'ingreso' | 'gasto';

export interface Category {
  id: string;
  name: string;
  kind?: CategoryKind; // Hacer opcional para categorías universales
  icon?: string;
  createdAt: number;
}
