'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useAlertDialog } from '@/components/ui/alert-dialog';
import { 
  Loader2, 
  Link as LinkIcon, 
  Unlink, 
  RefreshCw, 
  Image as ImageIcon,
  Search,
  Download,
  ExternalLink,
  CheckCircle,
  XCircle,
  FolderOpen
} from 'lucide-react';
import { CanvaDesign } from '@/types/canva';

interface CanvaIntegrationProps {
  onImport?: (url: string, designId: string, designName: string) => void;
  showDesignPicker?: boolean;
  destination?: string;
}

export default function CanvaIntegration({ 
  onImport, 
  showDesignPicker = true,
  destination 
}: CanvaIntegrationProps) {
  const { user } = useAuth();
  const { showAlert, showConfirm, AlertDialogComponent } = useAlertDialog();
  
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Design picker state
  const [designs, setDesigns] = useState<CanvaDesign[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDesign, setSelectedDesign] = useState<CanvaDesign | null>(null);
  const [importing, setImporting] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
  }, [user]);

  const checkConnectionStatus = async () => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/canva/auth?action=status&userId=${user.uid}`);
      const data = await response.json();
      
      setIsConfigured(data.configured !== false);
      setIsConnected(data.connected === true);
    } catch (error) {
      console.error('Error checking Canva status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!user?.uid) {
      await showAlert({
        title: 'Not Logged In',
        description: 'Please log in to connect your Canva account.',
        variant: 'warning'
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      const response = await fetch(`/api/canva/auth?action=authorize&userId=${user.uid}`);
      const data = await response.json();
      
      if (data.authUrl) {
        // Open Canva OAuth in new window
        window.location.href = data.authUrl;
      } else {
        throw new Error('No authorization URL returned');
      }
    } catch (error) {
      console.error('Error connecting to Canva:', error);
      await showAlert({
        title: 'Connection Failed',
        description: 'Failed to connect to Canva. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    const confirmed = await showConfirm({
      title: 'Disconnect Canva',
      description: 'Are you sure you want to disconnect your Canva account? You will need to reconnect to import designs.',
      confirmText: 'Disconnect',
      cancelText: 'Cancel'
    });

    if (!confirmed || !user?.uid) return;

    try {
      const response = await fetch('/api/canva/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid })
      });

      if (response.ok) {
        setIsConnected(false);
        setDesigns([]);
        await showAlert({
          title: 'Disconnected',
          description: 'Your Canva account has been disconnected.',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error disconnecting Canva:', error);
    }
  };

  const loadDesigns = async (search?: string) => {
    if (!user?.uid || !isConnected) return;

    setLoadingDesigns(true);
    
    try {
      const params = new URLSearchParams({ userId: user.uid });
      if (search) params.set('search', search);
      
      const response = await fetch(`/api/canva/designs?${params.toString()}`);
      const data = await response.json();
      
      if (data.needsAuth) {
        setIsConnected(false);
        await showAlert({
          title: 'Session Expired',
          description: 'Your Canva session has expired. Please reconnect.',
          variant: 'warning'
        });
        return;
      }
      
      if (data.designs) {
        setDesigns(data.designs);
      }
    } catch (error) {
      console.error('Error loading Canva designs:', error);
    } finally {
      setLoadingDesigns(false);
    }
  };

  const handleImport = async (design: CanvaDesign) => {
    if (!user?.uid) return;

    setImporting(true);
    setSelectedDesign(design);
    
    try {
      const response = await fetch('/api/canva/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          designId: design.id,
          designName: design.title,
          format: 'png',
          destination
        })
      });

      const data = await response.json();
      
      if (data.needsAuth) {
        setIsConnected(false);
        await showAlert({
          title: 'Session Expired',
          description: 'Your Canva session has expired. Please reconnect.',
          variant: 'warning'
        });
        return;
      }

      if (data.success && data.url) {
        if (onImport) {
          onImport(data.url, design.id, design.title);
        }
        
        await showAlert({
          title: 'Import Successful',
          description: `"${design.title}" has been imported successfully.`,
          variant: 'default'
        });
        
        setShowPicker(false);
      } else {
        throw new Error(data.error || 'Import failed');
      }
    } catch (error) {
      console.error('Error importing design:', error);
      await showAlert({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Failed to import design.',
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
      setSelectedDesign(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadDesigns(searchQuery);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#AD6269]" />
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <XCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-800">Canva API Not Configured</h3>
            <p className="text-yellow-700 text-sm mt-1">
              To use Canva integration, please configure the following environment variables:
            </p>
            <ul className="text-yellow-700 text-sm mt-2 list-disc list-inside">
              <li>CANVA_CLIENT_ID</li>
              <li>CANVA_CLIENT_SECRET</li>
              <li>CANVA_REDIRECT_URI</li>
            </ul>
            <p className="text-yellow-700 text-sm mt-2">
              Visit <a href="https://www.canva.dev" target="_blank" rel="noopener noreferrer" className="underline">canva.dev</a> to create a Canva Connect app.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {AlertDialogComponent}
      
      {/* Connection Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isConnected ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#00C4CC"/>
                <path d="M8.5 14.5c0 1.1.9 2 2 2h3c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2h-3c-1.1 0-2 .9-2 2v5z" fill="white"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Canva</h3>
              <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                {isConnected ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Connected
                  </span>
                ) : (
                  'Not connected'
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => checkConnectionStatus()}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Unlink className="w-4 h-4 mr-1" />
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-[#00C4CC] hover:bg-[#00b3ba] text-white"
              >
                {isConnecting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LinkIcon className="w-4 h-4 mr-2" />
                )}
                Connect Canva
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Design Picker */}
      {showDesignPicker && isConnected && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-[#AD6269]" />
              Your Canva Designs
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadDesigns()}
              disabled={loadingDesigns}
            >
              {loadingDesigns ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search designs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
              />
            </div>
            <Button type="submit" disabled={loadingDesigns}>
              Search
            </Button>
          </form>

          {/* Designs Grid */}
          {designs.length === 0 && !loadingDesigns ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No designs found</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadDesigns()}
                className="mt-3"
              >
                Load Designs
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {designs.map((design) => (
                <div
                  key={design.id}
                  className={`relative group rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                    selectedDesign?.id === design.id
                      ? 'border-[#AD6269] ring-2 ring-[#AD6269]/20'
                      : 'border-gray-200 hover:border-[#AD6269]/50'
                  }`}
                  onClick={() => setSelectedDesign(design)}
                >
                  {design.thumbnail?.url ? (
                    <img
                      src={design.thumbnail.url}
                      alt={design.title}
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImport(design);
                      }}
                      disabled={importing}
                      className="bg-[#AD6269] hover:bg-[#9d5860]"
                    >
                      {importing && selectedDesign?.id === design.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-1" />
                          Import
                        </>
                      )}
                    </Button>
                    {design.urls?.edit_url && (
                      <a
                        href={design.urls.edit_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-white text-xs flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Edit in Canva
                      </a>
                    )}
                  </div>
                  
                  {/* Title */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-xs truncate">{design.title || 'Untitled'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {loadingDesigns && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#AD6269]" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
