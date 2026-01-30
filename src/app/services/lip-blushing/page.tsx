import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Lip Blushing Raleigh NC | Natural Lip Tattoo',
  description: 'Professional lip blushing in Raleigh, NC. Enhance lip color & definition naturally. Certified artist with advanced training. Free consultation available!',
  keywords: ['lip blushing Raleigh', 'lip tattoo Raleigh NC', 'permanent lip color', 'lip enhancement Raleigh', 'PMU lips'],
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services/lip-blushing',
  },
};

const faqs = [
  {
    question: 'What is lip blushing?',
    answer: 'Lip blushing is a semi-permanent cosmetic tattoo that enhances the natural color and shape of your lips. It deposits pigment into the lips to create a more defined, youthful appearance with a subtle tint of color.',
  },
  {
    question: 'How long does lip blushing last?',
    answer: 'Lip blushing typically lasts 2-5 years depending on your lifestyle, sun exposure, and how your body metabolizes the pigment. Touch-ups are recommended every 1-2 years to maintain optimal color.',
  },
  {
    question: 'Does lip blushing hurt?',
    answer: 'The lips are a sensitive area, but we use a strong topical numbing cream to minimize discomfort. Most clients describe the sensation as a slight vibration or tingling. The numbing is reapplied throughout the procedure.',
  },
  {
    question: 'What is the healing process like?',
    answer: 'Lips will be swollen for 1-3 days and appear very bright initially. Over the next 4-6 weeks, the color will fade by 30-50% and the true color will emerge. Some peeling and dryness is normal during healing.',
  },
  {
    question: 'Can lip blushing cover dark lips?',
    answer: 'Yes! Lip blushing can help neutralize and brighten naturally dark or uneven lip color. We use color correction techniques to achieve a more uniform, beautiful lip tone.',
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

export default function LipBlushingPage() {
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
                    <li className="breadcrumb-item active text-white" aria-current="page">Lip Blushing</li>
                  </ol>
                </nav>
                <h1 className="display-4 fw-bold mb-3">Lip Blushing in Raleigh, NC</h1>
                <p className="lead fs-4 mb-4">
                  Enhance your natural lip color and definition with beautiful, long-lasting results
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

        {/* What is Lip Blushing */}
        <section className="py-5">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <h2 className="h3 fw-bold mb-4" style={{ color: '#AD6269' }}>
                  What is Lip Blushing?
                </h2>
                <p className="lead mb-4">
                  Lip blushing is a semi-permanent cosmetic tattoo that enhances your natural lip color, defines your lip shape, and creates the appearance of fuller, more youthful lips.
                </p>
                <p className="mb-4">
                  This technique deposits pigment into the lips using a specialized machine, creating a soft, natural-looking tint. Unlike traditional lip tattoos, lip blushing creates a subtle, "your lips but better" effect that enhances rather than overpowers your natural beauty.
                </p>
                <p className="mb-0">
                  At A Pretty Girl Matter in Raleigh, NC, Victoria specializes in creating customized lip colors that complement your skin tone and personal style. Whether you want a subtle nude enhancement or a more vibrant color, we can achieve your perfect look.
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
                    <i className="fas fa-kiss-wink-heart fa-5x mb-3" style={{ color: '#AD6269' }}></i>
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
              Benefits of Lip Blushing
            </h2>
            <div className="row g-4">
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-palette fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Enhanced Natural Color</h3>
                    <p className="text-muted mb-0">
                      Add a beautiful, natural-looking tint to your lips that lasts for years.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-expand-arrows-alt fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Defined Shape</h3>
                    <p className="text-muted mb-0">
                      Create more defined lip borders and correct asymmetry for a balanced look.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-heart fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Fuller Appearance</h3>
                    <p className="text-muted mb-0">
                      Create the illusion of fuller, more youthful lips without fillers.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-ban fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">No More Lipstick</h3>
                    <p className="text-muted mb-0">
                      Wake up with beautiful lip color - no need for daily lipstick application.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-balance-scale fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Color Correction</h3>
                    <p className="text-muted mb-0">
                      Even out uneven lip color or neutralize dark pigmentation.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 text-center">
                    <i className="fas fa-clock fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                    <h3 className="h5 fw-bold">Long-Lasting</h3>
                    <p className="text-muted mb-0">
                      Results last 2-5 years with proper care and occasional touch-ups.
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
                  Who is Lip Blushing For?
                </h2>
                <p className="mb-4">
                  Lip blushing is perfect for anyone looking to enhance their natural lip color and shape. It's especially beneficial for:
                </p>
                <ul className="list-unstyled">
                  <li className="mb-3 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Pale or uneven lip color</strong> - Add a healthy, natural-looking tint</span>
                  </li>
                  <li className="mb-3 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Undefined lip borders</strong> - Create more defined, symmetrical lips</span>
                  </li>
                  <li className="mb-3 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Busy lifestyles</strong> - Skip the daily lipstick routine</span>
                  </li>
                  <li className="mb-3 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Active women</strong> - Perfect for gym-goers and outdoor enthusiasts</span>
                  </li>
                  <li className="mb-0 d-flex align-items-start">
                    <i className="fas fa-check-circle me-3 mt-1" style={{ color: '#AD6269' }}></i>
                    <span><strong>Anyone wanting a natural enhancement</strong> - "Your lips but better"</span>
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
        <section className="py-5" style={{ backgroundColor: 'rgba(173, 98, 105, 0.1)' }}>
          <div className="container">
            <h2 className="h3 fw-bold text-center mb-5" style={{ color: '#AD6269' }}>
              Frequently Asked Questions About Lip Blushing
            </h2>
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="accordion" id="lipFAQ">
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
                        data-bs-parent="#lipFAQ"
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
                  Ready for Beautiful, Natural-Looking Lips?
                </h2>
                <p className="lead mb-4">
                  Book your free consultation today and discover how lip blushing can enhance your natural beauty.
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
                <Link href="/services/permanent-eyeliner" className="text-decoration-none">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body p-4 text-center">
                      <i className="fas fa-eye fa-2x mb-3" style={{ color: '#AD6269' }}></i>
                      <h3 className="h5 fw-bold text-dark">Permanent Eyeliner</h3>
                      <p className="text-muted mb-0">Define your eyes beautifully</p>
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
