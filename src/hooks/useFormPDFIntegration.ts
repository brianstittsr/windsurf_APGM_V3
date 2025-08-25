import { useState } from 'react';

export interface FormPDFIntegrationOptions {
  clientId: string;
  appointmentId?: string;
  autoGeneratePDF?: boolean;
}

export interface PDFGenerationResult {
  success: boolean;
  pdfUrl?: string;
  pdfId?: string;
  error?: string;
}

export const useFormPDFIntegration = (options: FormPDFIntegrationOptions) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const generateHealthFormPDF = async (healthFormData: any): Promise<PDFGenerationResult> => {
    if (!options.autoGeneratePDF) {
      return { success: true };
    }

    try {
      setIsGenerating(true);
      setLastError(null);

      const response = await fetch('/api/send-health-form-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          healthFormEmailData: healthFormData,
          clientId: options.clientId,
          appointmentId: options.appointmentId,
          generatePDF: true
        }),
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          pdfUrl: data.pdfUrl,
          pdfId: data.pdfId
        };
      } else {
        const error = data.message || 'Failed to generate health form PDF';
        setLastError(error);
        return { success: false, error };
      }
    } catch (err) {
      const error = 'Error generating health form PDF';
      setLastError(error);
      console.error('Health form PDF error:', err);
      return { success: false, error };
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePaymentPDF = async (paymentData: {
    clientName: string;
    clientEmail: string;
    amount: number;
    paymentMethod: string;
    transactionId: string;
    appointmentDate?: string;
    serviceName?: string;
  }): Promise<PDFGenerationResult> => {
    if (!options.autoGeneratePDF) {
      return { success: true };
    }

    try {
      setIsGenerating(true);
      setLastError(null);

      const response = await fetch('/api/generate-payment-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentData,
          clientId: options.clientId,
          appointmentId: options.appointmentId
        }),
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          pdfUrl: data.pdfUrl,
          pdfId: data.pdfId
        };
      } else {
        const error = data.message || 'Failed to generate payment PDF';
        setLastError(error);
        return { success: false, error };
      }
    } catch (err) {
      const error = 'Error generating payment PDF';
      setLastError(error);
      console.error('Payment PDF error:', err);
      return { success: false, error };
    } finally {
      setIsGenerating(false);
    }
  };

  const generateConsentPDF = async (consentData: {
    clientName: string;
    clientEmail: string;
    serviceName: string;
    consentItems: string[];
    signature: string;
    signatureDate: string;
  }): Promise<PDFGenerationResult> => {
    if (!options.autoGeneratePDF) {
      return { success: true };
    }

    try {
      setIsGenerating(true);
      setLastError(null);

      const response = await fetch('/api/generate-consent-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consentData,
          clientId: options.clientId,
          appointmentId: options.appointmentId
        }),
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          pdfUrl: data.pdfUrl,
          pdfId: data.pdfId
        };
      } else {
        const error = data.message || 'Failed to generate consent PDF';
        setLastError(error);
        return { success: false, error };
      }
    } catch (err) {
      const error = 'Error generating consent PDF';
      setLastError(error);
      console.error('Consent PDF error:', err);
      return { success: false, error };
    } finally {
      setIsGenerating(false);
    }
  };

  const clearError = () => setLastError(null);

  return {
    isGenerating,
    lastError,
    generateHealthFormPDF,
    generatePaymentPDF,
    generateConsentPDF,
    clearError
  };
};
