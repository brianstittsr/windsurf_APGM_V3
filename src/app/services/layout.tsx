import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Permanent Makeup Services Raleigh NC',
  description: 'Explore our permanent makeup services in Raleigh, NC. Microblading, ombré brows, combo brows, lip blushing, and permanent eyeliner. Book your free consultation today!',
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/services',
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
