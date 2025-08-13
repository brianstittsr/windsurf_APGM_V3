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
    const selectedArtistData = artists.find(a => a.id === selectedArtist);

    if (selectedArtistData) {
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
    return availability.find(a => a.artistId === selectedArtist && a.dayOfWeek === dayOfWeek);
  };

  const renderOverviewMode = () => {
    return (
      <div className="row g-4">
        {artists.map(artist => (
          <div key={artist.id} className="col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-gradient border-0 py-3" style={{ background: 'linear-gradient(135deg, #AD6269 0%, #8B4A52 100%)' }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="avatar-circle me-3" style={{ 
                      width: '40px', 
                      height: '40px', 
                      background: 'rgba(255,255,255,0.2)', 
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <i className={`fas ${artist.id === 'victoria' ? 'fa-user-tie' : 'fa-user-shield'} text-white`}></i>
                    </div>
                    <div>
                      <h6 className="mb-0 text-white fw-bold">{artist.name}</h6>
                      <small className="text-white-50">Weekly Schedule</small>
                    </div>
                  </div>
                  <button
                    className="btn btn-light btn-sm rounded-pill px-3"
                    onClick={() => {
                      setSelectedArtist(artist.id);
                      setViewMode('single');
                    }}
                    style={{ fontSize: '0.75rem' }}
                  >
                    <i className="fas fa-edit me-1"></i>
                    Edit
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 py-3 ps-4" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Day</th>
                        <th className="border-0 py-3" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Status</th>
                        <th className="border-0 py-3 pe-4" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Working Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS_OF_WEEK.map(day => {
                        const dayAvailability = availability.find(a => 
                          a.artistId === artist.id && a.dayOfWeek === day.key
                        );
                        const isOpen = dayAvailability?.isEnabled || false;
                        const timeRanges = dayAvailability?.timeRanges || [];
                        
                        return (
                          <tr key={day.key} className="border-bottom">
                            <td className="ps-4 py-3">
                              <div className="d-flex align-items-center">
                                <div className={`status-dot me-3 ${isOpen ? 'bg-success' : 'bg-secondary'}`} style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%'
                                }}></div>
                                <span className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>{day.label}</span>
                              </div>
                            </td>
                            <td className="py-3">
                              <span className={`badge rounded-pill px-3 py-2 ${isOpen ? 'bg-success bg-opacity-15 text-success' : 'bg-secondary bg-opacity-15 text-secondary'}`} style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                                <i className={`fas ${isOpen ? 'fa-check-circle' : 'fa-times-circle'} me-1`}></i>
                                {isOpen ? 'Open' : 'Closed'}
                              </span>
                            </td>
                            <td className="pe-4 py-3">
                              {isOpen && timeRanges.length > 0 ? (
                                <div className="time-ranges">
                                  {timeRanges.map((range, idx) => (
                                    <div key={idx} className="d-flex align-items-center mb-1">
                                      <i className="fas fa-clock text-muted me-2" style={{ fontSize: '0.75rem' }}></i>
                                      <span className="text-dark fw-medium" style={{ fontSize: '0.85rem' }}>
                                        {range.startTime} - {range.endTime}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="d-flex align-items-center">
                                  <i className="fas fa-ban text-muted me-2" style={{ fontSize: '0.75rem' }}></i>
                                  <span className="text-muted fst-italic" style={{ fontSize: '0.85rem' }}>Day is closed</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer bg-transparent border-0 p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-muted small">
                    <i className="fas fa-calendar-check me-1"></i>
                    {DAYS_OF_WEEK.filter(day => {
                      const dayAvailability = availability.find(a => 
                        a.artistId === artist.id && a.dayOfWeek === day.key
                      );
                      return dayAvailability?.isEnabled || false;
                    }).length} days active
                  </div>
                  <button
                    className="btn btn-outline-primary btn-sm rounded-pill px-4"
                    onClick={() => {
                      setSelectedArtist(artist.id);
                      setViewMode('single');
                    }}
                  >
                    <i className="fas fa-cog me-2"></i>
                    Manage Schedule
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

    const selectedArtistData = artists.find(a => a.id === selectedArtist);

    return (
      <div className="card border-0 shadow-sm">
        <div className="card-header border-0 py-4" style={{ background: 'linear-gradient(135deg, #AD6269 0%, #8B4A52 100%)' }}>
          <div className="d-flex align-items-center justify-content-between">
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
                <i className={`fas ${selectedArtist === 'victoria' ? 'fa-user-tie' : 'fa-user-shield'} text-white fs-5`}></i>
              </div>
              <div>
                <h5 className="mb-1 text-white fw-bold">{selectedArtistData?.name} Schedule Management</h5>
                <p className="mb-0 text-white-50 small">Configure working hours and availability</p>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-light btn-sm rounded-pill px-3"
                onClick={() => loadAvailability(selectedArtist)}
                disabled={loading}
              >
                <i className="fas fa-sync-alt me-1"></i>
                Refresh
              </button>
            </div>
          </div>
        </div>
        
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 py-3 ps-4" style={{ width: '140px', fontSize: '0.85rem', fontWeight: '600' }}>Day</th>
                  <th className="border-0 py-3" style={{ width: '120px', fontSize: '0.85rem', fontWeight: '600' }}>Status</th>
                  <th className="border-0 py-3" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Working Hours</th>
                  <th className="border-0 py-3 pe-4" style={{ width: '100px', fontSize: '0.85rem', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {DAYS_OF_WEEK.map(day => {
                  const dayAvailability = getDayAvailability(day.key);
                  const isEnabled = dayAvailability?.isEnabled || false;
                  const timeRanges = dayAvailability?.timeRanges || [];
                  const isUpdating = updating === day.key;

                  return (
                    <tr key={day.key} className={`border-bottom ${isEnabled ? 'bg-success bg-opacity-5' : ''}`}>
                      <td className="ps-4 py-4 align-middle">
                        <div className="d-flex align-items-center">
                          <div className={`status-dot me-3 ${isEnabled ? 'bg-success' : 'bg-secondary'}`} style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%'
                          }}></div>
                          <div>
                            <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>{day.label}</div>
                            <small className="text-muted">{isEnabled ? 'Available' : 'Closed'}</small>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 align-middle">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={isEnabled}
                            onChange={(e) => handleToggleDay(day.key, e.target.checked)}
                            disabled={isUpdating}
                            style={{ transform: 'scale(1.2)' }}
                          />
                          <label className="form-check-label ms-2">
                            <span className={`badge rounded-pill px-3 py-2 ${isEnabled ? 'bg-success bg-opacity-15 text-success' : 'bg-secondary bg-opacity-15 text-secondary'}`} style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                              <i className={`fas ${isEnabled ? 'fa-check-circle' : 'fa-times-circle'} me-1`}></i>
                              {isEnabled ? 'Open' : 'Closed'}
                            </span>
                          </label>
                        </div>
                      </td>
                      <td className="py-4 align-middle">
                        {isEnabled ? (
                          <div className="time-ranges">
                            {timeRanges.map(range => (
                              <div key={range.id} className="d-flex align-items-center mb-3 p-3 bg-light bg-opacity-50 rounded-3 border">
                                <div className="d-flex align-items-center flex-grow-1">
                                  <div className="me-3">
                                    <label className="form-label small text-muted mb-1">Start Time</label>
                                    <input
                                      type="time"
                                      className="form-control form-control-sm border-2"
                                      value={convertToTimeInput(range.startTime)}
                                      onChange={(e) => handleUpdateTimeRange(day.key, range.id, 'startTime', convertFromTimeInput(e.target.value))}
                                      style={{ minWidth: '110px' }}
                                    />
                                  </div>
                                  <div className="mx-3 text-center">
                                    <i className="fas fa-arrow-right text-muted fs-5"></i>
                                  </div>
                                  <div className="me-3">
                                    <label className="form-label small text-muted mb-1">End Time</label>
                                    <input
                                      type="time"
                                      className="form-control form-control-sm border-2"
                                      value={convertToTimeInput(range.endTime)}
                                      onChange={(e) => handleUpdateTimeRange(day.key, range.id, 'endTime', convertFromTimeInput(e.target.value))}
                                      style={{ minWidth: '110px' }}
                                    />
                                  </div>
                                  <div className="text-muted small">
                                    <i className="fas fa-clock me-1"></i>
                                    4-hour slots
                                  </div>
                                </div>
                                <button
                                  className="btn btn-outline-danger btn-sm rounded-pill ms-3"
                                  onClick={() => handleRemoveTimeRange(day.key, range.id)}
                                  title="Remove time range"
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              </div>
                            ))}
                            {timeRanges.length === 0 && (
                              <div className="d-flex align-items-center p-3 bg-warning bg-opacity-10 rounded-3 border border-warning border-opacity-25">
                                <i className="fas fa-exclamation-triangle text-warning me-3"></i>
                                <div>
                                  <div className="fw-medium text-warning">No time ranges configured</div>
                                  <small className="text-muted">Add working hours to make this day bookable for clients</small>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="d-flex align-items-center p-3 bg-secondary bg-opacity-10 rounded-3">
                            <i className="fas fa-ban text-secondary me-3"></i>
                            <div>
                              <div className="text-secondary fw-medium">Day is closed</div>
                              <small className="text-muted">Toggle the switch to enable this day</small>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="pe-4 py-4 align-middle">
                        {isEnabled && (
                          <button
                            className="btn btn-primary btn-sm rounded-pill px-3"
                            onClick={() => handleAddTimeRange(day.key)}
                            title="Add time range"
                          >
                            <i className="fas fa-plus me-1"></i>
                            Add
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Enhanced Admin Tips Section */}
        <div className="card-footer bg-transparent border-0 p-4">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="d-flex align-items-start p-4 bg-info bg-opacity-10 rounded-3 border border-info border-opacity-25">
                <div className="flex-shrink-0 me-3">
                  <div className="bg-info bg-opacity-20 rounded-circle p-2">
                    <i className="fas fa-lightbulb text-info"></i>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h6 className="text-info fw-bold mb-2">
                    <i className="fas fa-info-circle me-1"></i>
                    Schedule Management Tips
                  </h6>
                  <ul className="mb-3 small text-muted list-unstyled">
                    <li className="mb-1">
                      <i className="fas fa-check text-success me-2"></i>
                      Changes are automatically saved when you modify times
                    </li>
                    <li className="mb-1">
                      <i className="fas fa-check text-success me-2"></i>
                      4-hour appointment slots are generated from working hours
                    </li>
                    <li className="mb-1">
                      <i className="fas fa-check text-success me-2"></i>
                      Clients see available slots based on this schedule
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="d-flex flex-column gap-2">
                <a 
                  href="/book-now-custom" 
                  target="_blank" 
                  className="btn btn-outline-primary rounded-pill"
                >
                  <i className="fas fa-external-link-alt me-2"></i>
                  Test Booking Flow
                </a>
                <button 
                  className="btn btn-outline-secondary rounded-pill" 
                  onClick={() => setViewMode('overview')}
                >
                  <i className="fas fa-th-large me-2"></i>
                  View All Artists
                </button>
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
