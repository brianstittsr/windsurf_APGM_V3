import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function TheProcess() {
  const steps = [
    {
      number: "01",
      title: "Book Now",
      description: "Book now and complete the Online Consultation Form. We'll discuss your goals, evaluate your features, and design a personalized plan that fits your lifestyle and enhances your natural beauty.",
      image: "BookNow.png"
    },
    {
      number: "02",
      title: "Numbing",
      description: "An anaesthetic will be applied during your procedure to keep you as comfortable as possible. Most clients report feeling pressure, but minimal to no pain. Many fall asleep during the process!",
      image: "numbing.jpg"
    },
    {
      number: "03",
      title: "Shaping",
      description: "Your brows will be mapped out according to your facial proportions and measurements. I'll draw in a shape that fits well. We'll adjust the shape until it looks good to you!",
      image: "shaping.jpg"
    },
    {
      number: "04",
      title: "Color",
      description: "We will choose the perfect pigment color based to match your brow hair. Your hair color and skin tone will also be considered when selecting a color. I have a range of high quality pigments with a color for everyone!",
      image: "color.png"
    },
    {
      number: "05",
      title: "Touch-Up Session",
      description: "After 4-6 weeks, we perform any necessary touch-ups to perfect your results and ensure long-lasting beauty.",
      image: "touchup.png"
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

        {/* Process Steps - Carousel */}
        <div className="max-w-4xl mx-auto">
          <Carousel opts={{ align: 'start', loop: true }}>
            <CarouselContent>
              {steps.map((step, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="bg-white border-0 shadow-custom rounded-custom p-4 h-full text-center flex flex-col">
                    {/* Step Number */}
                    <div className="mb-3">
                      <div className="rounded-full flex items-center justify-center font-bold shadow-custom mx-auto w-12 h-12 text-xl bg-[#AD6269] text-white" style={{fontFamily: 'Playfair Display, serif'}}>
                        {step.number}
                      </div>
                    </div>

                    {/* Step Image */}
                    <div className="mb-3">
                      <img
                        src={`/images/theprocess/${step.image}`}
                        alt={`${step.title} process`}
                        className="w-full h-[180px] object-contain shadow-sm rounded-lg"
                      />
                    </div>

                    {/* Step Content */}
                    <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3 flex-grow">{step.description}</p>
                    
                    {/* Button for Book Now step */}
                    {index === 0 && (
                      <div className="flex flex-col gap-2 mt-auto" />
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
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
          </div>
        </div>
      </div>
    </section>
  );
}
