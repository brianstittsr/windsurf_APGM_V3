import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Ombré Powder Brows Raleigh NC | Soft Eyebrow Tattoo',
  description: 'Beautiful ombré powder brows in Raleigh, NC. Soft, natural gradient effect that lasts 1-3 years. Certified PMU artist. Book your appointment today!',
  keywords: ['ombre brows Raleigh', 'powder brows Raleigh NC', 'ombre eyebrow tattoo', 'soft brow tattoo', 'PMU Raleigh'],
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services/ombre-brows',
  },
};

const faqs = [
  {
    question: 'What are ombré powder brows?',
    answer: 'Ombré powder brows are a semi-permanent makeup technique that creates a soft, powdered makeup look. The technique uses a machine to deposit pigment in a gradient pattern - lighter at the front and darker at the tail - mimicking the look of filled-in brows with makeup.',
  },
  {
    question: 'How long do ombré brows last?',
    answer: 'Ombré powder brows typically last 1-3 years depending on your skin type, lifestyle, and aftercare. They tend to last longer than microblading, especially on oily skin types.',
  },
  {
    question: 'Are ombré brows better than microblading?',
    answer: 'Neither is "better" - they\'re different techniques for different preferences. Ombré brows create a soft, makeup-like finish and work well on all skin types including oily skin. Microblading creates hair-like strokes for a more natural look. Many clients choose combo brows to get the best of both.',
  },
  {
    question: 'Does getting ombré brows hurt?',
    answer: 'Most clients experience minimal discomfort. We apply a topical numbing cream before and during the procedure. Many describe the sensation as a light scratching or vibration.',
  },
  {
    question: 'What is the healing process like?',
    answer: 'Healing takes 4-6 weeks. Your brows will appear darker and more intense initially, then lighten by 30-50% as they heal. Some scabbing and flaking is normal. The true color emerges after full healing.',
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

export default function OmbreBrowsPage() {
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
                    <li className="breadcrumb-item active text-white" aria-current="page">Ombré Brows</li>
                  </ol>
                </nav>
                <h1 className="display-4 fw-bold mb-3">Ombré Powder Brows in Raleigh, NC</h1>
                <p className="lead fs-4 mb-4">
                  Soft, natural gradient effect that gives a beautiful powdered makeup look
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

        {/* What are Ombré Brows */}
        <section className="py-5">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <h2 className="h3 fw-bold mb-4" style={{ color: '#AD6269' }}>
                  What are Ombré Powder Brows?
                </h2>
                <p className="lead mb-4">
                  Ombré powder brows are a semi-permanent eyebrow technique that creates a soft, powdered makeup effect using a specialized machine.
                </p>
                <p className="mb-4">
                  Unlike microblading which creates individual hair strokes, ombré brows use a shading technique that deposits thousands of tiny dots of pigment into the skin. The result is a soft, gradient effect that's lighter at the front of the brow and gradually darkens toward the tail.
                </p>
                <p className="mb-0">
                  This technique is perfect for achieving that "just filled in my brows" look without the daily effort. At A Pretty Girl Matter in Raleigh, NC, Victoria customizes the intensity and shape to match your desired look - from subtle and natural to bold and defined.
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
                    <i className="fas fa-spa fa-5x mb-3" style={{ color: '#AD6269' }}></i>
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
              Benefits of Ombré Powder Brows
            </h2>
            <div className="row g-4">
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-tint fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Great for Oily Skin</h3>
                    <p className="text-muted mb-0">
                      Unlike microblading, ombré brows hold up beautifully on oily skin types and last longer.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-feather fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Soft, Natural Look</h3>
                    <p className="text-muted mb-0">
                      Achieve a soft, powdered finish that looks like perfectly applied brow makeup.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-calendar-check fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Long-Lasting Results</h3>
                    <p className="text-muted mb-0">
                      Results typically last 1-3 years, often longer than microblading on most skin types.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-hand-holding-heart fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Less Trauma to Skin</h3>
                    <p className="text-muted mb-0">
                      The machine technique is gentler on the skin, resulting in faster healing.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-sliders-h fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Customizable Intensity</h3>
                    <p className="text-muted mb-0">
                      From subtle and natural to bold and dramatic - we customize to your preference.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-sync-alt fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Fades Evenly</h3>
                    <p className="text-muted mb-0">
                      Ombré brows fade more evenly over time compared to microblading strokes.
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
                  Who Should Get Ombré Powder Brows?
                </h2>
                <p className="mb-4">
                  Ombré powder brows are versatile and work well for most people. They're especially recommended for:
                </p>
                <ul className="list-unstyled">
                  <li className="mb-3 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Oily skin types</strong> - The technique holds up better on oily skin than microblading</span>
                  </li>
                  <li className="mb-3 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Mature skin</strong> - Works beautifully on aging skin with larger pores</span>
                  </li>
                  <li className="mb-3 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Those who fill in brows daily</strong> - Replicate your makeup look permanently</span>
                  </li>
                  <li className="mb-3 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Anyone wanting defined brows</strong> - Perfect for a polished, put-together look</span>
                  </li>
                  <li className="mb-0 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Previous PMU clients</strong> - Great for covering old, faded permanent makeup</span>
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
                    <p className="fw-bold" style={{ color: '#AD6269' }}>Perfect for All Skin Types</p>
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
              Frequently Asked Questions About Ombré Brows
            </h2>
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="accordion" id="ombreFAQ">
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
                        data-bs-parent="#ombreFAQ"
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
                  Ready for Effortlessly Beautiful Brows?
                </h2>
                <p className="lead mb-4">
                  Book your free consultation today and discover how ombré powder brows can give you the perfect, low-maintenance brows you've always wanted.
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
                <Link href="/services/microblading" className="text-decoration-none">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body p-4 text-center">
                      <i className="fas fa-eye fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                      <h3 className="h5 fw-bold text-dark">Microblading</h3>
                      <p className="text-muted mb-0">Natural hair-like strokes</p>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="col-md-4">
                <Link href="/services/combo-brows" className="text-decoration-none">
                  <div className="card h-100 border-0 shadow-sm">
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
