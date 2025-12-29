'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 90) return 'from-green-500 to-emerald-600';
    if (score >= 50) return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-amber-600 bg-amber-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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

  const getStatusBadge = (status: string): string => {
    if (status === 'good') return 'bg-green-100 text-green-700';
    if (status === 'needs-improvement') return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  const currentResult = report ? (activeView === 'mobile' ? report.mobile : report.desktop) : null;

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-tachometer-alt text-blue-500"></i>
            PageSpeed Insights
          </h2>
          <p className="text-gray-500 text-sm mt-1">Analyze your website performance and get optimization tips</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-indigo-600">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <i className="fas fa-globe"></i>
            PageSpeed Insights
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-3 space-y-2">
              <Label>Website URL</Label>
              <Input
                type="text"
                placeholder="e.g., https://your-website.com"
                value={url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && analyzeUrl()}
              />
              <p className="text-xs text-gray-500">Enter the full URL of the page you want to analyze</p>
            </div>
            <div>
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600"
                onClick={analyzeUrl}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-bolt mr-2"></i>
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <i className="fas fa-exclamation-circle text-red-500 mt-0.5"></i>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Results */}
      {report && (
        <div className="space-y-6">
          {/* Overall Grade */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="text-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl font-bold ${getGradeColor(report.overallGrade)}`}>
                    {report.overallGrade}
                  </div>
                  <p className="text-gray-500 text-sm mt-2">Overall Grade</p>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <p className="text-gray-900 font-medium mb-1">
                    <span className="text-gray-500">URL:</span> {report.url}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Analyzed: {new Date(report.generatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile/Desktop Toggle */}
          <div className="flex gap-2">
            <Button
              variant={activeView === 'mobile' ? 'default' : 'outline'}
              className={activeView === 'mobile' ? 'bg-blue-500 hover:bg-blue-600' : ''}
              onClick={() => setActiveView('mobile')}
            >
              <i className="fas fa-mobile-alt mr-2"></i>
              Mobile
            </Button>
            <Button
              variant={activeView === 'desktop' ? 'default' : 'outline'}
              className={activeView === 'desktop' ? 'bg-blue-500 hover:bg-blue-600' : ''}
              onClick={() => setActiveView('desktop')}
            >
              <i className="fas fa-desktop mr-2"></i>
              Desktop
            </Button>
          </div>

          {currentResult && (
            <div className="space-y-6">
              {/* Score Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Performance', score: currentResult.scores.performance, icon: 'fa-rocket' },
                  { label: 'Accessibility', score: currentResult.scores.accessibility, icon: 'fa-universal-access' },
                  { label: 'Best Practices', score: currentResult.scores.bestPractices, icon: 'fa-check-double' },
                  { label: 'SEO', score: currentResult.scores.seo, icon: 'fa-search' },
                ].map((item) => (
                  <div key={item.label} className={`bg-gradient-to-br ${getScoreBgColor(item.score)} rounded-xl p-5 text-white shadow-lg`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm font-medium">{item.label}</p>
                        <p className="text-4xl font-bold mt-1">{item.score}</p>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <i className={`fas ${item.icon} text-xl`}></i>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Core Web Vitals */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-purple-500">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <i className="fas fa-heartbeat"></i>
                    Core Web Vitals
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        <div key={metric.key} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{metric.label}</p>
                            <p className="text-gray-500 text-lg font-semibold">
                              {metric.key === 'cumulativeLayoutShift' 
                                ? metric.value.toFixed(3)
                                : formatTime(metric.value)
                              }
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(status)}`}>
                            {status === 'good' ? '✓ Good' : status === 'needs-improvement' ? '⚠ Needs Work' : '✗ Poor'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              {report.recommendations.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-amber-500">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <i className="fas fa-lightbulb"></i>
                      Recommendations
                    </h3>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-2">
                      {report.recommendations.map((rec, idx) => (
                        <li key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-sm flex items-start gap-2">
                          <i className="fas fa-check-circle text-amber-500 mt-0.5"></i>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Opportunities */}
              {currentResult.opportunities.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-blue-500">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <i className="fas fa-tools"></i>
                      Optimization Opportunities
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Issue</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-700">Potential Savings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentResult.opportunities.map((opp, idx) => (
                          <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <p className="font-medium text-gray-900">{opp.title}</p>
                              <p className="text-gray-500 text-xs mt-1">{opp.description}</p>
                            </td>
                            <td className="text-right py-3 px-4">
                              {opp.displayValue && (
                                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
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
              )}

              {/* Audit Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-check-circle text-green-500 text-xl"></i>
                    <span className="text-gray-700">
                      <strong className="text-gray-900">{currentResult.passedAudits}</strong> of <strong className="text-gray-900">{currentResult.totalAudits}</strong> audits passed
                    </span>
                  </div>
                  <div className="w-full sm:w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${(currentResult.passedAudits / currentResult.totalAudits) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Configuration Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
        <div>
          <p className="text-blue-800 font-medium text-sm">Configuration Required</p>
          <p className="text-blue-700 text-sm">
            This feature requires a Google PageSpeed API key. Set <code className="bg-blue-100 px-1 rounded">GOOGLE_PAGESPEED_API_KEY</code> environment variable.
            <a href="https://developers.google.com/speed/docs/insights/v5/get-started" target="_blank" rel="noopener noreferrer" className="ml-2 underline hover:text-blue-900">
              Get API Key →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
