import { Clock, ArrowRight } from 'lucide-react';

export default function TheProcess() {
  const steps = [
    {
      number: "01",
      title: "Schedule Consultation",
      description: "Call to schedule an initial consultation. We'll discuss your goals, evaluate your features, and design a personalized plan that fits your lifestyle and enhances your natural beauty.",
      image: "BookNow.png",
      duration: "30 min"
    },
    {
      number: "02",
      title: "Numbing",
      description: "An anaesthetic will be applied during your procedure to keep you as comfortable as possible. Most clients report feeling pressure, but minimal to no pain. Many fall asleep during the process!",
      image: "numbing.jpg",
      duration: "20 min"
    },
    {
      number: "03",
      title: "Shaping",
      description: "Your brows will be mapped out according to your facial proportions and measurements. I'll draw in a shape that fits well. We'll adjust the shape until it looks good to you!",
      image: "shaping.jpg",
      duration: "30 min"
    },
    {
      number: "04",
      title: "Color",
      description: "We will choose the perfect pigment color based to match your brow hair. Your hair color and skin tone will also be considered when selecting a color. I have a range of high quality pigments with a color for everyone!",
      image: "color.png",
      duration: "15 min"
    },
    {
      number: "05",
      title: "Touch-Up Session",
      description: "After 4-6 weeks, we perform any necessary touch-ups to perfect your results and ensure long-lasting beauty.",
      image: "touchup.png",
      duration: "60 min"
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
            Our proven 5-step process ensures you get the most natural, beautiful, and long-lasting results. 
            Every step is designed with your comfort and satisfaction in mind.
          </p>
        </div>

        {/* Process Steps - Timeline Layout */}
        <div className="relative max-w-6xl mx-auto">
          {/* Timeline Line - Desktop only */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-[#AD6269]/20">
            <div className="absolute left-0 w-1/5 h-full bg-[#AD6269]/40"></div>
            <div className="absolute left-[20%] w-1/5 h-full bg-[#AD6269]/40"></div>
            <div className="absolute left-[40%] w-1/5 h-full bg-[#AD6269]/40"></div>
            <div className="absolute left-[60%] w-1/5 h-full bg-[#AD6269]/40"></div>
            <div className="absolute left-[80%] w-1/5 h-full bg-[#AD6269]/40"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="bg-white border-0 shadow-custom rounded-custom p-4 text-center flex flex-col relative">
                {/* Step Number */}
                <div className="mb-3 relative">
                  <div className="rounded-full flex items-center justify-center font-bold shadow-custom mx-auto w-12 h-12 text-xl bg-[#AD6269] text-white relative z-10" style={{fontFamily: 'Playfair Display, serif'}}>
                    {step.number}
                  </div>
                  {/* Connector dot - Desktop */}
                  <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-4 border-[#AD6269] z-0"></div>
                </div>

                {/* Duration Badge */}
                <div className="flex items-center justify-center gap-1 mb-2 text-xs text-[#AD6269]">
                  <Clock className="w-3 h-3" />
                  <span>{step.duration}</span>
                </div>

                {/* Step Image */}
                <div className="mb-3">
                  <img
                    src={`/images/theprocess/${step.image}`}
                    alt={`${step.title} process`}
                    className="w-full h-[140px] object-contain shadow-sm rounded-lg"
                  />
                </div>

                {/* Step Content */}
                <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-3 flex-grow">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section - CTA */}
        <div className="mt-12 text-center">
          <div className="bg-white border-0 shadow-custom rounded-custom p-8 mx-auto max-w-4xl">
            <h3 className="main-heading font-bold text-gray-900 mb-4">
              Ready to Start Your Transformation?
            </h3>
            <p className="paragraph-text text-gray-600 mb-6">
              The entire process typically takes 2-3 hours for the initial appointment, with a touch-up session 
              scheduled 4-6 weeks later.
            </p>
            <a 
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-[#AD6269] text-white font-semibold rounded-full hover:bg-[#9d5860] transition-colors shadow-lg"
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
