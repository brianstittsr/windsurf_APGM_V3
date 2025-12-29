'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    if (difficulty < 30) return 'bg-green-100 text-green-700';
    if (difficulty < 60) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getPositionBadge = (position: number): string => {
    if (position <= 3) return 'bg-green-100 text-green-700';
    if (position <= 10) return 'bg-blue-100 text-blue-700';
    if (position <= 20) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  const tabs = [
    { id: 'analyze', label: 'Analyze Competitor', icon: 'fa-chart-line' },
    { id: 'gaps', label: 'Keyword Gaps', icon: 'fa-exchange-alt' },
    { id: 'pmu', label: 'PMU Keywords', icon: 'fa-spa' },
  ];

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-search text-[#AD6269]"></i>
            Competitor Keyword Analysis
          </h2>
          <p className="text-gray-500 text-sm mt-1">Analyze competitor keywords and find opportunities</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#AD6269] text-[#AD6269]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className={`fas ${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </nav>
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

      {/* Analyze Competitor Tab */}
      {activeTab === 'analyze' && (
        <div className="space-y-6">
          {/* Input Section */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#AD6269] to-[#c17a80]">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <i className="fas fa-chart-line"></i>
                Analyze Competitor Domain
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-3 space-y-2">
                  <Label>Competitor Domain</Label>
                  <Input
                    type="text"
                    placeholder="e.g., competitor-pmu.com"
                    value={competitorUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompetitorUrl(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Enter domain without http:// or www.</p>
                </div>
                <div>
                  <Button
                    className="w-full bg-[#AD6269] hover:bg-[#9d5860]"
                    onClick={analyzeCompetitor}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-search mr-2"></i>
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Domain Overview */}
          {domainOverview && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Monthly Traffic</p>
                    <p className="text-3xl font-bold mt-1">{formatNumber(domainOverview.organicTraffic)}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-chart-line text-xl"></i>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Ranking Keywords</p>
                    <p className="text-3xl font-bold mt-1">{formatNumber(domainOverview.organicKeywords)}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-key text-xl"></i>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Backlinks</p>
                    <p className="text-3xl font-bold mt-1">{formatNumber(domainOverview.backlinks)}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-link text-xl"></i>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium">Traffic Value</p>
                    <p className="text-3xl font-bold mt-1">${formatNumber(domainOverview.organicCost)}</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-dollar-sign text-xl"></i>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Keywords Table */}
          {competitorData && competitorData.keywords.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-[#AD6269] flex items-center justify-between">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <i className="fas fa-key"></i>
                  Top Ranking Keywords ({competitorData.keywords.length})
                </h3>
                <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                  Est. Traffic: {formatNumber(competitorData.totalTraffic)}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Keyword</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Position</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Volume</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">CPC</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Difficulty</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Traffic</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitorData.keywords.slice(0, 50).map((kw, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{kw.keyword}</p>
                          {kw.url && (
                            <p className="text-xs text-gray-500 truncate max-w-[300px]">{kw.url}</p>
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPositionBadge(kw.position)}`}>
                            #{kw.position}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4 text-gray-700">{formatNumber(kw.searchVolume)}</td>
                        <td className="text-center py-3 px-4 text-gray-700">${kw.cpc.toFixed(2)}</td>
                        <td className="text-center py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(kw.difficulty)}`}>
                            {kw.difficulty}%
                          </span>
                        </td>
                        <td className="text-center py-3 px-4 text-gray-700">{formatNumber(kw.trafficShare)}</td>
                        <td className="text-center py-3 px-4">
                          <Button size="sm" variant="outline" className="border-[#AD6269] text-[#AD6269] hover:bg-[#AD6269]/10">
                            <i className="fas fa-plus"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No Results */}
          {competitorData && competitorData.keywords.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
              <p className="text-blue-700 text-sm">No ranking keywords found for this domain.</p>
            </div>
          )}
        </div>
      )}

      {/* Keyword Gaps Tab */}
      {activeTab === 'gaps' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#AD6269] to-[#c17a80]">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <i className="fas fa-exchange-alt"></i>
                Find Keyword Gaps
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="md:col-span-2 space-y-2">
                  <Label>Your Domain</Label>
                  <Input
                    type="text"
                    placeholder="e.g., your-pmu-site.com"
                    value={yourDomain}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYourDomain(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Competitor Domains (comma-separated)</Label>
                  <Input
                    type="text"
                    placeholder="e.g., competitor1.com, competitor2.com"
                    value={competitorDomains}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompetitorDomains(e.target.value)}
                  />
                </div>
                <div>
                  <Button
                    className="w-full bg-[#AD6269] hover:bg-[#9d5860]"
                    onClick={findKeywordGaps}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <i className="fas fa-search mr-2"></i>
                        Find Gaps
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Find keywords your competitors rank for that you don&apos;t.
              </p>
            </div>
          </div>

          {keywordGaps.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-amber-500">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <i className="fas fa-lightbulb"></i>
                  Keyword Opportunities ({keywordGaps.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Keyword</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Volume</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">CPC</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Difficulty</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keywordGaps.slice(0, 50).map((kw, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{kw.keyword}</td>
                        <td className="text-center py-3 px-4 text-gray-700">{formatNumber(kw.searchVolume)}</td>
                        <td className="text-center py-3 px-4 text-gray-700">${kw.cpc.toFixed(2)}</td>
                        <td className="text-center py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(kw.difficulty)}`}>
                            {kw.difficulty}%
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <Button size="sm" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                            <i className="fas fa-bullseye"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PMU Keywords Tab */}
      {activeTab === 'pmu' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#AD6269] to-[#c17a80]">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <i className="fas fa-spa"></i>
                PMU Industry Keywords
              </h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm mb-4">
                Get keyword suggestions specifically for the permanent makeup industry including microblading, powder brows, lip blush, and more.
              </p>
              <Button
                className="bg-[#AD6269] hover:bg-[#9d5860]"
                onClick={getPMUKeywords}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-spa mr-2"></i>
                    Get PMU Keywords
                  </>
                )}
              </Button>
            </div>
          </div>

          {pmuKeywords.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-[#AD6269]">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <i className="fas fa-spa"></i>
                  PMU Industry Keywords ({pmuKeywords.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Keyword</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Volume</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">CPC</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Difficulty</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pmuKeywords.slice(0, 50).map((kw, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{kw.keyword}</td>
                        <td className="text-center py-3 px-4 text-gray-700">{formatNumber(kw.searchVolume)}</td>
                        <td className="text-center py-3 px-4 text-gray-700">${kw.cpc.toFixed(2)}</td>
                        <td className="text-center py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(kw.difficulty)}`}>
                            {kw.difficulty}%
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <Button size="sm" variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                            <i className="fas fa-bullseye"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
            This feature requires DataForSEO API credentials. Set <code className="bg-blue-100 px-1 rounded">DATAFORSEO_LOGIN</code> and <code className="bg-blue-100 px-1 rounded">DATAFORSEO_PASSWORD</code> environment variables.
          </p>
        </div>
      </div>
    </div>
  );
}
