import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Heart, Calendar, ArrowRight, Medal, Flag, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Permanent Makeup Services Raleigh NC',
  description: 'Explore our permanent makeup services in Raleigh, NC. Microblading, ombré brows, combo brows, lip blushing, and permanent eyeliner. Book your free consultation today!',
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services',
  },
};

const services = [
  {
    name: 'Microblading',
    slug: 'microblading',
    description: 'Natural-looking eyebrow enhancement using fine hair-like strokes that mimic real brow hairs.',
    image: '/images/services/STROKES.png',
    duration: '2-3 hours',
    healing: '4-6 weeks',
    lasts: '1-3 years',
  },
  {
    name: 'Ombré Powder Brows',
    slug: 'ombre-brows',
    description: 'Soft, natural gradient effect that gives a powdered makeup look. Perfect for all skin types.',
    image: '/images/services/OMBRE.png',
    duration: '2-3 hours',
    healing: '4-6 weeks',
    lasts: '1-3 years',
  },
  {
    name: 'Combo Brows',
    slug: 'combo-brows',
    description: 'The best of both worlds - microblading strokes combined with powder shading for a fuller look.',
    image: '/images/services/COMBO.png',
    duration: '2.5-3 hours',
    healing: '4-6 weeks',
    lasts: '1-3 years',
  },
  {
    name: 'Blade & Shade',
    slug: 'blade-shade',
    description: 'Microblading strokes with added shading for enhanced texture, depth, and a bolder, more defined look.',
    image: '/images/services/BLADE+SHADE.png',
    duration: '3-4 hours',
    healing: '4-6 weeks',
    lasts: '1-3 years',
  },
  {
    name: 'Lip Blushing',
    slug: 'lip-blushing',
    description: 'Enhance your natural lip color and define lip shape with this beautiful permanent lip tattoo.',
    image: '/images/services/POWDER.png',
    duration: '2-3 hours',
    healing: '4-6 weeks',
    lasts: '2-5 years',
  },
  {
    name: 'Permanent Eyeliner',
    slug: 'permanent-eyeliner',
    description: 'Wake up with perfectly defined eyes every day. Lash line enhancement for a natural or dramatic look.',
    image: '/images/services/STROKES.png',
    duration: '1.5-2 hours',
    healing: '4-6 weeks',
    lasts: '2-5 years',
  },
];

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="pt-header">
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
                <Card key={service.slug} className="h-full border-0 shadow-lg overflow-hidden flex flex-col">
                  <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      className="object-cover"
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
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                        <Heart className="w-3 h-3" />
                        Heals in {service.healing}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                        <Calendar className="w-3 h-3" />
                        Lasts {service.lasts}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      asChild
                      className="w-full rounded-full bg-gradient-to-r from-[#AD6269] to-[#8B4A52] text-white hover:opacity-90"
                    >
                      <Link href={`/services/${service.slug}`}>
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
                <Link href="/book-now-custom">
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
