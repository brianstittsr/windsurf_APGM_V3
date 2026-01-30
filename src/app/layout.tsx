import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/custom-colors.css";
import Providers from './providers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Permanent Makeup Raleigh NC | Microblading & Lip Blushing | A Pretty Girl Matter",
    template: "%s | A Pretty Girl Matter"
  },
  description: "Expert permanent makeup in Raleigh, NC. Specializing in microblading, ombré brows, lip blushing & eyeliner. Veteran-owned studio. Book your free consultation today!",
  keywords: [
    "permanent makeup Raleigh NC",
    "microblading Raleigh",
    "lip blushing Raleigh",
    "permanent eyeliner Raleigh",
    "ombré brows Raleigh",
    "combo brows Raleigh NC",
    "PMU artist Raleigh",
    "eyebrow tattoo Raleigh",
    "cosmetic tattooing Raleigh",
    "veteran-owned permanent makeup"
  ],
  authors: [{ name: "Victoria", url: "https://www.aprettygirlmatter.com" }],
  creator: "A Pretty Girl Matter",
  publisher: "A Pretty Girl Matter",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.aprettygirlmatter.com"),
  alternates: {
    canonical: "https://www.aprettygirlmatter.com",
  },
  icons: {
    icon: [
      { url: "/images/APGM-icon2.png", sizes: "48x48", type: "image/png" },
      { url: "/images/APGM-icon2.png", sizes: "32x32", type: "image/png" },
      { url: "/images/APGM-icon2.png", sizes: "16x16", type: "image/png" }
    ],
    shortcut: "/images/APGM-icon2.png",
    apple: "/images/APGM-icon2.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.aprettygirlmatter.com",
    title: "Permanent Makeup Raleigh NC | Microblading & Lip Blushing | A Pretty Girl Matter",
    description: "Expert permanent makeup in Raleigh, NC. Specializing in microblading, ombré brows, lip blushing & eyeliner. Veteran-owned studio. Book your free consultation today!",
    siteName: "A Pretty Girl Matter",
    images: [
      {
        url: "https://www.aprettygirlmatter.com/images/APGM-icon2.png",
        width: 500,
        height: 500,
        alt: "A Pretty Girl Matter - Permanent Makeup Raleigh NC"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Permanent Makeup Raleigh NC | A Pretty Girl Matter",
    description: "Expert permanent makeup in Raleigh, NC. Microblading, ombré brows, lip blushing & eyeliner. Veteran-owned studio.",
    images: ["https://www.aprettygirlmatter.com/images/APGM-icon2.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add Google Search Console verification when available
    // google: 'your-google-verification-code',
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  "name": "A Pretty Girl Matter",
  "image": "https://www.aprettygirlmatter.com/images/APGM-icon2.png",
  "url": "https://www.aprettygirlmatter.com",
  "telephone": "+19194410932",
  "email": "victoria@aprettygirlmatter.com",
  "priceRange": "$$",
  "description": "A Pretty Girl Matter is a veteran-owned permanent makeup studio in Raleigh, NC, specializing in microblading, ombré brows, combo brows, lip blushing, and permanent eyeliner. Owner Victoria is a certified PMU artist trained by top academies including The Collective, Beauty Slesh, and Beauty Angels.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "4040 Barrett Drive Suite 3",
    "addressLocality": "Raleigh",
    "addressRegion": "NC",
    "postalCode": "27609",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "35.8587",
    "longitude": "-78.6108"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "opens": "09:00",
    "closes": "18:00"
  },
  "sameAs": [
    "https://www.facebook.com/aprettygirlmatter",
    "https://www.instagram.com/aprettygirlmatter"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Permanent Makeup Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Microblading",
          "description": "Natural-looking eyebrow enhancement using fine hair-like strokes"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Ombré Powder Brows",
          "description": "Soft, natural gradient effect eyebrow tattoo that lasts 1-3 years"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Combo Brows",
          "description": "Combination of microblading and powder brows for a fuller look"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Lip Blushing",
          "description": "Enhance lip color and definition naturally with permanent lip tattoo"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Permanent Eyeliner",
          "description": "Wake up with defined eyes every day with lash line enhancement"
        }
      }
    ]
  },
  "founder": {
    "@type": "Person",
    "name": "Victoria",
    "jobTitle": "Certified Permanent Makeup Artist"
  },
  "areaServed": [
    {
      "@type": "City",
      "name": "Raleigh",
      "containedInPlace": {
        "@type": "State",
        "name": "North Carolina"
      }
    },
    {
      "@type": "City",
      "name": "Cary"
    },
    {
      "@type": "City",
      "name": "Durham"
    },
    {
      "@type": "City",
      "name": "Chapel Hill"
    },
    {
      "@type": "City",
      "name": "Wake Forest"
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="48x48" href="/images/APGM-icon2.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/APGM-icon2.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/APGM-icon2.png" />
        <link rel="shortcut icon" href="/images/APGM-icon2.png" />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
