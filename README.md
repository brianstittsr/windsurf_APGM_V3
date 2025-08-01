# A Pretty Girl Matter - Permanent Makeup Website

A professional, modern website for A Pretty Girl Matter LLC, a permanent makeup studio specializing in microblading, powder brows, and other cosmetic tattooing services.

## 🌟 Features

### **Brand Integration**
- Custom brand color (#AD6269) integrated throughout the site
- Professional typography and consistent styling
- Responsive design optimized for all devices

### **Comprehensive Pages**
- **Home Page**: Hero section, services overview, process explanation, about section, client reviews
- **Booking System**: Multi-step booking flow with service selection, calendar scheduling, and health form
- **Contact Page**: Contact form, Google Maps integration, business hours, FAQ section
- **Financing Page**: Payment options including Cherry, Klarna, and PayPal Credit
- **Candidate Assessment**: Interactive questionnaire to determine service eligibility
- **Policy Pages**: Privacy Policy, Terms of Service, and Cancellation Policy

### **Advanced Booking Flow**
- **Service Selection**: Card-style layout with service descriptions and pricing
- **Calendar Integration**: Calendly-style date and time selection
- **Health Form**: Comprehensive 18-question health screening form
- **Vagaro Widget**: Integrated booking widget with CSP-compliant iframe solution

### **Technical Features**
- **Next.js 15.4.4**: Latest React framework with App Router
- **Bootstrap 5.3.3**: Modern CSS framework with custom theme
- **TypeScript**: Type-safe development
- **Responsive Design**: Mobile-first approach
- **SEO Optimized**: Proper meta tags and semantic HTML

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/brianstittsr/windsurf_APGM_V3.git
cd windsurf_APGM_V3
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── book-now/                # Vagaro booking widget page
│   ├── book-now-custom/         # Custom booking flow
│   ├── candidate-assessment/    # Health screening questionnaire
│   ├── contact/                 # Contact form and information
│   ├── financing/               # Payment options and calculator
│   ├── privacy-policy/          # Privacy policy page
│   ├── terms-of-service/        # Terms of service page
│   ├── cancellation-policy/     # Cancellation policy page
│   ├── globals.css              # Global styles and Bootstrap imports
│   ├── layout.tsx               # Root layout component
│   └── page.tsx                 # Home page
├── components/                   # Reusable React components
│   ├── Header.tsx               # Navigation header
│   ├── Footer.tsx               # Site footer
│   ├── Hero.tsx                 # Hero section with video background
│   ├── TheProcess.tsx           # Service process explanation
│   ├── AboutVictoria.tsx        # About section
│   ├── ClientReviews.tsx        # Customer testimonials
│   └── ...
├── styles/                      # Custom CSS files
│   └── custom-colors.css        # Brand color overrides
public/
├── images/                      # Static images
├── APRG_Text_Logo.png          # Company logo
└── vagaro-widget.html          # Booking widget iframe content
```

## 🎨 Brand Colors

- **Primary Brand Color**: #AD6269 (Rose/Mauve)
- **Text Colors**: Black for readability, white for contrast
- **Background**: Light variations of brand color (30% opacity)

## 🔧 Key Components

### **Multi-Step Booking Flow**
1. **Service Selection**: Card-based service browser
2. **Calendar Booking**: Date and time selection
3. **Health Form**: Comprehensive medical questionnaire
4. **Confirmation**: Booking summary and completion

### **Responsive Design**
- Mobile-first approach
- Bootstrap grid system
- Optimized for tablets and desktops
- Touch-friendly interfaces

### **SEO & Performance**
- Semantic HTML structure
- Optimized images and assets
- Fast loading times
- Accessibility compliance

## 🛠️ Technologies Used

- **Frontend**: Next.js 15.4.4, React 19, TypeScript
- **Styling**: Bootstrap 5.3.3, Custom CSS
- **Forms**: React Hook Form, Client-side validation
- **Icons**: SVG icons, Bootstrap Icons
- **Deployment**: Vercel-ready configuration

## 📱 Pages Overview

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Main landing page with hero, services, process, about, reviews |
| Custom Booking | `/book-now-custom` | Multi-step booking flow with calendar and health form |
| Vagaro Booking | `/book-now` | Integrated Vagaro booking widget |
| Contact | `/contact` | Contact form, map, business info, FAQ |
| Financing | `/financing` | Payment options and calculator |
| Assessment | `/candidate-assessment` | Health screening questionnaire |
| Privacy Policy | `/privacy-policy` | HIPAA-compliant privacy policy |
| Terms of Service | `/terms-of-service` | Legal terms and conditions |
| Cancellation Policy | `/cancellation-policy` | Detailed cancellation and rescheduling policy |

## 🔒 Security Features

- **Content Security Policy**: CSP-compliant third-party integrations
- **HIPAA Compliance**: Health information protection
- **Form Validation**: Client and server-side validation
- **Secure Iframe**: Sandboxed booking widget

## 📞 Business Information

**A Pretty Girl Matter, LLC**
- Address: 4040 Barrett Drive Suite 3, Raleigh, NC 27609
- Phone: (919) 441-0932
- Email: victoria@aprettygirlmatter.com

## 🚀 Deployment

This project is optimized for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure environment variables if needed
3. Deploy with automatic builds on push

## 📄 License

This project is proprietary software for A Pretty Girl Matter, LLC. All rights reserved.

## 🤝 Contributing

This is a private project. For any modifications or updates, please contact the development team.

---

**Built with ❤️ for A Pretty Girl Matter, LLC**
