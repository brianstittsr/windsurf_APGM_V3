// Canva Integration Types

export interface CanvaDesign {
  id: string;
  title: string;
  thumbnail: {
    url: string;
    width: number;
    height: number;
  };
  urls: {
    edit_url: string;
    view_url: string;
  };
  created_at: string;
  updated_at: string;
  owner?: {
    user_id: string;
    display_name: string;
  };
}

export interface CanvaDesignExport {
  id: string;
  status: 'in_progress' | 'completed' | 'failed';
  urls?: string[];
  error?: {
    code: string;
    message: string;
  };
}

export interface CanvaIntegration {
  userId: string;
  canvaUserId?: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: Date;
  connectedAt: Date;
  lastSync?: Date;
}

export interface CanvaImport {
  id: string;
  userId: string;
  canvaDesignId: string;
  designName: string;
  importedUrl: string;
  originalUrl?: string;
  format: 'png' | 'jpg';
  width: number;
  height: number;
  usedIn: string[];
  importedAt: Date;
}

export interface CanvaAuthState {
  isConnected: boolean;
  isLoading: boolean;
  error?: string;
  user?: {
    id: string;
    displayName: string;
  };
}

export interface CanvaDesignPickerProps {
  onSelect: (design: CanvaDesign) => void;
  onImport: (url: string, designId: string, designName: string) => void;
  onClose: () => void;
  isOpen: boolean;
  destination?: string;
}
