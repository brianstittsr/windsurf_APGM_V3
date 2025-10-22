import { Metadata } from 'next';

// This prevents this page from being used in social media previews
export const metadata: Metadata = {
  robots: 'noindex, nofollow',
  openGraph: {
    type: 'website',
    url: 'https://aprettygirlmatter.com',
    title: 'A Pretty Girl Matter',
    description: 'Professional semi-permanent makeup services by Victoria Escobar.',
    siteName: 'A Pretty Girl Matter',
    images: [
      {
        url: 'https://aprettygirlmatter.com/images/APGM-icon2.png',
        width: 500,
        height: 500,
        alt: 'A Pretty Girl Matter Logo'
      }
    ],
  }
};
