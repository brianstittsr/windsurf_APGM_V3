'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAlertDialog } from '@/components/ui/alert-dialog';

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  type: 'consent' | 'health' | 'agreement' | 'policy' | 'other';
  fileUrl?: string;
  content?: string;
  isActive: boolean;
  requiresSignature: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SignedDocument {
  id: string;
  templateId: string;
  templateName: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  bookingId?: string;
  signatureData: string;
  signedAt: Date;
  pdfUrl?: string;
  emailSent: boolean;
  emailSentAt?: Date;
}

export default function DocumentsManager() {
  const [activeTab, setActiveTab] = useState<'templates' | 'signed'>('templates');
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [signedDocs, setSignedDocs] = useState<SignedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'consent' as DocumentTemplate['type'],
    fileUrl: '',
    content: '',
    isActive: true,
    requiresSignature: true
  });
  const [submitting, setSubmitting] = useState(false);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { showAlert, showConfirm, AlertDialogComponent } = useAlertDialog();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const db = getDb();
      
      // Load templates
      const templatesQuery = query(collection(db, 'documentTemplates'), orderBy('createdAt', 'desc'));
      const templatesSnapshot = await getDocs(templatesQuery);
      const templatesData = templatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as DocumentTemplate[];
      setTemplates(templatesData);
      
      // Load signed documents
      const signedQuery = query(collection(db, 'signedDocuments'), orderBy('signedAt', 'desc'));
      const signedSnapshot = await getDocs(signedQuery);
      const signedData = signedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        signedAt: doc.data().signedAt?.toDate() || new Date(),
        emailSentAt: doc.data().emailSentAt?.toDate()
      })) as SignedDocument[];
      setSignedDocs(signedData);
      
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      await showAlert({
        title: 'Missing Information',
        description: 'Please enter a template name',
        variant: 'warning'
      });
      return;
    }

    setSubmitting(true);
    try {
      const db = getDb();
      const templateData = {
        ...formData,
        updatedAt: Timestamp.now()
      };

      if (editingTemplate) {
        await updateDoc(doc(db, 'documentTemplates', editingTemplate.id), templateData);
        await showAlert({
          title: 'Success',
          description: 'Template updated successfully!',
          variant: 'success'
        });
      } else {
        await addDoc(collection(db, 'documentTemplates'), {
          ...templateData,
          createdAt: Timestamp.now()
        });
        await showAlert({
          title: 'Success',
          description: 'Template created successfully!',
          variant: 'success'
        });
      }

      closeModal();
      loadData();
    } catch (error) {
      console.error('Error saving template:', error);
      await showAlert({
        title: 'Error',
        description: 'Error saving template',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (template: DocumentTemplate) => {
    const confirmed = await showConfirm({
      title: 'Delete Template',
      description: `Are you sure you want to delete "${template.name}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });
    if (!confirmed) return;
    
    try {
      const db = getDb();
      await deleteDoc(doc(db, 'documentTemplates', template.id));
      await showAlert({
        title: 'Success',
        description: 'Template deleted successfully!',
        variant: 'success'
      });
      loadData();
    } catch (error) {
      console.error('Error deleting template:', error);
      await showAlert({
        title: 'Error',
        description: 'Error deleting template',
        variant: 'destructive'
      });
    }
  };

  const handleToggleActive = async (template: DocumentTemplate) => {
    try {
      const db = getDb();
      await updateDoc(doc(db, 'documentTemplates', template.id), {
        isActive: !template.isActive,
        updatedAt: Timestamp.now()
      });
      loadData();
    } catch (error) {
      console.error('Error toggling template status:', error);
    }
  };

  const handleSendEmail = async (signedDoc: SignedDocument) => {
    setSendingEmail(signedDoc.id);
    try {
      const response = await fetch('/api/documents/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: signedDoc.id,
          clientEmail: signedDoc.clientEmail,
          clientName: signedDoc.clientName,
          templateName: signedDoc.templateName,
          pdfUrl: signedDoc.pdfUrl,
          signatureData: signedDoc.signatureData
        })
      });

      if (response.ok) {
        // Update document to mark email as sent
        const db = getDb();
        await updateDoc(doc(db, 'signedDocuments', signedDoc.id), {
          emailSent: true,
          emailSentAt: Timestamp.now()
        });
        await showAlert({
          title: 'Success',
          description: 'Email sent successfully!',
          variant: 'success'
        });
        loadData();
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      await showAlert({
        title: 'Error',
        description: 'Error sending email',
        variant: 'destructive'
      });
    } finally {
      setSendingEmail(null);
    }
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      type: 'consent',
      fileUrl: '',
      content: '',
      isActive: true,
      requiresSignature: true
    });
    setShowModal(true);
  };

  const openEditModal = (template: DocumentTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      type: template.type,
      fileUrl: template.fileUrl || '',
      content: template.content || '',
      isActive: template.isActive,
      requiresSignature: template.requiresSignature
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consent': return 'bg-blue-100 text-blue-800';
      case 'health': return 'bg-green-100 text-green-800';
      case 'agreement': return 'bg-purple-100 text-purple-800';
      case 'policy': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSignedDocs = signedDocs.filter(doc =>
    doc.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.templateName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-file-contract text-[#AD6269]"></i>Documents & Agreements
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage document templates and signed agreements</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-6 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'templates' ? 'bg-[#AD6269] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <i className="fas fa-file-alt mr-2"></i>Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('signed')}
          className={`px-6 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'signed' ? 'bg-[#AD6269] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <i className="fas fa-signature mr-2"></i>Signed Documents ({signedDocs.length})
        </button>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreateModal} className="bg-[#AD6269] hover:bg-[#9d5860]">
              <i className="fas fa-plus mr-2"></i>Add Template
            </Button>
          </div>

          {templates.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <i className="fas fa-file-alt text-5xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No templates yet</h3>
              <p className="text-gray-500 mb-4">Create your first document template to get started.</p>
              <Button onClick={openCreateModal} className="bg-[#AD6269] hover:bg-[#9d5860]">
                <i className="fas fa-plus mr-2"></i>Add First Template
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {templates.map(template => (
                <div key={template.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                          {template.type}
                        </span>
                        {template.requiresSignature && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <i className="fas fa-signature mr-1"></i>Signature Required
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm">{template.description || 'No description'}</p>
                      {template.fileUrl && (
                        <a href={template.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#AD6269] hover:underline mt-2 inline-block">
                          <i className="fas fa-external-link-alt mr-1"></i>View File
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(template)}
                        className={`p-2 rounded-lg transition-colors ${template.isActive ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                        title={template.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <i className={`fas ${template.isActive ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                      <button
                        onClick={() => openEditModal(template)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Signed Documents Tab */}
      {activeTab === 'signed' && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <Input
              type="text"
              placeholder="Search by client name, email, or document..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredSignedDocs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <i className="fas fa-signature text-5xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No signed documents</h3>
              <p className="text-gray-500">Signed documents will appear here after clients complete their forms.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Client</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Document</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Signed</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSignedDocs.map(signedDoc => (
                      <tr key={signedDoc.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="text-sm font-medium text-gray-900">{signedDoc.clientName}</div>
                          <div className="text-xs text-gray-500">{signedDoc.clientEmail}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-900">{signedDoc.templateName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {signedDoc.signedAt.toLocaleDateString()} at {signedDoc.signedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {signedDoc.emailSent ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <i className="fas fa-check mr-1"></i>Sent
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Not sent
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {signedDoc.pdfUrl && (
                              <a
                                href={signedDoc.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View PDF"
                              >
                                <i className="fas fa-file-pdf"></i>
                              </a>
                            )}
                            <button
                              onClick={() => handleSendEmail(signedDoc)}
                              disabled={sendingEmail === signedDoc.id}
                              className="p-2 text-[#AD6269] hover:bg-[#AD6269]/10 rounded-lg transition-colors disabled:opacity-50"
                              title="Send Email"
                            >
                              {sendingEmail === signedDoc.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#AD6269]"></div>
                              ) : (
                                <i className="fas fa-envelope"></i>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Template Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h3>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={closeModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmitTemplate}>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Consent Form"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent resize-none"
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this template"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Document Type</Label>
                  <select
                    id="type"
                    className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as DocumentTemplate['type'] })}
                  >
                    <option value="consent">Consent Form</option>
                    <option value="health">Health Form</option>
                    <option value="agreement">Service Agreement</option>
                    <option value="policy">Policy Document</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fileUrl">File URL (PDF)</Label>
                  <Input
                    id="fileUrl"
                    value={formData.fileUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, fileUrl: e.target.value })}
                    placeholder="https://example.com/document.pdf"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Document Content (HTML)</Label>
                  <textarea
                    id="content"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent resize-none font-mono"
                    rows={4}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="<p>Document content here...</p>"
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-[#AD6269] focus:ring-[#AD6269]"
                      checked={formData.requiresSignature}
                      onChange={(e) => setFormData({ ...formData, requiresSignature: e.target.checked })}
                    />
                    <span className="text-sm text-gray-700">Requires Signature</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-[#AD6269] focus:ring-[#AD6269]"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl sticky bottom-0">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#AD6269] hover:bg-[#9d5860]" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      {editingTemplate ? 'Update Template' : 'Create Template'}
                    </>
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
