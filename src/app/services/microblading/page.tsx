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
  Clock,
  Leaf,
  Droplets,
  Smile,
  Palette,
  RefreshCw,
  CheckCircle,
  CalendarPlus,
  Phone,
  MapPin,
  Eye,
  UserCheck,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Microblading Raleigh NC | Natural Eyebrow Tattoo',
  description: 'Expert microblading in Raleigh, NC. Natural-looking eyebrow enhancement with certified artist Victoria. View before/after photos. Book free consultation!',
  keywords: ['microblading Raleigh', 'eyebrow tattoo Raleigh NC', 'microblading near me', 'natural eyebrow enhancement', 'PMU artist Raleigh'],
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services/microblading',
  },
  openGraph: {
    title: 'Microblading Raleigh NC | Natural Eyebrow Tattoo | A Pretty Girl Matter',
    description: 'Expert microblading in Raleigh, NC. Natural-looking eyebrow enhancement with certified artist Victoria.',
    url: 'https://www.aprettygirlmatter.com/services/microblading',
    type: 'website',
  },
};

const faqs = [
  {
    question: 'How much does microblading cost in Raleigh?',
    answer: 'Microblading prices in Raleigh typically range from $400-$800 depending on the artist\'s experience and technique. At A Pretty Girl Matter, we offer competitive pricing with financing options available. Contact us for current pricing and special offers.',
  },
  {
    question: 'Does microblading hurt?',
    answer: 'Most clients describe microblading as mildly uncomfortable rather than painful. We apply a topical numbing cream before and during the procedure to minimize discomfort. Many clients are surprised at how comfortable the experience is!',
  },
  {
    question: 'How long does microblading last?',
    answer: 'Microblading typically lasts 1-3 years depending on your skin type, lifestyle, and aftercare. Oily skin types may experience faster fading. Annual touch-ups are recommended to maintain optimal results.',
  },
  {
    question: 'What is the healing process like?',
    answer: 'The healing process takes 4-6 weeks. Your brows will appear darker initially, then lighten as they heal. Some flaking and itching is normal. Following proper aftercare instructions is crucial for best results.',
  },
  {
    question: 'Am I a good candidate for microblading?',
    answer: 'Microblading is ideal for those with sparse, thin, or over-plucked brows. However, it may not be suitable for those with very oily skin, certain medical conditions, or those who are pregnant or breastfeeding. A consultation will determine if you\'re a good candidate.',
  },
  {
    question: 'What\'s the difference between microblading and ombr\u00e9 brows?',
    answer: 'Microblading creates individual hair-like strokes for a natural look, while ombr\u00e9 brows use a shading technique for a soft, powdered makeup effect. Microblading is best for normal to dry skin, while ombr\u00e9 works well for all skin types including oily skin.',
  },
];

const benefits = [
  {
    icon: Clock,
    title: 'Save Time Daily',
    description: 'Wake up with perfect brows every day. No more spending time filling in your eyebrows each morning.',
  },
  {
    icon: Leaf,
    title: 'Natural Results',
    description: 'Hair-like strokes create incredibly realistic brows that look natural, not drawn on.',
  },
  {
    icon: Droplets,
    title: 'Sweat & Water Proof',
    description: 'Your brows stay perfect through workouts, swimming, and any weather conditions.',
  },
  {
    icon: Smile,
    title: 'Boost Confidence',
    description: 'Feel confident and put-together at all times, whether at the gym or a special event.',
  },
  {
    icon: Palette,
    title: 'Customized Color',
    description: 'Pigment is custom-mixed to match your natural hair color and skin tone perfectly.',
  },
  {
    icon: RefreshCw,
    title: 'Long-Lasting',
    description: 'Results last 1-3 years, allowing you to adjust your look as trends change.',
  },
];

const candidates = [
  { title: 'Sparse or thin brows', description: 'Add fullness and definition to naturally thin eyebrows' },
  { title: 'Over-plucked brows', description: 'Restore brows that have been over-tweezed or waxed' },
  { title: 'Alopecia or hair loss', description: 'Create natural-looking brows for those with hair loss conditions' },
  { title: 'Busy professionals', description: 'Save time on daily makeup routines' },
  { title: 'Active lifestyles', description: 'Perfect for athletes and fitness enthusiasts' },
  { title: 'Normal to dry skin', description: 'Microblading works best on these skin types' },
];

const processSteps = [
  { number: '1', title: 'Consultation', description: 'We discuss your goals, assess your skin type, and design your perfect brow shape.' },
  { number: '2', title: 'Numbing', description: 'A topical anesthetic is applied to ensure your comfort throughout the procedure.' },
  { number: '3', title: 'Microblading', description: 'Hair-like strokes are carefully created using a specialized hand tool and pigment.' },
  { number: '4', title: 'Touch-Up', description: 'A follow-up appointment 6-8 weeks later perfects your results.' },
];

export default function MicrobladingPage() {
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
                <span className="text-white">Microblading</span>
              </nav>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Professional Microblading in Raleigh, NC
              </h1>
              <p className="text-lg md:text-xl mb-6 text-white/90">
                Natural-looking eyebrow enhancement using fine hair-like strokes that mimic real brow hairs
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

        {/* What is Microblading */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#AD6269]">
                  What is Microblading?
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  Microblading is a permanent eyebrow tattooing technique that creates natural-looking, fuller brows using a handheld tool with ultra-fine needles.
                </p>
                <p className="text-muted-foreground mb-4">
                  Unlike traditional eyebrow tattoos, microblading deposits pigment into the upper layers of the skin, creating delicate, hair-like strokes that blend seamlessly with your natural brow hairs. The result is beautifully defined eyebrows that look completely natural.
                </p>
                <p className="text-muted-foreground">
                  At A Pretty Girl Matter in Raleigh, NC, Victoria uses advanced microblading techniques learned from top PMU academies to create customized brows that complement your unique facial features and personal style.
                </p>
              </div>
              <div className="relative h-80 md:h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg overflow-hidden">
                <Image
                  src="/images/services/STROKES.png"
                  alt="Microblading Before & After Gallery"
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
              Benefits of Microblading
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

        {/* Who It&apos;s For */}
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
                  Who is Microblading Best For?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Microblading is an excellent choice for many people looking to enhance their eyebrows. It&apos;s particularly beneficial for:
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

        {/* The Process */}
        <section className="py-12 md:py-16 bg-[#AD6269]/10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#AD6269]">
              The Microblading Process
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((step, index) => (
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

        {/* Aftercare */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-[#AD6269]">
                Microblading Aftercare
              </h2>
              <p className="text-center text-muted-foreground mb-8">
                Proper aftercare is essential for achieving the best results. Here&apos;s what to expect and how to care for your new brows:
              </p>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-bold mb-3">First 2 Weeks:</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Keep brows dry - avoid water, sweat, and steam</li>
                        <li>• Apply healing ointment as directed</li>
                        <li>• Don&apos;t pick or scratch flaking skin</li>
                        <li>• Avoid makeup on the brow area</li>
                        <li>• Sleep on your back to avoid rubbing</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-bold mb-3">Weeks 2-6:</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Brows may appear lighter - this is normal</li>
                        <li>• Color will gradually return as skin heals</li>
                        <li>• Avoid sun exposure and tanning</li>
                        <li>• Schedule your touch-up appointment</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 md:py-16 bg-[#AD6269]/10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#AD6269]">
              Frequently Asked Questions About Microblading
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
                Ready for Beautiful, Natural-Looking Brows?
              </h2>
              <p className="text-lg mb-6 text-white/90">
                Book your free consultation today and discover how microblading can transform your look and simplify your daily routine.
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
                Serving Raleigh, Cary, Durham, Chapel Hill &amp; Wake Forest, NC
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
              <Link href="/services/ombre-brows" className="group">
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Sparkles className="w-8 h-8 text-[#AD6269] mx-auto mb-3" />
                    <h3 className="font-bold text-foreground group-hover:text-[#AD6269] transition-colors">Ombré Powder Brows</h3>
                    <p className="text-sm text-muted-foreground">Soft, powdered makeup effect</p>
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
