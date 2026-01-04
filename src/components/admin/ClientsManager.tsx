'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, where, addDoc } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { User } from '../../types/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAlertDialog } from '@/components/ui/alert-dialog';

interface ClientFormData {
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface ClientBooking {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  status: string;
  price?: number;
  artistName?: string;
  bookingNotes?: Array<{ id: string; text: string; timestamp: string }>;
}

interface ClientPayment {
  id: string;
  amount: number;
  type: string;
  method: string;
  status: string;
  processedAt?: any;
  appointmentId?: string;
}

interface ProgressNote {
  id: string;
  text: string;
  timestamp: string;
  createdBy?: string;
}

export default function ClientsManager() {
  const { user: currentUser, userRole, loading: authLoading } = useAuth();
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<ClientFormData>({
    email: '',
    displayName: '',
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [passwordResetStatus, setPasswordResetStatus] = useState<{[key: string]: string}>({});
  const { showAlert, showConfirm, AlertDialogComponent } = useAlertDialog();
  
  // Client Profile state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [viewingClient, setViewingClient] = useState<User | null>(null);
  const [profileTab, setProfileTab] = useState<'info' | 'appointments' | 'payments' | 'notes'>('info');
  const [clientBookings, setClientBookings] = useState<ClientBooking[]>([]);
  const [clientPayments, setClientPayments] = useState<ClientPayment[]>([]);
  const [progressNotes, setProgressNotes] = useState<ProgressNote[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editedClientInfo, setEditedClientInfo] = useState<Partial<ClientFormData>>({});
  
  // Historical booking from profile state
  const [showProfileHistoricalModal, setShowProfileHistoricalModal] = useState(false);
  const [creatingProfileBooking, setCreatingProfileBooking] = useState(false);
  const [profileHistoricalBooking, setProfileHistoricalBooking] = useState({
    serviceName: 'Microblading',
    date: '',
    time: '10:00',
    price: 500,
    status: 'completed' as 'pending' | 'confirmed' | 'completed' | 'cancelled',
    depositPaid: true,
    bookingNotes: [] as Array<{ id: string; text: string; timestamp: string; createdBy?: string }>
  });
  const [profileHistoricalNoteText, setProfileHistoricalNoteText] = useState('');
  
  // Add payment from profile state
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: 0,
    type: 'full_payment' as 'deposit' | 'full_payment' | 'refund',
    method: 'cash' as 'card' | 'cash' | 'cherry' | 'klarna' | 'paypal' | 'zelle' | 'venmo',
    status: 'completed' as 'pending' | 'completed' | 'failed' | 'refunded',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  // Edit appointment from profile state
  const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<ClientBooking | null>(null);
  const [editAppointmentData, setEditAppointmentData] = useState({
    serviceName: '',
    date: '',
    time: '',
    price: 0,
    status: 'completed' as 'pending' | 'confirmed' | 'completed' | 'cancelled',
    bookingNotes: [] as Array<{ id: string; text: string; timestamp: string; createdBy?: string }>
  });
  const [editAppointmentNoteText, setEditAppointmentNoteText] = useState('');
  const [savingAppointment, setSavingAppointment] = useState(false);

  useEffect(() => {
    if (!authLoading && currentUser && userRole === 'admin') {
      fetchClients();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, currentUser, userRole]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(getDb(), 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const clientsList = usersSnapshot.docs
        .map(doc => {
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
        })
        .filter(user => user.role === 'client'); // Only show clients
      setClients(clientsList);
    } catch (error) {
      console.error('Error fetching clients:', error);
      showAlert({
        title: 'Error',
        description: 'Error fetching clients.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (client: User) => {
    const confirmed = await showConfirm({
      title: 'Send Password Reset',
      description: `Are you sure you want to send a password reset email to ${client.email}?`,
      confirmText: 'Send Reset Email',
      cancelText: 'Cancel',
      variant: 'warning'
    });
    if (!confirmed) return;

    setPasswordResetStatus({ ...passwordResetStatus, [client.id]: 'sending' });
    try {
      const idToken = await currentUser?.getIdToken();
      const response = await fetch('/api/users/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ action: 'reset_password', uid: client.id, email: client.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send reset email');
      }

      setPasswordResetStatus({ ...passwordResetStatus, [client.id]: 'sent' });
      await showAlert({
        title: 'Email Sent',
        description: 'Password reset email sent successfully!',
        variant: 'success'
      });
      setTimeout(() => setPasswordResetStatus(prev => ({ ...prev, [client.id]: '' })), 5000);
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      setPasswordResetStatus({ ...passwordResetStatus, [client.id]: 'error' });
      await showAlert({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    setSubmitting(true);
    try {
      const userDocRef = doc(getDb(), 'users', editingClient.id);
      await updateDoc(userDocRef, {
        displayName: formData.displayName,
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
          body: JSON.stringify({ action: 'update_password', uid: editingClient.id, newPassword: formData.password }),
        });

        if (!passwordResponse.ok) {
          const errorData = await passwordResponse.json();
          throw new Error(errorData.error || 'Failed to update password');
        }
      }

      await showAlert({
        title: 'Success',
        description: 'Client updated successfully!',
        variant: 'success'
      });
      setShowModal(false);
      setEditingClient(null);
      setFormData({ email: '', displayName: '', firstName: '', lastName: '', phone: '', password: '', confirmPassword: '' });
      fetchClients();
    } catch (error: any) {
      console.error('Error updating client:', error);
      await showAlert({
        title: 'Error',
        description: `Error updating client: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
          role: 'client', // Always create as client
          phone: formData.phone,
          newPassword: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create client');
      }

      await showAlert({
        title: 'Success',
        description: 'Client created successfully!',
        variant: 'success'
      });
      setShowModal(false);
      setFormData({ email: '', displayName: '', firstName: '', lastName: '', phone: '', password: '', confirmPassword: '' });
      fetchClients();
    } catch (error: any) {
      console.error('Error creating client:', error);
      await showAlert({
        title: 'Error',
        description: error.message || 'Error creating client.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientId: string, clientEmail: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Client',
      description: `Are you sure you want to delete the client ${clientEmail}?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });
    if (!confirmed) return;
    try {
      await deleteDoc(doc(getDb(), 'users', clientId));
      await showAlert({
        title: 'Success',
        description: 'Client deleted successfully!',
        variant: 'success'
      });
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      await showAlert({
        title: 'Error',
        description: 'Error deleting client.',
        variant: 'destructive'
      });
    }
  };

  const openCreateModal = () => {
    setEditingClient(null);
    setFormData({ email: '', displayName: '', firstName: '', lastName: '', phone: '', password: '', confirmPassword: '' });
    setShowModal(true);
  };

  const openEditModal = (client: User) => {
    setEditingClient(client);
    const nameParts = (client.displayName || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    setFormData({
      email: client.email,
      displayName: client.displayName,
      firstName,
      lastName,
      phone: client.phone || '',
      password: '',
      confirmPassword: '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingClient(null);
    setFormData({ email: '', displayName: '', firstName: '', lastName: '', phone: '', password: '', confirmPassword: '' });
  };

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Open client profile modal
  const openProfileModal = async (client: User) => {
    setViewingClient(client);
    setShowProfileModal(true);
    setProfileTab('info');
    setLoadingProfile(true);
    
    const nameParts = (client.displayName || '').split(' ');
    setEditedClientInfo({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: client.email,
      phone: client.phone || '',
    });
    
    try {
      // Fetch client bookings from both collections
      const bookings: ClientBooking[] = [];
      
      // Search by email in bookings collection
      const bookingsQuery = query(
        collection(getDb(), 'bookings'),
        where('clientEmail', '==', client.email)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      bookingsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        bookings.push({
          id: doc.id,
          serviceName: data.serviceName || 'Unknown Service',
          date: data.date || data.appointmentDate || '',
          time: data.time || data.appointmentTime || '',
          status: data.status || 'unknown',
          price: data.price,
          artistName: data.artistName,
          bookingNotes: data.bookingNotes || []
        });
      });
      
      // Also search in appointments collection
      const appointmentsQuery = query(
        collection(getDb(), 'appointments'),
        where('clientEmail', '==', client.email)
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      appointmentsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        // Avoid duplicates
        if (!bookings.find(b => b.id === doc.id)) {
          bookings.push({
            id: doc.id,
            serviceName: data.serviceName || 'Unknown Service',
            date: data.scheduledDate || data.date || '',
            time: data.scheduledTime || data.time || '',
            status: data.status || 'unknown',
            price: data.totalAmount || data.price,
            artistName: data.artistName,
            bookingNotes: data.bookingNotes || []
          });
        }
      });
      
      // Sort by date descending
      bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setClientBookings(bookings);
      
      // Fetch payments
      const payments: ClientPayment[] = [];
      const paymentsQuery = query(
        collection(getDb(), 'payments'),
        where('clientId', '==', client.id)
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);
      paymentsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        payments.push({
          id: doc.id,
          amount: data.amount || 0,
          type: data.type || 'payment',
          method: data.method || 'card',
          status: data.status || 'unknown',
          processedAt: data.processedAt,
          appointmentId: data.appointmentId
        });
      });
      setClientPayments(payments);
      
      // Fetch progress notes from user document
      const userDoc = await getDocs(query(collection(getDb(), 'users'), where('email', '==', client.email)));
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        setProgressNotes(userData.progressNotes || []);
      }
      
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setViewingClient(null);
    setClientBookings([]);
    setClientPayments([]);
    setProgressNotes([]);
    setIsEditingInfo(false);
    setNewNoteText('');
  };

  // Add progress note
  const handleAddProgressNote = async () => {
    if (!newNoteText.trim() || !viewingClient) return;
    
    setSavingNote(true);
    try {
      const newNote: ProgressNote = {
        id: `note-${Date.now()}`,
        text: newNoteText.trim(),
        timestamp: new Date().toISOString(),
        createdBy: currentUser?.email || 'admin'
      };
      
      const updatedNotes = [...progressNotes, newNote];
      
      // Update user document
      const userDocRef = doc(getDb(), 'users', viewingClient.id);
      await updateDoc(userDocRef, {
        progressNotes: updatedNotes,
        updatedAt: new Date()
      });
      
      setProgressNotes(updatedNotes);
      setNewNoteText('');
      
      await showAlert({
        title: 'Note Added',
        description: 'Progress note saved successfully.',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error adding note:', error);
      await showAlert({
        title: 'Error',
        description: 'Failed to save note.',
        variant: 'destructive'
      });
    } finally {
      setSavingNote(false);
    }
  };

  // Delete progress note
  const handleDeleteProgressNote = async (noteId: string) => {
    if (!viewingClient) return;
    
    const confirmed = await showConfirm({
      title: 'Delete Note',
      description: 'Are you sure you want to delete this note?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive'
    });
    if (!confirmed) return;
    
    try {
      const updatedNotes = progressNotes.filter(n => n.id !== noteId);
      
      const userDocRef = doc(getDb(), 'users', viewingClient.id);
      await updateDoc(userDocRef, {
        progressNotes: updatedNotes,
        updatedAt: new Date()
      });
      
      setProgressNotes(updatedNotes);
    } catch (error) {
      console.error('Error deleting note:', error);
      await showAlert({
        title: 'Error',
        description: 'Failed to delete note.',
        variant: 'destructive'
      });
    }
  };

  // Save edited client info
  const handleSaveClientInfo = async () => {
    if (!viewingClient) return;
    
    setSavingNote(true);
    try {
      const displayName = `${editedClientInfo.firstName} ${editedClientInfo.lastName}`.trim();
      
      const userDocRef = doc(getDb(), 'users', viewingClient.id);
      await updateDoc(userDocRef, {
        displayName,
        phone: editedClientInfo.phone || '',
        updatedAt: new Date()
      });
      
      // Update local state
      setViewingClient({
        ...viewingClient,
        displayName,
        phone: editedClientInfo.phone || ''
      });
      
      setIsEditingInfo(false);
      fetchClients(); // Refresh the list
      
      await showAlert({
        title: 'Success',
        description: 'Client information updated.',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error updating client:', error);
      await showAlert({
        title: 'Error',
        description: 'Failed to update client information.',
        variant: 'destructive'
      });
    } finally {
      setSavingNote(false);
    }
  };

  // Create historical booking from client profile
  const createProfileHistoricalBooking = async () => {
    if (!viewingClient || !profileHistoricalBooking.date || !profileHistoricalBooking.serviceName) {
      await showAlert({
        title: 'Missing Information',
        description: 'Please fill in date and service.',
        variant: 'warning'
      });
      return;
    }

    setCreatingProfileBooking(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const isPastDate = profileHistoricalBooking.date < today;

      const bookingData = {
        clientName: viewingClient.displayName || '',
        clientEmail: viewingClient.email || '',
        clientPhone: viewingClient.phone || '',
        serviceName: profileHistoricalBooking.serviceName,
        date: profileHistoricalBooking.date,
        time: profileHistoricalBooking.time,
        artistId: 'victoria',
        artistName: 'Victoria Escobar',
        price: profileHistoricalBooking.price,
        status: profileHistoricalBooking.status,
        depositPaid: profileHistoricalBooking.depositPaid,
        bookingNotes: profileHistoricalBooking.bookingNotes,
        ghlContactId: null,
        ghlAppointmentId: null,
        ghlSkippedReason: isPastDate ? 'past_date' : null,
        isHistoricalEntry: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(getDb(), 'bookings'), bookingData);

      // Refresh client bookings
      const bookingsQuery = query(
        collection(getDb(), 'bookings'),
        where('clientEmail', '==', viewingClient.email)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookings: ClientBooking[] = [];
      bookingsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        bookings.push({
          id: doc.id,
          serviceName: data.serviceName || 'Unknown Service',
          date: data.date || data.appointmentDate || '',
          time: data.time || data.appointmentTime || '',
          status: data.status || 'unknown',
          price: data.price,
          artistName: data.artistName,
          bookingNotes: data.bookingNotes || []
        });
      });
      bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setClientBookings(bookings);

      await showAlert({
        title: 'Booking Created!',
        description: isPastDate 
          ? 'Historical booking added successfully.'
          : 'Booking created successfully.',
        variant: 'success'
      });

      // Reset form
      setProfileHistoricalBooking({
        serviceName: 'Microblading',
        date: '',
        time: '10:00',
        price: 500,
        status: 'completed',
        depositPaid: true,
        bookingNotes: []
      });
      setProfileHistoricalNoteText('');
      setShowProfileHistoricalModal(false);
    } catch (error) {
      console.error('Error creating booking:', error);
      await showAlert({
        title: 'Error',
        description: 'Failed to create booking.',
        variant: 'destructive'
      });
    } finally {
      setCreatingProfileBooking(false);
    }
  };

  // Create payment from client profile
  const createProfilePayment = async () => {
    if (!viewingClient || newPayment.amount <= 0) {
      await showAlert({
        title: 'Missing Information',
        description: 'Please enter a valid amount.',
        variant: 'warning'
      });
      return;
    }

    setCreatingPayment(true);
    try {
      const paymentData = {
        clientId: viewingClient.id,
        clientEmail: viewingClient.email,
        clientName: viewingClient.displayName,
        amount: Math.round(newPayment.amount * 100), // Convert to cents
        type: newPayment.type,
        method: newPayment.method,
        status: newPayment.status,
        processedAt: new Date(newPayment.date),
        notes: newPayment.notes,
        isManualEntry: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(getDb(), 'payments'), paymentData);

      // Refresh client payments
      const paymentsQuery = query(
        collection(getDb(), 'payments'),
        where('clientId', '==', viewingClient.id)
      );
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const payments: ClientPayment[] = [];
      paymentsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        payments.push({
          id: doc.id,
          amount: data.amount || 0,
          type: data.type || 'payment',
          method: data.method || 'card',
          status: data.status || 'unknown',
          processedAt: data.processedAt,
          appointmentId: data.appointmentId
        });
      });
      setClientPayments(payments);

      await showAlert({
        title: 'Payment Added!',
        description: 'Payment record created successfully.',
        variant: 'success'
      });

      // Reset form
      setNewPayment({
        amount: 0,
        type: 'full_payment',
        method: 'cash',
        status: 'completed',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setShowAddPaymentModal(false);
    } catch (error) {
      console.error('Error creating payment:', error);
      await showAlert({
        title: 'Error',
        description: 'Failed to create payment.',
        variant: 'destructive'
      });
    } finally {
      setCreatingPayment(false);
    }
  };

  // Open edit appointment modal
  const openEditAppointmentModal = (booking: ClientBooking) => {
    setEditingAppointment(booking);
    setEditAppointmentData({
      serviceName: booking.serviceName,
      date: booking.date,
      time: booking.time || '10:00',
      price: booking.price || 0,
      status: booking.status as any,
      bookingNotes: booking.bookingNotes || []
    });
    setEditAppointmentNoteText('');
    setShowEditAppointmentModal(true);
  };

  // Save edited appointment
  const saveEditedAppointment = async () => {
    if (!editingAppointment || !viewingClient) return;

    setSavingAppointment(true);
    try {
      const bookingRef = doc(getDb(), 'bookings', editingAppointment.id);
      await updateDoc(bookingRef, {
        serviceName: editAppointmentData.serviceName,
        date: editAppointmentData.date,
        time: editAppointmentData.time,
        price: editAppointmentData.price,
        status: editAppointmentData.status,
        bookingNotes: editAppointmentData.bookingNotes,
        updatedAt: new Date()
      });

      // Refresh client bookings
      const bookingsQuery = query(
        collection(getDb(), 'bookings'),
        where('clientEmail', '==', viewingClient.email)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookings: ClientBooking[] = [];
      bookingsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        bookings.push({
          id: doc.id,
          serviceName: data.serviceName || 'Unknown Service',
          date: data.date || data.appointmentDate || '',
          time: data.time || data.appointmentTime || '',
          status: data.status || 'unknown',
          price: data.price,
          artistName: data.artistName,
          bookingNotes: data.bookingNotes || []
        });
      });
      bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setClientBookings(bookings);

      await showAlert({
        title: 'Appointment Updated!',
        description: 'The appointment has been updated successfully.',
        variant: 'success'
      });

      setShowEditAppointmentModal(false);
      setEditingAppointment(null);
    } catch (error) {
      console.error('Error updating appointment:', error);
      await showAlert({
        title: 'Error',
        description: 'Failed to update appointment.',
        variant: 'destructive'
      });
    } finally {
      setSavingAppointment(false);
    }
  };

  // Delete appointment from client profile
  const deleteAppointment = async (bookingId: string) => {
    if (!viewingClient) return;

    const confirmed = await showAlert({
      title: 'Delete Appointment',
      description: 'Are you sure you want to delete this appointment? This action cannot be undone.',
      variant: 'warning',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      const bookingRef = doc(getDb(), 'bookings', bookingId);
      await deleteDoc(bookingRef);

      // Refresh client bookings
      const bookingsQuery = query(
        collection(getDb(), 'bookings'),
        where('clientEmail', '==', viewingClient.email)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookings: ClientBooking[] = [];
      bookingsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        bookings.push({
          id: doc.id,
          serviceName: data.serviceName || 'Unknown Service',
          date: data.date || data.appointmentDate || '',
          time: data.time || data.appointmentTime || '',
          status: data.status || 'unknown',
          price: data.price,
          artistName: data.artistName,
          bookingNotes: data.bookingNotes || []
        });
      });
      bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setClientBookings(bookings);

      await showAlert({
        title: 'Appointment Deleted',
        description: 'The appointment has been deleted successfully.',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      await showAlert({
        title: 'Error',
        description: 'Failed to delete appointment.',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredClients = clients.filter(client => {
    const searchMatch = (client.displayName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                      (client.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return searchMatch;
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
        <h2 className="text-xl font-semibold text-gray-900">Client Management</h2>
        <Button onClick={openCreateModal} className="bg-[#AD6269] hover:bg-[#9d5860]">
          <i className="fas fa-plus mr-2"></i>Add New Client
        </Button>
      </div>

      {/* Search */}
      <div className="grid grid-cols-1 gap-4">
        <Input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="h-11"
        />
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">All Clients ({filteredClients.length})</h3>
        </div>
        <div className="p-6">
          {filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-users text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">No clients found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Phone</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Last Login</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Document ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-sm text-gray-900">{client.displayName || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{client.email || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{client.phone || '-'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {(client as any).lastLoginAt 
                          ? new Date((client as any).lastLoginAt.seconds * 1000).toLocaleString('en-US', {
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
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${client.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {client.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span title={client.id} className="text-sm text-gray-500 font-mono">{`${client.id.substring(0, 4)}...${client.id.substring(client.id.length - 4)}`}</span>
                          <button 
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors" 
                            onClick={() => copyToClipboard(client.id)}
                            title="Copy ID"
                          >
                            <i className={`fas ${copiedId === client.id ? 'fa-check text-green-500' : 'fa-copy'}`}></i>
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            className="p-2 text-[#AD6269] hover:bg-[#AD6269]/10 rounded-lg transition-colors"
                            onClick={() => openProfileModal(client)}
                            title="View Profile"
                          >
                            <i className="fas fa-user"></i>
                          </button>
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => openEditModal(client)}
                            title="Edit Client"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => handleDeleteClient(client.id, client.email)}
                            title="Delete Client"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                          <button
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                            onClick={() => handlePasswordReset(client)}
                            title="Send Password Reset Email"
                            disabled={passwordResetStatus[client.id] === 'sending' || passwordResetStatus[client.id] === 'sent'}
                          >
                            <i className={`fas ${passwordResetStatus[client.id] === 'sent' ? 'fa-check-circle text-green-500' : 'fa-key'}`}></i>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
            <form onSubmit={editingClient ? handleEditClient : handleCreateClient} noValidate>
              {/* Header */}
              <div className="p-6 pb-0">
                <div className="flex justify-between items-start">
                  <div className="text-center flex-1">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#AD6269]/10 mb-4">
                      <i className="fas fa-user-plus text-[#AD6269] text-2xl"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {editingClient ? 'Edit Client' : 'Add New Client'}
                    </h3>
                    <p className="text-gray-500">
                      {editingClient ? 'Update client information' : 'Create a new client account'}
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
                      placeholder="Enter first name"
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
                      placeholder="Enter last name"
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
                    disabled={!!editingClient}
                    placeholder="Enter email address"
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
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-lock mr-2 text-gray-400"></i>
                    {editingClient ? 'New Password' : 'Password (min 6 characters) *'}
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent transition-all"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingClient}
                    placeholder={editingClient ? 'Leave blank to keep current password' : 'Create a password'}
                    minLength={6}
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    <i className="fas fa-lock mr-2 text-gray-400"></i>
                    {editingClient ? 'Confirm New Password' : 'Confirm Password *'}
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent transition-all"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required={!editingClient}
                    placeholder={editingClient ? 'Confirm new password' : 'Confirm your password'}
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
                      {editingClient ? 'Saving...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <i className={`fas ${editingClient ? 'fa-save' : 'fa-user-plus'} mr-2`}></i>
                      {editingClient ? 'Save Changes' : 'Create Client'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Profile Modal */}
      {showProfileModal && viewingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-[#AD6269] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{viewingClient.displayName || 'Client Profile'}</h3>
                  <p className="text-white/80 text-sm">{viewingClient.email}</p>
                </div>
              </div>
              <button onClick={closeProfileModal} className="text-white/80 hover:text-white transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="flex">
                {[
                  { id: 'info', label: 'Client Info', icon: 'fa-user' },
                  { id: 'appointments', label: 'Appointments', icon: 'fa-calendar' },
                  { id: 'payments', label: 'Payments', icon: 'fa-credit-card' },
                  { id: 'notes', label: 'Progress Notes', icon: 'fa-sticky-note' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setProfileTab(tab.id as any)}
                    className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                      profileTab === tab.id
                        ? 'border-[#AD6269] text-[#AD6269] bg-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <i className={`fas ${tab.icon}`}></i>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingProfile ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269]"></div>
                </div>
              ) : (
                <>
                  {/* Client Info Tab */}
                  {profileTab === 'info' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <i className="fas fa-user text-[#AD6269]"></i>Client Information
                        </h4>
                        {!isEditingInfo ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingInfo(true)}
                            className="border-[#AD6269] text-[#AD6269]"
                          >
                            <i className="fas fa-edit mr-2"></i>Edit
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setIsEditingInfo(false)}>
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleSaveClientInfo}
                              disabled={savingNote}
                              className="bg-[#AD6269] hover:bg-[#9d5860]"
                            >
                              {savingNote ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-save mr-2"></i>}
                              Save
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        {isEditingInfo ? (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                  type="text"
                                  value={editedClientInfo.firstName || ''}
                                  onChange={(e) => setEditedClientInfo({...editedClientInfo, firstName: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                  type="text"
                                  value={editedClientInfo.lastName || ''}
                                  onChange={(e) => setEditedClientInfo({...editedClientInfo, lastName: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                              <input
                                type="email"
                                value={editedClientInfo.email || ''}
                                disabled
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                              />
                              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                              <input
                                type="tel"
                                value={editedClientInfo.phone || ''}
                                onChange={(e) => setEditedClientInfo({...editedClientInfo, phone: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium text-gray-900">{viewingClient.displayName || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium text-gray-900">{viewingClient.phone || 'N/A'}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Email</p>
                              <p className="font-medium text-gray-900">{viewingClient.email}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Status</p>
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${viewingClient.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {viewingClient.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-blue-600">{clientBookings.length}</p>
                          <p className="text-sm text-blue-700">Total Appointments</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-green-600">{clientPayments.length}</p>
                          <p className="text-sm text-green-700">Payments</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                          <p className="text-2xl font-bold text-purple-600">{progressNotes.length}</p>
                          <p className="text-sm text-purple-700">Progress Notes</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Appointments Tab */}
                  {profileTab === 'appointments' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <i className="fas fa-calendar text-[#AD6269]"></i>Appointment History
                        </h4>
                        <Button
                          onClick={() => setShowProfileHistoricalModal(true)}
                          variant="outline"
                          size="sm"
                          className="border-[#AD6269] text-[#AD6269]"
                        >
                          <i className="fas fa-history mr-2"></i>Add Historical Booking
                        </Button>
                      </div>
                      
                      {clientBookings.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <i className="fas fa-calendar-times text-4xl text-gray-300 mb-4"></i>
                          <p className="text-gray-500">No appointments found</p>
                          <Button
                            onClick={() => setShowProfileHistoricalModal(true)}
                            className="mt-4 bg-[#AD6269] hover:bg-[#9d5860]"
                          >
                            <i className="fas fa-plus mr-2"></i>Add First Appointment
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {clientBookings.map((booking) => (
                            <div key={booking.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#AD6269]/30 transition-colors">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{booking.serviceName}</p>
                                  <p className="text-sm text-gray-600">
                                    <i className="fas fa-calendar mr-1"></i>
                                    {booking.date ? new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                    {booking.time && ` at ${booking.time}`}
                                  </p>
                                  {booking.artistName && (
                                    <p className="text-sm text-gray-500">
                                      <i className="fas fa-user-md mr-1"></i>{booking.artistName}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right flex items-start gap-2">
                                  <div>
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                                      {booking.status}
                                    </span>
                                    {booking.price && (
                                      <p className="text-sm font-medium text-gray-900 mt-1">${booking.price}</p>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <button
                                      onClick={() => openEditAppointmentModal(booking)}
                                      className="p-2 text-[#AD6269] hover:bg-[#AD6269]/10 rounded-lg transition-colors"
                                      title="Edit Appointment"
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>
                                    <button
                                      onClick={() => deleteAppointment(booking.id)}
                                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete Appointment"
                                    >
                                      <i className="fas fa-trash-alt"></i>
                                    </button>
                                  </div>
                                </div>
                              </div>
                              {booking.bookingNotes && booking.bookingNotes.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs text-gray-500 mb-1">Notes:</p>
                                  {booking.bookingNotes.slice(0, 2).map((note) => (
                                    <p key={note.id} className="text-sm text-gray-600">{note.text}</p>
                                  ))}
                                  {booking.bookingNotes.length > 2 && (
                                    <p className="text-xs text-gray-400">+{booking.bookingNotes.length - 2} more notes</p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payments Tab */}
                  {profileTab === 'payments' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <i className="fas fa-credit-card text-[#AD6269]"></i>Payment History
                        </h4>
                        <Button
                          onClick={() => setShowAddPaymentModal(true)}
                          variant="outline"
                          size="sm"
                          className="border-[#AD6269] text-[#AD6269]"
                        >
                          <i className="fas fa-plus mr-2"></i>Add Payment
                        </Button>
                      </div>
                      
                      {clientPayments.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <i className="fas fa-receipt text-4xl text-gray-300 mb-4"></i>
                          <p className="text-gray-500">No payments found</p>
                          <Button
                            onClick={() => setShowAddPaymentModal(true)}
                            className="mt-4 bg-[#AD6269] hover:bg-[#9d5860]"
                          >
                            <i className="fas fa-plus mr-2"></i>Add First Payment
                          </Button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Method</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {clientPayments.map((payment) => (
                                <tr key={payment.id} className="border-b border-gray-100">
                                  <td className="py-3 px-4 text-sm text-gray-600">
                                    {payment.processedAt?.seconds 
                                      ? new Date(payment.processedAt.seconds * 1000).toLocaleDateString()
                                      : 'N/A'}
                                  </td>
                                  <td className="py-3 px-4 text-sm font-medium text-gray-900">
                                    ${(payment.amount / 100).toFixed(2)}
                                  </td>
                                  <td className="py-3 px-4 text-sm text-gray-600 capitalize">{payment.type}</td>
                                  <td className="py-3 px-4 text-sm text-gray-600 capitalize">{payment.method}</td>
                                  <td className="py-3 px-4">
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getPaymentStatusBadgeClass(payment.status)}`}>
                                      {payment.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      
                      {/* Payment Summary */}
                      {clientPayments.length > 0 && (
                        <div className="bg-green-50 rounded-lg p-4 mt-4">
                          <p className="text-sm text-green-700">
                            <strong>Total Paid:</strong> ${(clientPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0) / 100).toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Progress Notes Tab */}
                  {profileTab === 'notes' && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <i className="fas fa-sticky-note text-[#AD6269]"></i>Progress Notes
                      </h4>
                      
                      {/* Add New Note */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Add New Note</label>
                        <div className="flex gap-2">
                          <textarea
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            placeholder="Enter progress note..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent resize-none"
                            rows={2}
                          />
                          <Button
                            onClick={handleAddProgressNote}
                            disabled={!newNoteText.trim() || savingNote}
                            className="bg-[#AD6269] hover:bg-[#9d5860] self-end"
                          >
                            {savingNote ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-plus"></i>}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          <i className="fas fa-info-circle mr-1"></i>
                          Notes are automatically timestamped when added.
                        </p>
                      </div>

                      {/* Notes List */}
                      {progressNotes.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <i className="fas fa-clipboard text-4xl text-gray-300 mb-4"></i>
                          <p className="text-gray-500">No progress notes yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {[...progressNotes].reverse().map((note) => (
                            <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                  <p className="text-gray-900 whitespace-pre-wrap">{note.text}</p>
                                  <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <i className="fas fa-clock"></i>
                                    {new Date(note.timestamp).toLocaleString()}
                                    {note.createdBy && ` • ${note.createdBy}`}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleDeleteProgressNote(note.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Note"
                                >
                                  <i className="fas fa-trash-alt text-sm"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <Button variant="outline" onClick={closeProfileModal}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Historical Booking Modal from Profile */}
      {showProfileHistoricalModal && viewingClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-[#AD6269] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <i className="fas fa-history"></i>
                Add Booking for {viewingClient.displayName}
              </h3>
              <button onClick={() => setShowProfileHistoricalModal(false)} className="text-white/80 hover:text-white">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service *</label>
                <select
                  value={profileHistoricalBooking.serviceName}
                  onChange={(e) => setProfileHistoricalBooking({...profileHistoricalBooking, serviceName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                >
                  <option value="Microblading">Microblading - $500</option>
                  <option value="Powder Brows">Powder Brows - $550</option>
                  <option value="Combo Brows">Combo Brows - $600</option>
                  <option value="Lip Blush">Lip Blush - $450</option>
                  <option value="Eyeliner">Eyeliner - $400</option>
                  <option value="Touch Up">Touch Up - $200</option>
                  <option value="Consultation">Consultation - $0</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={profileHistoricalBooking.date}
                    onChange={(e) => setProfileHistoricalBooking({...profileHistoricalBooking, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <select
                    value={profileHistoricalBooking.time}
                    onChange={(e) => setProfileHistoricalBooking({...profileHistoricalBooking, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                  >
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={profileHistoricalBooking.price}
                    onChange={(e) => setProfileHistoricalBooking({...profileHistoricalBooking, price: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={profileHistoricalBooking.status}
                    onChange={(e) => setProfileHistoricalBooking({...profileHistoricalBooking, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                  >
                    <option value="completed">Completed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="profileDepositPaid"
                  checked={profileHistoricalBooking.depositPaid}
                  onChange={(e) => setProfileHistoricalBooking({...profileHistoricalBooking, depositPaid: e.target.checked})}
                  className="rounded border-gray-300 text-[#AD6269] focus:ring-[#AD6269]"
                />
                <label htmlFor="profileDepositPaid" className="text-sm text-gray-700">Deposit was paid</label>
              </div>

              {/* Procedure Notes */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <i className="fas fa-sticky-note text-[#AD6269]"></i>Procedure Notes
                </h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex gap-2">
                    <textarea
                      value={profileHistoricalNoteText}
                      onChange={(e) => setProfileHistoricalNoteText(e.target.value)}
                      placeholder="Enter note about the procedure..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent resize-none text-sm"
                      rows={2}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (profileHistoricalNoteText.trim()) {
                          const newNote = {
                            id: `note-${Date.now()}`,
                            text: profileHistoricalNoteText.trim(),
                            timestamp: new Date().toISOString(),
                            createdBy: 'admin'
                          };
                          setProfileHistoricalBooking({
                            ...profileHistoricalBooking,
                            bookingNotes: [...profileHistoricalBooking.bookingNotes, newNote]
                          });
                          setProfileHistoricalNoteText('');
                        }
                      }}
                      disabled={!profileHistoricalNoteText.trim()}
                      className="bg-[#AD6269] hover:bg-[#9d5860] self-end"
                      size="sm"
                    >
                      <i className="fas fa-plus"></i>
                    </Button>
                  </div>
                  {profileHistoricalBooking.bookingNotes.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {profileHistoricalBooking.bookingNotes.map((note) => (
                        <div key={note.id} className="bg-white border rounded p-2 text-sm flex justify-between">
                          <span>{note.text}</span>
                          <button
                            onClick={() => setProfileHistoricalBooking({
                              ...profileHistoricalBooking,
                              bookingNotes: profileHistoricalBooking.bookingNotes.filter(n => n.id !== note.id)
                            })}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {profileHistoricalBooking.date && profileHistoricalBooking.date < new Date().toISOString().split('T')[0] && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-700">
                    <i className="fas fa-info-circle mr-2"></i>
                    Past date - will not sync to GHL calendar.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <Button variant="outline" onClick={() => setShowProfileHistoricalModal(false)}>Cancel</Button>
              <Button 
                onClick={createProfileHistoricalBooking}
                disabled={creatingProfileBooking}
                className="bg-[#AD6269] hover:bg-[#9d5860]"
              >
                {creatingProfileBooking ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>Creating...</>
                ) : (
                  <><i className="fas fa-plus mr-2"></i>Add Booking</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Modal from Profile */}
      {showAddPaymentModal && viewingClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="bg-[#AD6269] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <i className="fas fa-dollar-sign"></i>
                Add Payment for {viewingClient.displayName}
              </h3>
              <button onClick={() => setShowAddPaymentModal(false)} className="text-white/80 hover:text-white">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({...newPayment, amount: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newPayment.type}
                    onChange={(e) => setNewPayment({...newPayment, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                  >
                    <option value="deposit">Deposit</option>
                    <option value="full_payment">Full Payment</option>
                    <option value="refund">Refund</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                  <select
                    value={newPayment.method}
                    onChange={(e) => setNewPayment({...newPayment, method: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="zelle">Zelle</option>
                    <option value="venmo">Venmo</option>
                    <option value="paypal">PayPal</option>
                    <option value="cherry">Cherry</option>
                    <option value="klarna">Klarna</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newPayment.date}
                    onChange={(e) => setNewPayment({...newPayment, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newPayment.status}
                    onChange={(e) => setNewPayment({...newPayment, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
                  placeholder="Payment notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <Button variant="outline" onClick={() => setShowAddPaymentModal(false)}>Cancel</Button>
              <Button 
                onClick={createProfilePayment}
                disabled={creatingPayment}
                className="bg-[#AD6269] hover:bg-[#9d5860]"
              >
                {creatingPayment ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>Adding...</>
                ) : (
                  <><i className="fas fa-plus mr-2"></i>Add Payment</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditAppointmentModal && editingAppointment && viewingClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-[#AD6269] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <i className="fas fa-edit"></i>
                Edit Appointment
              </h3>
              <button onClick={() => setShowEditAppointmentModal(false)} className="text-white/80 hover:text-white">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                <select
                  value={editAppointmentData.serviceName}
                  onChange={(e) => setEditAppointmentData({...editAppointmentData, serviceName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                >
                  <option value="Microblading">Microblading</option>
                  <option value="Powder Brows">Powder Brows</option>
                  <option value="Combo Brows">Combo Brows</option>
                  <option value="Lip Blush">Lip Blush</option>
                  <option value="Eyeliner">Eyeliner</option>
                  <option value="Touch Up">Touch Up</option>
                  <option value="Consultation">Consultation</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editAppointmentData.date}
                    onChange={(e) => setEditAppointmentData({...editAppointmentData, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <select
                    value={editAppointmentData.time}
                    onChange={(e) => setEditAppointmentData({...editAppointmentData, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                  >
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={editAppointmentData.price}
                    onChange={(e) => setEditAppointmentData({...editAppointmentData, price: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={editAppointmentData.status}
                    onChange={(e) => setEditAppointmentData({...editAppointmentData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                  >
                    <option value="completed">Completed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Procedure Notes */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <i className="fas fa-sticky-note text-[#AD6269]"></i>Procedure Notes
                </h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex gap-2">
                    <textarea
                      value={editAppointmentNoteText}
                      onChange={(e) => setEditAppointmentNoteText(e.target.value)}
                      placeholder="Add a note about the procedure..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#AD6269] focus:border-transparent resize-none text-sm"
                      rows={2}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        if (editAppointmentNoteText.trim()) {
                          const newNote = {
                            id: `note-${Date.now()}`,
                            text: editAppointmentNoteText.trim(),
                            timestamp: new Date().toISOString(),
                            createdBy: 'admin'
                          };
                          setEditAppointmentData({
                            ...editAppointmentData,
                            bookingNotes: [...editAppointmentData.bookingNotes, newNote]
                          });
                          setEditAppointmentNoteText('');
                        }
                      }}
                      disabled={!editAppointmentNoteText.trim()}
                      className="bg-[#AD6269] hover:bg-[#9d5860] self-end"
                      size="sm"
                    >
                      <i className="fas fa-plus"></i>
                    </Button>
                  </div>
                  {editAppointmentData.bookingNotes.length > 0 && (
                    <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                      {editAppointmentData.bookingNotes.map((note) => (
                        <div key={note.id} className="bg-white border rounded-lg p-3 flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">{note.text}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(note.timestamp).toLocaleString()}
                              {note.createdBy && ` • ${note.createdBy}`}
                            </p>
                          </div>
                          <button
                            onClick={() => setEditAppointmentData({
                              ...editAppointmentData,
                              bookingNotes: editAppointmentData.bookingNotes.filter(n => n.id !== note.id)
                            })}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                          >
                            <i className="fas fa-trash-alt text-sm"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <Button variant="outline" onClick={() => setShowEditAppointmentModal(false)}>Cancel</Button>
              <Button 
                onClick={saveEditedAppointment}
                disabled={savingAppointment}
                className="bg-[#AD6269] hover:bg-[#9d5860]"
              >
                {savingAppointment ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i>Saving...</>
                ) : (
                  <><i className="fas fa-save mr-2"></i>Save Changes</>
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
