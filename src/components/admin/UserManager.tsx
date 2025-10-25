'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { User } from '../../types/user';

interface UserFormData {
  email: string;
  displayName: string;
  role: 'client' | 'artist' | 'admin';
  phone?: string;
}

export default function UserManager() {
  const { user: currentUser } = useAuth();
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
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          displayName: data.displayName || '',
          email: data.email || '',
          phone: data.phone || '',
          role: data.role || 'client',
          isActive: data.isActive !== false,
          ...data
        } as User;
      });
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error fetching users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.displayName) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      // In a real implementation, you would use Firebase Auth admin SDK to create the user
      // For now, we'll create a user document (assuming the user account already exists)
      const userDocRef = doc(collection(db, 'users'));
      await setDoc(userDocRef, {
        email: formData.email,
        displayName: formData.displayName,
        role: formData.role,
        phone: formData.phone || '',
        createdAt: new Date(),
        createdBy: currentUser?.uid,
        isActive: true
      });

      alert('User created successfully!');
      setShowModal(false);
      setFormData({ email: '', displayName: '', role: 'client', phone: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !formData.displayName) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const userDocRef = doc(db, 'users', editingUser.id);
      await updateDoc(userDocRef, {
        displayName: formData.displayName,
        role: formData.role,
        phone: formData.phone || '',
        updatedAt: new Date(),
        updatedBy: currentUser?.uid
      });

      alert('User updated successfully!');
      setShowModal(false);
      setEditingUser(null);
      setFormData({ email: '', displayName: '', role: 'client', phone: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete the user ${userEmail}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', userId));
      alert('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please try again.');
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ email: '', displayName: '', role: 'client', phone: '' });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      phone: user.phone || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ email: '', displayName: '', role: 'client', phone: '' });
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin': return 'badge bg-danger';
      case 'artist': return 'badge bg-primary';
      case 'client': return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
  };

  const filteredUsers = users.filter(user => {
    const roleMatch = filterRole === 'all' || user.role === filterRole;
    const searchMatch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return roleMatch && searchMatch;
  });

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h4>User Management</h4>
            <button
              className="btn btn-primary"
              onClick={openCreateModal}
            >
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
              {users.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-users fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No users found.</p>
                  <button
                    className="btn btn-primary"
                    onClick={openCreateModal}
                  >
                    Add First User
                  </button>
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
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.displayName}</td>
                          <td>{user.email}</td>
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

      {/* Create/Edit User Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingUser ? 'Edit User' : 'Create New User'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <form onSubmit={editingUser ? handleEditUser : handleCreateUser}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={!!editingUser} // Can't change email when editing
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="displayName" className="form-label">
                      Display Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="role" className="form-label">Role</label>
                    <select
                      className="form-select"
                      id="role"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'client' | 'artist' | 'admin' })}
                    >
                      <option value="client">Client</option>
                      <option value="artist">Artist</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
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
