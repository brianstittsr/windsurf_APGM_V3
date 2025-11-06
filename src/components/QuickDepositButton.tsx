'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface QuickDepositButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'ghost';
  serviceId?: string; // Optional service ID if you want to associate with specific service
  text?: string;
}

export default function QuickDepositButton({
  className = '',
  size = 'md',
  variant = 'primary',
  serviceId = 'quick-deposit',
  text = 'Pay $50 Deposit'
}: QuickDepositButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const sizeClasses = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4',
    lg: 'py-3 px-6 text-lg'
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white',
    outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-50',
    ghost: 'text-purple-600 hover:bg-purple-50'
  };

  const handleClick = async () => {
    setIsLoading(true);
    try {
      // Navigate to the quick deposit form
      router.push(`/quick-deposit?serviceId=${serviceId}`);
    } catch (error) {
      console.error('Error navigating to quick deposit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-full font-medium transition duration-200
        flex items-center justify-center
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50
        ${className}
      `}
      aria-label="Pay deposit"
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {text}
        </>
      )}
    </button>
  );
}
