'use client';

import React from 'react';

interface ClientProfileData {
  emergencyContactName: string;
  emergencyContactPhone: string;
}

interface ProfileConfirmationProps {
  data: ClientProfileData;
  onConfirm: () => void;
  onEdit: () => void;
  onBack: () => void;
}

export default function ProfileConfirmation({ data, onConfirm, onEdit, onBack }: ProfileConfirmationProps) {
  const formatFieldName = (key: string): string => {
    const fieldNames: { [key: string]: string } = {
      emergencyContactName: 'Emergency Contact Name',
      emergencyContactPhone: 'Emergency Contact Phone'
    };
    return fieldNames[key] || key;
  };

  const formatValue = (key: string, value: string): string => {
    if (key === 'preferredContactMethod') {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return value;
  };

  const getFilledFields = () => {
    return Object.entries(data).filter(([_, value]) => value && value.trim() !== '');
  };

  const filledFields = getFilledFields();

  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-success text-white text-center py-4">
              <h2 className="h3 mb-0">
                <i className="fas fa-user-check me-2"></i>
                Profile Information Loaded
              </h2>
              <p className="mb-0 opacity-75">Please confirm your information is correct</p>
            </div>
            
            <div className="card-body p-4">
              <div className="alert alert-info mb-4">
                <h6 className="alert-heading">
                  <i className="fas fa-info-circle me-2"></i>
                  Your Profile Information
                </h6>
                <p className="mb-0">
                  We've loaded your profile information from your account. Please review and confirm it's correct, 
                  or click "Edit Information" if you need to make changes.
                </p>
              </div>

              <div className="row">
                {filledFields.map(([key, value]) => (
                  <div key={key} className="col-md-6 mb-3">
                    <div className="border rounded p-3 bg-light">
                      <label className="form-label fw-bold text-primary mb-1">
                        {formatFieldName(key)}
                      </label>
                      <div className="text-dark">
                        {formatValue(key, value)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filledFields.length === 0 && (
                <div className="text-center py-4">
                  <i className="fas fa-user-plus fa-3x text-muted mb-3"></i>
                  <h5 className="text-muted">No profile information found</h5>
                  <p className="text-muted">Please fill out your profile information to continue.</p>
                </div>
              )}

              <div className="d-flex justify-content-between mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={onBack}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Back
                </button>
                
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary px-4"
                    onClick={onEdit}
                  >
                    <i className="fas fa-edit me-2"></i>
                    Edit Information
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-success px-4"
                    onClick={onConfirm}
                    disabled={filledFields.length === 0}
                  >
                    <i className="fas fa-check me-2"></i>
                    Confirm & Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
