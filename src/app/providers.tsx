'use client';

import { useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function BootstrapProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Only initialize Bootstrap on client side
    if (typeof window === 'undefined') return;
    
    // Dynamically import Bootstrap JS only on client
    // @ts-ignore - Bootstrap types not available
    import('bootstrap/dist/js/bootstrap.bundle.min.js').then(() => {
      // Initialize Bootstrap tooltips and popovers
      const tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
      );
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new (window as any).bootstrap.Tooltip(tooltipTriggerEl);
      });

      const popoverTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="popover"]')
      );
      popoverTriggerList.map(function (popoverTriggerEl) {
        return new (window as any).bootstrap.Popover(popoverTriggerEl);
      });
    });
  }, []);

  return <>{children}</>;
}
