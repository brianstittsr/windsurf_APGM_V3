'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { User } from '../../types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAlertDialog } from '@/components/ui/alert-dialog';

interface UserFormData {
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  role: 'client' | 'artist' | 'admin';
  phone: string;
  password: string;
  confirmPassword: string;
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
    firstName: '',
    lastName: '',
    role: 'client',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [passwordResetStatus, setPasswordResetStatus] = useState<{[key: string]: string}>({});
  const { showAlert, showConfirm, AlertDialogComponent } = useAlertDialog();

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
        const lastLoginAt = data.lastLoginAt;
        return {
          id: doc.id,
          displayName,
          email,
          phone,
          role,
          isActive: data.isActive !== false,
          lastLoginAt,
          ...data,
        } as User;
      });
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      showAlert({
        title: 'Error',
        description: 'Error fetching users.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (user: User) => {
    const confirmed = await showConfirm({
      title: 'Send Password Reset',
      description: `Are you sure you want to send a password reset email to ${user.email}?`,
      confirmText: 'Send Reset Email',
      cancelText: 'Cancel',
      variant: 'warning'
    });
    if (!confirmed) return;

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
      await showAlert({
        title: 'Email Sent',
        description: 'Password reset email sent successfully!',
        variant: 'success'
      });
      setTimeout(() => setPasswordResetStatus(prev => ({ ...prev, [user.id]: '' })), 5000);
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      setPasswordResetStatus({ ...passwordResetStatus, [user.id]: 'error' });
      await showAlert({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
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

      if (formData.password) {
        if (formData.password.length < 6) {
          await showAlert({
            title: 'Invalid Password',
            description: 'Password must be at least 6 characters long.',
            variant: 'warning'
          });
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
          body: JSON.stringify({ action: 'update_password', uid: editingUser.id, newPassword: formData.password }),
        });

        if (!passwordResponse.ok) {
          const errorData = await passwordResponse.json();
          throw new Error(errorData.error || 'Failed to update password');
        }
      }

      await showAlert({
        title: 'Success',
        description: 'User updated successfully!',
        variant: 'success'
      });
      setShowModal(false);
      setEditingUser(null);
      setFormData({ email: '', displayName: '', firstName: '', lastName: '', role: 'client', phone: '', password: '', confirmPassword: '' });
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      await showAlert({
        title: 'Error',
        description: `Error updating user: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation matching registration form
    if (!formData.firstName.trim()) {
      await showAlert({ title: 'Missing Information', description: 'First name is required.', variant: 'warning' });
      return;
    }
    if (!formData.lastName.trim()) {
      await showAlert({ title: 'Missing Information', description: 'Last name is required.', variant: 'warning' });
      return;
    }
    if (!formData.email.trim()) {
      await showAlert({ title: 'Missing Information', description: 'Email is required.', variant: 'warning' });
      return;
    }
    if (!formData.phone.trim()) {
      await showAlert({ title: 'Missing Information', description: 'Phone number is required.', variant: 'warning' });
      return;
    }
    if (!formData.password) {
      await showAlert({ title: 'Missing Information', description: 'Password is required.', variant: 'warning' });
      return;
    }
    if (formData.password.length < 6) {
      await showAlert({ title: 'Invalid Password', description: 'Password must be at least 6 characters.', variant: 'warning' });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      await showAlert({ title: 'Password Mismatch', description: 'Passwords do not match.', variant: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      const idToken = await currentUser?.getIdToken();
      const displayName = `${formData.firstName} ${formData.lastName}`;
      const response = await fetch('/api/users/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          action: 'create_user',
          email: formData.email,
          displayName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          phone: formData.phone,
          newPassword: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      await showAlert({
        title: 'Success',
        description: 'User created successfully!',
        variant: 'success'
      });
      setShowModal(false);
      setFormData({ email: '', displayName: '', firstName: '', lastName: '', role: 'client', phone: '', password: '', confirmPassword: '' });
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      await showAlert({
        title: 'Error',
        description: error.message || 'Error creating user.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    const confirmed = await showConfirm({
      title: 'Delete User',
      description: `Are you sure you want to delete the user ${userEmail}?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });
    if (!confirmed) return;
    try {
      await deleteDoc(doc(getDb(), 'users', userId));
      await showAlert({
        title: 'Success',
        description: 'User deleted successfully!',
        variant: 'success'
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      await showAlert({
        title: 'Error',
        description: 'Error deleting user.',
        variant: 'destructive'
      });
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ email: '', displayName: '', firstName: '', lastName: '', role: 'client', phone: '', password: '', confirmPassword: '' });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    // Parse displayName into first/last name if possible
    const nameParts = (user.displayName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    setFormData({
      email: user.email,
      displayName: user.displayName,
      firstName,
      lastName,
      role: user.role,
      phone: user.phone || '',
      password: '',
      confirmPassword: '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ email: '', displayName: '', firstName: '', lastName: '', role: 'client', phone: '', password: '', confirmPassword: '' });
  };

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'artist': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const filteredUsers = users.filter(user => {
    const roleMatch = filterRole === 'all' || user.role === filterRole;
    const searchMatch = (user.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return roleMatch && searchMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
        <Button onClick={openCreateModal} className="bg-[#AD6269] hover:bg-[#9d5860]">
          <i className="fas fa-plus mr-2"></i>Add New User
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="h-11"
        />
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(['all', 'client', 'artist', 'admin'] as const).map(role => (
            <button
              key={role}
              type="button"
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                filterRole === role 
                  ? 'bg-[#AD6269] text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setFilterRole(role)}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">All Users ({filteredUsers.length})</h3>
        </div>
        <div className="p-6">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-users text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Phone</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Last Login</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Document ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-900">{user.displayName || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.email || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{user.phone || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {(user as any).lastLoginAt 
                          ? new Date((user as any).lastLoginAt.seconds * 1000).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })
                          : 'Never'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span title={user.id} className="text-sm text-gray-500 font-mono">{`${user.id.substring(0, 4)}...${user.id.substring(user.id.length - 4)}`}</span>
                          <button 
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors" 
                            onClick={() => copyToClipboard(user.id)}
                            title="Copy ID"
                          >
                            <i className={`fas ${copiedId === user.id ? 'fa-check text-green-500' : 'fa-copy'}`}></i>
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => openEditModal(user)}
                            title="Edit User"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          {user.email !== currentUser?.email && (
                            <button
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              title="Delete User"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                          <button
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                            onClick={() => handlePasswordReset(user)}
                            title="Send Password Reset Email"
                            disabled={passwordResetStatus[user.id] === 'sending' || passwordResetStatus[user.id] === 'sent'}
                          >
                            <i className={`fas ${passwordResetStatus[user.id] === 'sent' ? 'fa-check-circle text-green-500' : 'fa-key'}`}></i>
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

      {/* Modal - Registration Style */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <form onSubmit={editingUser ? handleEditUser : handleCreateUser} noValidate>
              {/* Header */}
              <div className="p-6 pb-0">
                <div className="flex justify-between items-start">
                  <div className="text-center flex-1">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#AD6269]/10 mb-4">
                      <i className="fas fa-user-plus text-[#AD6269] text-2xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {editingUser ? 'Edit User' : 'Create Your Account'}
                    </h3>
                    <p className="text-gray-500">
                      {editingUser ? 'Update user information' : 'Join A Pretty Girl Matter for exclusive access to premium services'}
                    </p>
                  </div>
                  <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors" onClick={closeModal}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="p-6 space-y-4">
                {/* First Name / Last Name Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      <i className="fas fa-user mr-2 text-gray-400"></i>First Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent transition-all"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      <i className="fas fa-user mr-2 text-gray-400"></i>Last Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent transition-all"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-envelope mr-2 text-gray-400"></i>Email Address *
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent transition-all disabled:bg-gray-100"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={!!editingUser}
                    placeholder="Enter your email address"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-phone mr-2 text-gray-400"></i>Phone Number *
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent transition-all"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Role Selection */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-user-tag mr-2 text-gray-400"></i>Role
                  </label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent transition-all" 
                    id="role" 
                    value={formData.role} 
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'client' | 'artist' | 'admin' })}
                  >
                    <option value="client">Client</option>
                    <option value="artist">Artist</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-lock mr-2 text-gray-400"></i>
                    {editingUser ? 'New Password' : 'Password (min 6 characters) *'}
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent transition-all"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                    placeholder={editingUser ? 'Leave blank to keep current password' : 'Create a password'}
                    minLength={6}
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-lock mr-2 text-gray-400"></i>
                    {editingUser ? 'Confirm New Password' : 'Confirm Password *'}
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent transition-all"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required={!editingUser}
                    placeholder={editingUser ? 'Confirm new password' : 'Confirm your password'}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#AD6269] hover:bg-[#9d5860] text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editingUser ? 'Saving...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <i className={`fas ${editingUser ? 'fa-save' : 'fa-user-plus'} mr-2`}></i>
                      {editingUser ? 'Save Changes' : 'Create Account'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {AlertDialogComponent}
    </div>
  );
}
