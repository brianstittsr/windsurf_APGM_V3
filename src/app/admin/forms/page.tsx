'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DatabaseService } from '@/services/database';
import { HealthForm, ContactForm, CandidateAssessment, User } from '@/types/database';
import AdminLayout from '@/components/AdminLayout';

export default function FormsManagement() {
  const [healthForms, setHealthForms] = useState<HealthForm[]>([]);
  const [contactForms, setContactForms] = useState<ContactForm[]>([]);
  const [assessments, setAssessments] = useState<CandidateAssessment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'health' | 'contact' | 'assessments'>('health');

  useEffect(() => {
    loadData();
    // Set a mock current user for development
    setCurrentUser({
      id: 'admin-example',
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        phone: '(555) 000-0000',
        dateOfBirth: '1990-01-01',
        address: '123 Admin Street',
        city: 'Raleigh',
        state: 'NC',
        zipCode: '27601',
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '(555) 000-0001',
        preferredContactMethod: 'email',
        hearAboutUs: 'System Administrator',
        createdAt: { seconds: 1640995200, nanoseconds: 0 } as any,
        updatedAt: { seconds: 1640995200, nanoseconds: 0 } as any
      },
      role: 'admin',
      isActive: true
    });
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all form data
      const [healthFormsData, contactFormsData, assessmentsData, usersData] = await Promise.all([
        DatabaseService.getAll<HealthForm>('healthForms'),
        DatabaseService.getAll<ContactForm>('contactForms'),
        DatabaseService.getAll<CandidateAssessment>('candidateAssessments'),
        DatabaseService.getAll<User>('users')
      ]);

      setHealthForms(healthFormsData);
      setContactForms(contactFormsData);
      setAssessments(assessmentsData);
      setUsers(usersData);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load forms data');
    } finally {
      setLoading(false);
    }
  };

  const handleContactFormStatusChange = async (formId: string, newStatus: string) => {
    try {
      await DatabaseService.update('contactForms', formId, {
        status: newStatus,
        respondedAt: newStatus === 'responded' ? new Date() : undefined,
        respondedBy: newStatus === 'responded' ? currentUser?.id : undefined
      });
      await loadData();
      alert('Contact form status updated successfully!');
    } catch (error) {
      console.error('Error updating contact form status:', error);
      alert('Failed to update contact form status');
    }
  };

  const getClientName = (clientId: string) => {
    const client = users.find((u: User) => u.id === clientId);
    return client ? `${client.profile.firstName} ${client.profile.lastName}` : 'Unknown Client';
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'new': return 'bg-primary';
      case 'responded': return 'bg-success';
      case 'closed': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  if (!currentUser) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading forms...</span>
          </div>
          <p className="mt-2">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout title="Forms Management">
      <div>
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Forms Management</h2>
              <button className="btn btn-primary" onClick={loadData}>
                <i className="fas fa-sync-alt me-2"></i>
                Refresh
              </button>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
                <button className="btn btn-outline-danger ms-2" onClick={loadData}>
                  Try Again
                </button>
              </div>
            )}

            {/* Summary Cards */}
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card bg-primary text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h5 className="card-title">Health Forms</h5>
                        <h2>{healthForms.length}</h2>
                      </div>
                      <div className="align-self-center">
                        <i className="fas fa-heartbeat fa-2x"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-success text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h5 className="card-title">Contact Forms</h5>
                        <h2>{contactForms.length}</h2>
                      </div>
                      <div className="align-self-center">
                        <i className="fas fa-envelope fa-2x"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-info text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <div>
                        <h5 className="card-title">Assessments</h5>
                        <h2>{assessments.length}</h2>
                      </div>
                      <div className="align-self-center">
                        <i className="fas fa-clipboard-check fa-2x"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'health' ? 'active' : ''}`}
                  onClick={() => setActiveTab('health')}
                >
                  <i className="fas fa-heartbeat me-2"></i>
                  Health Forms ({healthForms.length})
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'contact' ? 'active' : ''}`}
                  onClick={() => setActiveTab('contact')}
                >
                  <i className="fas fa-envelope me-2"></i>
                  Contact Forms ({contactForms.length})
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'assessments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('assessments')}
                >
                  <i className="fas fa-clipboard-check me-2"></i>
                  Assessments ({assessments.length})
                </button>
              </li>
            </ul>

            {/* Health Forms Tab */}
            {activeTab === 'health' && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <span className="badge bg-primary me-2">{healthForms.length}</span>
                    Health & Consent Forms
                  </h5>
                </div>
                <div className="card-body">
                  {healthForms.length === 0 ? (
                    <p className="text-muted">No health forms found.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Client</th>
                            <th>Appointment</th>
                            <th>Signed Date</th>
                            <th>Valid</th>
                            <th>Clearance Required</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {healthForms.map((form) => (
                            <tr key={form.id}>
                              <td>{getClientName(form.clientId)}</td>
                              <td>
                                <small className="text-muted">ID: {form.appointmentId}</small>
                              </td>
                              <td>{formatDate(form.signedAt)}</td>
                              <td>
                                <span className={`badge ${form.isValid ? 'bg-success' : 'bg-danger'}`}>
                                  {form.isValid ? 'Valid' : 'Invalid'}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${form.clearanceRequired ? 'bg-warning' : 'bg-success'}`}>
                                  {form.clearanceRequired ? 'Required' : 'Not Required'}
                                </span>
                              </td>
                              <td>
                                <button className="btn btn-sm btn-outline-primary me-2">
                                  <i className="fas fa-eye"></i>
                                  View
                                </button>
                                <button className="btn btn-sm btn-outline-secondary">
                                  <i className="fas fa-download"></i>
                                  Download
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Forms Tab */}
            {activeTab === 'contact' && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <span className="badge bg-success me-2">{contactForms.length}</span>
                    Contact Forms
                  </h5>
                </div>
                <div className="card-body">
                  {contactForms.length === 0 ? (
                    <p className="text-muted">No contact forms found.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Service</th>
                            <th>Submitted</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contactForms.map((form) => (
                            <tr key={form.id}>
                              <td>{form.name}</td>
                              <td>{form.email}</td>
                              <td>{form.service}</td>
                              <td>{formatDate(form.submittedAt)}</td>
                              <td>
                                <span className={`badge ${getStatusBadgeClass(form.status)}`}>
                                  {form.status}
                                </span>
                              </td>
                              <td>
                                <select 
                                  className="form-select form-select-sm me-2"
                                  value={form.status}
                                  onChange={(e) => handleContactFormStatusChange(form.id, e.target.value)}
                                  style={{ width: 'auto', display: 'inline-block' }}
                                >
                                  <option value="new">New</option>
                                  <option value="responded">Responded</option>
                                  <option value="closed">Closed</option>
                                </select>
                                <button className="btn btn-sm btn-outline-primary">
                                  <i className="fas fa-eye"></i>
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assessments Tab */}
            {activeTab === 'assessments' && (
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <span className="badge bg-info me-2">{assessments.length}</span>
                    Candidate Assessments
                  </h5>
                </div>
                <div className="card-body">
                  {assessments.length === 0 ? (
                    <p className="text-muted">No assessments found.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Client</th>
                            <th>Completed</th>
                            <th>Score</th>
                            <th>Good Candidate</th>
                            <th>Consultation Required</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assessments.map((assessment) => (
                            <tr key={assessment.id}>
                              <td>
                                {assessment.clientId ? getClientName(assessment.clientId) : 'Anonymous'}
                              </td>
                              <td>{formatDate(assessment.completedAt)}</td>
                              <td>
                                <span className={`badge ${assessment.result.score >= 80 ? 'bg-success' : assessment.result.score >= 60 ? 'bg-warning' : 'bg-danger'}`}>
                                  {assessment.result.score}%
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${assessment.result.isGoodCandidate ? 'bg-success' : 'bg-danger'}`}>
                                  {assessment.result.isGoodCandidate ? 'Yes' : 'No'}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${assessment.result.requiresConsultation ? 'bg-warning' : 'bg-success'}`}>
                                  {assessment.result.requiresConsultation ? 'Required' : 'Not Required'}
                                </span>
                              </td>
                              <td>
                                <button className="btn btn-sm btn-outline-primary me-2">
                                  <i className="fas fa-eye"></i>
                                  View Details
                                </button>
                                <button className="btn btn-sm btn-outline-secondary">
                                  <i className="fas fa-download"></i>
                                  Export
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
