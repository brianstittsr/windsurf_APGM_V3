'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Calendar, Clock, Video, CheckCircle, ArrowLeft } from 'lucide-react';

interface QuickVirtualConfig {
  enabled: boolean;
  imageUrl: string;
  title: string;
  description: string;
  serviceName: string;
  duration: number;
  days: number[];
  startTime: string;
  endTime: string;
  maxWeeksAhead: number;
  calendarId: string;
}

const defaultConfig: QuickVirtualConfig = {
  enabled: true,
  imageUrl: '/images/hero/victoria-escobar-hero-main.jpg',
  title: 'Quick Virtual Consultation',
  description: 'Book a 30-minute virtual appointment with Victoria.',
  serviceName: 'The Pretty Girl Preview * Virtual Consultation',
  duration: 30,
  days: [2, 4],
  startTime: '16:30',
  endTime: '18:00',
  maxWeeksAhead: 4,
  calendarId: '',
};

interface TimeSlot {
  date: string;
  time: string;
  label: string;
  startDateTime: Date;
  endDateTime: Date;
}

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [h, m] = timeStr.split(':').map(Number);
  return { hours: h, minutes: m };
}

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

function formatDate(dateStr: string): string {
  const [y, mo, d] = dateStr.split('-').map(Number);
  const date = new Date(y, mo - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function QuickVirtualAppointmentPage() {
  const router = useRouter();
  const [config, setConfig] = useState<QuickVirtualConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookedSlots, setBookedSlots] = useState<Set<string>>(new Set());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Load config and existing bookings
  useEffect(() => {
    const load = async () => {
      try {
        const db = getDb();
        const configSnap = await getDoc(doc(db, 'quickVirtualAppointment/config'));
        const cfg = configSnap.exists()
          ? { ...defaultConfig, ...(configSnap.data() as QuickVirtualConfig) }
          : defaultConfig;
        setConfig(cfg);

        // Fetch existing bookings for this service to block already-booked slots
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('serviceName', '==', cfg.serviceName)
        );
        const bookingsSnap = await getDocs(bookingsQuery);
        const taken = new Set<string>();
        bookingsSnap.docs.forEach((d) => {
          const data = d.data();
          if (data.date && data.time) {
            taken.add(`${data.date}T${data.time}`);
          }
        });
        setBookedSlots(taken);
      } catch (error) {
        console.error('Error loading quick virtual page:', error);
        toast.error('Could not load appointment options. Please refresh.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const slots = useMemo<TimeSlot[]>(() => {
    if (!config) return [];
    const { days, startTime, endTime, duration, maxWeeksAhead } = config;
    const result: TimeSlot[] = [];
    const today = new Date();
    const start = parseTime(startTime);
    const end = parseTime(endTime);

    for (let w = 0; w < maxWeeksAhead; w++) {
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + w * 7 + i);
        const dayOfWeek = date.getDay();
        if (!days.includes(dayOfWeek)) continue;

        const [y, mo, d] = [date.getFullYear(), date.getMonth() + 1, date.getDate()];
        const dateStr = `${y}-${mo.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;

        const current = new Date(y, mo - 1, d, start.hours, start.minutes);
        const limit = new Date(y, mo - 1, d, end.hours, end.minutes);

        while (current < limit) {
          const next = new Date(current.getTime() + duration * 60000);
          if (next > limit) break;

          const h = current.getHours().toString().padStart(2, '0');
          const m = current.getMinutes().toString().padStart(2, '0');
          const timeStr = `${h}:${m}`;

          // Skip slots in the past
          if (current <= new Date()) {
            current.setMinutes(current.getMinutes() + duration);
            continue;
          }

          // Skip already-booked slots
          if (!bookedSlots.has(`${dateStr}T${timeStr}`)) {
            result.push({
              date: dateStr,
              time: timeStr,
              label: `${formatDate(dateStr)} at ${formatTime(timeStr)}`,
              startDateTime: new Date(current),
              endDateTime: new Date(next),
            });
          }

          current.setMinutes(current.getMinutes() + duration);
        }
      }
    }
    return result;
  }, [config, bookedSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !config) return;

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.warning('Please fill out your name, email, and phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const startTime = selectedSlot.startDateTime.toISOString();
      const endTime = selectedSlot.endDateTime.toISOString();
      const dateStr = selectedSlot.date;
      const timeStr = selectedSlot.time;

      const appointmentData = {
        name: form.name.trim(),
        firstName: '',
        lastName: '',
        email: form.email.trim(),
        phone: form.phone.trim(),
        serviceName: config.serviceName,
        title: config.serviceName,
        startTime,
        endTime,
        appointmentDate: dateStr,
        appointmentTime: timeStr,
        appointmentEndTime: timeStr,
        duration: config.duration,
        calendarId: config.calendarId || undefined,
        price: 0,
        depositPaid: false,
        notes: 'Booked via Quick Virtual Appointment page',
        status: 'confirmed',
      };

      const ghlResponse = await fetch('/api/appointments/create-ghl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      const ghlResult = await ghlResponse.json();

      if (!ghlResponse.ok) {
        throw new Error(ghlResult.message || 'Failed to create appointment');
      }

      // Trigger the Pretty Girl Preview workflow if this is that service
      if (/pretty\s+girl\s+preview/i.test(config.serviceName)) {
        try {
          await fetch('/api/bookings/ghl-pretty-girl-webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              booking: {
                ...appointmentData,
                startTime,
                endTime,
                contactId: ghlResult.contactId,
              },
              result: {
                appointmentId: ghlResult.appointmentId,
                contactId: ghlResult.contactId,
              },
            }),
          });
        } catch (webhookError) {
          console.error('Pretty Girl Preview webhook failed:', webhookError);
        }
      }

      setConfirmed(true);
      toast.success('Your virtual appointment has been scheduled.');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error instanceof Error ? error.message : 'Could not book your appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#AD6269]" />
      </div>
    );
  }

  if (!config || !config.enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>Not Available</CardTitle>
            <CardDescription>Quick virtual appointments are currently disabled.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} variant="outline" className="mt-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Appointment Confirmed
            </CardTitle>
            <CardDescription>
              {selectedSlot?.label}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              You will receive a confirmation email with the virtual consultation details.
            </p>
            <Button onClick={() => router.push('/')} className="bg-[#AD6269] hover:bg-[#8B4A52] text-white">
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left: Image */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg min-h-[400px] lg:min-h-full bg-gray-200">
            <Image
              src={config.imageUrl}
              alt="A Pretty Girl Matter studio"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Video className="h-5 w-5" />
                <span className="font-medium">Virtual Consultation</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{config.title}</h1>
              <p className="text-white/90 max-w-md">{config.description}</p>
            </div>
          </div>

          {/* Right: Calendar / Form */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#AD6269]" />
                Select a Time
              </CardTitle>
              <CardDescription>
                Choose a {config.duration}-minute virtual appointment slot.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedSlot ? (
                <div className="space-y-4">
                  {slots.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No upcoming slots are available. Please check back soon.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                      {slots.map((slot) => (
                        <button
                          key={`${slot.date}T${slot.time}`}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className="text-left px-4 py-3 rounded-lg border border-gray-200 bg-white hover:border-[#AD6269] hover:bg-[#AD6269]/5 transition-colors"
                        >
                          <div className="font-semibold text-gray-900">{formatDate(slot.date)}</div>
                          <div className="flex items-center gap-1 text-sm text-[#AD6269]">
                            <Clock className="h-3.5 w-3.5" />
                            {formatTime(slot.time)}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="bg-[#AD6269]/10 rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{formatDate(selectedSlot.date)}</p>
                      <p className="text-sm text-[#AD6269]">{formatTime(selectedSlot.time)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedSlot(null)}
                      className="text-gray-500"
                    >
                      Change
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jane@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="(919) 555-1234"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#AD6269] hover:bg-[#8B4A52] text-white"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Video className="h-4 w-4 mr-2" />
                    )}
                    {submitting ? 'Booking...' : 'Book Virtual Appointment'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
