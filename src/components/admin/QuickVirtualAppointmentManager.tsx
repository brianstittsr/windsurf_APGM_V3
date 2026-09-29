'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Save, Video } from 'lucide-react';

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

const defaultConfig: QuickVirtualConfig = {
  enabled: true,
  imageUrls: [
    '/images/hero/victoria-escobar-hero-main.jpg',
    'https://images.pexels.com/photos/9301861/pexels-photo-9301861.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/4031707/pexels-photo-4031707.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/34225007/pexels-photo-34225007.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/36766896/pexels-photo-36766896.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/7921261/pexels-photo-7921261.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    'https://images.pexels.com/photos/7971645/pexels-photo-7971645.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  ],
  title: 'Quick Virtual Consultation',
  description: 'Book a 30-minute virtual appointment with Victoria.',
  serviceName: 'The Pretty Girl Preview * Virtual Consultation',
  zoomLink: 'https://us05web.zoom.us/j/2989268538?pwd=Q4wtUTamIablNDnZzDiX6a4sWQqNcB.1#success',
  duration: 30,
  days: [2, 4], // Tuesday (2), Thursday (4)
  startTime: '16:30',
  endTime: '18:00',
  maxWeeksAhead: 4,
  calendarId: '',
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DOC_PATH = 'quickVirtualAppointment/config';

export default function QuickVirtualAppointmentManager() {
  const [config, setConfig] = useState<QuickVirtualConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadConfig = useCallback(async () => {
    try {
      const db = getDb();
      const snap = await getDoc(doc(db, DOC_PATH));
      if (snap.exists()) {
        const data = snap.data() as QuickVirtualConfig;
        setConfig({ ...defaultConfig, ...data });
      }
    } catch (error) {
      console.error('Error loading quick virtual config:', error);
      toast.error('Could not load configuration.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const updateField = <K extends keyof QuickVirtualConfig>(
    field: K,
    value: QuickVirtualConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDay = (day: number) => {
    setConfig((prev) => {
      const next = prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day].sort((a, b) => a - b);
      return { ...prev, days: next };
    });
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const db = getDb();
      await setDoc(doc(db, DOC_PATH), {
        ...config,
        updatedAt: Timestamp.now(),
      });
      toast.success('Quick Virtual Appointment settings updated.');
    } catch (error) {
      console.error('Error saving quick virtual config:', error);
      toast.error('Could not save configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#AD6269]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Video className="h-6 w-6 text-[#AD6269]" />
            Quick Virtual Appointment
          </h2>
          <p className="text-gray-500 mt-1">
            Control the public page that lets clients book a short virtual consultation.
          </p>
        </div>
        <Button
          onClick={saveConfig}
          disabled={saving}
          className="bg-[#AD6269] hover:bg-[#8B4A52] text-white"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Enable the page and set its headline copy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Enabled</Label>
              <Switch
                id="enabled"
                checked={config.enabled}
                onCheckedChange={(checked) => updateField('enabled', checked)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={config.title}
                onChange={(e) => updateField('title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={config.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zoomLink">Zoom / Meeting Link</Label>
              <Input
                id="zoomLink"
                value={config.zoomLink}
                onChange={(e) => updateField('zoomLink', e.target.value)}
                placeholder="https://zoom.us/j/..."
              />
              <p className="text-xs text-gray-500">Sent to the client as the meeting location.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrls">Image URLs</Label>
              <textarea
                id="imageUrls"
                rows={5}
                value={config.imageUrls.join('\n')}
                onChange={(e) =>
                  updateField(
                    'imageUrls',
                    e.target.value.split('\n').map((url) => url.trim()).filter(Boolean)
                  )
                }
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="/images/hero/..."
              />
              <p className="text-xs text-gray-500">
                Enter one image URL per line. The first image displays first; the rest rotate on a 6-second fade.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Defaults</CardTitle>
            <CardDescription>Service, duration, and calendar used when a slot is booked.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serviceName">Service Name</Label>
              <Input
                id="serviceName"
                value={config.serviceName}
                onChange={(e) => updateField('serviceName', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={5}
                  value={config.duration}
                  onChange={(e) => updateField('duration', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxWeeksAhead">Weeks Ahead</Label>
                <Input
                  id="maxWeeksAhead"
                  type="number"
                  min={1}
                  value={config.maxWeeksAhead}
                  onChange={(e) => updateField('maxWeeksAhead', Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="calendarId">GHL Calendar ID (optional)</Label>
              <Input
                id="calendarId"
                value={config.calendarId}
                onChange={(e) => updateField('calendarId', e.target.value)}
                placeholder="Leave blank to use the default APGM calendar"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
            <CardDescription>Days and time range shown to visitors.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Available Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAY_NAMES.map((name, index) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      config.days.includes(index)
                        ? 'bg-[#AD6269] text-white border-[#AD6269]'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={config.startTime}
                  onChange={(e) => updateField('startTime', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={config.endTime}
                  onChange={(e) => updateField('endTime', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Public Page</CardTitle>
            <CardDescription>Link to share with clients.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              The public booking page lives at:
            </p>
            <code className="block bg-gray-100 rounded px-3 py-2 text-sm">
              https://www.aprettygirlmatter.com/quick-virtual-appointment
            </code>
            <p className="text-xs text-gray-500">
              It shows the configured image on the left and the available appointment slots on the right.
              When a visitor books, the appointment is created in both the website booking calendar and the
              connected GoHighLevel calendar.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
