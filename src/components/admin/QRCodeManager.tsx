'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import QRCode from 'qrcode';

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
      alert('Failed to load QR codes');
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
      alert('Please fill in all required fields');
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
      alert(editingQRCode ? 'QR Code updated successfully!' : 'QR Code created successfully!');
    } catch (error) {
      console.error('Error saving QR code:', error);
      alert('Failed to save QR code');
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
    if (!confirm('Are you sure you want to delete this QR code?')) return;
    
    try {
      const db = getDb();
      await deleteDoc(doc(db, 'qr-codes', id));
      await loadQRCodes();
      alert('QR Code deleted successfully!');
    } catch (error) {
      console.error('Error deleting QR code:', error);
      alert('Failed to delete QR code');
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
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="mb-2">QR Code Manager</h3>
              <p className="text-muted">Generate, track, and manage QR codes for your business</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <i className="fas fa-plus me-2"></i>Create QR Code
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6 className="card-title">Total QR Codes</h6>
              <h2 className="mb-0">{qrCodes.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h6 className="card-title">Active QR Codes</h6>
              <h2 className="mb-0">{qrCodes.filter(qr => qr.isActive).length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h6 className="card-title">Total Scans</h6>
              <h2 className="mb-0">{qrCodes.reduce((sum, qr) => sum + (qr.scans || 0), 0)}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h6 className="card-title">Inactive QR Codes</h6>
              <h2 className="mb-0">{qrCodes.filter(qr => !qr.isActive).length}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* QR Codes Grid */}
      <div className="row">
        {qrCodes.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              No QR codes created yet. Click "Create QR Code" to get started!
            </div>
          </div>
        ) : (
          qrCodes.map(qrCode => (
            <div key={qrCode.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title mb-0">{qrCode.name}</h5>
                    <span className={`badge ${qrCode.isActive ? 'bg-success' : 'bg-secondary'}`}>
                      {qrCode.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {/* QR Code Image */}
                  <div className="text-center mb-3">
                    <img 
                      src={qrCode.qrCodeDataUrl} 
                      alt={qrCode.name}
                      className="img-fluid"
                      style={{ maxWidth: '200px', border: '1px solid #dee2e6', padding: '10px' }}
                    />
                  </div>

                  {/* Description */}
                  {qrCode.description && (
                    <p className="text-muted small mb-2">{qrCode.description}</p>
                  )}

                  {/* URL */}
                  <div className="mb-3">
                    <small className="text-muted d-block mb-1">Target URL:</small>
                    <a 
                      href={qrCode.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary text-decoration-none small"
                      style={{ wordBreak: 'break-all' }}
                    >
                      {qrCode.url}
                    </a>
                  </div>

                  {/* Statistics */}
                  <div className="row mb-3">
                    <div className="col-6">
                      <small className="text-muted d-block">Scans</small>
                      <strong>{qrCode.scans || 0}</strong>
                    </div>
                    <div className="col-6">
                      <small className="text-muted d-block">Created</small>
                      <strong className="small">{formatDate(qrCode.createdAt)}</strong>
                    </div>
                  </div>

                  {qrCode.lastScannedAt && (
                    <div className="mb-3">
                      <small className="text-muted d-block">Last Scanned</small>
                      <strong className="small">{formatDate(qrCode.lastScannedAt)}</strong>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-primary flex-fill"
                      onClick={() => handleDownload(qrCode)}
                    >
                      <i className="fas fa-download me-1"></i>Download
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => handleEdit(qrCode)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(qrCode.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingQRCode ? 'Edit QR Code' : 'Create New QR Code'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  disabled={generatingQR}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Facebook Reviews"
                      required
                      disabled={generatingQR}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Target URL *</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://example.com"
                      required
                      disabled={generatingQR}
                    />
                    <small className="text-muted">The URL users will be directed to when scanning</small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description for internal reference"
                      rows={3}
                      disabled={generatingQR}
                    />
                  </div>

                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      disabled={generatingQR}
                    />
                    <label className="form-check-label" htmlFor="isActive">
                      Active (QR code is in use)
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                    disabled={generatingQR}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={generatingQR}
                  >
                    {generatingQR ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        {editingQRCode ? 'Update' : 'Create'} QR Code
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
