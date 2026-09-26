import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { Service, ServiceDetailPageContent } from '@/types/database';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

const CONSULTATION_FORM_URL = 'https://link.socaldigitalstudio.com/widget/form/wxQMl8ZFz9MiWtrKYlnP';

const servicesDir = path.resolve(process.cwd(), 'src/app/services');

function existingStaticDirs(): string[] {
  return fs
    .readdirSync(servicesDir)
    .filter((f) => fs.statSync(path.join(servicesDir, f)).isDirectory())
    .filter((f) => f !== '[slug]');
}

function sanitizeForCode(str: string): string {
  return JSON.stringify(str);
}

function renderArray<T>(arr: T[] | undefined, renderItem: (item: T) => string): string {
  if (!arr || arr.length === 0) return '';
  return arr.map(renderItem).join('\n');
}

function generatePage(service: Service): string {
  const content: ServiceDetailPageContent = service.detailPageContent || {};
  const serviceName = service.name;
  const link = service.link!;
  const description = service.description || `Learn more about ${serviceName} at A Pretty Girl Matter.`;
  const heroTitle = content.heroTitle || `${serviceName} in Raleigh, NC`;
  const heroSubtitle = content.heroSubtitle || description;
  const showPrice = service.showPrice ?? true;

  const benefits = renderArray(content.benefits, (b) => `    { icon: Clock, title: ${sanitizeForCode(b.title)}, description: ${sanitizeForCode(b.description)} },`);
  const candidates = renderArray(content.candidates, (c) => `    { title: ${sanitizeForCode(c.title)}, description: ${sanitizeForCode(c.description)} },`);
  const processSteps = renderArray(content.processSteps, (s) => `    { number: ${sanitizeForCode(s.number)}, title: ${sanitizeForCode(s.title)}, description: ${sanitizeForCode(s.description)} },`);
  const aftercare = renderArray(content.aftercareSections, (section) => `    { title: ${sanitizeForCode(section.title)}, items: [${section.items.map((i) => sanitizeForCode(i)).join(', ')}] },`);
  const faqs = renderArray(content.faqs, (faq) => `    { question: ${sanitizeForCode(faq.question)}, answer: ${sanitizeForCode(faq.answer)} },`);

  const hasBenefits = content.benefits && content.benefits.length > 0;
  const hasCandidates = content.candidates && content.candidates.length > 0;
  const hasProcess = content.processSteps && content.processSteps.length > 0;
  const hasAftercare = content.aftercareSections && content.aftercareSections.length > 0;
  const hasFaqs = content.faqs && content.faqs.length > 0;

  return `import { Metadata } from 'next';
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
  title: ${sanitizeForCode(heroTitle)},
  description: ${sanitizeForCode(description)},
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services/${link}',
  },
  openGraph: {
    title: ${sanitizeForCode(heroTitle)},
    description: ${sanitizeForCode(description)},
    url: 'https://www.aprettygirlmatter.com/services/${link}',
    type: 'website',
  },
};

const faqs = [
${faqs}
];

const benefits = [
${benefits}
];

const candidates = [
${candidates}
];

const processSteps = [
${processSteps}
];

const aftercareSections = [
${aftercare}
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
                <span className="text-white">${serviceName.replace(/'/g, "\\'")}</span>
              </nav>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                ${heroTitle.replace(/'/g, "\\'")}
              </h1>
              <p className="text-lg md:text-xl mb-6 text-white/90 max-w-2xl mx-auto">
                ${heroSubtitle.replace(/'/g, "\\'")}
              </p>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-full px-8 bg-white text-[#AD6269] hover:bg-white/90"
              >
                <a href="${CONSULTATION_FORM_URL}" target="_blank" rel="noopener noreferrer">
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
                  What is ${serviceName.replace(/'/g, "\\'")}?
                </h2>
                <p className="text-lg text-muted-foreground mb-4">
                  ${description.replace(/'/g, "\\'")}
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-md capitalize">
                    <Sparkles className="w-4 h-4" />
                    ${service.category}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-md">
                    <Clock className="w-4 h-4" />
                    ${service.duration.replace(/'/g, "\\'")}
                  </span>
                  ${showPrice ? `<span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded-md font-semibold">
                    $${service.price}
                  </span>` : ''}
                </div>
                <Button
                  asChild
                  className="rounded-full px-8 bg-gradient-to-r from-[#AD6269] to-[#8B4A52] text-white hover:opacity-90"
                >
                  <a href="${CONSULTATION_FORM_URL}" target="_blank" rel="noopener noreferrer">
                    <CalendarPlus className="w-5 h-5 mr-2" />
                    Your Pretty Girl Matter Consultation Starts Here
                  </a>
                </Button>
              </div>
              <div className="relative h-80 md:h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg overflow-hidden">
                <Image
                  src="/images/APGM-icon.png"
                  alt="${serviceName.replace(/'/g, "\\'")}"
                  fill
                  className="object-contain p-6"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>

        ${hasBenefits ? `{/* Benefits */}
        <section className="py-12 md:py-16 bg-[#AD6269]/10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#AD6269]">
              Benefits of ${serviceName.replace(/'/g, "\\'")}
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
        </section>` : ''}

        ${hasCandidates ? `{/* Who It&apos;s For */}
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
                  Who is ${serviceName.replace(/'/g, "\\'")} Best For?
                </h2>
                <p className="text-muted-foreground mb-6">
                  ${serviceName.replace(/'/g, "\\'")} is an excellent choice for many clients. It is particularly beneficial for:
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
        </section>` : ''}

        ${hasProcess ? `{/* The Process */}
        <section className="py-12 md:py-16 bg-[#AD6269]/10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#AD6269]">
              The ${serviceName.replace(/'/g, "\\'")} Process
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
        </section>` : ''}

        ${hasAftercare ? `{/* Aftercare */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-[#AD6269]">
                ${serviceName.replace(/'/g, "\\'")} Aftercare
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
        </section>` : ''}

        ${hasFaqs ? `{/* FAQ Section */}
        <section className="py-12 md:py-16 bg-[#AD6269]/10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-[#AD6269]">
              Frequently Asked Questions About ${serviceName.replace(/'/g, "\\'")}
            </h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={\`item-\${index}\`} className="border-0 shadow-sm bg-white rounded-lg px-6">
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
        </section>` : ''}

        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-[#AD6269] to-[#8B4A52] text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                ${(content.ctaTitle || `Ready for Beautiful ${serviceName.replace(/'/g, "\\'")} Results?`).replace(/'/g, "\\'")}
              </h2>
              <p className="text-lg mb-6 text-white/90">
                ${(content.ctaText || `Book a free consultation with Victoria and discover how ${serviceName.replace(/'/g, "\\'")} can enhance your natural beauty.`).replace(/'/g, "\\'")}
              </p>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="rounded-full px-8 bg-white text-[#AD6269] hover:bg-white/90"
              >
                <a href="${CONSULTATION_FORM_URL}" target="_blank" rel="noopener noreferrer">
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
`;
}

async function main() {
  const existingDirs = existingStaticDirs();
  console.log('Existing static service pages:', existingDirs.join(', '));

  const snap = await db.collection('services').get();
  const services = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Service));

  let created = 0;
  for (const service of services) {
    if (!service.link) {
      console.log(`Skipping service with no link: ${service.name}`);
      continue;
    }

    const slug = service.link.trim();
    if (existingDirs.includes(slug)) {
      console.log(`Skipping existing static page: ${service.name} -> /services/${slug}`);
      continue;
    }

    const pageDir = path.join(servicesDir, slug);
    fs.mkdirSync(pageDir, { recursive: true });

    const pageContent = generatePage(service);
    fs.writeFileSync(path.join(pageDir, 'page.tsx'), pageContent, 'utf-8');

    console.log(`Created: /services/${slug}`);
    created++;
  }

  console.log(`\nDone. Created ${created} static service page(s).`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Generation failed:', error);
    process.exit(1);
  });
