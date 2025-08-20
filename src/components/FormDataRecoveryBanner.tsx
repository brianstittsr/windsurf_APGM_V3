'use client';

import React, { useState, useEffect } from 'react';

interface FormDataRecoveryBannerProps {
  onRestore: () => void;
  onDismiss: () => void;
  show: boolean;
}

export default function FormDataRecoveryBanner({ onRestore, onDismiss, show }: FormDataRecoveryBannerProps) {
  if (!show) return null;

  return (
    <div className="alert alert-info alert-dismissible fade show mb-4" role="alert">
      <div className="d-flex align-items-center">
        <i className="fas fa-info-circle me-3 fs-5"></i>
        <div className="flex-grow-1">
          <h6 className="alert-heading mb-1">Previous Session Found</h6>
          <p className="mb-0">
            We found a previous booking session. Would you like to continue where you left off?
          </p>
        </div>
        <div className="ms-3">
          <button
            type="button"
            className="btn btn-primary btn-sm me-2"
            onClick={onRestore}
          >
            <i className="fas fa-undo me-1"></i>
            Restore
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={onDismiss}
          >
            Start Fresh
          </button>
        </div>
      </div>
    </div>
  );
}
