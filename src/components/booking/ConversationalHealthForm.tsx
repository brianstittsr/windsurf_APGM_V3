'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import SignaturePad from './SignaturePad';

interface HealthQuestion {
  id: string;
  question: string;
  category: string;
  type: 'yesno' | 'text' | 'signature';
  followUp?: {
    condition: 'yes' | 'no';
    question: string;
  };
  important?: boolean;
}

const healthQuestions: HealthQuestion[] = [
  { 
    id: 'pregnant', 
    question: "Are you currently pregnant or breastfeeding?", 
    category: 'General Health', 
    type: 'yesno',
    important: true
  },
  { 
    id: 'allergies', 
    question: "Do you have any allergies to topical anesthetics, pigments, or latex?", 
    category: 'Allergies', 
    type: 'yesno',
    followUp: { condition: 'yes', question: 'Please describe your allergies:' }
  },
  { 
    id: 'bloodThinners', 
    question: "Are you currently taking any blood-thinning medications?", 
    category: 'Medications', 
    type: 'yesno',
    important: true
  },
  { 
    id: 'keloid', 
    question: "Do you have a history of keloid scarring or poor wound healing?", 
    category: 'Skin Conditions', 
    type: 'yesno'
  },
  { 
    id: 'recentProcedures', 
    question: "Have you had any cosmetic procedures in the treatment area within the last 6 months?", 
    category: 'Recent Procedures', 
    type: 'yesno'
  },
  { 
    id: 'skinConditions', 
    question: "Do you have any active skin conditions (eczema, psoriasis, dermatitis) in the treatment area?", 
    category: 'Skin Conditions', 
    type: 'yesno'
  },
  { 
    id: 'retinoids', 
    question: "Are you currently using Retin-A, Accutane, or other retinoid products?", 
    category: 'Medications', 
    type: 'yesno',
    important: true
  },
  { 
    id: 'diabetes', 
    question: "Do you have diabetes or any autoimmune disorders?", 
    category: 'Medical Conditions', 
    type: 'yesno'
  },
  { 
    id: 'botox', 
    question: "Have you had Botox or fillers in the treatment area within the last 4 weeks?", 
    category: 'Recent Procedures', 
    type: 'yesno'
  },
  { 
    id: 'coldSores', 
    question: "Do you have a history of cold sores or fever blisters?", 
    category: 'Medical History', 
    type: 'yesno'
  },
  { 
    id: 'alcohol', 
    question: "Have you consumed alcohol within the last 24 hours?", 
    category: 'Pre-Treatment', 
    type: 'yesno'
  },
  { 
    id: 'over18', 
    question: "Are you over 18 years of age?", 
    category: 'Legal Requirements', 
    type: 'yesno',
    important: true
  },
  { 
    id: 'understand', 
    question: "Do you understand that results may vary and touch-ups may be needed?", 
    category: 'Expectations', 
    type: 'yesno'
  }
];

interface ConversationalHealthFormProps {
  onComplete: (data: Record<string, string>, signature: string) => void;
  onBack: () => void;
  initialData?: Record<string, string>;
  initialSignature?: string;
}

export default function ConversationalHealthForm({
  onComplete,
  onBack,
  initialData = {},
  initialSignature = ''
}: ConversationalHealthFormProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(initialData);
  const [signature, setSignature] = useState(initialSignature);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentQuestion = healthQuestions[currentIndex];
  const progress = ((currentIndex + 1) / (healthQuestions.length + 1)) * 100; // +1 for signature

  const handleAnswer = (answer: string) => {
    if (isAnimating) return;
    
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    
    // Check for follow-up
    if (currentQuestion.followUp && answer.toLowerCase() === currentQuestion.followUp.condition) {
      setShowFollowUp(true);
      return;
    }
    
    advanceToNext();
  };

  const handleFollowUpSubmit = () => {
    if (followUpAnswer.trim()) {
      setAnswers(prev => ({ ...prev, [`${currentQuestion.id}_details`]: followUpAnswer }));
    }
    setShowFollowUp(false);
    setFollowUpAnswer('');
    advanceToNext();
  };

  const advanceToNext = () => {
    setIsAnimating(true);
    
    setTimeout(() => {
      if (currentIndex < healthQuestions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setShowSignature(true);
      }
      setIsAnimating(false);
    }, 300);
  };

  const handleBack = () => {
    if (showSignature) {
      setShowSignature(false);
      return;
    }
    if (showFollowUp) {
      setShowFollowUp(false);
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      onBack();
    }
  };

  const handleComplete = () => {
    if (!signature) {
      alert('Please provide your signature to continue.');
      return;
    }
    onComplete(answers, signature);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showSignature || showFollowUp) return;
      
      if (e.key === 'y' || e.key === 'Y' || e.key === '1') {
        handleAnswer('yes');
      } else if (e.key === 'n' || e.key === 'N' || e.key === '2') {
        handleAnswer('no');
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, showSignature, showFollowUp, isAnimating]);

  return (
    <div className="min-h-[600px] bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              {showSignature ? 'Final Step' : `Question ${currentIndex + 1} of ${healthQuestions.length}`}
            </span>
            <span className="text-sm font-medium text-[#AD6269]">
              {Math.round(showSignature ? 100 : progress)}% Complete
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#AD6269] to-[#c4848a] transition-all duration-500 ease-out"
              style={{ width: `${showSignature ? 100 : progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div 
          ref={containerRef}
          className={`bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 ${
            isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
          }`}
        >
          {!showSignature ? (
            <>
              {/* Category Badge */}
              <div className="px-6 pt-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#AD6269]/10 text-[#AD6269]">
                  <i className="fas fa-tag mr-1.5"></i>
                  {currentQuestion.category}
                </span>
                {currentQuestion.important && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 ml-2">
                    <i className="fas fa-exclamation-circle mr-1.5"></i>
                    Important
                  </span>
                )}
              </div>

              {/* Question */}
              <div className="px-6 py-8">
                <h2 className="text-2xl font-bold text-gray-900 leading-relaxed">
                  {showFollowUp ? currentQuestion.followUp?.question : currentQuestion.question}
                </h2>
              </div>

              {/* Answer Options */}
              <div className="px-6 pb-8">
                {showFollowUp ? (
                  <div className="space-y-4">
                    <textarea
                      value={followUpAnswer}
                      onChange={(e) => setFollowUpAnswer(e.target.value)}
                      placeholder="Please provide details..."
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#AD6269] focus:border-transparent resize-none"
                      rows={3}
                      autoFocus
                    />
                    <Button
                      onClick={handleFollowUpSubmit}
                      className="w-full bg-[#AD6269] hover:bg-[#9d5860] py-6 text-lg"
                    >
                      Continue
                      <i className="fas fa-arrow-right ml-2"></i>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleAnswer('yes')}
                      className={`
                        relative p-6 rounded-xl border-2 transition-all duration-200
                        ${answers[currentQuestion.id] === 'yes' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
                          answers[currentQuestion.id] === 'yes' ? 'bg-green-500' : 'bg-green-100'
                        }`}>
                          <i className={`fas fa-check text-2xl ${
                            answers[currentQuestion.id] === 'yes' ? 'text-white' : 'text-green-600'
                          }`}></i>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">Yes</span>
                        <span className="text-xs text-gray-500 mt-1">Press Y or 1</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleAnswer('no')}
                      className={`
                        relative p-6 rounded-xl border-2 transition-all duration-200
                        ${answers[currentQuestion.id] === 'no' 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
                          answers[currentQuestion.id] === 'no' ? 'bg-red-500' : 'bg-red-100'
                        }`}>
                          <i className={`fas fa-times text-2xl ${
                            answers[currentQuestion.id] === 'no' ? 'text-white' : 'text-red-600'
                          }`}></i>
                        </div>
                        <span className="text-lg font-semibold text-gray-900">No</span>
                        <span className="text-xs text-gray-500 mt-1">Press N or 2</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Signature Section */
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#AD6269]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-signature text-2xl text-[#AD6269]"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Electronic Signature & Consent
                </h2>
                <p className="text-gray-600">
                  Please sign below to confirm your answers and consent to the procedure.
                </p>
              </div>

              {/* Consent Text */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-600 max-h-40 overflow-y-auto">
                <p className="mb-2">
                  By signing below, I acknowledge that:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>I have answered all questions truthfully and to the best of my knowledge.</li>
                  <li>I understand the risks and benefits of the procedure.</li>
                  <li>I consent to the permanent makeup procedure.</li>
                  <li>I understand that results may vary and touch-ups may be required.</li>
                  <li>I release the artist from liability for any adverse reactions.</li>
                </ul>
              </div>

              {/* Signature Pad */}
              <SignaturePad
                signature={signature}
                onSignatureChange={setSignature}
                label="Sign Here"
                required
              />

              {/* Complete Button */}
              <Button
                onClick={handleComplete}
                disabled={!signature}
                className="w-full mt-6 bg-[#AD6269] hover:bg-[#9d5860] py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-check-circle mr-2"></i>
                Complete Health Form
              </Button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back
          </Button>
          
          {!showSignature && !showFollowUp && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <i className="fas fa-keyboard"></i>
              <span>Use keyboard shortcuts</span>
            </div>
          )}
        </div>

        {/* Question Dots */}
        <div className="flex justify-center gap-1.5 mt-8">
          {healthQuestions.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-6 bg-[#AD6269]'
                  : index < currentIndex
                  ? 'w-2 bg-[#AD6269]/50'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              showSignature ? 'w-6 bg-[#AD6269]' : 'w-2 bg-gray-300'
            }`}
          />
        </div>
      </div>
    </div>
  );
}

export type { HealthQuestion };
