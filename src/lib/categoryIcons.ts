import { 
  Utensils, 
  Car, 
  Home, 
  ShoppingBag, 
  Heart, 
  GraduationCap,
  Gamepad2,
  Coffee,
  Plane,
  Gift,
  DollarSign,
  Briefcase,
  Tag
} from 'lucide-react';

export const categoryIcons = [
  { value: 'utensils', label: 'Comida', icon: Utensils },
  { value: 'car', label: 'Transporte', icon: Car },
  { value: 'home', label: 'Casa', icon: Home },
  { value: 'shopping-bag', label: 'Compras', icon: ShoppingBag },
  { value: 'heart', label: 'Salud', icon: Heart },
  { value: 'graduation-cap', label: 'Educación', icon: GraduationCap },
  { value: 'gamepad-2', label: 'Entretenimiento', icon: Gamepad2 },
  { value: 'coffee', label: 'Café', icon: Coffee },
  { value: 'plane', label: 'Viajes', icon: Plane },
  { value: 'gift', label: 'Regalos', icon: Gift },
  { value: 'dollar-sign', label: 'Dinero', icon: DollarSign },
  { value: 'briefcase', label: 'Trabajo', icon: Briefcase },
];

export const iconMap = {
  utensils: Utensils,
  car: Car,
  home: Home,
  'shopping-bag': ShoppingBag,
  heart: Heart,
  'graduation-cap': GraduationCap,
  'gamepad-2': Gamepad2,
  coffee: Coffee,
  plane: Plane,
  gift: Gift,
  'dollar-sign': DollarSign,
  briefcase: Briefcase,
};

export const getCategoryIcon = (iconName?: string) => {
  if (!iconName) return Tag;
  return iconMap[iconName as keyof typeof iconMap] || Tag;
};
