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
  title: "Pretty Girl Glow-Up Duo * Brows-Lips in Raleigh, NC",
  description: "A Pretty Girl Glow Up Duo\nValue in Duo Savings\n\nTwo signature services, one complete glow-up. The Pretty Girl Glow Up Duo pairs a customized brow service with Lip Blush to enhance your features, create balance, and give you that polished, effortless look from morning to night.\n\nYour brows are designed to beautifully frame your face, while Lip Blush adds soft, customized color and definition to your lips.\n\nWhen reserved together as the Pretty Girl Glow Up Duo, exclusive package savings.\n\nPlease Note: Perfecting sessions are not included in the package and are booked separately at the applicable rate. \n\nMore pretty. More value. One complete glow-up.",
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services/pretty-girl-glow-up-duo-brows-lips',
  },
  openGraph: {
    title: "Pretty Girl Glow-Up Duo * Brows-Lips in Raleigh, NC",
    description: "A Pretty Girl Glow Up Duo\nValue in Duo Savings\n\nTwo signature services, one complete glow-up. The Pretty Girl Glow Up Duo pairs a customized brow service with Lip Blush to enhance your features, create balance, and give you that polished, effortless look from morning to night.\n\nYour brows are designed to beautifully frame your face, while Lip Blush adds soft, customized color and definition to your lips.\n\nWhen reserved together as the Pretty Girl Glow Up Duo, exclusive package savings.\n\nPlease Note: Perfecting sessions are not included in the package and are booked separately at the applicable rate. \n\nMore pretty. More value. One complete glow-up.",
    url: 'https://www.aprettygirlmatter.com/services/pretty-girl-glow-up-duo-brows-lips',
    type: 'website',
  },
};

const faqs = [
    { question: "Can I combine services?", answer: "Yes, many clients choose to pair services for a complete look." },
    { question: "How long does a duo session take?", answer: "Session length depends on the services selected and will be reviewed at consultation." },
];

const benefits = [
    { icon: Clock, title: "Coordinated Results", description: "Services are designed to complement each other." },
    { icon: Clock, title: "Save Time", description: "Wake up with two features already done." },
    { icon: Clock, title: "Custom Design", description: "Colors and shapes are matched to your features." },
    { icon: Clock, title: "Convenient", description: "Combine appointments for an efficient beauty routine." },
];

const candidates = [
    { title: "Clients wanting multiple features", description: "Ideal for brows + lips or brows + liner combos." },
    { title: "Busy schedules", description: "One plan, fewer appointments." },
];

const processSteps = [
    { number: "1", title: "Consultation", description: "We plan the combination of services that fits your goals." },
    { number: "2", title: "Design", description: "Each feature is mapped and color-matched." },
    { number: "3", title: "Procedure", description: "Services are performed with precision and care." },
    { number: "4", title: "Touch-Ups", description: "Perfecting sessions complete each feature." },
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
                <span className="text-white">{"Pretty Girl Glow-Up Duo * Brows-Lips"}</span>
              </nav>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {"Pretty Girl Glow-Up Duo * Brows-Lips in Raleigh, NC"}
              </h1>
              <p className="text-lg md:text-xl mb-6 text-white/90 max-w-2xl mx-auto">
                {"Combine two popular permanent makeup services for a cohesive, time-saving look."}
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
                  What is {"Pretty Girl Glow-Up Duo * Brows-Lips"}?
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  {"A Pretty Girl Glow Up Duo\nValue in Duo Savings\n\nTwo signature services, one complete glow-up. The Pretty Girl Glow Up Duo pairs a customized brow service with Lip Blush to enhance your features, create balance, and give you that polished, effortless look from morning to night.\n\nYour brows are designed to beautifully frame your face, while Lip Blush adds soft, customized color and definition to your lips.\n\nWhen reserved together as the Pretty Girl Glow Up Duo, exclusive package savings.\n\nPlease Note: Perfecting sessions are not included in the package and are booked separately at the applicable rate. \n\nMore pretty. More value. One complete glow-up."}
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-md capitalize">
                    <Sparkles className="w-4 h-4" />
                    eyebrows
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-md">
                    <Clock className="w-4 h-4" />
                    {"6 hours"}
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
                  alt="Pretty Girl Glow-Up Duo * Brows-Lips"
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
              Benefits of {"Pretty Girl Glow-Up Duo * Brows-Lips"}
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
                  Who is {"Pretty Girl Glow-Up Duo * Brows-Lips"} Best For?
                </h2>
                <p className="text-muted-foreground mb-6">
                  {"Pretty Girl Glow-Up Duo * Brows-Lips is an excellent choice for many clients. It is particularly beneficial for:"}
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
              The {"Pretty Girl Glow-Up Duo * Brows-Lips"} Process
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
                {"Pretty Girl Glow-Up Duo * Brows-Lips Aftercare"}
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
              Frequently Asked Questions About {"Pretty Girl Glow-Up Duo * Brows-Lips"}
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
                {"Build Your Perfect Duo"}
              </h2>
              <p className="text-lg mb-6 text-white/90">
                {"Schedule a consultation to customize your permanent makeup combination."}
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
