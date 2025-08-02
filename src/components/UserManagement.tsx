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
}

export default function UserManagement({ users, onUsersUpdated }: UserManagementProps) {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
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
    hearAboutUs: ''
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
      hearAboutUs: ''
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
      hearAboutUs: user.profile.hearAboutUs
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

      {/* Add/Edit User Modal */}
      {showAddUserModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAddUserModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">First Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Last Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone *</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Role *</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as 'client' | 'admin' | 'artist' })}
                        required
                      >
                        <option value="client">Client</option>
                        <option value="artist">Artist</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Date of Birth</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">ZIP Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Emergency Contact Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.emergencyContactName}
                        onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Emergency Contact Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.emergencyContactPhone}
                        onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Preferred Contact Method</label>
                      <select
                        className="form-select"
                        value={formData.preferredContactMethod}
                        onChange={(e) => setFormData({ ...formData, preferredContactMethod: e.target.value })}
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="text">Text Message</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">How did you hear about us?</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.hearAboutUs}
                        onChange={(e) => setFormData({ ...formData, hearAboutUs: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAddUserModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {editingUser ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingUser ? 'Update User' : 'Create User'
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
