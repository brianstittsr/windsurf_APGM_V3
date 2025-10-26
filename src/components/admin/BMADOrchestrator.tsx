'use client';

import { useState, useEffect, useRef } from 'react';
import { DatabaseService } from '@/services/database';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    action?: string;
    result?: any;
    needsInput?: boolean;
    followUpQuestions?: string[];
  };
}

interface OrchestratorContext {
  availableActions: string[];
  currentUser: any;
  websiteData: any;
}

export default function BMADOrchestrator() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<OrchestratorContext | null>(null);
  const [analystActive, setAnalystActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeOrchestrator();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeOrchestrator = async () => {
    // Load orchestrator context
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: analystActive
        ? `Hello, I'm **Mary, your BMAD Analyst.**\n\nI'm here to help you with strategic tasks, such as:\n\n- **Creating a Project Brief**\n- **Analyzing Business Performance**\n- **Defining Project Scope & Requirements**\n\nWhat can I help you with today?`
        : `👋 **Welcome to BMAD Orchestrator!**

I'm your intelligent assistant for managing this permanent makeup website. I can help you with:

🎨 **Website Management**
- Update services, pricing, and descriptions
- Manage reviews and testimonials
- Configure business settings

👥 **User & Artist Management**
- Create, update, or delete users
- Manage artist profiles and portfolios
- Handle user roles and permissions

📅 **Booking & Calendar**
- View and manage appointments
- Configure booking settings
- Handle scheduling conflicts

🎟️ **Coupons & Gift Cards**
- Create promotional codes
- Manage gift card inventory
- Track redemptions

☁️ **GoHighLevel Integration**
- Sync contacts and workflows
- Create appointments in GHL
- Send messages to customers
- Manage tags and tasks

🔧 **MCP Server Operations**
- Access GHL resources
- Execute MCP tools
- Automate workflows

Just tell me what you'd like to do, and I'll guide you through it! If I need more information, I'll ask follow-up questions.

**Example requests:**
- "Create a new service called Microblading for $500"
- "Show me all appointments for tomorrow"
- "Sync all contacts from GoHighLevel"
- "Create a 20% off coupon code for new customers"`,
      timestamp: new Date()
    };

    setMessages([welcomeMessage]);

    // Load available actions
    const actions = [
      'create_service', 'update_service', 'delete_service',
      'create_user', 'update_user', 'delete_user',
      'create_artist', 'update_artist', 'delete_artist',
      'create_coupon', 'update_coupon', 'delete_coupon',
      'view_bookings', 'create_booking', 'update_booking',
      'sync_ghl_contacts', 'create_ghl_contact', 'send_ghl_message',
      'execute_mcp_tool', 'load_mcp_resource',
      'update_business_settings', 'view_analytics'
    ];

    setContext({
      availableActions: actions,
      currentUser: null,
      websiteData: null
    });
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Send to orchestrator API
      const response = await fetch('/api/bmad/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.slice(-10), // Last 10 messages for context
          context
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          metadata: {
            action: data.action,
            result: data.result,
            needsInput: data.needsInput,
            followUpQuestions: data.followUpQuestions
          }
        };

        setMessages(prev => [...prev, assistantMessage]);

        // If action was executed, show success
        if (data.actionExecuted) {
          const successMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: 'system',
            content: `✅ **Action completed successfully!**\n\n${data.actionSummary || 'Task completed.'}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, successMessage]);
        }
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: '❌ Sorry, I encountered an error processing your request. Please try again.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Orchestrator error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: '❌ Network error. Please check your connection and try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  return (
    <div className="container-fluid h-100">
      {/* Header */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="card border-0 shadow-sm bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body text-white p-4">
              <h2 className="card-title mb-2 fw-bold">
                <i className="fas fa-robot me-3"></i>
                BMAD Orchestrator
              </h2>
              <p className="card-text mb-0 opacity-75">
                Your intelligent assistant for managing the entire website
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h6 className="mb-0"><i className="fas fa-bolt me-2"></i>Quick Actions</h6>
            </div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-md-3">
                  <button 
                    className="btn btn-outline-primary btn-sm w-100"
                    onClick={() => handleQuickAction('Show me all services')}
                  >
                    <i className="fas fa-list me-2"></i>View Services
                  </button>
                </div>
                <div className="col-md-3">
                  <button 
                    className="btn btn-outline-success btn-sm w-100"
                    onClick={() => handleQuickAction('Sync contacts from GoHighLevel')}
                  >
                    <i className="fas fa-sync me-2"></i>Sync GHL Contacts
                  </button>
                </div>
                <div className="col-md-3">
                  <button 
                    className="btn btn-outline-info btn-sm w-100"
                    onClick={() => handleQuickAction('Show me today\'s appointments')}
                  >
                    <i className="fas fa-calendar me-2"></i>Today's Bookings
                  </button>
                </div>
                <div className="col-md-3">
                  <button 
                    className="btn btn-outline-warning btn-sm w-100"
                    onClick={() => handleQuickAction('Create a new coupon code')}
                  >
                    <i className="fas fa-ticket-alt me-2"></i>New Coupon
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="row">
        <div className="col-12">
          <div className="card" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
            {/* Messages */}
            <div className="card-body flex-grow-1 overflow-auto" style={{ maxHeight: '500px' }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-3 ${message.role === 'user' ? 'text-end' : ''}`}
                >
                  <div
                    className={`d-inline-block p-3 rounded ${
                      message.role === 'user'
                        ? 'bg-primary text-white'
                        : message.role === 'system'
                        ? 'bg-warning text-dark'
                        : 'bg-light text-dark'
                    }`}
                    style={{ maxWidth: '80%', whiteSpace: 'pre-wrap' }}
                  >
                    {message.role === 'assistant' && (
                      <div className="mb-2">
                        <i className="fas fa-robot me-2"></i>
                        <strong>{analystActive ? 'Mary the Analyst' : 'BMAD Orchestrator'}</strong>
                      </div>
                    )}
                    {message.role === 'system' && (
                      <div className="mb-2">
                        <i className="fas fa-info-circle me-2"></i>
                        <strong>System</strong>
                      </div>
                    )}
                    <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                    
                    {message.metadata?.followUpQuestions && (
                      <div className="mt-2">
                        <small className="text-muted">Suggested follow-ups:</small>
                        {message.metadata.followUpQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            className="btn btn-sm btn-outline-secondary mt-1 me-1"
                            onClick={() => handleQuickAction(q)}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="small text-muted mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="mb-3">
                  <div className="d-inline-block p-3 rounded bg-light">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    BMAD is thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="card-footer bg-white border-top">
              <div className="input-group">
                <textarea
                  className="form-control"
                  placeholder={analystActive ? 'Ask Mary about your project brief...' : 'Ask BMAD anything...'}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows={2}
                  disabled={loading}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleSendMessage}
                  disabled={loading || !input.trim()}
                >
                  <i className="fas fa-paper-plane me-2"></i>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Context Info */}
      <div className="row mt-3">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-secondary text-white">
              <h6 className="mb-0"><i className="fas fa-info-circle me-2"></i>Orchestrator Capabilities</h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <h6 className="text-primary">Website Management</h6>
                  <ul className="small">
                    <li>Services & Pricing</li>
                    <li>Reviews & Testimonials</li>
                    <li>Business Settings</li>
                    <li>Content Updates</li>
                  </ul>
                </div>
                <div className="col-md-4">
                  <h6 className="text-success">User Management</h6>
                  <ul className="small">
                    <li>Create/Update Users</li>
                    <li>Manage Artists</li>
                    <li>Role Assignments</li>
                    <li>Permissions</li>
                  </ul>
                </div>
                <div className="col-md-4">
                  <h6 className="text-info">CRM & Automation</h6>
                  <ul className="small">
                    <li>GoHighLevel Sync</li>
                    <li>MCP Server Tools</li>
                    <li>Workflow Automation</li>
                    <li>Customer Communications</li>
                  </ul>
                </div>
                <div className="col-md-4">
                  <h6 className="text-danger">BMAD Analyst</h6>
                  <ul className="small">
                    <li>Business Insights</li>
                    <li>Performance Analytics</li>
                    <li>Revenue Tracking</li>
                    <li>Customer Behavior</li>
                  </ul>
                  <button 
                    className={`btn btn-sm ${analystActive ? 'btn-danger' : 'btn-success'}`}
                    onClick={() => setAnalystActive(!analystActive)}
                  >
                    {analystActive ? 'Deactivate Analyst' : 'Activate Analyst'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
