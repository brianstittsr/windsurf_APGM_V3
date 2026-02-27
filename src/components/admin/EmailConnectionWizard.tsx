'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  GoogleIcon,
  MicrosoftIcon,
  Settings,
  Shield,
  Zap
} from 'lucide-react';

interface EmailAccount {
  id: string;
  provider: 'google' | 'microsoft';
  email: string;
  connected: boolean;
  lastSync?: Date;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

const EmailConnectionWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);

  const steps: WizardStep[] = [
    {
      id: 'welcome',
      title: 'Email Account Connection',
      description: 'Connect your Google and Microsoft email accounts to manage messages',
      completed: false
    },
    {
      id: 'google',
      title: 'Google Gmail Connection',
      description: 'Connect your Gmail account for email management',
      completed: false
    },
    {
      id: 'microsoft',
      title: 'Microsoft Outlook Connection',
      description: 'Connect your Outlook account for email management',
      completed: false
    },
    {
      id: 'settings',
      title: 'Email Management Settings',
      description: 'Configure your email management preferences',
      completed: false
    },
    {
      id: 'complete',
      title: 'Connection Complete',
      description: 'Your email accounts are ready for management',
      completed: false
    }
  ];

  const handleGoogleConnection = async () => {
    setIsConnecting(true);
    setConnectionProgress(0);

    try {
      // Simulate connection progress
      const progressInterval = setInterval(() => {
        setConnectionProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 20;
        });
      }, 500);

      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const googleAccount: EmailAccount = {
        id: 'google-' + Date.now(),
        provider: 'google',
        email: 'user@gmail.com', // This would come from OAuth response
        connected: true,
        lastSync: new Date(),
        status: 'connected'
      };

      setEmailAccounts(prev => [...prev, googleAccount]);
      setConnectionProgress(100);
      
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsConnecting(false);
      }, 1000);

    } catch (error) {
      console.error('Google connection failed:', error);
      setIsConnecting(false);
    }
  };

  const handleMicrosoftConnection = async () => {
    setIsConnecting(true);
    setConnectionProgress(0);

    try {
      // Simulate connection progress
      const progressInterval = setInterval(() => {
        setConnectionProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 20;
        });
      }, 500);

      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const microsoftAccount: EmailAccount = {
        id: 'microsoft-' + Date.now(),
        provider: 'microsoft',
        email: 'user@outlook.com', // This would come from OAuth response
        connected: true,
        lastSync: new Date(),
        status: 'connected'
      };

      setEmailAccounts(prev => [...prev, microsoftAccount]);
      setConnectionProgress(100);
      
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsConnecting(false);
      }, 1000);

    } catch (error) {
      console.error('Microsoft connection failed:', error);
      setIsConnecting(false);
    }
  };

  const renderWelcomeStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Email Account Connection</h2>
          <p className="text-muted-foreground">
            Connect your Google and Microsoft email accounts to manage messages through OpenClaw
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <GoogleIcon className="w-6 h-6 text-blue-600" />
              <CardTitle className="text-lg">Google Gmail</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription>
              Connect your Gmail account to manage emails, send automated responses, and track conversations.
            </CardDescription>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Full email access</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Automated responses</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Conversation tracking</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <MicrosoftIcon className="w-6 h-6 text-blue-600" />
              <CardTitle className="text-lg">Microsoft Outlook</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <CardDescription>
              Connect your Outlook account to manage business emails, automated workflows, and integration features.
            </CardDescription>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Business email access</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Automated workflows</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Calendar integration</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Secure Connection:</strong> All email connections use OAuth 2.0 for maximum security. 
          Your credentials are never stored, and you can disconnect at any time.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderGoogleStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <GoogleIcon className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Connect Google Gmail</h2>
          <p className="text-muted-foreground">
            Authorize OpenClaw to access your Gmail account for email management
          </p>
        </div>
      </div>

      {isConnecting ? (
        <div className="space-y-4">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground mt-2">
              Connecting to Gmail...
            </p>
          </div>
          <Progress value={connectionProgress} className="w-full" />
          <p className="text-center text-sm text-muted-foreground">
            {connectionProgress}% complete
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You'll be redirected to Google to authorize the connection. 
              Make sure you're logged into the correct Gmail account.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="google-email">Gmail Account</Label>
              <Input 
                id="google-email"
                type="email" 
                placeholder="your-email@gmail.com"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                This will be automatically filled during OAuth flow
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Required Permissions:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Read and send emails</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Access email metadata</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Manage email labels</span>
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleGoogleConnection}
            className="w-full"
            size="lg"
          >
            <GoogleIcon className="w-4 h-4 mr-2" />
            Connect Gmail Account
          </Button>
        </div>
      )}
    </div>
  );

  const renderMicrosoftStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <MicrosoftIcon className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Connect Microsoft Outlook</h2>
          <p className="text-muted-foreground">
            Authorize OpenClaw to access your Outlook account for business email management
          </p>
        </div>
      </div>

      {isConnecting ? (
        <div className="space-y-4">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground mt-2">
              Connecting to Outlook...
            </p>
          </div>
          <Progress value={connectionProgress} className="w-full" />
          <p className="text-center text-sm text-muted-foreground">
            {connectionProgress}% complete
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You'll be redirected to Microsoft to authorize the connection. 
              Make sure you're logged into the correct Outlook account.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="microsoft-email">Outlook Account</Label>
              <Input 
                id="microsoft-email"
                type="email" 
                placeholder="your-email@outlook.com"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                This will be automatically filled during OAuth flow
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Required Permissions:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Read and send emails</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Access calendar events</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Manage contacts</span>
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleMicrosoftConnection}
            className="w-full"
            size="lg"
          >
            <MicrosoftIcon className="w-4 h-4 mr-2" />
            Connect Outlook Account
          </Button>
        </div>
      )}
    </div>
  );

  const renderSettingsStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Settings className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Email Management Settings</h2>
          <p className="text-muted-foreground">
            Configure how OpenClaw should manage your connected email accounts
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sync Settings</CardTitle>
            <CardDescription>
              Configure how often to sync email accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sync-frequency">Sync Frequency</Label>
              <select 
                id="sync-frequency"
                className="w-full p-2 border rounded-md"
                defaultValue="15min"
              >
                <option value="5min">Every 5 minutes</option>
                <option value="15min">Every 15 minutes</option>
                <option value="30min">Every 30 minutes</option>
                <option value="1hour">Every hour</option>
                <option value="manual">Manual only</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Automation Settings</CardTitle>
            <CardDescription>
              Configure automated email management features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-responses">Auto Responses</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically respond to common inquiries
                  </p>
                </div>
                <input type="checkbox" id="auto-responses" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-filtering">Email Filtering</Label>
                  <p className="text-xs text-muted-foreground">
                    Filter and categorize incoming emails
                  </p>
                </div>
                <input type="checkbox" id="email-filtering" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="conversation-tracking">Conversation Tracking</Label>
                  <p className="text-xs text-muted-foreground">
                    Track email conversations and threads
                  </p>
                </div>
                <input type="checkbox" id="conversation-tracking" defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Email Accounts Connected!</h2>
          <p className="text-muted-foreground">
            Your email accounts are now ready for management through OpenClaw
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium">Connected Accounts</h3>
        <div className="space-y-3">
          {emailAccounts.map((account) => (
            <Card key={account.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {account.provider === 'google' ? (
                    <GoogleIcon className="w-5 h-5 text-blue-600" />
                  ) : (
                    <MicrosoftIcon className="w-5 h-5 text-blue-600" />
                  )}
                  <div>
                    <p className="font-medium">{account.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {account.provider === 'google' ? 'Gmail' : 'Outlook'} • 
                      Connected {account.lastSync?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant={account.connected ? 'default' : 'secondary'}>
                  {account.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          <strong>Ready to Go!</strong> Your email accounts are now connected. 
          You can start managing emails, setting up automations, and tracking conversations.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderWelcomeStep();
      case 1:
        return renderGoogleStep();
      case 2:
        return renderMicrosoftStep();
      case 3:
        return renderSettingsStep();
      case 4:
        return renderCompleteStep();
      default:
        return renderWelcomeStep();
    }
  };

  const canGoNext = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1 || currentStep === 2) return !isConnecting;
    if (currentStep === 3) return true;
    if (currentStep === 4) return false;
    return false;
  };

  const canGoPrevious = () => {
    return currentStep > 0 && currentStep < 4;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Email Connection Wizard</h1>
            <p className="text-muted-foreground">
              Connect your email accounts to OpenClaw for advanced message management
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </p>
            <Progress value={(currentStep / (steps.length - 1)) * 100} className="w-32" />
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderCurrentStep()}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => prev - 1)}
          disabled={!canGoPrevious()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <Button
          onClick={() => setCurrentStep(prev => prev + 1)}
          disabled={!canGoNext()}
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default EmailConnectionWizard;
