'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ============================================================================
// Types
// ============================================================================

interface RankedKeyword {
  keyword: string;
  position: number;
  searchVolume: number;
  cpc: number;
  competition: number;
  url: string;
  trafficShare: number;
  difficulty: number;
}

interface CompetitorData {
  domain: string;
  keywords: RankedKeyword[];
  totalTraffic: number;
  topKeywords: string[];
  analyzedAt: string;
}

interface KeywordGap {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  difficulty: number;
}

interface DomainOverview {
  domain: string;
  organicTraffic: number;
  organicKeywords: number;
  organicCost: number;
  backlinks: number;
  referringDomains: number;
}

// ============================================================================
// Component
// ============================================================================

export default function CompetitorAnalysis() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'keywords' | 'gaps' | 'pmu'>('analyze');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [yourDomain, setYourDomain] = useState('');
  const [competitorDomains, setCompetitorDomains] = useState('');

  // Results states
  const [competitorData, setCompetitorData] = useState<CompetitorData | null>(null);
  const [domainOverview, setDomainOverview] = useState<DomainOverview | null>(null);
  const [keywordGaps, setKeywordGaps] = useState<KeywordGap[]>([]);
  const [pmuKeywords, setPmuKeywords] = useState<KeywordGap[]>([]);

  // --------------------------------------------------------------------------
  // API Calls
  // --------------------------------------------------------------------------

  const analyzeCompetitor = async () => {
    if (!competitorUrl.trim()) {
      setError('Please enter a competitor domain');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get full analysis
      const analysisRes = await fetch('/api/seo/competitor-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze', domain: competitorUrl.trim() })
      });
      const analysisData = await analysisRes.json();

      if (!analysisData.success) {
        throw new Error(analysisData.error || 'Analysis failed');
      }

      setCompetitorData(analysisData.analysis);

      // Get domain overview
      const overviewRes = await fetch('/api/seo/competitor-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'domain_overview', domain: competitorUrl.trim() })
      });
      const overviewData = await overviewRes.json();

      if (overviewData.success && overviewData.overview) {
        setDomainOverview(overviewData.overview);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze competitor');
    } finally {
      setLoading(false);
    }
  };

  const findKeywordGaps = async () => {
    if (!yourDomain.trim() || !competitorDomains.trim()) {
      setError('Please enter your domain and at least one competitor domain');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const domains = competitorDomains.split(',').map(d => d.trim()).filter(d => d);
      
      const res = await fetch('/api/seo/competitor-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'keyword_gaps', 
          domain: yourDomain.trim(),
          domains 
        })
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to find keyword gaps');
      }

      setKeywordGaps(data.gaps || []);
    } catch (err: any) {
      setError(err.message || 'Failed to find keyword gaps');
    } finally {
      setLoading(false);
    }
  };

  const getPMUKeywords = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/seo/competitor-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'pmu_keywords' })
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get PMU keywords');
      }

      setPmuKeywords(data.keywords || []);
    } catch (err: any) {
      setError(err.message || 'Failed to get PMU keywords');
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getDifficultyColor = (difficulty: number): string => {
    if (difficulty < 30) return 'success';
    if (difficulty < 60) return 'warning';
    return 'danger';
  };

  const getPositionBadge = (position: number): string => {
    if (position <= 3) return 'success';
    if (position <= 10) return 'primary';
    if (position <= 20) return 'warning';
    return 'secondary';
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div className="competitor-analysis">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="fas fa-search me-2"></i>
          Competitor Keyword Analysis
        </h2>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'analyze' ? 'active' : ''}`}
            onClick={() => setActiveTab('analyze')}
          >
            <i className="fas fa-chart-line me-2"></i>
            Analyze Competitor
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'gaps' ? 'active' : ''}`}
            onClick={() => setActiveTab('gaps')}
          >
            <i className="fas fa-exchange-alt me-2"></i>
            Keyword Gaps
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'pmu' ? 'active' : ''}`}
            onClick={() => setActiveTab('pmu')}
          >
            <i className="fas fa-spa me-2"></i>
            PMU Keywords
          </button>
        </li>
      </ul>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Analyze Competitor Tab */}
      {activeTab === 'analyze' && (
        <div>
          {/* Input Section */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row align-items-end">
                <div className="col-md-8">
                  <label className="form-label">Competitor Domain</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., competitor-pmu.com"
                    value={competitorUrl}
                    onChange={(e) => setCompetitorUrl(e.target.value)}
                  />
                  <small className="text-muted">Enter domain without http:// or www.</small>
                </div>
                <div className="col-md-4">
                  <button
                    className="btn btn-primary w-100"
                    onClick={analyzeCompetitor}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-search me-2"></i>
                        Analyze
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Domain Overview */}
          {domainOverview && (
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card bg-primary text-white">
                  <div className="card-body text-center">
                    <h3 className="mb-0">{formatNumber(domainOverview.organicTraffic)}</h3>
                    <small>Monthly Traffic</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-success text-white">
                  <div className="card-body text-center">
                    <h3 className="mb-0">{formatNumber(domainOverview.organicKeywords)}</h3>
                    <small>Ranking Keywords</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-info text-white">
                  <div className="card-body text-center">
                    <h3 className="mb-0">{formatNumber(domainOverview.backlinks)}</h3>
                    <small>Backlinks</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-warning text-dark">
                  <div className="card-body text-center">
                    <h3 className="mb-0">${formatNumber(domainOverview.organicCost)}</h3>
                    <small>Traffic Value</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Keywords Table */}
          {competitorData && competitorData.keywords.length > 0 && (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="fas fa-key me-2"></i>
                  Top Ranking Keywords ({competitorData.keywords.length})
                </h5>
                <span className="badge bg-primary">
                  Est. Traffic: {formatNumber(competitorData.totalTraffic)}
                </span>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Keyword</th>
                        <th className="text-center">Position</th>
                        <th className="text-center">Volume</th>
                        <th className="text-center">CPC</th>
                        <th className="text-center">Difficulty</th>
                        <th className="text-center">Traffic</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitorData.keywords.slice(0, 50).map((kw, idx) => (
                        <tr key={idx}>
                          <td>
                            <strong>{kw.keyword}</strong>
                            {kw.url && (
                              <div>
                                <small className="text-muted text-truncate d-block" style={{ maxWidth: '300px' }}>
                                  {kw.url}
                                </small>
                              </div>
                            )}
                          </td>
                          <td className="text-center">
                            <span className={`badge bg-${getPositionBadge(kw.position)}`}>
                              #{kw.position}
                            </span>
                          </td>
                          <td className="text-center">{formatNumber(kw.searchVolume)}</td>
                          <td className="text-center">${kw.cpc.toFixed(2)}</td>
                          <td className="text-center">
                            <span className={`badge bg-${getDifficultyColor(kw.difficulty)}`}>
                              {kw.difficulty}%
                            </span>
                          </td>
                          <td className="text-center">{formatNumber(kw.trafficShare)}</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              title="Add to target keywords"
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* No Results */}
          {competitorData && competitorData.keywords.length === 0 && (
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              No ranking keywords found for this domain.
            </div>
          )}
        </div>
      )}

      {/* Keyword Gaps Tab */}
      {activeTab === 'gaps' && (
        <div>
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-5">
                  <label className="form-label">Your Domain</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., your-pmu-site.com"
                    value={yourDomain}
                    onChange={(e) => setYourDomain(e.target.value)}
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label">Competitor Domains (comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., competitor1.com, competitor2.com"
                    value={competitorDomains}
                    onChange={(e) => setCompetitorDomains(e.target.value)}
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button
                    className="btn btn-primary w-100"
                    onClick={findKeywordGaps}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <>
                        <i className="fas fa-search me-2"></i>
                        Find Gaps
                      </>
                    )}
                  </button>
                </div>
              </div>
              <small className="text-muted mt-2 d-block">
                Find keywords your competitors rank for that you don&apos;t.
              </small>
            </div>
          </div>

          {keywordGaps.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-lightbulb me-2 text-warning"></i>
                  Keyword Opportunities ({keywordGaps.length})
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Keyword</th>
                        <th className="text-center">Volume</th>
                        <th className="text-center">CPC</th>
                        <th className="text-center">Difficulty</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keywordGaps.slice(0, 50).map((kw, idx) => (
                        <tr key={idx}>
                          <td><strong>{kw.keyword}</strong></td>
                          <td className="text-center">{formatNumber(kw.searchVolume)}</td>
                          <td className="text-center">${kw.cpc.toFixed(2)}</td>
                          <td className="text-center">
                            <span className={`badge bg-${getDifficultyColor(kw.difficulty)}`}>
                              {kw.difficulty}%
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-success" title="Target this keyword">
                              <i className="fas fa-bullseye"></i>
                            </button>
                          </td>
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

      {/* PMU Keywords Tab */}
      {activeTab === 'pmu' && (
        <div>
          <div className="card mb-4">
            <div className="card-body">
              <p className="mb-3">
                Get keyword suggestions specifically for the permanent makeup industry.
              </p>
              <button
                className="btn btn-primary"
                onClick={getPMUKeywords}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-spa me-2"></i>
                    Get PMU Keywords
                  </>
                )}
              </button>
            </div>
          </div>

          {pmuKeywords.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-spa me-2"></i>
                  PMU Industry Keywords ({pmuKeywords.length})
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Keyword</th>
                        <th className="text-center">Volume</th>
                        <th className="text-center">CPC</th>
                        <th className="text-center">Difficulty</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pmuKeywords.slice(0, 50).map((kw, idx) => (
                        <tr key={idx}>
                          <td><strong>{kw.keyword}</strong></td>
                          <td className="text-center">{formatNumber(kw.searchVolume)}</td>
                          <td className="text-center">${kw.cpc.toFixed(2)}</td>
                          <td className="text-center">
                            <span className={`badge bg-${getDifficultyColor(kw.difficulty)}`}>
                              {kw.difficulty}%
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-success" title="Target this keyword">
                              <i className="fas fa-bullseye"></i>
                            </button>
                          </td>
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

      {/* Configuration Notice */}
      <div className="alert alert-info mt-4">
        <i className="fas fa-info-circle me-2"></i>
        <strong>Configuration Required:</strong> This feature requires DataForSEO API credentials.
        Set <code>DATAFORSEO_LOGIN</code> and <code>DATAFORSEO_PASSWORD</code> environment variables.
      </div>
    </div>
  );
}
