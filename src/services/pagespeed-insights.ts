/**
 * PageSpeed Insights Service
 * Analyzes website performance using Google PageSpeed Insights API
 */

import axios from 'axios';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface PageSpeedConfig {
  apiKey: string;
}

export interface LighthouseAudit {
  id: string;
  title: string;
  description: string;
  score: number | null;
  displayValue?: string;
  numericValue?: number;
  details?: any;
}

export interface CoreWebVitals {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  totalBlockingTime: number;
  cumulativeLayoutShift: number;
  speedIndex: number;
  timeToInteractive: number;
}

export interface PerformanceScores {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

export interface PageSpeedResult {
  url: string;
  fetchTime: string;
  strategy: 'mobile' | 'desktop';
  scores: PerformanceScores;
  metrics: CoreWebVitals;
  opportunities: LighthouseAudit[];
  diagnostics: LighthouseAudit[];
  passedAudits: number;
  totalAudits: number;
}

export interface PageSpeedReport {
  url: string;
  generatedAt: string;
  mobile: PageSpeedResult;
  desktop: PageSpeedResult;
  recommendations: string[];
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
}

// ============================================================================
// PageSpeed Insights Service
// ============================================================================

export class PageSpeedInsightsService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

  constructor(config: PageSpeedConfig) {
    this.apiKey = config.apiKey;
  }

  // --------------------------------------------------------------------------
  // Analyze URL
  // --------------------------------------------------------------------------

  async analyzeUrl(
    url: string,
    strategy: 'mobile' | 'desktop' = 'mobile'
  ): Promise<PageSpeedResult> {
    const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
    
    const params = new URLSearchParams({
      url,
      key: this.apiKey,
      strategy,
      category: categories.join(',')
    });

    const response = await axios.get(`${this.baseUrl}?${params}`);
    const data = response.data;
    const lighthouse = data.lighthouseResult;

    return {
      url: data.id,
      fetchTime: lighthouse.fetchTime,
      strategy,
      scores: {
        performance: Math.round((lighthouse.categories.performance?.score || 0) * 100),
        accessibility: Math.round((lighthouse.categories.accessibility?.score || 0) * 100),
        bestPractices: Math.round((lighthouse.categories['best-practices']?.score || 0) * 100),
        seo: Math.round((lighthouse.categories.seo?.score || 0) * 100)
      },
      metrics: {
        firstContentfulPaint: lighthouse.audits['first-contentful-paint']?.numericValue || 0,
        largestContentfulPaint: lighthouse.audits['largest-contentful-paint']?.numericValue || 0,
        totalBlockingTime: lighthouse.audits['total-blocking-time']?.numericValue || 0,
        cumulativeLayoutShift: lighthouse.audits['cumulative-layout-shift']?.numericValue || 0,
        speedIndex: lighthouse.audits['speed-index']?.numericValue || 0,
        timeToInteractive: lighthouse.audits['interactive']?.numericValue || 0
      },
      opportunities: this.extractOpportunities(lighthouse.audits),
      diagnostics: this.extractDiagnostics(lighthouse.audits),
      passedAudits: this.countPassedAudits(lighthouse.audits),
      totalAudits: Object.keys(lighthouse.audits).length
    };
  }

  // --------------------------------------------------------------------------
  // Extract Opportunities (things to fix)
  // --------------------------------------------------------------------------

  private extractOpportunities(audits: any): LighthouseAudit[] {
    const opportunityIds = [
      'render-blocking-resources',
      'unused-css-rules',
      'unused-javascript',
      'modern-image-formats',
      'uses-optimized-images',
      'uses-responsive-images',
      'offscreen-images',
      'unminified-css',
      'unminified-javascript',
      'efficient-animated-content',
      'uses-text-compression',
      'uses-rel-preconnect',
      'server-response-time',
      'redirects',
      'uses-rel-preload',
      'uses-http2',
      'uses-long-cache-ttl'
    ];

    return opportunityIds
      .map(id => audits[id])
      .filter(audit => audit && audit.score !== null && audit.score < 1)
      .map(audit => ({
        id: audit.id,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        displayValue: audit.displayValue,
        numericValue: audit.numericValue,
        details: audit.details
      }))
      .sort((a, b) => (a.score || 0) - (b.score || 0));
  }

  // --------------------------------------------------------------------------
  // Extract Diagnostics
  // --------------------------------------------------------------------------

  private extractDiagnostics(audits: any): LighthouseAudit[] {
    const diagnosticIds = [
      'mainthread-work-breakdown',
      'bootup-time',
      'total-byte-weight',
      'dom-size',
      'critical-request-chains',
      'network-requests',
      'network-rtt',
      'network-server-latency',
      'largest-contentful-paint-element',
      'layout-shift-elements',
      'long-tasks'
    ];

    return diagnosticIds
      .map(id => audits[id])
      .filter(audit => audit)
      .map(audit => ({
        id: audit.id,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        displayValue: audit.displayValue,
        numericValue: audit.numericValue,
        details: audit.details
      }));
  }

  // --------------------------------------------------------------------------
  // Count Passed Audits
  // --------------------------------------------------------------------------

  private countPassedAudits(audits: any): number {
    return Object.values(audits).filter((audit: any) => 
      audit.score === 1 || audit.score === null
    ).length;
  }

  // --------------------------------------------------------------------------
  // Generate Full Report (Mobile + Desktop)
  // --------------------------------------------------------------------------

  async generateReport(url: string): Promise<PageSpeedReport> {
    const [mobileResults, desktopResults] = await Promise.all([
      this.analyzeUrl(url, 'mobile'),
      this.analyzeUrl(url, 'desktop')
    ]);

    const recommendations = this.generateRecommendations(mobileResults, desktopResults);
    const overallGrade = this.calculateOverallGrade(mobileResults, desktopResults);

    return {
      url,
      generatedAt: new Date().toISOString(),
      mobile: mobileResults,
      desktop: desktopResults,
      recommendations,
      overallGrade
    };
  }

  // --------------------------------------------------------------------------
  // Generate Recommendations
  // --------------------------------------------------------------------------

  private generateRecommendations(mobile: PageSpeedResult, desktop: PageSpeedResult): string[] {
    const recommendations: string[] = [];

    // Performance recommendations
    if (mobile.scores.performance < 50) {
      recommendations.push('🚨 CRITICAL: Mobile performance score is very low. Prioritize image optimization, code splitting, and reducing JavaScript.');
    } else if (mobile.scores.performance < 70) {
      recommendations.push('⚠️ Mobile performance needs improvement. Focus on Core Web Vitals optimization.');
    }

    // LCP recommendations
    if (mobile.metrics.largestContentfulPaint > 4000) {
      recommendations.push('📸 Optimize hero images - LCP is over 4 seconds. Consider lazy loading, WebP format, and CDN delivery.');
    } else if (mobile.metrics.largestContentfulPaint > 2500) {
      recommendations.push('📸 Improve LCP - Consider preloading critical images and optimizing server response time.');
    }

    // TBT recommendations
    if (mobile.metrics.totalBlockingTime > 600) {
      recommendations.push('⚡ Reduce JavaScript execution time - TBT is high. Code split, defer non-critical JS, and remove unused code.');
    } else if (mobile.metrics.totalBlockingTime > 300) {
      recommendations.push('⚡ Consider reducing main thread work to improve interactivity.');
    }

    // CLS recommendations
    if (mobile.metrics.cumulativeLayoutShift > 0.25) {
      recommendations.push('📐 Fix layout shifts - Add explicit width/height to images, avoid inserting content above existing content.');
    } else if (mobile.metrics.cumulativeLayoutShift > 0.1) {
      recommendations.push('📐 Minor layout shifts detected - Review image and ad placements.');
    }

    // FCP recommendations
    if (mobile.metrics.firstContentfulPaint > 3000) {
      recommendations.push('🎨 Improve First Contentful Paint - Reduce server response time, eliminate render-blocking resources.');
    }

    // Accessibility
    if (mobile.scores.accessibility < 90) {
      recommendations.push('♿ Improve accessibility - Add alt text to images, ensure proper heading hierarchy, check color contrast.');
    }

    // SEO
    if (mobile.scores.seo < 90) {
      recommendations.push('🔍 SEO improvements needed - Check meta descriptions, ensure mobile-friendly design, add structured data.');
    }

    // Best Practices
    if (mobile.scores.bestPractices < 90) {
      recommendations.push('✅ Review best practices - Check for HTTPS, avoid deprecated APIs, ensure proper image aspect ratios.');
    }

    // Add top opportunities
    const topOpportunities = mobile.opportunities.slice(0, 3);
    for (const opp of topOpportunities) {
      if (opp.displayValue) {
        recommendations.push(`💡 ${opp.title}: ${opp.displayValue}`);
      }
    }

    return recommendations;
  }

  // --------------------------------------------------------------------------
  // Calculate Overall Grade
  // --------------------------------------------------------------------------

  private calculateOverallGrade(mobile: PageSpeedResult, desktop: PageSpeedResult): 'A' | 'B' | 'C' | 'D' | 'F' {
    // Weight mobile more heavily (60/40)
    const avgPerformance = (mobile.scores.performance * 0.6) + (desktop.scores.performance * 0.4);
    const avgAccessibility = (mobile.scores.accessibility * 0.6) + (desktop.scores.accessibility * 0.4);
    const avgBestPractices = (mobile.scores.bestPractices * 0.6) + (desktop.scores.bestPractices * 0.4);
    const avgSeo = (mobile.scores.seo * 0.6) + (desktop.scores.seo * 0.4);

    // Weight the categories (performance most important)
    const overallScore = (avgPerformance * 0.4) + (avgAccessibility * 0.2) + (avgBestPractices * 0.2) + (avgSeo * 0.2);

    if (overallScore >= 90) return 'A';
    if (overallScore >= 80) return 'B';
    if (overallScore >= 70) return 'C';
    if (overallScore >= 50) return 'D';
    return 'F';
  }

  // --------------------------------------------------------------------------
  // Get Status for Metric
  // --------------------------------------------------------------------------

  getMetricStatus(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, { good: number; poor: number }> = {
      firstContentfulPaint: { good: 1800, poor: 3000 },
      largestContentfulPaint: { good: 2500, poor: 4000 },
      totalBlockingTime: { good: 200, poor: 600 },
      cumulativeLayoutShift: { good: 0.1, poor: 0.25 },
      speedIndex: { good: 3400, poor: 5800 },
      timeToInteractive: { good: 3800, poor: 7300 }
    };

    const threshold = thresholds[metricName];
    if (!threshold) return 'needs-improvement';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  // --------------------------------------------------------------------------
  // Format Report as Markdown
  // --------------------------------------------------------------------------

  formatReportAsMarkdown(report: PageSpeedReport): string {
    const { mobile, desktop, recommendations, overallGrade } = report;

    const gradeEmoji = {
      'A': '🟢',
      'B': '🟡',
      'C': '🟠',
      'D': '🔴',
      'F': '⛔'
    };

    return `
# PageSpeed Insights Report

**URL:** ${report.url}
**Generated:** ${new Date(report.generatedAt).toLocaleString()}
**Overall Grade:** ${gradeEmoji[overallGrade]} ${overallGrade}

---

## Performance Scores

| Category | Mobile | Desktop |
|----------|--------|---------|
| Performance | ${this.scoreEmoji(mobile.scores.performance)} ${mobile.scores.performance} | ${this.scoreEmoji(desktop.scores.performance)} ${desktop.scores.performance} |
| Accessibility | ${this.scoreEmoji(mobile.scores.accessibility)} ${mobile.scores.accessibility} | ${this.scoreEmoji(desktop.scores.accessibility)} ${desktop.scores.accessibility} |
| Best Practices | ${this.scoreEmoji(mobile.scores.bestPractices)} ${mobile.scores.bestPractices} | ${this.scoreEmoji(desktop.scores.bestPractices)} ${desktop.scores.bestPractices} |
| SEO | ${this.scoreEmoji(mobile.scores.seo)} ${mobile.scores.seo} | ${this.scoreEmoji(desktop.scores.seo)} ${desktop.scores.seo} |

---

## Core Web Vitals (Mobile)

| Metric | Value | Status |
|--------|-------|--------|
| First Contentful Paint | ${(mobile.metrics.firstContentfulPaint / 1000).toFixed(2)}s | ${this.statusEmoji(this.getMetricStatus('firstContentfulPaint', mobile.metrics.firstContentfulPaint))} |
| Largest Contentful Paint | ${(mobile.metrics.largestContentfulPaint / 1000).toFixed(2)}s | ${this.statusEmoji(this.getMetricStatus('largestContentfulPaint', mobile.metrics.largestContentfulPaint))} |
| Total Blocking Time | ${mobile.metrics.totalBlockingTime.toFixed(0)}ms | ${this.statusEmoji(this.getMetricStatus('totalBlockingTime', mobile.metrics.totalBlockingTime))} |
| Cumulative Layout Shift | ${mobile.metrics.cumulativeLayoutShift.toFixed(3)} | ${this.statusEmoji(this.getMetricStatus('cumulativeLayoutShift', mobile.metrics.cumulativeLayoutShift))} |
| Speed Index | ${(mobile.metrics.speedIndex / 1000).toFixed(2)}s | ${this.statusEmoji(this.getMetricStatus('speedIndex', mobile.metrics.speedIndex))} |
| Time to Interactive | ${(mobile.metrics.timeToInteractive / 1000).toFixed(2)}s | ${this.statusEmoji(this.getMetricStatus('timeToInteractive', mobile.metrics.timeToInteractive))} |

---

## Top Recommendations

${recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---

## Opportunities (Mobile)

${mobile.opportunities.slice(0, 5).map(opp => 
  `- **${opp.title}** ${opp.displayValue ? `- ${opp.displayValue}` : ''}`
).join('\n')}

---

## Passed Audits

- Mobile: ${mobile.passedAudits}/${mobile.totalAudits} audits passed
- Desktop: ${desktop.passedAudits}/${desktop.totalAudits} audits passed
    `.trim();
  }

  private scoreEmoji(score: number): string {
    if (score >= 90) return '🟢';
    if (score >= 50) return '🟡';
    return '🔴';
  }

  private statusEmoji(status: string): string {
    if (status === 'good') return '🟢 Good';
    if (status === 'needs-improvement') return '🟡 Needs Work';
    return '🔴 Poor';
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function createPageSpeedService(): PageSpeedInsightsService {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;

  if (!apiKey) {
    throw new Error('Google PageSpeed API key not configured. Set GOOGLE_PAGESPEED_API_KEY environment variable.');
  }

  return new PageSpeedInsightsService({ apiKey });
}
