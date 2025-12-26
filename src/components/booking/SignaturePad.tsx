'use client';

import { useRef, useEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';

interface SignaturePadProps {
  onSignatureChange: (signature: string) => void;
  signature?: string;
  label?: string;
  required?: boolean;
}

export default function SignaturePad({
  onSignatureChange,
  signature,
  label = 'Your Signature',
  required = true
}: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    // If there's an existing signature, load it
    if (signature && sigCanvas.current) {
      sigCanvas.current.fromDataURL(signature);
      setIsEmpty(false);
    }
  }, [signature]);

  const handleEnd = () => {
    if (sigCanvas.current) {
      const dataUrl = sigCanvas.current.toDataURL('image/png');
      onSignatureChange(dataUrl);
      setIsEmpty(sigCanvas.current.isEmpty());
    }
  };

  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      onSignatureChange('');
      setIsEmpty(true);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white overflow-hidden hover:border-[#AD6269] transition-colors">
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              className: 'w-full h-48 cursor-crosshair',
              style: { width: '100%', height: '192px' }
            }}
            backgroundColor="white"
            penColor="#333"
            onEnd={handleEnd}
          />
          
          {/* Signature line */}
          <div className="absolute bottom-12 left-8 right-8 border-b border-gray-300"></div>
          
          {/* Placeholder text */}
          {isEmpty && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-gray-400 text-sm">Sign here with your mouse or finger</p>
            </div>
          )}
        </div>
        
        {/* Clear button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <i className="fas fa-eraser mr-1"></i>
          Clear
        </Button>
      </div>
      
      <p className="text-xs text-gray-500">
        By signing above, you acknowledge that you have read and agree to the terms and conditions.
      </p>
    </div>
  );
}
