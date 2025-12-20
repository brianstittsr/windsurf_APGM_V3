# 📊 BMAD Analyst Research Report
## One-Stop Social Media Marketing Management Platform

**Date:** December 19, 2025  
**Analyst:** Mary (BMAD Business Analyst)  
**Project:** A Pretty Girl Matter - Platform Expansion

---

## Executive Summary

This research report provides comprehensive findings for expanding the permanent makeup website into a full social media marketing management platform. The current platform has strong foundations with **GoHighLevel integration**, **BMAD workflows**, and a **PMU chatbot**. This report outlines strategies and implementation approaches for:

- AI SEO Integration
- Google My Business & Map 3-Pack Optimization
- Meta Ads & Facebook Pixel
- TikTok Marketing
- Lead Generation & Management
- Hero Carousel with Testimonials
- Celebrity Ad Campaigns
- **GHL AI SMS Chat Management** (NEW)
- **Wizard-Based Configuration** for all features
- **Lead Generation Automation Workflows** (NEW) - 8 GHL-implementable workflows
- **Competitor Keyword Analysis** (NEW) - Search competitor sites for keywords
- **Google Reviews Integration** (NEW) - Monitor and respond to reviews
- **PageSpeed Insights** (NEW) - Website optimization reports
- **Geographical Competitor Analysis** (NEW) - Local pricing and social media research
- **Referral & Loyalty Program** (NEW) - QR code cards with client tracking
- **WhatsApp Business API** (NEW) - Messaging marketing with 98% open rates
- **Real-Time Google Lead Capture** (NEW) - Capture leads while they're searching

---

## Table of Contents

1. [AI SEO Integration](#1-ai-seo-integration)
2. [Google My Business & Map 3-Pack](#2-google-my-business--map-3-pack)
3. [Meta Ads & Facebook Pixel Integration](#3-meta-ads--facebook-pixel-integration)
4. [TikTok Marketing Integration](#4-tiktok-marketing-integration)
5. [Lead Generation & Management Features](#5-lead-generation--management-features)
6. [Hero Carousel with Testimonials & Certifications](#6-hero-carousel-with-testimonials--certifications)
7. [Celebrity Ad Campaign Strategy](#7-celebrity-ad-campaign-strategy)
8. [GHL AI SMS Chat Management](#8-ghl-ai-sms-chat-management) ⭐ NEW
9. [Wizard-Based Configuration System](#9-wizard-based-configuration-system) ⭐ NEW
10. [Lead Generation Automation Workflows](#10-lead-generation-automation-workflows-ghl-implementation) ⭐ NEW
11. [Platform Architecture Recommendations](#11-platform-architecture-recommendations)
12. [Implementation Roadmap](#12-implementation-roadmap)
13. [Budget Considerations](#13-budget-considerations)
14. [Competitor Keyword Analysis & Site Research](#14-competitor-keyword-analysis--site-research) ⭐ NEW
15. [Google Reviews API Integration](#15-google-reviews-api-integration) ⭐ NEW
16. [PageSpeed Insights Integration](#16-pagespeed-insights-integration) ⭐ NEW
17. [Geographical Competitor Analysis](#17-geographical-competitor-analysis) ⭐ NEW
18. [Referral & Loyalty Program with QR Codes](#18-referral--loyalty-program-with-qr-codes) ⭐ NEW
19. [WhatsApp Business API Integration](#19-whatsapp-business-api-integration) ⭐ NEW
20. [Real-Time Google Lead Capture](#20-real-time-google-lead-capture) ⭐ NEW
21. [Budget Considerations (Updated)](#21-budget-considerations)

---

## 1. 🤖 AI SEO Integration

### Recommended Tools & APIs

| Tool | Best For | API Available | Pricing Model |
|------|----------|---------------|---------------|
| **DataForSEO** | Comprehensive SEO data | ✅ Full API | Pay-per-request |
| **SE Ranking** | Local SEO + Grid Tracking | ✅ API | Subscription |
| **Semrush** | AI content optimization | ✅ API | Enterprise |
| **SEO Review Tools** | Content analysis + AI generation | ✅ API | Freemium |

### Implementation Approach

#### Phase 1: On-Page SEO Analysis
- Integrate DataForSEO's On-Page API for automated audits
- Add SEO score dashboard to admin panel
- Auto-generate meta descriptions using AI

#### Phase 2: Content Optimization
- AI-powered keyword suggestions
- Content scoring against Google's Helpful Content guidelines
- Automated internal linking recommendations

#### Phase 3: Rank Tracking
- Daily position monitoring
- Local Pack tracking (critical for your business)
- Competitor analysis

### Technical Integration

```typescript
// Example: DataForSEO integration structure
interface SEOAnalysisService {
  analyzeOnPage(url: string): Promise<SEOScore>;
  trackKeywords(keywords: string[]): Promise<RankingData>;
  generateMetaDescription(content: string): Promise<string>;
  auditLocalSEO(businessId: string): Promise<LocalSEOReport>;
}
```

### Key Features to Implement

1. **SEO Dashboard** - Real-time SEO health score
2. **Keyword Tracker** - Monitor target keywords
3. **Content Analyzer** - AI-powered content recommendations
4. **Technical Audit** - Automated site health checks
5. **Competitor Monitor** - Track competitor rankings

---

## 2. 📍 Google My Business & Map 3-Pack

### Key Ranking Factors (Research Findings)

Google uses **3 primary factors** for Local Pack ranking:

1. **Relevance** - How well your GBP matches search queries
2. **Distance** - Proximity to searcher's location
3. **Prominence** - Reviews, backlinks, brand mentions

### Map 3-Pack Optimization Strategy

| Action | Priority | Impact |
|--------|----------|--------|
| Optimize GBP category selection | 🔴 Critical | High |
| Build consistent NAP citations | 🔴 Critical | High |
| Generate authentic reviews | 🟡 High | High |
| Add GBP posts regularly | 🟡 High | Medium |
| Local backlink building | 🟡 High | High |
| Schema markup on website | 🟢 Medium | Medium |

### Implementation for Your Platform

#### Admin Dashboard Features to Add

1. **GBP Manager Tab** - Manage posts, respond to reviews, update info
2. **Citation Tracker** - Monitor NAP consistency across directories
3. **Review Request Automation** - Integrate with existing BMAD workflows
4. **Local Rank Grid** - Visual map showing ranking positions

#### API Integration

- Google Business Profile API for posting/updates
- DataForSEO's Google My Business API for monitoring
- SE Ranking's Local Marketing Tool API for grid tracking

### Website SEO Checklist for Local Pack

- [ ] Add LocalBusiness schema markup
- [ ] Include city/location in title tags
- [ ] Create location-specific landing pages
- [ ] Embed Google Maps on contact page
- [ ] Add NAP in footer consistently

### GBP Optimization Checklist

- [ ] Select accurate primary category
- [ ] Add all relevant secondary categories
- [ ] Complete all business information fields
- [ ] Upload high-quality photos (minimum 10)
- [ ] Add products/services with descriptions
- [ ] Enable messaging
- [ ] Post weekly updates
- [ ] Respond to all reviews within 24 hours

---

## 3. 📱 Meta Ads & Facebook Pixel Integration

### Facebook Pixel Implementation for Next.js

**Recommended Approach:** Dual implementation (Client + Server)

#### Client-Side (Browser Tracking)

```typescript
// src/components/FacebookPixel.tsx
'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

interface FacebookPixelProps {
  pixelId: string;
}

export default function FacebookPixel({ pixelId }: FacebookPixelProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize Pixel
    (function(f: any, b: Document, e: string, v: string, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function() {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
  }, [pixelId]);

  useEffect(() => {
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [pathname]);

  return null;
}
```

#### Server-Side (Conversions API)

```typescript
// src/lib/facebook-conversions.ts
interface FacebookEvent {
  event_name: string;
  event_time: number;
  event_id: string;
  event_source_url: string;
  user_data: {
    em?: string; // hashed email
    ph?: string; // hashed phone
    client_ip_address?: string;
    client_user_agent?: string;
    fbc?: string; // click ID
    fbp?: string; // browser ID
  };
  custom_data?: {
    currency?: string;
    value?: number;
    content_name?: string;
    content_category?: string;
  };
}

export async function sendServerEvent(event: FacebookEvent) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${process.env.FB_PIXEL_ID}/events`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [event],
        access_token: process.env.FB_ACCESS_TOKEN,
      }),
    }
  );
  return response.json();
}
```

### Standard Events to Track

| Event | Trigger | Purpose |
|-------|---------|---------|
| `PageView` | Every page load | Basic tracking |
| `ViewContent` | Service page view | Interest tracking |
| `Lead` | Form submission | Lead generation |
| `Schedule` | Booking initiated | Conversion tracking |
| `Contact` | Contact form/chat | Engagement |
| `CompleteRegistration` | Account created | User acquisition |

### Meta Ads Manager Integration

#### Admin Dashboard Features

1. **Campaign Manager** - Create/manage ad campaigns
2. **Audience Builder** - Custom audiences from website visitors
3. **Performance Dashboard** - ROAS, CPA, conversions
4. **A/B Testing** - Creative and audience testing
5. **Retargeting Setup** - Automated audience creation

### Instagram Integration

- Same Pixel tracks Instagram ads
- Use Instagram Graph API for organic posting
- Schedule posts through admin dashboard
- Track engagement metrics

---

## 4. 🎵 TikTok Marketing Integration

### TikTok API for Business

#### Available APIs

| API | Purpose | Use Case |
|-----|---------|----------|
| **Marketing API** | Ad campaign management | Run TikTok ads |
| **Events API** | Conversion tracking | Track website events |
| **Content Posting API** | Organic content | Schedule posts |
| **Creator Marketplace API** | Influencer discovery | Find creators |

### Implementation Strategy

#### Phase 1: TikTok Pixel (Events API)

```typescript
// src/components/TikTokPixel.tsx
'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    ttq: any;
  }
}

export default function TikTokPixel({ pixelId }: { pixelId: string }) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize TikTok Pixel
    (function(w: any, d: Document, t: string) {
      w.TiktokAnalyticsObject = t;
      var ttq = w[t] = w[t] || [];
      ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
      ttq.setAndDefer = function(t: any, e: any) {
        t[e] = function() {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (var i = 0; i < ttq.methods.length; i++) {
        ttq.setAndDefer(ttq, ttq.methods[i]);
      }
      ttq.instance = function(t: any) {
        var e = ttq._i[t] || [];
        for (var n = 0; n < ttq.methods.length; n++) {
          ttq.setAndDefer(e, ttq.methods[n]);
        }
        return e;
      };
      ttq.load = function(e: any, n: any) {
        var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i = ttq._i || {};
        ttq._i[e] = [];
        ttq._i[e]._u = i;
        ttq._t = ttq._t || {};
        ttq._t[e] = +new Date();
        ttq._o = ttq._o || {};
        ttq._o[e] = n || {};
        var o = document.createElement("script");
        o.type = "text/javascript";
        o.async = true;
        o.src = i + "?sdkid=" + e + "&lib=" + t;
        var a = document.getElementsByTagName("script")[0];
        a.parentNode?.insertBefore(o, a);
      };
      
      ttq.load(pixelId);
      ttq.page();
    })(window, document, 'ttq');
  }, [pixelId]);

  useEffect(() => {
    if (window.ttq) {
      window.ttq.page();
    }
  }, [pathname]);

  return null;
}
```

#### Phase 2: Server-Side Events

```typescript
// src/lib/tiktok-events.ts
interface TikTokEvent {
  event: 'PageView' | 'ViewContent' | 'CompleteRegistration' | 'Contact' | 'SubmitForm';
  event_id: string;
  timestamp: string;
  user: {
    email?: string;
    phone?: string;
    external_id?: string;
  };
  page: {
    url: string;
    referrer?: string;
  };
  properties?: {
    content_type?: string;
    content_id?: string;
    currency?: string;
    value?: number;
  };
}

export async function sendTikTokEvent(event: TikTokEvent) {
  const response = await fetch(
    'https://business-api.tiktok.com/open_api/v1.3/pixel/track/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': process.env.TIKTOK_ACCESS_TOKEN!,
      },
      body: JSON.stringify({
        pixel_code: process.env.TIKTOK_PIXEL_ID,
        event: event.event,
        event_id: event.event_id,
        timestamp: event.timestamp,
        context: {
          user: event.user,
          page: event.page,
        },
        properties: event.properties,
      }),
    }
  );
  return response.json();
}
```

### TikTok Events to Track

| Event | Trigger | Purpose |
|-------|---------|---------|
| `PageView` | Every page | Basic tracking |
| `ViewContent` | Service view | Interest |
| `ClickButton` | CTA clicks | Engagement |
| `SubmitForm` | Form submission | Lead capture |
| `Contact` | Chat/call | Conversion |
| `CompleteRegistration` | Sign up | User acquisition |

---

## 5. 🎯 Lead Generation & Management Features

### Current State (Your Platform)

✅ GoHighLevel CRM integration  
✅ BMAD workflow automation  
✅ PMU Chatbot for lead capture  
✅ Booking system with GHL sync  

### Recommended Enhancements

#### Lead Capture Expansion

1. **Multi-Channel Lead Forms**
   - Facebook Lead Ads sync
   - TikTok Lead Gen sync
   - Instagram Lead Forms
   - Google Ads Lead Forms

2. **Lead Scoring System**
   ```typescript
   interface LeadScore {
     behavioral: number;  // Page visits, time on site
     demographic: number; // Location, age match
     engagement: number;  // Email opens, clicks
     intent: number;      // Service pages, pricing views
     total: number;
   }
   
   function calculateLeadScore(lead: Lead): LeadScore {
     // Behavioral scoring
     const behavioral = 
       (lead.pageViews * 2) +
       (lead.timeOnSite / 60) +
       (lead.returnVisits * 5);
     
     // Engagement scoring
     const engagement =
       (lead.emailOpens * 3) +
       (lead.emailClicks * 5) +
       (lead.chatInteractions * 10);
     
     // Intent scoring
     const intent =
       (lead.viewedPricing ? 20 : 0) +
       (lead.viewedServices ? 15 : 0) +
       (lead.startedBooking ? 30 : 0);
     
     return {
       behavioral,
       demographic: calculateDemographicScore(lead),
       engagement,
       intent,
       total: behavioral + engagement + intent
     };
   }
   ```

3. **Lead Nurturing Automation**
   - Drip email campaigns
   - SMS sequences
   - Retargeting audiences

### Admin Dashboard Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Lead Pipeline View | Visual kanban board | 🔴 High |
| Lead Source Analytics | Track where leads come from | 🔴 High |
| Conversion Funnels | Visualize customer journey | 🟡 Medium |
| ROI Calculator | Ad spend vs revenue | 🟡 Medium |
| Lead Assignment | Auto-assign to artists | 🟢 Medium |

### Lead Source Tracking

```typescript
interface LeadSource {
  channel: 'organic' | 'paid' | 'social' | 'referral' | 'direct';
  platform: 'google' | 'facebook' | 'instagram' | 'tiktok' | 'website' | 'chatbot';
  campaign?: string;
  adSet?: string;
  ad?: string;
  keyword?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}
```

---

## 6. 🎠 Hero Carousel with Testimonials & Certifications

### Current Hero State

The current `Hero.tsx` uses a static background image with "Wake Up Flawless" messaging and Book Now CTA.

### Recommended Carousel Implementation

#### Content Slides

1. **Hero Video/Image** - Main brand message + Book Now CTA
2. **Testimonials Carousel** - Rotating client reviews
3. **Certifications Display** - Trust badges and credentials
4. **Before/After Gallery** - Results showcase

### Technical Implementation

```typescript
// src/components/HeroCarousel.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CarouselSlide {
  id: string;
  type: 'hero' | 'testimonial' | 'certification' | 'gallery';
  background: string;
  content: {
    heading?: string;
    subheading?: string;
    testimonial?: {
      text: string;
      author: string;
      service: string;
      rating: number;
      image: string;
    };
    certifications?: Array<{
      name: string;
      logo: string;
      year: string;
    }>;
    beforeAfter?: Array<{
      before: string;
      after: string;
      service: string;
    }>;
  };
  cta?: {
    text: string;
    link: string;
    variant: 'primary' | 'secondary';
  };
}

interface HeroCarouselProps {
  slides: CarouselSlide[];
  autoPlayInterval?: number;
}

export default function HeroCarousel({ 
  slides, 
  autoPlayInterval = 6000 
}: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [slides.length, autoPlayInterval, isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % slides.length);
  const prevSlide = () => goToSlide((currentSlide - 1 + slides.length) % slides.length);

  return (
    <section className="hero-carousel position-relative" style={{ height: '100vh' }}>
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`carousel-slide position-absolute w-100 h-100 ${
            index === currentSlide ? 'active' : ''
          }`}
          style={{
            opacity: index === currentSlide ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            backgroundImage: `url(${slide.background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Dark Overlay */}
          <div 
            className="position-absolute w-100 h-100" 
            style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} 
          />
          
          {/* Content */}
          <div className="container h-100 d-flex align-items-center position-relative">
            {renderSlideContent(slide)}
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="carousel-nav carousel-nav-prev"
        aria-label="Previous slide"
      >
        <i className="fas fa-chevron-left" />
      </button>
      <button
        onClick={nextSlide}
        className="carousel-nav carousel-nav-next"
        aria-label="Next slide"
      >
        <i className="fas fa-chevron-right" />
      </button>

      {/* Dots Indicator */}
      <div className="carousel-dots position-absolute bottom-0 start-50 translate-middle-x mb-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Sticky Book Now Button */}
      <div className="position-fixed bottom-0 start-0 w-100 p-3 d-md-none" style={{ zIndex: 1000 }}>
        <Link
          href="/book-now-custom"
          className="btn btn-primary btn-lg w-100 rounded-pill"
        >
          Book Now
        </Link>
      </div>
    </section>
  );
}

function renderSlideContent(slide: CarouselSlide) {
  switch (slide.type) {
    case 'hero':
      return (
        <div className="text-center text-white">
          <h1 className="display-3 fw-bold mb-4">{slide.content.heading}</h1>
          <p className="lead mb-4">{slide.content.subheading}</p>
          {slide.cta && (
            <Link href={slide.cta.link} className="btn btn-primary btn-lg rounded-pill px-5">
              {slide.cta.text}
            </Link>
          )}
        </div>
      );
    
    case 'testimonial':
      const testimonial = slide.content.testimonial!;
      return (
        <div className="text-center text-white mx-auto" style={{ maxWidth: '800px' }}>
          <div className="mb-4">
            {[...Array(testimonial.rating)].map((_, i) => (
              <i key={i} className="fas fa-star text-warning me-1" />
            ))}
          </div>
          <blockquote className="fs-4 mb-4">"{testimonial.text}"</blockquote>
          <div className="d-flex align-items-center justify-content-center">
            <img
              src={testimonial.image}
              alt={testimonial.author}
              className="rounded-circle me-3"
              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
            />
            <div className="text-start">
              <div className="fw-semibold">{testimonial.author}</div>
              <div className="text-white-50">{testimonial.service}</div>
            </div>
          </div>
        </div>
      );
    
    case 'certification':
      return (
        <div className="text-center text-white">
          <h2 className="display-5 fw-bold mb-5">Certified Excellence</h2>
          <div className="row justify-content-center g-4">
            {slide.content.certifications?.map((cert, index) => (
              <div key={index} className="col-6 col-md-3">
                <div className="bg-white rounded-3 p-4">
                  <img src={cert.logo} alt={cert.name} className="img-fluid mb-2" />
                  <div className="text-dark small">{cert.name}</div>
                  <div className="text-muted small">{cert.year}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    
    default:
      return null;
  }
}
```

### Book Now CTA Optimization

- **Sticky CTA** - Fixed button that follows scroll on mobile
- **Multiple Entry Points** - Hero, navbar, floating button
- **Mobile Optimization** - Thumb-friendly placement
- **Urgency Elements** - "Limited spots available" messaging

---

## 7. 🌟 Celebrity Ad Campaign Strategy

### Research Findings: Beauty Industry Best Practices

#### Successful Campaign Examples

| Brand | Strategy | Results |
|-------|----------|---------|
| **Rhode Beauty** | Hailey Bieber + viral TikTok challenge | #RhodeLips trending, massive UGC |
| **Fenty Beauty** | Diverse influencer army + #FentyFace | Global inclusivity movement |
| **Glossier** | Micro + macro influencer mix | Authentic community building |
| **Dove** | Real beauty social movement | Emotional connection, brand loyalty |

### Celebrity Campaign Framework for PMU

#### Tier 1: Local Celebrity/Influencer
- Local news anchors, radio personalities
- Regional beauty influencers (10K-100K followers)
- Cost: $500-$5,000 per post
- ROI: High local awareness

#### Tier 2: Micro-Influencers
- Beauty/lifestyle creators (1K-10K followers)
- High engagement rates (5-15%)
- Cost: Product exchange or $100-$500
- ROI: Authentic UGC, high conversion

#### Tier 3: Celebrity Partnership
- Reality TV personalities
- Local athletes/personalities
- Regional celebrities
- Cost: $5,000-$50,000+
- ROI: Mass awareness, credibility

### Campaign Structure

#### Phase 1: Seed Content (Weeks 1-4)
- Partner with 5-10 micro-influencers
- Create before/after content
- Build UGC library
- Test messaging and visuals

#### Phase 2: Amplification (Weeks 5-8)
- Use UGC in paid ads
- Retarget engaged audiences
- Create lookalike audiences
- Scale winning creatives

#### Phase 3: Celebrity Launch (Weeks 9-12)
- Partner with 1-2 local celebrities
- Document their PMU journey
- Create viral challenge hashtag
- PR and media outreach

### Campaign Hashtag Strategy

| Type | Hashtag | Purpose |
|------|---------|---------|
| **Primary** | #WakeUpFlawless | Brand awareness |
| **Service** | #MicrobladingByVictoria | Artist branding |
| **Challenge** | #PMUTransformation | UGC generation |
| **Location** | #RaleighPMU | Local SEO |
| **Trend** | #BrowGoals | Discoverability |

### Influencer Outreach Template

```markdown
Subject: Collaboration Opportunity - Permanent Makeup Experience

Hi [Name],

I've been following your content and love your authentic approach to beauty! 
I'm reaching out from A Pretty Girl Matter, a premier permanent makeup studio.

We'd love to offer you a complimentary [service] experience in exchange for 
sharing your journey with your followers. Our services include:

- Microblading ($500 value)
- Powder Brows ($450 value)
- Lip Blush ($400 value)

What we're looking for:
- 1 Instagram Reel/TikTok documenting your experience
- 2-3 Stories on treatment day
- Before/after photos

Interested? Let's chat!

Best,
[Your Name]
A Pretty Girl Matter
```

### Celebrity Campaign Budget Template

| Item | Low Budget | Medium Budget | High Budget |
|------|------------|---------------|-------------|
| Micro-influencers (10) | $1,000 | $2,500 | $5,000 |
| Local celebrity (1) | $2,000 | $5,000 | $15,000 |
| Content production | $500 | $2,000 | $5,000 |
| Paid amplification | $1,000 | $5,000 | $15,000 |
| PR/Media | $0 | $1,000 | $5,000 |
| **Total** | **$4,500** | **$15,500** | **$45,000** |

---

## 8. 💬 GHL AI SMS Chat Management

### Overview

GoHighLevel's AI SMS Chat (Conversation AI) enables automated text message conversations with leads and customers. This section outlines how to create a **wizard-based system** for training the AI to respond accurately to PMU-related inquiries and secure bookings.

### Key Objectives

1. **Accurate Responses** - AI only answers based on actual PMU website content
2. **Booking Focus** - Primary goal is securing appointments
3. **No Hallucination** - AI must not make up information
4. **Brand Voice** - Consistent, professional, warm communication style
5. **Easy Configuration** - Wizard-guided prompt generation

### GHL Conversation AI Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  GHL AI SMS CHAT SYSTEM                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   WIZARD    │───▶│   PROMPT    │───▶│  GHL API    │     │
│  │  INTERFACE  │    │  GENERATOR  │    │  CONFIG     │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                  │                  │             │
│         ▼                  ▼                  ▼             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  KNOWLEDGE  │    │   PROMPT    │    │ CONVERSATION│     │
│  │    BASE     │    │  TEMPLATES  │    │    LOGS     │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### AI SMS Chat Prompt Best Practices

#### 1. System Prompt Structure

```markdown
## ROLE
You are [Business Name]'s virtual assistant for permanent makeup services. 
Your primary goal is to help potential clients book appointments.

## KNOWLEDGE BASE
You ONLY have knowledge about:
- Services offered: [list from website]
- Pricing: [exact prices from website]
- Artists: [artist names and specialties]
- Location: [address]
- Hours: [business hours]
- Policies: [booking, cancellation, deposit policies]

## RULES
1. NEVER make up information not in your knowledge base
2. If unsure, say "Let me connect you with our team for that specific question"
3. Always guide conversations toward booking
4. Be warm, professional, and concise
5. Use the client's name when known
6. Respond in 1-3 sentences maximum

## BOOKING FLOW
1. Greet warmly
2. Identify service interest
3. Answer questions from knowledge base
4. Suggest booking
5. Provide booking link or offer to schedule
```

#### 2. Knowledge Base Content Sources

| Source | Content Type | Auto-Sync |
|--------|--------------|-----------|
| Website Services Page | Service descriptions, pricing | ✅ Yes |
| FAQ Page | Common questions/answers | ✅ Yes |
| About Page | Artist bios, certifications | ✅ Yes |
| Policies Page | Booking, cancellation, aftercare | ✅ Yes |
| Google Business Profile | Hours, location, reviews | ✅ Yes |
| Manual Entries | Special offers, seasonal info | ❌ Manual |

### Prompt Templates for PMU Business

#### Template 1: Initial Greeting Response

```
Hi {first_name}! 👋 Thanks for reaching out to A Pretty Girl Matter! 

I'm here to help you with any questions about our permanent makeup services. Are you interested in:
• Microblading
• Powder Brows  
• Lip Blush
• Eyeliner

Or do you have a specific question I can help with?
```

#### Template 2: Service Inquiry Response

```
Great choice! {service_name} is one of our most popular services! ✨

Here's what you need to know:
• Duration: {duration}
• Price: {price}
• Includes: {what_included}
• Healing time: {healing_time}

Would you like to book a consultation or schedule your appointment? I can check our availability for you!
```

#### Template 3: Pricing Question Response

```
Happy to help with pricing! 💰

{service_name}: {price}
This includes:
{inclusions}

We require a {deposit_amount} deposit to secure your appointment. 

Ready to book? Here's our calendar: {booking_link}
```

#### Template 4: Booking Confirmation Push

```
Perfect! Let me help you get booked! 📅

Our next available appointments are:
• {date_1} at {time_1}
• {date_2} at {time_2}
• {date_3} at {time_3}

Which works best for you? Or you can book directly here: {booking_link}
```

#### Template 5: Unknown Question Fallback

```
That's a great question! I want to make sure you get the most accurate information.

Let me connect you with our team who can help with that specific question. In the meantime, feel free to:
• Visit our website: {website_url}
• Call us: {phone_number}
• Book a free consultation: {booking_link}

Is there anything else about our services I can help with?
```

#### Template 6: Objection Handling - Price

```
I completely understand - it's an investment in yourself! 💎

Here's why our clients love the value:
• Results last {duration}
• Includes free touch-up within {touchup_period}
• Performed by certified artists with {years} years experience
• Premium pigments and techniques

Many clients say it saves them {time_saved} every morning! Would you like to see some before/after photos or book a consultation to discuss?
```

#### Template 7: Objection Handling - Pain/Fear

```
Totally understand the concern! 🤗

Here's the good news:
• We use professional numbing cream
• Most clients describe it as "light scratching"
• Our artists are gentle and experienced
• We go at YOUR pace

Would you like to book a free consultation to meet your artist and ask questions in person? No commitment required!
```

### Wizard Configuration Interface

#### Step 1: Business Information

```typescript
interface BusinessInfoStep {
  businessName: string;
  tagline: string;
  brandVoice: 'professional' | 'friendly' | 'luxurious' | 'casual';
  primaryGoal: 'bookings' | 'consultations' | 'information';
  responseStyle: 'concise' | 'detailed' | 'conversational';
}
```

#### Step 2: Services Configuration

```typescript
interface ServiceConfig {
  name: string;
  description: string;
  price: number;
  duration: string;
  healingTime: string;
  inclusions: string[];
  contraindications: string[];
  faqs: Array<{ question: string; answer: string }>;
}
```

#### Step 3: Response Templates

```typescript
interface ResponseTemplates {
  greeting: string;
  serviceInquiry: string;
  pricingResponse: string;
  bookingPush: string;
  fallbackResponse: string;
  objectionHandling: {
    price: string;
    pain: string;
    time: string;
    trust: string;
  };
  closingMessages: string[];
}
```

#### Step 4: Knowledge Base Sync

```typescript
interface KnowledgeBaseConfig {
  websiteUrl: string;
  pagesToScrape: string[];
  syncFrequency: 'daily' | 'weekly' | 'manual';
  customEntries: Array<{
    topic: string;
    content: string;
    keywords: string[];
  }>;
}
```

#### Step 5: Guardrails & Boundaries

```typescript
interface AIGuardrails {
  maxResponseLength: number;
  forbiddenTopics: string[];
  escalationTriggers: string[];
  humanHandoffKeywords: string[];
  competitorMentionResponse: string;
  outOfScopeResponse: string;
}
```

### Implementation: AI SMS Chat Wizard Component

```typescript
// src/components/admin/AISmsChatWizard.tsx
'use client';
import { useState } from 'react';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'business-info',
    title: 'Business Information',
    description: 'Set up your business details and brand voice',
    component: BusinessInfoForm,
  },
  {
    id: 'services',
    title: 'Services & Pricing',
    description: 'Configure your PMU services and pricing',
    component: ServicesConfigForm,
  },
  {
    id: 'knowledge-base',
    title: 'Knowledge Base',
    description: 'Import content from your website',
    component: KnowledgeBaseForm,
  },
  {
    id: 'templates',
    title: 'Response Templates',
    description: 'Customize AI response templates',
    component: ResponseTemplatesForm,
  },
  {
    id: 'guardrails',
    title: 'AI Guardrails',
    description: 'Set boundaries and escalation rules',
    component: GuardrailsForm,
  },
  {
    id: 'preview',
    title: 'Preview & Test',
    description: 'Test your AI configuration',
    component: PreviewAndTest,
  },
  {
    id: 'deploy',
    title: 'Deploy to GHL',
    description: 'Push configuration to GoHighLevel',
    component: DeployToGHL,
  },
];

export default function AISmsChatWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<AISmsChatConfig>({});

  const handleNext = (stepData: any) => {
    setConfig(prev => ({ ...prev, ...stepData }));
    setCurrentStep(prev => Math.min(prev + 1, WIZARD_STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const CurrentStepComponent = WIZARD_STEPS[currentStep].component;

  return (
    <div className="ai-sms-wizard">
      {/* Progress Bar */}
      <div className="wizard-progress mb-4">
        {WIZARD_STEPS.map((step, index) => (
          <div
            key={step.id}
            className={`wizard-step ${index <= currentStep ? 'active' : ''}`}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-title">{step.title}</div>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="wizard-content">
        <h3>{WIZARD_STEPS[currentStep].title}</h3>
        <p className="text-muted">{WIZARD_STEPS[currentStep].description}</p>
        
        <CurrentStepComponent
          config={config}
          onNext={handleNext}
          onBack={handleBack}
        />
      </div>
    </div>
  );
}
```

### Generated System Prompt Example

After completing the wizard, the system generates a comprehensive prompt:

```markdown
# A Pretty Girl Matter - AI SMS Assistant

## YOUR IDENTITY
You are Victoria's virtual assistant at A Pretty Girl Matter, a premier permanent makeup studio in Raleigh, NC. You are warm, professional, and knowledgeable about PMU services.

## YOUR PRIMARY GOAL
Help potential clients book appointments for permanent makeup services. Every conversation should guide toward scheduling.

## KNOWLEDGE BASE - SERVICES

### Microblading - $500
- Duration: 2-3 hours
- Healing: 4-6 weeks
- Includes: Initial session + 6-week touch-up
- Best for: Natural, hair-stroke brow look
- Lasts: 12-18 months

### Powder Brows - $450
- Duration: 2-3 hours  
- Healing: 4-6 weeks
- Includes: Initial session + 6-week touch-up
- Best for: Soft, filled-in makeup look
- Lasts: 2-3 years

### Lip Blush - $400
- Duration: 2-3 hours
- Healing: 4-6 weeks
- Includes: Initial session + 6-week touch-up
- Best for: Natural lip color enhancement
- Lasts: 2-3 years

## KNOWLEDGE BASE - POLICIES

### Booking
- $100 deposit required to book
- Deposit applied to service total
- Book online: aprettygirlmatter.com/book

### Cancellation
- 48-hour notice required
- Late cancellation forfeits deposit
- Rescheduling allowed with 24-hour notice

### Preparation
- No alcohol 24 hours before
- No blood thinners 1 week before
- No retinol 2 weeks before
- Come with clean skin

## RESPONSE RULES

1. Keep responses under 160 characters when possible (SMS friendly)
2. Use emojis sparingly (1-2 per message max)
3. Always include a call-to-action
4. If asked something not in knowledge base, say: "Great question! Let me have Victoria reach out to you directly about that. In the meantime, would you like to book a consultation?"
5. Never discuss competitors
6. Never make up prices, policies, or information
7. Use client's first name when known

## ESCALATION TRIGGERS
Transfer to human when client mentions:
- Complaint or dissatisfaction
- Medical conditions
- Refund request
- Legal concerns
- Repeated questions not in knowledge base

## BOOKING LINK
https://aprettygirlmatter.com/book-now-custom

## BUSINESS HOURS
Tuesday - Saturday: 9am - 6pm
Sunday - Monday: Closed

## LOCATION
123 Beauty Lane, Raleigh, NC 27601
```

### GHL API Integration

```typescript
// src/services/ghl-ai-sms.ts
import { GHLOrchestrator } from './ghl-orchestrator';

interface AIBotConfig {
  name: string;
  systemPrompt: string;
  knowledgeBase: string;
  temperature: number;
  maxTokens: number;
  escalationRules: EscalationRule[];
}

export class GHLAISmsService {
  private orchestrator: GHLOrchestrator;

  constructor(apiKey: string, locationId: string) {
    this.orchestrator = new GHLOrchestrator({ apiKey, locationId });
  }

  async deployAIBot(config: AIBotConfig): Promise<void> {
    // Deploy system prompt to GHL Conversation AI
    await this.orchestrator.updateConversationAI({
      enabled: true,
      systemPrompt: config.systemPrompt,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
    });
  }

  async updateKnowledgeBase(content: string): Promise<void> {
    // Update the knowledge base content
    await this.orchestrator.updateKnowledgeBase({
      content,
      lastUpdated: new Date().toISOString(),
    });
  }

  async testConversation(messages: string[]): Promise<string[]> {
    // Test the AI with sample messages
    const responses: string[] = [];
    for (const message of messages) {
      const response = await this.orchestrator.testAIResponse(message);
      responses.push(response);
    }
    return responses;
  }

  async getConversationAnalytics(): Promise<ConversationAnalytics> {
    return this.orchestrator.getConversationStats();
  }
}
```

### Testing & Quality Assurance

#### Test Scenarios

| Scenario | Input | Expected Output |
|----------|-------|-----------------|
| Service inquiry | "How much is microblading?" | Price + inclusions + booking CTA |
| Booking request | "I want to book" | Available times + booking link |
| Unknown question | "Do you do tattoo removal?" | Fallback + redirect to team |
| Pain concern | "Does it hurt?" | Reassurance + consultation offer |
| Location question | "Where are you located?" | Address + directions link |

#### Conversation Flow Test

```typescript
const testConversations = [
  {
    name: 'Happy Path - Booking',
    messages: [
      { role: 'user', content: 'Hi, interested in microblading' },
      { role: 'user', content: 'How much does it cost?' },
      { role: 'user', content: 'Sounds good, how do I book?' },
    ],
    expectedOutcome: 'booking_link_provided',
  },
  {
    name: 'Objection Handling - Price',
    messages: [
      { role: 'user', content: 'Microblading prices?' },
      { role: 'user', content: 'That seems expensive' },
    ],
    expectedOutcome: 'value_proposition_delivered',
  },
  {
    name: 'Out of Scope - Escalation',
    messages: [
      { role: 'user', content: 'I had a bad reaction to my procedure' },
    ],
    expectedOutcome: 'human_handoff_triggered',
  },
];
```

### Metrics & Analytics Dashboard

| Metric | Description | Target |
|--------|-------------|--------|
| Response Rate | % of messages responded to | >95% |
| Booking Conversion | % of conversations → bookings | >15% |
| Escalation Rate | % requiring human handoff | <10% |
| Avg Response Time | Time to first response | <30 sec |
| Customer Satisfaction | Post-conversation rating | >4.5/5 |
| Fallback Rate | % using fallback response | <20% |

---

## 9. 🧙 Wizard-Based Configuration System

### Overview

All platform features should use a **wizard-based configuration** approach to make setup intuitive and error-free. This ensures non-technical users can configure complex features without developer assistance.

### Wizard Design Principles

1. **Progressive Disclosure** - Show only relevant options at each step
2. **Validation at Each Step** - Prevent errors before they happen
3. **Preview Before Deploy** - Always show what will be created
4. **Save Progress** - Allow users to continue later
5. **Contextual Help** - Tooltips and examples throughout
6. **Undo/Rollback** - Easy way to revert changes

### Wizard Architecture

```typescript
// src/components/wizards/WizardFramework.tsx
interface WizardConfig {
  id: string;
  title: string;
  description: string;
  steps: WizardStep[];
  onComplete: (data: any) => Promise<void>;
  allowSkip?: boolean;
  saveProgress?: boolean;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  component: React.ComponentType<WizardStepProps>;
  validation?: (data: any) => ValidationResult;
  optional?: boolean;
  helpContent?: string;
}

interface WizardStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  errors: ValidationError[];
}
```

### Feature Wizards to Implement

#### 1. SEO Setup Wizard

| Step | Title | Description |
|------|-------|-------------|
| 1 | Business Info | Name, location, industry |
| 2 | Target Keywords | Primary and secondary keywords |
| 3 | Competitor URLs | Competitors to track |
| 4 | API Configuration | DataForSEO credentials |
| 5 | Tracking Schedule | Daily/weekly monitoring |
| 6 | Review & Deploy | Preview and activate |

#### 2. Facebook Pixel Wizard

| Step | Title | Description |
|------|-------|-------------|
| 1 | Pixel ID | Enter Facebook Pixel ID |
| 2 | Events Selection | Choose events to track |
| 3 | Conversions API | Server-side tracking setup |
| 4 | Test Events | Verify pixel is firing |
| 5 | Custom Audiences | Create retargeting audiences |
| 6 | Deploy | Add to website |

#### 3. TikTok Pixel Wizard

| Step | Title | Description |
|------|-------|-------------|
| 1 | Pixel ID | Enter TikTok Pixel ID |
| 2 | Events Selection | Choose events to track |
| 3 | Events API | Server-side tracking |
| 4 | Test Mode | Verify tracking |
| 5 | Deploy | Add to website |

#### 4. Google Business Profile Wizard

| Step | Title | Description |
|------|-------|-------------|
| 1 | Connect Account | OAuth with Google |
| 2 | Select Location | Choose business location |
| 3 | Audit Profile | Check completeness |
| 4 | Optimization Tips | Recommendations |
| 5 | Review Automation | Set up review requests |
| 6 | Post Scheduler | Schedule GBP posts |

#### 5. Lead Capture Wizard

| Step | Title | Description |
|------|-------|-------------|
| 1 | Form Type | Popup, embedded, exit-intent |
| 2 | Fields | Name, email, phone, service |
| 3 | Design | Colors, branding |
| 4 | Triggers | When to show form |
| 5 | Integration | GHL pipeline assignment |
| 6 | Thank You | Confirmation message |

#### 6. Hero Carousel Wizard

| Step | Title | Description |
|------|-------|-------------|
| 1 | Slide Count | Number of slides |
| 2 | Slide Content | Images, videos, text |
| 3 | Testimonials | Select reviews to feature |
| 4 | Certifications | Upload badges |
| 5 | CTA Buttons | Configure calls-to-action |
| 6 | Animation | Transition effects |
| 7 | Preview | See carousel in action |

#### 7. Influencer Campaign Wizard

| Step | Title | Description |
|------|-------|-------------|
| 1 | Campaign Goals | Awareness, bookings, UGC |
| 2 | Budget | Total campaign budget |
| 3 | Influencer Criteria | Followers, niche, location |
| 4 | Deliverables | Posts, stories, reels |
| 5 | Contract Template | Agreement terms |
| 6 | Tracking | UTM codes, promo codes |
| 7 | Launch | Activate campaign |

#### 8. AI SMS Chat Wizard (Detailed Above)

| Step | Title | Description |
|------|-------|-------------|
| 1 | Business Info | Brand voice, goals |
| 2 | Services | PMU services and pricing |
| 3 | Knowledge Base | Website content import |
| 4 | Templates | Response templates |
| 5 | Guardrails | AI boundaries |
| 6 | Preview & Test | Test conversations |
| 7 | Deploy to GHL | Push to GoHighLevel |

### Wizard UI Component

```typescript
// src/components/wizards/ConfigurationWizard.tsx
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfigurationWizardProps {
  config: WizardConfig;
  initialData?: any;
  onComplete: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function ConfigurationWizard({
  config,
  initialData = {},
  onComplete,
  onCancel,
}: ConfigurationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepConfig = config.steps[currentStep];
  const isLastStep = currentStep === config.steps.length - 1;
  const isFirstStep = currentStep === 0;

  const validateCurrentStep = (): boolean => {
    if (!currentStepConfig.validation) return true;
    const result = currentStepConfig.validation(data);
    setErrors(result.errors || []);
    return result.isValid;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;

    if (isLastStep) {
      setIsSubmitting(true);
      try {
        await onComplete(data);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCurrentStep(prev => prev + 1);
      setErrors([]);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
      setErrors([]);
    }
  };

  const StepComponent = currentStepConfig.component;

  return (
    <div className="configuration-wizard">
      {/* Header */}
      <div className="wizard-header">
        <h2>{config.title}</h2>
        <p className="text-muted">{config.description}</p>
      </div>

      {/* Progress Steps */}
      <div className="wizard-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / config.steps.length) * 100}%` }}
          />
        </div>
        <div className="step-indicators">
          {config.steps.map((step, index) => (
            <div
              key={step.id}
              className={`step-indicator ${
                index < currentStep ? 'completed' : 
                index === currentStep ? 'active' : 'pending'
              }`}
            >
              <div className="step-icon">
                {index < currentStep ? (
                  <i className="fas fa-check" />
                ) : (
                  <i className={step.icon} />
                )}
              </div>
              <span className="step-label">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="wizard-content"
        >
          <div className="step-header">
            <h3>{currentStepConfig.title}</h3>
            <p>{currentStepConfig.description}</p>
            {currentStepConfig.helpContent && (
              <div className="help-tooltip">
                <i className="fas fa-question-circle" />
                <span>{currentStepConfig.helpContent}</span>
              </div>
            )}
          </div>

          <StepComponent
            data={data}
            onChange={setData}
            errors={errors}
          />
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="wizard-navigation">
        <button
          className="btn btn-outline-secondary"
          onClick={onCancel}
        >
          Cancel
        </button>
        
        <div className="nav-buttons">
          {!isFirstStep && (
            <button
              className="btn btn-secondary"
              onClick={handleBack}
            >
              <i className="fas fa-arrow-left me-2" />
              Back
            </button>
          )}
          
          <button
            className="btn btn-primary"
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Saving...
              </>
            ) : isLastStep ? (
              <>
                Complete Setup
                <i className="fas fa-check ms-2" />
              </>
            ) : (
              <>
                Next
                <i className="fas fa-arrow-right ms-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Admin Dashboard Integration

```typescript
// Add to admin dashboard tabs
const WIZARD_TABS = [
  {
    id: 'setup-wizards',
    title: 'Setup Wizards',
    icon: 'fas fa-magic',
    component: SetupWizardsHub,
  },
];

// SetupWizardsHub.tsx
export default function SetupWizardsHub() {
  const wizards = [
    {
      id: 'seo',
      title: 'SEO Setup',
      description: 'Configure SEO tracking and optimization',
      icon: 'fas fa-search',
      status: 'not_started', // 'not_started' | 'in_progress' | 'completed'
    },
    {
      id: 'facebook-pixel',
      title: 'Facebook Pixel',
      description: 'Set up Meta conversion tracking',
      icon: 'fab fa-facebook',
      status: 'completed',
    },
    {
      id: 'tiktok-pixel',
      title: 'TikTok Pixel',
      description: 'Configure TikTok event tracking',
      icon: 'fab fa-tiktok',
      status: 'not_started',
    },
    {
      id: 'gbp',
      title: 'Google Business Profile',
      description: 'Optimize your local presence',
      icon: 'fab fa-google',
      status: 'in_progress',
    },
    {
      id: 'ai-sms',
      title: 'AI SMS Chat',
      description: 'Train your AI booking assistant',
      icon: 'fas fa-robot',
      status: 'not_started',
    },
    {
      id: 'hero-carousel',
      title: 'Hero Carousel',
      description: 'Configure homepage carousel',
      icon: 'fas fa-images',
      status: 'not_started',
    },
    {
      id: 'lead-capture',
      title: 'Lead Capture',
      description: 'Set up lead generation forms',
      icon: 'fas fa-user-plus',
      status: 'completed',
    },
    {
      id: 'influencer',
      title: 'Influencer Campaign',
      description: 'Launch influencer marketing',
      icon: 'fas fa-star',
      status: 'not_started',
    },
  ];

  return (
    <div className="setup-wizards-hub">
      <h2>Setup Wizards</h2>
      <p className="text-muted">
        Configure your marketing platform with guided setup wizards
      </p>

      <div className="row g-4 mt-3">
        {wizards.map(wizard => (
          <div key={wizard.id} className="col-md-6 col-lg-4">
            <WizardCard wizard={wizard} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Wizard State Persistence

```typescript
// src/services/wizard-state.ts
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface WizardState {
  wizardId: string;
  currentStep: number;
  data: any;
  lastUpdated: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

export async function saveWizardState(
  userId: string,
  state: WizardState
): Promise<void> {
  await setDoc(
    doc(db, 'wizard-states', `${userId}_${state.wizardId}`),
    {
      ...state,
      lastUpdated: new Date().toISOString(),
    }
  );
}

export async function getWizardState(
  userId: string,
  wizardId: string
): Promise<WizardState | null> {
  const docRef = doc(db, 'wizard-states', `${userId}_${wizardId}`);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as WizardState : null;
}

export async function completeWizard(
  userId: string,
  wizardId: string,
  finalData: any
): Promise<void> {
  await setDoc(
    doc(db, 'wizard-states', `${userId}_${wizardId}`),
    {
      wizardId,
      currentStep: -1, // Indicates completed
      data: finalData,
      lastUpdated: new Date().toISOString(),
      status: 'completed',
    }
  );
}
```

---

## 10. 🚀 Lead Generation Automation Workflows (GHL Implementation)

### Overview

Lead generation automation is the systematic use of technology to capture, qualify, nurture, and convert leads with minimal manual intervention. Research shows that companies using automated lead nurturing see **451% increase in qualified leads** and **50% more sales-ready leads at 33% lower cost**.

### The 8 Essential Lead Generation Workflows

Based on industry best practices and GHL capabilities, these workflows form a complete lead generation automation system:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    LEAD GENERATION AUTOMATION SYSTEM                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│   │   CAPTURE    │───▶│   QUALIFY    │───▶│   NURTURE    │              │
│   │  Workflows   │    │  Workflows   │    │  Workflows   │              │
│   └──────────────┘    └──────────────┘    └──────────────┘              │
│          │                   │                   │                       │
│          ▼                   ▼                   ▼                       │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│   │ Form Submit  │    │ Lead Scoring │    │ Drip Email   │              │
│   │ FB/TikTok Ad │    │ Engagement   │    │ SMS Sequence │              │
│   │ Website Chat │    │ Qualification│    │ Multi-Channel│              │
│   └──────────────┘    └──────────────┘    └──────────────┘              │
│                                                                          │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│   │   CONVERT    │───▶│   RETAIN     │───▶│  RE-ENGAGE   │              │
│   │  Workflows   │    │  Workflows   │    │  Workflows   │              │
│   └──────────────┘    └──────────────┘    └──────────────┘              │
│          │                   │                   │                       │
│          ▼                   ▼                   ▼                       │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│   │ Booking Push │    │ Review Req   │    │ Win-Back     │              │
│   │ Deposit Coll │    │ Referral Ask │    │ Cold Lead    │              │
│   │ Appointment  │    │ Onboarding   │    │ Reactivation │              │
│   └──────────────┘    └──────────────┘    └──────────────┘              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### Workflow 1: New Lead Capture & Instant Response

**Purpose:** Capture leads from multiple sources and respond within 5 minutes (leads contacted within 5 minutes are 21x more likely to convert).

**GHL Trigger:** `Form Submitted` | `Facebook Lead Form Submitted` | `TikTok Form Submitted`

```typescript
// GHL Workflow Configuration
interface NewLeadCaptureWorkflow {
  name: 'PMU New Lead - Instant Response';
  triggers: [
    { type: 'form_submitted'; filter: { formName: 'PMU Consultation Request' } },
    { type: 'facebook_lead_form_submitted'; filter: { formId: 'fb_pmu_lead_form' } },
    { type: 'tiktok_form_submitted'; filter: { formId: 'tiktok_pmu_form' } }
  ];
  actions: [
    // Step 1: Create/Update Contact
    { type: 'create_contact'; data: '{{form_data}}' },
    
    // Step 2: Add to Pipeline
    { type: 'create_opportunity'; pipeline: 'PMU Sales'; stage: 'New Lead' },
    
    // Step 3: Add Tag for Tracking
    { type: 'add_tag'; tag: 'new-lead-{{source}}' },
    
    // Step 4: Instant SMS (within seconds)
    { 
      type: 'send_sms';
      message: `Hi {{contact.first_name}}! 🌟 Thanks for your interest in permanent makeup at Atlanta Glamour PMU! 

I'm so excited to help you achieve your beauty goals. What service are you most interested in?

1️⃣ Microblading
2️⃣ Powder Brows  
3️⃣ Lip Blush
4️⃣ Eyeliner

Just reply with the number!

- Sarah, PMU Artist`
    },
    
    // Step 5: Wait 2 minutes
    { type: 'wait'; duration: '2 minutes' },
    
    // Step 6: Send Welcome Email
    {
      type: 'send_email';
      subject: 'Welcome to Atlanta Glamour PMU! 💄';
      template: 'new_lead_welcome_email'
    },
    
    // Step 7: Internal Notification
    {
      type: 'send_internal_notification';
      to: 'owner';
      message: '🚨 New PMU Lead: {{contact.full_name}} - {{contact.phone}}'
    },
    
    // Step 8: Assign to Team Member (Round Robin)
    { type: 'assign_to_user'; method: 'round_robin'; users: ['sarah', 'jessica'] }
  ];
}
```

**SMS Templates for PMU Business:**

```
// Initial Response (Instant)
Hi {{first_name}}! 🌟 Thanks for reaching out about permanent makeup! 

I'd love to help you achieve your dream brows/lips. When would be a good time for a quick chat about your goals?

Reply CALL for a callback or BOOK to schedule a consultation!

// Service Interest Follow-up
Great choice, {{first_name}}! {{service_name}} is one of our most popular services. 

Here's what you can expect:
✨ Natural, beautiful results
⏱️ {{duration}} procedure time
💰 Starting at ${{price}}
🔄 Includes free touch-up

Want to see before/after photos? Reply YES!
```

---

### Workflow 2: Lead Scoring & Qualification Automation

**Purpose:** Automatically score leads based on engagement and demographics to prioritize sales efforts.

**GHL Trigger:** `Contact Engagement Score` | `Contact Tag` | `Email Events`

```typescript
interface LeadScoringWorkflow {
  name: 'PMU Lead Scoring System';
  
  scoringRules: {
    // Demographic Scoring (Explicit Data)
    demographics: [
      { condition: 'location_within_25_miles', points: 15 },
      { condition: 'age_25_to_55', points: 10 },
      { condition: 'has_phone_number', points: 5 },
      { condition: 'has_email', points: 5 },
    ];
    
    // Behavioral Scoring (Implicit Data)
    behaviors: [
      { action: 'email_opened', points: 2 },
      { action: 'email_clicked', points: 5 },
      { action: 'sms_replied', points: 10 },
      { action: 'pricing_page_viewed', points: 15 },
      { action: 'gallery_viewed', points: 8 },
      { action: 'booking_page_visited', points: 20 },
      { action: 'form_submitted', points: 25 },
      { action: 'appointment_booked', points: 50 },
    ];
    
    // Negative Scoring
    negativeActions: [
      { action: 'email_unsubscribed', points: -50 },
      { action: 'marked_spam', points: -100 },
      { action: 'no_engagement_30_days', points: -15 },
    ];
  };
  
  qualificationThresholds: {
    cold: { min: 0, max: 20 };
    warm: { min: 21, max: 50 };
    hot: { min: 51, max: 80 };
    sales_ready: { min: 81, max: 100 };
  };
  
  automatedActions: {
    // When lead becomes "Hot"
    hot_lead: [
      { type: 'add_tag'; tag: 'hot-lead' },
      { type: 'send_internal_notification'; message: '🔥 Hot Lead Alert!' },
      { type: 'create_task'; task: 'Call within 1 hour'; assignee: 'owner' },
    ];
    
    // When lead becomes "Sales Ready"
    sales_ready: [
      { type: 'add_tag'; tag: 'sales-ready' },
      { type: 'update_opportunity'; stage: 'Ready to Book' },
      { type: 'send_sms'; message: 'Special offer for you!' },
    ];
  };
}
```

**GHL Implementation Steps:**

1. Create custom field `lead_score` (Number type)
2. Set up workflow triggers for each scoring event
3. Use `Modify Contact Engagement Score` action
4. Create If/Else branches based on score thresholds

---

### Workflow 3: Multi-Channel Nurture Sequence

**Purpose:** Deliver value-driven content across email, SMS, and social to build trust over 14 days.

**GHL Trigger:** `Contact Tag Added` (tag: `nurture-sequence`)

```typescript
interface NurtureSequenceWorkflow {
  name: 'PMU 14-Day Nurture Sequence';
  trigger: { type: 'contact_tag'; tag: 'nurture-sequence' };
  
  sequence: [
    // Day 0: Welcome
    {
      day: 0,
      actions: [
        {
          type: 'send_email';
          subject: 'Welcome to the Atlanta Glamour PMU Family! 💕';
          content: `
Hi {{first_name}},

Thank you for your interest in permanent makeup! I'm Sarah, the lead PMU artist at Atlanta Glamour, and I'm thrilled to connect with you.

Over the next couple of weeks, I'll share:
✨ Before & after transformations
📚 Everything you need to know about PMU
💡 Tips for choosing the right service
🎁 Exclusive offers just for you

In the meantime, here's a quick guide to our most popular services:
[Link to Services Page]

Have questions? Just reply to this email - I personally read every message!

Warmly,
Sarah
          `
        }
      ]
    },
    
    // Day 2: Educational Content
    {
      day: 2,
      actions: [
        {
          type: 'send_sms';
          message: `Hey {{first_name}}! 👋 Quick question - have you ever wondered what the difference is between microblading and powder brows?

I just posted a helpful comparison on our Instagram! Check it out: [link]

Which style catches your eye? 🤔`
        }
      ]
    },
    
    // Day 4: Social Proof
    {
      day: 4,
      actions: [
        {
          type: 'send_email';
          subject: 'See what our clients are saying... ⭐⭐⭐⭐⭐';
          content: `
Hi {{first_name}},

Nothing makes me happier than seeing my clients' confidence soar after their PMU transformation!

Here's what Jessica said after her microblading session:

"I used to spend 30 minutes every morning on my brows. Now I wake up looking put-together! Sarah is an absolute artist. Best decision I ever made!" - Jessica M.

[Before/After Photo]

Want to see more transformations? Check out our gallery: [Link]

Ready to start your transformation? Book a free consultation: [Booking Link]

Sarah
          `
        }
      ]
    },
    
    // Day 7: Address Objections (Pain/Fear)
    {
      day: 7,
      actions: [
        {
          type: 'send_email';
          subject: 'Does permanent makeup hurt? (Honest answer inside)';
          content: `
Hi {{first_name}},

I get this question ALL the time, so let me give you the honest truth...

Most clients describe the sensation as a "light scratching" - much less painful than expected! Here's why:

✅ We use premium numbing cream (applied 30 min before)
✅ I work gently and check in with you throughout
✅ Most clients actually relax or even nap during the procedure!

On a scale of 1-10, most clients rate it a 2-3. Getting your eyebrows waxed is often more uncomfortable!

Still nervous? That's totally normal. Let's chat about it: [Book a Free Consultation]

Here to answer all your questions,
Sarah
          `
        }
      ]
    },
    
    // Day 10: Urgency/Scarcity
    {
      day: 10,
      actions: [
        {
          type: 'send_sms';
          message: `{{first_name}}, I have 3 appointment slots opening up next week! 📅

These tend to fill fast. Want me to hold one for you?

Reply YES and I'll send you my available times!`
        }
      ]
    },
    
    // Day 12: Special Offer
    {
      day: 12,
      actions: [
        {
          type: 'send_email';
          subject: '🎁 A special gift just for you, {{first_name}}...';
          content: `
Hi {{first_name}},

I've really enjoyed connecting with you over the past couple of weeks!

As a thank you for being part of our community, I'd like to offer you something special:

🎁 $50 OFF your first PMU service
📅 Valid for the next 14 days
🔗 Use code: WELCOME50

Book now: [Booking Link with Coupon Auto-Applied]

This offer is exclusively for you and won't be shared publicly.

Can't wait to meet you!
Sarah

P.S. Have questions before booking? Reply to this email or text me at [phone]!
          `
        }
      ]
    },
    
    // Day 14: Final Push
    {
      day: 14,
      actions: [
        {
          type: 'send_sms';
          message: `Hey {{first_name}}! Just a friendly reminder - your $50 welcome discount expires soon! 🎁

Don't miss out on your PMU transformation. Book here: [link]

Questions? Just reply to this text! 💬`
        },
        // Check if converted
        {
          type: 'if_else';
          condition: 'has_tag:booked-appointment';
          if_true: [{ type: 'remove_from_workflow' }];
          if_false: [{ type: 'add_tag'; tag: 'nurture-complete-no-booking' }];
        }
      ]
    }
  ];
}
```

---

### Workflow 4: Appointment Booking Push

**Purpose:** Convert warm leads into booked appointments with strategic follow-up.

**GHL Trigger:** `Contact Tag Added` (tag: `hot-lead`) | `Funnel Page Viewed` (booking page)

```typescript
interface BookingPushWorkflow {
  name: 'PMU Booking Push Sequence';
  trigger: { type: 'contact_tag'; tag: 'hot-lead' };
  
  sequence: [
    // Immediate: AI Conversation Bot
    {
      delay: '0 minutes',
      action: {
        type: 'conversation_ai';
        bot: 'pmu_booking_assistant';
        goal: 'book_appointment';
        exitConditions: ['appointment_booked', 'human_requested', 'no_response_24h']
      }
    },
    
    // If no booking after 4 hours
    {
      delay: '4 hours',
      condition: '!has_tag:booked-appointment',
      action: {
        type: 'send_sms';
        message: `Hi {{first_name}}! I noticed you were checking out our booking page. 

Would you like me to help you find the perfect appointment time? I have a few slots available this week!

Reply with your preferred day and I'll check availability. 📅`
      }
    },
    
    // Day 1: Generate One-Time Booking Link
    {
      delay: '1 day',
      condition: '!has_tag:booked-appointment',
      actions: [
        { type: 'generate_one_time_booking_link'; calendar: 'pmu_consultations' },
        {
          type: 'send_email';
          subject: 'Your personal booking link (expires in 48 hours)';
          content: `
Hi {{first_name}},

I've created a special booking link just for you with my best available times:

👉 [Your Personal Booking Link]

This link will show you real-time availability and let you book instantly.

⏰ Link expires in 48 hours

Looking forward to meeting you!
Sarah
          `
        }
      ]
    },
    
    // Day 3: Phone Call Attempt
    {
      delay: '3 days',
      condition: '!has_tag:booked-appointment',
      actions: [
        { type: 'create_task'; task: 'Call {{contact.full_name}}'; due: 'today'; assignee: 'owner' },
        { type: 'manual_action_to_call'; priority: 'high' }
      ]
    },
    
    // Day 5: Last Chance
    {
      delay: '5 days',
      condition: '!has_tag:booked-appointment',
      action: {
        type: 'send_sms';
        message: `{{first_name}}, I don't want you to miss out! 

Your $50 welcome offer is about to expire. Book your PMU consultation today and lock in your savings!

🔗 [Booking Link]

After today, the offer goes away. Don't let your dream brows wait! ✨`
      }
    }
  ];
}
```

---

### Workflow 5: Appointment Reminder & Confirmation

**Purpose:** Reduce no-shows by 80% with strategic reminders.

**GHL Trigger:** `Customer Booked Appointment`

```typescript
interface AppointmentReminderWorkflow {
  name: 'PMU Appointment Reminders';
  trigger: { type: 'customer_booked_appointment'; calendar: 'pmu_services' };
  
  sequence: [
    // Immediate: Confirmation
    {
      delay: '0 minutes',
      actions: [
        {
          type: 'send_sms';
          message: `🎉 You're booked, {{first_name}}!

📅 {{appointment.date}}
⏰ {{appointment.time}}
📍 Atlanta Glamour PMU
    123 Beauty Lane, Atlanta, GA

Reply CONFIRM to secure your spot!

Need to reschedule? Reply RESCHEDULE`
        },
        {
          type: 'send_email';
          subject: 'Appointment Confirmed! Here\'s what to know...';
          template: 'appointment_confirmation_with_prep'
        },
        { type: 'add_tag'; tag: 'appointment-booked' },
        { type: 'update_opportunity'; stage: 'Appointment Scheduled' }
      ]
    },
    
    // 3 Days Before: Prep Instructions
    {
      delay: 'appointment_date - 3 days',
      action: {
        type: 'send_email';
        subject: '3 days until your PMU appointment! Prep checklist inside 📋';
        content: `
Hi {{first_name}}!

Your {{appointment.service}} appointment is in 3 days! Here's how to prepare:

✅ DO:
• Stay hydrated (drink lots of water!)
• Get a good night's sleep
• Eat a meal before your appointment
• Arrive with clean skin (no makeup on treatment area)

❌ DON'T:
• Drink alcohol 24 hours before
• Take blood thinners (aspirin, ibuprofen) 48 hours before
• Get botox 2 weeks before
• Tan or sunburn the area

Questions? Reply to this email!

See you soon!
Sarah
        `
      }
    },
    
    // 24 Hours Before
    {
      delay: 'appointment_date - 1 day',
      action: {
        type: 'send_sms';
        message: `Hi {{first_name}}! 👋 

Just a reminder - your PMU appointment is TOMORROW!

📅 {{appointment.date}}
⏰ {{appointment.time}}
📍 Atlanta Glamour PMU

Remember: No caffeine or alcohol today! 

Reply CONFIRM if you're all set, or call us if you need to reschedule: [phone]`
      }
    },
    
    // 2 Hours Before
    {
      delay: 'appointment_time - 2 hours',
      action: {
        type: 'send_sms';
        message: `See you in 2 hours, {{first_name}}! 🌟

I'm so excited for your transformation! 

Parking tip: Free parking available in the lot behind the building.

See you soon! ✨`
      }
    }
  ];
}
```

---

### Workflow 6: Post-Appointment Follow-Up & Review Request

**Purpose:** Ensure client satisfaction, collect reviews, and encourage referrals.

**GHL Trigger:** `Appointment Status` (status: `completed`)

```typescript
interface PostAppointmentWorkflow {
  name: 'PMU Post-Appointment Follow-Up';
  trigger: { type: 'appointment_status'; status: 'completed' };
  
  sequence: [
    // Immediate: Thank You
    {
      delay: '30 minutes',
      action: {
        type: 'send_sms';
        message: `Thank you for visiting today, {{first_name}}! 💕

I hope you LOVE your new {{service_name}}! 

Remember: Some redness is normal and will subside within 24-48 hours.

Questions about aftercare? Just text me!`
      }
    },
    
    // Day 1: Aftercare Check-in
    {
      delay: '1 day',
      action: {
        type: 'send_email';
        subject: 'How are your new brows feeling? + Aftercare reminder';
        content: `
Hi {{first_name}}!

How are you feeling about your new {{service_name}}? I'd love to hear!

Quick aftercare reminders for the next 7-10 days:
• Keep the area clean and dry
• Apply the healing balm I gave you 2-3x daily
• Avoid sweating, swimming, and saunas
• Don't pick or scratch!

Your brows will go through a healing process:
Day 1-4: Bold and dark (this is normal!)
Day 5-7: Flaking begins (don't pick!)
Day 8-14: Color softens to final shade

Have questions or concerns? Reply to this email or text me anytime!

Sarah
        `
      }
    },
    
    // Day 7: Review Request
    {
      delay: '7 days',
      actions: [
        {
          type: 'send_review_request';
          platforms: ['google', 'facebook'];
          message: `Hi {{first_name}}! 

I hope you're loving your healed {{service_name}}! 🌟

Would you mind taking 30 seconds to share your experience? Your review helps other women discover their confidence through PMU!

⭐ Leave a Google Review: [link]
⭐ Leave a Facebook Review: [link]

Thank you SO much! 💕
Sarah`
        }
      ]
    },
    
    // Day 14: Referral Request
    {
      delay: '14 days',
      action: {
        type: 'send_email';
        subject: 'Share the love & earn $50! 💕';
        content: `
Hi {{first_name}}!

I hope you're still loving your {{service_name}}!

I have a special offer for you:

🎁 REFER A FRIEND PROGRAM
• Your friend gets $50 off their first service
• YOU get $50 credit toward your touch-up or next service

Simply share your unique referral link:
[Referral Link]

Thank you for being part of the Atlanta Glamour family!

Sarah
        `
      }
    },
    
    // Day 30: Touch-Up Reminder
    {
      delay: '30 days',
      action: {
        type: 'send_sms';
        message: `Hi {{first_name}}! 💕

It's been about a month since your {{service_name}}. How are they looking?

Your complimentary touch-up is included and should be done within 6-8 weeks of your initial appointment.

Ready to schedule? Reply TOUCHUP and I'll send you my available times!`
      }
    }
  ];
}
```

---

### Workflow 7: Re-Engagement Campaign for Cold Leads

**Purpose:** Win back leads who haven't engaged in 30+ days.

**GHL Trigger:** `Custom Date Reminder` (30 days since last engagement)

```typescript
interface ReEngagementWorkflow {
  name: 'PMU Cold Lead Re-Engagement';
  trigger: { 
    type: 'custom_date_reminder'; 
    field: 'last_engagement_date';
    offset: '30 days after'
  };
  
  conditions: [
    '!has_tag:booked-appointment',
    '!has_tag:do-not-contact'
  ];
  
  sequence: [
    // Email 1: "We Miss You"
    {
      delay: '0 days',
      action: {
        type: 'send_email';
        subject: 'Still thinking about PMU, {{first_name}}?';
        content: `
Hi {{first_name}},

I noticed it's been a while since we connected, and I wanted to check in!

Are you still interested in permanent makeup? If so, I'd love to help answer any questions you might have.

Here's what's new at Atlanta Glamour PMU:
✨ New healed results gallery (check it out!)
🎓 I just completed advanced training in [technique]
💰 Limited-time offer: $75 off any service this month

If your situation has changed or PMU isn't right for you anymore, no worries at all! Just let me know and I'll update my notes.

Either way, I'm here if you need me!

Sarah
        `
      }
    },
    
    // SMS 1: Week Later
    {
      delay: '7 days',
      condition: '!has_tag:re-engaged',
      action: {
        type: 'send_sms';
        message: `Hey {{first_name}}! 👋

I sent you an email last week but wanted to make sure you saw it.

We have some amazing specials going on right now. Interested in learning more?

Reply YES and I'll share the details!`
      }
    },
    
    // Email 2: New Angle
    {
      delay: '14 days',
      condition: '!has_tag:re-engaged',
      action: {
        type: 'send_email';
        subject: 'Quick question for you, {{first_name}}...';
        content: `
Hi {{first_name}},

I'm curious - what's been holding you back from booking your PMU appointment?

□ Timing isn't right
□ Budget concerns
□ Still researching
□ Nervous about the process
□ Something else

Just reply with what resonates, and I'll do my best to help!

If budget is a concern, I do offer payment plans through [payment provider].

If you're nervous, I totally get it! Would a free 15-minute consultation help ease your mind?

Let me know how I can help!

Sarah
        `
      }
    },
    
    // Final: Break-Up Email
    {
      delay: '21 days',
      condition: '!has_tag:re-engaged',
      actions: [
        {
          type: 'send_email';
          subject: 'Should I close your file?';
          content: `
Hi {{first_name}},

I've reached out a few times but haven't heard back, which tells me one of two things:

1. You're super busy (I get it!)
2. PMU isn't a priority right now

Either way, I don't want to fill your inbox with unwanted emails.

If you'd like to stay connected, just reply "KEEP ME" and I'll continue sending occasional updates and offers.

If I don't hear from you, I'll assume it's #2 and remove you from my list - no hard feelings!

Wishing you all the best,
Sarah

P.S. If you ever change your mind, my door is always open! Just reply to any of my emails.
          `
        },
        // Wait 7 days for response
        { type: 'wait'; duration: '7 days' },
        // Check for response
        {
          type: 'if_else';
          condition: 'has_tag:re-engaged OR replied_to_email';
          if_true: [{ type: 'add_tag'; tag: 'reactivated' }];
          if_false: [
            { type: 'add_tag'; tag: 'cold-archived' },
            { type: 'remove_from_workflow' }
          ];
        }
      ]
    }
  ];
}
```

---

### Workflow 8: Lead Routing & Assignment

**Purpose:** Automatically distribute leads to team members based on rules.

**GHL Trigger:** `Contact Created`

```typescript
interface LeadRoutingWorkflow {
  name: 'PMU Lead Routing';
  trigger: { type: 'contact_created' };
  
  routingRules: {
    // Rule 1: VIP Leads (high value) go to owner
    vip_routing: {
      condition: 'lead_score >= 80 OR source == "referral"',
      action: { type: 'assign_to_user'; user: 'owner' }
    };
    
    // Rule 2: Service-based routing
    service_routing: {
      conditions: [
        { service: 'microblading', assignee: 'sarah' },
        { service: 'lip_blush', assignee: 'jessica' },
        { service: 'eyeliner', assignee: 'sarah' },
      ]
    };
    
    // Rule 3: Round-robin for general inquiries
    default_routing: {
      condition: 'no_specific_service',
      action: { type: 'assign_to_user'; method: 'round_robin'; users: ['sarah', 'jessica'] }
    };
    
    // Rule 4: Capacity-based routing
    capacity_routing: {
      condition: 'assignee_at_capacity',
      action: { type: 'assign_to_user'; method: 'least_busy' }
    };
  };
  
  escalation: {
    // If no response in 30 minutes, escalate
    trigger: 'no_response_30_min',
    action: [
      { type: 'send_internal_notification'; to: 'owner'; message: '⚠️ Lead not contacted!' },
      { type: 'reassign_to_user'; user: 'owner' }
    ]
  };
}
```

---

### GHL Workflow Implementation Checklist

```markdown
## Pre-Implementation Checklist

### 1. Pipeline Setup
- [ ] Create "PMU Sales Pipeline" with stages:
  - New Lead
  - Contacted
  - Nurturing
  - Consultation Scheduled
  - Ready to Book
  - Appointment Booked
  - Completed
  - Lost

### 2. Tags to Create
- [ ] new-lead-website
- [ ] new-lead-facebook
- [ ] new-lead-tiktok
- [ ] new-lead-referral
- [ ] nurture-sequence
- [ ] hot-lead
- [ ] sales-ready
- [ ] booked-appointment
- [ ] appointment-completed
- [ ] review-requested
- [ ] referral-program
- [ ] cold-archived
- [ ] do-not-contact

### 3. Custom Fields
- [ ] lead_score (Number)
- [ ] lead_source (Dropdown)
- [ ] interested_service (Dropdown)
- [ ] last_engagement_date (Date)
- [ ] referral_code (Text)

### 4. Email Templates
- [ ] new_lead_welcome_email
- [ ] nurture_sequence_emails (6 templates)
- [ ] appointment_confirmation
- [ ] aftercare_instructions
- [ ] review_request
- [ ] referral_program
- [ ] re_engagement_series (3 templates)

### 5. SMS Templates
- [ ] instant_response
- [ ] service_inquiry_followup
- [ ] booking_push
- [ ] appointment_reminders (3 templates)
- [ ] post_appointment_followup
- [ ] review_request_sms
- [ ] re_engagement_sms

### 6. Calendars
- [ ] PMU Consultations (free)
- [ ] PMU Services (paid appointments)
- [ ] Touch-Up Appointments

### 7. Forms
- [ ] Website Contact Form
- [ ] Consultation Request Form
- [ ] Service Interest Quiz
```

---

### Workflow Performance Metrics

| Workflow | Key Metric | Target | Industry Benchmark |
|----------|------------|--------|-------------------|
| **New Lead Capture** | Response Time | < 5 min | 47% respond in 5 min |
| **Lead Scoring** | SQL Conversion | 25%+ | 15-20% |
| **Nurture Sequence** | Email Open Rate | 35%+ | 21% |
| **Nurture Sequence** | SMS Response Rate | 45%+ | 30% |
| **Booking Push** | Booking Rate | 40%+ | 25% |
| **Appointment Reminder** | No-Show Rate | < 10% | 20-30% |
| **Review Request** | Review Rate | 30%+ | 10% |
| **Re-Engagement** | Reactivation Rate | 15%+ | 5-10% |

---

### ROI Calculator for Lead Automation

```typescript
interface LeadAutomationROI {
  // Inputs
  monthlyLeads: number;           // e.g., 100
  averageServiceValue: number;    // e.g., $450
  currentConversionRate: number;  // e.g., 10%
  currentNoShowRate: number;      // e.g., 25%
  
  // Expected Improvements with Automation
  expectedConversionIncrease: 0.15;  // +15%
  expectedNoShowReduction: 0.15;     // -15%
  timesSavedPerLead: 20;             // minutes
  
  // Calculations
  calculate(): {
    currentMonthlyRevenue: number;
    projectedMonthlyRevenue: number;
    additionalRevenue: number;
    timeSavedMonthly: number;
    annualROI: number;
  };
}

// Example Calculation:
// 100 leads × $450 × 10% = $4,500/month current
// 100 leads × $450 × 25% = $11,250/month projected
// Additional Revenue: $6,750/month = $81,000/year
// Time Saved: 100 × 20 min = 33 hours/month
```

---

## 11. 📊 Platform Architecture Recommendations

### New Admin Dashboard Tabs

| Tab | Features | Priority |
|-----|----------|----------|
| **SEO Dashboard** | Rank tracking, audits, recommendations | 🔴 High |
| **Social Media Hub** | Post scheduling, analytics, engagement | 🔴 High |
| **Ad Manager** | Meta, TikTok, Google Ads management | 🔴 High |
| **Lead Analytics** | Source tracking, conversion funnels | 🟡 High |
| **Content Library** | UGC, testimonials, media assets | 🟡 Medium |
| **Influencer CRM** | Track partnerships, campaigns | 🟢 Medium |

### Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                          │
├─────────────────────────────────────────────────────────────┤
│  SEO  │ Social │  Ads  │ Leads │ Content │ Influencers     │
└───┬───┴───┬────┴───┬───┴───┬───┴────┬────┴───────┬─────────┘
    │       │        │       │        │            │
    ▼       ▼        ▼       ▼        ▼            ▼
┌───────┐ ┌────┐ ┌──────┐ ┌─────┐ ┌────────┐ ┌──────────┐
│DataFor│ │Meta│ │TikTok│ │ GHL │ │Firebase│ │Influencer│
│  SEO  │ │API │ │ API  │ │ CRM │ │Storage │ │  DB      │
└───────┘ └────┘ └──────┘ └─────┘ └────────┘ └──────────┘
```

### Database Schema Additions

```typescript
// Firestore Collections

// influencers collection
interface Influencer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  platforms: {
    instagram?: { handle: string; followers: number };
    tiktok?: { handle: string; followers: number };
    youtube?: { handle: string; subscribers: number };
  };
  tier: 'micro' | 'mid' | 'macro' | 'celebrity';
  niche: string[];
  engagementRate: number;
  campaigns: string[]; // campaign IDs
  status: 'prospect' | 'contacted' | 'negotiating' | 'active' | 'completed';
  notes: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// campaigns collection
interface Campaign {
  id: string;
  name: string;
  type: 'influencer' | 'paid_ads' | 'organic';
  platforms: ('instagram' | 'tiktok' | 'facebook' | 'google')[];
  status: 'planning' | 'active' | 'paused' | 'completed';
  budget: number;
  spent: number;
  startDate: Timestamp;
  endDate: Timestamp;
  goals: {
    impressions?: number;
    clicks?: number;
    leads?: number;
    bookings?: number;
  };
  results: {
    impressions: number;
    clicks: number;
    leads: number;
    bookings: number;
    revenue: number;
  };
  influencers?: string[]; // influencer IDs
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// seo-tracking collection
interface SEOTracking {
  id: string;
  date: Timestamp;
  keywords: Array<{
    keyword: string;
    position: number;
    previousPosition: number;
    searchVolume: number;
    inLocalPack: boolean;
  }>;
  siteHealth: {
    score: number;
    issues: Array<{
      type: string;
      severity: 'critical' | 'warning' | 'info';
      description: string;
    }>;
  };
  localSEO: {
    gbpViews: number;
    gbpClicks: number;
    gbpCalls: number;
    gbpDirections: number;
    reviewCount: number;
    averageRating: number;
  };
}
```

---

## 12. 🚀 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

| Task | Priority | Effort | Owner |
|------|----------|--------|-------|
| Implement Facebook Pixel | 🔴 High | 4 hrs | Dev |
| Implement TikTok Pixel | 🔴 High | 4 hrs | Dev |
| Add Conversions API (server-side) | 🔴 High | 8 hrs | Dev |
| Create Hero Carousel component | 🟡 Medium | 8 hrs | Dev |
| Add SEO meta tags and schema | 🟡 Medium | 4 hrs | Dev |
| Set up Google Tag Manager | 🟢 Low | 2 hrs | Dev |

**Deliverables:**
- [ ] Facebook Pixel tracking all events
- [ ] TikTok Pixel tracking all events
- [ ] Server-side conversion tracking
- [ ] Hero carousel with testimonials
- [ ] LocalBusiness schema markup

### Phase 2: Local SEO (Weeks 5-8)

| Task | Priority | Effort | Owner |
|------|----------|--------|-------|
| Optimize Google Business Profile | 🔴 High | 4 hrs | Marketing |
| Build citation network (20+ sites) | 🔴 High | 8 hrs | Marketing |
| Implement review request automation | 🔴 High | 4 hrs | Dev |
| Add local schema markup | 🟡 Medium | 2 hrs | Dev |
| Create location landing pages | 🟡 Medium | 8 hrs | Dev |
| Set up rank tracking | 🟢 Low | 2 hrs | Marketing |

**Deliverables:**
- [ ] Optimized GBP with all features
- [ ] 20+ consistent citations
- [ ] Automated review requests via BMAD
- [ ] Local schema on all pages
- [ ] Rank tracking dashboard

### Phase 3: Ad Platform Integration (Weeks 9-12)

| Task | Priority | Effort | Owner |
|------|----------|--------|-------|
| Meta Ads Manager integration | 🔴 High | 16 hrs | Dev |
| TikTok Ads integration | 🔴 High | 16 hrs | Dev |
| Lead form sync from all platforms | 🔴 High | 8 hrs | Dev |
| Conversion tracking verification | 🟡 Medium | 4 hrs | Dev |
| Create retargeting audiences | 🟡 Medium | 4 hrs | Marketing |
| Build ad performance dashboard | 🟢 Low | 8 hrs | Dev |

**Deliverables:**
- [ ] Meta Ads API integration
- [ ] TikTok Ads API integration
- [ ] Unified lead capture from all sources
- [ ] Verified conversion tracking
- [ ] Ad performance dashboard

### Phase 4: Advanced Features (Weeks 13-16)

| Task | Priority | Effort | Owner |
|------|----------|--------|-------|
| AI SEO recommendations engine | 🟡 Medium | 16 hrs | Dev |
| Social media scheduling | 🟡 Medium | 12 hrs | Dev |
| Influencer CRM | 🟡 Medium | 12 hrs | Dev |
| Celebrity campaign launch | 🟢 Low | 20 hrs | Marketing |
| Content library management | 🟢 Low | 8 hrs | Dev |

**Deliverables:**
- [ ] AI-powered SEO dashboard
- [ ] Social media scheduler
- [ ] Influencer tracking system
- [ ] First celebrity campaign live

---

## 14. 🔍 Competitor Keyword Analysis & Site Research

### Overview

Understanding competitor keywords is essential for SEO strategy. DataForSEO Labs API provides comprehensive competitor intelligence:

- **Ranked Keywords** - All keywords a competitor ranks for with position, volume, CPC
- **SERP Competitors** - Domains competing for same keywords  
- **Domain Intersection** - Keyword overlap between your site and competitors
- **Keywords For Site** - Keyword suggestions based on competitor content

### Key API Endpoints

| Endpoint | Purpose | Use Case |
|----------|---------|----------|
| `ranked_keywords/live` | Get all ranking keywords | Discover competitor's top traffic sources |
| `serp_competitors/live` | Find competing domains | Identify new competitors |
| `domain_intersection/live` | Compare keyword overlap | Find gaps and opportunities |
| `keywords_for_site/live` | Extract keyword ideas | Build target keyword list |

### PMU Keywords to Monitor

| Category | Keywords | Intent |
|----------|----------|--------|
| **Services** | microblading near me, powder brows atlanta | Transactional |
| **Pricing** | microblading cost, lip blush price | Comparison |
| **Research** | microblading vs powder brows, PMU healing | Informational |
| **Local** | best PMU artist atlanta, permanent makeup georgia | Local |

---

## 15. ⭐ Google Reviews API Integration

### Capabilities

- **List all reviews** - Audit reviews in bulk
- **Get specific review** - Retrieve details (rating, comment, reviewer)
- **Reply to reviews** - Programmatic responses
- **Batch get reviews** - Multiple locations in one request

### Auto-Response Workflow

```
Trigger: New Review Received
├── If rating >= 4 stars
│   ├── Send thank you reply
│   ├── Add tag: positive-review
│   └── Send referral request (2 days later)
└── If rating < 4 stars
    ├── Alert owner immediately
    ├── Create high-priority task
    └── Add tag: needs-attention
```

---

## 16. 📊 PageSpeed Insights Integration

### Metrics Tracked

| Metric | Good | Needs Work | Poor |
|--------|------|------------|------|
| First Contentful Paint | < 1.8s | 1.8-3s | > 3s |
| Largest Contentful Paint | < 2.5s | 2.5-4s | > 4s |
| Total Blocking Time | < 200ms | 200-600ms | > 600ms |
| Cumulative Layout Shift | < 0.1 | 0.1-0.25 | > 0.25 |

### Report Generation

- Performance, Accessibility, Best Practices, SEO scores
- Core Web Vitals analysis
- Optimization opportunities with estimated savings
- Actionable recommendations

---

## 17. 🗺️ Geographical Competitor Analysis

### Data Collected Per Competitor

- **Location** - Address, distance, coordinates
- **Ratings** - Google rating, review count
- **Pricing** - Service prices, market position
- **Social Media** - Instagram/Facebook/TikTok followers
- **Strengths/Weaknesses** - SWOT analysis

### Pricing Comparison Output

| Service | Your Price | Market Avg | Range | Recommendation |
|---------|------------|------------|-------|----------------|
| Microblading | $450 | $425 | $300-600 | ✅ Competitive |
| Lip Blush | $400 | $375 | $250-500 | ✅ Competitive |
| Powder Brows | $500 | $450 | $350-650 | 📈 Premium position |

---

## 18. 🎁 Referral & Loyalty Program with QR Codes

### Program Features

- **Digital loyalty cards** with unique QR codes
- **Points system** - Earn per dollar spent, referrals, reviews
- **Tiered rewards** - Bronze, Silver, Gold, Platinum
- **Referral tracking** - Unique codes per member
- **Printable cards** - Business card size PDFs

### Points Structure

| Action | Points |
|--------|--------|
| Per $1 spent | 1 point |
| Check-in visit | 10 points |
| Leave a review | 50 points |
| Successful referral | 100 points |
| Birthday bonus | 2x points |

### Rewards Tiers

| Tier | Points Required | Benefits |
|------|-----------------|----------|
| Bronze | 0 | Base earning rate |
| Silver | 250 | 1.25x points, birthday gift |
| Gold | 500 | 1.5x points, priority booking |
| Platinum | 1000 | 2x points, free touch-ups |

### GHL Workflow Integration

- Welcome email with digital card attachment
- SMS notifications for points milestones
- Automated referral reward distribution
- Birthday reward triggers

---

## 19. 📱 WhatsApp Business API Integration

### Overview

WhatsApp Business Platform enables enterprise-level messaging for marketing, customer support, and appointment management with 2 billion+ active users worldwide.

### Message Template Categories

| Category | Purpose | Use Case |
|----------|---------|----------|
| **Utility** | Transactional updates | Appointment confirmations, reminders |
| **Marketing** | Promotional messages | Special offers, re-engagement |
| **Authentication** | Security codes | OTP, account verification |

### Key Features

- **Two-way conversations** - Engage customers in real-time
- **Rich media support** - Images, videos, documents, buttons
- **Interactive CTAs** - Quick reply buttons, list menus
- **CRM integration** - Sync with GoHighLevel
- **Automated flows** - Chatbots and drip campaigns
- **98% open rate** - Higher than email (20%) and SMS (90%)

### PMU Business WhatsApp Templates

#### Appointment Reminder (Utility)
```
Hi {{1}}, this is a reminder for your {{2}} appointment at Atlanta Glamour PMU!

📅 Date: {{3}}
⏰ Time: {{4}}

Please reply:
✅ 1 - Confirm
📅 2 - Reschedule
❌ 3 - Cancel

See you soon! 💕
```

#### Booking Confirmation (Utility)
```
🎉 Your appointment is confirmed, {{1}}!

Service: {{2}}
Date: {{3}}
Time: {{4}}
Deposit: $50 ✅

📍 Atlanta Glamour PMU
123 Beauty Lane, Atlanta, GA

Pre-care instructions: {{5}}

Questions? Reply to this message!
```

#### Promotional Offer (Marketing)
```
Hey {{1}}! 💜

We miss you at Atlanta Glamour PMU!

🌟 EXCLUSIVE OFFER 🌟
$100 OFF your next service!

Valid until: {{2}}
Book now: {{3}}

Reply BOOK to schedule or STOP to unsubscribe.
```

#### Touch-Up Reminder (Marketing)
```
Hi {{1}}! ✨

It's been {{2}} months since your {{3}} procedure.

Time for a touch-up to keep your brows looking perfect! 

💰 Touch-up Special: Only $150 (reg. $200)
📅 Limited availability this month!

Tap below to book:
[Book Touch-Up]

Reply STOP to unsubscribe.
```

#### Review Request (Marketing)
```
Hi {{1}}! 💕

Thank you for choosing Atlanta Glamour PMU for your {{2}}!

We'd love to hear about your experience! Your feedback helps other clients discover us.

⭐ Leave a review: {{3}}

As a thank you, get 50 loyalty points!

Reply STOP to unsubscribe.
```

### GHL + WhatsApp Integration Workflow

```
Trigger: Customer Booked Appointment
├── Send WhatsApp: Booking Confirmation
├── Wait: 24 hours before appointment
├── Send WhatsApp: Appointment Reminder
├── If no response in 4 hours
│   └── Send SMS: Backup reminder
├── After appointment completed
│   ├── Wait: 2 hours
│   └── Send WhatsApp: Review Request
└── After 6 weeks
    └── Send WhatsApp: Touch-Up Reminder
```

### Implementation Requirements

| Requirement | Details |
|-------------|---------|
| **Meta Business Account** | Verified business account |
| **Phone Number** | Dedicated business number |
| **Business Verification** | Meta business verification |
| **BSP Partner** | Twilio, MessageBird, or 360dialog |
| **Template Approval** | 24-48 hours for review |

### Pricing Structure

| Conversation Type | Cost (US) |
|-------------------|-----------|
| Marketing | $0.025/conversation |
| Utility | $0.015/conversation |
| Authentication | $0.0135/conversation |
| Service (user-initiated) | Free first 1,000/month |

### Best Practices

- **Get opt-in consent** before sending messages
- **Personalize messages** with customer name and details
- **Respect 24-hour window** for free-form replies
- **Use templates** for messages outside conversation window
- **Include opt-out option** in marketing messages
- **Monitor quality rating** to maintain messaging privileges

---

## 20. 🎯 Real-Time Google Lead Capture

### Overview

Yes! There are multiple ways to capture leads in real-time when people are actively searching on Google. This creates the highest-intent leads possible.

### Method 1: Google Ads Lead Form Extensions

Capture leads directly within Google Search results without users leaving the page.

| Feature | Description |
|---------|-------------|
| **Instant Capture** | Lead form opens directly in search results |
| **Pre-filled Data** | Google auto-fills name, email, phone from user's account |
| **Real-time Webhook** | Leads sent instantly to your CRM via webhook |
| **High Intent** | User is actively searching for your service |

**Requirements:**
- Google Ads account with good compliance history
- $50,000+ total spend (or $1,000+ with verification)
- Privacy policy URL
- Conversion-focused bidding strategy

**CRM Integration:**
```
Google Ads Lead Form → Webhook → GoHighLevel → Instant SMS/Email
```

### Method 2: Google Local Services Ads (LSA)

Premium placement at the very top of Google Search for local service businesses.

| Feature | Benefit |
|---------|---------|
| **Top of Search** | Appears above regular Google Ads |
| **Google Verified Badge** | Builds instant trust |
| **Pay Per Lead** | Only pay for actual leads, not clicks |
| **Direct Calls/Messages** | Customers contact you directly |
| **Booking Integration** | Schedule appointments from the ad |

**Eligible Categories:** Beauty, wellness, health, home services, and more.

**Lead Types:**
- Phone calls (tracked and recorded)
- Message requests
- Direct bookings

### Method 3: Website Visitor Identification (B2B Focus)

Identify anonymous website visitors in real-time using IP tracking and data enrichment.

**Top Tools:**

| Tool | Features | Pricing |
|------|----------|---------|
| **Leadfeeder** | Company identification, lead scoring, CRM sync | €139/mo |
| **RB2B** | Person-level ID, LinkedIn profiles, Slack alerts | Free tier available |
| **Clearbit** | Data enrichment, company reveal | Custom pricing |
| **Visitor Queue** | SMB-friendly, affordable | $39/mo |

**How It Works:**
1. Install tracking pixel on your website
2. Visitor arrives from Google search
3. IP address matched to company/person database
4. Real-time alert sent to Slack/CRM
5. Sales team follows up immediately

**Data Captured:**
- Company name and size
- Contact person (name, email, LinkedIn)
- Pages viewed and time on site
- Lead score based on behavior
- Source (Google search keyword)

### Method 4: Google Analytics 4 + Real-Time Alerts

Track high-intent behavior and trigger instant notifications.

**Setup:**
```
GA4 Event → Google Tag Manager → Webhook → GHL Workflow
```

**High-Intent Triggers:**
- Viewed pricing page 2+ times
- Spent 3+ minutes on service page
- Visited booking page but didn't complete
- Searched for specific service keywords

### Implementation for PMU Business

#### Real-Time Lead Capture Workflow

```
Google Search: "microblading atlanta"
├── Option A: Google Lead Form Extension
│   └── User submits form → Webhook → GHL → Instant SMS
├── Option B: Local Services Ad
│   └── User calls/messages → Lead captured → Follow-up
└── Option C: Website Click
    └── Visitor identified → Leadfeeder → Slack alert → Outreach
```

#### GHL Integration

```typescript
// Webhook receiver for Google Lead Forms
interface GoogleLeadFormWebhook {
  lead_id: string;
  campaign_id: string;
  form_id: string;
  user_column_data: Array<{
    column_id: string;
    string_value: string;
  }>;
  // Fields: full_name, email, phone_number, city, etc.
}

// GHL Workflow Trigger
const workflow = {
  trigger: 'webhook_received',
  source: 'google_lead_form',
  actions: [
    { type: 'create_contact' },
    { type: 'add_tag', tag: 'google-lead-form' },
    { type: 'send_sms', template: 'instant_response' },
    { type: 'send_email', template: 'welcome_lead' },
    { type: 'create_opportunity', pipeline: 'New Leads' }
  ]
};
```

#### Instant Response Template (< 5 minutes)

```
Hi {{first_name}}! 👋

Thank you for your interest in {{service}} at Atlanta Glamour PMU!

I'm Sarah, and I'd love to help you achieve your dream brows.

📞 Call me directly: (404) 555-1234
📅 Or book online: {{booking_link}}

What questions can I answer for you?
```

### ROI Comparison

| Method | Cost Model | Avg Lead Cost | Response Time |
|--------|------------|---------------|---------------|
| Lead Form Extensions | Per lead | $15-50 | Instant |
| Local Services Ads | Per lead | $20-75 | Instant |
| Visitor Identification | Monthly fee | $5-15 | Real-time |
| Standard Google Ads | Per click | $25-100 | Varies |

### Best Practices

- **Respond within 5 minutes** - 21x more likely to convert
- **Use webhooks** for instant CRM delivery
- **Set up Slack alerts** for immediate notification
- **A/B test lead forms** for higher conversion
- **Track lead quality** by source for optimization

---

## 21. 💰 Budget Considerations

### Monthly Tool Costs (Estimated)

| Tool/Service | Monthly Cost | Purpose |
|--------------|--------------|---------|
| DataForSEO API | $50-200 | SEO data and tracking |
| SE Ranking | $55-239 | Local rank tracking |
| Meta Ads | Variable | Advertising budget |
| TikTok Ads | Variable | Advertising budget |
| Influencer Payments | $500-5,000 | Partnerships |
| Content Production | $200-1,000 | Creative assets |

### Recommended Starting Budget

| Category | Monthly Budget | Notes |
|----------|----------------|-------|
| **SEO Tools** | $100 | DataForSEO basic plan |
| **Meta Ads** | $500-1,000 | Start small, scale winners |
| **TikTok Ads** | $300-500 | Test audience |
| **Influencers** | $500 | 2-3 micro-influencers |
| **Content** | $200 | Basic production |
| **Total** | **$1,600-2,300** | Initial monthly investment |

### ROI Expectations

| Channel | Time to Results | Expected ROI |
|---------|-----------------|--------------|
| Local SEO | 3-6 months | 300-500% |
| Meta Ads | 2-4 weeks | 200-400% |
| TikTok Ads | 2-4 weeks | 150-300% |
| Influencer | 1-3 months | 200-500% |

### Cost Per Acquisition Targets

| Service | Target CPA | Lifetime Value |
|---------|------------|----------------|
| Microblading | $50-100 | $500+ |
| Powder Brows | $50-100 | $450+ |
| Lip Blush | $40-80 | $400+ |
| Touch-up | $20-40 | $150+ |

---

## Next Steps

### Immediate Actions (This Week)

1. **Set up Facebook Pixel** - Add to Next.js app
2. **Set up TikTok Pixel** - Add to Next.js app
3. **Audit Google Business Profile** - Optimize all fields
4. **Create Hero Carousel** - Design and implement
5. **Configure AI SMS Chat Wizard** - Train GHL Conversation AI

### Short-Term Actions (This Month)

1. **Build citation network** - Submit to 20+ directories
2. **Implement review automation** - Add to BMAD workflows
3. **Launch first ad campaigns** - Meta and TikTok
4. **Identify influencer prospects** - Create outreach list
5. **Deploy AI SMS Chat** - Push configuration to GHL

### Long-Term Actions (This Quarter)

1. **Integrate SEO dashboard** - DataForSEO API
2. **Build influencer CRM** - Track partnerships
3. **Launch celebrity campaign** - Execute strategy
4. **Scale winning channels** - Double down on ROI
5. **Optimize AI SMS Chat** - Refine based on analytics

---

## Appendix

### Environment Variables Required

```env
# Facebook/Meta
FB_PIXEL_ID=your_pixel_id
FB_ACCESS_TOKEN=your_access_token
FB_APP_ID=your_app_id
FB_APP_SECRET=your_app_secret

# TikTok
TIKTOK_PIXEL_ID=your_pixel_id
TIKTOK_ACCESS_TOKEN=your_access_token
TIKTOK_ADVERTISER_ID=your_advertiser_id

# SEO Tools
DATAFORSEO_LOGIN=your_login
DATAFORSEO_PASSWORD=your_password

# Google
GOOGLE_ANALYTICS_ID=your_ga_id
GOOGLE_ADS_ID=your_ads_id

# GoHighLevel (for AI SMS Chat)
GHL_API_KEY=your_private_integration_api_key
GHL_LOCATION_ID=your_location_id
```

### Useful Resources

- [Facebook Marketing API Documentation](https://developers.facebook.com/docs/marketing-apis/)
- [TikTok API for Business](https://business-api.tiktok.com/portal/docs)
- [Google Business Profile API](https://developers.google.com/my-business)
- [DataForSEO API Documentation](https://docs.dataforseo.com/)
- [SE Ranking API](https://seranking.com/api.html)
- [GoHighLevel API Documentation](https://highlevel.stoplight.io/docs/integrations)
- [GHL Conversation AI Guide](https://help.gohighlevel.com/support/solutions/articles/155000002674-conversation-ai-overview)

---

**Report Generated:** December 19, 2025  
**Analyst:** Mary (BMAD Business Analyst)  
**Status:** Research Complete - Ready for Implementation
