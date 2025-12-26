'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAlertDialog } from '@/components/ui/alert-dialog';

interface Client {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  isActive: boolean;
  createdAt?: Date;
  lastAppointment?: Date;
}

export default function ClientManager() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const usersCollection = collection(getDb(), 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const clientsList = usersSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Client))
        .filter(user => (user as any).role === 'client' || !(user as any).role)
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      setClients(clientsList);
    } catch (error) {
      console.error('Error fetching clients:', error);
      alert('Error fetching clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (clientId: string, currentStatus: boolean) => {
    try {
      const clientRef = doc(getDb(), 'users', clientId);
      await updateDoc(clientRef, {
        isActive: !currentStatus,
        updatedAt: new Date()
      });
      fetchClients();
    } catch (error) {
      console.error('Error updating client:', error);
      alert('Error updating client. Please try again.');
    }
  };

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (!confirm(`Are you sure you want to delete ${clientName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteDoc(doc(getDb(), 'users', clientId));
      alert('Client deleted successfully!');
      fetchClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error deleting client. Please try again.');
    }
  };

  const filteredClients = clients.filter(client => {
    const searchMatch = client.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterActive === 'all' || 
                       (filterActive === 'active' && client.isActive) ||
                       (filterActive === 'inactive' && !client.isActive);
    return searchMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Loading clients...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h4><i className="fas fa-users me-2"></i>Client Management</h4>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6 className="card-title">Total Clients</h6>
              <h3>{clients.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h6 className="card-title">Active</h6>
              <h3>{clients.filter(c => c.isActive).length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h6 className="card-title">Inactive</h6>
              <h3>{clients.filter(c => !c.isActive).length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h6 className="card-title">This Month</h6>
              <h3>{clients.filter(c => {
                if (!c.createdAt) return false;
                const now = new Date();
                const clientDate = new Date(c.createdAt);
                return clientDate.getMonth() === now.getMonth() && 
                       clientDate.getFullYear() === now.getFullYear();
              }).length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <div className="btn-group w-100" role="group">
            {(['all', 'active', 'inactive'] as const).map(status => (
              <button
                key={status}
                type="button"
                className={`btn ${filterActive === status ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setFilterActive(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">Registered Clients ({filteredClients.length})</h5>
            </div>
            <div className="card-body">
              {filteredClients.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-users fa-3x text-muted mb-3"></i>
                  <p className="text-muted">No clients found.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Location</th>
                        <th>Registered</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.map((client) => (
                        <tr key={client.id}>
                          <td><strong>{client.displayName}</strong></td>
                          <td>{client.email}</td>
                          <td>{client.phone || '-'}</td>
                          <td>
                            {client.city && client.state ? (
                              <small>{client.city}, {client.state} {client.zipCode}</small>
                            ) : (
                              <small className="text-muted">-</small>
                            )}
                          </td>
                          <td>
                            {client.createdAt ? (
                              <small>{new Date(client.createdAt).toLocaleDateString()}</small>
                            ) : (
                              <small className="text-muted">-</small>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${client.isActive ? 'bg-success' : 'bg-warning'}`}>
                              {client.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                className={`btn ${client.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                onClick={() => handleToggleActive(client.id, client.isActive)}
                                title={client.isActive ? 'Deactivate' : 'Activate'}
                              >
                                <i className={`fas fa-${client.isActive ? 'ban' : 'check'}`}></i>
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteClient(client.id, client.displayName)}
                                title="Delete Client"
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
    </div>
  );
}
