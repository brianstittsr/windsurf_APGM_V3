'use client';

import React, { useState, useEffect } from 'react';
import { AvailabilityService, ArtistAvailability, TimeRange } from '@/services/availabilityService';

interface Artist {
  id: string;
  name: string;
}

interface AdminAvailabilityManagerProps {
  className?: string;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

// Helper functions for time format conversion
const convertToTimeInput = (timeString: string): string => {
  if (!timeString) return '';
  
  // If already in HH:MM format, return as is
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  
  // Convert from "9:00 AM" format to "09:00" format
  const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  
  return timeString;
};

const convertFromTimeInput = (timeString: string): string => {
  if (!timeString) return '';
  
  // If already in "HH:MM AM/PM" format, return as is
  if (timeString.includes('AM') || timeString.includes('PM')) {
    return timeString;
  }
  
  // Convert from "HH:MM" to "H:MM AM/PM" format
  const [hours, minutes] = timeString.split(':');
  const hour24 = parseInt(hours);
  
  if (hour24 === 0) {
    return `12:${minutes} AM`;
  } else if (hour24 < 12) {
    return `${hour24}:${minutes} AM`;
  } else if (hour24 === 12) {
    return `12:${minutes} PM`;
  } else {
    return `${hour24 - 12}:${minutes} PM`;
  }
};

export default function AdminAvailabilityManager({ className = '' }: AdminAvailabilityManagerProps) {
  const [artists] = useState<Artist[]>([
    { id: 'victoria', name: 'Victoria' },
    { id: 'admin', name: 'Admin' }
  ]);
  const [selectedArtist, setSelectedArtist] = useState<string>('victoria');
  const [availability, setAvailability] = useState<ArtistAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'single' | 'overview'>('single');

  useEffect(() => {
    if (selectedArtist) {
      loadAvailability(selectedArtist);
    }
  }, [selectedArtist]);

  const loadAvailability = async (artistId: string) => {
    try {
      setLoading(true);
      const data = await AvailabilityService.getArtistAvailability(artistId);
      
      // If no availability exists, initialize it
      if (data.length === 0) {
        await AvailabilityService.initializeArtistAvailability(artistId);
        const newData = await AvailabilityService.getArtistAvailability(artistId);
        setAvailability(newData);
      } else {
        setAvailability(data);
      }
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = async (dayOfWeek: string, isEnabled: boolean) => {
    if (updating === dayOfWeek) return;
    
    try {
      setUpdating(dayOfWeek);
      await AvailabilityService.toggleDayAvailability(selectedArtist, dayOfWeek, isEnabled);
      await loadAvailability(selectedArtist);
    } catch (error) {
      console.error('Error toggling day:', error);
      alert('Failed to update day availability. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const handleAddTimeRange = async (dayOfWeek: string) => {
    try {
      const newTimeRange: Omit<TimeRange, 'id'> = {
        startTime: '9:00 AM',
        endTime: '1:00 PM',
        isActive: true
      };
      
      await AvailabilityService.addTimeRange(selectedArtist, dayOfWeek, newTimeRange);
      await loadAvailability(selectedArtist);
    } catch (error) {
      console.error('Error adding time range:', error);
      alert('Failed to add time range. Please try again.');
    }
  };

  const handleUpdateTimeRange = async (
    dayOfWeek: string, 
    timeRangeId: string, 
    field: 'startTime' | 'endTime', 
    value: string
  ) => {
    try {
      const convertedValue = convertFromTimeInput(value);
      await AvailabilityService.updateTimeRange(selectedArtist, dayOfWeek, timeRangeId, {
        [field]: convertedValue
      });
      await loadAvailability(selectedArtist);
    } catch (error) {
      console.error('Error updating time range:', error);
      alert('Failed to update time range. Please try again.');
    }
  };

  const handleRemoveTimeRange = async (dayOfWeek: string, timeRangeId: string) => {
    try {
      await AvailabilityService.removeTimeRange(selectedArtist, dayOfWeek, timeRangeId);
      await loadAvailability(selectedArtist);
    } catch (error) {
      console.error('Error removing time range:', error);
      alert('Failed to remove time range. Please try again.');
    }
  };

  const getDayAvailability = (dayOfWeek: string): ArtistAvailability | undefined => {
    return availability.find(a => a.dayOfWeek === dayOfWeek);
  };

  const renderOverviewMode = () => {
    return (
      <div className="row">
        {artists.map(artist => (
          <div key={artist.id} className="col-lg-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0">
                  <i className="fas fa-user me-2"></i>
                  {artist.name}
                </h6>
              </div>
              <div className="card-body p-3">
                <div className="table-responsive">
                  <table className="table table-sm mb-0">
                    <tbody>
                      {DAYS_OF_WEEK.map(day => {
                        const dayAvailability = getDayAvailability(day.key);
                        const isEnabled = dayAvailability?.isEnabled || false;
                        const timeRanges = dayAvailability?.timeRanges || [];
                        
                        return (
                          <tr key={day.key}>
                            <td className="fw-semibold" style={{ width: '100px' }}>
                              {day.label}
                            </td>
                            <td>
                              {isEnabled ? (
                                timeRanges.length > 0 ? (
                                  <div className="d-flex flex-wrap gap-1">
                                    {timeRanges.map(range => (
                                      <span key={range.id} className="badge bg-success">
                                        {range.startTime} - {range.endTime}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-warning">
                                    <i className="fas fa-exclamation-triangle me-1"></i>
                                    Enabled but no time ranges
                                  </span>
                                )
                              ) : (
                                <span className="text-muted">Closed</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3">
                  <button 
                    className="btn btn-outline-primary btn-sm w-100"
                    onClick={() => {
                      setSelectedArtist(artist.id);
                      setViewMode('single');
                    }}
                  >
                    <i className="fas fa-edit me-2"></i>
                    Edit Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSingleArtistMode = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading availability data...</p>
        </div>
      );
    }

    return (
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-0 pb-0">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-1 text-primary fw-bold">
                <i className="fas fa-calendar-alt me-2"></i>
                {artists.find(a => a.id === selectedArtist)?.name} - Weekly Schedule
              </h6>
              <p className="text-muted small mb-0">
                Manage working hours and availability for this artist
              </p>
            </div>
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setViewMode('overview')}
            >
              <i className="fas fa-th-large me-2"></i>
              Overview
            </button>
          </div>
        </div>
        
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '120px' }}>Day</th>
                  <th style={{ width: '100px' }}>Status</th>
                  <th>Working Hours</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {DAYS_OF_WEEK.map(day => {
                  const dayAvailability = getDayAvailability(day.key);
                  const isEnabled = dayAvailability?.isEnabled || false;
                  const timeRanges = dayAvailability?.timeRanges || [];
                  const isUpdating = updating === day.key;
                  
                  return (
                    <tr key={day.key} className={isEnabled ? 'table-success' : ''}>
                      <td className="fw-semibold align-middle">
                        {day.label}
                      </td>
                      <td className="align-middle">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => handleToggleDay(day.key, e.target.checked)}
                            disabled={isUpdating}
                          />
                          <label className="form-check-label small">
                            {isUpdating ? (
                              <span className="text-muted">
                                <i className="fas fa-spinner fa-spin me-1"></i>
                                Updating...
                              </span>
                            ) : (
                              isEnabled ? 'Open' : 'Closed'
                            )}
                          </label>
                        </div>
                      </td>
                      <td className="align-middle">
                        {isEnabled && (
                          <div className="d-flex flex-column gap-2">
                            {timeRanges.map((range, index) => (
                              <div key={range.id} className="d-flex align-items-center gap-2">
                                <input
                                  type="time"
                                  className="form-control form-control-sm"
                                  style={{ width: '110px' }}
                                  value={convertToTimeInput(range.startTime)}
                                  onChange={(e) => handleUpdateTimeRange(day.key, range.id, 'startTime', e.target.value)}
                                />
                                <span className="text-muted">to</span>
                                <input
                                  type="time"
                                  className="form-control form-control-sm"
                                  style={{ width: '110px' }}
                                  value={convertToTimeInput(range.endTime)}
                                  onChange={(e) => handleUpdateTimeRange(day.key, range.id, 'endTime', e.target.value)}
                                />
                                {timeRanges.length > 1 && (
                                  <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => handleRemoveTimeRange(day.key, range.id)}
                                    title="Remove this time range"
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                )}
                              </div>
                            ))}
                            {timeRanges.length === 0 && (
                              <span className="text-warning small">
                                <i className="fas fa-exclamation-triangle me-1"></i>
                                Day is enabled but no time ranges set
                              </span>
                            )}
                          </div>
                        )}
                        {!isEnabled && (
                          <span className="text-muted small">Day is closed</span>
                        )}
                      </td>
                      <td className="align-middle">
                        {isEnabled && (
                          <div className="d-flex gap-1">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => handleAddTimeRange(day.key)}
                              title="Add time range"
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Quick Actions */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="alert alert-info border-0 bg-info bg-opacity-10">
                <div className="d-flex align-items-start">
                  <i className="fas fa-lightbulb text-info me-3 mt-1"></i>
                  <div className="flex-grow-1">
                    <h6 className="alert-heading mb-2">Admin Tips</h6>
                    <ul className="mb-3 small">
                      <li>Changes are saved automatically when you modify times</li>
                      <li>4-hour appointment slots are generated from these working hours</li>
                      <li>Clients will see available slots based on this schedule</li>
                    </ul>
                    <div className="d-flex gap-2">
                      <a href="/book-now-custom" target="_blank" className="btn btn-outline-info btn-sm">
                        <i className="fas fa-external-link-alt me-2"></i>
                        Test Booking Page
                      </a>
                      <button className="btn btn-info btn-sm" onClick={() => loadAvailability(selectedArtist)}>
                        <i className="fas fa-sync-alt me-2"></i>
                        Refresh Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {/* Header Controls */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="mb-1 text-primary fw-bold">
            <i className="fas fa-users-cog me-2"></i>
            Artist Availability Management
          </h5>
          <p className="text-muted small mb-0">
            View and manage schedules for all artists
          </p>
        </div>
        
        <div className="d-flex gap-2">
          {/* View Mode Toggle */}
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'overview' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('overview')}
            >
              <i className="fas fa-th-large me-1"></i>
              Overview
            </button>
            <button
              type="button"
              className={`btn btn-sm ${viewMode === 'single' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setViewMode('single')}
            >
              <i className="fas fa-edit me-1"></i>
              Edit
            </button>
          </div>
          
          {/* Artist Selector (only in single mode) */}
          {viewMode === 'single' && (
            <select
              className="form-select form-select-sm"
              style={{ width: '150px' }}
              value={selectedArtist}
              onChange={(e) => setSelectedArtist(e.target.value)}
            >
              {artists.map(artist => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Content */}
      {viewMode === 'overview' ? renderOverviewMode() : renderSingleArtistMode()}
    </div>
  );
}
