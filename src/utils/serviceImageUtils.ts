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
  link?: string;
}

/**
 * Get the correct image path for a service
 * @param service - The service object
 * @returns The correct image path
 */
export function getServiceImagePath(service: ServiceItem): string {
  // Prefer the image explicitly set in the Services admin panel so the
  // public site always matches what's configured there.
  if (service.image) {
    return service.image;
  }

  // Service-specific mappings to ensure correct images
  const serviceImageMap: { [key: string]: string } = {
    'powder-brows': '/images/services/POWDER.png',
    'microblading': '/images/services/STROKES.png',
    'combo-eyebrows': '/images/services/COMBO.png',
    'ombre-eyebrows': '/images/services/OMBRE.png',
    'blade-shade': '/images/services/BLADE+SHADE.png',
    'bold-combo': '/images/services/BOLD-COMBO.png',
    'lip-blushing': '/images/services/POWDER.png', // Use powder image for lip blushing
    'permanent-eyeliner': '/images/services/STROKES.png', // Use strokes image for eyeliner
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
  if (service.name === 'Lip Blushing') {
    return '/images/services/POWDER.png';
  }
  if (service.name === 'Permanent Eyeliner') {
    return '/images/services/STROKES.png';
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
  if (serviceName.includes('lip')) {
    return '/images/services/POWDER.png';
  }
  if (serviceName.includes('eyeliner')) {
    return '/images/services/STROKES.png';
  }
  if (serviceName.includes('consultation') || serviceName.includes('perfecting session') || serviceName.includes('perfecting')) {
    return '/images/APGM-icon.png';
  }

  // Fall back to service.image from database if available
  if (service.image) {
    return service.image;
  }

  // Ultimate fallback to the PG logo icon
  return '/images/APGM-icon.png';
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

// Slugs for service detail pages that actually exist under /services/[slug]
const VALID_SERVICE_SLUGS = [
  'microblading',
  'ombre-brows',
  'combo-brows',
  'blade-shade',
  'lip-blushing',
  'permanent-eyeliner',
  'tiny-tattoos',
];

/**
 * Get the correct detail-page slug for a service, based on its name/id.
 * Falls back to null if no matching detail page exists, so callers can
 * link to the general /services page instead of a broken/404 route.
 * @param service - The service object
 * @returns A valid slug (matching an existing /services/[slug] page) or null
 */
export function getServiceSlug(service: ServiceItem): string | null {
  const id = (service.id || '').toLowerCase();
  const name = service.name.toLowerCase();

  // Prefer the explicit detail-page link set in the admin Services panel
  if (service.link?.trim()) {
    return service.link.trim();
  }

  // Direct match by id
  if (VALID_SERVICE_SLUGS.includes(id)) {
    return id;
  }

  // Match by name patterns
  if (name.includes('microblading') || name.includes('strokes')) {
    return 'microblading';
  }
  if (name.includes('ombre') || name.includes('ombré')) {
    return 'ombre-brows';
  }
  if (name.includes('blade') && name.includes('shade')) {
    return 'blade-shade';
  }
  if (name.includes('combo')) {
    return 'combo-brows';
  }
  if (name.includes('lip')) {
    return 'lip-blushing';
  }
  if (name.includes('eyeliner')) {
    return 'permanent-eyeliner';
  }
  if (name.includes('tiny tattoo') || name.includes('mini tattoo') || name.includes('tattoo')) {
    return 'tiny-tattoos';
  }

  return null;
}
