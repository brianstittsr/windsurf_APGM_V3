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

      if (formData.newPassword) {
        if (formData.newPassword.length < 6) {
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
          body: JSON.stringify({ action: 'update_password', uid: editingUser.id, newPassword: formData.newPassword }),
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
      setFormData({ email: '', displayName: '', role: 'client', phone: '', newPassword: '' });
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
    if (!formData.email || !formData.displayName) {
      await showAlert({
        title: 'Missing Information',
        description: 'Email and display name are required.',
        variant: 'warning'
      });
      return;
    }

    setSubmitting(true);
    try {
      const idToken = await currentUser?.getIdToken();
      const response = await fetch('/api/users/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          action: 'create_user',
          email: formData.email,
          displayName: formData.displayName,
          role: formData.role,
          phone: formData.phone,
          newPassword: formData.newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      await showAlert({
        title: 'Success',
        description: data.passwordResetSent 
          ? 'User created successfully! A password reset email has been sent.'
          : 'User created successfully!',
        variant: 'success'
      });
      setShowModal(false);
      setFormData({ email: '', displayName: '', role: 'client', phone: '', newPassword: '' });
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <form onSubmit={editingUser ? handleEditUser : handleCreateUser}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{editingUser ? 'Edit User' : 'Create New User'}</h3>
                <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" id="email" value={formData.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })} required disabled={!!editingUser} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input type="text" id="displayName" value={formData.displayName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, displayName: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent" 
                    id="role" 
                    value={formData.role} 
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'client' | 'artist' | 'admin' })}
                  >
                    <option value="client">Client</option>
                    <option value="artist">Artist</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input type="tel" id="phone" value={formData.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{editingUser ? 'New Password' : 'Password (Optional)'}</Label>
                  <Input
                    type="password"
                    id="newPassword"
                    placeholder={editingUser ? 'Leave blank to keep current password' : 'Leave blank to send password reset email'}
                    value={formData.newPassword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, newPassword: e.target.value })}
                  />
                  {!editingUser && (
                    <p className="text-xs text-gray-500">If left blank, the user will receive an email to set their password.</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                <Button type="submit" className="bg-[#AD6269] hover:bg-[#9d5860]" disabled={submitting}>
                  {submitting ? (editingUser ? 'Saving...' : 'Creating...') : (editingUser ? 'Save Changes' : 'Create User')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {AlertDialogComponent}
    </div>
  );
}
