'use client';

import React, { useState } from 'react';
import { UserService } from '@/services/database';
import { User } from '@/types/database';
import { Timestamp } from 'firebase/firestore';

interface UserManagementProps {
  users: {
    admins: User[];
    artists: User[];
    clients: User[];
  };
  onUsersUpdated: () => void;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'client' | 'admin' | 'artist';
  dateOfBirth: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  preferredContactMethod: string;
  hearAboutUs: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  notes: string;
}

export default function UserManagement({ users, onUsersUpdated }: UserManagementProps) {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'security' | 'notes'>('personal');
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'client',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    preferredContactMethod: 'email',
    hearAboutUs: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'client',
      dateOfBirth: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      preferredContactMethod: 'email',
      hearAboutUs: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      notes: ''
    });
    setError('');
    setEditingUser(null);
  };

  const handleAddUser = () => {
    resetForm();
    setShowAddUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setFormData({
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      email: user.profile.email,
      phone: user.profile.phone,
      role: user.role,
      dateOfBirth: user.profile.dateOfBirth,
      address: user.profile.address,
      city: user.profile.city,
      state: user.profile.state,
      zipCode: user.profile.zipCode,
      emergencyContactName: user.profile.emergencyContactName,
      emergencyContactPhone: user.profile.emergencyContactPhone,
      preferredContactMethod: user.profile.preferredContactMethod,
      hearAboutUs: user.profile.hearAboutUs,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      notes: user.profile.notes || ''
    });
    setEditingUser(user);
    setShowAddUserModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (editingUser) {
        // Update existing user
        await UserService.updateUser(editingUser.id, {
          profile: {
            ...editingUser.profile,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            emergencyContactName: formData.emergencyContactName,
            emergencyContactPhone: formData.emergencyContactPhone,
            preferredContactMethod: formData.preferredContactMethod,
            hearAboutUs: formData.hearAboutUs,
            notes: formData.notes,
            updatedAt: Timestamp.now()
          },
          role: formData.role
        });
        alert('User updated successfully!');
      } else {
        // Create new user
        await UserService.createUser({
          profile: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            emergencyContactName: formData.emergencyContactName,
            emergencyContactPhone: formData.emergencyContactPhone,
            preferredContactMethod: formData.preferredContactMethod,
            hearAboutUs: formData.hearAboutUs,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          },
          role: formData.role,
          isActive: true
        });
        alert('User created successfully!');
      }

      setShowAddUserModal(false);
      resetForm();
      onUsersUpdated();
    } catch (err: any) {
      console.error('Error saving user:', err);
      setError(err.message || 'Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'client' | 'admin' | 'artist') => {
    try {
      await UserService.updateUserRole(userId, newRole);
      onUsersUpdated();
      alert(`User role updated to ${newRole} successfully!`);
    } catch (err) {
      console.error('Error updating user role:', err);
      alert('Failed to update user role');
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await UserService.deactivateUser(userId);
      } else {
        await UserService.activateUser(userId);
      }
      onUsersUpdated();
      alert(`User ${isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (err) {
      console.error('Error toggling user status:', err);
      alert('Failed to update user status');
    }
  };

  const UserTable = ({ title, userList, roleColor }: { title: string; userList: User[]; roleColor: string }) => (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="mb-0">
          <span className={`badge bg-${roleColor} me-2`}>{userList.length}</span>
          {title}
        </h5>
      </div>
      <div className="card-body">
        {userList.length === 0 ? (
          <p className="text-muted">No {title.toLowerCase()} found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userList.map((user) => (
                  <tr key={user.id}>
                    <td>{user.profile.firstName} {user.profile.lastName}</td>
                    <td>{user.profile.email}</td>
                    <td>{user.profile.phone}</td>
                    <td>
                      <span className={`badge ${user.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <select 
                        className="form-select form-select-sm"
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as 'client' | 'admin' | 'artist')}
                      >
                        <option value="client">Client</option>
                        <option value="artist">Artist</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEditUser(user)}
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                      <button
                        className={`btn btn-sm ${user.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        onClick={() => handleToggleActive(user.id, user.isActive)}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
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
  );

  return (
    <div>
      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h5 className="card-title">Total Users</h5>
                  <h2>{users.admins.length + users.artists.length + users.clients.length}</h2>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-users fa-2x"></i>
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
                  <h5 className="card-title">Active Users</h5>
                  <h2>
                    {[...users.admins, ...users.artists, ...users.clients]
                      .filter(user => user.isActive).length}
                  </h2>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-user-check fa-2x"></i>
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
                  <h5 className="card-title">Admins</h5>
                  <h2>{users.admins.length}</h2>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-user-shield fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add User Button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>User Management</h3>
        <button className="btn btn-primary" onClick={handleAddUser}>
          <i className="fas fa-user-plus me-2"></i>
          Add New User
        </button>
      </div>

      {/* User Tables */}
      <UserTable title="Administrators" userList={users.admins} roleColor="danger" />
      <UserTable title="Artists" userList={users.artists} roleColor="warning" />
      <UserTable title="Clients" userList={users.clients} roleColor="info" />

      {/* Enhanced Add/Edit User Modal with Tabs */}
      {showAddUserModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content border-0 shadow-lg">
              <form onSubmit={handleSubmit}>
                {/* Enhanced Modal Header */}
                <div className="modal-header border-0 py-4" style={{ background: 'linear-gradient(135deg, #AD6269 0%, #8B4A52 100%)' }}>
                  <div className="d-flex align-items-center">
                    <div className="avatar-circle me-3" style={{ 
                      width: '50px', 
                      height: '50px', 
                      background: 'rgba(255,255,255,0.2)', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className={`fas ${editingUser ? 'fa-user-edit' : 'fa-user-plus'} text-white fs-5`}></i>
                    </div>
                    <div>
                      <h4 className="mb-1 text-white fw-bold">
                        {editingUser ? `Edit ${formData.firstName} ${formData.lastName}` : 'Add New User'}
                      </h4>
                      <p className="mb-0 text-white-50 small">
                        {editingUser ? 'Update user information and settings' : 'Create a new user account'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => {
                      setShowAddUserModal(false);
                      resetForm();
                      setActiveTab('personal');
                    }}
                  ></button>
                </div>

                {/* Tab Navigation */}
                <div className="modal-header border-0 bg-light py-2">
                  <ul className="nav nav-pills nav-fill w-100" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link rounded-pill px-4 py-2 fw-semibold ${activeTab === 'personal' ? 'active' : ''}`}
                        type="button"
                        onClick={() => setActiveTab('personal')}
                        style={{ 
                          backgroundColor: activeTab === 'personal' ? '#AD6269' : 'transparent',
                          borderColor: activeTab === 'personal' ? '#AD6269' : '#dee2e6',
                          color: activeTab === 'personal' ? 'white' : '#6c757d'
                        }}
                      >
                        <i className="fas fa-user me-2"></i>
                        Personal Info
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link rounded-pill px-4 py-2 fw-semibold ${activeTab === 'contact' ? 'active' : ''}`}
                        type="button"
                        onClick={() => setActiveTab('contact')}
                        style={{ 
                          backgroundColor: activeTab === 'contact' ? '#AD6269' : 'transparent',
                          borderColor: activeTab === 'contact' ? '#AD6269' : '#dee2e6',
                          color: activeTab === 'contact' ? 'white' : '#6c757d'
                        }}
                      >
                        <i className="fas fa-address-book me-2"></i>
                        Contact & Address
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link rounded-pill px-4 py-2 fw-semibold ${activeTab === 'security' ? 'active' : ''}`}
                        type="button"
                        onClick={() => setActiveTab('security')}
                        style={{ 
                          backgroundColor: activeTab === 'security' ? '#AD6269' : 'transparent',
                          borderColor: activeTab === 'security' ? '#AD6269' : '#dee2e6',
                          color: activeTab === 'security' ? 'white' : '#6c757d'
                        }}
                      >
                        <i className="fas fa-shield-alt me-2"></i>
                        Security & Role
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button
                        className={`nav-link rounded-pill px-4 py-2 fw-semibold ${activeTab === 'notes' ? 'active' : ''}`}
                        type="button"
                        onClick={() => setActiveTab('notes')}
                        style={{ 
                          backgroundColor: activeTab === 'notes' ? '#AD6269' : 'transparent',
                          borderColor: activeTab === 'notes' ? '#AD6269' : '#dee2e6',
                          color: activeTab === 'notes' ? 'white' : '#6c757d'
                        }}
                      >
                        <i className="fas fa-sticky-note me-2"></i>
                        Notes
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Modal Body with Tab Content */}
                <div className="modal-body p-4">
                  {error && (
                    <div className="alert alert-danger border-0 rounded-3 mb-4" role="alert">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  )}

                  {/* Personal Information Tab */}
                  {activeTab === 'personal' && (
                    <div className="tab-pane fade show active">
                      <div className="row g-4">
                        <div className="col-12">
                          <h6 className="text-primary fw-bold mb-3">
                            <i className="fas fa-id-card me-2"></i>
                            Basic Information
                          </h6>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark">
                            <i className="fas fa-user me-2 text-muted"></i>
                            First Name *
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-lg border-2 rounded-3"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            required
                            placeholder="Enter first name"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark">
                            <i className="fas fa-user me-2 text-muted"></i>
                            Last Name *
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-lg border-2 rounded-3"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            required
                            placeholder="Enter last name"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark">
                            <i className="fas fa-envelope me-2 text-muted"></i>
                            Email Address *
                          </label>
                          <input
                            type="email"
                            className="form-control form-control-lg border-2 rounded-3"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            placeholder="Enter email address"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark">
                            <i className="fas fa-phone me-2 text-muted"></i>
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            className="form-control form-control-lg border-2 rounded-3"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="(555) 123-4567"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark">
                            <i className="fas fa-calendar me-2 text-muted"></i>
                            Date of Birth
                          </label>
                          <input
                            type="date"
                            className="form-control form-control-lg border-2 rounded-3"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark">
                            <i className="fas fa-comment me-2 text-muted"></i>
                            Preferred Contact Method
                          </label>
                          <select
                            className="form-select form-select-lg border-2 rounded-3"
                            value={formData.preferredContactMethod}
                            onChange={(e) => setFormData({ ...formData, preferredContactMethod: e.target.value })}
                          >
                            <option value="email">Email</option>
                            <option value="phone">Phone Call</option>
                            <option value="text">Text Message</option>
                          </select>
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold text-dark">
                            <i className="fas fa-bullhorn me-2 text-muted"></i>
                            How did you hear about us?
                            {formData.role === 'client' && (
                              <span className="badge bg-info ms-2 small">Client Marketing Data</span>
                            )}
                          </label>
                          <select
                            className="form-select form-select-lg border-2 rounded-3"
                            value={formData.hearAboutUs}
                            onChange={(e) => setFormData({ ...formData, hearAboutUs: e.target.value })}
                          >
                            <option value="">Select how they heard about us...</option>
                            <option value="Google Search">Google Search</option>
                            <option value="Social Media - Instagram">Social Media - Instagram</option>
                            <option value="Social Media - Facebook">Social Media - Facebook</option>
                            <option value="Social Media - TikTok">Social Media - TikTok</option>
                            <option value="Word of Mouth/Referral">Word of Mouth/Referral</option>
                            <option value="Existing Client Referral">Existing Client Referral</option>
                            <option value="Yelp/Google Reviews">Yelp/Google Reviews</option>
                            <option value="Website">Website</option>
                            <option value="Print Advertisement">Print Advertisement</option>
                            <option value="Radio/TV">Radio/TV</option>
                            <option value="Event/Trade Show">Event/Trade Show</option>
                            <option value="Other">Other</option>
                          </select>
                          {formData.role === 'client' && (
                            <div className="form-text text-muted small mt-2">
                              <i className="fas fa-info-circle me-1"></i>
                              This information helps us track our most effective marketing channels for client acquisition.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact & Address Tab */}
                  {activeTab === 'contact' && (
                    <div className="tab-pane fade show active">
                      <div className="row g-4">
                        <div className="col-12">
                          <h6 className="text-primary fw-bold mb-3">
                            <i className="fas fa-map-marker-alt me-2"></i>
                            Address Information
                          </h6>
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold text-dark">
                            <i className="fas fa-home me-2 text-muted"></i>
                            Street Address
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-lg border-2 rounded-3"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="123 Main Street"
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold text-dark">
                            <i className="fas fa-city me-2 text-muted"></i>
                            City
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-lg border-2 rounded-3"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            placeholder="Charlotte"
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold text-dark">
                            <i className="fas fa-flag me-2 text-muted"></i>
                            State
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-lg border-2 rounded-3"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            placeholder="North Carolina"
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold text-dark">
                            <i className="fas fa-mail-bulk me-2 text-muted"></i>
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-lg border-2 rounded-3"
                            value={formData.zipCode}
                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                            placeholder="28202"
                          />
                        </div>
                        <div className="col-12">
                          <h6 className="text-primary fw-bold mb-3 mt-4">
                            <i className="fas fa-phone-alt me-2"></i>
                            Emergency Contact
                          </h6>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark">
                            <i className="fas fa-user-friends me-2 text-muted"></i>
                            Emergency Contact Name
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-lg border-2 rounded-3"
                            value={formData.emergencyContactName}
                            onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                            placeholder="Full name of emergency contact"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark">
                            <i className="fas fa-phone me-2 text-muted"></i>
                            Emergency Contact Phone
                          </label>
                          <input
                            type="tel"
                            className="form-control form-control-lg border-2 rounded-3"
                            value={formData.emergencyContactPhone}
                            onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                            placeholder="(555) 123-4567"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security & Role Tab */}
                  {activeTab === 'security' && (
                    <div className="tab-pane fade show active">
                      <div className="row g-4">
                        <div className="col-12">
                          <h6 className="text-primary fw-bold mb-3">
                            <i className="fas fa-user-cog me-2"></i>
                            User Role & Permissions
                          </h6>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold text-dark">
                            <i className="fas fa-user-tag me-2 text-muted"></i>
                            User Role *
                          </label>
                          <select
                            className="form-select form-select-lg border-2 rounded-3"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'client' | 'admin' | 'artist' })}
                            required
                          >
                            <option value="client">Client - Book appointments and manage profile</option>
                            <option value="artist">Artist - Manage schedule and appointments</option>
                            <option value="admin">Admin - Full system access</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <div className="p-3 bg-light rounded-3 border">
                            <h6 className="fw-bold text-dark mb-2">Role Permissions</h6>
                            <ul className="list-unstyled small mb-0">
                              {formData.role === 'client' && (
                                <>
                                  <li><i className="fas fa-check text-success me-2"></i>Book appointments</li>
                                  <li><i className="fas fa-check text-success me-2"></i>Manage personal profile</li>
                                  <li><i className="fas fa-check text-success me-2"></i>View appointment history</li>
                                </>
                              )}
                              {formData.role === 'artist' && (
                                <>
                                  <li><i className="fas fa-check text-success me-2"></i>Manage schedule and availability</li>
                                  <li><i className="fas fa-check text-success me-2"></i>View client appointments</li>
                                  <li><i className="fas fa-check text-success me-2"></i>Update appointment status</li>
                                </>
                              )}
                              {formData.role === 'admin' && (
                                <>
                                  <li><i className="fas fa-check text-success me-2"></i>Full system administration</li>
                                  <li><i className="fas fa-check text-success me-2"></i>Manage all users and roles</li>
                                  <li><i className="fas fa-check text-success me-2"></i>Access all system features</li>
                                </>
                              )}
                            </ul>
                          </div>
                        </div>
                        
                        {editingUser && (
                          <>
                            <div className="col-12">
                              <h6 className="text-primary fw-bold mb-3 mt-4">
                                <i className="fas fa-key me-2"></i>
                                Change Password
                              </h6>
                              <div className="alert alert-info border-0 rounded-3">
                                <i className="fas fa-info-circle me-2"></i>
                                Leave password fields empty to keep the current password unchanged.
                              </div>
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold text-dark">
                                <i className="fas fa-lock me-2 text-muted"></i>
                                Current Password
                              </label>
                              <input
                                type="password"
                                className="form-control form-control-lg border-2 rounded-3"
                                value={formData.currentPassword}
                                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                placeholder="Enter current password"
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold text-dark">
                                <i className="fas fa-key me-2 text-muted"></i>
                                New Password
                              </label>
                              <input
                                type="password"
                                className="form-control form-control-lg border-2 rounded-3"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                placeholder="Enter new password"
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label fw-semibold text-dark">
                                <i className="fas fa-check-circle me-2 text-muted"></i>
                                Confirm New Password
                              </label>
                              <input
                                type="password"
                                className="form-control form-control-lg border-2 rounded-3"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="Confirm new password"
                              />
                            </div>
                            {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                              <div className="col-12">
                                <div className="alert alert-warning border-0 rounded-3">
                                  <i className="fas fa-exclamation-triangle me-2"></i>
                                  Passwords do not match. Please check your entries.
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes Tab */}
                  {activeTab === 'notes' && (
                    <div className="tab-pane fade show active">
                      <div className="row g-4">
                        <div className="col-12">
                          <h6 className="text-primary fw-bold mb-3">
                            <i className="fas fa-sticky-note me-2"></i>
                            Client Notes
                          </h6>
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold text-dark">
                            <i className="fas fa-comment-alt me-2 text-muted"></i>
                            Notes & Comments
                          </label>
                          <textarea
                            className="form-control form-control-lg border-2 rounded-3"
                            rows={8}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Add any notes, comments, or important information about this client..."
                            style={{ resize: 'vertical' }}
                          />
                          <div className="form-text text-muted mt-2">
                            <i className="fas fa-info-circle me-1"></i>
                            Use this space to record important client information, preferences, special instructions, 
                            appointment history notes, or any other relevant details that will help provide better service.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Modal Footer */}
                <div className="modal-footer border-0 bg-light p-4">
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <div className="text-muted small">
                      <i className="fas fa-info-circle me-1"></i>
                      Fields marked with * are required
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary rounded-pill px-4"
                        onClick={() => {
                          setShowAddUserModal(false);
                          resetForm();
                          setActiveTab('personal');
                        }}
                      >
                        <i className="fas fa-times me-2"></i>
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn rounded-pill px-4"
                        style={{ backgroundColor: '#AD6269', borderColor: '#AD6269', color: 'white' }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {editingUser ? 'Updating User...' : 'Creating User...'}
                          </>
                        ) : (
                          <>
                            <i className={`fas ${editingUser ? 'fa-save' : 'fa-plus'} me-2`}></i>
                            {editingUser ? 'Update User' : 'Create User'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
