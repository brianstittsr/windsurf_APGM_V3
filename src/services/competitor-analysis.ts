/**
 * Competitor Analysis Service
 * Uses DataForSEO Labs API for competitor keyword research and analysis
 */

import axios, { AxiosInstance } from 'axios';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface DataForSEOConfig {
  login: string;
  password: string;
}

export interface RankedKeyword {
  keyword: string;
  position: number;
  searchVolume: number;
  cpc: number;
  competition: number;
  url: string;
  trafficShare: number;
  difficulty: number;
}

export interface SerpCompetitor {
  domain: string;
  avgPosition: number;
  sumPosition: number;
  intersections: number;
  competitorRelevance: number;
  fullDomainMetrics: {
    organicTraffic: number;
    organicKeywords: number;
    backlinks: number;
  };
}

export interface KeywordIntersection {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  target1Position: number;
  target2Position: number;
  target1Url: string;
  target2Url: string;
}

export interface DomainOverview {
  domain: string;
  organicTraffic: number;
  organicKeywords: number;
  organicCost: number;
  paidTraffic: number;
  paidKeywords: number;
  paidCost: number;
  backlinks: number;
  referringDomains: number;
}

export interface KeywordSuggestion {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  difficulty: number;
  trend: number[];
}

export interface CompetitorAnalysisResult {
  domain: string;
  keywords: RankedKeyword[];
  totalTraffic: number;
  topKeywords: string[];
  analyzedAt: Date;
}

// ============================================================================
// Competitor Analysis Service
// ============================================================================

export class CompetitorAnalysisService {
  private client: AxiosInstance;
  private baseUrl = 'https://api.dataforseo.com/v3';

  constructor(config: DataForSEOConfig) {
    const auth = Buffer.from(`${config.login}:${config.password}`).toString('base64');
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // --------------------------------------------------------------------------
  // Ranked Keywords - Get all keywords a domain ranks for
  // --------------------------------------------------------------------------

  async getCompetitorKeywords(
    domain: string,
    locationCode: number = 2840, // US
    languageCode: string = 'en',
    limit: number = 100
  ): Promise<RankedKeyword[]> {
    try {
      const response = await this.client.post(
        '/dataforseo_labs/google/ranked_keywords/live',
        [{
          target: domain,
          location_code: locationCode,
          language_code: languageCode,
          limit: limit,
          order_by: ['keyword_data.keyword_info.search_volume,desc'],
          filters: [
            ['ranked_serp_element.serp_item.rank_group', '<=', 50]
          ]
        }]
      );

      const result = response.data?.tasks?.[0]?.result?.[0];
      if (!result?.items) {
        return [];
      }

      return result.items.map((item: any) => ({
        keyword: item.keyword_data?.keyword || '',
        position: item.ranked_serp_element?.serp_item?.rank_group || 0,
        searchVolume: item.keyword_data?.keyword_info?.search_volume || 0,
        cpc: item.keyword_data?.keyword_info?.cpc || 0,
        competition: item.keyword_data?.keyword_info?.competition || 0,
        url: item.ranked_serp_element?.serp_item?.url || '',
        trafficShare: item.ranked_serp_element?.serp_item?.etv || 0,
        difficulty: item.keyword_data?.keyword_info?.keyword_difficulty || 0
      }));
    } catch (error) {
      console.error('Error fetching competitor keywords:', error);
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // SERP Competitors - Find domains competing for same keywords
  // --------------------------------------------------------------------------

  async findSerpCompetitors(
    keywords: string[],
    locationCode: number = 2840,
    languageCode: string = 'en',
    limit: number = 20
  ): Promise<SerpCompetitor[]> {
    try {
      const response = await this.client.post(
        '/dataforseo_labs/google/serp_competitors/live',
        [{
          keywords: keywords,
          location_code: locationCode,
          language_code: languageCode,
          limit: limit
        }]
      );

      const result = response.data?.tasks?.[0]?.result?.[0];
      if (!result?.items) {
        return [];
      }

      return result.items.map((item: any) => ({
        domain: item.domain || '',
        avgPosition: item.avg_position || 0,
        sumPosition: item.sum_position || 0,
        intersections: item.intersections || 0,
        competitorRelevance: item.competitor_relevance || 0,
        fullDomainMetrics: {
          organicTraffic: item.full_domain_metrics?.organic?.etv || 0,
          organicKeywords: item.full_domain_metrics?.organic?.count || 0,
          backlinks: item.full_domain_metrics?.backlinks || 0
        }
      }));
    } catch (error) {
      console.error('Error finding SERP competitors:', error);
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // Domain Intersection - Compare keyword overlap between domains
  // --------------------------------------------------------------------------

  async getDomainIntersection(
    targetDomain: string,
    competitorDomain: string,
    locationCode: number = 2840,
    languageCode: string = 'en',
    limit: number = 100
  ): Promise<KeywordIntersection[]> {
    try {
      const response = await this.client.post(
        '/dataforseo_labs/google/domain_intersection/live',
        [{
          target1: targetDomain,
          target2: competitorDomain,
          location_code: locationCode,
          language_code: languageCode,
          limit: limit,
          order_by: ['keyword_data.keyword_info.search_volume,desc']
        }]
      );

      const result = response.data?.tasks?.[0]?.result?.[0];
      if (!result?.items) {
        return [];
      }

      return result.items.map((item: any) => ({
        keyword: item.keyword_data?.keyword || '',
        searchVolume: item.keyword_data?.keyword_info?.search_volume || 0,
        cpc: item.keyword_data?.keyword_info?.cpc || 0,
        competition: item.keyword_data?.keyword_info?.competition || 0,
        target1Position: item.first_domain_serp_element?.serp_item?.rank_group || 0,
        target2Position: item.second_domain_serp_element?.serp_item?.rank_group || 0,
        target1Url: item.first_domain_serp_element?.serp_item?.url || '',
        target2Url: item.second_domain_serp_element?.serp_item?.url || ''
      }));
    } catch (error) {
      console.error('Error getting domain intersection:', error);
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // Keywords For Site - Get keyword suggestions from a domain
  // --------------------------------------------------------------------------

  async getKeywordsForSite(
    domain: string,
    locationCode: number = 2840,
    languageCode: string = 'en',
    limit: number = 100
  ): Promise<KeywordSuggestion[]> {
    try {
      const response = await this.client.post(
        '/dataforseo_labs/google/keywords_for_site/live',
        [{
          target: domain,
          location_code: locationCode,
          language_code: languageCode,
          include_serp_info: true,
          limit: limit
        }]
      );

      const result = response.data?.tasks?.[0]?.result?.[0];
      if (!result?.items) {
        return [];
      }

      return result.items.map((item: any) => ({
        keyword: item.keyword || '',
        searchVolume: item.keyword_info?.search_volume || 0,
        cpc: item.keyword_info?.cpc || 0,
        competition: item.keyword_info?.competition || 0,
        difficulty: item.keyword_info?.keyword_difficulty || 0,
        trend: item.keyword_info?.monthly_searches?.map((m: any) => m.search_volume) || []
      }));
    } catch (error) {
      console.error('Error getting keywords for site:', error);
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // Domain Overview - Get domain metrics
  // --------------------------------------------------------------------------

  async getDomainOverview(
    domain: string,
    locationCode: number = 2840,
    languageCode: string = 'en'
  ): Promise<DomainOverview | null> {
    try {
      const response = await this.client.post(
        '/dataforseo_labs/google/domain_rank_overview/live',
        [{
          target: domain,
          location_code: locationCode,
          language_code: languageCode
        }]
      );

      const result = response.data?.tasks?.[0]?.result?.[0];
      if (!result?.items?.[0]) {
        return null;
      }

      const item = result.items[0];
      return {
        domain: domain,
        organicTraffic: item.metrics?.organic?.etv || 0,
        organicKeywords: item.metrics?.organic?.count || 0,
        organicCost: item.metrics?.organic?.estimated_paid_traffic_cost || 0,
        paidTraffic: item.metrics?.paid?.etv || 0,
        paidKeywords: item.metrics?.paid?.count || 0,
        paidCost: item.metrics?.paid?.estimated_paid_traffic_cost || 0,
        backlinks: item.backlinks_info?.backlinks || 0,
        referringDomains: item.backlinks_info?.referring_domains || 0
      };
    } catch (error) {
      console.error('Error getting domain overview:', error);
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // Full Competitor Analysis - Comprehensive analysis
  // --------------------------------------------------------------------------

  async analyzeCompetitor(domain: string): Promise<CompetitorAnalysisResult> {
    const keywords = await this.getCompetitorKeywords(domain);
    
    const totalTraffic = keywords.reduce((sum, kw) => sum + kw.trafficShare, 0);
    const topKeywords = keywords
      .sort((a, b) => b.searchVolume - a.searchVolume)
      .slice(0, 10)
      .map(kw => kw.keyword);

    return {
      domain,
      keywords,
      totalTraffic,
      topKeywords,
      analyzedAt: new Date()
    };
  }

  // --------------------------------------------------------------------------
  // PMU-Specific Keyword Research
  // --------------------------------------------------------------------------

  async getPMUKeywords(
    locationCode: number = 2840,
    languageCode: string = 'en'
  ): Promise<KeywordSuggestion[]> {
    const pmuSeedKeywords = [
      'microblading',
      'powder brows',
      'permanent makeup',
      'lip blush',
      'PMU artist',
      'eyebrow tattoo',
      'cosmetic tattooing',
      'ombre brows',
      'nano brows',
      'permanent eyeliner'
    ];

    try {
      const response = await this.client.post(
        '/dataforseo_labs/google/related_keywords/live',
        [{
          keywords: pmuSeedKeywords,
          location_code: locationCode,
          language_code: languageCode,
          limit: 100
        }]
      );

      const result = response.data?.tasks?.[0]?.result?.[0];
      if (!result?.items) {
        return [];
      }

      return result.items.map((item: any) => ({
        keyword: item.keyword_data?.keyword || '',
        searchVolume: item.keyword_data?.keyword_info?.search_volume || 0,
        cpc: item.keyword_data?.keyword_info?.cpc || 0,
        competition: item.keyword_data?.keyword_info?.competition || 0,
        difficulty: item.keyword_data?.keyword_info?.keyword_difficulty || 0,
        trend: item.keyword_data?.keyword_info?.monthly_searches?.map((m: any) => m.search_volume) || []
      }));
    } catch (error) {
      console.error('Error getting PMU keywords:', error);
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // Keyword Gap Analysis - Find keywords competitors rank for but you don't
  // --------------------------------------------------------------------------

  async getKeywordGaps(
    yourDomain: string,
    competitorDomains: string[],
    locationCode: number = 2840,
    languageCode: string = 'en'
  ): Promise<KeywordSuggestion[]> {
    // Get your keywords
    const yourKeywords = await this.getCompetitorKeywords(yourDomain, locationCode, languageCode);
    const yourKeywordSet = new Set(yourKeywords.map(k => k.keyword.toLowerCase()));

    // Get competitor keywords
    const competitorKeywordsPromises = competitorDomains.map(domain =>
      this.getCompetitorKeywords(domain, locationCode, languageCode)
    );
    const competitorKeywordsArrays = await Promise.all(competitorKeywordsPromises);

    // Find gaps - keywords competitors have that you don't
    const gaps: Map<string, KeywordSuggestion> = new Map();

    for (const competitorKeywords of competitorKeywordsArrays) {
      for (const kw of competitorKeywords) {
        const keywordLower = kw.keyword.toLowerCase();
        if (!yourKeywordSet.has(keywordLower) && !gaps.has(keywordLower)) {
          gaps.set(keywordLower, {
            keyword: kw.keyword,
            searchVolume: kw.searchVolume,
            cpc: kw.cpc,
            competition: kw.competition,
            difficulty: kw.difficulty,
            trend: []
          });
        }
      }
    }

    return Array.from(gaps.values())
      .sort((a, b) => b.searchVolume - a.searchVolume);
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createCompetitorAnalysisService(): CompetitorAnalysisService {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;

  if (!login || !password) {
    throw new Error('DataForSEO credentials not configured. Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables.');
  }

  return new CompetitorAnalysisService({ login, password });
}
