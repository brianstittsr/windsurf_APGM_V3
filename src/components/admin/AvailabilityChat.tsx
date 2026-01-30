'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Send } from 'lucide-react';
import { AICalendarService, AICalendarResponse } from '@/services/aiCalendar';
import { useAuth } from '@/hooks/useAuth';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

interface AvailabilityChatProps {
  selectedArtist: string;
  availability: any;
  onAction: (action: any) => Promise<void>;
}

export function AvailabilityChat({ 
  selectedArtist, 
  availability,
  onAction 
}: AvailabilityChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I can help you manage availability. Try saying "Block off next Tuesday afternoon" or "Make me available every Wednesday morning"',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!input.trim() || !selectedArtist) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // Show loading indicator
      setMessages(prev => [...prev, {
        id: 'loading',
        text: 'Processing your request...',
        sender: 'ai',
        timestamp: new Date()
      }]);

      // Process with AI
      const result = await AICalendarService.processNaturalLanguageRequest(input, {
        currentAppointments: [], // Will be added in todo_17
        availability
      });

      // Remove loading message
      setMessages(prev => prev.filter(m => m.id !== 'loading'));

      // Execute the action
      await onAction(result);
      
      // Add success response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Success: ${getActionDescription(result)}`,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
      // Remove loading message
      setMessages(prev => prev.filter(m => m.id !== 'loading'));
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Error: ${error.message || 'Failed to process request'}`,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Helper function to generate action descriptions
  const getActionDescription = (action: AICalendarResponse): string => {
    switch (action.action) {
      case 'block':
        return `Blocked ${action.target} on ${action.date}${action.time ? ' at ' + action.time : ''}`;
      case 'available':
        return `Made ${action.target} available on ${action.date}`;
      default:
        return `Processed ${action.action} for ${action.target}`;
    }
  };

  return (
    <Card className="border-gray-200 shadow-sm h-full flex flex-col">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Bot className="h-4 w-4 text-[#AD6269]" />
          AI Availability Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg px-4 py-2 ${message.sender === 'user' 
                  ? 'bg-[#AD6269] text-white' 
                  : 'bg-gray-100 text-gray-800'}`}
              >
                {message.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your availability request..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} className="bg-[#AD6269] hover:bg-[#9d5860]">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
