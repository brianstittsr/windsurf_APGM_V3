'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    if (saturation === 'low') return 'from-green-500 to-emerald-600';
    if (saturation === 'medium') return 'from-amber-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getSaturationBadge = (saturation: string): string => {
    if (saturation === 'low') return 'bg-green-100 text-green-700';
    if (saturation === 'medium') return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  const getPositionBadge = (position: string): string => {
    if (position === 'leader') return 'bg-red-100 text-red-700';
    if (position === 'challenger') return 'bg-amber-100 text-amber-700';
    if (position === 'follower') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-700';
  };

  const tabs = [
    { id: 'search', label: `Competitors (${competitors.length})`, icon: 'fa-list' },
    { id: 'analysis', label: 'Market Analysis', icon: 'fa-chart-pie', disabled: !marketAnalysis },
    { id: 'pricing', label: 'Pricing Analysis', icon: 'fa-dollar-sign', disabled: competitors.length === 0 },
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
            <i className="fas fa-map-marker-alt text-red-500"></i>
            Geographical Competitor Analysis
          </h2>
          <p className="text-gray-500 text-sm mt-1">Find and analyze competitors in your area</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-500 to-rose-600">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <i className="fas fa-map-marker-alt"></i>
            Geographical Competitor Analysis
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5 space-y-2">
              <Label>Location</Label>
              <Input
                type="text"
                placeholder="Enter address or city"
                value={searchAddress}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchAddress(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && searchCompetitors()}
              />
            </div>
            <div className="md:col-span-3 space-y-2">
              <Label>Search Radius</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={searchRadius}
                onChange={(e) => setSearchRadius(parseInt(e.target.value))}
              >
                <option value={8000}>5 miles</option>
                <option value={16000}>10 miles</option>
                <option value={32000}>20 miles</option>
                <option value={48000}>30 miles</option>
              </select>
            </div>
            <div className="md:col-span-4 flex gap-2">
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={searchCompetitors}
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <i className="fas fa-search mr-2"></i>
                    Search
                  </>
                )}
              </Button>
              <Button
                className="flex-1 bg-green-500 hover:bg-green-600"
                onClick={analyzeMarket}
                disabled={loading}
              >
                <i className="fas fa-chart-bar mr-2"></i>
                Full Analysis
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

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'pricing' && competitors.length > 0) {
                  analyzePricing();
                } else if (!tab.disabled) {
                  setActiveTab(tab.id as any);
                }
              }}
              disabled={tab.disabled}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600'
                  : tab.disabled
                  ? 'border-transparent text-gray-300 cursor-not-allowed'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className={`fas ${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Search Results Tab */}
      {activeTab === 'search' && (
        <div>
          {competitors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {competitors.map((competitor, idx) => (
                <div key={competitor.placeId} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {idx + 1}. {competitor.name}
                      </h4>
                      <p className="text-gray-500 text-sm flex items-center gap-1">
                        <i className="fas fa-map-marker-alt text-red-400"></i>
                        {competitor.address}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                      {formatMiles(competitor.distance)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map(i => (
                        <i key={i} className={`fas fa-star ${i <= Math.round(competitor.rating) ? '' : 'text-gray-300'}`}></i>
                      ))}
                    </div>
                    <span className="font-bold text-gray-900">{competitor.rating.toFixed(1)}</span>
                    <span className="text-gray-500 text-sm">({competitor.totalReviews} reviews)</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {competitor.website && (
                      <a 
                        href={competitor.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-blue-500 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50 transition-colors"
                      >
                        <i className="fas fa-globe"></i>
                        Website
                      </a>
                    )}
                    {competitor.phone && (
                      <a 
                        href={`tel:${competitor.phone}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                      >
                        <i className="fas fa-phone"></i>
                        {competitor.phone}
                      </a>
                    )}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${competitor.openNow ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {competitor.openNow ? 'Open Now' : 'Closed'}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-cyan-500 text-cyan-600 hover:bg-cyan-50"
                    onClick={() => analyzeCompetitor(competitor)}
                  >
                    <i className="fas fa-chart-line mr-2"></i>
                    SWOT Analysis
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search text-4xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Search for competitors in your area</h3>
              <p className="text-gray-500 text-sm">Enter a location and search radius to find nearby PMU businesses</p>
            </div>
          )}
        </div>
      )}

      {/* Market Analysis Tab */}
      {activeTab === 'analysis' && marketAnalysis && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Total Competitors</p>
                  <p className="text-4xl font-bold mt-1">{marketAnalysis.totalCompetitors}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-users text-xl"></i>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Avg Rating</p>
                  <p className="text-4xl font-bold mt-1">{marketAnalysis.averageRating.toFixed(1)}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-star text-xl"></i>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Avg Reviews</p>
                  <p className="text-4xl font-bold mt-1">{Math.round(marketAnalysis.averageReviews)}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-comments text-xl"></i>
                </div>
              </div>
            </div>
            <div className={`bg-gradient-to-br ${getSaturationColor(marketAnalysis.marketSaturation)} rounded-xl p-5 text-white shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">Market Saturation</p>
                  <p className="text-4xl font-bold mt-1 capitalize">{marketAnalysis.marketSaturation}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-chart-pie text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-amber-500">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <i className="fas fa-lightbulb"></i>
                Recommendations
              </h3>
            </div>
            <div className="p-6">
              <ul className="space-y-2">
                {marketAnalysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-sm flex items-start gap-2">
                    <i className="fas fa-check-circle text-green-500 mt-0.5"></i>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Top Competitors */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-amber-500">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <i className="fas fa-trophy"></i>
                Top Competitors
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 w-12">#</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Rating</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Reviews</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Distance</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {marketAnalysis.topCompetitors.map((comp, idx) => (
                    <tr key={comp.placeId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {idx === 0 && <i className="fas fa-trophy text-amber-500"></i>}
                        {idx === 1 && <i className="fas fa-medal text-gray-400"></i>}
                        {idx === 2 && <i className="fas fa-award text-amber-600"></i>}
                        {idx > 2 && <span className="text-gray-500">{idx + 1}</span>}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900">{comp.name}</p>
                        <p className="text-gray-500 text-xs">{comp.address}</p>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="text-amber-500">★</span> {comp.rating.toFixed(1)}
                      </td>
                      <td className="text-center py-3 px-4 text-gray-700">{comp.totalReviews}</td>
                      <td className="text-center py-3 px-4 text-gray-700">{formatMiles(comp.distance)}</td>
                      <td className="text-center py-3 px-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-cyan-500 text-cyan-600 hover:bg-cyan-50"
                          onClick={() => analyzeCompetitor(comp)}
                        >
                          Analyze
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Tab */}
      {activeTab === 'pricing' && pricingData && (
        <div className="space-y-6">
          {/* Average Pricing */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-green-500">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <i className="fas fa-dollar-sign"></i>
                Average Market Pricing
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {pricingData.averagePricing && (
                  <>
                    <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-xl p-5 border border-pink-200">
                      <h4 className="text-gray-700 text-sm font-medium mb-2">Microblading</h4>
                      <p className="text-2xl font-bold text-pink-600">
                        ${pricingData.averagePricing.microblading?.min} - ${pricingData.averagePricing.microblading?.max}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-5 border border-purple-200">
                      <h4 className="text-gray-700 text-sm font-medium mb-2">Powder Brows</h4>
                      <p className="text-2xl font-bold text-purple-600">
                        ${pricingData.averagePricing.powderBrows?.min} - ${pricingData.averagePricing.powderBrows?.max}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl p-5 border border-red-200">
                      <h4 className="text-gray-700 text-sm font-medium mb-2">Lip Blush</h4>
                      <p className="text-2xl font-bold text-red-600">
                        ${pricingData.averagePricing.lipBlush?.min} - ${pricingData.averagePricing.lipBlush?.max}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-5 border border-blue-200">
                      <h4 className="text-gray-700 text-sm font-medium mb-2">Eyeliner</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        ${pricingData.averagePricing.eyeliner?.min} - ${pricingData.averagePricing.eyeliner?.max}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Recommendations */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-amber-500">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <i className="fas fa-lightbulb"></i>
                Pricing Recommendations
              </h3>
            </div>
            <div className="p-6">
              <ul className="space-y-2">
                {pricingData.pricingRecommendations?.map((rec: string, idx: number) => (
                  <li key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-800 text-sm flex items-start gap-2">
                    <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Competitor Pricing */}
          {pricingData.competitorPricing?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-purple-500">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <i className="fas fa-tags"></i>
                  Competitor Pricing Estimates
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Competitor</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Microblading</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Powder Brows</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Lip Blush</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-700">Eyeliner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingData.competitorPricing.map((cp: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{cp.name}</td>
                        <td className="text-center py-3 px-4 text-gray-700">${cp.pricing.microblading?.min}-${cp.pricing.microblading?.max}</td>
                        <td className="text-center py-3 px-4 text-gray-700">${cp.pricing.powderBrows?.min}-${cp.pricing.powderBrows?.max}</td>
                        <td className="text-center py-3 px-4 text-gray-700">${cp.pricing.lipBlush?.min}-${cp.pricing.lipBlush?.max}</td>
                        <td className="text-center py-3 px-4 text-gray-700">${cp.pricing.eyeliner?.min}-${cp.pricing.eyeliner?.max}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SWOT Analysis Modal */}
      {selectedCompetitor && competitorAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-cyan-500 to-blue-600">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-white">
                  SWOT Analysis: {selectedCompetitor.name}
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getPositionBadge(competitorAnalysis.marketPosition)}`}>
                  {competitorAnalysis.marketPosition}
                </span>
              </div>
              <button 
                className="text-white/80 hover:text-white"
                onClick={() => { setSelectedCompetitor(null); setCompetitorAnalysis(null); }}
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Strengths */}
                <div className="bg-green-50 rounded-xl border border-green-200 overflow-hidden">
                  <div className="px-4 py-3 bg-green-500 text-white font-medium flex items-center gap-2">
                    <i className="fas fa-plus-circle"></i>
                    Strengths
                  </div>
                  <div className="p-4">
                    <ul className="space-y-2 text-sm text-green-800">
                      {competitorAnalysis.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <i className="fas fa-check text-green-500 mt-0.5"></i>
                          {s}
                        </li>
                      ))}
                      {competitorAnalysis.strengths.length === 0 && (
                        <li className="text-gray-400">No notable strengths identified</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Weaknesses */}
                <div className="bg-red-50 rounded-xl border border-red-200 overflow-hidden">
                  <div className="px-4 py-3 bg-red-500 text-white font-medium flex items-center gap-2">
                    <i className="fas fa-minus-circle"></i>
                    Weaknesses
                  </div>
                  <div className="p-4">
                    <ul className="space-y-2 text-sm text-red-800">
                      {competitorAnalysis.weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <i className="fas fa-times text-red-500 mt-0.5"></i>
                          {w}
                        </li>
                      ))}
                      {competitorAnalysis.weaknesses.length === 0 && (
                        <li className="text-gray-400">No notable weaknesses identified</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Opportunities */}
                <div className="bg-blue-50 rounded-xl border border-blue-200 overflow-hidden">
                  <div className="px-4 py-3 bg-blue-500 text-white font-medium flex items-center gap-2">
                    <i className="fas fa-lightbulb"></i>
                    Opportunities
                  </div>
                  <div className="p-4">
                    <ul className="space-y-2 text-sm text-blue-800">
                      {competitorAnalysis.opportunities.map((o, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <i className="fas fa-arrow-up text-blue-500 mt-0.5"></i>
                          {o}
                        </li>
                      ))}
                      {competitorAnalysis.opportunities.length === 0 && (
                        <li className="text-gray-400">No opportunities identified</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Threats */}
                <div className="bg-amber-50 rounded-xl border border-amber-200 overflow-hidden">
                  <div className="px-4 py-3 bg-amber-500 text-white font-medium flex items-center gap-2">
                    <i className="fas fa-exclamation-triangle"></i>
                    Threats
                  </div>
                  <div className="p-4">
                    <ul className="space-y-2 text-sm text-amber-800">
                      {competitorAnalysis.threats.map((t, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <i className="fas fa-exclamation text-amber-500 mt-0.5"></i>
                          {t}
                        </li>
                      ))}
                      {competitorAnalysis.threats.length === 0 && (
                        <li className="text-gray-400">No threats identified</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <Button 
                variant="outline"
                onClick={() => { setSelectedCompetitor(null); setCompetitorAnalysis(null); }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
        <div>
          <p className="text-blue-800 font-medium text-sm">Configuration Required</p>
          <p className="text-blue-700 text-sm">
            This feature requires a Google Maps API key with Places API enabled. Set <code className="bg-blue-100 px-1 rounded">GOOGLE_MAPS_API_KEY</code> environment variable.
          </p>
        </div>
      </div>
    </div>
  );
}
