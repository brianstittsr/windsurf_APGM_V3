'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import QRCode from 'qrcode';
import { useAlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface QRCodeData {
  id: string;
  name: string;
  url: string;
  description: string;
  qrCodeDataUrl: string;
  scans: number;
  createdAt: any;
  lastScannedAt?: any;
  isActive: boolean;
}

export default function QRCodeManager() {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQRCode, setEditingQRCode] = useState<QRCodeData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    isActive: true
  });
  const [generatingQR, setGeneratingQR] = useState(false);
  const { showAlert, showConfirm, AlertDialogComponent } = useAlertDialog();

  useEffect(() => {
    loadQRCodes();
  }, []);

  const loadQRCodes = async () => {
    try {
      setLoading(true);
      const db = getDb();
      const qrCodesRef = collection(db, 'qr-codes');
      const q = query(qrCodesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const qrCodesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as QRCodeData[];
      
      setQrCodes(qrCodesData);
    } catch (error) {
      console.error('Error loading QR codes:', error);
      showAlert({ title: 'Error', description: 'Failed to load QR codes', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const generateQRCodeImage = async (url: string): Promise<string> => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.url.trim()) {
      await showAlert({ title: 'Missing Information', description: 'Please fill in all required fields', variant: 'warning' });
      return;
    }

    try {
      setGeneratingQR(true);
      const db = getDb();
      
      // Generate QR code image
      const qrCodeDataUrl = await generateQRCodeImage(formData.url);
      
      if (editingQRCode) {
        // Update existing QR code
        const qrCodeRef = doc(db, 'qr-codes', editingQRCode.id);
        await updateDoc(qrCodeRef, {
          name: formData.name,
          url: formData.url,
          description: formData.description,
          qrCodeDataUrl,
          isActive: formData.isActive
        });
      } else {
        // Create new QR code
        await addDoc(collection(db, 'qr-codes'), {
          name: formData.name,
          url: formData.url,
          description: formData.description,
          qrCodeDataUrl,
          scans: 0,
          isActive: formData.isActive,
          createdAt: Timestamp.now()
        });
      }
      
      await loadQRCodes();
      handleCloseModal();
      await showAlert({ title: 'Success', description: editingQRCode ? 'QR Code updated successfully!' : 'QR Code created successfully!', variant: 'success' });
    } catch (error) {
      console.error('Error saving QR code:', error);
      await showAlert({ title: 'Error', description: 'Failed to save QR code', variant: 'destructive' });
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleEdit = (qrCode: QRCodeData) => {
    setEditingQRCode(qrCode);
    setFormData({
      name: qrCode.name,
      url: qrCode.url,
      description: qrCode.description || '',
      isActive: qrCode.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({ title: 'Delete QR Code', description: 'Are you sure you want to delete this QR code?', confirmText: 'Delete', variant: 'destructive' });
    if (!confirmed) return;
    
    try {
      const db = getDb();
      await deleteDoc(doc(db, 'qr-codes', id));
      await loadQRCodes();
      await showAlert({ title: 'Success', description: 'QR Code deleted successfully!', variant: 'success' });
    } catch (error) {
      console.error('Error deleting QR code:', error);
      await showAlert({ title: 'Error', description: 'Failed to delete QR code', variant: 'destructive' });
    }
  };

  const handleDownload = (qrCode: QRCodeData) => {
    const link = document.createElement('a');
    link.href = qrCode.qrCodeDataUrl;
    link.download = `${qrCode.name.replace(/\s+/g, '_')}_QRCode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQRCode(null);
    setFormData({
      name: '',
      url: '',
      description: '',
      isActive: true
    });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-qrcode text-[#AD6269]"></i>
            QR Code Manager
          </h2>
          <p className="text-gray-500 text-sm mt-1">Generate, track, and manage QR codes for your business</p>
        </div>
        <Button 
          onClick={() => setShowModal(true)}
          className="bg-[#AD6269] hover:bg-[#9d5860]"
        >
          <i className="fas fa-plus mr-2"></i>Create QR Code
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total QR Codes */}
        <div className="bg-gradient-to-br from-[#AD6269] to-[#c17a80] rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Total QR Codes</p>
              <p className="text-3xl font-bold mt-1">{qrCodes.length}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fas fa-qrcode text-xl"></i>
            </div>
          </div>
        </div>

        {/* Active QR Codes */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Active</p>
              <p className="text-3xl font-bold mt-1">{qrCodes.filter(qr => qr.isActive).length}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fas fa-check-circle text-xl"></i>
            </div>
          </div>
        </div>

        {/* Total Scans */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Total Scans</p>
              <p className="text-3xl font-bold mt-1">{qrCodes.reduce((sum, qr) => sum + (qr.scans || 0), 0)}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fas fa-chart-line text-xl"></i>
            </div>
          </div>
        </div>

        {/* Inactive QR Codes */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Inactive</p>
              <p className="text-3xl font-bold mt-1">{qrCodes.filter(qr => !qr.isActive).length}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <i className="fas fa-pause-circle text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* QR Codes Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-[#AD6269]">
          <h3 className="font-semibold text-white">All QR Codes ({qrCodes.length})</h3>
        </div>
        <div className="p-6">
          {qrCodes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-qrcode text-4xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No QR Codes Yet</h3>
              <p className="text-gray-500 mb-4">Create your first QR code to start tracking scans</p>
              <Button 
                onClick={() => setShowModal(true)}
                className="bg-[#AD6269] hover:bg-[#9d5860]"
              >
                <i className="fas fa-plus mr-2"></i>Create QR Code
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {qrCodes.map(qrCode => (
                <div 
                  key={qrCode.id} 
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-gray-900 truncate flex-1">{qrCode.name}</h4>
                      <span className={`ml-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                        qrCode.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {qrCode.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  {/* QR Code Image */}
                  <div className="p-6 bg-gray-50 flex items-center justify-center">
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                      <img 
                        src={qrCode.qrCodeDataUrl} 
                        alt={qrCode.name}
                        className="w-40 h-40 object-contain"
                      />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Description */}
                    {qrCode.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">{qrCode.description}</p>
                    )}

                    {/* URL */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Target URL</p>
                      <a 
                        href={qrCode.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#AD6269] hover:text-[#9d5860] text-sm font-medium truncate block"
                      >
                        {qrCode.url}
                      </a>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Scans</p>
                        <p className="text-lg font-bold text-gray-900">{qrCode.scans || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="text-sm font-medium text-gray-700">{formatDate(qrCode.createdAt)}</p>
                      </div>
                    </div>

                    {qrCode.lastScannedAt && (
                      <div className="pt-2">
                        <p className="text-xs text-gray-500">Last Scanned</p>
                        <p className="text-sm font-medium text-gray-700">{formatDate(qrCode.lastScannedAt)}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="px-4 pb-4 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-[#AD6269] hover:bg-[#9d5860]"
                      onClick={() => handleDownload(qrCode)}
                    >
                      <i className="fas fa-download mr-1"></i>Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-500 text-blue-500 hover:bg-blue-50"
                      onClick={() => handleEdit(qrCode)}
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                      onClick={() => handleDelete(qrCode.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingQRCode ? 'Edit QR Code' : 'Create New QR Code'}
              </h3>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={handleCloseModal}
                disabled={generatingQR}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                  <Input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Facebook Reviews"
                    required
                    disabled={generatingQR}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">Target URL <span className="text-red-500">*</span></Label>
                  <Input
                    type="url"
                    id="url"
                    value={formData.url}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com"
                    required
                    disabled={generatingQR}
                  />
                  <p className="text-xs text-gray-500">The URL users will be directed to when scanning</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description for internal reference"
                    rows={3}
                    disabled={generatingQR}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    className="h-4 w-4 rounded border-gray-300 text-[#AD6269] focus:ring-[#AD6269]"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    disabled={generatingQR}
                  />
                  <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
                    Active (QR code is in use)
                  </Label>
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                  disabled={generatingQR}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#AD6269] hover:bg-[#9d5860]"
                  disabled={generatingQR}
                >
                  {generatingQR ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      {editingQRCode ? 'Update' : 'Create'} QR Code
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {AlertDialogComponent}
    </div>
  );
}
