'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function FinancingPage() {
  const [purchaseAmount, setPurchaseAmount] = useState('500');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [selectedTerm, setSelectedTerm] = useState(12);
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Animate the counter
    const targetValue = purchaseAmount ? parseFloat(purchaseAmount) : 0;
    const duration = 1000;
    const steps = 60;
    const increment = targetValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        setAnimatedValue(targetValue);
        clearInterval(timer);
      } else {
        setAnimatedValue(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [purchaseAmount]);

  const benefits = [
    { icon: '⚡', title: 'Instant Approval', desc: 'Get approved in seconds, not days' },
    { icon: '🔒', title: 'No Hard Credit Check', desc: 'Soft inquiry won\'t affect your score' },
    { icon: '💰', title: '0% APR Available', desc: 'Qualifying customers pay zero interest' },
    { icon: '📅', title: 'Flexible Terms', desc: 'Choose 3, 6, or 12 month plans' },
  ];

  const popularServices = [
    { name: 'Microblading', price: 450, image: '🎨' },
    { name: 'Lip Blush', price: 400, image: '💋' },
    { name: 'Powder Brows', price: 500, image: '✨' },
    { name: 'Combo Brows', price: 550, image: '💫' },
  ];

  const testimonials = [
    {
      name: "Bryana",
      rating: 5,
      text: "I was worried the application would take long – but it only took a few minutes and I'm so happy I can split my payments up now!"
    },
    {
      name: "Alex", 
      rating: 5,
      text: "Cherry was really easy to use and super fast. I can't wait to go back and try different services now that I can split my payments!"
    },
    {
      name: "Marie",
      rating: 5,
      text: "Low down payment and low monthly. You all should try it. I got my dream brows without breaking the bank!"
    },
  ];

  const faqs = [
    {
      question: "What is Buy Now, Pay Later?",
      answer: "Buy Now, Pay Later allows you to get your beauty treatments today and pay over time in easy monthly installments. No need to wait or save up – get the look you want now!"
    },
    {
      question: "Will this affect my credit score?",
      answer: "Applying for financing uses a soft credit check which does NOT impact your credit score. Only approved and accepted plans may be reported to credit bureaus."
    },
    {
      question: "How fast can I get approved?",
      answer: "Most approvals happen instantly! Simply fill out a quick application and you'll know your approval amount within seconds."
    },
    {
      question: "Can I pay off early?",
      answer: "Yes! You can pay off your plan early at any time with no prepayment penalties. We encourage it!"
    },
    {
      question: "What payment options are available?",
      answer: "We offer Cherry, Klarna, Affirm, and PayPal Credit. Each has different terms and benefits – choose what works best for you!"
    },
  ];

  const calculateMonthlyPayment = (amount: number, months: number) => {
    if (amount < 100) return 0;
    return Math.round((amount / months) * 100) / 100;
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-[140px] overflow-hidden">
        
        {/* Hero Section with Calculator */}
        <section className="relative py-16 bg-gradient-to-br from-[#AD6269] via-[#c4787f] to-[#d4949a] text-white overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Headline */}
              <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                  <span className="animate-bounce">✨</span>
                  <span className="text-sm font-medium">0% APR Available for Qualified Customers</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  Get Your Dream Look
                  <span className="block text-white/90">Pay Over Time</span>
                </h1>
                <p className="text-xl text-white/80 mb-8 max-w-lg">
                  Why wait? Get the beauty treatments you deserve today with flexible payment plans starting as low as <span className="font-bold text-white">$33/month</span>.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg" 
                    className="bg-white text-[#AD6269] hover:bg-gray-100 font-bold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                    onClick={() => window.location.href = '/book-now-custom'}
                  >
                    Book Now & Pay Later
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white bg-transparent text-white hover:bg-white/20 font-bold px-8 py-6 text-lg"
                  >
                    Learn More
                  </Button>
                </div>
              </div>

              {/* Right side - Calculator */}
              <div className={`transition-all duration-1000 delay-300 relative ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
                {/* Sparkles around the calculator */}
                <div className="absolute -top-4 -left-4 text-2xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}>✨</div>
                <div className="absolute -top-2 right-8 text-xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}>⭐</div>
                <div className="absolute top-1/4 -right-4 text-2xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '2s' }}>✨</div>
                <div className="absolute bottom-1/4 -left-4 text-xl animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.5s' }}>💫</div>
                <div className="absolute -bottom-4 left-8 text-2xl animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '2s' }}>⭐</div>
                <div className="absolute -bottom-2 right-12 text-xl animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '2.5s' }}>✨</div>
                <div className="absolute top-1/2 -left-6 text-lg animate-ping" style={{ animationDuration: '3s' }}>✦</div>
                <div className="absolute top-1/3 -right-6 text-lg animate-ping" style={{ animationDelay: '1.5s', animationDuration: '3s' }}>✦</div>
                
                {/* Glowing card wrapper */}
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#AD6269] via-[#d4949a] to-[#AD6269] rounded-2xl blur-lg opacity-75 animate-pulse" style={{ animationDuration: '2s' }}></div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#FFD700] via-[#AD6269] to-[#FFD700] rounded-2xl blur-xl opacity-50 animate-pulse" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
                  
                  <Card className="relative shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-xl">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Calculator</h2>
                      <p className="text-gray-500">See how affordable your treatment can be</p>
                    </div>
                    
                    {/* Quick Service Buttons */}
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {popularServices.map((service) => (
                        <button
                          key={service.name}
                          onClick={() => setPurchaseAmount(service.price.toString())}
                          className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                            purchaseAmount === service.price.toString()
                              ? 'border-[#AD6269] bg-[#AD6269]/10'
                              : 'border-gray-200 hover:border-[#AD6269]/50'
                          }`}
                        >
                          <span className="text-2xl block mb-1">{service.image}</span>
                          <span className="text-sm font-medium text-gray-700">{service.name}</span>
                          <span className="text-xs text-gray-500 block">${service.price}</span>
                        </button>
                      ))}
                    </div>

                    {/* Custom Amount Input */}
                    <div className="mb-6">
                      <Label htmlFor="purchaseAmount" className="text-sm font-semibold mb-2 block text-gray-700">
                        Or enter custom amount
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl font-bold">$</span>
                        <Input
                          type="number"
                          id="purchaseAmount"
                          placeholder="Enter amount"
                          value={purchaseAmount}
                          onChange={(e) => setPurchaseAmount(e.target.value)}
                          className="pl-10 h-14 text-2xl font-bold text-center border-2 border-gray-200 focus:border-[#AD6269]"
                        />
                      </div>
                    </div>

                    {/* Term Selection */}
                    <div className="mb-6">
                      <Label className="text-sm font-semibold mb-2 block text-gray-700">Select Payment Term</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[3, 6, 12].map((months) => (
                          <button
                            key={months}
                            onClick={() => setSelectedTerm(months)}
                            className={`py-3 rounded-lg font-bold transition-all ${
                              selectedTerm === months
                                ? 'bg-[#AD6269] text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {months} mo
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Result Display */}
                    <div className="bg-gradient-to-r from-[#AD6269] to-[#c4787f] rounded-xl p-6 text-white text-center mb-6">
                      <p className="text-white/80 text-sm mb-1">Your estimated monthly payment</p>
                      <div className="text-5xl font-bold mb-2 animate-pulse">
                        ${purchaseAmount && parseFloat(purchaseAmount) >= 100 
                          ? calculateMonthlyPayment(parseFloat(purchaseAmount), selectedTerm).toFixed(2)
                          : '--'
                        }
                        <span className="text-2xl font-normal">/mo</span>
                      </div>
                      <p className="text-white/70 text-xs">
                        for {selectedTerm} months at 0% APR*
                      </p>
                    </div>

                    <Button 
                      className="w-full bg-[#AD6269] hover:bg-[#9a555c] text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                      onClick={() => window.location.href = '/book-now-custom'}
                    >
                      Apply Now - Takes 60 Seconds ⚡
                    </Button>
                    
                    <p className="text-xs text-gray-400 mt-4 text-center">
                      *0% APR for qualified customers. Subject to credit approval.
                    </p>
                  </CardContent>
                </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Pay Later?</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Don&apos;t let budget hold you back from looking and feeling your best
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <Card 
                  key={index} 
                  className={`border-0 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer group`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300">
                      {benefit.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-500">{benefit.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Pay Now vs. Pay Later
              </h2>
              <p className="text-gray-500 text-lg">See the difference flexible payments can make</p>
            </div>

            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
              {/* Pay Now Card */}
              <Card className="border-2 border-gray-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gray-300"></div>
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <span className="text-4xl">😰</span>
                    <h3 className="text-2xl font-bold text-gray-700 mt-4">Pay All At Once</h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-gray-600">
                      <span className="text-red-500">✗</span>
                      Large upfront cost
                    </li>
                    <li className="flex items-center gap-3 text-gray-600">
                      <span className="text-red-500">✗</span>
                      Depletes savings
                    </li>
                    <li className="flex items-center gap-3 text-gray-600">
                      <span className="text-red-500">✗</span>
                      May have to wait & save
                    </li>
                    <li className="flex items-center gap-3 text-gray-600">
                      <span className="text-red-500">✗</span>
                      Limits other purchases
                    </li>
                  </ul>
                  <div className="mt-8 p-4 bg-gray-100 rounded-lg text-center">
                    <p className="text-gray-500 text-sm">Example: Microblading</p>
                    <p className="text-3xl font-bold text-gray-700">$450</p>
                    <p className="text-gray-500 text-sm">due today</p>
                  </div>
                </CardContent>
              </Card>

              {/* Pay Later Card */}
              <Card className="border-2 border-[#AD6269] relative overflow-hidden shadow-xl transform hover:scale-105 transition-transform">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#AD6269] to-[#d4949a]"></div>
                <div className="absolute -top-1 -right-1 bg-[#AD6269] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  RECOMMENDED
                </div>
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <span className="text-4xl">😍</span>
                    <h3 className="text-2xl font-bold text-[#AD6269] mt-4">Pay Over Time</h3>
                  </div>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-gray-700">
                      <span className="text-green-500">✓</span>
                      Small monthly payments
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <span className="text-green-500">✓</span>
                      Keep your savings intact
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <span className="text-green-500">✓</span>
                      Get treatments NOW
                    </li>
                    <li className="flex items-center gap-3 text-gray-700">
                      <span className="text-green-500">✓</span>
                      Book multiple services
                    </li>
                  </ul>
                  <div className="mt-8 p-4 bg-[#AD6269]/10 rounded-lg text-center">
                    <p className="text-[#AD6269] text-sm">Example: Microblading</p>
                    <p className="text-3xl font-bold text-[#AD6269]">$37.50<span className="text-lg font-normal">/mo</span></p>
                    <p className="text-[#AD6269]/70 text-sm">for 12 months at 0% APR</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Payment Partners */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Choose Your Payment Partner
              </h2>
              <p className="text-gray-500 text-lg">Multiple options to fit your needs</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {/* Cherry */}
              <Card className="border-2 border-transparent hover:border-[#AD6269] transition-all hover:shadow-xl group cursor-pointer bg-white">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <img 
                      src="https://cdn.prod.website-files.com/681bf1d6f7dea459fe255c59/68252146834983973a92051f_cherry-logo-primary.svg" 
                      alt="Cherry Logo" 
                      className="w-full h-auto object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Cherry</h3>
                  <p className="text-gray-500 text-sm mb-4">0% APR available</p>
                  <div className="text-[#AD6269] font-semibold">Most Popular ⭐</div>
                </CardContent>
              </Card>

              {/* Klarna */}
              <Card className="border-2 border-transparent hover:border-[#FFB3C7] transition-all hover:shadow-xl group cursor-pointer bg-white">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <img 
                      src="https://cdn.klarna.com/1.0/shared/image/generic/logo/en_us/basic/logo_black.png" 
                      alt="Klarna Logo" 
                      className="w-full h-auto object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Klarna</h3>
                  <p className="text-gray-500 text-sm mb-4">Pay in 4 installments</p>
                  <div className="text-[#FFB3C7] font-semibold">Interest-free</div>
                </CardContent>
              </Card>

              {/* Affirm */}
              <Card className="border-2 border-transparent hover:border-[#0FA0EA] transition-all hover:shadow-xl group cursor-pointer bg-white">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <img 
                      src="https://cdn-assets.affirm.com/images/black_logo-transparent_bg.png" 
                      alt="Affirm Logo" 
                      className="w-full h-auto object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Affirm</h3>
                  <p className="text-gray-500 text-sm mb-4">3-12 month terms</p>
                  <div className="text-[#0FA0EA] font-semibold">No hidden fees</div>
                </CardContent>
              </Card>

              {/* PayPal */}
              <Card className="border-2 border-transparent hover:border-[#003087] transition-all hover:shadow-xl group cursor-pointer bg-white">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <img 
                      src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-200px.png" 
                      alt="PayPal Logo" 
                      className="w-full h-auto object-contain"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">PayPal Credit</h3>
                  <p className="text-gray-500 text-sm mb-4">6 months interest-free</p>
                  <div className="text-[#003087] font-semibold">On $99+ purchases</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gradient-to-br from-gray-800 to-gray-900 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">How It Works</h2>
              <p className="text-lg !text-white" style={{ color: 'white' }}>Get approved in 3 simple steps</p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { step: 1, icon: '📱', title: 'Apply Online', desc: 'Quick 60-second application with no hard credit check' },
                  { step: 2, icon: '✅', title: 'Get Approved', desc: 'Instant decision - know your spending power immediately' },
                  { step: 3, icon: '💅', title: 'Book & Enjoy', desc: 'Schedule your appointment and pay over time' },
                ].map((item, index) => (
                  <div key={index} className="text-center relative">
                    {index < 2 && (
                      <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#AD6269] to-transparent"></div>
                    )}
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#AD6269] to-[#d4949a] flex items-center justify-center text-4xl shadow-lg shadow-[#AD6269]/30">
                      {item.icon}
                    </div>
                    <div className="text-[#d4949a] font-bold mb-2">Step {item.step}</div>
                    <h3 className="text-xl font-bold mb-2 !text-white" style={{ color: 'white' }}>{item.title}</h3>
                    <p className="!text-white" style={{ color: 'white' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Clients Love Flexible Payments
              </h2>
              <p className="text-gray-500 text-lg">Join thousands of happy customers</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xl">⭐</span>
                      ))}
                    </div>
                    <p className="text-gray-600 italic mb-4">&quot;{testimonial.text}&quot;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#AD6269] to-[#d4949a] flex items-center justify-center text-white font-bold">
                        {testimonial.name[0]}
                      </div>
                      <span className="font-semibold text-gray-900">{testimonial.name}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Frequently Asked Questions
                </h2>
              </div>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div 
                    key={index} 
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <button
                      className={`w-full px-6 py-5 text-left font-semibold flex items-center justify-between transition-colors ${
                        expandedFAQ === index ? 'bg-[#AD6269]/5' : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => toggleFAQ(index)}
                    >
                      <span className="text-gray-900">{faq.question}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        expandedFAQ === index ? 'bg-[#AD6269] text-white rotate-180' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-gradient-to-r from-[#8B4D52] to-[#AD6269] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Don&apos;t wait another day for the look you deserve. Apply now and get instant approval!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-white text-[#AD6269] hover:bg-gray-100 font-bold px-10 py-7 text-xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                onClick={() => window.location.href = '/book-now-custom'}
              >
                Book Now & Pay Later ✨
              </Button>
            </div>
            <p className="mt-6 text-white/80 text-sm">
              No hard credit check • Instant approval • 0% APR available
            </p>
          </div>
        </section>

        {/* Footer Disclaimer */}
        <section className="py-8 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center text-xs space-y-2" style={{ color: '#ffffff' }}>
              <p>
                Payment options through Cherry Technologies, Inc. are issued by the following lending partners: withcherry.com/lending-partners. See withcherry.com/terms for details.
              </p>
              <p>
                0% APR and other promotional rates subject to eligibility. Exact terms and APR depend on credit score and other factors.
              </p>
              <p>
                Copyright © 2020-2025 Cherry Technologies Inc. NMLS #2061234
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
