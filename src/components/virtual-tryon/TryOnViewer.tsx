'use client';

import { useState, useRef, useEffect } from 'react';

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

interface TryOnViewerProps {
  uploadedPhoto: string | null;
  appliedOverlay: string | null;
  selectedStyle: EyebrowStyle | null;
  styleComparisons: Array<{
    styleId: string;
    imageUrl: string;
    timestamp: string;
  }>;
  currentStep: 'upload' | 'styles' | 'customize' | 'compare' | 'book';
  isLoading: boolean;
}

export function TryOnViewer({ 
  uploadedPhoto, 
  appliedOverlay, 
  selectedStyle, 
  styleComparisons, 
  currentStep,
  isLoading 
}: TryOnViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedComparisonIndex, setSelectedComparisonIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (uploadedPhoto && appliedOverlay) {
      drawOverlay();
    }
  }, [uploadedPhoto, appliedOverlay, zoom, pan]);

  const drawOverlay = () => {
    const canvas = canvasRef.current;
    if (!canvas || !uploadedPhoto || !appliedOverlay) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // In a real implementation, this would draw the actual overlay
    // For now, we'll simulate the overlay effect
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = selectedStyle?.colorPalette[0] || '#8B4513';
    
    // Simulate eyebrow overlay areas
    ctx.fillRect(150, 140, 100, 20); // Left eyebrow area
    ctx.fillRect(350, 140, 100, 20); // Right eyebrow area
    
    ctx.globalAlpha = 1.0;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePosition.x;
    const deltaY = e.clientY - lastMousePosition.y;

    setPan(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));

    setLastMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode);
    setSelectedComparisonIndex(0);
  };

  if (!uploadedPhoto) {
    return (
      <div className="viewer-placeholder">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body d-flex align-items-center justify-content-center">
            <div className="text-center">
              <i className="fas fa-camera text-muted mb-3" style={{ fontSize: '4rem' }}></i>
              <h4 className="h5 fw-bold text-dark mb-2">Upload Your Photo</h4>
              <p className="text-secondary mb-0">
                Upload a clear front-facing photo to start your virtual try-on experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="try-on-viewer">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-header bg-light border-0">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="h5 fw-bold text-dark mb-0">
              <i className="fas fa-eye me-2"></i>
              Virtual Try-On
            </h4>
            
            <div className="d-flex gap-2">
              {/* Zoom Controls */}
              <div className="btn-group btn-group-sm" role="group">
                <button 
                  className="btn btn-outline-secondary"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                >
                  <i className="fas fa-search-minus"></i>
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={handleResetView}
                  title="Reset View"
                >
                  <i className="fas fa-expand-arrows-alt"></i>
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={handleZoomIn}
                  title="Zoom In"
                >
                  <i className="fas fa-search-plus"></i>
                </button>
              </div>

              {/* Comparison Toggle */}
              {styleComparisons.length > 1 && (
                <button 
                  className={`btn btn-sm ${comparisonMode ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={toggleComparisonMode}
                  title="Toggle Comparison Mode"
                >
                  <i className="fas fa-columns me-2"></i>
                  Compare
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="viewer-container position-relative" style={{ height: '600px' }}>
            {/* Main Image Display */}
            <div 
              className="image-display position-relative w-100 h-100 overflow-hidden"
              style={{ 
                cursor: isDragging ? 'grabbing' : 'grab',
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img 
                src={uploadedPhoto} 
                alt="Uploaded photo" 
                className="w-100 h-100 object-fit-contain"
                style={{ 
                  filter: appliedOverlay ? 'brightness(0.9)' : 'none',
                  transition: 'filter 0.3s ease'
                }}
              />
              
              {/* Overlay Canvas */}
              {appliedOverlay && (
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="position-absolute top-0 start-0 w-100 h-100"
                  style={{ 
                    pointerEvents: 'none',
                    mixBlendMode: 'multiply'
                  }}
                />
              )}

              {/* Loading Overlay */}
              {isLoading && (
                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                     style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                  <div className="bg-white rounded p-3 text-center">
                    <div className="spinner-border text-primary mb-2" role="status">
                      <span className="visually-hidden">Processing...</span>
                    </div>
                    <p className="text-secondary mb-0 small">Applying style...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Comparison Mode */}
            {comparisonMode && styleComparisons.length > 1 && (
              <div className="comparison-viewer position-absolute bottom-0 start-0 w-100 bg-white border-top">
                <div className="p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="h6 fw-bold text-dark mb-0">Style Comparison</h6>
                    <div className="d-flex gap-1">
                      {styleComparisons.map((_, index) => (
                        <button
                          key={index}
                          className={`btn btn-sm ${selectedComparisonIndex === index ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => setSelectedComparisonIndex(index)}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="comparison-images d-flex gap-2 overflow-auto">
                    {styleComparisons.map((comparison, index) => (
                      <div 
                        key={index}
                        className={`comparison-image flex-shrink-0 ${selectedComparisonIndex === index ? 'border-primary' : 'border-secondary'}`}
                        style={{ 
                          width: '100px', 
                          height: '75px',
                          border: '2px solid',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedComparisonIndex(index)}
                      >
                        <img 
                          src={comparison.imageUrl} 
                          alt={`Style ${index + 1}`}
                          className="w-100 h-100 object-fit-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Style Information Panel */}
        {selectedStyle && (
          <div className="card-footer bg-light border-0">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h5 className="h6 fw-bold text-dark mb-1">{selectedStyle.styleName}</h5>
                <p className="text-secondary small mb-0">{selectedStyle.description}</p>
              </div>
              <div className="col-md-4 text-md-end">
                <div className="d-flex gap-2 justify-content-md-end">
                  <span className="badge bg-primary text-white">
                    {selectedStyle.intensity}
                  </span>
                  <span className="badge bg-info text-white">
                    {selectedStyle.archHeight}
                  </span>
                  <span className="badge bg-secondary text-white">
                    {selectedStyle.thickness}
                  </span>
                </div>
                <div className="mt-1">
                  <span className="small fw-bold text-primary">
                    {selectedStyle.priceRange}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Zoom Indicator */}
        <div className="position-absolute top-0 end-0 m-3">
          <span className="badge bg-dark text-white">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Instructions */}
        <div className="position-absolute bottom-0 end-0 m-3">
          <div className="bg-dark text-white p-2 rounded small opacity-75">
            <i className="fas fa-info-circle me-1"></i>
            Click and drag to pan • Scroll to zoom
          </div>
        </div>
      </div>
    </div>
  );
}
