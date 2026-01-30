import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Combo Brows Raleigh NC | Microblading + Powder Brows',
  description: 'Combo brows in Raleigh, NC - the best of microblading and powder brows combined. Natural hair strokes with soft shading. Book your consultation today!',
  keywords: ['combo brows Raleigh', 'combination brows Raleigh NC', 'microblading and shading', 'hybrid brows', 'PMU Raleigh'],
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services/combo-brows',
  },
};

const faqs = [
  {
    question: 'What are combo brows?',
    answer: 'Combo brows combine two techniques: microblading hair strokes at the front of the brow for a natural, feathered look, and powder shading through the body and tail for added depth and definition. This creates the most realistic, dimensional brow result.',
  },
  {
    question: 'How long do combo brows last?',
    answer: 'Combo brows typically last 1-3 years depending on your skin type and lifestyle. The powder shading portion tends to last longer than the microblading strokes. Touch-ups are recommended annually to maintain optimal results.',
  },
  {
    question: 'Are combo brows better than microblading alone?',
    answer: 'Combo brows are often considered the best option because they combine the natural hair-stroke look of microblading with the longevity and fullness of powder shading. They work well on all skin types, including oily skin where microblading alone may fade faster.',
  },
  {
    question: 'Who are combo brows best for?',
    answer: 'Combo brows are ideal for those who want the most natural-looking yet defined brows. They\'re especially great for those with oily skin, sparse brows, or anyone who wants fuller, more dimensional brows that last longer than microblading alone.',
  },
  {
    question: 'What is the healing process like?',
    answer: 'Healing takes 4-6 weeks. Your brows will appear darker initially and may go through a patchy phase as they heal. The true color and texture emerge after full healing. A touch-up appointment 6-8 weeks later perfects the results.',
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

export default function ComboBrowsPage() {
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
                    <li className="breadcrumb-item active text-white" aria-current="page">Combo Brows</li>
                  </ol>
                </nav>
                <h1 className="display-4 fw-bold mb-3">Combo Brows in Raleigh, NC</h1>
                <p className="lead fs-4 mb-4">
                  The best of both worlds - microblading strokes combined with powder shading for the most natural, dimensional brows
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

        {/* What are Combo Brows */}
        <section className="py-5">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <h2 className="h3 fw-bold mb-4" style={{ color: '#AD6269' }}>
                  What are Combo Brows?
                </h2>
                <p className="lead mb-4">
                  Combo brows (also called hybrid brows) combine the best features of microblading and ombré powder brows into one stunning technique.
                </p>
                <p className="mb-4">
                  The front of the brow features delicate microblading hair strokes for a soft, natural, feathered appearance. The body and tail of the brow are filled with powder shading, adding depth, dimension, and a polished finish.
                </p>
                <p className="mb-0">
                  This combination creates the most realistic, multidimensional brow result possible. At A Pretty Girl Matter in Raleigh, NC, Victoria expertly blends these techniques to create brows that look naturally full and beautifully defined.
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
                    <i className="fas fa-magic fa-5x mb-3" style={{ color: '#AD6269' }}></i>
                    <p className="fw-bold" style={{ color: '#AD6269' }}>Before & After Gallery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-5" style={{ backgroundColor: 'rgba(173, 98, 105, 0.1)' }}>
          <div className="container">
            <h2 className="h3 fw-bold text-center mb-5" style={{ color: '#AD6269' }}>
              How Combo Brows Work
            </h2>
            <div className="row g-4">
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px', backgroundColor: '#AD6269', color: 'white' }}>
                      <span className="h4 fw-bold mb-0">1</span>
                    </div>
                    <h3 className="h5 fw-bold">Microblading at the Front</h3>
                    <p className="text-muted mb-0">
                      Delicate hair strokes are created at the inner portion of the brow for a soft, natural, feathered start.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px', backgroundColor: '#AD6269', color: 'white' }}>
                      <span className="h4 fw-bold mb-0">2</span>
                    </div>
                    <h3 className="h5 fw-bold">Powder Shading in Body</h3>
                    <p className="text-muted mb-0">
                      Soft powder shading is applied through the body and tail, adding depth and a polished, filled-in look.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px', backgroundColor: '#AD6269', color: 'white' }}>
                      <span className="h4 fw-bold mb-0">3</span>
                    </div>
                    <h3 className="h5 fw-bold">Seamless Blend</h3>
                    <p className="text-muted mb-0">
                      The two techniques are expertly blended together for a seamless, natural, dimensional result.
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
              Benefits of Combo Brows
            </h2>
            <div className="row g-4">
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-layer-group fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Most Dimensional Look</h3>
                    <p className="text-muted mb-0">
                      Combines texture and depth for the most realistic, multidimensional brow result.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-tint fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Works on All Skin Types</h3>
                    <p className="text-muted mb-0">
                      The powder shading component makes combo brows suitable for oily skin types too.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-calendar-check fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Longer Lasting</h3>
                    <p className="text-muted mb-0">
                      The powder portion lasts longer than microblading alone, extending your results.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-feather fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Natural Front</h3>
                    <p className="text-muted mb-0">
                      Hair strokes at the front create a soft, natural start that mimics real brow hairs.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-fill-drip fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Fuller Appearance</h3>
                    <p className="text-muted mb-0">
                      The shading adds density and fullness that microblading alone can't achieve.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-sliders-h fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Customizable</h3>
                    <p className="text-muted mb-0">
                      Adjust the ratio of strokes to shading based on your preferences and brow goals.
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
                  Who Should Get Combo Brows?
                </h2>
                <p className="mb-4">
                  Combo brows are often considered the "gold standard" of permanent brows because they work for almost everyone. They're especially ideal for:
                </p>
                <ul className="list-unstyled">
                  <li className="mb-3 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Those who want the best of both</strong> - Natural strokes AND defined fullness</span>
                  </li>
                  <li className="mb-3 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Oily skin types</strong> - The powder component holds up better on oily skin</span>
                  </li>
                  <li className="mb-3 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Sparse or thin brows</strong> - Creates maximum fullness and definition</span>
                  </li>
                  <li className="mb-3 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Those who fill in brows daily</strong> - Replicate your makeup look permanently</span>
                  </li>
                  <li className="mb-0 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Anyone wanting long-lasting results</strong> - Combo brows tend to last longer</span>
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
                    <p className="fw-bold" style={{ color: '#AD6269' }}>The Gold Standard</p>
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
              Frequently Asked Questions About Combo Brows
            </h2>
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="accordion" id="comboFAQ">
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
                        data-bs-parent="#comboFAQ"
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
                  Ready for the Best Brows of Your Life?
                </h2>
                <p className="lead mb-4">
                  Book your free consultation today and discover why combo brows are the most popular choice for natural, dimensional, long-lasting results.
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
                <Link href="/services/ombre-brows" className="text-decoration-none">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body p-4 text-center">
                      <i className="fas fa-spa fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                      <h3 className="h5 fw-bold text-dark">Ombré Powder Brows</h3>
                      <p className="text-muted mb-0">Soft powdered effect</p>
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
