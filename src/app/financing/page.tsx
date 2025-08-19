'use client';

import { useState } from 'react';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function FinancingPage() {
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const testimonials = [
    {
      name: "Bryana",
      image: "/images/testimonial-bryana.jpg",
      text: "I was worried the application would take long, I would have paid on my credit card – but it only took a few minutes and I'm so happy I can split my payments up now!"
    },
    {
      name: "Alex", 
      image: "/images/testimonial-alex.jpg",
      text: "Cherry was really easy to use and super fast. I can't wait to go back and try different services now that I can split my payments!"
    },
    {
      name: "Marie",
      image: "/images/testimonial-marie.jpg",
      text: "I used this on Monday and it was great. Low down payment and low monthly. You all should try it."
    },
    {
      name: "Gabriel",
      image: "/images/testimonial-gabriel.jpg",
      text: "Cherry was great, one of the better lending companies I've ever used. Making payments was a lot easier and I appreciate that Cherry was willing to work with me."
    },
    {
      name: "Alyssa",
      image: "/images/testimonial-alyssa.jpg",
      text: "Cherry is amazing!!! Now we can get everything done!!"
    },
    {
      name: "Cassie",
      image: "/images/testimonial-cassie.jpg",
      text: "I've been putting off these treatments for a long time. I scheduled them all today using Cherry!"
    }
  ];

  const faqs = [
    {
      question: "What is Cherry?",
      answer: "Cherry is a financing platform that allows you to pay for your treatments over time with flexible payment plans and qualifying 0% APR options."
    },
    {
      question: "How long is my approval valid for?",
      answer: "Your Cherry approval is typically valid for 30 days from the date of approval."
    },
    {
      question: "Can I increase my approval amount?",
      answer: "Yes, you can apply for an increased approval amount through your Cherry consumer portal."
    },
    {
      question: "Can I pay this off early?",
      answer: "Yes, you can pay off your Cherry plan early without any prepayment penalties."
    },
    {
      question: "Does my 0% APR offer expire?",
      answer: "0% APR offers are promotional and have specific terms. Check your approval details for expiration information."
    },
    {
      question: "How much is my down payment and when is it due?",
      answer: "Down payment amounts vary based on your approval. Payment is typically due at the time of service."
    },
    {
      question: "How are refunds handled?",
      answer: "Refunds are processed according to our refund policy and coordinated with Cherry for financed purchases."
    },
    {
      question: "Does Cherry report to the credit bureaus?",
      answer: "Cherry may report payment history to credit bureaus. Check your agreement for specific details."
    },
    {
      question: "Can missing payments on my account with Cherry hurt my credit?",
      answer: "Yes, missed payments may be reported to credit bureaus and could impact your credit score."
    }
  ];

  const calculateMonthlyPayment = (amount: number) => {
    if (amount < 100) return 0;
    // Simple calculation for demonstration - actual rates vary
    return Math.round((amount / 12) * 100) / 100;
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <>
      <Header />
      <main className="min-vh-100" style={{ paddingTop: '140px' }}>
      {/* Header Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="main-heading fw-bold mb-3" style={{color: '#AD6269'}}>PAY YOUR WAY</h1>
              <p className="sub-heading text-secondary mb-4">Payment options that make it easy.</p>
              <p className="paragraph-text text-muted">
                Everyone should be able to get their dream brows. A Pretty Girl Matter offers several ways to pay so that payment doesn&apos;t get in the way!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="text-center mb-4">
                <h2 className="sub-heading fw-bold mb-3">Learn About Our Financing Options</h2>
                <p className="paragraph-text text-muted">Watch this video to understand how our payment plans work</p>
              </div>
              <div className="card border-0 shadow-sm">
                <div className="card-body p-0">
                  <div className="ratio ratio-16x9">
                    <iframe
                      src="https://player.vimeo.com/video/940910554?h=785e3d133f&badge=0&autopause=0&player_id=0&app_id=58479"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title="Financing Options Video"
                      className="rounded"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Options */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            {/* Pay Direct */}
            <div className="col-lg-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary rounded-circle p-3 me-3">
                      <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <h3 className="h4 fw-bold mb-0">Pay Direct</h3>
                  </div>
                  <p className="text-muted">
                    When booking your appointment, you have the option to pay in full or pay a $250 deposit and the remainder is due at the time of service.
                  </p>
                </div>
              </div>
            </div>

            {/* Pay with Cherry */}
            <div className="col-lg-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="d-flex align-items-center justify-content-center me-3" style={{width: '60px', height: '60px', backgroundColor: 'white', borderRadius: '50%'}}>
                      <img 
                        src="https://cdn.prod.website-files.com/681bf1d6f7dea459fe255c59/68252146834983973a92051f_cherry-logo-primary.svg" 
                        alt="Cherry Logo" 
                        style={{width: '40px', height: '40px'}}
                      />
                    </div>
                    <h3 className="h4 fw-bold mb-0">Pay with Cherry</h3>
                  </div>
                  <p className="text-muted mb-3">
                    Choose from a range of monthly payment plans, with qualifying 0% APR options. Applying is simple and does not impact your credit score. If you&apos;re approved for financing, you can use your funds immediately.
                  </p>
                  <a href="#" className="btn rounded-pill px-4 book-now-button" style={{backgroundColor: '#AD6269', borderColor: '#AD6269', color: 'white'}}>USE CHERRY</a>
                </div>
              </div>
            </div>

            {/* Pay with Klarna */}
            <div className="col-lg-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="d-flex align-items-center justify-content-center me-3" style={{width: '60px', height: '60px', backgroundColor: 'white', borderRadius: '50%'}}>
                      <img 
                        src="https://logos-world.net/wp-content/uploads/2024/06/Klarna-Symbol.png" 
                        alt="Klarna Logo" 
                        style={{width: '40px', height: '40px'}}
                      />
                    </div>
                    <h3 className="h4 fw-bold mb-0">Pay with Klarna</h3>
                  </div>
                  <p className="text-muted mb-3">
                    A Pretty Girl Matter has partnered with Klarna as a quick and easy financing option! Please submit the form below to request to pay with Klarna. You will receive a payment link via email.
                  </p>
                  <a href="#" className="btn btn-warning rounded-pill px-4 book-now-button">USE KLARNA</a>
                </div>
              </div>
            </div>

            {/* Pay with Affirm */}
            <div className="col-lg-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="d-flex align-items-center justify-content-center me-3" style={{width: '60px', height: '60px', backgroundColor: 'white', borderRadius: '50%'}}>
                      <img 
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQASxDA7wX68xJ32zCBksW76SH8skp63-eZw&s" 
                        alt="Affirm Logo" 
                        style={{width: '40px', height: '40px'}}
                      />
                    </div>
                    <h3 className="h4 fw-bold mb-0">Pay with Affirm</h3>
                  </div>
                  <p className="text-muted mb-3">
                    Buy now, pay later with Affirm. Choose from flexible monthly payment plans with transparent terms and no hidden fees. Get instant approval and pay over time.
                  </p>
                  <a href="#" className="btn rounded-pill px-4 book-now-button" style={{backgroundColor: '#0FA8E6', borderColor: '#0FA8E6', color: 'white'}}>USE AFFIRM</a>
                </div>
              </div>
            </div>

            {/* Pay with PayPal Credit */}
            <div className="col-lg-6">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="rounded-circle p-3 me-3" style={{backgroundColor: '#0070BA'}}>
                      <i className="fab fa-paypal" style={{fontSize: '24px', color: 'white'}}></i>
                    </div>
                    <h3 className="h4 fw-bold mb-0">Pay with PayPal Credit</h3>
                  </div>
                  <p className="text-muted">
                    Shop with PayPal Credit&apos;s digital, reusable credit line to get No Interest if paid in full in 6 months on purchases of $99 or more. Select PayPal as method of payment when booking your appointment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cherry Promotion Section */}
      <section className="py-5 text-white" style={{backgroundColor: '#AD6269'}}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h2 className="sub-heading fw-bold mb-3">Get Care Now, Pay Later</h2>
              <p className="mb-3">with Cherry & A Pretty Girl Matter</p>
              <p className="mb-4">
                Let your money go further and take better control of your cash flow when you pay over time in smaller installments with Cherry.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <a href="#" className="btn btn-light btn-lg rounded-pill px-5 me-3 book-now-button">APPLY</a>
              <a href="#" className="btn btn-outline-light rounded-pill px-4 book-now-button">CHERRY CONSUMER PORTAL</a>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Calculator */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="text-center mb-5">
                <h2 className="sub-heading fw-bold mb-3" style={{color: '#AD6269'}}>Flexible Payments For Any Budget</h2>
                <p className="paragraph-text text-muted">Use the payment calculator to simulate what your monthly payments could look like.</p>
              </div>
              
              <div className="card border-0 shadow-sm">
                <div className="card-body p-5">
                  <div className="mb-4">
                    <label htmlFor="purchaseAmount" className="form-label fw-semibold">Purchase Amount</label>
                    <div className="input-group input-group-lg">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className="form-control"
                        id="purchaseAmount"
                        placeholder="Enter amount"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="display-6 fw-bold text-primary mb-2">
                      {purchaseAmount && parseFloat(purchaseAmount) >= 100 
                        ? `$${calculateMonthlyPayment(parseFloat(purchaseAmount)).toFixed(2)} / month`
                        : '$--.-- / month'
                      }
                    </div>
                    <p className="text-muted small mb-4">
                      {purchaseAmount && parseFloat(purchaseAmount) >= 100 
                        ? 'Estimated monthly payment'
                        : 'Enter a purchase amount to see estimated payments'
                      }
                    </p>
                    <a href="#" className="btn btn-lg rounded-pill px-5 book-now-button" style={{backgroundColor: '#AD6269', borderColor: '#AD6269', color: 'white'}}>Apply</a>
                  </div>
                  
                  <p className="small text-muted mt-4">
                    These are examples only. 0% APR and other promotional rates subject to eligibility. Exact terms and APR depend on credit score and other factors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="sub-heading fw-bold mb-4">How It Works</h2>
              <p className="text-muted lead">
                Choose from a range of monthly payment plans, with qualifying 0% APR options. Applying is simple and does not impact your credit score. If you&apos;re approved for financing, you can use your funds immediately. Manage your payment options using Cherry&apos;s self-serve consumer portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="sub-heading fw-bold mb-3" style={{color: '#AD6269'}}>Testimonials</h2>
            <p className="paragraph-text text-muted">Don&apos;t just take our word for it! Here&apos;s what other consumers have to say about Cherry…</p>
          </div>
          
          <div className="row g-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="col-lg-4 col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="me-3" style={{width: '50px', height: '50px'}}>
                        <Image
                          src={testimonial.image}
                          alt={`${testimonial.name} testimonial photo`}
                          width={50}
                          height={50}
                          className="rounded-circle"
                          style={{objectFit: 'cover'}}
                        />
                      </div>
                      <h5 className="fw-bold mb-0">{testimonial.name}</h5>
                    </div>
                    <p className="text-muted mb-0">&quot;{testimonial.text}&quot;</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="text-center mb-5">
                <h2 className="sub-heading fw-bold">Frequently Asked Questions</h2>
              </div>
              
              <div className="accordion" id="faqAccordion">
                {faqs.map((faq, index) => (
                  <div key={index} className="accordion-item border-0 mb-3">
                    <h3 className="accordion-header">
                      <button
                        className={`accordion-button ${expandedFAQ === index ? '' : 'collapsed'} shadow-none`}
                        type="button"
                        onClick={() => toggleFAQ(index)}
                        style={{backgroundColor: expandedFAQ === index ? '#f8f9fa' : 'white'}}
                      >
                        {faq.question}
                      </button>
                    </h3>
                    <div className={`accordion-collapse collapse ${expandedFAQ === index ? 'show' : ''}`}>
                      <div className="accordion-body">
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

      {/* Manage Plan Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-6">
              <h2 className="sub-heading fw-bold mb-3" style={{color: '#AD6269'}}>Manage My Plan</h2>
              <p className="paragraph-text text-muted mb-4">Manage your payment plans inside the Cherry Consumer Portal.</p>
              <a href="#" className="btn btn-lg rounded-pill px-5 book-now-button" style={{backgroundColor: '#AD6269', borderColor: '#AD6269', color: 'white'}}>CHERRY CONSUMER PORTAL</a>
            </div>
          </div>
        </div>
      </section>

      {/* More Questions */}
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-6">
              <h2 className="sub-heading fw-bold mb-3">More Questions?</h2>
              <a href="#" className="btn btn-outline-primary rounded-pill px-4 book-now-button">Visit our Help Center</a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Disclaimer */}
      <section className="py-4 bg-dark text-white">
        <div className="container">
          <div className="text-center">
            <p className="small mb-2">
              Payment options through Cherry Technologies, Inc. are issued by the following lending partners: withcherry.com/lending-partners. See withcherry.com/terms for details.
            </p>
            <p className="small mb-2">
              Iowa only: Borrowers are subject to Iowa state specific underwriting criteria. APR for all Iowa borrowers is capped at 20.99%.
            </p>
            <p className="small mb-0">
              Copyright © 2020-2025 Cherry Technologies Inc. NMLS #2061234, 2 Embarcadero Center, 8th Floor, San Francisco, CA 94111.
            </p>
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}
