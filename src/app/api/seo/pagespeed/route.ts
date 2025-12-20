/**
 * PageSpeed Insights API Endpoint
 * Analyzes website performance and generates optimization reports
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  createPageSpeedService,
  PageSpeedInsightsService 
} from '@/services/pagespeed-insights';

// Initialize service lazily
let pageSpeedService: PageSpeedInsightsService | null = null;

function getService(): PageSpeedInsightsService {
  if (!pageSpeedService) {
    pageSpeedService = createPageSpeedService();
  }
  return pageSpeedService;
}

// ============================================================================
// POST - Analyze URL with options
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, strategy = 'mobile', fullReport = false } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const service = getService();

    if (fullReport) {
      // Generate full report (mobile + desktop)
      const report = await service.generateReport(url);
      return NextResponse.json({ 
        success: true, 
        report 
      });
    } else {
      // Single strategy analysis
      const results = await service.analyzeUrl(url, strategy);
      return NextResponse.json({ 
        success: true, 
        results 
      });
    }
  } catch (error: any) {
    console.error('PageSpeed analysis error:', error);
    
    if (error.message?.includes('not configured')) {
      return NextResponse.json(
        { 
          error: 'PageSpeed Insights not configured',
          message: 'Please set GOOGLE_PAGESPEED_API_KEY environment variable'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to analyze URL', details: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Quick analysis with URL parameter
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const strategy = (searchParams.get('strategy') || 'mobile') as 'mobile' | 'desktop';
    const format = searchParams.get('format') || 'json';

    if (!url) {
      return NextResponse.json(
        { error: 'URL query parameter is required' },
        { status: 400 }
      );
    }

    const service = getService();

    // Generate full report
    const report = await service.generateReport(url);

    // Return markdown format if requested
    if (format === 'markdown' || format === 'md') {
      const markdown = service.formatReportAsMarkdown(report);
      return new NextResponse(markdown, {
        headers: { 
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="pagespeed-report-${Date.now()}.md"`
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      report 
    });
  } catch (error: any) {
    console.error('PageSpeed analysis error:', error);
    
    if (error.message?.includes('not configured')) {
      return NextResponse.json(
        { 
          error: 'PageSpeed Insights not configured',
          message: 'Please set GOOGLE_PAGESPEED_API_KEY environment variable'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to analyze URL', details: error.message },
      { status: 500 }
    );
  }
}
