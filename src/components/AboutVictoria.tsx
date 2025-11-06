export default function AboutVictoria() {
  const certifications = [
    "Certified Permanent makeup Artist",
    "Microblading Specialist Certification",
    "Advanced Color Theory Training",
    "Bloodborne Pathogen Certified",
    "CPR & First Aid Certified",
    "Lip Blushing",
    "Eye Liner"
  ];

  const achievements: Array<{icon: string; title: string; description: string}> = [
    // All achievements removed as requested
  ];

  return (
    <section id="about" className="py-section" style={{ backgroundColor: 'rgba(173, 98, 105, 0.3)' }}>
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="main-heading fw-bold text-dark mb-4">
            About
            <span className="text-primary"> Victoria</span>
          </h2>
          <p className="paragraph-text text-secondary mx-auto text-wrap" style={{maxWidth: '64rem', wordWrap: 'break-word', overflowWrap: 'break-word'}}>
            Meet the artist behind the beauty. Victoria combines technical expertise with artistic vision to create stunning, natural-looking permanent makeup results.
          </p>
        </div>

        <div className="row g-5 align-items-center">
          {/* Left Side - Image */}
          <div className="col-lg-6">
            <div className="position-relative">
              <img
                src="/images/about/about-victoria.jpg"
                alt="Victoria - Permanent makeup Artist"
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
                  As a proud veteran and a dedicated member of Alpha Kappa Alpha Sorority, Inc., I've always believed in service, strength, and sisterhood. After completing my military service, I felt called to create something meaningful that combined my love for artistry with my mission to empower others. That vision led me to found A Pretty Girl Matter, where I specialize in permanent makeup that elevates natural beauty and restores confidence.
                </p>
                <p className="fs-5 mb-4">
                  My passion for this craft was born from witnessing how transformational it can be—not only enhancing outer appearance, but also uplifting inner confidence. I've trained with some of the top PMU academies in the world—including The Collective, Beauty Slesh, Beauty Angels, and Plush Beauty Academy—mastering advanced techniques in microblading, ombré brows, combo brows, lip blushing, permanent eyeliner, and tiny tattoos.
                </p>
                <p className="fs-5 mb-4">
                  With this exclusive education and hands-on artistry, I am able to deliver precise, personalized results and provide comprehensive care from consultation to aftercare. For me, every client's appointment is more than a service—it's an experience rooted in empowerment, excellence, and care.
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
              <h4 className="h5 fw-bold text-dark mb-3">My Mission</h4>
              <p className="text-black fst-italic mb-0 fs-5">
                &quot;My mission is simple: to help you wake up looking and feeling your absolute best with 
                effortless, natural-looking permanent makeup. Whether you're a busy professional, a mom, or 
                someone who values confidence and convenience, I'm here to create a look that's uniquely 
                yours.&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Certifications Section */}
        <div className="mt-5">
          <div className="card border-light rounded-3 p-5 shadow">
            <h3 className="h2 fw-bold text-dark mb-4 text-center" style={{fontFamily: 'Playfair Display, serif'}}>
              Certifications & Training
            </h3>
            
            <div className="row g-3">
              {certifications.map((cert, index) => (
                <div key={index} className="col-md-6 col-lg-4">
                  <div className="d-flex align-items-center p-3 rounded-3" style={{ backgroundColor: 'rgba(173, 98, 105, 0.3)' }}>
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3" style={{width: '1.5rem', height: '1.5rem'}}>
                      <svg className="text-white" width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-dark fw-medium" style={{fontFamily: 'Poppins, sans-serif'}}>{cert}</span>
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
