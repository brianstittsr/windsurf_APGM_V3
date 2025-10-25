'use client';

import { useState, useEffect, useRef } from 'react';
import { workflowEngine } from '@/services/bmad-workflows';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  actions?: ChatAction[];
}

interface ChatAction {
  type: 'book_appointment' | 'view_services' | 'register' | 'pay_deposit';
  label: string;
  data?: any;
}

export default function PMUChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `👋 Hi! I'm your Permanent Makeup assistant!

I can help you with:
✨ Information about our procedures (Microblading, Powder Brows, Lip Blush, Eyeliner)
📅 Booking appointments
💰 Pricing and packages
📋 Pre & post-care instructions
🎨 Portfolio and before/after photos

What would you like to know?`,
      timestamp: new Date(),
      actions: [
        { type: 'view_services', label: '📋 View Services' },
        { type: 'book_appointment', label: '📅 Book Appointment' }
      ]
    };

    setMessages([welcomeMessage]);
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
      // Send to PMU chatbot API
      const response = await fetch('/api/chatbot/pmu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages.slice(-10),
          customerData
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          actions: data.actions || []
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Update customer data if provided
        if (data.customerData) {
          setCustomerData(data.customerData);
        }

        // Handle special actions
        if (data.triggerWorkflow) {
          await handleWorkflowTrigger(data.triggerWorkflow);
        }
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: '❌ Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: ChatAction) => {
    switch (action.type) {
      case 'view_services':
        await handleViewServices();
        break;
      case 'book_appointment':
        await handleBookAppointment();
        break;
      case 'register':
        await handleRegister();
        break;
      case 'pay_deposit':
        await handlePayDeposit(action.data);
        break;
    }
  };

  const handleViewServices = async () => {
    const servicesMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `💎 **Our Premium Services:**

**Microblading** - $500
Natural, hair-like strokes for fuller brows
Duration: 2-3 hours | Touch-up in 6-8 weeks

**Powder Brows** - $450
Soft, powdered makeup look
Duration: 2-3 hours | Touch-up in 6-8 weeks

**Lip Blush** - $550
Natural lip color enhancement
Duration: 2-3 hours | Touch-up in 6-8 weeks

**Eyeliner** - $400
Permanent eyeliner definition
Duration: 2 hours | Touch-up in 6-8 weeks

All services include:
✅ Free consultation
✅ Custom color matching
✅ Aftercare kit
✅ Follow-up touch-up

Ready to book? I can help you schedule!`,
      timestamp: new Date(),
      actions: [
        { type: 'book_appointment', label: '📅 Book Now' }
      ]
    };

    setMessages(prev => [...prev, servicesMessage]);
  };

  const handleBookAppointment = async () => {
    const bookingMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Great! Let's get you scheduled! 📅

To book your appointment, I'll need:
1. Your name
2. Email address
3. Phone number
4. Which service you're interested in
5. Preferred date and time

**Booking Process:**
1. $50 deposit to secure your appointment
2. You'll receive a confirmation email with payment link
3. Before your appointment, we'll send you a registration link with coupon code **GRANOPEN250** ($250 value!)
4. Final payment of $200 (after $50 deposit credit) due at appointment

What service are you interested in?`,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, bookingMessage]);
  };

  const handleRegister = async () => {
    window.location.href = '/register?coupon=GRANOPEN250';
  };

  const handlePayDeposit = async (data: any) => {
    // Redirect to payment page
    window.location.href = `/payment/deposit?amount=50&booking=${data.bookingId}`;
  };

  const handleWorkflowTrigger = async (workflow: any) => {
    try {
      await fetch('/api/workflows/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow)
      });
    } catch (error) {
      console.error('Workflow trigger error:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="position-fixed bottom-0 end-0 m-4 btn btn-primary rounded-circle shadow-lg"
        style={{
          width: '60px',
          height: '60px',
          zIndex: 1000,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none'
        }}
        aria-label="Open chat"
      >
        <i className="fas fa-comments fa-lg"></i>
      </button>
    );
  }

  return (
    <div
      className="position-fixed bottom-0 end-0 m-4 shadow-lg"
      style={{
        width: '380px',
        height: '600px',
        zIndex: 1000,
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'white'
      }}
    >
      {/* Header */}
      <div
        className="p-3 text-white d-flex justify-content-between align-items-center"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <div>
          <h6 className="mb-0 fw-bold">PMU Assistant</h6>
          <small className="opacity-75">Always here to help! 💕</small>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="btn btn-link text-white p-0"
          style={{ fontSize: '1.5rem' }}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* Messages */}
      <div
        className="flex-grow-1 overflow-auto p-3"
        style={{ backgroundColor: '#f8f9fa' }}
      >
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
                  : 'bg-white shadow-sm'
              }`}
              style={{
                maxWidth: '85%',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {message.role === 'assistant' && (
                <div className="mb-2">
                  <i className="fas fa-robot me-2"></i>
                  <strong>PMU Assistant</strong>
                </div>
              )}
              <div dangerouslySetInnerHTML={{ 
                __html: message.content
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br/>') 
              }} />
              
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3">
                  {message.actions.map((action, idx) => (
                    <button
                      key={idx}
                      className="btn btn-sm btn-outline-primary me-2 mb-2"
                      onClick={() => handleAction(action)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="small text-muted mt-1">
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        ))}
        {loading && (
          <div className="mb-3">
            <div className="d-inline-block p-3 rounded bg-white shadow-sm">
              <div className="spinner-border spinner-border-sm me-2" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-top bg-white">
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button
            className="btn btn-primary"
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
        <div className="small text-muted mt-2 text-center">
          Powered by BMAD Orchestrator
        </div>
      </div>
    </div>
  );
}
