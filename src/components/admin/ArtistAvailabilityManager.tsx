'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { getDb } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import OutlookCalendarSetup from './OutlookCalendarSetup';
import FirestorePermissionTest from './FirestorePermissionTest';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAlertDialog } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, Sun, CloudSun, Moon, Save, User, Plus, Trash2, CalendarDays, X, ChevronLeft, ChevronRight } from 'lucide-react';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Standard time slots that match the booking page
const TIME_SLOTS = [
  { id: 'morning', label: 'Morning', startTime: '10:00', endTime: '13:00', icon: 'fa-sun' },
  { id: 'afternoon', label: 'Afternoon', startTime: '13:00', endTime: '16:00', icon: 'fa-cloud-sun' },
  { id: 'evening', label: 'Evening', startTime: '16:00', endTime: '19:00', icon: 'fa-moon' },
];

// Interface for date-specific overrides
interface DateSpecificHours {
  date: string; // YYYY-MM-DD format
  type: 'available' | 'blocked'; // Whether this date is available or blocked
  timeSlots: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
  note?: string; // Optional note for the override
}

export default function ArtistAvailabilityManager() {
  const [availability, setAvailability] = useState<any>({});
  const { user } = useAuth();
  const [artists, setArtists] = useState<any[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<string>('');
  const [services, setServices] = useState<any[]>([]);
  const [breakTime, setBreakTime] = useState<number>(15);
  const [loading, setLoading] = useState(true);
  const [showOutlookModal, setShowOutlookModal] = useState(false);
  const { showAlert, showConfirm, AlertDialogComponent } = useAlertDialog();
  
  // Date Specific Hours state
  const [dateSpecificHours, setDateSpecificHours] = useState<DateSpecificHours[]>([]);
  const [showDateModal, setShowDateModal] = useState(false);
  const [editingDateOverride, setEditingDateOverride] = useState<DateSpecificHours | null>(null);
  const [selectedDateForModal, setSelectedDateForModal] = useState<string>(new Date().toISOString().split('T')[0]);
  const [modalOverrideType, setModalOverrideType] = useState<'available' | 'blocked'>('available');
  const [modalTimeSlots, setModalTimeSlots] = useState({ morning: true, afternoon: true, evening: true });
  const [modalNote, setModalNote] = useState('');
  const [currentModalMonth, setCurrentModalMonth] = useState(new Date());

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
        
        // Filter artists with improved logging - include admins who can also be artists
        const artistsList = usersList.filter((user: any) => {
          // Include users with role 'artist' OR 'admin' (admins can manage their own availability)
          const isArtist = user.role === 'artist' || user.role === 'admin';
          if (isArtist) {
            console.log('Found artist/admin:', user);
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
            
            if (userData && (userData.role === 'artist' || userData.role === 'admin')) {
              const displayName = userData.displayName || 
                                (userData.profile?.firstName && userData.profile?.lastName ? 
                                 `${userData.profile.firstName} ${userData.profile.lastName}` : '') || 
                                userData.profile?.firstName || userData.profile?.lastName || 
                                userData.name || userData.email || 'Current User';
              
              setArtists([{ id: user.uid, displayName, ...userData }]);
              setSelectedArtist(user.uid);
              console.log('Using current user as artist/admin');
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
          
          // Load date-specific hours if available
          if (data.dateSpecificHours && Array.isArray(data.dateSpecificHours)) {
            console.log('Loading date-specific hours:', data.dateSpecificHours);
            setDateSpecificHours(data.dateSpecificHours);
          } else {
            setDateSpecificHours([]);
          }
        } else {
          console.log('No availability document found, using empty defaults');
          setAvailability({});
          setBreakTime(15);
          setDateSpecificHours([]);
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

  // Auto-save functionality - save whenever availability changes
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const autoSave = useCallback(async (dataToSave: any) => {
    if (!selectedArtist) return;
    
    try {
      console.log('🔄 Auto-saving availability...', dataToSave);
      const db = getDb();
      const docRef = doc(db, 'artist-availability', selectedArtist);
      
      // Prepare clean data
      const cleanedAvailability: any = {};
      Object.keys(dataToSave).forEach(day => {
        if (dataToSave[day]) {
          cleanedAvailability[day] = {
            enabled: true,
            slots: (dataToSave[day].slots || []).map((slot: any) => ({
              start: slot.start || '',
              end: slot.end || '',
              service: slot.service || ''
            })),
            timeSlots: dataToSave[day].timeSlots || { morning: true, afternoon: true, evening: true }
          };
        }
      });
      
      // Save to Firestore
      await setDoc(docRef, { 
        availability: cleanedAvailability, 
        breakTime,
        dateSpecificHours,
        updatedAt: new Date() 
      });
      
      console.log('✅ Auto-saved to Firestore! Days saved:', Object.keys(cleanedAvailability));
      
      // Note: GHL calendar sync is handled separately - the booking page reads
      // availability from Firestore and checks GHL for booked appointments
      
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    }
  }, [selectedArtist, breakTime]);

  // Track if data has been loaded from Firestore
  const dataLoadedRef = useRef(false);
  
  // Debounced auto-save when availability changes
  useEffect(() => {
    // Skip until data has been loaded from Firestore
    if (!dataLoadedRef.current) {
      return;
    }
    
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set a new timeout to save after 500ms of no changes
    saveTimeoutRef.current = setTimeout(() => {
      autoSave(availability);
    }, 500);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [availability, autoSave]);
  
  // Mark data as loaded after initial fetch completes
  useEffect(() => {
    if (!loading && selectedArtist) {
      // Small delay to ensure state is settled
      const timer = setTimeout(() => {
        dataLoadedRef.current = true;
        console.log('📋 Data loaded, auto-save enabled');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, selectedArtist]);

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
        // If day doesn't exist, add it with default structure (all slots enabled by default)
        console.log(`Adding day: ${day}`);
        newAvailability[day] = { 
          enabled: true, 
          slots: [],
          timeSlots: { morning: true, afternoon: true, evening: true }
        };
      }
      
      console.log('Updated availability:', newAvailability);
      return newAvailability;
    });
  };

  const handleTimeSlotToggle = (day: string, slotId: string) => {
    setAvailability((prev: any) => {
      const dayData = prev[day] || { enabled: true, slots: [], timeSlots: { morning: true, afternoon: true, evening: true } };
      const currentTimeSlots = dayData.timeSlots || { morning: true, afternoon: true, evening: true };
      
      return {
        ...prev,
        [day]: {
          ...dayData,
          timeSlots: {
            ...currentTimeSlots,
            [slotId]: !currentTimeSlots[slotId]
          }
        }
      };
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
      console.log('📋 Preparing availability data. Current state:', availability);
      console.log('📋 Days in state:', Object.keys(availability));
      
      // Manually construct a clean object
      Object.keys(availability).forEach(day => {
        console.log(`📋 Processing day: ${day}, data:`, availability[day]);
        
        // Save the day if it exists in the state (checkbox is checked)
        if (availability[day]) {
          cleanedAvailability[day] = {
            enabled: true,
            slots: (availability[day].slots || []).map((slot: any) => ({
              start: slot.start || '',
              end: slot.end || '',
              service: slot.service || ''
            })),
            timeSlots: availability[day].timeSlots || { morning: true, afternoon: true, evening: true }
          };
          console.log(`✅ Added ${day} to save data:`, cleanedAvailability[day]);
        }
      });
      
      console.log('📋 Final data to save:', cleanedAvailability);
      
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
        dateSpecificHours,
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
      
      {/* Header with Artist Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#AD6269]/10 rounded-lg">
            <Calendar className="h-6 w-6 text-[#AD6269]" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Artist Availability</h2>
            <p className="text-sm text-gray-500">Manage weekly schedule and time slots</p>
          </div>
        </div>
        <div className="w-full sm:w-72">
          <Select value={selectedArtist} onValueChange={(value) => {
            console.log('Selected artist changed to:', value);
            setSelectedArtist(value);
          }}>
            <SelectTrigger className="w-full bg-white border-gray-200 focus:ring-[#AD6269] focus:ring-offset-0">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <SelectValue placeholder="Select an artist" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-white">
              {artists.length > 0 ? (
                artists.map(artist => (
                  <SelectItem key={artist.id} value={artist.id} className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span>{artist.displayName || 'Unknown Artist'}</span>
                      {artist.role === 'admin' && (
                        <span className="text-xs bg-[#AD6269]/10 text-[#AD6269] px-2 py-0.5 rounded-full">Admin</span>
                      )}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>No artists available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Settings Card */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#AD6269]" />
            Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="breakTime" className="text-sm font-medium text-gray-700">Break Time (minutes)</Label>
            <Input 
              type="number" 
              id="breakTime" 
              className="w-36 border-gray-200 focus:ring-[#AD6269] focus:border-[#AD6269]" 
              value={breakTime} 
              onChange={(e) => setBreakTime(parseInt(e.target.value, 10))} 
            />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="outline" asChild className="border-gray-200 hover:bg-gray-50">
              <a href="/api/auth/google">
                <i className="fab fa-google mr-2 text-red-500"></i>
                Connect to Google Calendar
              </a>
            </Button>
            <Button 
              variant="outline"
              className="border-gray-200 hover:bg-gray-50"
              onClick={() => setShowOutlookModal(true)}
            >
              <i className="fab fa-microsoft mr-2 text-blue-500"></i>
              Connect to Outlook Calendar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule Card */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#AD6269]" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {daysOfWeek.map(day => (
            <div key={day} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`day-${day}`}
                  checked={!!availability[day]}
                  onCheckedChange={() => handleDayToggle(day)}
                  className="h-5 w-5 border-gray-300 data-[state=checked]:bg-[#AD6269] data-[state=checked]:border-[#AD6269]"
                />
                <Label htmlFor={`day-${day}`} className="font-medium text-gray-900 cursor-pointer">
                  {day}
                </Label>
              </div>
              {availability[day] && (
                <div className="ml-8 mt-3">
                  <div className="flex flex-wrap gap-3">
                    {TIME_SLOTS.map((slot) => {
                      const isEnabled = availability[day]?.timeSlots?.[slot.id] ?? true;
                      const SlotIcon = slot.id === 'morning' ? Sun : slot.id === 'afternoon' ? CloudSun : Moon;
                      return (
                        <label
                          key={slot.id}
                          className={`
                            flex items-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all
                            ${isEnabled 
                              ? 'border-[#AD6269] bg-[#AD6269]/10 text-[#AD6269]' 
                              : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                            }
                          `}
                        >
                          <Checkbox
                            checked={isEnabled}
                            onCheckedChange={() => handleTimeSlotToggle(day, slot.id)}
                            className="h-4 w-4 border-gray-300 data-[state=checked]:bg-[#AD6269] data-[state=checked]:border-[#AD6269]"
                          />
                          <SlotIcon className={`h-4 w-4 ${isEnabled ? 'text-[#AD6269]' : 'text-gray-400'}`} />
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{slot.label}</span>
                            <span className="text-xs opacity-75">
                              {slot.startTime.replace(':00', '')}:00 - {slot.endTime.replace(':00', '')}:00
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <Button className="bg-[#AD6269] hover:bg-[#9d5860]" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </Card>

      {/* Date Specific Hours Card */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
          <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#AD6269]" />
            Date Specific Hours
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Override weekly hours by marking availability/unavailability for specific dates.
          </p>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* List of existing date overrides */}
          {dateSpecificHours.length > 0 ? (
            <div className="space-y-3">
              {dateSpecificHours
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((override, index) => {
                  const dateObj = new Date(override.date + 'T12:00:00');
                  const formattedDate = dateObj.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  });
                  const isPast = new Date(override.date) < new Date(new Date().toISOString().split('T')[0]);
                  
                  return (
                    <div 
                      key={override.date} 
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isPast ? 'bg-gray-50 border-gray-200 opacity-60' : 
                        override.type === 'blocked' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          override.type === 'blocked' ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                          <CalendarDays className={`h-5 w-5 ${
                            override.type === 'blocked' ? 'text-red-600' : 'text-green-600'
                          }`} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{formattedDate}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              override.type === 'blocked' 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {override.type === 'blocked' ? 'Blocked' : 'Available'}
                            </span>
                            <span>
                              {[
                                override.timeSlots.morning && 'Morning',
                                override.timeSlots.afternoon && 'Afternoon',
                                override.timeSlots.evening && 'Evening'
                              ].filter(Boolean).join(', ') || 'No slots'}
                            </span>
                          </div>
                          {override.note && (
                            <div className="text-xs text-gray-400 mt-1">{override.note}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingDateOverride(override);
                            setSelectedDateForModal(override.date);
                            setModalOverrideType(override.type);
                            setModalTimeSlots(override.timeSlots);
                            setModalNote(override.note || '');
                            setCurrentModalMonth(new Date(override.date + 'T12:00:00'));
                            setShowDateModal(true);
                          }}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            const confirmed = await showConfirm({
                              title: 'Delete Override',
                              description: `Are you sure you want to delete the override for ${formattedDate}?`,
                              confirmText: 'Delete',
                              variant: 'destructive'
                            });
                            if (confirmed) {
                              setDateSpecificHours(prev => prev.filter(o => o.date !== override.date));
                            }
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CalendarDays className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No date-specific overrides configured.</p>
              <p className="text-sm">Add overrides for holidays, special events, or schedule changes.</p>
            </div>
          )}
          
          <Button
            onClick={() => {
              setEditingDateOverride(null);
              setSelectedDateForModal(new Date().toISOString().split('T')[0]);
              setModalOverrideType('available');
              setModalTimeSlots({ morning: true, afternoon: true, evening: true });
              setModalNote('');
              setCurrentModalMonth(new Date());
              setShowDateModal(true);
            }}
            className="bg-[#AD6269] hover:bg-[#9d5860]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Date Specific Hours
          </Button>
        </CardContent>
      </Card>

      {/* Date Specific Hours Modal */}
      {showDateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingDateOverride ? 'Edit Date Override' : 'Choose the date to set specific hours'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Mini Calendar */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentModalMonth(prev => {
                      const newDate = new Date(prev);
                      newDate.setMonth(newDate.getMonth() - 1);
                      return newDate;
                    })}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium">
                    {currentModalMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentModalMonth(prev => {
                      const newDate = new Date(prev);
                      newDate.setMonth(newDate.getMonth() + 1);
                      return newDate;
                    })}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="py-2 text-gray-500 font-medium">{day}</div>
                  ))}
                  {(() => {
                    const year = currentModalMonth.getFullYear();
                    const month = currentModalMonth.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const today = new Date().toISOString().split('T')[0];
                    
                    const days = [];
                    // Empty cells for days before the first of the month
                    for (let i = 0; i < firstDay; i++) {
                      days.push(<div key={`empty-${i}`} className="py-2"></div>);
                    }
                    // Days of the month
                    for (let day = 1; day <= daysInMonth; day++) {
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isSelected = dateStr === selectedDateForModal;
                      const isToday = dateStr === today;
                      const hasOverride = dateSpecificHours.some(o => o.date === dateStr && o.date !== editingDateOverride?.date);
                      
                      days.push(
                        <button
                          key={day}
                          onClick={() => setSelectedDateForModal(dateStr)}
                          className={`py-2 rounded-full transition-all ${
                            isSelected 
                              ? 'bg-[#AD6269] text-white' 
                              : isToday
                              ? 'bg-blue-100 text-blue-700'
                              : hasOverride
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    }
                    return days;
                  })()}
                </div>
              </div>
              
              {/* Override Type */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Override Type</Label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setModalOverrideType('available')}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      modalOverrideType === 'available'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">Available</div>
                    <div className="text-xs opacity-75">Open for bookings</div>
                  </button>
                  <button
                    onClick={() => setModalOverrideType('blocked')}
                    className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                      modalOverrideType === 'blocked'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">Blocked</div>
                    <div className="text-xs opacity-75">No bookings allowed</div>
                  </button>
                </div>
              </div>
              
              {/* Time Slots */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Time Slots</Label>
                <div className="flex flex-wrap gap-3">
                  {TIME_SLOTS.map((slot) => {
                    const isEnabled = modalTimeSlots[slot.id as keyof typeof modalTimeSlots];
                    const SlotIcon = slot.id === 'morning' ? Sun : slot.id === 'afternoon' ? CloudSun : Moon;
                    return (
                      <label
                        key={slot.id}
                        className={`
                          flex items-center gap-2 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all
                          ${isEnabled 
                            ? 'border-[#AD6269] bg-[#AD6269]/10 text-[#AD6269]' 
                            : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'
                          }
                        `}
                      >
                        <Checkbox
                          checked={isEnabled}
                          onCheckedChange={(checked) => {
                            setModalTimeSlots(prev => ({
                              ...prev,
                              [slot.id]: !!checked
                            }));
                          }}
                          className="h-4 w-4 border-gray-300 data-[state=checked]:bg-[#AD6269] data-[state=checked]:border-[#AD6269]"
                        />
                        <SlotIcon className={`h-4 w-4 ${isEnabled ? 'text-[#AD6269]' : 'text-gray-400'}`} />
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{slot.label}</span>
                          <span className="text-xs opacity-75">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
              
              {/* Note */}
              <div className="space-y-2">
                <Label htmlFor="override-note" className="text-sm font-medium text-gray-700">Note (optional)</Label>
                <Input
                  id="override-note"
                  placeholder="e.g., Holiday, Special event, Personal day"
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  className="border-gray-200 focus:ring-[#AD6269] focus:border-[#AD6269]"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={() => setShowDateModal(false)}
                className="border-gray-200"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const newOverride: DateSpecificHours = {
                    date: selectedDateForModal,
                    type: modalOverrideType,
                    timeSlots: modalTimeSlots,
                    note: modalNote || undefined
                  };
                  
                  setDateSpecificHours(prev => {
                    // Remove existing override for this date if editing
                    const filtered = prev.filter(o => o.date !== selectedDateForModal);
                    return [...filtered, newOverride];
                  });
                  
                  setShowDateModal(false);
                  showAlert({ 
                    title: 'Success', 
                    description: `Date override ${editingDateOverride ? 'updated' : 'added'} successfully!`, 
                    variant: 'success' 
                  });
                }}
                className="bg-[#AD6269] hover:bg-[#9d5860]"
              >
                {editingDateOverride ? 'Update' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      )}

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
