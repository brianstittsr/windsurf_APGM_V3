import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
    answer: 'We offer several styles: Lash Line Enhancement (subtle, natural look), Classic Eyeliner (thin to medium line), and Winged Eyeliner (dramatic cat-eye effect). During your consultation, we\'ll help you choose the best style for your eye shape and preferences.',
  },
  {
    question: 'What is the healing process like?',
    answer: 'Expect some swelling for 1-3 days. The color will appear darker initially and lighten by 30-50% as it heals over 4-6 weeks. Avoid rubbing your eyes, wearing eye makeup, and getting the area wet during the first week.',
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
};

export default function PermanentEyelinerPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px' }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        
        {/* Hero Section */}
        <section className="py-5" style={{ background: 'linear-gradient(135deg, #AD6269, #8B4A52)', color: 'white' }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10 text-center">
                <nav aria-label="breadcrumb" className="mb-3">
                  <ol className="breadcrumb justify-content-center mb-0" style={{ fontSize: '0.9rem' }}>
                    <li className="breadcrumb-item"><Link href="/" className="text-white-50">Home</Link></li>
                    <li className="breadcrumb-item"><Link href="/services" className="text-white-50">Services</Link></li>
                    <li className="breadcrumb-item active text-white" aria-current="page">Permanent Eyeliner</li>
                  </ol>
                </nav>
                <h1 className="display-4 fw-bold mb-3">Permanent Eyeliner in Raleigh, NC</h1>
                <p className="lead fs-4 mb-4">
                  Wake up with perfectly defined eyes every day with lash line enhancement
                </p>
                <Link 
                  href="/book-now-custom"
                  className="btn btn-light btn-lg rounded-pill px-5"
                  style={{ color: '#AD6269' }}
                >
                  <i className="fas fa-calendar-plus me-2"></i>
                  Book Free Consultation
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* What is Permanent Eyeliner */}
        <section className="py-5">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <h2 className="h3 fw-bold mb-4" style={{ color: '#AD6269' }}>
                  What is Permanent Eyeliner?
                </h2>
                <p className="lead mb-4">
                  Permanent eyeliner is a cosmetic tattoo that enhances your eyes by depositing pigment along the lash line, creating the appearance of thicker lashes and beautifully defined eyes.
                </p>
                <p className="mb-4">
                  Whether you prefer a subtle lash enhancement that makes your lashes look fuller, a classic eyeliner look, or a dramatic winged style, permanent eyeliner eliminates the daily struggle of applying eyeliner perfectly.
                </p>
                <p className="mb-0">
                  At A Pretty Girl Matter in Raleigh, NC, Victoria uses advanced techniques to create customized eyeliner that complements your eye shape and enhances your natural beauty. From subtle to dramatic, we can achieve your perfect look.
                </p>
              </div>
              <div className="col-lg-6">
                <div 
                  className="rounded-4 shadow-lg"
                  style={{ 
                    height: '400px', 
                    background: 'linear-gradient(135deg, rgba(173, 98, 105, 0.2), rgba(139, 74, 82, 0.2))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div className="text-center">
                    <i className="fas fa-eye fa-5x mb-3" style={{ color: '#AD6269' }}></i>
                    <p className="fw-bold" style={{ color: '#AD6269' }}>Before & After Gallery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Eyeliner Styles */}
        <section className="py-5" style={{ backgroundColor: 'rgba(173, 98, 105, 0.1)' }}>
          <div className="container">
            <h2 className="h3 fw-bold text-center mb-5" style={{ color: '#AD6269' }}>
              Permanent Eyeliner Styles
            </h2>
            <div className="row g-4">
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-minus fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Lash Line Enhancement</h3>
                    <p className="text-muted mb-0">
                      The most natural option. Pigment is placed between the lashes to create the illusion of thicker, fuller lashes without an obvious liner look.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-grip-lines fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Classic Eyeliner</h3>
                    <p className="text-muted mb-0">
                      A thin to medium line along the lash line for a defined, everyday makeup look. Customizable thickness based on your preference.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-angle-double-right fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Winged Eyeliner</h3>
                    <p className="text-muted mb-0">
                      A dramatic cat-eye effect with a wing extending beyond the outer corner. Perfect for those who love a bold, glamorous look.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-5">
          <div className="container">
            <h2 className="h3 fw-bold text-center mb-5" style={{ color: '#AD6269' }}>
              Benefits of Permanent Eyeliner
            </h2>
            <div className="row g-4">
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-clock fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Save Time Daily</h3>
                    <p className="text-muted mb-0">
                      No more struggling with eyeliner every morning. Wake up with perfect eyes.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-tint-slash fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Smudge-Proof</h3>
                    <p className="text-muted mb-0">
                      No more raccoon eyes! Your eyeliner stays perfect through sweat, tears, and swimming.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-glasses fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Great for Vision Issues</h3>
                    <p className="text-muted mb-0">
                      Perfect for those who struggle to apply eyeliner due to poor vision or shaky hands.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-allergies fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Allergy-Friendly</h3>
                    <p className="text-muted mb-0">
                      Ideal for those allergic to traditional makeup products or contact lens wearers.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-balance-scale fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Perfect Symmetry</h3>
                    <p className="text-muted mb-0">
                      Achieve perfectly even eyeliner on both eyes - no more uneven wings!
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-eye fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Fuller Lash Look</h3>
                    <p className="text-muted mb-0">
                      Creates the illusion of thicker, fuller lashes even without mascara.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="py-5" style={{ backgroundColor: 'rgba(173, 98, 105, 0.1)' }}>
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-6 order-lg-2">
                <h2 className="h3 fw-bold mb-4" style={{ color: '#AD6269' }}>
                  Who is Permanent Eyeliner For?
                </h2>
                <p className="mb-4">
                  Permanent eyeliner is perfect for anyone who wants to enhance their eyes without daily makeup application. It's especially beneficial for:
                </p>
                <ul className="list-unstyled">
                  <li className="mb-3 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Busy professionals</strong> - Save precious time in your morning routine</span>
                  </li>
                  <li className="mb-3 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Active lifestyles</strong> - Perfect for athletes, swimmers, and gym enthusiasts</span>
                  </li>
                  <li className="mb-3 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Vision challenges</strong> - Great for those who struggle to apply traditional eyeliner</span>
                  </li>
                  <li className="mb-3 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Makeup allergies</strong> - Avoid irritation from daily makeup products</span>
                  </li>
                  <li className="mb-0 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Anyone wanting defined eyes</strong> - Wake up looking polished every day</span>
                  </li>
                </ul>
              </div>
              <div className="col-lg-6 order-lg-1">
                <div 
                  className="rounded-4 shadow-lg"
                  style={{ 
                    height: '400px', 
                    background: 'linear-gradient(135deg, rgba(173, 98, 105, 0.2), rgba(139, 74, 82, 0.2))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div className="text-center">
                    <i className="fas fa-user-check fa-5x mb-3" style={{ color: '#AD6269' }}></i>
                    <p className="fw-bold" style={{ color: '#AD6269' }}>Perfect for Everyone</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-5">
          <div className="container">
            <h2 className="h3 fw-bold text-center mb-5" style={{ color: '#AD6269' }}>
              Frequently Asked Questions About Permanent Eyeliner
            </h2>
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="accordion" id="eyelinerFAQ">
                  {faqs.map((faq, index) => (
                    <div key={index} className="accordion-item border-0 shadow-sm mb-3">
                      <h3 className="accordion-header">
                        <button 
                          className={`accordion-button ${index !== 0 ? 'collapsed' : ''} fw-semibold`}
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target={`#faq${index}`}
                        >
                          {faq.question}
                        </button>
                      </h3>
                      <div 
                        id={`faq${index}`} 
                        className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                        data-bs-parent="#eyelinerFAQ"
                      >
                        <div className="accordion-body text-muted">
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-5" style={{ background: 'linear-gradient(135deg, #AD6269, #8B4A52)', color: 'white' }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h2 className="h3 fw-bold mb-4">
                  Ready for Effortlessly Beautiful Eyes?
                </h2>
                <p className="lead mb-4">
                  Book your free consultation today and discover how permanent eyeliner can enhance your natural beauty.
                </p>
                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <Link 
                    href="/book-now-custom"
                    className="btn btn-light btn-lg rounded-pill px-5"
                    style={{ color: '#AD6269' }}
                  >
                    <i className="fas fa-calendar-plus me-2"></i>
                    Book Consultation
                  </Link>
                  <Link 
                    href="/contact"
                    className="btn btn-outline-light btn-lg rounded-pill px-5"
                  >
                    <i className="fas fa-phone me-2"></i>
                    Contact Us
                  </Link>
                </div>
                <p className="mt-4 mb-0">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Serving Raleigh, Cary, Durham, Chapel Hill & Wake Forest, NC
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Services */}
        <section className="py-5">
          <div className="container">
            <h2 className="h4 fw-bold text-center mb-4" style={{ color: '#AD6269' }}>
              Related Services You May Like
            </h2>
            <div className="row g-4 justify-content-center">
              <div className="col-md-4">
                <Link href="/services/lip-blushing" className="text-decoration-none">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body p-4 text-center">
                      <i className="fas fa-kiss-wink-heart fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                      <h3 className="h5 fw-bold text-dark">Lip Blushing</h3>
                      <p className="text-muted mb-0">Natural lip enhancement</p>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="col-md-4">
                <Link href="/services/microblading" className="text-decoration-none">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body p-4 text-center">
                      <i className="fas fa-spa fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                      <h3 className="h5 fw-bold text-dark">Microblading</h3>
                      <p className="text-muted mb-0">Natural eyebrow enhancement</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
