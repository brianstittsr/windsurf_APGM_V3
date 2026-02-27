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
  Eye,
  Droplets,
  Clock,
  Sun,
  Palette,
  CheckCircle,
  CalendarPlus,
  Phone,
  MapPin,
  Sparkles,
  UserCheck,
  ChevronRight,
  Heart,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Permanent Eyeliner Raleigh NC | Lash Line Enhancement',
  description: 'Permanent eyeliner in Raleigh, NC. Wake up with defined eyes every day. Expert application, natural results. Book your free consultation!',
  keywords: ['permanent eyeliner Raleigh', 'eyeliner tattoo Raleigh NC', 'lash line enhancement', 'cosmetic eyeliner tattoo', 'PMU eyeliner'],
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services/permanent-eyeliner',
  },
};

const faqs = [
  {
    question: 'What is permanent eyeliner?',
    answer: 'Permanent eyeliner is a cosmetic tattoo that deposits pigment along the lash line to create the appearance of fuller lashes and defined eyes. It can range from a subtle lash enhancement to a more dramatic winged liner look.',
  },
  {
    question: 'How long does permanent eyeliner last?',
    answer: 'Permanent eyeliner typically lasts 2-5 years depending on your skin type, lifestyle, and sun exposure. The color may fade over time, and touch-ups are recommended every 1-2 years to maintain the best results.',
  },
  {
    question: 'Does permanent eyeliner hurt?',
    answer: 'The eye area is sensitive, but we use a strong topical numbing cream to minimize discomfort. Most clients describe it as a slight vibration or tickling sensation. The numbing is reapplied throughout the procedure.',
  },
  {
    question: 'What styles of permanent eyeliner are available?',
    answer: 'We offer several styles: Lash Line Enhancement (subtle, natural look), Classic Eyeliner (thin to medium line), and Winged Eyeliner (dramatic cat-eye effect). During your consultation, we will help you choose the best style for your eye shape and preferences.',
  },
  {
    question: 'What is the healing process like?',
    answer: 'Expect some swelling for 1-3 days. The color will appear darker initially and lighten by 30-50% as it heals over 4-6 weeks. Avoid rubbing your eyes, wearing eye makeup, and getting the area wet during the first week.',
  },
];

const benefits = [
  {
    icon: Eye,
    title: 'Wake Up Beautiful',
    description: 'Start every day with perfectly defined eyes - no morning makeup routine needed.',
  },
  {
    icon: Droplets,
    title: 'Waterproof & Smudge-Proof',
    description: 'Your eyeliner stays perfect through workouts, swimming, tears, and rain.',
  },
  {
    icon: Clock,
    title: 'Save Time Daily',
    description: 'Skip the daily eyeliner application and touch-ups throughout the day.',
  },
  {
    icon: Sun,
    title: 'Long-Lasting Results',
    description: 'Enjoy beautiful eyeliner for 2-5 years with proper care.',
  },
  {
    icon: Palette,
    title: 'Customizable Styles',
    description: 'From subtle lash enhancement to dramatic wings - choose your perfect look.',
  },
  {
    icon: CheckCircle,
    title: 'Great for All Ages',
    description: 'Perfect for anyone wanting to enhance their eyes and simplify their routine.',
  },
];

const styles = [
  { title: 'Lash Line Enhancement', description: 'Subtle, natural-looking definition along the lash line' },
  { title: 'Classic Eyeliner', description: 'Thin to medium line for everyday elegance' },
  { title: 'Winged Eyeliner', description: 'Dramatic cat-eye effect for bold beauty' },
  { title: 'Double Eyeliner', description: 'Both upper and lower lash lines for maximum definition' },
];

export default function PermanentEyelinerPage() {
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
                <span className="text-white">Permanent Eyeliner</span>
              </nav>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Permanent Eyeliner in Raleigh, NC
              </h1>
              <p className="text-lg md:text-xl mb-6 text-white/90">
                Wake up with perfectly defined eyes every day
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

        {/* What is Permanent Eyeliner */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#AD6269]">
                  What is Permanent Eyeliner?
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  Permanent eyeliner is a cosmetic tattoo technique that deposits pigment along your lash line to create the appearance of fuller lashes and beautifully defined eyes.
                </p>
                <p className="text-muted-foreground mb-4">
                  Whether you prefer a subtle, natural enhancement that simply makes your lashes look thicker, or a more dramatic winged liner effect, permanent eyeliner can be customized to match your style and eye shape.
                </p>
                <p className="text-muted-foreground">
                  At A Pretty Girl Matter in Raleigh, NC, Victoria uses precise techniques to create eyeliner that enhances your natural beauty while looking completely authentic.
                </p>
              </div>
              <div className="h-80 md:h-96 bg-gradient-to-br from-[#AD6269]/20 to-[#8B4A52]/20 rounded-2xl shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <Eye className="w-20 h-20 text-[#AD6269] mx-auto mb-4" />
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
              Benefits of Permanent Eyeliner
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

        {/* Available Styles */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 h-80 md:h-96 bg-gradient-to-br from-[#AD6269]/20 to-[#8B4A52]/20 rounded-2xl shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-20 h-20 text-[#AD6269] mx-auto mb-4" />
                  <p className="font-bold text-[#AD6269]">Customized for You</p>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#AD6269]">
                  Available Eyeliner Styles
                </h2>
                <p className="text-muted-foreground mb-6">
                  We offer several styles to match your preferences and eye shape. During your consultation, we will help you choose the perfect look:
                </p>
                <ul className="space-y-4">
                  {styles.map((style, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#AD6269] mt-0.5 shrink-0" />
                      <span>
                        <strong>{style.title}</strong> — {style.description}
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
              Frequently Asked Questions About Permanent Eyeliner
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
                Ready to Wake Up with Perfect Eyes?
              </h2>
              <p className="text-lg mb-6 text-white/90">
                Book your free consultation today and discover how permanent eyeliner can simplify your morning routine and enhance your natural beauty.
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
              <Link href="/services/lip-blushing" className="group">
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Heart className="w-8 h-8 text-[#AD6269] mx-auto mb-3" />
                    <h3 className="font-bold text-foreground group-hover:text-[#AD6269] transition-colors">Lip Blushing</h3>
                    <p className="text-sm text-muted-foreground">Enhance your natural lip color</p>
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
