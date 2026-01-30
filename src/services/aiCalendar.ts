import { Configuration, OpenAIApi } from 'openai';
import { Appointment } from '@/types/database';
import { GoogleCalendarService } from './googleCalendar';
import { GHLOrchestrator } from './ghl-orchestrator';

export type AICalendarResponse = {
  action: 'create' | 'update' | 'delete' | 'block' | 'available';
  target: 'event' | 'availability';
  date?: string;
  time?: string;
  duration?: number;
  summary?: string;
  description?: string;
};

export class AICalendarService {
  private static aiClient: OpenAIApi;

  static async initialize() {
    if (!this.aiClient) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('Missing OpenAI API key');
      }
      const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.aiClient = new OpenAIApi(configuration);
    }
    return this.aiClient;
  }

  static async processNaturalLanguageRequest(
    prompt: string,
    context?: {
      currentAppointments?: Appointment[];
      availability?: any;
    }
  ): Promise<AICalendarResponse> {
    const client = await this.initialize();
    
    try {
      const systemPrompt = `You are an AI calendar assistant. Convert natural language requests into structured calendar operations.

Current context:
${JSON.stringify(context || {}, null, 2)}

Respond with JSON in this format:
{
  "action": "create|update|delete|block|available",
  "target": "event|availability",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "duration": minutes,
  "summary": "event title",
  "description": "event details"
}`;

      const response = await this.aiClient.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      });

      const result = response.data.choices[0]?.message?.content;
      if (!result) throw new Error('No response from AI');
      
      return JSON.parse(result) as AICalendarResponse;
    } catch (error) {
      console.error('AI API error:', error);
      throw new Error('Failed to process AI request');
    }
  }

  static async generateAvailabilitySummary(
    availability: any
  ): Promise<string> {
    const client = await this.initialize();
    
    try {
      const response = await this.aiClient.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Summarize this availability data in a human-readable format',
          },
          {
            role: 'user',
            content: JSON.stringify(availability, null, 2),
          },
        ],
        temperature: 0.7,
      });

      return response.data.choices[0]?.message?.content || 'No summary available';
    } catch (error) {
      console.error('AI summary error:', error);
      return 'Failed to generate summary';
    }
  }
}
