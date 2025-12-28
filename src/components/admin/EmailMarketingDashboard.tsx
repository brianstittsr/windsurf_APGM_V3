'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAlertDialog } from '@/components/ui/alert-dialog';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent' | 'paused';
  scheduledAt?: string;
  sentAt?: string;
  recipients: number;
  opens: number;
  clicks: number;
  createdAt: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'welcome' | 'promotional' | 'reminder' | 'followup' | 'custom';
  thumbnail?: string;
}

interface Subscriber {
  id: string;
  email: string;
  name: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  tags: string[];
  subscribedAt: string;
  lastEmailAt?: string;
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to A Pretty Girl Matter! 💕',
    content: `<h1>Welcome, {name}!</h1>
<p>Thank you for joining the A Pretty Girl Matter family! We're thrilled to have you.</p>
<p>As a new member, enjoy <strong>15% off</strong> your first appointment with code: <strong>WELCOME15</strong></p>
<p>Ready to wake up flawless every day?</p>
<a href="{booking_link}" style="background: #AD6269; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Book Your Appointment</a>`,
    category: 'welcome'
  },
  {
    id: 'reminder',
    name: 'Appointment Reminder',
    subject: 'Your Appointment is Tomorrow! ⏰',
    content: `<h1>Hi {name}!</h1>
<p>Just a friendly reminder that your appointment is scheduled for:</p>
<p><strong>Date:</strong> {date}<br><strong>Time:</strong> {time}<br><strong>Service:</strong> {service}</p>
<h3>Pre-Appointment Tips:</h3>
<ul>
<li>Avoid caffeine and alcohol 24 hours before</li>
<li>Don't take blood thinners</li>
<li>Come with clean, makeup-free skin</li>
</ul>
<p>See you soon!</p>`,
    category: 'reminder'
  },
  {
    id: 'followup',
    name: 'Post-Appointment Follow-up',
    subject: 'How are your brows healing? 🌸',
    content: `<h1>Hi {name}!</h1>
<p>It's been a week since your {service} appointment, and we wanted to check in!</p>
<p>Remember to follow your aftercare instructions for the best results.</p>
<p>If you have any questions about the healing process, don't hesitate to reach out.</p>
<p>We'd love to hear about your experience! Would you mind leaving us a review?</p>
<a href="{review_link}" style="background: #AD6269; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Leave a Review</a>`,
    category: 'followup'
  },
  {
    id: 'promo',
    name: 'Special Offer',
    subject: 'Exclusive Offer Just for You! 🎉',
    content: `<h1>Special Offer for {name}!</h1>
<p>We miss you! It's been a while since your last visit, and we have something special for you.</p>
<p>Enjoy <strong>$50 OFF</strong> your next appointment when you book this week!</p>
<p>Use code: <strong>COMEBACK50</strong></p>
<a href="{booking_link}" style="background: #AD6269; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Book Now & Save</a>
<p><small>Offer expires in 7 days.</small></p>`,
    category: 'promotional'
  }
];

export default function EmailMarketingDashboard() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates' | 'subscribers' | 'compose'>('campaigns');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const { showAlert, showConfirm, AlertDialogComponent } = useAlertDialog();

  // Compose form
  const [composeForm, setComposeForm] = useState({
    name: '',
    subject: '',
    content: '',
    sendTo: 'all' as 'all' | 'active' | 'custom',
    scheduledAt: ''
  });

  // Stats
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    activeSubscribers: 0,
    totalCampaigns: 0,
    avgOpenRate: 0,
    avgClickRate: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const db = getDb();

      // Load campaigns
      const campaignsRef = collection(db, 'emailCampaigns');
      const campaignsSnapshot = await getDocs(query(campaignsRef, orderBy('createdAt', 'desc')));
      const loadedCampaigns: EmailCampaign[] = [];
      campaignsSnapshot.forEach((doc) => {
        const data = doc.data();
        loadedCampaigns.push({
          id: doc.id,
          name: data.name || 'Untitled Campaign',
          subject: data.subject || '',
          content: data.content || '',
          status: data.status || 'draft',
          scheduledAt: data.scheduledAt,
          sentAt: data.sentAt,
          recipients: data.recipients || 0,
          opens: data.opens || 0,
          clicks: data.clicks || 0,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      });
      setCampaigns(loadedCampaigns);

      // Load subscribers from users collection
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const loadedSubscribers: Subscriber[] = [];
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        const email = data.email || data.profile?.email;
        if (email) {
          loadedSubscribers.push({
            id: doc.id,
            email: email,
            name: data.displayName || data.profile?.firstName || email.split('@')[0],
            status: data.emailOptOut ? 'unsubscribed' : 'active',
            tags: data.tags || [],
            subscribedAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            lastEmailAt: data.lastEmailAt
          });
        }
      });
      setSubscribers(loadedSubscribers);

      // Calculate stats
      const activeCount = loadedSubscribers.filter(s => s.status === 'active').length;
      const totalOpens = loadedCampaigns.reduce((sum, c) => sum + c.opens, 0);
      const totalClicks = loadedCampaigns.reduce((sum, c) => sum + c.clicks, 0);
      const totalRecipients = loadedCampaigns.reduce((sum, c) => sum + c.recipients, 0);

      setStats({
        totalSubscribers: loadedSubscribers.length,
        activeSubscribers: activeCount,
        totalCampaigns: loadedCampaigns.length,
        avgOpenRate: totalRecipients > 0 ? (totalOpens / totalRecipients) * 100 : 0,
        avgClickRate: totalRecipients > 0 ? (totalClicks / totalRecipients) * 100 : 0
      });

    } catch (error) {
      console.error('Error loading email data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCampaign = async (status: 'draft' | 'scheduled') => {
    if (!composeForm.name || !composeForm.subject || !composeForm.content) {
      await showAlert({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'warning'
      });
      return;
    }

    try {
      const db = getDb();
      const campaignData = {
        name: composeForm.name,
        subject: composeForm.subject,
        content: composeForm.content,
        status: status,
        scheduledAt: composeForm.scheduledAt || null,
        recipients: stats.activeSubscribers,
        opens: 0,
        clicks: 0,
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'emailCampaigns'), campaignData);

      await showAlert({
        title: status === 'draft' ? 'Draft Saved' : 'Campaign Scheduled',
        description: status === 'draft' 
          ? 'Your campaign has been saved as a draft.'
          : `Your campaign will be sent on ${new Date(composeForm.scheduledAt).toLocaleString()}`,
        variant: 'success'
      });

      setComposeForm({ name: '', subject: '', content: '', sendTo: 'all', scheduledAt: '' });
      setShowComposer(false);
      loadData();
    } catch (error) {
      console.error('Error saving campaign:', error);
      await showAlert({
        title: 'Error',
        description: 'Failed to save campaign',
        variant: 'destructive'
      });
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Campaign',
      description: 'Are you sure you want to delete this campaign?',
      confirmText: 'Delete',
      variant: 'destructive'
    });

    if (!confirmed) return;

    try {
      const db = getDb();
      await deleteDoc(doc(db, 'emailCampaigns', campaignId));
      await showAlert({
        title: 'Campaign Deleted',
        description: 'The campaign has been deleted.',
        variant: 'success'
      });
      loadData();
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const useTemplate = (template: EmailTemplate) => {
    setComposeForm({
      ...composeForm,
      name: template.name,
      subject: template.subject,
      content: template.content
    });
    setShowComposer(true);
    setActiveTab('compose');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-envelope text-[#AD6269]"></i>
            Email Marketing
          </h2>
          <p className="text-gray-500 text-sm mt-1">Create and manage email campaigns</p>
        </div>
        <Button
          className="bg-[#AD6269] hover:bg-[#9d5860]"
          onClick={() => {
            setShowComposer(true);
            setActiveTab('compose');
          }}
        >
          <i className="fas fa-plus mr-2"></i>
          New Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fas fa-users text-blue-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubscribers}</p>
              <p className="text-xs text-gray-500">Total Subscribers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-check-circle text-green-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeSubscribers}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <i className="fas fa-paper-plane text-purple-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
              <p className="text-xs text-gray-500">Campaigns</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <i className="fas fa-envelope-open text-yellow-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.avgOpenRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">Avg Open Rate</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <i className="fas fa-mouse-pointer text-pink-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.avgClickRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">Avg Click Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {[
          { id: 'campaigns', label: 'Campaigns', icon: 'fas fa-paper-plane' },
          { id: 'templates', label: 'Templates', icon: 'fas fa-file-alt' },
          { id: 'subscribers', label: 'Subscribers', icon: 'fas fa-users' },
          { id: 'compose', label: 'Compose', icon: 'fas fa-edit' }
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

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-paper-plane text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 mb-4">No campaigns yet</p>
              <Button
                className="bg-[#AD6269] hover:bg-[#9d5860]"
                onClick={() => setActiveTab('templates')}
              >
                Start with a Template
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipients</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opens</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{campaign.name}</p>
                        <p className="text-sm text-gray-500">{campaign.subject}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{campaign.recipients}</td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{campaign.opens}</span>
                      <span className="text-gray-400 text-sm ml-1">
                        ({campaign.recipients > 0 ? ((campaign.opens / campaign.recipients) * 100).toFixed(1) : 0}%)
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{campaign.clicks}</span>
                      <span className="text-gray-400 text-sm ml-1">
                        ({campaign.recipients > 0 ? ((campaign.clicks / campaign.recipients) * 100).toFixed(1) : 0}%)
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="text-gray-400 hover:text-blue-600">
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="text-gray-400 hover:text-green-600">
                          <i className="fas fa-copy"></i>
                        </button>
                        <button
                          className="text-gray-400 hover:text-red-600"
                          onClick={() => deleteCampaign(campaign.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-32 bg-gradient-to-br from-[#AD6269] to-pink-400 flex items-center justify-center">
                <i className="fas fa-envelope text-4xl text-white/50"></i>
              </div>
              <div className="p-4">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
                  {template.category}
                </span>
                <h3 className="font-semibold text-gray-900 mt-2">{template.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.subject}</p>
                <Button
                  className="w-full mt-4 bg-[#AD6269] hover:bg-[#9d5860]"
                  onClick={() => useTemplate(template)}
                >
                  Use Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <Input
              placeholder="Search subscribers..."
              className="max-w-xs"
            />
            <Button variant="outline">
              <i className="fas fa-download mr-2"></i>
              Export
            </Button>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscriber</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscribed</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subscribers.slice(0, 20).map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{subscriber.name}</p>
                      <p className="text-sm text-gray-500">{subscriber.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      subscriber.status === 'active' ? 'bg-green-100 text-green-800' :
                      subscriber.status === 'unsubscribed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {subscriber.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(subscriber.subscribedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {subscriber.lastEmailAt ? new Date(subscriber.lastEmailAt).toLocaleDateString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Compose Tab */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Compose Email</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="campaignName">Campaign Name</Label>
                <Input
                  id="campaignName"
                  value={composeForm.name}
                  onChange={(e) => setComposeForm({ ...composeForm, name: e.target.value })}
                  placeholder="e.g., Holiday Special Offer"
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                  placeholder="e.g., Your Exclusive Holiday Discount Inside! 🎁"
                />
              </div>
              <div>
                <Label htmlFor="content">Email Content (HTML)</Label>
                <textarea
                  id="content"
                  value={composeForm.content}
                  onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent resize-none"
                  placeholder="<h1>Hello {name}!</h1>..."
                />
              </div>
              <div>
                <Label htmlFor="sendTo">Send To</Label>
                <select
                  id="sendTo"
                  value={composeForm.sendTo}
                  onChange={(e) => setComposeForm({ ...composeForm, sendTo: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                >
                  <option value="all">All Subscribers ({stats.totalSubscribers})</option>
                  <option value="active">Active Only ({stats.activeSubscribers})</option>
                  <option value="custom">Custom Segment</option>
                </select>
              </div>
              <div>
                <Label htmlFor="scheduledAt">Schedule (optional)</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={composeForm.scheduledAt}
                  onChange={(e) => setComposeForm({ ...composeForm, scheduledAt: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => saveCampaign('draft')}
                >
                  <i className="fas fa-save mr-2"></i>
                  Save Draft
                </Button>
                <Button
                  className="flex-1 bg-[#AD6269] hover:bg-[#9d5860]"
                  onClick={() => saveCampaign('scheduled')}
                >
                  <i className="fas fa-paper-plane mr-2"></i>
                  {composeForm.scheduledAt ? 'Schedule' : 'Send Now'}
                </Button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                <p className="text-sm text-gray-500">Subject: <span className="text-gray-900">{composeForm.subject || 'Your subject line'}</span></p>
              </div>
              <div 
                className="p-4 min-h-[300px] prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: composeForm.content || '<p class="text-gray-400">Your email content will appear here...</p>' 
                }}
              />
            </div>
          </div>
        </div>
      )}

      {AlertDialogComponent}
    </div>
  );
}
