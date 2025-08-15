'use client';

import React, { useState } from 'react';

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
  { id: 13, question: "Do you understand the risks and aftercare requirements?", type: 'yesno', category: 'Understanding' },
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
  onSignatureChange 
}: HealthFormWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const currentStep = steps[currentStepIndex];

  const handleInputChange = (value: string) => {
    if (currentStep.type === 'signature') {
      onSignatureChange(value);
    } else {
      onChange({
        ...data,
        [currentStep.id]: value
      });
    }
    setErrors([]); // Clear errors when user types
  };

  const validateCurrentStep = () => {
    const newErrors: string[] = [];
    
    if (currentStep.type === 'yesno') {
      const value = data[currentStep.id];
      if (!value) {
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

  const getProgressPercentage = () => {
    return Math.round(((currentStepIndex + 1) / steps.length) * 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white text-center py-4">
              <h2 className="h3 mb-0">Health & Consent Form</h2>
              <p className="mb-0" style={{ color: 'white' }}>Step {currentStepIndex + 1} of {steps.length}</p>
              
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar" 
                    role="progressbar" 
                    style={{ 
                      width: `${getProgressPercentage()}%`,
                      backgroundColor: 'rgba(173, 98, 105, 0.5)'
                    }}
                  ></div>
                </div>
                <small className="text-white-50 mt-1 d-block">
                  {getProgressPercentage()}% Complete
                </small>
              </div>
            </div>
            
            <div className="card-body p-5" onKeyPress={handleKeyPress}>
              {errors.length > 0 && (
                <div className="alert alert-danger mb-4">
                  <ul className="mb-0">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Current Step */}
              <div className="text-center mb-4">
                <div className={`badge bg-light text-dark px-3 py-2 mb-3 ${
                  currentStep.category === 'Medical Conditions' ? 'fs-4' : ''
                }`}>
                  {currentStep.category}
                </div>
                <h1 className="text-primary fw-bold mb-4">
                  {currentStep.question}
                </h1>
              </div>

              {/* Question Content */}
              {currentStep.type === 'yesno' ? (
                <div className="d-flex justify-content-center gap-4 mb-5">
                  <button
                    type="button"
                    className={`btn btn-lg px-5 py-3 ${
                      data[currentStep.id] === 'yes' 
                        ? 'btn-success' 
                        : 'btn-outline-success'
                    }`}
                    onClick={() => handleInputChange('yes')}
                    autoFocus
                  >
                    <i className="fas fa-check me-2"></i>
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`btn btn-lg px-5 py-3 ${
                      data[currentStep.id] === 'no' 
                        ? 'btn-danger' 
                        : 'btn-outline-danger'
                    }`}
                    onClick={() => handleInputChange('no')}
                  >
                    <i className="fas fa-times me-2"></i>
                    No
                  </button>
                </div>
              ) : (
                <div className="mb-5">
                  {/* Consent Information */}
                  <div className="alert alert-warning mb-4">
                    <h6 className="fw-bold mb-2">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Acknowledgment & Consent
                    </h6>
                    <p className="mb-2 small">
                      By signing below, I acknowledge that:
                    </p>
                    <ul className="small mb-0">
                      <li>I have answered all health questions honestly and completely</li>
                      <li>I understand the risks and benefits of permanent makeup procedures</li>
                      <li>I consent to the permanent makeup procedure</li>
                      <li>I understand that results may vary and touch-ups may be needed</li>
                    </ul>
                  </div>

                  <div className="row justify-content-center">
                    <div className="col-md-8">
                      <label className="form-label text-dark fw-semibold">Electronic Signature *</label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        value={clientSignature}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder="Type your full legal name"
                        autoFocus
                      />
                      <small className="text-muted">
                        By typing your name, you agree to use electronic records and signatures.
                      </small>
                      <div className="mt-3">
                        <small className="text-muted">
                          Date & Time: {new Date().toLocaleDateString()} - {new Date().toLocaleTimeString()}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="d-flex justify-content-between align-items-center pt-4 border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handlePrevious}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  {currentStepIndex === 0 ? 'Back to Profile' : 'Previous'}
                </button>
                
                <button
                  type="button"
                  className="btn btn-primary btn-lg px-4"
                  onClick={handleNext}
                >
                  {currentStepIndex === steps.length - 1 ? 'Complete Form' : 'Next'}
                  <i className="fas fa-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { HealthFormData };
