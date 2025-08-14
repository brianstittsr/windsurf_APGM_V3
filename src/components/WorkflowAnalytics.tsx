'use client';

import React, { useState, useEffect } from 'react';
import { MarketingWorkflow, WorkflowExecution } from '@/services/WorkflowEngine';

interface WorkflowAnalyticsProps {
  workflows: MarketingWorkflow[];
}

interface AnalyticsData {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  completedExecutions: number;
  averageCompletionRate: number;
  topPerformingWorkflow: string;
  recentActivity: ActivityItem[];
  performanceByTrigger: { [key: string]: { total: number; completed: number; rate: number } };
  executionTrends: { date: string; executions: number; completions: number }[];
}

interface ActivityItem {
  id: string;
  type: 'workflow_created' | 'execution_started' | 'execution_completed' | 'workflow_activated';
  workflowName: string;
  timestamp: string;
  details?: string;
}

export default function WorkflowAnalytics({ workflows }: WorkflowAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    loadAnalyticsData();
  }, [workflows, timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from your analytics API
      // For now, we'll generate mock data based on the workflows
      const mockData = generateMockAnalyticsData(workflows);
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnalyticsData = (workflows: MarketingWorkflow[]): AnalyticsData => {
    const totalWorkflows = workflows.length;
    const activeWorkflows = workflows.filter(w => w.isActive).length;
    const totalExecutions = workflows.reduce((sum, w) => sum + w.stats.totalEnrolled, 0);
    const completedExecutions = workflows.reduce((sum, w) => sum + w.stats.completed, 0);
    const averageCompletionRate = totalExecutions > 0 ? (completedExecutions / totalExecutions) * 100 : 0;

    // Find top performing workflow
    const topWorkflow = workflows.reduce((best, current) => {
      const currentRate = current.stats.totalEnrolled > 0 
        ? (current.stats.completed / current.stats.totalEnrolled) * 100 
        : 0;
      const bestRate = best.stats.totalEnrolled > 0 
        ? (best.stats.completed / best.stats.totalEnrolled) * 100 
        : 0;
      return currentRate > bestRate ? current : best;
    }, workflows[0] || { name: 'None' });

    // Generate recent activity
    const recentActivity: ActivityItem[] = [
      {
        id: '1',
        type: 'execution_completed',
        workflowName: 'New Client Welcome Series',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        details: 'Client: jane.doe@email.com'
      },
      {
        id: '2',
        type: 'execution_started',
        workflowName: 'Appointment Reminder Sequence',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        details: 'Client: john.smith@email.com'
      },
      {
        id: '3',
        type: 'workflow_activated',
        workflowName: 'Birthday Celebration Campaign',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        type: 'execution_completed',
        workflowName: 'Post-Appointment Care Series',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        details: 'Client: mary.johnson@email.com'
      }
    ];

    // Performance by trigger type
    const performanceByTrigger: { [key: string]: { total: number; completed: number; rate: number } } = {
      'new_client': { total: 45, completed: 38, rate: 84.4 },
      'appointment_booked': { total: 67, completed: 59, rate: 88.1 },
      'appointment_completed': { total: 52, completed: 41, rate: 78.8 },
      'no_show': { total: 12, completed: 8, rate: 66.7 },
      'birthday': { total: 23, completed: 21, rate: 91.3 }
    };

    // Execution trends (last 30 days)
    const executionTrends = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        executions: Math.floor(Math.random() * 10) + 2,
        completions: Math.floor(Math.random() * 8) + 1
      };
    });

    return {
      totalWorkflows,
      activeWorkflows,
      totalExecutions,
      completedExecutions,
      averageCompletionRate,
      topPerformingWorkflow: topWorkflow?.name || 'None',
      recentActivity,
      performanceByTrigger,
      executionTrends
    };
  };

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'workflow_created': return 'fa-plus-circle text-success';
      case 'execution_started': return 'fa-play-circle text-primary';
      case 'execution_completed': return 'fa-check-circle text-success';
      case 'workflow_activated': return 'fa-power-off text-warning';
      default: return 'fa-circle text-muted';
    }
  };

  const getActivityLabel = (type: ActivityItem['type']) => {
    switch (type) {
      case 'workflow_created': return 'Workflow Created';
      case 'execution_started': return 'Execution Started';
      case 'execution_completed': return 'Execution Completed';
      case 'workflow_activated': return 'Workflow Activated';
      default: return 'Activity';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-exclamation-triangle text-warning fs-1 mb-3"></i>
        <h5 className="text-muted">Unable to Load Analytics</h5>
        <p className="text-muted">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="workflow-analytics">
      {/* Header with Time Range Selector */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header border-0 py-4" style={{ background: 'linear-gradient(135deg, #AD6269 0%, #8B4A52 100%)' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-1 text-white fw-bold">
                    <i className="fas fa-chart-line me-2"></i>
                    Workflow Analytics
                  </h4>
                  <p className="mb-0 text-white-50 small">Performance insights and trends</p>
                </div>
                <div className="btn-group">
                  {[
                    { value: '7d', label: '7 Days' },
                    { value: '30d', label: '30 Days' },
                    { value: '90d', label: '90 Days' },
                    { value: 'all', label: 'All Time' }
                  ].map(option => (
                    <button
                      key={option.value}
                      className={`btn btn-sm ${timeRange === option.value ? 'btn-light' : 'btn-outline-light'}`}
                      onClick={() => setTimeRange(option.value as any)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                  <i className="fas fa-project-diagram text-primary fs-4"></i>
                </div>
              </div>
              <h3 className="fw-bold text-primary mb-1">{analyticsData.totalWorkflows}</h3>
              <p className="text-muted mb-0 small">Total Workflows</p>
              <div className="small text-success mt-1">
                <i className="fas fa-play me-1"></i>
                {analyticsData.activeWorkflows} active
              </div>
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
              <h3 className="fw-bold text-info mb-1">{analyticsData.totalExecutions}</h3>
              <p className="text-muted mb-0 small">Total Enrollments</p>
              <div className="small text-success mt-1">
                <i className="fas fa-check me-1"></i>
                {analyticsData.completedExecutions} completed
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                  <i className="fas fa-percentage text-success fs-4"></i>
                </div>
              </div>
              <h3 className="fw-bold text-success mb-1">{analyticsData.averageCompletionRate.toFixed(1)}%</h3>
              <p className="text-muted mb-0 small">Completion Rate</p>
              <div className="progress mt-2" style={{ height: '4px' }}>
                <div 
                  className="progress-bar bg-success" 
                  style={{ width: `${analyticsData.averageCompletionRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center p-4">
              <div className="mb-3">
                <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                  <i className="fas fa-trophy text-warning fs-4"></i>
                </div>
              </div>
              <h6 className="fw-bold text-warning mb-1">Top Performer</h6>
              <p className="text-muted mb-0 small">{analyticsData.topPerformingWorkflow}</p>
              <div className="small text-success mt-1">
                <i className="fas fa-star me-1"></i>
                Best conversion rate
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Performance by Trigger Type */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header border-0 bg-light py-3">
              <h5 className="mb-0 fw-bold text-dark">
                <i className="fas fa-chart-bar me-2 text-primary"></i>
                Performance by Trigger Type
              </h5>
            </div>
            <div className="card-body">
              {Object.entries(analyticsData.performanceByTrigger).map(([trigger, data]) => (
                <div key={trigger} className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <span className="fw-semibold text-capitalize">
                        {trigger.replace('_', ' ')}
                      </span>
                      <span className="text-muted ms-2">
                        {data.completed}/{data.total} completed
                      </span>
                    </div>
                    <span className="badge bg-primary rounded-pill">
                      {data.rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${data.rate}%`,
                        backgroundColor: data.rate >= 80 ? '#28a745' : data.rate >= 60 ? '#ffc107' : '#dc3545'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header border-0 bg-light py-3">
              <h5 className="mb-0 fw-bold text-dark">
                <i className="fas fa-clock me-2 text-primary"></i>
                Recent Activity
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {analyticsData.recentActivity.map(activity => (
                  <div key={activity.id} className="list-group-item border-0 py-3">
                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        <i className={`fas ${getActivityIcon(activity.type)} fs-5`}></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold small">
                          {getActivityLabel(activity.type)}
                        </div>
                        <div className="text-muted small">
                          {activity.workflowName}
                        </div>
                        {activity.details && (
                          <div className="text-muted small">
                            {activity.details}
                          </div>
                        )}
                        <div className="text-muted small mt-1">
                          {formatTimeAgo(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Execution Trends Chart */}
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header border-0 bg-light py-3">
              <h5 className="mb-0 fw-bold text-dark">
                <i className="fas fa-chart-area me-2 text-primary"></i>
                Execution Trends (Last 30 Days)
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-12">
                  <div className="text-center py-4">
                    <i className="fas fa-chart-line text-muted fs-1 mb-3"></i>
                    <h6 className="text-muted">Interactive Chart Coming Soon</h6>
                    <p className="text-muted small">
                      Advanced charting with Chart.js or similar library will be integrated here
                    </p>
                    <div className="row g-3 mt-3">
                      <div className="col-md-6">
                        <div className="bg-light rounded p-3">
                          <div className="small text-muted">Average Daily Executions</div>
                          <div className="h5 fw-bold text-primary mb-0">
                            {(analyticsData.executionTrends.reduce((sum, day) => sum + day.executions, 0) / analyticsData.executionTrends.length).toFixed(1)}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="bg-light rounded p-3">
                          <div className="small text-muted">Average Daily Completions</div>
                          <div className="h5 fw-bold text-success mb-0">
                            {(analyticsData.executionTrends.reduce((sum, day) => sum + day.completions, 0) / analyticsData.executionTrends.length).toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
