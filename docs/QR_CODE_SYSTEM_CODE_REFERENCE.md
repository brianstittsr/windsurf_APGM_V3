# QR Code System - Code Reference

This document provides code snippets and examples for recreating the QR Code system.

## 1. Component Structure (React/Next.js)

### QRCodeManager Component Skeleton

```typescript
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase'; // Adjust path
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

  // Load QR codes from database
  const loadQRCodes = async () => {
    // Implementation
  };

  // Generate QR code image
  const generateQRCodeImage = async (url: string): Promise<string> => {
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataUrl;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qrCodeDataUrl = await generateQRCodeImage(formData.url);
    // Save to database
  };

  // Handle download
  const handleDownload = (qrCode: QRCodeData) => {
    const link = document.createElement('a');
    link.href = qrCode.qrCodeDataUrl;
    link.download = `${qrCode.name.replace(/\s+/g, '_')}_QRCode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Statistics Cards */}
      {/* QR Code Grid */}
      {/* Create/Edit Modal */}
    </div>
  );
}
```

## 2. API Endpoints

### Scan Tracking Endpoint

```typescript
// /api/qr-codes/scan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, increment, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { qrCodeId } = await request.json();

    if (!qrCodeId) {
      return NextResponse.json(
        { error: 'QR Code ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const qrCodeRef = doc(db, 'qr-codes', qrCodeId);
    const qrCodeDoc = await getDoc(qrCodeRef);

    if (!qrCodeDoc.exists()) {
      return NextResponse.json(
        { error: 'QR Code not found' },
        { status: 404 }
      );
    }

    const qrCodeData = qrCodeDoc.data();

    // Update scan count and last scanned timestamp
    await updateDoc(qrCodeRef, {
      scans: increment(1),
      lastScannedAt: Timestamp.now()
    });

    return NextResponse.json({
      success: true,
      url: qrCodeData.url,
      scans: (qrCodeData.scans || 0) + 1
    });
  } catch (error) {
    console.error('Error tracking QR code scan:', error);
    return NextResponse.json(
      { error: 'Failed to track scan' },
      { status: 500 }
    );
  }
}
```

### Analytics Endpoint

```typescript
// /api/qr-codes/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const qrCodesRef = collection(db, 'qr-codes');
    const q = query(qrCodesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    const qrCodes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate analytics
    const totalQRCodes = qrCodes.length;
    const activeQRCodes = qrCodes.filter((qr: any) => qr.isActive).length;
    const totalScans = qrCodes.reduce((sum: number, qr: any) => sum + (qr.scans || 0), 0);
    const averageScans = totalQRCodes > 0 ? Math.round(totalScans / totalQRCodes) : 0;

    // Top performing QR codes
    const topPerformers = qrCodes
      .sort((a: any, b: any) => (b.scans || 0) - (a.scans || 0))
      .slice(0, 5)
      .map((qr: any) => ({
        id: qr.id,
        name: qr.name,
        scans: qr.scans || 0,
        url: qr.url
      }));

    return NextResponse.json({
      success: true,
      analytics: {
        totalQRCodes,
        activeQRCodes,
        inactiveQRCodes: totalQRCodes - activeQRCodes,
        totalScans,
        averageScans,
        topPerformers
      }
    });
  } catch (error) {
    console.error('Error fetching QR code analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
```

## 3. Public Redirect Page

```typescript
// /app/qr/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function QRRedirectPage() {
  const params = useParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trackAndRedirect = async () => {
      const qrCodeId = params.id as string;

      if (!qrCodeId) {
        setError('Invalid QR code');
        return;
      }

      try {
        const response = await fetch('/api/qr-codes/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qrCodeId }),
        });

        if (!response.ok) {
          throw new Error('Failed to track QR code scan');
        }

        const data = await response.json();

        if (data.url) {
          window.location.href = data.url;
        } else {
          setError('Invalid QR code');
        }
      } catch (error) {
        console.error('Error tracking QR code:', error);
        setError('Failed to process QR code');
      }
    };

    trackAndRedirect();
  }, [params.id]);

  if (error) {
    return (
      <div className="error-container">
        <h2>QR Code Error</h2>
        <p>{error}</p>
        <a href="/">Return to Home</a>
      </div>
    );
  }

  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <h3>Redirecting...</h3>
      <p>Please wait while we redirect you</p>
    </div>
  );
}
```

## 4. Database Schema

### Firestore Structure

```
Collection: qr-codes
├── Document: [auto-generated-id]
│   ├── name: string
│   ├── url: string
│   ├── description: string
│   ├── qrCodeDataUrl: string (base64)
│   ├── scans: number
│   ├── isActive: boolean
│   ├── createdAt: Timestamp
│   ├── lastScannedAt: Timestamp (optional)
│   └── updatedAt: Timestamp (optional)
```

### MongoDB Schema

```javascript
const qrCodeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  description: { type: String, default: '' },
  qrCodeDataUrl: { type: String, required: true },
  scans: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastScannedAt: { type: Date },
  updatedAt: { type: Date }
});
```

### PostgreSQL Schema

```sql
CREATE TABLE qr_codes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  qr_code_data_url TEXT NOT NULL,
  scans INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_scanned_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX idx_qr_codes_is_active ON qr_codes(is_active);
CREATE INDEX idx_qr_codes_scans ON qr_codes(scans DESC);
```

## 5. Statistics Cards JSX

```jsx
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
```

## 6. QR Code Card JSX

```jsx
<div className="col-md-6 col-lg-4 mb-4">
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
```

## 7. Create/Edit Modal JSX

```jsx
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
              />
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
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
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-save me-2"></i>
              {editingQRCode ? 'Update' : 'Create'} QR Code
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
```

## 8. Initialization Script

```typescript
// scripts/initializeQRCodes.ts
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import QRCode from 'qrcode';

async function generateQRCodeImage(url: string): Promise<string> {
  const qrCodeDataUrl = await QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: { dark: '#000000', light: '#FFFFFF' }
  });
  return qrCodeDataUrl;
}

async function initializeQRCodes() {
  const db = getFirestore();
  const qrCodesRef = db.collection('qr-codes');

  // Check if already exists
  const existing = await qrCodesRef.where('name', '==', 'Customer Reviews').get();

  if (existing.empty) {
    const reviewUrl = 'YOUR_REVIEW_URL_HERE';
    const qrCodeDataUrl = await generateQRCodeImage(reviewUrl);

    await qrCodesRef.add({
      name: 'Customer Reviews',
      url: reviewUrl,
      description: 'Scan to leave us a review',
      qrCodeDataUrl,
      scans: 0,
      isActive: true,
      createdAt: Timestamp.now()
    });

    console.log('✅ QR code created successfully!');
  } else {
    console.log('✅ QR code already exists');
  }
}

initializeQRCodes();
```

## 9. Package Installation

```bash
# Install QR code generation library
npm install qrcode @types/qrcode

# Or with yarn
yarn add qrcode @types/qrcode

# Or with pnpm
pnpm add qrcode @types/qrcode
```

## 10. Dashboard Integration

```typescript
// Add to dashboard page
import QRCodeManager from '@/components/admin/QRCodeManager';

// Add to tab type
type TabType = '...' | 'qrcodes';

// Add to switch statement
case 'qrcodes':
  return <QRCodeManager />;

// Add to navigation
<li className="nav-item">
  <button
    className={`nav-link ${activeTab === 'qrcodes' ? 'active' : ''}`}
    onClick={() => setActiveTab('qrcodes')}
  >
    <i className="fas fa-qrcode me-2"></i>QR Codes
  </button>
</li>

// Add to overview cards
<div className="card">
  <div className="card-body">
    <h5 className="card-title">QR Codes</h5>
    <p className="card-text">Generate and track QR codes</p>
    <button
      className="btn btn-primary"
      onClick={() => setActiveTab('qrcodes')}
    >
      Manage QR Codes
    </button>
  </div>
</div>
```

## 11. Utility Functions

```typescript
// Format date helper
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

// Validate URL helper
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
```

## 12. Testing Commands

```bash
# Run initialization script
npm run init-qr-codes

# Test QR code generation
node -e "const QRCode = require('qrcode'); QRCode.toDataURL('https://example.com').then(console.log);"

# Check database
# (Use your database CLI tool)
```

---

## Notes

- All code snippets are TypeScript/React examples
- Adjust imports and paths for your project structure
- Replace placeholder URLs with actual URLs
- Add error boundaries for production
- Implement proper authentication checks
- Add loading states for better UX
- Consider adding rate limiting for scan endpoint
