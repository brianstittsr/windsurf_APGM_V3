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
  title: "Pretty Pout Refresh * Lip Blush Perfecting Session in Raleigh, NC",
  description: "Designed for returning Lip Blush clients who are ready to perfect their healed results. This session is used to refresh color, refine definition, and add additional pigment where needed after the initial healing process.\n\nPerfecting Sessions should be completed 6–8 weeks after your initial Lip Blush appointment for the best results.\n\nPlease Note: The Perfecting Session rate is only available during the 6–8 week perfecting window. After 8 weeks, pricing increases based on the amount of time that has passed and the additional work that may be needed to restore and refresh your color.\n\nA little more color. A little more polish. The perfect finishing touch for your Pretty Pout.",
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services/pretty-pout-refresh-lip-blush-perfecting-session',
  },
  openGraph: {
    title: "Pretty Pout Refresh * Lip Blush Perfecting Session in Raleigh, NC",
    description: "Designed for returning Lip Blush clients who are ready to perfect their healed results. This session is used to refresh color, refine definition, and add additional pigment where needed after the initial healing process.\n\nPerfecting Sessions should be completed 6–8 weeks after your initial Lip Blush appointment for the best results.\n\nPlease Note: The Perfecting Session rate is only available during the 6–8 week perfecting window. After 8 weeks, pricing increases based on the amount of time that has passed and the additional work that may be needed to restore and refresh your color.\n\nA little more color. A little more polish. The perfect finishing touch for your Pretty Pout.",
    url: 'https://www.aprettygirlmatter.com/services/pretty-pout-refresh-lip-blush-perfecting-session',
    type: 'website',
  },
};

const faqs = [
    { question: "When should I book a refresh?", answer: "Timing depends on the service; refreshes are typically recommended within the specified window after your initial session." },
    { question: "Is a refresh the same as the first session?", answer: "It is usually shorter, focusing on reinforcing color and shape rather than a full new design." },];

const benefits = [
    { icon: Clock, title: "Restore Color", description: "Bring faded pigment back to life for vibrant results." },
    { icon: Clock, title: "Refine Shape", description: "Adjust the brow, lip, or liner shape as desired." },
    { icon: Clock, title: "Extend Results", description: "Keep your permanent makeup looking fresh longer." },
    { icon: Clock, title: "Quick Procedure", description: "Touch-ups are typically shorter than the initial appointment." },
    { icon: Clock, title: "Maintain Your Investment", description: "Routine refreshes protect the look you love." },];

const candidates = [
    { title: "Previous PMU clients", description: "Anyone who has had permanent makeup done and needs a refresh." },
    { title: "Faded results", description: "Color that has lightened over time." },
    { title: "Shape changes", description: "Clients wanting to tweak or refine their existing look." },];

const processSteps = [
    { number: "1", title: "Assessment", description: "Victoria evaluates your existing permanent makeup." },
    { number: "2", title: "Design", description: "The refreshed shape and color are planned." },
    { number: "3", title: "Touch-Up", description: "Pigment is carefully added to refresh and perfect." },
    { number: "4", title: "Aftercare", description: "Follow the healing instructions for best retention." },];

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
                <span className="text-white">Pretty Pout Refresh * Lip Blush Perfecting Session</span>
              </nav>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Pretty Pout Refresh * Lip Blush Perfecting Session in Raleigh, NC
              </h1>
              <p className="text-lg md:text-xl mb-6 text-white/90 max-w-2xl mx-auto">
                Refresh and perfect your existing permanent makeup with a touch-up session.
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
                  What is Pretty Pout Refresh * Lip Blush Perfecting Session?
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  Designed for returning Lip Blush clients who are ready to perfect their healed results. This session is used to refresh color, refine definition, and add additional pigment where needed after the initial healing process.

Perfecting Sessions should be completed 6–8 weeks after your initial Lip Blush appointment for the best results.

Please Note: The Perfecting Session rate is only available during the 6–8 week perfecting window. After 8 weeks, pricing increases based on the amount of time that has passed and the additional work that may be needed to restore and refresh your color.

A little more color. A little more polish. The perfect finishing touch for your Pretty Pout.
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-md capitalize">
                    <Sparkles className="w-4 h-4" />
                    lips
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-md">
                    <Clock className="w-4 h-4" />
                    2
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
                  alt="Pretty Pout Refresh * Lip Blush Perfecting Session"
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
              Benefits of Pretty Pout Refresh * Lip Blush Perfecting Session
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
                  Who is Pretty Pout Refresh * Lip Blush Perfecting Session Best For?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Pretty Pout Refresh * Lip Blush Perfecting Session is an excellent choice for many clients. It is particularly beneficial for:
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
              The Pretty Pout Refresh * Lip Blush Perfecting Session Process
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
                Pretty Pout Refresh * Lip Blush Perfecting Session Aftercare
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
              Frequently Asked Questions About Pretty Pout Refresh * Lip Blush Perfecting Session
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
                Refresh Your Look Today
              </h2>
              <p className="text-lg mb-6 text-white/90">
                Book your touch-up and keep your permanent makeup looking its best.
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
