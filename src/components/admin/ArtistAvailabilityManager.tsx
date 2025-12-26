'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import OutlookCalendarSetup from './OutlookCalendarSetup';
import FirestorePermissionTest from './FirestorePermissionTest';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAlertDialog } from '@/components/ui/alert-dialog';

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
  const { showAlert, AlertDialogComponent } = useAlertDialog();

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
        showAlert({ title: 'Error', description: `Error loading availability data: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: 'destructive' });
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
      showAlert({ title: 'Error', description: 'Please select an artist before saving.', variant: 'destructive' });
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
      showAlert({ title: 'Error', description: 'Invalid data structure detected. Please refresh the page and try again.', variant: 'destructive' });
      return;
    }
    
    // Prepare data for saving
    const { valid, data, error } = prepareAvailabilityData();
    if (!valid) {
      console.error('❌ Failed to prepare availability data:', error);
      showAlert({ title: 'Error', description: 'Failed to prepare availability data. Please try again.', variant: 'destructive' });
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
      showAlert({ title: 'Success', description: 'Availability saved successfully!', variant: 'success' });
    } catch (error) {
      console.error('❌ Error saving availability:', error);
      // More detailed error information
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      showAlert({ title: 'Error', description: `Error saving availability. Error: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FirestorePermissionTest />
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <i className="fas fa-calendar-check text-[#AD6269]"></i>Artist Availability
        </h2>
        <div className="w-64">
          <select 
            className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
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

      {/* Settings Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h5 className="font-semibold text-gray-900">Settings</h5>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="breakTime" className="block text-sm font-medium text-gray-700 mb-1">Break Time (minutes)</label>
            <Input 
              type="number" 
              id="breakTime" 
              className="w-36" 
              value={breakTime} 
              onChange={(e) => setBreakTime(parseInt(e.target.value, 10))} 
            />
          </div>
          <div className="flex gap-3">
            <a href="/api/auth/google" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <i className="fab fa-google mr-2 text-red-500"></i>
              Connect to Google Calendar
            </a>
            <Button 
              variant="outline"
              onClick={() => setShowOutlookModal(true)}
            >
              <i className="fab fa-microsoft mr-2 text-blue-500"></i>
              Connect to Outlook Calendar
            </Button>
          </div>
        </div>
      </div>

      {/* Availability Card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h5 className="font-semibold text-gray-900">Weekly Schedule</h5>
        </div>
        <div className="p-6 space-y-4">
          {daysOfWeek.map(day => (
            <div key={day} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!availability[day]}
                  onChange={() => handleDayToggle(day)}
                  className="w-5 h-5 rounded border-gray-300 text-[#AD6269] focus:ring-[#AD6269]"
                />
                <span className="font-medium text-gray-900">{day}</span>
              </label>
              {availability[day] && (
                <div className="ml-8 mt-3 space-y-2">
                  {availability[day].slots.map((slot: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 flex-wrap">
                      <Input 
                        type="time" 
                        className="w-32" 
                        value={slot.start} 
                        onChange={(e) => handleTimeSlotChange(day, index, 'start', e.target.value)} 
                      />
                      <span className="text-gray-500">-</span>
                      <Input 
                        type="time" 
                        className="w-32" 
                        value={slot.end} 
                        onChange={(e) => handleTimeSlotChange(day, index, 'end', e.target.value)} 
                      />
                      <select 
                        className="h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                        value={slot.service} 
                        onChange={(e) => handleTimeSlotChange(day, index, 'service', e.target.value)}
                      >
                        <option value="">All Services</option>
                        {services.map(service => (
                          <option key={service.id} value={service.id}>{service.name}</option>
                        ))}
                      </select>
                      <button 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => removeTimeSlot(day, index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => addTimeSlot(day)}
                    className="mt-2"
                  >
                    <i className="fas fa-plus mr-1"></i>Add Time Slot
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button className="bg-[#AD6269] hover:bg-[#9d5860]" onClick={handleSave}>
            <i className="fas fa-save mr-2"></i>Save Changes
          </Button>
        </div>
      </div>

      {/* Outlook Calendar Setup Modal */}
      <OutlookCalendarSetup
        isOpen={showOutlookModal}
        onClose={() => setShowOutlookModal(false)}
        artistId={selectedArtist}
        artistName={artists.find(a => a.id === selectedArtist)?.displayName || 'Selected Artist'}
      />
      {AlertDialogComponent}
    </div>
  );
}
