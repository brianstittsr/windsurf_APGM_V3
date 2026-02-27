import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function FAQPage() {
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
                  Frequently Asked <span className="text-primary">Questions</span>
                </h1>
                <p className="fs-5 text-secondary mb-5">
                  Everything you need to know about permanent makeup services, 
                  procedures, aftercare, and more at A Pretty Girl Matter.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-5">
          <div className="container">
            <div className="row">
              <div className="col-lg-10 mx-auto">
                
                {/* General Questions */}
                <div className="mb-5">
                  <h2 className="h3 fw-bold text-primary mb-4">General Questions</h2>
                  <div className="accordion" id="generalFAQ">
                    <div className="accordion-item border-0 mb-3 shadow-sm">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed fw-bold text-dark" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#general1"
                        >
                          What is permanent makeup?
                        </button>
                      </h2>
                      <div id="general1" className="accordion-collapse collapse" data-bs-parent="#generalFAQ">
                        <div className="accordion-body text-secondary">
                          Permanent makeup, also known as cosmetic tattooing or micropigmentation, 
                          is a cosmetic procedure that implants pigment into the skin to enhance 
                          natural features. It's commonly used for eyebrows, lips, and eyeliner, 
                          providing long-lasting makeup that looks natural and saves daily routine time.
                        </div>
                      </div>
                    </div>
                    
                    <div className="accordion-item border-0 mb-3 shadow-sm">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed fw-bold text-dark" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#general2"
                        >
                          How long does permanent makeup last?
                        </button>
                      </h2>
                      <div id="general2" className="accordion-collapse collapse" data-bs-parent="#generalFAQ">
                        <div className="accordion-body text-secondary">
                          Permanent makeup typically lasts 1-3 years, depending on the area treated, 
                          skin type, lifestyle, and aftercare. Touch-ups are recommended every 12-18 months 
                          to maintain the best appearance and color vibrancy.
                        </div>
                      </div>
                    </div>
                    
                    <div className="accordion-item border-0 mb-3 shadow-sm">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed fw-bold text-dark" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#general3"
                        >
                          Is permanent makeup safe?
                        </button>
                      </h2>
                      <div id="general3" className="accordion-collapse collapse" data-bs-parent="#generalFAQ">
                        <div className="accordion-body text-secondary">
                          Yes, when performed by a certified professional using sterile equipment 
                          and high-quality pigments, permanent makeup is safe. Victoria uses 
                          single-use needles and follows strict sanitation protocols. We also 
                          conduct thorough consultations to ensure you're a good candidate.
                        </div>
                      </div>
                    </div>
                    
                    <div className="accordion-item border-0 mb-3 shadow-sm">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed fw-bold text-dark" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#general4"
                        >
                          Who is a good candidate for permanent makeup?
                        </button>
                      </h2>
                      <div id="general4" className="accordion-collapse collapse" data-bs-parent="#generalFAQ">
                        <div className="accordion-body text-secondary">
                          Good candidates are those who want to enhance their natural features, 
                          have realistic expectations, are in good health, and are committed to 
                          proper aftercare. During your consultation, we'll assess your suitability 
                          and discuss any concerns.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Procedure Questions */}
                <div className="mb-5">
                  <h2 className="h3 fw-bold text-primary mb-4">Procedure Questions</h2>
                  <div className="accordion" id="procedureFAQ">
                    <div className="accordion-item border-0 mb-3 shadow-sm">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed fw-bold text-dark" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#procedure1"
                        >
                          How long does a permanent makeup procedure take?
                        </button>
                      </h2>
                      <div id="procedure1" className="accordion-collapse collapse" data-bs-parent="#procedureFAQ">
                        <div className="accordion-body text-secondary">
                          Procedures vary in length depending on the area and complexity. 
                          Microblading typically takes 2-3 hours, lip blushing 2-2.5 hours, 
                          and eyeliner 1.5-2 hours. This includes consultation, design, 
                          numbing, and the tattooing process.
                        </div>
                      </div>
                    </div>
                    
                    <div className="accordion-item border-0 mb-3 shadow-sm">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed fw-bold text-dark" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#procedure2"
                        >
                          Is the procedure painful?
                        </button>
                      </h2>
                      <div id="procedure2" className="accordion-collapse collapse" data-bs-parent="#procedureFAQ">
                        <div className="accordion-body text-secondary">
                          Pain levels vary by individual and area being treated. Most clients 
                          describe the sensation as similar to getting a tattoo but much more 
                          tolerable. We use topical numbing agents to minimize discomfort. 
                          Eyebrows tend to be the least uncomfortable, while lips can be more sensitive.
                        </div>
                      </div>
                    </div>
                    
                    <div className="accordion-item border-0 mb-3 shadow-sm">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed fw-bold text-dark" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#procedure3"
                        >
                          How many sessions are needed?
                        </button>
                      </h2>
                      <div id="procedure3" className="accordion-collapse collapse" data-bs-parent="#procedureFAQ">
                        <div className="accordion-body text-secondary">
                          Most permanent makeup procedures require 2 sessions for optimal results. 
                          The initial session establishes the foundation, and the touch-up session 
                          (4-8 weeks later) perfects the shape, color, and overall appearance.
                        </div>
                      </div>
                    </div>
                    
                    <div className="accordion-item border-0 mb-3 shadow-sm">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed fw-bold text-dark" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#procedure4"
                        >
                          What should I expect during the procedure?
                        </button>
                      </h2>
                      <div id="procedure4" className="accordion-collapse collapse" data-bs-parent="#procedureFAQ">
                        <div className="accordion-body text-secondary">
                          We'll start with a thorough consultation to discuss your goals and 
                          design the perfect look. After applying numbing cream, we'll create 
                          the design and begin the tattooing process. You'll be able to see 
                          the results immediately, though they'll appear darker initially.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aftercare Questions */}
                <div className="mb-5">
                  <h2 className="h3 fw-bold text-primary mb-4">Aftercare Questions</h2>
                  <div className="accordion" id="aftercareFAQ">
                    <div className="accordion-item border-0 mb-3 shadow-sm">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed fw-bold text-dark" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#aftercare1"
                        >
                          What is the healing process like?
                        </button>
                      </h2>
                      <div id="aftercare1" className="accordion-collapse collapse" data-bs-parent="#aftercareFAQ">
                        <div className="accordion-body text-secondary">
                          The healing process typically takes 7-14 days for the initial healing, 
                          with full healing completed in 4-6 weeks. During this time, the area 
                          may appear darker initially, then fade to the natural color. Some 
                          mild swelling and flaking is normal and expected.
                        </div>
                      </div>
                    </div>
                    
                    <div className="accordion-item border-0 mb-3 shadow-sm">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed fw-bold text-dark" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#aftercare2"
                        >
                          How should I care for my permanent makeup after the procedure?
                        </button>
                      </h2>
                      <div id="aftercare2" className="accordion-collapse collapse" data-bs-parent="#aftercareFAQ">
                        <div className="accordion-body text-secondary">
                          Proper aftercare is crucial for optimal results. Keep the area clean 
                          and dry, avoid swimming and saunas, minimize sun exposure, and follow 
                          all provided aftercare instructions. We'll provide detailed written 
                          instructions and follow-up support.
                        </div>
                      </div>
                    </div>
                    
                    <div className="accordion-item border-0 mb-3 shadow-sm">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed fw-bold text-dark" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#aftercare3"
                        >
                          When can I wear makeup again?
                        </button>
                      </h2>
                      <div id="aftercare3" className="accordion-collapse collapse" data-bs-parent="#aftercareFAQ">
                        <div className="accordion-body text-secondary">
                          You should avoid wearing makeup on the treated area for at least 
                          10-14 days during the initial healing phase. After that, you can 
                          gradually resume your normal makeup routine, though many clients 
                          find they need much less makeup daily.
                        </div>
                      </div>
                    </div>
                    
                    <div className="accordion-item border-0 mb-3 shadow-sm">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed fw-bold text-dark" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#aftercare4"
                        >
                          What activities should I avoid during healing?
                        </button>
                      </h2>
                      <div id="aftercare4" className="accordion-collapse collapse" data-bs-parent="#aftercareFAQ">
                        <div className="accordion-body text-secondary">
                          Avoid swimming, saunas, hot yoga, excessive sweating, sun exposure, 
                          and picking at any flaking skin. For eyeliner procedures, avoid 
                          swimming and eye makeup for the recommended healing period.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Questions */}
                <div className="mb-5">
                  <h2 className="h3 fw-bold text-primary mb-4">Pricing & Booking Questions</h2>
                  <div className="accordion" id="pricingFAQ">
                    <div className="accordion-item border-0 mb-3 shadow-sm">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed fw-bold text-dark" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#pricing1"
                        >
                          How much does permanent makeup cost?
                        </button>
                      </h2>
                      <div id="pricing1" className="accordion-collapse collapse" data-bs-parent="#pricingFAQ">
                        <div className="accordion-body text-secondary">
                          Pricing varies by procedure and complexity. Microblading ranges from 
                          $400-600, lip blushing from $450-650, and eyeliner from $350-550. 
                          Touch-up sessions are included in the initial price and scheduled 
                          4-8 weeks later. Financing options are available.
                        </div>
                      </div>
                    </div>
                    
                    <div className="accordion-item border-0 mb-3 shadow-sm">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed fw-bold text-dark" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#pricing2"
                        >
                          Do you offer financing?
                        </button>
                      </h2>
                      <div id="pricing2" className="accordion-collapse collapse" data-bs-parent="#pricingFAQ">
                        <div className="accordion-body text-secondary">
                          Yes! We offer flexible financing options to make permanent makeup 
                          accessible. Payment plans are available with various terms to fit 
                          your budget. Ask us about our financing options during your consultation.
                        </div>
                      </div>
                    </div>
                    
                    <div className="accordion-item border-0 mb-3 shadow-sm">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed fw-bold text-dark" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#pricing3"
                        >
                          How do I book an appointment?
                        </button>
                      </h2>
                      <div id="pricing3" className="accordion-collapse collapse" data-bs-parent="#pricingFAQ">
                        <div className="accordion-body text-secondary">
                          You can book your consultation online through our booking system, 
                          call us at (919) 441-0932, or send us a message through our contact 
                          form. A consultation is required before any procedure to discuss your 
                          goals and ensure you're a good candidate.
                        </div>
                      </div>
                    </div>
                    
                    <div className="accordion-item border-0 mb-3 shadow-sm">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed fw-bold text-dark" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#pricing4"
                        >
                          What is your cancellation policy?
                        </button>
                      </h2>
                      <div id="pricing4" className="accordion-collapse collapse" data-bs-parent="#pricingFAQ">
                        <div className="accordion-body text-secondary">
                          We require 24-hour notice for cancellations or rescheduling. 
                          Same-day cancellations may be subject to a fee. We understand 
                          that emergencies happen, so please contact us as soon as possible 
                          if you need to cancel or reschedule.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Health & Safety Questions */}
                <div className="mb-5">
                  <h2 className="h3 fw-bold text-primary mb-4">Health & Safety Questions</h2>
                  <div className="accordion" id="healthFAQ">
                    <div className="accordion-item border-0 mb-3 shadow-sm">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed fw-bold text-dark" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#health1"
                        >
                          Who should not get permanent makeup?
                        </button>
                      </h2>
                      <div id="health1" className="accordion-collapse collapse" data-bs-parent="#healthFAQ">
                        <div className="accordion-body text-secondary">
                          Permanent makeup may not be suitable for individuals who are pregnant, 
                          nursing, have certain medical conditions, are taking blood thinners, 
                          or have keloid scarring tendencies. During your consultation, we'll 
                          review your medical history to ensure safety.
                        </div>
                      </div>
                    </div>
                    
                    <div className="accordion-item border-0 mb-3 shadow-sm">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed fw-bold text-dark" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#health2"
                        >
                          What safety measures do you follow?
                        </button>
                      </h2>
                      <div id="health2" className="accordion-collapse collapse" data-bs-parent="#healthFAQ">
                        <div className="accordion-body text-secondary">
                          We follow strict sanitation protocols and use single-use, sterile 
                          needles for each client. Our studio is thoroughly cleaned and 
                          disinfected between appointments. All pigments are high-quality 
                          and specifically formulated for cosmetic use.
                        </div>
                      </div>
                    </div>
                    
                    <div className="accordion-item border-0 mb-3 shadow-sm">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed fw-bold text-dark" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#health3"
                        >
                          What if I have an allergic reaction?
                        </button>
                      </h2>
                      <div id="health3" className="accordion-collapse collapse" data-bs-parent="#healthFAQ">
                        <div className="accordion-body text-secondary">
                          Allergic reactions are extremely rare with our high-quality pigments, 
                          but we conduct patch tests when necessary. If you experience any 
                          unusual symptoms, contact us immediately. We also provide detailed 
                          aftercare instructions to minimize any risks.
                        </div>
                      </div>
                    </div>
                    
                    <div className="accordion-item border-0 mb-3 shadow-sm">
                      <h2 className="accordion-header">
                        <button 
                          className="accordion-button collapsed fw-bold text-dark" 
                          type="button" 
                          data-bs-toggle="collapse" 
                          data-bs-target="#health4"
                        >
                          Can I get MRI scans with permanent makeup?
                        </button>
                      </h2>
                      <div id="health4" className="accordion-collapse collapse" data-bs-parent="#healthFAQ">
                        <div className="accordion-body text-secondary">
                          Most permanent makeup pigments are safe for MRI scans, though you 
                          should always inform the technician about your permanent makeup. 
                          Our pigments are iron-oxide based and generally MRI-safe, but individual 
                          circumstances may vary.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row">
              <div className="col-lg-8 mx-auto text-center">
                <h2 className="h3 fw-bold text-dark mb-4">Still Have Questions?</h2>
                <p className="text-secondary mb-4">
                  We're here to help! Schedule your free consultation to get personalized 
                  answers and discuss your permanent makeup goals.
                </p>
                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                  <a href="/book-now" className="btn btn-primary btn-lg px-4">
                    <i className="fas fa-calendar-plus me-2"></i>
                    Schedule Consultation
                  </a>
                  <a href="/contact" className="btn btn-outline-primary btn-lg px-4">
                    <i className="fas fa-envelope me-2"></i>
                    Contact Us
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
