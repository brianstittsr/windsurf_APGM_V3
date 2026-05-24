'use client';

import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTABanner() {
  return (
    <section className="py-16 bg-gradient-to-r from-[#AD6269] via-[#c47077] to-[#AD6269]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left - Text */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-white/80" />
              <span className="text-white/80 font-medium text-sm uppercase tracking-wider">
                Wake Up Beautiful Every Day
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Ready to Transform Your Look?
            </h2>
            <p className="text-white/90 text-lg max-w-xl">
              Book your consultation today and discover how permanent makeup can enhance your natural beauty.
            </p>
          </div>

          {/* Right - Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#AD6269] font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            >
              Book Consultation
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
            <a
              href="/gallery"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors"
            >
              View Gallery
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
