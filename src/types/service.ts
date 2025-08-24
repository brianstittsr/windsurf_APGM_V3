export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  order: number;
  active: boolean;
  imageUrl?: string;
  features?: string[];
  requirements?: string[];
}
