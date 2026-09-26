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
  CalendarPlus,
  MapPin,
  CheckCircle,
  Sparkles,
  UserCheck,
  ChevronRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: "Powder Brows in Raleigh, NC",
  description: "A soft, beautifully shaded brow designed to create the look of perfectly filled-in makeup without the daily effort. Powder Brows use a gentle pixelated shading technique to add definition, balance, and fullness while still keeping the overall look soft and polished.\n\nThis service can be customized from light and natural to more defined and glamorous, making it a great choice for clients who love a clean, finished brow.\n\nSoftly shaded. Beautifully defined. Pretty from morning to night.",
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services/pretty-in-powder-powder-brows',
  },
  openGraph: {
    title: "Powder Brows in Raleigh, NC",
    description: "A soft, beautifully shaded brow designed to create the look of perfectly filled-in makeup without the daily effort. Powder Brows use a gentle pixelated shading technique to add definition, balance, and fullness while still keeping the overall look soft and polished.\n\nThis service can be customized from light and natural to more defined and glamorous, making it a great choice for clients who love a clean, finished brow.\n\nSoftly shaded. Beautifully defined. Pretty from morning to night.",
    url: 'https://www.aprettygirlmatter.com/services/pretty-in-powder-powder-brows',
    type: 'website',
  },
};

const faqs = [
    { question: "How long do powder brows last?", answer: "Powder brows typically last 2-3 years, depending on skin type and lifestyle." },
    { question: "Do powder brows look natural?", answer: "Yes. The shading can be kept soft and natural or built up for a more defined look." },
    { question: "What is the healing time?", answer: "Surface healing takes about 7-14 days, with full color settling over 6 weeks." },
    { question: "Can I get powder brows if I have oily skin?", answer: "Absolutely. Powder brows are an excellent option for oily and combination skin." },
];

const benefits = [
    { icon: Clock, title: "Soft & Defined", description: "Achieve a filled-in brow look that resembles brow powder or pomade." },
    { icon: Clock, title: "Long-Lasting", description: "Enjoy beautifully shaded brows for 2-3 years with proper care." },
    { icon: Clock, title: "Great for All Skin Types", description: "Powder brows work beautifully on normal, oily, and mature skin." },
    { icon: Clock, title: "Custom Color", description: "Pigment is custom-blended to flatter your hair color and complexion." },
    { icon: Clock, title: "Low Maintenance", description: "Wake up with polished brows every day without makeup." },
    { icon: Clock, title: "Buildable Coverage", description: "Choose a soft tint or a bolder, more dramatic finish." },
];

const candidates = [
    { title: "Oily skin types", description: "Powder brows hold better than hair-stroke methods on oily skin." },
    { title: "Sparse or uneven brows", description: "Add shape, symmetry, and fullness." },
    { title: "Makeup lovers", description: "Keep that freshly filled-in brow look 24/7." },
    { title: "Active lifestyles", description: "Sweat, swim, and shower without losing your brows." },
    { title: "Anyone wanting a soft gradient", description: "The ombré-style front is lighter and fades toward the tail." },
];

const processSteps = [
    { number: "1", title: "Consultation", description: "We discuss your desired shape, color, and overall brow goals." },
    { number: "2", title: "Mapping", description: "Your ideal brow shape is mapped to complement your features." },
    { number: "3", title: "Shading", description: "Pigment is softly shaded into the skin with a PMU machine." },
    { number: "4", title: "Touch-Up", description: "A perfecting session 6-8 weeks later locks in the color and shape." },
];

const aftercareSections = [
    { title: "First 2 Weeks", items: ["Keep brows dry - avoid water, sweat, and steam", "Apply healing ointment as directed", "Don't pick or scratch flaking skin", "Avoid makeup on the brow area", "Sleep on your back to avoid rubbing"] },
    { title: "Weeks 2-6", items: ["Brows may appear lighter - this is normal", "Color will gradually return as skin heals", "Avoid sun exposure and tanning", "Schedule your touch-up appointment"] },
];

export default function ServicePage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-[#AD6269] to-[#8B4A52] text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <nav className="flex justify-center items-center gap-2 text-sm text-white/70 mb-6">
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                <ChevronRight className="w-4 h-4" />
                <Link href="/services" className="hover:text-white transition-colors">Services</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">{"Pretty in Powder * Powder Brows"}</span>
              </nav>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {"Powder Brows in Raleigh, NC"}
              </h1>
              <p className="text-lg md:text-xl mb-6 text-white/90 max-w-2xl mx-auto">
                {"Soft, shaded brows with a powdered makeup effect that lasts."}
              </p>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-full px-8 bg-white text-[#AD6269] hover:bg-white/90"
              >
                <a href="https://link.socaldigitalstudio.com/widget/form/wxQMl8ZFz9MiWtrKYlnP" target="_blank" rel="noopener noreferrer">
                  <CalendarPlus className="w-5 h-5 mr-2" />
                  Book Free Consultation
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* What is This Service */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#AD6269]">
                  What is {"Pretty in Powder * Powder Brows"}?
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  {"A soft, beautifully shaded brow designed to create the look of perfectly filled-in makeup without the daily effort. Powder Brows use a gentle pixelated shading technique to add definition, balance, and fullness while still keeping the overall look soft and polished.\n\nThis service can be customized from light and natural to more defined and glamorous, making it a great choice for clients who love a clean, finished brow.\n\nSoftly shaded. Beautifully defined. Pretty from morning to night."}
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-md capitalize">
                    <Sparkles className="w-4 h-4" />
                    eyebrows
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-md">
                    <Clock className="w-4 h-4" />
                    {"2-3 hours"}
                  </span>
                  
                </div>
                <Button
                  asChild
                  className="rounded-full px-8 bg-gradient-to-r from-[#AD6269] to-[#8B4A52] text-white hover:opacity-90"
                >
                  <a href="https://link.socaldigitalstudio.com/widget/form/wxQMl8ZFz9MiWtrKYlnP" target="_blank" rel="noopener noreferrer">
                    <CalendarPlus className="w-5 h-5 mr-2" />
                    Your Pretty Girl Matter Consultation Starts Here
                  </a>
                </Button>
              </div>
              <div className="relative h-80 md:h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg overflow-hidden">
                <Image
                  src="/images/APGM-icon.png"
                  alt="Pretty in Powder * Powder Brows"
                  fill
                  className="object-contain p-6"
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
              Benefits of {"Pretty in Powder * Powder Brows"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
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
                  Who is {"Pretty in Powder * Powder Brows"} Best For?
                </h2>
                <p className="text-muted-foreground mb-6">
                  {"Pretty in Powder * Powder Brows is an excellent choice for many clients. It is particularly beneficial for:"}
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
              The {"Pretty in Powder * Powder Brows"} Process
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
                {"Pretty in Powder * Powder Brows Aftercare"}
              </h2>
              <p className="text-center text-muted-foreground mb-8">
                Proper aftercare is essential for achieving the best results.
              </p>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {aftercareSections.map((section, index) => (
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

        {/* FAQ Section */}
        <section className="py-12 md:py-16 bg-[#AD6269]/10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#AD6269]">
              Frequently Asked Questions About {"Pretty in Powder * Powder Brows"}
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
                {"Ready for Soft, Beautiful Brows?"}
              </h2>
              <p className="text-lg mb-6 text-white/90">
                {"Book your free consultation and discover if powder brows are right for you."}
              </p>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-full px-8 bg-white text-[#AD6269] hover:bg-white/90"
              >
                <a href="https://link.socaldigitalstudio.com/widget/form/wxQMl8ZFz9MiWtrKYlnP" target="_blank" rel="noopener noreferrer">
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
