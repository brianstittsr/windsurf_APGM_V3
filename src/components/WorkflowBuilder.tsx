'use client';

import React, { useState, useCallback } from 'react';
import { WorkflowStep, MarketingWorkflow } from '@/services/WorkflowEngine';

interface WorkflowBuilderProps {
  workflow?: MarketingWorkflow;
  onSave: (workflow: MarketingWorkflow) => void;
  onCancel: () => void;
}

interface StepTemplate {
  type: WorkflowStep['type'];
  title: string;
  description: string;
  icon: string;
  color: string;
  defaultData: Partial<WorkflowStep>;
}

export default function WorkflowBuilder({ workflow, onSave, onCancel }: WorkflowBuilderProps) {
  const [workflowData, setWorkflowData] = useState<Partial<MarketingWorkflow>>(
    workflow || {
      name: '',
      description: '',
      trigger: 'manual',
      isActive: false,
      steps: []
    }
  );
  
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [showStepEditor, setShowStepEditor] = useState(false);

  const stepTemplates: StepTemplate[] = [
    {
      type: 'email',
      title: 'Send Email',
      description: 'Send an automated email to the client',
      icon: 'fa-envelope',
      color: '#AD6269',
      defaultData: {
        title: 'Send Email',
        description: 'Send an email to the client',
        subject: 'Message from A Pretty Girl Matter',
        content: 'Hello! This is an automated message from our team.'
      }
    },
    {
      type: 'sms',
      title: 'Send SMS',
      description: 'Send a text message to the client',
      icon: 'fa-sms',
      color: '#28a745',
      defaultData: {
        title: 'Send SMS',
        description: 'Send a text message to the client',
        content: 'Hello! This is a message from A Pretty Girl Matter.'
      }
    },
    {
      type: 'delay',
      title: 'Wait/Delay',
      description: 'Wait for a specified amount of time',
      icon: 'fa-clock',
      color: '#ffc107',
      defaultData: {
        title: 'Wait',
        description: 'Wait before next step',
        delay: 1,
        delayUnit: 'days'
      }
    },
    {
      type: 'condition',
      title: 'Condition',
      description: 'Branch workflow based on client data',
      icon: 'fa-code-branch',
      color: '#17a2b8',
      defaultData: {
        title: 'Check Condition',
        description: 'Check client data condition',
        condition: {
          field: 'role',
          operator: 'equals',
          value: 'client'
        }
      }
    },
    {
      type: 'tag',
      title: 'Add Tag',
      description: 'Add tags to client profile',
      icon: 'fa-tag',
      color: '#6f42c1',
      defaultData: {
        title: 'Add Tag',
        description: 'Add tags to client profile',
        tags: ['workflow_participant']
      }
    },
    {
      type: 'task',
      title: 'Create Task',
      description: 'Create a task for team members',
      icon: 'fa-tasks',
      color: '#fd7e14',
      defaultData: {
        title: 'Create Task',
        description: 'Create a task for team follow-up',
        taskDescription: 'Follow up with client',
        assignedTo: 'admin'
      }
    }
  ];

  const addStep = useCallback((template: StepTemplate) => {
    const newStep: WorkflowStep = {
      id: `step_${Date.now()}`,
      type: template.type,
      ...template.defaultData
    } as WorkflowStep;

    setWorkflowData(prev => ({
      ...prev,
      steps: [...(prev.steps || []), newStep]
    }));
  }, []);

  const removeStep = useCallback((stepId: string) => {
    setWorkflowData(prev => ({
      ...prev,
      steps: (prev.steps || []).filter(step => step.id !== stepId)
    }));
  }, []);

  const editStep = useCallback((step: WorkflowStep) => {
    setSelectedStep(step);
    setShowStepEditor(true);
  }, []);

  const updateStep = useCallback((updatedStep: WorkflowStep) => {
    setWorkflowData(prev => ({
      ...prev,
      steps: (prev.steps || []).map(step => 
        step.id === updatedStep.id ? updatedStep : step
      )
    }));
    setShowStepEditor(false);
    setSelectedStep(null);
  }, []);

  const moveStep = useCallback((stepId: string, direction: 'up' | 'down') => {
    setWorkflowData(prev => {
      const steps = [...(prev.steps || [])];
      const index = steps.findIndex(step => step.id === stepId);
      
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= steps.length) return prev;
      
      [steps[index], steps[newIndex]] = [steps[newIndex], steps[index]];
      
      return { ...prev, steps };
    });
  }, []);

  const handleSave = useCallback(() => {
    if (!workflowData.name || !workflowData.trigger) {
      alert('Please fill in all required fields');
      return;
    }

    const completeWorkflow: MarketingWorkflow = {
      id: workflow?.id || `workflow_${Date.now()}`,
      name: workflowData.name!,
      description: workflowData.description || '',
      trigger: workflowData.trigger!,
      isActive: workflowData.isActive || false,
      steps: workflowData.steps || [],
      createdAt: workflow?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: workflow?.stats || {
        totalEnrolled: 0,
        completed: 0,
        active: 0
      }
    };

    onSave(completeWorkflow);
  }, [workflowData, workflow, onSave]);

  const getStepTemplate = (type: WorkflowStep['type']) => {
    return stepTemplates.find(template => template.type === type);
  };

  return (
    <div className="workflow-builder">
      {/* Header */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header border-0 py-4" style={{ background: 'linear-gradient(135deg, #AD6269 0%, #8B4A52 100%)' }}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-1 text-white fw-bold">
                <i className="fas fa-magic me-2"></i>
                {workflow ? 'Edit Workflow' : 'Create New Workflow'}
              </h4>
              <p className="mb-0 text-white-50 small">Build your automated marketing sequence</p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-light btn-sm rounded-pill px-3"
                onClick={handleSave}
              >
                <i className="fas fa-save me-1"></i>
                Save Workflow
              </button>
              <button
                className="btn btn-outline-light btn-sm rounded-pill px-3"
                onClick={onCancel}
              >
                <i className="fas fa-times me-1"></i>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Workflow Settings */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header border-0 bg-light py-3">
              <h5 className="mb-0 fw-bold text-dark">
                <i className="fas fa-cog me-2 text-primary"></i>
                Workflow Settings
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-bold">Workflow Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={workflowData.name || ''}
                  onChange={(e) => setWorkflowData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter workflow name"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={workflowData.description || ''}
                  onChange={(e) => setWorkflowData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this workflow does"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Trigger Event *</label>
                <select
                  className="form-select"
                  value={workflowData.trigger || 'manual'}
                  onChange={(e) => setWorkflowData(prev => ({ ...prev, trigger: e.target.value as any }))}
                >
                  <option value="manual">Manual Trigger</option>
                  <option value="new_client">New Client Registration</option>
                  <option value="appointment_booked">Appointment Booked</option>
                  <option value="appointment_completed">Appointment Completed</option>
                  <option value="no_show">No Show</option>
                  <option value="birthday">Client Birthday</option>
                  <option value="follow_up">Follow-up Required</option>
                </select>
              </div>

              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={workflowData.isActive || false}
                    onChange={(e) => setWorkflowData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <label className="form-check-label fw-bold">
                    Active Workflow
                  </label>
                </div>
                <small className="text-muted">Enable this workflow to start processing clients</small>
              </div>

              {/* Step Templates */}
              <div className="border-top pt-3">
                <h6 className="fw-bold mb-3">
                  <i className="fas fa-plus-circle me-2 text-success"></i>
                  Add Steps
                </h6>
                <div className="d-grid gap-2">
                  {stepTemplates.map(template => (
                    <button
                      key={template.type}
                      className="btn btn-outline-secondary btn-sm text-start d-flex align-items-center"
                      onClick={() => addStep(template)}
                    >
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white me-2"
                        style={{
                          width: '24px',
                          height: '24px',
                          backgroundColor: template.color,
                          fontSize: '10px'
                        }}
                      >
                        <i className={`fas ${template.icon}`}></i>
                      </div>
                      <div>
                        <div className="fw-semibold">{template.title}</div>
                        <div className="small text-muted">{template.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header border-0 bg-light py-3">
              <h5 className="mb-0 fw-bold text-dark">
                <i className="fas fa-list-ol me-2 text-primary"></i>
                Workflow Steps ({workflowData.steps?.length || 0})
              </h5>
            </div>
            <div className="card-body">
              {!workflowData.steps || workflowData.steps.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-magic text-muted fs-1 mb-3"></i>
                  <h5 className="text-muted">No Steps Added Yet</h5>
                  <p className="text-muted">Add steps from the panel on the left to build your workflow</p>
                </div>
              ) : (
                <div className="workflow-steps">
                  {workflowData.steps.map((step, index) => {
                    const template = getStepTemplate(step.type);
                    return (
                      <div key={step.id} className="workflow-step mb-3">
                        <div className="card border-0 bg-light">
                          <div className="card-body p-3">
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center text-white me-3"
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    backgroundColor: template?.color || '#6c757d',
                                    fontSize: '12px'
                                  }}
                                >
                                  <i className={`fas ${template?.icon || 'fa-circle'}`}></i>
                                </div>
                                <div>
                                  <div className="fw-semibold">{step.title}</div>
                                  <div className="small text-muted">{step.description}</div>
                                  {step.type === 'delay' && (
                                    <div className="small text-info">
                                      <i className="fas fa-clock me-1"></i>
                                      Wait {step.delay} {step.delayUnit}
                                    </div>
                                  )}
                                  {step.type === 'email' && step.subject && (
                                    <div className="small text-info">
                                      <i className="fas fa-envelope me-1"></i>
                                      Subject: {step.subject}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="d-flex align-items-center gap-1">
                                <span className="badge bg-secondary rounded-pill small">
                                  Step {index + 1}
                                </span>
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className="btn btn-outline-primary"
                                    onClick={() => editStep(step)}
                                    title="Edit Step"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => moveStep(step.id, 'up')}
                                    disabled={index === 0}
                                    title="Move Up"
                                  >
                                    <i className="fas fa-arrow-up"></i>
                                  </button>
                                  <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => moveStep(step.id, 'down')}
                                    disabled={index === (workflowData.steps?.length || 0) - 1}
                                    title="Move Down"
                                  >
                                    <i className="fas fa-arrow-down"></i>
                                  </button>
                                  <button
                                    className="btn btn-outline-danger"
                                    onClick={() => removeStep(step.id)}
                                    title="Remove Step"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < (workflowData.steps?.length || 0) - 1 && (
                          <div className="text-center my-2">
                            <i className="fas fa-arrow-down text-muted"></i>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Step Editor Modal */}
      {showStepEditor && selectedStep && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`fas ${getStepTemplate(selectedStep.type)?.icon || 'fa-edit'} me-2`}></i>
                  Edit {getStepTemplate(selectedStep.type)?.title || 'Step'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowStepEditor(false)}
                ></button>
              </div>
              <div className="modal-body">
                <StepEditor
                  step={selectedStep}
                  onSave={updateStep}
                  onCancel={() => setShowStepEditor(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Step Editor Component
interface StepEditorProps {
  step: WorkflowStep;
  onSave: (step: WorkflowStep) => void;
  onCancel: () => void;
}

function StepEditor({ step, onSave, onCancel }: StepEditorProps) {
  const [stepData, setStepData] = useState<WorkflowStep>(step);

  const handleSave = () => {
    onSave(stepData);
  };

  return (
    <div>
      <div className="mb-3">
        <label className="form-label fw-bold">Step Title</label>
        <input
          type="text"
          className="form-control"
          value={stepData.title}
          onChange={(e) => setStepData(prev => ({ ...prev, title: e.target.value }))}
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">Description</label>
        <input
          type="text"
          className="form-control"
          value={stepData.description}
          onChange={(e) => setStepData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      {stepData.type === 'email' && (
        <>
          <div className="mb-3">
            <label className="form-label fw-bold">Email Subject</label>
            <input
              type="text"
              className="form-control"
              value={stepData.subject || ''}
              onChange={(e) => setStepData(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Email Content</label>
            <textarea
              className="form-control"
              rows={5}
              value={stepData.content || ''}
              onChange={(e) => setStepData(prev => ({ ...prev, content: e.target.value }))}
            />
          </div>
        </>
      )}

      {stepData.type === 'sms' && (
        <div className="mb-3">
          <label className="form-label fw-bold">SMS Message</label>
          <textarea
            className="form-control"
            rows={3}
            value={stepData.content || ''}
            onChange={(e) => setStepData(prev => ({ ...prev, content: e.target.value }))}
            maxLength={160}
          />
          <small className="text-muted">
            {(stepData.content || '').length}/160 characters
          </small>
        </div>
      )}

      {stepData.type === 'delay' && (
        <div className="row">
          <div className="col-md-6">
            <label className="form-label fw-bold">Delay Amount</label>
            <input
              type="number"
              className="form-control"
              value={stepData.delay || 1}
              onChange={(e) => setStepData(prev => ({ ...prev, delay: parseInt(e.target.value) }))}
              min="1"
            />
          </div>
          <div className="col-md-6">
            <label className="form-label fw-bold">Time Unit</label>
            <select
              className="form-select"
              value={stepData.delayUnit || 'days'}
              onChange={(e) => setStepData(prev => ({ ...prev, delayUnit: e.target.value as any }))}
            >
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
            </select>
          </div>
        </div>
      )}

      {stepData.type === 'tag' && (
        <div className="mb-3">
          <label className="form-label fw-bold">Tags (comma-separated)</label>
          <input
            type="text"
            className="form-control"
            value={(stepData.tags || []).join(', ')}
            onChange={(e) => setStepData(prev => ({ 
              ...prev, 
              tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
            }))}
            placeholder="tag1, tag2, tag3"
          />
        </div>
      )}

      {stepData.type === 'task' && (
        <>
          <div className="mb-3">
            <label className="form-label fw-bold">Task Description</label>
            <textarea
              className="form-control"
              rows={3}
              value={stepData.taskDescription || ''}
              onChange={(e) => setStepData(prev => ({ ...prev, taskDescription: e.target.value }))}
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Assigned To</label>
            <select
              className="form-select"
              value={stepData.assignedTo || 'admin'}
              onChange={(e) => setStepData(prev => ({ ...prev, assignedTo: e.target.value }))}
            >
              <option value="admin">Admin</option>
              <option value="artist">Artist</option>
              <option value="manager">Manager</option>
            </select>
          </div>
        </>
      )}

      <div className="d-flex justify-content-end gap-2">
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          Save Step
        </button>
      </div>
    </div>
  );
}
