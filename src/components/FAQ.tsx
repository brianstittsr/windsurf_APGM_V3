'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: 'Does permanent makeup hurt?',
    answer: 'Most clients report minimal to no pain. We apply a numbing cream before and during the procedure. Many clients actually fall asleep during their appointment! You may feel slight pressure or a scratching sensation, but it\'s generally very comfortable.'
  },
  {
    question: 'How long does the healing process take?',
    answer: 'Initial healing takes about 7-10 days. During this time, you\'ll experience some flaking and the color will appear darker than the final result. Full healing and color settling takes 4-6 weeks, which is when we schedule your touch-up appointment.'
  },
  {
    question: 'How long do results last?',
    answer: 'Results typically last 1-3 years depending on your skin type, lifestyle, and sun exposure. Annual touch-ups are recommended to maintain your desired look. Oily skin types may fade faster, while dry skin tends to retain pigment longer.'
  },
  {
    question: 'Can I wear makeup after the procedure?',
    answer: 'You should avoid makeup on the treated area for at least 7-10 days during the initial healing period. After that, you can wear makeup normally. We recommend using mineral makeup and avoiding waterproof products near the treated area.'
  },
  {
    question: 'What\'s the difference between microblading and ombré brows?',
    answer: 'Microblading creates hair-like strokes for a natural look, ideal for those with some brow hair. Ombré brows use a powder technique for a soft, filled-in makeup look, perfect for all skin types including oily skin. Combo brows combine both techniques for the best of both worlds.'
  },
  {
    question: 'Do you offer consultations?',
    answer: 'Yes! We offer complimentary consultations where we discuss your goals, assess your features, and design a customized plan. This is a great opportunity to ask questions and see color options before committing to the procedure.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-section bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="main-heading font-bold text-gray-900 mb-4">
            Frequently Asked
            <span className="text-[#AD6269]"> Questions</span>
          </h2>
          <p className="paragraph-text text-gray-600">
            Everything you need to know about permanent makeup. Still have questions? 
            <a href="/contact" className="text-[#AD6269] hover:underline ml-1">Contact us</a>
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border border-gray-200 rounded-xl overflow-hidden hover:border-[#AD6269]/30 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-[#AD6269] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6 bg-gray-50">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Ready to transform your look?</p>
          <a 
            href="/book-now-custom"
            className="inline-flex items-center px-8 py-4 bg-[#AD6269] text-white font-semibold rounded-full hover:bg-[#9d5860] transition-colors shadow-lg hover:shadow-xl"
          >
            Book Your Consultation
          </a>
        </div>
      </div>
    </section>
  );
}
