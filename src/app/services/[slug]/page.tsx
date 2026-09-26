import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/firebase-admin';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Clock, CalendarPlus, MapPin, CheckCircle, Sparkles } from 'lucide-react';
import { getServiceImagePath } from '@/utils/serviceImageUtils';
import { Service } from '@/types/database';

const CONSULTATION_FORM_URL = 'https://link.socaldigitalstudio.com/widget/form/wxQMl8ZFz9MiWtrKYlnP';

interface PageProps {
  params: { slug: string };
}

async function getServiceBySlug(slug: string): Promise<Service | null> {
  try {
    const snapshot = await db
      .collection('services')
      .where('link', '==', slug)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Service;
    }

    // Fallback: match by service name slug in case link was not set
    const allSnapshot = await db.collection('services').get();
    const match = allSnapshot.docs.find((doc) => {
      const data = doc.data();
      return (
        data.link?.trim() === slug ||
        data.name
          ?.toLowerCase()
          .replace(/[^\w\s-]+/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-') === slug
      );
    });

    return match ? ({ id: match.id, ...match.data() } as Service) : null;
  } catch (error) {
    console.error('[services/[slug]] Error fetching service:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const service = await getServiceBySlug(params.slug);
  const title = service ? `${service.name} | A Pretty Girl Matter` : 'Service | A Pretty Girl Matter';
  const description = service
    ? service.description
    : 'Permanent makeup services in Raleigh, NC by A Pretty Girl Matter.';

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.aprettygirlmatter.com/services/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.aprettygirlmatter.com/services/${params.slug}`,
      type: 'website',
    },
  };
}

export async function generateStaticParams() {
  try {
    const snapshot = await db.collection('services').get();
    return snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return data.link?.trim() || null;
      })
      .filter((slug): slug is string => Boolean(slug))
      .map((slug) => ({ slug }));
  } catch (error) {
    console.error('[services/[slug]] Error generating static params:', error);
    return [];
  }
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const service = await getServiceBySlug(params.slug);

  if (!service) {
    notFound();
  }

  const imagePath = getServiceImagePath(service);
  const serviceName = service.name;
  const showPrice = service.showPrice ?? true;

  return (
    <>
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-[#AD6269] to-[#8B4A52] text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <nav className="flex justify-center items-center gap-2 text-sm text-white/70 mb-6">
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <ChevronRight className="w-4 h-4" />
                <Link href="/services" className="hover:text-white transition-colors">
                  Services
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">{serviceName}</span>
              </nav>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{serviceName}</h1>
              {service.description && (
                <p className="text-lg md:text-xl mb-6 text-white/90 max-w-2xl mx-auto">
                  {service.description}
                </p>
              )}
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-full px-8 bg-white text-[#AD6269] hover:bg-white/90"
              >
                <a href={CONSULTATION_FORM_URL} target="_blank" rel="noopener noreferrer">
                  <CalendarPlus className="w-5 h-5 mr-2" />
                  Book Free Consultation
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Service Overview */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative h-80 md:h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg overflow-hidden">
                <Image
                  src={imagePath}
                  alt={serviceName}
                  fill
                  className="object-contain p-6"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#AD6269]">
                  About This Service
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  {service.description || `Learn more about ${serviceName} at A Pretty Girl Matter.`}
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-md capitalize">
                    <Sparkles className="w-4 h-4" />
                    {service.category}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-md">
                    <Clock className="w-4 h-4" />
                    {service.duration}
                  </span>
                  {showPrice && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-md font-semibold">
                      ${service.price}
                    </span>
                  )}
                </div>
                <Button
                  asChild
                  className="rounded-full px-8 bg-gradient-to-r from-[#AD6269] to-[#8B4A52] text-white hover:opacity-90"
                >
                  <a href={CONSULTATION_FORM_URL} target="_blank" rel="noopener noreferrer">
                    <CalendarPlus className="w-5 h-5 mr-2" />
                    Your Pretty Girl Consultation Starts Here
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Requirements & Contraindications */}
        {(service.requirements?.length > 0 || service.contraindications?.length > 0) && (
          <section className="py-12 md:py-16 bg-[#AD6269]/10">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {service.requirements?.length > 0 && (
                  <Card className="border-0 shadow-sm h-full">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4 text-[#AD6269]">Before Your Appointment</h3>
                      <ul className="space-y-3">
                        {service.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-3 text-muted-foreground">
                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                {service.contraindications?.length > 0 && (
                  <Card className="border-0 shadow-sm h-full">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4 text-[#AD6269]">Important Considerations</h3>
                      <ul className="space-y-3">
                        {service.contraindications.map((item, index) => (
                          <li key={index} className="flex items-start gap-3 text-muted-foreground">
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold mt-0.5 shrink-0">
                              !
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-[#AD6269] to-[#8B4A52] text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-lg mb-6 text-white/90">
                Book a free consultation with Victoria and discover how {serviceName} can enhance your natural beauty.
              </p>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-full px-8 bg-white text-[#AD6269] hover:bg-white/90"
              >
                <a href={CONSULTATION_FORM_URL} target="_blank" rel="noopener noreferrer">
                  <CalendarPlus className="w-5 h-5 mr-2" />
                  Book Free Consultation
                </a>
              </Button>
              <p className="mt-6 text-white/80 flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4" />
                Serving Raleigh, Cary, Durham, Chapel Hill & Wake Forest, NC
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
