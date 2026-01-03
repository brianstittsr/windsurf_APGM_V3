'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  AlertTriangle,
  CheckCircle,
  Cloud,
  Download,
  Upload,
  RefreshCw,
  Eye,
  EyeOff,
  Users,
  Tag,
  Calendar,
  FileText,
  Workflow,
  MessageSquare,
  Bot,
  Image,
  Database,
  Clock,
  Play,
  Pause,
  RotateCcw,
  History,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
  HelpCircle,
  BookOpen,
  Key,
  Shield,
  Zap,
  ExternalLink,
} from 'lucide-react';
import {
  MigrationJob,
  MigrationCategory,
  MigrationDataCounts,
  ValidationResult,
  AnalysisResult,
  GHLAccountCredentials,
  MigrationOptions,
  CategoryProgress,
} from '@/types/ghl-migration';

type WizardStep = 'connect' | 'analyze' | 'select' | 'migrate' | 'complete';

const CATEGORY_INFO: Record<MigrationCategory, { label: string; icon: any; description: string }> = {
  contacts: { label: 'Contacts', icon: Users, description: 'All contacts with custom fields and notes' },
  tags: { label: 'Tags', icon: Tag, description: 'Contact tags and labels' },
  customFields: { label: 'Custom Fields', icon: Database, description: 'Custom field definitions' },
  pipelines: { label: 'Pipelines', icon: Workflow, description: 'Sales pipelines and stages' },
  opportunities: { label: 'Opportunities', icon: FileText, description: 'Pipeline opportunities' },
  calendars: { label: 'Calendars', icon: Calendar, description: 'Calendar configurations' },
  appointments: { label: 'Appointments', icon: Clock, description: 'Scheduled appointments' },
  forms: { label: 'Forms', icon: FileText, description: 'Form definitions' },
  surveys: { label: 'Surveys', icon: MessageSquare, description: 'Survey definitions' },
  workflows: { label: 'Workflows', icon: Workflow, description: 'Automation workflows' },
  campaigns: { label: 'Campaigns', icon: MessageSquare, description: 'Email/SMS campaigns' },
  aiPrompts: { label: 'AI Prompts', icon: Bot, description: 'Conversation AI settings' },
  templates: { label: 'Templates', icon: FileText, description: 'Email/SMS templates' },
  media: { label: 'Media Files', icon: Image, description: 'Images and documents' },
};

export default function GHLMigration() {
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>('connect');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Account credentials
  const [sourceAccount, setSourceAccount] = useState<GHLAccountCredentials>({
    apiKey: '',
    locationId: '',
  });
  const [destAccount, setDestAccount] = useState<GHLAccountCredentials>({
    apiKey: '',
    locationId: '',
  });
  const [showSourceKey, setShowSourceKey] = useState(false);
  const [showDestKey, setShowDestKey] = useState(false);

  // Validation & Analysis
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Migration options
  const [selectedCategories, setSelectedCategories] = useState<MigrationCategory[]>([
    'contacts', 'tags', 'customFields', 'pipelines', 'opportunities'
  ]);
  const [migrationOptions, setMigrationOptions] = useState({
    includeHistoricalAppointments: false,
    includeFormSubmissions: false,
    includeConversationHistory: false,
    mergeDuplicateContacts: true,
    overwriteExisting: false,
  });

  // Migration job
  const [currentJob, setCurrentJob] = useState<MigrationJob | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // History
  const [showHistory, setShowHistory] = useState(false);
  const [migrationHistory, setMigrationHistory] = useState<MigrationJob[]>([]);

  // Documentation
  const [showDocs, setShowDocs] = useState(false);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Load migration history
  useEffect(() => {
    loadMigrationHistory();
  }, []);

  const loadMigrationHistory = async () => {
    try {
      const response = await fetch('/api/crm/migration/history');
      const data = await response.json();
      if (data.success) {
        setMigrationHistory(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load migration history:', error);
    }
  };

  // Step 1: Validate accounts
  const handleValidateAccounts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/crm/migration/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceAccount, destinationAccount: destAccount }),
      });

      const data = await response.json();

      if (data.success) {
        setValidationResult(data.data);
        if (data.data.isValid) {
          // Auto-advance to analysis
          await handleAnalyzeSource();
        }
      } else {
        setError(data.error || 'Validation failed');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to validate accounts');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Analyze source account
  const handleAnalyzeSource = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/crm/migration/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceAccount }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysisResult(data.data);
        setCurrentStep('analyze');
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to analyze source account');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Start migration
  const handleStartMigration = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/crm/migration/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceAccount,
          destinationAccount: destAccount,
          options: {
            categories: selectedCategories,
            ...migrationOptions,
          },
          dataCounts: analysisResult?.dataCounts,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentStep('migrate');
        // Start polling for status
        startStatusPolling(data.data.jobId);
      } else {
        setError(data.error || 'Failed to start migration');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to start migration');
    } finally {
      setLoading(false);
    }
  };

  // Poll for migration status
  const startStatusPolling = (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/crm/migration/status/${jobId}`);
        const data = await response.json();

        if (data.success) {
          setCurrentJob(data.data);

          // Stop polling if migration is complete or failed
          if (['completed', 'failed', 'cancelled'].includes(data.data.status)) {
            clearInterval(interval);
            setPollingInterval(null);
            if (data.data.status === 'completed') {
              setCurrentStep('complete');
            }
            loadMigrationHistory();
          }
        }
      } catch (error) {
        console.error('Status polling error:', error);
      }
    }, 2000);

    setPollingInterval(interval);
  };

  // Cancel migration
  const handleCancelMigration = async () => {
    if (!currentJob) return;

    try {
      await fetch(`/api/crm/migration/status/${currentJob.id}`, {
        method: 'DELETE',
      });
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    } catch (error) {
      console.error('Failed to cancel migration:', error);
    }
  };

  // Export backup
  const handleExportBackup = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/crm/migration/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceAccount }),
      });

      const data = await response.json();

      if (data.success) {
        // Download as JSON file
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ghl-backup-${sourceAccount.locationId}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        setError(data.error || 'Export failed');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to export backup');
    } finally {
      setLoading(false);
    }
  };

  // Toggle category selection
  const toggleCategory = (category: MigrationCategory) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Select all categories
  const selectAllCategories = () => {
    setSelectedCategories(Object.keys(CATEGORY_INFO) as MigrationCategory[]);
  };

  // Deselect all categories
  const deselectAllCategories = () => {
    setSelectedCategories([]);
  };

  // Reset wizard
  const resetWizard = () => {
    setCurrentStep('connect');
    setValidationResult(null);
    setAnalysisResult(null);
    setCurrentJob(null);
    setError(null);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // Render step indicator
  const renderStepIndicator = () => {
    const steps: { key: WizardStep; label: string }[] = [
      { key: 'connect', label: 'Connect' },
      { key: 'analyze', label: 'Analyze' },
      { key: 'select', label: 'Select' },
      { key: 'migrate', label: 'Migrate' },
      { key: 'complete', label: 'Complete' },
    ];

    const currentIndex = steps.findIndex(s => s.key === currentStep);

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                index < currentIndex
                  ? 'bg-green-500 text-white'
                  : index === currentIndex
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index < currentIndex ? <Check className="w-5 h-5" /> : index + 1}
            </div>
            <span
              className={`ml-2 text-sm font-medium ${
                index <= currentIndex ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`w-12 h-1 mx-3 rounded ${
                  index < currentIndex ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render connect step
  const renderConnectStep = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Account */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Source Account (Export From)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <div className="flex">
                <Input
                  type={showSourceKey ? 'text' : 'password'}
                  value={sourceAccount.apiKey}
                  onChange={(e) => setSourceAccount(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Source GHL API Key"
                  className="rounded-r-none"
                />
                <button
                  type="button"
                  onClick={() => setShowSourceKey(!showSourceKey)}
                  className="px-3 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50"
                >
                  {showSourceKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location ID</label>
              <Input
                type="text"
                value={sourceAccount.locationId}
                onChange={(e) => setSourceAccount(prev => ({ ...prev, locationId: e.target.value }))}
                placeholder="Source Location ID"
              />
            </div>
            {validationResult?.sourceAccount && (
              <div className={`p-3 rounded-lg ${validationResult.sourceAccount.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {validationResult.sourceAccount.isValid ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Connected: {validationResult.sourceAccount.locationName}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    {validationResult.sourceAccount.error}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Destination Account */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Destination Account (Import To)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <div className="flex">
                <Input
                  type={showDestKey ? 'text' : 'password'}
                  value={destAccount.apiKey}
                  onChange={(e) => setDestAccount(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Destination GHL API Key"
                  className="rounded-r-none"
                />
                <button
                  type="button"
                  onClick={() => setShowDestKey(!showDestKey)}
                  className="px-3 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50"
                >
                  {showDestKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location ID</label>
              <Input
                type="text"
                value={destAccount.locationId}
                onChange={(e) => setDestAccount(prev => ({ ...prev, locationId: e.target.value }))}
                placeholder="Destination Location ID"
              />
            </div>
            {validationResult?.destinationAccount && (
              <div className={`p-3 rounded-lg ${validationResult.destinationAccount.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {validationResult.destinationAccount.isValid ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Connected: {validationResult.destinationAccount.locationName}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    {validationResult.destinationAccount.error}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handleExportBackup}
          disabled={loading || !sourceAccount.apiKey || !sourceAccount.locationId}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Backup Only
        </Button>
        <Button
          onClick={handleValidateAccounts}
          disabled={loading || !sourceAccount.apiKey || !sourceAccount.locationId || !destAccount.apiKey || !destAccount.locationId}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Validating...
            </>
          ) : (
            <>
              Validate & Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // Render analyze step
  const renderAnalyzeStep = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-600" />
          Source Account Data Analysis
        </h3>

        {analysisResult && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {Object.entries(analysisResult.dataCounts).map(([key, count]) => {
                const info = CATEGORY_INFO[key as MigrationCategory];
                if (!info) return null;
                const Icon = info.icon;
                return (
                  <div key={key} className="bg-gray-50 rounded-lg p-4 text-center">
                    <Icon className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-500">{info.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <span className="font-medium text-blue-800">Estimated Migration Time:</span>
                <span className="ml-2 text-blue-700">
                  {analysisResult.estimatedDuration < 1
                    ? 'Less than 1 minute'
                    : `~${analysisResult.estimatedDuration} minutes`}
                </span>
              </div>
            </div>

            {analysisResult.warnings.length > 0 && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Warnings
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {analysisResult.warnings.map((warning, i) => (
                    <li key={i}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('connect')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => setCurrentStep('select')}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Continue to Selection
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  // Render select step
  const renderSelectStep = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            Select Data to Migrate
          </h3>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={selectAllCategories}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAllCategories}>
              Deselect All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(CATEGORY_INFO).map(([key, info]) => {
            const category = key as MigrationCategory;
            const Icon = info.icon;
            const count = analysisResult?.dataCounts[category] || 0;
            const isSelected = selectedCategories.includes(category);

            return (
              <button
                key={key}
                onClick={() => toggleCategory(category)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                  {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                </div>
                <div className="font-medium text-gray-900">{info.label}</div>
                <div className="text-sm text-gray-500">{count} items</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Options */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-purple-600" />
          Migration Options
        </h3>
        <div className="space-y-3">
          {[
            { key: 'includeHistoricalAppointments', label: 'Include historical appointments' },
            { key: 'includeFormSubmissions', label: 'Include form submissions' },
            { key: 'includeConversationHistory', label: 'Include conversation history' },
            { key: 'mergeDuplicateContacts', label: 'Merge duplicate contacts (by email)' },
            { key: 'overwriteExisting', label: 'Overwrite existing data in destination' },
          ].map(option => (
            <label key={option.key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={migrationOptions[option.key as keyof typeof migrationOptions]}
                onChange={(e) => setMigrationOptions(prev => ({
                  ...prev,
                  [option.key]: e.target.checked,
                }))}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('analyze')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleStartMigration}
          disabled={loading || selectedCategories.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Start Migration
            </>
          )}
        </Button>
      </div>
    </div>
  );

  // Render migrate step
  const renderMigrateStep = () => (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <RefreshCw className={`w-5 h-5 text-purple-600 ${currentJob?.status === 'exporting' || currentJob?.status === 'importing' ? 'animate-spin' : ''}`} />
            Migration in Progress
          </h3>
          {currentJob && ['exporting', 'importing'].includes(currentJob.status) && (
            <Button variant="outline" onClick={handleCancelMigration} className="text-red-600 border-red-300 hover:bg-red-50">
              <Pause className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>

        {currentJob && (
          <>
            {/* Overall Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Overall Progress</span>
                <span>{currentJob.progress.overall}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-purple-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${currentJob.progress.overall}%` }}
                />
              </div>
              {currentJob.progress.currentOperation && (
                <p className="text-sm text-gray-500 mt-2">
                  {currentJob.progress.currentOperation}
                </p>
              )}
            </div>

            {/* Category Progress */}
            <div className="space-y-3">
              {Object.entries(currentJob.progress.categories).map(([key, progress]) => {
                const info = CATEGORY_INFO[key as MigrationCategory];
                if (!info) return null;
                const Icon = info.icon;
                const categoryProgress = progress as CategoryProgress;
                const percent = categoryProgress.total > 0
                  ? Math.round((categoryProgress.processed / categoryProgress.total) * 100)
                  : 0;

                return (
                  <div key={key} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-sm">{info.label}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-green-600">{categoryProgress.successful}</span>
                        <span className="text-gray-400">/</span>
                        <span>{categoryProgress.total}</span>
                        {categoryProgress.failed > 0 && (
                          <span className="text-red-600">({categoryProgress.failed} failed)</span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          categoryProgress.status === 'completed'
                            ? 'bg-green-500'
                            : categoryProgress.status === 'failed'
                            ? 'bg-red-500'
                            : 'bg-purple-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Status */}
            <div className={`mt-6 p-4 rounded-lg ${
              currentJob.status === 'failed' ? 'bg-red-50 border border-red-200' :
              currentJob.status === 'completed' ? 'bg-green-50 border border-green-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-center gap-2">
                {currentJob.status === 'failed' ? (
                  <X className="w-5 h-5 text-red-600" />
                ) : currentJob.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                )}
                <span className={`font-medium ${
                  currentJob.status === 'failed' ? 'text-red-800' :
                  currentJob.status === 'completed' ? 'text-green-800' :
                  'text-blue-800'
                }`}>
                  Status: {currentJob.status.charAt(0).toUpperCase() + currentJob.status.slice(1)}
                </span>
              </div>
              {currentJob.error && (
                <p className="text-sm text-red-700 mt-2">{currentJob.error}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Render complete step
  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-800 mb-2">Migration Complete!</h3>
        <p className="text-green-700 mb-6">
          Your data has been successfully migrated to the destination account.
        </p>

        {currentJob && (
          <div className="bg-white rounded-lg p-6 text-left max-w-md mx-auto">
            <h4 className="font-semibold mb-3">Migration Summary</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(currentJob.progress.categories).map(([key, progress]) => {
                const info = CATEGORY_INFO[key as MigrationCategory];
                if (!info) return null;
                const categoryProgress = progress as CategoryProgress;
                return (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600">{info.label}</span>
                    <span>
                      <span className="text-green-600 font-medium">{categoryProgress.successful}</span>
                      {categoryProgress.failed > 0 && (
                        <span className="text-red-600 ml-2">({categoryProgress.failed} failed)</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={resetWizard}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Start New Migration
        </Button>
        <Button onClick={() => setShowHistory(true)}>
          <History className="w-4 h-4 mr-2" />
          View History
        </Button>
      </div>
    </div>
  );

  // Render migration history
  const renderHistory = () => (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <History className="w-5 h-5 text-purple-600" />
          Migration History
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
          <ChevronUp className="w-4 h-4" />
        </Button>
      </div>

      {migrationHistory.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No migration history found</p>
      ) : (
        <div className="space-y-3">
          {migrationHistory.map(job => (
            <div key={job.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">
                    {job.sourceAccount.locationId} → {job.destinationAccount.locationId}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(job.createdAt).toLocaleString()}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  job.status === 'completed' ? 'bg-green-100 text-green-800' :
                  job.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {job.status}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Categories: {job.options.categories.join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render documentation panel
  const renderDocumentation = () => (
    <div className="bg-white border border-gray-200 rounded-xl mb-6 overflow-hidden">
      <button
        onClick={() => setShowDocs(!showDocs)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-gray-900">How to Use This Tool</span>
        </div>
        {showDocs ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {showDocs && (
        <div className="p-6 space-y-6">
          {/* Quick Start */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Quick Start Guide
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span><strong>Connect Accounts:</strong> Enter API keys and Location IDs for both source (export from) and destination (import to) accounts.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span><strong>Analyze Data:</strong> Review the data counts from your source account and estimated migration time.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span><strong>Select Categories:</strong> Choose which data types to migrate (contacts, tags, pipelines, etc.).</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <span><strong>Start Migration:</strong> Click "Start Migration" and monitor real-time progress.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                  <span><strong>Review Results:</strong> Check the summary and verify data in your destination account.</span>
                </li>
              </ol>
            </div>
          </div>

          {/* Complete Private Integration Setup Guide */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Key className="w-5 h-5 text-green-500" />
              Complete Private Integration Setup (One-Time Setup)
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <h4 className="font-semibold text-green-800 mb-3">Step 1: Access Private Integrations</h4>
                <ol className="text-sm text-gray-700 space-y-2 ml-4 list-decimal">
                  <li>Log into your GoHighLevel sub-account at <code className="bg-gray-100 px-1 rounded">app.gohighlevel.com</code></li>
                  <li>Click <strong>Settings</strong> (gear icon) in the bottom left</li>
                  <li>Navigate to <strong>Integrations</strong> in the left sidebar</li>
                  <li>Click on <strong>Private Integrations</strong> tab</li>
                </ol>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-100">
                <h4 className="font-semibold text-green-800 mb-3">Step 2: Create New Private Integration</h4>
                <ol className="text-sm text-gray-700 space-y-2 ml-4 list-decimal">
                  <li>Click the <strong>"+ Create App"</strong> button (top right)</li>
                  <li>Enter App Name: <code className="bg-gray-100 px-1 rounded">Migration Tool</code></li>
                  <li>Add Description: <code className="bg-gray-100 px-1 rounded">API access for account migration</code></li>
                  <li>Click <strong>"Create App"</strong></li>
                </ol>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-100">
                <h4 className="font-semibold text-green-800 mb-3">Step 3: Configure Required Scopes</h4>
                <p className="text-sm text-gray-600 mb-2">In the app settings, enable these scopes under <strong>"Scopes"</strong> tab:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { scope: 'contacts.readonly', desc: 'Read contacts' },
                    { scope: 'contacts.write', desc: 'Create contacts' },
                    { scope: 'calendars.readonly', desc: 'Read calendars' },
                    { scope: 'calendars.write', desc: 'Create appointments' },
                    { scope: 'opportunities.readonly', desc: 'Read pipeline' },
                    { scope: 'opportunities.write', desc: 'Create opportunities' },
                    { scope: 'workflows.readonly', desc: 'Read workflows' },
                    { scope: 'campaigns.readonly', desc: 'Read campaigns' },
                    { scope: 'forms.readonly', desc: 'Read forms' },
                    { scope: 'surveys.readonly', desc: 'Read surveys' },
                    { scope: 'locations.readonly', desc: 'Read location info' },
                    { scope: 'conversations.readonly', desc: 'Read messages' },
                  ].map(item => (
                    <label key={item.scope} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                      <input type="checkbox" checked readOnly className="rounded text-green-600" />
                      <span><code className="text-green-700">{item.scope}</code></span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Click <strong>"Save"</strong> after enabling all scopes</p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-green-100">
                <h4 className="font-semibold text-green-800 mb-3">Step 4: Get Your Credentials</h4>
                <ol className="text-sm text-gray-700 space-y-2 ml-4 list-decimal">
                  <li>Go to the <strong>"Keys"</strong> tab in your Private Integration</li>
                  <li>Copy the <strong>API Key</strong> (starts with <code className="bg-gray-100 px-1 rounded">pit-...</code>)</li>
                  <li>For <strong>Location ID</strong>, look at your browser URL:
                    <div className="mt-1 bg-gray-100 p-2 rounded text-xs font-mono break-all">
                      app.gohighlevel.com/v2/location/<strong className="text-green-700">abc123XYZ</strong>/settings/...
                    </div>
                    <span className="text-xs text-gray-500">The highlighted part is your Location ID</span>
                  </li>
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Important:</strong> Create a Private Integration in BOTH the source and destination sub-accounts. Each account needs its own API key.</span>
                </p>
              </div>

              <a
                href="https://help.gohighlevel.com/support/solutions/articles/155000002294-how-to-create-and-manage-private-integrations"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800 font-medium"
              >
                View Official GHL Documentation <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Required API Scopes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Required API Scopes
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-3">
                Ensure your Private Integration has these scopes enabled:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {[
                  'contacts.readonly', 'contacts.write',
                  'calendars.readonly', 'calendars.write',
                  'opportunities.readonly', 'opportunities.write',
                  'workflows.readonly',
                  'campaigns.readonly',
                  'forms.readonly',
                  'surveys.readonly',
                  'locations.readonly',
                  'conversations.readonly'
                ].map(scope => (
                  <div key={scope} className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-blue-100">
                    <Check className="w-3 h-3 text-green-500" />
                    <code className="text-blue-700">{scope}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Data Categories */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-500" />
              What Gets Migrated
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Fully Supported
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Contacts</strong> - All contact data, custom fields, notes</li>
                  <li>• <strong>Tags</strong> - All contact tags and labels</li>
                  <li>• <strong>Custom Fields</strong> - Field definitions and values</li>
                  <li>• <strong>Pipelines</strong> - Pipeline stages (documented)</li>
                  <li>• <strong>Opportunities</strong> - Pipeline opportunities</li>
                  <li>• <strong>Calendars</strong> - Calendar configurations</li>
                  <li>• <strong>Forms & Surveys</strong> - Form definitions</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-yellow-700 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Requires Manual Steps
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Workflows</strong> - Documented only (recreate manually)</li>
                  <li>• <strong>AI Prompts</strong> - Export via GHL interface</li>
                  <li>• <strong>Phone Numbers</strong> - Cannot be transferred</li>
                  <li>• <strong>Integrations</strong> - Reconnect in destination</li>
                  <li>• <strong>Users/Team</strong> - Invite separately</li>
                  <li>• <strong>Billing</strong> - Set up independently</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Tips & Best Practices */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-orange-500" />
              Tips & Best Practices
            </h3>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex gap-2">
                  <span className="text-orange-500">•</span>
                  <span><strong>Backup First:</strong> Use the "Export Backup Only" button to download a JSON backup before migrating.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500">•</span>
                  <span><strong>Test with Small Data:</strong> If possible, test with a subset of data first.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500">•</span>
                  <span><strong>Check Duplicates:</strong> Enable "Merge duplicate contacts" to avoid creating duplicates by email.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500">•</span>
                  <span><strong>Migration Order:</strong> The tool migrates in dependency order (tags before contacts, etc.).</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500">•</span>
                  <span><strong>Large Migrations:</strong> For 10,000+ contacts, expect 15-30 minutes. Don't close the browser.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-500">•</span>
                  <span><strong>Verify After:</strong> Always verify critical data in the destination account after migration.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Troubleshooting */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Troubleshooting
            </h3>
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Connection Failed</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Verify your API key is correct and not expired</li>
                  <li>• Check that the Location ID matches the sub-account</li>
                  <li>• Ensure required scopes are enabled in Private Integration settings</li>
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">Migration Errors</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• "Rate limited" - Wait a few minutes and retry</li>
                  <li>• "Already exists" - Item exists in destination (not an error)</li>
                  <li>• "Permission denied" - Check API scopes for that category</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Post-Migration Checklist */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Post-Migration Checklist (Get Client Running Fast)
            </h3>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-4">
                Complete these tasks after migration to ensure the new account is fully operational:
              </p>
              
              <div className="space-y-4">
                {/* Immediate Tasks */}
                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Immediate Tasks (Day 1)
                  </h4>
                  <div className="space-y-2">
                    {[
                      'Verify all contacts imported correctly (spot check 10-20 contacts)',
                      'Check custom fields are mapped properly',
                      'Confirm tags transferred with correct names',
                      'Test calendar booking links work',
                      'Verify pipeline stages are in correct order',
                    ].map((task, i) => (
                      <label key={i} className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" className="mt-1 rounded border-gray-300 text-green-600" />
                        <span>{task}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Communication Setup */}
                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Communication Setup (Day 1-2)
                  </h4>
                  <div className="space-y-2">
                    {[
                      'Purchase/port phone number for SMS/calls',
                      'Configure email sending domain (SPF, DKIM, DMARC)',
                      'Set up email signature and branding',
                      'Test SMS sending with a test contact',
                      'Test email delivery (check spam folder)',
                      'Configure voicemail greeting if using calls',
                    ].map((task, i) => (
                      <label key={i} className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" className="mt-1 rounded border-gray-300 text-blue-600" />
                        <span>{task}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Workflow Recreation */}
                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <Workflow className="w-4 h-4" />
                    Workflow Recreation (Day 2-3)
                  </h4>
                  <div className="space-y-2">
                    {[
                      'Review exported workflow documentation',
                      'Recreate lead nurturing workflow',
                      'Recreate appointment reminder workflow',
                      'Recreate review request workflow',
                      'Set up any custom automations',
                      'Test each workflow with a test contact',
                      'Enable workflows for live use',
                    ].map((task, i) => (
                      <label key={i} className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" className="mt-1 rounded border-gray-300 text-purple-600" />
                        <span>{task}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-3 p-2 bg-purple-50 rounded text-xs text-purple-700">
                    <strong>Tip:</strong> Use the AI Workflow Builder tab to quickly recreate workflows from the exported documentation!
                  </div>
                </div>

                {/* Integrations */}
                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Integrations & Connections (Day 2-3)
                  </h4>
                  <div className="space-y-2">
                    {[
                      'Connect payment processor (Stripe/PayPal)',
                      'Set up Facebook Lead Ads integration',
                      'Connect Google My Business for reviews',
                      'Set up Zapier/webhook integrations',
                      'Connect calendar sync (Google/Outlook)',
                      'Configure any third-party integrations',
                    ].map((task, i) => (
                      <label key={i} className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" className="mt-1 rounded border-gray-300 text-orange-600" />
                        <span>{task}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Final Verification */}
                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Final Verification (Day 3-4)
                  </h4>
                  <div className="space-y-2">
                    {[
                      'Complete end-to-end booking test',
                      'Verify all automated messages send correctly',
                      'Check reporting/analytics are tracking',
                      'Train client on new account navigation',
                      'Document any differences from old account',
                      'Schedule 1-week follow-up check',
                    ].map((task, i) => (
                      <label key={i} className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" className="mt-1 rounded border-gray-300 text-red-600" />
                        <span>{task}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Pro Tip:</strong> Create a shared document with the client to track these tasks. 
                  Most migrations can be fully operational within 3-4 business days with proper planning.
                </p>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Need Help?</h4>
              <p className="text-sm text-gray-600">Contact support for assistance with complex migrations.</p>
            </div>
            <a
              href="mailto:support@aprettygirlmatter.com"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
              <Cloud className="w-7 h-7" />
              GoHighLevel Migration Tool
            </h2>
            <p className="text-white/80">
              Migrate all your data from one GoHighLevel sub-account to another
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowDocs(!showDocs)}
            className="bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            {showDocs ? 'Hide Guide' : 'How to Use'}
          </Button>
        </div>
      </div>

      {/* Documentation Panel */}
      {renderDocumentation()}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            {error}
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Step Content */}
      {currentStep === 'connect' && renderConnectStep()}
      {currentStep === 'analyze' && renderAnalyzeStep()}
      {currentStep === 'select' && renderSelectStep()}
      {currentStep === 'migrate' && renderMigrateStep()}
      {currentStep === 'complete' && renderCompleteStep()}

      {/* History Toggle */}
      {!showHistory && migrationHistory.length > 0 && currentStep !== 'migrate' && (
        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => setShowHistory(true)}>
            <History className="w-4 h-4 mr-2" />
            View Migration History ({migrationHistory.length})
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* History Panel */}
      {showHistory && renderHistory()}
    </div>
  );
}
