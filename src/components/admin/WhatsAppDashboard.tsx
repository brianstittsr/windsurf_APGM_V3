'use client';

import React, { useState, useEffect } from 'react';

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

  return (
    <div className="whatsapp-dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="fab fa-whatsapp me-2 text-success"></i>
          WhatsApp Business
        </h2>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'send' ? 'active' : ''}`}
            onClick={() => setActiveTab('send')}
          >
            <i className="fas fa-paper-plane me-2"></i>
            Send Message
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => { setActiveTab('templates'); loadTemplates(); }}
          >
            <i className="fas fa-file-alt me-2"></i>
            Templates
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            <i className="fas fa-inbox me-2"></i>
            Messages
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fas fa-cog me-2"></i>
            Settings
          </button>
        </li>
      </ul>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}
      {success && (
        <div className="alert alert-success alert-dismissible fade show">
          <i className="fas fa-check-circle me-2"></i>
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
        </div>
      )}

      {/* Send Message Tab */}
      {activeTab === 'send' && (
        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Send WhatsApp Message</h5>
              </div>
              <div className="card-body">
                {/* Recipient */}
                <div className="mb-3">
                  <label className="form-label">Recipient Phone Number</label>
                  <div className="input-group">
                    <span className="input-group-text">+1</span>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="4045551234"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <small className="text-muted">Enter 10-digit US phone number</small>
                </div>

                {/* Template Selection */}
                <div className="mb-3">
                  <label className="form-label">Message Template</label>
                  <select
                    className="form-select"
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
                  <>
                    <div className="mb-3">
                      <label className="form-label">Client Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Sarah"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                      />
                    </div>

                    {['appointment_confirmation', 'appointment_reminder', 'booking_deposit', 'aftercare', 'touchup_reminder', 'review_request'].includes(selectedTemplate) && (
                      <div className="mb-3">
                        <label className="form-label">Service Name</label>
                        <select
                          className="form-select"
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
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Appointment Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={appointmentDate}
                            onChange={(e) => setAppointmentDate(e.target.value)}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Appointment Time</label>
                          <input
                            type="time"
                            className="form-control"
                            value={appointmentTime}
                            onChange={(e) => setAppointmentTime(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Custom Message */}
                {selectedTemplate === 'custom' && (
                  <div className="mb-3">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      placeholder="Type your message..."
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                    ></textarea>
                    <small className="text-muted">
                      Note: Custom messages can only be sent within 24 hours of the customer's last message.
                    </small>
                  </div>
                )}

                {/* Send Button */}
                <button
                  className="btn btn-success btn-lg w-100"
                  onClick={sendMessage}
                  disabled={loading || !recipientPhone || !selectedTemplate}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fab fa-whatsapp me-2"></i>
                      Send WhatsApp Message
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Template Preview */}
          <div className="col-md-4">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Preview</h5>
              </div>
              <div className="card-body">
                {selectedTemplate && pmuTemplates[selectedTemplate] ? (
                  <div className="whatsapp-preview bg-light p-3 rounded">
                    <div className="d-flex align-items-center mb-2">
                      <div className="bg-success text-white rounded-circle p-2 me-2">
                        <i className="fab fa-whatsapp"></i>
                      </div>
                      <strong>Atlanta Glamour PMU</strong>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm">
                      {pmuTemplates[selectedTemplate].components.map((comp: any, idx: number) => (
                        <div key={idx}>
                          {comp.type === 'HEADER' && comp.text && (
                            <p className="fw-bold mb-2">{comp.text}</p>
                          )}
                          {comp.type === 'BODY' && (
                            <p className="mb-2" style={{ whiteSpace: 'pre-line' }}>
                              {comp.text
                                ?.replace('{{1}}', clientName || '[Client Name]')
                                .replace('{{2}}', serviceName || '[Service]')
                                .replace('{{3}}', appointmentDate || '[Date]')
                                .replace('{{4}}', appointmentTime || '[Time]')}
                            </p>
                          )}
                          {comp.type === 'FOOTER' && (
                            <p className="text-muted small mb-0">{comp.text}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedTemplate === 'custom' ? (
                  <div className="whatsapp-preview bg-light p-3 rounded">
                    <div className="bg-white p-3 rounded shadow-sm">
                      <p style={{ whiteSpace: 'pre-line' }}>{customMessage || 'Your message will appear here...'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted text-center">
                    Select a template to see preview
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Message Templates</h5>
            <button className="btn btn-sm btn-outline-primary" onClick={loadTemplates}>
              <i className="fas fa-sync-alt me-2"></i>
              Refresh
            </button>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary"></div>
              </div>
            ) : (
              <>
                {/* PMU Templates */}
                <h6 className="mb-3">PMU Templates (Pre-defined)</h6>
                <div className="row mb-4">
                  {Object.entries(pmuTemplates).map(([key, template]: [string, any]) => (
                    <div key={key} className="col-md-4 mb-3">
                      <div className="card h-100">
                        <div className="card-body">
                          <h6 className="card-title">{template.name}</h6>
                          <span className={`badge bg-${template.category === 'UTILITY' ? 'primary' : 'warning'} mb-2`}>
                            {template.category}
                          </span>
                          <p className="card-text small text-muted">
                            {template.components.find((c: any) => c.type === 'BODY')?.text?.substring(0, 100)}...
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Meta Templates */}
                {templates.length > 0 && (
                  <>
                    <h6 className="mb-3">Approved Templates (Meta)</h6>
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Language</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {templates.map((template, idx) => (
                            <tr key={idx}>
                              <td>{template.name}</td>
                              <td>{template.category}</td>
                              <td>{template.language}</td>
                              <td>
                                <span className={`badge bg-${template.status === 'APPROVED' ? 'success' : 'warning'}`}>
                                  {template.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Recent Messages</h5>
          </div>
          <div className="card-body">
            <p className="text-muted text-center py-5">
              <i className="fas fa-inbox fa-3x mb-3 d-block"></i>
              Messages will appear here when received via webhook.
              <br />
              <small>Configure your webhook URL in Meta Business Suite.</small>
            </p>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">WhatsApp Business Configuration</h5>
          </div>
          <div className="card-body">
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Setup Instructions:</strong>
              <ol className="mb-0 mt-2">
                <li>Create a Meta Business Account at <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer">business.facebook.com</a></li>
                <li>Set up WhatsApp Business API in Meta Business Suite</li>
                <li>Create a System User and generate an Access Token</li>
                <li>Add the following environment variables to your <code>.env.local</code> file</li>
              </ol>
            </div>

            <div className="bg-dark text-light p-3 rounded mb-4">
              <code>
                # WhatsApp Business API<br />
                WHATSAPP_ACCESS_TOKEN=your_access_token<br />
                WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id<br />
                WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id<br />
                WHATSAPP_WEBHOOK_VERIFY_TOKEN=pmu_whatsapp_verify
              </code>
            </div>

            <h6>Webhook Configuration</h6>
            <p>Configure this webhook URL in Meta Business Suite:</p>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/whatsapp/webhook`}
                readOnly
              />
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/api/whatsapp/webhook`);
                  setSuccess('Webhook URL copied to clipboard!');
                }}
              >
                <i className="fas fa-copy"></i>
              </button>
            </div>
            <small className="text-muted">
              Verify Token: <code>pmu_whatsapp_verify</code>
            </small>

            <hr />

            <h6>Template Submission</h6>
            <p className="text-muted">
              Message templates must be submitted to Meta for approval before use.
              Templates are reviewed within 24-48 hours.
            </p>
            <a 
              href="https://business.facebook.com/wa/manage/message-templates/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-outline-primary"
            >
              <i className="fas fa-external-link-alt me-2"></i>
              Manage Templates in Meta
            </a>
          </div>
        </div>
      )}

      {/* Configuration Notice */}
      <div className="alert alert-info mt-4">
        <i className="fas fa-info-circle me-2"></i>
        <strong>Configuration Required:</strong> This feature requires WhatsApp Business API access.
        Set <code>WHATSAPP_ACCESS_TOKEN</code>, <code>WHATSAPP_PHONE_NUMBER_ID</code>, and <code>WHATSAPP_BUSINESS_ACCOUNT_ID</code> environment variables.
      </div>
    </div>
  );
}
