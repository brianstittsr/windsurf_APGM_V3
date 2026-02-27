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
  Palette,
  Maximize2,
  Heart,
  Ban,
  Scale,
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
  title: 'Lip Blushing Raleigh NC | Natural Lip Tattoo',
  description: 'Professional lip blushing in Raleigh, NC. Enhance lip color & definition naturally. Certified artist with advanced training. Free consultation available!',
  keywords: ['lip blushing Raleigh', 'lip tattoo Raleigh NC', 'permanent lip color', 'lip enhancement Raleigh', 'PMU lips'],
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services/lip-blushing',
  },
};

const faqs = [
  {
    question: 'What is lip blushing?',
    answer: 'Lip blushing is a permanent cosmetic tattoo that enhances the natural color and shape of your lips. It deposits pigment into the lips to create a more defined, youthful appearance with a subtle tint of color.',
  },
  {
    question: 'How long does lip blushing last?',
    answer: 'Lip blushing typically lasts 2-5 years depending on your lifestyle, sun exposure, and how your body metabolizes the pigment. Touch-ups are recommended every 1-2 years to maintain optimal color.',
  },
  {
    question: 'Does lip blushing hurt?',
    answer: 'The lips are a sensitive area, but we use a strong topical numbing cream to minimize discomfort. Most clients describe the sensation as a slight vibration or tingling. The numbing is reapplied throughout the procedure.',
  },
  {
    question: 'What is the healing process like?',
    answer: 'Lips will be swollen for 1-3 days and appear very bright initially. Over the next 4-6 weeks, the color will fade by 30-50% and the true color will emerge. Some peeling and dryness is normal during healing.',
  },
  {
    question: 'Can lip blushing cover dark lips?',
    answer: 'Yes! Lip blushing can help neutralize and brighten naturally dark or uneven lip color. We use color correction techniques to achieve a more uniform, beautiful lip tone.',
  },
];

const benefits = [
  {
    icon: Palette,
    title: 'Enhanced Natural Color',
    description: 'Add a beautiful, natural-looking tint to your lips that lasts for years.',
  },
  {
    icon: Maximize2,
    title: 'Defined Shape',
    description: 'Create more defined lip borders and correct asymmetry for a balanced look.',
  },
  {
    icon: Heart,
    title: 'Fuller Appearance',
    description: 'Create the illusion of fuller, more youthful lips without fillers.',
  },
  {
    icon: Ban,
    title: 'No More Lipstick',
    description: 'Wake up with beautiful lip color - no need for daily lipstick application.',
  },
  {
    icon: Scale,
    title: 'Color Correction',
    description: 'Even out uneven lip color or neutralize dark pigmentation.',
  },
  {
    icon: Clock,
    title: 'Long-Lasting',
    description: 'Results last 2-5 years with proper care and occasional touch-ups.',
  },
];

const candidates = [
  { title: 'Pale or uneven lip color', description: 'Add a healthy, natural-looking tint' },
  { title: 'Undefined lip borders', description: 'Create more defined, symmetrical lips' },
  { title: 'Busy lifestyles', description: 'Skip the daily lipstick routine' },
  { title: 'Active women', description: 'Perfect for gym-goers and outdoor enthusiasts' },
  { title: 'Anyone wanting a natural enhancement', description: '"Your lips but better"' },
];

export default function LipBlushingPage() {
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
                <span className="text-white">Lip Blushing</span>
              </nav>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Lip Blushing in Raleigh, NC
              </h1>
              <p className="text-lg md:text-xl mb-6 text-white/90">
                Enhance your natural lip color and definition with beautiful, long-lasting results
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

        {/* What is Lip Blushing */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#AD6269]">
                  What is Lip Blushing?
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  Lip blushing is a permanent cosmetic tattoo that enhances your natural lip color, defines your lip shape, and creates the appearance of fuller, more youthful lips.
                </p>
                <p className="text-muted-foreground mb-4">
                  This technique deposits pigment into the lips using a specialized machine, creating a soft, natural-looking tint. Unlike traditional lip tattoos, lip blushing creates a subtle, "your lips but better" effect that enhances rather than overpowers your natural beauty.
                </p>
                <p className="text-muted-foreground">
                  At A Pretty Girl Matter in Raleigh, NC, Victoria specializes in creating customized lip colors that complement your skin tone and personal style. Whether you want a subtle nude enhancement or a more vibrant color, we can achieve your perfect look.
                </p>
              </div>
              <div className="h-80 md:h-96 bg-gradient-to-br from-[#AD6269]/20 to-[#8B4A52]/20 rounded-2xl shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <Heart className="w-20 h-20 text-[#AD6269] mx-auto mb-4" />
                  <p className="font-bold text-[#AD6269]">Before & After Gallery</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 md:py-16 bg-[#AD6269]/10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#AD6269]">
              Benefits of Lip Blushing
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
                  <p className="font-bold text-[#AD6269]">Perfect for Everyone</p>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#AD6269]">
                  Who is Lip Blushing For?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Lip blushing is perfect for anyone looking to enhance their natural lip color and shape. It is especially beneficial for:
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
              Frequently Asked Questions About Lip Blushing
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
                Ready for Beautiful, Natural-Looking Lips?
              </h2>
              <p className="text-lg mb-6 text-white/90">
                Book your free consultation today and discover how lip blushing can enhance your natural beauty.
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
              <Link href="/services/permanent-eyeliner" className="group">
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Eye className="w-8 h-8 text-[#AD6269] mx-auto mb-3" />
                    <h3 className="font-bold text-foreground group-hover:text-[#AD6269] transition-colors">Permanent Eyeliner</h3>
                    <p className="text-sm text-muted-foreground">Define your eyes beautifully</p>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/services/microblading" className="group">
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Sparkles className="w-8 h-8 text-[#AD6269] mx-auto mb-3" />
                    <h3 className="font-bold text-foreground group-hover:text-[#AD6269] transition-colors">Microblading</h3>
                    <p className="text-sm text-muted-foreground">Natural eyebrow enhancement</p>
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
