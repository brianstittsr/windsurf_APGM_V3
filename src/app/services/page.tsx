import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Permanent Makeup Services Raleigh NC',
  description: 'Explore our permanent makeup services in Raleigh, NC. Microblading, ombré brows, combo brows, lip blushing, and permanent eyeliner. Book your free consultation today!',
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services',
  },
};

const services = [
  {
    name: 'Microblading',
    slug: 'microblading',
    description: 'Natural-looking eyebrow enhancement using fine hair-like strokes that mimic real brow hairs.',
    image: '/images/services/microblading.jpg',
    duration: '2-3 hours',
    healing: '4-6 weeks',
    lasts: '1-3 years',
  },
  {
    name: 'Ombré Powder Brows',
    slug: 'ombre-brows',
    description: 'Soft, natural gradient effect that gives a powdered makeup look. Perfect for all skin types.',
    image: '/images/services/ombre-brows.jpg',
    duration: '2-3 hours',
    healing: '4-6 weeks',
    lasts: '1-3 years',
  },
  {
    name: 'Combo Brows',
    slug: 'combo-brows',
    description: 'The best of both worlds - microblading strokes combined with powder shading for a fuller look.',
    image: '/images/services/combo-brows.jpg',
    duration: '2.5-3 hours',
    healing: '4-6 weeks',
    lasts: '1-3 years',
  },
  {
    name: 'Lip Blushing',
    slug: 'lip-blushing',
    description: 'Enhance your natural lip color and define lip shape with this beautiful semi-permanent lip tattoo.',
    image: '/images/services/lip-blushing.jpg',
    duration: '2-3 hours',
    healing: '4-6 weeks',
    lasts: '2-5 years',
  },
  {
    name: 'Permanent Eyeliner',
    slug: 'permanent-eyeliner',
    description: 'Wake up with perfectly defined eyes every day. Lash line enhancement for a natural or dramatic look.',
    image: '/images/services/permanent-eyeliner.jpg',
    duration: '1.5-2 hours',
    healing: '4-6 weeks',
    lasts: '2-5 years',
  },
];

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px' }}>
        {/* Hero Section */}
        <section className="py-5" style={{ background: 'linear-gradient(135deg, #AD6269, #8B4A52)', color: 'white' }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10 text-center">
                <h1 className="display-3 fw-bold mb-3">Our Permanent Makeup Services</h1>
                <p className="lead fs-4 mb-4">
                  Expert permanent makeup services in Raleigh, NC. Each treatment is customized to enhance your natural beauty.
                </p>
                <p className="mb-0">
                  Serving Raleigh, Cary, Durham, Chapel Hill, and Wake Forest
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-5">
          <div className="container">
            <div className="row g-4">
              {services.map((service, index) => (
                <div key={index} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-lg">
                    <div 
                      className="card-img-top" 
                      style={{ 
                        height: '200px', 
                        background: `linear-gradient(135deg, rgba(173, 98, 105, 0.8), rgba(139, 74, 82, 0.8))`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <i className="fas fa-spa fa-4x text-white"></i>
                    </div>
                    <div className="card-body p-4">
                      <h2 className="h4 fw-bold mb-3" style={{ color: '#AD6269' }}>
                        {service.name}
                      </h2>
                      <p className="text-muted mb-3">{service.description}</p>
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        <span className="badge bg-light text-dark">
                          <i className="fas fa-clock me-1"></i> {service.duration}
                        </span>
                        <span className="badge bg-light text-dark">
                          <i className="fas fa-heart me-1"></i> Heals in {service.healing}
                        </span>
                        <span className="badge bg-light text-dark">
                          <i className="fas fa-calendar me-1"></i> Lasts {service.lasts}
                        </span>
                      </div>
                    </div>
                    <div className="card-footer bg-white border-0 p-4 pt-0">
                      <Link 
                        href={`/services/${service.slug}`}
                        className="btn w-100 rounded-pill"
                        style={{ 
                          background: 'linear-gradient(135deg, #AD6269, #8B4A52)',
                          color: 'white'
                        }}
                      >
                        Learn More <i className="fas fa-arrow-right ms-2"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-5" style={{ backgroundColor: 'rgba(173, 98, 105, 0.1)' }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h2 className="h3 fw-bold mb-4" style={{ color: '#AD6269' }}>
                  Not Sure Which Service is Right for You?
                </h2>
                <p className="lead mb-4">
                  Book a free consultation and let Victoria help you choose the perfect permanent makeup solution for your unique features and lifestyle.
                </p>
                <Link 
                  href="/book-now-custom"
                  className="btn btn-lg rounded-pill px-5"
                  style={{ 
                    background: 'linear-gradient(135deg, #AD6269, #8B4A52)',
                    color: 'white'
                  }}
                >
                  <i className="fas fa-calendar-plus me-2"></i>
                  Book Free Consultation
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-5">
          <div className="container">
            <h2 className="h3 fw-bold text-center mb-5" style={{ color: '#AD6269' }}>
              Why Choose A Pretty Girl Matter?
            </h2>
            <div className="row g-4">
              <div className="col-md-4">
                <div className="text-center">
                  <div className="mb-3">
                    <i className="fas fa-medal fa-3x" style={{ color: '#AD6269' }}></i>
                  </div>
                  <h3 className="h5 fw-bold">Certified Expert</h3>
                  <p className="text-muted">
                    Trained by top PMU academies including The Collective, Beauty Slesh, and Beauty Angels.
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center">
                  <div className="mb-3">
                    <i className="fas fa-flag-usa fa-3x" style={{ color: '#AD6269' }}></i>
                  </div>
                  <h3 className="h5 fw-bold">Veteran-Owned</h3>
                  <p className="text-muted">
                    Proudly veteran-owned business dedicated to service, excellence, and empowering others.
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center">
                  <div className="mb-3">
                    <i className="fas fa-heart fa-3x" style={{ color: '#AD6269' }}></i>
                  </div>
                  <h3 className="h5 fw-bold">Personalized Care</h3>
                  <p className="text-muted">
                    Every treatment is customized to your unique features, skin type, and personal style preferences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
