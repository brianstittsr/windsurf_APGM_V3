import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Microblading Raleigh NC | Natural Eyebrow Tattoo',
  description: 'Expert microblading in Raleigh, NC. Natural-looking eyebrow enhancement with certified artist Victoria. View before/after photos. Book free consultation!',
  keywords: ['microblading Raleigh', 'eyebrow tattoo Raleigh NC', 'microblading near me', 'natural eyebrow enhancement', 'PMU artist Raleigh'],
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services/microblading',
  },
  openGraph: {
    title: 'Microblading Raleigh NC | Natural Eyebrow Tattoo | A Pretty Girl Matter',
    description: 'Expert microblading in Raleigh, NC. Natural-looking eyebrow enhancement with certified artist Victoria.',
    url: 'https://www.aprettygirlmatter.com/services/microblading',
    type: 'website',
  },
};

const faqs = [
  {
    question: 'How much does microblading cost in Raleigh?',
    answer: 'Microblading prices in Raleigh typically range from $400-$800 depending on the artist\'s experience and technique. At A Pretty Girl Matter, we offer competitive pricing with financing options available. Contact us for current pricing and special offers.',
  },
  {
    question: 'Does microblading hurt?',
    answer: 'Most clients describe microblading as mildly uncomfortable rather than painful. We apply a topical numbing cream before and during the procedure to minimize discomfort. Many clients are surprised at how comfortable the experience is!',
  },
  {
    question: 'How long does microblading last?',
    answer: 'Microblading typically lasts 1-3 years depending on your skin type, lifestyle, and aftercare. Oily skin types may experience faster fading. Annual touch-ups are recommended to maintain optimal results.',
  },
  {
    question: 'What is the healing process like?',
    answer: 'The healing process takes 4-6 weeks. Your brows will appear darker initially, then lighten as they heal. Some flaking and itching is normal. Following proper aftercare instructions is crucial for best results.',
  },
  {
    question: 'Am I a good candidate for microblading?',
    answer: 'Microblading is ideal for those with sparse, thin, or over-plucked brows. However, it may not be suitable for those with very oily skin, certain medical conditions, or those who are pregnant or breastfeeding. A consultation will determine if you\'re a good candidate.',
  },
  {
    question: 'What\'s the difference between microblading and ombré brows?',
    answer: 'Microblading creates individual hair-like strokes for a natural look, while ombré brows use a shading technique for a soft, powdered makeup effect. Microblading is best for normal to dry skin, while ombré works well for all skin types including oily skin.',
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

export default function MicrobladingPage() {
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
                    <li className="breadcrumb-item active text-white" aria-current="page">Microblading</li>
                  </ol>
                </nav>
                <h1 className="display-4 fw-bold mb-3">Professional Microblading in Raleigh, NC</h1>
                <p className="lead fs-4 mb-4">
                  Natural-looking eyebrow enhancement using fine hair-like strokes that mimic real brow hairs
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

        {/* What is Microblading */}
        <section className="py-5">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <h2 className="h3 fw-bold mb-4" style={{ color: '#AD6269' }}>
                  What is Microblading?
                </h2>
                <p className="lead mb-4">
                  Microblading is a semi-permanent eyebrow tattooing technique that creates natural-looking, fuller brows using a handheld tool with ultra-fine needles.
                </p>
                <p className="mb-4">
                  Unlike traditional eyebrow tattoos, microblading deposits pigment into the upper layers of the skin, creating delicate, hair-like strokes that blend seamlessly with your natural brow hairs. The result is beautifully defined eyebrows that look completely natural.
                </p>
                <p className="mb-0">
                  At A Pretty Girl Matter in Raleigh, NC, Victoria uses advanced microblading techniques learned from top PMU academies to create customized brows that complement your unique facial features and personal style.
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

        {/* Benefits */}
        <section className="py-5" style={{ backgroundColor: 'rgba(173, 98, 105, 0.1)' }}>
          <div className="container">
            <h2 className="h3 fw-bold text-center mb-5" style={{ color: '#AD6269' }}>
              Benefits of Microblading
            </h2>
            <div className="row g-4">
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-clock fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Save Time Daily</h3>
                    <p className="text-muted mb-0">
                      Wake up with perfect brows every day. No more spending time filling in your eyebrows each morning.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-leaf fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Natural Results</h3>
                    <p className="text-muted mb-0">
                      Hair-like strokes create incredibly realistic brows that look natural, not drawn on.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-tint-slash fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Sweat & Water Proof</h3>
                    <p className="text-muted mb-0">
                      Your brows stay perfect through workouts, swimming, and any weather conditions.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-smile fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Boost Confidence</h3>
                    <p className="text-muted mb-0">
                      Feel confident and put-together at all times, whether at the gym or a special event.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-palette fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Customized Color</h3>
                    <p className="text-muted mb-0">
                      Pigment is custom-mixed to match your natural hair color and skin tone perfectly.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-redo fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Semi-Permanent</h3>
                    <p className="text-muted mb-0">
                      Results last 1-3 years, allowing you to adjust your look as trends change.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who It's For */}
        <section className="py-5">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-6 order-lg-2">
                <h2 className="h3 fw-bold mb-4" style={{ color: '#AD6269' }}>
                  Who is Microblading Best For?
                </h2>
                <p className="mb-4">
                  Microblading is an excellent choice for many people looking to enhance their eyebrows. It's particularly beneficial for:
                </p>
                <ul className="list-unstyled">
                  <li className="mb-3 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Sparse or thin brows</strong> - Add fullness and definition to naturally thin eyebrows</span>
                  </li>
                  <li className="mb-3 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Over-plucked brows</strong> - Restore brows that have been over-tweezed or waxed</span>
                  </li>
                  <li className="mb-3 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Alopecia or hair loss</strong> - Create natural-looking brows for those with hair loss conditions</span>
                  </li>
                  <li className="mb-3 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Busy professionals</strong> - Save time on daily makeup routines</span>
                  </li>
                  <li className="mb-3 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Active lifestyles</strong> - Perfect for athletes and fitness enthusiasts</span>
                  </li>
                  <li className="mb-0 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Normal to dry skin</strong> - Microblading works best on these skin types</span>
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
                    <p className="fw-bold" style={{ color: '#AD6269' }}>Ideal Candidates</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Process */}
        <section className="py-5" style={{ backgroundColor: 'rgba(173, 98, 105, 0.1)' }}>
          <div className="container">
            <h2 className="h3 fw-bold text-center mb-5" style={{ color: '#AD6269' }}>
              The Microblading Process
            </h2>
            <div className="row g-4">
              <div className="col-md-6 col-lg-3">
                <div className="text-center">
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px', backgroundColor: '#AD6269', color: 'white' }}>
                    <span className="h3 fw-bold mb-0">1</span>
                  </div>
                  <h3 className="h5 fw-bold">Consultation</h3>
                  <p className="text-muted">
                    We discuss your goals, assess your skin type, and design your perfect brow shape.
                  </p>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="text-center">
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px', backgroundColor: '#AD6269', color: 'white' }}>
                    <span className="h3 fw-bold mb-0">2</span>
                  </div>
                  <h3 className="h5 fw-bold">Numbing</h3>
                  <p className="text-muted">
                    A topical anesthetic is applied to ensure your comfort throughout the procedure.
                  </p>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="text-center">
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px', backgroundColor: '#AD6269', color: 'white' }}>
                    <span className="h3 fw-bold mb-0">3</span>
                  </div>
                  <h3 className="h5 fw-bold">Microblading</h3>
                  <p className="text-muted">
                    Hair-like strokes are carefully created using a specialized hand tool and pigment.
                  </p>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="text-center">
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px', backgroundColor: '#AD6269', color: 'white' }}>
                    <span className="h3 fw-bold mb-0">4</span>
                  </div>
                  <h3 className="h5 fw-bold">Touch-Up</h3>
                  <p className="text-muted">
                    A follow-up appointment 6-8 weeks later perfects your results.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Aftercare */}
        <section className="py-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <h2 className="h3 fw-bold text-center mb-4" style={{ color: '#AD6269' }}>
                  Microblading Aftercare
                </h2>
                <p className="text-center mb-4">
                  Proper aftercare is essential for achieving the best results. Here's what to expect and how to care for your new brows:
                </p>
                <div className="card border-0 shadow-lg">
                  <div className="card-body p-4">
                    <h3 className="h5 fw-bold mb-3">First 2 Weeks:</h3>
                    <ul className="mb-4">
                      <li className="mb-2">Keep brows dry - avoid water, sweat, and steam</li>
                      <li className="mb-2">Apply healing ointment as directed</li>
                      <li className="mb-2">Don't pick or scratch flaking skin</li>
                      <li className="mb-2">Avoid makeup on the brow area</li>
                      <li className="mb-0">Sleep on your back to avoid rubbing</li>
                    </ul>
                    <h3 className="h5 fw-bold mb-3">Weeks 2-6:</h3>
                    <ul className="mb-0">
                      <li className="mb-2">Brows may appear lighter - this is normal</li>
                      <li className="mb-2">Color will gradually return as skin heals</li>
                      <li className="mb-2">Avoid sun exposure and tanning</li>
                      <li className="mb-0">Schedule your touch-up appointment</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-5" style={{ backgroundColor: 'rgba(173, 98, 105, 0.1)' }}>
          <div className="container">
            <h2 className="h3 fw-bold text-center mb-5" style={{ color: '#AD6269' }}>
              Frequently Asked Questions About Microblading
            </h2>
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="accordion" id="microbladingFAQ">
                  {faqs.map((faq, index) => (
                    <div key={index} className="accordion-item border-0 shadow-sm mb-3">
                      <h3 className="accordion-header">
                        <button 
                          className={`accordion-button ${index !== 0 ? 'collapsed' : ''} fw-semibold`}
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target={`#faq${index}`}
                          aria-expanded={index === 0 ? 'true' : 'false'}
                        >
                          {faq.question}
                        </button>
                      </h3>
                      <div 
                        id={`faq${index}`} 
                        className={`accordion-collapse collapse ${index === 0 ? 'show' : ''}`}
                        data-bs-parent="#microbladingFAQ"
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
                  Ready for Beautiful, Natural-Looking Brows?
                </h2>
                <p className="lead mb-4">
                  Book your free consultation today and discover how microblading can transform your look and simplify your daily routine.
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
                <Link href="/services/ombre-brows" className="text-decoration-none">
                  <div className="card h-100 border-0 shadow-sm hover-shadow">
                    <div className="card-body p-4 text-center">
                      <i className="fas fa-spa fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                      <h3 className="h5 fw-bold text-dark">Ombré Powder Brows</h3>
                      <p className="text-muted mb-0">Soft, powdered makeup effect</p>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="col-md-4">
                <Link href="/services/combo-brows" className="text-decoration-none">
                  <div className="card h-100 border-0 shadow-sm hover-shadow">
                    <div className="card-body p-4 text-center">
                      <i className="fas fa-magic fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                      <h3 className="h5 fw-bold text-dark">Combo Brows</h3>
                      <p className="text-muted mb-0">Best of both techniques</p>
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
