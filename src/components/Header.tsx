'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import UserAvatar from './UserAvatar';
import { signOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const { userProfile, loading, isAuthenticated } = useAuth();
  
  // Debug logging
  console.log('Header Debug:', {
    isClient,
    loading,
    isAuthenticated,
    userProfile: userProfile ? {
      id: userProfile.id,
      firstName: userProfile.profile?.firstName,
      lastName: userProfile.profile?.lastName,
      role: userProfile.role
    } : null
  });

  useEffect(() => {
    setIsClient(true);
    
    // For testing - simulate admin login if not in production
    if (typeof window !== 'undefined' && !localStorage.getItem('adminEmail')) {
      console.log('Setting admin email for testing...');
      localStorage.setItem('adminEmail', 'admin@example.com');
    }
  }, []);

  const handleAddressClick = () => {
    const address = "4040 Barrett Drive Suite 3, Raleigh, NC 27609";
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(googleMapsUrl, '_blank');
  };

  const handleNavClick = (anchor: string) => {
    if (pathname === '/') {
      // If on home page, scroll to anchor
      const element = document.getElementById(anchor);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If on other pages, navigate to home page with anchor
      window.location.href = `https://www.aprettygirlmatter.com/#${anchor}`;
    }
  };

  const handleLogout = async () => {
    try {
      if (isFirebaseConfigured()) {
        await signOut(auth);
      } else {
        // Development mode - clear admin bypass and remember me
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberedEmail');
      }
      // Always reload the page to ensure auth state updates
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
      // Still clear localStorage on error
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('rememberedEmail');
      window.location.reload();
    }
  };

  const isProfileComplete = () => {
    if (!userProfile?.profile) return false;
    const profile = userProfile.profile;
    return !!
      profile.firstName &&
      profile.lastName &&
      profile.email &&
      profile.phone &&
      profile.dateOfBirth &&
      profile.address &&
      profile.city &&
      profile.state &&
      profile.zipCode;
  };

  return (
    <header className="bg-white shadow-sm fixed-top">
      {/* Top bar with address */}
      <div 
        className="py-1 d-none d-lg-block" 
        style={{ 
          backgroundColor: 'rgba(173, 98, 105, 0.5)' 
        }}
      >
        <div className="container">
          <div className="d-flex justify-content-end">
            <button 
              onClick={handleAddressClick}
              className="btn btn-link text-decoration-none text-white p-0 fw-semibold"
              style={{ fontSize: '0.9rem' }}
              title="View on Google Maps"
            >
              📍 4040 Barrett Drive Suite 3, Raleigh, NC 27609
            </button>
          </div>
        </div>
      </div>
      
      {/* Main navbar */}
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container">
        {/* Logo */}
        <Link href="/" className="navbar-brand text-decoration-none">
          <img 
            src="/APRG_Text_Logo.png" 
            alt="APRG Logo" 
            style={{height: '117px', width: 'auto'}}
          />
        </Link>

        {/* Mobile menu button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation */}
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
          <nav className="navbar-nav mx-auto">
            <button 
              onClick={() => handleNavClick('about')} 
              className="nav-link text-secondary btn btn-link p-0 border-0 me-3"
              style={{ textDecoration: 'none' }}
            >
              ABOUT
            </button>
            <button 
              onClick={() => handleNavClick('reviews')} 
              className="nav-link text-secondary btn btn-link p-0 border-0"
              style={{ textDecoration: 'none' }}
            >
              REVIEWS
            </button>
            <Link href="/financing" className="nav-link text-secondary">
              FINANCING
            </Link>
            <Link href="/contact" className="nav-link text-secondary">
              CONTACT
            </Link>
          </nav>

          {/* Phone Number */}
          <div className="d-none d-lg-block me-3">
            {isClient ? (
              <a href="tel:919-441-0932" className="text-decoration-none text-secondary fw-bold" style={{fontFamily: 'Playfair Display, serif'}}>
                📞 919-441-0932
              </a>
            ) : (
              <span className="text-secondary fw-bold" style={{fontFamily: 'Playfair Display, serif'}}>
                📞 919-441-0932
              </span>
            )}
          </div>

          {/* Social Media Icons */}
          <div className="d-none d-lg-flex gap-2 me-3">
            {/* Facebook */}
            <a href="#" className="text-secondary text-decoration-none">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            {/* Instagram */}
            <a href="https://www.instagram.com/aprettygirlmatter/" className="text-secondary text-decoration-none" target="_blank" rel="noopener noreferrer">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            {/* TikTok */}
            <a href="#" className="text-secondary text-decoration-none">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
              </svg>
            </a>

          </div>

          {/* CTA Buttons */}
          <div className="d-none d-lg-flex gap-2 align-items-center">
            {/* Artist Profile Link - Show only for authenticated admin users */}
            {isClient && !loading && userProfile?.role === 'admin' && (
              <Link
                href="/dashboard"
                className="btn btn-outline-secondary rounded-pill px-4"
                title="Manage Availability"
              >
                <i className="fas fa-calendar-alt me-2"></i>
                Profile
              </Link>
            )}
            
            {/* Show different buttons based on authentication and profile status */}
            {isClient && !loading && (
              <>
                {isAuthenticated ? (
                  <>
                    {/* Debug: Show authentication status */}
                    <div style={{ fontSize: '12px', color: 'green', marginRight: '10px' }}>
                      Authenticated: {userProfile?.profile?.firstName || 'No Name'}
                    </div>
                    
                    {/* If user is authenticated and profile is complete, show Health Questions button */}
                    {isProfileComplete() && (
                      <Link
                        href="/book-now-custom?step=health"
                        className="btn btn-outline-success rounded-pill px-4"
                        title="Go directly to health questions"
                      >
                        <i className="fas fa-clipboard-list me-2"></i>
                        Health Questions
                      </Link>
                    )}
                    
                    {/* User Avatar with dropdown */}
                    <UserAvatar
                      firstName={userProfile?.profile?.firstName || 'User'}
                      lastName={userProfile?.profile?.lastName || ''}
                      size="md"
                      showDropdown={true}
                      onLogout={handleLogout}
                    />
                  </>
                ) : (
                  <>
                    {/* Debug: Show non-authenticated status */}
                    <div style={{ fontSize: '12px', color: 'red', marginRight: '10px' }}>
                      Not Authenticated
                    </div>
                    
                    {/* Show Login button for non-authenticated users */}
                    <Link
                      href="/login"
                      className="btn btn-outline-primary rounded-pill px-4 book-now-button"
                    >
                      Login
                    </Link>
                  </>
                )}
                
                {/* Book Now button - always show */}
                <Link
                  href="/book-now-custom"
                  className="btn btn-primary rounded-pill px-4 book-now-button"
                >
                  Book Now
                </Link>
              </>
            )}
            
            {/* Loading state or client not ready */}
            {(!isClient || loading) && (
              <>
                <Link
                  href="/login"
                  className="btn btn-outline-primary rounded-pill px-4 book-now-button"
                >
                  Login
                </Link>
                <Link
                  href="/book-now-custom"
                  className="btn btn-primary rounded-pill px-4 book-now-button"
                >
                  Book Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Address, Phone & CTA */}
          <div className="d-lg-none mt-3">
            <button 
              onClick={handleAddressClick}
              className="btn btn-outline-info rounded-pill px-4 w-100 mb-2"
              title="View on Google Maps"
            >
              📍 4040 Barrett Drive Suite 3, Raleigh, NC
            </button>
            {isClient ? (
              <a href="tel:919-441-0932" className="btn btn-outline-secondary rounded-pill px-4 w-100 mb-2 text-decoration-none fw-bold" style={{fontFamily: 'Playfair Display, serif'}}>
                📞 919-441-0932
              </a>
            ) : (
              <div className="btn btn-outline-secondary rounded-pill px-4 w-100 mb-2 fw-bold" style={{fontFamily: 'Playfair Display, serif'}}>
                📞 919-441-0932
              </div>
            )}
            
            {/* Mobile Authentication Buttons */}
            {isClient && !loading && (
              <>
                {isAuthenticated ? (
                  <>
                    {/* User info for mobile */}
                    <div className="d-flex align-items-center justify-content-between bg-light rounded-pill px-4 py-2 mb-2">
                      <div className="d-flex align-items-center">
                        <UserAvatar
                          firstName={userProfile?.profile?.firstName || 'User'}
                          lastName={userProfile?.profile?.lastName || ''}
                          size="sm"
                          showDropdown={false}
                        />
                        <span className="ms-2 fw-semibold">
                          {userProfile?.profile?.firstName} {userProfile?.profile?.lastName}
                        </span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="btn btn-sm btn-outline-danger rounded-pill"
                        title="Sign Out"
                      >
                        <i className="fas fa-sign-out-alt"></i>
                      </button>
                    </div>
                    
                    {/* Health Questions button for mobile */}
                    {isProfileComplete() && (
                      <Link
                        href="/book-now-custom?step=health"
                        className="btn btn-outline-success rounded-pill px-4 w-100 mb-2"
                      >
                        <i className="fas fa-clipboard-list me-2"></i>
                        Health Questions
                      </Link>
                    )}
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="btn btn-outline-primary rounded-pill px-4 w-100 mb-2"
                  >
                    Login
                  </Link>
                )}
              </>
            )}
            
            {/* Loading state for mobile */}
            {(!isClient || loading) && (
              <Link
                href="/login"
                className="btn btn-outline-primary rounded-pill px-4 w-100 mb-2"
              >
                Login
              </Link>
            )}
            
            <Link
              href="/book-now-custom"
              className="btn btn-primary rounded-pill px-4 w-100 book-now-button"
            >
              Book Now
            </Link>
          </div>
        </div>
        </div>
      </nav>
    </header>
  );
}
