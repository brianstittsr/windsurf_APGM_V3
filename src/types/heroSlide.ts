export type SlideStyleType = 'standard' | 'google-review' | 'certification';

export interface HeroSlide {
  id: string;
  title: string;
  hideTitle?: boolean;
  subtitle?: string;
  highlightText?: string;
  description?: string;
  backgroundImage: string;
  mobileBackgroundImage?: string;
  backgroundVideo?: string;
  buttonText: string;
  buttonLink: string;
  buttonStyle?: 'primary' | 'secondary' | 'outline';
  textAlignment?: 'left' | 'center' | 'right';
  overlayOpacity?: number;
  // Text styling
  textGlow?: boolean;
  titleColor?: string;
  subtitleColor?: string;
  highlightColor?: string;
  subtitleGlow?: boolean;
  highlightGlow?: boolean;
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
  hideTitle: boolean;
  subtitle: string;
  highlightText: string;
  description: string;
  backgroundImage: string;
  mobileBackgroundImage: string;
  backgroundVideo: string;
  buttonText: string;
  buttonLink: string;
  buttonStyle: 'primary' | 'secondary' | 'outline';
  textAlignment: 'left' | 'center' | 'right';
  overlayOpacity: number;
  // Text styling
  textGlow: boolean;
  titleColor: string;
  subtitleColor: string;
  highlightColor: string;
  subtitleGlow: boolean;
  highlightGlow: boolean;
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
  hideTitle: false,
  subtitle: '',
  highlightText: '',
  description: '',
  backgroundImage: '',
  mobileBackgroundImage: '',
  backgroundVideo: '',
  buttonText: 'Book Now',
  buttonLink: '/contact',
  buttonStyle: 'primary',
  textAlignment: 'center',
  overlayOpacity: 40,
  // Text styling defaults
  textGlow: false,
  titleColor: '#FFFFFF',
  subtitleColor: '#AD6269',
  highlightColor: '#FFFFFF',
  subtitleGlow: false,
  highlightGlow: false,
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
