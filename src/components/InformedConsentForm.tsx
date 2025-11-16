'use client';

import React, { useState } from 'react';
import { InformedConsent, PersonalInfo } from './ComprehensiveHealthFormWizard';

interface InformedConsentFormProps {
  data: InformedConsent;
  onChange: (data: InformedConsent) => void;
  onNext: () => void;
  onBack: () => void;
  personalInfo: PersonalInfo;
  serviceName: string;
}

export default function InformedConsentForm({
  data,
  onChange,
  onNext,
  onBack,
  personalInfo,
  serviceName
}: InformedConsentFormProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const [hasReadConsent, setHasReadConsent] = useState(false);

  const handleSubmit = () => {
    const newErrors: string[]  = [];

    if (!data.clientFullName || data.clientFullName.trim() === '') {
      newErrors.push('Please enter your full name');
    }

    if (!data.consentSignature || data.consentSignature.trim() === '') {
      newErrors.push('Please sign the consent form');
    }

    if (!data.consentGiven) {
      newErrors.push('You must agree to the informed consent');
    }

    if (!data.patchTestConsent || data.patchTestConsent === '') {
      newErrors.push('Please indicate your patch test preference');
    }

    if (!data.patchTestWaiver || data.patchTestWaiver === '') {
      newErrors.push('Please indicate your patch test waiver preference');
    }

    if (!data.procedureAuthorized || data.procedureAuthorized.trim() === '') {
      newErrors.push('Please confirm the procedure you are authorizing');
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
              <h2 className="h3 mb-0">Informed Consent</h2>
              <p className="mb-0 opacity-75">Please read carefully and sign below</p>
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

              {/* Consent Text */}
              <div 
                className="consent-text mb-4 p-4 border rounded" 
                style={{ maxHeight: '500px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}
              >
                <p className="mb-3">
                  I, <strong>{personalInfo.firstName} {personalInfo.lastName}</strong>, confirm that I am over 18 years of age, not under the influence of drugs or alcohol, and am neither pregnant nor nursing. I voluntarily choose to receive the specified semi-permanent pigmentation procedure. The general details of cosmetic micro-pigmentation, as well as the specifics of this procedure, have been fully explained to me.
                </p>
                
                <p className="mb-3">
                  If an unexpected situation arises during the procedure, I authorize my technician to use their professional judgment to make any necessary adjustments based on the circumstances. I accept responsibility for the final choice of color, shape, and position of the permanent makeup as we agreed upon during my consultation. I understand and accept that non-toxic pigments will be used, and while the color will fade over time (typically 1-3 years), some pigment may remain in the skin indefinitely.
                </p>
                
                <p className="mb-3">
                  I have been assured that this facility follows the highest hygiene standards, with sterile, single-use needles and pigment containers used for each client, procedure, and appointment.
                </p>
                
                <p className="mb-3">
                  I acknowledge and understand that achieving the desired results is a process and may require multiple pigment applications.
                </p>
                
                <p className="mb-3">
                  I understand that the first procedure may not yield 100% of the desired result, and I may need to return for additional applications. I understand that the final outcome of this procedure may be affected by various factors, including my current medications, skin type (e.g., oily, dry, sun-damaged, thick, or thin), personal skin pH balance, alcohol use, smoking habits, and how well I follow aftercare instructions.
                </p>
                
                <p className="mb-3">
                  After the procedure, I may experience temporary swelling, redness, and, in some cases, bruising. These effects typically subside within 1-4 days. I can resume normal activities after the procedure but understand that I should avoid makeup application, heavy sweating, and sun exposure until my skin has healed. Full aftercare instructions have been provided. The initial results should be acceptable for appearing in public without additional makeup.
                </p>
                
                <p className="mb-3">
                  I have been informed that the final color may take up to six weeks to develop, and the pigment may vary based on my skin tone, type, age, and overall skin condition. I understand that some skin types hold pigment more readily than others, so exact color matching cannot be guaranteed.
                </p>
                
                <p className="mb-3">
                  To the best of my knowledge, I do not have any physical, mental, or medical condition that would affect my safety or wellbeing as a result of undergoing this procedure.
                </p>
                
                <p className="mb-3">
                  I agree to follow all pre-procedure and post-procedure instructions provided and explained to me by my technician. I understand that failing to follow these instructions may impact the success of my procedure.
                </p>
                
                <p className="mb-3">
                  I certify that I have read and fully understand the statements above, have had ample opportunity to discuss and ask questions, and hereby give my informed consent to the procedure as described.
                </p>
                
                <p className="mb-3">
                  I have been informed about the nature, risks, and potential complications associated with permanent pigmentation. I understand that this procedure carries risks, known and unknown, which include but are not limited to infection, scarring, inconsistent color, and possible spreading, fanning, or fading of the pigments. I accept that the final color may vary slightly due to my skin&apos;s tone and color.
                </p>
                
                <p className="mb-3">
                  I understand that this procedure is a form of tattooing and is therefore not an exact science but an art. I accept the permanence of this procedure along with its potential risks and consequences.
                </p>
                
                <p className="mb-3">
                  I am aware that there is a chance of allergic reactions to the numbing agent and/or pigments. A patch test is available, though it does not fully guarantee that I won&apos;t have a reaction. If I choose to waive the patch test, I release the technician from any liability if I experience an allergic reaction.
                </p>
                
                <p className="mb-3">
                  I understand that skin treatments, injectables, laser hair removal, plastic surgery, or other procedures that alter the skin may affect the results of my permanent makeup. I acknowledge that some of these changes may not be correctable.
                </p>
              </div>

              {/* Scroll Confirmation */}
              <div className="form-check mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="hasReadConsent"
                  checked={hasReadConsent}
                  onChange={(e) => setHasReadConsent(e.target.checked)}
                />
                <label className="form-check-label fw-bold" htmlFor="hasReadConsent">
                  I have read and understood the entire consent form above
                </label>
              </div>

              {/* Client Full Name */}
              <div className="mb-4">
                <label className="form-label fw-bold">Full Legal Name *</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={data.clientFullName}
                  onChange={(e) => onChange({ ...data, clientFullName: e.target.value })}
                  placeholder="Enter your full legal name"
                />
                <small className="text-muted">This should match your government-issued ID</small>
              </div>

              {/* Patch Test Options */}
              <div className="mb-4">
                <label className="form-label fw-bold">Patch Test *</label>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="patchTestConsent"
                        id="patchTestYes"
                        value="yes"
                        checked={data.patchTestConsent === 'yes'}
                        onChange={(e) => onChange({ ...data, patchTestConsent: e.target.value })}
                      />
                      <label className="form-check-label" htmlFor="patchTestYes">
                        I consent to the patch test
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="patchTestConsent"
                        id="patchTestNo"
                        value="no"
                        checked={data.patchTestConsent === 'no'}
                        onChange={(e) => onChange({ ...data, patchTestConsent: e.target.value })}
                      />
                      <label className="form-check-label" htmlFor="patchTestNo">
                        I do NOT consent to the patch test
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patch Test Waiver */}
              <div className="mb-4">
                <label className="form-label fw-bold">Patch Test Waiver *</label>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="patchTestWaiver"
                        id="patchTestWaiverYes"
                        value="yes"
                        checked={data.patchTestWaiver === 'yes'}
                        onChange={(e) => onChange({ ...data, patchTestWaiver: e.target.value })}
                      />
                      <label className="form-check-label" htmlFor="patchTestWaiverYes">
                        I waive the patch test
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="patchTestWaiver"
                        id="patchTestWaiverNo"
                        value="no"
                        checked={data.patchTestWaiver === 'no'}
                        onChange={(e) => onChange({ ...data, patchTestWaiver: e.target.value })}
                      />
                      <label className="form-check-label" htmlFor="patchTestWaiverNo">
                        I do NOT waive the patch test
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Procedure Authorization */}
              <div className="mb-4">
                <label className="form-label fw-bold">I authorize my Cosmetic Professional to perform the specified procedure: *</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={data.procedureAuthorized}
                  onChange={(e) => onChange({ ...data, procedureAuthorized: e.target.value })}
                  placeholder={`Enter: ${serviceName}`}
                />
                <small className="text-muted">Please type the procedure name: {serviceName}</small>
              </div>

              {/* Final Consent Checkbox */}
              <div className="mb-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="consentGiven"
                    checked={data.consentGiven}
                    onChange={(e) => onChange({ ...data, consentGiven: e.target.checked })}
                  />
                  <label className="form-check-label fw-bold" htmlFor="consentGiven">
                    I confirm that I have read and fully understand each of the above statements. I have had sufficient opportunity to discuss and ask questions and hereby consent to the procedure as described above.
                  </label>
                </div>
              </div>

              {/* Electronic Signature */}
              <div className="mb-4">
                <label className="form-label fw-bold">Electronic Signature *</label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  value={data.consentSignature}
                  onChange={(e) => onChange({ ...data, consentSignature: e.target.value })}
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
                className="btn btn-primary btn-lg px-5"
                onClick={handleSubmit}
                disabled={!hasReadConsent}
              >
                Continue to Photo/Video Release
                <i className="fas fa-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
