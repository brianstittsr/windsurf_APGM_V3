'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { Button } from '@/components/ui/button';
import { useAlertDialog } from '@/components/ui/alert-dialog';

interface RegistrationForm {
  id: string;
  clientName: string;
  clientEmail: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  skinType?: string;
  allergies?: string;
  medications?: string;
  previousProcedures?: string;
  expectations?: string;
  formType?: string;
  status: 'submitted' | 'reviewed' | 'approved' | 'rejected';
  submittedAt?: Date;
  reviewedAt?: Date;
  notes?: string;
}

export default function RegistrationFormsManager() {
  const [forms, setForms] = useState<RegistrationForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'reviewed' | 'approved' | 'rejected'>('all');
  const [selectedForm, setSelectedForm] = useState<RegistrationForm | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const { showAlert, showConfirm, AlertDialogComponent } = useAlertDialog();

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      // Fetch health forms
      const formsCollection = collection(getDb(), 'healthForms');
      const formsSnapshot = await getDocs(formsCollection);
      
      // Fetch appointments to get client details
      const appointmentsCollection = collection(getDb(), 'appointments');
      const appointmentsSnapshot = await getDocs(appointmentsCollection);
      const appointmentsMap = new Map();
      appointmentsSnapshot.docs.forEach(doc => {
        appointmentsMap.set(doc.id, doc.data());
      });
      
      const formsList = formsSnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Get appointment data if available
        const appointment = data.appointmentId ? appointmentsMap.get(data.appointmentId) : null;
        
        // Use signature as fallback for client name
        const clientName = appointment?.clientName || 
                          appointment?.name ||
                          data.signature || 
                          'Unknown';
        const clientEmail = appointment?.clientEmail || appointment?.email || '';
        const phone = appointment?.phone || appointment?.clientPhone || '';
        
        const mappedForm = {
          ...data,
          id: doc.id,
          clientName,
          clientEmail,
          phone,
          status: data.status || 'submitted'
        };
        
        return mappedForm as RegistrationForm;
      });
      
      setForms(formsList.sort((a, b) => {
        const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return dateB - dateA;
      }));
    } catch (error) {
      console.error('Error fetching forms:', error);
      showAlert({ title: 'Error', description: 'Error fetching registration forms. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (formId: string, newStatus: string) => {
    try {
      const formRef = doc(getDb(), 'healthForms', formId);
      await updateDoc(formRef, {
        status: newStatus,
        reviewedAt: new Date(),
        notes: reviewNotes
      });
      setReviewNotes('');
      setSelectedForm(null);
      fetchForms();
    } catch (error) {
      console.error('Error updating form:', error);
      showAlert({ title: 'Error', description: 'Error updating form. Please try again.', variant: 'destructive' });
    }
  };

  const handleDeleteForm = async (formId: string, clientName: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Form',
      description: `Are you sure you want to delete the form for ${clientName}? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'destructive'
    });
    if (!confirmed) return;

    try {
      await deleteDoc(doc(getDb(), 'healthForms', formId));
      showAlert({ title: 'Success', description: 'Form deleted successfully!', variant: 'success' });
      fetchForms();
    } catch (error) {
      console.error('Error deleting form:', error);
      showAlert({ title: 'Error', description: 'Error deleting form. Please try again.', variant: 'destructive' });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredForms = forms.filter(form => {
    const statusMatch = filterStatus === 'all' || form.status === filterStatus;
    return statusMatch;
  });

  const pendingReview = filteredForms.filter(f => f.status === 'submitted').length;
  const approved = filteredForms.filter(f => f.status === 'approved').length;
  const rejected = filteredForms.filter(f => f.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        <i className="fas fa-file-alt text-[#AD6269]"></i>Registration Forms
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#AD6269] text-white rounded-xl p-4">
          <h6 className="text-sm opacity-90">Total Forms</h6>
          <h3 className="text-2xl font-bold">{filteredForms.length}</h3>
        </div>
        <div className="bg-blue-500 text-white rounded-xl p-4">
          <h6 className="text-sm opacity-90">Pending Review</h6>
          <h3 className="text-2xl font-bold">{pendingReview}</h3>
        </div>
        <div className="bg-green-500 text-white rounded-xl p-4">
          <h6 className="text-sm opacity-90">Approved</h6>
          <h3 className="text-2xl font-bold">{approved}</h3>
        </div>
        <div className="bg-red-500 text-white rounded-xl p-4">
          <h6 className="text-sm opacity-90">Rejected</h6>
          <h3 className="text-2xl font-bold">{rejected}</h3>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'submitted', 'reviewed', 'approved', 'rejected'] as const).map(status => (
          <Button
            key={status}
            variant={filterStatus === status ? 'default' : 'outline'}
            className={filterStatus === status ? 'bg-[#AD6269] hover:bg-[#9d5860]' : ''}
            onClick={() => setFilterStatus(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Forms Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-[#AD6269]">
          <h5 className="font-semibold text-white">Submitted Forms ({filteredForms.length})</h5>
        </div>
        <div className="p-6">
          {filteredForms.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-file-alt text-4xl text-gray-300 mb-3"></i>
              <p className="text-gray-500">No registration forms found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Client Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Form Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Submitted</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredForms.map((form) => (
                    <tr key={form.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{form.clientName}</td>
                      <td className="py-3 px-4 text-gray-600">{form.clientEmail}</td>
                      <td className="py-3 px-4 text-gray-600">{form.phone || '-'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                          {form.formType || 'Health Form'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {form.submittedAt ? new Date(form.submittedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(form.status)}`}>
                          {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => setSelectedForm(form)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => handleDeleteForm(form.id, form.clientName)}
                            title="Delete Form"
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

      {/* Form Details Modal */}
      {selectedForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 bg-[#AD6269] flex justify-between items-center">
              <h4 className="text-lg font-bold text-white">Form Details - {selectedForm.clientName}</h4>
              <button
                type="button"
                className="text-white hover:text-gray-200"
                onClick={() => setSelectedForm(null)}
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{selectedForm.clientName}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedForm.clientEmail}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900">{selectedForm.phone || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                  <p className="text-gray-900">{selectedForm.city && selectedForm.state ? `${selectedForm.city}, ${selectedForm.state}` : '-'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Signature</label>
                <p className="text-gray-900">{(selectedForm as any).signature || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Health Form Responses</label>
                {(selectedForm as any).responses ? (
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-2 px-3 font-semibold">Question #</th>
                          <th className="text-left py-2 px-3 font-semibold">Response</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries((selectedForm as any).responses).map(([key, value]) => (
                          <tr key={key} className="border-t">
                            <td className="py-2 px-3">Question {key}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${value === 'yes' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                {String(value).toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No responses available</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Clearance Required</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${(selectedForm as any).clearanceRequired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {(selectedForm as any).clearanceRequired ? 'YES' : 'NO'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Form Valid</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${(selectedForm as any).isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {(selectedForm as any).isValid ? 'VALID' : 'INVALID'}
                  </span>
                </div>
              </div>
              <div>
                <label htmlFor="reviewNotes" className="block text-sm font-semibold text-gray-700 mb-1">Review Notes</label>
                <textarea
                  id="reviewNotes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add review notes..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                  value={selectedForm.status}
                  onChange={(e) => {
                    setSelectedForm({ ...selectedForm, status: e.target.value as any });
                  }}
                >
                  <option value="submitted">Submitted</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelectedForm(null)}>
                Close
              </Button>
              <Button 
                className="bg-[#AD6269] hover:bg-[#9d5860]"
                onClick={() => handleStatusChange(selectedForm.id, selectedForm.status)}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
      {AlertDialogComponent}
    </div>
  );
}
