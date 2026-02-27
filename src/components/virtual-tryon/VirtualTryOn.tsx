'use client';

import { useState, useCallback } from 'react';
import { PhotoUpload } from './PhotoUpload';
import { StyleSelector } from './StyleSelector';
import { TryOnViewer } from './TryOnViewer';
import { CustomizationPanel } from './CustomizationPanel';
import { BookingIntegration } from './BookingIntegration';
import { toast } from 'sonner';

interface EyebrowStyle {
  styleId: string;
  styleName: string;
  category: 'microblading' | 'ombré' | 'combo' | 'powder';
  description: string;
  colorPalette: string[];
  strokePattern: string;
  intensity: 'light' | 'medium' | 'bold';
  archHeight: 'natural' | 'high' | 'dramatic';
  thickness: 'thin' | 'medium' | 'thick';
  priceRange: string;
  duration: string;
  healingTime: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  gallery: string[];
}

interface TryOnState {
  uploadedPhoto: string | null;
  detectedFace: any | null;
  selectedStyle: EyebrowStyle | null;
  appliedOverlay: string | null;
  styleComparisons: Array<{
    styleId: string;
    imageUrl: string;
    timestamp: string;
  }>;
  clientPreferences: Record<string, any>;
  sessionId: string | null;
  bookingIntent: boolean;
}

export function VirtualTryOn() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'styles' | 'customize' | 'compare' | 'book'>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [tryOnState, setTryOnState] = useState<TryOnState>({
    uploadedPhoto: null,
    detectedFace: null,
    selectedStyle: null,
    appliedOverlay: null,
    styleComparisons: [],
    clientPreferences: {},
    sessionId: null,
    bookingIntent: false
  });

  const handlePhotoUpload = useCallback(async (file: File, clientId?: string) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      if (clientId) formData.append('clientId', clientId);

      const response = await fetch('/api/tryon/upload-photo', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }

      const result = await response.json();
      
      setTryOnState(prev => ({
        ...prev,
        uploadedPhoto: result.imageUrl,
        detectedFace: result.faceDetection,
        sessionId: result.sessionId
      }));

      toast.success('Photo uploaded successfully!');
      setCurrentStep('styles');
      
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStyleSelection = useCallback(async (style: EyebrowStyle) => {
    if (!tryOnState.uploadedPhoto) {
      toast.error('Please upload a photo first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/tryon/apply-style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          imageUrl: tryOnState.uploadedPhoto,
          styleConfig: {
            styleId: style.styleId,
            intensity: style.intensity,
            archHeight: style.archHeight,
            thickness: style.thickness,
            colorMatch: style.colorPalette[0]
          },
          clientId: tryOnState.sessionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to apply style');
      }

      const result = await response.json();
      
      setTryOnState(prev => ({
        ...prev,
        selectedStyle: style,
        appliedOverlay: result.processedImage,
        styleComparisons: [
          ...prev.styleComparisons,
          {
            styleId: style.styleId,
            imageUrl: result.processedImage,
            timestamp: new Date().toISOString()
          }
        ]
      }));

      toast.success(`${style.styleName} applied successfully!`);
      setCurrentStep('customize');
      
    } catch (error) {
      console.error('Style application error:', error);
      toast.error('Failed to apply style. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [tryOnState.uploadedPhoto, tryOnState.sessionId]);

  const handleStyleComparison = useCallback((comparisonStyles: EyebrowStyle[]) => {
    if (!tryOnState.uploadedPhoto) {
      toast.error('Please upload a photo first');
      return;
    }

    setCurrentStep('compare');
    // In a real implementation, this would apply multiple styles for comparison
    toast.info(`Comparing ${comparisonStyles.length} styles`);
  }, [tryOnState.uploadedPhoto]);

  const handleBookingIntent = useCallback(() => {
    setTryOnState(prev => ({
      ...prev,
      bookingIntent: true
    }));
    setCurrentStep('book');
  }, []);

  const handleSaveSession = useCallback(async () => {
    if (!tryOnState.uploadedPhoto) {
      toast.error('No session to save');
      return;
    }

    try {
      const response = await fetch('/api/tryon/save-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: tryOnState.sessionId,
          uploadedPhoto: tryOnState.uploadedPhoto,
          tryOnHistory: tryOnState.styleComparisons,
          selectedStyle: tryOnState.selectedStyle?.styleId,
          bookingIntent: tryOnState.bookingIntent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save session');
      }

      const result = await response.json();
      toast.success('Session saved successfully!');
      
    } catch (error) {
      console.error('Session save error:', error);
      toast.error('Failed to save session');
    }
  }, [tryOnState]);

  const resetTryOn = useCallback(() => {
    setTryOnState({
      uploadedPhoto: null,
      detectedFace: null,
      selectedStyle: null,
      appliedOverlay: null,
      styleComparisons: [],
      clientPreferences: {},
      sessionId: null,
      bookingIntent: false
    });
    setCurrentStep('upload');
  }, []);

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="display-4 fw-bold text-dark mb-3">
              Virtual <span className="text-primary">Try-On</span>
            </h1>
            <p className="fs-5 text-secondary mb-4">
              Upload your photo and try on different permanent makeup eyebrow styles to find your perfect look.
            </p>
            
            {/* Progress Steps */}
            <div className="d-flex justify-content-center mb-4">
              <div className="d-flex align-items-center">
                <div className={`step-indicator ${currentStep === 'upload' ? 'active' : tryOnState.uploadedPhoto ? 'completed' : ''}`}>
                  <i className="fas fa-camera"></i>
                </div>
                <div className="step-line"></div>
                <div className={`step-indicator ${currentStep === 'styles' ? 'active' : tryOnState.selectedStyle ? 'completed' : ''}`}>
                  <i className="fas fa-palette"></i>
                </div>
                <div className="step-line"></div>
                <div className={`step-indicator ${currentStep === 'customize' ? 'active' : ''}`}>
                  <i className="fas fa-sliders-h"></i>
                </div>
                <div className="step-line"></div>
                <div className={`step-indicator ${currentStep === 'compare' ? 'active' : ''}`}>
                  <i className="fas fa-columns"></i>
                </div>
                <div className="step-line"></div>
                <div className={`step-indicator ${currentStep === 'book' ? 'active' : ''}`}>
                  <i className="fas fa-calendar-check"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="row">
            {/* Left Panel - Controls */}
            <div className="col-lg-4 mb-4">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  
                  {currentStep === 'upload' && (
                    <PhotoUpload 
                      onPhotoUpload={handlePhotoUpload}
                      isLoading={isLoading}
                    />
                  )}

                  {currentStep === 'styles' && (
                    <StyleSelector 
                      onStyleSelect={handleStyleSelection}
                      onCompareStyles={handleStyleComparison}
                      isLoading={isLoading}
                    />
                  )}

                  {currentStep === 'customize' && (
                    <CustomizationPanel 
                      selectedStyle={tryOnState.selectedStyle}
                      onStyleUpdate={handleStyleSelection}
                      onBackToStyles={() => setCurrentStep('styles')}
                      onCompare={() => setCurrentStep('compare')}
                      isLoading={isLoading}
                    />
                  )}

                  {currentStep === 'compare' && (
                    <div className="text-center">
                      <h3 className="h5 fw-bold text-dark mb-3">Style Comparison</h3>
                      <p className="text-secondary mb-4">
                        Compare different styles side by side to find your perfect look.
                      </p>
                      <div className="d-flex gap-2 justify-content-center">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => setCurrentStep('styles')}
                        >
                          <i className="fas fa-arrow-left me-2"></i>
                          Back to Styles
                        </button>
                        <button 
                          className="btn btn-primary"
                          onClick={handleBookingIntent}
                        >
                          <i className="fas fa-calendar-check me-2"></i>
                          Book Consultation
                        </button>
                      </div>
                    </div>
                  )}

                  {currentStep === 'book' && (
                    <BookingIntegration 
                      selectedStyle={tryOnState.selectedStyle}
                      tryOnHistory={tryOnState.styleComparisons}
                      onSaveSession={handleSaveSession}
                      onResetTryOn={resetTryOn}
                    />
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-top">
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-outline-secondary btn-sm flex-fill"
                        onClick={resetTryOn}
                      >
                        <i className="fas fa-redo me-2"></i>
                        Start Over
                      </button>
                      <button 
                        className="btn btn-outline-info btn-sm flex-fill"
                        onClick={handleSaveSession}
                        disabled={!tryOnState.uploadedPhoto}
                      >
                        <i className="fas fa-save me-2"></i>
                        Save Session
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Right Panel - Viewer */}
            <div className="col-lg-8">
              <TryOnViewer 
                uploadedPhoto={tryOnState.uploadedPhoto}
                appliedOverlay={tryOnState.appliedOverlay}
                selectedStyle={tryOnState.selectedStyle}
                styleComparisons={tryOnState.styleComparisons}
                currentStep={currentStep}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
             style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
          <div className="bg-white rounded p-4 text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Processing...</span>
            </div>
            <p className="text-secondary mb-0">Processing your photo...</p>
          </div>
        </div>
      )}
    </div>
  );
}
