/**
 * Competitor Analysis API Endpoint
 * Provides competitor keyword research and analysis via DataForSEO
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  createCompetitorAnalysisService,
  CompetitorAnalysisService 
} from '@/services/competitor-analysis';

// Initialize service lazily to handle missing credentials gracefully
let competitorService: CompetitorAnalysisService | null = null;

function getService(): CompetitorAnalysisService {
  if (!competitorService) {
    competitorService = createCompetitorAnalysisService();
  }
  return competitorService;
}

// ============================================================================
// POST - Analyze competitor domain
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      action, 
      domain, 
      domains,
      keywords,
      competitorDomain,
      locationCode = 2840,
      languageCode = 'en',
      limit = 100 
    } = body;

    const service = getService();

    switch (action) {
      // Get all keywords a competitor ranks for
      case 'ranked_keywords': {
        if (!domain) {
          return NextResponse.json(
            { error: 'Domain is required' },
            { status: 400 }
          );
        }
        const keywords = await service.getCompetitorKeywords(
          domain, 
          locationCode, 
          languageCode, 
          limit
        );
        return NextResponse.json({ 
          success: true, 
          domain,
          keywords,
          count: keywords.length 
        });
      }

      // Find SERP competitors for keywords
      case 'serp_competitors': {
        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
          return NextResponse.json(
            { error: 'Keywords array is required' },
            { status: 400 }
          );
        }
        const competitors = await service.findSerpCompetitors(
          keywords,
          locationCode,
          languageCode,
          limit
        );
        return NextResponse.json({ 
          success: true, 
          keywords,
          competitors,
          count: competitors.length 
        });
      }

      // Compare keyword overlap between two domains
      case 'domain_intersection': {
        if (!domain || !competitorDomain) {
          return NextResponse.json(
            { error: 'Both domain and competitorDomain are required' },
            { status: 400 }
          );
        }
        const intersection = await service.getDomainIntersection(
          domain,
          competitorDomain,
          locationCode,
          languageCode,
          limit
        );
        return NextResponse.json({ 
          success: true, 
          domain,
          competitorDomain,
          intersection,
          count: intersection.length 
        });
      }

      // Get keyword suggestions from a domain
      case 'keywords_for_site': {
        if (!domain) {
          return NextResponse.json(
            { error: 'Domain is required' },
            { status: 400 }
          );
        }
        const suggestions = await service.getKeywordsForSite(
          domain,
          locationCode,
          languageCode,
          limit
        );
        return NextResponse.json({ 
          success: true, 
          domain,
          suggestions,
          count: suggestions.length 
        });
      }

      // Get domain overview metrics
      case 'domain_overview': {
        if (!domain) {
          return NextResponse.json(
            { error: 'Domain is required' },
            { status: 400 }
          );
        }
        const overview = await service.getDomainOverview(
          domain,
          locationCode,
          languageCode
        );
        return NextResponse.json({ 
          success: true, 
          domain,
          overview 
        });
      }

      // Full competitor analysis
      case 'analyze': {
        if (!domain) {
          return NextResponse.json(
            { error: 'Domain is required' },
            { status: 400 }
          );
        }
        const analysis = await service.analyzeCompetitor(domain);
        return NextResponse.json({ 
          success: true, 
          analysis 
        });
      }

      // PMU-specific keyword research
      case 'pmu_keywords': {
        const pmuKeywords = await service.getPMUKeywords(
          locationCode,
          languageCode
        );
        return NextResponse.json({ 
          success: true, 
          keywords: pmuKeywords,
          count: pmuKeywords.length 
        });
      }

      // Keyword gap analysis
      case 'keyword_gaps': {
        if (!domain || !domains || !Array.isArray(domains)) {
          return NextResponse.json(
            { error: 'Domain and competitor domains array are required' },
            { status: 400 }
          );
        }
        const gaps = await service.getKeywordGaps(
          domain,
          domains,
          locationCode,
          languageCode
        );
        return NextResponse.json({ 
          success: true, 
          yourDomain: domain,
          competitorDomains: domains,
          gaps,
          count: gaps.length 
        });
      }

      default:
        return NextResponse.json(
          { 
            error: 'Invalid action',
            validActions: [
              'ranked_keywords',
              'serp_competitors', 
              'domain_intersection',
              'keywords_for_site',
              'domain_overview',
              'analyze',
              'pmu_keywords',
              'keyword_gaps'
            ]
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Competitor analysis error:', error);
    
    // Handle missing credentials
    if (error.message?.includes('credentials not configured')) {
      return NextResponse.json(
        { 
          error: 'DataForSEO not configured',
          message: 'Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to perform competitor analysis', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Quick domain analysis
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain query parameter is required' },
        { status: 400 }
      );
    }

    const service = getService();
    const analysis = await service.analyzeCompetitor(domain);

    return NextResponse.json({ 
      success: true, 
      analysis 
    });
  } catch (error: any) {
    console.error('Competitor analysis error:', error);
    
    if (error.message?.includes('credentials not configured')) {
      return NextResponse.json(
        { 
          error: 'DataForSEO not configured',
          message: 'Please set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to analyze competitor', details: error.message },
      { status: 500 }
    );
  }
}
