export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  highlightText?: string;
  description?: string;
  backgroundImage: string;
  backgroundVideo?: string;
  buttonText: string;
  buttonLink: string;
  buttonStyle?: 'primary' | 'secondary' | 'outline';
  textAlignment?: 'left' | 'center' | 'right';
  overlayOpacity?: number;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HeroSlideFormData {
  title: string;
  subtitle: string;
  highlightText: string;
  description: string;
  backgroundImage: string;
  backgroundVideo: string;
  buttonText: string;
  buttonLink: string;
  buttonStyle: 'primary' | 'secondary' | 'outline';
  textAlignment: 'left' | 'center' | 'right';
  overlayOpacity: number;
  isActive: boolean;
  order: number;
}

export const defaultHeroSlideFormData: HeroSlideFormData = {
  title: '',
  subtitle: '',
  highlightText: '',
  description: '',
  backgroundImage: '',
  backgroundVideo: '',
  buttonText: 'Book Now',
  buttonLink: '/book-now-custom',
  buttonStyle: 'primary',
  textAlignment: 'center',
  overlayOpacity: 40,
  isActive: true,
  order: 0
};
