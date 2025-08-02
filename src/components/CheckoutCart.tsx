'use client';

import { useState } from 'react';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  image: string;
}

interface CheckoutData {
  selectedDate: string;
  selectedTime: string;
  paymentMethod: string;
  specialRequests: string;
  giftCard: string;
  agreeToTerms: boolean;
  agreeToPolicy: boolean;
}

interface CheckoutCartProps {
  service: ServiceItem;
  appointmentDate: string;
  appointmentTime: string;
  clientName: string;
  data: CheckoutData;
  onChange: (data: CheckoutData) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CheckoutCart({ 
  service, 
  appointmentDate, 
  appointmentTime, 
  clientName,
  data, 
  onChange, 
  onNext, 
  onBack 
}: CheckoutCartProps) {
  const [showGiftCard, setShowGiftCard] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  const handleInputChange = (field: keyof CheckoutData, value: string | boolean) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const totalAmount = 659.10;
  const depositAmount = 200.00;

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Welcome Section */}
          <div className="mb-4">
            <h2 className="h4 mb-1">Welcome, Brian S</h2>
            <h3 className="h5 text-primary mb-3">A Pretty Girl Matter</h3>
          </div>

          {/* Who Are You Booking For */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">Who Are You Booking For?</h5>
              <div className="d-flex align-items-center">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px'}}>
                  <i className="fas fa-user"></i>
                </div>
                <div>
                  <div className="fw-bold">Brian Stitt (Me)</div>
                </div>
              </div>
            </div>
          </div>

          {/* About Your Appointment */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">About your appointment</h5>
              <div className="form-group">
                <label htmlFor="specialRequests" className="form-label">
                  Do you have any special requests or ideas to share with your service provider? (optional)
                </label>
                <textarea
                  className="form-control"
                  id="specialRequests"
                  rows={3}
                  value={data.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                  placeholder="Enter any special requests or ideas..."
                />
              </div>
            </div>
          </div>

          {/* Gift Card Section */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">Gift Card</h5>
                <button 
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setShowGiftCard(!showGiftCard)}
                >
                  Add Gift Card
                </button>
              </div>
              {showGiftCard && (
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter gift card code"
                    value={data.giftCard}
                    onChange={(e) => handleInputChange('giftCard', e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Deposit Information */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title text-warning mb-3">
                <i className="fas fa-exclamation-triangle me-2"></i>
                This Business Requires a Deposit:
              </h5>
              <p className="mb-3">A payment card is required to pay deposit. The remaining balance is due when you arrive at the business.</p>
              
              <h6 className="mb-3">New Payment Method</h6>
              <div className="border rounded p-3 text-center text-muted">
                <i className="fas fa-credit-card fa-2x mb-2"></i>
                <div>Add payment method for deposit</div>
                <button className="btn btn-primary btn-sm mt-2">
                  Add Payment Method
                </button>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">Cancellation Policy</h5>
              <p className="text-muted small">
                Clients are requested to arrive on time for their appointments. A grace period of 15 minutes is permitted for appointments exceeding one hour; however, if you arrive more than 15 minutes late, we cannot guarantee your service and will need to reschedule, incurring a $50.00 rebooking fee. All deposits are nonrefundable and will be applied towards the service. Only one reschedule is permitted per appointment. We appreciate your understanding of our policies, which are in place to ensure the safety and satisfaction of all clients.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-between mb-4">
            <button
              type="button"
              className="btn btn-outline-secondary px-4"
              onClick={onBack}
            >
              Back
            </button>
            <button
              type="button"
              className="btn btn-primary px-4 fw-bold"
              onClick={onNext}
            >
              Book
            </button>
          </div>

          {/* Order Summary Toggle */}
          <div className="text-center">
            <button 
              className="btn btn-link text-decoration-none"
              onClick={() => setShowOrderSummary(!showOrderSummary)}
            >
              <span className="me-2">View Order Summary</span>
              <i className={`fas fa-chevron-${showOrderSummary ? 'up' : 'down'}`}></i>
            </button>
            
            {showOrderSummary && (
              <div className="card mt-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total:</span>
                    <span className="fw-bold">${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between text-primary">
                    <span>Due now:</span>
                    <span className="fw-bold">${depositAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
            
            {!showOrderSummary && (
              <div className="mt-2">
                <div className="h5 mb-1">${totalAmount.toFixed(2)}</div>
                <div className="text-primary fw-bold">${depositAmount.toFixed(2)} due now</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { CheckoutData, ServiceItem };
