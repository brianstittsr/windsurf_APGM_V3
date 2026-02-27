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
  Heart,
  Clock,
  Shield,
  CalendarPlus,
  Phone,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tiny Tattoos Raleigh NC | Small Decorative Tattoos',
  description: 'Tiny tattoos and cosmetic tattooing in Raleigh, NC. Small decorative tattoos and permanent makeup enhancements by certified artist Victoria.',
  keywords: [
    'tiny tattoos Raleigh NC',
    'small decorative tattoos Raleigh',
    'cosmetic tattooing Raleigh NC',
    'permanent makeup tiny tattoos',
    'mini tattoos Raleigh NC',
    'delicate tattooing Raleigh NC'
  ],
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services/tiny-tattoos'
  },
  openGraph: {
    title: 'Tiny Tattoos - A Pretty Girl Matter',
    description: 'Tiny tattoos and cosmetic tattooing services in Raleigh, NC. Small decorative tattoos by certified artist Victoria.',
    url: 'https://www.aprettygirlmatter.com/services/tiny-tattoos',
    type: 'website'
  }
};

const benefits = [
  {
    icon: Heart,
    title: 'Subtle Enhancement',
    description: 'Perfect for those wanting a natural, understated look that enhances your existing beauty without being too dramatic.',
  },
  {
    icon: Clock,
    title: 'Quick Process',
    description: 'Tiny tattoos take less time to complete, meaning shorter sessions and faster healing for most clients.',
  },
  {
    icon: Shield,
    title: 'Lower Commitment',
    description: 'Great option for first-timers or those wanting to test the waters before committing to larger designs.',
  },
];

const popularAreas = [
  'Behind the ear',
  'Wrist or ankle',
  'Collarbone area',
  'Inner arm',
  'Side of finger',
  'Small decorative elements',
];

const faqs = [
  {
    question: 'How long do tiny tattoos take to heal?',
    answer: 'Tiny tattoos typically heal faster than larger designs due to their size. Initial healing takes 7-14 days, with full healing completed in 4-6 weeks. Most clients can return to normal activities within 24-48 hours.',
  },
  {
    question: 'Are tiny tattoos painful?',
    answer: 'Pain levels vary by placement and individual tolerance. Most clients describe the sensation as similar to getting a regular tattoo but much quicker due to the smaller size. Topical numbing agents are available to minimize discomfort.',
  },
  {
    question: 'How do I care for my tiny tattoo during healing?',
    answer: 'Aftercare is crucial for proper healing. Keep the area clean and dry, avoid swimming and excessive sun exposure, and follow all provided aftercare instructions. Most tiny tattoos require minimal special care compared to larger designs.',
  },
  {
    question: 'Can I see examples of your work?',
    answer: 'Absolutely! During your consultation, Victoria will show you a portfolio of her tiny tattoo work and discuss design options that would work best for your vision and placement preferences.',
  },
];

export default function TinyTattoosPage() {
  return (
    <>
      <Header />
      <main className="pt-header min-h-screen flex flex-col">
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
                <span className="text-white">Tiny Tattoos</span>
              </nav>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Tiny <span className="text-white/90">Tattoos</span>
              </h1>
              <p className="text-lg md:text-xl mb-6 text-white/90">
                Delicate and beautiful tiny tattoos and cosmetic enhancements. 
                Perfect for those wanting subtle, elegant permanent makeup.
              </p>
            </div>
          </div>
        </section>

        {/* Service Overview */}
        <section className="py-12 md:py-16 flex-grow">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-12">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#AD6269] mb-4">
                    What Are Tiny Tattoos?
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Tiny tattoos are small, delicate designs that can be placed almost anywhere on the body. 
                    Our cosmetic tattooing services focus on enhancing your natural beauty with subtle, 
                    elegant permanent makeup that looks completely natural.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Perfect for first-time clients or those wanting a more conservative approach to 
                    permanent makeup. These small enhancements can make a big difference in your 
                    daily beauty routine.
                  </p>
                </div>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-[#AD6269] mb-4">Popular Tiny Tattoo Areas</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      {popularAreas.map((area, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#AD6269]" />
                          {area}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Benefits */}
              <div className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-[#AD6269] text-center mb-8">
                  Benefits of Tiny Tattoos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {benefits.map((benefit, index) => (
                    <Card key={index} className="h-full border-0 shadow-sm">
                      <CardContent className="p-6 text-center">
                        <div className="w-14 h-14 rounded-full bg-[#AD6269] text-white flex items-center justify-center mx-auto mb-4">
                          <benefit.icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                        <p className="text-muted-foreground text-sm">{benefit.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-[#AD6269] mb-4">
                  Investment
                </h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Pricing varies based on design complexity, placement, and size. 
                  Each tiny tattoo is custom-quoted during consultation.
                </p>
                <Card className="max-w-md mx-auto border-0 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-[#AD6269] mb-2">Starting At</h3>
                    <p className="text-4xl font-bold mb-2">$150</p>
                    <p className="text-muted-foreground text-sm">Consultation required for accurate pricing</p>
                  </CardContent>
                </Card>
              </div>

              {/* FAQ Section */}
              <div className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-[#AD6269] text-center mb-8">
                  Frequently Asked Questions
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

              {/* Call to Action */}
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-[#AD6269] mb-4">
                  Ready for Your Tiny Tattoo?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Schedule your consultation today to discuss your vision and create the perfect 
                  tiny tattoo design that reflects your personal style.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full px-8 bg-gradient-to-r from-[#AD6269] to-[#8B4A52] text-white hover:opacity-90"
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
                    className="rounded-full px-8 border-[#AD6269] text-[#AD6269] hover:bg-[#AD6269]/10"
                  >
                    <Link href="/contact">
                      <Phone className="w-5 h-5 mr-2" />
                      Call (919) 441-0932
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
