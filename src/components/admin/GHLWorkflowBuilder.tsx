'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Bot,
  Send,
  Workflow,
  Zap,
  MessageSquare,
  Clock,
  Users,
  Tag,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckCircle,
  AlertTriangle,
  Copy,
  Download,
  RefreshCw,
  ChevronRight,
  Sparkles,
  BookOpen,
  Play,
  Loader2,
  X,
  Plus,
} from 'lucide-react';
import { GHL_WORKFLOW_TEMPLATES, GHL_TRIGGERS, GHL_ACTIONS, GHL_CONDITIONS, WORKFLOW_BUILDER_QUESTIONS } from '@/data/ghl-workflow-knowledge';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  workflowData?: any;
}

interface WorkflowStep {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  name: string;
  description: string;
  config: Record<string, any>;
}

interface GeneratedWorkflow {
  name: string;
  description: string;
  trigger: string;
  steps: WorkflowStep[];
  promptDescription: string;
}

export default function GHLWorkflowBuilder() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState<GeneratedWorkflow | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);
  const [conversationContext, setConversationContext] = useState<Record<string, any>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `👋 **Welcome to the AI Workflow Builder!**

I can help you create custom GoHighLevel workflows for your business. Here's what I can do:

• **Build custom workflows** - Tell me what you want to automate and I'll design it
• **Deploy templates** - Choose from proven workflow templates for common scenarios
• **Convert existing workflows** - Paste workflow details and I'll create documentation

**To get started, you can:**
1. Select a template below to customize it
2. Or describe what you want to automate (e.g., "I want to follow up with leads who don't book")

What would you like to create today?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Send message to AI
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowTemplates(false);

    try {
      const response = await fetch('/api/ai/workflow-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
          context: conversationContext,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          workflowData: data.workflow,
        };

        setMessages(prev => [...prev, assistantMessage]);

        if (data.workflow) {
          setCurrentWorkflow(data.workflow);
        }

        if (data.context) {
          setConversationContext(prev => ({ ...prev, ...data.context }));
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error: any) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    const template = GHL_WORKFLOW_TEMPLATES[templateId as keyof typeof GHL_WORKFLOW_TEMPLATES];
    if (!template) return;

    setShowTemplates(false);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: `I'd like to use the "${template.name}" template`,
      timestamp: new Date(),
    };

    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: `Great choice! The **${template.name}** is perfect for ${template.description.toLowerCase()}.

Here's the workflow structure:

${template.promptDescription}

---

**Would you like to:**
1. **Use this as-is** - I'll generate the complete workflow documentation
2. **Customize it** - Tell me what you'd like to change (timing, messages, conditions)
3. **See the step-by-step breakdown** - I'll explain each step in detail

What would you prefer?`,
      timestamp: new Date(),
      workflowData: template,
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setCurrentWorkflow({
      name: template.name,
      description: template.description,
      trigger: template.trigger,
      steps: template.steps.map((step: any, i: number) => ({
        id: `step-${i}`,
        type: step.type as any,
        name: step.action || step.condition || 'Step',
        description: '',
        config: step.params || {},
      })),
      promptDescription: template.promptDescription,
    });
    setConversationContext({ selectedTemplate: templateId });
  };

  // Copy workflow to clipboard
  const handleCopyWorkflow = () => {
    if (!currentWorkflow) return;
    navigator.clipboard.writeText(currentWorkflow.promptDescription);
  };

  // Download workflow as text file
  const handleDownloadWorkflow = () => {
    if (!currentWorkflow) return;
    const blob = new Blob([currentWorkflow.promptDescription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentWorkflow.name.replace(/\s+/g, '_')}_workflow.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Reset conversation
  const handleReset = () => {
    setMessages([]);
    setCurrentWorkflow(null);
    setConversationContext({});
    setShowTemplates(true);
  };

  // Render template cards
  const renderTemplates = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {Object.entries(GHL_WORKFLOW_TEMPLATES).map(([id, template]) => (
        <button
          key={id}
          onClick={() => handleSelectTemplate(id)}
          className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-purple-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
              {template.category === 'Lead Generation' && <Users className="w-5 h-5 text-purple-600" />}
              {template.category === 'Appointments' && <Calendar className="w-5 h-5 text-purple-600" />}
              {template.category === 'Reputation' && <MessageSquare className="w-5 h-5 text-purple-600" />}
              {template.category === 'Retention' && <RefreshCw className="w-5 h-5 text-purple-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                {template.name}
              </h4>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {template.description}
              </p>
              <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {template.category}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
          </div>
        </button>
      ))}
    </div>
  );

  // Render chat messages
  const renderMessages = () => (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              message.role === 'user'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                <Bot className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-600">AI Workflow Builder</span>
              </div>
            )}
            <div 
              className="text-sm whitespace-pre-wrap prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: message.content
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n/g, '<br>')
              }}
            />
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span className="text-sm text-gray-600">Thinking...</span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );

  // Render current workflow preview
  const renderWorkflowPreview = () => {
    if (!currentWorkflow) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Workflow className="w-4 h-4 text-purple-600" />
            {currentWorkflow.name}
          </h4>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyWorkflow}>
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadWorkflow}>
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3">{currentWorkflow.description}</p>
        <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
            {currentWorkflow.promptDescription.slice(0, 500)}
            {currentWorkflow.promptDescription.length > 500 && '...'}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
              <Sparkles className="w-7 h-7" />
              AI Workflow Builder
            </h2>
            <p className="text-white/80">
              Create custom GoHighLevel workflows with AI assistance
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleReset}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">Workflow Assistant</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Online</span>
              </div>
            </div>

            {/* Messages Area */}
            <div className="h-[500px] overflow-y-auto p-4">
              {showTemplates && messages.length <= 1 && (
                <>
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      Quick Start Templates
                    </h3>
                    {renderTemplates()}
                  </div>
                  <div className="text-center text-sm text-gray-500 mb-4">
                    — or describe what you need below —
                  </div>
                </>
              )}
              {renderMessages()}
            </div>

            {/* Workflow Preview (if exists) */}
            {currentWorkflow && (
              <div className="px-4 pb-2">
                {renderWorkflowPreview()}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Describe the workflow you want to create..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                <button
                  onClick={() => setInputValue("Create a lead nurturing sequence")}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition-colors"
                >
                  Lead nurturing
                </button>
                <button
                  onClick={() => setInputValue("Reduce appointment no-shows")}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition-colors"
                >
                  Reduce no-shows
                </button>
                <button
                  onClick={() => setInputValue("Get more reviews from clients")}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition-colors"
                >
                  Get reviews
                </button>
                <button
                  onClick={() => setInputValue("Re-engage inactive clients")}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition-colors"
                >
                  Reactivation
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Workflow Reference */}
        <div className="space-y-4">
          {/* Available Triggers */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Common Triggers
            </h3>
            <div className="space-y-2 text-sm">
              {Object.values(GHL_TRIGGERS).slice(0, 3).flatMap(cat => 
                cat.triggers.slice(0, 2).map(trigger => (
                  <div key={trigger.id} className="flex items-center gap-2 text-gray-600">
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                    {trigger.name}
                  </div>
                ))
              )}
              <button 
                onClick={() => setInputValue("What triggers are available?")}
                className="text-purple-600 hover:text-purple-700 text-xs font-medium"
              >
                See all triggers →
              </button>
            </div>
          </div>

          {/* Available Actions */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Play className="w-4 h-4 text-green-500" />
              Common Actions
            </h3>
            <div className="space-y-2 text-sm">
              {Object.values(GHL_ACTIONS).slice(0, 3).flatMap(cat => 
                cat.actions.slice(0, 2).map(action => (
                  <div key={action.id} className="flex items-center gap-2 text-gray-600">
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                    {action.name}
                  </div>
                ))
              )}
              <button 
                onClick={() => setInputValue("What actions can workflows perform?")}
                className="text-purple-600 hover:text-purple-700 text-xs font-medium"
              >
                See all actions →
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-600" />
              Tips
            </h3>
            <ul className="text-sm text-purple-800 space-y-2">
              <li>• Be specific about your goals</li>
              <li>• Mention timing preferences</li>
              <li>• Specify communication channels</li>
              <li>• Ask for customizations</li>
            </ul>
          </div>

          {/* Example Prompts */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Example Requests</h3>
            <div className="space-y-2">
              {[
                "Create a 7-day follow-up for new leads",
                "Build a workflow to reduce no-shows",
                "Set up birthday automation",
                "Create a review request sequence",
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInputValue(prompt)}
                  className="w-full text-left text-sm text-gray-600 hover:text-purple-600 hover:bg-white p-2 rounded transition-colors"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
