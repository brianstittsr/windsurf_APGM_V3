'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ServiceService } from '@/services/database';
import { Service } from '@/types/database';
import { getServiceImagePath, getServiceSlug } from '@/utils/serviceImageUtils';

export default function PermanentMakeupForYou() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const servicesData = await ServiceService.getAllServices();
      const testNames = ['test service', 'test srvcie 3', 'test service 3'];
      setServices(servicesData.filter(s => s.isActive && !testNames.includes(s.name.toLowerCase().trim())));
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const truncateDescription = (description: string, maxLength: number = 90): string => {
    if (!description || description.length <= maxLength) return description;
    return `${description.slice(0, maxLength).trim()}...`;
  };

  return (
    <section id="services" className="py-section bg-white">
      <div className="container mx-auto px-4">
        {/* Services Grid */}
        <div>
          <h3 className="sub-heading font-bold text-gray-900 mb-8 text-center">
            Our <span className="text-[#AD6269]">Services</span>
          </h3>
          {loading ? (
            <div className="text-center text-gray-500">Loading services...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const slug = getServiceSlug(service);
                const href = slug ? `/services/${slug}` : '/services';
                return (
                  <div key={service.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100 h-full flex flex-col group">
                    <Link href={href} className="relative h-32 bg-gradient-to-br from-gray-50 to-gray-100 block">
                      <Image
                        src={getServiceImagePath(service)}
                        alt={service.name}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </Link>
                    <div className="p-6 flex-grow flex flex-col">
                      <Link href={href}>
                        <h4 className="font-bold text-gray-900 mb-2 group-hover:text-[#AD6269] transition-colors">{service.name}</h4>
                      </Link>
                      <p className="text-gray-600 text-sm flex-grow">{truncateDescription(service.description)}</p>
                      <Link
                        href={href}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-[#AD6269] mt-4 hover:underline"
                      >
                        Learn More
                        <i className="fas fa-arrow-right text-xs"></i>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
