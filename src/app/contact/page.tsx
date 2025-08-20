'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useContactForm } from '@/hooks/useFirebase';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const services = [
    'Microblading Eyebrows',
    'Permanent Eyeliner',
    'Lip Blushing',
    'Color Correction',
    'Touch-up Services',
    'Consultation',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await fetch('/api/send-contact-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          service: '',
          message: ''
        });
      } else {
        setError(result.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Failed to submit contact form:', err);
      setError('Failed to send message. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      
      <main style={{ paddingTop: '80px' }}>
        {/* Hero Section */}
        <section className="py-5" style={{ background: 'linear-gradient(135deg, #AD6269, #8B4A52)', color: 'white' }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10 text-center">
                <div className="mb-4">
                  <i className="fas fa-comments fa-3x mb-3" style={{ opacity: 0.8 }}></i>
                </div>
                <h1 className="display-3 fw-bold mb-3">Get In Touch</h1>
                <p className="lead fs-4 mb-4">Ready to enhance your natural beauty? We'd love to hear from you!</p>
                <div className="row justify-content-center">
                  <div className="col-md-8">
                    <p className="mb-0">Schedule your consultation today and discover how permanent makeup can transform your daily routine.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form and Info Section */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row g-5 align-items-start">
              {/* Contact Form */}
              <div className="col-lg-8">
                <div className="card border-0 shadow-lg h-100">
                  <div className="card-header text-center py-4" style={{ background: 'linear-gradient(135deg, rgba(173, 98, 105, 0.1), rgba(139, 74, 82, 0.1))', border: 'none' }}>
                    <div className="mb-2">
                      <i className="fas fa-envelope fa-2x" style={{ color: '#AD6269' }}></i>
                    </div>
                    <h2 className="h3 fw-bold mb-2" style={{ color: '#AD6269' }}>Send Us a Message</h2>
                    <p className="text-muted mb-0">We'll respond within 24 hours with personalized information about your beauty goals</p>
                  </div>
                  <div className="card-body p-5">
                    
                    {success && (
                      <div className="alert alert-success" role="alert">
                        Thank you for your message! We'll get back to you within 24 hours.
                      </div>
                    )}
                    
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                      <div className="row g-4">
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="text"
                              className="form-control form-control-lg border-2"
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Full Name"
                              style={{ borderColor: '#AD6269' }}
                              required
                            />
                            <label htmlFor="name" className="fw-semibold" style={{ color: '#AD6269' }}>
                              <i className="fas fa-user me-2"></i>Full Name *
                            </label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="email"
                              className="form-control form-control-lg border-2"
                              id="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              placeholder="Email Address"
                              style={{ borderColor: '#AD6269' }}
                              required
                            />
                            <label htmlFor="email" className="fw-semibold" style={{ color: '#AD6269' }}>
                              <i className="fas fa-envelope me-2"></i>Email Address *
                            </label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="tel"
                              className="form-control form-control-lg border-2"
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="Phone Number"
                              style={{ borderColor: '#AD6269' }}
                            />
                            <label htmlFor="phone" className="fw-semibold" style={{ color: '#AD6269' }}>
                              <i className="fas fa-phone me-2"></i>Phone Number
                            </label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-floating">
                            <select
                              className="form-select form-select-lg border-2"
                              id="service"
                              name="service"
                              value={formData.service}
                              onChange={handleInputChange}
                              style={{ borderColor: '#AD6269' }}
                            >
                              <option value="">Select a service...</option>
                              {services.map((service, index) => (
                                <option key={index} value={service}>{service}</option>
                              ))}
                            </select>
                            <label htmlFor="service" className="fw-semibold" style={{ color: '#AD6269' }}>
                              <i className="fas fa-palette me-2"></i>Service of Interest
                            </label>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="form-floating">
                            <textarea
                              className="form-control border-2"
                              id="message"
                              name="message"
                              style={{ height: '150px', borderColor: '#AD6269' }}
                              value={formData.message}
                              onChange={handleInputChange}
                              placeholder="Tell us about your goals..."
                              required
                            ></textarea>
                            <label htmlFor="message" className="fw-semibold" style={{ color: '#AD6269' }}>
                              <i className="fas fa-comment-dots me-2"></i>Tell us about your beauty goals *
                            </label>
                          </div>
                        </div>
                        <div className="col-12 text-center">
                          <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                            <button
                              type="submit"
                              className="btn btn-lg px-5 py-3 rounded-pill shadow-lg"
                              style={{ 
                                background: 'linear-gradient(135deg, #AD6269, #8B4A52)',
                                border: 'none',
                                color: 'white',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                minWidth: '200px',
                                transition: 'all 0.3s ease'
                              }}
                              disabled={loading}
                              onMouseOver={(e) => (e.target as HTMLElement).style.transform = 'translateY(-2px)'}
                              onMouseOut={(e) => (e.target as HTMLElement).style.transform = 'translateY(0)'}
                            >
                              {loading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                  Sending Message...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-paper-plane me-2"></i>
                                  Send Message
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-muted mt-3 mb-0">
                            <i className="fas fa-clock me-1"></i>
                            We typically respond within 24 hours
                          </p>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Contact Information Sidebar */}
              <div className="col-lg-4">
                <div className="sticky-top" style={{ top: '100px' }}>
                  {/* Quick Contact Card */}
                  <div className="card border-0 shadow-lg mb-4">
                    <div className="card-header text-center py-4" style={{ background: 'linear-gradient(135deg, #AD6269, #8B4A52)', color: 'white' }}>
                      <i className="fas fa-headset fa-2x mb-2"></i>
                      <h4 className="fw-bold mb-0">Quick Contact</h4>
                    </div>
                    <div className="card-body p-4">
                      <div className="d-grid gap-3">
                        <a href="tel:919-441-0932" className="btn btn-outline-primary btn-lg rounded-pill text-decoration-none">
                          <i className="fas fa-phone-alt me-2"></i>
                          Call (919) 441-0932
                        </a>
                        <a href="mailto:victoria@aprettygirlmatter.com" className="btn btn-outline-primary btn-lg rounded-pill text-decoration-none">
                          <i className="fas fa-envelope me-2"></i>
                          Email Victoria
                        </a>
                        <a href="/book-now-custom" className="btn btn-lg rounded-pill text-decoration-none" style={{ background: 'linear-gradient(135deg, #AD6269, #8B4A52)', color: 'white' }}>
                          <i className="fas fa-calendar-plus me-2"></i>
                          Book Consultation
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Business Hours Card */}
                  <div className="card border-0 shadow-lg mb-4">
                    <div className="card-header text-center py-3" style={{ backgroundColor: 'rgba(173, 98, 105, 0.1)' }}>
                      <h5 className="fw-bold mb-0" style={{ color: '#AD6269' }}>
                        <i className="fas fa-clock me-2"></i>
                        Business Hours
                      </h5>
                    </div>
                    <div className="card-body p-4">
                      <div className="row g-2 text-center">
                        <div className="col-6">
                          <div className="p-2 rounded" style={{ backgroundColor: 'rgba(173, 98, 105, 0.05)' }}>
                            <strong>Mon-Fri</strong><br/>
                            <small className="text-muted">9:00 AM - 6:00 PM</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="p-2 rounded" style={{ backgroundColor: 'rgba(173, 98, 105, 0.05)' }}>
                            <strong>Saturday</strong><br/>
                            <small className="text-muted">10:00 AM - 4:00 PM</small>
                          </div>
                        </div>
                        <div className="col-12 mt-2">
                          <div className="p-2 rounded" style={{ backgroundColor: 'rgba(173, 98, 105, 0.05)' }}>
                            <strong>Sunday</strong><br/>
                            <small className="text-muted">Closed</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location Card */}
                  <div className="card border-0 shadow-lg">
                    <div className="card-header text-center py-3" style={{ backgroundColor: 'rgba(173, 98, 105, 0.1)' }}>
                      <h5 className="fw-bold mb-0" style={{ color: '#AD6269' }}>
                        <i className="fas fa-map-marker-alt me-2"></i>
                        Visit Our Studio
                      </h5>
                    </div>
                    <div className="card-body p-4 text-center">
                      <address className="mb-3">
                        <strong>A Pretty Girl Matter</strong><br/>
                        4040 Barrett Drive Suite 3<br/>
                        Raleigh, NC 27609
                      </address>
                      <button 
                        onClick={() => {
                          const address = "4040 Barrett Drive Suite 3, Raleigh, NC 27609";
                          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                          window.open(googleMapsUrl, '_blank');
                        }}
                        className="btn btn-outline-primary rounded-pill"
                      >
                        <i className="fas fa-directions me-2"></i>
                        Get Directions
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-0">
          <div className="container-fluid p-0">

            <div className="position-relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3239.8234567890123!2d-78.6569!3d35.7796!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDQ2JzQ2LjciTiA3OMKwMzknMjQuOSJX!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                width="100%"
                height="400"
                style={{ border: 0, filter: 'grayscale(20%)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="A Pretty Girl Matter Location"
              ></iframe>
              <div className="position-absolute top-50 start-50 translate-middle">
                <div className="bg-white rounded-pill px-4 py-2 shadow-lg">
                  <strong style={{ color: '#AD6269' }}>
                    <i className="fas fa-map-marker-alt me-2"></i>
                    A Pretty Girl Matter
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h2 className="h3 fw-bold mb-4" style={{ color: '#AD6269' }}>
                  <i className="fas fa-question-circle me-2"></i>
                  Frequently Asked Questions
                </h2>
                
                <div className="accordion" id="contactFAQ">
                  <div className="accordion-item border-0 shadow-sm mb-3">
                    <h3 className="accordion-header">
                      <button className="accordion-button fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                        How quickly will you respond to my inquiry?
                      </button>
                    </h3>
                    <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#contactFAQ">
                      <div className="accordion-body paragraph-text">
                        We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call us directly at (919) 441-0932.
                      </div>
                    </div>
                  </div>
                  
                  <div className="accordion-item border-0 shadow-sm mb-3">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                        What should I include in my message?
                      </button>
                    </h3>
                    <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#contactFAQ">
                      <div className="accordion-body paragraph-text">
                        Please let us know which service you&apos;re interested in, any specific concerns or questions, and your preferred appointment timeframe. Photos of your current brows are also helpful for consultations.
                      </div>
                    </div>
                  </div>
                  
                  <div className="accordion-item border-0 shadow-sm mb-3">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                        Do you offer virtual consultations?
                      </button>
                    </h3>
                    <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#contactFAQ">
                      <div className="accordion-body paragraph-text">
                        Yes! We offer virtual consultations via video call to discuss your goals, answer questions, and determine if you&apos;re a good candidate for permanent makeup services.
                      </div>
                    </div>
                  </div>
                  
                  <div className="accordion-item border-0 shadow-sm">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                        What&apos;s the best way to schedule an appointment?
                      </button>
                    </h3>
                    <div id="faq4" className="accordion-collapse collapse" data-bs-parent="#contactFAQ">
                      <div className="accordion-body paragraph-text">
                        You can schedule by calling us at (919) 441-0932, sending an email, or using the contact form above. We recommend starting with a consultation to discuss your goals and create a personalized treatment plan.
                      </div>
                    </div>
                  </div>
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
