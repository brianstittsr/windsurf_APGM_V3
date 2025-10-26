'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import OutlookCalendarSetup from './OutlookCalendarSetup';

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
        const usersCollection = collection(getDb(), 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const artistsList = usersSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((user: any) => user.role === 'artist');
        setArtists(artistsList);
        if (artistsList.length > 0) {
          setSelectedArtist(artistsList[0].id);
        }
      } catch (error) {
        console.error('Error fetching artists:', error);
        // Fallback: If admin can't list all users, just use current user if they're an artist
        if (user && user.uid) {
          const userDoc = await getDoc(doc(getDb(), 'users', user.uid));
          if (userDoc.exists() && userDoc.data()?.role === 'artist') {
            setArtists([{ id: user.uid, displayName: userDoc.data()?.displayName || 'Current User' }]);
            setSelectedArtist(user.uid);
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
      if (selectedArtist) {
        setLoading(true);
        const docRef = doc(getDb(), 'artist-availability', selectedArtist);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAvailability(data.availability || {});
          setBreakTime(data.breakTime || 15);
        } else {
          setAvailability({});
        }
        setLoading(false);
      }
    };
    fetchAvailability();
  }, [selectedArtist]);

  const handleDayToggle = (day: string) => {
    setAvailability((prev: any) => ({
      ...prev,
      [day]: prev[day] ? undefined : { enabled: true, slots: [] }
    }));
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

  const handleSave = async () => {
    if (selectedArtist) {
      try {
        await setDoc(doc(getDb(), 'artist-availability', selectedArtist), { availability, breakTime });
        alert('Availability saved successfully!');
      } catch (error) {
        console.error('Error saving availability:', error);
        alert('Error saving availability. Please try again.');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Artist Availability</h4>
        <div style={{width: '250px'}}>
          <select className="form-select" value={selectedArtist} onChange={(e) => setSelectedArtist(e.target.value)}>
            {artists.map(artist => (
              <option key={artist.id} value={artist.id}>{artist.displayName}</option>
            ))}
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
