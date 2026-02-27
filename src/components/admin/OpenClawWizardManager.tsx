'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bot, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle,
  Activity,
  Settings,
  BarChart3,
  MessageCircle,
  RefreshCw,
  Users,
  UserCheck,
  Clock,
  X,
  Plus,
  Eye,
  Edit,
  Trash2,
  Play,
  ArrowRight,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

// Custom Modal Component
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

function Modal({ open, onClose, title, description, children, size = 'md' }: ModalProps) {
  if (!open) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} mx-4 max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

interface WizardFlow {
  id: string;
  name: string;
  description: string;
  steps: WizardStep[];
  enabled: boolean;
  useCase: 'new_customer' | 'existing_customer' | 'consultation' | 'service_inquiry' | 'reschedule' | 'cancellation';
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  type: 'selection' | 'input' | 'calendar' | 'confirmation';
  options?: { value: string; label: string; description?: string }[];
  validation?: {
    required: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

interface WizardConfig {
  flows: WizardFlow[];
  defaultFlowId?: string;
  enabled: boolean;
}

export default function OpenClawWizardManager() {
  const [activeTab, setActiveTab] = useState<'flows' | 'analytics'>('flows');
  const [config, setConfig] = useState<WizardConfig>({
    flows: [],
    enabled: true
  });
  const [selectedFlow, setSelectedFlow] = useState<WizardFlow | null>(null);
  const [selectedStep, setSelectedStep] = useState<WizardStep | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modal states
  const [editFlowModalOpen, setEditFlowModalOpen] = useState(false);
  const [editStepModalOpen, setEditStepModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [addStepModalOpen, setAddStepModalOpen] = useState(false);
  const [previewStep, setPreviewStep] = useState(0);

  useEffect(() => {
    loadWizardConfig();
  }, []);

  const loadWizardConfig = async () => {
    try {
      const docRef = doc(getDb(), 'integrationSettings', 'openclaw_wizards');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setConfig(docSnap.data() as WizardConfig);
      } else {
        // Initialize with default wizard flows
        const defaultFlows = getDefaultWizardFlows();
        setConfig({ flows: defaultFlows, defaultFlowId: defaultFlows[0]?.id, enabled: true });
      }
    } catch (error) {
      console.error('Error loading wizard config:', error);
      toast.error('Failed to load wizard configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveWizardConfig = async () => {
    setSaving(true);
    try {
      const docRef = doc(getDb(), 'integrationSettings', 'openclaw_wizards');
      await setDoc(docRef, {
        ...config,
        updatedAt: new Date()
      });
      toast.success('Wizard configuration saved successfully');
    } catch (error) {
      console.error('Error saving wizard config:', error);
      toast.error('Failed to save wizard configuration');
    } finally {
      setSaving(false);
    }
  };

  const getDefaultWizardFlows = (): WizardFlow[] => [
    {
      id: 'new_customer_booking',
      name: 'New Customer Booking',
      description: 'Step-by-step wizard for first-time customers',
      enabled: true,
      useCase: 'new_customer',
      steps: [
        {
          id: 'welcome',
          title: 'Welcome to PMU Booking',
          description: 'Let\'s get you scheduled for your perfect PMU service',
          type: 'confirmation',
          validation: { required: false }
        },
        {
          id: 'service_selection',
          title: 'Choose Your Service',
          description: 'Select the PMU service you are interested in',
          type: 'selection',
          options: [
            { value: 'microblading', label: 'Microblading', description: 'Natural-looking eyebrows ($350)' },
            { value: 'lip_blushing', label: 'Lip Blushing', description: 'Enhanced lip color ($400)' },
            { value: 'eyeliner', label: 'Permanent Eyeliner', description: 'Perfect eyeliner definition ($300)' },
            { value: 'consultation', label: 'Free Consultation', description: 'Discuss your options with our artist' }
          ],
          validation: { required: true }
        },
        {
          id: 'availability_check',
          title: 'Check Availability',
          description: 'When would you like to come in?',
          type: 'calendar',
          validation: { required: true }
        },
        {
          id: 'artist_selection',
          title: 'Choose Your Artist',
          description: 'Select your preferred artist (optional)',
          type: 'selection',
          options: [
            { value: 'any', label: 'Any Available Artist', description: 'We\'ll assign the best match' },
            { value: 'sarah', label: 'Sarah Johnson', description: 'Specialist in microblading' },
            { value: 'maria', label: 'Maria Rodriguez', description: 'Expert in lip blushing' },
            { value: 'jennifer', label: 'Jennifer Chen', description: 'Master eyeliner artist' }
          ],
          validation: { required: false }
        },
        {
          id: 'contact_info',
          title: 'Contact Information',
          description: 'We\'ll need your details to confirm your appointment',
          type: 'input',
          validation: { required: true, minLength: 2, maxLength: 50 }
        },
        {
          id: 'confirmation',
          title: 'Confirm Your Booking',
          description: 'Review and confirm your appointment details',
          type: 'confirmation',
          validation: { required: true }
        }
      ]
    },
    {
      id: 'existing_customer_booking',
      name: 'Existing Customer Booking',
      description: 'Quick booking for returning customers',
      enabled: true,
      useCase: 'existing_customer',
      steps: [
        {
          id: 'welcome_back',
          title: 'Welcome Back!',
          description: 'Let\'s get you booked quickly',
          type: 'confirmation',
          validation: { required: false }
        },
        {
          id: 'service_selection',
          title: 'Choose Your Service',
          description: 'Select your PMU service',
          type: 'selection',
          options: [
            { value: 'microblading', label: 'Microblading', description: '$350' },
            { value: 'lip_blushing', label: 'Lip Blushing', description: '$400' },
            { value: 'eyeliner', label: 'Permanent Eyeliner', description: '$300' },
            { value: 'touch_up', label: 'Touch-up', description: '$150 (within 6 months)' }
          ],
          validation: { required: true }
        },
        {
          id: 'preferred_time',
          title: 'Preferred Time',
          description: 'When works best for you?',
          type: 'calendar',
          validation: { required: true }
        },
        {
          id: 'confirmation',
          title: 'Confirm Booking',
          description: 'Ready to confirm your appointment?',
          type: 'confirmation',
          validation: { required: true }
        }
      ]
    },
    {
      id: 'consultation_request',
      name: 'Consultation Request',
      description: 'Schedule a consultation to discuss options',
      enabled: true,
      useCase: 'consultation',
      steps: [
        {
          id: 'consultation_intro',
          title: 'Free Consultation',
          description: 'Let\'s discuss your PMU options and find the perfect service',
          type: 'confirmation',
          validation: { required: false }
        },
        {
          id: 'interest_area',
          title: 'What\'s Your Interest?',
          description: 'Which area would you like to discuss?',
          type: 'selection',
          options: [
            { value: 'eyebrows', label: 'Eyebrows', description: 'Microblading, powder brows' },
            { value: 'lips', label: 'Lips', description: 'Lip blushing, lip liner' },
            { value: 'eyes', label: 'Eyes', description: 'Eyeliner, eyebrows' },
            { value: 'multiple', label: 'Multiple Areas', description: 'Combination services' }
          ],
          validation: { required: true }
        },
        {
          id: 'consultation_type',
          title: 'Consultation Type',
          description: 'How would you prefer your consultation?',
          type: 'selection',
          options: [
            { value: 'in_person', label: 'In-Person', description: 'Come to our studio' },
            { value: 'virtual', label: 'Virtual', description: 'Video consultation' },
            { value: 'phone', label: 'Phone Call', description: 'Phone consultation' }
          ],
          validation: { required: true }
        },
        {
          id: 'availability',
          title: 'Consultation Availability',
          description: 'When would you like to come in?',
          type: 'calendar',
          validation: { required: true }
        },
        {
          id: 'contact_info',
          title: 'Contact Information',
          description: 'How can we reach you?',
          type: 'input',
          validation: { required: true }
        },
        {
          id: 'confirmation',
          title: 'Schedule Consultation',
          description: 'Ready to book your consultation?',
          type: 'confirmation',
          validation: { required: true }
        }
      ]
    },
    {
      id: 'service_inquiry',
      name: 'Service Inquiry',
      description: 'Get information about our PMU services',
      enabled: true,
      useCase: 'service_inquiry',
      steps: [
        {
          id: 'service_info_intro',
          title: 'PMU Service Information',
          description: 'Learn about our permanent makeup services',
          type: 'confirmation',
          validation: { required: false }
        },
        {
          id: 'service_category',
          title: 'Service Category',
          description: 'Which service category interests you?',
          type: 'selection',
          options: [
            { value: 'eyebrows', label: 'Eyebrows', description: 'Microblading, powder brows, henna' },
            { value: 'lips', label: 'Lips', description: 'Lip blushing, lip liner, lip tint' },
            { value: 'eyes', label: 'Eyes', description: 'Eyeliner, eyebrows, lash line' },
            { value: 'all_services', label: 'All Services', description: 'General information' }
          ],
          validation: { required: true }
        },
        {
          id: 'specific_interest',
          title: 'More Details',
          description: 'What specific information do you need?',
          type: 'selection',
          options: [
            { value: 'pricing', label: 'Pricing & Packages', description: 'Costs and what is included' },
            { value: 'process', label: 'Process & Timeline', description: 'What to expect during treatment' },
            { value: 'aftercare', label: 'Aftercare Instructions', description: 'How to care for your new PMU' },
            { value: 'healing', label: 'Healing Process', description: 'Recovery timeline and tips' },
            { value: 'booking', label: 'How to Book', description: 'Next steps to schedule' }
          ],
          validation: { required: true }
        },
        {
          id: 'delivery_method',
          title: 'How would you like the information?',
          description: 'Choose your preferred way to receive details',
          type: 'selection',
          options: [
            { value: 'immediate', label: 'Send Now', description: 'Get information immediately via chat' },
            { value: 'email', label: 'Email Summary', description: 'Receive detailed info via email' },
            { value: 'consultation', label: 'Book Consultation', description: 'Schedule time to discuss in detail' }
          ],
          validation: { required: true }
        },
        {
          id: 'contact_info',
          title: 'Contact Information',
          description: 'How can we send you the information?',
          type: 'input',
          validation: { required: true }
        },
        {
          id: 'confirmation',
          title: 'Send Information',
          description: 'Ready to get your PMU service information?',
          type: 'confirmation',
          validation: { required: true }
        }
      ]
    },
    {
      id: 'reschedule_request',
      name: 'Reschedule Request',
      description: 'Help customers reschedule existing appointments',
      enabled: true,
      useCase: 'reschedule',
      steps: [
        {
          id: 'reschedule_intro',
          title: 'Reschedule Your Appointment',
          description: 'Let\'s help you find a new time that works better',
          type: 'confirmation',
          validation: { required: false }
        },
        {
          id: 'booking_lookup',
          title: 'Find Your Booking',
          description: 'How can we locate your appointment?',
          type: 'selection',
          options: [
            { value: 'confirmation_number', label: 'Confirmation Number', description: 'Enter your booking confirmation' },
            { value: 'phone_email', label: 'Phone or Email', description: 'Use the phone/email you booked with' },
            { value: 'name_date', label: 'Name and Date', description: 'Your name and appointment date' }
          ],
          validation: { required: true }
        },
        {
          id: 'booking_details',
          title: 'Booking Details',
          description: 'Please provide your booking information',
          type: 'input',
          validation: { required: true, minLength: 3 }
        },
        {
          id: 'new_preference',
          title: 'New Time Preference',
          description: 'When would you like to reschedule to?',
          type: 'calendar',
          validation: { required: true }
        },
        {
          id: 'reason',
          title: 'Reason for Reschedule (Optional)',
          description: 'Help us understand (optional)',
          type: 'input',
          validation: { required: false, maxLength: 200 }
        },
        {
          id: 'confirmation',
          title: 'Confirm Reschedule',
          description: 'Ready to reschedule your appointment?',
          type: 'confirmation',
          validation: { required: true }
        }
      ]
    },
    {
      id: 'cancellation_request',
      name: 'Cancellation Request',
      description: 'Handle appointment cancellations with policy information',
      enabled: true,
      useCase: 'cancellation',
      steps: [
        {
          id: 'cancellation_intro',
          title: 'Cancel Your Appointment',
          description: 'We\'re sorry to see you go. Let\'s help with your cancellation',
          type: 'confirmation',
          validation: { required: false }
        },
        {
          id: 'cancellation_policy',
          title: 'Cancellation Policy',
          description: 'Please review our cancellation policy:',
          type: 'confirmation',
          validation: { required: true }
        },
        {
          id: 'booking_lookup',
          title: 'Find Your Booking',
          description: 'How can we locate your appointment?',
          type: 'selection',
          options: [
            { value: 'confirmation_number', label: 'Confirmation Number', description: 'Enter your booking confirmation' },
            { value: 'phone_email', label: 'Phone or Email', description: 'Use the phone/email you booked with' },
            { value: 'name_date', label: 'Name and Date', description: 'Your name and appointment date' }
          ],
          validation: { required: true }
        },
        {
          id: 'booking_details',
          title: 'Booking Details',
          description: 'Please provide your booking information',
          type: 'input',
          validation: { required: true, minLength: 3 }
        },
        {
          id: 'cancellation_confirm',
          title: 'Confirm Cancellation',
          description: 'Are you sure you want to cancel this appointment?',
          type: 'confirmation',
          validation: { required: true }
        },
        {
          id: 'feedback',
          title: 'Feedback (Optional)',
          description: 'Any feedback to help us improve? (optional)',
          type: 'input',
          validation: { required: false, maxLength: 300 }
        },
        {
          id: 'final_confirmation',
          title: 'Final Confirmation',
          description: 'Your cancellation will be processed. Continue?',
          type: 'confirmation',
          validation: { required: true }
        }
      ]
    }
  ];

  const handleEditFlow = (flow: WizardFlow) => {
    setSelectedFlow({ ...flow });
    setEditFlowModalOpen(true);
  };

  const handlePreviewFlow = (flow: WizardFlow) => {
    setSelectedFlow(flow);
    setPreviewStep(0);
    setPreviewModalOpen(true);
  };

  const handleSaveFlow = () => {
    if (!selectedFlow) return;
    
    const updatedFlows = config.flows.map(f => 
      f.id === selectedFlow.id ? selectedFlow : f
    );
    setConfig({ ...config, flows: updatedFlows });
    setEditFlowModalOpen(false);
    toast.success('Flow updated successfully');
  };

  const handleAddStep = () => {
    if (!selectedFlow) return;
    
    const newStep: WizardStep = {
      id: `step_${Date.now()}`,
      title: 'New Step',
      description: 'Step description',
      type: 'confirmation',
      validation: { required: false }
    };
    
    setSelectedFlow({
      ...selectedFlow,
      steps: [...selectedFlow.steps, newStep]
    });
    setAddStepModalOpen(false);
  };

  const handleDeleteStep = (stepId: string) => {
    if (!selectedFlow) return;
    
    const updatedSteps = selectedFlow.steps.filter(s => s.id !== stepId);
    setSelectedFlow({ ...selectedFlow, steps: updatedSteps });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin text-[#AD6269]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#AD6269]/10 rounded-lg">
          <Bot className="h-6 w-6 text-[#AD6269]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">OpenClaw Wizard Journeys</h2>
          <p className="text-sm text-gray-500">Step-by-step guided booking workflows</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{config.flows.filter(f => f.enabled).length} Active Wizards</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('flows')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'flows'
              ? 'border-[#AD6269] text-[#AD6269]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Wizard Flows
          </div>
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'analytics'
              ? 'border-[#AD6269] text-[#AD6269]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </div>
        </button>
      </div>

      {/* Wizard Flows Tab */}
      {activeTab === 'flows' && (
        <div className="space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-900">Available Wizard Flows</CardTitle>
              <CardDescription>Configure step-by-step booking journeys for different customer types</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.flows.map((flow) => (
                  <div key={flow.id} className="p-4 border border-gray-200 rounded-lg hover:border-[#AD6269]/50 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#AD6269]/10 rounded-lg">
                          {flow.useCase === 'new_customer' && <Users className="h-5 w-5 text-[#AD6269]" />}
                          {flow.useCase === 'existing_customer' && <UserCheck className="h-5 w-5 text-[#AD6269]" />}
                          {flow.useCase === 'consultation' && <MessageCircle className="h-5 w-5 text-[#AD6269]" />}
                          {flow.useCase === 'service_inquiry' && <MessageSquare className="h-5 w-5 text-[#AD6269]" />}
                          {flow.useCase === 'reschedule' && <Clock className="h-5 w-5 text-[#AD6269]" />}
                          {flow.useCase === 'cancellation' && <AlertCircle className="h-5 w-5 text-[#AD6269]" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{flow.name}</h4>
                          <p className="text-sm text-gray-600">{flow.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={flow.enabled}
                          onChange={(e) => {
                            const updatedFlows = config.flows.map(f => 
                              f.id === flow.id ? { ...f, enabled: e.target.checked } : f
                            );
                            setConfig({ ...config, flows: updatedFlows });
                          }}
                          className="rounded border-gray-300 text-[#AD6269] focus:ring-[#AD6269]"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${flow.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {flow.enabled ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                        {flow.steps.length} steps
                      </span>
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                        {flow.useCase.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreviewFlow(flow)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditFlow(flow)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button
                  onClick={saveWizardConfig}
                  disabled={saving}
                  className="bg-[#AD6269] hover:bg-[#8B4F54] w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save All Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-[#AD6269]" />
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">Wizard Starts</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-gray-900">0</div>
                  <div className="text-sm text-gray-600">Completions</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-gray-900">0%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-gray-900">0m</div>
                  <div className="text-sm text-gray-600">Avg Duration</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-base font-semibold text-gray-900">Wizard Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Analytics will appear once customers start using wizard flows</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Flow Modal */}
      <Modal
        open={editFlowModalOpen}
        onClose={() => setEditFlowModalOpen(false)}
        title="Edit Wizard Flow"
        description={selectedFlow?.description}
        size="xl"
      >
        {selectedFlow && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Flow Name</Label>
                <Input
                  value={selectedFlow.name}
                  onChange={(e) => setSelectedFlow({ ...selectedFlow, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Use Case</Label>
                <select 
                  value={selectedFlow.useCase}
                  onChange={(e) => setSelectedFlow({ ...selectedFlow, useCase: e.target.value as WizardFlow['useCase'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="new_customer">New Customer</option>
                  <option value="existing_customer">Existing Customer</option>
                  <option value="consultation">Consultation</option>
                  <option value="service_inquiry">Service Inquiry</option>
                  <option value="reschedule">Reschedule</option>
                  <option value="cancellation">Cancellation</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900">Flow Steps ({selectedFlow.steps.length})</h4>
                <Button size="sm" onClick={() => setAddStepModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Step
                </Button>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {selectedFlow.steps.map((step, index) => (
                  <div key={step.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-[#AD6269] text-white text-xs rounded-full flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-900">{step.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">{step.type}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedStep(step);
                            setEditStepModalOpen(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteStep(step.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setEditFlowModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveFlow} className="flex-1 bg-[#AD6269] hover:bg-[#8B4F54]">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Step Modal */}
      <Modal
        open={editStepModalOpen}
        onClose={() => setEditStepModalOpen(false)}
        title="Edit Step"
        size="md"
      >
        {selectedStep && selectedFlow && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Step Title</Label>
              <Input
                value={selectedStep.title}
                onChange={(e) => setSelectedStep({ ...selectedStep, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={selectedStep.description}
                onChange={(e) => setSelectedStep({ ...selectedStep, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Step Type</Label>
              <select 
                value={selectedStep.type}
                onChange={(e) => setSelectedStep({ ...selectedStep, type: e.target.value as WizardStep['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="selection">Selection</option>
                <option value="input">Input</option>
                <option value="calendar">Calendar</option>
                <option value="confirmation">Confirmation</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setEditStepModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  const updatedSteps = selectedFlow.steps.map(s => 
                    s.id === selectedStep.id ? selectedStep : s
                  );
                  setSelectedFlow({ ...selectedFlow, steps: updatedSteps });
                  setEditStepModalOpen(false);
                }} 
                className="flex-1 bg-[#AD6269] hover:bg-[#8B4F54]"
              >
                Save Step
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Step Modal */}
      <Modal
        open={addStepModalOpen}
        onClose={() => setAddStepModalOpen(false)}
        title="Add New Step"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">Choose a step type to add to the wizard flow:</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { type: 'selection', label: 'Selection', desc: 'Multiple choice options', icon: MessageSquare },
              { type: 'input', label: 'Input', desc: 'Text input field', icon: Edit },
              { type: 'calendar', label: 'Calendar', desc: 'Date/time picker', icon: Clock },
              { type: 'confirmation', label: 'Confirmation', desc: 'Confirm action', icon: CheckCircle }
            ].map((item) => (
              <button
                key={item.type}
                onClick={() => {
                  if (selectedFlow) {
                    const newStep: WizardStep = {
                      id: `step_${Date.now()}`,
                      title: `New ${item.label} Step`,
                      description: item.desc,
                      type: item.type as WizardStep['type'],
                      validation: { required: false }
                    };
                    setSelectedFlow({
                      ...selectedFlow,
                      steps: [...selectedFlow.steps, newStep]
                    });
                    setAddStepModalOpen(false);
                  }
                }}
                className="p-4 border border-gray-200 rounded-lg hover:border-[#AD6269] hover:bg-[#AD6269]/5 transition-all text-left"
              >
                <item.icon className="h-6 w-6 text-[#AD6269] mb-2" />
                <div className="font-medium text-gray-900">{item.label}</div>
                <div className="text-sm text-gray-600">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Wizard Preview"
        description={selectedFlow?.name}
        size="lg"
      >
        {selectedFlow && (
          <div className="space-y-6">
            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              {selectedFlow.steps.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-2 rounded-full ${
                    index <= previewStep ? 'bg-[#AD6269]' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            
            {/* Current step preview */}
            <div className="bg-gray-50 rounded-lg p-6 min-h-[200px]">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 bg-[#AD6269] text-white rounded-full flex items-center justify-center font-medium">
                  {previewStep + 1}
                </span>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedFlow.steps[previewStep]?.title}
                </h3>
              </div>
              <p className="text-gray-600 mb-4">
                {selectedFlow.steps[previewStep]?.description}
              </p>
              
              {/* Step type indicator */}
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 text-gray-500">
                  {selectedFlow.steps[previewStep]?.type === 'selection' && (
                    <>
                      <MessageSquare className="h-5 w-5" />
                      <span>Customer will see selection options here</span>
                    </>
                  )}
                  {selectedFlow.steps[previewStep]?.type === 'input' && (
                    <>
                      <Edit className="h-5 w-5" />
                      <span>Customer will enter text here</span>
                    </>
                  )}
                  {selectedFlow.steps[previewStep]?.type === 'calendar' && (
                    <>
                      <Clock className="h-5 w-5" />
                      <span>Customer will select date/time here</span>
                    </>
                  )}
                  {selectedFlow.steps[previewStep]?.type === 'confirmation' && (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Customer will confirm their selection here</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setPreviewStep(Math.max(0, previewStep - 1))}
                disabled={previewStep === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Step {previewStep + 1} of {selectedFlow.steps.length}
              </span>
              <Button
                onClick={() => setPreviewStep(Math.min(selectedFlow.steps.length - 1, previewStep + 1))}
                disabled={previewStep === selectedFlow.steps.length - 1}
                className="bg-[#AD6269] hover:bg-[#8B4F54]"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
