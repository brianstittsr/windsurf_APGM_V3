import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="main-heading font-bold text-gray-900 mb-4">
            The
            <span className="text-rose-600"> Process</span>
          </h2>
          <p className="paragraph-text text-gray-600 mx-auto max-w-3xl">
            Our proven 6-step process ensures you get the most natural, beautiful, and long-lasting results. 
            Every step is designed with your comfort and satisfaction in mind.
          </p>
        </div>

        {/* Process Steps - 2 Row, 3 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={index}>
              <div className="bg-white border-0 shadow-custom rounded-custom p-4 h-full text-center flex flex-col">
                {/* Step Number */}
                <div className="mb-3">
                  <div className="rounded-full flex items-center justify-center font-bold shadow-custom mx-auto w-12 h-12 text-xl bg-[#AD6269] text-white" style={{fontFamily: 'Playfair Display, serif'}}>
                    {step.number}
                  </div>
                </div>

                {/* Step Image */}
                {index === 0 && (
                  <div className="mb-3">
                    <img
                      src="/images/theprocess/Candidacy.png"
                      alt="Candidacy assessment"
                      className="w-full h-[180px] object-contain shadow-sm rounded-lg"
                    />
                  </div>
                )}
                {index === 1 && (
                  <div className="mb-3">
                    <img
                      src="/images/theprocess/BookNow.png"
                      alt="Book now for permanent makeup"
                      className="w-full h-[180px] object-contain shadow-sm rounded-lg"
                    />
                  </div>
                )}
                {index === 2 && (
                  <div className="mb-3">
                    <img
                      src="/images/theprocess/numbing.jpg"
                      alt="Numbing cream application for permanent makeup"
                      className="w-full h-[180px] object-contain shadow-sm rounded-lg"
                    />
                  </div>
                )}
                {index === 3 && (
                  <div className="mb-3">
                    <img
                      src="/images/theprocess/shaping.jpg"
                      alt="Eyebrow shaping and mapping process"
                      className="w-full h-[180px] object-contain shadow-sm rounded-lg"
                    />
                  </div>
                )}
                {index === 4 && (
                  <div className="mb-3">
                    <img
                      src="/images/theprocess/color.png"
                      alt="Color selection for permanent makeup"
                      className="w-full h-[180px] object-contain shadow-sm rounded-lg"
                    />
                  </div>
                )}
                {index === 5 && (
                  <div className="mb-3">
                    <img
                      src="/images/theprocess/touchup.png"
                      alt="Touch-up session for permanent makeup"
                      className="w-full h-[180px] object-contain shadow-sm rounded-lg"
                    />
                  </div>
                )}

                {/* Step Content */}
                <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3 flex-grow">{step.description}</p>
                
                {/* Buttons for Candidacy step */}
                {index === 0 && (
                  <div className="flex flex-col gap-2 mt-auto">
                    <Button asChild size="sm" className="rounded-full px-4 py-1 bg-[#AD6269] hover:bg-[#9d5860] text-xs font-semibold">
                      <Link href="/candidate-assessment">
                        Are You A Good Candidate
                      </Link>
                    </Button>
                  </div>
                )}
                
                {/* Buttons for Consultation step */}
                {index === 1 && (
                  <div className="flex flex-col gap-2 mt-auto">
                    <Button asChild size="sm" className="rounded-full px-4 py-1 bg-[#AD6269] hover:bg-[#9d5860] text-xs font-semibold">
                      <Link href="/book-now-custom">
                        Book Now
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 text-center">
          <div className="bg-white border-0 shadow-custom rounded-custom p-8 mx-auto max-w-4xl">
            <h3 className="main-heading font-bold text-gray-900 mb-4">
              Ready to Start Your Transformation?
            </h3>
            <p className="paragraph-text text-gray-900 mb-6">
              The entire process typically takes 2-3 hours for the initial appointment, with a touch-up session 
              scheduled 4-6 weeks later.
            </p>
            <div className="flex justify-center">
              <Button asChild size="lg" className="rounded-full px-8 bg-[#AD6269] hover:bg-[#9d5860] text-base font-semibold">
                <Link href="/book-now-custom">
                  Book Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
