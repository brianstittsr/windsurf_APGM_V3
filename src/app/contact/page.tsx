'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

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
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitMessage('Thank you for your message! We\'ll get back to you within 24 hours.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <>
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-primary text-white py-5">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h1 className="display-4 fw-bold mb-3">Contact Us</h1>
              </div>
              <div className="col-lg-4 text-lg-end">
                <div className="bg-white bg-opacity-10 rounded-3 p-4">
                  <h5 className="fw-bold mb-3">Quick Contact</h5>
                  <div className="mb-2">
                    <i className="bi bi-telephone-fill me-2"></i>
                    <a href="tel:919-441-0932" className="text-white text-decoration-none">
                      (919) 441-0932
                    </a>
                  </div>
                  <div className="mb-2">
                    <i className="bi bi-envelope-fill me-2"></i>
                    <a href="mailto:victoria@aprettygirlmatter.com" className="text-white text-decoration-none">
                      victoria@aprettygirlmatter.com
                    </a>
                  </div>
                  <div>
                    <i className="bi bi-geo-alt-fill me-2"></i>
                    <span>Raleigh, NC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form and Map Section */}
        <section className="py-5">
          <div className="container">
            <div className="row g-5">
              {/* Contact Form */}
              <div className="col-lg-6">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-4">
                    <h2 className="h3 fw-bold mb-4 text-primary">Send Us a Message</h2>
                    
                    {submitMessage && (
                      <div className="alert alert-success" role="alert">
                        {submitMessage}
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label htmlFor="name" className="form-label fw-semibold">
                            Full Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="email" className="form-label fw-semibold">
                            Email Address <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="phone" className="form-label fw-semibold">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            className="form-control"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="(919) 555-0123"
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="service" className="form-label fw-semibold">
                            Service of Interest
                          </label>
                          <select
                            className="form-select"
                            id="service"
                            name="service"
                            value={formData.service}
                            onChange={handleInputChange}
                          >
                            <option value="">Select a service...</option>
                            {services.map((service) => (
                              <option key={service} value={service}>
                                {service}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-12">
                          <label htmlFor="message" className="form-label fw-semibold">
                            Message <span className="text-danger">*</span>
                          </label>
                          <textarea
                            className="form-control"
                            id="message"
                            name="message"
                            rows={5}
                            value={formData.message}
                            onChange={handleInputChange}
                            placeholder="Tell us about your goals, any questions you have, or specific concerns..."
                            required
                          ></textarea>
                        </div>
                        <div className="col-12">
                          <button
                            type="submit"
                            className="btn btn-primary btn-lg rounded-pill px-5"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Sending...
                              </>
                            ) : (
                              'Send Message'
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Contact Information Cards */}
                <div className="row g-3 mt-4">
                  <div className="col-md-4">
                    <div className="card border-0 bg-light text-center p-3">
                      <div className="text-primary mb-2">
                        <i className="bi bi-telephone-fill fs-1"></i>
                      </div>
                      <h6 className="fw-bold mb-1">Phone</h6>
                      <a href="tel:919-441-0932" className="text-decoration-none text-muted small">
                        (919) 441-0932
                      </a>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card border-0 bg-light text-center p-3">
                      <div className="text-primary mb-2">
                        <i className="bi bi-envelope-fill fs-1"></i>
                      </div>
                      <h6 className="fw-bold mb-1">Email</h6>
                      <a href="mailto:victoria@aprettygirlmatter.com" className="text-decoration-none text-muted small">
                        victoria@aprettygirlmatter.com
                      </a>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="card border-0 bg-light text-center p-3">
                      <div className="text-primary mb-2">
                        <i className="bi bi-geo-alt-fill fs-1"></i>
                      </div>
                      <h6 className="fw-bold mb-1">Location</h6>
                      <span className="text-muted small">Raleigh, NC</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="col-lg-6">
                {/* Map */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-body p-0">
                    <div className="bg-primary text-white p-3">
                      <h3 className="h5 fw-bold mb-0">Our Location</h3>
                    </div>
                    <div className="position-relative" style={{height: '350px'}}>
                      <iframe
                        src="https://www.google.com/maps?q=4040+Barrett+Drive+Suite+3,+Raleigh,+NC+27609&output=embed&z=16"
                        width="100%"
                        height="100%"
                        className="border-0"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="A Pretty Girl Matter Location"
                      ></iframe>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="alert alert-info mt-4" role="alert">
                  <h6 className="fw-bold mb-2">
                    <i className="bi bi-telephone-fill me-2"></i>
                    24/7 Aftercare Support
                  </h6>
                  <p className="mb-0 small">
                    For post-treatment questions or concerns, call our 24/7 aftercare line at 
                    <strong> (919) 441-0932</strong>. We&apos;re here to support your healing journey.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="text-center mb-5">
                  <h2 className="h3 fw-bold mb-3">Frequently Asked Questions</h2>
                  <p className="text-muted">Quick answers to common questions about contacting us and scheduling appointments.</p>
                </div>
                
                <div className="accordion" id="contactFAQ">
                  <div className="accordion-item border-0 shadow-sm mb-3">
                    <h3 className="accordion-header">
                      <button className="accordion-button fw-semibold" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                        How quickly will you respond to my inquiry?
                      </button>
                    </h3>
                    <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#contactFAQ">
                      <div className="accordion-body">
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
                      <div className="accordion-body">
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
                      <div className="accordion-body">
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
                      <div className="accordion-body">
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
