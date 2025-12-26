'use client';

import { useState, useEffect } from 'react';
import { ServiceService } from '@/services/database';
import { Service } from '@/types/database';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAlertDialog } from '@/components/ui/alert-dialog';

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

// Default form data structure
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
  const { showAlert, showConfirm, AlertDialogComponent } = useAlertDialog();

  useEffect(() => {
    loadServices();
    
    // Add a console log to confirm the component loaded properly
    console.log('ServicesManager component loaded');
  }, []);

  const loadServices = async () => {
    console.log('Loading services...');
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
    // Make sure we have at least the required fields
    if (!formData.name || !formData.price || !formData.duration) {
      setError('Please fill in all required fields');
      return;
    }
    
    setUploading(true);
    console.log('Submitting service form...', formData);

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
    const confirmed = await showConfirm({
      title: 'Delete Service',
      description: `Are you sure you want to delete "${service.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'destructive'
    });
    
    if (!confirmed) return;

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

      await showAlert({ title: 'Success', description: 'Service deleted successfully!', variant: 'success' });
      await loadServices();
    } catch (err) {
      await showAlert({ title: 'Error', description: 'Failed to delete service', variant: 'destructive' });
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <i className="fas fa-cogs text-[#AD6269]"></i>Services Management
        </h2>
        <Button
          className="bg-[#AD6269] hover:bg-[#9d5860]"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <i className="fas fa-plus mr-2"></i>Add New Service
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Services Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h5 className="font-semibold text-gray-900">Current Services ({services.length})</h5>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Order</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Image</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Price</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Duration</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-200 text-gray-700">
                      {(service as any).order ?? 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {service.image && (
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-semibold text-gray-900">{service.name}</p>
                      <p className="text-sm text-gray-500">
                        {service.description.substring(0, 60)}...
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-green-600">${service.price}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{service.duration}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                      {service.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        onClick={() => handleEdit(service)}
                        title="Edit"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Service Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 bg-[#AD6269] flex justify-between items-center">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <i className="fas fa-cogs"></i>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h4>
              <button
                type="button"
                className="text-white hover:text-gray-200"
                onClick={() => setShowForm(false)}
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                  <i className="fas fa-info-circle text-blue-600 text-xl"></i>
                  <span className="text-blue-800">Fill out the form below and click <strong>Save Service</strong> at the bottom when you're done.</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      <i className="fas fa-tag mr-1 text-[#AD6269]"></i>Service Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter service name"
                      required
                      className="w-full"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      <i className="fas fa-dollar-sign mr-1 text-green-600"></i>Price *
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 bg-green-600 text-white rounded-l-md border border-r-0 border-green-600">$</span>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                        placeholder="0.00"
                        required
                        min="0"
                        step="0.01"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      <i className="fas fa-sort-numeric-up mr-1 text-blue-600"></i>Order
                    </label>
                    <Input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      <i className="fas fa-clock mr-1 text-yellow-600"></i>Duration *
                    </label>
                    <Input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 2-3 hours"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      <i className="fas fa-list mr-1 text-gray-600"></i>Category *
                    </label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <i className="fas fa-align-left mr-1 text-[#AD6269]"></i>Description *
                  </label>
                  <textarea
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the service in detail..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <i className="fas fa-image mr-1 text-blue-600"></i>Service Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                    <input
                      type="file"
                      className="w-full text-sm"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                    {formData.image && (
                      <div className="mt-3 text-center">
                        <img
                          src={formData.image}
                          alt="Current image"
                          className="inline-block rounded-lg border-2 border-[#AD6269] shadow-sm max-w-[200px] max-h-[200px]"
                        />
                        <p className="text-sm text-gray-500 mt-2">Current service image</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <i className="fas fa-check-circle mr-1 text-green-600"></i>Requirements
                  </label>
                  <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex gap-2 mb-3">
                      <Input
                        type="text"
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        placeholder="Add a requirement"
                        className="flex-1"
                      />
                      <Button type="button" className="bg-green-600 hover:bg-green-700" onClick={addRequirement}>
                        <i className="fas fa-plus mr-1"></i>Add
                      </Button>
                    </div>
                    {formData.requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2 p-2 bg-white rounded border border-gray-200">
                        <i className="fas fa-check text-green-600"></i>
                        <span className="flex-1">{req}</span>
                        <button type="button" className="text-red-500 hover:text-red-700" onClick={() => removeRequirement(index)}>
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contraindications */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <i className="fas fa-exclamation-triangle mr-1 text-yellow-600"></i>Contraindications
                  </label>
                  <div className="border-2 border-yellow-200 rounded-lg p-4 bg-yellow-50">
                    <div className="flex gap-2 mb-3">
                      <Input
                        type="text"
                        value={newContraindication}
                        onChange={(e) => setNewContraindication(e.target.value)}
                        placeholder="Add a contraindication"
                        className="flex-1"
                      />
                      <Button type="button" className="bg-yellow-600 hover:bg-yellow-700" onClick={addContraindication}>
                        <i className="fas fa-plus mr-1"></i>Add
                      </Button>
                    </div>
                    {formData.contraindications.map((contra, index) => (
                      <div key={index} className="flex items-center gap-2 mb-2 p-2 bg-white rounded border border-gray-200">
                        <i className="fas fa-exclamation-triangle text-yellow-600"></i>
                        <span className="flex-1">{contra}</span>
                        <button type="button" className="text-red-500 hover:text-red-700" onClick={() => removeContraindication(index)}>
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-2 border-[#AD6269]/30 rounded-lg p-4 bg-[#AD6269]/5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-[#AD6269] focus:ring-[#AD6269]"
                    />
                    <span className="font-semibold text-gray-700">
                      <i className="fas fa-eye mr-1 text-[#AD6269]"></i>Active (visible to customers)
                    </span>
                  </label>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  {formData.name && formData.price && formData.duration ? (
                    <span className="text-green-600"><i className="fas fa-check-circle mr-1"></i>Ready to save</span>
                  ) : (
                    <span className="text-red-500"><i className="fas fa-exclamation-triangle mr-1"></i>Please fill required fields</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    <i className="fas fa-times mr-2"></i>Cancel
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={uploading}>
                    {uploading ? (
                      <><i className="fas fa-spinner fa-spin mr-2"></i>Saving...</>
                    ) : (
                      <><i className="fas fa-save mr-2"></i>{editingService ? 'Save Changes' : 'Save Service'}</>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {AlertDialogComponent}
    </div>
  );
}
