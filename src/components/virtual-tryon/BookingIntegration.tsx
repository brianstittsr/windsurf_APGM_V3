'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface EyebrowStyle {
  styleId: string;
  styleName: string;
  category: 'microblading' | 'ombré' | 'combo' | 'powder';
  description: string;
  colorPalette: string[];
  strokePattern: string;
  intensity: 'light' | 'medium' | 'bold';
  archHeight: 'natural' | 'high' | 'dramatic';
  thickness: 'thin' | 'medium' | 'thick';
  priceRange: string;
  duration: string;
  healingTime: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  gallery: string[];
}

interface TryOnHistory {
  styleId: string;
  timestamp: string;
  customizations: Record<string, any>;
  notes?: string;
}

interface BookingIntegrationProps {
  selectedStyle: EyebrowStyle | null;
  tryOnHistory: TryOnHistory[];
  onSaveSession: () => Promise<void>;
  onResetTryOn: () => void;
}

export function BookingIntegration({ 
  selectedStyle, 
  tryOnHistory, 
  onSaveSession, 
  onResetTryOn 
}: BookingIntegrationProps) {
  const [bookingData, setBookingData] = useState({
    preferredDate: '',
    preferredTime: '',
    consultationType: 'virtual',
    specialRequests: '',
    contactMethod: 'email'
  });
  const [isBooking, setIsBooking] = useState(false);

  const handleBookingDataChange = (key: string, value: string) => {
    setBookingData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleBookConsultation = async () => {
    if (!selectedStyle) {
      toast.error('Please select a style first');
      return;
    }

    setIsBooking(true);
    try {
      // In a real implementation, this would integrate with the booking system
      const consultationData = {
        selectedStyle: selectedStyle.styleId,
        styleName: selectedStyle.styleName,
        tryOnHistory: tryOnHistory.length,
        preferences: bookingData,
        timestamp: new Date().toISOString()
      };

      // Simulate booking API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Consultation booked successfully! You will receive a confirmation email shortly.');
      
      // Reset form after successful booking
      setBookingData({
        preferredDate: '',
        preferredTime: '',
        consultationType: 'virtual',
        specialRequests: '',
        contactMethod: 'email'
      });
      
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to book consultation. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const handleSaveForLater = async () => {
    try {
      await onSaveSession();
      toast.success('Session saved! You can continue later.');
    } catch (error) {
      console.error('Save session error:', error);
      toast.error('Failed to save session');
    }
  };

  return (
    <div className="booking-integration">
      <h3 className="h5 fw-bold text-dark mb-3">
        <i className="fas fa-calendar-check me-2"></i>
        Book Your Consultation
      </h3>

      {/* Selected Style Summary */}
      {selectedStyle && (
        <div className="selected-style-summary mb-4 p-3 bg-primary bg-opacity-10 rounded">
          <h4 className="h6 fw-bold text-dark mb-2">Your Selected Style</h4>
          <div className="row align-items-center">
            <div className="col-md-8">
              <h5 className="h6 fw-bold text-primary mb-1">{selectedStyle.styleName}</h5>
              <p className="text-secondary small mb-1">{selectedStyle.description}</p>
              <div className="d-flex gap-2">
                <span className="badge bg-primary text-white">
                  {selectedStyle.intensity}
                </span>
                <span className="badge bg-info text-white">
                  {selectedStyle.archHeight}
                </span>
                <span className="badge bg-secondary text-white">
                  {selectedStyle.thickness}
                </span>
              </div>
            </div>
            <div className="col-md-4 text-md-end">
              <span className="h6 fw-bold text-primary">
                {selectedStyle.priceRange}
              </span>
              <br />
              <span className="small text-secondary">
                {selectedStyle.duration}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Try-On Summary */}
      {tryOnHistory.length > 0 && (
        <div className="tryon-summary mb-4 p-3 bg-light rounded">
          <h4 className="h6 fw-bold text-dark mb-2">
            <i className="fas fa-history me-2"></i>
            Try-On Summary
          </h4>
          <p className="text-secondary small mb-2">
            You tried on {tryOnHistory.length} different style(s) during your session.
          </p>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                // In a real implementation, this would show the try-on history
                toast.info('Try-on history feature coming soon!');
              }}
            >
              <i className="fas fa-images me-2"></i>
              View History
            </button>
          </div>
        </div>
      )}

      {/* Booking Form */}
      <div className="booking-form">
        <h4 className="h6 fw-bold text-dark mb-3">Consultation Details</h4>
        
        <div className="row g-3">
          {/* Preferred Date */}
          <div className="col-md-6">
            <label className="form-label fw-bold text-dark">
              <i className="fas fa-calendar me-2"></i>
              Preferred Date
            </label>
            <input
              type="date"
              className="form-control"
              value={bookingData.preferredDate}
              onChange={(e) => handleBookingDataChange('preferredDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Preferred Time */}
          <div className="col-md-6">
            <label className="form-label fw-bold text-dark">
              <i className="fas fa-clock me-2"></i>
              Preferred Time
            </label>
            <select 
              className="form-select"
              value={bookingData.preferredTime}
              onChange={(e) => handleBookingDataChange('preferredTime', e.target.value)}
            >
              <option value="">Select a time</option>
              <option value="9:00 AM">9:00 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="1:00 PM">1:00 PM</option>
              <option value="2:00 PM">2:00 PM</option>
              <option value="3:00 PM">3:00 PM</option>
              <option value="4:00 PM">4:00 PM</option>
            </select>
          </div>
        </div>

        {/* Consultation Type */}
        <div className="mb-3">
          <label className="form-label fw-bold text-dark">
            <i className="fas fa-video me-2"></i>
            Consultation Type
          </label>
          <div className="btn-group w-100" role="group">
            <input 
              type="radio" 
              className="btn-check" 
              name="consultationType" 
              id="virtual"
              value="virtual"
              checked={bookingData.consultationType === 'virtual'}
              onChange={(e) => handleBookingDataChange('consultationType', e.target.value)}
            />
            <label className="btn btn-outline-primary" htmlFor="virtual">
              <i className="fas fa-video me-2"></i>
              Virtual (Video Call)
            </label>

            <input 
              type="radio" 
              className="btn-check" 
              name="consultationType" 
              id="in-person"
              value="in-person"
              checked={bookingData.consultationType === 'in-person'}
              onChange={(e) => handleBookingDataChange('consultationType', e.target.value)}
            />
            <label className="btn btn-outline-primary" htmlFor="in-person">
              <i className="fas fa-map-marker-alt me-2"></i>
              In-Person (Studio)
            </label>
          </div>
        </div>

        {/* Contact Method */}
        <div className="mb-3">
          <label className="form-label fw-bold text-dark">
            <i className="fas fa-phone me-2"></i>
            Preferred Contact Method
          </label>
          <select 
            className="form-select"
            value={bookingData.contactMethod}
            onChange={(e) => handleBookingDataChange('contactMethod', e.target.value)}
          >
            <option value="email">Email</option>
            <option value="phone">Phone Call</option>
            <option value="sms">Text Message</option>
          </select>
        </div>

        {/* Special Requests */}
        <div className="mb-4">
          <label className="form-label fw-bold text-dark">
            <i className="fas fa-comment me-2"></i>
            Special Requests or Questions
          </label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Any specific questions about the style, concerns, or special requests..."
            value={bookingData.specialRequests}
            onChange={(e) => handleBookingDataChange('specialRequests', e.target.value)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="booking-actions">
        <div className="d-grid gap-2">
          <button 
            className="btn btn-primary btn-lg"
            onClick={handleBookConsultation}
            disabled={isBooking || !selectedStyle}
          >
            <i className="fas fa-calendar-plus me-2"></i>
            {isBooking ? 'Booking...' : 'Book Consultation'}
          </button>
          
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-secondary flex-fill"
              onClick={handleSaveForLater}
              disabled={isBooking}
            >
              <i className="fas fa-save me-2"></i>
              Save for Later
            </button>
            <button 
              className="btn btn-outline-info flex-fill"
              onClick={onResetTryOn}
              disabled={isBooking}
            >
              <i className="fas fa-redo me-2"></i>
              Start New Try-On
            </button>
          </div>
        </div>
      </div>

      {/* Booking Benefits */}
      <div className="booking-benefits mt-4 p-3 bg-light rounded">
        <h5 className="h6 fw-bold text-dark mb-2">
          <i className="fas fa-gift me-2"></i>
          What's Included
        </h5>
        <ul className="list-unstyled small text-secondary mb-0">
          <li className="mb-1">
            <i className="fas fa-check text-success me-2"></i>
            30-minute consultation with Victoria
          </li>
          <li className="mb-1">
            <i className="fas fa-check text-success me-2"></i>
            Review of your virtual try-on results
          </li>
          <li className="mb-1">
            <i className="fas fa-check text-success me-2"></i>
            Personalized style recommendations
          </li>
          <li className="mb-1">
            <i className="fas fa-check text-success me-2"></i>
            Detailed aftercare instructions
          </li>
          <li className="mb-0">
            <i className="fas fa-check text-success me-2"></i>
            Custom pricing based on your chosen style
          </li>
        </ul>
      </div>

      {/* Contact Information */}
      <div className="contact-info mt-4 p-3 bg-primary bg-opacity-10 rounded">
        <h5 className="h6 fw-bold text-dark mb-2">
          <i className="fas fa-phone me-2"></i>
          Need Help?
        </h5>
        <p className="text-secondary small mb-2">
          Have questions about booking or the consultation process?
        </p>
        <div className="d-flex gap-2">
          <a href="tel:(919) 441-0932" className="btn btn-outline-primary btn-sm">
            <i className="fas fa-phone me-2"></i>
            Call (919) 441-0932
          </a>
          <a href="/contact" className="btn btn-outline-secondary btn-sm">
            <i className="fas fa-envelope me-2"></i>
            Contact Us
          </a>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="terms-notice mt-4 p-3 bg-warning bg-opacity-10 rounded">
        <h5 className="h6 fw-bold text-dark mb-2">
          <i className="fas fa-info-circle me-2"></i>
          Important Information
        </h5>
        <ul className="list-unstyled small text-secondary mb-0">
          <li className="mb-1">
            <i className="fas fa-exclamation-triangle text-warning me-2"></i>
            Consultations are free and non-binding
          </li>
          <li className="mb-1">
            <i className="fas fa-exclamation-triangle text-warning me-2"></i>
            Virtual consultations available nationwide
          </li>
          <li className="mb-1">
            <i className="fas fa-exclamation-triangle text-warning me-2"></i>
            In-person consultations at Raleigh studio
          </li>
          <li className="mb-0">
            <i className="fas fa-exclamation-triangle text-warning me-2"></i>
            24-hour notice required for cancellations
          </li>
        </ul>
      </div>

      {/* Loading State */}
      {isBooking && (
        <div className="text-center mt-3">
          <div className="spinner-border text-primary mb-2" role="status">
            <span className="visually-hidden">Processing booking...</span>
          </div>
          <p className="text-secondary mb-0">Processing your consultation booking...</p>
        </div>
      )}
    </div>
  );
}
