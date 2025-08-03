/**
 * Service Image Utilities
 * 
 * Provides centralized image path management for services to ensure
 * consistent image mapping regardless of database state.
 */

export interface ServiceItem {
  id: string;
  name: string;
  image?: string;
}

/**
 * Get the correct image path for a service
 * @param service - The service object
 * @returns The correct image path
 */
export function getServiceImagePath(service: ServiceItem): string {
  // Service-specific mappings to ensure correct images
  const serviceImageMap: { [key: string]: string } = {
    'powder-brows': '/images/services/POWDER.png',
    'microblading': '/images/services/STROKES.png',
    'combo-eyebrows': '/images/services/COMBO.png',
    'ombre-eyebrows': '/images/services/OMBRE.png',
    'blade-shade': '/images/services/BLADE+SHADE.png',
    'bold-combo': '/images/services/BOLD-COMBO.png',
  };

  // Check by service ID first
  if (service.id && serviceImageMap[service.id]) {
    return serviceImageMap[service.id];
  }

  // Check by service name for specific services
  if (service.name === 'Combo Eyebrows') {
    return '/images/services/COMBO.png';
  }
  if (service.name === 'Bold Combo Eyebrows' || service.name === 'Bold Combo') {
    return '/images/services/BOLD-COMBO.png';
  }

  // Check by service name patterns
  const serviceName = service.name.toLowerCase();
  if (serviceName.includes('powder')) {
    return '/images/services/POWDER.png';
  }
  if (serviceName.includes('microblading') || serviceName.includes('strokes')) {
    return '/images/services/STROKES.png';
  }
  if (serviceName.includes('combo')) {
    return '/images/services/COMBO.png';
  }
  if (serviceName.includes('ombre')) {
    return '/images/services/OMBRE.png';
  }
  if (serviceName.includes('blade') && serviceName.includes('shade')) {
    return '/images/services/BLADE+SHADE.png';
  }
  if (serviceName.includes('bold')) {
    return '/images/services/BOLD-COMBO.png';
  }

  // Fall back to service.image from database if available
  if (service.image) {
    return service.image;
  }

  // Ultimate fallback to a default service image
  return '/images/services/POWDER.png';
}

/**
 * Get all available service images
 * @returns Array of available service image paths
 */
export function getAvailableServiceImages(): string[] {
  return [
    '/images/services/POWDER.png',
    '/images/services/STROKES.png',
    '/images/services/COMBO.png',
    '/images/services/OMBRE.png',
    '/images/services/BLADE+SHADE.png',
    '/images/services/BOLD-COMBO.png',
  ];
}
