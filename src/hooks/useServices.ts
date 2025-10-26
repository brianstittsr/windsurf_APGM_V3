import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { ServiceItem } from '@/types/service';

export function useServices() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const servicesRef = collection(getDb(), 'services');
        const q = query(servicesRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);
        
        const servicesData: ServiceItem[] = [];
        snapshot.forEach((doc) => {
          servicesData.push({
            id: doc.id,
            ...doc.data()
          } as ServiceItem);
        });
        
        setServices(servicesData);
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
