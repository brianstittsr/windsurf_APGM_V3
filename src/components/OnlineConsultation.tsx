'use client';

import { useState } from 'react';

export default function OnlineConsultation() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    service: '',
    preferredDate: '',
    preferredTime: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you! We\'ll contact you within 24 hours to confirm your consultation.');
  };

  return (
    <section id="consultation" className="py-section bg-gradient-rose">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="display-2 fw-bold text-dark mb-4">
            Book Your Free
            <span className="text-rose-600"> Consultation</span>
          </h2>
          <p className="fs-5 text-secondary mx-auto" style={{maxWidth: '48rem'}}>
            Ready to take the next step? Schedule your complimentary consultation to discuss 
            your goals and create a personalized treatment plan.
          </p>
        </div>

        <div className="row g-5 align-items-start">
          {/* Left Side - Benefits */}
          <div className="col-lg-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">What to Expect</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-rose-600 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Personal Assessment</h4>
                    <p className="text-gray-600">We&apos;ll analyze your facial features, skin tone, and lifestyle to recommend the best services for you.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-rose-600 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Design Preview</h4>
                    <p className="text-gray-600">See how your new look will appear with our digital preview and shape mapping techniques.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-rose-600 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Custom Treatment Plan</h4>
                    <p className="text-gray-600">Receive a detailed plan including timeline, aftercare, and pricing tailored to your needs.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-rose-600 font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Questions & Answers</h4>
                    <p className="text-gray-600">Get all your questions answered about the procedure, healing process, and maintenance.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Prefer to Call?</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="text-gray-900 font-semibold">(555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="text-gray-900 font-semibold">hello@victoriabeauty.com</span>
                </div>
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-rose-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-900 font-semibold">123 Beauty Lane<br />Beverly Hills, CA 90210</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-custom rounded-custom p-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                  Service of Interest *
                </label>
                <select
                  id="service"
                  name="service"
                  required
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="">Select a service</option>
                  <option value="microblading">Microblading Eyebrows</option>
                  <option value="eyeliner">Permanent Eyeliner</option>
                  <option value="lips">Lip Blushing</option>
                  <option value="multiple">Multiple Services</option>
                  <option value="consultation">General Consultation</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    id="preferredDate"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time
                  </label>
                  <select
                    id="preferredTime"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  >
                    <option value="">Select time</option>
                    <option value="morning">Morning (9AM - 12PM)</option>
                    <option value="afternoon">Afternoon (12PM - 4PM)</option>
                    <option value="evening">Evening (4PM - 7PM)</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your goals, concerns, or any questions you have..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-rose-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-rose-700 transition-colors"
              >
                Book My Free Consultation
              </button>

              <p className="text-sm text-gray-500 text-center">
                * Required fields. We&apos;ll contact you within 24 hours to confirm your appointment.
              </p>
            </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
