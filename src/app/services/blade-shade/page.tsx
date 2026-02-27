import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
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
  Layers,
  Palette,
  Feather,
  Droplets,
  Clock,
  CheckCircle,
  CalendarPlus,
  Phone,
  MapPin,
  Sparkles,
  UserCheck,
  ChevronRight,
  Eye,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blade & Shade Eyebrows Raleigh NC | Microblading with Shading',
  description: 'Blade & Shade eyebrows in Raleigh, NC - microblading strokes with added shading for enhanced texture, depth, and bolder brows. Book your consultation today!',
  keywords: ['blade and shade Raleigh', 'blade shade brows Raleigh NC', 'microblading with shading', 'enhanced brows', 'PMU Raleigh'],
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services/blade-shade',
  },
};

const faqs = [
  {
    question: 'What is Blade & Shade?',
    answer: 'Blade & Shade is an advanced eyebrow technique that combines microblading hair strokes with machine shading. The microblading creates natural, hair-like strokes while the shading adds depth, dimension, and a fuller appearance. This creates bolder, more defined brows than microblading alone.',
  },
  {
    question: 'How is Blade & Shade different from Combo Brows?',
    answer: 'While both techniques combine strokes and shading, Blade & Shade typically uses more concentrated shading throughout the brow for a bolder, more defined look. It\'s ideal for clients who want fuller, more dramatic brows or those with coarse, dark hair who need extra definition.',
  },
  {
    question: 'How long does Blade & Shade last?',
    answer: 'Blade & Shade typically lasts 1-3 years depending on your skin type, lifestyle, and aftercare. The shading component tends to last longer than microblading strokes alone, making this a great long-lasting option.',
  },
  {
    question: 'Who is Blade & Shade best for?',
    answer: 'Blade & Shade is perfect for those who prefer medium to bold brows, fill in their eyebrows daily, have little to no existing eyebrows, or have dark coarse hairs in their brow area. It\'s also ideal for clients who want more definition than microblading alone can provide.',
  },
  {
    question: 'What is the healing process like?',
    answer: 'Healing takes 4-6 weeks. Your brows will appear darker initially and may go through some flaking. The color will lighten by 30-40% as they heal. Following proper aftercare is crucial for achieving the best, long-lasting results.',
  },
];

const benefits = [
  {
    icon: Layers,
    title: 'Enhanced Texture & Depth',
    description: 'Microblading strokes combined with shading create multi-dimensional, textured brows with added depth.',
  },
  {
    icon: Palette,
    title: 'Bolder, Defined Look',
    description: 'Perfect for those who want fuller, more dramatic brows that make a statement.',
  },
  {
    icon: Feather,
    title: 'Natural Hair Strokes',
    description: 'Fine microblading strokes maintain a natural appearance while shading adds fullness.',
  },
  {
    icon: Droplets,
    title: 'Works on All Skin Types',
    description: 'The shading component makes this technique suitable for oily skin where microblading alone may fade faster.',
  },
  {
    icon: Clock,
    title: 'Long-Lasting Results',
    description: 'Enjoy beautiful, defined brows for 1-3 years with proper care and touch-ups.',
  },
  {
    icon: CheckCircle,
    title: 'Customizable Intensity',
    description: 'Shading can be adjusted from subtle to bold based on your preferences and style.',
  },
];

const candidates = [
  { title: 'Those who prefer bold brows', description: 'Perfect for clients who fill in their brows daily and want a more defined look' },
  { title: 'Little to no existing eyebrows', description: 'Creates maximum fullness and definition from scratch' },
  { title: 'Dark coarse hair', description: 'The shading helps blend and define coarse brow hairs naturally' },
  { title: 'Oily skin types', description: 'The shading component holds up better on oily skin than microblading alone' },
  { title: 'Want more than microblading', description: 'Ideal for those seeking enhanced texture and depth beyond basic microblading' },
];

const howItWorks = [
  { number: '1', title: 'Microblading Strokes', description: 'Fine, hair-like strokes are created using a microblade for natural texture.' },
  { number: '2', title: 'Machine Shading', description: 'A specialized machine adds shading throughout the brow for depth and fullness.' },
  { number: '3', title: 'Blended Perfection', description: 'The strokes and shading are expertly blended for a seamless, dimensional result.' },
];

export default function BladeAndShadePage() {
  return (
    <>
      <Header />
      <main className="pt-header">
        {/* Hero Section */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-[#AD6269] to-[#8B4A52] text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              {/* Breadcrumb */}
              <nav className="flex justify-center items-center gap-2 text-sm text-white/70 mb-6">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <ChevronRight className="w-4 h-4" />
                <Link href="/services" className="hover:text-white transition-colors">Services</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">Blade & Shade</span>
              </nav>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Blade & Shade Eyebrows in Raleigh, NC
              </h1>
              <p className="text-lg md:text-xl mb-6 text-white/90">
                Microblading strokes with added shading for enhanced texture, depth, and bolder, more defined brows
              </p>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-full px-8 bg-white text-[#AD6269] hover:bg-white/90"
              >
                <Link href="/book-now-custom">
                  <CalendarPlus className="w-5 h-5 mr-2" />
                  Book Free Consultation
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* What is Blade & Shade */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#AD6269]">
                  What is Blade & Shade?
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  Blade & Shade is an advanced permanent makeup technique that combines the artistry of microblading with the depth and definition of machine shading.
                </p>
                <p className="text-muted-foreground mb-4">
                  The microblading creates fine, hair-like strokes for natural texture, while the machine shading adds a wash of color and depth throughout the brow. This creates bolder, more defined brows that are perfect for those who want more than microblading alone can provide.
                </p>
                <p className="text-muted-foreground">
                  At A Pretty Girl Matter in Raleigh, NC, Victoria expertly combines these techniques to create customized brows that enhance your natural features with added dimension, fullness, and definition.
                </p>
              </div>
              <div className="relative h-80 md:h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg overflow-hidden">
                <Image
                  src="/images/services/BLADE+SHADE.png"
                  alt="Blade & Shade Eyebrows"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 md:py-16 bg-[#AD6269]/10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#AD6269]">
              How Blade & Shade Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {howItWorks.map((step, index) => (
                <Card key={index} className="h-full border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-[#AD6269] text-white flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold">{step.number}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#AD6269]">
              Benefits of Blade & Shade
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="h-full border-0 shadow-sm">
                  <CardContent className="p-6 text-center">
                    <benefit.icon className="w-10 h-10 text-[#AD6269] mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Who Should Get Blade & Shade */}
        <section className="py-12 md:py-16 bg-[#AD6269]/10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 h-80 md:h-96 bg-gradient-to-br from-[#AD6269]/20 to-[#8B4A52]/20 rounded-2xl shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <UserCheck className="w-20 h-20 text-[#AD6269] mx-auto mb-4" />
                  <p className="font-bold text-[#AD6269]">Bold & Beautiful</p>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#AD6269]">
                  Who Should Get Blade & Shade?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Blade & Shade is perfect for those who want bolder, more defined brows with enhanced texture and depth. It's especially ideal for:
                </p>
                <ul className="space-y-4">
                  {candidates.map((candidate, index) => (
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

        {/* FAQ Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#AD6269]">
              Frequently Asked Questions About Blade & Shade
            </h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, index) => (
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

        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-[#AD6269] to-[#8B4A52] text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready for Bold, Beautiful Brows?
              </h2>
              <p className="text-lg mb-6 text-white/90">
                Book your free consultation today and discover how Blade & Shade can give you the defined, dimensional brows you've always wanted.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="rounded-full px-8 bg-white text-[#AD6269] hover:bg-white/90"
                >
                  <Link href="/book-now-custom">
                    <CalendarPlus className="w-5 h-5 mr-2" />
                    Book Consultation
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 border-white text-white hover:bg-white/10"
                >
                  <Link href="/contact">
                    <Phone className="w-5 h-5 mr-2" />
                    Contact Us
                  </Link>
                </Button>
              </div>
              <p className="mt-6 text-white/80 flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4" />
                Serving Raleigh, Cary, Durham, Chapel Hill & Wake Forest, NC
              </p>
            </div>
          </div>
        </section>

        {/* Related Services */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-8 text-[#AD6269]">
              Related Services You May Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Link href="/services/microblading" className="group">
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Eye className="w-8 h-8 text-[#AD6269] mx-auto mb-3" />
                    <h3 className="font-bold text-foreground group-hover:text-[#AD6269] transition-colors">Microblading</h3>
                    <p className="text-sm text-muted-foreground">Natural hair-like strokes</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/services/combo-brows" className="group">
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Sparkles className="w-8 h-8 text-[#AD6269] mx-auto mb-3" />
                    <h3 className="font-bold text-foreground group-hover:text-[#AD6269] transition-colors">Combo Brows</h3>
                    <p className="text-sm text-muted-foreground">Best of both techniques</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
