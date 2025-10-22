import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/custom-colors.css";
import BootstrapProvider from './providers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A Pretty Girl Matter",
  description: "Professional semi-permanent makeup services by Victoria Escobar. Microblading, semi-permanent eyeliner, lip blushing, and more. Transform your look with natural, beautiful results.",
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
    url: "https://aprettygirlmatter.com",
    title: "A Pretty Girl Matter",
    description: "Professional semi-permanent makeup services by Victoria Escobar. Microblading, semi-permanent eyeliner, lip blushing, and more.",
    siteName: "A Pretty Girl Matter",
    images: [
      {
        url: "https://aprettygirlmatter.com/images/APGM-icon2.png",
        width: 500,
        height: 500,
        alt: "A Pretty Girl Matter Logo"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "A Pretty Girl Matter",
    description: "Professional semi-permanent makeup services by Victoria Escobar.",
    images: ["https://aprettygirlmatter.com/images/APGM-icon2.png"],
  },
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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BootstrapProvider>
          {children}
        </BootstrapProvider>
      </body>
    </html>
  );
}
