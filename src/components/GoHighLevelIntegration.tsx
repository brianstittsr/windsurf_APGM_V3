'use client';

import React, { useState, useEffect } from 'react';
import { createGoHighLevelService } from '@/services/gohighlevelService';
import CRMWorkflowSync from './CRMWorkflowSync';

interface CRMConnection {
  isConnected: boolean;
  lastSync: string | null;
  totalContacts: number;
  activeWorkflows: number;
  totalLeads: number;
}

interface LeadReport {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  leadsBySource: Record<string, number>;
  leadsByStatus: Record<string, number>;
  timeline: Array<{
    date: string;
    leads: number;
    conversions: number;
  }>;
}

export default function GoHighLevelIntegration() {
  const [ghlService, setGhlService] = useState<any | null>(null);
  const [connection, setConnection] = useState<CRMConnection>({
    isConnected: false,
    lastSync: null,
    totalContacts: 0,
    activeWorkflows: 0,
    totalLeads: 0,
  });
  const [leadReport, setLeadReport] = useState<LeadReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'workflows' | 'sync' | 'config'>('overview');

  // API Configuration
  const [apiConfig, setApiConfig] = useState({
    apiKey: '',
    locationId: '',
    baseUrl: 'https://services.leadconnectorhq.com',
  });

  useEffect(() => {
    initializeConnection();
  }, []);

  const initializeConnection = async () => {
    setLoading(true);
    try {
      const service = createGoHighLevelService();
      if (service) {
        setGhlService(service);
        await testConnection(service);
      }
    } catch (error) {
      console.error('Failed to initialize GoHighLevel connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (service: GoHighLevelService) => {
    try {
      const [contacts, workflows, leads] = await Promise.all([
        service.getContacts({ limit: 1 }),
        service.getWorkflows(),
        service.getLeads({ limit: 1 }),
      ]);

      setConnection({
        isConnected: true,
        lastSync: new Date().toISOString(),
        totalContacts: contacts.total,
        activeWorkflows: workflows.filter(w => w.status === 'active').length,
        totalLeads: leads.total,
      });

      // Load lead reports for the last 30 days
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const report = await service.getLeadReports({
        startDate,
        endDate,
        groupBy: 'day',
      });
      setLeadReport(report);

    } catch (error) {
      console.error('Connection test failed:', error);
      setConnection(prev => ({ ...prev, isConnected: false }));
    }
  };

  const syncData = async () => {
    if (!ghlService) return;
    
    setSyncing(true);
    try {
      await testConnection(ghlService);
      // Additional sync operations can be added here
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const connectToGoHighLevel = async () => {
    try {
      // This would typically involve OAuth flow or API key validation
      // For now, we'll simulate the connection process
      const service = createGoHighLevelService();
      if (service) {
        setGhlService(service);
        await testConnection(service);
      }
    } catch (error) {
      console.error('Failed to connect to GoHighLevel:', error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Connecting to GoHighLevel CRM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header border-0 py-4" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <div className="avatar-circle me-3" style={{ 
                    width: '50px', 
                    height: '50px', 
                    background: 'rgba(255,255,255,0.2)', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="fas fa-link text-white fs-5"></i>
                  </div>
                  <div>
                    <h4 className="mb-1 text-white fw-bold">GoHighLevel CRM Integration</h4>
                    <p className="mb-0 text-white-50 small">
                      {connection.isConnected ? (
                        <>
                          <i className="fas fa-check-circle me-1"></i>
                          Connected • Last sync: {connection.lastSync ? new Date(connection.lastSync).toLocaleString() : 'Never'}
                        </>
                      ) : (
                        <>
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          Not connected
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  {connection.isConnected ? (
                    <button
                      className="btn btn-light btn-sm rounded-pill px-3"
                      onClick={syncData}
                      disabled={syncing}
                    >
                      {syncing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                          Syncing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sync-alt me-1"></i>
                          Sync Now
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      className="btn btn-light btn-sm rounded-pill px-3"
                      onClick={connectToGoHighLevel}
                    >
                      <i className="fas fa-plug me-1"></i>
                      Connect CRM
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <ul className="nav nav-pills nav-fill" role="tablist">
                {[
                  { id: 'overview', label: 'Overview', icon: 'fa-tachometer-alt' },
                  { id: 'reports', label: 'Lead Reports', icon: 'fa-chart-line' },
                  { id: 'workflows', label: 'Workflows', icon: 'fa-project-diagram' },
                  { id: 'sync', label: 'Workflow Sync', icon: 'fa-sync-alt' },
                  { id: 'config', label: 'Configuration', icon: 'fa-cog' }
                ].map(tab => (
                  <li key={tab.id} className="nav-item" role="presentation">
                    <button
                      className={`nav-link rounded-pill px-4 py-3 fw-semibold ${activeTab === tab.id ? 'active' : ''}`}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      style={{ 
                        backgroundColor: activeTab === tab.id ? '#4f46e5' : 'transparent',
                        borderColor: activeTab === tab.id ? '#4f46e5' : '#dee2e6',
                        color: activeTab === tab.id ? 'white' : '#6c757d'
                      }}
                    >
                      <i className={`fas ${tab.icon} me-2`}></i>
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="row g-4">
          {/* Connection Status Cards */}
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <div className={`${connection.isConnected ? 'bg-success' : 'bg-danger'} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center`} style={{ width: '60px', height: '60px' }}>
                    <i className={`fas ${connection.isConnected ? 'fa-check-circle text-success' : 'fa-times-circle text-danger'} fs-4`}></i>
                  </div>
                </div>
                <h6 className="fw-bold mb-1">{connection.isConnected ? 'Connected' : 'Disconnected'}</h6>
                <p className="text-muted mb-0 small">CRM Status</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                    <i className="fas fa-users text-primary fs-4"></i>
                  </div>
                </div>
                <h3 className="fw-bold text-primary mb-1">{connection.totalContacts.toLocaleString()}</h3>
                <p className="text-muted mb-0 small">Total Contacts</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                    <i className="fas fa-project-diagram text-success fs-4"></i>
                  </div>
                </div>
                <h3 className="fw-bold text-success mb-1">{connection.activeWorkflows}</h3>
                <p className="text-muted mb-0 small">Active Workflows</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                    <i className="fas fa-bullseye text-info fs-4"></i>
                  </div>
                </div>
                <h3 className="fw-bold text-info mb-1">{connection.totalLeads.toLocaleString()}</h3>
                <p className="text-muted mb-0 small">Total Leads</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {connection.isConnected && (
            <div className="col-12">
              <div className="card border-0 shadow-sm">
                <div className="card-header border-0 bg-light py-3">
                  <h5 className="mb-0 fw-bold text-dark">
                    <i className="fas fa-bolt me-2 text-warning"></i>
                    Quick Actions
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="d-grid">
                        <button className="btn btn-outline-primary btn-lg">
                          <i className="fas fa-sync-alt me-2"></i>
                          Sync All Contacts
                        </button>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-grid">
                        <button className="btn btn-outline-success btn-lg">
                          <i className="fas fa-play me-2"></i>
                          Trigger Workflows
                        </button>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="d-grid">
                        <button className="btn btn-outline-info btn-lg">
                          <i className="fas fa-download me-2"></i>
                          Export Reports
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="row g-4">
          {leadReport && (
            <>
              {/* Lead Metrics */}
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                        <i className="fas fa-bullseye text-primary fs-4"></i>
                      </div>
                    </div>
                    <h3 className="fw-bold text-primary mb-1">{leadReport.totalLeads}</h3>
                    <p className="text-muted mb-0 small">Total Leads (30 days)</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                        <i className="fas fa-check-circle text-success fs-4"></i>
                      </div>
                    </div>
                    <h3 className="fw-bold text-success mb-1">{leadReport.convertedLeads}</h3>
                    <p className="text-muted mb-0 small">Converted Leads</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                        <i className="fas fa-percentage text-warning fs-4"></i>
                      </div>
                    </div>
                    <h3 className="fw-bold text-warning mb-1">{leadReport.conversionRate.toFixed(1)}%</h3>
                    <p className="text-muted mb-0 small">Conversion Rate</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                        <i className="fas fa-chart-line text-info fs-4"></i>
                      </div>
                    </div>
                    <h3 className="fw-bold text-info mb-1">
                      {leadReport.timeline.length > 1 ? 
                        ((leadReport.timeline[leadReport.timeline.length - 1].leads - leadReport.timeline[0].leads) / leadReport.timeline[0].leads * 100).toFixed(1) : 0}%
                    </h3>
                    <p className="text-muted mb-0 small">Growth Rate</p>
                  </div>
                </div>
              </div>

              {/* Leads by Source */}
              <div className="col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header border-0 bg-light py-3">
                    <h5 className="mb-0 fw-bold text-dark">
                      <i className="fas fa-chart-pie me-2 text-primary"></i>
                      Leads by Source
                    </h5>
                  </div>
                  <div className="card-body">
                    {Object.entries(leadReport.leadsBySource).map(([source, count]) => (
                      <div key={source} className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 rounded-circle me-3" style={{ width: '8px', height: '8px' }}></div>
                          <span className="fw-semibold text-capitalize">{source}</span>
                        </div>
                        <span className="badge bg-primary rounded-pill">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Leads by Status */}
              <div className="col-md-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header border-0 bg-light py-3">
                    <h5 className="mb-0 fw-bold text-dark">
                      <i className="fas fa-chart-bar me-2 text-success"></i>
                      Leads by Status
                    </h5>
                  </div>
                  <div className="card-body">
                    {Object.entries(leadReport.leadsByStatus).map(([status, count]) => (
                      <div key={status} className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex align-items-center">
                          <div className={`rounded-circle me-3 ${
                            status === 'converted' ? 'bg-success' :
                            status === 'qualified' ? 'bg-warning' :
                            status === 'contacted' ? 'bg-info' :
                            'bg-secondary'
                          } bg-opacity-10`} style={{ width: '8px', height: '8px' }}></div>
                          <span className="fw-semibold text-capitalize">{status}</span>
                        </div>
                        <span className={`badge rounded-pill ${
                          status === 'converted' ? 'bg-success' :
                          status === 'qualified' ? 'bg-warning' :
                          status === 'contacted' ? 'bg-info' :
                          'bg-secondary'
                        }`}>{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'workflows' && (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header border-0 bg-light py-3">
                <h5 className="mb-0 fw-bold text-dark">
                  <i className="fas fa-project-diagram me-2 text-primary"></i>
                  CRM Workflow Management
                </h5>
              </div>
              <div className="card-body">
                <div className="text-center py-5">
                  <i className="fas fa-project-diagram text-muted fs-1 mb-3"></i>
                  <h5 className="text-muted">Workflow Management</h5>
                  <p className="text-muted">Manage and monitor your GoHighLevel workflows from here.</p>
                  {connection.isConnected ? (
                    <button className="btn btn-primary rounded-pill px-4">
                      <i className="fas fa-sync me-2"></i>
                      Load Workflows
                    </button>
                  ) : (
                    <button className="btn btn-outline-primary rounded-pill px-4" onClick={connectToGoHighLevel}>
                      <i className="fas fa-plug me-2"></i>
                      Connect to Load Workflows
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sync' && (
        <CRMWorkflowSync />
      )}

      {activeTab === 'config' && (
        <div className="row">
          <div className="col-md-8 mx-auto">
            <div className="card border-0 shadow-sm">
              <div className="card-header border-0 bg-light py-3">
                <h5 className="mb-0 fw-bold text-dark">
                  <i className="fas fa-cog me-2 text-primary"></i>
                  GoHighLevel API Configuration
                </h5>
              </div>
              <div className="card-body p-4">
                <form>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-key me-1 text-warning"></i>
                      API Key
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      value={apiConfig.apiKey}
                      onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Enter your GoHighLevel API key"
                    />
                    <div className="form-text">
                      Get your API key from GoHighLevel Settings → Integrations → API
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-map-marker-alt me-1 text-info"></i>
                      Location ID
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={apiConfig.locationId}
                      onChange={(e) => setApiConfig(prev => ({ ...prev, locationId: e.target.value }))}
                      placeholder="Enter your GoHighLevel Location ID"
                    />
                    <div className="form-text">
                      Find your Location ID in GoHighLevel Settings → Company
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="fas fa-globe me-1 text-success"></i>
                      API Base URL
                    </label>
                    <input
                      type="url"
                      className="form-control form-control-lg"
                      value={apiConfig.baseUrl}
                      onChange={(e) => setApiConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                      placeholder="https://services.leadconnectorhq.com"
                    />
                    <div className="form-text">
                      Default GoHighLevel API endpoint (usually doesn't need to be changed)
                    </div>
                  </div>
                  <div className="d-flex gap-3">
                    <button type="button" className="btn btn-primary btn-lg px-4" onClick={connectToGoHighLevel}>
                      <i className="fas fa-plug me-2"></i>
                      Test Connection
                    </button>
                    <button type="button" className="btn btn-outline-secondary btn-lg px-4">
                      <i className="fas fa-save me-2"></i>
                      Save Configuration
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
