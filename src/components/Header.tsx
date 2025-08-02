'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddressClick = () => {
    const address = "4040 Barrett Drive Suite 3, Raleigh, NC 27609";
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <header className="bg-white shadow-sm fixed-top">
      {/* Top bar with address */}
      <div className="bg-light py-1 d-none d-lg-block">
        <div className="container">
          <div className="d-flex justify-content-end">
            <button 
              onClick={handleAddressClick}
              className="btn btn-link text-decoration-none text-secondary p-0 fw-semibold"
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
            <Link href="#about" className="nav-link text-secondary">
              ABOUT
            </Link>
            <Link href="#reviews" className="nav-link text-secondary">
              REVIEWS
            </Link>
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
              <a href="tel:919-441-0932" className="text-decoration-none text-secondary fw-semibold">
                📞 919-441-0932
              </a>
            ) : (
              <span className="text-secondary fw-semibold">
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
            <a href="#" className="text-secondary text-decoration-none">
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
            {/* SnapChat */}
            <a href="#" className="text-secondary text-decoration-none">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378 0 0-.599 2.282-.744 2.840-.282 1.084-1.064 2.456-1.549 3.235C9.584 23.815 10.77 24.001 12.017 24.001c6.624 0 11.99-5.367 11.99-12.014C24.007 5.367 18.641.001 12.017.001z"/>
              </svg>
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="d-none d-lg-flex gap-2">
            <Link
              href="/login"
              className="btn btn-outline-primary rounded-pill px-4"
            >
              Login
            </Link>
            <Link
              href="/book-now-custom"
              className="btn btn-primary rounded-pill px-4"
            >
              Book Now
            </Link>
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
              <a href="tel:919-441-0932" className="btn btn-outline-secondary rounded-pill px-4 w-100 mb-2 text-decoration-none">
                📞 919-441-0932
              </a>
            ) : (
              <div className="btn btn-outline-secondary rounded-pill px-4 w-100 mb-2">
                📞 919-441-0932
              </div>
            )}
            <Link
              href="/login"
              className="btn btn-outline-primary rounded-pill px-4 w-100 mb-2"
            >
              Login
            </Link>
            <Link
              href="/book-now-custom"
              className="btn btn-primary rounded-pill px-4 w-100"
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
