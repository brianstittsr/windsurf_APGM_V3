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
  title: "Saline Tattoo Lightening in Raleigh, NC",
  description: "Saline Tattoo Lightening is a non-laser method designed to gradually lighten unwanted pigment in tattooed eyebrows or body tattoos using a gentle, natural solution. This technique works by implanting a saline and fruit extract-based solution into the skin, which lifts and fades the pigment over multiple sessions.\n\n$300 per session. Package pricing may be available. \n\nSafe for both cosmetic and body tattoos\nBreaks up pigment naturally without harsh chemicals or lasers\nDoes NOT completely remove the tattoo in one session—lightens gradually\nIdeal for those wanting to correct or fade previous work before a cover-up\n\nResults vary based on pigment depth, skin type, and number of sessions needed.",
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services/saline-tattoo-lightening',
  },
  openGraph: {
    title: "Saline Tattoo Lightening in Raleigh, NC",
    description: "Saline Tattoo Lightening is a non-laser method designed to gradually lighten unwanted pigment in tattooed eyebrows or body tattoos using a gentle, natural solution. This technique works by implanting a saline and fruit extract-based solution into the skin, which lifts and fades the pigment over multiple sessions.\n\n$300 per session. Package pricing may be available. \n\nSafe for both cosmetic and body tattoos\nBreaks up pigment naturally without harsh chemicals or lasers\nDoes NOT completely remove the tattoo in one session—lightens gradually\nIdeal for those wanting to correct or fade previous work before a cover-up\n\nResults vary based on pigment depth, skin type, and number of sessions needed.",
    url: 'https://www.aprettygirlmatter.com/services/saline-tattoo-lightening',
    type: 'website',
  },
};

const faqs = [
    { question: "How many sessions will I need?", answer: "Most clients need multiple sessions spaced several weeks apart." },
    { question: "Does saline removal hurt?", answer: "A topical numbing agent is used to minimize discomfort." },
    { question: "Can all colors be removed?", answer: "Results vary based on pigment type, depth, and age of the tattoo." },];

const benefits = [
    { icon: Clock, title: "Non-Laser Option", description: "Gentle saline lifting without laser treatments." },
    { icon: Clock, title: "Safe for PMU", description: "Designed for use around delicate brow and lip areas." },
    { icon: Clock, title: "Gradual Results", description: "Multiple sessions lighten pigment over time." },
    { icon: Clock, title: "Prep for New Work", description: "Lighten old pigment before a new PMU procedure." },
    { icon: Clock, title: "Minimal Downtime", description: "Healing is typically quick between sessions." },];

const candidates = [
    { title: "Unwanted old PMU", description: "Lighten brows, lips, or small tattoos you no longer want." },
    { title: "Preparing for cover-up", description: "Fade existing pigment before new work." },
    { title: "Laser-sensitive clients", description: "Those who prefer a non-laser approach." },];

const processSteps = [
    { number: "1", title: "Consultation", description: "We assess the area and set realistic expectations." },
    { number: "2", title: "Application", description: "Saline solution is tattooed into the skin to lift pigment." },
    { number: "3", title: "Healing", description: "The skin heals and pigment naturally lifts to the surface." },
    { number: "4", title: "Repeat", description: "Multiple sessions may be needed for desired lightness." },];

const aftercareSections = [
    { title: "Healing Period", items: ["Keep the area clean and dry", "Do not pick scabs or scratch", "Avoid makeup on the treated area", "Stay out of direct sunlight and tanning beds", "Follow all provided aftercare instructions"] },];

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
                <span className="text-white">Saline Tattoo Lightening</span>
              </nav>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Saline Tattoo Lightening in Raleigh, NC
              </h1>
              <p className="text-lg md:text-xl mb-6 text-white/90 max-w-2xl mx-auto">
                A safe, non-laser method to lighten unwanted permanent makeup or small tattoos.
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
                  What is Saline Tattoo Lightening?
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  Saline Tattoo Lightening is a non-laser method designed to gradually lighten unwanted pigment in tattooed eyebrows or body tattoos using a gentle, natural solution. This technique works by implanting a saline and fruit extract-based solution into the skin, which lifts and fades the pigment over multiple sessions.

$300 per session. Package pricing may be available. 

Safe for both cosmetic and body tattoos
Breaks up pigment naturally without harsh chemicals or lasers
Does NOT completely remove the tattoo in one session—lightens gradually
Ideal for those wanting to correct or fade previous work before a cover-up

Results vary based on pigment depth, skin type, and number of sessions needed.
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-md capitalize">
                    <Sparkles className="w-4 h-4" />
                    correction
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-md">
                    <Clock className="w-4 h-4" />
                    2 hr
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-md font-semibold">
                    $300
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
                  alt="Saline Tattoo Lightening"
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
              Benefits of Saline Tattoo Lightening
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
                  Who is Saline Tattoo Lightening Best For?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Saline Tattoo Lightening is an excellent choice for many clients. It is particularly beneficial for:
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
              The Saline Tattoo Lightening Process
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
                Saline Tattoo Lightening Aftercare
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
              Frequently Asked Questions About Saline Tattoo Lightening
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
                Lighten Unwanted Pigment
              </h2>
              <p className="text-lg mb-6 text-white/90">
                Schedule a saline tattoo lightening consultation to discuss your options.
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
