'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAlertDialog } from '@/components/ui/alert-dialog';

interface TrackingPixel {
  id: string;
  name: string;
  platform: 'facebook' | 'google' | 'tiktok' | 'pinterest';
  pixelId: string;
  isActive: boolean;
  eventsTracked: number;
}

interface AudienceSegment {
  id: string;
  name: string;
  description: string;
  size: number;
  type: 'visitors' | 'cart-abandoners' | 'customers' | 'custom';
  daysBack: number;
  isActive: boolean;
}

export default function RetargetingDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'pixels' | 'audiences' | 'campaigns'>('overview');
  const { showAlert, AlertDialogComponent } = useAlertDialog();

  const [pixels, setPixels] = useState<TrackingPixel[]>([
    { id: '1', name: 'Facebook Pixel', platform: 'facebook', pixelId: '', isActive: false, eventsTracked: 0 },
    { id: '2', name: 'Google Tag', platform: 'google', pixelId: '', isActive: false, eventsTracked: 0 },
    { id: '3', name: 'TikTok Pixel', platform: 'tiktok', pixelId: '', isActive: false, eventsTracked: 0 }
  ]);

  const [audiences, setAudiences] = useState<AudienceSegment[]>([
    { id: '1', name: 'All Website Visitors', description: 'Everyone who visited your website', size: 0, type: 'visitors', daysBack: 30, isActive: true },
    { id: '2', name: 'Booking Page Visitors', description: 'Visited booking page but didn\'t book', size: 0, type: 'cart-abandoners', daysBack: 14, isActive: true },
    { id: '3', name: 'Past Customers', description: 'Completed at least one booking', size: 0, type: 'customers', daysBack: 180, isActive: true }
  ]);

  const [pixelForm, setPixelForm] = useState({
    platform: 'facebook' as TrackingPixel['platform'],
    pixelId: ''
  });

  const savePixel = async () => {
    if (!pixelForm.pixelId) {
      await showAlert({
        title: 'Missing Pixel ID',
        description: 'Please enter your pixel/tag ID',
        variant: 'warning'
      });
      return;
    }

    setPixels(prev => prev.map(p => 
      p.platform === pixelForm.platform 
        ? { ...p, pixelId: pixelForm.pixelId, isActive: true }
        : p
    ));

    await showAlert({
      title: 'Pixel Saved',
      description: `Your ${pixelForm.platform} pixel has been configured. Add the tracking code to your website.`,
      variant: 'success'
    });

    setPixelForm({ platform: 'facebook', pixelId: '' });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return 'fab fa-facebook text-blue-600';
      case 'google': return 'fab fa-google text-red-500';
      case 'tiktok': return 'fab fa-tiktok text-black';
      case 'pinterest': return 'fab fa-pinterest text-red-600';
      default: return 'fas fa-code text-gray-600';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'facebook': return 'bg-blue-600';
      case 'google': return 'bg-red-500';
      case 'tiktok': return 'bg-black';
      case 'pinterest': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-crosshairs text-[#AD6269]"></i>
            Customer Retargeting
          </h2>
          <p className="text-gray-500 text-sm mt-1">Re-engage visitors and convert them into customers</p>
        </div>
        <Button className="bg-[#AD6269] hover:bg-[#9d5860]">
          <i className="fas fa-plus mr-2"></i>
          Create Retargeting Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fas fa-eye text-blue-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500">Visitors Tracked</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-users text-green-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{audiences.length}</p>
              <p className="text-xs text-gray-500">Audience Segments</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <i className="fas fa-code text-purple-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pixels.filter(p => p.isActive).length}</p>
              <p className="text-xs text-gray-500">Active Pixels</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <i className="fas fa-redo text-yellow-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500">Retargeted</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: 'fas fa-chart-pie' },
          { id: 'pixels', label: 'Tracking Pixels', icon: 'fas fa-code' },
          { id: 'audiences', label: 'Audiences', icon: 'fas fa-users' },
          { id: 'campaigns', label: 'Campaigns', icon: 'fas fa-bullhorn' }
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
          <div className="bg-gradient-to-r from-[#AD6269] to-pink-500 rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-2">Capture & Convert Lost Visitors</h3>
            <p className="text-white/80 mb-4">
              97% of website visitors leave without taking action. Retargeting helps you bring them back when they're ready to buy.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-4">
                <i className="fas fa-code text-2xl mb-2"></i>
                <h4 className="font-semibold">1. Install Pixels</h4>
                <p className="text-sm text-white/70">Add tracking pixels to capture visitor data</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <i className="fas fa-users text-2xl mb-2"></i>
                <h4 className="font-semibold">2. Build Audiences</h4>
                <p className="text-sm text-white/70">Segment visitors by behavior and intent</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <i className="fas fa-bullhorn text-2xl mb-2"></i>
                <h4 className="font-semibold">3. Launch Campaigns</h4>
                <p className="text-sm text-white/70">Show targeted ads to bring them back</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Retargeting Funnel</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-32 text-sm text-gray-600">Website Visitors</div>
                <div className="flex-1 h-8 bg-blue-100 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-500" style={{ width: '100%' }}></div>
                  <span className="absolute inset-0 flex items-center justify-center text-white font-medium">100%</span>
                </div>
                <span className="w-16 text-right font-bold">0</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 text-sm text-gray-600">Viewed Services</div>
                <div className="flex-1 h-8 bg-green-100 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-green-500" style={{ width: '60%' }}></div>
                  <span className="absolute inset-0 flex items-center justify-center text-white font-medium">60%</span>
                </div>
                <span className="w-16 text-right font-bold">0</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 text-sm text-gray-600">Started Booking</div>
                <div className="flex-1 h-8 bg-yellow-100 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-yellow-500" style={{ width: '20%' }}></div>
                  <span className="absolute inset-0 flex items-center justify-center text-white font-medium">20%</span>
                </div>
                <span className="w-16 text-right font-bold">0</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-32 text-sm text-gray-600">Completed</div>
                <div className="flex-1 h-8 bg-purple-100 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-purple-500" style={{ width: '5%' }}></div>
                  <span className="absolute inset-0 flex items-center justify-center text-white font-medium">5%</span>
                </div>
                <span className="w-16 text-right font-bold">0</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pixels Tab */}
      {activeTab === 'pixels' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Installed Pixels</h3>
            {pixels.map((pixel) => (
              <div key={pixel.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${getPlatformColor(pixel.platform)} rounded-full flex items-center justify-center`}>
                      <i className={`${getPlatformIcon(pixel.platform).replace(getPlatformColor(pixel.platform), '')} text-white`}></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{pixel.name}</h4>
                      {pixel.pixelId ? (
                        <p className="text-xs text-gray-500 font-mono">{pixel.pixelId}</p>
                      ) : (
                        <p className="text-xs text-gray-400">Not configured</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pixel.isActive && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Active</span>
                    )}
                    <button className="text-gray-400 hover:text-gray-600">
                      <i className="fas fa-cog"></i>
                    </button>
                  </div>
                </div>
                {pixel.isActive && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Events Tracked</span>
                      <span className="font-medium text-gray-900">{pixel.eventsTracked.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Add Tracking Pixel</h3>
            <div className="space-y-4">
              <div>
                <Label>Platform</Label>
                <select
                  value={pixelForm.platform}
                  onChange={(e) => setPixelForm({ ...pixelForm, platform: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                >
                  <option value="facebook">Facebook Pixel</option>
                  <option value="google">Google Tag</option>
                  <option value="tiktok">TikTok Pixel</option>
                  <option value="pinterest">Pinterest Tag</option>
                </select>
              </div>
              <div>
                <Label>Pixel/Tag ID</Label>
                <Input
                  value={pixelForm.pixelId}
                  onChange={(e) => setPixelForm({ ...pixelForm, pixelId: e.target.value })}
                  placeholder="e.g., 123456789012345"
                />
              </div>
              <Button className="w-full bg-[#AD6269] hover:bg-[#9d5860]" onClick={savePixel}>
                <i className="fas fa-save mr-2"></i>
                Save Pixel
              </Button>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <i className="fas fa-info-circle mr-2"></i>
                  After saving, you'll need to add the pixel code to your website. We'll provide the code snippet.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audiences Tab */}
      {activeTab === 'audiences' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Audience Segments</h3>
            <Button className="bg-[#AD6269] hover:bg-[#9d5860]">
              <i className="fas fa-plus mr-2"></i>
              Create Audience
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {audiences.map((audience) => (
              <div key={audience.id} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    audience.type === 'visitors' ? 'bg-blue-100' :
                    audience.type === 'cart-abandoners' ? 'bg-yellow-100' :
                    audience.type === 'customers' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    <i className={`fas ${
                      audience.type === 'visitors' ? 'fa-eye text-blue-600' :
                      audience.type === 'cart-abandoners' ? 'fa-shopping-cart text-yellow-600' :
                      audience.type === 'customers' ? 'fa-user-check text-green-600' : 'fa-users text-purple-600'
                    }`}></i>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    audience.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {audience.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900">{audience.name}</h4>
                <p className="text-sm text-gray-500 mt-1">{audience.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{audience.size.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">people</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Last {audience.daysBack} days</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <i className="fas fa-bullhorn text-4xl text-gray-300 mb-4"></i>
          <h3 className="font-semibold text-gray-900 mb-2">No Retargeting Campaigns</h3>
          <p className="text-gray-500 mb-4">Create campaigns to re-engage your website visitors</p>
          <Button className="bg-[#AD6269] hover:bg-[#9d5860]">
            <i className="fas fa-plus mr-2"></i>
            Create Campaign
          </Button>
        </div>
      )}

      {AlertDialogComponent}
    </div>
  );
}
