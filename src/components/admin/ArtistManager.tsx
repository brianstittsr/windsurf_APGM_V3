'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';

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

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const artistsList = usersSnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            displayName: data.displayName || '',
            email: data.email || '',
            phone: data.phone || '',
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
      alert('Error fetching artists. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.displayName) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const artistDocRef = doc(collection(db, 'users'));
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

      alert('Artist created successfully!');
      setShowModal(false);
      setFormData({ displayName: '', email: '', phone: '', specialties: '', bio: '', isActive: true });
      fetchArtists();
    } catch (error) {
      console.error('Error creating artist:', error);
      alert('Error creating artist. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtist || !formData.displayName) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const artistDocRef = doc(db, 'users', editingArtist.id);
      await updateDoc(artistDocRef, {
        displayName: formData.displayName,
        phone: formData.phone || '',
        specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : [],
        bio: formData.bio || '',
        isActive: formData.isActive,
        updatedAt: new Date(),
        updatedBy: currentUser?.uid
      });

      alert('Artist updated successfully!');
      setShowModal(false);
      setEditingArtist(null);
      setFormData({ displayName: '', email: '', phone: '', specialties: '', bio: '', isActive: true });
      fetchArtists();
    } catch (error) {
      console.error('Error updating artist:', error);
      alert('Error updating artist. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteArtist = async (artistId: string, artistName: string) => {
    if (!confirm(`Are you sure you want to delete ${artistName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', artistId));
      alert('Artist deleted successfully!');
      fetchArtists();
    } catch (error) {
      console.error('Error deleting artist:', error);
      alert('Error deleting artist. Please try again.');
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
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading artists...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h4><i className="fas fa-user-tie me-2"></i>Artist Management</h4>
            <button
              className="btn btn-primary"
              onClick={openCreateModal}
            >
              <i className="fas fa-plus me-2"></i>Add New Artist
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">All Artists ({artists.length})</h5>
            </div>
            <div className="card-body">
              {artists.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-user-tie fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No artists found.</p>
                  <button
                    className="btn btn-primary"
                    onClick={openCreateModal}
                  >
                    Add First Artist
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Specialties</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {artists.map((artist) => (
                        <tr key={artist.id}>
                          <td><strong>{artist.displayName}</strong></td>
                          <td>{artist.email}</td>
                          <td>{artist.phone || '-'}</td>
                          <td>
                            {artist.specialties && artist.specialties.length > 0 ? (
                              <div>
                                {artist.specialties.map((specialty, idx) => (
                                  <span key={idx} className="badge bg-info me-1">{specialty}</span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${artist.isActive ? 'bg-success' : 'bg-warning'}`}>
                              {artist.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openEditModal(artist)}
                                title="Edit Artist"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
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
        </div>
      </div>

      {/* Create/Edit Artist Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingArtist ? 'Edit Artist' : 'Create New Artist'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <form onSubmit={editingArtist ? handleEditArtist : handleCreateArtist}>
                <div className="modal-body">
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
                      disabled={!!editingArtist}
                    />
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
                  <div className="mb-3">
                    <label htmlFor="specialties" className="form-label">Specialties (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      id="specialties"
                      value={formData.specialties}
                      onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                      placeholder="eyeliner, microblading, lips"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="bio" className="form-label">Bio</label>
                    <textarea
                      className="form-control"
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      placeholder="Artist bio and experience"
                    />
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="isActive">
                        Active
                      </label>
                    </div>
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
                        {editingArtist ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingArtist ? 'Update Artist' : 'Create Artist'
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
