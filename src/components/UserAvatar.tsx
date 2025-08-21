'use client';

import React, { useState } from 'react';

interface UserAvatarProps {
  firstName: string;
  lastName: string;
  size?: 'sm' | 'md' | 'lg';
  showDropdown?: boolean;
  onLogout?: () => void;
}

export default function UserAvatar({ 
  firstName, 
  lastName, 
  size = 'md', 
  showDropdown = false,
  onLogout 
}: UserAvatarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get initials from first and last name
  const getInitials = () => {
    const firstInitial = firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = lastName?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };

  // Size configurations
  const sizeConfig = {
    sm: { width: '32px', height: '32px', fontSize: '0.75rem' },
    md: { width: '40px', height: '40px', fontSize: '0.875rem' },
    lg: { width: '48px', height: '48px', fontSize: '1rem' }
  };

  const config = sizeConfig[size];

  const avatarStyle = {
    width: config.width,
    height: config.height,
    backgroundColor: '#AD6269',
    color: 'white',
    fontSize: config.fontSize,
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    cursor: showDropdown ? 'pointer' : 'default',
    border: '2px solid rgba(173, 98, 105, 0.2)',
    transition: 'all 0.2s ease'
  };

  const handleAvatarClick = () => {
    if (showDropdown) {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="position-relative">
      <div
        style={avatarStyle}
        onClick={handleAvatarClick}
        onMouseEnter={(e) => {
          if (showDropdown) {
            e.currentTarget.style.backgroundColor = '#8B4A52';
          }
        }}
        onMouseLeave={(e) => {
          if (showDropdown) {
            e.currentTarget.style.backgroundColor = '#AD6269';
          }
        }}
        title={`${firstName} ${lastName}`}
      >
        {getInitials()}
      </div>

      {/* Dropdown Menu */}
      {showDropdown && isDropdownOpen && (
        <div 
          className="position-absolute bg-white border rounded shadow-lg"
          style={{
            top: '100%',
            right: '0',
            marginTop: '8px',
            minWidth: '200px',
            zIndex: 1000
          }}
        >
          <div className="p-3 border-bottom">
            <div className="fw-semibold text-dark">{firstName} {lastName}</div>
            <div className="text-muted small">Logged in</div>
          </div>
          
          <div className="py-1">
            <button 
              className="dropdown-item btn btn-link text-start w-100 border-0 p-2"
              onClick={() => {
                setIsDropdownOpen(false);
                window.location.href = '/my-appointments';
              }}
            >
              <i className="fas fa-calendar-alt me-2"></i>
              My Appointments
            </button>
            
            <button 
              className="dropdown-item btn btn-link text-start w-100 border-0 p-2"
              onClick={() => {
                setIsDropdownOpen(false);
                window.location.href = '/profile';
              }}
            >
              <i className="fas fa-user me-2"></i>
              Profile Settings
            </button>
            
            <hr className="dropdown-divider my-1" />
            
            <button 
              className="dropdown-item btn btn-link text-start w-100 border-0 p-2 text-danger"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt me-2"></i>
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && isDropdownOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 999 }}
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
}
