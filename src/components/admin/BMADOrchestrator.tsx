'use client';

import { useState, useEffect, useRef } from 'react';
import { DatabaseService } from '@/services/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <i className="fas fa-robot text-2xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold">BMAD Orchestrator</h2>
            <p className="text-white/80">Your intelligent assistant for managing the entire website</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-blue-500">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <i className="fas fa-bolt"></i>
            Quick Actions
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button 
              variant="outline"
              className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
              onClick={() => handleQuickAction('Show me all services')}
            >
              <i className="fas fa-list mr-2"></i>View Services
            </Button>
            <Button 
              variant="outline"
              className="w-full border-green-500 text-green-600 hover:bg-green-50"
              onClick={() => handleQuickAction('Sync contacts from GoHighLevel')}
            >
              <i className="fas fa-sync mr-2"></i>Sync GHL Contacts
            </Button>
            <Button 
              variant="outline"
              className="w-full border-cyan-500 text-cyan-600 hover:bg-cyan-50"
              onClick={() => handleQuickAction('Show me today\'s appointments')}
            >
              <i className="fas fa-calendar mr-2"></i>Today's Bookings
            </Button>
            <Button 
              variant="outline"
              className="w-full border-amber-500 text-amber-600 hover:bg-amber-50"
              onClick={() => handleQuickAction('Create a new coupon code')}
            >
              <i className="fas fa-ticket-alt mr-2"></i>New Coupon
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col" style={{ height: '600px' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: '500px' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                    : message.role === 'system'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-gray-100 text-gray-800'
                }`}
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-robot text-white text-xs"></i>
                    </div>
                    <span className="font-semibold text-gray-900">{analystActive ? 'Mary the Analyst' : 'BMAD Orchestrator'}</span>
                  </div>
                )}
                {message.role === 'system' && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-amber-200">
                    <i className="fas fa-info-circle text-amber-500"></i>
                    <span className="font-semibold">System</span>
                  </div>
                )}
                <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                
                {message.metadata?.followUpQuestions && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Suggested follow-ups:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.metadata.followUpQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                          onClick={() => handleQuickAction(q)}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-4 rounded-xl flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                <span className="text-gray-600">BMAD is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex gap-3">
            <textarea
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder={analystActive ? 'Ask Mary about your project brief...' : 'Ask BMAD anything...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={2}
              disabled={loading}
            />
            <Button
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 px-6"
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
            >
              <i className="fas fa-paper-plane mr-2"></i>
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Context Info */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-600">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <i className="fas fa-info-circle"></i>
            Orchestrator Capabilities
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                <i className="fas fa-globe"></i>
                Website Management
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2"><i className="fas fa-check text-blue-400 text-xs"></i>Services & Pricing</li>
                <li className="flex items-center gap-2"><i className="fas fa-check text-blue-400 text-xs"></i>Reviews & Testimonials</li>
                <li className="flex items-center gap-2"><i className="fas fa-check text-blue-400 text-xs"></i>Business Settings</li>
                <li className="flex items-center gap-2"><i className="fas fa-check text-blue-400 text-xs"></i>Content Updates</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600 flex items-center gap-2">
                <i className="fas fa-users"></i>
                User Management
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2"><i className="fas fa-check text-green-400 text-xs"></i>Create/Update Users</li>
                <li className="flex items-center gap-2"><i className="fas fa-check text-green-400 text-xs"></i>Manage Artists</li>
                <li className="flex items-center gap-2"><i className="fas fa-check text-green-400 text-xs"></i>Role Assignments</li>
                <li className="flex items-center gap-2"><i className="fas fa-check text-green-400 text-xs"></i>Permissions</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-cyan-600 flex items-center gap-2">
                <i className="fas fa-cogs"></i>
                CRM & Automation
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2"><i className="fas fa-check text-cyan-400 text-xs"></i>GoHighLevel Sync</li>
                <li className="flex items-center gap-2"><i className="fas fa-check text-cyan-400 text-xs"></i>MCP Server Tools</li>
                <li className="flex items-center gap-2"><i className="fas fa-check text-cyan-400 text-xs"></i>Workflow Automation</li>
                <li className="flex items-center gap-2"><i className="fas fa-check text-cyan-400 text-xs"></i>Customer Communications</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-rose-600 flex items-center gap-2">
                <i className="fas fa-chart-line"></i>
                BMAD Analyst
              </h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center gap-2"><i className="fas fa-check text-rose-400 text-xs"></i>Business Insights</li>
                <li className="flex items-center gap-2"><i className="fas fa-check text-rose-400 text-xs"></i>Performance Analytics</li>
                <li className="flex items-center gap-2"><i className="fas fa-check text-rose-400 text-xs"></i>Revenue Tracking</li>
                <li className="flex items-center gap-2"><i className="fas fa-check text-rose-400 text-xs"></i>Customer Behavior</li>
              </ul>
              <Button 
                size="sm"
                className={analystActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                onClick={() => setAnalystActive(!analystActive)}
              >
                {analystActive ? 'Deactivate Analyst' : 'Activate Analyst'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
