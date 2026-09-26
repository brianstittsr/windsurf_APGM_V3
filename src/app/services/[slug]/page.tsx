import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/firebase-admin';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ChevronRight,
  Clock,
  CalendarPlus,
  MapPin,
  CheckCircle,
  Sparkles,
  Leaf,
  Droplets,
  Smile,
  Palette,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { getServiceImagePath } from '@/utils/serviceImageUtils';
import { Service, ServiceDetailPageContent } from '@/types/database';

const CONSULTATION_FORM_URL = 'https://link.socaldigitalstudio.com/widget/form/wxQMl8ZFz9MiWtrKYlnP';

const DEFAULT_ICONS = [Clock, Leaf, Droplets, Smile, Palette, RefreshCw];

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

function getContent(service: Service): ServiceDetailPageContent {
  return service.detailPageContent || {};
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
  const content = getContent(service);

  const heroTitle = content.heroTitle || serviceName;
  const heroSubtitle = content.heroSubtitle || service.description;

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
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{heroTitle}</h1>
              {heroSubtitle && (
                <p className="text-lg md:text-xl mb-6 text-white/90 max-w-2xl mx-auto">
                  {heroSubtitle}
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
                  What is {serviceName}?
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

        {/* Benefits */}
        {content.benefits && content.benefits.length > 0 && (
          <section className="py-12 md:py-16 bg-[#AD6269]/10">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#AD6269]">
                Benefits of {serviceName}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.benefits.map((benefit, index) => {
                  const Icon = DEFAULT_ICONS[index % DEFAULT_ICONS.length];
                  return (
                    <Card key={index} className="h-full border-0 shadow-sm">
                      <CardContent className="p-6 text-center">
                        <Icon className="w-10 h-10 text-[#AD6269] mx-auto mb-4" />
                        <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                        <p className="text-muted-foreground text-sm">{benefit.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Ideal Candidates */}
        {content.candidates && content.candidates.length > 0 && (
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1 h-80 md:h-96 bg-gradient-to-br from-[#AD6269]/20 to-[#8B4A52]/20 rounded-2xl shadow-lg flex items-center justify-center">
                  <div className="text-center">
                    <UserCheck className="w-20 h-20 text-[#AD6269] mx-auto mb-4" />
                    <p className="font-bold text-[#AD6269]">Ideal Candidates</p>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#AD6269]">
                    Who is {serviceName} Best For?
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {serviceName} is an excellent choice for many clients. It is particularly beneficial for:
                  </p>
                  <ul className="space-y-4">
                    {content.candidates.map((candidate, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#AD6269] mt-0.5 shrink-0" />
                        <span>
                          <strong>{candidate.title}</strong> — {candidate.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Process Steps */}
        {content.processSteps && content.processSteps.length > 0 && (
          <section className="py-12 md:py-16 bg-[#AD6269]/10">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#AD6269]">
                The {serviceName} Process
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {content.processSteps.map((step, index) => (
                  <div key={index} className="text-center">
                    <div className="w-20 h-20 rounded-full bg-[#AD6269] text-white flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold">{step.number}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Aftercare */}
        {content.aftercareSections && content.aftercareSections.length > 0 && (
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-[#AD6269]">
                  {serviceName} Aftercare
                </h2>
                <p className="text-center text-muted-foreground mb-8">
                  Proper aftercare is essential for achieving the best results.
                </p>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {content.aftercareSections.map((section, index) => (
                        <div key={index}>
                          <h3 className="font-bold mb-3">{section.title}</h3>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            {section.items.map((item, i) => (
                              <li key={i}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        {content.faqs && content.faqs.length > 0 && (
          <section className="py-12 md:py-16 bg-[#AD6269]/10">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#AD6269]">
                Frequently Asked Questions About {serviceName}
              </h2>
              <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="space-y-3">
                  {content.faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-0 shadow-sm bg-white rounded-lg px-6">
                      <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>
        )}

        {/* Requirements & Contraindications */}
        {(service.requirements?.length > 0 || service.contraindications?.length > 0) && (
          <section className="py-12 md:py-16">
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
                {content.ctaTitle || `Ready for Beautiful ${serviceName} Results?`}
              </h2>
              <p className="text-lg mb-6 text-white/90">
                {content.ctaText ||
                  `Book a free consultation with Victoria and discover how ${serviceName} can enhance your natural beauty.`}
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
