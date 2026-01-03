/**
 * GoHighLevel Migration Types
 * Type definitions for GHL sub-account migration
 */

// Migration Job Status
export type MigrationStatus = 
  | 'pending'
  | 'analyzing'
  | 'exporting'
  | 'importing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'rolling_back';

// Data categories that can be migrated
export type MigrationCategory = 
  | 'contacts'
  | 'tags'
  | 'customFields'
  | 'pipelines'
  | 'opportunities'
  | 'calendars'
  | 'appointments'
  | 'forms'
  | 'surveys'
  | 'workflows'
  | 'campaigns'
  | 'aiPrompts'
  | 'templates'
  | 'media';

// Account credentials for source/destination
export interface GHLAccountCredentials {
  apiKey: string;
  locationId: string;
  accountName?: string;
  isValid?: boolean;
}

// Data counts from analysis
export interface MigrationDataCounts {
  contacts: number;
  tags: number;
  customFields: number;
  pipelines: number;
  opportunities: number;
  calendars: number;
  appointments: number;
  forms: number;
  surveys: number;
  workflows: number;
  campaigns: number;
  aiPrompts: number;
  templates: number;
  media: number;
}

// Migration options/settings
export interface MigrationOptions {
  categories: MigrationCategory[];
  includeHistoricalAppointments: boolean;
  includeFormSubmissions: boolean;
  includeConversationHistory: boolean;
  mergeDuplicateContacts: boolean;
  overwriteExisting: boolean;
  dateRangeStart?: string;
  dateRangeEnd?: string;
}

// ID mapping between source and destination
export interface IdMapping {
  category: MigrationCategory;
  sourceId: string;
  destinationId: string;
  name?: string;
}

// Individual item migration result
export interface MigrationItemResult {
  category: MigrationCategory;
  sourceId: string;
  destinationId?: string;
  name: string;
  success: boolean;
  error?: string;
  timestamp: string;
}

// Category migration progress
export interface CategoryProgress {
  category: MigrationCategory;
  total: number;
  processed: number;
  successful: number;
  failed: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  errors: string[];
}

// Overall migration job
export interface MigrationJob {
  id: string;
  sourceAccount: GHLAccountCredentials;
  destinationAccount: GHLAccountCredentials;
  options: MigrationOptions;
  status: MigrationStatus;
  progress: {
    overall: number;
    currentCategory?: MigrationCategory;
    currentOperation?: string;
    categories: Record<MigrationCategory, CategoryProgress>;
  };
  dataCounts: MigrationDataCounts;
  idMappings: IdMapping[];
  results: MigrationItemResult[];
  startedAt?: string;
  completedAt?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// Exported data structure
export interface ExportedData {
  exportedAt: string;
  sourceLocationId: string;
  version: string;
  contacts?: any[];
  tags?: any[];
  customFields?: any[];
  pipelines?: any[];
  opportunities?: any[];
  calendars?: any[];
  appointments?: any[];
  forms?: any[];
  surveys?: any[];
  workflows?: any[];
  campaigns?: any[];
  aiPrompts?: any[];
  templates?: any[];
  media?: any[];
}

// Contact export structure
export interface ExportedContact {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  companyName?: string;
  website?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  dnd?: boolean;
  dndSettings?: any;
  source?: string;
  dateAdded?: string;
}

// Pipeline export structure
export interface ExportedPipeline {
  id: string;
  name: string;
  stages: {
    id: string;
    name: string;
    position: number;
  }[];
}

// Calendar export structure
export interface ExportedCalendar {
  id: string;
  name: string;
  description?: string;
  timezone?: string;
  availability?: any;
  appointmentTypes?: any[];
}

// Form export structure
export interface ExportedForm {
  id: string;
  name: string;
  fields: any[];
  settings?: any;
}

// Workflow export structure (limited due to API)
export interface ExportedWorkflow {
  id: string;
  name: string;
  status: string;
  triggers?: any[];
  actions?: any[];
  // Note: Full workflow details may not be available via API
}

// AI Prompt export structure
export interface ExportedAIPrompt {
  id: string;
  name: string;
  type: string;
  prompt: string;
  settings?: any;
}

// Template export structure
export interface ExportedTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'snippet';
  content: string;
  subject?: string;
}

// Migration validation result
export interface ValidationResult {
  isValid: boolean;
  sourceAccount: {
    isValid: boolean;
    locationName?: string;
    error?: string;
  };
  destinationAccount: {
    isValid: boolean;
    locationName?: string;
    error?: string;
  };
  warnings: string[];
  errors: string[];
}

// Migration analysis result
export interface AnalysisResult {
  success: boolean;
  dataCounts: MigrationDataCounts;
  estimatedDuration: number; // in minutes
  warnings: string[];
  errors: string[];
}

// API response types
export interface MigrationApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
