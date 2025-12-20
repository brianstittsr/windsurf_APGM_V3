'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import AdminSidebar from '../../components/admin/AdminSidebar';
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
import CompetitorAnalysis from '../../components/admin/CompetitorAnalysis';
import PageSpeedDashboard from '../../components/admin/PageSpeedDashboard';
import GoogleReviewsDashboard from '../../components/admin/GoogleReviewsDashboard';
import WhatsAppDashboard from '../../components/admin/WhatsAppDashboard';
import LoyaltyDashboard from '../../components/admin/LoyaltyDashboard';
import GeoCompetitorDashboard from '../../components/admin/GeoCompetitorDashboard';
import { cn } from '@/lib/utils';

type TabType = 'overview' | 'users' | 'reviews' | 'services' | 'coupons' | 'business' | 'artists' | 'bookings' | 'forms' | 'gohighlevel' | 'gohighlevel-mcp' | 'bmad-orchestrator' | 'availability' | 'calendar' | 'alexa' | 'qrcodes' | 'seo-competitor' | 'seo-pagespeed' | 'google-reviews' | 'whatsapp' | 'loyalty' | 'geo-competitors';

export default function DashboardPage() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const getPageTitle = (tab: TabType): string => {
    const titles: Record<TabType, string> = {
      'overview': 'Dashboard Overview',
      'users': 'User Management',
      'reviews': 'Reviews Management',
      'services': 'Services Management',
      'coupons': 'Coupons & Gift Cards',
      'business': 'Business Settings',
      'artists': 'Artist Management',
      'bookings': 'Bookings',
      'forms': 'Registration Forms',
      'gohighlevel': 'GoHighLevel Integration',
      'gohighlevel-mcp': 'GoHighLevel MCP',
      'bmad-orchestrator': 'BMAD Orchestrator',
      'availability': 'Artist Availability',
      'calendar': 'Booking Calendar',
      'alexa': 'Alexa Skills',
      'qrcodes': 'QR Code Manager',
      'seo-competitor': 'SEO Competitor Analysis',
      'seo-pagespeed': 'PageSpeed Insights',
      'google-reviews': 'Google Reviews',
      'whatsapp': 'WhatsApp Business',
      'loyalty': 'Loyalty Program',
      'geo-competitors': 'Geographical Competitor Analysis',
    };
    return titles[tab] || 'Dashboard';
  };

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
      case 'seo-competitor':
        return <CompetitorAnalysis />;
      case 'seo-pagespeed':
        return <PageSpeedDashboard />;
      case 'google-reviews':
        return <GoogleReviewsDashboard />;
      case 'whatsapp':
        return <WhatsAppDashboard />;
      case 'loyalty':
        return <LoyaltyDashboard />;
      case 'geo-competitors':
        return <GeoCompetitorDashboard />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen" style={{ paddingTop: 0 }}>
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300 bg-gray-50",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
        style={{ paddingTop: 0, minHeight: '100vh' }}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getPageTitle(activeTab)}
              </h1>
              <p className="text-sm text-gray-500">
                Welcome back, {user.displayName || user.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
                ← Back to Website
              </a>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}
