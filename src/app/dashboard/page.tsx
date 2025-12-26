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
import GoogleReviewsDashboard from '../../components/admin/GoogleReviewsDashboard';
import GoogleReviewsManager from '../../components/admin/GoogleReviewsManager';
import WhatsAppDashboard from '../../components/admin/WhatsAppDashboard';
import LoyaltyDashboard from '../../components/admin/LoyaltyDashboard';
import GeoCompetitorDashboard from '../../components/admin/GeoCompetitorDashboard';
import HeroCarouselManager from '../../components/admin/HeroCarouselManager';
import DocumentsManager from '../../components/admin/DocumentsManager';
import { cn } from '@/lib/utils';

type TabType = 'overview' | 'users' | 'reviews' | 'services' | 'coupons' | 'business' | 'artists' | 'bookings' | 'forms' | 'gohighlevel' | 'gohighlevel-mcp' | 'bmad-orchestrator' | 'availability' | 'calendar' | 'alexa' | 'qrcodes' | 'seo-competitor' | 'seo-pagespeed' | 'google-reviews' | 'whatsapp' | 'loyalty' | 'geo-competitors' | 'paid-traffic' | 'retargeting' | 'reputation' | 'social-media' | 'email-marketing' | 'video-marketing' | 'lead-generation' | 'online-offers' | 'ppc-campaigns' | 'website-convert' | 'marketing-automation' | 'hero-carousel' | 'documents';

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
        return <GoogleReviewsDashboard />;
      case 'whatsapp':
        return <WhatsAppDashboard />;
      case 'loyalty':
        return <LoyaltyDashboard />;
      case 'geo-competitors':
        return <GeoCompetitorDashboard />;
      case 'paid-traffic':
        return <MarketingPlaceholder title="Paid Traffic Management" description="Drive more ready-to-buy traffic to your website with proprietary traffic strategies across Google, Facebook, Instagram, TikTok, and more." features={['Multi-Platform Ad Management', 'Audience Targeting', 'Campaign Optimization', 'Budget Tracking', 'ROI Calculator']} />;
      case 'retargeting':
        return <MarketingPlaceholder title="Customer Retargeting" description="Capture 100% of your website visitors after they've left your site. Reach them when they're ready to buy to 10X your marketing!" features={['Visitor Capture', 'Exit-Intent Detection', 'Multi-Channel Retargeting', 'Abandoned Cart Recovery', 'Email/SMS Sequences']} />;
      case 'reputation':
        return <MarketingPlaceholder title="Reputation Marketing" description="Get stellar reviews and blow away your competition. Market your 5-Star status to dominate your market." features={['Automated Review Requests', 'Multi-Platform Monitoring', 'Sentiment Analysis', 'Response Templates', 'Review Widgets']} />;
      case 'social-media':
        return <MarketingPlaceholder title="Social Media Management" description="Grab the attention of your customers and find new prospects easily with cutting-edge social media marketing strategies." features={['Content Scheduling', 'Multi-Platform Posting', 'Unified Inbox', 'Engagement Analytics', 'Hashtag Tracking']} />;
      case 'email-marketing':
        return <MarketingPlaceholder title="Email Marketing" description="Turn the names on your email list into money in the bank. Highly targeted email campaigns can return up to 40X what they cost." features={['Drag-and-Drop Builder', 'Automation Workflows', 'Segmentation', 'A/B Testing', 'Performance Analytics']} />;
      case 'video-marketing':
        return <MarketingPlaceholder title="Video Marketing" description="Create some of the highest-converting videos in the industry, from reputation videos to expert interviews to online offers." features={['Testimonial Videos', 'Service Demonstrations', 'YouTube Optimization', 'Social Distribution', 'Video Analytics']} />;
      case 'lead-generation':
        return <MarketingPlaceholder title="Lead Generation" description="Get high-quality leads for your team every day. We'll do the hard work to deliver the contacts you need to grow your business." features={['Multi-Step Forms', 'Quiz Funnels', 'Lead Scoring', 'Auto-Assignment', 'Real-Time Notifications']} />;
      case 'online-offers':
        return <MarketingPlaceholder title="Online Offers" description="Online video offers can convert at over 20%. Create innovative offers that keep your customers coming back again and again." features={['Video Sales Letters', 'Countdown Timers', 'Scarcity Elements', 'Payment Plans', 'A/B Testing']} />;
      case 'ppc-campaigns':
        return <MarketingPlaceholder title="PPC Campaigns" description="Bring more new customers to your site every day with advanced PPC strategies. Find more customers without spending more." features={['Google Ads Management', 'Keyword Research', 'Quality Score Optimization', 'Bid Management', 'Landing Page Optimization']} />;
      case 'website-convert':
        return <MarketingPlaceholder title="Conversion Optimization" description="Attract your ideal customers and make them convert. Design stunning websites that turn your visitors into new customers." features={['A/B Testing', 'Heatmap Analysis', 'Session Recordings', 'Form Optimization', 'CTA Optimization']} />;
      case 'marketing-automation':
        return <MarketingPlaceholder title="Marketing Automation" description="Automate your marketing with proprietary systems and software. Use high-converting strategies to work smarter, not harder." features={['Visual Workflow Builder', 'Trigger-Based Actions', 'Multi-Channel Sequences', 'CRM Automation', 'Performance Reports']} />;
      case 'hero-carousel':
        return <HeroCarouselManager />;
      case 'documents':
        return <DocumentsManager />;
      case 'google-reviews':
        return <GoogleReviewsManager />;
      default:
        return null;
    }
  };

  // Placeholder component for marketing solutions (to be implemented)
  const MarketingPlaceholder = ({ title, description, features }: { title: string; description: string; features: string[] }) => (
    <div className="card">
      <div className="card-header bg-gradient-to-r from-rose-500 to-pink-600 text-white">
        <h5 className="card-title mb-0">{title}</h5>
      </div>
      <div className="card-body">
        <div className="alert alert-info mb-4">
          <i className="fas fa-info-circle me-2"></i>
          This feature is part of the Complete Marketing Solutions Suite. Implementation in progress.
        </div>
        <p className="lead mb-4">{description}</p>
        <h6 className="fw-bold mb-3">Key Features:</h6>
        <div className="row">
          {features.map((feature, index) => (
            <div key={index} className="col-md-6 mb-2">
              <div className="d-flex align-items-center">
                <i className="fas fa-check-circle text-success me-2"></i>
                <span>{feature}</span>
              </div>
            </div>
          ))}
        </div>
        <hr className="my-4" />
        <div className="text-center">
          <p className="text-muted mb-3">For implementation support, contact us:</p>
          <a href="tel:5132737789" className="btn btn-outline-primary me-2">
            <i className="fas fa-phone me-2"></i>513.273.7789
          </a>
          <a href="mailto:support@aprettygirlmatter.com" className="btn btn-outline-secondary">
            <i className="fas fa-envelope me-2"></i>Email Support
          </a>
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
