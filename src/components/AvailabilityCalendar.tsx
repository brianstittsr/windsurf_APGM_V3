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

export default function AvailabilityCalendar({ artistId, isEditable = true }: AvailabilityCalendarProps) {
  const [availability, setAvailability] = useState<ArtistAvailability[]>([]);
  const [loading, setLoading] = useState(true);
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
    try {
      await AvailabilityService.toggleDayAvailability(artistId, dayOfWeek, isEnabled);
      await loadAvailability(); // Refresh data
    } catch (error) {
      console.error('Error toggling day:', error);
    }
  };

  const handleAddTimeRange = async (dayOfWeek: string) => {
    try {
      const newTimeRange: Omit<TimeRange, 'id'> = {
        startTime: '9:00 AM',
        endTime: '5:00 PM',
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
      await AvailabilityService.updateTimeRange(artistId, dayOfWeek, timeRangeId, {
        [field]: value
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
      {/* Navigation Tabs */}
      <div className="border-bottom mb-4">
        <nav className="nav nav-tabs">
          <button
            className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Password & Security
          </button>
          <button
            className={`nav-link ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            Services
          </button>
          <button
            className={`nav-link ${activeTab === 'hours' ? 'active' : 'text-decoration-underline'}`}
            onClick={() => setActiveTab('hours')}
          >
            Hours
          </button>
          <button
            className={`nav-link ${activeTab === 'rent' ? 'active' : ''}`}
            onClick={() => setActiveTab('rent')}
          >
            Rent Collection
          </button>
        </nav>
      </div>

      {/* Working Hours Section */}
      {activeTab === 'hours' && (
        <div>
          <div className="mb-4">
            <h4 className="fw-bold mb-2">Working Hours</h4>
            <p className="text-muted">
              Working hours are the hours that services can be booked and is reflected on the Vagaro calendar.
            </p>
          </div>

          {/* Days of Week Table */}
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '200px' }}>Day of the week</th>
                  <th style={{ width: '150px' }}>Start</th>
                  <th style={{ width: '20px' }}></th>
                  <th style={{ width: '150px' }}>End</th>
                  <th>Services Offered</th>
                </tr>
              </thead>
              <tbody>
                {DAYS_OF_WEEK.map((day) => {
                  const dayAvailability = getDayAvailability(day.key);
                  const isEnabled = dayAvailability?.isEnabled || false;
                  const timeRanges = dayAvailability?.timeRanges || [];

                  return (
                    <tr key={day.key}>
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          {isEditable && (
                            <div className="form-check form-switch me-3">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={isEnabled}
                                onChange={(e) => handleToggleDay(day.key, e.target.checked)}
                                style={{
                                  backgroundColor: isEnabled ? '#28a745' : '#6c757d',
                                  borderColor: isEnabled ? '#28a745' : '#6c757d'
                                }}
                              />
                            </div>
                          )}
                          <span className={isEnabled ? 'text-dark' : 'text-muted'}>
                            {day.label}
                          </span>
                        </div>
                      </td>

                      {/* Time Range Inputs */}
                      {isEnabled && timeRanges.length > 0 ? (
                        <>
                          <td className="align-middle">
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control"
                                value={timeRanges[0].startTime}
                                onChange={(e) => handleUpdateTimeRange(day.key, timeRanges[0].id, 'startTime', e.target.value)}
                                disabled={!isEditable}
                                placeholder="Start"
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
                                value={timeRanges[0].endTime}
                                onChange={(e) => handleUpdateTimeRange(day.key, timeRanges[0].id, 'endTime', e.target.value)}
                                disabled={!isEditable}
                                placeholder="End"
                              />
                              <span className="input-group-text">
                                <i className="fas fa-clock text-muted"></i>
                              </span>
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

                      {/* Services Offered Dropdown */}
                      <td className="align-middle">
                        <div className="d-flex align-items-center">
                          <select 
                            className="form-select me-2" 
                            disabled={!isEnabled || !isEditable}
                            defaultValue="all"
                          >
                            <option value="all">All Services</option>
                            {services?.map(service => (
                              <option key={service.id} value={service.id}>
                                {service.name}
                              </option>
                            ))}
                          </select>
                          
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

          {/* Add Time Range Button */}
          {isEditable && (
            <div className="mt-3">
              <button className="btn btn-link text-primary p-0">
                <i className="fas fa-plus me-2"></i>
                Add Time Range
              </button>
            </div>
          )}
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
