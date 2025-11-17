'use client';

import React, { useState, useEffect } from 'react';

// Question type definition
interface Question {
  key: string;
  question: string;
  hasDetails?: boolean;
  detailsKey?: string;
  detailsQuestion?: string;
  detailsType?: 'text' | 'date';
}

// Type definitions
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  birthDate: string;
  age: number;
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface MedicalHistory {
  [key: string]: string;
}

export interface Allergies {
  [key: string]: string;
}

export interface AdditionalHealth {
  [key: string]: string;
}

export interface InformedConsent {
  clientFullName: string;
  consentGiven: boolean;
  consentSignature: string;
  patchTestConsent: string;
  patchTestWaiver: string;
  procedureAuthorized: string;
}

export interface PhotoVideoRelease {
  releaseGranted: boolean;
  releaseSignature: string;
}

export interface ServiceSpecificConsent {
  consentGiven: boolean;
  signature: string;
  signedAt: string;
  understoodInformation: boolean;
}

export interface AftercareConsent {
  consentGiven: boolean;
  signature: string;
  signedAt: string;
  understoodInstructions: boolean;
}

export interface ComprehensiveHealthFormData {
  personalInfo: PersonalInfo;
  emergencyContact: EmergencyContact;
  medicalHistory: MedicalHistory;
  allergies: Allergies;
  additionalHealth: AdditionalHealth;
  serviceSpecificQuestions: { [key: string]: string };
  serviceSpecificConsent?: ServiceSpecificConsent;
  aftercareConsent?: AftercareConsent;
  informedConsent: InformedConsent;
  photoVideoRelease: PhotoVideoRelease;
}

interface ComprehensiveHealthFormWizardProps {
  data: ComprehensiveHealthFormData;
  onChange: (data: ComprehensiveHealthFormData) => void;
  onNext: () => void;
  onBack: () => void;
  personalInfo: PersonalInfo;
  emergencyContact: EmergencyContact;
  selectedService?: {
    id: string;
    name: string;
    category: string;
  };
}

type FormSection = 
  | 'medical-intro'
  | 'medical-history'
  | 'allergies'
  | 'additional-health'
  | 'service-specific-intro'
  | 'service-specific-aftercare'
  | 'informed-consent'
  | 'photo-video-release';

export default function ComprehensiveHealthFormWizard({
  data,
  onChange,
  onNext,
  onBack,
  personalInfo,
  emergencyContact,
  selectedService
}: ComprehensiveHealthFormWizardProps) {
  const [currentSection, setCurrentSection] = useState<FormSection>('medical-intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [showDetailsInput, setShowDetailsInput] = useState(false);
  const [serviceConsent, setServiceConsent] = useState<ServiceSpecificConsent>({
    consentGiven: false,
    signature: '',
    signedAt: '',
    understoodInformation: false
  });
  const [aftercareConsent, setAftercareConsent] = useState<AftercareConsent>({
    consentGiven: false,
    signature: '',
    signedAt: '',
    understoodInstructions: false
  });

  // Initialize data with personal info and emergency contact
  useEffect(() => {
    onChange({
      ...data,
      personalInfo,
      emergencyContact
    });
  }, []);

  // Medical History Questions - comprehensive list
  const medicalHistoryQuestions: Question[] = [
    {
      key: 'hadPermanentMakeupBefore',
      question: 'Have you ever had a cosmetic tattoo or permanent makeup procedure before?',
      hasDetails: true,
      detailsKey: 'lastProcedureDate',
      detailsQuestion: 'When was your last procedure?',
      detailsType: 'date' as const
    },
    { key: 'hasMolesInArea', question: 'Do you have moles or raised areas in the treatment area?' },
    { key: 'hasPiercingsInArea', question: 'Do you have piercings in the treatment area?' },
    { key: 'hairLoss', question: 'Do you currently have or have had in the past: Hair Loss' },
    { key: 'anemia', question: 'Do you currently have or have had in the past: Anemia' },
    { key: 'coldSores', question: 'Do you currently have or have had in the past: Cold sores or fever blisters' },
    { key: 'cosmeticSensitivity', question: 'Do you currently have or have had in the past: Sensitivity to cosmetics' },
    { key: 'prolongedBleeding', question: 'Do you currently have or have had in the past: Prolonged bleeding' },
    { key: 'diabetes', question: 'Do you currently have or have had in the past: Diabetes' },
    { key: 'trichotillomania', question: 'Do you currently have or have had in the past: Trichotillomania' },
    { key: 'jointReplacements', question: 'Do you currently have or have had in the past: Joint Replacements' },
    { key: 'healingProblems', question: 'Do you currently have or have had in the past: Healing problems' },
    { key: 'epilepsy', question: 'Do you currently have or have had in the past: Epilepsy' },
    { key: 'eczema', question: 'Do you currently have or have had in the past: Eczema' },
    { key: 'lowBloodPressure', question: 'Do you currently have or have had in the past: Low Blood pressure' },
    { key: 'highBloodPressure', question: 'Do you currently have or have had in the past: High Blood Pressure' },
    { key: 'hiv', question: 'Do you currently have or have had in the past: HIV' },
    { key: 'hemophilia', question: 'Do you currently have or have had in the past: Hemophilia' },
    { key: 'thyroidDisturbances', question: 'Do you currently have or have had in the past: Thyroid disturbances' },
    { key: 'cancer', question: 'Do you currently have or have had in the past: Cancer' },
    { key: 'hepatitis', question: 'Do you currently have or have had in the past: Hepatitis' },
    { key: 'faintingSpells', question: 'Do you currently have or have had in the past: Fainting spells or dizziness' },
    { key: 'circulatoryProblems', question: 'Do you currently have or have had in the past: Circulatory Problems' },
    { key: 'keloidScars', question: 'Do you currently have or have had in the past: Hypertrophic or keloid scars' },
    { key: 'liverDisease', question: 'Do you currently have or have had in the past: Liver Disease' },
    { key: 'alopecia', question: 'Do you currently have or have had in the past: Alopecia' },
    { key: 'tumorsGrowthsCysts', question: 'Do you currently have or have had in the past: Tumors, growths, cysts' },
    {
      key: 'takingMedications',
      question: 'Are you taking any medications, vitamins, including over-the-counter or prescription drugs?',
      hasDetails: true,
      detailsKey: 'medicationDetails',
      detailsQuestion: 'Please list all medications',
      detailsType: 'text' as const
    },
    {
      key: 'hadBotoxFillers',
      question: 'Have you experienced Botox, Restylane or Collagen injections?',
      hasDetails: true,
      detailsKey: 'botoxFillersDetails',
      detailsQuestion: 'Please provide details',
      detailsType: 'text' as const
    },
    {
      key: 'hadSurgeryRecently',
      question: 'Within the last nine months, have you undergone any surgery or plastic surgery?',
      hasDetails: true,
      detailsKey: 'surgeryDetails',
      detailsQuestion: 'Please provide details',
      detailsType: 'text' as const
    },
    { key: 'hadColdSoreFeverBlister', question: 'Have you ever had a cold sore/fever blister?' }
  ];

  // Allergy Questions
  const allergyQuestions: Question[] = [
    { key: 'latex', question: 'Have you ever had an allergic reaction to: Latex' },
    { key: 'vaseline', question: 'Have you ever had an allergic reaction to: Vaseline' },
    { key: 'food', question: 'Have you ever had an allergic reaction to: Food' },
    { key: 'paints', question: 'Have you ever had an allergic reaction to: Paints' },
    { key: 'metals', question: 'Have you ever had an allergic reaction to: Metals' },
    { key: 'lidocaine', question: 'Have you ever had an allergic reaction to: Lidocaine' },
    { key: 'lanolin', question: 'Have you ever had an allergic reaction to: Lanolin' },
    { key: 'crayons', question: 'Have you ever had an allergic reaction to: Crayons' },
    { key: 'medication', question: 'Have you ever had an allergic reaction to: Medication' },
    { key: 'glycerin', question: 'Have you ever had an allergic reaction to: Glycerin' },
    { key: 'hairDyes', question: 'Have you ever had an allergic reaction to: Hair Dyes' },
    { key: 'fragrance', question: 'Have you ever had an allergic reaction to: Fragrance' },
    { key: 'aspirin', question: 'Have you ever had an allergic reaction to: Aspirin' }
  ];

  // Additional Health Questions
  const additionalHealthQuestions: Question[] = [
    { key: 'scarEasily', question: 'Do you scar easily?' },
    { key: 'bruiseBleedEasily', question: 'Do you bruise/bleed easily?' },
    { key: 'takingBirthControl', question: 'Are you taking birth control?' },
    { key: 'pregnantOrTrying', question: 'Are you pregnant or trying to become pregnant?' },
    { key: 'hormoneReplacement', question: 'Are you undergoing any hormone replacement therapy?' }
  ];

  const getCurrentQuestions = () => {
    switch (currentSection) {
      case 'medical-history':
        return medicalHistoryQuestions;
      case 'allergies':
        return allergyQuestions;
      case 'additional-health':
        return additionalHealthQuestions;
      default:
        return [];
    }
  };

  const currentQuestions = getCurrentQuestions();
  const currentQuestion = currentQuestions[currentQuestionIndex];

  // Helper function to map section names to data keys
  const getSectionDataKey = (section: FormSection): 'medicalHistory' | 'allergies' | 'additionalHealth' | null => {
    switch (section) {
      case 'medical-history':
        return 'medicalHistory';
      case 'allergies':
        return 'allergies';
      case 'additional-health':
        return 'additionalHealth';
      default:
        return null;
    }
  };

  const handleYesNoAnswer = (answer: 'yes' | 'no') => {
    const sectionKey = getSectionDataKey(currentSection);
    if (!sectionKey) return;
    
    if (currentQuestion?.hasDetails && answer === 'yes') {
      setShowDetailsInput(true);
      onChange({
        ...data,
        [sectionKey]: {
          ...data[sectionKey],
          [currentQuestion.key]: answer
        }
      });
    } else {
      setShowDetailsInput(false);
      onChange({
        ...data,
        [sectionKey]: {
          ...data[sectionKey],
          [currentQuestion.key]: answer
        }
      });
      
      // Auto-advance after a short delay
      setTimeout(() => {
        handleNext();
      }, 300);
    }
    
    setErrors([]);
  };

  const handleDetailsInput = (value: string) => {
    const sectionKey = getSectionDataKey(currentSection);
    if (!sectionKey) return;
    
    onChange({
      ...data,
      [sectionKey]: {
        ...data[sectionKey],
        [currentQuestion.detailsKey!]: value
      }
    });
  };

  const handleNext = () => {
    if (currentSection === 'medical-intro') {
      moveToNextSection();
      return;
    }

    // Validate current question
    if (currentSection === 'medical-history' || currentSection === 'allergies' || currentSection === 'additional-health') {
      const sectionKey = getSectionDataKey(currentSection);
      if (!sectionKey) return;
      
      const answer = data[sectionKey][currentQuestion?.key];
      
      if (!answer) {
        setErrors(['Please select an answer']);
        return;
      }
      
      if (currentQuestion?.hasDetails && answer === 'yes' && showDetailsInput) {
        const details = data[sectionKey][currentQuestion.detailsKey!];
        if (!details) {
          setErrors(['Please provide details']);
          return;
        }
      }
    }
    
    setErrors([]);
    setShowDetailsInput(false);
    
    // Move to next question or section
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      moveToNextSection();
    }
  };

  const handlePrevious = () => {
    setErrors([]);
    setShowDetailsInput(false);
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      moveToPreviousSection();
    }
  };

  const moveToNextSection = () => {
    setCurrentQuestionIndex(0);
    
    switch (currentSection) {
      case 'medical-intro':
        setCurrentSection('medical-history');
        break;
      case 'medical-history':
        setCurrentSection('allergies');
        break;
      case 'allergies':
        setCurrentSection('additional-health');
        break;
      case 'additional-health':
        // Check if we should show service-specific intro
        const serviceName = selectedService?.name?.toLowerCase() || '';
        const isBrowService = serviceName.includes('brow') || serviceName.includes('powder') || 
                             serviceName.includes('blade') || serviceName.includes('ombre') ||
                             serviceName.includes('stroke') || serviceName.includes('combo');
        const isEyelinerService = serviceName.includes('eyeliner') || serviceName.includes('eye liner');
        const isLipService = serviceName.includes('lip');
        
        if (isBrowService || isEyelinerService || isLipService) {
          setCurrentSection('service-specific-intro');
        } else {
          setCurrentSection('informed-consent');
        }
        break;
      case 'service-specific-intro':
        // Check if lip service needs aftercare section
        const serviceNameIntro = selectedService?.name?.toLowerCase() || '';
        const isLipServiceIntro = serviceNameIntro.includes('lip');
        
        if (isLipServiceIntro) {
          setCurrentSection('service-specific-aftercare');
        } else {
          setCurrentSection('informed-consent');
        }
        break;
      case 'service-specific-aftercare':
        setCurrentSection('informed-consent');
        break;
      case 'informed-consent':
        setCurrentSection('photo-video-release');
        break;
      case 'photo-video-release':
        onNext();
        break;
    }
  };

  const moveToPreviousSection = () => {
    switch (currentSection) {
      case 'medical-intro':
        onBack();
        break;
      case 'medical-history':
        setCurrentSection('medical-intro');
        break;
      case 'allergies':
        setCurrentSection('medical-history');
        setCurrentQuestionIndex(medicalHistoryQuestions.length - 1);
        break;
      case 'additional-health':
        setCurrentSection('allergies');
        setCurrentQuestionIndex(allergyQuestions.length - 1);
        break;
      case 'service-specific-intro':
        setCurrentSection('additional-health');
        setCurrentQuestionIndex(additionalHealthQuestions.length - 1);
        break;
      case 'service-specific-aftercare':
        setCurrentSection('service-specific-intro');
        break;
      case 'informed-consent':
        // Check if we came from service-specific aftercare or intro
        const serviceName = selectedService?.name?.toLowerCase() || '';
        const isBrowService = serviceName.includes('brow') || serviceName.includes('powder') || 
                             serviceName.includes('blade') || serviceName.includes('ombre') ||
                             serviceName.includes('stroke') || serviceName.includes('combo');
        const isEyelinerService = serviceName.includes('eyeliner') || serviceName.includes('eye liner');
        const isLipService = serviceName.includes('lip');
        
        if (isLipService) {
          setCurrentSection('service-specific-aftercare');
        } else if (isBrowService || isEyelinerService) {
          setCurrentSection('service-specific-intro');
        } else {
          setCurrentSection('additional-health');
          setCurrentQuestionIndex(additionalHealthQuestions.length - 1);
        }
        break;
      case 'photo-video-release':
        setCurrentSection('informed-consent');
        break;
    }
  };

  const getProgress = () => {
    const totalSections = 7;
    const sectionOrder: FormSection[] = [
      'medical-intro',
      'medical-history',
      'allergies',
      'additional-health',
      'service-specific-intro',
      'informed-consent',
      'photo-video-release'
    ];
    
    const currentSectionIndex = sectionOrder.indexOf(currentSection);
    return Math.round(((currentSectionIndex + 1) / totalSections) * 100);
  };

  // Render sections
  if (currentSection === 'medical-intro') {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-lg border-0">
              <div className="card-header bg-primary text-white text-center py-4">
                <h2 className="h3 mb-0">Health & Medical History</h2>
                <p className="mb-0 opacity-75">Important information for your safety</p>
              </div>
              
              <div className="card-body p-5">
                <div className="alert alert-info mb-4">
                  <h5 className="fw-bold mb-3">
                    <i className="fas fa-info-circle me-2"></i>
                    Why We Need This Information
                  </h5>
                  <p className="mb-2">
                    Your health and safety are our top priorities. The following questions help us:
                  </p>
                  <ul className="mb-0">
                    <li>Ensure you&apos;re a good candidate for the procedure</li>
                    <li>Identify any potential risks or contraindications</li>
                    <li>Provide you with the best possible care and results</li>
                    <li>Comply with health and safety regulations</li>
                  </ul>
                </div>
                
                <div className="alert alert-warning mb-4">
                  <h6 className="fw-bold mb-2">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Please Answer Honestly
                  </h6>
                  <p className="mb-0 small">
                    All information is kept strictly confidential. Providing accurate information
                    ensures your safety and helps us deliver the best results.
                  </p>
                </div>
                
                <div className="text-center">
                  <h5 className="mb-3">Ready to begin?</h5>
                  <p className="text-muted mb-4">
                    This will take approximately 5-10 minutes to complete.
                  </p>
                  <button
                    className="btn btn-primary btn-lg px-5"
                    onClick={handleNext}
                  >
                    Start Health Form
                    <i className="fas fa-arrow-right ms-2"></i>
                  </button>
                </div>
              </div>
              
              <div className="card-footer bg-light d-flex justify-content-between py-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={onBack}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Back to Profile
                </button>
                <div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Question sections (medical-history, allergies, additional-health)
  if (currentSection === 'medical-history' || currentSection === 'allergies' || currentSection === 'additional-health') {
    if (!currentQuestion) return null;
    
    const totalQuestions = currentQuestions.length;
    const questionProgress = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);
    
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-lg border-0">
              <div className="card-header bg-primary text-white text-center py-4">
                <h2 className="h3 mb-0">
                  {currentSection === 'medical-history' && 'Medical History'}
                  {currentSection === 'allergies' && 'Allergy Information'}
                  {currentSection === 'additional-health' && 'Additional Health Questions'}
                </h2>
                <p className="mb-0 opacity-75">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </p>
                
                <div className="mt-3">
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar bg-warning" 
                      role="progressbar" 
                      style={{ width: `${questionProgress}%` }}
                    ></div>
                  </div>
                  <small className="text-white-50 mt-1 d-block">
                    {questionProgress}% Complete
                  </small>
                </div>
              </div>
              
              <div className="card-body p-5">
                {errors.length > 0 && (
                  <div className="alert alert-danger mb-4">
                    {errors.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </div>
                )}

                <div className="text-center mb-4">
                  <h4 className="text-dark fw-bold mb-4">{currentQuestion.question}</h4>
                  
                  {!showDetailsInput && (() => {
                    const sectionKey = getSectionDataKey(currentSection);
                    if (!sectionKey) return null;
                    
                    return (
                      <div className="d-flex justify-content-center gap-4 mb-4">
                        <button
                          type="button"
                          className={`btn btn-lg px-5 py-3 ${
                            data[sectionKey][currentQuestion.key] === 'yes'
                              ? 'btn-success' 
                              : 'btn-outline-success'
                          }`}
                          onClick={() => handleYesNoAnswer('yes')}
                          autoFocus
                        >
                          <i className="fas fa-check me-2"></i>
                          Yes
                        </button>
                        <button
                          type="button"
                          className={`btn btn-lg px-5 py-3 ${
                            data[sectionKey][currentQuestion.key] === 'no'
                              ? 'btn-danger' 
                              : 'btn-outline-danger'
                          }`}
                          onClick={() => handleYesNoAnswer('no')}
                        >
                          <i className="fas fa-times me-2"></i>
                          No
                        </button>
                      </div>
                    );
                  })()}
                  
                  {showDetailsInput && currentQuestion.hasDetails && (() => {
                    const sectionKey = getSectionDataKey(currentSection);
                    if (!sectionKey) return null;
                    
                    return (
                      <div className="mt-4">
                        <label className="form-label fw-bold">{currentQuestion.detailsQuestion}</label>
                        {currentQuestion.detailsType === 'date' ? (
                          <input
                            type="date"
                            className="form-control form-control-lg"
                            value={data[sectionKey][currentQuestion.detailsKey!] || ''}
                            onChange={(e) => handleDetailsInput(e.target.value)}
                            autoFocus
                          />
                        ) : (
                          <textarea
                            className="form-control form-control-lg"
                            rows={3}
                            value={data[sectionKey][currentQuestion.detailsKey!] || ''}
                            onChange={(e) => handleDetailsInput(e.target.value)}
                            placeholder="Please provide details..."
                            autoFocus
                          />
                        )}
                        <button
                          type="button"
                          className="btn btn-primary mt-3"
                          onClick={handleNext}
                        >
                          Continue
                          <i className="fas fa-arrow-right ms-2"></i>
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="card-footer bg-light d-flex justify-content-between py-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={handlePrevious}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Previous
                </button>
                <button
                  type="button"
                  className="btn btn-primary px-4"
                  onClick={handleNext}
                  disabled={showDetailsInput}
                >
                  Next
                  <i className="fas fa-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Service-Specific Intro section (Brows, Eyeliner, or Lips Pre-Procedure)
  if (currentSection === 'service-specific-intro') {
    const serviceName = selectedService?.name?.toLowerCase() || '';
    const isEyelinerService = serviceName.includes('eyeliner') || serviceName.includes('eye liner');
    const isLipService = serviceName.includes('lip');
    
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-lg border-0">
              <div className="card-header text-white text-center py-4" style={{ backgroundColor: '#AD6269' }}>
                <h2 className="h3 mb-0">
                  {isEyelinerService ? 'PMU EYELINER PRE-PROCEDURE' : isLipService ? 'PMU LIPS PRE-PROCEDURE' : 'PMU BROWS PRE-PROCEDURE'}
                </h2>
                <p className="mb-0 opacity-75">{isLipService ? 'Preparation for Your Appointment' : 'What To Expect On The Day of Procedure'}</p>
              </div>
              
              <div className="card-body p-5">
                <div className="alert alert-info mb-4">
                  <h5 className="fw-bold mb-3">
                    <i className="fas fa-heart me-2"></i>
                    Thank You For Choosing Us!
                  </h5>
                  <p className="mb-0">
                    {isEyelinerService 
                      ? "Thank you for choosing me for your eyeliner enhancement! Here's what you can expect and how to prepare for your session."
                      : isLipService
                      ? "Thank you for choosing me for your lip blush enhancement! Here's what you can expect and how to prepare for your session."
                      : "Thank you for choosing me for your brow enhancement! Here's what you can expect and how to best prepare for your session."}
                  </p>
                </div>

                {(isEyelinerService || isLipService) && (
                  <div className="alert alert-warning mb-4">
                    <h6 className="fw-bold mb-2">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Arrive Makeup-Free
                    </h6>
                    <p className="mb-0">
                      <strong>{isEyelinerService ? 'Eye Makeup:' : 'Lip Makeup:'}</strong> Please come to your appointment without any {isEyelinerService ? 'eye makeup or cosmetics, including lash extensions' : 'lip makeup or cosmetics'}. This {isEyelinerService ? 'allows for a thorough assessment and ensures' : 'ensures'} the best results{isLipService ? ' and allows me to assess your natural lip color and condition' : ''}.
                    </p>
                  </div>
                )}

                <h4 className="fw-bold mb-4 text-primary">What to Expect During Your Appointment:</h4>

                {/* Consultation */}
                <div className="mb-4">
                  <h5 className="fw-bold text-dark mb-2">
                    <i className="fas fa-comments me-2 text-primary"></i>
                    Consultation
                  </h5>
                  <p className="text-muted ps-4">
                    {isEyelinerService
                      ? "We'll begin with a consultation where we'll discuss your desired eyeliner shape and thickness. I'll examine your skin type and any allergies or medical conditions to ensure a safe and tailored experience."
                      : isLipService
                      ? "Before we start, we'll have a consultation where we'll discuss your ideal lip shape, color, and any questions you may have. I'll examine your skin tone, texture, and overall lip health to choose the best pigment and technique for your lips."
                      : "We'll start with a detailed consultation to discuss your desired brow shape, color, and overall look. I'll also examine your skin type and review any allergies or medical conditions to ensure your comfort and safety throughout the procedure."}
                  </p>
                </div>

                {/* Numbing */}
                <div className="mb-4">
                  <h5 className="fw-bold text-dark mb-2">
                    <i className="fas fa-hand-holding-medical me-2 text-primary"></i>
                    Numbing
                  </h5>
                  <p className="text-muted ps-4">
                    {isEyelinerService
                      ? "A thick layer of topical numbing cream will be applied to your eyelids to minimize discomfort. The cream will take about 20-30 minutes to fully take effect."
                      : isLipService
                      ? "To keep you comfortable, I'll apply a thick layer of numbing cream to your lips. It will take about 20-30 minutes for the cream to take full effect, helping to reduce any discomfort during the procedure."
                      : "To keep you comfortable, I'll apply a topical numbing cream to the brow area before beginning. This helps minimize any discomfort during the tattooing process."}
                  </p>
                </div>

                {/* Mapping or Pigment Selection */}
                {!isLipService && (
                  <div className="mb-4">
                    <h5 className="fw-bold text-dark mb-2">
                      <i className="fas fa-ruler-combined me-2 text-primary"></i>
                      Mapping
                    </h5>
                    <p className="text-muted ps-4">
                      {isEyelinerService
                        ? "After the anesthetic is carefully removed, I'll pre-draw a map of your new eyeliner shape using an oil-based crayon. This outline will guide us in applying the micro-pigmentation accurately along your lash line."
                        : "To create your ideal brow shape, I'll start by mapping the brow area using a series of carefully placed lines that align with your facial proportions. This customized mapping, done with an oil-based crayon, outlines the shape within which hairlike strokes, shading, or a combination of both will be micro-pigmented to suit your natural brow structure."}
                    </p>
                  </div>
                )}

                {(!isEyelinerService && !isLipService) && (
                  <div className="mb-4">
                    <h5 className="fw-bold text-dark mb-2">
                      <i className="fas fa-palette me-2 text-primary"></i>
                      Pigment Selection
                    </h5>
                    <p className="text-muted ps-4">
                      Together, we&apos;ll select a pigment color that best complements your natural hair color and skin tone, ensuring a beautiful and harmonious result.
                    </p>
                  </div>
                )}

                {/* Pigment Selection for Lips */}
                {isLipService && (
                  <div className="mb-4">
                    <h5 className="fw-bold text-dark mb-2">
                      <i className="fas fa-palette me-2 text-primary"></i>
                      Pigment Selection
                    </h5>
                    <p className="text-muted ps-4">
                      Together, we&apos;ll select a pigment color that best complements your natural lip color and skin tone, ensuring a beautiful and harmonious result.
                    </p>
                  </div>
                )}

                {/* Pigment Application */}
                <div className="mb-4">
                  <h5 className="fw-bold text-dark mb-2">
                    <i className="fas fa-paint-brush me-2 text-primary"></i>
                    Pigment Application
                  </h5>
                  <p className="text-muted ps-4">
                    {isEyelinerService
                      ? "Using a handheld device with a small needle, I'll apply pigment to the skin along your lash line, creating a natural-looking eyeliner that enhances your eyes."
                      : isLipService
                      ? "Using a handheld tool with a sterile needle, I'll apply the pigment to your lips with the shape and color tailored just for you."
                      : "Using a handheld tool with a small needle, I'll apply pigment with precise, hair-like strokes to create a natural-looking brow shape tailored just for you."}
                  </p>
                </div>

                {/* Procedure Duration */}
                <div className="mb-4">
                  <h5 className="fw-bold text-dark mb-2">
                    <i className="fas fa-clock me-2 text-primary"></i>
                    Procedure Duration
                  </h5>
                  <p className="text-muted ps-4">
                    The procedure typically takes <strong>2-3 hours</strong>, depending on {isEyelinerService ? 'the complexity of the eyeliner shape and the amount of pigment needed' : isLipService ? 'the size of your lips and your desired results' : 'the complexity of your desired brow shape and the amount of pigment required'}.
                  </p>
                </div>

                {/* Eyeliner-specific Important Note */}
                {isEyelinerService && (
                  <div className="alert alert-danger mb-4">
                    <h5 className="fw-bold mb-3">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      Important Note
                    </h5>
                    <p className="mb-3">
                      Although it&apos;s uncommon, the topical lidocaine used during the procedure can cause temporary pupil dilation, particularly in clients with lighter-colored eyes. This may result in <strong>blurry vision for a few hours post-procedure</strong>.
                    </p>
                    <p className="mb-3">
                      <strong>For this reason, please arrange for someone to drive you home.</strong> You&apos;ll be required to sign and initial that you have a backup ride from the spa before the lidocaine is applied.
                    </p>
                    <div className="form-check mb-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="transportationConfirm"
                        checked={serviceConsent.understoodInformation}
                        onChange={(e) => setServiceConsent({...serviceConsent, understoodInformation: e.target.checked})}
                      />
                      <label className="form-check-label fw-bold" htmlFor="transportationConfirm">
                        I confirm that I have arranged for transportation home after the procedure
                      </label>
                    </div>
                  </div>
                )}

                {/* Aftercare & Healing */}
                <div className="mb-4">
                  <h5 className="fw-bold text-dark mb-2">
                    <i className="fas fa-first-aid me-2 text-primary"></i>
                    Aftercare & Healing
                  </h5>
                  <p className="text-muted ps-4">
                    Proper aftercare is essential to achieving the best results. After the procedure, I&apos;ll provide detailed aftercare instructions to support healing and ensure long-lasting, beautiful {isEyelinerService ? 'eyeliner' : isLipService ? 'lips' : 'brows'}.
                  </p>
                </div>

                {/* Consent Section for Eyeliner or Lips */}
                {(isEyelinerService || isLipService) && (
                  <div className="border-top pt-4 mt-4">
                    <h5 className="fw-bold mb-3">Consent Confirmation</h5>
                    <p className="text-muted mb-3">
                      By signing below, you confirm that you fully understand the information provided above and have had the opportunity to discuss any questions or concerns. You consent to proceed with the {isEyelinerService ? 'eyeliner' : 'lip blush'} enhancement procedure.
                    </p>
                    
                    <div className="mb-3">
                      <label className="form-label fw-bold">Electronic Signature *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Type your full name"
                        value={serviceConsent.signature}
                        onChange={(e) => setServiceConsent({
                          ...serviceConsent,
                          signature: e.target.value,
                          signedAt: new Date().toISOString()
                        })}
                        style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '1.5rem' }}
                      />
                      <small className="text-muted">
                        By typing your name, you are providing your electronic signature
                      </small>
                    </div>

                    {serviceConsent.signature && (
                      <div className="alert alert-info">
                        <small>
                          <i className="fas fa-clock me-2"></i>
                          Signed on: {new Date(serviceConsent.signedAt || new Date()).toLocaleString()}
                        </small>
                      </div>
                    )}
                  </div>
                )}

                {!isEyelinerService && !isLipService && (
                  <div className="alert alert-success mt-4">
                    <h6 className="fw-bold mb-2">
                      <i className="fas fa-check-circle me-2"></i>
                      Ready to Continue?
                    </h6>
                    <p className="mb-0 small">
                      Once you&apos;ve reviewed this information, click continue to proceed with the informed consent form.
                    </p>
                  </div>
                )}
              </div>

              <div className="card-footer bg-light d-flex justify-content-between py-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={handlePrevious}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Previous
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-lg px-5"
                  onClick={() => {
                    // Validate eyeliner or lip consent if applicable
                    if (isEyelinerService || isLipService) {
                      if (isEyelinerService && !serviceConsent.understoodInformation) {
                        alert('Please confirm that you have arranged for transportation home.');
                        return;
                      }
                      if (!serviceConsent.signature.trim()) {
                        alert('Please provide your electronic signature.');
                        return;
                      }
                      // Save consent to data
                      onChange({
                        ...data,
                        serviceSpecificConsent: {
                          ...serviceConsent,
                          consentGiven: true
                        }
                      });
                    }
                    moveToNextSection();
                  }}
                  disabled={(isEyelinerService && (!serviceConsent.understoodInformation || !serviceConsent.signature.trim())) || (isLipService && !serviceConsent.signature.trim())}
                >
                  {isLipService ? 'Continue to Aftercare' : 'Continue to Consent Form'}
                  <i className="fas fa-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Service-Specific Aftercare section (Lips Aftercare)
  if (currentSection === 'service-specific-aftercare') {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card shadow-lg border-0">
              <div className="card-header text-white text-center py-4" style={{ backgroundColor: '#AD6269' }}>
                <h2 className="h3 mb-0">PMU LIPS AFTERCARE</h2>
                <p className="mb-0 opacity-75">Essential Instructions for Beautiful, Long-Lasting Results</p>
              </div>
              
              <div className="card-body p-5">
                <div className="alert alert-success mb-4">
                  <h5 className="fw-bold mb-3">
                    <i className="fas fa-check-circle me-2"></i>
                    Congratulations on Your New Lip Blush!
                  </h5>
                  <p className="mb-0">
                    By following these instructions, you&apos;ll ensure that your lips heal beautifully and retain their color for lasting results.
                  </p>
                </div>

                {/* Day 1 */}
                <div className="mb-4">
                  <h4 className="fw-bold text-primary mb-3">
                    <i className="fas fa-calendar-day me-2"></i>
                    Day 1: Immediately After the Procedure
                  </h4>
                  
                  <div className="ps-4">
                    <h6 className="fw-bold text-dark mb-2">Cleansing:</h6>
                    <p className="text-muted mb-3">
                      Gently cleanse your lips with a mild, fragrance-free cleanser and water. Pat dry with a clean towel.
                    </p>
                    
                    <h6 className="fw-bold text-dark mb-2">Aftercare Ointment:</h6>
                    <p className="text-muted mb-3">
                      Apply a thin layer of the aftercare ointment provided by your artist to keep your lips moisturized and protected.
                    </p>
                  </div>
                </div>

                {/* Days 2-14 */}
                <div className="mb-4">
                  <h4 className="fw-bold text-primary mb-3">
                    <i className="fas fa-calendar-alt me-2"></i>
                    Days 2-14: Ongoing Care
                  </h4>
                  
                  <div className="ps-4">
                    <h6 className="fw-bold text-dark mb-2">Ointment Application:</h6>
                    <p className="text-muted mb-3">
                      With a clean cotton swab, apply a small amount of aftercare ointment to your lips twice a day.
                    </p>
                    
                    <h6 className="fw-bold text-dark mb-2">Do Not Touch:</h6>
                    <p className="text-muted mb-3">
                      Refrain from picking, scratching, or rubbing your lips to prevent scarring or pigment loss.
                    </p>
                  </div>
                </div>

                {/* Additional Care Guidelines */}
                <div className="mb-4">
                  <h4 className="fw-bold text-primary mb-3">
                    <i className="fas fa-clipboard-list me-2"></i>
                    Additional Care Guidelines
                  </h4>
                  
                  <div className="ps-4">
                    <h6 className="fw-bold text-dark mb-2">
                      <i className="fas fa-tint me-2 text-info"></i>
                      Moisture Control:
                    </h6>
                    <ul className="text-muted mb-3">
                      <li>Avoid getting the treated area wet for the first 24 hours after your procedure</li>
                      <li>Avoid swimming, saunas, and hot tubs for at least two weeks</li>
                    </ul>
                    
                    <h6 className="fw-bold text-dark mb-2">
                      <i className="fas fa-sun me-2 text-warning"></i>
                      Sun Protection:
                    </h6>
                    <p className="text-muted mb-3">
                      Protect your lips from direct sunlight to prevent fading. Consider wearing a hat or using sunscreen on surrounding areas.
                    </p>
                    
                    <h6 className="fw-bold text-dark mb-2">
                      <i className="fas fa-makeup me-2 text-danger"></i>
                      Makeup & Skincare:
                    </h6>
                    <p className="text-muted mb-3">
                      Don&apos;t apply any makeup or skincare products on or near the treated area for one week. When you resume, be gentle to avoid disrupting healing.
                    </p>
                    
                    <h6 className="fw-bold text-dark mb-2">
                      <i className="fas fa-mug-hot me-2 text-brown"></i>
                      Hot Liquids:
                    </h6>
                    <ul className="text-muted mb-3">
                      <li>Avoid drinking hot liquids like coffee or tea for the first 24 hours</li>
                      <li>Drink through a straw for the first few days to reduce moisture on your lips</li>
                    </ul>
                  </div>
                </div>

                {/* Managing Side Effects */}
                <div className="mb-4">
                  <h4 className="fw-bold text-primary mb-3">
                    <i className="fas fa-heartbeat me-2"></i>
                    Managing Side Effects
                  </h4>
                  
                  <div className="ps-4">
                    <h6 className="fw-bold text-dark mb-2">Comfort Care:</h6>
                    <p className="text-muted mb-3">
                      It&apos;s normal to experience slight itching, redness, or swelling. If needed, apply a cool compress for relief, but avoid direct contact with ice. Do not scratch or pick at any flakiness to prevent complications.
                    </p>
                  </div>
                </div>

                {/* Healing Expectations */}
                <div className="mb-4">
                  <h4 className="fw-bold text-primary mb-3">
                    <i className="fas fa-hourglass-half me-2"></i>
                    Healing Expectations
                  </h4>
                  
                  <div className="ps-4">
                    <h6 className="fw-bold text-dark mb-2">Normal Changes:</h6>
                    <p className="text-muted mb-3">
                      During healing, your lips may appear dry, flaky, or lightly scabbed. This is normal—avoid picking at any dry areas to preserve the pigment.
                    </p>
                    
                    <h6 className="fw-bold text-dark mb-2">Patience with Results:</h6>
                    <p className="text-muted mb-3">
                      Final color results may not appear for several weeks, as lip blush typically softens and lightens as it heals.
                    </p>
                  </div>
                </div>

                <div className="alert alert-info mb-4">
                  <h6 className="fw-bold mb-2">
                    <i className="fas fa-phone me-2"></i>
                    Questions or Concerns?
                  </h6>
                  <p className="mb-0">
                    If you have any questions or concerns about your aftercare, please contact your artist. Follow-up appointments may be necessary to ensure that your permanent makeup heals properly.
                  </p>
                </div>

                {/* Consent Section */}
                <div className="border-top pt-4 mt-4">
                  <h5 className="fw-bold mb-3">Aftercare Acknowledgment</h5>
                  <p className="text-muted mb-3">
                    By signing below, I certify that I have read and fully understand the above paragraphs, that I have had sufficient opportunity for discussion and to ask questions, and that I hereby consent to the information described above.
                  </p>
                  
                  <div className="mb-3">
                    <label className="form-label fw-bold">Electronic Signature *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type your full name"
                      value={aftercareConsent.signature}
                      onChange={(e) => setAftercareConsent({
                        ...aftercareConsent,
                        signature: e.target.value,
                        signedAt: new Date().toISOString(),
                        understoodInstructions: true
                      })}
                      style={{ fontFamily: 'Brush Script MT, cursive', fontSize: '1.5rem' }}
                    />
                    <small className="text-muted">
                      By typing your name, you are providing your electronic signature
                    </small>
                  </div>

                  {aftercareConsent.signature && (
                    <div className="alert alert-info">
                      <small>
                        <i className="fas fa-clock me-2"></i>
                        Signed on: {new Date(aftercareConsent.signedAt || new Date()).toLocaleString()}
                      </small>
                    </div>
                  )}
                </div>

                <div className="alert alert-warning mt-4">
                  <h6 className="fw-bold mb-2">
                    <i className="fas fa-star me-2"></i>
                    Final Reminder
                  </h6>
                  <p className="mb-0 small">
                    By following these instructions carefully, you&apos;ll achieve the best possible results for your new lip blush.
                  </p>
                </div>
              </div>

              <div className="card-footer bg-light d-flex justify-content-between py-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={handlePrevious}
                >
                  <i className="fas fa-arrow-left me-2"></i>
                  Previous
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-lg px-5"
                  onClick={() => {
                    if (!aftercareConsent.signature.trim()) {
                      alert('Please provide your electronic signature to acknowledge the aftercare instructions.');
                      return;
                    }
                    // Save aftercare consent to data
                    onChange({
                      ...data,
                      aftercareConsent: {
                        ...aftercareConsent,
                        consentGiven: true
                      }
                    });
                    moveToNextSection();
                  }}
                  disabled={!aftercareConsent.signature.trim()}
                >
                  Continue to Consent Form
                  <i className="fas fa-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Informed Consent section
  if (currentSection === 'informed-consent') {
    const InformedConsentForm = require('./InformedConsentForm').default;
    return (
      <InformedConsentForm
        data={data.informedConsent}
        onChange={(consentData: InformedConsent) => onChange({ ...data, informedConsent: consentData })}
        onNext={moveToNextSection}
        onBack={handlePrevious}
        personalInfo={personalInfo}
        serviceName={selectedService?.name || 'Permanent Makeup Procedure'}
      />
    );
  }

  // Photo/Video Release section
  if (currentSection === 'photo-video-release') {
    const PhotoVideoReleaseForm = require('./PhotoVideoReleaseForm').default;
    return (
      <PhotoVideoReleaseForm
        data={data.photoVideoRelease}
        onChange={(releaseData: PhotoVideoRelease) => onChange({ ...data, photoVideoRelease: releaseData })}
        onNext={onNext}
        onBack={handlePrevious}
        personalInfo={personalInfo}
      />
    );
  }

  return null;
}
