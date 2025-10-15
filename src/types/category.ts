export type CategoryKind = 'ingreso' | 'gasto';

export interface Category {
  id: string;
  name: string;
  kind: CategoryKind;
  icon?: string;
  createdAt: number;
}
