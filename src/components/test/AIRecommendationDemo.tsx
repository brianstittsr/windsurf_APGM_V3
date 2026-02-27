'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AIRecommendationService } from '@/services/aiRecommendationService';

export function AIRecommendationDemo() {
  const [location, setLocation] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const handleGetRecommendations = async () => {
    if (!location) return;
    
    setLoading(true);
    try {
      const service = new AIRecommendationService({
        openClawKey: process.env.NEXT_PUBLIC_OPENCLAW_KEY || ''
      });
      
      const results = await service.getRecommendations({
        businessLocation: location,
        businessType: 'pmu'
      });
      
      setRecommendations(results);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>AI Business Recommendations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Business Location</Label>
          <div className="flex gap-2">
            <Input 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Dallas, TX"
            />
            <Button onClick={handleGetRecommendations} disabled={loading}>
              {loading ? 'Analyzing...' : 'Get Recommendations'}
            </Button>
          </div>
        </div>
        
        {recommendations.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Recommended Actions</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {recommendations.map((rec) => (
                <div key={rec.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">{rec.title}</h4>
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {rec.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm mt-1">{rec.description}</p>
                  <div className="mt-3 flex justify-between text-xs">
                    <span>Confidence: {(rec.confidenceScore * 100).toFixed(0)}%</span>
                    <span>Impact: {rec.estimatedImpact}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
