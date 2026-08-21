'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ImageManager from '@/components/admin/ImageManager';

export default function AdminImagesPage() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!userProfile) {
        router.push('/login');
        return;
      }
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
      <div className="bg-white shadow-sm border-bottom">
        <div className="container-fluid py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-0">Image Manager</h1>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <a href="/admin" className="text-decoration-none">Dashboard</a>
                  </li>
                  <li className="breadcrumb-item">
                    <a href="/admin/services" className="text-decoration-none">Services</a>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">Images</li>
                </ol>
              </nav>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => router.push('/admin/services')}
              >
                <i className="fas fa-arrow-left me-2"></i>Back to Services
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                <i className="fas fa-images text-[#AD6269] mr-2"></i>
                Service Images
              </h4>
              <p className="text-sm text-gray-500 mb-4">
                Upload, manage, and select images for services. Images are stored as base64 in Firebase.
              </p>
              <ImageManager
                selectedImage={selectedImage}
                onSelect={setSelectedImage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
