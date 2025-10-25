'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface RegistrationForm {
  id: string;
  clientName: string;
  clientEmail: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  skinType?: string;
  allergies?: string;
  medications?: string;
  previousProcedures?: string;
  expectations?: string;
  formType?: string;
  status: 'submitted' | 'reviewed' | 'approved' | 'rejected';
  submittedAt?: Date;
  reviewedAt?: Date;
  notes?: string;
}

export default function RegistrationFormsManager() {
  const [forms, setForms] = useState<RegistrationForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'reviewed' | 'approved' | 'rejected'>('all');
  const [selectedForm, setSelectedForm] = useState<RegistrationForm | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      // Try to fetch from healthForms collection
      const formsCollection = collection(db, 'healthForms');
      const formsSnapshot = await getDocs(formsCollection);
      const formsList = formsSnapshot.docs.map(doc => {
        const data = doc.data();
        
        console.log('Raw form data for doc', doc.id, ':', JSON.stringify(data, null, 2));
        
        // Handle nested profile object structure
        const clientName = data.clientName || data.name || data.fullName ||
                          (data.profile?.firstName && data.profile?.lastName ? 
                           `${data.profile.firstName} ${data.profile.lastName}` : '') ||
                          data.profile?.firstName || data.profile?.lastName ||
                          (data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : '') ||
                          data.firstName || data.lastName || '';
        const clientEmail = data.clientEmail || data.email || data.profile?.email || '';
        const phone = data.phone || data.profile?.phone || data.phoneNumber || '';
        
        const mappedForm = {
          ...data,
          id: doc.id,
          clientName,
          clientEmail,
          phone,
          status: data.status || 'submitted'
        };
        
        console.log('Mapped form:', JSON.stringify(mappedForm, null, 2));
        
        return mappedForm as RegistrationForm;
      });
      
      setForms(formsList.sort((a, b) => {
        const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return dateB - dateA;
      }));
    } catch (error) {
      console.error('Error fetching forms:', error);
      alert('Error fetching registration forms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (formId: string, newStatus: string) => {
    try {
      const formRef = doc(db, 'healthForms', formId);
      await updateDoc(formRef, {
        status: newStatus,
        reviewedAt: new Date(),
        notes: reviewNotes
      });
      setReviewNotes('');
      setSelectedForm(null);
      fetchForms();
    } catch (error) {
      console.error('Error updating form:', error);
      alert('Error updating form. Please try again.');
    }
  };

  const handleDeleteForm = async (formId: string, clientName: string) => {
    if (!confirm(`Are you sure you want to delete the form for ${clientName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'healthForms', formId));
      alert('Form deleted successfully!');
      fetchForms();
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Error deleting form. Please try again.');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'submitted': return 'badge bg-info';
      case 'reviewed': return 'badge bg-warning';
      case 'approved': return 'badge bg-success';
      case 'rejected': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  };

  const filteredForms = forms.filter(form => {
    const statusMatch = filterStatus === 'all' || form.status === filterStatus;
    return statusMatch;
  });

  const pendingReview = filteredForms.filter(f => f.status === 'submitted').length;
  const approved = filteredForms.filter(f => f.status === 'approved').length;
  const rejected = filteredForms.filter(f => f.status === 'rejected').length;

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading registration forms...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h4><i className="fas fa-file-alt me-2"></i>Registration Forms</h4>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6 className="card-title">Total Forms</h6>
              <h3>{filteredForms.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h6 className="card-title">Pending Review</h6>
              <h3>{pendingReview}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h6 className="card-title">Approved</h6>
              <h3>{approved}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <h6 className="card-title">Rejected</h6>
              <h3>{rejected}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="btn-group" role="group">
            {(['all', 'submitted', 'reviewed', 'approved', 'rejected'] as const).map(status => (
              <button
                key={status}
                type="button"
                className={`btn ${filterStatus === status ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilterStatus(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Forms Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">Submitted Forms ({filteredForms.length})</h5>
            </div>
            <div className="card-body">
              {filteredForms.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No registration forms found.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Client Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Form Type</th>
                        <th>Submitted</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredForms.map((form) => (
                        <tr key={form.id}>
                          <td><strong>{form.clientName}</strong></td>
                          <td>{form.clientEmail}</td>
                          <td>{form.phone || '-'}</td>
                          <td>
                            <span className="badge bg-secondary">
                              {form.formType || 'Health Form'}
                            </span>
                          </td>
                          <td>
                            {form.submittedAt ? (
                              <small>{new Date(form.submittedAt).toLocaleDateString()}</small>
                            ) : (
                              <small className="text-muted">-</small>
                            )}
                          </td>
                          <td>
                            <span className={getStatusBadgeClass(form.status)}>
                              {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                className="btn btn-outline-info"
                                onClick={() => setSelectedForm(form)}
                                title="View Details"
                                data-bs-toggle="modal"
                                data-bs-target="#formDetailsModal"
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteForm(form.id, form.clientName)}
                                title="Delete Form"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Details Modal */}
      {selectedForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Form Details - {selectedForm.clientName}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedForm(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Name</label>
                    <p>{selectedForm.clientName}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Email</label>
                    <p>{selectedForm.clientEmail}</p>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Phone</label>
                    <p>{selectedForm.phone || '-'}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Location</label>
                    <p>{selectedForm.city && selectedForm.state ? `${selectedForm.city}, ${selectedForm.state}` : '-'}</p>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-12">
                    <label className="form-label fw-bold">Skin Type</label>
                    <p>{selectedForm.skinType || '-'}</p>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-12">
                    <label className="form-label fw-bold">Allergies</label>
                    <p>{selectedForm.allergies || '-'}</p>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-12">
                    <label className="form-label fw-bold">Current Medications</label>
                    <p>{selectedForm.medications || '-'}</p>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-12">
                    <label className="form-label fw-bold">Previous Procedures</label>
                    <p>{selectedForm.previousProcedures || '-'}</p>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-12">
                    <label className="form-label fw-bold">Expectations</label>
                    <p>{selectedForm.expectations || '-'}</p>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-12">
                    <label htmlFor="reviewNotes" className="form-label fw-bold">Review Notes</label>
                    <textarea
                      id="reviewNotes"
                      className="form-control"
                      rows={3}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Add review notes..."
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-12">
                    <label className="form-label fw-bold">Status</label>
                    <select
                      className="form-select"
                      value={selectedForm.status}
                      onChange={(e) => {
                        setSelectedForm({ ...selectedForm, status: e.target.value as any });
                      }}
                    >
                      <option value="submitted">Submitted</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedForm(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleStatusChange(selectedForm.id, selectedForm.status)}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
