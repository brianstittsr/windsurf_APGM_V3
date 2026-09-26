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
  title: "Nano Brows in Raleigh, NC",
  description: "A soft, natural-looking brow created with ultra-fine machine hairstrokes that mimic the look of real brow hair. Nano Brows are customized to your natural growth pattern, face shape, and desired fullness for a beautifully defined result that still looks effortless.\n\nPerfect for clients who want realistic hairstrokes, added fullness, and a polished brow without the look of heavy makeup.",
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services/pretty-little-strokes-nano-brows',
  },
  openGraph: {
    title: "Nano Brows in Raleigh, NC",
    description: "A soft, natural-looking brow created with ultra-fine machine hairstrokes that mimic the look of real brow hair. Nano Brows are customized to your natural growth pattern, face shape, and desired fullness for a beautifully defined result that still looks effortless.\n\nPerfect for clients who want realistic hairstrokes, added fullness, and a polished brow without the look of heavy makeup.",
    url: 'https://www.aprettygirlmatter.com/services/pretty-little-strokes-nano-brows',
    type: 'website',
  },
};

const faqs = [
    { question: "Are nano brows the same as microblading?", answer: "Similar in look, but nano brows use a machine instead of a hand tool, often causing less skin trauma." },
    { question: "How long do nano brows last?", answer: "Results typically last 1-3 years depending on skin type and aftercare." },
    { question: "Is nano brow painful?", answer: "A topical numbing cream is used to keep you comfortable during the procedure." },];

const benefits = [
    { icon: Clock, title: "Precise Hair Strokes", description: "Machine work creates crisp, fine strokes that mimic natural brow hairs." },
    { icon: Clock, title: "Less Trauma", description: "Nano brows are gentle on the skin compared to microblading." },
    { icon: Clock, title: "Great for Sensitive Skin", description: "A good option for clients who may not be candidates for microblading." },
    { icon: Clock, title: "Natural Finish", description: "Achieve realistic brows with soft definition." },
    { icon: Clock, title: "Custom Design", description: "Each stroke is placed to enhance your natural brow pattern." },
    { icon: Clock, title: "Long-Lasting", description: "Enjoy results that typically last 1-3 years." },];

const candidates = [
    { title: "Thin or sparse brows", description: "Rebuild the appearance of fuller brows." },
    { title: "Sensitive or oily skin", description: "Nano brows can be a gentler alternative." },
    { title: "Alopecia or hair loss", description: "Restore natural-looking brow hairs." },
    { title: "Clients wanting realism", description: "Hair-stroke results without the hand tool." },];

const processSteps = [
    { number: "1", title: "Consultation", description: "We review your goals and determine if nano brows are right for you." },
    { number: "2", title: "Brow Design", description: "Your brows are mapped for symmetry and shape." },
    { number: "3", title: "Nano Strokes", description: "Fine hair-like strokes are implanted with a PMU machine." },
    { number: "4", title: "Healing & Touch-Up", description: "A follow-up perfects color and definition after healing." },];

const aftercareSections = [
    { title: "First 2 Weeks", items: ["Keep brows dry - avoid water, sweat, and steam", "Apply healing ointment as directed", "Don't pick or scratch flaking skin", "Avoid makeup on the brow area", "Sleep on your back to avoid rubbing"] },
    { title: "Weeks 2-6", items: ["Brows may appear lighter - this is normal", "Color will gradually return as skin heals", "Avoid sun exposure and tanning", "Schedule your touch-up appointment"] },];

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
                <span className="text-white">Pretty Little Strokes * Nano Brows</span>
              </nav>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Nano Brows in Raleigh, NC
              </h1>
              <p className="text-lg md:text-xl mb-6 text-white/90 max-w-2xl mx-auto">
                Ultra-fine, hair-like strokes created with a machine for crisp, natural brows.
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
                  What is Pretty Little Strokes * Nano Brows?
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  A soft, natural-looking brow created with ultra-fine machine hairstrokes that mimic the look of real brow hair. Nano Brows are customized to your natural growth pattern, face shape, and desired fullness for a beautifully defined result that still looks effortless.

Perfect for clients who want realistic hairstrokes, added fullness, and a polished brow without the look of heavy makeup.
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-md capitalize">
                    <Sparkles className="w-4 h-4" />
                    eyebrows
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-md">
                    <Clock className="w-4 h-4" />
                    4
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
                  alt="Pretty Little Strokes * Nano Brows"
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
              Benefits of Pretty Little Strokes * Nano Brows
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
                  Who is Pretty Little Strokes * Nano Brows Best For?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Pretty Little Strokes * Nano Brows is an excellent choice for many clients. It is particularly beneficial for:
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
              The Pretty Little Strokes * Nano Brows Process
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
                Pretty Little Strokes * Nano Brows Aftercare
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
              Frequently Asked Questions About Pretty Little Strokes * Nano Brows
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
                Get Natural-Looking Nano Brows
              </h2>
              <p className="text-lg mb-6 text-white/90">
                Schedule your consultation to see if nano brows are the perfect fit.
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
