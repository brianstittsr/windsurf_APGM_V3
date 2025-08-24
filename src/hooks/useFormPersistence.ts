import { useEffect, useCallback } from 'react';

interface FormPersistenceOptions {
  key: string;
  data: any;
  enabled?: boolean;
}

export function useFormPersistence({ key, data, enabled = true }: FormPersistenceOptions) {
  // Save data to localStorage
  const saveData = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return;
    
    try {
      const serializedData = JSON.stringify({
        data,
        timestamp: Date.now(),
        version: '1.0'
      });
      localStorage.setItem(`booking_form_${key}`, serializedData);
    } catch (error) {
      console.warn('Failed to save form data to localStorage:', error);
    }
  }, [key, data, enabled]);

  // Load data from localStorage
  const loadData = useCallback(() => {
    if (!enabled || typeof window === 'undefined') return null;
    
    try {
      const serializedData = localStorage.getItem(`booking_form_${key}`);
      if (!serializedData) return null;
      
      const parsedData = JSON.parse(serializedData);
      
      // Check if data is less than 24 hours old
      const isRecent = Date.now() - parsedData.timestamp < 24 * 60 * 60 * 1000;
      if (!isRecent) {
        clearData();
        return null;
      }
      
      return parsedData.data;
    } catch (error) {
      console.warn('Failed to load form data from localStorage:', error);
      return null;
    }
  }, [key, enabled]);

  // Clear data from localStorage
  const clearData = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(`booking_form_${key}`);
    } catch (error) {
      console.warn('Failed to clear form data from localStorage:', error);
    }
  }, [key]);

  // Auto-save data when it changes
  useEffect(() => {
    if (enabled && data) {
      // Check if data has meaningful content before saving
      const hasContent = data.selectedService || 
                        data.selectedDate || 
                        data.clientProfile?.firstName ||
                        Object.keys(data.healthFormData || {}).length > 0;
      
      if (hasContent) {
        const timeoutId = setTimeout(saveData, 500); // Debounce saves
        return () => clearTimeout(timeoutId);
      }
    }
  }, [data, enabled, saveData]);

  return {
    loadData,
    saveData,
    clearData
  };
}
