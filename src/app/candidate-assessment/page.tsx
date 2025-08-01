'use client';

import { useState } from 'react';
import Image from 'next/image';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

interface FormData {
  basic_health: string[];
  medical_treatments: string[];
  diabetes: string;
  medical_history: string[];
  recent_treatments: string[];
  brow_irritation: string;
  skin_type: string;
  pore_texture: string;
  previous_work: string;
}

export default function CandidacyAssessment() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    basic_health: [],
    medical_treatments: [],
    diabetes: '',
    medical_history: [],
    recent_treatments: [],
    brow_irritation: '',
    skin_type: '',
    pore_texture: '',
    previous_work: ''
  });
  const [showPreviousWorkNote, setShowPreviousWorkNote] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const totalSteps = 6;

  const updateProgress = () => {
    if (currentStep > totalSteps) {
      return 100;
    }
    return (currentStep / totalSteps) * 100;
  };

  const handleCheckboxChange = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const currentValues = prev[field] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  const handleRadioChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation errors when user makes a selection
    setValidationErrors([]);
    
    if (field === 'previous_work') {
      setShowPreviousWorkNote(value === 'yes');
    }
  };

  const validateCurrentStep = () => {
    const errors: string[] = [];
    
    // Step 2: Diabetes question is required
    if (currentStep === 2 && !formData.diabetes) {
      errors.push('Please answer the diabetes question');
    }
    
    // Step 4: Brow irritation question is required
    if (currentStep === 4 && !formData.brow_irritation) {
      errors.push('Please answer if you have any brow area irritation');
    }
    
    // Step 5: Both skin type questions are required
    if (currentStep === 5) {
      if (!formData.skin_type) {
        errors.push('Please select your skin type');
      }
      if (!formData.pore_texture) {
        errors.push('Please answer about pore texture in your brow area');
      }
    }
    
    // Step 6: Previous work question is required
    if (currentStep === 6 && !formData.previous_work) {
      errors.push('Please answer about previous permanent makeup');
    }
    
    return errors;
  };

  const nextStep = () => {
    const errors = validateCurrentStep();
    setValidationErrors(errors);
    
    if (errors.length === 0 && currentStep <= totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setValidationErrors([]);
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateResults = () => {
    const absoluteContraindications = [
      ...formData.basic_health,
      ...formData.medical_treatments.filter(t => t === 'chemotherapy' || t === 'accutane'),
      ...(formData.diabetes === 'yes' ? ['diabetes'] : []),
      ...(formData.brow_irritation === 'yes' ? ['irritation'] : [])
    ];

    const medicalHistory = formData.medical_history;
    const recentTreatments = formData.recent_treatments;
    const skinType = formData.skin_type;
    const poreTexture = formData.pore_texture;

    if (absoluteContraindications.length > 0) {
      return {
        type: 'not-suitable',
        title: 'Not Currently Suitable',
        message: 'Based on your responses, eyebrow enhancement services are not recommended at this time due to safety concerns.',
        reasons: absoluteContraindications.map(condition => {
          const conditionMap: { [key: string]: string } = {
            'under_18': 'Under 18 years old',
            'pregnant': 'Currently pregnant',
            'breastfeeding': 'Currently breastfeeding',
            'poor_health': 'General poor health or slow healing',
            'chemotherapy': 'Currently undergoing chemotherapy',
            'accutane': 'Currently using Accutane',
            'blood_thinners': 'Taking blood thinning medications',
            'diabetes': 'Uncontrolled diabetes',
            'irritation': 'Current brow area irritation'
          };
          return conditionMap[condition] || condition;
        })
      };
    } else if (medicalHistory.length > 0) {
      return {
        type: 'caution',
        title: "Doctor's Clearance Required",
        message: "You may be a candidate for eyebrow enhancement, but you'll need to get clearance from your doctor first.",
        reasons: medicalHistory.map(condition => {
          const conditionMap: { [key: string]: string } = {
            'keloids': 'History of keloids or hypertrophic scarring',
            'chemo_past_year': 'Chemotherapy in the past year',
            'viral_infections': 'Viral infections, diseases or medical concerns'
          };
          return conditionMap[condition] || condition;
        })
      };
    } else {
      const warnings = recentTreatments.length > 0 
        ? ["You'll need to wait for recent treatments to settle before your appointment."] 
        : [];

      let techniqueRecommendation = '';
      if (skinType === 'oily' || poreTexture === 'yes') {
        techniqueRecommendation = 'Based on your skin type, shaded brow techniques (Combo or Ombré) may be more suitable than microblading for better pigment retention and crisp results.';
      } else if (skinType === 'dry' || skinType === 'normal') {
        techniqueRecommendation = 'Your skin type is ideal for microblading! You\'re also a great candidate for shaded brow techniques if you prefer that look.';
      }

      return {
        type: 'good',
        title: 'Great Candidate!',
        message: 'Based on your responses, you appear to be a good candidate for eyebrow enhancement services.',
        warnings,
        techniqueRecommendation
      };
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="step">
            <h2 className="text-center mb-4 text-primary">Basic Information</h2>
            <p className="text-center text-muted mb-4">Let's start with some basic information about your current situation.</p>
            
            <div className="mb-4">
              <h5 className="mb-3">Please check any that apply to you:</h5>
              {[
                { value: 'under_18', label: 'I am under 18 years old' },
                { value: 'pregnant', label: 'I am currently pregnant' },
                { value: 'breastfeeding', label: 'I am currently breastfeeding' },
                { value: 'poor_health', label: 'I have general poor health or slow healing' }
              ].map((option) => (
                <div key={option.value} className={`card p-3 mb-2 border ${formData.basic_health.includes(option.value) ? 'border-primary bg-light' : 'border-light'}`} style={{cursor: 'pointer'}}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={option.value}
                      checked={formData.basic_health.includes(option.value)}
                      onChange={() => handleCheckboxChange('basic_health', option.value)}
                    />
                    <label className="form-check-label" htmlFor={option.value} style={{cursor: 'pointer'}}>
                      {option.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="step">
            <h2 className="text-center mb-4 text-primary">Current Medical Treatments</h2>
            <p className="text-center text-muted mb-4">Information about current medications and treatments is important for your safety.</p>
            
            <div className="mb-4">
              <h5 className="mb-3">Are you currently:</h5>
              {[
                { value: 'chemotherapy', label: 'Undergoing chemotherapy' },
                { value: 'accutane', label: 'Using Accutane (isotretinoin)' },
                { value: 'blood_thinners', label: 'Taking blood thinning medications' }
              ].map((option) => (
                <div key={option.value} className={`card p-3 mb-2 border ${formData.medical_treatments.includes(option.value) ? 'border-primary bg-light' : 'border-light'}`} style={{cursor: 'pointer'}}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={option.value}
                      checked={formData.medical_treatments.includes(option.value)}
                      onChange={() => handleCheckboxChange('medical_treatments', option.value)}
                    />
                    <label className="form-check-label" htmlFor={option.value} style={{cursor: 'pointer'}}>
                      {option.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <h5 className="mb-3">Do you have uncontrolled diabetes? <span className="text-danger">*</span></h5>
              {[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' }
              ].map((option) => (
                <div key={option.value} className={`card p-3 mb-2 border ${formData.diabetes === option.value ? 'border-primary bg-light' : 'border-light'}`} style={{cursor: 'pointer'}}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="diabetes"
                      id={`diabetes_${option.value}`}
                      value={option.value}
                      checked={formData.diabetes === option.value}
                      onChange={() => handleRadioChange('diabetes', option.value)}
                    />
                    <label className="form-check-label" htmlFor={`diabetes_${option.value}`} style={{cursor: 'pointer'}}>
                      {option.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="step">
            <h2 className="text-center mb-4 text-primary">Medical History</h2>
            <p className="text-center text-muted mb-4">These conditions may require doctor's clearance before treatment.</p>
            
            <div className="mb-4">
              <h5 className="mb-3">Please check any that apply to you:</h5>
              {[
                { value: 'keloids', label: 'History of keloids or hypertrophic scarring' },
                { value: 'chemo_past_year', label: 'Chemotherapy in the past year' },
                { value: 'viral_infections', label: 'Any viral infections, diseases or medical concerns' }
              ].map((option) => (
                <div key={option.value} className={`card p-3 mb-2 border ${formData.medical_history.includes(option.value) ? 'border-primary bg-light' : 'border-light'}`} style={{cursor: 'pointer'}}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={option.value}
                      checked={formData.medical_history.includes(option.value)}
                      onChange={() => handleCheckboxChange('medical_history', option.value)}
                    />
                    <label className="form-check-label" htmlFor={option.value} style={{cursor: 'pointer'}}>
                      {option.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="alert alert-warning">
              <strong>Note:</strong> If any of the above apply to you, you will need to get doctor's clearance before your appointment.
            </div>
          </div>
        );

      case 4:
        return (
          <div className="step">
            <h2 className="text-center mb-4 text-primary">Recent Beauty Treatments</h2>
            <p className="text-center text-muted mb-4">Recent treatments can affect the outcome of your eyebrow enhancement.</p>
            
            <div className="mb-4">
              <h5 className="mb-3">In the past month, have you had:</h5>
              {[
                { value: 'botox_fillers', label: 'Botox or fillers' },
                { value: 'chemical_peels', label: 'Strong chemical peels' },
                { value: 'retinol', label: 'Used facial products containing retinol' },
                { value: 'waxing', label: 'Waxed your eyebrows' }
              ].map((option) => (
                <div key={option.value} className={`card p-3 mb-2 border ${formData.recent_treatments.includes(option.value) ? 'border-primary bg-light' : 'border-light'}`} style={{cursor: 'pointer'}}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={option.value}
                      checked={formData.recent_treatments.includes(option.value)}
                      onChange={() => handleCheckboxChange('recent_treatments', option.value)}
                    />
                    <label className="form-check-label" htmlFor={option.value} style={{cursor: 'pointer'}}>
                      {option.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <h5 className="mb-3">Do you currently have any irritation, bumps, or sunburn on your brow area? <span className="text-danger">*</span></h5>
              {[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' }
              ].map((option) => (
                <div key={option.value} className={`card p-3 mb-2 border ${formData.brow_irritation === option.value ? 'border-primary bg-light' : 'border-light'}`} style={{cursor: 'pointer'}}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="brow_irritation"
                      id={`brow_irritation_${option.value}`}
                      value={option.value}
                      checked={formData.brow_irritation === option.value}
                      onChange={() => handleRadioChange('brow_irritation', option.value)}
                    />
                    <label className="form-check-label" htmlFor={`brow_irritation_${option.value}`} style={{cursor: 'pointer'}}>
                      {option.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="step">
            <h2 className="text-center mb-4 text-primary">Skin Type Assessment</h2>
            <p className="text-center text-muted mb-4">Your skin type helps us determine the best technique for you.</p>
            
            <div className="mb-4">
              <h5 className="mb-3">How would you describe your skin type? <span className="text-danger">*</span></h5>
              {[
                { value: 'dry', label: 'Dry skin' },
                { value: 'normal', label: 'Normal skin' },
                { value: 'oily', label: 'Oily skin' },
                { value: 'combination', label: 'Combination skin' }
              ].map((option) => (
                <div key={option.value} className={`card p-3 mb-2 border ${formData.skin_type === option.value ? 'border-primary bg-light' : 'border-light'}`} style={{cursor: 'pointer'}}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="skin_type"
                      id={`skin_type_${option.value}`}
                      value={option.value}
                      checked={formData.skin_type === option.value}
                      onChange={() => handleRadioChange('skin_type', option.value)}
                    />
                    <label className="form-check-label" htmlFor={`skin_type_${option.value}`} style={{cursor: 'pointer'}}>
                      {option.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <h5 className="mb-3">Do you have large pores or textured skin in your brow area? <span className="text-danger">*</span></h5>
              {[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' }
              ].map((option) => (
                <div key={option.value} className={`card p-3 mb-2 border ${formData.pore_texture === option.value ? 'border-primary bg-light' : 'border-light'}`} style={{cursor: 'pointer'}}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="pore_texture"
                      id={`pore_texture_${option.value}`}
                      value={option.value}
                      checked={formData.pore_texture === option.value}
                      onChange={() => handleRadioChange('pore_texture', option.value)}
                    />
                    <label className="form-check-label" htmlFor={`pore_texture_${option.value}`} style={{cursor: 'pointer'}}>
                      {option.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="alert alert-info">
              <strong>Good to know:</strong> Microblading works best on dry to normal skin, while shaded brow techniques work well on all skin types.
            </div>
          </div>
        );

      case 6:
        return (
          <div className="step">
            <h2 className="text-center mb-4 text-primary">Previous Permanent Makeup</h2>
            <p className="text-center text-muted mb-4">Information about any previous eyebrow work is important for planning your treatment.</p>
            
            <div className="mb-4">
              <h5 className="mb-3">Have you had any previous permanent makeup on your eyebrows? <span className="text-danger">*</span></h5>
              {[
                { value: 'yes', label: 'Yes, I have had previous permanent makeup' },
                { value: 'no', label: 'No, this would be my first time' }
              ].map((option) => (
                <div key={option.value} className={`card p-3 mb-2 border ${formData.previous_work === option.value ? 'border-primary bg-light' : 'border-light'}`} style={{cursor: 'pointer'}}>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="previous_work"
                      id={`previous_work_${option.value}`}
                      value={option.value}
                      checked={formData.previous_work === option.value}
                      onChange={() => handleRadioChange('previous_work', option.value)}
                    />
                    <label className="form-check-label" htmlFor={`previous_work_${option.value}`} style={{cursor: 'pointer'}}>
                      {option.label}
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {showPreviousWorkNote && (
              <div className="alert alert-warning">
                <strong>Important:</strong> Please email a clear photo of your current eyebrows to <strong>victoria@aprettygirlmatter.com</strong> before your consultation.
              </div>
            )}
          </div>
        );

      case 7:
        const results = calculateResults();
        return (
          <div className="step">
            <h2 className="text-center mb-4 text-primary">Assessment Results</h2>
            
            <div className={`alert p-4 mb-4 ${results.type === 'good' ? 'alert-success' : results.type === 'caution' ? 'alert-warning' : 'alert-danger'}`}>
              <h3 className="mb-3">{results.title}</h3>
              <p className="mb-3">{results.message}</p>
              
              {results.reasons && (
                <>
                  <p><strong>Reasons:</strong></p>
                  <ul className="mb-3">
                    {results.reasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </>
              )}
              
              {results.warnings && results.warnings.length > 0 && (
                <p><strong>Please note:</strong> {results.warnings.join(' ')}</p>
              )}
              
              {results.type === 'not-suitable' && (
                <p>Please wait until these conditions no longer apply before considering treatment.</p>
              )}
              
              {results.type === 'caution' && (
                <p>Once you have doctor's approval, we'd be happy to schedule your consultation!</p>
              )}
            </div>

            {results.techniqueRecommendation && (
              <div className="alert alert-info mb-4">
                <strong>Technique Recommendation:</strong> {results.techniqueRecommendation}
              </div>
            )}

            {results.type === 'good' && (
              <div className="mb-4">
                <p><strong>Next Steps:</strong></p>
                <ol>
                  <li>Schedule your consultation</li>
                  <li>Avoid the restricted activities before your appointment</li>
                  <li>Come prepared with questions about the process</li>
                  <li>Bring reference photos of your desired brow look</li>
                </ol>
              </div>
            )}

            <div className="card bg-light p-4 text-center">
              <h4>Ready to Book Your Consultation?</h4>
              <p>Contact us to schedule your appointment:</p>
              <p><strong>Email:</strong> victoria@aprettygirlmatter.com</p>
              <p><strong>Phone:</strong> (919) 441-0932</p>
            </div>

            <div className="mt-4 p-3 bg-light rounded">
              <small className="text-muted">
                <em>*While every effort is made to determine if you are a good candidate for microblading and permanent brows, results vary and no guarantee can be made about how your skin will respond to the treatment.</em>
              </small>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <main className="min-vh-100">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              {/* Header */}
              <div className="text-center mb-5">
                <Image
                  src="/APRG_Text_Logo.png"
                  alt="A Pretty Girl Matter"
                  width={200}
                  height={80}
                  className="mb-4"
                />
                <h1 className="text-primary mb-3">Candidacy Assessment</h1>
                <p className="text-muted">
                  Let's determine if eyebrow enhancement services are right for you. This quick assessment will help us provide the best recommendations for your needs.
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-5">
                <div className="progress mb-3" style={{height: '8px'}}>
                  <div
                    className="progress-bar bg-primary"
                    role="progressbar"
                    style={{ width: `${updateProgress()}%` }}
                    aria-valuenow={updateProgress()}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
                <div className="text-center">
                  <small className="fw-bold text-primary">
                    {currentStep > totalSteps ? 'Complete' : `Step ${currentStep} of ${totalSteps}`}
                  </small>
                </div>
              </div>

              {/* Form Card */}
              <div className="card shadow border-0 rounded-3 p-4 mb-4">
                {renderStep()}

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="alert alert-danger mt-4">
                    <strong>Please complete the following:</strong>
                    <ul className="mb-0 mt-2">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Navigation */}
                <div className="d-flex justify-content-between align-items-center mt-5">
                  <button
                    type="button"
                    className={`btn btn-outline-secondary ${currentStep === 1 ? 'd-none' : ''}`}
                    onClick={prevStep}
                  >
                    Previous
                  </button>
                  <div className="flex-grow-1"></div>
                  <button
                    type="button"
                    className={`btn btn-primary ${currentStep > totalSteps ? 'd-none' : ''}`}
                    onClick={nextStep}
                  >
                    {currentStep === totalSteps ? 'See Results' : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
