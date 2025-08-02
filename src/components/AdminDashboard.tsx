'use client';

import React, { useState, useEffect } from 'react';
import { UserService } from '@/services/database';
import { User } from '@/types/database';
import UserManagement from './UserManagement';

interface AdminDashboardProps {
  currentUser?: User;
}

export default function AdminDashboard({ currentUser }: AdminDashboardProps) {
  const [users, setUsers] = useState<{
    admins: User[];
    artists: User[];
    clients: User[];
  }>({
    admins: [],
    artists: [],
    clients: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const [admins, artists, clients] = await Promise.all([
        UserService.getAdmins(),
        UserService.getArtists(),
        UserService.getClients()
      ]);
      
      setUsers({ admins, artists, clients });
      setError(null);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'client' | 'admin' | 'artist') => {
    try {
      await UserService.updateUserRole(userId, newRole);
      await loadUsers(); // Refresh the list
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
      await loadUsers(); // Refresh the list
      alert(`User ${isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (err) {
      console.error('Error toggling user status:', err);
      alert('Failed to update user status');
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Access Denied</h4>
          <p>You do not have permission to access the admin dashboard.</p>
          <hr />
          <p className="mb-0">Please contact an administrator if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <button className="btn btn-outline-danger" onClick={loadUsers}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
    <UserManagement 
      users={users} 
      onUsersUpdated={loadUsers}
    />
  );
}
