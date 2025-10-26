'use client';

import { useState } from 'react';

interface OutlookCalendarSetupProps {
  isOpen: boolean;
  onClose: () => void;
  artistId: string;
  artistName: string;
}

export default function OutlookCalendarSetup({ isOpen, onClose, artistId, artistName }: OutlookCalendarSetupProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleConnect = async () => {
    setIsConnecting(true);
    setConnectionStatus('connecting');
    setErrorMessage('');

    try {
      // Store the artist ID in session storage so we can retrieve it after OAuth redirect
      sessionStorage.setItem('outlook_artist_id', artistId);
      sessionStorage.setItem('outlook_artist_name', artistName);

      // Redirect to Microsoft OAuth endpoint
      window.location.href = '/api/auth/microsoft';
    } catch (error) {
      console.error('Error initiating Outlook connection:', error);
      setConnectionStatus('error');
      setErrorMessage('Failed to initiate connection. Please try again.');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      // Call API to remove Outlook connection for this artist
      const response = await fetch('/api/auth/microsoft/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId }),
      });

      if (response.ok) {
        setConnectionStatus('idle');
        alert('Outlook Calendar disconnected successfully!');
        onClose();
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (error) {
      console.error('Error disconnecting Outlook:', error);
      alert('Failed to disconnect Outlook Calendar. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-microsoft me-2"></i>
              Outlook Calendar Integration
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            <div className="mb-3">
              <p className="text-muted">
                Connect your Outlook Calendar to automatically sync your availability and appointments.
              </p>
              <p className="mb-0">
                <strong>Artist:</strong> {artistName}
              </p>
            </div>

            {connectionStatus === 'error' && (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {errorMessage}
              </div>
            )}

            {connectionStatus === 'success' && (
              <div className="alert alert-success" role="alert">
                <i className="bi bi-check-circle-fill me-2"></i>
                Successfully connected to Outlook Calendar!
              </div>
            )}

            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title">What will be synced?</h6>
                <ul className="mb-0">
                  <li>Your calendar availability will be checked before booking appointments</li>
                  <li>New appointments will be added to your Outlook Calendar</li>
                  <li>Appointment updates will sync automatically</li>
                  <li>Cancelled appointments will be removed from your calendar</li>
                </ul>
              </div>
            </div>

            <div className="mt-3">
              <h6>Required Permissions:</h6>
              <ul className="small text-muted">
                <li>Read and write access to your calendar</li>
                <li>View your basic profile information</li>
              </ul>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            {connectionStatus === 'success' ? (
              <button type="button" className="btn btn-danger" onClick={handleDisconnect}>
                <i className="bi bi-x-circle me-2"></i>
                Disconnect
              </button>
            ) : (
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Connecting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-microsoft me-2"></i>
                    Connect to Outlook
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
