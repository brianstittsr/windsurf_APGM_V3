'use client';

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface PhotoUploadProps {
  onPhotoUpload: (file: File, clientId?: string) => Promise<void>;
  isLoading: boolean;
}

export function PhotoUpload({ onPhotoUpload, isLoading }: PhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, or WebP image.');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 10MB.');
      return false;
    }

    return true;
  };

  const handleFile = useCallback(async (file: File) => {
    if (!validateFile(file)) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload photo
    await onPhotoUpload(file);
  }, [onPhotoUpload]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      await handleFile(files[0]);
    }
  }, [handleFile]);

  const handleCameraCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      // In a real implementation, this would open a camera interface
      // For now, we'll simulate camera capture
      toast.info('Camera feature coming soon! Please upload a photo instead.');
      
    } catch (error) {
      console.error('Camera access error:', error);
      toast.error('Camera access denied. Please upload a photo instead.');
    }
  }, []);

  return (
    <div className="photo-upload">
      <h3 className="h5 fw-bold text-dark mb-3">
        <i className="fas fa-camera me-2"></i>
        Upload Your Photo
      </h3>
      
      <p className="text-secondary mb-4">
        For the best virtual try-on experience, upload a clear front-facing photo with good lighting.
      </p>

      {/* Upload Area */}
      <div 
        className={`upload-area border rounded p-4 text-center mb-3 ${dragActive ? 'border-primary bg-light' : 'border-secondary'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{ 
          minHeight: '200px',
          borderStyle: 'dashed',
          borderWidth: '2px',
          borderColor: dragActive ? '#0d6efd' : '#6c757d',
          backgroundColor: dragActive ? 'rgba(13, 110, 253, 0.1)' : 'transparent'
        }}
      >
        {preview ? (
          <div className="preview-container">
            <img 
              src={preview} 
              alt="Preview" 
              className="img-fluid rounded mb-3"
              style={{ maxHeight: '200px', maxWidth: '100%' }}
            />
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setPreview(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              <i className="fas fa-times me-2"></i>
              Remove Photo
            </button>
          </div>
        ) : (
          <div className="upload-content">
            <i className="fas fa-cloud-upload-alt text-primary mb-3" style={{ fontSize: '3rem' }}></i>
            <h4 className="h6 fw-bold text-dark mb-2">
              Drag & drop your photo here
            </h4>
            <p className="text-secondary mb-3">
              or click to browse files
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <button 
                className="btn btn-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <i className="fas fa-folder-open me-2"></i>
                Browse Files
              </button>
              <button 
                className="btn btn-outline-primary"
                onClick={handleCameraCapture}
                disabled={isLoading}
              >
                <i className="fas fa-camera me-2"></i>
                Use Camera
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInput}
          className="d-none"
        />
      </div>

      {/* Photo Guidelines */}
      <div className="photo-guidelines">
        <h5 className="h6 fw-bold text-dark mb-2">
          <i className="fas fa-info-circle me-2"></i>
          Photo Guidelines
        </h5>
        <ul className="list-unstyled text-secondary small mb-0">
          <li className="mb-1">
            <i className="fas fa-check text-success me-2"></i>
            Front-facing photo with face clearly visible
          </li>
          <li className="mb-1">
            <i className="fas fa-check text-success me-2"></i>
            Good lighting (natural light preferred)
          </li>
          <li className="mb-1">
            <i className="fas fa-check text-success me-2"></i>
            No sunglasses or heavy makeup on eyebrows
          </li>
          <li className="mb-1">
            <i className="fas fa-check text-success me-2"></i>
            Face centered and looking straight ahead
          </li>
          <li className="mb-0">
            <i className="fas fa-check text-success me-2"></i>
            Minimum resolution: 800x600 pixels
          </li>
        </ul>
      </div>

      {/* Privacy Notice */}
      <div className="privacy-notice mt-3 p-3 bg-light rounded">
        <h6 className="h6 fw-bold text-dark mb-2">
          <i className="fas fa-shield-alt text-primary me-2"></i>
          Privacy & Security
        </h6>
        <p className="text-secondary small mb-2">
          Your photo is processed securely and is not shared with third parties. 
          Photos are automatically deleted after your session ends.
        </p>
        <div className="form-check">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="privacyConsent"
            required
          />
          <label className="form-check-label small text-secondary" htmlFor="privacyConsent">
            I consent to photo processing for virtual try-on experience
          </label>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center mt-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Uploading...</span>
          </div>
          <p className="text-secondary mt-2 mb-0">Uploading photo...</p>
        </div>
      )}
    </div>
  );
}
