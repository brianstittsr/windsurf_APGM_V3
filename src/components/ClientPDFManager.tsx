import React, { useState, useEffect } from 'react';
import { PDFDocument } from '@/services/database';
import { ActivityService } from '@/services/activityService';

interface ClientPDFManagerProps {
  clientId: string;
  appointmentId?: string;
  className?: string;
}

export const ClientPDFManager: React.FC<ClientPDFManagerProps> = ({
  clientId,
  appointmentId,
  className = ''
}) => {
  const [pdfs, setPdfs] = useState<PDFDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPDFs();
  }, [clientId, appointmentId]);

  const loadPDFs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (appointmentId) {
        params.append('appointmentId', appointmentId);
      } else {
        params.append('clientId', clientId);
      }

      const response = await fetch(`/api/get-client-pdfs?${params}`);
      const data = await response.json();

      if (data.success) {
        setPdfs(data.pdfs);
      } else {
        setError('Failed to load PDFs');
      }
    } catch (err) {
      setError('Error loading PDFs');
      console.error('PDF loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFormTypeIcon = (formType: string) => {
    switch (formType) {
      case 'health':
        return 'fas fa-heartbeat';
      case 'consent':
        return 'fas fa-file-signature';
      case 'booking':
        return 'fas fa-calendar-check';
      default:
        return 'fas fa-file-pdf';
    }
  };

  const getFormTypeColor = (formType: string) => {
    switch (formType) {
      case 'health':
        return 'text-danger';
      case 'consent':
        return 'text-warning';
      case 'booking':
        return 'text-success';
      default:
        return 'text-primary';
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    // Handle Firestore Timestamp
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString();
    }
    
    // Handle regular Date or string
    return new Date(timestamp).toLocaleDateString();
  };

  const handleDownload = async (pdf: PDFDocument) => {
    window.open(pdf.downloadURL, '_blank');
    
    // Log document download activity
    try {
      await ActivityService.logDocumentActivity(
        clientId,
        'download',
        pdf.formType,
        pdf.id,
        pdf.appointmentId
      );
    } catch (activityError) {
      console.error('Failed to log document download activity:', activityError);
    }
  };

  if (loading) {
    return (
      <div className={`pdf-manager ${className}`}>
        <div className="d-flex justify-content-center align-items-center p-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading PDFs...</span>
          </div>
          <span className="ms-2">Loading documents...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`pdf-manager ${className}`}>
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button 
            className="btn btn-sm btn-outline-danger ms-2"
            onClick={loadPDFs}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`pdf-manager ${className}`}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">
          <i className="fas fa-file-pdf me-2"></i>
          Document Library
        </h5>
        <button 
          className="btn btn-sm btn-outline-primary"
          onClick={loadPDFs}
        >
          <i className="fas fa-sync-alt me-1"></i>
          Refresh
        </button>
      </div>

      {pdfs.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <i className="fas fa-folder-open fa-3x mb-3"></i>
          <p>No documents found</p>
          <small>Documents will appear here after forms are submitted</small>
        </div>
      ) : (
        <div className="row">
          {pdfs.map((pdf) => (
            <div key={pdf.id} className="col-md-6 col-lg-4 mb-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex align-items-start justify-content-between mb-2">
                    <i className={`${getFormTypeIcon(pdf.formType)} ${getFormTypeColor(pdf.formType)} fa-2x`}></i>
                    <small className="text-muted">
                      {formatDate(pdf.generatedAt)}
                    </small>
                  </div>
                  
                  <h6 className="card-title text-capitalize">
                    {pdf.formType} Form
                  </h6>
                  
                  <p className="card-text small text-muted mb-2">
                    {pdf.filename}
                  </p>
                  
                  {pdf.fileSize && (
                    <small className="text-muted d-block mb-2">
                      Size: {(pdf.fileSize / 1024).toFixed(1)} KB
                    </small>
                  )}
                </div>
                
                <div className="card-footer bg-transparent">
                  <button
                    className="btn btn-primary btn-sm w-100"
                    onClick={() => handleDownload(pdf)}
                  >
                    <i className="fas fa-download me-1"></i>
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pdfs.length > 0 && (
        <div className="mt-3 p-3 bg-light rounded">
          <small className="text-muted">
            <i className="fas fa-info-circle me-1"></i>
            Total: {pdfs.length} document{pdfs.length !== 1 ? 's' : ''} • 
            All documents are securely stored and accessible only to you
          </small>
        </div>
      )}
    </div>
  );
};

interface PDFGenerationButtonProps {
  formType: 'health' | 'consent' | 'booking';
  formData: any;
  clientId: string;
  appointmentId?: string;
  onPDFGenerated?: (pdfUrl: string, pdfId: string) => void;
  className?: string;
  buttonText?: string;
}

export const PDFGenerationButton: React.FC<PDFGenerationButtonProps> = ({
  formType,
  formData,
  clientId,
  appointmentId,
  onPDFGenerated,
  className = '',
  buttonText
}) => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePDF = async () => {
    try {
      setGenerating(true);
      setError(null);

      let endpoint = '';
      let payload = {};

      switch (formType) {
        case 'health':
          endpoint = '/api/send-health-form-email';
          payload = {
            healthFormEmailData: formData,
            clientId,
            appointmentId,
            generatePDF: true
          };
          break;
        case 'consent':
          endpoint = '/api/generate-consent-pdf';
          payload = {
            consentData: formData,
            clientId,
            appointmentId
          };
          break;
        case 'booking':
          endpoint = '/api/generate-payment-pdf';
          payload = {
            paymentData: formData,
            clientId,
            appointmentId
          };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success && data.pdfUrl) {
        if (onPDFGenerated) {
          onPDFGenerated(data.pdfUrl, data.pdfId);
        }
      } else {
        setError(data.message || 'Failed to generate PDF');
      }
    } catch (err) {
      setError('Error generating PDF');
      console.error('PDF generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={generatePDF}
        disabled={generating}
        className="btn btn-outline-primary d-flex align-items-center gap-2"
      >
        {generating ? (
          <>
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            Generating PDF...
          </>
        ) : (
          <>
            <i className="fas fa-file-pdf"></i>
            {buttonText || `Generate ${formType} PDF`}
          </>
        )}
      </button>
      
      {error && (
        <div className="alert alert-danger mt-2">
          <small>{error}</small>
        </div>
      )}
    </div>
  );
};
