'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ============================================================================
// Types
// ============================================================================

interface MessageTemplate {
  name: string;
  status: string;
  category: string;
  language: string;
}

interface WhatsAppMessage {
  id: string;
  from: string;
  senderName: string;
  content: string;
  type: string;
  timestamp: Date;
  deliveryStatus?: string;
}

interface ConversationStats {
  totalSent: number;
  delivered: number;
  read: number;
  failed: number;
}

interface AIReviewResult {
  score: number;
  analysis: {
    clarity: { score: number; feedback: string };
    tone: { score: number; feedback: string };
    callToAction: { score: number; feedback: string };
    length: { score: number; feedback: string };
    compliance: { score: number; feedback: string };
  };
  suggestions: string[];
  improvedVersion: string;
  warnings: string[];
}

// ============================================================================
// Component
// ============================================================================

export default function WhatsAppDashboard() {
  const [activeTab, setActiveTab] = useState<'send' | 'templates' | 'messages' | 'settings'>('send');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Send message form
  const [messageType, setMessageType] = useState<'template' | 'custom'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [clientName, setClientName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  // Templates
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [pmuTemplates, setPmuTemplates] = useState<Record<string, any>>({});

  // Messages
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);

  // AI Review
  const [aiReview, setAiReview] = useState<AIReviewResult | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showAiReview, setShowAiReview] = useState(false);

  // --------------------------------------------------------------------------
  // Load Data
  // --------------------------------------------------------------------------

  useEffect(() => {
    loadPmuTemplates();
  }, []);

  const loadPmuTemplates = async () => {
    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_pmu_templates' })
      });
      const data = await res.json();
      if (data.success) {
        setPmuTemplates(data.templates);
      }
    } catch (err) {
      console.error('Error loading PMU templates:', err);
    }
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_templates' })
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates || []);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // AI Review
  // --------------------------------------------------------------------------

  const reviewWithAI = async () => {
    // Get the message text to review
    let messageText = '';
    
    if (selectedTemplate === 'custom') {
      messageText = customMessage;
    } else if (selectedTemplate && pmuTemplates[selectedTemplate]) {
      const template = pmuTemplates[selectedTemplate];
      const bodyComponent = template.components?.find((c: any) => c.type === 'BODY');
      if (bodyComponent) {
        messageText = bodyComponent.text
          ?.replace('{{1}}', clientName || '[Client Name]')
          .replace('{{2}}', serviceName || '[Service]')
          .replace('{{3}}', appointmentDate || '[Date]')
          .replace('{{4}}', appointmentTime || '[Time]') || '';
      }
    }

    if (!messageText) {
      setError('Please select a template or enter a custom message to review');
      return;
    }

    setReviewLoading(true);
    setAiReview(null);

    try {
      const res = await fetch('/api/ai/review-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageText,
          messageType: selectedTemplate || 'custom',
          businessName: 'A Pretty Girl Matter PMU'
        })
      });
      const data = await res.json();

      if (data.success) {
        setAiReview(data.review);
        setShowAiReview(true);
      } else {
        throw new Error(data.error || 'Failed to analyze message');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setReviewLoading(false);
    }
  };

  const applyImprovedVersion = () => {
    if (aiReview?.improvedVersion && selectedTemplate === 'custom') {
      setCustomMessage(aiReview.improvedVersion);
      setSuccess('Improved version applied!');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  // --------------------------------------------------------------------------
  // Send Message
  // --------------------------------------------------------------------------

  const sendMessage = async () => {
    if (!recipientPhone) {
      setError('Please enter a phone number');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let action = '';
      let payload: any = { to: recipientPhone };

      switch (selectedTemplate) {
        case 'appointment_confirmation':
          action = 'appointment_confirmation';
          payload = { ...payload, clientName, serviceName, date: appointmentDate, time: appointmentTime };
          break;
        case 'appointment_reminder':
          action = 'appointment_reminder';
          payload = { ...payload, clientName, serviceName, date: appointmentDate, time: appointmentTime };
          break;
        case 'booking_deposit':
          action = 'booking_deposit';
          payload = { ...payload, clientName, serviceName, date: appointmentDate, time: appointmentTime };
          break;
        case 'aftercare':
          action = 'aftercare';
          payload = { ...payload, clientName, serviceName };
          break;
        case 'touchup_reminder':
          action = 'touchup_reminder';
          payload = { ...payload, clientName, weeksSince: '6', serviceName };
          break;
        case 'review_request':
          action = 'review_request';
          payload = { ...payload, clientName, serviceName };
          break;
        case 'welcome':
          action = 'welcome';
          payload = { ...payload, clientName };
          break;
        case 'custom':
          action = 'send_text';
          payload = { ...payload, text: customMessage };
          break;
        default:
          setError('Please select a message template');
          setLoading(false);
          return;
      }

      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload })
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(`Message sent successfully! ID: ${data.messageId}`);
        // Clear form
        setRecipientPhone('');
        setClientName('');
        setServiceName('');
        setAppointmentDate('');
        setAppointmentTime('');
        setCustomMessage('');
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  const tabs = [
    { id: 'send', label: 'Send Message', icon: 'fa-paper-plane' },
    { id: 'templates', label: 'Templates', icon: 'fa-file-alt' },
    { id: 'messages', label: 'Messages', icon: 'fa-inbox' },
    { id: 'settings', label: 'Settings', icon: 'fa-cog' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <i className="fab fa-whatsapp text-green-500"></i>
            WhatsApp Business
          </h2>
          <p className="text-gray-500 text-sm mt-1">Send messages and manage templates</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'templates') loadTemplates();
              }}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <i className={`fas ${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Alerts */}
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
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <i className="fas fa-check-circle text-green-500 mt-0.5"></i>
            <p className="text-green-700 text-sm">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-600">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Send Message Tab */}
      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Send Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-500 to-emerald-600">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <i className="fab fa-whatsapp"></i>
                  Send WhatsApp Message
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {/* Recipient */}
                <div className="space-y-2">
                  <Label>Recipient Phone Number</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      +1
                    </span>
                    <Input
                      type="tel"
                      className="rounded-l-none"
                      placeholder="4045551234"
                      value={recipientPhone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecipientPhone(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Enter 10-digit US phone number</p>
                </div>

                {/* Template Selection */}
                <div className="space-y-2">
                  <Label>Message Template</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                  >
                    <option value="">Select a template...</option>
                    <optgroup label="Appointments">
                      <option value="appointment_confirmation">✅ Appointment Confirmation</option>
                      <option value="appointment_reminder">⏰ Appointment Reminder (24hr)</option>
                      <option value="booking_deposit">💰 Booking Deposit Request</option>
                    </optgroup>
                    <optgroup label="Post-Service">
                      <option value="aftercare">💝 Aftercare Instructions</option>
                      <option value="touchup_reminder">✨ Touch-Up Reminder</option>
                      <option value="review_request">⭐ Review Request</option>
                    </optgroup>
                    <optgroup label="Marketing">
                      <option value="welcome">👋 Welcome Message</option>
                    </optgroup>
                    <optgroup label="Custom">
                      <option value="custom">📝 Custom Message</option>
                    </optgroup>
                  </select>
                </div>

                {/* Dynamic Fields based on template */}
                {selectedTemplate && selectedTemplate !== 'custom' && (
                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="space-y-2">
                      <Label>Client Name</Label>
                      <Input
                        type="text"
                        placeholder="Sarah"
                        value={clientName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientName(e.target.value)}
                      />
                    </div>

                    {['appointment_confirmation', 'appointment_reminder', 'booking_deposit', 'aftercare', 'touchup_reminder', 'review_request'].includes(selectedTemplate) && (
                      <div className="space-y-2">
                        <Label>Service Name</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={serviceName}
                          onChange={(e) => setServiceName(e.target.value)}
                        >
                          <option value="">Select service...</option>
                          <option value="Microblading">Microblading</option>
                          <option value="Powder Brows">Powder Brows</option>
                          <option value="Lip Blush">Lip Blush</option>
                          <option value="Permanent Eyeliner">Permanent Eyeliner</option>
                        </select>
                      </div>
                    )}

                    {['appointment_confirmation', 'appointment_reminder', 'booking_deposit'].includes(selectedTemplate) && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Appointment Date</Label>
                          <Input
                            type="date"
                            value={appointmentDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAppointmentDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Appointment Time</Label>
                          <Input
                            type="time"
                            value={appointmentTime}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAppointmentTime(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Custom Message */}
                {selectedTemplate === 'custom' && (
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Type your message..."
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                    />
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                      <i className="fas fa-info-circle mr-1"></i>
                      Custom messages can only be sent within 24 hours of the customer's last message.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-50"
                    onClick={reviewWithAI}
                    disabled={reviewLoading || !selectedTemplate}
                  >
                    {reviewLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-robot mr-2"></i>
                        AI Review & Recommend
                      </>
                    )}
                  </Button>
                </div>

                <Button
                  size="lg"
                  className="w-full bg-green-500 hover:bg-green-600 text-lg py-6"
                  onClick={sendMessage}
                  disabled={loading || !recipientPhone || !selectedTemplate}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fab fa-whatsapp mr-2"></i>
                      Send WhatsApp Message
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Template Preview & AI Review */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">Preview</h3>
              </div>
              <div className="p-6">
                {selectedTemplate && pmuTemplates[selectedTemplate] ? (
                  <div className="bg-[#e5ddd5] p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                        <i className="fab fa-whatsapp text-sm"></i>
                      </div>
                      <span className="font-medium text-gray-900 text-sm">A Pretty Girl Matter</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      {pmuTemplates[selectedTemplate].components.map((comp: any, idx: number) => (
                        <div key={idx}>
                          {comp.type === 'HEADER' && comp.text && (
                            <p className="font-bold text-gray-900 mb-2">{comp.text}</p>
                          )}
                          {comp.type === 'BODY' && (
                            <p className="text-gray-700 text-sm whitespace-pre-line mb-2">
                              {comp.text
                                ?.replace('{{1}}', clientName || '[Client Name]')
                                .replace('{{2}}', serviceName || '[Service]')
                                .replace('{{3}}', appointmentDate || '[Date]')
                                .replace('{{4}}', appointmentTime || '[Time]')}
                            </p>
                          )}
                          {comp.type === 'FOOTER' && (
                            <p className="text-gray-500 text-xs">{comp.text}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedTemplate === 'custom' ? (
                  <div className="bg-[#e5ddd5] p-4 rounded-lg">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <p className="text-gray-700 text-sm whitespace-pre-line">{customMessage || 'Your message will appear here...'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-center text-sm">
                    Select a template to see preview
                  </p>
                )}
              </div>
            </div>

            {/* AI Review Results */}
            {showAiReview && aiReview && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-blue-50 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <i className="fas fa-robot text-blue-500"></i>
                    AI Analysis
                  </h3>
                  <button 
                    className="p-1 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowAiReview(false)}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  {/* Overall Score */}
                  <div className={`text-center p-4 rounded-lg ${getScoreBgColor(aiReview.score)}`}>
                    <p className={`text-4xl font-bold ${getScoreColor(aiReview.score)}`}>
                      {aiReview.score}/100
                    </p>
                    <p className="text-gray-500 text-sm">Overall Score</p>
                  </div>

                  {/* Analysis Breakdown */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Analysis</h4>
                    {Object.entries(aiReview.analysis).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${value.score >= 80 ? 'bg-green-100 text-green-700' : value.score >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {value.score}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{value.feedback}</p>
                      </div>
                    ))}
                  </div>

                  {/* Warnings */}
                  {aiReview.warnings.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <h4 className="font-medium text-amber-800 flex items-center gap-2 mb-2">
                        <i className="fas fa-exclamation-triangle"></i>
                        Warnings
                      </h4>
                      <ul className="space-y-1">
                        {aiReview.warnings.map((warning, idx) => (
                          <li key={idx} className="text-sm text-amber-700">• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {aiReview.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <i className="fas fa-lightbulb text-yellow-500"></i>
                        Suggestions
                      </h4>
                      <ul className="space-y-1">
                        {aiReview.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <i className="fas fa-check-circle text-blue-500 mt-0.5"></i>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improved Version */}
                  {aiReview.improvedVersion && selectedTemplate === 'custom' && (
                    <div className="border-t border-gray-200 pt-4 space-y-3">
                      <h4 className="font-medium text-gray-900 flex items-center gap-2">
                        <i className="fas fa-magic text-green-500"></i>
                        Improved Version
                      </h4>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 whitespace-pre-line">
                        {aiReview.improvedVersion}
                      </div>
                      <Button 
                        size="sm"
                        className="w-full bg-green-500 hover:bg-green-600"
                        onClick={applyImprovedVersion}
                      >
                        <i className="fas fa-check mr-2"></i>
                        Apply Improved Version
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-green-500 flex items-center justify-between">
            <h3 className="font-semibold text-white">Message Templates</h3>
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={loadTemplates}
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh
            </Button>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* PMU Templates */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">PMU Templates (Pre-defined)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(pmuTemplates).map(([key, template]: [string, any]) => (
                      <div key={key} className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-medium text-gray-900 text-sm">{template.name}</h5>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${template.category === 'UTILITY' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                            {template.category}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs line-clamp-3">
                          {template.components.find((c: any) => c.type === 'BODY')?.text?.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meta Templates */}
                {templates.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Approved Templates (Meta)</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Language</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {templates.map((template, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 text-gray-900">{template.name}</td>
                              <td className="py-3 px-4 text-gray-600">{template.category}</td>
                              <td className="py-3 px-4 text-gray-600">{template.language}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${template.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {template.status}
                                </span>
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
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-green-500">
            <h3 className="font-semibold text-white">Recent Messages</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-inbox text-4xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Yet</h3>
              <p className="text-gray-500 text-sm">Messages will appear here when received via webhook.</p>
              <p className="text-gray-400 text-xs mt-2">Configure your webhook URL in Meta Business Suite.</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-green-500">
            <h3 className="font-semibold text-white">WhatsApp Business Configuration</h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Setup Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 flex items-center gap-2 mb-3">
                <i className="fas fa-info-circle"></i>
                Setup Instructions
              </h4>
              <ol className="space-y-2 text-sm text-blue-700 list-decimal list-inside">
                <li>Create a Meta Business Account at <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">business.facebook.com</a></li>
                <li>Set up WhatsApp Business API in Meta Business Suite</li>
                <li>Create a System User and generate an Access Token</li>
                <li>Add the following environment variables to your <code className="bg-blue-100 px-1 rounded">.env.local</code> file</li>
              </ol>
            </div>

            {/* Environment Variables */}
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <p className="text-gray-400"># WhatsApp Business API</p>
              <p>WHATSAPP_ACCESS_TOKEN=<span className="text-green-400">your_access_token</span></p>
              <p>WHATSAPP_PHONE_NUMBER_ID=<span className="text-green-400">your_phone_number_id</span></p>
              <p>WHATSAPP_BUSINESS_ACCOUNT_ID=<span className="text-green-400">your_business_account_id</span></p>
              <p>WHATSAPP_WEBHOOK_VERIFY_TOKEN=<span className="text-green-400">pmu_whatsapp_verify</span></p>
            </div>

            {/* Webhook Configuration */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Webhook Configuration</h4>
              <p className="text-gray-500 text-sm">Configure this webhook URL in Meta Business Suite:</p>
              <div className="flex">
                <Input
                  type="text"
                  className="rounded-r-none font-mono text-sm"
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/whatsapp/webhook`}
                  readOnly
                />
                <Button
                  variant="outline"
                  className="rounded-l-none border-l-0"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/api/whatsapp/webhook`);
                    setSuccess('Webhook URL copied to clipboard!');
                  }}
                >
                  <i className="fas fa-copy"></i>
                </Button>
              </div>
              <p className="text-gray-500 text-xs">
                Verify Token: <code className="bg-gray-100 px-1 rounded">pmu_whatsapp_verify</code>
              </p>
            </div>

            <hr className="border-gray-200" />

            {/* Template Submission */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Template Submission</h4>
              <p className="text-gray-500 text-sm">
                Message templates must be submitted to Meta for approval before use.
                Templates are reviewed within 24-48 hours.
              </p>
              <a 
                href="https://business.facebook.com/wa/manage/message-templates/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
              >
                <i className="fas fa-external-link-alt"></i>
                Manage Templates in Meta
              </a>
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
            This feature requires WhatsApp Business API access. Set <code className="bg-blue-100 px-1 rounded">WHATSAPP_ACCESS_TOKEN</code>, <code className="bg-blue-100 px-1 rounded">WHATSAPP_PHONE_NUMBER_ID</code>, and <code className="bg-blue-100 px-1 rounded">WHATSAPP_BUSINESS_ACCOUNT_ID</code> environment variables.
          </p>
        </div>
      </div>
    </div>
  );
}
