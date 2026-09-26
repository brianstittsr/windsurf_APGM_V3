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
  title: "The Pretty Girl Preview * In Person Consultation in Raleigh, NC",
  description: "A personalized consultation designed to help you discover the permanent makeup look that fits you best. We’ll talk through your goals, review your natural features, discuss shape and color options, and create a customized plan for your brows, lips, or eyeliner.\n\nThink of it as your first look at what’s possible before your Pretty Girl transformation begins.",
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services/the-pretty-girl-preview-in-person-consultation',
  },
  openGraph: {
    title: "The Pretty Girl Preview * In Person Consultation in Raleigh, NC",
    description: "A personalized consultation designed to help you discover the permanent makeup look that fits you best. We’ll talk through your goals, review your natural features, discuss shape and color options, and create a customized plan for your brows, lips, or eyeliner.\n\nThink of it as your first look at what’s possible before your Pretty Girl transformation begins.",
    url: 'https://www.aprettygirlmatter.com/services/the-pretty-girl-preview-in-person-consultation',
    type: 'website',
  },
};

const faqs = [
    { question: "Is the consultation free?", answer: "Consultation details, including any fees, will be confirmed when you book." },
    { question: "Can I book my procedure the same day?", answer: "Procedures are typically scheduled after the consultation to allow proper planning." },
];

const benefits = [
    { icon: Clock, title: "Personalized Plan", description: "Get recommendations based on your features and goals." },
    { icon: Clock, title: "Ask Questions", description: "Learn about techniques, healing, and aftercare." },
    { icon: Clock, title: "Shape Preview", description: "See a preview of your potential brow or lip design." },
    { icon: Clock, title: "No Pressure", description: "Take time to decide on the right service for you." },
];

const candidates = [
    { title: "New clients", description: "Perfect for anyone considering permanent makeup for the first time." },
    { title: "Unsure which service", description: "Compare options with professional guidance." },
    { title: "Existing clients", description: "Plan touch-ups, corrections, or new services." },
];

const processSteps = [
    { number: "1", title: "Book", description: "Choose a convenient time for your consultation." },
    { number: "2", title: "Discuss Goals", description: "Share what you want to achieve with Victoria." },
    { number: "3", title: "Design Preview", description: "See a rough sketch or color recommendation." },
    { number: "4", title: "Plan", description: "Schedule your procedure if you decide to move forward." },
];

const aftercareSections = [

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
                <span className="text-white">{"The Pretty Girl Preview * In Person Consultation"}</span>
              </nav>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {"The Pretty Girl Preview * In Person Consultation in Raleigh, NC"}
              </h1>
              <p className="text-lg md:text-xl mb-6 text-white/90 max-w-2xl mx-auto">
                {"Discuss your goals, explore options, and design a plan tailored to you."}
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
                  What is {"The Pretty Girl Preview * In Person Consultation"}?
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  {"A personalized consultation designed to help you discover the permanent makeup look that fits you best. We’ll talk through your goals, review your natural features, discuss shape and color options, and create a customized plan for your brows, lips, or eyeliner.\n\nThink of it as your first look at what’s possible before your Pretty Girl transformation begins."}
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-md capitalize">
                    <Sparkles className="w-4 h-4" />
                    eyebrows
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-md">
                    <Clock className="w-4 h-4" />
                    {"30 minutes"}
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
                  alt="The Pretty Girl Preview * In Person Consultation"
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
              Benefits of {"The Pretty Girl Preview * In Person Consultation"}
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
                  Who is {"The Pretty Girl Preview * In Person Consultation"} Best For?
                </h2>
                <p className="text-muted-foreground mb-6">
                  {"The Pretty Girl Preview * In Person Consultation is an excellent choice for many clients. It is particularly beneficial for:"}
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
              The {"The Pretty Girl Preview * In Person Consultation"} Process
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

        

        {/* FAQ Section */}
        <section className="py-12 md:py-16 bg-[#AD6269]/10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#AD6269]">
              Frequently Asked Questions About {"The Pretty Girl Preview * In Person Consultation"}
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
                {"Book Your Consultation Today"}
              </h2>
              <p className="text-lg mb-6 text-white/90">
                {"Take the first step toward effortless, beautiful permanent makeup."}
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
