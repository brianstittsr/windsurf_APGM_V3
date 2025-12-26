'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAlertDialog } from '@/components/ui/alert-dialog';

interface Artist {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  specialties?: string[];
  bio?: string;
  isActive: boolean;
  createdAt?: Date;
}

interface ArtistFormData {
  displayName: string;
  email: string;
  phone?: string;
  specialties: string;
  bio?: string;
  isActive: boolean;
}

export default function ArtistManager() {
  const { user: currentUser } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [formData, setFormData] = useState<ArtistFormData>({
    displayName: '',
    email: '',
    phone: '',
    specialties: '',
    bio: '',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);
  const { showAlert, showConfirm, AlertDialogComponent } = useAlertDialog();

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const usersCollection = collection(getDb(), 'users');
      if (!currentUser) return;
      const userDoc = await getDoc(doc(getDb(), 'users', currentUser.uid));
      const usersSnapshot = await getDocs(usersCollection);
      const artistsList = usersSnapshot.docs
        .map(doc => {
          const data = doc.data();
          
          // Handle various field name possibilities - check both root and profile object
          const displayName = data.displayName || data.name || data.fullName || 
                             (data.profile?.firstName && data.profile?.lastName ? `${data.profile.firstName} ${data.profile.lastName}` : '') ||
                             data.profile?.firstName || data.profile?.lastName || '';
          const email = data.email || data.profile?.email || '';
          const phone = data.phone || data.profile?.phone || '';
          
          return {
            id: doc.id,
            displayName,
            email,
            phone,
            specialties: data.specialties || [],
            bio: data.bio || '',
            isActive: data.isActive !== false,
            ...data
          } as Artist;
        })
        .filter(user => (user as any).role === 'artist');
      setArtists(artistsList);
    } catch (error) {
      console.error('Error fetching artists:', error);
      showAlert({ title: 'Error', description: 'Error fetching artists. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.displayName) {
      await showAlert({ title: 'Missing Information', description: 'Please fill in all required fields.', variant: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      const artistDocRef = doc(collection(getDb(), 'users'));
      await setDoc(artistDocRef, {
        email: formData.email,
        displayName: formData.displayName,
        role: 'artist',
        phone: formData.phone || '',
        specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : [],
        bio: formData.bio || '',
        isActive: formData.isActive,
        createdAt: new Date(),
        createdBy: currentUser?.uid
      });

      await showAlert({ title: 'Success', description: 'Artist created successfully!', variant: 'success' });
      setShowModal(false);
      setFormData({ displayName: '', email: '', phone: '', specialties: '', bio: '', isActive: true });
      fetchArtists();
    } catch (error) {
      console.error('Error creating artist:', error);
      await showAlert({ title: 'Error', description: 'Error creating artist. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtist || !formData.displayName) {
      await showAlert({ title: 'Missing Information', description: 'Please fill in all required fields.', variant: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      const artistDocRef = doc(getDb(), 'users', editingArtist.id);
      await updateDoc(artistDocRef, {
        displayName: formData.displayName,
        phone: formData.phone || '',
        specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : [],
        bio: formData.bio || '',
        isActive: formData.isActive,
        updatedAt: new Date(),
        updatedBy: currentUser?.uid
      });

      await showAlert({ title: 'Success', description: 'Artist updated successfully!', variant: 'success' });
      setShowModal(false);
      setEditingArtist(null);
      setFormData({ displayName: '', email: '', phone: '', specialties: '', bio: '', isActive: true });
      fetchArtists();
    } catch (error) {
      console.error('Error updating artist:', error);
      await showAlert({ title: 'Error', description: 'Error updating artist. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteArtist = async (artistId: string, artistName: string) => {
    const confirmed = await showConfirm({ title: 'Delete Artist', description: `Are you sure you want to delete ${artistName}? This action cannot be undone.`, confirmText: 'Delete', variant: 'destructive' });
    if (!confirmed) return;

    try {
      await deleteDoc(doc(getDb(), 'users', artistId));
      await showAlert({ title: 'Success', description: 'Artist deleted successfully!', variant: 'success' });
      fetchArtists();
    } catch (error) {
      console.error('Error deleting artist:', error);
      await showAlert({ title: 'Error', description: 'Error deleting artist. Please try again.', variant: 'destructive' });
    }
  };

  const openCreateModal = () => {
    setEditingArtist(null);
    setFormData({ displayName: '', email: '', phone: '', specialties: '', bio: '', isActive: true });
    setShowModal(true);
  };

  const openEditModal = (artist: Artist) => {
    setEditingArtist(artist);
    setFormData({
      displayName: artist.displayName,
      email: artist.email,
      phone: artist.phone || '',
      specialties: artist.specialties?.join(', ') || '',
      bio: artist.bio || '',
      isActive: artist.isActive
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingArtist(null);
    setFormData({ displayName: '', email: '', phone: '', specialties: '', bio: '', isActive: true });
  };

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
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <i className="fas fa-user-tie text-[#AD6269]"></i>Artist Management
        </h2>
        <Button onClick={openCreateModal} className="bg-[#AD6269] hover:bg-[#9d5860]">
          <i className="fas fa-plus mr-2"></i>Add New Artist
        </Button>
      </div>

      {/* Artists Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-[#AD6269]">
          <h3 className="font-semibold text-white">All Artists ({artists.length})</h3>
        </div>
        <div className="p-6">
          {artists.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-user-tie text-5xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 mb-4">No artists found.</p>
              <Button onClick={openCreateModal} className="bg-[#AD6269] hover:bg-[#9d5860]">
                Add First Artist
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Phone</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Specialties</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {artists.map((artist) => (
                    <tr key={artist.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{artist.displayName}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{artist.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{artist.phone || '-'}</td>
                      <td className="py-3 px-4">
                        {artist.specialties && artist.specialties.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {artist.specialties.map((specialty, idx) => (
                              <span key={idx} className="px-2 py-1 text-xs font-medium rounded-full bg-cyan-100 text-cyan-800">{specialty}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${artist.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {artist.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => openEditModal(artist)}
                            title="Edit Artist"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => handleDeleteArtist(artist.id, artist.displayName)}
                            title="Delete Artist"
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

      {/* Create/Edit Artist Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingArtist ? 'Edit Artist' : 'Create New Artist'}
              </h3>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={closeModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={editingArtist ? handleEditArtist : handleCreateArtist}>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">
                    Display Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, displayName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={!!editingArtist}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialties">Specialties (comma-separated)</Label>
                  <Input
                    type="text"
                    id="specialties"
                    value={formData.specialties}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, specialties: e.target.value })}
                    placeholder="eyeliner, microblading, lips"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent resize-none"
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                    placeholder="Artist bio and experience"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#AD6269] focus:ring-[#AD6269]"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#AD6269] hover:bg-[#9d5860]" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingArtist ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editingArtist ? 'Update Artist' : 'Create Artist'
                  )}
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
