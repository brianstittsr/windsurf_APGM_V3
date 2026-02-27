'use client';

import { useState } from 'react';
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

interface CustomizationPanelProps {
  selectedStyle: EyebrowStyle | null;
  onStyleUpdate: (style: EyebrowStyle) => Promise<void>;
  onBackToStyles: () => void;
  onCompare: () => void;
  isLoading: boolean;
}

interface StyleCustomizations {
  intensity: 'light' | 'medium' | 'bold';
  archHeight: 'natural' | 'high' | 'dramatic';
  thickness: 'thin' | 'medium' | 'thick';
  colorMatch: string;
  opacity: number;
}

export function CustomizationPanel({ 
  selectedStyle, 
  onStyleUpdate, 
  onBackToStyles, 
  onCompare, 
  isLoading 
}: CustomizationPanelProps) {
  const [customizations, setCustomizations] = useState<StyleCustomizations>({
    intensity: selectedStyle?.intensity || 'medium',
    archHeight: selectedStyle?.archHeight || 'natural',
    thickness: selectedStyle?.thickness || 'medium',
    colorMatch: selectedStyle?.colorPalette[0] || '#8B4513',
    opacity: 0.8
  });

  const handleCustomizationChange = (key: keyof StyleCustomizations, value: any) => {
    setCustomizations(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyCustomizations = async () => {
    if (!selectedStyle) return;

    const updatedStyle = {
      ...selectedStyle,
      intensity: customizations.intensity,
      archHeight: customizations.archHeight,
      thickness: customizations.thickness,
      colorPalette: [customizations.colorMatch, ...selectedStyle.colorPalette.slice(1)]
    };

    try {
      await onStyleUpdate(updatedStyle);
      toast.success('Customizations applied successfully!');
    } catch (error) {
      console.error('Failed to apply customizations:', error);
      toast.error('Failed to apply customizations');
    }
  };

  const handleResetCustomizations = () => {
    if (!selectedStyle) return;

    setCustomizations({
      intensity: selectedStyle.intensity,
      archHeight: selectedStyle.archHeight,
      thickness: selectedStyle.thickness,
      colorMatch: selectedStyle.colorPalette[0],
      opacity: 0.8
    });
  };

  if (!selectedStyle) {
    return (
      <div className="text-center">
        <i className="fas fa-exclamation-triangle text-warning mb-3" style={{ fontSize: '2rem' }}></i>
        <p className="text-secondary">No style selected for customization.</p>
        <button className="btn btn-primary" onClick={onBackToStyles}>
          <i className="fas fa-arrow-left me-2"></i>
          Back to Styles
        </button>
      </div>
    );
  }

  return (
    <div className="customization-panel">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="h5 fw-bold text-dark mb-0">
          <i className="fas fa-sliders-h me-2"></i>
          Customize Style
        </h3>
        <button 
          className="btn btn-outline-secondary btn-sm"
          onClick={onBackToStyles}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back to Styles
        </button>
      </div>

      {/* Selected Style Info */}
      <div className="selected-style-info mb-4 p-3 bg-light rounded">
        <h4 className="h6 fw-bold text-dark mb-2">{selectedStyle.styleName}</h4>
        <p className="text-secondary small mb-2">{selectedStyle.description}</p>
        <div className="d-flex gap-2">
          <span className="badge bg-primary text-white">
            {selectedStyle.category}
          </span>
          <span className="badge bg-info text-white">
            {selectedStyle.difficulty}
          </span>
        </div>
      </div>

      {/* Customization Controls */}
      <div className="customization-controls">
        {/* Intensity Control */}
        <div className="mb-4">
          <label className="form-label fw-bold text-dark">
            <i className="fas fa-adjust me-2"></i>
            Intensity
          </label>
          <div className="btn-group w-100" role="group">
            {(['light', 'medium', 'bold'] as const).map((intensity) => (
              <button
                key={intensity}
                type="button"
                className={`btn btn-outline-primary ${customizations.intensity === intensity ? 'active' : ''}`}
                onClick={() => handleCustomizationChange('intensity', intensity)}
              >
                {intensity.charAt(0).toUpperCase() + intensity.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Arch Height Control */}
        <div className="mb-4">
          <label className="form-label fw-bold text-dark">
            <i className="fas fa-mountain me-2"></i>
            Arch Height
          </label>
          <div className="btn-group w-100" role="group">
            {(['natural', 'high', 'dramatic'] as const).map((archHeight) => (
              <button
                key={archHeight}
                type="button"
                className={`btn btn-outline-primary ${customizations.archHeight === archHeight ? 'active' : ''}`}
                onClick={() => handleCustomizationChange('archHeight', archHeight)}
              >
                {archHeight.charAt(0).toUpperCase() + archHeight.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Thickness Control */}
        <div className="mb-4">
          <label className="form-label fw-bold text-dark">
            <i className="fas fa-arrows-alt-h me-2"></i>
            Thickness
          </label>
          <div className="btn-group w-100" role="group">
            {(['thin', 'medium', 'thick'] as const).map((thickness) => (
              <button
                key={thickness}
                type="button"
                className={`btn btn-outline-primary ${customizations.thickness === thickness ? 'active' : ''}`}
                onClick={() => handleCustomizationChange('thickness', thickness)}
              >
                {thickness.charAt(0).toUpperCase() + thickness.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Color Match Control */}
        <div className="mb-4">
          <label className="form-label fw-bold text-dark">
            <i className="fas fa-palette me-2"></i>
            Color Match
          </label>
          <div className="color-palette mb-3">
            <div className="row g-2">
              {selectedStyle.colorPalette.map((color, index) => (
                <div key={index} className="col-3">
                  <button
                    className={`color-option w-100 border rounded ${customizations.colorMatch === color ? 'border-primary border-3' : 'border-secondary'}`}
                    style={{ 
                      height: '40px', 
                      backgroundColor: color,
                      cursor: 'pointer'
                    }}
                    onClick={() => handleCustomizationChange('colorMatch', color)}
                    title={color}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Custom Color Input */}
          <div className="input-group">
            <span className="input-group-text">
              <i className="fas fa-eyedropper"></i>
            </span>
            <input
              type="color"
              className="form-control form-control-color"
              value={customizations.colorMatch}
              onChange={(e) => handleCustomizationChange('colorMatch', e.target.value)}
              title="Custom Color"
            />
            <input
              type="text"
              className="form-control"
              value={customizations.colorMatch}
              onChange={(e) => handleCustomizationChange('colorMatch', e.target.value)}
              placeholder="#8B4513"
            />
          </div>
        </div>

        {/* Opacity Control */}
        <div className="mb-4">
          <label className="form-label fw-bold text-dark">
            <i className="fas fa-eye-dropper me-2"></i>
            Opacity: {Math.round(customizations.opacity * 100)}%
          </label>
          <input
            type="range"
            className="form-range"
            min="0.3"
            max="1"
            step="0.1"
            value={customizations.opacity}
            onChange={(e) => handleCustomizationChange('opacity', parseFloat(e.target.value))}
          />
          <div className="d-flex justify-content-between small text-secondary">
            <span>Subtle</span>
            <span>Bold</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="customization-actions">
        <div className="d-grid gap-2">
          <button 
            className="btn btn-primary"
            onClick={handleApplyCustomizations}
            disabled={isLoading}
          >
            <i className="fas fa-check me-2"></i>
            Apply Customizations
          </button>
          
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-secondary flex-fill"
              onClick={handleResetCustomizations}
              disabled={isLoading}
            >
              <i className="fas fa-undo me-2"></i>
              Reset
            </button>
            <button 
              className="btn btn-outline-info flex-fill"
              onClick={onCompare}
              disabled={isLoading}
            >
              <i className="fas fa-columns me-2"></i>
              Compare
            </button>
          </div>
        </div>
      </div>

      {/* Style Preview Info */}
      <div className="style-preview-info mt-4 p-3 bg-primary bg-opacity-10 rounded">
        <h5 className="h6 fw-bold text-dark mb-2">
          <i className="fas fa-info-circle me-2"></i>
          Preview Information
        </h5>
        <div className="row g-2 small">
          <div className="col-6">
            <span className="text-secondary">Duration:</span>
            <br />
            <span className="fw-bold text-dark">{selectedStyle.duration}</span>
          </div>
          <div className="col-6">
            <span className="text-secondary">Healing:</span>
            <br />
            <span className="fw-bold text-dark">{selectedStyle.healingTime}</span>
          </div>
          <div className="col-6">
            <span className="text-secondary">Price Range:</span>
            <br />
            <span className="fw-bold text-primary">{selectedStyle.priceRange}</span>
          </div>
          <div className="col-6">
            <span className="text-secondary">Difficulty:</span>
            <br />
            <span className={`badge bg-${
              selectedStyle.difficulty === 'beginner' ? 'success' :
              selectedStyle.difficulty === 'intermediate' ? 'warning' : 'danger'
            } text-white`}>
              {selectedStyle.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Customization Tips */}
      <div className="customization-tips mt-4 p-3 bg-light rounded">
        <h5 className="h6 fw-bold text-dark mb-2">
          <i className="fas fa-lightbulb me-2"></i>
          Customization Tips
        </h5>
        <ul className="list-unstyled small text-secondary mb-0">
          <li className="mb-1">
            <i className="fas fa-check text-success me-2"></i>
            Light intensity: Natural everyday look
          </li>
          <li className="mb-1">
            <i className="fas fa-check text-success me-2"></i>
            Medium intensity: Balanced definition
          </li>
          <li className="mb-1">
            <i className="fas fa-check text-success me-2"></i>
            Bold intensity: Dramatic, defined look
          </li>
          <li className="mb-1">
            <i className="fas fa-check text-success me-2"></i>
            Adjust opacity to see subtle vs bold effects
          </li>
          <li className="mb-0">
            <i className="fas fa-check text-success me-2"></i>
            Try different colors to match your skin tone
          </li>
        </ul>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center mt-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Applying customizations...</span>
          </div>
          <p className="text-secondary mt-2 mb-0">Applying customizations...</p>
        </div>
      )}
    </div>
  );
}
