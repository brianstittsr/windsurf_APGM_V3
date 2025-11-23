'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import UserManager from '../../components/admin/UserManager';
import ReviewsManager from '../../components/admin/ReviewsManager';
import ServicesManager from '../../components/admin/ServicesManager';
import CouponsGiftCardsManager from '../../components/admin/CouponsGiftCardsManager';
import BusinessSettingsManager from '../../components/admin/BusinessSettingsManager';
import ArtistManager from '../../components/admin/ArtistManager';
import BookingCalendarManager from '../../components/admin/BookingCalendarManager';
import RegistrationFormsManager from '../../components/admin/RegistrationFormsManager';
import GoHighLevelManager from '../../components/admin/GoHighLevelManager';
import GoHighLevelMCP from '../../components/admin/GoHighLevelMCP';
import BMADOrchestrator from '../../components/admin/BMADOrchestrator';
import ArtistAvailabilityManager from '../../components/admin/ArtistAvailabilityManager';
import BookingCalendar from '../../components/admin/BookingCalendar';
import QRCodeManager from '../../components/admin/QRCodeManager';
import Footer from '../../components/Footer';

type TabType = 'overview' | 'users' | 'reviews' | 'services' | 'coupons' | 'business' | 'artists' | 'bookings' | 'forms' | 'gohighlevel' | 'gohighlevel-mcp' | 'bmad-orchestrator' | 'availability' | 'calendar' | 'alexa' | 'qrcodes';

export default function DashboardPage() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    if (!loading && (!user || userRole !== 'admin')) {
      router.push('/login');
    }
  }, [user, userRole, loading, router]);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || userRole !== 'admin') {
    return null; // Will redirect in useEffect
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Dashboard Overview</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 mb-4">
                      <div className="card bg-primary text-white">
                        <div className="card-body">
                          <h5 className="card-title">Users</h5>
                          <p className="card-text">Manage user accounts and permissions</p>
                          <button
                            className="btn btn-light btn-sm"
                            onClick={() => setActiveTab('users')}
                          >
                            Manage Users
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-4">
                      <div className="card bg-success text-white">
                        <div className="card-body">
                          <h5 className="card-title">Reviews</h5>
                          <p className="card-text">Manage customer testimonials</p>
                          <button
                            className="btn btn-light btn-sm"
                            onClick={() => setActiveTab('reviews')}
                          >
                            Manage Reviews
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-4">
                      <div className="card bg-info text-white">
                        <div className="card-body">
                          <h5 className="card-title">Services</h5>
                          <p className="card-text">Configure available services</p>
                          <button
                            className="btn btn-light btn-sm"
                            onClick={() => setActiveTab('services')}
                          >
                            Manage Services
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-4">
                      <div className="card bg-warning text-white">
                        <div className="card-body">
                          <h5 className="card-title">Coupons & Gifts</h5>
                          <p className="card-text">Manage discounts and gift cards</p>
                          <button
                            className="btn btn-light btn-sm"
                            onClick={() => setActiveTab('coupons')}
                          >
                            Manage Coupons
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-3 mb-4">
                      <div className="card bg-secondary text-white">
                        <div className="card-body">
                          <h5 className="card-title">Business Settings</h5>
                          <p className="card-text">Configure business information and settings</p>
                          <button
                            className="btn btn-light btn-sm"
                            onClick={() => setActiveTab('business')}
                          >
                            Settings
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-4">
                      <div className="card bg-danger text-white">
                        <div className="card-body">
                          <h5 className="card-title">Artists</h5>
                          <p className="card-text">Manage artist profiles and specialties</p>
                          <button
                            className="btn btn-light btn-sm"
                            onClick={() => setActiveTab('artists')}
                          >
                            Manage Artists
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-4">
                      <div className="card bg-dark text-white">
                        <div className="card-body">
                          <h5 className="card-title">Bookings</h5>
                          <p className="card-text">View and manage all appointments</p>
                          <button
                            className="btn btn-light btn-sm"
                            onClick={() => setActiveTab('bookings')}
                          >
                            View Calendar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-3 mb-4">
                      <div className="card bg-purple text-white" style={{backgroundColor: '#6f42c1'}}>
                        <div className="card-body">
                          <h5 className="card-title">Registration Forms</h5>
                          <p className="card-text">Review client forms</p>
                          <button
                            className="btn btn-light btn-sm"
                            onClick={() => setActiveTab('forms')}
                          >
                            View Forms
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-4">
                      <div className="card bg-indigo text-white" style={{backgroundColor: '#667eea'}}>
                        <div className="card-body">
                          <h5 className="card-title">GoHighLevel</h5>
                          <p className="card-text">Manage CRM integration</p>
                          <button
                            className="btn btn-light btn-sm"
                            onClick={() => setActiveTab('gohighlevel')}
                          >
                            Configure
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-4">
                      <div className="card text-white" style={{backgroundColor: '#e83e8c'}}>
                        <div className="card-body">
                          <h5 className="card-title">QR Codes</h5>
                          <p className="card-text">Generate and track QR codes</p>
                          <button
                            className="btn btn-light btn-sm"
                            onClick={() => setActiveTab('qrcodes')}
                          >
                            Manage QR Codes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'users':
        return <UserManager />;
      case 'reviews':
        return <ReviewsManager />;
      case 'services':
        return <ServicesManager />;
      case 'coupons':
        return <CouponsGiftCardsManager />;
      case 'business':
        return <BusinessSettingsManager />;
      case 'artists':
        return <ArtistManager />;
      case 'bookings':
        return <BookingCalendarManager />;
      case 'forms':
        return <RegistrationFormsManager />;
      case 'gohighlevel':
        return <GoHighLevelManager />;
      case 'gohighlevel-mcp':
        return <GoHighLevelMCP />;
      case 'bmad-orchestrator':
        return <BMADOrchestrator />;
      case 'availability':
        return <ArtistAvailabilityManager />;
      case 'calendar':
        return <BookingCalendar />;
      case 'qrcodes':
        return <QRCodeManager />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="container-fluid py-4">
        <div className="row mb-4">
          <div className="col-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href="/" className="text-decoration-none">Home</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">Admin Dashboard</li>
              </ol>
            </nav>
            <h2 className="mb-0">Admin Dashboard</h2>
            <p className="text-muted">Welcome back, {user.displayName}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm" style={{borderRadius: '12px', overflow: 'hidden'}}>
              <ul className="nav nav-tabs" role="tablist" style={{borderBottom: '2px solid #dee2e6'}}>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link fw-bold ${activeTab === 'overview' ? 'active border-bottom border-primary' : ''}`}
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  style={{padding: '12px 16px', cursor: 'pointer'}}
                >
                  <i className="fas fa-tachometer-alt me-2"></i>Overview
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link fw-bold ${activeTab === 'users' ? 'active border-bottom border-primary' : ''}`}
                  type="button"
                  onClick={() => setActiveTab('users')}
                  style={{padding: '12px 16px', cursor: 'pointer'}}
                >
                  <i className="fas fa-users me-2"></i>Users
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link fw-bold ${activeTab === 'reviews' ? 'active border-bottom border-primary' : ''}`}
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  style={{padding: '12px 16px', cursor: 'pointer'}}
                >
                  <i className="fas fa-star me-2"></i>Reviews
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link fw-bold ${activeTab === 'services' ? 'active border-bottom border-primary' : ''}`}
                  type="button"
                  onClick={() => setActiveTab('services')}
                  style={{padding: '12px 16px', cursor: 'pointer'}}
                >
                  <i className="fas fa-list me-2"></i>Services
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link fw-bold ${activeTab === 'coupons' ? 'active border-bottom border-primary' : ''}`}
                  type="button"
                  onClick={() => setActiveTab('coupons')}
                  style={{padding: '12px 16px', cursor: 'pointer'}}
                >
                  <i className="fas fa-tags me-2"></i>Coupons & Gifts
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link fw-bold ${activeTab === 'business' ? 'active border-bottom border-primary' : ''}`}
                  type="button"
                  onClick={() => setActiveTab('business')}
                  style={{padding: '12px 16px', cursor: 'pointer'}}
                >
                  <i className="fas fa-cog me-2"></i>Business Settings
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link fw-bold ${activeTab === 'artists' ? 'active border-bottom border-primary' : ''}`}
                  type="button"
                  onClick={() => setActiveTab('artists')}
                  style={{padding: '12px 16px', cursor: 'pointer'}}
                >
                  <i className="fas fa-user-tie me-2"></i>Artists
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link fw-bold ${activeTab === 'availability' ? 'active border-bottom border-primary' : ''}`}
                  type="button"
                  onClick={() => setActiveTab('availability')}
                  style={{padding: '12px 16px', cursor: 'pointer'}}
                >
                  <i className="fas fa-calendar-check me-2"></i>Artist Availability
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link fw-bold ${activeTab === 'calendar' ? 'active border-bottom border-primary' : ''}`}
                  type="button"
                  onClick={() => setActiveTab('calendar')}
                  style={{padding: '12px 16px', cursor: 'pointer'}}
                >
                  <i className="fas fa-calendar me-2"></i>Calendar
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link fw-bold ${activeTab === 'bookings' ? 'active border-bottom border-primary' : ''}`}
                  type="button"
                  onClick={() => setActiveTab('bookings')}
                  style={{padding: '12px 16px', cursor: 'pointer'}}
                >
                  <i className="fas fa-calendar-alt me-2"></i>Bookings
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link fw-bold ${activeTab === 'forms' ? 'active border-bottom border-primary' : ''}`}
                  type="button"
                  onClick={() => setActiveTab('forms')}
                  style={{padding: '12px 16px', cursor: 'pointer'}}
                >
                  <i className="fas fa-file-alt me-2"></i>Forms
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link fw-bold ${activeTab === 'gohighlevel' ? 'active border-bottom border-primary' : ''}`}
                  type="button"
                  onClick={() => setActiveTab('gohighlevel')}
                  style={{padding: '12px 16px', cursor: 'pointer'}}
                >
                  <i className="fas fa-cloud-upload-alt me-2"></i>GoHighLevel
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link fw-bold ${activeTab === 'gohighlevel-mcp' ? 'active border-bottom border-primary' : ''}`}
                  type="button"
                  onClick={() => setActiveTab('gohighlevel-mcp')}
                  style={{padding: '12px 16px', cursor: 'pointer'}}
                >
                  <i className="fas fa-server me-2"></i>GoHighLevel MCP
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link fw-bold ${activeTab === 'bmad-orchestrator' ? 'active border-bottom border-primary' : ''}`}
                  type="button"
                  onClick={() => setActiveTab('bmad-orchestrator')}
                  style={{padding: '12px 16px', cursor: 'pointer'}}
                >
                  <i className="fas fa-robot me-2"></i>BMAD Orchestrator
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link fw-bold ${activeTab === 'qrcodes' ? 'active border-bottom border-primary' : ''}`}
                  type="button"
                  onClick={() => setActiveTab('qrcodes')}
                  style={{padding: '12px 16px', cursor: 'pointer'}}
                >
                  <i className="fas fa-qrcode me-2"></i>QR Codes
                </button>
              </li>
            </ul>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="row">
          <div className="col-12">
            {renderTabContent()}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
