'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';
import { Loader2, Calendar, Clock, Video, CheckCircle, ArrowLeft } from 'lucide-react';

interface QuickVirtualConfig {
  enabled: boolean;
  imageUrls: string[];
  title: string;
  description: string;
  serviceName: string;
  zoomLink: string;
  duration: number;
  days: number[];
  startTime: string;
  endTime: string;
  maxWeeksAhead: number;
  calendarId: string;
}

interface TimeSlot {
  date: string;
  time: string;
  label: string;
  startTime: string;
  endTime: string;
}

interface PageData {
  enabled: boolean;
  config?: QuickVirtualConfig;
  slots?: TimeSlot[];
}

function toISODate(date: Date): string {
  return date.toLocaleDateString('en-CA');
}

function formatDisplayDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function QuickVirtualAppointmentPage() {
  const router = useRouter();
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Reset the selected time whenever a different day is chosen.
  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDate]);

  // Cycle through images every 6 seconds when more than one is configured.
  useEffect(() => {
    const imageCount = data?.config?.imageUrls?.length ?? 0;
    if (imageCount <= 1) return;
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % imageCount);
    }, 6000);
    return () => clearInterval(interval);
  }, [data?.config?.imageUrls?.length]);

  useEffect(() => {
    fetch('/api/quick-virtual-appointment')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json() as Promise<PageData>;
      })
      .then((pageData) => {
        setData(pageData);
      })
      .catch((error) => {
        console.error('Error loading quick virtual page:', error);
        toast.error('Could not load appointment options. Please refresh.');
        setData({ enabled: false });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !data?.config) return;

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.warning('Please fill out your name, email, and phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const { config } = data;
      const appointmentData = {
        name: form.name.trim(),
        firstName: '',
        lastName: '',
        email: form.email.trim(),
        phone: form.phone.trim(),
        serviceName: config.serviceName,
        title: config.serviceName,
        meetingLocationType: 'custom',
        overrideLocationConfig: true,
        address: config.zoomLink,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        appointmentDate: selectedSlot.date,
        appointmentTime: selectedSlot.time,
        appointmentEndTime: selectedSlot.time,
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

      // Trigger the Pretty Girl Preview workflow when applicable.
      if (/pretty\s+girl\s+preview/i.test(config.serviceName)) {
        try {
          await fetch('/api/bookings/ghl-pretty-girl-webhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              booking: {
                ...appointmentData,
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

  const slots = data?.slots || [];

  const today = useMemo(() => new Date(), []);
  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  }, [today]);

  const availableDateSet = useMemo(() => new Set(slots.map((slot) => slot.date)), [slots]);

  const slotsByDate = useMemo(() => {
    const map = new Map<string, TimeSlot[]>();
    slots.forEach((slot) => {
      const list = map.get(slot.date) || [];
      list.push(slot);
      map.set(slot.date, list);
    });
    return map;
  }, [slots]);

  const selectedDaySlots = selectedDate ? slotsByDate.get(selectedDate) || [] : [];

  const calendarMonth = useMemo(() => {
    return calendarDays[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [calendarDays]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="pt-16 min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="h-8 w-8 animate-spin text-[#AD6269]" />
        </main>
        <Footer />
      </>
    );
  }

  if (!data || !data.enabled || !data.config) {
    return (
      <>
        <Header />
        <main className="pt-16 min-h-screen flex items-center justify-center bg-gray-50 px-4">
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
        </main>
        <Footer />
      </>
    );
  }

  if (confirmed) {
    return (
      <>
        <Header />
        <main className="pt-16 min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="max-w-md w-full text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                Appointment Confirmed
              </CardTitle>
              <CardDescription>{selectedSlot?.label}</CardDescription>
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
        </main>
        <Footer />
      </>
    );
  }

  const config = data.config;

  return (
    <>
      <Header />
      <main className="pt-16 min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left: Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg min-h-[400px] lg:min-h-full bg-gray-200">
              {config.imageUrls.map((url, index) => (
                <Image
                  key={url}
                  src={url}
                  alt={
                    index === 0
                      ? 'A Pretty Girl Matter studio'
                      : 'Woman on a web conference call'
                  }
                  fill
                  className={`object-cover transition-opacity duration-1000 ease-in-out ${
                    index === activeImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                  priority={index === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute top-4 right-4 bg-[#2D8CFF] text-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                <Video className="h-4 w-4" />
                <span className="text-sm font-semibold">Zoom</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="h-5 w-5" />
                  <span className="font-medium">Virtual Consultation</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  <Link
                    href="/services/the-pretty-girl-preview-virtual-consultation"
                    className="hover:underline"
                  >
                    {config.title}
                  </Link>
                </h1>
                <p className="!text-white max-w-md">{config.description}</p>
              </div>
            </div>

          {/* Right: Calendar / Form */}
          <Card className="shadow-lg border-0 min-h-[480px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#AD6269]" />
                {!selectedDate
                  ? 'Select a Date'
                  : !selectedSlot
                  ? 'Select a Time'
                  : 'Confirm Appointment'}
              </CardTitle>
              <CardDescription>
                {!selectedDate
                  ? `Choose a day for your ${config.duration}-minute virtual consultation. Available days are highlighted.`
                  : !selectedSlot
                  ? `${formatDisplayDate(selectedDate)} — choose a ${config.duration}-minute slot.`
                  : 'Enter your details to book the virtual appointment.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {slots.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No upcoming slots are available. Please check back soon.
                </p>
              ) : !selectedDate ? (
                <div className="space-y-4">
                  <div className="text-center font-semibold text-gray-900">{calendarMonth}</div>
                  <div className="grid grid-cols-7 gap-2 text-center text-sm text-gray-500">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day}>{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: calendarDays[0].getDay() }).map((_, i) => (
                      <div key={`pad-${i}`} className="h-10 w-10 mx-auto" />
                    ))}
                    {calendarDays.map((day) => {
                      const dateStr = toISODate(day);
                      const hasSlots = availableDateSet.has(dateStr);
                      const isSelected = selectedDate === dateStr;
                      const isToday = toISODate(new Date()) === dateStr;
                      return (
                        <button
                          key={dateStr}
                          type="button"
                          disabled={!hasSlots}
                          onClick={() => setSelectedDate(dateStr)}
                          className={cn(
                            'h-10 w-10 rounded-full text-sm font-medium transition-colors mx-auto',
                            isSelected
                              ? 'bg-[#AD6269] text-white'
                              : hasSlots
                              ? 'bg-gray-100 text-gray-900 hover:bg-[#AD6269]/10 hover:text-[#AD6269]'
                              : 'bg-transparent text-gray-300 cursor-not-allowed',
                            isToday && !isSelected && 'ring-2 ring-[#AD6269] ring-offset-1'
                          )}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Only available days are clickable.
                  </p>
                </div>
              ) : !selectedSlot ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      {formatDisplayDate(selectedDate)}
                    </h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedDate(null);
                        setSelectedSlot(null);
                      }}
                      className="text-gray-500"
                    >
                      Change date
                    </Button>
                  </div>
                  {selectedDaySlots.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      No times available for this day.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedDaySlots.map((slot) => (
                        <button
                          key={`${slot.date}T${slot.time}`}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className="px-4 py-3 rounded-lg border border-gray-200 bg-white text-center hover:border-[#AD6269] hover:bg-[#AD6269]/5 transition-colors"
                        >
                          <div className="flex items-center justify-center gap-1 text-sm font-semibold text-[#AD6269]">
                            <Clock className="h-3.5 w-3.5" />
                            {slot.label.split(' at ')[1]}
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
                      <p className="font-semibold text-gray-900">{selectedSlot.label.split(' at ')[0]}</p>
                      <p className="text-sm text-[#AD6269]">{selectedSlot.label.split(' at ')[1]}</p>
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
      </main>
      <Footer />
    </>
  );
}
