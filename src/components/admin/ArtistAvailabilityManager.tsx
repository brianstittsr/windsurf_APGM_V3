'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import OutlookCalendarSetup from './OutlookCalendarSetup';
import FirestorePermissionTest from './FirestorePermissionTest';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ArtistAvailabilityManager() {
  const [availability, setAvailability] = useState<any>({});
  const { user } = useAuth();
  const [artists, setArtists] = useState<any[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<string>('');
  const [services, setServices] = useState<any[]>([]);
  const [breakTime, setBreakTime] = useState<number>(15);
  const [loading, setLoading] = useState(true);
  const [showOutlookModal, setShowOutlookModal] = useState(false);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        console.log('Fetching artists...');
        const usersCollection = collection(getDb(), 'users');
        const usersSnapshot = await getDocs(usersCollection);
        
        // Map and log each user to debug
        const usersList = usersSnapshot.docs.map(doc => {
          const userData = { id: doc.id, ...doc.data() };
          return userData;
        });
        
        console.log('All users:', usersList);
        
        // Filter artists with improved logging
        const artistsList = usersList.filter((user: any) => {
          const isArtist = user.role === 'artist';
          if (isArtist) {
            console.log('Found artist:', user);
          }
          return isArtist;
        });
        
        console.log('Artists list:', artistsList);
        
        // Extract display name more safely
        const artistsWithNames = artistsList.map((artist: any) => {
          const displayName = artist.displayName || 
                            (artist.profile?.firstName && artist.profile?.lastName ? 
                             `${artist.profile.firstName} ${artist.profile.lastName}` : '') || 
                            artist.profile?.firstName || artist.profile?.lastName || 
                            artist.name || artist.email || artist.id || 'Unknown Artist';
          
          return { ...artist, displayName };
        });
        
        setArtists(artistsWithNames);
        if (artistsWithNames.length > 0) {
          console.log('Selected first artist:', artistsWithNames[0]);
          setSelectedArtist(artistsWithNames[0].id);
        } else {
          console.log('No artists found');
        }
      } catch (error) {
        console.error('❌ Error fetching artists:', error);
        // Fallback: If admin can't list all users, just use current user if they're an artist
        if (user && user.uid) {
          console.log('Trying to use current user as fallback');
          try {
            const userDoc = await getDoc(doc(getDb(), 'users', user.uid));
            const userData = userDoc.exists() ? userDoc.data() : null;
            console.log('Current user data:', userData);
            
            if (userData && userData.role === 'artist') {
              const displayName = userData.displayName || 
                                (userData.profile?.firstName && userData.profile?.lastName ? 
                                 `${userData.profile.firstName} ${userData.profile.lastName}` : '') || 
                                userData.profile?.firstName || userData.profile?.lastName || 
                                userData.name || userData.email || 'Current User';
              
              setArtists([{ id: user.uid, displayName, ...userData }]);
              setSelectedArtist(user.uid);
              console.log('Using current user as artist');
            }
          } catch (userError) {
            console.error('❌ Error fetching current user:', userError);
          }
        }
      }
    };

    const fetchServices = async () => {
      try {
        const servicesCollection = collection(getDb(), 'services');
        const servicesSnapshot = await getDocs(servicesCollection);
        const servicesList = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServices(servicesList);
      } catch (error) {
        console.error('Error fetching services:', error);
        setServices([]);
      }
    };

    const initializeData = async () => {
      if (user) {
        await fetchArtists();
        await fetchServices();
        setLoading(false);
      }
    };
    
    initializeData();
  }, [user]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedArtist) {
        console.log('No artist selected, skipping availability fetch');
        return;
      }
      
      setLoading(true);
      console.log(`Fetching availability for artist: ${selectedArtist}`);
      
      try {
        const db = getDb();
        const docRef = doc(db, 'artist-availability', selectedArtist);
        console.log('Availability document reference:', docRef);
        
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          console.log('Found availability document:', docSnap.data());
          const data = docSnap.data();
          
          // Check if availability data exists and is valid
          if (data.availability && typeof data.availability === 'object') {
            console.log('Setting availability:', data.availability);
            setAvailability(data.availability);
          } else {
            console.log('No valid availability data found, using empty object');
            setAvailability({});
          }
          
          // Set break time if available, default to 15
          setBreakTime(data.breakTime || 15);
        } else {
          console.log('No availability document found, using empty defaults');
          setAvailability({});
          setBreakTime(15);
        }
      } catch (error) {
        console.error('❌ Error fetching availability:', error);
        // Set defaults on error
        setAvailability({});
        setBreakTime(15);
        
        // Show error alert
        alert(`Error loading availability data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAvailability();
  }, [selectedArtist]);

  const handleDayToggle = (day: string) => {
    console.log(`Toggling day: ${day}`);
    
    setAvailability((prev: any) => {
      // Create a new object to avoid reference issues
      const newAvailability = { ...prev };
      
      if (prev[day]) {
        // If day exists, remove it
        console.log(`Removing day: ${day}`);
        delete newAvailability[day];
      } else {
        // If day doesn't exist, add it with default structure
        console.log(`Adding day: ${day}`);
        newAvailability[day] = { enabled: true, slots: [] };
      }
      
      console.log('Updated availability:', newAvailability);
      return newAvailability;
    });
  };

  const handleTimeSlotChange = (day: string, index: number, field: 'start' | 'end' | 'service', value: string) => {
    setAvailability((prev: any) => {
      const newSlots = [...prev[day].slots];
      newSlots[index] = { ...newSlots[index], [field]: value };
      return { ...prev, [day]: { ...prev[day], slots: newSlots } };
    });
  };

  const addTimeSlot = (day: string) => {
    setAvailability((prev: any) => ({
      ...prev,
      [day]: { ...prev[day], slots: [...prev[day].slots, { start: '', end: '' }] }
    }));
  };

  const removeTimeSlot = (day: string, index: number) => {
    setAvailability((prev: any) => ({
      ...prev,
      [day]: { ...prev[day], slots: prev[day].slots.filter((_: any, i: number) => i !== index) }
    }));
  };

  // Check for circular references that can't be serialized to Firestore
  const isCircular = (obj: any): boolean => {
    const seenObjects = new WeakMap();
    const detect = (obj: any): boolean => {
      if (obj && typeof obj === 'object') {
        if (seenObjects.has(obj)) {
          return true;
        }
        seenObjects.set(obj, true);
        return Object.keys(obj).some(key => detect(obj[key]));
      }
      return false;
    };
    return detect(obj);
  };
  
  // Clean the availability object to ensure it's serializable
  const prepareAvailabilityData = () => {
    // Create a deep copy to avoid modifying the original state
    const cleanedAvailability: any = {};
    
    try {
      // Manually construct a clean object
      Object.keys(availability).forEach(day => {
        if (availability[day] && availability[day].enabled) {
          cleanedAvailability[day] = {
            enabled: true,
            slots: availability[day].slots.map((slot: any) => ({
              start: slot.start || '',
              end: slot.end || '',
              service: slot.service || ''
            }))
          };
        }
      });
      
      // Test if it can be serialized
      JSON.stringify(cleanedAvailability);
      return { valid: true, data: cleanedAvailability };
    } catch (e) {
      console.error('❌ Error preparing availability data:', e);
      return { valid: false, error: e };
    }
  };

  const handleSave = async () => {
    if (!selectedArtist) {
      console.error('❌ No artist selected');
      alert('Please select an artist before saving.');
      return;
    }
    
    // Check if we have valid availability data
    if (!availability || Object.keys(availability).length === 0) {
      console.warn('⚠ No availability data to save');
      // Continue anyway as this might be intentional (clearing availability)
    }
    
    // Check for potential circular references
    if (isCircular(availability)) {
      console.error('❌ Circular reference detected in availability data');
      alert('Invalid data structure detected. Please refresh the page and try again.');
      return;
    }
    
    // Prepare data for saving
    const { valid, data, error } = prepareAvailabilityData();
    if (!valid) {
      console.error('❌ Failed to prepare availability data:', error);
      alert('Failed to prepare availability data. Please try again.');
      return;
    }
    
    try {
      console.log('Saving availability for artist:', selectedArtist);
      console.log('Cleaned data to be saved:', { availability: data, breakTime });
      
      const db = getDb();
      console.log('Firestore instance:', db);
      
      const docRef = doc(db, 'artist-availability', selectedArtist);
      console.log('Document reference:', docRef);
      
      // Save the cleaned availability data
      await setDoc(docRef, { 
        availability: data, 
        breakTime,
        updatedAt: new Date() 
      });
      
      console.log('✅ Availability saved successfully!');
      alert('Availability saved successfully!');
    } catch (error) {
      console.error('❌ Error saving availability:', error);
      // More detailed error information
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      alert(`Error saving availability. Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-fluid">
      {/* Add Firestore Permission Test component for diagnostics */}
      <FirestorePermissionTest />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Artist Availability</h4>
        <div style={{width: '250px'}}>
          <select 
            className="form-select" 
            value={selectedArtist} 
            onChange={(e) => {
              console.log('Selected artist changed to:', e.target.value);
              setSelectedArtist(e.target.value);
            }}
          >
            {artists.length > 0 ? (
              artists.map(artist => (
                <option key={artist.id} value={artist.id}>
                  {artist.displayName || 'Unknown Artist'}
                </option>
              ))
            ) : (
              <option value="">No artists available</option>
            )}
          </select>
        </div>
      </div>
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Settings</h5>
          <div className="mb-3">
            <label htmlFor="breakTime" className="form-label">Break Time (minutes)</label>
            <input type="number" id="breakTime" className="form-control" style={{width: '150px'}} value={breakTime} onChange={(e) => setBreakTime(parseInt(e.target.value, 10))} />
          </div>
          <div>
            <a href="/api/auth/google" className="btn btn-outline-primary me-2">
              <i className="bi bi-google me-2"></i>
              Connect to Google Calendar
            </a>
            <button 
              type="button"
              className="btn btn-outline-secondary" 
              onClick={() => setShowOutlookModal(true)}
            >
              <i className="bi bi-microsoft me-2"></i>
              Connect to Outlook Calendar
            </button>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-body">
          {daysOfWeek.map(day => (
            <div key={day} className="mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={!!availability[day]}
                  onChange={() => handleDayToggle(day)}
                  id={`check-${day}`}
                />
                <label className="form-check-label" htmlFor={`check-${day}`}>
                  {day}
                </label>
              </div>
              {availability[day] && (
                <div className="ps-4 mt-2">
                  {availability[day].slots.map((slot: any, index: number) => (
                    <div key={index} className="d-flex align-items-center mb-2">
                      <input type="time" className="form-control me-2" style={{width: '120px'}} value={slot.start} onChange={(e) => handleTimeSlotChange(day, index, 'start', e.target.value)} />
                      <span>-</span>
                      <input type="time" className="form-control ms-2 me-2" style={{width: '120px'}} value={slot.end} onChange={(e) => handleTimeSlotChange(day, index, 'end', e.target.value)} />
                      <select className="form-select ms-2 me-2" style={{width: '150px'}} value={slot.service} onChange={(e) => handleTimeSlotChange(day, index, 'service', e.target.value)}>
                        <option value="">All Services</option>
                        {services.map(service => (
                          <option key={service.id} value={service.id}>{service.name}</option>
                        ))}
                      </select>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => removeTimeSlot(day, index)}>X</button>
                    </div>
                  ))}
                  <button className="btn btn-sm btn-outline-primary mt-2" onClick={() => addTimeSlot(day)}>+ Add Time Slot</button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="card-footer">
          <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        </div>
      </div>

      {/* Outlook Calendar Setup Modal */}
      <OutlookCalendarSetup
        isOpen={showOutlookModal}
        onClose={() => setShowOutlookModal(false)}
        artistId={selectedArtist}
        artistName={artists.find(a => a.id === selectedArtist)?.displayName || 'Selected Artist'}
      />
    </div>
  );
}
