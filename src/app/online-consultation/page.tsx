'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OnlineConsultationWizard from '@/components/OnlineConsultationWizard';

interface ConsultationData {
  [key: string]: any;
  motivation?: string[];
  issues?: string[];
  previous_experience?: string;
  current_fullness?: string;
  dream_shape?: string;
  front_texture?: string;
  edge_definition?: string;
  brow_color?: string;
  additional_goals?: string;
  brow_photo?: File;
  concerns?: string;
  lifestyle?: string;
  timeline?: string;
  budget_notes?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  email_agreement?: boolean;
  other_issues?: string;
}

export default function OnlineConsultation() {
  const [isCompleted, setIsCompleted] = useState(false);
  const [consultationData, setConsultationData] = useState<ConsultationData | null>(null);

  const handleConsultationComplete = (data: ConsultationData) => {
    console.log('Consultation completed with data:', data);
    setConsultationData(data);
    setIsCompleted(true);
    // Here you would integrate with your backend/email service
  };

  return (
    <>
      <Header />
      <div className="container-fluid" style={{ 
        background: 'linear-gradient(135deg, #fff 0%, #f8f8f8 100%)', 
        minHeight: '100vh',
        fontFamily: 'Montserrat, sans-serif',
        paddingTop: '140px'
      }}>
        <div className="container" style={{ maxWidth: '900px', padding: '20px' }}>
          {/* Header */}
          <div className="text-center mb-5 py-4">
            <h1 style={{ 
              fontFamily: 'Playfair Display, serif', 
              fontSize: '2.8rem', 
              color: '#AD6269',
              marginBottom: '10px'
            }}>
              Online Consultation
            </h1>
            <div style={{ 
              fontSize: '1.3rem', 
              color: '#f75eb5', 
              fontWeight: '600',
              marginBottom: '15px'
            }}>
              30-Minute Personalized Assessment
            </div>
            <p style={{ 
              fontSize: '1.1rem', 
              color: '#666', 
              maxWidth: '700px', 
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Get personalized eyebrow recommendations from our experts. We'll analyze your preferences, skin type, and goals to create the perfect brow plan just for you.
            </p>
          </div>

          {/* Wizard or Completion */}
          {!isCompleted ? (
            <OnlineConsultationWizard onComplete={handleConsultationComplete} />
          ) : (
            <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              <div className="card-body p-5 text-center">
                <div style={{ fontSize: '4rem', color: '#28a745', marginBottom: '20px' }}>✨</div>
                <h2 style={{ 
                  fontFamily: 'Playfair Display, serif', 
                  fontSize: '2.2rem', 
                  color: '#AD6269',
                  marginBottom: '15px'
                }}>
                  Consultation Submitted!
                </h2>
                <div style={{ 
                  color: '#666', 
                  fontSize: '1.1rem',
                  lineHeight: '1.6',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>
                  Thank you for completing your online consultation! Our expert team will review your responses and create personalized eyebrow recommendations just for you.
                  <br/><br/>
                  You'll receive your detailed consultation results via email within 48 hours, including technique recommendations, color matching, and your custom brow mockup if you uploaded a photo.
                  <br/><br/>
                  We can't wait to help you achieve your dream brows!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
