import { useState, useEffect } from 'react';
import { ServiceService } from '@/services/database';
import { Service } from '@/types/database';

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const servicesData = await ServiceService.getAllServices();
        const activeServices = servicesData.filter(service => service.isActive);
        setServices(activeServices);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch services');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return { services, loading, error };
}
