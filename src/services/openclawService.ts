interface OpenClawConfig {
  apiKey: string;
  baseUrl?: string;
}

type LocalEvent = {
  id: string;
  name: string;
  date: string;
  location: string;
  organizer: string;
  category: string;
  url: string;
};

type Vendor = {
  id: string;
  name: string;
  services: string[];
  location: string;
  rating: number;
};

type RequestParams = Record<string, string | number | undefined>;

export class OpenClawService {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: OpenClawConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.openclaw.ai/v1';
  }

  private async makeRequest(endpoint: string, params: RequestParams = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`OpenClaw API Error: ${response.status}`);
    }

    return response.json();
  }

  async getLocalEvents(params: {
    location: string;
    radius?: number;
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<LocalEvent[]> {
    return this.makeRequest('/events/local', {
      ...params,
      radius: params.radius?.toString()
    });
  }

  async getVendors(params: {
    location: string;
    services?: string[];
    radius?: number;
  }): Promise<Vendor[]> {
    return this.makeRequest('/vendors', {
      ...params,
      services: params.services?.join(','),
      radius: params.radius?.toString()
    });
  }

  async getMarketTrends(params: {
    location: string;
    category?: string;
  }): Promise<{
    trend: string;
    demandScore: number;
    upcomingEvents: number;
  }> {
    return this.makeRequest('/analytics/trends', params);
  }
}
