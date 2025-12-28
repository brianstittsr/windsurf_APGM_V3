'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAlertDialog } from '@/components/ui/alert-dialog';

interface Keyword {
  id: string;
  keyword: string;
  matchType: 'exact' | 'phrase' | 'broad';
  cpc: number;
  impressions: number;
  clicks: number;
  conversions: number;
  qualityScore: number;
  status: 'active' | 'paused';
}

interface AdGroup {
  id: string;
  name: string;
  keywords: Keyword[];
  ads: number;
  spend: number;
  conversions: number;
}

interface Campaign {
  id: string;
  name: string;
  platform: 'google' | 'bing';
  status: 'active' | 'paused' | 'ended';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  cpa: number;
  adGroups: AdGroup[];
}

const sampleKeywords: Keyword[] = [
  { id: '1', keyword: 'microblading near me', matchType: 'exact', cpc: 3.50, impressions: 1200, clicks: 45, conversions: 3, qualityScore: 8, status: 'active' },
  { id: '2', keyword: 'permanent makeup', matchType: 'phrase', cpc: 2.80, impressions: 2500, clicks: 78, conversions: 5, qualityScore: 7, status: 'active' },
  { id: '3', keyword: 'eyebrow tattoo', matchType: 'broad', cpc: 2.20, impressions: 1800, clicks: 52, conversions: 2, qualityScore: 6, status: 'active' },
  { id: '4', keyword: 'lip blush treatment', matchType: 'exact', cpc: 4.10, impressions: 800, clicks: 28, conversions: 2, qualityScore: 9, status: 'active' },
  { id: '5', keyword: 'powder brows', matchType: 'phrase', cpc: 3.00, impressions: 950, clicks: 35, conversions: 3, qualityScore: 8, status: 'active' }
];

export default function PPCCampaignsDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>(sampleKeywords);
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'keywords' | 'ads' | 'landing'>('overview');
  const { showAlert, AlertDialogComponent } = useAlertDialog();

  // Keyword research form
  const [keywordForm, setKeywordForm] = useState({
    seed: '',
    results: [] as { keyword: string; volume: number; cpc: number; competition: string }[]
  });

  // Stats
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spent, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const avgCPA = totalConversions > 0 ? totalSpend / totalConversions : 0;

  const searchKeywords = async () => {
    if (!keywordForm.seed) {
      await showAlert({
        title: 'Enter Seed Keyword',
        description: 'Please enter a keyword to research',
        variant: 'warning'
      });
      return;
    }

    // Simulated keyword research results
    const results = [
      { keyword: `${keywordForm.seed} near me`, volume: 1200, cpc: 3.50, competition: 'High' },
      { keyword: `best ${keywordForm.seed}`, volume: 800, cpc: 2.80, competition: 'Medium' },
      { keyword: `${keywordForm.seed} cost`, volume: 650, cpc: 2.20, competition: 'Low' },
      { keyword: `${keywordForm.seed} before and after`, volume: 1500, cpc: 1.90, competition: 'Medium' },
      { keyword: `${keywordForm.seed} reviews`, volume: 450, cpc: 2.50, competition: 'Low' },
      { keyword: `professional ${keywordForm.seed}`, volume: 320, cpc: 3.80, competition: 'High' },
      { keyword: `${keywordForm.seed} salon`, volume: 580, cpc: 2.40, competition: 'Medium' },
      { keyword: `${keywordForm.seed} artist`, volume: 420, cpc: 2.90, competition: 'Medium' }
    ];

    setKeywordForm({ ...keywordForm, results });
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'Low': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'High': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-mouse-pointer text-[#AD6269]"></i>
            PPC Campaigns
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage pay-per-click advertising campaigns</p>
        </div>
        <Button className="bg-[#AD6269] hover:bg-[#9d5860]">
          <i className="fas fa-plus mr-2"></i>
          Create Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">${totalSpend.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total Spend</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Clicks</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{totalConversions}</p>
          <p className="text-xs text-gray-500">Conversions</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">${avgCPC.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Avg CPC</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">${avgCPA.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Avg CPA</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: 'fas fa-chart-pie' },
          { id: 'campaigns', label: 'Campaigns', icon: 'fas fa-bullhorn' },
          { id: 'keywords', label: 'Keywords', icon: 'fas fa-key' },
          { id: 'ads', label: 'Ad Copy', icon: 'fas fa-ad' },
          { id: 'landing', label: 'Landing Pages', icon: 'fas fa-file-alt' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#AD6269] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className={`${tab.icon} mr-2`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Google Ads Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fab fa-google text-blue-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Google Ads</h3>
                  <p className="text-sm text-gray-500">Search & Display Network</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-gray-900">$0</p>
                  <p className="text-xs text-gray-500">Spend</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-gray-900">0</p>
                  <p className="text-xs text-gray-500">Conversions</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <i className="fas fa-plug mr-2"></i>
                Connect Google Ads
              </Button>
            </div>

            {/* Bing Ads Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fab fa-microsoft text-blue-800 text-xl"></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Microsoft Ads</h3>
                  <p className="text-sm text-gray-500">Bing Search Network</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-gray-900">$0</p>
                  <p className="text-xs text-gray-500">Spend</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-gray-900">0</p>
                  <p className="text-xs text-gray-500">Conversions</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <i className="fas fa-plug mr-2"></i>
                Connect Microsoft Ads
              </Button>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-bold mb-4">PPC Best Practices</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <i className="fas fa-bullseye text-2xl mb-2"></i>
                <h4 className="font-semibold">Target Intent</h4>
                <p className="text-sm text-white/80">Focus on keywords with buying intent like "near me" and "book now"</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <i className="fas fa-star text-2xl mb-2"></i>
                <h4 className="font-semibold">Quality Score</h4>
                <p className="text-sm text-white/80">Improve ad relevance and landing page experience for lower CPCs</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <i className="fas fa-chart-line text-2xl mb-2"></i>
                <h4 className="font-semibold">Track Conversions</h4>
                <p className="text-sm text-white/80">Set up conversion tracking to measure ROI accurately</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-bullhorn text-4xl text-gray-300 mb-4"></i>
              <h3 className="font-semibold text-gray-900 mb-2">No PPC Campaigns</h3>
              <p className="text-gray-500 mb-4">Connect your ad accounts to import campaigns or create new ones</p>
              <Button className="bg-[#AD6269] hover:bg-[#9d5860]">
                Create Campaign
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CTR</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conv.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <i className={`fab fa-${campaign.platform} ${campaign.platform === 'google' ? 'text-blue-600' : 'text-blue-800'}`}></i>
                        <span className="font-medium text-gray-900">{campaign.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900">${campaign.budget}/day</td>
                    <td className="px-4 py-3 text-gray-900">{campaign.clicks}</td>
                    <td className="px-4 py-3 text-gray-900">{campaign.ctr.toFixed(2)}%</td>
                    <td className="px-4 py-3 text-gray-900">{campaign.conversions}</td>
                    <td className="px-4 py-3 text-gray-900">${campaign.cpa.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Keywords Tab */}
      {activeTab === 'keywords' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Keyword Research */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              <i className="fas fa-search text-[#AD6269] mr-2"></i>
              Keyword Research
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Seed Keyword</Label>
                <div className="flex gap-2">
                  <Input
                    value={keywordForm.seed}
                    onChange={(e) => setKeywordForm({ ...keywordForm, seed: e.target.value })}
                    placeholder="e.g., microblading"
                  />
                  <Button className="bg-[#AD6269] hover:bg-[#9d5860]" onClick={searchKeywords}>
                    Search
                  </Button>
                </div>
              </div>

              {keywordForm.results.length > 0 && (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {keywordForm.results.map((result, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{result.keyword}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{result.volume.toLocaleString()} searches/mo</span>
                          <span className={getCompetitionColor(result.competition)}>{result.competition}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${result.cpc.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">CPC</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Keywords */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              <i className="fas fa-key text-[#AD6269] mr-2"></i>
              Sample Keywords
            </h3>
            <div className="space-y-3">
              {keywords.map((keyword) => (
                <div key={keyword.id} className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-900">{keyword.keyword}</span>
                      <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {keyword.matchType}
                      </span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-bold rounded ${getQualityScoreColor(keyword.qualityScore)}`}>
                      QS: {keyword.qualityScore}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <p className="font-bold text-gray-900">{keyword.impressions.toLocaleString()}</p>
                      <p className="text-gray-500">Impr.</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{keyword.clicks}</p>
                      <p className="text-gray-500">Clicks</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">${keyword.cpc.toFixed(2)}</p>
                      <p className="text-gray-500">CPC</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{keyword.conversions}</p>
                      <p className="text-gray-500">Conv.</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ads Tab */}
      {activeTab === 'ads' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Ad Copy Generator</h3>
              <Button className="bg-[#AD6269] hover:bg-[#9d5860]">
                <i className="fas fa-magic mr-2"></i>
                Generate with AI
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Headline 1 (30 chars)</Label>
                  <Input placeholder="Professional Microblading" maxLength={30} />
                </div>
                <div>
                  <Label>Headline 2 (30 chars)</Label>
                  <Input placeholder="Wake Up Beautiful Daily" maxLength={30} />
                </div>
                <div>
                  <Label>Headline 3 (30 chars)</Label>
                  <Input placeholder="Book Your Appointment" maxLength={30} />
                </div>
                <div>
                  <Label>Description 1 (90 chars)</Label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                    rows={2}
                    maxLength={90}
                    placeholder="Transform your brows with our expert microblading services. Natural-looking results."
                  />
                </div>
                <div>
                  <Label>Description 2 (90 chars)</Label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                    rows={2}
                    maxLength={90}
                    placeholder="Certified artists. 5-star reviews. Free consultation available. Book today!"
                  />
                </div>
              </div>

              {/* Ad Preview */}
              <div>
                <Label>Ad Preview</Label>
                <div className="mt-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="text-xs text-gray-500 mb-1">Ad · aprettygirlmatter.com</div>
                  <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                    Professional Microblading | Wake Up Beautiful Daily
                  </div>
                  <div className="text-green-700 text-sm">aprettygirlmatter.com/microblading</div>
                  <div className="text-gray-600 text-sm mt-1">
                    Transform your brows with our expert microblading services. Natural-looking results. Certified artists. 5-star reviews. Free consultation available.
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">This is a preview of how your ad may appear in search results</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Landing Pages Tab */}
      {activeTab === 'landing' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Landing Page Optimization</h3>
              <Button className="bg-[#AD6269] hover:bg-[#9d5860]">
                <i className="fas fa-plus mr-2"></i>
                Create Landing Page
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-check text-green-600"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Microblading LP</h4>
                    <p className="text-xs text-gray-500">/microblading</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="font-bold text-gray-900">4.2%</p>
                    <p className="text-xs text-gray-500">Conv. Rate</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="font-bold text-gray-900">92</p>
                    <p className="text-xs text-gray-500">Page Score</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-exclamation text-yellow-600"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Lip Blush LP</h4>
                    <p className="text-xs text-gray-500">/lip-blush</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="font-bold text-gray-900">2.8%</p>
                    <p className="text-xs text-gray-500">Conv. Rate</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="font-bold text-gray-900">78</p>
                    <p className="text-xs text-gray-500">Page Score</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-center hover:border-[#AD6269] hover:bg-[#AD6269]/5 transition-colors cursor-pointer">
                <i className="fas fa-plus text-gray-400 text-xl mb-2"></i>
                <p className="text-sm text-gray-500">Add Landing Page</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Landing Page Checklist</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Clear headline matching ad copy', checked: true },
                { label: 'Strong call-to-action above fold', checked: true },
                { label: 'Mobile-responsive design', checked: true },
                { label: 'Fast page load speed (<3s)', checked: false },
                { label: 'Trust signals (reviews, badges)', checked: true },
                { label: 'Before/after gallery', checked: true },
                { label: 'Contact form or booking widget', checked: true },
                { label: 'FAQ section', checked: false }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    item.checked ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <i className={`fas ${item.checked ? 'fa-check text-green-600' : 'fa-times text-gray-400'} text-xs`}></i>
                  </div>
                  <span className={item.checked ? 'text-gray-900' : 'text-gray-500'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {AlertDialogComponent}
    </div>
  );
}
