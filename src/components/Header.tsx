'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import UserAvatar from './UserAvatar';
import { signOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Phone, MapPin, Facebook, Instagram } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const { userProfile, loading, isAuthenticated } = useAuth();
  

  useEffect(() => {
    setIsClient(true);
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
      if (auth && auth.currentUser) {
        await signOut(auth);
      }
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      // Still clear localStorage on error
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('rememberedEmail');
      window.location.href = '/';
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
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
      {/* Top bar with address */}
      <div 
        className="py-1 hidden lg:block" 
        style={{ 
          backgroundColor: 'rgba(173, 98, 105, 0.5)' 
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-end">
            <button 
              onClick={handleAddressClick}
              className="text-white text-sm font-semibold hover:underline flex items-center gap-1"
              title="View on Google Maps"
            >
              <MapPin className="h-4 w-4" />
              4040 Barrett Drive Suite 3, Raleigh, NC 27609
            </button>
          </div>
        </div>
      </div>
      
      {/* Main navbar */}
      <nav className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <img 
                src="/APRG_Text_Logo.png" 
                alt="APRG Logo" 
                className="h-[60px] w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 mx-auto">
              <button 
                onClick={() => handleNavClick('about')} 
                className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                ABOUT
              </button>
              <button 
                onClick={() => handleNavClick('reviews')} 
                className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                REVIEWS
              </button>
              <Link href="/financing" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">
                FINANCING
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors">
                CONTACT
              </Link>
            </nav>

            {/* Desktop Right Section */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Phone Number */}
              <div className="flex items-center gap-1">
                {isClient ? (
                  <a href="tel:919-441-0932" className="text-gray-700 text-sm hover:text-gray-900 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    <span className="text-xs">919-441-0932</span>
                  </a>
                ) : (
                  <span className="text-gray-700 text-sm flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    <span className="text-xs">919-441-0932</span>
                  </span>
                )}
              </div>

              {/* Social Media Icons */}
              <div className="flex items-center gap-1">
                <a href="#" className="text-gray-600 hover:text-gray-900 p-1">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="https://www.instagram.com/aprettygirlmatter/" className="text-gray-600 hover:text-gray-900 p-1" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-4 w-4" />
                </a>
              </div>

              {/* Artist Profile Link - Show only for authenticated admin users */}
              {isClient && !loading && userProfile?.role === 'admin' && (
                <Button variant="outline" asChild className="rounded-full h-8 px-4 text-xs">
                  <Link href="/dashboard">
                    Profile
                  </Link>
                </Button>
              )}
              
              {/* Show different buttons based on authentication and profile status */}
              {isClient && !loading && (
                <>
                  {isAuthenticated ? (
                    <>
                      {/* If user is authenticated and profile is complete, show Health Questions button */}
                      {isProfileComplete() && (
                        <Button variant="outline" asChild className="rounded-full h-8 px-4 text-xs">
                          <Link href="/book-now-custom?step=health">
                            Health Questions
                          </Link>
                        </Button>
                      )}
                      
                      {/* User Avatar with dropdown */}
                      <UserAvatar
                        firstName={userProfile?.profile?.firstName || 'User'}
                        lastName={userProfile?.profile?.lastName || ''}
                        profilePicture={(userProfile?.profile as any)?.profilePicture || (userProfile as any)?.photoURL}
                        size="sm"
                        showDropdown={true}
                        onLogout={handleLogout}
                        userRole={userProfile?.role || 'client'}
                      />
                    </>
                  ) : (
                    <Button variant="outline" asChild className="rounded-full h-8 px-4 text-xs">
                      <Link href="/login">
                        Login
                      </Link>
                    </Button>
                  )}
                  
                  {/* Book Now button - hidden */}
                </>
              )}
              
              {/* Loading state or client not ready */}
              {(!isClient || loading) && (
                <>
                  <Button variant="outline" asChild className="rounded-full h-8 px-4 text-xs">
                    <Link href="/login">
                      Login
                    </Link>
                  </Button>
                  {/* Book Now button - hidden */}
                </>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <Button 
                    variant="ghost"
                    onClick={() => { handleNavClick('about'); setIsMenuOpen(false); }}
                    className="justify-start text-lg"
                  >
                    ABOUT
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={() => { handleNavClick('reviews'); setIsMenuOpen(false); }}
                    className="justify-start text-lg"
                  >
                    REVIEWS
                  </Button>
                  <Button variant="ghost" asChild className="justify-start text-lg">
                    <Link href="/financing" onClick={() => setIsMenuOpen(false)}>
                      FINANCING
                    </Link>
                  </Button>
                  <Button variant="ghost" asChild className="justify-start text-lg">
                    <Link href="/contact" onClick={() => setIsMenuOpen(false)}>
                      CONTACT
                    </Link>
                  </Button>
                  
                  <div className="border-t pt-4 mt-4">
                    <Button 
                      variant="outline"
                      onClick={handleAddressClick}
                      className="w-full justify-start mb-2"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      4040 Barrett Drive Suite 3
                    </Button>
                    
                    {isClient ? (
                      <Button variant="outline" asChild className="w-full justify-start mb-4">
                        <a href="tel:919-441-0932">
                          <Phone className="h-4 w-4 mr-2" />
                          919-441-0932
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full justify-start mb-4">
                        <Phone className="h-4 w-4 mr-2" />
                        919-441-0932
                      </Button>
                    )}
                    
                    {isClient && !loading && (
                      <>
                        {isAuthenticated ? (
                          <>
                            <div className="flex items-center justify-between bg-gray-100 rounded-full px-4 py-2 mb-2">
                              <div className="flex items-center gap-2">
                                <UserAvatar
                                  firstName={userProfile?.profile?.firstName || 'User'}
                                  lastName={userProfile?.profile?.lastName || ''}
                                  profilePicture={(userProfile?.profile as any)?.profilePicture || (userProfile as any)?.photoURL}
                                  size="sm"
                                  showDropdown={false}
                                  userRole={userProfile?.role || 'client'}
                                />
                                <span className="font-semibold text-sm">
                                  {userProfile?.profile?.firstName} {userProfile?.profile?.lastName}
                                </span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="rounded-full"
                              >
                                Sign Out
                              </Button>
                            </div>
                            
                            {isProfileComplete() && (
                              <Button variant="outline" asChild className="w-full mb-2">
                                <Link href="/book-now-custom?step=health" onClick={() => setIsMenuOpen(false)}>
                                  Health Questions
                                </Link>
                              </Button>
                            )}
                          </>
                        ) : (
                          <Button variant="outline" asChild className="w-full mb-2">
                            <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                              Login
                            </Link>
                          </Button>
                        )}
                      </>
                    )}
                    
                    {(!isClient || loading) && (
                      <Button variant="outline" asChild className="w-full mb-2">
                        <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                          Login
                        </Link>
                      </Button>
                    )}
                    
                    {/* Book Now button - hidden */}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}
