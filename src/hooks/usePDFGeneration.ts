import { useState } from 'react';
import { ClientOnlyPDFService, FormData } from '../components/ClientOnlyPDFService';

export interface UsePDFGenerationReturn {
  isGenerating: boolean;
  error: string | null;
  generateAndStorePDF: (
    formData: FormData,
    clientId: string,
    appointmentId: string
  ) => Promise<string | null>;
  generateFromElement: (
    elementId: string,
    clientId: string,
    appointmentId: string,
    formType: 'booking' | 'health' | 'consent'
  ) => Promise<string | null>;
  clearError: () => void;
}

export const usePDFGeneration = (): UsePDFGenerationReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const generateAndStorePDF = async (
    formData: FormData,
    clientId: string,
    appointmentId: string
  ): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const downloadURL = await ClientOnlyPDFService.generateAndStorePDF(
        formData,
        clientId,
        appointmentId
      );
      return downloadURL;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF';
      setError(errorMessage);
      console.error('PDF generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFromElement = async (
    elementId: string,
    clientId: string,
    appointmentId: string,
    formType: 'booking' | 'health' | 'consent'
  ): Promise<string | null> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const downloadURL = await ClientOnlyPDFService.generateFormElementPDF(
        elementId,
        clientId,
        appointmentId,
        formType
      );
      return downloadURL;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate PDF';
      setError(errorMessage);
      console.error('PDF generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    error,
    generateAndStorePDF,
    generateFromElement,
    clearError
  };
};
