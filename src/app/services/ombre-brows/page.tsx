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
  Sparkles,
  Droplets,
  Palette,
  Clock,
  Sun,
  CheckCircle,
  CalendarPlus,
  Phone,
  MapPin,
  UserCheck,
  ChevronRight,
  Eye,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ombre Powder Brows Raleigh NC | Soft Eyebrow Tattoo',
  description: 'Beautiful ombre powder brows in Raleigh, NC. Soft, natural gradient effect that lasts 1-3 years. Certified PMU artist. Book your appointment today!',
  keywords: ['ombre brows Raleigh', 'powder brows Raleigh NC', 'ombre eyebrow tattoo', 'soft brow tattoo', 'PMU Raleigh'],
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services/ombre-brows',
  },
};

const faqs = [
  {
    question: 'What are ombre powder brows?',
    answer: 'Ombre powder brows are a permanent makeup technique that creates a soft, powdered makeup look. The technique uses a machine to deposit pigment in a gradient pattern - lighter at the front and darker at the tail - mimicking the look of filled-in brows with makeup.',
  },
  {
    question: 'How long do ombre brows last?',
    answer: 'Ombre powder brows typically last 1-3 years depending on your skin type, lifestyle, and aftercare. They tend to last longer than microblading, especially on oily skin types.',
  },
  {
    question: 'Are ombre brows better than microblading?',
    answer: 'Neither is "better" - they are different techniques for different preferences. Ombre brows create a soft, makeup-like finish and work well on all skin types including oily skin. Microblading creates hair-like strokes for a more natural look. Many clients choose combo brows to get the best of both.',
  },
  {
    question: 'Does getting ombre brows hurt?',
    answer: 'Most clients experience minimal discomfort. We apply a topical numbing cream before and during the procedure. Many describe the sensation as a light scratching or vibration.',
  },
  {
    question: 'What is the healing process like?',
    answer: 'Healing takes 4-6 weeks. Your brows will appear darker and more intense initially, then lighten by 30-50% as they heal. Some scabbing and flaking is normal. The true color emerges after full healing.',
  },
];

const benefits = [
  {
    icon: Sparkles,
    title: 'Soft Powdered Look',
    description: 'Achieve a beautiful, filled-in brow look that mimics perfectly applied makeup.',
  },
  {
    icon: Droplets,
    title: 'Great for Oily Skin',
    description: 'Powder brows last longer on oily skin types where microblading may fade faster.',
  },
  {
    icon: Palette,
    title: 'Customizable Gradient',
    description: 'The ombre effect is tailored to your preferences - from subtle to dramatic.',
  },
  {
    icon: Clock,
    title: 'Long-Lasting Results',
    description: 'Enjoy beautiful brows for 1-3 years with proper care and occasional touch-ups.',
  },
  {
    icon: Sun,
    title: 'Smudge-Proof',
    description: 'Your brows stay perfect through workouts, swimming, and hot weather.',
  },
  {
    icon: CheckCircle,
    title: 'Low Maintenance',
    description: 'Wake up with perfect brows every day - no daily filling required.',
  },
];

const candidates = [
  { title: 'Oily skin types', description: 'Powder technique holds up better on oily skin' },
  { title: 'Those who fill in brows daily', description: 'Replicate your makeup routine permanently' },
  { title: 'Anyone wanting defined brows', description: 'More polished, makeup-like finish' },
  { title: 'Active lifestyles', description: 'Smudge-proof through any activity' },
  { title: 'Mature skin', description: 'Soft shading works beautifully on all skin textures' },
];

export default function OmbreBrowsPage() {
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
                <span className="text-white">Ombre Powder Brows</span>
              </nav>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Ombre Powder Brows in Raleigh, NC
              </h1>
              <p className="text-lg md:text-xl mb-6 text-white/90">
                Soft, natural gradient effect that gives you perfectly polished brows every day
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

        {/* What are Ombre Brows */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#AD6269]">
                  What are Ombre Powder Brows?
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  Ombre powder brows create a soft, powdered makeup look that is always perfectly applied. This technique uses a specialized machine to deposit pigment in a gradient pattern.
                </p>
                <p className="text-muted-foreground mb-4">
                  The result is lighter at the front of the brow (near the nose) and gradually darker toward the tail, creating a beautiful, natural-looking dimension that frames your face perfectly.
                </p>
                <p className="text-muted-foreground">
                  At A Pretty Girl Matter in Raleigh, NC, Victoria customizes the intensity and gradient to match your desired look - from a subtle, natural enhancement to a more defined, makeup-like finish.
                </p>
              </div>
              <div className="relative h-80 md:h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg overflow-hidden">
                <Image
                  src="/images/services/OMBRE.png"
                  alt="Ombre Powder Brows"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 md:py-16 bg-[#AD6269]/10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#AD6269]">
              Benefits of Ombre Powder Brows
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

        {/* Who It is For */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 h-80 md:h-96 bg-gradient-to-br from-[#AD6269]/20 to-[#8B4A52]/20 rounded-2xl shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <UserCheck className="w-20 h-20 text-[#AD6269] mx-auto mb-4" />
                  <p className="font-bold text-[#AD6269]">Perfect for All Skin Types</p>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#AD6269]">
                  Who are Ombre Brows Best For?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Ombre powder brows are incredibly versatile and work beautifully for almost everyone. They are especially ideal for:
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
        <section className="py-12 md:py-16 bg-[#AD6269]/10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#AD6269]">
              Frequently Asked Questions About Ombre Brows
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
                Ready for Perfect, Powdered Brows?
              </h2>
              <p className="text-lg mb-6 text-white/90">
                Book your free consultation today and discover how ombre powder brows can give you beautiful, low-maintenance brows.
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
