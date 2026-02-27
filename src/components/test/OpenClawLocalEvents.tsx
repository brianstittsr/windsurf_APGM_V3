'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OpenClawService } from '@/services/openclawService';

export function OpenClawLocalEvents() {
  const [location, setLocation] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const handleSearch = async () => {
    if (!location) return;
    
    setLoading(true);
    try {
      // In production, use dependency injection
      const service = new OpenClawService({
        apiKey: process.env.NEXT_PUBLIC_OPENCLAW_KEY || ''
      });
      
      const results = await service.getLocalEvents({
        location,
        radius: 10 // miles
      });
      
      setEvents(results);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Local Events (OpenClaw POC)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Location (City, State or ZIP)</Label>
          <div className="flex gap-2">
            <Input 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Dallas, TX"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>
        
        {events.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Upcoming Events</h3>
            <div className="space-y-2">
              {events.map((event) => (
                <div key={event.id} className="border rounded p-3">
                  <h4 className="font-medium">{event.name}</h4>
                  <p className="text-sm">{event.date} • {event.location}</p>
                  <p className="text-sm text-muted-foreground">{event.organizer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
