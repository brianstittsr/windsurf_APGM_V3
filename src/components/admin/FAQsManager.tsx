'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { Button } from '@/components/ui/button';
import { useAlertDialog } from '@/components/ui/alert-dialog';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isExpanded?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FAQCategory {
  id: string;
  name: string;
  icon: string;
  order: number;
}

const defaultCategories: FAQCategory[] = [
  { id: 'clients', name: 'Creating Clients', icon: 'fa-user-plus', order: 1 },
  { id: 'bookings', name: 'Managing Bookings', icon: 'fa-calendar-plus', order: 2 },
  { id: 'notes', name: 'Procedure Notes', icon: 'fa-sticky-note', order: 3 },
  { id: 'general', name: 'General', icon: 'fa-question-circle', order: 4 },
];

const defaultFAQs: Omit<FAQItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Creating Clients
  {
    category: 'clients',
    order: 1,
    question: 'How do I create a new client?',
    answer: `**Method 1: From the Clients Tab**
1. Navigate to **Clients & Bookings** → **Clients** in the sidebar
2. Click the **"+ Add New Client"** button
3. Fill in the required information:
   - First Name & Last Name
   - Email Address
   - Phone Number
   - Password (minimum 6 characters)
4. Click **"Create Client"** to save

**Method 2: During Booking Creation**
- When creating a booking, click **"Create New Client"** in the wizard
- The client will be created and automatically selected for the booking`
  },
  {
    category: 'clients',
    order: 2,
    question: 'What information is required for a new client?',
    answer: `All of the following fields are required:
- **First Name**: Client's first name
- **Last Name**: Client's last name
- **Email Address**: A valid email (used for confirmations)
- **Phone Number**: Contact number
- **Password**: Minimum 6 characters (for client portal access)`
  },
  {
    category: 'clients',
    order: 3,
    question: 'Can I edit a client\'s information after creation?',
    answer: `Yes! To edit a client:
1. Go to **Clients & Bookings** → **Clients**
2. Find the client in the list
3. Click the **blue edit icon** (✏️) in the Actions column
4. Update the information
5. Click **"Save Changes"**

Note: Email addresses cannot be changed after creation.`
  },
  // Managing Bookings
  {
    category: 'bookings',
    order: 1,
    question: 'How do I create a new booking?',
    answer: `1. Go to **Clients & Bookings** → **Bookings**
2. Click **"+ Create Booking"**
3. Follow the booking wizard:
   - **Step 1**: Select or create a client
   - **Step 2**: Choose the service
   - **Step 3**: Select date and time
   - **Step 4**: Handle deposit (optional)
   - **Step 5**: Add notes and confirm

The client will receive a confirmation email automatically.`
  },
  {
    category: 'bookings',
    order: 2,
    question: 'How do I change an appointment time?',
    answer: `1. Go to **Bookings** tab
2. Find the appointment in the list
3. Click the **blue edit icon** (✏️)
4. Select the new date and time
5. Click **"Save & Send Email"**

The client will automatically receive an email notification about the time change.`
  },
  {
    category: 'bookings',
    order: 3,
    question: 'How do I update a booking status?',
    answer: `1. Find the booking in the Bookings list
2. Use the **Status dropdown** in the booking row
3. Select the new status:
   - **Pending**: Awaiting confirmation
   - **Confirmed**: Appointment confirmed
   - **Completed**: Service performed
   - **Cancelled**: Appointment cancelled

The status updates immediately.`
  },
  {
    category: 'bookings',
    order: 4,
    question: 'How do I view booking details?',
    answer: `1. Go to **Bookings** tab
2. Find the booking you want to view
3. Click the **green eye icon** (👁️) in the Actions column
4. The Booking Details modal will show:
   - Client information
   - Appointment details
   - Service and pricing
   - Procedure notes`
  },
  {
    category: 'bookings',
    order: 5,
    question: 'Can I delete a booking?',
    answer: `Yes, but use caution as this cannot be undone:
1. Find the booking in the list
2. Click the **red trash icon** (🗑️)
3. Confirm the deletion

**Tip**: Consider changing the status to "Cancelled" instead of deleting, to keep a record of the appointment.`
  },
  // Procedure Notes
  {
    category: 'notes',
    order: 1,
    question: 'How do I add procedure notes to a booking?',
    answer: `1. Go to **Bookings** tab
2. Click the **green eye icon** (👁️) on the booking
3. Scroll to the **"Procedure Notes"** section
4. Type your note in the text area
5. Click the **"+"** button to add

Each note is automatically timestamped with the current date and time.`
  },
  {
    category: 'notes',
    order: 2,
    question: 'What should I include in procedure notes?',
    answer: `Best practices for procedure notes:

**During the Procedure:**
- Pigment colors and mix ratios used
- Needle sizes and techniques
- Numbing cream duration
- Client comfort level

**Client Information:**
- Skin type and reactions
- Sensitivity or bleeding
- Special requests or preferences

**Aftercare:**
- Instructions given
- Products recommended
- Follow-up appointment scheduled

**For Touch-ups:**
- Areas that need attention
- Color adjustments needed
- Shape modifications`
  },
  {
    category: 'notes',
    order: 3,
    question: 'Can I delete a procedure note?',
    answer: `Yes:
1. Open the booking details (click the eye icon)
2. Find the note you want to delete
3. Click the **red trash icon** next to the note
4. Confirm the deletion

**Note**: Deleted notes cannot be recovered.`
  },
  {
    category: 'notes',
    order: 4,
    question: 'What is the difference between "Original Note" and "Procedure Notes"?',
    answer: `**Original Note/Description** (amber box):
- Notes added when the booking was first created
- May include payment notes or special requests
- Cannot be edited after booking creation

**Procedure Notes** (white cards with timestamps):
- Notes added after the booking was created
- Each note has a timestamp
- Can be added, viewed, and deleted anytime
- Ideal for documenting the actual procedure`
  },
  // General
  {
    category: 'general',
    order: 1,
    question: 'How do I access the admin dashboard?',
    answer: `1. Go to the website login page
2. Log in with an admin account
3. You will be automatically redirected to the dashboard
4. Or navigate directly to **/dashboard**

**Note**: Only users with the "Admin" role can access the dashboard.`
  },
  {
    category: 'general',
    order: 2,
    question: 'How do I view the booking calendar?',
    answer: `There are two ways to view bookings:

**Calendar View** (visual):
- Go to **Clients & Bookings** → **Calendar**
- See bookings in a monthly/weekly grid
- Click on any booking to view details

**List View** (detailed):
- Go to **Clients & Bookings** → **Bookings**
- See all bookings in a table format
- Filter by status (All, Confirmed, Pending, etc.)`
  },
];

export default function FAQsManager() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [categories] = useState<FAQCategory[]>(defaultCategories);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
  });
  const [saving, setSaving] = useState(false);
  const { showAlert, showConfirm, AlertDialogComponent } = useAlertDialog();

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async (skipInit = false) => {
    setLoading(true);
    try {
      const db = getDb();
      const faqsRef = collection(db, 'faqs');
      const snapshot = await getDocs(faqsRef);
      
      if (snapshot.empty && !skipInit) {
        // Initialize with default FAQs only if not skipping
        await initializeDefaultFAQs();
        return;
      }

      const faqsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FAQItem[];

      setFaqs(faqsList.sort((a, b) => {
        if (a.category !== b.category) {
          const catA = categories.find(c => c.id === a.category)?.order || 99;
          const catB = categories.find(c => c.id === b.category)?.order || 99;
          return catA - catB;
        }
        return a.order - b.order;
      }));
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetFAQs = async () => {
    const confirmed = await showConfirm({
      title: 'Reset All FAQs',
      description: 'This will delete ALL FAQs (including duplicates) and restore the default set. Are you sure?',
      confirmText: 'Reset All',
      variant: 'destructive'
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      const db = getDb();
      const faqsRef = collection(db, 'faqs');
      
      // Delete ALL existing FAQs - fetch fresh to get all
      let snapshot = await getDocs(faqsRef);
      console.log(`Deleting ${snapshot.docs.length} FAQs...`);
      
      // Delete in batches to ensure all are removed
      while (snapshot.docs.length > 0) {
        for (const docSnap of snapshot.docs) {
          await deleteDoc(doc(db, 'faqs', docSnap.id));
        }
        // Re-fetch to check if any remain
        snapshot = await getDocs(faqsRef);
        console.log(`Remaining FAQs: ${snapshot.docs.length}`);
      }
      
      // Now add fresh defaults
      for (const faq of defaultFAQs) {
        await addDoc(faqsRef, {
          ...faq,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      // Fetch without auto-init
      await fetchFAQs(true);
      
      await showAlert({ title: 'Success', description: `FAQs reset! Added ${defaultFAQs.length} FAQs.`, variant: 'success' });
    } catch (error) {
      console.error('Error resetting FAQs:', error);
      await showAlert({ title: 'Error', description: 'Failed to reset FAQs.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const removeDuplicates = async () => {
    const confirmed = await showConfirm({
      title: 'Remove Duplicate FAQs',
      description: 'This will find FAQs with the same question and keep only the first one. Continue?',
      confirmText: 'Remove Duplicates',
      variant: 'warning'
    });

    if (!confirmed) return;

    setLoading(true);
    try {
      const db = getDb();
      const faqsRef = collection(db, 'faqs');
      const snapshot = await getDocs(faqsRef);
      
      // Group by question
      const questionMap = new Map<string, string[]>();
      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        const question = data.question?.toLowerCase().trim() || '';
        if (!questionMap.has(question)) {
          questionMap.set(question, []);
        }
        questionMap.get(question)!.push(docSnap.id);
      });
      
      // Find duplicates (keep first, delete rest)
      let deletedCount = 0;
      for (const [question, ids] of questionMap) {
        if (ids.length > 1) {
          // Keep the first one, delete the rest
          for (let i = 1; i < ids.length; i++) {
            await deleteDoc(doc(db, 'faqs', ids[i]));
            deletedCount++;
          }
        }
      }
      
      await fetchFAQs(true);
      await showAlert({ 
        title: 'Success', 
        description: `Removed ${deletedCount} duplicate FAQ(s).`, 
        variant: 'success' 
      });
    } catch (error) {
      console.error('Error removing duplicates:', error);
      await showAlert({ title: 'Error', description: 'Failed to remove duplicates.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultFAQs = async () => {
    try {
      const db = getDb();
      const faqsRef = collection(db, 'faqs');
      
      for (const faq of defaultFAQs) {
        await addDoc(faqsRef, {
          ...faq,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      await fetchFAQs();
    } catch (error) {
      console.error('Error initializing FAQs:', error);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedItems(new Set(filteredFaqs.map(f => f.id)));
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  const handleSaveFaq = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      await showAlert({ title: 'Missing Information', description: 'Please fill in both question and answer.', variant: 'warning' });
      return;
    }

    setSaving(true);
    try {
      const db = getDb();
      
      if (editingFaq) {
        // Update existing
        await updateDoc(doc(db, 'faqs', editingFaq.id), {
          question: formData.question,
          answer: formData.answer,
          category: formData.category,
          updatedAt: new Date()
        });
      } else {
        // Create new
        const maxOrder = faqs.filter(f => f.category === formData.category).reduce((max, f) => Math.max(max, f.order), 0);
        await addDoc(collection(db, 'faqs'), {
          question: formData.question,
          answer: formData.answer,
          category: formData.category,
          order: maxOrder + 1,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      await showAlert({ title: 'Success', description: editingFaq ? 'FAQ updated!' : 'FAQ added!', variant: 'success' });
      setShowAddModal(false);
      setEditingFaq(null);
      setFormData({ question: '', answer: '', category: 'general' });
      fetchFAQs();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      await showAlert({ title: 'Error', description: 'Failed to save FAQ.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaq = async (faq: FAQItem) => {
    const confirmed = await showConfirm({
      title: 'Delete FAQ',
      description: `Are you sure you want to delete "${faq.question}"?`,
      confirmText: 'Delete',
      variant: 'destructive'
    });

    if (!confirmed) return;

    try {
      await deleteDoc(doc(getDb(), 'faqs', faq.id));
      await showAlert({ title: 'Success', description: 'FAQ deleted!', variant: 'success' });
      fetchFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      await showAlert({ title: 'Error', description: 'Failed to delete FAQ.', variant: 'destructive' });
    }
  };

  const openEditModal = (faq: FAQItem) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
    });
    setShowAddModal(true);
  };

  const filteredFaqs = activeCategory === 'all' 
    ? faqs 
    : faqs.filter(f => f.category === activeCategory);

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
            <i className="fas fa-question-circle text-[#AD6269]"></i>
            FAQs & Instructions
          </h2>
          <p className="text-gray-500 text-sm mt-1">Quick reference guide for common tasks</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={removeDuplicates} className="text-amber-600 hover:bg-amber-50">
            <i className="fas fa-copy mr-2"></i>Remove Duplicates
          </Button>
          <Button variant="outline" onClick={resetFAQs} className="text-red-600 hover:bg-red-50">
            <i className="fas fa-sync-alt mr-2"></i>Reset FAQs
          </Button>
          <Button variant="outline" onClick={expandAll}>
            <i className="fas fa-expand-alt mr-2"></i>Expand All
          </Button>
          <Button variant="outline" onClick={collapseAll}>
            <i className="fas fa-compress-alt mr-2"></i>Collapse All
          </Button>
          <Button onClick={() => { setEditingFaq(null); setFormData({ question: '', answer: '', category: 'general' }); setShowAddModal(true); }} className="bg-[#AD6269] hover:bg-[#9d5860]">
            <i className="fas fa-plus mr-2"></i>Add FAQ
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-[#AD6269] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <i className="fas fa-th-list mr-2"></i>All
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === cat.id
                ? 'bg-[#AD6269] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className={`fas ${cat.icon} mr-2`}></i>{cat.name}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <i className="fas fa-question-circle text-5xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No FAQs found in this category.</p>
          </div>
        ) : (
          filteredFaqs.map(faq => {
            const category = categories.find(c => c.id === faq.category);
            const isExpanded = expandedItems.has(faq.id);
            
            return (
              <div key={faq.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      faq.category === 'clients' ? 'bg-blue-100 text-blue-600' :
                      faq.category === 'bookings' ? 'bg-green-100 text-green-600' :
                      faq.category === 'notes' ? 'bg-amber-100 text-amber-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <i className={`fas ${category?.icon || 'fa-question'}`}></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{faq.question}</p>
                      <p className="text-xs text-gray-500">{category?.name}</p>
                    </div>
                  </div>
                  <i className={`fas fa-chevron-down text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}></i>
                </button>
                
                {isExpanded && (
                  <div className="px-6 pb-4 border-t border-gray-100">
                    <div className="pt-4 prose prose-sm max-w-none">
                      <div className="text-gray-700 whitespace-pre-wrap" dangerouslySetInnerHTML={{ 
                        __html: faq.answer
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\n/g, '<br/>')
                      }} />
                    </div>
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                      <Button variant="outline" size="sm" onClick={() => openEditModal(faq)}>
                        <i className="fas fa-edit mr-1"></i>Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => handleDeleteFaq(faq)}>
                        <i className="fas fa-trash mr-1"></i>Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 bg-[#AD6269] rounded-t-xl flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                <i className={`fas ${editingFaq ? 'fa-edit' : 'fa-plus'} mr-2`}></i>
                {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-white hover:bg-white/20 p-1.5 rounded-lg">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter the question..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Enter the answer... Use **text** for bold"
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  <i className="fas fa-info-circle mr-1"></i>
                  Use **text** for bold formatting
                </p>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddModal(false)} disabled={saving}>
                Cancel
              </Button>
              <Button className="bg-[#AD6269] hover:bg-[#9d5860]" onClick={handleSaveFaq} disabled={saving}>
                {saving ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>Saving...</>
                ) : (
                  <><i className="fas fa-save mr-2"></i>{editingFaq ? 'Update' : 'Add'} FAQ</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {AlertDialogComponent}
    </div>
  );
}
