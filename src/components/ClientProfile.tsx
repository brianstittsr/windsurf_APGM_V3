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

interface ClientProfileProps {
  data: ClientProfileData;
  onChange: (data: ClientProfileData) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ClientProfile({ data, onChange, onNext, onBack }: ClientProfileProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (field: keyof ClientProfileData, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!data.firstName.trim()) newErrors.push('First name is required');
    if (!data.lastName.trim()) newErrors.push('Last name is required');
    if (!data.email.trim()) newErrors.push('Email is required');
    if (!data.phone.trim()) newErrors.push('Phone number is required');
    if (!data.dateOfBirth) newErrors.push('Date of birth is required');
    if (!data.address.trim()) newErrors.push('Address is required');
    if (!data.city.trim()) newErrors.push('City is required');
    if (!data.state.trim()) newErrors.push('State is required');
    if (!data.zipCode.trim()) newErrors.push('ZIP code is required');
    if (!data.emergencyContactName.trim()) newErrors.push('Emergency contact name is required');
    if (!data.emergencyContactPhone.trim()) newErrors.push('Emergency contact phone is required');
    if (!data.preferredContactMethod) newErrors.push('Preferred contact method is required');

    // Email validation
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      newErrors.push('Please enter a valid email address');
    }

    // Phone validation (basic)
    if (data.phone && !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(data.phone)) {
      newErrors.push('Please enter a valid phone number');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  const contactMethods = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone Call' },
    { value: 'text', label: 'Text Message' }
  ];

  const hearAboutOptions = [
    'Google Search',
    'Social Media (Instagram/Facebook)',
    'Friend/Family Referral',
    'Yelp/Google Reviews',
    'Website',
    'Advertisement',
    'Other'
  ];

  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white text-center py-4">
              <h2 className="h3 mb-0">Client Profile Information</h2>
              <p className="mb-0 opacity-75">Please provide your personal information for our records</p>
            </div>
            
            <div className="card-body p-4">
              {errors.length > 0 && (
                <div className="alert alert-danger">
                  <h6 className="fw-bold mb-2">Please correct the following errors:</h6>
                  <ul className="mb-0">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form>
                {/* Personal Information */}
                <div className="mb-4">
                  <h5 className="text-primary fw-bold mb-3">Personal Information</h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">First Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={data.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Last Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={data.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={data.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Phone Number *</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={data.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Date of Birth *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={data.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Preferred Contact Method *</label>
                      <select
                        className="form-select"
                        value={data.preferredContactMethod}
                        onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
                      >
                        <option value="">Select contact method</option>
                        {contactMethods.map(method => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="mb-4">
                  <h5 className="text-primary fw-bold mb-3">Address Information</h5>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Street Address *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={data.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Main Street"
                    />
                  </div>
                  
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold">City *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={data.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="City"
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold">State *</label>
                      <select
                        className="form-select"
                        value={data.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                      >
                        <option value="">Select state</option>
                        {states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold">ZIP Code *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={data.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        placeholder="12345"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="mb-4">
                  <h5 className="text-primary fw-bold mb-3">Emergency Contact</h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Emergency Contact Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={data.emergencyContactName}
                        onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                        placeholder="Full name"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Emergency Contact Phone *</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={data.emergencyContactPhone}
                        onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                {/* How did you hear about us */}
                <div className="mb-4">
                  <h5 className="text-primary fw-bold mb-3">Marketing Information</h5>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">How did you hear about us?</label>
                    <select
                      className="form-select"
                      value={data.hearAboutUs}
                      onChange={(e) => handleInputChange('hearAboutUs', e.target.value)}
                    >
                      <option value="">Select an option</option>
                      {hearAboutOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </form>
            </div>

            <div className="card-footer bg-light d-flex justify-content-between py-3">
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={onBack}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary px-4"
                onClick={handleNext}
              >
                Continue to Health Form
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
