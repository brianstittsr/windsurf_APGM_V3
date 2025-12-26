import { Button } from '@/components/ui/button';

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
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="main-heading font-bold text-gray-900 mb-4">
            About
            <span className="text-[#AD6269]"> Victoria</span>
          </h2>
          <p className="paragraph-text text-gray-600 mx-auto max-w-4xl break-words">
            Meet the artist behind the beauty. Victoria combines technical expertise with artistic vision to create stunning, natural-looking permanent makeup results.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image */}
          <div>
            <div className="relative">
              <img
                src="/images/about/about-victoria.jpg"
                alt="Victoria - Permanent makeup Artist"
                className="rounded-3xl shadow-lg w-full h-auto"
              />
            </div>
          </div>

          {/* Right Side - Content */}
          <div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Your Beauty Artist & Trusted Expert
              </h3>
              <div className="text-gray-900 leading-relaxed">
                <p className="text-xl mb-4">
                  As a proud veteran and a dedicated member of Alpha Kappa Alpha Sorority, Inc., I've always believed in service, strength, and sisterhood. After completing my military service, I felt called to create something meaningful that combined my love for artistry with my mission to empower others. That vision led me to found A Pretty Girl Matter, where I specialize in permanent makeup that elevates natural beauty and restores confidence.
                </p>
                <p className="text-lg mb-4">
                  My passion for this craft was born from witnessing how transformational it can be—not only enhancing outer appearance, but also uplifting inner confidence. I've trained with some of the top PMU academies in the world—including The Collective, Beauty Slesh, Beauty Angels, and Plush Beauty Academy—mastering advanced techniques in microblading, ombré brows, combo brows, lip blushing, permanent eyeliner, and tiny tattoos.
                </p>
                <p className="text-lg mb-4">
                  With this exclusive education and hands-on artistry, I am able to deliver precise, personalized results and provide comprehensive care from consultation to aftercare. For me, every client's appointment is more than a service—it's an experience rooted in empowerment, excellence, and care.
                </p>

              </div>
            </div>

            {/* Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              {achievements.map((achievement, index) => (
                <div key={index}>
                  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{achievement.icon}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">{achievement.title}</h4>
                        <p className="text-sm text-gray-500 mb-0">{achievement.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Philosophy */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
              <h4 className="text-xl font-bold text-gray-900 mb-3">My Mission</h4>
              <p className="text-gray-900 italic mb-0 text-lg">
                &quot;My mission is simple: to help you wake up looking and feeling your absolute best with 
                effortless, natural-looking permanent makeup. Whether you're a busy professional, a mom, or 
                someone who values confidence and convenience, I'm here to create a look that's uniquely 
                yours.&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Certifications Section */}
        <div className="mt-12">
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg">
            <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center" style={{fontFamily: 'Playfair Display, serif'}}>
              Certifications & Training
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certifications.map((cert, index) => (
                <div key={index}>
                  <div className="flex items-center p-3 rounded-xl" style={{ backgroundColor: 'rgba(173, 98, 105, 0.3)' }}>
                    <div className="bg-[#AD6269] rounded-full flex items-center justify-center flex-shrink-0 mr-3 w-6 h-6">
                      <svg className="text-white" width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-900 font-medium" style={{fontFamily: 'Poppins, sans-serif'}}>{cert}</span>
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
