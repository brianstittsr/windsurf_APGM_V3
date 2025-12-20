'use client';

import React, { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

interface CoreWebVitals {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  totalBlockingTime: number;
  cumulativeLayoutShift: number;
  speedIndex: number;
  timeToInteractive: number;
}

interface PerformanceScores {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

interface LighthouseAudit {
  id: string;
  title: string;
  description: string;
  score: number | null;
  displayValue?: string;
}

interface PageSpeedResult {
  url: string;
  fetchTime: string;
  strategy: 'mobile' | 'desktop';
  scores: PerformanceScores;
  metrics: CoreWebVitals;
  opportunities: LighthouseAudit[];
  diagnostics: LighthouseAudit[];
  passedAudits: number;
  totalAudits: number;
}

interface PageSpeedReport {
  url: string;
  generatedAt: string;
  mobile: PageSpeedResult;
  desktop: PageSpeedResult;
  recommendations: string[];
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
}

// ============================================================================
// Component
// ============================================================================

export default function PageSpeedDashboard() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<PageSpeedReport | null>(null);
  const [activeView, setActiveView] = useState<'mobile' | 'desktop'>('mobile');

  // --------------------------------------------------------------------------
  // API Call
  // --------------------------------------------------------------------------

  const analyzeUrl = async () => {
    if (!url.trim()) {
      setError('Please enter a URL to analyze');
      return;
    }

    // Ensure URL has protocol
    let analyzeUrl = url.trim();
    if (!analyzeUrl.startsWith('http://') && !analyzeUrl.startsWith('https://')) {
      analyzeUrl = 'https://' + analyzeUrl;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/seo/pagespeed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: analyzeUrl, fullReport: true })
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setReport(data.report);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze URL');
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'success';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A': return 'success';
      case 'B': return 'info';
      case 'C': return 'warning';
      case 'D': return 'orange';
      case 'F': return 'danger';
      default: return 'secondary';
    }
  };

  const formatTime = (ms: number): string => {
    if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
    return `${ms.toFixed(0)}ms`;
  };

  const getMetricStatus = (metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      firstContentfulPaint: { good: 1800, poor: 3000 },
      largestContentfulPaint: { good: 2500, poor: 4000 },
      totalBlockingTime: { good: 200, poor: 600 },
      cumulativeLayoutShift: { good: 0.1, poor: 0.25 },
      speedIndex: { good: 3400, poor: 5800 },
      timeToInteractive: { good: 3800, poor: 7300 }
    };

    const threshold = thresholds[metricName];
    if (!threshold) return 'needs-improvement';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status: string): string => {
    if (status === 'good') return 'success';
    if (status === 'needs-improvement') return 'warning';
    return 'danger';
  };

  const currentResult = report ? (activeView === 'mobile' ? report.mobile : report.desktop) : null;

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div className="pagespeed-dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="fas fa-tachometer-alt me-2"></i>
          PageSpeed Insights
        </h2>
      </div>

      {/* Input Section */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-end">
            <div className="col-md-9">
              <label className="form-label">Website URL</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., https://your-website.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && analyzeUrl()}
              />
              <small className="text-muted">Enter the full URL of the page you want to analyze</small>
            </div>
            <div className="col-md-3">
              <button
                className="btn btn-primary w-100"
                onClick={analyzeUrl}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-bolt me-2"></i>
                    Analyze
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Results */}
      {report && (
        <>
          {/* Overall Grade */}
          <div className="card mb-4">
            <div className="card-body text-center">
              <div className="row align-items-center">
                <div className="col-md-3">
                  <div className={`display-1 text-${getGradeColor(report.overallGrade)}`}>
                    {report.overallGrade}
                  </div>
                  <p className="text-muted mb-0">Overall Grade</p>
                </div>
                <div className="col-md-9">
                  <p className="mb-2">
                    <strong>URL:</strong> {report.url}
                  </p>
                  <p className="mb-0 text-muted">
                    <small>Analyzed: {new Date(report.generatedAt).toLocaleString()}</small>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile/Desktop Toggle */}
          <div className="btn-group mb-4" role="group">
            <button
              type="button"
              className={`btn ${activeView === 'mobile' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveView('mobile')}
            >
              <i className="fas fa-mobile-alt me-2"></i>
              Mobile
            </button>
            <button
              type="button"
              className={`btn ${activeView === 'desktop' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveView('desktop')}
            >
              <i className="fas fa-desktop me-2"></i>
              Desktop
            </button>
          </div>

          {currentResult && (
            <>
              {/* Score Cards */}
              <div className="row mb-4">
                <div className="col-md-3">
                  <div className="card h-100">
                    <div className="card-body text-center">
                      <div className={`display-4 text-${getScoreColor(currentResult.scores.performance)}`}>
                        {currentResult.scores.performance}
                      </div>
                      <p className="mb-0">Performance</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card h-100">
                    <div className="card-body text-center">
                      <div className={`display-4 text-${getScoreColor(currentResult.scores.accessibility)}`}>
                        {currentResult.scores.accessibility}
                      </div>
                      <p className="mb-0">Accessibility</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card h-100">
                    <div className="card-body text-center">
                      <div className={`display-4 text-${getScoreColor(currentResult.scores.bestPractices)}`}>
                        {currentResult.scores.bestPractices}
                      </div>
                      <p className="mb-0">Best Practices</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card h-100">
                    <div className="card-body text-center">
                      <div className={`display-4 text-${getScoreColor(currentResult.scores.seo)}`}>
                        {currentResult.scores.seo}
                      </div>
                      <p className="mb-0">SEO</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Web Vitals */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="fas fa-heartbeat me-2"></i>
                    Core Web Vitals
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    {[
                      { key: 'firstContentfulPaint', label: 'First Contentful Paint', value: currentResult.metrics.firstContentfulPaint },
                      { key: 'largestContentfulPaint', label: 'Largest Contentful Paint', value: currentResult.metrics.largestContentfulPaint },
                      { key: 'totalBlockingTime', label: 'Total Blocking Time', value: currentResult.metrics.totalBlockingTime },
                      { key: 'cumulativeLayoutShift', label: 'Cumulative Layout Shift', value: currentResult.metrics.cumulativeLayoutShift },
                      { key: 'speedIndex', label: 'Speed Index', value: currentResult.metrics.speedIndex },
                      { key: 'timeToInteractive', label: 'Time to Interactive', value: currentResult.metrics.timeToInteractive }
                    ].map((metric) => {
                      const status = getMetricStatus(metric.key, metric.value);
                      return (
                        <div key={metric.key} className="col-md-4 mb-3">
                          <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                            <div>
                              <strong>{metric.label}</strong>
                              <div className="text-muted">
                                {metric.key === 'cumulativeLayoutShift' 
                                  ? metric.value.toFixed(3)
                                  : formatTime(metric.value)
                                }
                              </div>
                            </div>
                            <span className={`badge bg-${getStatusColor(status)}`}>
                              {status === 'good' ? '✓ Good' : status === 'needs-improvement' ? '⚠ Needs Work' : '✗ Poor'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {report.recommendations.length > 0 && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="fas fa-lightbulb me-2 text-warning"></i>
                      Recommendations
                    </h5>
                  </div>
                  <div className="card-body">
                    <ul className="list-unstyled mb-0">
                      {report.recommendations.map((rec, idx) => (
                        <li key={idx} className="mb-2 p-2 bg-light rounded">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Opportunities */}
              {currentResult.opportunities.length > 0 && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h5 className="mb-0">
                      <i className="fas fa-tools me-2"></i>
                      Optimization Opportunities
                    </h5>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Issue</th>
                            <th>Potential Savings</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentResult.opportunities.map((opp, idx) => (
                            <tr key={idx}>
                              <td>
                                <strong>{opp.title}</strong>
                                <div className="text-muted small">{opp.description}</div>
                              </td>
                              <td>
                                {opp.displayValue && (
                                  <span className="badge bg-warning text-dark">
                                    {opp.displayValue}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Audit Summary */}
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>
                      <i className="fas fa-check-circle text-success me-2"></i>
                      <strong>{currentResult.passedAudits}</strong> of <strong>{currentResult.totalAudits}</strong> audits passed
                    </span>
                    <div className="progress" style={{ width: '200px', height: '10px' }}>
                      <div
                        className="progress-bar bg-success"
                        style={{ width: `${(currentResult.passedAudits / currentResult.totalAudits) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Configuration Notice */}
      <div className="alert alert-info mt-4">
        <i className="fas fa-info-circle me-2"></i>
        <strong>Configuration Required:</strong> This feature requires a Google PageSpeed API key.
        Set <code>GOOGLE_PAGESPEED_API_KEY</code> environment variable.
        <a href="https://developers.google.com/speed/docs/insights/v5/get-started" target="_blank" rel="noopener noreferrer" className="ms-2">
          Get API Key →
        </a>
      </div>
    </div>
  );
}
