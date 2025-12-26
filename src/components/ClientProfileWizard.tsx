'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ArrowLeft, ArrowRight, User, Mail, Phone, MapPin, Calendar, Users } from 'lucide-react';

interface ClientProfileData {
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
  emergencyContactName: string;
  emergencyContactPhone: string;
}

interface ClientProfileWizardProps {
  data: ClientProfileData;
  onChange: (data: ClientProfileData) => void;
  onNext: () => void;
  onBack: () => void;
}

interface WizardStep {
  id: keyof ClientProfileData;
  title: string;
  question: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select';
  placeholder?: string;
  required: boolean;
  icon: React.ReactNode;
  defaultValue?: string;
  options?: { value: string; label: string }[];
  validation?: (value: string) => string | null;
}

export default function ClientProfileWizard({ data, onChange, onNext, onBack }: ClientProfileWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [isPrePopulated, setIsPrePopulated] = useState(false);

  useEffect(() => {
    const hasPrePopulatedData = Object.values(data).some(value => value && String(value).trim() !== '');
    setIsPrePopulated(hasPrePopulatedData);
  }, [data]);

  const steps: WizardStep[] = [
    {
      id: 'firstName',
      title: 'Personal Information',
      question: 'What is your first name?',
      type: 'text',
      placeholder: 'First Name',
      required: true,
      icon: <User className="w-5 h-5" />
    },
    {
      id: 'lastName',
      title: 'Personal Information',
      question: 'What is your last name?',
      type: 'text',
      placeholder: 'Last Name',
      required: true,
      icon: <User className="w-5 h-5" />
    },
    {
      id: 'email',
      title: 'Contact Information',
      question: 'What is your email address?',
      type: 'email',
      placeholder: 'your.email@example.com',
      required: true,
      icon: <Mail className="w-5 h-5" />,
      validation: (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          return 'Please enter a valid email address';
        }
        return null;
      }
    },
    {
      id: 'phone',
      title: 'Contact Information',
      question: 'What is your phone number?',
      type: 'tel',
      placeholder: '(555) 123-4567',
      required: true,
      icon: <Phone className="w-5 h-5" />,
      validation: (value: string) => {
        const digits = value.replace(/\D/g, '');
        if (value && digits.length !== 10) {
          return 'Please enter a valid 10-digit phone number';
        }
        return null;
      }
    },
    {
      id: 'address',
      title: 'Address Information',
      question: 'What is your street address?',
      type: 'text',
      placeholder: '123 Main Street',
      required: true,
      icon: <MapPin className="w-5 h-5" />
    },
    {
      id: 'city',
      title: 'Address Information',
      question: 'What city do you live in?',
      type: 'text',
      placeholder: 'City',
      required: true,
      icon: <MapPin className="w-5 h-5" />
    },
    {
      id: 'state',
      title: 'Address Information',
      question: 'What state do you live in?',
      type: 'text',
      placeholder: 'State',
      required: true,
      icon: <MapPin className="w-5 h-5" />
    },
    {
      id: 'zip',
      title: 'Address Information',
      question: 'What is your zip code?',
      type: 'text',
      placeholder: '12345',
      required: true,
      icon: <MapPin className="w-5 h-5" />,
      validation: (value: string) => {
        const zipRegex = /^\d{5}(-\d{4})?$/;
        if (value && !zipRegex.test(value)) {
          return 'Please enter a valid zip code';
        }
        return null;
      }
    },
    {
      id: 'birthDate',
      title: 'Personal Information',
      question: 'What is your date of birth?',
      type: 'date',
      placeholder: 'MM/DD/YYYY',
      required: true,
      icon: <Calendar className="w-5 h-5" />,
      validation: (value: string) => {
        if (!value) return null;
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) {
          return 'You must be at least 18 years old';
        }
        if (age > 120) {
          return 'Please enter a valid birth date';
        }
        return null;
      }
    },
    {
      id: 'emergencyContactName',
      title: 'Emergency Contact',
      question: 'Who should we contact in case of emergency?',
      type: 'text',
      placeholder: 'Emergency contact full name',
      required: true,
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 'emergencyContactPhone',
      title: 'Emergency Contact',
      question: 'What is their phone number?',
      type: 'tel',
      placeholder: '(555) 123-4567',
      required: true,
      icon: <Phone className="w-5 h-5" />,
      validation: (value: string) => {
        const digits = value.replace(/\D/g, '');
        if (value && digits.length !== 10) {
          return 'Please enter a valid 10-digit phone number';
        }
        return null;
      }
    }
  ];

  const currentStep = steps[currentStepIndex];

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleInputChange = (value: string) => {
    let formattedValue = value;
    
    if (currentStep.id === 'emergencyContactPhone' || currentStep.id === 'phone') {
      formattedValue = formatPhoneNumber(value);
    }
    
    if (currentStep.id === 'birthDate' && value) {
      const birthDate = new Date(value);
      const today = new Date();
      const calculatedAge = today.getFullYear() - birthDate.getFullYear() - 
        (today.getMonth() < birthDate.getMonth() || 
         (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
      
      onChange({ ...data, [currentStep.id]: formattedValue, age: calculatedAge });
      setErrors([]);
      return;
    }
    
    onChange({ ...data, [currentStep.id]: formattedValue });
    setErrors([]);
  };

  const validateCurrentStep = () => {
    const newErrors: string[] = [];
    const value = data[currentStep.id];
    const effectiveValue = value || currentStep.defaultValue;

    if (currentStep.required && !String(effectiveValue || '').trim()) {
      newErrors.push(`${currentStep.question.replace('?', '')} is required`);
    }

    if (currentStep.validation && effectiveValue) {
      const validationError = currentStep.validation(String(effectiveValue));
      if (validationError) newErrors.push(validationError);
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        onNext();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setErrors([]);
    } else {
      onBack();
    }
  };

  const getProgressPercentage = () => Math.round(((currentStepIndex + 1) / steps.length) * 100);
  const getCompletedSteps = () => steps.filter(step => String(data[step.id] || '').trim()).length;
  const currentValue = String(data[currentStep.id] || '');
  const hasValue = currentValue.trim() !== '';

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg shadow-xl border-0">
        {/* Header */}
        <CardHeader className="bg-[#AD6269] text-white rounded-t-lg p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {currentStep.icon}
            <h2 className="text-xl font-semibold">{currentStep.title}</h2>
          </div>
          <p className="text-white/80 text-sm">
            Question {currentStepIndex + 1} of {steps.length}
          </p>
          
          {isPrePopulated && (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 bg-green-500/20 text-white px-3 py-1 rounded-full text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Profile information loaded
              </span>
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={getProgressPercentage()} className="h-2 bg-white/30" />
            <p className="text-white/70 text-xs mt-2">
              {getProgressPercentage()}% Complete ({getCompletedSteps()}/{steps.length} fields)
            </p>
          </div>
        </CardHeader>
        
        {/* Content */}
        <CardContent className="p-8">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {errors.map((error, index) => (
                <p key={index} className="text-sm">{error}</p>
              ))}
            </div>
          )}

          <div className="text-center space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">{currentStep.question}</h3>
            
            {hasValue && (
              <p className="text-green-600 text-sm flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Information from your profile - you can edit if needed
              </p>
            )}
            
            <div className="relative">
              <Input
                type={currentStep.type}
                value={currentValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={currentStep.placeholder}
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                className={`h-14 text-center text-lg ${hasValue ? 'border-green-500 focus:border-green-500' : ''}`}
              />
              {hasValue && (
                <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            
            {!currentStep.required && (
              <p className="text-gray-500 text-sm">This field is optional</p>
            )}
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="bg-gray-50 rounded-b-lg p-4 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStepIndex === 0 ? 'Back to Calendar' : 'Previous'}
          </Button>
          <Button
            onClick={handleNext}
            className="gap-2 bg-[#AD6269] hover:bg-[#9d5860]"
          >
            {currentStepIndex === steps.length - 1 ? 'Continue to Health Form' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export type { ClientProfileData };
