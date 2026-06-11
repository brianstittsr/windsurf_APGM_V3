'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Heart, Calendar, ArrowRight, Medal, Flag } from 'lucide-react';
import { ServiceService } from '@/services/database';
import { Service } from '@/types/database';
import { getServiceImagePath } from '@/utils/serviceImageUtils';

export default function ServicesPage() {
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

  const getServiceImage = (service: Service): string => {
    return getServiceImagePath(service);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">Loading services...</div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  return (
    <>
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-[#AD6269] to-[#8B4A52] text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Our Permanent Makeup Services
              </h1>
              <p className="text-lg md:text-xl mb-4 text-white/90">
                Expert permanent makeup services in Raleigh, NC. Each treatment is customized to enhance your natural beauty.
              </p>
              <p className="text-white/80">
                Serving Raleigh, Cary, Durham, Chapel Hill, and Wake Forest
              </p>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="h-full border-0 shadow-lg overflow-hidden flex flex-col">
                  <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <Image
                      src={getServiceImage(service)}
                      alt={service.name}
                      fill
                      className="object-contain p-4"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <h2 className="text-xl font-bold text-[#AD6269]">
                      {service.name}
                    </h2>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                        <Clock className="w-3 h-3" />
                        {service.duration}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      asChild
                      className="w-full rounded-full bg-gradient-to-r from-[#AD6269] to-[#8B4A52] text-white hover:opacity-90"
                    >
                      <Link href={`/services/${generateSlug(service.name)}`}>
                        Learn More
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-[#AD6269]/10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#AD6269]">
                Not Sure Which Service is Right for You?
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Book a free consultation and let Victoria help you choose the perfect permanent makeup solution for your unique features and lifestyle.
              </p>
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 bg-gradient-to-r from-[#AD6269] to-[#8B4A52] text-white hover:opacity-90"
              >
                <Link href="/contact">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Free Consultation
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#AD6269]">
              Why Choose A Pretty Girl Matter?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#AD6269]/10 flex items-center justify-center">
                    <Medal className="w-8 h-8 text-[#AD6269]" />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">Certified Expert</h3>
                <p className="text-muted-foreground">
                  Trained by top PMU academies including The Collective, Beauty Slesh, and Beauty Angels.
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#AD6269]/10 flex items-center justify-center">
                    <Flag className="w-8 h-8 text-[#AD6269]" />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">Veteran-Owned</h3>
                <p className="text-muted-foreground">
                  Proudly veteran-owned business dedicated to service, excellence, and empowering others.
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#AD6269]/10 flex items-center justify-center">
                    <Heart className="w-8 h-8 text-[#AD6269]" />
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">Personalized Care</h3>
                <p className="text-muted-foreground">
                  Every treatment is customized to your unique features, skin type, and personal style preferences.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
