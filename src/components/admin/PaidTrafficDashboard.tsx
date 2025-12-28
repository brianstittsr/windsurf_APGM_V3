'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAlertDialog } from '@/components/ui/alert-dialog';

interface AdPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  connected: boolean;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: 'active' | 'paused' | 'ended';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpc: number;
  cpa: number;
  startDate: string;
  endDate?: string;
}

const defaultPlatforms: AdPlatform[] = [
  { id: 'google', name: 'Google Ads', icon: 'fab fa-google', color: 'bg-blue-500', connected: false, spend: 0, impressions: 0, clicks: 0, conversions: 0 },
  { id: 'facebook', name: 'Facebook Ads', icon: 'fab fa-facebook', color: 'bg-blue-600', connected: false, spend: 0, impressions: 0, clicks: 0, conversions: 0 },
  { id: 'instagram', name: 'Instagram Ads', icon: 'fab fa-instagram', color: 'bg-gradient-to-br from-purple-500 to-pink-500', connected: false, spend: 0, impressions: 0, clicks: 0, conversions: 0 },
  { id: 'tiktok', name: 'TikTok Ads', icon: 'fab fa-tiktok', color: 'bg-black', connected: false, spend: 0, impressions: 0, clicks: 0, conversions: 0 }
];

export default function PaidTrafficDashboard() {
  const [platforms, setPlatforms] = useState<AdPlatform[]>(defaultPlatforms);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'audiences' | 'budget' | 'roi'>('overview');
  const { showAlert, AlertDialogComponent } = useAlertDialog();

  // Stats
  const totalSpend = platforms.reduce((sum, p) => sum + p.spend, 0);
  const totalImpressions = platforms.reduce((sum, p) => sum + p.impressions, 0);
  const totalClicks = platforms.reduce((sum, p) => sum + p.clicks, 0);
  const totalConversions = platforms.reduce((sum, p) => sum + p.conversions, 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCPC = totalClicks > 0 ? totalSpend / totalClicks : 0;

  const connectPlatform = async (platformId: string) => {
    await showAlert({
      title: 'Connect Platform',
      description: `To connect ${platformId}, you'll need to set up API credentials in Settings. This feature requires API access from the advertising platform.`,
      variant: 'default'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-bullseye text-[#AD6269]"></i>
            Paid Traffic Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage ads across Google, Facebook, Instagram, and TikTok</p>
        </div>
        <Button className="bg-[#AD6269] hover:bg-[#9d5860]">
          <i className="fas fa-plus mr-2"></i>
          Create Campaign
        </Button>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {platforms.map((platform) => (
          <div key={platform.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${platform.color} rounded-full flex items-center justify-center`}>
                <i className={`${platform.icon} text-white text-lg`}></i>
              </div>
              {platform.connected ? (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Connected</span>
              ) : (
                <Button size="sm" variant="outline" onClick={() => connectPlatform(platform.id)}>
                  Connect
                </Button>
              )}
            </div>
            <h3 className="font-semibold text-gray-900">{platform.name}</h3>
            {platform.connected ? (
              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-lg font-bold text-gray-900">${platform.spend}</p>
                  <p className="text-xs text-gray-500">Spend</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-lg font-bold text-gray-900">{platform.conversions}</p>
                  <p className="text-xs text-gray-500">Conversions</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 mt-2">Connect to view metrics</p>
            )}
          </div>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">${totalSpend.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total Spend</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{totalImpressions.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Impressions</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Clicks</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{avgCTR.toFixed(2)}%</p>
          <p className="text-xs text-gray-500">CTR</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">${avgCPC.toFixed(2)}</p>
          <p className="text-xs text-gray-500">Avg CPC</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{totalConversions}</p>
          <p className="text-xs text-gray-500">Conversions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: 'fas fa-chart-pie' },
          { id: 'campaigns', label: 'Campaigns', icon: 'fas fa-bullhorn' },
          { id: 'audiences', label: 'Audiences', icon: 'fas fa-users' },
          { id: 'budget', label: 'Budget', icon: 'fas fa-wallet' },
          { id: 'roi', label: 'ROI Calculator', icon: 'fas fa-calculator' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Getting Started</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <i className="fas fa-plug text-blue-600"></i>
                </div>
                <h4 className="font-medium text-gray-900">1. Connect Platforms</h4>
                <p className="text-sm text-gray-500 mt-1">Link your Google, Facebook, Instagram, and TikTok ad accounts</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <i className="fas fa-bullhorn text-green-600"></i>
                </div>
                <h4 className="font-medium text-gray-900">2. Create Campaigns</h4>
                <p className="text-sm text-gray-500 mt-1">Build targeted campaigns to reach your ideal customers</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <i className="fas fa-chart-line text-purple-600"></i>
                </div>
                <h4 className="font-medium text-gray-900">3. Track Performance</h4>
                <p className="text-sm text-gray-500 mt-1">Monitor ROI and optimize for better results</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Performance Trends</h3>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <i className="fas fa-chart-area text-4xl mb-2"></i>
                <p>Connect ad platforms to see performance trends</p>
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
              <p className="text-gray-500 mb-4">No campaigns yet</p>
              <p className="text-sm text-gray-400 mb-4">Connect your ad platforms to import existing campaigns or create new ones</p>
              <Button className="bg-[#AD6269] hover:bg-[#9d5860]">
                Create Campaign
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spent</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversions</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{campaign.name}</td>
                    <td className="px-4 py-3 text-gray-500">{campaign.platform}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900">${campaign.budget}</td>
                    <td className="px-4 py-3 text-gray-900">${campaign.spent}</td>
                    <td className="px-4 py-3 text-gray-900">{campaign.conversions}</td>
                    <td className="px-4 py-3 text-gray-900">${campaign.cpa.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Audiences Tab */}
      {activeTab === 'audiences' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Audience Segments</h3>
              <Button className="bg-[#AD6269] hover:bg-[#9d5860]">
                <i className="fas fa-plus mr-2"></i>
                Create Audience
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-users text-blue-600"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Website Visitors</h4>
                    <p className="text-xs text-gray-500">Last 30 days</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-400 mt-1">Install tracking pixel to capture visitors</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-user-check text-green-600"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Past Customers</h4>
                    <p className="text-xs text-gray-500">All time</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-400 mt-1">Sync from booking data</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-user-friends text-purple-600"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Lookalike Audience</h4>
                    <p className="text-xs text-gray-500">Similar to customers</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">-</p>
                <p className="text-xs text-gray-400 mt-1">Requires connected platform</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Tab */}
      {activeTab === 'budget' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Budget Allocation</h3>
            <div className="space-y-4">
              {platforms.map((platform) => (
                <div key={platform.id} className="flex items-center gap-4">
                  <div className={`w-10 h-10 ${platform.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <i className={`${platform.icon} text-white`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900">{platform.name}</span>
                      <span className="text-gray-500">${platform.spend} / month</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#AD6269] rounded-full" style={{ width: '0%' }} />
                    </div>
                  </div>
                  <Input type="number" placeholder="0" className="w-24" />
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Total Monthly Budget</p>
                <p className="text-sm text-gray-500">Across all platforms</p>
              </div>
              <p className="text-2xl font-bold text-[#AD6269]">$0</p>
            </div>
          </div>
        </div>
      )}

      {/* ROI Calculator Tab */}
      {activeTab === 'roi' && (
        <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">ROI Calculator</h3>
          <div className="space-y-4">
            <div>
              <Label>Monthly Ad Spend ($)</Label>
              <Input type="number" placeholder="1000" />
            </div>
            <div>
              <Label>Average Service Price ($)</Label>
              <Input type="number" placeholder="350" />
            </div>
            <div>
              <Label>Expected Conversion Rate (%)</Label>
              <Input type="number" placeholder="3" />
            </div>
            <div>
              <Label>Customer Lifetime Value ($)</Label>
              <Input type="number" placeholder="1000" />
            </div>
            <Button className="w-full bg-[#AD6269] hover:bg-[#9d5860]">
              Calculate ROI
            </Button>
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">Expected ROAS</p>
                  <p className="text-2xl font-bold text-green-600">-</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-green-600">-</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {AlertDialogComponent}
    </div>
  );
}
