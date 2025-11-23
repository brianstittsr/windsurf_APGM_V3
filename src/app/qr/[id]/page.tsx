'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function QRRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(true);

  useEffect(() => {
    const trackAndRedirect = async () => {
      const qrCodeId = params.id as string;

      if (!qrCodeId) {
        setError('Invalid QR code');
        setRedirecting(false);
        return;
      }

      try {
        // Track the scan
        const response = await fetch('/api/qr-codes/scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ qrCodeId }),
        });

        if (!response.ok) {
          throw new Error('Failed to track QR code scan');
        }

        const data = await response.json();

        // Redirect to the target URL
        if (data.url) {
          window.location.href = data.url;
        } else {
          setError('Invalid QR code');
          setRedirecting(false);
        }
      } catch (error) {
        console.error('Error tracking QR code:', error);
        setError('Failed to process QR code');
        setRedirecting(false);
      }
    };

    trackAndRedirect();
  }, [params.id]);

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="mb-4">
            <i className="fas fa-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
          </div>
          <h2 className="mb-3">QR Code Error</h2>
          <p className="text-muted mb-4">{error}</p>
          <a href="/" className="btn btn-primary">
            <i className="fas fa-home me-2"></i>Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <div className="spinner-border text-primary mb-4" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <h3 className="mb-2">Redirecting...</h3>
        <p className="text-muted">Please wait while we redirect you</p>
      </div>
    </div>
  );
}
