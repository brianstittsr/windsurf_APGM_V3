'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  Link as LinkIcon, 
  Search,
  Download,
  ExternalLink,
  X,
  RefreshCw,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';

interface CanvaDesign {
  id: string;
  title: string;
  thumbnail?: {
    url: string;
    width: number;
    height: number;
  };
  urls?: {
    edit_url: string;
    view_url: string;
  };
}

interface CanvaDesignPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (imageUrl: string, designName: string) => void;
  userId?: string;
}

export default function CanvaDesignPicker({ 
  isOpen, 
  onClose, 
  onImport,
  userId 
}: CanvaDesignPickerProps) {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const [designs, setDesigns] = useState<CanvaDesign[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDesign, setSelectedDesign] = useState<CanvaDesign | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      checkConnectionStatus();
    }
  }, [isOpen, userId]);

  const checkConnectionStatus = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/canva/auth?action=status&userId=${userId}`);
      const data = await response.json();
      
      setIsConfigured(data.configured !== false);
      setIsConnected(data.connected === true);
      
      if (data.connected) {
        loadDesigns();
      }
    } catch (err) {
      console.error('Error checking Canva status:', err);
      setError('Failed to check Canva connection status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!userId) return;

    setIsConnecting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/canva/auth?action=authorize&userId=${userId}`);
      const data = await response.json();
      
      if (data.authUrl) {
        // Open Canva OAuth in popup window
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const popup = window.open(
          data.authUrl,
          'canva-auth',
          `width=${width},height=${height},left=${left},top=${top},popup=yes`
        );
        
        // Poll for popup close and check connection
        const pollTimer = setInterval(() => {
          if (popup?.closed) {
            clearInterval(pollTimer);
            setIsConnecting(false);
            checkConnectionStatus();
          }
        }, 500);
      } else {
        throw new Error('No authorization URL returned');
      }
    } catch (err) {
      console.error('Error connecting to Canva:', err);
      setError('Failed to connect to Canva. Please try again.');
      setIsConnecting(false);
    }
  };

  const loadDesigns = async (search?: string) => {
    if (!userId) return;

    setLoadingDesigns(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({ userId });
      if (search) params.set('search', search);
      
      const response = await fetch(`/api/canva/designs?${params.toString()}`);
      const data = await response.json();
      
      if (data.needsAuth) {
        setIsConnected(false);
        setError('Your Canva session has expired. Please reconnect.');
        return;
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setDesigns(data.designs || []);
    } catch (err) {
      console.error('Error loading Canva designs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load designs');
    } finally {
      setLoadingDesigns(false);
    }
  };

  const handleImport = async (design: CanvaDesign) => {
    if (!userId) return;

    setImporting(true);
    setSelectedDesign(design);
    setError(null);
    
    try {
      const response = await fetch('/api/canva/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          designId: design.id,
          designName: design.title,
          format: 'png',
          destination: 'hero-slide'
        })
      });

      const data = await response.json();
      
      if (data.needsAuth) {
        setIsConnected(false);
        setError('Your Canva session has expired. Please reconnect.');
        return;
      }

      if (data.success && data.url) {
        onImport(data.url, design.title);
        onClose();
      } else {
        throw new Error(data.error || 'Import failed');
      }
    } catch (err) {
      console.error('Error importing design:', err);
      setError(err instanceof Error ? err.message : 'Failed to import design');
    } finally {
      setImporting(false);
      setSelectedDesign(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadDesigns(searchQuery);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#00C4CC] to-[#7B2FF7]">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="white"/>
              <path d="M8.5 14.5c0 1.1.9 2 2 2h3c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2h-3c-1.1 0-2 .9-2 2v5z" fill="#00C4CC"/>
            </svg>
            <div>
              <h2 className="text-xl font-bold text-white">Import from Canva</h2>
              <p className="text-white/80 text-sm">Select a design to import as your slide background</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-[#00C4CC] mb-4" />
              <p className="text-gray-500">Checking Canva connection...</p>
            </div>
          ) : isConfigured === false ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00C4CC]/20 to-[#7B2FF7]/20 flex items-center justify-center mx-auto mb-6">
                <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#00C4CC"/>
                  <path d="M8.5 14.5c0 1.1.9 2 2 2h3c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2h-3c-1.1 0-2 .9-2 2v5z" fill="white"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Canva Integration Coming Soon</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Direct Canva import requires API credentials from the Canva Connect program.
              </p>
              
              <div className="bg-gray-50 rounded-xl p-6 max-w-lg mx-auto text-left">
                <h4 className="font-semibold text-gray-800 mb-3">For now, you can:</h4>
                <ol className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00C4CC] text-white flex items-center justify-center text-xs font-bold">1</span>
                    <span>Design your slide background in <a href="https://www.canva.com" target="_blank" rel="noopener noreferrer" className="text-[#00C4CC] font-medium hover:underline">Canva</a></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00C4CC] text-white flex items-center justify-center text-xs font-bold">2</span>
                    <span>Download it as PNG or JPG (Share → Download)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#00C4CC] text-white flex items-center justify-center text-xs font-bold">3</span>
                    <span>Drag & drop the file into the upload area above</span>
                  </li>
                </ol>
              </div>
              
              <Button
                variant="outline"
                onClick={onClose}
                className="mt-6"
              >
                Got it, I'll upload manually
              </Button>
            </div>
          ) : !isConnected ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-[#00C4CC]/10 flex items-center justify-center mx-auto mb-6">
                <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#00C4CC"/>
                  <path d="M8.5 14.5c0 1.1.9 2 2 2h3c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2h-3c-1.1 0-2 .9-2 2v5z" fill="white"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Canva Account</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Connect your Canva account to browse and import your designs directly into your hero slides.
              </p>
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-[#00C4CC] hover:bg-[#00b3ba] text-white px-8 py-3 text-lg"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-5 h-5 mr-2" />
                    Connect Canva
                  </>
                )}
              </Button>
              {error && (
                <p className="text-red-500 text-sm mt-4">{error}</p>
              )}
            </div>
          ) : (
            <>
              {/* Search */}
              <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your Canva designs..."
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C4CC] focus:border-transparent"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loadingDesigns}
                  className="bg-[#00C4CC] hover:bg-[#00b3ba] px-6"
                >
                  Search
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => loadDesigns()}
                  disabled={loadingDesigns}
                >
                  <RefreshCw className={`w-5 h-5 ${loadingDesigns ? 'animate-spin' : ''}`} />
                </Button>
              </form>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Designs Grid */}
              {loadingDesigns ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-10 h-10 animate-spin text-[#00C4CC] mb-4" />
                  <p className="text-gray-500">Loading your designs...</p>
                </div>
              ) : designs.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No designs found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery ? 'Try a different search term' : 'Click the button below to load your Canva designs'}
                  </p>
                  <Button
                    onClick={() => loadDesigns()}
                    className="bg-[#00C4CC] hover:bg-[#00b3ba]"
                  >
                    Load My Designs
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {designs.map((design) => (
                    <div
                      key={design.id}
                      className={`relative group rounded-xl border-2 overflow-hidden cursor-pointer transition-all ${
                        selectedDesign?.id === design.id
                          ? 'border-[#00C4CC] ring-4 ring-[#00C4CC]/20'
                          : 'border-gray-200 hover:border-[#00C4CC]/50 hover:shadow-lg'
                      }`}
                    >
                      {design.thumbnail?.url ? (
                        <img
                          src={design.thumbnail.url}
                          alt={design.title}
                          className="w-full aspect-video object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="w-10 h-10 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end p-4">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImport(design);
                          }}
                          disabled={importing}
                          className="bg-[#00C4CC] hover:bg-[#00b3ba] w-full mb-2"
                        >
                          {importing && selectedDesign?.id === design.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Importing...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Use This Design
                            </>
                          )}
                        </Button>
                        {design.urls?.edit_url && (
                          <a
                            href={design.urls.edit_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-white/80 text-xs flex items-center gap-1 hover:text-white"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Edit in Canva
                          </a>
                        )}
                      </div>
                      
                      {/* Title */}
                      <div className="p-3 bg-white">
                        <p className="text-sm font-medium text-gray-800 truncate">{design.title || 'Untitled'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
