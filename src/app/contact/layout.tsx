import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact A Pretty Girl Matter | Book Permanent Makeup Raleigh NC',
  description: 'Book your permanent makeup appointment in Raleigh, NC. Free consultation. Located at 4040 Barrett Drive. Call (919) 441-0932 today!',
  keywords: ['contact permanent makeup Raleigh', 'book microblading Raleigh', 'PMU consultation Raleigh NC'],
  alternates: {
    canonical: 'https://www.aprettygirlmatter.com/contact',
  },
  openGraph: {
    title: 'Contact A Pretty Girl Matter | Book Permanent Makeup Raleigh NC',
    description: 'Book your permanent makeup appointment in Raleigh, NC. Free consultation available.',
    url: 'https://www.aprettygirlmatter.com/contact',
    type: 'website',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
