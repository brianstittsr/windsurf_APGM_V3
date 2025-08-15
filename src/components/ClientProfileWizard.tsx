'use client';

import { useState } from 'react';

interface ClientProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  preferredContactMethod: string;
  hearAboutUs: string;
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

  const steps: WizardStep[] = [
    {
      id: 'firstName',
      title: 'Personal Information',
      question: 'What is your first name?',
      type: 'text',
      placeholder: 'Enter your first name',
      required: true
    },
    {
      id: 'lastName',
      title: 'Personal Information',
      question: 'What is your last name?',
      type: 'text',
      placeholder: 'Enter your last name',
      required: true
    },
    {
      id: 'email',
      title: 'Contact Information',
      question: 'What is your email address?',
      type: 'email',
      placeholder: 'Enter your email address',
      required: true,
      validation: (value: string) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        return null;
      }
    },
    {
      id: 'phone',
      title: 'Contact Information',
      question: 'What is your phone number?',
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
    },
    {
      id: 'dateOfBirth',
      title: 'Personal Information',
      question: 'What is your date of birth?',
      type: 'date',
      required: true,
      validation: (value: string) => {
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          // Adjust age if birthday hasn't occurred this year
          const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
            ? age - 1 
            : age;
          
          if (actualAge < 18) {
            return 'You must be at least 18 years old to book permanent makeup services.';
          }
        }
        return null;
      }
    },
    {
      id: 'address',
      title: 'Address Information',
      question: 'What is your street address?',
      type: 'text',
      placeholder: '123 Main Street',
      required: true
    },
    {
      id: 'city',
      title: 'Address Information',
      question: 'What city do you live in?',
      type: 'text',
      placeholder: 'Enter your city',
      required: true
    },
    {
      id: 'state',
      title: 'Address Information',
      question: 'What state do you live in?',
      type: 'select',
      required: true,
      defaultValue: 'NC',
      options: [
        { value: '', label: 'Select your state' },
        { value: 'AL', label: 'Alabama' },
        { value: 'AK', label: 'Alaska' },
        { value: 'AZ', label: 'Arizona' },
        { value: 'AR', label: 'Arkansas' },
        { value: 'CA', label: 'California' },
        { value: 'CO', label: 'Colorado' },
        { value: 'CT', label: 'Connecticut' },
        { value: 'DE', label: 'Delaware' },
        { value: 'FL', label: 'Florida' },
        { value: 'GA', label: 'Georgia' },
        { value: 'HI', label: 'Hawaii' },
        { value: 'ID', label: 'Idaho' },
        { value: 'IL', label: 'Illinois' },
        { value: 'IN', label: 'Indiana' },
        { value: 'IA', label: 'Iowa' },
        { value: 'KS', label: 'Kansas' },
        { value: 'KY', label: 'Kentucky' },
        { value: 'LA', label: 'Louisiana' },
        { value: 'ME', label: 'Maine' },
        { value: 'MD', label: 'Maryland' },
        { value: 'MA', label: 'Massachusetts' },
        { value: 'MI', label: 'Michigan' },
        { value: 'MN', label: 'Minnesota' },
        { value: 'MS', label: 'Mississippi' },
        { value: 'MO', label: 'Missouri' },
        { value: 'MT', label: 'Montana' },
        { value: 'NE', label: 'Nebraska' },
        { value: 'NV', label: 'Nevada' },
        { value: 'NH', label: 'New Hampshire' },
        { value: 'NJ', label: 'New Jersey' },
        { value: 'NM', label: 'New Mexico' },
        { value: 'NY', label: 'New York' },
        { value: 'NC', label: 'North Carolina' },
        { value: 'ND', label: 'North Dakota' },
        { value: 'OH', label: 'Ohio' },
        { value: 'OK', label: 'Oklahoma' },
        { value: 'OR', label: 'Oregon' },
        { value: 'PA', label: 'Pennsylvania' },
        { value: 'RI', label: 'Rhode Island' },
        { value: 'SC', label: 'South Carolina' },
        { value: 'SD', label: 'South Dakota' },
        { value: 'TN', label: 'Tennessee' },
        { value: 'TX', label: 'Texas' },
        { value: 'UT', label: 'Utah' },
        { value: 'VT', label: 'Vermont' },
        { value: 'VA', label: 'Virginia' },
        { value: 'WA', label: 'Washington' },
        { value: 'WV', label: 'West Virginia' },
        { value: 'WI', label: 'Wisconsin' },
        { value: 'WY', label: 'Wyoming' }
      ]
    },
    {
      id: 'zipCode',
      title: 'Address Information',
      question: 'What is your ZIP code?',
      type: 'text',
      placeholder: '12345',
      required: true,
      validation: (value: string) => {
        if (value && !/^\d{5}$/.test(value)) {
          return 'Please enter a valid 5-digit ZIP code';
        }
        return null;
      }
    },
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
    },
    {
      id: 'preferredContactMethod',
      title: 'Communication Preferences',
      question: 'How would you prefer us to contact you?',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'Select contact method' },
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone Call' },
        { value: 'text', label: 'Text Message' }
      ]
    },
    {
      id: 'hearAboutUs',
      title: 'Marketing Information',
      question: 'How did you hear about us?',
      type: 'select',
      required: false,
      options: [
        { value: '', label: 'Select an option (optional)' },
        { value: 'Google Search', label: 'Google Search' },
        { value: 'Social Media (Instagram/Facebook)', label: 'Social Media (Instagram/Facebook)' },
        { value: 'Friend/Family Referral', label: 'Friend/Family Referral' },
        { value: 'Yelp/Google Reviews', label: 'Yelp/Google Reviews' },
        { value: 'Website', label: 'Website' },
        { value: 'Advertisement', label: 'Advertisement' },
        { value: 'Other', label: 'Other' }
      ]
    }
  ];

  const currentStep = steps[currentStepIndex];

  // Phone number formatting function
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  // ZIP code formatting function
  const formatZipCode = (value: string) => {
    // Remove all non-digits and limit to 5 digits
    return value.replace(/\D/g, '').slice(0, 5);
  };

  const handleInputChange = (value: string) => {
    let formattedValue = value;
    
    // Apply formatting based on field type
    if (currentStep.id === 'phone' || currentStep.id === 'emergencyContactPhone') {
      formattedValue = formatPhoneNumber(value);
    } else if (currentStep.id === 'zipCode') {
      formattedValue = formatZipCode(value);
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
                
                {currentStep.type === 'select' ? (
                  <select
                    className="form-select form-select-lg"
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
                  <input
                    type={currentStep.type}
                    className="form-control form-control-lg text-center"
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
