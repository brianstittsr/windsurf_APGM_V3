'use client';

import { useState, useEffect } from 'react';
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

interface StyleSelectorProps {
  onStyleSelect: (style: EyebrowStyle) => Promise<void>;
  onCompareStyles: (styles: EyebrowStyle[]) => void;
  isLoading: boolean;
}

export function StyleSelector({ onStyleSelect, onCompareStyles, isLoading }: StyleSelectorProps) {
  const [styles, setStyles] = useState<EyebrowStyle[]>([]);
  const [filteredStyles, setFilteredStyles] = useState<EyebrowStyle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIntensity, setSelectedIntensity] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [isLoadingStyles, setIsLoadingStyles] = useState(true);

  useEffect(() => {
    fetchStyles();
  }, []);

  useEffect(() => {
    filterStyles();
  }, [styles, selectedCategory, selectedIntensity, selectedDifficulty]);

  const fetchStyles = async () => {
    try {
      const response = await fetch('/api/tryon/styles');
      if (!response.ok) {
        throw new Error('Failed to fetch styles');
      }
      const result = await response.json();
      setStyles(result.styles || []);
    } catch (error) {
      console.error('Failed to fetch styles:', error);
      toast.error('Failed to load eyebrow styles');
    } finally {
      setIsLoadingStyles(false);
    }
  };

  const filterStyles = () => {
    let filtered = [...styles];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(style => style.category === selectedCategory);
    }

    if (selectedIntensity !== 'all') {
      filtered = filtered.filter(style => style.intensity === selectedIntensity);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(style => style.difficulty === selectedDifficulty);
    }

    setFilteredStyles(filtered);
  };

  const handleStyleSelect = async (style: EyebrowStyle) => {
    if (comparisonMode) {
      if (selectedForComparison.includes(style.styleId)) {
        setSelectedForComparison(prev => prev.filter(id => id !== style.styleId));
      } else if (selectedForComparison.length < 3) {
        setSelectedForComparison(prev => [...prev, style.styleId]);
      } else {
        toast.error('You can compare up to 3 styles at once');
      }
      return;
    }

    await onStyleSelect(style);
  };

  const handleCompareStyles = () => {
    const comparisonStyles = styles.filter(style => 
      selectedForComparison.includes(style.styleId)
    );
    
    if (comparisonStyles.length < 2) {
      toast.error('Please select at least 2 styles to compare');
      return;
    }

    setComparisonMode(false);
    setSelectedForComparison([]);
    onCompareStyles(comparisonStyles);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'microblading': return 'fas fa-feather';
      case 'ombré': return 'fas fa-palette';
      case 'combo': return 'fas fa-magic';
      case 'powder': return 'fas fa-fill-drip';
      default: return 'fas fa-palette';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'secondary';
    }
  };

  if (isLoadingStyles) {
    return (
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading styles...</span>
        </div>
        <p className="text-secondary">Loading eyebrow styles...</p>
      </div>
    );
  }

  return (
    <div className="style-selector">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="h5 fw-bold text-dark mb-0">
          <i className="fas fa-palette me-2"></i>
          Choose Your Style
        </h3>
        <div className="form-check form-switch">
          <input 
            className="form-check-input" 
            type="checkbox" 
            id="comparisonMode"
            checked={comparisonMode}
            onChange={(e) => {
              setComparisonMode(e.target.checked);
              setSelectedForComparison([]);
            }}
          />
          <label className="form-check-label small text-secondary" htmlFor="comparisonMode">
            Compare Mode
          </label>
        </div>
      </div>

      {/* Filters */}
      <div className="filters mb-4">
        <div className="row g-2">
          <div className="col-12">
            <label className="form-label small fw-bold text-dark">Category</label>
            <select 
              className="form-select form-select-sm mb-2"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="microblading">Microblading</option>
              <option value="ombré">Ombré</option>
              <option value="combo">Combo</option>
              <option value="powder">Powder</option>
            </select>
          </div>
          
          <div className="col-6">
            <label className="form-label small fw-bold text-dark">Intensity</label>
            <select 
              className="form-select form-select-sm mb-2"
              value={selectedIntensity}
              onChange={(e) => setSelectedIntensity(e.target.value)}
            >
              <option value="all">All Intensities</option>
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="bold">Bold</option>
            </select>
          </div>
          
          <div className="col-6">
            <label className="form-label small fw-bold text-dark">Difficulty</label>
            <select 
              className="form-select form-select-sm mb-2"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Actions */}
      {comparisonMode && selectedForComparison.length > 0 && (
        <div className="comparison-actions mb-3 p-3 bg-light rounded">
          <div className="d-flex justify-content-between align-items-center">
            <span className="small fw-bold text-dark">
              {selectedForComparison.length} style(s) selected for comparison
            </span>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setSelectedForComparison([])}
              >
                Clear
              </button>
              <button 
                className="btn btn-primary btn-sm"
                onClick={handleCompareStyles}
                disabled={selectedForComparison.length < 2}
              >
                <i className="fas fa-columns me-2"></i>
                Compare Styles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styles Grid */}
      <div className="styles-grid">
        {filteredStyles.length === 0 ? (
          <div className="text-center py-4">
            <i className="fas fa-search text-muted mb-3" style={{ fontSize: '2rem' }}></i>
            <p className="text-muted">No styles found matching your filters.</p>
          </div>
        ) : (
          <div className="row g-3">
            {filteredStyles.map((style) => (
              <div key={style.styleId} className="col-12">
                <div 
                  className={`card border-0 shadow-sm h-100 style-card ${
                    selectedForComparison.includes(style.styleId) ? 'border-primary bg-light' : ''
                  } ${comparisonMode ? 'cursor-pointer' : ''}`}
                  onClick={() => handleStyleSelect(style)}
                >
                  <div className="card-body p-3">
                    <div className="d-flex align-items-start">
                      <div className="style-thumbnail me-3">
                        <div 
                          className="rounded d-flex align-items-center justify-content-center"
                          style={{ 
                            width: '60px', 
                            height: '60px', 
                            backgroundColor: style.colorPalette[0] + '20',
                            border: `2px solid ${style.colorPalette[0]}`
                          }}
                        >
                          <i className={`${getCategoryIcon(style.category)} text-primary`}></i>
                        </div>
                      </div>
                      
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h4 className="h6 fw-bold text-dark mb-1">{style.styleName}</h4>
                          <div className="d-flex gap-1">
                            {comparisonMode && (
                              <div className={`form-check ${selectedForComparison.includes(style.styleId) ? 'text-primary' : ''}`}>
                                <input 
                                  className="form-check-input" 
                                  type="checkbox"
                                  checked={selectedForComparison.includes(style.styleId)}
                                  onChange={() => {}} // Handled by onClick
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-secondary small mb-2">{style.description}</p>
                        
                        <div className="d-flex flex-wrap gap-1 mb-2">
                          {style.tags.map((tag, index) => (
                            <span key={index} className="badge bg-light text-dark border">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex gap-2">
                            <span className={`badge bg-${getDifficultyColor(style.difficulty)} text-white`}>
                              {style.difficulty}
                            </span>
                            <span className="badge bg-info text-white">
                              {style.intensity}
                            </span>
                          </div>
                          <span className="small fw-bold text-primary">
                            {style.priceRange}
                          </span>
                        </div>
                        
                        <div className="mt-2 pt-2 border-top">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="small text-secondary">
                              <i className="fas fa-clock me-1"></i>
                              {style.duration}
                            </span>
                            <span className="small text-secondary">
                              <i className="fas fa-heart me-1"></i>
                              {style.healingTime}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Style Categories Info */}
      <div className="style-categories-info mt-4 p-3 bg-light rounded">
        <h5 className="h6 fw-bold text-dark mb-2">
          <i className="fas fa-info-circle me-2"></i>
          Style Categories
        </h5>
        <div className="row g-2">
          <div className="col-6">
            <div className="d-flex align-items-center">
              <i className="fas fa-feather text-primary me-2"></i>
              <span className="small text-secondary">Microblading</span>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex align-items-center">
              <i className="fas fa-palette text-primary me-2"></i>
              <span className="small text-secondary">Ombré</span>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex align-items-center">
              <i className="fas fa-magic text-primary me-2"></i>
              <span className="small text-secondary">Combo</span>
            </div>
          </div>
          <div className="col-6">
            <div className="d-flex align-items-center">
              <i className="fas fa-fill-drip text-primary me-2"></i>
              <span className="small text-secondary">Powder</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center mt-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Applying style...</span>
          </div>
          <p className="text-secondary mt-2 mb-0">Applying style...</p>
        </div>
      )}
    </div>
  );
}
