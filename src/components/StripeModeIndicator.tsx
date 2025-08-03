'use client';

import { useEffect, useState } from 'react';

interface StripeModeInfo {
  mode: string;
  description: string;
  isLive: boolean;
}

export default function StripeModeIndicator() {
  const [modeInfo, setModeInfo] = useState<StripeModeInfo | null>(null);

  useEffect(() => {
    // Get Stripe mode information from the client-side
    const fetchModeInfo = async () => {
      try {
        const response = await fetch('/api/stripe/mode');
        if (response.ok) {
          const data = await response.json();
          setModeInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch Stripe mode:', error);
      }
    };

    fetchModeInfo();
  }, []);

  if (!modeInfo) {
    return null;
  }

  return (
    <div className={`alert ${modeInfo.isLive ? 'alert-success' : 'alert-warning'} mb-3`}>
      <div className="d-flex align-items-center">
        <i className={`fas ${modeInfo.isLive ? 'fa-shield-alt' : 'fa-flask'} me-2`}></i>
        <div>
          <strong>Stripe Mode:</strong> {modeInfo.description}
          {!modeInfo.isLive && (
            <div className="small mt-1">
              <i className="fas fa-info-circle me-1"></i>
              Test mode - No real charges will be made
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
