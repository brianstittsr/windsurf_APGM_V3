'use client';

import React, { useState, useEffect } from 'react';
import { UserService } from '@/services/database';
import { User } from '@/types/database';

export default function AdminTestPage() {
  const [users, setUsers] = useState<{
    admins: User[];
    artists: User[];
    clients: User[];
  }>({
    admins: [],
    artists: [],
    clients: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('Loading users...');
      
      const [admins, artists, clients] = await Promise.all([
        UserService.getAdmins(),
        UserService.getArtists(),
        UserService.getClients(),
      ]);

      console.log('Loaded users:', { admins, artists, clients });
      
      setUsers({ admins, artists, clients });
      setError('');
    } catch (err: any) {
      console.error('Error loading users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const createTestAdmin = async () => {
    try {
      console.log('Creating test admin...');
      const adminUser = await UserService.createAdminUser({
        firstName: 'Brian',
        lastName: 'Stitt',
        email: 'brianstittsr@gmail.com',
        phone: '555-0123',
        dateOfBirth: '1990-01-01',
        address: '123 Main St',
        city: 'Raleigh',
        state: 'NC',
        zipCode: '27601',
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '555-0124',
        preferredContactMethod: 'email',
        hearAboutUs: 'Direct'
      });
      
      console.log('Admin user created:', adminUser);
      alert('Admin user created successfully!');
      await loadUsers();
    } catch (err: any) {
      console.error('Error creating admin:', err);
      alert('Failed to create admin: ' + err.message);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h1>Admin Test Page</h1>
          <p>This is a test page to verify admin functionality without authentication.</p>
          
          <div className="mb-4">
            <button className="btn btn-primary me-2" onClick={loadUsers}>
              <i className="fas fa-sync-alt me-2"></i>
              Refresh Users
            </button>
            <button className="btn btn-success me-2" onClick={createTestAdmin}>
              <i className="fas fa-user-plus me-2"></i>
              Create Test Admin
            </button>
            <a href="/dashboard" className="btn btn-outline-primary">
              Go to Real Admin Page
            </a>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              <h5>Error:</h5>
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading users...</p>
            </div>
          ) : (
            <>
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
                  <div className="card bg-danger text-white">
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
                <div className="col-md-4">
                  <div className="card bg-info text-white">
                    <div className="card-body">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h5 className="card-title">Clients</h5>
                          <h2>{users.clients.length}</h2>
                        </div>
                        <div className="align-self-center">
                          <i className="fas fa-users fa-2x"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admins Table */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">
                    <span className="badge bg-danger me-2">{users.admins.length}</span>
                    Administrators
                  </h5>
                </div>
                <div className="card-body">
                  {users.admins.length === 0 ? (
                    <p className="text-muted">No administrators found. Click "Create Test Admin" to create one.</p>
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
                          </tr>
                        </thead>
                        <tbody>
                          {users.admins.map((user) => (
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
                                <span className="badge bg-danger">Admin</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Clients Table */}
              <div className="card mb-4">
                <div className="card-header">
                  <h5 className="mb-0">
                    <span className="badge bg-info me-2">{users.clients.length}</span>
                    Clients
                  </h5>
                </div>
                <div className="card-body">
                  {users.clients.length === 0 ? (
                    <p className="text-muted">No clients found.</p>
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
                          </tr>
                        </thead>
                        <tbody>
                          {users.clients.map((user) => (
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
                                <span className="badge bg-info">Client</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
