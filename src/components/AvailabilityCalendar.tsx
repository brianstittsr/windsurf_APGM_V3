'use client';

import React, { useState, useEffect } from 'react';
import { AvailabilityService, ArtistAvailability, TimeRange } from '@/services/availabilityService';
import { useServices } from '@/hooks/useFirebase';

interface AvailabilityCalendarProps {
  artistId: string;
  isEditable?: boolean;
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

export default function AvailabilityCalendar({ artistId, isEditable = true }: AvailabilityCalendarProps) {
  const [availability, setAvailability] = useState<ArtistAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null); // Track which day is being updated
  const [activeTab, setActiveTab] = useState('hours');
  const { services } = useServices();

  useEffect(() => {
    loadAvailability();
  }, [artistId]);

  const loadAvailability = async () => {
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
    if (updating === dayOfWeek) return; // Prevent multiple updates
    
    try {
      setUpdating(dayOfWeek);
      console.log('Toggling day:', dayOfWeek, 'to:', isEnabled, 'for artist:', artistId);
      await AvailabilityService.toggleDayAvailability(artistId, dayOfWeek, isEnabled);
      await loadAvailability(); // Refresh data
      console.log('Toggle completed successfully');
    } catch (error) {
      console.error('Error toggling day:', error);
      // Show user-friendly error
      alert('Failed to update day availability. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const handleAddTimeRange = async (dayOfWeek: string) => {
    try {
      const newTimeRange: Omit<TimeRange, 'id'> = {
        startTime: '09:00',
        endTime: '17:00',
        isActive: true
      };
      
      await AvailabilityService.addTimeRange(artistId, dayOfWeek, newTimeRange);
      await loadAvailability(); // Refresh data
    } catch (error) {
      console.error('Error adding time range:', error);
    }
  };

  const handleUpdateTimeRange = async (
    dayOfWeek: string, 
    timeRangeId: string, 
    field: 'startTime' | 'endTime', 
    value: string
  ) => {
    try {
      // Convert from HH:MM format to the format expected by the database
      const convertedValue = convertFromTimeInput(value);
      await AvailabilityService.updateTimeRange(artistId, dayOfWeek, timeRangeId, {
        [field]: convertedValue
      });
      await loadAvailability(); // Refresh data
    } catch (error) {
      console.error('Error updating time range:', error);
    }
  };

  const handleRemoveTimeRange = async (dayOfWeek: string, timeRangeId: string) => {
    try {
      await AvailabilityService.removeTimeRange(artistId, dayOfWeek, timeRangeId);
      await loadAvailability(); // Refresh data
    } catch (error) {
      console.error('Error removing time range:', error);
    }
  };

  const handleServicesChange = async (dayOfWeek: string, selectedServices: string[]) => {
    try {
      await AvailabilityService.updateServicesOffered(artistId, dayOfWeek, selectedServices);
      await loadAvailability(); // Refresh data
    } catch (error) {
      console.error('Error updating services:', error);
    }
  };

  const getDayAvailability = (dayOfWeek: string): ArtistAvailability | undefined => {
    return availability.find(a => a.dayOfWeek === dayOfWeek);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading availability...</span>
        </div>
        <p className="mt-2 text-muted">Loading availability calendar...</p>
      </div>
    );
  }

  return (
    <div className="availability-calendar">
      {/* Enhanced Navigation Tabs */}
      <div className="border-bottom mb-4">
        <nav className="nav nav-tabs nav-fill">
          <button
            className={`nav-link d-flex align-items-center justify-content-center ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user me-2"></i>
            Profile
          </button>
          <button
            className={`nav-link d-flex align-items-center justify-content-center ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <i className="fas fa-lock me-2"></i>
            Security
          </button>
          <button
            className={`nav-link d-flex align-items-center justify-content-center ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <i className="fas fa-spa me-2"></i>
            Services
          </button>
          <button
            className={`nav-link d-flex align-items-center justify-content-center ${activeTab === 'hours' ? 'active' : ''}`}
            onClick={() => setActiveTab('hours')}
          >
            <i className="fas fa-clock me-2"></i>
            Hours
          </button>
          <button
            className={`nav-link d-flex align-items-center justify-content-center ${activeTab === 'rent' ? 'active' : ''}`}
            onClick={() => setActiveTab('rent')}
          >
            <i className="fas fa-dollar-sign me-2"></i>
            Rent
          </button>
        </nav>
      </div>

      {/* Working Hours Section */}
      {activeTab === 'hours' && (
        <div>
          {/* Enhanced Header with Connection Info */}
          <div className="row mb-4">
            <div className="col-lg-8">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                  <i className="fas fa-clock text-primary"></i>
                </div>
                <div>
                  <h4 className="fw-bold mb-1">Working Hours</h4>
                  <p className="text-muted mb-0">
                    Set your availability for client bookings
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card border-0 bg-light">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-info-circle text-info me-2"></i>
                    <small className="text-muted">
                      <strong>Connected to Booking:</strong> These hours generate 4-hour time slots for client appointments
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Connection Flow Visual */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card border-0 bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="card-body py-3">
                  <div className="row align-items-center text-white">
                    <div className="col-md-3 text-center">
                      <i className="fas fa-clock fa-2x mb-2"></i>
                      <div className="small fw-bold">Set Hours</div>
                      <div className="small opacity-75">Define availability</div>
                    </div>
                    <div className="col-md-1 text-center">
                      <i className="fas fa-arrow-right"></i>
                    </div>
                    <div className="col-md-3 text-center">
                      <i className="fas fa-calendar-alt fa-2x mb-2"></i>
                      <div className="small fw-bold">Generate Slots</div>
                      <div className="small opacity-75">4-hour time blocks</div>
                    </div>
                    <div className="col-md-1 text-center">
                      <i className="fas fa-arrow-right"></i>
                    </div>
                    <div className="col-md-3 text-center">
                      <i className="fas fa-user-check fa-2x mb-2"></i>
                      <div className="small fw-bold">Client Booking</div>
                      <div className="small opacity-75">Available for appointments</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Days of Week Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 py-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h5 className="mb-1 fw-bold">Weekly Schedule</h5>
                  <small className="text-muted">Configure your availability for each day of the week</small>
                </div>
                <div className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                  <i className="fas fa-calendar-week me-1"></i>
                  7 Days
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 py-3" style={{ width: '200px' }}>
                        <i className="fas fa-calendar-day me-2 text-primary"></i>
                        Day of the week
                      </th>
                      <th className="border-0 py-3" style={{ width: '150px' }}>
                        <i className="fas fa-play me-2 text-success"></i>
                        Start
                      </th>
                      <th className="border-0 py-3" style={{ width: '20px' }}></th>
                      <th className="border-0 py-3" style={{ width: '150px' }}>
                        <i className="fas fa-stop me-2 text-danger"></i>
                        End
                      </th>
                      <th className="border-0 py-3">
                        <i className="fas fa-spa me-2 text-info"></i>
                        Services Offered
                      </th>
                    </tr>
                  </thead>
              <tbody>
                {DAYS_OF_WEEK.map((day) => {
                  const dayAvailability = getDayAvailability(day.key);
                  const isEnabled = dayAvailability?.isEnabled || false;
                  const timeRanges = dayAvailability?.timeRanges || [];

                  return (
                    <tr key={day.key} className={isEnabled ? 'table-row-enabled' : 'table-row-disabled'} style={{
                      backgroundColor: isEnabled ? 'rgba(40, 167, 69, 0.05)' : 'rgba(108, 117, 125, 0.05)'
                    }}>
                      <td className="align-middle py-3">
                        <div className="d-flex align-items-center">
                          {isEditable && (
                            <div className="form-check me-3">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`enable-${day.key}`}
                                checked={isEnabled}
                                disabled={updating === day.key}
                                onChange={(e) => handleToggleDay(day.key, e.target.checked)}
                                style={{
                                  transform: 'scale(1.2)',
                                  opacity: updating === day.key ? 0.6 : 1
                                }}
                              />
                              <label className="form-check-label" htmlFor={`enable-${day.key}`}>
                                <span className="visually-hidden">Enable {day.label}</span>
                              </label>
                              {updating === day.key && (
                                <div className="spinner-border spinner-border-sm text-primary ms-2" role="status" style={{ width: '12px', height: '12px' }}>
                                  <span className="visually-hidden">Updating...</span>
                                </div>
                              )}
                            </div>
                          )}
                          <div className="d-flex align-items-center">
                            <div className={`rounded-circle me-2 ${isEnabled ? 'bg-success' : 'bg-secondary'}`} style={{
                              width: '8px',
                              height: '8px'
                            }}></div>
                            <span className={`fw-semibold ${isEnabled ? 'text-dark' : 'text-muted'}`}>
                              {day.label}
                            </span>
                            {isEnabled && timeRanges.length > 0 && (
                              <span className="badge bg-success bg-opacity-10 text-success ms-2 small">
                                <i className="fas fa-check me-1"></i>
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Enhanced Time Range Inputs */}
                      {isEnabled && timeRanges.length > 0 ? (
                        <>
                          <td className="align-middle py-3">
                            <div className="input-group input-group-sm">
                              <span className="input-group-text bg-success bg-opacity-10 border-success border-opacity-25">
                                <i className="fas fa-play text-success"></i>
                              </span>
                              <input
                                type="time"
                                className="form-control border-success border-opacity-25 fw-semibold"
                                value={convertToTimeInput(timeRanges[0].startTime)}
                                onChange={(e) => handleUpdateTimeRange(day.key, timeRanges[0].id, 'startTime', e.target.value)}
                                disabled={!isEditable}
                                placeholder="09:00"
                                style={{ backgroundColor: 'rgba(25, 135, 84, 0.05)' }}
                              />
                            </div>
                          </td>
                          <td className="align-middle text-center py-3">
                            <i className="fas fa-arrow-right text-muted"></i>
                          </td>
                          <td className="align-middle py-3">
                            <div className="input-group input-group-sm">
                              <span className="input-group-text bg-danger bg-opacity-10 border-danger border-opacity-25">
                                <i className="fas fa-stop text-danger"></i>
                              </span>
                              <input
                                type="time"
                                className="form-control border-danger border-opacity-25 fw-semibold"
                                value={convertToTimeInput(timeRanges[0].endTime)}
                                onChange={(e) => handleUpdateTimeRange(day.key, timeRanges[0].id, 'endTime', e.target.value)}
                                disabled={!isEditable}
                                placeholder="17:00"
                                style={{ backgroundColor: 'rgba(220, 53, 69, 0.05)' }}
                              />
                            </div>
                          </td>
                        </>
                      ) : isEnabled ? (
                        <>
                          <td className="align-middle">
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Start"
                                disabled
                              />
                              <span className="input-group-text">
                                <i className="fas fa-clock text-muted"></i>
                              </span>
                            </div>
                          </td>
                          <td className="align-middle text-center">
                            <span className="text-muted">-</span>
                          </td>
                          <td className="align-middle">
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="End"
                                disabled
                              />
                              <span className="input-group-text">
                                <i className="fas fa-clock text-muted"></i>
                              </span>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="align-middle">
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Start"
                                disabled
                              />
                              <span className="input-group-text">
                                <i className="fas fa-clock text-muted"></i>
                              </span>
                            </div>
                          </td>
                          <td className="align-middle text-center">
                            <span className="text-muted">-</span>
                          </td>
                          <td className="align-middle">
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="End"
                                disabled
                              />
                              <span className="input-group-text">
                                <i className="fas fa-clock text-muted"></i>
                              </span>
                            </div>
                          </td>
                        </>
                      )}

                      {/* Services Offered Multiselect */}
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <div className="dropdown me-2" style={{ minWidth: '200px' }}>
                            <button 
                              className="btn btn-outline-secondary dropdown-toggle w-100 text-start" 
                              type="button" 
                              id={`servicesDropdown-${day.key}`}
                              data-bs-toggle="dropdown" 
                              aria-expanded="false"
                              disabled={!isEnabled || !isEditable}
                              style={{ fontSize: '0.875rem' }}
                            >
                              {(() => {
                                const dayAvail = getDayAvailability(day.key);
                                const selectedServices = dayAvail?.servicesOffered || ['all'];
                                
                                if (selectedServices.includes('all') || selectedServices.length === 0) {
                                  return 'All Services';
                                }
                                
                                if (selectedServices.length === 1) {
                                  const service = services?.find(s => s.id === selectedServices[0]);
                                  return service?.name || 'Select Services';
                                }
                                
                                return `${selectedServices.length} Services Selected`;
                              })()} 
                            </button>
                            <ul className="dropdown-menu" aria-labelledby={`servicesDropdown-${day.key}`} style={{ maxHeight: '200px', overflowY: 'auto' }}>
                              <li>
                                <label className="dropdown-item d-flex align-items-center">
                                  <input 
                                    type="checkbox" 
                                    className="form-check-input me-2"
                                    checked={(() => {
                                      const dayAvail = getDayAvailability(day.key);
                                      const selectedServices = dayAvail?.servicesOffered || ['all'];
                                      return selectedServices.includes('all') || selectedServices.length === 0;
                                    })()} 
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        handleServicesChange(day.key, ['all']);
                                      }
                                    }}
                                  />
                                  <strong>All Services</strong>
                                </label>
                              </li>
                              <li><hr className="dropdown-divider" /></li>
                              {services?.map(service => {
                                const dayAvail = getDayAvailability(day.key);
                                const selectedServices = dayAvail?.servicesOffered || ['all'];
                                const isSelected = selectedServices.includes(service.id) && !selectedServices.includes('all');
                                
                                return (
                                  <li key={service.id}>
                                    <label className="dropdown-item d-flex align-items-center">
                                      <input 
                                        type="checkbox" 
                                        className="form-check-input me-2"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          const currentServices = selectedServices.filter(s => s !== 'all');
                                          let newServices;
                                          
                                          if (e.target.checked) {
                                            newServices = [...currentServices, service.id];
                                          } else {
                                            newServices = currentServices.filter(s => s !== service.id);
                                          }
                                          
                                          // If no services selected, default to 'all'
                                          if (newServices.length === 0) {
                                            newServices = ['all'];
                                          }
                                          
                                          handleServicesChange(day.key, newServices);
                                        }}
                                      />
                                      {service.name}
                                    </label>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                          
                          {isEnabled && isEditable && (
                            <>
                              {timeRanges.length === 0 && (
                                <button
                                  className="btn btn-link text-primary p-0 me-2"
                                  onClick={() => handleAddTimeRange(day.key)}
                                  title="Add Time Range"
                                >
                                  <i className="fas fa-plus"></i>
                                </button>
                              )}
                              
                              {timeRanges.length > 0 && (
                                <button
                                  className="btn btn-link text-danger p-0"
                                  onClick={() => handleRemoveTimeRange(day.key, timeRanges[0].id)}
                                  title="Remove Time Range"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Enhanced Add Time Range Section */}
            {isEditable && (
              <div className="card-footer bg-light border-0">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-plus-circle text-primary me-2"></i>
                    <small className="text-muted">Need additional time ranges? Add multiple slots per day</small>
                  </div>
                  <button className="btn btn-outline-primary btn-sm">
                    <i className="fas fa-plus me-2"></i>
                    Add Time Range
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Booking Connection Summary */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="alert alert-info border-0 bg-info bg-opacity-10">
                <div className="d-flex align-items-start">
                  <i className="fas fa-lightbulb text-info me-3 mt-1"></i>
                  <div className="flex-grow-1">
                    <h6 className="alert-heading mb-2">How This Connects to Client Bookings</h6>
                    <p className="mb-2">Your working hours are automatically converted into 4-hour appointment slots:</p>
                    <ul className="mb-3 small">
                      <li><strong>Example:</strong> 09:00 - 17:00 creates slots: 09:00-13:00, 13:00-17:00</li>
                      <li><strong>Booking Page:</strong> Clients see these slots when selecting appointment times</li>
                      <li><strong>Real-time:</strong> Changes here immediately update booking availability</li>
                    </ul>
                    <div className="d-flex gap-2">
                      <a href="/book-now-custom" target="_blank" className="btn btn-outline-info btn-sm">
                        <i className="fas fa-external-link-alt me-2"></i>
                        View Booking Page
                      </a>
                      <button className="btn btn-info btn-sm" onClick={() => window.location.reload()}>
                        <i className="fas fa-sync-alt me-2"></i>
                        Refresh Availability
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other tabs content can be added here */}
      {activeTab !== 'hours' && (
        <div className="text-center py-5">
          <p className="text-muted">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} section coming soon...
          </p>
        </div>
      )}
    </div>
  );
}
