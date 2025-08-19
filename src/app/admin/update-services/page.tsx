'use client';

import { useState } from 'react';
import { ServiceService } from '@/services/database';

const correctServices = [
  {
    name: "Bold Combo Eyebrows",
    price: 708,
    duration: "3-4 hours",
    description: "Experience the perfect blend of artistry combining microbladed strokes for natural texture and shaded areas for enhanced definition.",
    category: "eyebrows" as const,
    image: "/images/services/BOLD-COMBO.png",
    isActive: true,
    order: 0
  },
  {
    name: "Combo Eyebrows",
    price: 640,
    duration: "3-4 hours",
    description: "Combo brows combine the precision of microbladed strokes with a shaded body and tail, creating a beautifully defined look.",
    category: "eyebrows" as const,
    image: "/images/services/COMBO.png",
    isActive: true,
    order: 1
  },
  {
    name: "Blade & Shade Eyebrows",
    price: 640,
    duration: "3-4 hours",
    description: "Incorporating both microbladed strokes for added texture and a shaded body and tail for enhanced definition.",
    category: "eyebrows" as const,
    image: "/images/services/BLADE+SHADE.png",
    isActive: true,
    order: 2
  },
  {
    name: "Strokes Eyebrows",
    price: 600,
    duration: "2-3 hours",
    description: "Hair-stroke technique that creates natural-looking eyebrows with precise individual strokes.",
    category: "eyebrows" as const,
    image: "/images/services/STROKES.png",
    isActive: true,
    order: 3
  },
  {
    name: "Ombre Eyebrows",
    price: 620,
    duration: "2-3 hours",
    description: "Ombré powder brows create a soft, airy look or a more intense, defined appearance based on your preferences.",
    category: "eyebrows" as const,
    image: "/images/services/OMBRE.png",
    isActive: true,
    order: 4
  },
  {
    name: "Powder Eyebrows",
    price: 600,
    duration: "2-3 hours",
    description: "Powder brows offer a semi-permanent cosmetic tattoo solution that delivers soft, shaded, and natural-looking eyebrows, replicating the effect of makeup.",
    category: "eyebrows" as const,
    image: "/images/services/POWDER.png",
    isActive: true,
    order: 5
  }
];

export default function UpdateServicesPage() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [currentServices, setCurrentServices] = useState<any[]>([]);

  const loadCurrentServices = async () => {
    try {
      const services = await ServiceService.getAllServices();
      setCurrentServices(services);
    } catch (error) {
      console.error('Error loading services:', error);
      setMessage('Error loading current services');
    }
  };

  const updateServiceOrder = async () => {
    setIsUpdating(true);
    setMessage('Updating services...');

    try {
      // First, delete all existing services using the correct method
      await ServiceService.deleteAllServices();
      setMessage('Deleted existing services...');

      // Then add services in correct order
      for (const service of correctServices) {
        const serviceData = {
          ...service,
          requirements: [
            "Must be 18 years or older",
            "Not pregnant or breastfeeding",
            "No blood-thinning medications 48 hours prior"
          ],
          contraindications: [
            "Pregnancy or breastfeeding",
            "Active skin conditions in treatment area",
            "Recent Botox or facial treatments (within 2 weeks)"
          ]
        };
        await ServiceService.createService(serviceData);
      }

      setMessage('✅ Services updated successfully! Order is now correct.');
      await loadCurrentServices();
    } catch (error) {
      console.error('Error updating services:', error);
      setMessage('❌ Error updating services: ' + (error as Error).message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h2 className="mb-0">Update Service Order</h2>
            </div>
            <div className="card-body">
              <p className="text-muted mb-4">
                This will update the services in the database to the correct order and pricing.
              </p>

              <div className="mb-4">
                <h5>Correct Order:</h5>
                <ol>
                  {correctServices.map((service, index) => (
                    <li key={index}>
                      {service.name} - ${service.price} (Order: {service.order})
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mb-4">
                <button 
                  className="btn btn-primary me-3"
                  onClick={updateServiceOrder}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Update Service Order'}
                </button>
                
                <button 
                  className="btn btn-secondary"
                  onClick={loadCurrentServices}
                >
                  Load Current Services
                </button>
              </div>

              {message && (
                <div className={`alert ${message.includes('✅') ? 'alert-success' : message.includes('❌') ? 'alert-danger' : 'alert-info'}`}>
                  {message}
                </div>
              )}

              {currentServices.length > 0 && (
                <div className="mt-4">
                  <h5>Current Services in Database:</h5>
                  <ul className="list-group">
                    {currentServices.map((service, index) => (
                      <li key={service.id} className="list-group-item d-flex justify-content-between">
                        <span>{service.name} - ${service.price}</span>
                        <span className="badge bg-secondary">Order: {(service as any).order ?? 'N/A'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
