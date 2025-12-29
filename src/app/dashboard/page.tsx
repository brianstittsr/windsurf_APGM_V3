'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
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
import GooglePlacesReviews from '../../components/admin/GooglePlacesReviews';
import WhatsAppDashboard from '../../components/admin/WhatsAppDashboard';
import LoyaltyDashboard from '../../components/admin/LoyaltyDashboard';
import GeoCompetitorDashboard from '../../components/admin/GeoCompetitorDashboard';
import HeroCarouselManager from '../../components/admin/HeroCarouselManager';
import DocumentsManager from '../../components/admin/DocumentsManager';
import ReputationDashboard from '../../components/admin/ReputationDashboard';
import EmailMarketingDashboard from '../../components/admin/EmailMarketingDashboard';
import SocialMediaDashboard from '../../components/admin/SocialMediaDashboard';
import LeadGenerationDashboard from '../../components/admin/LeadGenerationDashboard';
import OnlineOffersDashboard from '../../components/admin/OnlineOffersDashboard';
import VideoMarketingDashboard from '../../components/admin/VideoMarketingDashboard';
import PaidTrafficDashboard from '../../components/admin/PaidTrafficDashboard';
import RetargetingDashboard from '../../components/admin/RetargetingDashboard';
import PPCCampaignsDashboard from '../../components/admin/PPCCampaignsDashboard';
import CanvaIntegration from '../../components/admin/CanvaIntegration';
import { cn } from '@/lib/utils';

type TabType = 'overview' | 'users' | 'reviews' | 'services' | 'coupons' | 'business' | 'artists' | 'bookings' | 'forms' | 'gohighlevel' | 'gohighlevel-mcp' | 'bmad-orchestrator' | 'availability' | 'calendar' | 'alexa' | 'qrcodes' | 'seo-competitor' | 'seo-pagespeed' | 'google-reviews' | 'whatsapp' | 'loyalty' | 'geo-competitors' | 'paid-traffic' | 'retargeting' | 'reputation' | 'social-media' | 'email-marketing' | 'video-marketing' | 'lead-generation' | 'online-offers' | 'ppc-campaigns' | 'website-convert' | 'marketing-automation' | 'hero-carousel' | 'documents' | 'canva';

interface BookingMetrics {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  todayBookings: number;
  thisWeekBookings: number;
  revenue: number;
}

export default function DashboardPage() {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [metrics, setMetrics] = useState<BookingMetrics>({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    todayBookings: 0,
    thisWeekBookings: 0,
    revenue: 0
  });
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Fetch booking metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const db = getDb();
        const bookingsRef = collection(db, 'bookings');
        const snapshot = await getDocs(bookingsRef);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        
        let total = 0;
        let pending = 0;
        let confirmed = 0;
        let completed = 0;
        let cancelled = 0;
        let todayBookings = 0;
        let thisWeekBookings = 0;
        let revenue = 0;
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          total++;
          
          // Count by status
          switch (data.status) {
            case 'pending': pending++; break;
            case 'confirmed': confirmed++; break;
            case 'completed': completed++; revenue += (data.price || 0); break;
            case 'cancelled': cancelled++; break;
          }
          
          // Check date for today/this week
          const bookingDate = data.date ? new Date(data.date) : null;
          if (bookingDate) {
            bookingDate.setHours(0, 0, 0, 0);
            if (bookingDate.getTime() === today.getTime()) {
              todayBookings++;
            }
            if (bookingDate >= weekStart) {
              thisWeekBookings++;
            }
          }
        });
        
        setMetrics({ total, pending, confirmed, completed, cancelled, todayBookings, thisWeekBookings, revenue });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setMetricsLoading(false);
      }
    };
    
    fetchMetrics();
  }, []);

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
      'paid-traffic': 'Paid Traffic Management',
      'retargeting': 'Customer Retargeting',
      'reputation': 'Reputation Marketing',
      'social-media': 'Social Media Management',
      'email-marketing': 'Email Marketing',
      'video-marketing': 'Video Marketing',
      'lead-generation': 'Lead Generation',
      'online-offers': 'Online Offers',
      'ppc-campaigns': 'PPC Campaigns',
      'website-convert': 'Conversion Optimization',
      'marketing-automation': 'Marketing Automation',
      'hero-carousel': 'Hero Carousel',
      'documents': 'Documents & Agreements',
      'canva': 'Canva Integration',
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50" style={{ marginTop: '-100px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AD6269] mx-auto" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
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
          <div className="space-y-8">
            {/* Booking Metrics Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Progress</h2>
              {metricsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269]"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Bookings */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.total}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-calendar-check text-blue-600 text-xl"></i>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center text-sm">
                      <span className="text-blue-600 font-medium">{metrics.thisWeekBookings}</span>
                      <span className="text-gray-500 ml-1">this week</span>
                    </div>
                  </div>

                  {/* Pending */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Pending</p>
                        <p className="text-3xl font-bold text-yellow-600 mt-1">{metrics.pending}</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-clock text-yellow-600 text-xl"></i>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center text-sm">
                      <span className="text-yellow-600 font-medium">Awaiting confirmation</span>
                    </div>
                  </div>

                  {/* Confirmed */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Confirmed</p>
                        <p className="text-3xl font-bold text-green-600 mt-1">{metrics.confirmed}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-check-circle text-green-600 text-xl"></i>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center text-sm">
                      <span className="text-green-600 font-medium">{metrics.todayBookings}</span>
                      <span className="text-gray-500 ml-1">scheduled today</span>
                    </div>
                  </div>

                  {/* Completed / Revenue */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Completed</p>
                        <p className="text-3xl font-bold text-[#AD6269] mt-1">{metrics.completed}</p>
                      </div>
                      <div className="w-12 h-12 bg-[#AD6269]/10 rounded-full flex items-center justify-center">
                        <i className="fas fa-dollar-sign text-[#AD6269] text-xl"></i>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center text-sm">
                      <span className="text-[#AD6269] font-medium">${metrics.revenue.toLocaleString()}</span>
                      <span className="text-gray-500 ml-1">revenue</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
                {/* Users */}
                <div 
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#AD6269] hover:shadow-lg transition-all cursor-pointer group text-center"
                  onClick={() => setActiveTab('users')}
                >
                  <div className="w-16 h-16 bg-gray-100 group-hover:bg-[#AD6269]/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <i className="fas fa-users text-3xl text-gray-600 group-hover:text-[#AD6269] transition-colors"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Users</h3>
                  <p className="text-gray-500 text-sm">Manage accounts</p>
                </div>

                {/* Reviews */}
                <div 
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#AD6269] hover:shadow-lg transition-all cursor-pointer group text-center"
                  onClick={() => setActiveTab('reviews')}
                >
                  <div className="w-16 h-16 bg-gray-100 group-hover:bg-[#AD6269]/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <i className="fas fa-star text-3xl text-gray-600 group-hover:text-[#AD6269] transition-colors"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Reviews</h3>
                  <p className="text-gray-500 text-sm">Testimonials</p>
                </div>

                {/* Services */}
                <div 
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#AD6269] hover:shadow-lg transition-all cursor-pointer group text-center"
                  onClick={() => setActiveTab('services')}
                >
                  <div className="w-16 h-16 bg-gray-100 group-hover:bg-[#AD6269]/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <i className="fas fa-spa text-3xl text-gray-600 group-hover:text-[#AD6269] transition-colors"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Services</h3>
                  <p className="text-gray-500 text-sm">Configure services</p>
                </div>

                {/* Coupons */}
                <div 
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#AD6269] hover:shadow-lg transition-all cursor-pointer group text-center"
                  onClick={() => setActiveTab('coupons')}
                >
                  <div className="w-16 h-16 bg-gray-100 group-hover:bg-[#AD6269]/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <i className="fas fa-tags text-3xl text-gray-600 group-hover:text-[#AD6269] transition-colors"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Coupons</h3>
                  <p className="text-gray-500 text-sm">Discounts & gifts</p>
                </div>

                {/* Settings */}
                <div 
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#AD6269] hover:shadow-lg transition-all cursor-pointer group text-center"
                  onClick={() => setActiveTab('business')}
                >
                  <div className="w-16 h-16 bg-gray-100 group-hover:bg-[#AD6269]/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <i className="fas fa-cog text-3xl text-gray-600 group-hover:text-[#AD6269] transition-colors"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Settings</h3>
                  <p className="text-gray-500 text-sm">Business info</p>
                </div>

                {/* Artists */}
                <div 
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#AD6269] hover:shadow-lg transition-all cursor-pointer group text-center"
                  onClick={() => setActiveTab('artists')}
                >
                  <div className="w-16 h-16 bg-gray-100 group-hover:bg-[#AD6269]/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <i className="fas fa-paint-brush text-3xl text-gray-600 group-hover:text-[#AD6269] transition-colors"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Artists</h3>
                  <p className="text-gray-500 text-sm">Manage profiles</p>
                </div>

                {/* Calendar */}
                <div 
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#AD6269] hover:shadow-lg transition-all cursor-pointer group text-center"
                  onClick={() => setActiveTab('calendar')}
                >
                  <div className="w-16 h-16 bg-gray-100 group-hover:bg-[#AD6269]/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <i className="fas fa-calendar-alt text-3xl text-gray-600 group-hover:text-[#AD6269] transition-colors"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Calendar</h3>
                  <p className="text-gray-500 text-sm">Appointments</p>
                </div>

                {/* Forms */}
                <div 
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#AD6269] hover:shadow-lg transition-all cursor-pointer group text-center"
                  onClick={() => setActiveTab('forms')}
                >
                  <div className="w-16 h-16 bg-gray-100 group-hover:bg-[#AD6269]/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <i className="fas fa-file-alt text-3xl text-gray-600 group-hover:text-[#AD6269] transition-colors"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Forms</h3>
                  <p className="text-gray-500 text-sm">Client forms</p>
                </div>
              </div>
            </div>

            {/* Website Content Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Website Content</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Hero Carousel */}
                <div 
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#AD6269] hover:shadow-lg transition-all cursor-pointer group text-center"
                  onClick={() => setActiveTab('hero-carousel')}
                >
                  <div className="w-16 h-16 bg-gray-100 group-hover:bg-[#AD6269]/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <i className="fas fa-images text-3xl text-gray-600 group-hover:text-[#AD6269] transition-colors"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Hero Carousel</h3>
                  <p className="text-gray-500 text-sm">Homepage slides</p>
                </div>

                {/* Documents */}
                <div 
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#AD6269] hover:shadow-lg transition-all cursor-pointer group text-center"
                  onClick={() => setActiveTab('documents')}
                >
                  <div className="w-16 h-16 bg-gray-100 group-hover:bg-[#AD6269]/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <i className="fas fa-file-contract text-3xl text-gray-600 group-hover:text-[#AD6269] transition-colors"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Documents</h3>
                  <p className="text-gray-500 text-sm">Agreements & forms</p>
                </div>
              </div>
            </div>

            {/* Integrations Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Integrations</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* GoHighLevel */}
                <div 
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#AD6269] hover:shadow-lg transition-all cursor-pointer group text-center"
                  onClick={() => setActiveTab('gohighlevel')}
                >
                  <div className="w-16 h-16 bg-gray-100 group-hover:bg-[#AD6269]/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <i className="fas fa-plug text-3xl text-gray-600 group-hover:text-[#AD6269] transition-colors"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">GoHighLevel</h3>
                  <p className="text-gray-500 text-sm">CRM integration</p>
                </div>

                {/* QR Codes */}
                <div 
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#AD6269] hover:shadow-lg transition-all cursor-pointer group text-center"
                  onClick={() => setActiveTab('qrcodes')}
                >
                  <div className="w-16 h-16 bg-gray-100 group-hover:bg-[#AD6269]/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <i className="fas fa-qrcode text-3xl text-gray-600 group-hover:text-[#AD6269] transition-colors"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">QR Codes</h3>
                  <p className="text-gray-500 text-sm">Generate & track</p>
                </div>

                {/* Google Reviews */}
                <div 
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#AD6269] hover:shadow-lg transition-all cursor-pointer group text-center"
                  onClick={() => setActiveTab('google-reviews')}
                >
                  <div className="w-16 h-16 bg-gray-100 group-hover:bg-[#AD6269]/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <i className="fab fa-google text-3xl text-gray-600 group-hover:text-[#AD6269] transition-colors"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">Google Reviews</h3>
                  <p className="text-gray-500 text-sm">Monitor reviews</p>
                </div>

                {/* WhatsApp */}
                <div 
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#AD6269] hover:shadow-lg transition-all cursor-pointer group text-center"
                  onClick={() => setActiveTab('whatsapp')}
                >
                  <div className="w-16 h-16 bg-gray-100 group-hover:bg-[#AD6269]/10 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                    <i className="fab fa-whatsapp text-3xl text-gray-600 group-hover:text-[#AD6269] transition-colors"></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
                  <p className="text-gray-500 text-sm">Business messaging</p>
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
        return <GooglePlacesReviews />;
      case 'whatsapp':
        return <WhatsAppDashboard />;
      case 'loyalty':
        return <LoyaltyDashboard />;
      case 'geo-competitors':
        return <GeoCompetitorDashboard />;
      case 'paid-traffic':
        return <PaidTrafficDashboard />;
      case 'retargeting':
        return <RetargetingDashboard />;
      case 'reputation':
        return <ReputationDashboard />;
      case 'social-media':
        return <SocialMediaDashboard />;
      case 'email-marketing':
        return <EmailMarketingDashboard />;
      case 'video-marketing':
        return <VideoMarketingDashboard />;
      case 'lead-generation':
        return <LeadGenerationDashboard />;
      case 'online-offers':
        return <OnlineOffersDashboard />;
      case 'ppc-campaigns':
        return <PPCCampaignsDashboard />;
      case 'website-convert':
        return <MarketingPlaceholder title="Conversion Optimization" description="Attract your ideal customers and make them convert. Design stunning websites that turn your visitors into new customers." features={['A/B Testing', 'Heatmap Analysis', 'Session Recordings', 'Form Optimization', 'CTA Optimization']} />;
      case 'marketing-automation':
        return <MarketingPlaceholder title="Marketing Automation" description="Automate your marketing with proprietary systems and software. Use high-converting strategies to work smarter, not harder." features={['Visual Workflow Builder', 'Trigger-Based Actions', 'Multi-Channel Sequences', 'CRM Automation', 'Performance Reports']} />;
      case 'hero-carousel':
        return <HeroCarouselManager />;
      case 'documents':
        return <DocumentsManager />;
      case 'canva':
        return <CanvaIntegration />;
      default:
        return null;
    }
  };

  // Placeholder component for marketing solutions (to be implemented)
  const MarketingPlaceholder = ({ title, description, features }: { title: string; description: string; features: string[] }) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-rocket text-rose-500"></i>
            {title}
          </h2>
          <p className="text-gray-500 text-sm mt-1">Complete Marketing Solutions Suite</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-rose-500 to-pink-600">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <i className="fas fa-cog"></i>
            {title}
          </h3>
        </div>
        <div className="p-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
            <p className="text-blue-700 text-sm">
              This feature is part of the Complete Marketing Solutions Suite. Implementation in progress.
            </p>
          </div>

          {/* Description */}
          <p className="text-gray-700 text-lg">{description}</p>

          {/* Features */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Key Features:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-check text-green-600 text-sm"></i>
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Contact Section */}
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">For implementation support, contact us:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <a 
                href="tel:5132737789" 
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-rose-500 text-rose-600 rounded-lg font-medium hover:bg-rose-50 transition-colors"
              >
                <i className="fas fa-phone"></i>
                513.273.7789
              </a>
              <a 
                href="mailto:support@aprettygirlmatter.com" 
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <i className="fas fa-envelope"></i>
                Email Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen !pt-0" style={{ marginTop: '-100px', paddingTop: 0 }}>
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
