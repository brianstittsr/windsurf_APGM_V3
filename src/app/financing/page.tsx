'use client';

import { useState } from 'react';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    return Math.round((amount / 12) * 100) / 100;
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-[140px]">
        {/* Header Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#AD6269]">PAY YOUR WAY</h1>
              <p className="text-xl text-gray-600 mb-4">Payment options that make it easy.</p>
              <p className="text-gray-500">
                Everyone should be able to get their dream brows. A Pretty Girl Matter offers several ways to pay so that payment doesn&apos;t get in the way!
              </p>
            </div>
          </div>
        </section>

        {/* Payment Options */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pay Direct */}
              <Card className="shadow-md border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-[#AD6269] flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Pay Direct</h3>
                  </div>
                  <p className="text-gray-500">
                    When booking your appointment, you have the option to pay in full or pay a $250 deposit and the remainder is due at the time of service.
                  </p>
                </CardContent>
              </Card>

              {/* Pay with Cherry */}
              <Card className="shadow-md border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                      <img 
                        src="https://cdn.prod.website-files.com/681bf1d6f7dea459fe255c59/68252146834983973a92051f_cherry-logo-primary.svg" 
                        alt="Cherry Logo" 
                        className="w-10 h-10"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Pay with Cherry</h3>
                  </div>
                  <p className="text-gray-500">
                    Choose from a range of monthly payment plans, with qualifying 0% APR options. Applying is simple and does not impact your credit score. If you&apos;re approved for financing, you can use your funds immediately.
                  </p>
                </CardContent>
              </Card>

              {/* Pay with Klarna */}
              <Card className="shadow-md border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                      <img 
                        src="https://logos-world.net/wp-content/uploads/2024/06/Klarna-Symbol.png" 
                        alt="Klarna Logo" 
                        className="w-10 h-10"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Pay with Klarna</h3>
                  </div>
                  <p className="text-gray-500">
                    A Pretty Girl Matter has partnered with Klarna as a quick and easy financing option! Please submit the form below to request to pay with Klarna. You will receive a payment link via email.
                  </p>
                </CardContent>
              </Card>

              {/* Pay with Affirm */}
              <Card className="shadow-md border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                      <img 
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQASxDA7wX68xJ32zCBksW76SH8skp63-eZw&s" 
                        alt="Affirm Logo" 
                        className="w-10 h-10"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Pay with Affirm</h3>
                  </div>
                  <p className="text-gray-500">
                    Buy now, pay later with Affirm. Choose from flexible monthly payment plans with transparent terms and no hidden fees. Get instant approval and pay over time.
                  </p>
                </CardContent>
              </Card>

              {/* Pay with PayPal Credit */}
              <Card className="shadow-md border-0 lg:col-span-2 lg:max-w-[calc(50%-12px)]">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                      <img 
                        src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png" 
                        alt="PayPal Logo" 
                        className="w-10 h-10"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Pay with PayPal Credit</h3>
                  </div>
                  <p className="text-gray-500">
                    Shop with PayPal Credit&apos;s digital, reusable credit line to get No Interest if paid in full in 6 months on purchases of $99 or more. Select PayPal as method of payment when booking your appointment.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Cherry Promotion Section */}
        <section className="py-16 bg-[#AD6269] text-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="lg:w-2/3">
                <h2 className="text-3xl font-bold mb-3">Get Care Now, Pay Later</h2>
                <p className="text-white/90 mb-3">with Cherry & A Pretty Girl Matter</p>
                <p className="text-white/80">
                  Let your money go further and take better control of your cash flow when you pay over time in smaller installments with Cherry.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Calculator */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-3 text-[#AD6269]">Flexible Payments For Any Budget</h2>
                <p className="text-gray-500">Use the payment calculator to simulate what your monthly payments could look like.</p>
              </div>
              
              <Card className="shadow-lg border-0">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <Label htmlFor="purchaseAmount" className="text-base font-semibold mb-2 block">Purchase Amount</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                      <Input
                        type="number"
                        id="purchaseAmount"
                        placeholder="Enter amount"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(e.target.value)}
                        className="pl-8 h-12 text-lg"
                      />
                    </div>
                  </div>
                  
                  <div className="text-center py-6">
                    <div className="text-4xl font-bold text-[#AD6269] mb-2">
                      {purchaseAmount && parseFloat(purchaseAmount) >= 100 
                        ? `$${calculateMonthlyPayment(parseFloat(purchaseAmount)).toFixed(2)} / month`
                        : '$--.-- / month'
                      }
                    </div>
                    <p className="text-gray-500 text-sm">
                      {purchaseAmount && parseFloat(purchaseAmount) >= 100 
                        ? 'Estimated monthly payment'
                        : 'Enter a purchase amount to see estimated payments'
                      }
                    </p>
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-4">
                    These are examples only. 0% APR and other promotional rates subject to eligibility. Exact terms and APR depend on credit score and other factors.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">How It Works</h2>
              <p className="text-gray-500 text-lg">
                Choose from a range of monthly payment plans, with qualifying 0% APR options. Applying is simple and does not impact your credit score. If you&apos;re approved for financing, you can use your funds immediately. Manage your payment options using Cherry&apos;s self-serve consumer portal.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3 text-[#AD6269]">Testimonials</h2>
              <p className="text-gray-500">Don&apos;t just take our word for it! Here&apos;s what other consumers have to say about Cherry…</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="shadow-md border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 relative">
                        <Image
                          src={testimonial.image}
                          alt={`${testimonial.name} testimonial photo`}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      </div>
                      <h5 className="font-bold text-gray-900">{testimonial.name}</h5>
                    </div>
                    <p className="text-gray-500 italic">&quot;{testimonial.text}&quot;</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
              </div>
              
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      className={`w-full px-6 py-4 text-left font-medium flex items-center justify-between transition-colors ${
                        expandedFAQ === index ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => toggleFAQ(index)}
                    >
                      <span>{faq.question}</span>
                      <svg 
                        className={`w-5 h-5 text-gray-500 transition-transform ${expandedFAQ === index ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-6 py-4 bg-white border-t border-gray-100">
                        <p className="text-gray-500">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Manage Plan Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-3 text-[#AD6269]">Manage My Plan</h2>
              <p className="text-gray-500">Manage your payment plans inside the Cherry Consumer Portal.</p>
            </div>
          </div>
        </section>

        {/* Footer Disclaimer */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="text-center text-xs text-gray-400 space-y-2">
              <p>
                Payment options through Cherry Technologies, Inc. are issued by the following lending partners: withcherry.com/lending-partners. See withcherry.com/terms for details.
              </p>
              <p>
                Iowa only: Borrowers are subject to Iowa state specific underwriting criteria. APR for all Iowa borrowers is capped at 20.99%.
              </p>
              <p>
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
