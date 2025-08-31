'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ServicesManager from '@/components/admin/ServicesManager';

export default function AdminServicesPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!userProfile) {
        router.push('/login');
        return;
      }

      // Check if user has admin role
      if (userProfile.role !== 'admin') {
        router.push('/');
        return;
      }

      setIsAuthorized(true);
    }
  }, [userProfile, loading, router]);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h3>Access Denied</h3>
          <p className="text-muted">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <div className="container-fluid py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">Admin Panel</h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <a href="/admin" className="text-decoration-none">Dashboard</a>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">Services</li>
                </ol>
              </nav>
            </div>
            <div>
              <button
                className="btn btn-outline-secondary"
                onClick={() => router.push('/admin')}
              >
                <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-fluid py-4">
        <ServicesManager />
      </div>
    </div>
  );
}
