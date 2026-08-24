'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ServiceService } from '@/services/database';
import { Service } from '@/types/database';
import { getServiceImagePath } from '@/utils/serviceImageUtils';

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

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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
              {services.map((service) => (
                <Link key={service.id} href={`/services/${generateSlug(service.name)}`} className="group">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100 h-full flex flex-col">
                    <div className="relative h-32 bg-gradient-to-br from-gray-50 to-gray-100">
                      <Image
                        src={getServiceImagePath(service)}
                        alt={service.name}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-6 flex-grow">
                      <h4 className="font-bold text-gray-900 mb-2 group-hover:text-[#AD6269] transition-colors">{service.name}</h4>
                      <p className="text-gray-600 text-sm">{service.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
              <Link href="/services" className="group">
                <div className="bg-[#AD6269]/10 rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-[#AD6269]/20 h-full flex flex-col justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#AD6269] flex items-center justify-center mb-4">
                    <i className="fas fa-arrow-right text-white text-xl"></i>
                  </div>
                  <h4 className="font-bold text-[#AD6269] mb-2">View All Services</h4>
                  <p className="text-gray-600 text-sm">Explore our complete service menu</p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
