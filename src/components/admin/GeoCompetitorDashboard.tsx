'use client';

import React, { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

interface Competitor {
  placeId: string;
  name: string;
  address: string;
  location: { lat: number; lng: number };
  rating: number;
  totalReviews: number;
  priceLevel?: number;
  phone?: string;
  website?: string;
  businessStatus: string;
  types: string[];
  openNow?: boolean;
  distance?: number;
}

interface MarketAnalysis {
  totalCompetitors: number;
  averageRating: number;
  averageReviews: number;
  priceRange: { min: number; max: number };
  marketSaturation: 'low' | 'medium' | 'high';
  competitors: Competitor[];
  recommendations: string[];
  topCompetitors: Competitor[];
  nearbyCompetitors: Competitor[];
}

interface CompetitorAnalysis {
  competitor: Competitor;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  marketPosition: string;
}

// ============================================================================
// Component
// ============================================================================

export default function GeoCompetitorDashboard() {
  const [activeTab, setActiveTab] = useState<'search' | 'analysis' | 'pricing'>('search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [searchAddress, setSearchAddress] = useState('Atlanta, GA');
  const [searchRadius, setSearchRadius] = useState(16000);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);

  // Market Analysis
  const [marketAnalysis, setMarketAnalysis] = useState<MarketAnalysis | null>(null);

  // Selected Competitor
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<CompetitorAnalysis | null>(null);

  // Pricing
  const [pricingData, setPricingData] = useState<any>(null);

  // --------------------------------------------------------------------------
  // API Calls
  // --------------------------------------------------------------------------

  const searchCompetitors = async () => {
    if (!searchAddress.trim()) {
      setError('Please enter an address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/competitors/geo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'search_by_address',
          address: searchAddress,
          radius: searchRadius
        })
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Search failed');
      }

      setCompetitors(data.competitors);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeMarket = async () => {
    if (!searchAddress.trim()) {
      setError('Please enter an address first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/competitors/geo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_market_by_address',
          address: searchAddress,
          radius: searchRadius
        })
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setMarketAnalysis(data.analysis);
      setActiveTab('analysis');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeCompetitor = async (competitor: Competitor) => {
    setLoading(true);
    setSelectedCompetitor(competitor);

    try {
      const res = await fetch('/api/competitors/geo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_competitor',
          placeId: competitor.placeId
        })
      });
      const data = await res.json();

      if (data.success) {
        setCompetitorAnalysis(data.analysis);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzePricing = async () => {
    if (competitors.length === 0) {
      setError('Please search for competitors first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/competitors/geo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_pricing',
          latitude: competitors[0].location.lat,
          longitude: competitors[0].location.lng,
          radius: searchRadius
        })
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Pricing analysis failed');
      }

      setPricingData(data);
      setActiveTab('pricing');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  const formatDistance = (meters?: number): string => {
    if (!meters) return 'N/A';
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatMiles = (meters?: number): string => {
    if (!meters) return 'N/A';
    const miles = meters / 1609.34;
    return `${miles.toFixed(1)} mi`;
  };

  const getSaturationColor = (saturation: string): string => {
    if (saturation === 'low') return 'success';
    if (saturation === 'medium') return 'warning';
    return 'danger';
  };

  const getPositionBadge = (position: string): string => {
    if (position === 'leader') return 'danger';
    if (position === 'challenger') return 'warning';
    if (position === 'follower') return 'info';
    return 'secondary';
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div className="geo-competitor-dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="fas fa-map-marker-alt me-2 text-danger"></i>
          Geographical Competitor Analysis
        </h2>
      </div>

      {/* Search Bar */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-end">
            <div className="col-md-5">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter address or city"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchCompetitors()}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Search Radius</label>
              <select
                className="form-select"
                value={searchRadius}
                onChange={(e) => setSearchRadius(parseInt(e.target.value))}
              >
                <option value={8000}>5 miles</option>
                <option value={16000}>10 miles</option>
                <option value={32000}>20 miles</option>
                <option value={48000}>30 miles</option>
              </select>
            </div>
            <div className="col-md-4">
              <div className="btn-group w-100">
                <button
                  className="btn btn-primary"
                  onClick={searchCompetitors}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    <>
                      <i className="fas fa-search me-2"></i>
                      Search
                    </>
                  )}
                </button>
                <button
                  className="btn btn-success"
                  onClick={analyzeMarket}
                  disabled={loading}
                >
                  <i className="fas fa-chart-bar me-2"></i>
                  Full Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <i className="fas fa-list me-2"></i>
            Competitors ({competitors.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
            disabled={!marketAnalysis}
          >
            <i className="fas fa-chart-pie me-2"></i>
            Market Analysis
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'pricing' ? 'active' : ''}`}
            onClick={() => { if (competitors.length > 0) analyzePricing(); }}
            disabled={competitors.length === 0}
          >
            <i className="fas fa-dollar-sign me-2"></i>
            Pricing Analysis
          </button>
        </li>
      </ul>

      {/* Search Results Tab */}
      {activeTab === 'search' && (
        <div>
          {competitors.length > 0 ? (
            <div className="row">
              {competitors.map((competitor, idx) => (
                <div key={competitor.placeId} className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h5 className="card-title mb-1">
                            {idx + 1}. {competitor.name}
                          </h5>
                          <p className="text-muted small mb-0">
                            <i className="fas fa-map-marker-alt me-1"></i>
                            {competitor.address}
                          </p>
                        </div>
                        <span className="badge bg-secondary">
                          {formatMiles(competitor.distance)}
                        </span>
                      </div>

                      <div className="d-flex align-items-center mb-3">
                        <span className="text-warning me-2">
                          {[1, 2, 3, 4, 5].map(i => (
                            <i key={i} className={`fas fa-star${i <= Math.round(competitor.rating) ? '' : '-o text-muted'}`}></i>
                          ))}
                        </span>
                        <span className="fw-bold">{competitor.rating.toFixed(1)}</span>
                        <span className="text-muted ms-2">({competitor.totalReviews} reviews)</span>
                      </div>

                      <div className="mb-3">
                        {competitor.website && (
                          <a 
                            href={competitor.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary me-2"
                          >
                            <i className="fas fa-globe me-1"></i>
                            Website
                          </a>
                        )}
                        {competitor.phone && (
                          <a 
                            href={`tel:${competitor.phone}`}
                            className="btn btn-sm btn-outline-secondary me-2"
                          >
                            <i className="fas fa-phone me-1"></i>
                            {competitor.phone}
                          </a>
                        )}
                        <span className={`badge bg-${competitor.openNow ? 'success' : 'secondary'}`}>
                          {competitor.openNow ? 'Open Now' : 'Closed'}
                        </span>
                      </div>

                      <button
                        className="btn btn-outline-info btn-sm w-100"
                        onClick={() => analyzeCompetitor(competitor)}
                      >
                        <i className="fas fa-chart-line me-2"></i>
                        SWOT Analysis
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="fas fa-search fa-3x text-muted mb-3"></i>
              <p className="text-muted">Search for competitors in your area</p>
            </div>
          )}
        </div>
      )}

      {/* Market Analysis Tab */}
      {activeTab === 'analysis' && marketAnalysis && (
        <div>
          {/* Stats Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white h-100">
                <div className="card-body text-center">
                  <div className="display-4">{marketAnalysis.totalCompetitors}</div>
                  <p className="mb-0">Total Competitors</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-dark h-100">
                <div className="card-body text-center">
                  <div className="display-4">{marketAnalysis.averageRating.toFixed(1)}</div>
                  <p className="mb-0">Avg Rating</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white h-100">
                <div className="card-body text-center">
                  <div className="display-4">{Math.round(marketAnalysis.averageReviews)}</div>
                  <p className="mb-0">Avg Reviews</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className={`card bg-${getSaturationColor(marketAnalysis.marketSaturation)} text-white h-100`}>
                <div className="card-body text-center">
                  <div className="display-4 text-capitalize">{marketAnalysis.marketSaturation}</div>
                  <p className="mb-0">Market Saturation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-lightbulb text-warning me-2"></i>
                Recommendations
              </h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                {marketAnalysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="mb-2 p-2 bg-light rounded">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Top Competitors */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-trophy text-warning me-2"></i>
                Top Competitors
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Rating</th>
                      <th>Reviews</th>
                      <th>Distance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketAnalysis.topCompetitors.map((comp, idx) => (
                      <tr key={comp.placeId}>
                        <td>
                          {idx === 0 && <i className="fas fa-trophy text-warning"></i>}
                          {idx === 1 && <i className="fas fa-medal text-secondary"></i>}
                          {idx === 2 && <i className="fas fa-award text-warning"></i>}
                          {idx > 2 && idx + 1}
                        </td>
                        <td>
                          <strong>{comp.name}</strong>
                          <br />
                          <small className="text-muted">{comp.address}</small>
                        </td>
                        <td>
                          <span className="text-warning">★</span> {comp.rating.toFixed(1)}
                        </td>
                        <td>{comp.totalReviews}</td>
                        <td>{formatMiles(comp.distance)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => analyzeCompetitor(comp)}
                          >
                            Analyze
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Tab */}
      {activeTab === 'pricing' && pricingData && (
        <div>
          {/* Average Pricing */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-dollar-sign me-2"></i>
                Average Market Pricing
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                {pricingData.averagePricing && (
                  <>
                    <div className="col-md-3 mb-3">
                      <div className="border rounded p-3 text-center">
                        <h6>Microblading</h6>
                        <h4 className="text-primary">
                          ${pricingData.averagePricing.microblading?.min} - ${pricingData.averagePricing.microblading?.max}
                        </h4>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="border rounded p-3 text-center">
                        <h6>Powder Brows</h6>
                        <h4 className="text-primary">
                          ${pricingData.averagePricing.powderBrows?.min} - ${pricingData.averagePricing.powderBrows?.max}
                        </h4>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="border rounded p-3 text-center">
                        <h6>Lip Blush</h6>
                        <h4 className="text-primary">
                          ${pricingData.averagePricing.lipBlush?.min} - ${pricingData.averagePricing.lipBlush?.max}
                        </h4>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="border rounded p-3 text-center">
                        <h6>Eyeliner</h6>
                        <h4 className="text-primary">
                          ${pricingData.averagePricing.eyeliner?.min} - ${pricingData.averagePricing.eyeliner?.max}
                        </h4>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Recommendations */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-lightbulb text-warning me-2"></i>
                Pricing Recommendations
              </h5>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                {pricingData.pricingRecommendations?.map((rec: string, idx: number) => (
                  <li key={idx} className="mb-2 p-2 bg-light rounded">
                    <i className="fas fa-info-circle text-info me-2"></i>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Competitor Pricing */}
          {pricingData.competitorPricing?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Competitor Pricing Estimates</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Competitor</th>
                        <th>Microblading</th>
                        <th>Powder Brows</th>
                        <th>Lip Blush</th>
                        <th>Eyeliner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricingData.competitorPricing.map((cp: any, idx: number) => (
                        <tr key={idx}>
                          <td><strong>{cp.name}</strong></td>
                          <td>${cp.pricing.microblading?.min}-${cp.pricing.microblading?.max}</td>
                          <td>${cp.pricing.powderBrows?.min}-${cp.pricing.powderBrows?.max}</td>
                          <td>${cp.pricing.lipBlush?.min}-${cp.pricing.lipBlush?.max}</td>
                          <td>${cp.pricing.eyeliner?.min}-${cp.pricing.eyeliner?.max}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SWOT Analysis Modal */}
      {selectedCompetitor && competitorAnalysis && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  SWOT Analysis: {selectedCompetitor.name}
                  <span className={`badge ms-2 bg-${getPositionBadge(competitorAnalysis.marketPosition)}`}>
                    {competitorAnalysis.marketPosition}
                  </span>
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => { setSelectedCompetitor(null); setCompetitorAnalysis(null); }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {/* Strengths */}
                  <div className="col-md-6 mb-3">
                    <div className="card border-success h-100">
                      <div className="card-header bg-success text-white">
                        <i className="fas fa-plus-circle me-2"></i>
                        Strengths
                      </div>
                      <div className="card-body">
                        <ul className="mb-0">
                          {competitorAnalysis.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                          {competitorAnalysis.strengths.length === 0 && (
                            <li className="text-muted">No notable strengths identified</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Weaknesses */}
                  <div className="col-md-6 mb-3">
                    <div className="card border-danger h-100">
                      <div className="card-header bg-danger text-white">
                        <i className="fas fa-minus-circle me-2"></i>
                        Weaknesses
                      </div>
                      <div className="card-body">
                        <ul className="mb-0">
                          {competitorAnalysis.weaknesses.map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                          {competitorAnalysis.weaknesses.length === 0 && (
                            <li className="text-muted">No notable weaknesses identified</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Opportunities */}
                  <div className="col-md-6 mb-3">
                    <div className="card border-info h-100">
                      <div className="card-header bg-info text-white">
                        <i className="fas fa-lightbulb me-2"></i>
                        Opportunities
                      </div>
                      <div className="card-body">
                        <ul className="mb-0">
                          {competitorAnalysis.opportunities.map((o, i) => (
                            <li key={i}>{o}</li>
                          ))}
                          {competitorAnalysis.opportunities.length === 0 && (
                            <li className="text-muted">No opportunities identified</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Threats */}
                  <div className="col-md-6 mb-3">
                    <div className="card border-warning h-100">
                      <div className="card-header bg-warning text-dark">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        Threats
                      </div>
                      <div className="card-body">
                        <ul className="mb-0">
                          {competitorAnalysis.threats.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                          {competitorAnalysis.threats.length === 0 && (
                            <li className="text-muted">No threats identified</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => { setSelectedCompetitor(null); setCompetitorAnalysis(null); }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Notice */}
      <div className="alert alert-info mt-4">
        <i className="fas fa-info-circle me-2"></i>
        <strong>Configuration Required:</strong> This feature requires a Google Maps API key with Places API enabled.
        Set <code>GOOGLE_MAPS_API_KEY</code> environment variable.
      </div>
    </div>
  );
}
