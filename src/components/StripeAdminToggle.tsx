'use client';

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';

interface StripeAdminToggleProps {
  currentUser: User | null;
  userRole: string | null;
}

interface StripeStatus {
  mode: 'test' | 'live';
  description: string;
  isLive: boolean;
  publishableKeyPrefix: string;
}

export default function StripeAdminToggle({ currentUser, userRole }: StripeAdminToggleProps) {
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadStripeStatus();
    }
  }, [isAdmin]);

  const loadStripeStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/stripe/mode');
      if (!response.ok) {
        throw new Error('Failed to load Stripe status');
      }
      
      const data = await response.json();
      setStripeStatus(data);
    } catch (err) {
      console.error('Error loading Stripe status:', err);
      setError(err instanceof Error ? err.message : 'Failed to load Stripe status');
    } finally {
      setLoading(false);
    }
  };

  const toggleStripeMode = async () => {
    if (!currentUser || !stripeStatus) return;

    const newMode = stripeStatus.mode === 'test' ? 'live' : 'test';
    
    // Show confirmation dialog for switching to live mode
    if (newMode === 'live') {
      const confirmed = window.confirm(
        '⚠️ WARNING: You are about to switch to LIVE PAYMENT MODE.\n\n' +
        'This means:\n' +
        '• Real credit cards will be charged\n' +
        '• Real money will be processed\n' +
        '• All payments will be live transactions\n\n' +
        'Are you sure you want to continue?'
      );
      
      if (!confirmed) return;
    }

    try {
      setUpdating(true);
      setError(null);

      const response = await fetch('/api/stripe/mode/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: newMode,
          adminUserId: currentUser.uid
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update Stripe mode');
      }

      const result = await response.json();
      
      // Reload status to reflect changes
      await loadStripeStatus();
      
      // Show success message
      alert(`✅ Stripe mode successfully changed to ${newMode.toUpperCase()}`);
      
    } catch (err) {
      console.error('Error updating Stripe mode:', err);
      setError(err instanceof Error ? err.message : 'Failed to update Stripe mode');
    } finally {
      setUpdating(false);
    }
  };

  if (!isAdmin) {
    return null; // Don't show to non-admin users
  }

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="spinner-border text-primary mb-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mb-0">Loading Stripe configuration...</p>
        </div>
      </div>
    );
  }

  if (error && !stripeStatus) {
    return (
      <div className="card border-danger">
        <div className="card-body">
          <h5 className="card-title text-danger">
            <i className="fas fa-exclamation-triangle me-2"></i>
            Stripe Configuration Error
          </h5>
          <p className="card-text text-danger">{error}</p>
          <button 
            className="btn btn-outline-danger"
            onClick={loadStripeStatus}
          >
            <i className="fas fa-redo me-2"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="fab fa-stripe me-2"></i>
          Stripe Payment Mode
        </h5>
        <span className={`badge ${stripeStatus?.isLive ? 'bg-danger' : 'bg-success'} fs-6`}>
          {stripeStatus?.mode.toUpperCase()}
        </span>
      </div>
      
      <div className="card-body">
        {error && (
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setError(null)}
            ></button>
          </div>
        )}

        <div className="row">
          <div className="col-md-8">
            <h6 className="fw-bold">Current Status</h6>
            <p className="mb-2">
              <strong>Mode:</strong> {stripeStatus?.description}
            </p>
            <p className="mb-2">
              <strong>Key:</strong> <code>{stripeStatus?.publishableKeyPrefix}</code>
            </p>
            
            {stripeStatus?.isLive ? (
              <div className="alert alert-danger mb-3">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <strong>LIVE MODE ACTIVE</strong> - Real payments are being processed
              </div>
            ) : (
              <div className="alert alert-success mb-3">
                <i className="fas fa-check-circle me-2"></i>
                <strong>TEST MODE ACTIVE</strong> - Safe for development and testing
              </div>
            )}
          </div>
          
          <div className="col-md-4 text-end">
            <button
              className={`btn ${stripeStatus?.isLive ? 'btn-success' : 'btn-danger'} btn-lg`}
              onClick={toggleStripeMode}
              disabled={updating}
            >
              {updating ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Updating...
                </>
              ) : (
                <>
                  <i className={`fas ${stripeStatus?.isLive ? 'fa-shield-alt' : 'fa-rocket'} me-2`}></i>
                  Switch to {stripeStatus?.isLive ? 'TEST' : 'LIVE'}
                </>
              )}
            </button>
          </div>
        </div>

        <hr />
        
        <div className="row text-muted small">
          <div className="col-md-6">
            <h6 className="fw-bold">Test Mode</h6>
            <ul className="list-unstyled mb-0">
              <li>• Safe for development</li>
              <li>• Use test cards (4242...)</li>
              <li>• No real charges</li>
            </ul>
          </div>
          <div className="col-md-6">
            <h6 className="fw-bold">Live Mode</h6>
            <ul className="list-unstyled mb-0">
              <li>• Real payment processing</li>
              <li>• Actual credit cards</li>
              <li>• Real money transactions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
