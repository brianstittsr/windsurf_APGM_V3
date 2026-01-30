# SEO Implementation TODO List

**Project:** A Pretty Girl Matter - Permanent Makeup Website  
**Based on:** CCS_SEO.md Strategy Document  
**Started:** January 29, 2026  
**Last Updated:** January 29, 2026

---

## Quick Reference: Priority Levels
- 🔴 **Critical** - Do immediately (Quick Wins)
- 🟠 **High** - Complete within Month 1
- 🟡 **Medium** - Complete within Month 2-3
- 🟢 **Low** - Ongoing/Future

---

## PHASE 1: FOUNDATION (Month 1)

### 1.1 Meta Tags & Title Optimization 🔴
- [x] Update homepage meta title and description in `layout.tsx`
- [x] Add page-specific metadata to `/contact/page.tsx`
- [ ] Add page-specific metadata to `/book-now/page.tsx`
- [ ] Add page-specific metadata to `/privacy-policy/page.tsx`
- [ ] Add page-specific metadata to `/terms-of-service/page.tsx`
- [ ] Add page-specific metadata to `/financing/page.tsx`
- [ ] Add page-specific metadata to `/register/page.tsx`
- [ ] Add page-specific metadata to `/login/page.tsx`

### 1.2 Schema Markup (Structured Data) 🔴
- [x] Add LocalBusiness schema to layout.tsx
- [x] Add BeautySalon schema with full business details
- [x] Add Service schema for each service offered
- [x] Add FAQ schema to service pages (microblading, ombre, lip, eyeliner, combo)
- [ ] Add BreadcrumbList schema for navigation
- [ ] Add Review/AggregateRating schema

### 1.3 Technical SEO 🟠
- [x] Create XML sitemap (`/public/sitemap.xml`)
- [x] Create robots.txt (`/public/robots.txt`)
- [ ] Verify SSL certificate (HTTPS)
- [ ] Create custom 404 page with navigation
- [ ] Add canonical URLs to all pages
- [ ] Implement Open Graph tags for social sharing
- [ ] Add Twitter Card meta tags

### 1.4 Google Tools Setup 🔴
- [ ] Set up Google Analytics 4
- [ ] Set up Google Search Console
- [ ] Submit XML sitemap to Search Console
- [ ] Set up Google Tag Manager
- [ ] Verify Google Business Profile

---

## PHASE 2: CONTENT CREATION (Month 2)

### 2.1 Individual Service Pages 🟠
- [x] Create `/services/microblading/page.tsx` (600-800 words)
  - [x] Service description
  - [x] Benefits section
  - [x] Who it's best for
  - [x] Healing process & aftercare
  - [x] Pricing information
  - [x] Before/after gallery placeholder
  - [x] FAQ section with schema
  - [x] Call-to-action

- [x] Create `/services/ombre-brows/page.tsx` (600-800 words)
  - [x] Service description
  - [x] Benefits section
  - [x] Who it's best for
  - [x] FAQ section with schema
  - [x] Call-to-action

- [x] Create `/services/combo-brows/page.tsx` (600-800 words)
  - [x] Service description
  - [x] Benefits section
  - [x] Who it's best for
  - [x] How it works section
  - [x] FAQ section with schema
  - [x] Call-to-action

- [x] Create `/services/lip-blushing/page.tsx` (600-800 words)
  - [x] Service description
  - [x] Benefits section
  - [x] Who it's best for
  - [x] FAQ section with schema
  - [x] Call-to-action

- [x] Create `/services/permanent-eyeliner/page.tsx` (600-800 words)
  - [x] Service description
  - [x] Benefits section
  - [x] Eyeliner styles section
  - [x] Who it's best for
  - [x] FAQ section with schema
  - [x] Call-to-action

- [ ] Create `/services/tiny-tattoos/page.tsx` (400-600 words)
  - [ ] Service description
  - [ ] Benefits section
  - [ ] Pricing information
  - [ ] Gallery
  - [ ] Call-to-action

- [x] Create services index page `/services/page.tsx`

### 2.2 FAQ Pages 🟡
- [ ] Create comprehensive FAQ page `/faq/page.tsx`
- [ ] Add FAQ schema markup to FAQ page
- [ ] Create service-specific FAQ sections
- [ ] Add pricing FAQ section
- [ ] Add booking & cancellation FAQ section

### 2.3 Image Optimization 🟠
- [ ] Audit all images for alt text
- [ ] Rename image files with SEO-friendly names
- [ ] Compress images (WebP format)
- [ ] Add descriptive alt text to all images
- [ ] Optimize hero images
- [ ] Optimize before/after gallery images

### 2.4 About Page Enhancement 🟡
- [ ] Create dedicated `/about/page.tsx` with full content
- [ ] Add Victoria's credentials and training
- [ ] Add veteran-owned business emphasis
- [ ] Add Alpha Kappa Alpha membership mention
- [ ] Include trust signals (years experience, certifications)

---

## PHASE 3: CONTENT MARKETING (Month 3+)

### 3.1 Blog Infrastructure 🟡
- [ ] Create blog layout `/blog/layout.tsx`
- [ ] Create blog index page `/blog/page.tsx`
- [ ] Create blog post template `/blog/[slug]/page.tsx`
- [ ] Set up blog categories
- [ ] Add blog to main navigation

### 3.2 Initial Blog Posts 🟡
- [ ] "Microblading Cost in Raleigh: Investment Guide"
- [ ] "Is Microblading Worth It? Complete Guide"
- [ ] "Microblading vs Ombré Brows: Which is Right for You?"
- [ ] "Complete Permanent Makeup Aftercare Guide"
- [ ] "How to Choose the Right Permanent Makeup Artist in Raleigh"

### 3.3 Pillar Content 🟢
- [ ] "Ultimate Guide to Permanent Makeup: Everything You Need to Know" (1,500-2,500 words)
- [ ] "Microblading vs Ombré Brows vs Combo Brows" (1,500-2,500 words)

---

## PHASE 4: LOCAL SEO (Ongoing)

### 4.1 Google Business Profile 🔴
- [ ] Claim Google Business Profile (if not done)
- [ ] Complete all business sections
- [ ] Add services with descriptions and prices
- [ ] Upload 20+ high-quality photos
- [ ] Write optimized business description
- [ ] Set up weekly posting schedule
- [ ] Enable messaging and booking

### 4.2 Local Citations 🟠
- [ ] Yelp business listing
- [ ] Bing Places listing
- [ ] Apple Maps listing
- [ ] Facebook Business page optimization
- [ ] Instagram Business profile optimization
- [ ] Nextdoor Business listing
- [ ] Yellow Pages listing

### 4.3 Industry Directories 🟡
- [ ] StyleSeat listing
- [ ] Vagaro listing
- [ ] The Knot listing (wedding makeup)
- [ ] WeddingWire listing

### 4.4 Local Raleigh Directories 🟡
- [ ] Visit Raleigh listing
- [ ] Raleigh Chamber of Commerce
- [ ] Local beauty/wellness directories

### 4.5 NAP Consistency 🔴
- [ ] Verify NAP (Name, Address, Phone) is consistent everywhere:
  ```
  A Pretty Girl Matter
  4040 Barrett Drive Suite 3
  Raleigh, NC 27609
  (919) 441-0932
  ```

---

## PHASE 5: LINK BUILDING (Ongoing)

### 5.1 Local Media Outreach 🟡
- [ ] Pitch to Raleigh News & Observer (veteran-owned business feature)
- [ ] Triangle Business Journal outreach
- [ ] WRAL Local News pitch
- [ ] Indy Week feature request
- [ ] Raleigh Magazine outreach

### 5.2 Local Partnerships 🟢
- [ ] Connect with local bridal shops
- [ ] Partner with wedding planners
- [ ] Network with photography studios
- [ ] Connect with med spas
- [ ] Partner with salons and beauty schools

### 5.3 Review Generation 🟠
- [ ] Set up review request email sequence
- [ ] Create direct links to review platforms
- [ ] Target: 50+ Google reviews within 12 months
- [ ] Respond to all reviews within 24-48 hours

---

## PHASE 6: TECHNICAL IMPROVEMENTS (Ongoing)

### 6.1 Site Speed 🟠
- [ ] Run PageSpeed Insights audit
- [ ] Compress all images to WebP
- [ ] Enable browser caching
- [ ] Minimize CSS/JavaScript
- [ ] Target: Page load under 3 seconds

### 6.2 Mobile Optimization 🟠
- [ ] Test on multiple mobile devices
- [ ] Ensure click-to-call works
- [ ] Verify booking button prominence on mobile
- [ ] Simplify mobile navigation

### 6.3 URL Structure 🟡
- [ ] Implement SEO-friendly URLs for service pages
- [ ] Create URL redirects if needed
- [ ] Ensure consistent URL structure

---

## TRACKING & ANALYTICS

### Monthly KPIs to Track
- [ ] Organic website traffic
- [ ] Local search rankings for key terms
- [ ] Google Business Profile views/clicks
- [ ] Phone calls from organic search
- [ ] Booking form submissions
- [ ] Reviews count and rating
- [ ] Backlinks acquired
- [ ] Social media followers and engagement

### Target Goals (12 Months)
- [ ] Rank #1-3 for "microblading Raleigh NC"
- [ ] 500+ monthly organic website visitors
- [ ] 50+ Google Business reviews
- [ ] 20+ high-quality backlinks
- [ ] 30% of new clients from organic search

---

## COMPLETED ITEMS LOG

| Date | Task | Notes |
|------|------|-------|
| 2026-01-29 | Created SEO TODO tracking file | Initial setup |
| 2026-01-29 | Updated homepage meta tags | Added optimized title, description, keywords, robots directives |
| 2026-01-29 | Added LocalBusiness/BeautySalon schema | Full structured data with services, location, hours |
| 2026-01-29 | Created robots.txt | Proper crawl directives and sitemap reference |
| 2026-01-29 | Created XML sitemap | All public pages included with priorities |
| 2026-01-29 | Created /services index page | Grid layout with all services |
| 2026-01-29 | Created /services/microblading page | Full SEO content with FAQ schema |
| 2026-01-29 | Created /services/ombre-brows page | Full SEO content with FAQ schema |
| 2026-01-29 | Created /services/combo-brows page | Full SEO content with FAQ schema |
| 2026-01-29 | Created /services/lip-blushing page | Full SEO content with FAQ schema |
| 2026-01-29 | Created /services/permanent-eyeliner page | Full SEO content with FAQ schema |

---

## NOTES & RESOURCES

### Primary Keywords
- "permanent makeup Raleigh NC"
- "microblading Raleigh"
- "lip blushing Raleigh"
- "permanent eyeliner Raleigh"
- "ombré brows Raleigh"
- "combo brows Raleigh NC"

### Business Information (NAP)
```
A Pretty Girl Matter
4040 Barrett Drive Suite 3
Raleigh, NC 27609
(919) 441-0932
https://www.aprettygirlmatter.com
```

### Social Media
- Facebook: https://www.facebook.com/aprettygirlmatter
- Instagram: https://www.instagram.com/aprettygirlmatter

### Unique Selling Points (USPs)
- Veteran-owned business
- Alpha Kappa Alpha member
- Trained by multiple top academies (The Collective, Beauty Slesh, Beauty Angels)
- Customized, natural-looking results
- Free consultation
- Financing available
