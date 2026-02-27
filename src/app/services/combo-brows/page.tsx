import { Metadata } from 'next';
import Link from 'next/link';
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
  Droplets,
  CalendarCheck,
  Feather,
  Paintbrush,
  SlidersHorizontal,
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
  title: 'Combo Brows Raleigh NC | Microblading + Powder Brows',
  description: 'Combo brows in Raleigh, NC - the best of microblading and powder brows combined. Natural hair strokes with soft shading. Book your consultation today!',
  keywords: ['combo brows Raleigh', 'combination brows Raleigh NC', 'microblading and shading', 'hybrid brows', 'PMU Raleigh'],
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services/combo-brows',
  },
};

const faqs = [
  {
    question: 'What are combo brows?',
    answer: 'Combo brows combine two techniques: microblading hair strokes at the front of the brow for a natural, feathered look, and powder shading through the body and tail for added depth and definition. This creates the most realistic, dimensional brow result.',
  },
  {
    question: 'How long do combo brows last?',
    answer: 'Combo brows typically last 1-3 years depending on your skin type and lifestyle. The powder shading portion tends to last longer than the microblading strokes. Touch-ups are recommended annually to maintain optimal results.',
  },
  {
    question: 'Are combo brows better than microblading alone?',
    answer: 'Combo brows are often considered the best option because they combine the natural hair-stroke look of microblading with the longevity and fullness of powder shading. They work well on all skin types, including oily skin where microblading alone may fade faster.',
  },
  {
    question: 'Who are combo brows best for?',
    answer: 'Combo brows are ideal for those who want the most natural-looking yet defined brows. They are especially great for those with oily skin, sparse brows, or anyone who wants fuller, more dimensional brows that last longer than microblading alone.',
  },
  {
    question: 'What is the healing process like?',
    answer: 'Healing takes 4-6 weeks. Your brows will appear darker initially and may go through a patchy phase as they heal. The true color and texture emerge after full healing. A touch-up appointment 6-8 weeks later perfects the results.',
  },
];

const howItWorks = [
  {
    number: '1',
    title: 'Microblading at the Front',
    description: 'Delicate hair strokes are created at the inner portion of the brow for a soft, natural, feathered start.',
  },
  {
    number: '2',
    title: 'Powder Shading in Body',
    description: 'Soft powder shading is applied through the body and tail, adding depth and a polished, filled-in look.',
  },
  {
    number: '3',
    title: 'Seamless Blend',
    description: 'The two techniques are expertly blended together for a seamless, natural, dimensional result.',
  },
];

const benefits = [
  {
    icon: Layers,
    title: 'Most Dimensional Look',
    description: 'Combines texture and depth for the most realistic, multidimensional brow result.',
  },
  {
    icon: Droplets,
    title: 'Works on All Skin Types',
    description: 'The powder shading component makes combo brows suitable for oily skin types too.',
  },
  {
    icon: CalendarCheck,
    title: 'Longer Lasting',
    description: 'The powder portion lasts longer than microblading alone, extending your results.',
  },
  {
    icon: Feather,
    title: 'Natural Front',
    description: 'Hair strokes at the front create a soft, natural start that mimics real brow hairs.',
  },
  {
    icon: Paintbrush,
    title: 'Fuller Appearance',
    description: 'The shading adds density and fullness that microblading alone cannot achieve.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Customizable',
    description: 'Adjust the ratio of strokes to shading based on your preferences and brow goals.',
  },
];

const candidates = [
  { title: 'Those who want the best of both', description: 'Natural strokes AND defined fullness' },
  { title: 'Oily skin types', description: 'The powder component holds up better on oily skin' },
  { title: 'Sparse or thin brows', description: 'Creates maximum fullness and definition' },
  { title: 'Those who fill in brows daily', description: 'Replicate your makeup look permanently' },
  { title: 'Anyone wanting long-lasting results', description: 'Combo brows tend to last longer' },
];

export default function ComboBrowsPage() {
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
                <span className="text-white">Combo Brows</span>
              </nav>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Combo Brows in Raleigh, NC
              </h1>
              <p className="text-lg md:text-xl mb-6 text-white/90">
                The best of both worlds - microblading strokes combined with powder shading for the most natural, dimensional brows
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

        {/* What are Combo Brows */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#AD6269]">
                  What are Combo Brows?
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  Combo brows (also called hybrid brows) combine the best features of microblading and ombre powder brows into one stunning technique.
                </p>
                <p className="text-muted-foreground mb-4">
                  The front of the brow features delicate microblading hair strokes for a soft, natural, feathered appearance. The body and tail of the brow are filled with powder shading, adding depth, dimension, and a polished finish.
                </p>
                <p className="text-muted-foreground">
                  This combination creates the most realistic, multidimensional brow result possible. At A Pretty Girl Matter in Raleigh, NC, Victoria expertly blends these techniques to create brows that look naturally full and beautifully defined.
                </p>
              </div>
              <div className="h-80 md:h-96 bg-gradient-to-br from-[#AD6269]/20 to-[#8B4A52]/20 rounded-2xl shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-20 h-20 text-[#AD6269] mx-auto mb-4" />
                  <p className="font-bold text-[#AD6269]">Before & After Gallery</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 md:py-16 bg-[#AD6269]/10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#AD6269]">
              How Combo Brows Work
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
              Benefits of Combo Brows
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

        {/* Who Should Get Combo Brows */}
        <section className="py-12 md:py-16 bg-[#AD6269]/10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 h-80 md:h-96 bg-gradient-to-br from-[#AD6269]/20 to-[#8B4A52]/20 rounded-2xl shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <UserCheck className="w-20 h-20 text-[#AD6269] mx-auto mb-4" />
                  <p className="font-bold text-[#AD6269]">The Gold Standard</p>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#AD6269]">
                  Who Should Get Combo Brows?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Combo brows are often considered the "gold standard" of permanent brows because they work for almost everyone. They are especially ideal for:
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
              Frequently Asked Questions About Combo Brows
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
                Ready for the Best Brows of Your Life?
              </h2>
              <p className="text-lg mb-6 text-white/90">
                Book your free consultation today and discover why combo brows are the most popular choice for natural, dimensional, long-lasting results.
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
              <Link href="/services/ombre-brows" className="group">
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Sparkles className="w-8 h-8 text-[#AD6269] mx-auto mb-3" />
                    <h3 className="font-bold text-foreground group-hover:text-[#AD6269] transition-colors">Ombre Powder Brows</h3>
                    <p className="text-sm text-muted-foreground">Soft powdered effect</p>
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
