export type SlideStyleType = 'standard' | 'google-review' | 'certification';

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
  // New style type field
  styleType?: SlideStyleType;
  // Google Review specific fields
  reviewerName?: string;
  reviewRating?: number;
  reviewDate?: string;
  reviewText?: string;
  afterPhoto?: string;
  // Certification specific fields
  certificationName?: string;
  certificationOrg?: string;
  certificationYear?: string;
  certificationBadge?: string;
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
  // Style type
  styleType: SlideStyleType;
  // Google Review fields
  reviewerName: string;
  reviewRating: number;
  reviewDate: string;
  reviewText: string;
  afterPhoto: string;
  // Certification fields
  certificationName: string;
  certificationOrg: string;
  certificationYear: string;
  certificationBadge: string;
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
  order: 0,
  // Style type
  styleType: 'standard',
  // Google Review fields
  reviewerName: '',
  reviewRating: 5,
  reviewDate: '',
  reviewText: '',
  afterPhoto: '',
  // Certification fields
  certificationName: '',
  certificationOrg: '',
  certificationYear: '',
  certificationBadge: ''
};
