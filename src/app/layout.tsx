import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/custom-colors.css";

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
  description: "Professional permanent makeup services by Victoria Escobar. Microblading, permanent eyeliner, lip blushing, and more. Transform your look with natural, beautiful results.",
  icons: {
    icon: [
      { url: "/images/APGM-icon2.png", sizes: "48x48", type: "image/png" },
      { url: "/images/APGM-icon2.png", sizes: "32x32", type: "image/png" },
      { url: "/images/APGM-icon2.png", sizes: "16x16", type: "image/png" }
    ],
    shortcut: "/images/APGM-icon2.png",
    apple: "/images/APGM-icon2.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" sizes="48x48" href="/images/APGM-icon2.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/APGM-icon2.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/APGM-icon2.png" />
        <link rel="shortcut icon" href="/images/APGM-icon2.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
