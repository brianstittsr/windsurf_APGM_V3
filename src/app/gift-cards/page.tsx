'use client';

import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { GiftCardService } from '@/services/giftCardService';
import { Timestamp } from 'firebase/firestore';

interface GiftCardFormData {
  amount: number;
  purchaserName: string;
  purchaserEmail: string;
  recipientName: string;
  recipientEmail: string;
  message: string;
}

export default function GiftCardsPage() {
  const [formData, setFormData] = useState<GiftCardFormData>({
    amount: 100,
    purchaserName: '',
    purchaserEmail: '',
    recipientName: '',
    recipientEmail: '',
    message: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [giftCardCode, setGiftCardCode] = useState('');

  const predefinedAmounts = [50, 100, 150, 200, 250, 300];

  const handleInputChange = (field: keyof GiftCardFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Create gift card
      const giftCardId = await GiftCardService.createGiftCard({
        originalAmount: formData.amount * 100, // Convert to cents
        remainingAmount: formData.amount * 100,
        purchaserName: formData.purchaserName,
        purchaserEmail: formData.purchaserEmail,
        recipientName: formData.recipientName || undefined,
        recipientEmail: formData.recipientEmail || undefined,
        message: formData.message || undefined,
        isActive: true,
        isRedeemed: false,
        expirationDate: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) // 1 year from now
      });

      // Get the created gift card to show the code
      const createdGiftCard = await GiftCardService.getGiftCardById(giftCardId);
      if (createdGiftCard) {
        setGiftCardCode(createdGiftCard.code);
        setSuccess(true);
        
        // Send gift card email (you'll need to implement this API endpoint)
        await fetch('/api/send-gift-card-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            giftCard: createdGiftCard,
            purchaserName: formData.purchaserName,
            purchaserEmail: formData.purchaserEmail,
            recipientName: formData.recipientName,
            recipientEmail: formData.recipientEmail,
            message: formData.message
          })
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gift card');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-vh-100 d-flex flex-column">
        <Header />
        <div className="flex-grow-1 py-5" style={{ backgroundColor: '#f8f9fa' }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="card shadow-lg border-0">
                  <div className="card-header bg-success text-white text-center py-4">
                    <h2 className="h3 mb-0">
                      <i className="fas fa-check-circle me-2"></i>
                      Gift Card Created Successfully!
                    </h2>
                  </div>
                  <div className="card-body p-5 text-center">
                    <div className="mb-4">
                      <h3 className="text-primary mb-3">Gift Card Code</h3>
                      <div className="p-3 bg-light border rounded">
                        <code className="fs-2 fw-bold text-primary">{giftCardCode}</code>
                      </div>
                      <small className="text-muted">Save this code - it will be needed for redemption</small>
                    </div>
                    
                    <div className="mb-4">
                      <p className="lead">
                        <strong>Amount:</strong> ${formData.amount.toFixed(2)}
                      </p>
                      {formData.recipientEmail && (
                        <p className="text-muted">
                          An email has been sent to {formData.recipientEmail} with the gift card details.
                        </p>
                      )}
                    </div>
                    
                    <div className="d-flex gap-3 justify-content-center">
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setSuccess(false);
                          setFormData({
                            amount: 100,
                            purchaserName: '',
                            purchaserEmail: '',
                            recipientName: '',
                            recipientEmail: '',
                            message: ''
                          });
                        }}
                      >
                        Purchase Another Gift Card
                      </button>
                      <a href="/" className="btn btn-outline-secondary">
                        Return to Home
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      <div className="flex-grow-1 py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card shadow-lg border-0">
                <div className="card-header bg-primary text-white text-center py-4">
                  <h1 className="h3 mb-0">
                    <i className="fas fa-gift me-2"></i>
                    Purchase Gift Card
                  </h1>
                  <p className="mb-0 mt-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Give the gift of beauty with A Pretty Girl Matter
                  </p>
                </div>
                
                <div className="card-body p-5">
                  {error && (
                    <div className="alert alert-danger mb-4">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* Gift Card Amount */}
                    <div className="mb-4">
                      <label className="form-label fw-bold">Gift Card Amount *</label>
                      <div className="row g-2 mb-3">
                        {predefinedAmounts.map(amount => (
                          <div key={amount} className="col-4 col-md-2">
                            <button
                              type="button"
                              className={`btn w-100 ${formData.amount === amount ? 'btn-primary' : 'btn-outline-primary'}`}
                              onClick={() => handleInputChange('amount', amount)}
                            >
                              ${amount}
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.amount}
                          onChange={(e) => handleInputChange('amount', parseInt(e.target.value) || 0)}
                          min="25"
                          max="1000"
                          required
                        />
                      </div>
                      <small className="text-muted">Minimum $25, Maximum $1,000</small>
                    </div>

                    {/* Purchaser Information */}
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Your Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.purchaserName}
                          onChange={(e) => handleInputChange('purchaserName', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Your Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          value={formData.purchaserEmail}
                          onChange={(e) => handleInputChange('purchaserEmail', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Recipient Information */}
                    <div className="mb-4">
                      <h5 className="text-primary mb-3">
                        <i className="fas fa-user-friends me-2"></i>
                        Recipient Information (Optional)
                      </h5>
                      <div className="row">
                        <div className="col-md-6">
                          <label className="form-label">Recipient Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.recipientName}
                            onChange={(e) => handleInputChange('recipientName', e.target.value)}
                            placeholder="Leave blank if purchasing for yourself"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Recipient Email</label>
                          <input
                            type="email"
                            className="form-control"
                            value={formData.recipientEmail}
                            onChange={(e) => handleInputChange('recipientEmail', e.target.value)}
                            placeholder="We'll send them the gift card"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Personal Message */}
                    <div className="mb-4">
                      <label className="form-label fw-bold">Personal Message (Optional)</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Add a personal message to make this gift extra special..."
                        maxLength={500}
                      />
                      <small className="text-muted">{formData.message.length}/500 characters</small>
                    </div>

                    {/* Terms */}
                    <div className="alert alert-info mb-4">
                      <h6 className="fw-bold mb-2">
                        <i className="fas fa-info-circle me-2"></i>
                        Gift Card Terms
                      </h6>
                      <ul className="small mb-0">
                        <li>Gift cards are valid for 1 year from purchase date</li>
                        <li>Can be used for any service or product</li>
                        <li>Non-refundable and cannot be exchanged for cash</li>
                        <li>Can be combined with other promotions</li>
                        <li>Lost or stolen gift cards cannot be replaced</li>
                      </ul>
                    </div>

                    {/* Submit Button */}
                    <div className="text-center">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg px-5"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-credit-card me-2"></i>
                            Purchase Gift Card - ${formData.amount.toFixed(2)}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
