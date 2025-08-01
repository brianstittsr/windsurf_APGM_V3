export default function AboutVictoria() {
  const certifications = [
    "Certified Permanent Makeup Artist",
    "Microblading Specialist Certification",
    "Advanced Color Theory Training",
    "Bloodborne Pathogen Certified",
    "CPR & First Aid Certified"
  ];

  const achievements: Array<{icon: string; title: string; description: string}> = [
    // All achievements removed as requested
  ];

  return (
    <section id="about" className="py-section" style={{ backgroundColor: 'rgba(173, 98, 105, 0.3)' }}>
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="display-2 fw-bold text-dark mb-4">
            About
            <span className="text-primary"> Victoria</span>
          </h2>
          <p className="fs-5 text-secondary mx-auto" style={{maxWidth: '48rem'}}>
            Meet the artist behind the beauty. Victoria combines technical expertise with artistic vision 
            to create stunning, natural-looking permanent makeup results.
          </p>
        </div>

        <div className="row g-5 align-items-center">
          {/* Left Side - Image */}
          <div className="col-lg-6">
            <div className="position-relative">
              <img
                src="/images/VictoriaEscobar.jpeg"
                alt="Victoria - Permanent Makeup Artist"
                className="rounded-3 shadow w-100 h-auto"
              />
              
              {/* Experience Badge */}

            </div>
          </div>

          {/* Right Side - Content */}
          <div className="col-lg-6">
            <div>
              <h3 className="h2 fw-bold text-dark mb-4">
                Your Beauty Artist & Trusted Expert
              </h3>
              <div className="text-black lh-base">
                <p className="fs-4 mb-4">
                  Hi, I&apos;m Victoria! With experience in permanent makeup artistry, 
                  I&apos;ve dedicated my career to helping women feel confident and beautiful every single day.
                </p>
                <p className="fs-5 mb-4">
                  My journey began with a Fine Arts degree, where I developed my eye for color, symmetry, 
                  and facial aesthetics. This artistic foundation, combined with extensive training in 
                  permanent makeup techniques, allows me to create results that are both beautiful and natural.
                </p>
                <p className="fs-5 mb-4">
                  I believe that permanent makeup should enhance your natural features, not mask them. 
                  Every client receives a personalized approach based on their unique facial structure, 
                  skin tone, and lifestyle needs.
                </p>
              </div>
            </div>

            {/* Achievements */}
            <div className="row g-3 my-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="col-md-6">
                  <div className="card border-light rounded-3 p-3 shadow-sm">
                    <div className="d-flex align-items-center">
                      <div className="fs-4 me-3">{achievement.icon}</div>
                      <div>
                        <h4 className="fw-semibold text-dark mb-1">{achievement.title}</h4>
                        <p className="small text-muted mb-0">{achievement.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Philosophy */}
            <div className="card border-light rounded-3 p-4 shadow">
              <h4 className="h5 fw-bold text-dark mb-3">My Philosophy</h4>
              <p className="text-black fst-italic mb-0 fs-5">
                &quot;Beauty is not about perfection—it&apos;s about enhancing what makes you uniquely you. 
                My goal is to create permanent makeup that looks so natural, people will think you 
                just woke up that beautiful.&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Certifications Section */}
        <div className="mt-5">
          <div className="card border-light rounded-3 p-5 shadow">
            <h3 className="h2 fw-bold text-dark mb-4 text-center">
              Certifications & Training
            </h3>
            
            <div className="row g-3">
              {certifications.map((cert, index) => (
                <div key={index} className="col-md-6 col-lg-4">
                  <div className="d-flex align-items-center p-3 bg-light rounded-3">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3" style={{width: '1.5rem', height: '1.5rem'}}>
                      <svg className="text-white" width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-dark fw-medium">{cert}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}
