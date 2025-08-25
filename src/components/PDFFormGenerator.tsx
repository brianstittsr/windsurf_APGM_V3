import React from 'react';
import { usePDFGeneration } from '../hooks/usePDFGeneration';
import { FormData } from '../services/pdfService';

interface PDFFormGeneratorProps {
  formData: FormData;
  clientId: string;
  appointmentId: string;
  onPDFGenerated?: (downloadURL: string) => void;
  className?: string;
}

export const PDFFormGenerator: React.FC<PDFFormGeneratorProps> = ({
  formData,
  clientId,
  appointmentId,
  onPDFGenerated,
  className = ''
}) => {
  const { isGenerating, error, generateAndStorePDF, clearError } = usePDFGeneration();

  const handleGeneratePDF = async () => {
    const downloadURL = await generateAndStorePDF(formData, clientId, appointmentId);
    if (downloadURL && onPDFGenerated) {
      onPDFGenerated(downloadURL);
    }
  };

  return (
    <div className={`pdf-generator ${className}`}>
      <button
        onClick={handleGeneratePDF}
        disabled={isGenerating}
        className="btn btn-outline-primary d-flex align-items-center gap-2"
      >
        {isGenerating ? (
          <>
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            Generating PDF...
          </>
        ) : (
          <>
            <i className="fas fa-file-pdf"></i>
            Generate Form PDF
          </>
        )}
      </button>
      
      {error && (
        <div className="alert alert-danger mt-2 d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <button 
            type="button" 
            className="btn-close" 
            onClick={clearError}
            aria-label="Close"
          ></button>
        </div>
      )}
    </div>
  );
};

interface PDFElementCaptureProps {
  elementId: string;
  clientId: string;
  appointmentId: string;
  formType: 'booking' | 'health' | 'consent';
  buttonText?: string;
  onPDFGenerated?: (downloadURL: string) => void;
  className?: string;
}

export const PDFElementCapture: React.FC<PDFElementCaptureProps> = ({
  elementId,
  clientId,
  appointmentId,
  formType,
  buttonText = 'Save as PDF',
  onPDFGenerated,
  className = ''
}) => {
  const { isGenerating, error, generateFromElement, clearError } = usePDFGeneration();

  const handleCapturePDF = async () => {
    const downloadURL = await generateFromElement(elementId, clientId, appointmentId, formType);
    if (downloadURL && onPDFGenerated) {
      onPDFGenerated(downloadURL);
    }
  };

  return (
    <div className={`pdf-element-capture ${className}`}>
      <button
        onClick={handleCapturePDF}
        disabled={isGenerating}
        className="btn btn-success d-flex align-items-center gap-2"
      >
        {isGenerating ? (
          <>
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            Saving PDF...
          </>
        ) : (
          <>
            <i className="fas fa-download"></i>
            {buttonText}
          </>
        )}
      </button>
      
      {error && (
        <div className="alert alert-danger mt-2 d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <button 
            type="button" 
            className="btn-close" 
            onClick={clearError}
            aria-label="Close"
          ></button>
        </div>
      )}
    </div>
  );
};
