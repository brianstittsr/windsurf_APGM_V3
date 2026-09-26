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
  title: "Full Face Edit in Raleigh, NC",
  description: "The Pretty Girl Face Edit — Signature Package Savings\n\nThe ultimate permanent makeup experience for the girl who wants the full edit. This signature package includes brows, Lip Blush, and Eyeliner Enhancement, all customized to work together to enhance your natural features and create a polished, balanced look.\n\nYour brows frame and define the face, Lip Blush adds soft customized color and definition, and Eyeliner Enhancement subtly defines the lash line for an effortless, finished look.\n\nReserve them together as The Pretty Girl Face Edit for package savings.\n\nPlease note: Perfecting Sessions are not included in this package and are booked separately at the applicable rate.\n\nBrows framed. Lips blushed. Eyes defined. The full Pretty Girl edit.",
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services/pretty-girl-full-face-edit-browslipseyeliner',
  },
  openGraph: {
    title: "Full Face Edit in Raleigh, NC",
    description: "The Pretty Girl Face Edit — Signature Package Savings\n\nThe ultimate permanent makeup experience for the girl who wants the full edit. This signature package includes brows, Lip Blush, and Eyeliner Enhancement, all customized to work together to enhance your natural features and create a polished, balanced look.\n\nYour brows frame and define the face, Lip Blush adds soft customized color and definition, and Eyeliner Enhancement subtly defines the lash line for an effortless, finished look.\n\nReserve them together as The Pretty Girl Face Edit for package savings.\n\nPlease note: Perfecting Sessions are not included in this package and are booked separately at the applicable rate.\n\nBrows framed. Lips blushed. Eyes defined. The full Pretty Girl edit.",
    url: 'https://www.aprettygirlmatter.com/services/pretty-girl-full-face-edit-browslipseyeliner',
    type: 'website',
  },
};

const faqs = [
    { question: "Can all features be done in one day?", answer: "Timing depends on the selected services; your plan will be customized during the consultation." },
    { question: "Is the full face package discounted?", answer: "Package pricing is available; details will be discussed during your consultation." },
];

const benefits = [
    { icon: Clock, title: "Complete Transformation", description: "Wake up with polished brows, defined eyes, and tinted lips." },
    { icon: Clock, title: "Coordinated Look", description: "Color and style are designed to harmonize across features." },
    { icon: Clock, title: "Save Time", description: "Cut your daily makeup routine dramatically." },
    { icon: Clock, title: "Custom for You", description: "Every feature is tailored to your face shape and preferences." },
    { icon: Clock, title: "Long-Lasting", description: "Enjoy a cohesive look with results that last for years." },
];

const candidates = [
    { title: "Busy professionals", description: "Perfect for those who want to simplify their beauty routine." },
    { title: "Makeup minimalists", description: "Great for clients who want to wake up ready." },
    { title: "Anyone wanting a refresh", description: "Refresh multiple features in one curated plan." },
];

const processSteps = [
    { number: "1", title: "Consultation", description: "We design a full-face plan for brows, lips, and eyeliner." },
    { number: "2", title: "Brows", description: "Shape and define your brows to frame your face." },
    { number: "3", title: "Lips", description: "Add natural color and definition to your lips." },
    { number: "4", title: "Eyeliner", description: "Enhance your eyes with subtle or defined liner." },
];

const aftercareSections = [
    { title: "General Aftercare", items: ["Follow specific instructions for each treated area", "Keep areas clean and dry", "Avoid makeup and harsh products during healing", "Use recommended aftercare products", "Return for touch-ups as scheduled"] },
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
                <span className="text-white">{"Pretty Girl Full Face Edit * Brows*Lips*Eyeliner"}</span>
              </nav>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {"Full Face Edit in Raleigh, NC"}
              </h1>
              <p className="text-lg md:text-xl mb-6 text-white/90 max-w-2xl mx-auto">
                {"A complete permanent makeup transformation for brows, lips, and eyeliner."}
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
                  What is {"Pretty Girl Full Face Edit * Brows*Lips*Eyeliner"}?
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  {"The Pretty Girl Face Edit — Signature Package Savings\n\nThe ultimate permanent makeup experience for the girl who wants the full edit. This signature package includes brows, Lip Blush, and Eyeliner Enhancement, all customized to work together to enhance your natural features and create a polished, balanced look.\n\nYour brows frame and define the face, Lip Blush adds soft customized color and definition, and Eyeliner Enhancement subtly defines the lash line for an effortless, finished look.\n\nReserve them together as The Pretty Girl Face Edit for package savings.\n\nPlease note: Perfecting Sessions are not included in this package and are booked separately at the applicable rate.\n\nBrows framed. Lips blushed. Eyes defined. The full Pretty Girl edit."}
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-md capitalize">
                    <Sparkles className="w-4 h-4" />
                    eyebrows
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-md">
                    <Clock className="w-4 h-4" />
                    {"8.5 Hours"}
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
                  alt="Pretty Girl Full Face Edit * Brows*Lips*Eyeliner"
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
              Benefits of {"Pretty Girl Full Face Edit * Brows*Lips*Eyeliner"}
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
                  Who is {"Pretty Girl Full Face Edit * Brows*Lips*Eyeliner"} Best For?
                </h2>
                <p className="text-muted-foreground mb-6">
                  {"Pretty Girl Full Face Edit * Brows*Lips*Eyeliner is an excellent choice for many clients. It is particularly beneficial for:"}
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
              The {"Pretty Girl Full Face Edit * Brows*Lips*Eyeliner"} Process
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
                {"Pretty Girl Full Face Edit * Brows*Lips*Eyeliner Aftercare"}
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
              Frequently Asked Questions About {"Pretty Girl Full Face Edit * Brows*Lips*Eyeliner"}
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
                {"Transform Your Morning Routine"}
              </h2>
              <p className="text-lg mb-6 text-white/90">
                {"Book a full face consultation and design your complete permanent makeup look."}
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
