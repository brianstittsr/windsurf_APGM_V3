'use client';

import { ServiceDetailPageContent } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ServiceDetailPageEditorProps {
  content: ServiceDetailPageContent;
  onChange: (content: ServiceDetailPageContent) => void;
  serviceName?: string;
}

export default function ServiceDetailPageEditor({
  content,
  onChange,
  serviceName = 'this service'
}: ServiceDetailPageEditorProps) {
  const update = (patch: Partial<ServiceDetailPageContent>) => {
    onChange({ ...content, ...patch });
  };

  const benefits = content.benefits || [];
  const candidates = content.candidates || [];
  const processSteps = content.processSteps || [];
  const aftercareSections = content.aftercareSections || [];
  const faqs = content.faqs || [];

  return (
    <div className="space-y-8 border-t border-gray-200 pt-6">
      <div className="flex items-center gap-2">
        <i className="fas fa-file-alt text-[#AD6269]"></i>
        <h3 className="text-lg font-bold text-gray-900">Detail Page Content</h3>
        <span className="text-xs text-gray-500 ml-2">Shown on /services/{'{slug}'}</span>
      </div>

      {/* Hero overrides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Hero Title</label>
          <Input
            type="text"
            value={content.heroTitle || ''}
            onChange={(e) => update({ heroTitle: e.target.value })}
            placeholder={`${serviceName} in Raleigh, NC`}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">CTA Title</label>
          <Input
            type="text"
            value={content.ctaTitle || ''}
            onChange={(e) => update({ ctaTitle: e.target.value })}
            placeholder="Ready to Get Started?"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Hero Subtitle</label>
        <textarea
          className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
          rows={2}
          value={content.heroSubtitle || ''}
          onChange={(e) => update({ heroSubtitle: e.target.value })}
          placeholder="Short description shown under the hero heading"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">CTA Text</label>
        <textarea
          className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
          rows={2}
          value={content.ctaText || ''}
          onChange={(e) => update({ ctaText: e.target.value })}
          placeholder="Book a free consultation..."
        />
      </div>

      {/* Benefits */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Benefits</label>
        <div className="space-y-2">
          {benefits.map((benefit, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Input
                type="text"
                value={benefit.title}
                onChange={(e) => {
                  const next = [...benefits];
                  next[index] = { ...benefit, title: e.target.value };
                  update({ benefits: next });
                }}
                placeholder="Benefit title"
              />
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={benefit.description}
                  onChange={(e) => {
                    const next = [...benefits];
                    next[index] = { ...benefit, description: e.target.value };
                    update({ benefits: next });
                  }}
                  placeholder="Benefit description"
                  className="flex-1"
                />
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700 px-2"
                  onClick={() => update({ benefits: benefits.filter((_, i) => i !== index) })}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => update({ benefits: [...benefits, { title: '', description: '' }] })}
          >
            <i className="fas fa-plus mr-1"></i>Add Benefit
          </Button>
        </div>
      </div>

      {/* Ideal Candidates */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Ideal Candidates</label>
        <div className="space-y-2">
          {candidates.map((candidate, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Input
                type="text"
                value={candidate.title}
                onChange={(e) => {
                  const next = [...candidates];
                  next[index] = { ...candidate, title: e.target.value };
                  update({ candidates: next });
                }}
                placeholder="Who it's for"
              />
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={candidate.description}
                  onChange={(e) => {
                    const next = [...candidates];
                    next[index] = { ...candidate, description: e.target.value };
                    update({ candidates: next });
                  }}
                  placeholder="Why"
                  className="flex-1"
                />
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700 px-2"
                  onClick={() => update({ candidates: candidates.filter((_, i) => i !== index) })}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => update({ candidates: [...candidates, { title: '', description: '' }] })}
          >
            <i className="fas fa-plus mr-1"></i>Add Candidate
          </Button>
        </div>
      </div>

      {/* Process Steps */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Process Steps</label>
        <div className="space-y-2">
          {processSteps.map((step, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-start p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="col-span-2">
                <Input
                  type="text"
                  value={step.number}
                  onChange={(e) => {
                    const next = [...processSteps];
                    next[index] = { ...step, number: e.target.value };
                    update({ processSteps: next });
                  }}
                  placeholder="#"
                />
              </div>
              <div className="col-span-4">
                <Input
                  type="text"
                  value={step.title}
                  onChange={(e) => {
                    const next = [...processSteps];
                    next[index] = { ...step, title: e.target.value };
                    update({ processSteps: next });
                  }}
                  placeholder="Step title"
                />
              </div>
              <div className="col-span-5">
                <Input
                  type="text"
                  value={step.description}
                  onChange={(e) => {
                    const next = [...processSteps];
                    next[index] = { ...step, description: e.target.value };
                    update({ processSteps: next });
                  }}
                  placeholder="Step description"
                />
              </div>
              <div className="col-span-1 flex justify-end">
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700 px-2"
                  onClick={() => update({ processSteps: processSteps.filter((_, i) => i !== index) })}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => update({ processSteps: [...processSteps, { number: String(processSteps.length + 1), title: '', description: '' }] })}
          >
            <i className="fas fa-plus mr-1"></i>Add Process Step
          </Button>
        </div>
      </div>

      {/* Aftercare */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Aftercare Sections</label>
        <div className="space-y-3">
          {aftercareSections.map((section, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex gap-2 mb-2">
                <Input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    const next = [...aftercareSections];
                    next[index] = { ...section, title: e.target.value };
                    update({ aftercareSections: next });
                  }}
                  placeholder="Section title, e.g., First 2 Weeks"
                  className="flex-1"
                />
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700 px-2"
                  onClick={() => update({ aftercareSections: aftercareSections.filter((_, i) => i !== index) })}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <textarea
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                rows={3}
                value={section.items.join('\n')}
                onChange={(e) => {
                  const next = [...aftercareSections];
                  next[index] = { ...section, items: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) };
                  update({ aftercareSections: next });
                }}
                placeholder="Enter one item per line"
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => update({ aftercareSections: [...aftercareSections, { title: '', items: [] }] })}
          >
            <i className="fas fa-plus mr-1"></i>Add Aftercare Section
          </Button>
        </div>
      </div>

      {/* FAQs */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">FAQs</label>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={faq.question}
                  onChange={(e) => {
                    const next = [...faqs];
                    next[index] = { ...faq, question: e.target.value };
                    update({ faqs: next });
                  }}
                  placeholder="Question"
                  className="flex-1"
                />
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700 px-2"
                  onClick={() => update({ faqs: faqs.filter((_, i) => i !== index) })}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <textarea
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                rows={2}
                value={faq.answer}
                onChange={(e) => {
                  const next = [...faqs];
                  next[index] = { ...faq, answer: e.target.value };
                  update({ faqs: next });
                }}
                placeholder="Answer"
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => update({ faqs: [...faqs, { question: '', answer: '' }] })}
          >
            <i className="fas fa-plus mr-1"></i>Add FAQ
          </Button>
        </div>
      </div>
    </div>
  );
}
