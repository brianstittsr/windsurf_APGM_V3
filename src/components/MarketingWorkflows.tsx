'use client';

import React, { useState, useEffect } from 'react';
import { UserService } from '@/services/database';
import { User } from '@/types/database';
import WorkflowBuilder from './WorkflowBuilder';
import WorkflowAnalytics from './WorkflowAnalytics';
import GoHighLevelIntegration from './GoHighLevelIntegration';

interface WorkflowStep {
  id: string;
  type: 'email' | 'sms' | 'delay' | 'condition' | 'tag' | 'task';
  title: string;
  description: string;
  delay?: number; // in days
  delayUnit?: 'minutes' | 'hours' | 'days' | 'weeks';
  content?: string;
  subject?: string;
  condition?: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'not_equals';
    value: string;
  };
  tags?: string[];
  taskDescription?: string;
  assignedTo?: string;
}

interface MarketingWorkflow {
  id: string;
  name: string;
  description: string;
  trigger: 'new_client' | 'appointment_booked' | 'appointment_completed' | 'no_show' | 'manual' | 'birthday' | 'follow_up';
  isActive: boolean;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
  stats: {
    totalEnrolled: number;
    completed: number;
    active: number;
  };
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'nurturing' | 'retention' | 'recovery' | 'onboarding' | 'promotional';
  workflow: Omit<MarketingWorkflow, 'id' | 'createdAt' | 'updatedAt' | 'stats'>;
}

export default function MarketingWorkflows() {
  const [workflows, setWorkflows] = useState<MarketingWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<MarketingWorkflow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'templates' | 'analytics' | 'crm'>('overview');

  // Pre-built workflow templates
  const workflowTemplates: WorkflowTemplate[] = [
    {
      id: 'new-client-welcome',
      name: 'New Client Welcome Series',
      description: 'Welcome new clients with educational content and appointment reminders',
      category: 'onboarding',
      workflow: {
        name: 'New Client Welcome Series',
        description: 'Automated welcome sequence for new clients',
        trigger: 'new_client',
        isActive: true,
        steps: [
          {
            id: '1',
            type: 'email',
            title: 'Welcome Email',
            description: 'Send welcome email immediately',
            subject: 'Welcome to A Pretty Girl Matter!',
            content: 'Thank you for choosing us for your permanent makeup journey...'
          },
          {
            id: '2',
            type: 'delay',
            title: 'Wait 2 Days',
            description: 'Wait 2 days before next step',
            delay: 2,
            delayUnit: 'days'
          },
          {
            id: '3',
            type: 'email',
            title: 'Preparation Guide',
            description: 'Send pre-appointment preparation guide',
            subject: 'Preparing for Your Appointment',
            content: 'Here\'s everything you need to know before your appointment...'
          }
        ]
      }
    },
    {
      id: 'appointment-reminder',
      name: 'Appointment Reminder Sequence',
      description: 'Automated reminders leading up to appointments',
      category: 'retention',
      workflow: {
        name: 'Appointment Reminder Sequence',
        description: 'Send reminders before appointments',
        trigger: 'appointment_booked',
        isActive: true,
        steps: [
          {
            id: '1',
            type: 'delay',
            title: 'Wait Until 7 Days Before',
            description: 'Wait until 7 days before appointment',
            delay: 7,
            delayUnit: 'days'
          },
          {
            id: '2',
            type: 'email',
            title: '7-Day Reminder',
            description: 'Send 7-day appointment reminder',
            subject: 'Your Appointment is Coming Up!',
            content: 'Your appointment is scheduled for next week...'
          },
          {
            id: '3',
            type: 'delay',
            title: 'Wait Until 1 Day Before',
            description: 'Wait until 1 day before appointment',
            delay: 1,
            delayUnit: 'days'
          },
          {
            id: '4',
            type: 'sms',
            title: '24-Hour SMS Reminder',
            description: 'Send SMS reminder 24 hours before',
            content: 'Reminder: Your appointment is tomorrow at [TIME]. Reply CONFIRM to confirm.'
          }
        ]
      }
    },
    {
      id: 'post-appointment-care',
      name: 'Post-Appointment Care Series',
      description: 'Follow-up care instructions and check-ins after appointments',
      category: 'nurturing',
      workflow: {
        name: 'Post-Appointment Care Series',
        description: 'Aftercare and follow-up sequence',
        trigger: 'appointment_completed',
        isActive: true,
        steps: [
          {
            id: '1',
            type: 'email',
            title: 'Immediate Aftercare',
            description: 'Send aftercare instructions immediately',
            subject: 'Your Aftercare Instructions',
            content: 'Thank you for your appointment! Here are your aftercare instructions...'
          },
          {
            id: '2',
            type: 'delay',
            title: 'Wait 3 Days',
            description: 'Wait 3 days for healing check-in',
            delay: 3,
            delayUnit: 'days'
          },
          {
            id: '3',
            type: 'email',
            title: 'Healing Check-in',
            description: 'Check on healing progress',
            subject: 'How is Your Healing Going?',
            content: 'It\'s been 3 days since your appointment. How is everything healing?'
          },
          {
            id: '4',
            type: 'delay',
            title: 'Wait 4 Weeks',
            description: 'Wait 4 weeks for touch-up reminder',
            delay: 4,
            delayUnit: 'weeks'
          },
          {
            id: '5',
            type: 'email',
            title: 'Touch-up Reminder',
            description: 'Remind about touch-up appointment',
            subject: 'Time for Your Touch-up!',
            content: 'It\'s time to schedule your complimentary touch-up appointment...'
          }
        ]
      }
    },
    {
      id: 'no-show-recovery',
      name: 'No-Show Recovery Campaign',
      description: 'Re-engage clients who missed their appointments',
      category: 'recovery',
      workflow: {
        name: 'No-Show Recovery Campaign',
        description: 'Follow up with no-show clients',
        trigger: 'no_show',
        isActive: true,
        steps: [
          {
            id: '1',
            type: 'email',
            title: 'We Missed You',
            description: 'Send understanding follow-up email',
            subject: 'We Missed You Today',
            content: 'We understand things come up. Let\'s reschedule your appointment...'
          },
          {
            id: '2',
            type: 'delay',
            title: 'Wait 2 Days',
            description: 'Wait 2 days before follow-up',
            delay: 2,
            delayUnit: 'days'
          },
          {
            id: '3',
            type: 'sms',
            title: 'Reschedule Offer',
            description: 'Send SMS with easy rescheduling',
            content: 'Hi! We\'d love to reschedule your appointment. Reply YES to get available times.'
          },
          {
            id: '4',
            type: 'delay',
            title: 'Wait 1 Week',
            description: 'Wait 1 week for final attempt',
            delay: 1,
            delayUnit: 'weeks'
          },
          {
            id: '5',
            type: 'email',
            title: 'Special Offer',
            description: 'Send special offer to re-engage',
            subject: 'Special Offer Just for You',
            content: 'We\'d love to have you back! Here\'s a special offer...'
          }
        ]
      }
    },
    {
      id: 'birthday-campaign',
      name: 'Birthday Celebration Campaign',
      description: 'Special birthday offers and wishes for clients',
      category: 'promotional',
      workflow: {
        name: 'Birthday Celebration Campaign',
        description: 'Birthday wishes and special offers',
        trigger: 'birthday',
        isActive: true,
        steps: [
          {
            id: '1',
            type: 'email',
            title: 'Birthday Wishes',
            description: 'Send birthday wishes with special offer',
            subject: 'Happy Birthday from A Pretty Girl Matter!',
            content: 'Happy Birthday! Celebrate with a special birthday discount...'
          },
          {
            id: '2',
            type: 'tag',
            title: 'Add Birthday Tag',
            description: 'Tag client as birthday celebrant',
            tags: ['birthday_2024']
          },
          {
            id: '3',
            type: 'delay',
            title: 'Wait 1 Week',
            description: 'Wait 1 week for follow-up',
            delay: 1,
            delayUnit: 'weeks'
          },
          {
            id: '4',
            type: 'email',
            title: 'Birthday Offer Reminder',
            description: 'Remind about birthday offer',
            subject: 'Don\'t Forget Your Birthday Offer!',
            content: 'Your birthday offer expires soon. Book now to save!'
          }
        ]
      }
    }
  ];

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/workflows');
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows || []);
      } else {
        console.error('Failed to load workflows');
        setWorkflows([]);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  const saveWorkflow = async (workflow: MarketingWorkflow) => {
    try {
      const existingWorkflow = workflows.find(w => w.id === workflow.id);
      const method = existingWorkflow ? 'PUT' : 'POST';
      
      const response = await fetch('/api/workflows', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workflow }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedWorkflows = [...workflows];
        const existingIndex = updatedWorkflows.findIndex(w => w.id === workflow.id);
        
        if (existingIndex >= 0) {
          updatedWorkflows[existingIndex] = data.workflow;
        } else {
          updatedWorkflows.push(data.workflow);
        }
        
        setWorkflows(updatedWorkflows);
      } else {
        console.error('Failed to save workflow');
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflows?id=${workflowId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedWorkflows = workflows.filter(w => w.id !== workflowId);
        setWorkflows(updatedWorkflows);
      } else {
        console.error('Failed to delete workflow');
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  const toggleWorkflowStatus = async (workflowId: string) => {
    try {
      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) return;

      const updatedWorkflow = { ...workflow, isActive: !workflow.isActive };
      await saveWorkflow(updatedWorkflow);
    } catch (error) {
      console.error('Error toggling workflow status:', error);
    }
  };

  const createFromTemplate = async (template: WorkflowTemplate) => {
    const newWorkflow: MarketingWorkflow = {
      id: `workflow_${Date.now()}`,
      ...template.workflow,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        totalEnrolled: 0,
        completed: 0,
        active: 0
      }
    };
    
    await saveWorkflow(newWorkflow);
    setSelectedWorkflow(newWorkflow);
    setIsEditing(true);
    setActiveTab('create');
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'email': return 'fa-envelope';
      case 'sms': return 'fa-sms';
      case 'delay': return 'fa-clock';
      case 'condition': return 'fa-code-branch';
      case 'tag': return 'fa-tag';
      case 'task': return 'fa-tasks';
      default: return 'fa-circle';
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'email': return '#AD6269';
      case 'sms': return '#28a745';
      case 'delay': return '#ffc107';
      case 'condition': return '#17a2b8';
      case 'tag': return '#6f42c1';
      case 'task': return '#fd7e14';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading marketing workflows...</p>
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
            <div className="card-header border-0 py-4" style={{ background: 'linear-gradient(135deg, #AD6269 0%, #8B4A52 100%)' }}>
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
                    <i className="fas fa-project-diagram text-white fs-5"></i>
                  </div>
                  <div>
                    <h4 className="mb-1 text-white fw-bold">Marketing Workflows</h4>
                    <p className="mb-0 text-white-50 small">Automate lead nurturing and client engagement</p>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-light btn-sm rounded-pill px-3"
                    onClick={() => setActiveTab('create')}
                  >
                    <i className="fas fa-plus me-1"></i>
                    Create Workflow
                  </button>
                  <button
                    className="btn btn-outline-light btn-sm rounded-pill px-3"
                    onClick={loadWorkflows}
                  >
                    <i className="fas fa-sync-alt me-1"></i>
                    Refresh
                  </button>
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
                  { id: 'overview', label: 'Overview', icon: 'fa-list' },
                  { id: 'create', label: 'Create/Edit', icon: 'fa-edit' },
                  { id: 'templates', label: 'Templates', icon: 'fa-layer-group' },
                  { id: 'analytics', label: 'Analytics', icon: 'fa-chart-line' },
                  { id: 'crm', label: 'CRM Integration', icon: 'fa-link' }
                ].map(tab => (
                  <li key={tab.id} className="nav-item" role="presentation">
                    <button
                      className={`nav-link rounded-pill px-4 py-3 fw-semibold ${activeTab === tab.id ? 'active' : ''}`}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      style={{ 
                        backgroundColor: activeTab === tab.id ? '#AD6269' : 'transparent',
                        borderColor: activeTab === tab.id ? '#AD6269' : '#dee2e6',
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
          {/* Summary Cards */}
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                    <i className="fas fa-project-diagram text-primary fs-4"></i>
                  </div>
                </div>
                <h3 className="fw-bold text-primary mb-1">{workflows.length}</h3>
                <p className="text-muted mb-0 small">Total Workflows</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                    <i className="fas fa-play text-success fs-4"></i>
                  </div>
                </div>
                <h3 className="fw-bold text-success mb-1">{workflows.filter(w => w.isActive).length}</h3>
                <p className="text-muted mb-0 small">Active Workflows</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                    <i className="fas fa-users text-info fs-4"></i>
                  </div>
                </div>
                <h3 className="fw-bold text-info mb-1">{workflows.reduce((sum, w) => sum + w.stats.totalEnrolled, 0)}</h3>
                <p className="text-muted mb-0 small">Total Enrolled</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <div className="mb-3">
                  <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                    <i className="fas fa-check-circle text-warning fs-4"></i>
                  </div>
                </div>
                <h3 className="fw-bold text-warning mb-1">{workflows.reduce((sum, w) => sum + w.stats.completed, 0)}</h3>
                <p className="text-muted mb-0 small">Completed</p>
              </div>
            </div>
          </div>

          {/* Workflows List */}
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header border-0 bg-light py-3">
                <h5 className="mb-0 fw-bold text-dark">
                  <i className="fas fa-list me-2 text-primary"></i>
                  Your Workflows
                </h5>
              </div>
              <div className="card-body p-0">
                {workflows.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="border-0 fw-bold">Status</th>
                          <th className="border-0 fw-bold">Workflow Name</th>
                          <th className="border-0 fw-bold">Trigger</th>
                          <th className="border-0 fw-bold">Steps</th>
                          <th className="border-0 fw-bold">Enrolled</th>
                          <th className="border-0 fw-bold">Completed</th>
                          <th className="border-0 fw-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {workflows.map(workflow => (
                          <tr key={workflow.id}>
                            <td className="align-middle">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  checked={workflow.isActive}
                                  onChange={() => toggleWorkflowStatus(workflow.id)}
                                />
                              </div>
                            </td>
                            <td className="align-middle">
                              <div>
                                <div className="fw-semibold">{workflow.name}</div>
                                <div className="small text-muted">{workflow.description}</div>
                              </div>
                            </td>
                            <td className="align-middle">
                              <span className="badge bg-secondary rounded-pill">
                                {workflow.trigger.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="align-middle">
                              <span className="badge bg-primary rounded-pill">
                                {workflow.steps.length} steps
                              </span>
                            </td>
                            <td className="align-middle">{workflow.stats.totalEnrolled}</td>
                            <td className="align-middle">{workflow.stats.completed}</td>
                            <td className="align-middle">
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => {
                                    setSelectedWorkflow(workflow);
                                    setIsEditing(true);
                                    setActiveTab('create');
                                  }}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => {
                                    if (confirm('Are you sure you want to delete this workflow?')) {
                                      deleteWorkflow(workflow.id);
                                    }
                                  }}
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
                ) : (
                  <div className="text-center py-5">
                    <i className="fas fa-project-diagram text-muted fs-1 mb-3"></i>
                    <h5 className="text-muted">No Workflows Yet</h5>
                    <p className="text-muted">Create your first marketing workflow to get started!</p>
                    <button
                      className="btn btn-primary rounded-pill px-4"
                      onClick={() => setActiveTab('templates')}
                    >
                      <i className="fas fa-plus me-2"></i>
                      Browse Templates
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="row g-4">
          {workflowTemplates.map(template => (
            <div key={template.id} className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header border-0 bg-light py-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1 fw-bold text-dark">{template.name}</h6>
                      <span className={`badge rounded-pill ${
                        template.category === 'onboarding' ? 'bg-primary' :
                        template.category === 'nurturing' ? 'bg-success' :
                        template.category === 'retention' ? 'bg-info' :
                        template.category === 'recovery' ? 'bg-warning' :
                        'bg-secondary'
                      }`}>
                        {template.category}
                      </span>
                    </div>
                    <button
                      className="btn btn-outline-primary btn-sm rounded-pill"
                      onClick={() => createFromTemplate(template)}
                    >
                      <i className="fas fa-plus me-1"></i>
                      Use Template
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-3">{template.description}</p>
                  <div className="workflow-preview">
                    <h6 className="fw-bold mb-2">Workflow Steps:</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {template.workflow.steps.map((step, index) => (
                        <div key={step.id} className="d-flex align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white"
                            style={{
                              width: '24px',
                              height: '24px',
                              backgroundColor: getStepColor(step.type),
                              fontSize: '10px'
                            }}
                          >
                            <i className={`fas ${getStepIcon(step.type)}`}></i>
                          </div>
                          {index < template.workflow.steps.length - 1 && (
                            <i className="fas fa-arrow-right text-muted mx-2"></i>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'create' && (
        <div className="row">
          <div className="col-12">
            <WorkflowBuilder
              workflow={selectedWorkflow || undefined}
              onSave={async (workflow) => {
                await saveWorkflow(workflow);
                setSelectedWorkflow(null);
                setIsEditing(false);
                setActiveTab('overview');
              }}
              onCancel={() => {
                setSelectedWorkflow(null);
                setIsEditing(false);
                setActiveTab('overview');
              }}
            />
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <WorkflowAnalytics workflows={workflows} />
      )}

      {activeTab === 'crm' && (
        <GoHighLevelIntegration />
      )}
    </div>
  );
}
