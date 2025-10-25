import ClientUpdateServicesPage from './page.client';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

// This is a server component that imports the client component
export default function UpdateServicesPage() {
  return <ClientUpdateServicesPage />;
}
