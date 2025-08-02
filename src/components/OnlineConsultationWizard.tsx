'use client';

import { useState } from 'react';

interface ConsultationData {
  [key: string]: any;
  motivation?: string[];
  issues?: string[];
  previous_experience?: string;
  current_fullness?: string;
  dream_shape?: string;
  front_texture?: string;
  edge_definition?: string;
  brow_color?: string;
  additional_goals?: string;
  brow_photo?: File;
  concerns?: string;
  lifestyle?: string;
  timeline?: string;
  budget_notes?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  email_agreement?: boolean;
  other_issues?: string;
}

interface OnlineConsultationWizardProps {
  onComplete: (data: ConsultationData) => void;
}

export default function OnlineConsultationWizard({ onComplete }: OnlineConsultationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ConsultationData>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const totalSteps = 14;

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (name: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentValues = (prev[name] as string[]) || [];
      if (checked) {
        return { ...prev, [name]: [...currentValues, value] };
      } else {
        return { ...prev, [name]: currentValues.filter((v: string) => v !== value) };
      }
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 14) {
      if (!formData.first_name?.trim()) newErrors.first_name = 'First name is required';
      if (!formData.last_name?.trim()) newErrors.last_name = 'Last name is required';
      if (!formData.email?.trim()) newErrors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.email_agreement) newErrors.email_agreement = 'You must agree to receive emails';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === totalSteps) {
        onComplete(formData);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFileUpload = (file: File) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PNG, JPEG, or PDF file.');
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 10MB.');
      return;
    }

    setUploadedFile(file);
    handleInputChange('brow_photo', file);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 className="text-center mb-3" style={{ color: '#AD6269', fontFamily: 'Playfair Display, serif' }}>
              Let's Start!
            </h3>
            <p className="text-center mb-4">What is your main motivation for getting your brows done?</p>
            <div className="text-center mb-4">
              <small className="text-muted">Select all that apply</small>
            </div>
            <div className="row g-3">
              {[
                { value: 'put_together', label: 'I want to feel more put together daily' },
                { value: 'stop_makeup', label: 'I want to stop filling them in with makeup' },
                { value: 'improve_specific', label: 'I have something specific I want to improve' },
                { value: 'no_reason', label: 'No real reason, I just want them done!' }
              ].map((option) => (
                <div key={option.value} className="col-md-6">
                  <div className="form-check p-3 border rounded">
                    <input 
                      className="form-check-input me-3"
                      type="checkbox" 
                      id={option.value}
                      onChange={(e) => handleCheckboxChange('motivation', option.value, e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor={option.value}>
                      {option.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h3 className="text-center mb-3" style={{ color: '#AD6269', fontFamily: 'Playfair Display, serif' }}>
              Current Concerns
            </h3>
            <p className="text-center mb-4">Do your brows have any qualities you would like to correct?</p>
            <div className="row g-3 mb-4">
              {[
                { value: 'over_tweezed', label: 'Over-tweezed' },
                { value: 'patchy', label: 'Patchy' },
                { value: 'uneven', label: 'Uneven' },
                { value: 'too_thin', label: 'Too Thin' },
                { value: 'too_far_apart', label: 'Too far apart' },
                { value: 'sparse_tails', label: 'Sparse Tails' }
              ].map((option) => (
                <div key={option.value} className="col-md-6">
                  <div className="form-check p-3 border rounded">
                    <input 
                      className="form-check-input me-3"
                      type="checkbox" 
                      id={option.value}
                      onChange={(e) => handleCheckboxChange('issues', option.value, e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor={option.value}>
                      {option.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label className="form-label">Other concerns not listed above:</label>
              <textarea 
                className="form-control"
                rows={3}
                placeholder="Describe any other concerns..."
                onChange={(e) => handleInputChange('other_issues', e.target.value)}
              />
            </div>
          </div>
        );

      case 14:
        return (
          <div>
            <h3 className="text-center mb-3" style={{ color: '#AD6269', fontFamily: 'Playfair Display, serif' }}>
              Almost Done!
            </h3>
            <p className="text-center mb-4">One last step to complete your online consultation</p>
            <div className="text-center mb-4">
              <small className="text-muted">
                We'll review your information and send you your personalized recommendations straight to your email.<br/>
                (Please allow up to 48 hours as all recommendations are completed by a real person!)
              </small>
            </div>
            
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">First Name *</label>
                <input 
                  type="text" 
                  className={`form-control ${errors.first_name ? 'is-invalid' : ''}`}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  required
                />
                {errors.first_name && <div className="invalid-feedback">{errors.first_name}</div>}
              </div>
              <div className="col-md-6">
                <label className="form-label">Last Name *</label>
                <input 
                  type="text" 
                  className={`form-control ${errors.last_name ? 'is-invalid' : ''}`}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  required
                />
                {errors.last_name && <div className="invalid-feedback">{errors.last_name}</div>}
              </div>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Email Address *</label>
              <input 
                type="email" 
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            
            <div className="form-check">
              <input 
                type="checkbox" 
                className={`form-check-input ${errors.email_agreement ? 'is-invalid' : ''}`}
                id="emailAgreement"
                onChange={(e) => handleInputChange('email_agreement', e.target.checked)}
                required
              />
              <label className="form-check-label" htmlFor="emailAgreement">
                I agree to receive emails from A Pretty Girl Matter. *
              </label>
              {errors.email_agreement && <div className="invalid-feedback d-block">{errors.email_agreement}</div>}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <h3 style={{ color: '#AD6269', fontFamily: 'Playfair Display, serif' }}>
              Step {currentStep}
            </h3>
            <p>This step is under construction. Please continue to the next step.</p>
          </div>
        );
    }
  };

  return (
    <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
      <div className="card-body p-5">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="progress mb-2" style={{ height: '8px', borderRadius: '4px' }}>
            <div 
              className="progress-bar"
              style={{ 
                width: `${(currentStep / totalSteps) * 100}%`,
                background: 'linear-gradient(90deg, #AD6269 0%, #f75eb5 100%)'
              }}
            />
          </div>
          <div className="text-center">
            <small className="text-muted">Step {currentStep} of {totalSteps}</small>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-5">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="d-flex justify-content-between">
          {currentStep > 1 ? (
            <button 
              type="button" 
              className="btn btn-outline-secondary"
              onClick={prevStep}
            >
              Previous
            </button>
          ) : (
            <div></div>
          )}
          
          <button 
            type="button" 
            className="btn"
            style={{
              background: 'linear-gradient(135deg, #AD6269 0%, #f75eb5 100%)',
              color: 'white',
              border: 'none'
            }}
            onClick={nextStep}
          >
            {currentStep === totalSteps ? 'Submit Consultation' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
