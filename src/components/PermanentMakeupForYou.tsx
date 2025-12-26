import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PermanentMakeupForYou() {

  return (
    <section id="services" className="py-section bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="main-heading font-bold text-gray-900 mb-4">
            <span className="text-rose-600">PERMANENT MAKEUP</span>
            <br />
            DESIGNED JUST FOR YOU
          </h2>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Before/After Image */}
          <div>
            <div className="relative h-[400px]">
              <img
                src="/images/before-after.png"
                alt="Before and After permanent makeup transformation"
                className="w-full h-full object-cover rounded-custom-lg shadow-custom-lg"
              />
            </div>
          </div>
          
          {/* Right Side - Text Content */}
          <div>
            <p className="paragraph-text text-gray-600 mb-3">
              soft or natural to bold and defined...
            </p>
            <h2 className="sub-heading font-bold text-gray-900 mb-4">
              THE CHOICE IS <span className="text-[#AD6269]">YOURS</span>
            </h2>
            <p className="paragraph-text text-gray-600 leading-relaxed">
              Forget the outdated idea that permanent makeup has to look dark or harsh. At A Pretty Girl Matter, every look is customized to your style and preferences, whether you want a subtle, natural finish or a striking, statement look.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="rounded-custom-lg p-8" style={{ backgroundColor: 'rgba(173, 98, 105, 0.3)' }}>
            <h3 className="sub-heading font-bold text-gray-900 mb-4">
              Not sure which service is right for you?
            </h3>
            <p className="paragraph-text text-gray-600 mb-6">
              Book now to complete your free online consultation, and let&apos;s explore the best options tailored to your unique features and lifestyle.
            </p>
            <Button asChild size="lg" className="rounded-full px-8 bg-[#AD6269] hover:bg-[#9d5860] text-base font-semibold">
              <Link href="/book-now-custom">
                Book Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
