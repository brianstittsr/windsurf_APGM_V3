'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserService } from '@/services/database';
import { User } from '@/types/database';
import ClientOnly from './ClientOnly';

interface AdminLayoutProps {
  children: React.ReactNode | ((currentUser: User) => React.ReactNode);
  title?: string;
}

export default function AdminLayout({ children, title = 'Admin Dashboard' }: AdminLayoutProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const savedEmail = localStorage.getItem('adminEmail');
      if (!savedEmail) {
        window.location.href = '/login';
        return;
      }

      // Development bypass for admin@example.com
      if (savedEmail === 'admin@example.com') {
        const mockAdminUser: User = {
          id: 'admin-example',
          profile: {
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            phone: '(555) 000-0000',
            dateOfBirth: '1990-01-01',
            address: '123 Admin Street',
            city: 'Raleigh',
            state: 'NC',
            zipCode: '27601',
            emergencyContactName: 'Emergency Contact',
            emergencyContactPhone: '(555) 000-0001',
            preferredContactMethod: 'email',
            hearAboutUs: 'System Administrator',
            createdAt: { seconds: 1640995200, nanoseconds: 0 } as any,
            updatedAt: { seconds: 1640995200, nanoseconds: 0 } as any
          },
          role: 'admin',
          isActive: true
        };
        setCurrentUser(mockAdminUser);
        setLoading(false);
        return;
      }

      // Try to get user from database
      const user = await UserService.getUserByEmail(savedEmail);
      if (!user || user.role !== 'admin') {
        console.error('User not found or not admin:', savedEmail);
        window.location.href = '/login';
        return;
      }

      setCurrentUser(user);
    } catch (error) {
      console.error('Error checking admin access:', error);
      
      // If it's admin@example.com and there's an error, still allow access (development bypass)
      const savedEmail = localStorage.getItem('adminEmail');
      if (savedEmail === 'admin@example.com') {
        const mockAdminUser: User = {
          id: 'admin-example',
          profile: {
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            phone: '(555) 000-0000',
            dateOfBirth: '1990-01-01',
            address: '123 Admin Street',
            city: 'Raleigh',
            state: 'NC',
            zipCode: '27601',
            emergencyContactName: 'Emergency Contact',
            emergencyContactPhone: '(555) 000-0001',
            preferredContactMethod: 'email',
            hearAboutUs: 'System Administrator',
            createdAt: { seconds: 1640995200, nanoseconds: 0 } as any,
            updatedAt: { seconds: 1640995200, nanoseconds: 0 } as any
          },
          role: 'admin',
          isActive: true
        };
        setCurrentUser(mockAdminUser);
      } else {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminEmail');
    window.location.href = '/login';
  };

  const isActivePage = (path: string) => {
    if (path === '/admin' && pathname === '/admin') return true;
    if (path !== '/admin' && pathname.startsWith(path)) return true;
    return false;
  };

  if (!mounted || loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Access Denied</h4>
          <p>You do not have permission to access the admin dashboard.</p>
          <hr />
          <p className="mb-0">Please contact an administrator if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Admin Header */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link href="/admin" className="navbar-brand">
            <i className="fas fa-shield-alt me-2"></i>
            {title}
          </Link>
          <div className="navbar-nav ms-auto">
            <Link 
              href="/admin" 
              className={`nav-link ${isActivePage('/admin') ? 'active' : ''}`}
            >
              <i className="fas fa-users me-1"></i>
              Users
            </Link>
            <Link 
              href="/admin/appointments" 
              className={`nav-link ${isActivePage('/admin/appointments') ? 'active' : ''}`}
            >
              <i className="fas fa-calendar me-1"></i>
              Appointments
            </Link>
            <Link 
              href="/admin/forms" 
              className={`nav-link ${isActivePage('/admin/forms') ? 'active' : ''}`}
            >
              <i className="fas fa-file-alt me-1"></i>
              Forms
            </Link>
            <div className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fas fa-user me-2"></i>
                {currentUser.profile.firstName} {currentUser.profile.lastName}
              </a>
              <ul className="dropdown-menu">
                <li>
                  <span className="dropdown-item-text">
                    <small className="text-muted">{currentUser.profile.email}</small>
                  </span>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt me-2"></i>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mt-4">
        <ClientOnly fallback={
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        }>
          {typeof children === 'function' ? children(currentUser) : children}
        </ClientOnly>
      </div>

      {/* Quick Actions Floating Button */}
      <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
        <div className="btn-group dropup">
          <button
            type="button"
            className="btn btn-primary rounded-circle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ width: '60px', height: '60px' }}
          >
            <i className="fas fa-plus fa-lg"></i>
          </button>
          <ul className="dropdown-menu">
            <li>
              <Link href="/admin/appointments" className="dropdown-item">
                <i className="fas fa-calendar me-2"></i>
                New Appointment
              </Link>
            </li>
            <li>
              <Link href="/admin" className="dropdown-item">
                <i className="fas fa-user-plus me-2"></i>
                Add User
              </Link>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <Link href="/admin/forms" className="dropdown-item">
                <i className="fas fa-file-alt me-2"></i>
                View Forms
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
