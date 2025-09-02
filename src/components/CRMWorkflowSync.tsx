'use client';

import React, { useState, useEffect } from 'react';
import { createGoHighLevelService } from '@/services/gohighlevelService';

interface SyncStatus {
  isEnabled: boolean;
  lastSync: string | null;
  syncedContacts: number;
  syncedWorkflows: number;
  errors: string[];
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: 'new_booking' | 'appointment_completed' | 'no_show' | 'payment_received';
  crmWorkflowId: string;
  isActive: boolean;
  conditions?: {
    serviceType?: string[];
    clientType?: 'new' | 'returning' | 'all';
  };
}

export default function CRMWorkflowSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isEnabled: false,
    lastSync: null,
    syncedContacts: 0,
    syncedWorkflows: 0,
    errors: []
  });
  
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [availableWorkflows, setAvailableWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadSyncStatus();
    loadAutomationRules();
    loadAvailableWorkflows();
  }, []);

  const loadSyncStatus = async () => {
    try {
      const response = await fetch('/api/crm/sync-status');
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data);
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const loadAutomationRules = async () => {
    try {
      const response = await fetch('/api/crm/automation-rules');
      if (response.ok) {
        const data = await response.json();
        setAutomationRules(data.rules || []);
      }
    } catch (error) {
      console.error('Failed to load automation rules:', error);
    }
  };

  const loadAvailableWorkflows = async () => {
    try {
      const ghlService = createGoHighLevelService();
      if (ghlService) {
        const workflows = await ghlService.getWorkflows();
        setAvailableWorkflows(workflows);
      }
    } catch (error) {
      console.error('Failed to load CRM workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSync = async () => {
    try {
      const response = await fetch('/api/crm/toggle-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !syncStatus.isEnabled })
      });
      
      if (response.ok) {
        setSyncStatus(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
      }
    } catch (error) {
      console.error('Failed to toggle sync:', error);
    }
  };

  const performFullSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/crm/full-sync', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(prev => ({
          ...prev,
          lastSync: new Date().toISOString(),
          syncedContacts: data.syncedContacts,
          syncedWorkflows: data.syncedWorkflows,
          errors: data.errors || []
        }));
      }
    } catch (error) {
      console.error('Full sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  const createAutomationRule = async (rule: Omit<AutomationRule, 'id'>) => {
    try {
      const response = await fetch('/api/crm/automation-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule)
      });
      
      if (response.ok) {
        const data = await response.json();
        setAutomationRules(prev => [...prev, data.rule]);
      }
    } catch (error) {
      console.error('Failed to create automation rule:', error);
    }
  };

  const toggleAutomationRule = async (ruleId: string) => {
    try {
      const rule = automationRules.find(r => r.id === ruleId);
      if (!rule) return;

      const response = await fetch(`/api/crm/automation-rules/${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rule, isActive: !rule.isActive })
      });
      
      if (response.ok) {
        setAutomationRules(prev => 
          prev.map(r => r.id === ruleId ? { ...r, isActive: !r.isActive } : r)
        );
      }
    } catch (error) {
      console.error('Failed to toggle automation rule:', error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading CRM workflow sync...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Sync Status Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-2 fw-bold">
                    <i className="fas fa-sync-alt me-2 text-primary"></i>
                    CRM Workflow Synchronization
                  </h5>
                  <p className="text-muted mb-0">
                    {syncStatus.isEnabled ? (
                      <>
                        <i className="fas fa-check-circle text-success me-1"></i>
                        Active • Last sync: {syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : 'Never'}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-pause-circle text-warning me-1"></i>
                        Disabled
                      </>
                    )}
                  </p>
                </div>
                <div className="d-flex gap-2">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={syncStatus.isEnabled}
                      onChange={toggleSync}
                    />
                    <label className="form-check-label fw-semibold">
                      Auto Sync
                    </label>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={performFullSync}
                    disabled={syncing}
                  >
                    {syncing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1"></span>
                        Syncing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sync me-1"></i>
                        Full Sync
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Statistics */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                  <i className="fas fa-users text-primary fs-4"></i>
                </div>
              </div>
              <h3 className="fw-bold text-primary mb-1">{syncStatus.syncedContacts}</h3>
              <p className="text-muted mb-0 small">Synced Contacts</p>
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
              <h3 className="fw-bold text-success mb-1">{syncStatus.syncedWorkflows}</h3>
              <p className="text-muted mb-0 small">Active Workflows</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                  <i className="fas fa-robot text-info fs-4"></i>
                </div>
              </div>
              <h3 className="fw-bold text-info mb-1">{automationRules.filter(r => r.isActive).length}</h3>
              <p className="text-muted mb-0 small">Active Rules</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <div className={`${syncStatus.errors.length > 0 ? 'bg-danger' : 'bg-success'} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center`} style={{ width: '60px', height: '60px' }}>
                  <i className={`fas ${syncStatus.errors.length > 0 ? 'fa-exclamation-triangle text-danger' : 'fa-check-circle text-success'} fs-4`}></i>
                </div>
              </div>
              <h3 className={`fw-bold mb-1 ${syncStatus.errors.length > 0 ? 'text-danger' : 'text-success'}`}>{syncStatus.errors.length}</h3>
              <p className="text-muted mb-0 small">Sync Errors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Automation Rules */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header border-0 bg-light py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold text-dark">
                  <i className="fas fa-robot me-2 text-primary"></i>
                  Automation Rules
                </h5>
                <button className="btn btn-primary btn-sm">
                  <i className="fas fa-plus me-1"></i>
                  Add Rule
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              {automationRules.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0 fw-bold">Status</th>
                        <th className="border-0 fw-bold">Rule Name</th>
                        <th className="border-0 fw-bold">Trigger</th>
                        <th className="border-0 fw-bold">CRM Workflow</th>
                        <th className="border-0 fw-bold">Conditions</th>
                        <th className="border-0 fw-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {automationRules.map(rule => (
                        <tr key={rule.id}>
                          <td className="align-middle">
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={rule.isActive}
                                onChange={() => toggleAutomationRule(rule.id)}
                              />
                            </div>
                          </td>
                          <td className="align-middle">
                            <div className="fw-semibold">{rule.name}</div>
                          </td>
                          <td className="align-middle">
                            <span className="badge bg-secondary rounded-pill">
                              {rule.trigger.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="align-middle">
                            {availableWorkflows.find(w => w.id === rule.crmWorkflowId)?.name || 'Unknown Workflow'}
                          </td>
                          <td className="align-middle">
                            {rule.conditions?.serviceType ? (
                              <span className="badge bg-info rounded-pill me-1">
                                {rule.conditions.serviceType.join(', ')}
                              </span>
                            ) : (
                              <span className="text-muted">All services</span>
                            )}
                          </td>
                          <td className="align-middle">
                            <div className="btn-group btn-group-sm">
                              <button className="btn btn-outline-primary">
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="btn btn-outline-danger">
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="fas fa-robot text-muted fs-1 mb-3"></i>
                  <h5 className="text-muted">No Automation Rules</h5>
                  <p className="text-muted">Create rules to automatically trigger CRM workflows based on client actions.</p>
                  <button className="btn btn-primary rounded-pill px-4">
                    <i className="fas fa-plus me-2"></i>
                    Create First Rule
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Log */}
      {syncStatus.errors.length > 0 && (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm border-start border-danger border-4">
              <div className="card-header border-0 bg-danger bg-opacity-10 py-3">
                <h5 className="mb-0 fw-bold text-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Sync Errors
                </h5>
              </div>
              <div className="card-body">
                {syncStatus.errors.map((error, index) => (
                  <div key={index} className="alert alert-danger mb-2">
                    <i className="fas fa-times-circle me-2"></i>
                    {error}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
