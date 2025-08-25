'use client';

import React, { useState, useEffect } from 'react';
import { UserActivity, ActivityFilters } from '@/types/activity';
import { ActivityService } from '@/services/activityService';

interface UserActivityFeedProps {
  userId: string;
  maxItems?: number;
  showFilters?: boolean;
  className?: string;
}

export const UserActivityFeed: React.FC<UserActivityFeedProps> = ({
  userId,
  maxItems = 10,
  showFilters = false,
  className = ''
}) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActivityFilters>({ limit: maxItems });

  useEffect(() => {
    loadActivities();
  }, [userId, filters]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const userActivities = await ActivityService.getUserActivities(userId, filters);
      setActivities(userActivities);
    } catch (err) {
      setError('Failed to load activity feed');
      console.error('Activity feed error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Unknown time';
    
    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const getActivityIcon = (activity: UserActivity) => {
    return activity.icon || 'fas fa-info-circle';
  };

  const getActivityColor = (activity: UserActivity) => {
    const colorMap = {
      primary: 'text-primary',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-danger',
      info: 'text-info'
    };
    return colorMap[activity.color] || 'text-primary';
  };

  const getBadgeColor = (status: string) => {
    const badgeMap = {
      success: 'bg-success',
      pending: 'bg-warning',
      failed: 'bg-danger'
    };
    return badgeMap[status as keyof typeof badgeMap] || 'bg-secondary';
  };

  if (loading) {
    return (
      <div className={`activity-feed ${className}`}>
        <div className="d-flex justify-content-center align-items-center p-4">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="text-muted">Loading activity...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`activity-feed ${className}`}>
        <div className="alert alert-danger d-flex align-items-center">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <span>{error}</span>
          <button 
            className="btn btn-sm btn-outline-danger ms-auto"
            onClick={loadActivities}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`activity-feed ${className}`}>
      {showFilters && (
        <div className="activity-filters mb-3 p-3 bg-light rounded">
          <div className="row g-2">
            <div className="col-md-6">
              <select 
                className="form-select form-select-sm"
                value={filters.status || ''}
                onChange={(e) => setFilters({...filters, status: e.target.value as any || undefined})}
              >
                <option value="">All Status</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="col-md-6">
              <select 
                className="form-select form-select-sm"
                value={filters.limit || maxItems}
                onChange={(e) => setFilters({...filters, limit: parseInt(e.target.value)})}
              >
                <option value="5">Last 5</option>
                <option value="10">Last 10</option>
                <option value="25">Last 25</option>
                <option value="50">Last 50</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="text-center py-5">
          <div className="text-muted">
            <i className="fas fa-history fa-3x mb-3 opacity-50"></i>
            <h6>No Recent Activity</h6>
            <p className="small">Your activity history will appear here as you use the system</p>
          </div>
        </div>
      ) : (
        <div className="activity-list">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-item d-flex align-items-start p-3 border-bottom">
              <div className="activity-icon me-3 flex-shrink-0">
                <div className={`rounded-circle d-flex align-items-center justify-content-center ${getActivityColor(activity)}`}
                     style={{ width: '40px', height: '40px', backgroundColor: 'rgba(var(--bs-primary-rgb), 0.1)' }}>
                  <i className={`${getActivityIcon(activity)} fa-sm`}></i>
                </div>
              </div>
              
              <div className="activity-content flex-grow-1">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <h6 className="activity-title mb-0 fw-semibold">
                    {activity.title}
                  </h6>
                  <div className="d-flex align-items-center">
                    <span className={`badge rounded-pill ${getBadgeColor(activity.status)} me-2`}>
                      {activity.status}
                    </span>
                    <small className="text-muted">
                      {formatTimestamp(activity.timestamp)}
                    </small>
                  </div>
                </div>
                
                <p className="activity-description mb-1 text-muted small">
                  {activity.description}
                </p>
                
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <div className="activity-metadata">
                    {activity.metadata.serviceType && (
                      <span className="badge bg-light text-dark me-1">
                        {activity.metadata.serviceType}
                      </span>
                    )}
                    {activity.metadata.amount && (
                      <span className="badge bg-success me-1">
                        ${activity.metadata.amount}
                      </span>
                    )}
                    {activity.metadata.pdfType && (
                      <span className="badge bg-info me-1">
                        {activity.metadata.pdfType} PDF
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activities.length > 0 && (
        <div className="activity-footer text-center p-3">
          <button 
            className="btn btn-sm btn-outline-primary"
            onClick={() => setFilters({...filters, limit: (filters.limit || maxItems) + 10})}
          >
            <i className="fas fa-chevron-down me-1"></i>
            Load More
          </button>
        </div>
      )}
    </div>
  );
};
