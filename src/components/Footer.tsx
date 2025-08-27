import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Services section removed as requested

  const quickLinks = [
    { name: "Home", href: "http://localhost:3001/#hero" },
    { name: "Process", href: "http://localhost:3001/#process" },
    { name: "About Victoria", href: "http://localhost:3001/#about" },
    { name: "Client Reviews", href: "http://localhost:3001/#reviews" },
    { name: "Contact Us", href: "/contact" }
  ];

  return (
    <footer className="text-white" style={{fontFamily: 'Poppins, sans-serif', backgroundColor: 'black'}}>
      <div className="container py-5">
        <div className="row g-4">
          {/* Company Info */}
          <div className="col-lg-3 col-md-6">
            <div>
              <img 
                src="/APRG_Text_Logo.png" 
                alt="A Pretty Girl Matter Logo" 
                style={{height: '120px', width: 'auto'}}
                className="mb-3"
              />
              <p className="text-light lh-base">
                Professional semi-permanent makeup services that enhance your natural beauty. 
                Wake up beautiful every day with our expert artistry.
              </p>
            </div>
            
            {/* Social Media */}
            <div className="mt-4">
              <h4 className="fw-semibold mb-3">Follow Us</h4>
              <div className="d-flex gap-3">
                {/* Facebook */}
                <a href="#" className="text-white text-decoration-none">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a href="https://www.instagram.com/aprettygirlmatter/" className="text-white text-decoration-none" target="_blank" rel="noopener noreferrer">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                {/* TikTok */}
                <a href="#" className="text-white text-decoration-none">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>

              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-3 col-md-6">
            <h4 className="fw-semibold h5 mb-3">Quick Links</h4>
            <ul className="list-unstyled">
              {quickLinks.map((link, index) => (
                <li key={index} className="mb-2">
                  <Link href={link.href} className="text-light text-decoration-none">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-3 col-md-6">
            <h4 className="fw-semibold h5 mb-3">Contact Info</h4>
            <div>
              <div className="d-flex align-items-start mb-3">
                <svg className="text-primary mt-1 flex-shrink-0 me-3" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <div className="text-light">
                  <div>4040 Barrett Drive Suite 3</div>
                  <div>Raleigh, NC 27609</div>
                </div>
              </div>

              <div className="d-flex align-items-center mb-3">
                <svg className="text-primary me-3" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="text-light">(919) 441-0932</span>
              </div>

              <div className="d-flex align-items-center mb-4">
                <svg className="text-primary me-3" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="text-light">victoria@aprettygirlmatter.com</span>
              </div>

              <div>
                <h5 className="fw-semibold mb-2">Business Hours</h5>
                <div className="text-light small">
                  <div>By Appointment Only</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-top border-secondary mt-5 pt-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
            <div className="text-white small mb-3 mb-md-0">
              © {currentYear} A Pretty Girl Matter. All rights reserved.
            </div>
            
            <div className="d-flex gap-4 small">
              <Link href="/privacy-policy" className="text-white text-decoration-none">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-white text-decoration-none">
                Terms of Service
              </Link>
              <Link href="/cancellation-policy" className="text-white text-decoration-none">
                Cancellation Policy
              </Link>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mt-4 p-3 bg-secondary rounded-3">
            <div className="text-center small text-light">
              <strong className="text-white">Emergency Contact:</strong> For urgent post-procedure concerns, 
              call our 24/7 aftercare line at <span className="text-white">(919) 441-0932</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
