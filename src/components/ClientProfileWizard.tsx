'use client';

import { useState, useEffect } from 'react';

interface ClientProfileData {
  emergencyContactName: string;
  emergencyContactPhone: string;
}

interface ClientProfileWizardProps {
  data: ClientProfileData;
  onChange: (data: ClientProfileData) => void;
  onNext: () => void;
  onBack: () => void;
}

interface WizardStep {
  id: keyof ClientProfileData;
  title: string;
  question: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select';
  placeholder?: string;
  required: boolean;
  defaultValue?: string;
  options?: { value: string; label: string }[];
  validation?: (value: string) => string | null;
}

export default function ClientProfileWizard({ data, onChange, onNext, onBack }: ClientProfileWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [isPrePopulated, setIsPrePopulated] = useState(false);

  // Check if data is pre-populated (user is authenticated)
  useEffect(() => {
    const hasPrePopulatedData = Object.values(data).some(value => value && value.trim() !== '');
    setIsPrePopulated(hasPrePopulatedData);
    
    // Don't auto-skip steps - let user navigate manually
    // This prevents the wizard from jumping ahead when phone number is entered
  }, [data]);

  const steps: WizardStep[] = [
    {
      id: 'emergencyContactName',
      title: 'Emergency Contact',
      question: 'Who should we contact in case of emergency?',
      type: 'text',
      placeholder: 'Emergency contact full name',
      required: true
    },
    {
      id: 'emergencyContactPhone',
      title: 'Emergency Contact',
      question: 'What is their phone number?',
      type: 'tel',
      placeholder: '(555) 123-4567',
      required: true,
      validation: (value: string) => {
        const digits = value.replace(/\D/g, '');
        if (value && digits.length !== 10) {
          return 'Please enter a valid 10-digit phone number';
        }
        return null;
      }
    }
  ];

  const currentStep = steps[currentStepIndex];

  // Phone number formatting function
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Don't format if empty or too short
    if (digits.length === 0) {
      return '';
    }
    
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length <= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else {
      // Limit to 10 digits
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };


  const handleInputChange = (value: string) => {
    let formattedValue = value;
    
    // Apply formatting based on field type
    if (currentStep.id === 'emergencyContactPhone') {
      formattedValue = formatPhoneNumber(value);
      
      // Don't auto-advance on phone number formatting
      onChange({
        ...data,
        [currentStep.id]: formattedValue
      });
      setErrors([]); // Clear errors when user types
      return; // Exit early to prevent auto-advance
    }
    
    onChange({
      ...data,
      [currentStep.id]: formattedValue
    });
    setErrors([]); // Clear errors when user types
  };

  const validateCurrentStep = () => {
    const newErrors: string[] = [];
    const value = data[currentStep.id];
    const effectiveValue = value || currentStep.defaultValue;

    if (currentStep.required && !effectiveValue?.trim()) {
      newErrors.push(`${currentStep.question.replace('?', '')} is required`);
    }

    if (currentStep.validation && effectiveValue) {
      const validationError = currentStep.validation(effectiveValue);
      if (validationError) {
        newErrors.push(validationError);
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

  const getCompletedSteps = () => {
    return steps.filter(step => data[step.id]?.trim()).length;
  };

  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white text-center py-4">
              <h2 className="h3 mb-0">{currentStep.title}</h2>
              <p className="mb-0 opacity-75">Step {currentStepIndex + 1} of {steps.length}</p>
              {isPrePopulated && (
                <div className="mt-2">
                  <small className="badge bg-success">
                    <i className="fas fa-user-check me-1"></i>
                    Profile information loaded
                  </small>
                </div>
              )}
              
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className="progress-bar bg-warning" 
                    role="progressbar" 
                    style={{ width: `${getProgressPercentage()}%` }}
                  ></div>
                </div>
                <small className="text-white-50 mt-1 d-block">
                  {getProgressPercentage()}% Complete ({getCompletedSteps()}/{steps.length} fields)
                </small>
              </div>
            </div>
            
            <div className="card-body p-5">
              {errors.length > 0 && (
                <div className="alert alert-danger mb-4">
                  {errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              )}

              <div className="text-center mb-4">
                <h4 className="text-dark fw-bold mb-3">{currentStep.question}</h4>
                
                {/* Show pre-populated indicator for current field */}
                {data[currentStep.id] && data[currentStep.id].trim() !== '' && (
                  <div className="mb-3">
                    <small className="text-success">
                      <i className="fas fa-check-circle me-1"></i>
                      Information from your profile - you can edit if needed
                    </small>
                  </div>
                )}
                
                {currentStep.type === 'select' ? (
                  <select
                    className={`form-select form-select-lg ${data[currentStep.id] && data[currentStep.id].trim() !== '' ? 'border-success' : ''}`}
                    value={data[currentStep.id] || currentStep.defaultValue || ''}
                    onChange={(e) => handleInputChange(e.target.value)}
                    autoFocus
                  >
                    {currentStep.options?.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="position-relative">
                    <input
                      type={currentStep.type}
                      className={`form-control form-control-lg text-center ${data[currentStep.id] && data[currentStep.id].trim() !== '' ? 'border-success' : ''}`}
                      value={data[currentStep.id] || ''}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder={currentStep.placeholder}
                      autoFocus
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleNext();
                        }
                      }}
                    />
                    {data[currentStep.id] && data[currentStep.id].trim() !== '' && (
                      <i className="fas fa-check-circle text-success position-absolute" 
                         style={{ right: '15px', top: '50%', transform: 'translateY(-50%)' }}></i>
                    )}
                  </div>
                )}
                
                {!currentStep.required && (
                  <small className="text-muted d-block mt-2">
                    This field is optional
                  </small>
                )}
              </div>
            </div>

            <div className="card-footer bg-light d-flex justify-content-between py-3">
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={handlePrevious}
              >
                <i className="fas fa-arrow-left me-2"></i>
                {currentStepIndex === 0 ? 'Back to Calendar' : 'Previous'}
              </button>
              <button
                type="button"
                className="btn btn-primary px-4"
                onClick={handleNext}
              >
                {currentStepIndex === steps.length - 1 ? 'Continue to Health Form' : 'Next'}
                <i className="fas fa-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { ClientProfileData };
