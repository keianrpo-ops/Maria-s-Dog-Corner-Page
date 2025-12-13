export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  price: string;
}

export interface Testimonial {
  id: number;
  name: string;
  dogName: string;
  text: string;
  rating: number;
}

export enum ChatRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface ChatMessage {
  role: ChatRole;
  text: string;
  isLoading?: boolean;
}

export enum PageView {
  HOME = 'home',
  SERVICES = 'services',
  SHOP = 'shop',
  ABOUT = 'about',
  CONTACT = 'contact'
}

export interface Product {
  id: string;
  name: string;
  category: 'snack' | 'toy';
  price: number;
  image: string;
  description: string;
  tag?: string; // e.g., "New", "Best Seller"
  bgColor?: string; // For the placeholder background
}

export interface CartItem extends Product {
  quantity: number;
}