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

        {/* Services Grid */}
        <div className="mt-16">
          <h3 className="sub-heading font-bold text-gray-900 mb-8 text-center">
            Our <span className="text-[#AD6269]">Services</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/services/microblading" className="group">
              <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-[#AD6269]/10 flex items-center justify-center mb-4">
                  <i className="fas fa-eye text-[#AD6269] text-xl"></i>
                </div>
                <h4 className="font-bold text-gray-900 mb-2 group-hover:text-[#AD6269] transition-colors">Microblading</h4>
                <p className="text-gray-600 text-sm">Natural hair-like strokes for beautifully defined brows</p>
              </div>
            </Link>
            <Link href="/services/ombre-brows" className="group">
              <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-[#AD6269]/10 flex items-center justify-center mb-4">
                  <i className="fas fa-spa text-[#AD6269] text-xl"></i>
                </div>
                <h4 className="font-bold text-gray-900 mb-2 group-hover:text-[#AD6269] transition-colors">Ombré Powder Brows</h4>
                <p className="text-gray-600 text-sm">Soft, powdered effect for a makeup-ready look</p>
              </div>
            </Link>
            <Link href="/services/combo-brows" className="group">
              <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-[#AD6269]/10 flex items-center justify-center mb-4">
                  <i className="fas fa-magic text-[#AD6269] text-xl"></i>
                </div>
                <h4 className="font-bold text-gray-900 mb-2 group-hover:text-[#AD6269] transition-colors">Combo Brows</h4>
                <p className="text-gray-600 text-sm">Best of both - strokes and shading combined</p>
              </div>
            </Link>
            <Link href="/services/lip-blushing" className="group">
              <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-[#AD6269]/10 flex items-center justify-center mb-4">
                  <i className="fas fa-kiss-wink-heart text-[#AD6269] text-xl"></i>
                </div>
                <h4 className="font-bold text-gray-900 mb-2 group-hover:text-[#AD6269] transition-colors">Lip Blushing</h4>
                <p className="text-gray-600 text-sm">Enhance natural lip color and definition</p>
              </div>
            </Link>
            <Link href="/services/permanent-eyeliner" className="group">
              <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-[#AD6269]/10 flex items-center justify-center mb-4">
                  <i className="fas fa-pencil-alt text-[#AD6269] text-xl"></i>
                </div>
                <h4 className="font-bold text-gray-900 mb-2 group-hover:text-[#AD6269] transition-colors">Permanent Eyeliner</h4>
                <p className="text-gray-600 text-sm">Wake up with perfectly defined eyes</p>
              </div>
            </Link>
            <Link href="/services" className="group">
              <div className="bg-[#AD6269]/10 rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-[#AD6269]/20">
                <div className="w-12 h-12 rounded-full bg-[#AD6269] flex items-center justify-center mb-4">
                  <i className="fas fa-arrow-right text-white text-xl"></i>
                </div>
                <h4 className="font-bold text-[#AD6269] mb-2">View All Services</h4>
                <p className="text-gray-600 text-sm">Explore our complete service menu</p>
              </div>
            </Link>
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
