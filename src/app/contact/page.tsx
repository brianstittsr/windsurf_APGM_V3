'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { MessageCircle, Mail, Phone, MapPin, Clock, Send, ChevronDown, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Check for success parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        message: ''
      });
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message
        }),
      });

      if (response.ok) {
        alert('Message sent successfully!');
        setFormData({
          name: '',
          email: '',
          message: ''
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      alert('Error sending message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      question: "Am I a candidate for microblading or permanent brows?",
      answer: "Permanent brows are great for anyone who has no brows, thinning brows or is simply tired of filling in their brows every day. Please refer to the list on the right for contraindications (if viewing on mobile, it will be at the bottom of the page)."
    },
    {
      question: "How long does the procedure take?",
      answer: "Appointments average around two and a half hours. This allows time for paperwork, consultation, brow mapping, pigment selection and the procedure itself. They may be shorter or longer depending on the current state of your brows and your desired look. However long it takes to have you leaving happy!"
    },
    {
      question: "Does it hurt?",
      answer: "Each client's pain tolerance is different, however, the majority of my clients report that the procedure is nowhere near as painful as they expected it to be. A LOT of clients are able to fall asleep and some even have told me it is relaxing! Numbing is provided during the procedure to keep pain at a minimum. This IS a form of tattooing, so discomfort is associated with the procedure, but the numbing agent does a good job minimizing it."
    },
    {
      question: "How long is the recovery time?",
      answer: "There is no immediate downtime after the procedure, though you will need to wash and put ointment on your brows for two weeks (check out the aftercare instructions here). Your brows will go through a few phases while healing. They tend to get darker and then lighter before settling into their true healed color. It is also common to have some flaking and itchiness while healing."
    },
    {
      question: "How long will my brows last?",
      answer: "This is different for everyone. The pigment may never fade out completely but will get lighter over time. Your skin type, lifestyle and many other factors can affect how quickly your brows begin to fade. It is recommended to get touchups to maintain the color and shape over time. A year is standard, but I advise my clients to wait longer if their brows still look good. Some go 2 or 3 years before needing a touchup!"
    },
    {
      question: "Will I still have to keep up with waxing, tweezing, threading, etc?",
      answer: "Yes, hair will continue to grow on your brows as it did before your brow procedure. Whatever maintenance you regularly do, you can continue once your brows have healed."
    },
    {
      question: "How do you choose a shape?",
      answer: "We will map your brows out according to your face shape and proportions. We'll talk about your preferences and I'll draw a shape that I think is a good fit. We can adjust the shape until it looks just right for you."
    },
    {
      question: "How do you choose the right brow color?",
      answer: "We will select the perfect pigment for your brows based on your current brow hair color, hair color, skin tone, and desired results. You will always get to approve the color before beginning! Keep in mind, your brows will usually heal a bit lighter than they look immediately after the procedure."
    },
    {
      question: "Can I have this procedure done while I'm pregnant?",
      answer: "You may not have any permanent makeup done while you are pregnant or breastfeeding."
    },
    {
      question: "I get botox regularly, can I still have this done?",
      answer: "Yes, you can get permanent makeup and botox! You'll just need to space out the appointments. A month before/after each is ideal."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-[#AD6269] to-[#8B4A52]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <MessageCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Get In Touch
              </h1>
              <p className="text-xl text-white/90 leading-relaxed mb-4">
                Ready to enhance your natural beauty? We'd love to hear from you!
              </p>
              <p className="text-white/80 max-w-2xl mx-auto">
                Schedule your consultation today and discover how permanent makeup can transform your daily routine.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form and Info Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-br from-[#AD6269]/10 to-[#8B4A52]/10 p-6 md:p-8 text-center border-b">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#AD6269]/10 rounded-full mb-4">
                      <Mail className="w-8 h-8 text-[#AD6269]" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-[#AD6269] mb-2">
                      Send Us a Message
                    </h2>
                    <p className="text-gray-600">
                      We'll respond within 24 hours with personalized information about your beauty goals
                    </p>
                  </div>
                  
                  <div className="p-6 md:p-8">
                    {success && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <p className="text-green-800 font-medium">
                            Thank you for your message! We'll get back to you within 24 hours.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <p className="text-red-800">{error}</p>
                      </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Your full name"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#AD6269] focus:ring-2 focus:ring-[#AD6269]/20 outline-none transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="your@email.com"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#AD6269] focus:ring-2 focus:ring-[#AD6269]/20 outline-none transition-all"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                          Tell us about your beauty goals *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Share your questions or goals..."
                          rows={5}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#AD6269] focus:ring-2 focus:ring-[#AD6269]/20 outline-none transition-all resize-none"
                          required
                        />
                      </div>
                      
                      <div className="text-center">
                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full md:w-auto bg-gradient-to-r from-[#AD6269] to-[#8B4A52] text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5 mr-2 inline" />
                              Send Message
                            </>
                          )}
                        </Button>
                        <p className="text-gray-500 text-sm mt-4 flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4" />
                          We typically respond within 24 hours
                        </p>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Contact Information Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                <div className="lg:sticky lg:top-24 space-y-6">
                  {/* Quick Contact Card */}
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-[#AD6269] to-[#8B4A52] p-6 text-center">
                      <MessageCircle className="w-10 h-10 text-white mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-white">Quick Contact</h3>
                    </div>
                    <div className="p-6 space-y-3">
                      <a
                        href="tel:919-441-0932"
                        className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-[#AD6269] hover:bg-[#AD6269]/5 transition-all group"
                      >
                        <Phone className="w-5 h-5 text-[#AD6269] group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-gray-700">Call (919) 441-0932</span>
                      </a>
                      <a
                        href="mailto:victoria@aprettygirlmatter.com"
                        className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-[#AD6269] hover:bg-[#AD6269]/5 transition-all group"
                      >
                        <Mail className="w-5 h-5 text-[#AD6269] group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-gray-700">Email Victoria</span>
                      </a>
                      <Link
                        href="/book-now-custom"
                        className="block text-center p-4 bg-gradient-to-r from-[#AD6269] to-[#8B4A52] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        Book Consultation
                      </Link>
                    </div>
                  </div>

                  {/* Business Hours Card */}
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#AD6269]/10 rounded-full flex items-center justify-center">
                        <Clock className="w-5 h-5 text-[#AD6269]" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Business Hours</h3>
                    </div>
                    <div className="bg-[#AD6269]/5 rounded-xl p-4 text-center">
                      <p className="font-bold text-[#AD6269] text-lg mb-1">By Appointment Only</p>
                      <p className="text-gray-600 text-sm">
                        Please call or book online to schedule your consultation
                      </p>
                    </div>
                  </div>

                  {/* Location Card */}
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-[#AD6269]/10 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-[#AD6269]" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Visit Our Studio</h3>
                    </div>
                    <div className="text-center space-y-4">
                      <address className="not-italic text-gray-600">
                        <p className="font-bold text-gray-900">A Pretty Girl Matter</p>
                        <p>4040 Barrett Drive Suite 3</p>
                        <p>Raleigh, NC 27609</p>
                      </address>
                      <button
                        onClick={() => {
                          const address = "4040 Barrett Drive Suite 3, Raleigh, NC 27609";
                          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
                          window.open(googleMapsUrl, '_blank');
                        }}
                        className="w-full px-4 py-3 border-2 border-[#AD6269] text-[#AD6269] rounded-xl font-semibold hover:bg-[#AD6269] hover:text-white transition-all"
                      >
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
        <section className="relative">
          <div className="h-[400px] bg-gray-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3239.8234567890123!2d-78.6569!3d35.7796!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDQ2JzQ2LjciTiA3OMKwMzknMjQuOSJX!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(20%)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="A Pretty Girl Matter Location"
            />
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white rounded-full px-6 py-3 shadow-lg">
              <span className="font-bold text-[#AD6269] flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                A Pretty Girl Matter
              </span>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-[#AD6269] mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-gray-600">
                  Find answers to common questions about permanent makeup
                </p>
              </div>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-[#AD6269] transition-transform flex-shrink-0 ${
                          openFaq === index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openFaq === index && (
                      <div className="px-6 pb-5 pt-2">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
