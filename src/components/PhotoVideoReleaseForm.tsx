'use client';

import React, { useState } from 'react';
import { PhotoVideoRelease, PersonalInfo } from './ComprehensiveHealthFormWizard';

interface PhotoVideoReleaseFormProps {
  data: PhotoVideoRelease;
  onChange: (data: PhotoVideoRelease) => void;
  onNext: () => void;
  onBack: () => void;
  personalInfo: PersonalInfo;
}

export default function PhotoVideoReleaseForm({
  data,
  onChange,
  onNext,
  onBack,
  personalInfo
}: PhotoVideoReleaseFormProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const [hasReadRelease, setHasReadRelease] = useState(false);

  const handleSubmit = () => {
    const newErrors: string[] = [];

    if (!data.releaseSignature || data.releaseSignature.trim() === '') {
      newErrors.push('Please sign the photo/video release form');
    }

    if (!data.releaseGranted) {
      newErrors.push('You must agree to the photo/video release or decline');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext();
  };

  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white text-center py-4">
              <h2 className="h3 mb-0">Photo and Video Release</h2>
              <p className="mb-0 opacity-75">Optional - Help us showcase our work</p>
            </div>
            
            <div className="card-body p-5">
              {errors.length > 0 && (
                <div className="alert alert-danger mb-4">
                  <h6 className="fw-bold mb-2">Please correct the following:</h6>
                  <ul className="mb-0">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="alert alert-info mb-4">
                <h6 className="fw-bold mb-2">
                  <i className="fas fa-camera me-2"></i>
                  This Release is Optional
                </h6>
                <p className="mb-0 small">
                  Granting this release helps us showcase our work and grow our business. 
                  However, you are under no obligation to agree. Your decision will not affect 
                  the quality of service you receive.
                </p>
              </div>

              {/* Release Text */}
              <div 
                className="release-text mb-4 p-4 border rounded" 
                style={{ maxHeight: '400px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}
              >
                <h5 className="fw-bold mb-3">Photo and Video Release Agreement</h5>
                
                <p className="mb-3">
                  I grant permission for my image, likeness, and voice to be recorded on video or audio by <strong>A Pretty Girl Matter</strong>, without requiring payment or other compensation. I understand my image may be edited, copied, shared, published, or distributed, and I waive the right to inspect or approve the final product.
                </p>
                
                <p className="mb-3">
                  I also waive any right to royalties or other compensation related to the use of my image or recordings. I understand that this material may be used in various educational settings without geographic limits.
                </p>
                
                <h6 className="fw-bold mb-2">Photographic, audio, or video recordings may be used for the following purposes:</h6>
                <ul className="mb-3">
                  <li>Social Media Content</li>
                  <li>Conference presentations</li>
                  <li>Educational presentations or courses</li>
                  <li>Informational presentations</li>
                  <li>Online educational courses</li>
                  <li>Educational videos</li>
                  <li>Marketing and promotional materials</li>
                  <li>Website content</li>
                  <li>Before and after galleries</li>
                </ul>
                
                <p className="mb-3">
                  By signing this release, I understand that my photos or video recordings may be displayed online or in public educational settings.
                </p>
                
                <p className="mb-3">
                  I will be consulted before my photos or videos are used for purposes other than those listed above.
                </p>
                
                <p className="mb-3">
                  There is no time limit on the validity of this release, nor any geographic limitation on where these materials may be shown or shared.
                </p>
                
                <p className="mb-3">
                  This release applies only to photos, audio, or video recordings taken as part of the sessions listed on this document.
                </p>
                
                <p className="mb-3">
                  By signing, I acknowledge that I have fully read and understood this release and agree to these terms. I release any claims against any person or organization using this material for educational purposes.
                </p>
              </div>

              {/* Scroll Confirmation */}
              <div className="form-check mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="hasReadRelease"
                  checked={hasReadRelease}
                  onChange={(e) => setHasReadRelease(e.target.checked)}
                />
                <label className="form-check-label fw-bold" htmlFor="hasReadRelease">
                  I have read and understood the entire photo/video release form above
                </label>
              </div>

              {/* Grant or Decline Release */}
              <div className="mb-4">
                <label className="form-label fw-bold">Do you grant permission for photo and video use? *</label>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="card h-100 border-success" style={{ cursor: 'pointer' }} onClick={() => onChange({ ...data, releaseGranted: true })}>
                      <div className="card-body text-center">
                        <div className="form-check d-flex justify-content-center">
                          <input
                            className="form-check-input me-2"
                            type="radio"
                            name="releaseGranted"
                            id="releaseYes"
                            checked={data.releaseGranted === true}
                            onChange={() => onChange({ ...data, releaseGranted: true })}
                          />
                          <label className="form-check-label fw-bold text-success" htmlFor="releaseYes">
                            <i className="fas fa-check-circle me-2"></i>
                            Yes, I Grant Permission
                          </label>
                        </div>
                        <small className="text-muted d-block mt-2">
                          I agree to allow my photos/videos to be used as described above
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 mb-3">
                    <div className="card h-100 border-danger" style={{ cursor: 'pointer' }} onClick={() => onChange({ ...data, releaseGranted: false })}>
                      <div className="card-body text-center">
                        <div className="form-check d-flex justify-content-center">
                          <input
                            className="form-check-input me-2"
                            type="radio"
                            name="releaseGranted"
                            id="releaseNo"
                            checked={data.releaseGranted === false}
                            onChange={() => onChange({ ...data, releaseGranted: false })}
                          />
                          <label className="form-check-label fw-bold text-danger" htmlFor="releaseNo">
                            <i className="fas fa-times-circle me-2"></i>
                            No, I Decline
                          </label>
                        </div>
                        <small className="text-muted d-block mt-2">
                          I do not wish to have my photos/videos used
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Electronic Signature */}
              <div className="mb-4">
                <label className="form-label fw-bold">Electronic Signature *</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={data.releaseSignature}
                  onChange={(e) => onChange({ ...data, releaseSignature: e.target.value })}
                  placeholder="Type your full legal name to sign"
                  style={{ fontFamily: 'cursive', fontSize: '1.5rem' }}
                />
                <small className="text-muted d-block mt-2">
                  <i className="fas fa-calendar me-1"></i>
                  Date: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                </small>
                <small className="text-muted d-block">
                  By typing your name above, you agree to use electronic records and signatures.
                </small>
              </div>

              {data.releaseGranted === false && (
                <div className="alert alert-warning">
                  <h6 className="fw-bold mb-2">
                    <i className="fas fa-info-circle me-2"></i>
                    You Have Declined the Photo/Video Release
                  </h6>
                  <p className="mb-0 small">
                    We respect your decision. Your photos and videos will not be used for marketing, 
                    social media, or any public display. They will only be kept in your private client file 
                    for medical records purposes.
                  </p>
                </div>
              )}

              {data.releaseGranted === true && (
                <div className="alert alert-success">
                  <h6 className="fw-bold mb-2">
                    <i className="fas fa-check-circle me-2"></i>
                    Thank You for Granting Permission!
                  </h6>
                  <p className="mb-0 small">
                    Your support helps us showcase our work and grow our business. We truly appreciate it! 
                    Remember, you can revoke this permission at any time by contacting us.
                  </p>
                </div>
              )}
            </div>

            <div className="card-footer bg-light d-flex justify-content-between py-3">
              <button
                type="button"
                className="btn btn-outline-secondary px-4"
                onClick={onBack}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Previous
              </button>
              <button
                type="button"
                className="btn btn-success btn-lg px-5"
                onClick={handleSubmit}
                disabled={!hasReadRelease}
              >
                Complete Health Form
                <i className="fas fa-check ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
