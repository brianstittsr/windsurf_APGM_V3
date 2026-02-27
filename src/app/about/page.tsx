import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'About Victoria - Certified Permanent Makeup Artist Raleigh NC',
  description: 'Meet Victoria, certified permanent makeup artist and veteran-owned business owner in Raleigh, NC. Alpha Kappa Alpha member with 5+ years experience.',
  keywords: [
    'about Victoria permanent makeup artist Raleigh NC',
    'certified PMU artist veteran owned business Raleigh',
    'Victoria permanent makeup artist credentials Raleigh',
    'Alpha Kappa Alpha member permanent makeup Raleigh',
    'veteran owned permanent makeup business Raleigh NC'
  ],
  alternates: {
    canonical: '/about'
  },
  openGraph: {
    title: 'About Victoria - A Pretty Girl Matter Permanent Makeup',
    description: 'Meet Victoria, certified permanent makeup artist and veteran-owned business owner in Raleigh, NC. Expert PMU services with 5+ years experience.',
    url: '/about',
    type: 'website'
  }
};

export default function AboutPage() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      
      <main className="flex-grow-1 pt-header">
        {/* Hero Section */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h1 className="display-4 fw-bold text-dark mb-4">
                  About <span className="text-primary">Victoria</span>
                </h1>
                <p className="fs-5 text-secondary mb-5">
                  Certified Permanent Makeup Artist & Veteran-Owned Business Owner
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Victoria's Story */}
        <section className="py-5">
          <div className="container">
            <div className="row align-items-center mb-5">
              <div className="col-lg-6 mb-4 mb-lg-0">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <h2 className="h3 fw-bold text-primary mb-3">My Story</h2>
                    <p className="text-secondary mb-3">
                      Welcome to A Pretty Girl Matter! I'm Victoria, and I'm passionate about 
                      helping people feel confident and beautiful in their own skin. As a 
                      veteran-owned business, I bring the same dedication, precision, and 
                      attention to detail that I learned in the military to every client I serve.
                    </p>
                    <p className="text-secondary mb-3">
                      My journey into permanent makeup began with my own search for confidence-boosting 
                      beauty solutions. After experiencing the life-changing results of permanent 
                      makeup myself, I knew I wanted to help others achieve that same feeling 
                      of waking up beautiful every day.
                    </p>
                    <p className="text-secondary mb-0">
                      Today, I'm proud to be a certified permanent makeup artist serving the 
                      Raleigh, NC community with the highest standards of safety, artistry, 
                      and client care.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="text-center">
                  <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                    <i className="fas fa-heart text-white fs-2"></i>
                  </div>
                  <h3 className="h4 fw-bold text-dark mb-3">Why I Started</h3>
                  <p className="text-secondary">
                    "I believe everyone deserves to feel beautiful and confident. 
                    Permanent makeup isn't about changing who you are—it's about 
                    enhancing the beautiful features you already have."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Credentials & Training */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row">
              <div className="col-lg-10 mx-auto">
                <h2 className="h3 fw-bold text-dark text-center mb-5">Credentials & Training</h2>
                <div className="row">
                  <div className="col-lg-4 mb-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center p-4">
                        <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                          <i className="fas fa-graduation-cap text-white fs-4"></i>
                        </div>
                        <h3 className="h5 fw-bold text-dark mb-3">Professional Training</h3>
                        <ul className="list-unstyled text-secondary mb-0">
                          <li className="mb-2">• The Collective Academy</li>
                          <li className="mb-2">• Beauty Slesh Academy</li>
                          <li className="mb-0">• Beauty Angels Training</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 mb-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center p-4">
                        <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                          <i className="fas fa-certificate text-white fs-4"></i>
                        </div>
                        <h3 className="h5 fw-bold text-dark mb-3">Certifications</h3>
                        <ul className="list-unstyled text-secondary mb-0">
                          <li className="mb-2">• Certified PMU Artist</li>
                          <li className="mb-2">• Bloodborne Pathogen Safety</li>
                          <li className="mb-0">• CPR & First Aid Certified</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4 mb-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center p-4">
                        <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                          <i className="fas fa-award text-white fs-4"></i>
                        </div>
                        <h3 className="h5 fw-bold text-dark mb-3">Specializations</h3>
                        <ul className="list-unstyled text-secondary mb-0">
                          <li className="mb-2">• Microblading Specialist</li>
                          <li className="mb-2">• Lip Blushing Expert</li>
                          <li className="mb-0">• Permanent Eyeliner Artist</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Veteran-Owned Business */}
        <section className="py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-10 mx-auto">
                <div className="row align-items-center">
                  <div className="col-lg-6 mb-4 mb-lg-0">
                    <div className="text-center mb-4">
                      <div className="bg-dark rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                        <i className="fas fa-flag-usa text-white fs-2"></i>
                      </div>
                      <h2 className="h3 fw-bold text-dark mb-3">Veteran-Owned Business</h2>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body p-4">
                        <h3 className="h5 fw-bold text-primary mb-3">Service & Dedication</h3>
                        <p className="text-secondary mb-3">
                          As a proud veteran, I bring the same level of discipline, precision, 
                          and commitment to excellence that defined my military service to my 
                          permanent makeup practice.
                        </p>
                        <p className="text-secondary mb-3">
                          My military training taught me the importance of attention to detail, 
                          maintaining the highest standards of safety, and putting clients first. 
                          These values continue to guide every aspect of A Pretty Girl Matter.
                        </p>
                        <p className="text-secondary mb-0">
                          Supporting veteran-owned businesses helps strengthen our local 
                          community and economy. When you choose A Pretty Girl Matter, 
                          you're supporting a veteran-owned business and the values we represent.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Alpha Kappa Alpha */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row">
              <div className="col-lg-10 mx-auto">
                <div className="row align-items-center">
                  <div className="col-lg-6 mb-4 mb-lg-0">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body p-4">
                        <h3 className="h5 fw-bold text-primary mb-3">Alpha Kappa Alpha Sorority</h3>
                        <p className="text-secondary mb-3">
                          I'm a proud member of Alpha Kappa Alpha Sorority, Incorporated, 
                          the oldest and most distinguished Greek-letter organization 
                          established by and for college women of African descent.
                        </p>
                        <p className="text-secondary mb-3">
                          AKA's mission of service, leadership, and sisterhood aligns 
                          perfectly with my values as a business owner and permanent 
                          makeup artist. The organization's emphasis on empowering 
                          women and building confidence resonates deeply with my work.
                        </p>
                        <p className="text-secondary mb-0">
                          Through AKA, I've learned the importance of community service, 
                          supporting other women, and using my talents to make a positive 
                          difference in the lives of others.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="text-center">
                      <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                        <i className="fas fa-users text-white fs-2"></i>
                      </div>
                      <h3 className="h4 fw-bold text-dark mb-3">Sisterhood & Service</h3>
                      <p className="text-secondary">
                        "Being part of Alpha Kappa Alpha has taught me that true beauty 
                        comes from lifting others up and using our gifts to serve our 
                        community. Every client I work with is part of my extended sisterhood."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experience & Results */}
        <section className="py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-10 mx-auto">
                <h2 className="h3 fw-bold text-dark text-center mb-5">Experience & Results</h2>
                <div className="row">
                  <div className="col-lg-3 mb-4">
                    <div className="text-center">
                      <div className="display-4 fw-bold text-primary mb-2">5+</div>
                      <p className="text-secondary mb-0">Years of Experience</p>
                    </div>
                  </div>
                  <div className="col-lg-3 mb-4">
                    <div className="text-center">
                      <div className="display-4 fw-bold text-primary mb-2">500+</div>
                      <p className="text-secondary mb-0">Happy Clients</p>
                    </div>
                  </div>
                  <div className="col-lg-3 mb-4">
                    <div className="text-center">
                      <div className="display-4 fw-bold text-primary mb-2">1000+</div>
                      <p className="text-secondary mb-0">Procedures Completed</p>
                    </div>
                  </div>
                  <div className="col-lg-3 mb-4">
                    <div className="text-center">
                      <div className="display-4 fw-bold text-primary mb-2">4.9</div>
                      <p className="text-secondary mb-0">Average Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto text-center">
                <h2 className="h3 fw-bold text-dark mb-4">My Philosophy</h2>
                <p className="fs-5 text-secondary mb-4">
                  "Beauty is not about changing who you are—it's about enhancing 
                  the beautiful features you already have and helping you feel 
                  confident in your own skin."
                </p>
                <div className="row">
                  <div className="col-lg-4 mb-4">
                    <div className="text-center">
                      <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                        <i className="fas fa-heart text-white fs-4"></i>
                      </div>
                      <h3 className="h5 fw-bold text-dark mb-2">Client-Focused</h3>
                      <p className="text-secondary">
                        Every decision is made with your best interests, safety, 
                        and satisfaction in mind.
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-4 mb-4">
                    <div className="text-center">
                      <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                        <i className="fas fa-shield-alt text-white fs-4"></i>
                      </div>
                      <h3 className="h5 fw-bold text-dark mb-2">Safety First</h3>
                      <p className="text-secondary">
                        The highest standards of sanitation, sterile techniques, 
                        and client care.
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-4 mb-4">
                    <div className="text-center">
                      <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                        <i className="fas fa-star text-white fs-4"></i>
                      </div>
                      <h3 className="h5 fw-bold text-dark mb-2">Natural Results</h3>
                      <p className="text-secondary">
                        Enhancing your natural beauty with subtle, 
                        professional-looking results.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-10 mx-auto">
                <h2 className="h3 fw-bold text-dark text-center mb-5">Why Clients Trust Me</h2>
                <div className="row">
                  <div className="col-lg-6 mb-4">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body p-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px'}}>
                            <i className="fas fa-user-md text-white fs-5"></i>
                          </div>
                          <h3 className="h5 fw-bold text-dark mb-0">Medical Background</h3>
                        </div>
                        <p className="text-secondary mb-0">
                          My military service and medical training have given me a deep 
                          understanding of anatomy, safety protocols, and the importance 
                          of sterile procedures.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 mb-4">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body p-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px'}}>
                            <i className="fas fa-handshake text-white fs-5"></i>
                          </div>
                          <h3 className="h5 fw-bold text-dark mb-0">Personal Consultations</h3>
                        </div>
                        <p className="text-secondary mb-0">
                          Every client receives a thorough consultation to discuss goals, 
                          expectations, and create a custom plan that works best for them.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 mb-4">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body p-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px'}}>
                            <i className="fas fa-tools text-white fs-5"></i>
                          </div>
                          <h3 className="h5 fw-bold text-dark mb-0">Premium Products</h3>
                        </div>
                        <p className="text-secondary mb-0">
                          I only use the highest quality pigments, tools, and equipment 
                          from trusted manufacturers to ensure the best results and safety.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 mb-4">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body p-4">
                        <div className="d-flex align-items-center mb-3">
                          <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center me-3" style={{width: '50px', height: '50px'}}>
                            <i className="fas fa-headset text-white fs-5"></i>
                          </div>
                          <h3 className="h5 fw-bold text-dark mb-0">Ongoing Support</h3>
                        </div>
                        <p className="text-secondary mb-0">
                          My relationship with clients doesn't end after the procedure. 
                          I provide ongoing support and follow-up care throughout the healing process.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Involvement */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row">
              <div className="col-lg-10 mx-auto">
                <div className="row align-items-center">
                  <div className="col-lg-6 mb-4 mb-lg-0">
                    <div className="text-center">
                      <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                        <i className="fas fa-globe-americas text-white fs-2"></i>
                      </div>
                      <h3 className="h4 fw-bold text-dark mb-3">Community Service</h3>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body p-4">
                        <h3 className="h5 fw-bold text-primary mb-3">Giving Back</h3>
                        <p className="text-secondary mb-3">
                          As a member of the Raleigh community, I'm committed to giving back 
                          and supporting local causes. Through my sorority work and veteran 
                          network, I participate in community service projects that help 
                          women and families in need.
                        </p>
                        <p className="text-secondary mb-0">
                          I believe in using my skills and platform to make a positive 
                          difference in the lives of others, whether through free consultations 
                          for cancer survivors or supporting local women's initiatives.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto text-center">
                <h2 className="h3 fw-bold text-dark mb-4">Ready to Meet Victoria?</h2>
                <p className="text-secondary mb-4">
                  Schedule your free consultation to discuss your permanent makeup goals 
                  and learn how Victoria can help you achieve the beautiful, natural results you desire.
                </p>
                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                  <a href="/book-now" className="btn btn-primary btn-lg px-4">
                    <i className="fas fa-calendar-plus me-2"></i>
                    Schedule Free Consultation
                  </a>
                  <a href="/contact" className="btn btn-outline-primary btn-lg px-4">
                    <i className="fas fa-phone me-2"></i>
                    Call (919) 441-0932
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
