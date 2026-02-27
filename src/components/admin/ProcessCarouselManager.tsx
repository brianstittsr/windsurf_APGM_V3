import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import db from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

type ProcessStep = {
  number: string;
  title: string;
  description: string;
};

export function ProcessCarouselManager() {
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSteps = async () => {
      const docRef = doc(db, 'website-content', 'process-steps');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSteps(docSnap.data().steps || []);
      }
      setLoading(false);
    };
    
    fetchSteps();
  }, []);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'website-content', 'process-steps'), { steps });
      toast.success('Process steps saved successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save process steps');
    }
  };

  const handleAddStep = () => {
    setSteps([...steps, { 
      number: `${steps.length + 1}`.padStart(2, '0'), 
      title: '', 
      description: '' 
    }]);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Renumber remaining steps
    setSteps(newSteps.map((step, i) => ({
      ...step,
      number: `${i + 1}`.padStart(2, '0')
    })));
  };

  const handleStepChange = (index: number, field: keyof ProcessStep, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Process Carousel Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Step {step.number}</h3>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => handleRemoveStep(index)}
              >
                Remove
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                value={step.title} 
                onChange={(e) => handleStepChange(index, 'title', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Input 
                value={step.description} 
                onChange={(e) => handleStepChange(index, 'description', e.target.value)}
              />
            </div>
          </div>
        ))}
        
        <div className="flex gap-4">
          <Button onClick={handleAddStep}>
            Add Step
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
