'use client';

import { useState, useEffect } from 'react';
import { ServiceService } from '@/services/database';
import { Service } from '@/types/database';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

interface ServiceFormData {
  name: string;
  description: string;
  price: number;
  duration: string;
  category: 'eyebrows' | 'eyeliner' | 'lips' | 'correction';
  isActive: boolean;
  requirements: string[];
  contraindications: string[];
  order: number;
  image: string;
}

const defaultFormData: ServiceFormData = {
  name: '',
  description: '',
  price: 0,
  duration: '',
  category: 'eyebrows',
  isActive: true,
  requirements: [],
  contraindications: [],
  order: 0,
  image: ''
};

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<ServiceFormData>(defaultFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newRequirement, setNewRequirement] = useState('');
  const [newContraindication, setNewContraindication] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const servicesData = await ServiceService.getAllServices();
      setServices(servicesData);
      setError(null);
    } catch (err) {
      setError('Failed to load services');
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const fileName = `services/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = formData.image;

      // Upload new image if selected
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      const serviceData = {
        ...formData,
        image: imageUrl,
        price: Number(formData.price),
        order: Number(formData.order)
      };

      if (editingService) {
        // Update existing service
        await ServiceService.updateService(editingService.id, serviceData);
      } else {
        // Create new service
        await ServiceService.createService(serviceData);
      }

      await loadServices();
      resetForm();
      setShowForm(false);
    } catch (err) {
      setError('Failed to save service');
      console.error('Error saving service:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
      isActive: service.isActive,
      requirements: service.requirements || [],
      contraindications: service.contraindications || [],
      order: (service as any).order || 0,
      image: service.image
    });
    setShowForm(true);
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`Are you sure you want to delete "${service.name}"?`)) {
      return;
    }

    try {
      await ServiceService.deleteService(service.id);
      
      // Delete image from storage if it's a Firebase storage URL
      if (service.image && service.image.includes('firebase')) {
        try {
          const imageRef = ref(storage, service.image);
          await deleteObject(imageRef);
        } catch (imgError) {
          console.warn('Could not delete image:', imgError);
        }
      }

      await loadServices();
    } catch (err) {
      setError('Failed to delete service');
      console.error('Error deleting service:', err);
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingService(null);
    setImageFile(null);
    setNewRequirement('');
    setNewContraindication('');
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addContraindication = () => {
    if (newContraindication.trim()) {
      setFormData(prev => ({
        ...prev,
        contraindications: [...prev.contraindications, newContraindication.trim()]
      }));
      setNewContraindication('');
    }
  };

  const removeContraindication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contraindications: prev.contraindications.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Services Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <i className="fas fa-plus me-2"></i>Add New Service
        </button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Services Table */}
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Current Services ({services.length})</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <span className="badge bg-secondary">
                        {(service as any).order ?? 'N/A'}
                      </span>
                    </td>
                    <td>
                      {service.image && (
                        <img
                          src={service.image}
                          alt={service.name}
                          className="rounded"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      )}
                    </td>
                    <td>
                      <div>
                        <strong>{service.name}</strong>
                        <br />
                        <small className="text-muted">
                          {service.description.substring(0, 60)}...
                        </small>
                      </div>
                    </td>
                    <td>
                      <strong>${service.price}</strong>
                    </td>
                    <td>{service.duration}</td>
                    <td>
                      <span className="badge bg-info text-capitalize">
                        {service.category}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${service.isActive ? 'bg-success' : 'bg-secondary'}`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleEdit(service)}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(service)}
                          title="Delete"
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
        </div>
      </div>

      {/* Service Form Modal */}
      {showForm && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold d-flex align-items-center">
                  <i className="fas fa-cogs me-2"></i>
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowForm(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body bg-light">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="fas fa-tag me-1 text-primary"></i>
                          Service Name *
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg border-2"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter service name"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="fas fa-dollar-sign me-1 text-success"></i>
                          Price *
                        </label>
                        <div className="input-group input-group-lg">
                          <span className="input-group-text bg-success text-white border-success">$</span>
                          <input
                            type="number"
                            className="form-control border-2"
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                            placeholder="0.00"
                            required
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="fas fa-sort-numeric-up me-1 text-info"></i>
                          Order
                        </label>
                        <input
                          type="number"
                          className="form-control form-control-lg border-2"
                          value={formData.order}
                          onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="fas fa-clock me-1 text-warning"></i>
                          Duration *
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-lg border-2"
                          value={formData.duration}
                          onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="e.g., 2-3 hours"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark">
                          <i className="fas fa-list me-1 text-secondary"></i>
                          Category *
                        </label>
                        <select
                          className="form-select form-select-lg border-2"
                          value={formData.category}
                          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'eyebrows' | 'eyeliner' | 'lips' | 'correction' }))}
                          required
                        >
                          <option value="eyebrows">✨ Eyebrows</option>
                          <option value="lips">💋 Lips</option>
                          <option value="eyeliner">👁️ Eyeliner</option>
                          <option value="correction">🔧 Correction</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">
                      <i className="fas fa-align-left me-1 text-primary"></i>
                      Description *
                    </label>
                    <textarea
                      className="form-control form-control-lg border-2"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the service in detail..."
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">
                      <i className="fas fa-image me-1 text-info"></i>
                      Service Image
                    </label>
                    <div className="border-2 border-dashed border-info rounded p-3 bg-white">
                      <input
                        type="file"
                        className="form-control form-control-lg border-0"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      />
                      {formData.image && (
                        <div className="mt-3 text-center">
                          <img
                            src={formData.image}
                            alt="Current image"
                            className="img-thumbnail border-2 border-primary shadow-sm"
                            style={{ maxWidth: '200px', maxHeight: '200px' }}
                          />
                          <p className="small text-muted mt-2">Current service image</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">
                      <i className="fas fa-check-circle me-1 text-success"></i>
                      Requirements
                    </label>
                    <div className="card border-success border-2">
                      <div className="card-body bg-success bg-opacity-10">
                        <div className="input-group mb-3">
                          <input
                            type="text"
                            className="form-control form-control-lg border-2"
                            value={newRequirement}
                            onChange={(e) => setNewRequirement(e.target.value)}
                            placeholder="Add a requirement"
                          />
                          <button
                            type="button"
                            className="btn btn-success btn-lg"
                            onClick={addRequirement}
                          >
                            <i className="fas fa-plus me-1"></i>Add
                          </button>
                        </div>
                        {formData.requirements.map((req, index) => (
                          <div key={index} className="d-flex align-items-center mb-2 p-2 bg-white rounded border">
                            <i className="fas fa-check text-success me-2"></i>
                            <span className="flex-grow-1">{req}</span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger rounded-pill"
                              onClick={() => removeRequirement(index)}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Contraindications */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold text-dark">
                      <i className="fas fa-exclamation-triangle me-1 text-warning"></i>
                      Contraindications
                    </label>
                    <div className="card border-warning border-2">
                      <div className="card-body bg-warning bg-opacity-10">
                        <div className="input-group mb-3">
                          <input
                            type="text"
                            className="form-control form-control-lg border-2"
                            value={newContraindication}
                            onChange={(e) => setNewContraindication(e.target.value)}
                            placeholder="Add a contraindication"
                          />
                          <button
                            type="button"
                            className="btn btn-warning btn-lg"
                            onClick={addContraindication}
                          >
                            <i className="fas fa-plus me-1"></i>Add
                          </button>
                        </div>
                        {formData.contraindications.map((contra, index) => (
                          <div key={index} className="d-flex align-items-center mb-2 p-2 bg-white rounded border">
                            <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                            <span className="flex-grow-1">{contra}</span>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger rounded-pill"
                              onClick={() => removeContraindication(index)}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="card border-primary border-2 mb-4">
                    <div className="card-body bg-primary bg-opacity-10">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          checked={formData.isActive}
                          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                          style={{ transform: 'scale(1.5)' }}
                        />
                        <label className="form-check-label fw-semibold text-dark ms-2">
                          <i className="fas fa-eye me-1 text-primary"></i>
                          Active (visible to customers)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-0 p-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-lg rounded-pill px-4 me-3"
                    onClick={() => setShowForm(false)}
                  >
                    <i className="fas fa-times me-2"></i>Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg rounded-pill px-4 shadow"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        <i className="fas fa-save me-1"></i>Saving...
                      </>
                    ) : (
                      <>
                        <i className={`fas ${editingService ? 'fa-edit' : 'fa-plus'} me-2`}></i>
                        {editingService ? 'Update Service' : 'Create Service'}
                      </>
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
