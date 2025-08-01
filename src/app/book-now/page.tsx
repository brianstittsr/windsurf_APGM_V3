'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect, useState } from 'react';

export default function BookNow() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
                  Book Your <span className="text-primary">Appointment</span>
                </h1>
                <p className="fs-5 text-secondary mb-5">
                  Schedule your permanent makeup consultation and treatment with Victoria. 
                  Choose from available time slots that work best for your schedule.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Widget Section */}
        <section className="py-5">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                {/* Widget Container */}
                <div className="row justify-content-center">
                  <div className="col-12">
                    {isClient ? (
                      <div className="border rounded-3 bg-white shadow-sm" style={{ minHeight: '1000px' }}>
                        <iframe
                          src="/vagaro-widget.html"
                          style={{
                            width: '100%',
                            height: '1000px',
                            border: 'none',
                            borderRadius: '0.375rem'
                          }}
                          title="Vagaro Booking Widget"
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                          scrolling="yes"
                          frameBorder="0"
                        />
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading booking system...</span>
                        </div>
                        <p className="mt-3 text-muted">Loading booking system...</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Fallback Contact Info */}
                <div className="text-center mt-4">
                  <p className="text-muted mb-2">Having trouble booking online?</p>
                  <div className="d-flex justify-content-center gap-3 flex-wrap">
                    <a 
                      href="tel:919-441-0932" 
                      className="btn"
                      style={{
                        backgroundColor: '#AD6269',
                        borderColor: '#AD6269',
                        color: 'white'
                      }}
                    >
                      📞 Call 919-441-0932
                    </a>
                    <a 
                      href="mailto:info@apgm.com" 
                      className="btn"
                      style={{
                        backgroundColor: 'transparent',
                        borderColor: '#AD6269',
                        color: '#AD6269'
                      }}
                    >
                      ✉️ Email Us
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Information Section */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="text-center mb-5">
                  <h2 className="h3 fw-bold text-dark mb-4">What to Expect</h2>
                </div>
                
                <div className="row g-4">
                  <div className="col-md-4">
                    <div className="text-center">
                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                        <i className="fas fa-calendar-check text-white fs-4"></i>
                      </div>
                      <h4 className="h6 fw-bold text-dark mb-2">Easy Scheduling</h4>
                      <p className="text-secondary small">Select your preferred date and time from available slots</p>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="text-center">
                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                        <i className="fas fa-clock text-white fs-4"></i>
                      </div>
                      <h4 className="h6 fw-bold text-dark mb-2">Flexible Hours</h4>
                      <p className="text-secondary small">Multiple time slots available throughout the week</p>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="text-center">
                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{width: '60px', height: '60px'}}>
                        <i className="fas fa-user-check text-white fs-4"></i>
                      </div>
                      <h4 className="h6 fw-bold text-dark mb-2">Professional Service</h4>
                      <p className="text-secondary small">Expert permanent makeup application by Victoria</p>
                    </div>
                  </div>
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
