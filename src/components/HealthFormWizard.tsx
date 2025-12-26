'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Check, X, AlertTriangle, Heart } from 'lucide-react';

interface HealthFormData {
  [key: number]: string;
}

interface HealthFormWizardProps {
  data: HealthFormData;
  onChange: (data: HealthFormData) => void;
  onNext: () => void;
  onBack: () => void;
  clientSignature: string;
  onSignatureChange: (signature: string) => void;
  hideHeader?: boolean;
}

interface WizardStep {
  id: number;
  question: string;
  type: 'yesno' | 'signature';
  category: string;
}

const steps: WizardStep[] = [
  { id: 0, question: "Are you currently pregnant or breastfeeding?", type: 'yesno', category: 'General Health' },
  { id: 1, question: "Do you have any allergies to topical anesthetics, pigments, or latex?", type: 'yesno', category: 'Allergies' },
  { id: 2, question: "Are you currently taking any blood-thinning medications (aspirin, warfarin, etc.)?", type: 'yesno', category: 'Medications' },
  { id: 3, question: "Do you have a history of keloid scarring or poor wound healing?", type: 'yesno', category: 'Skin Conditions' },
  { id: 4, question: "Have you had any cosmetic procedures in the treatment area within the last 6 months?", type: 'yesno', category: 'Recent Procedures' },
  { id: 5, question: "Do you have any active skin conditions (eczema, psoriasis, dermatitis) in the treatment area?", type: 'yesno', category: 'Skin Conditions' },
  { id: 6, question: "Are you currently using Retin-A, Accutane, or other retinoid products?", type: 'yesno', category: 'Medications' },
  { id: 7, question: "Do you have diabetes or any autoimmune disorders?", type: 'yesno', category: 'Medical Conditions' },
  { id: 8, question: "Have you had Botox or fillers in the treatment area within the last 4 weeks?", type: 'yesno', category: 'Recent Procedures' },
  { id: 9, question: "Do you have a history of cold sores or fever blisters?", type: 'yesno', category: 'Medical History' },
  { id: 10, question: "Are you currently taking any medications that affect blood clotting?", type: 'yesno', category: 'Medications' },
  { id: 11, question: "Do you have any metal allergies or sensitivities?", type: 'yesno', category: 'Allergies' },
  { id: 12, question: "Have you consumed alcohol within the last 24 hours?", type: 'yesno', category: 'Pre-Treatment' },
  { id: 14, question: "Are you over 18 years of age?", type: 'yesno', category: 'Legal Requirements' },
  { id: 17, question: "Do you understand that results may vary and touch-ups may be needed?", type: 'yesno', category: 'Expectations' },
  { id: 18, question: "Electronic Signature & Consent", type: 'signature', category: 'Final Consent' }
];

export default function HealthFormWizard({ 
  data, 
  onChange, 
  onNext, 
  onBack, 
  clientSignature, 
  onSignatureChange,
  hideHeader = false
}: HealthFormWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const currentStep = steps[currentStepIndex];

  const handleInputChange = (value: string) => {
    if (currentStep.type === 'signature') {
      onSignatureChange(value);
    } else {
      onChange({ ...data, [currentStep.id]: value });
      
      if (currentStep.type === 'yesno') {
        setTimeout(() => {
          if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
          } else {
            onNext();
          }
        }, 300);
      }
    }
    setErrors([]);
  };

  const validateCurrentStep = () => {
    const newErrors: string[] = [];
    
    if (currentStep.type === 'yesno') {
      if (!data[currentStep.id]) {
        newErrors.push('Please select Yes or No');
      }
    } else if (currentStep.type === 'signature') {
      if (!clientSignature.trim()) {
        newErrors.push('Electronic signature is required');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        onNext();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setErrors([]);
    } else {
      onBack();
    }
  };

  const getProgressPercentage = () => Math.round(((currentStepIndex + 1) / steps.length) * 100);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <div className={`${hideHeader ? 'py-4' : 'min-h-[60vh]'} flex items-center justify-center px-4`}>
      <Card className={`w-full max-w-2xl shadow-xl border-0 ${hideHeader ? 'shadow-none' : ''}`}>
        {/* Header - only show if not embedded */}
        {!hideHeader && (
          <CardHeader className="bg-[#AD6269] text-white rounded-t-lg p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Health & Consent Form</h2>
            </div>
            <p className="text-white/80 text-sm">
              Question {currentStepIndex + 1} of {steps.length}
            </p>
            
            <div className="mt-4">
              <Progress value={getProgressPercentage()} className="h-2 bg-white/30" />
              <p className="text-white/70 text-xs mt-2">
                {getProgressPercentage()}% Complete
              </p>
            </div>
          </CardHeader>
        )}
        
        <CardContent className="p-8" onKeyPress={handleKeyPress}>
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {errors.map((error, index) => (
                <p key={index} className="text-sm">{error}</p>
              ))}
            </div>
          )}

          {/* Category Badge */}
          <div className="text-center mb-6">
            <span className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              {currentStep.category}
            </span>
            <h3 className="text-xl font-bold text-[#AD6269]">
              {currentStep.question}
            </h3>
          </div>

          {/* Question Content */}
          {currentStep.type === 'yesno' ? (
            <div className="flex justify-center gap-6 mb-8">
              <Button
                type="button"
                size="lg"
                variant={data[currentStep.id] === 'yes' ? 'default' : 'outline'}
                className={`px-8 py-6 text-lg ${
                  data[currentStep.id] === 'yes' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'border-green-600 text-green-600 hover:bg-green-50'
                }`}
                onClick={() => handleInputChange('yes')}
                autoFocus
              >
                <Check className="w-5 h-5 mr-2" />
                Yes
              </Button>
              <Button
                type="button"
                size="lg"
                variant={data[currentStep.id] === 'no' ? 'default' : 'outline'}
                className={`px-8 py-6 text-lg ${
                  data[currentStep.id] === 'no' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'border-red-600 text-red-600 hover:bg-red-50'
                }`}
                onClick={() => handleInputChange('no')}
              >
                <X className="w-5 h-5 mr-2" />
                No
              </Button>
            </div>
          ) : (
            <div className="mb-8">
              {/* Consent Information */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-2">Acknowledgment & Consent</h4>
                    <p className="text-sm text-amber-700 mb-2">By signing below, I acknowledge that:</p>
                    <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                      <li>I have answered all health questions honestly and completely</li>
                      <li>I understand the risks and benefits of permanent makeup procedures</li>
                      <li>I consent to the permanent makeup procedure</li>
                      <li>I understand that results may vary and touch-ups may be needed</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="max-w-md mx-auto">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Electronic Signature *
                </label>
                <Input
                  type="text"
                  value={clientSignature}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Type your full legal name"
                  className="h-14 text-center text-lg"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  By typing your name, you agree to use electronic records and signatures.
                </p>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Date & Time: {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-gray-50 rounded-b-lg p-4 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStepIndex === 0 ? 'Back to Profile' : 'Previous'}
          </Button>
          <Button
            onClick={handleNext}
            className="gap-2 bg-[#AD6269] hover:bg-[#9d5860]"
          >
            {currentStepIndex === steps.length - 1 ? 'Complete Form' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export type { HealthFormData };
