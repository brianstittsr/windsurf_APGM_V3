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

export interface ComprehensiveHealthFormData {
  personalInfo: PersonalInfo;
  emergencyContact: EmergencyContact;
  medicalHistory: MedicalHistory;
  allergies: Allergies;
  additionalHealth: AdditionalHealth;
  serviceSpecificQuestions: { [key: string]: string };
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
      case 'informed-consent':
        setCurrentSection('additional-health');
        setCurrentQuestionIndex(additionalHealthQuestions.length - 1);
        break;
      case 'photo-video-release':
        setCurrentSection('informed-consent');
        break;
    }
  };

  const getProgress = () => {
    const totalSections = 6;
    const sectionOrder: FormSection[] = [
      'medical-intro',
      'medical-history',
      'allergies',
      'additional-health',
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
