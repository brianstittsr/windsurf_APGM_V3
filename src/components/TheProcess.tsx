import Link from 'next/link';

export default function TheProcess() {
  const steps = [
    {
      number: "01",
      title: "Candidacy",
      description: "You begin by completing the 'Are You a Good Candidate' form to assess your suitability for permanent makeup procedures."
    },
    {
      number: "02",
      title: "Book Now",
      description: "Book now and complete the Online Consultation Form. We'll discuss your goals, evaluate your features, and design a personalized plan that fits your lifestyle and enhances your natural beauty."
    },
    {
      number: "03",
      title: "Numbing",
      description: "An anaesthetic will be applied during your procedure to keep you as comfortable as possible. Most clients report feeling pressure, but minimal to no pain. Many fall asleep during the process!"
    },
    {
      number: "04",
      title: "Shaping",
      description: "Your brows will be mapped out according to your facial proportions and measurements. I'll draw in a shape that fits well. We'll adjust the shape until it looks good to you!"
    },
    {
      number: "05",
      title: "Color",
      description: "We will choose the perfect pigment color based to match your brow hair. Your hair color and skin tone will also be considered when selecting a color. I have a range of high quality pigments with a color for everyone!"
    },
    {
      number: "06",
      title: "Touch-Up Session",
      description: "After 4-6 weeks, we perform any necessary touch-ups to perfect your results and ensure long-lasting beauty."
    }
  ];

  return (
    <section id="process" className="py-section" style={{ backgroundColor: 'rgba(173, 98, 105, 0.3)' }}>
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="main-heading fw-bold text-dark mb-4">
            The
            <span className="text-rose-600"> Process</span>
          </h2>
          <p className="paragraph-text text-secondary mx-auto" style={{maxWidth: '48rem'}}>
            Our proven 6-step process ensures you get the most natural, beautiful, and long-lasting results. 
            Every step is designed with your comfort and satisfaction in mind.
          </p>
        </div>

        {/* Process Steps - 2 Row, 3 Column Grid */}
        <div className="row g-4">
          {steps.map((step, index) => (
            <div key={index} className="col-lg-4 col-md-6 col-12">
              <div className="card border-0 shadow-custom rounded-custom p-4 h-100 text-center">
                {/* Step Number */}
                <div className="mb-4">
                  <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-custom mx-auto" style={{width: '4rem', height: '4rem', fontSize: '32px', fontFamily: 'Playfair Display, serif', backgroundColor: '#AD6269', color: 'white'}}>
                    {step.number}
                  </div>
                </div>

                {/* Step Image */}
                {index === 0 && (
                  <div className="mb-4">
                    <img
                      src="/images/theprocess/consult.jpg"
                      alt="Candidacy assessment"
                      className="img-fluid shadow-custom"
                      style={{height: '300px', width: '100%', objectFit: 'contain', objectPosition: 'center', borderRadius: '0.5rem'}}
                    />
                  </div>
                )}
                {index === 1 && (
                  <div className="mb-4">
                    <img
                      src="/images/theprocess/consult.jpg"
                      alt="Consultation and planning"
                      className="img-fluid shadow-custom"
                      style={{height: '300px', width: '100%', objectFit: 'contain', objectPosition: 'center', borderRadius: '0.5rem'}}
                    />
                  </div>
                )}
                {index === 2 && (
                  <div className="mb-4">
                    <img
                      src="/images/theprocess/numbing.jpg"
                      alt="Numbing cream application for permanent makeup"
                      className="img-fluid shadow-custom"
                      style={{height: '300px', width: '100%', objectFit: 'contain', objectPosition: 'center', borderRadius: '0.5rem'}}
                    />
                  </div>
                )}
                {index === 3 && (
                  <div className="mb-4">
                    <img
                      src="/images/theprocess/shaping.jpg"
                      alt="Eyebrow shaping and mapping process"
                      className="img-fluid shadow-custom"
                      style={{height: '300px', width: '100%', objectFit: 'contain', objectPosition: 'center', borderRadius: '0.5rem'}}
                    />
                  </div>
                )}
                {index === 4 && (
                  <div className="mb-4">
                    <img
                      src="/images/theprocess/color.jpg"
                      alt="Color selection for permanent makeup"
                      className="img-fluid shadow-custom"
                      style={{height: '300px', width: '100%', objectFit: 'contain', objectPosition: 'center', borderRadius: '0.5rem'}}
                    />
                  </div>
                )}
                {index === 5 && (
                  <div className="mb-4">
                    <img
                      src="/images/theprocess/consult.jpg"
                      alt="Touch-up session for permanent makeup"
                      className="img-fluid shadow-custom"
                      style={{height: '300px', width: '100%', objectFit: 'contain', objectPosition: 'center', borderRadius: '0.5rem'}}
                    />
                  </div>
                )}

                {/* Step Content */}
                <h3 className="h5 fw-bold text-dark mb-3">{step.title}</h3>
                <p className="text-black lh-base mb-4">{step.description}</p>
                
                {/* Buttons for Candidacy step */}
                {index === 0 && (
                  <div className="d-flex flex-column gap-2 mt-auto">
                    <Link href="/candidate-assessment" className="btn btn-primary rounded-pill px-3 py-2 fw-semibold">
                      Are You A Good Candidate
                    </Link>
                  </div>
                )}
                
                {/* Buttons for Consultation step */}
                {index === 1 && (
                  <div className="d-flex flex-column gap-2 mt-auto">
                    <Link href="/contact" className="btn btn-primary rounded-pill px-3 py-2 fw-semibold">
                      Online Consultation
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-5 text-center">
          <div className="card border-0 shadow-custom rounded-custom p-5 mx-auto" style={{maxWidth: '64rem'}}>
            <h3 className="main-heading fw-bold text-dark mb-4">
              Ready to Start Your Transformation?
            </h3>
            <p className="paragraph-text text-black mb-4">
              The entire process typically takes 2-3 hours for the initial appointment, with a touch-up session 
              scheduled 4-6 weeks later.
            </p>
            <div className="d-flex justify-content-center">
              <Link href="/book-now-custom" className="btn btn-primary rounded-pill px-4 fw-semibold book-now-button">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
