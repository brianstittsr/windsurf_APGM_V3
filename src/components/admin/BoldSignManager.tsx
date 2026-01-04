'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  PenTool,
  FileText,
  Settings,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Clock,
  Send,
  Download,
  Bell,
  Mail,
  Phone,
  Save,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Info,
} from 'lucide-react';

interface BoldSignTemplate {
  id: string;
  templateId: string;
  templateName: string;
  description: string;
  category: 'consent' | 'health' | 'aftercare' | 'policy' | 'other';
  procedures: string[];
  isRequired: boolean;
  order: number;
  isActive: boolean;
}

interface BoldSignConfig {
  apiKey: string;
  webhookSecret: string;
  notificationEmail: string;
  notificationPhone: string;
  reminderSchedule: {
    firstReminder: number;
    secondReminder: number;
    finalReminder: number;
  };
}

const DEFAULT_PROCEDURES = [
  'Microblading',
  'Powder Brows',
  'Combo Brows',
  'Lip Blush',
  'Eyeliner',
  'Touch Up',
  'Consultation',
];

const CATEGORY_LABELS: Record<string, string> = {
  consent: 'Consent Form',
  health: 'Health Questionnaire',
  aftercare: 'Aftercare Agreement',
  policy: 'Policy Document',
  other: 'Other',
};

export default function BoldSignManager() {
  const [activeTab, setActiveTab] = useState<'config' | 'templates' | 'documents'>('config');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  
  const [config, setConfig] = useState<BoldSignConfig>({
    apiKey: '',
    webhookSecret: '',
    notificationEmail: 'Victoria@aprettygirllatter.com',
    notificationPhone: '919-441-0932',
    reminderSchedule: {
      firstReminder: 24,
      secondReminder: 48,
      finalReminder: 24,
    },
  });

  const [templates, setTemplates] = useState<BoldSignTemplate[]>([
    {
      id: '1',
      templateId: '',
      templateName: 'PMU Consent Form',
      description: 'General consent form for all PMU procedures',
      category: 'consent',
      procedures: ['Microblading', 'Powder Brows', 'Combo Brows'],
      isRequired: true,
      order: 1,
      isActive: true,
    },
    {
      id: '2',
      templateId: '',
      templateName: 'Health Questionnaire',
      description: 'Medical history and health screening',
      category: 'health',
      procedures: ['Microblading', 'Powder Brows', 'Combo Brows', 'Lip Blush', 'Eyeliner', 'Touch Up'],
      isRequired: true,
      order: 2,
      isActive: true,
    },
    {
      id: '3',
      templateId: '',
      templateName: 'Lip Blush Consent Form',
      description: 'Specific consent for lip procedures',
      category: 'consent',
      procedures: ['Lip Blush'],
      isRequired: true,
      order: 3,
      isActive: true,
    },
    {
      id: '4',
      templateId: '',
      templateName: 'Aftercare Agreement',
      description: 'Post-procedure care instructions acknowledgment',
      category: 'aftercare',
      procedures: ['Microblading', 'Powder Brows', 'Combo Brows', 'Lip Blush', 'Eyeliner'],
      isRequired: true,
      order: 4,
      isActive: true,
    },
  ]);

  const [editingTemplate, setEditingTemplate] = useState<BoldSignTemplate | null>(null);

  const handleSaveConfig = async () => {
    if (!config.apiKey) {
      setMessage({ type: 'error', text: 'API Key is required' });
      return;
    }

    setSaving(true);
    try {
      // TODO: Save to Firestore
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'BoldSign configuration saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!config.apiKey) {
      setMessage({ type: 'error', text: 'Please enter an API Key first' });
      return;
    }

    setLoading(true);
    try {
      // Test BoldSign API connection by fetching templates
      const response = await fetch('/api/boldsign/templates', {
        method: 'GET',
        headers: {
          'x-boldsign-api-key': config.apiKey,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: `Successfully connected to BoldSign! Found ${data.templates?.length || 0} templates.` });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: `Failed to connect: ${error.error || 'Unknown error'}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to connect to BoldSign. Check your API key.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncTemplates = async () => {
    if (!config.apiKey) {
      setMessage({ type: 'error', text: 'Please configure API Key first' });
      return;
    }

    setLoading(true);
    try {
      // Fetch templates from BoldSign API
      const response = await fetch('/api/boldsign/templates', {
        method: 'GET',
        headers: {
          'x-boldsign-api-key': config.apiKey,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch templates');
      }

      const data = await response.json();
      
      if (data.templates && data.templates.length > 0) {
        // Map BoldSign templates to our format
        const syncedTemplates: BoldSignTemplate[] = data.templates.map((t: any, index: number) => ({
          id: t.templateId,
          templateId: t.templateId,
          templateName: t.templateName,
          description: t.description || `Created by ${t.createdBy}`,
          category: 'consent' as const,
          procedures: [], // User will map these
          isRequired: true,
          order: index + 1,
          isActive: true,
        }));

        setTemplates(syncedTemplates);
        setMessage({ type: 'success', text: `Synced ${syncedTemplates.length} templates from BoldSign. Now map them to procedures.` });
      } else {
        setMessage({ type: 'info', text: 'No templates found in BoldSign. Create templates in BoldSign first.' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to sync templates from BoldSign' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTemplate = (id: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ));
  };

  const handleUpdateTemplate = (template: BoldSignTemplate) => {
    setTemplates(prev => prev.map(t => 
      t.id === template.id ? template : t
    ));
    setEditingTemplate(null);
    setMessage({ type: 'success', text: 'Template updated successfully' });
  };

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/webhooks/boldsign`
    : '/api/webhooks/boldsign';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
            <PenTool className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">BoldSign Forms</h2>
            <p className="text-gray-500">Manage electronic signatures for PMU consent forms</p>
          </div>
        </div>
        <a 
          href="https://developers.boldsign.com/api-overview/getting-started/?region=us" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <ExternalLink className="h-4 w-4" />
          API Documentation
        </a>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> :
           message.type === 'error' ? <AlertTriangle className="h-5 w-5" /> :
           <Info className="h-5 w-5" />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-auto">×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { id: 'config', label: 'Configuration', icon: Settings },
            { id: 'templates', label: 'Form Templates', icon: FileText },
            { id: 'documents', label: 'Sent Documents', icon: Send },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div className="space-y-6">
          {/* API Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-400" />
              API Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  BoldSign API Key *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={config.apiKey}
                      onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                      placeholder="Enter your BoldSign API key"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <Button
                    onClick={handleTestConnection}
                    disabled={loading || !config.apiKey}
                    variant="outline"
                  >
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Test Connection'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from{' '}
                  <a href="https://app.boldsign.com/settings/api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    BoldSign Settings → API
                  </a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL (for BoldSign configuration)
                </label>
                <div className="flex gap-2">
                  <Input
                    value={webhookUrl}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(webhookUrl);
                      setMessage({ type: 'success', text: 'Webhook URL copied to clipboard!' });
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Add this URL in BoldSign → Settings → Webhooks
                </p>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-400" />
              Admin Notifications
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Victoria will be notified via GHL when forms are signed.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Notification Email
                </label>
                <Input
                  type="email"
                  value={config.notificationEmail}
                  onChange={(e) => setConfig({ ...config, notificationEmail: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Notification Phone
                </label>
                <Input
                  type="tel"
                  value={config.notificationPhone}
                  onChange={(e) => setConfig({ ...config, notificationPhone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Reminder Schedule */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              Reminder Schedule (via GHL)
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Reminder (Email)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config.reminderSchedule.firstReminder}
                    onChange={(e) => setConfig({
                      ...config,
                      reminderSchedule: { ...config.reminderSchedule, firstReminder: parseInt(e.target.value) || 24 }
                    })}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-500">hours after send</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Second Reminder (SMS)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config.reminderSchedule.secondReminder}
                    onChange={(e) => setConfig({
                      ...config,
                      reminderSchedule: { ...config.reminderSchedule, secondReminder: parseInt(e.target.value) || 48 }
                    })}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-500">hours after send</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Final Reminder (Both)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={config.reminderSchedule.finalReminder}
                    onChange={(e) => setConfig({
                      ...config,
                      reminderSchedule: { ...config.reminderSchedule, finalReminder: parseInt(e.target.value) || 24 }
                    })}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-500">hours before appt</span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveConfig} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Configuration
            </Button>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Sync Button */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Map BoldSign templates to procedures. Forms will be automatically sent based on booked services.
            </p>
            <Button onClick={handleSyncTemplates} disabled={loading} variant="outline">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Sync from BoldSign
            </Button>
          </div>

          {/* Templates List */}
          <div className="space-y-4">
            {templates.map(template => (
              <div 
                key={template.id}
                className={`bg-white rounded-xl border p-4 ${
                  template.isActive ? 'border-gray-200' : 'border-gray-100 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={template.isActive}
                        onChange={() => handleToggleTemplate(template.id)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <h4 className="font-semibold text-gray-900">{template.templateName}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        template.category === 'consent' ? 'bg-blue-100 text-blue-700' :
                        template.category === 'health' ? 'bg-green-100 text-green-700' :
                        template.category === 'aftercare' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {CATEGORY_LABELS[template.category]}
                      </span>
                      {template.isRequired && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 ml-7">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2 ml-7">
                      {template.procedures.map(proc => (
                        <span key={proc} className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                          {proc}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Multi-Procedure Logic
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              When a client books multiple procedures (e.g., Microblading + Lip Blush), the system will:
            </p>
            <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
              <li>Send shared forms (like Health Questionnaire) only once</li>
              <li>Send procedure-specific forms for each service</li>
              <li>Combine all forms into a single signing session</li>
            </ul>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Yet</h3>
            <p className="text-gray-500 mb-4">
              Documents will appear here once forms are sent to clients for signature.
            </p>
            <p className="text-sm text-gray-400">
              Configure your API key and templates first, then documents will be sent automatically when bookings are created.
            </p>
          </div>

          {/* Status Legend */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-700 mb-3">Document Status Legend</h4>
            <div className="grid grid-cols-5 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span>Sent</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span>Viewed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span>Signed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span>Declined</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                <span>Expired</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Template Mapping</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <Input
                  value={editingTemplate.templateName}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, templateName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BoldSign Template ID</label>
                <Input
                  value={editingTemplate.templateId}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, templateId: e.target.value })}
                  placeholder="Paste template ID from BoldSign"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={editingTemplate.category}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="consent">Consent Form</option>
                  <option value="health">Health Questionnaire</option>
                  <option value="aftercare">Aftercare Agreement</option>
                  <option value="policy">Policy Document</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applies to Procedures</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {DEFAULT_PROCEDURES.map(proc => (
                    <label key={proc} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingTemplate.procedures.includes(proc)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditingTemplate({
                              ...editingTemplate,
                              procedures: [...editingTemplate.procedures, proc]
                            });
                          } else {
                            setEditingTemplate({
                              ...editingTemplate,
                              procedures: editingTemplate.procedures.filter(p => p !== proc)
                            });
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm">{proc}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingTemplate.isRequired}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, isRequired: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600"
                />
                <label className="text-sm text-gray-700">Required (must be signed before appointment)</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingTemplate(null)}>Cancel</Button>
              <Button onClick={() => handleUpdateTemplate(editingTemplate)} className="bg-blue-600 hover:bg-blue-700">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
