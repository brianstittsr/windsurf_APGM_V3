'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { User } from '../../types/user';

interface UserFormData {
  email: string;
  displayName: string;
  role: 'client' | 'artist' | 'admin';
  phone?: string;
  newPassword?: string;
}

export default function UserManager() {
  const { user: currentUser, userRole, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState<'all' | 'client' | 'artist' | 'admin'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    displayName: '',
    role: 'client',
    phone: '',
    newPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [passwordResetStatus, setPasswordResetStatus] = useState<{[key: string]: string}>({});

  useEffect(() => {
    // Only fetch users when auth is ready and user is admin
    if (!authLoading && currentUser && userRole === 'admin') {
      fetchUsers();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, currentUser, userRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(getDb(), 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        const displayName = data.displayName || data.name || (data.profile?.firstName && data.profile?.lastName ? `${data.profile.firstName} ${data.profile.lastName}` : '') || data.profile?.firstName || '';
        const email = data.email || data.profile?.email || '';
        const phone = data.phone || data.profile?.phone || '';
        const role = data.role || 'client';
        return {
          id: doc.id,
          displayName,
          email,
          phone,
          role,
          isActive: data.isActive !== false,
          ...data,
        } as User;
      });
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error fetching users.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (user: User) => {
    if (!confirm(`Are you sure you want to send a password reset email to ${user.email}?`)) return;

    setPasswordResetStatus({ ...passwordResetStatus, [user.id]: 'sending' });
    try {
      const idToken = await currentUser?.getIdToken();
      const response = await fetch('/api/users/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ action: 'reset_password', uid: user.id, email: user.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send reset email');
      }

      setPasswordResetStatus({ ...passwordResetStatus, [user.id]: 'sent' });
      alert('Password reset email sent successfully!');
      setTimeout(() => setPasswordResetStatus(prev => ({ ...prev, [user.id]: '' })), 5000);
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      setPasswordResetStatus({ ...passwordResetStatus, [user.id]: 'error' });
      alert(`Error: ${error.message}`);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setSubmitting(true);
    try {
      const userDocRef = doc(getDb(), 'users', editingUser.id);
      await updateDoc(userDocRef, {
        displayName: formData.displayName,
        role: formData.role,
        phone: formData.phone || '',
        updatedAt: new Date(),
        updatedBy: currentUser?.uid,
      });

      if (formData.newPassword) {
        if (formData.newPassword.length < 6) {
          alert('Password must be at least 6 characters long.');
          setSubmitting(false);
          return;
        }
        const idToken = await currentUser?.getIdToken();
        const passwordResponse = await fetch('/api/users/manage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({ action: 'update_password', uid: editingUser.id, newPassword: formData.newPassword }),
        });

        if (!passwordResponse.ok) {
          const errorData = await passwordResponse.json();
          throw new Error(errorData.error || 'Failed to update password');
        }
      }

      alert('User updated successfully!');
      setShowModal(false);
      setEditingUser(null);
      setFormData({ email: '', displayName: '', role: 'client', phone: '', newPassword: '' });
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      alert(`Error updating user: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete the user ${userEmail}?`)) return;
    try {
      await deleteDoc(doc(getDb(), 'users', userId));
      alert('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user.');
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ email: '', displayName: '', role: 'client', phone: '', newPassword: '' });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      phone: user.phone || '',
      newPassword: '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ email: '', displayName: '', role: 'client', phone: '', newPassword: '' });
  };

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin': return 'badge bg-danger';
      case 'artist': return 'badge bg-primary';
      default: return 'badge bg-success';
    }
  };

  const filteredUsers = users.filter(user => {
    const roleMatch = filterRole === 'all' || user.role === filterRole;
    const searchMatch = (user.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return roleMatch && searchMatch;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h4>User Management</h4>
            <button className="btn btn-primary" onClick={openCreateModal}>
              <i className="fas fa-plus me-2"></i>Add New User
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <div className="btn-group w-100" role="group">
            {(['all', 'client', 'artist', 'admin'] as const).map(role => (
              <button
                key={role}
                type="button"
                className={`btn ${filterRole === role ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilterRole(role)}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">All Users ({filteredUsers.length})</h5>
            </div>
            <div className="card-body">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-5">
                  <p>No users found.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Document ID</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.displayName || 'N/A'}</td>
                          <td>{user.email || 'N/A'}</td>
                          <td>
                            <span className={getRoleBadgeClass(user.role)}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </span>
                          </td>
                          <td>{user.phone || '-'}</td>
                          <td>
                            <span className={`badge ${user.isActive ? 'bg-success' : 'bg-warning'}`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span title={user.id} className="me-2">{`${user.id.substring(0, 4)}...${user.id.substring(user.id.length - 4)}`}</span>
                              <button 
                                className="btn btn-sm btn-outline-secondary" 
                                onClick={() => copyToClipboard(user.id)}
                                title="Copy ID"
                              >
                                <i className={`fas ${copiedId === user.id ? 'fa-check' : 'fa-copy'}`}></i>
                              </button>
                            </div>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openEditModal(user)}
                                title="Edit User"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              {user.email !== currentUser?.email && (
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDeleteUser(user.id, user.email)}
                                  title="Delete User"
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              )}
                              <button
                                className="btn btn-sm btn-outline-warning"
                                onClick={() => handlePasswordReset(user)}
                                title="Send Password Reset Email"
                                disabled={passwordResetStatus[user.id] === 'sending' || passwordResetStatus[user.id] === 'sent'}
                              >
                                <i className={`fas ${passwordResetStatus[user.id] === 'sent' ? 'fa-check-circle' : 'fa-key'}`}></i>
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

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={editingUser ? handleEditUser : () => {}}>
                <div className="modal-header">
                  <h5 className="modal-title">{editingUser ? 'Edit User' : 'Create New User'}</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" className="form-control" id="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required disabled={!!editingUser} />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="displayName" className="form-label">Display Name</label>
                    <input type="text" className="form-control" id="displayName" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="role" className="form-label">Role</label>
                    <select className="form-select" id="role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as 'client' | 'artist' | 'admin' })}>
                      <option value="client">Client</option>
                      <option value="artist">Artist</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone</label>
                    <input type="tel" className="form-control" id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  {editingUser && (
                    <div className="mb-3">
                      <label htmlFor="newPassword" className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="newPassword"
                        placeholder="Leave blank to keep current password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      />
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Changes'}
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
