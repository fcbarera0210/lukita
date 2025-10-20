import { 
  // Hogar y Servicios
  Home, 
  Wrench, 
  Droplets, 
  Zap, 
  Flame, 
  Wifi,
  // Transporte
  Car, 
  Bus, 
  Fuel, 
  MapPin, 
  Bike, 
  Plane,
  // Salud y Bienestar
  Heart, 
  Pill, 
  Dumbbell, 
  Stethoscope, 
  Smile, 
  Shield,
  // Entretenimiento
  Tv, 
  Music, 
  Gamepad2, 
  Book, 
  Camera, 
  Ticket,
  // Comida y Bebida
  Coffee, 
  Wine, 
  Cake, 
  Utensils, 
  ShoppingCart, 
  Gift,
  // Educación y Trabajo
  GraduationCap, 
  Briefcase, 
  Laptop, 
  BookOpen, 
  Users, 
  FileText,
  // Mascotas
  PawPrint,
  Cat,
  Dog,
  Fish,
  Bird,
  Rabbit,
  // Default
  Tag
} from 'lucide-react';

// Definición completa de los 36 íconos organizados por categorías
export const CATEGORY_ICONS = [
  // Hogar y Servicios
  { value: 'home', label: 'Casa', icon: Home, category: 'Hogar y Servicios' },
  { value: 'wrench', label: 'Reparaciones', icon: Wrench, category: 'Hogar y Servicios' },
  { value: 'droplets', label: 'Agua', icon: Droplets, category: 'Hogar y Servicios' },
  { value: 'zap', label: 'Electricidad', icon: Zap, category: 'Hogar y Servicios' },
  { value: 'flame', label: 'Gas', icon: Flame, category: 'Hogar y Servicios' },
  { value: 'wifi', label: 'Internet', icon: Wifi, category: 'Hogar y Servicios' },
  
  // Transporte
  { value: 'car', label: 'Auto', icon: Car, category: 'Transporte' },
  { value: 'bus', label: 'Transporte público', icon: Bus, category: 'Transporte' },
  { value: 'fuel', label: 'Combustible', icon: Fuel, category: 'Transporte' },
  { value: 'map-pin', label: 'Taxi/Uber', icon: MapPin, category: 'Transporte' },
  { value: 'bike', label: 'Bicicleta', icon: Bike, category: 'Transporte' },
  { value: 'plane', label: 'Viajes', icon: Plane, category: 'Transporte' },
  
  // Salud y Bienestar
  { value: 'heart', label: 'Salud', icon: Heart, category: 'Salud y Bienestar' },
  { value: 'pill', label: 'Medicamentos', icon: Pill, category: 'Salud y Bienestar' },
  { value: 'dumbbell', label: 'Gimnasio', icon: Dumbbell, category: 'Salud y Bienestar' },
  { value: 'stethoscope', label: 'Médico', icon: Stethoscope, category: 'Salud y Bienestar' },
  { value: 'smile', label: 'Bienestar', icon: Smile, category: 'Salud y Bienestar' },
  { value: 'shield', label: 'Seguro', icon: Shield, category: 'Salud y Bienestar' },
  
  // Entretenimiento
  { value: 'tv', label: 'Televisión', icon: Tv, category: 'Entretenimiento' },
  { value: 'music', label: 'Música', icon: Music, category: 'Entretenimiento' },
  { value: 'gamepad-2', label: 'Videojuegos', icon: Gamepad2, category: 'Entretenimiento' },
  { value: 'book', label: 'Libros', icon: Book, category: 'Entretenimiento' },
  { value: 'camera', label: 'Fotografía', icon: Camera, category: 'Entretenimiento' },
  { value: 'ticket', label: 'Eventos', icon: Ticket, category: 'Entretenimiento' },
  
  // Comida y Bebida
  { value: 'coffee', label: 'Café', icon: Coffee, category: 'Comida y Bebida' },
  { value: 'wine', label: 'Bebidas', icon: Wine, category: 'Comida y Bebida' },
  { value: 'cake', label: 'Postres', icon: Cake, category: 'Comida y Bebida' },
  { value: 'utensils', label: 'Restaurantes', icon: Utensils, category: 'Comida y Bebida' },
  { value: 'shopping-cart', label: 'Supermercado', icon: ShoppingCart, category: 'Comida y Bebida' },
  { value: 'gift', label: 'Regalos', icon: Gift, category: 'Comida y Bebida' },
  
  // Educación y Trabajo
  { value: 'graduation-cap', label: 'Educación', icon: GraduationCap, category: 'Educación y Trabajo' },
  { value: 'briefcase', label: 'Trabajo', icon: Briefcase, category: 'Educación y Trabajo' },
  { value: 'laptop', label: 'Tecnología', icon: Laptop, category: 'Educación y Trabajo' },
  { value: 'book-open', label: 'Cursos', icon: BookOpen, category: 'Educación y Trabajo' },
  { value: 'users', label: 'Reuniones', icon: Users, category: 'Educación y Trabajo' },
  { value: 'file-text', label: 'Documentos', icon: FileText, category: 'Educación y Trabajo' },
  
  // Mascotas
  { value: 'paw-print', label: 'Mascotas', icon: PawPrint, category: 'Mascotas' },
  { value: 'cat', label: 'Gatos', icon: Cat, category: 'Mascotas' },
  { value: 'dog', label: 'Perros', icon: Dog, category: 'Mascotas' },
  { value: 'fish', label: 'Peces', icon: Fish, category: 'Mascotas' },
  { value: 'bird', label: 'Aves', icon: Bird, category: 'Mascotas' },
  { value: 'rabbit', label: 'Conejos', icon: Rabbit, category: 'Mascotas' },
];

// Mapeo de íconos para acceso rápido
export const iconMap = {
  home: Home,
  wrench: Wrench,
  droplets: Droplets,
  zap: Zap,
  flame: Flame,
  wifi: Wifi,
  car: Car,
  bus: Bus,
  fuel: Fuel,
  'map-pin': MapPin,
  bike: Bike,
  plane: Plane,
  heart: Heart,
  pill: Pill,
  dumbbell: Dumbbell,
  stethoscope: Stethoscope,
  smile: Smile,
  shield: Shield,
  tv: Tv,
  music: Music,
  'gamepad-2': Gamepad2,
  book: Book,
  camera: Camera,
  ticket: Ticket,
  coffee: Coffee,
  wine: Wine,
  cake: Cake,
  utensils: Utensils,
  'shopping-cart': ShoppingCart,
  gift: Gift,
  'graduation-cap': GraduationCap,
  briefcase: Briefcase,
  laptop: Laptop,
  'book-open': BookOpen,
  users: Users,
  'file-text': FileText,
  'paw-print': PawPrint,
  cat: Cat,
  dog: Dog,
  fish: Fish,
  bird: Bird,
  rabbit: Rabbit,
};

// Función para obtener el ícono por nombre
export const getCategoryIcon = (iconName?: string) => {
  if (!iconName) return Tag;
  return iconMap[iconName as keyof typeof iconMap] || Tag;
};

// Función para obtener íconos por categoría
export const getIconsByCategory = (category: string) => {
  return CATEGORY_ICONS.filter(icon => icon.category === category);
};

// Función para obtener todas las categorías únicas
export const getIconCategories = () => {
  return [...new Set(CATEGORY_ICONS.map(icon => icon.category))];
};

// Mantener compatibilidad con el sistema anterior
export const categoryIcons = CATEGORY_ICONS;