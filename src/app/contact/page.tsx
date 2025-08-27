'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useContactForm } from '@/hooks/useFirebase';

// Bootstrap JavaScript for accordion functionality
declare global {
  interface Window {
    bootstrap: any;
  }
}

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

  // Check for success parameter in URL and initialize Bootstrap
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
      });
    }

    // Initialize Bootstrap accordion functionality
    const initBootstrap = () => {
      if (typeof window !== 'undefined') {
        // Load Bootstrap JS if not already loaded
        if (!window.bootstrap) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
          script.onload = () => {
            console.log('Bootstrap JS loaded');
          };
          document.head.appendChild(script);
        }
      }
    };

    initBootstrap();
  }, []);

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
    
    // Direct form submission to FormSubmit (guaranteed to work)
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://formsubmit.co/victoria@aprettygirlmatter.com';
    form.style.display = 'none';

    // Add form fields
    const fields = [
      { name: 'name', value: formData.name },
      { name: 'email', value: formData.email },
      { name: 'phone', value: formData.phone || 'Not provided' },
      { name: 'service', value: formData.service || 'Not specified' },
      { name: 'message', value: formData.message },
      { name: '_subject', value: `New Contact Form Submission from ${formData.name}` },
      { name: '_cc', value: 'brianstittsr@gmail.com' },
      { name: '_template', value: 'table' },
      { name: '_next', value: window.location.origin + '/contact?success=true' }
    ];

    fields.forEach(field => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = field.name;
      input.value = field.value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
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
                    <p className="mb-0">Schedule your consultation today and discover how semi-permanent makeup can transform your daily routine.</p>
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
                      <div className="text-center">
                        <div className="p-4 rounded" style={{ backgroundColor: 'rgba(173, 98, 105, 0.05)' }}>
                          <strong className="d-block mb-2" style={{ color: '#AD6269', fontSize: '1.1rem' }}>By Appointment Only</strong>
                          <small className="text-muted">
                            Please call or book online to schedule your consultation
                          </small>
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
              <div className="col-lg-10 text-center">
                <h2 className="h3 fw-bold mb-4" style={{ color: '#AD6269' }}>
                  <i className="fas fa-question-circle me-2"></i>
                  Frequently Asked Questions
                </h2>
                
                <div className="accordion" id="contactFAQ">
                  <div className="accordion-item border-0 shadow-sm mb-3">
                    <h3 className="accordion-header" id="heading1">
                      <button className="accordion-button fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#faq1" aria-expanded="true" aria-controls="faq1">
                        Am I a candidate for microblading or semi-permanent brows?
                      </button>
                    </h3>
                    <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#contactFAQ" aria-labelledby="heading1">
                      <div className="accordion-body paragraph-text text-start">
                        Permanent brows are great for anyone who has no brows, thinning brows or is simply tired of filling in their brows every day. Please refer to the list on the right for contraindications (if viewing on mobile, it will be at the bottom of the page).
                      </div>
                    </div>
                  </div>
                  
                  <div className="accordion-item border-0 shadow-sm mb-3">
                    <h3 className="accordion-header" id="heading2">
                      <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#faq2" aria-expanded="false" aria-controls="faq2">
                        How long does the procedure take?
                      </button>
                    </h3>
                    <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#contactFAQ" aria-labelledby="heading2">
                      <div className="accordion-body paragraph-text text-start">
                        Appointments average around two and a half hours. This allows time for paperwork, consultation, brow mapping, pigment selection and the procedure itself. They may be shorter or longer depending on the current state of your brows and your desired look. However long it takes to have you leaving happy!
                      </div>
                    </div>
                  </div>
                  
                  <div className="accordion-item border-0 shadow-sm mb-3">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                        Does it hurt?
                      </button>
                    </h3>
                    <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#contactFAQ">
                      <div className="accordion-body paragraph-text text-start">
                        Each client&apos;s pain tolerance is different, however, the majority of my clients report that the procedure is nowhere near as painful as they expected it to be. A LOT of clients are able to fall asleep and some even have told me it is relaxing! Numbing is provided during the procedure to keep pain at a minimum. This IS a form of tattooing, so discomfort is associated with the procedure, but the numbing agent does a good job minimizing it.
                      </div>
                    </div>
                  </div>
                  
                  <div className="accordion-item border-0 shadow-sm mb-3">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                        How long is the recovery time?
                      </button>
                    </h3>
                    <div id="faq4" className="accordion-collapse collapse" data-bs-parent="#contactFAQ">
                      <div className="accordion-body paragraph-text text-start">
                        There is no immediate downtime after the procedure, though you will need to wash and put ointment on your brows for two weeks (check out the aftercare instructions here). Your brows will go through a few phases while healing. They tend to get darker and then lighter before settling into their true healed color. It is also common to have some flaking and itchiness while healing.
                      </div>
                    </div>
                  </div>
                  
                  <div className="accordion-item border-0 shadow-sm mb-3">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#faq5">
                        How long will my brows last?
                      </button>
                    </h3>
                    <div id="faq5" className="accordion-collapse collapse" data-bs-parent="#contactFAQ">
                      <div className="accordion-body paragraph-text text-start">
                        This is different for everyone. The pigment may never fade out completely but will get lighter over time. Your skin type, lifestyle and many other factors can affect how quickly your brows begin to fade. It is recommended to get touchups to maintain the color and shape over time. A year is standard, but I advise my clients to wait longer if their brows still look good. Some go 2 or 3 years before needing a touchup!
                      </div>
                    </div>
                  </div>
                  
                  <div className="accordion-item border-0 shadow-sm mb-3">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#faq6">
                        How do you choose a shape?
                      </button>
                    </h3>
                    <div id="faq6" className="accordion-collapse collapse" data-bs-parent="#contactFAQ">
                      <div className="accordion-body paragraph-text text-start">
                        We will map your brows out according to your face shape and proportions. We&apos;ll talk about your preferences and I&apos;ll draw a shape that I think is a good fit. We can adjust the shape until it looks just right for you.
                      </div>
                    </div>
                  </div>
                  
                  <div className="accordion-item border-0 shadow-sm mb-3">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#faq7">
                        How do you choose the right brow color?
                      </button>
                    </h3>
                    <div id="faq7" className="accordion-collapse collapse" data-bs-parent="#contactFAQ">
                      <div className="accordion-body paragraph-text text-start">
                        We will select the perfect pigment for your brows based on your current brow hair color, hair color, skin tone, and desired results. You will always get to approve the color before beginning! Keep in mind, your brows will usually heal a bit lighter than they look immediately after the procedure.
                      </div>
                    </div>
                  </div>
                  
                  <div className="accordion-item border-0 shadow-sm mb-3">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#faq8">
                        Can I have this procedure done while I&apos;m pregnant?
                      </button>
                    </h3>
                    <div id="faq8" className="accordion-collapse collapse" data-bs-parent="#contactFAQ">
                      <div className="accordion-body paragraph-text text-start">
                        You may not have any semi-permanent makeup done while you are pregnant or breastfeeding.
                      </div>
                    </div>
                  </div>
                  
                  <div className="accordion-item border-0 shadow-sm mb-3">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#faq9">
                        I get botox regularly, can I still have this done?
                      </button>
                    </h3>
                    <div id="faq9" className="accordion-collapse collapse" data-bs-parent="#contactFAQ">
                      <div className="accordion-body paragraph-text text-start">
                        Yes, you can get semi-permanent makeup and botox! You&apos;ll just need to space out the appointments. A month before/after each is ideal.
                      </div>
                    </div>
                  </div>
                  
                  <div className="accordion-item border-0 shadow-sm">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#faq10">
                        Will I still have to keep up with waxing, tweezing, threading, etc?
                      </button>
                    </h3>
                    <div id="faq10" className="accordion-collapse collapse" data-bs-parent="#contactFAQ">
                      <div className="accordion-body paragraph-text text-start">
                        Yes, hair will continue to grow on your brows as it did before your brow procedure. Whatever maintenance you regularly do, you can continue once your brows have healed.
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
