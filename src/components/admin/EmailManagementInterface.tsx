'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Send, 
  Archive, 
  Star, 
  Trash2, 
  Reply, 
  ReplyAll, 
  Forward,
  Search,
  Filter,
  RefreshCw,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  Paperclip,
  Calendar,
  User
} from 'lucide-react';

interface EmailAccount {
  id: string;
  provider: 'google' | 'microsoft';
  email: string;
  connected: boolean;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync?: Date;
}

interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  to: string[];
  date: string;
  body: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  provider: 'google' | 'microsoft';
  accountId: string;
}

interface EmailFolder {
  id: string;
  name: string;
  unreadCount: number;
  totalCount: number;
  provider: 'google' | 'microsoft';
}

const EmailManagementInterface: React.FC = () => {
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [emailMessages, setEmailMessages] = useState<EmailMessage[]>([]);
  const [emailFolders, setEmailFolders] = useState<EmailFolder[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('inbox');

  // Mock data for demonstration
  useEffect(() => {
    const mockAccounts: EmailAccount[] = [
      {
        id: 'google-1',
        provider: 'google',
        email: 'user@gmail.com',
        connected: true,
        status: 'connected',
        lastSync: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      },
      {
        id: 'microsoft-1',
        provider: 'microsoft',
        email: 'user@outlook.com',
        connected: true,
        status: 'connected',
        lastSync: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      }
    ];

    const mockMessages: EmailMessage[] = [
      {
        id: '1',
        subject: 'Appointment Confirmation - Microblading',
        from: 'client@email.com',
        to: ['user@gmail.com'],
        date: '2024-01-15T10:30:00Z',
        body: 'Hi, I would like to confirm my appointment for microblading scheduled for tomorrow at 2 PM...',
        isRead: false,
        isStarred: true,
        hasAttachments: false,
        provider: 'google',
        accountId: 'google-1'
      },
      {
        id: '2',
        subject: 'Payment Reminder',
        from: 'admin@atlantaglamourpmu.com',
        to: ['user@outlook.com'],
        date: '2024-01-15T09:15:00Z',
        body: 'This is a reminder that your deposit payment is due within 24 hours...',
        isRead: true,
        isStarred: false,
        hasAttachments: true,
        provider: 'microsoft',
        accountId: 'microsoft-1'
      },
      {
        id: '3',
        subject: 'Thank you for your service!',
        from: 'satisfied.client@email.com',
        to: ['user@gmail.com'],
        date: '2024-01-14T16:45:00Z',
        body: 'Thank you so much for the amazing microblading service. I love how it turned out!',
        isRead: true,
        isStarred: true,
        hasAttachments: false,
        provider: 'google',
        accountId: 'google-1'
      }
    ];

    const mockFolders: EmailFolder[] = [
      { id: 'inbox', name: 'Inbox', unreadCount: 2, totalCount: 45, provider: 'google' },
      { id: 'sent', name: 'Sent', unreadCount: 0, totalCount: 12, provider: 'google' },
      { id: 'drafts', name: 'Drafts', unreadCount: 0, totalCount: 3, provider: 'google' },
      { id: 'inbox', name: 'Inbox', unreadCount: 1, totalCount: 23, provider: 'microsoft' },
      { id: 'sent', name: 'Sent', unreadCount: 0, totalCount: 8, provider: 'microsoft' }
    ];

    setEmailAccounts(mockAccounts);
    setEmailMessages(mockMessages);
    setEmailFolders(mockFolders);
    setSelectedAccount(mockAccounts[0]?.id || null);
  }, []);

  const filteredMessages = emailMessages.filter(message => {
    if (selectedAccount && message.accountId !== selectedAccount) return false;
    if (searchQuery && !message.subject.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !message.from.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSendEmail = async (emailData: {
    to: string[];
    subject: string;
    body: string;
    accountId: string;
  }) => {
    setIsLoading(true);
    try {
      // Simulate sending email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Sending email:', emailData);
      // Here you would call the actual email service
      
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: string, isRead: boolean) => {
    try {
      // Update local state
      setEmailMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead } : msg
      ));
      
      // Here you would call the actual email service
      console.log(`Marking message ${messageId} as ${isRead ? 'read' : 'unread'}`);
      
    } catch (error) {
      console.error('Failed to update message:', error);
    }
  };

  const handleStarMessage = async (messageId: string, isStarred: boolean) => {
    try {
      // Update local state
      setEmailMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isStarred } : msg
      ));
      
      // Here you would call the actual email service
      console.log(`Marking message ${messageId} as ${isStarred ? 'starred' : 'unstarred'}`);
      
    } catch (error) {
      console.error('Failed to update message:', error);
    }
  };

  const renderEmailAccounts = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Connected Email Accounts</h3>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
      
      <div className="grid gap-3">
        {emailAccounts.map((account) => (
          <Card 
            key={account.id}
            className={`cursor-pointer transition-colors ${
              selectedAccount === account.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedAccount(account.id)}
          >
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  account.connected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div>
                  <p className="font-medium">{account.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {account.provider === 'google' ? 'Gmail' : 'Outlook'} • 
                    {account.lastSync ? ` Last sync: ${account.lastSync.toLocaleTimeString()}` : ' Never synced'}
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
  );

  const renderEmailList = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-2">
        {filteredMessages.map((message) => (
          <Card 
            key={message.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              !message.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
            }`}
            onClick={() => setSelectedMessage(message)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`font-medium truncate ${
                      !message.isRead ? 'text-blue-900' : ''
                    }`}>
                      {message.subject}
                    </p>
                    {message.isStarred && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    {message.hasAttachments && (
                      <Paperclip className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    From: {message.from}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {new Date(message.date).toLocaleDateString()} at{' '}
                    {new Date(message.date).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {message.provider === 'google' ? 'Gmail' : 'Outlook'}
                  </Badge>
                  {!message.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderEmailViewer = () => {
    if (!selectedMessage) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Select an email to view its contents</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold truncate">
              {selectedMessage.subject}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground">
                From: {selectedMessage.from}
              </p>
              <p className="text-sm text-muted-foreground">
                To: {selectedMessage.to.join(', ')}
              </p>
              <p className="text-sm text-muted-foreground">
                {new Date(selectedMessage.date).toLocaleDateString()} at{' '}
                {new Date(selectedMessage.date).toLocaleTimeString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMarkAsRead(selectedMessage.id, !selectedMessage.isRead)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {selectedMessage.isRead ? 'Mark Unread' : 'Mark Read'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStarMessage(selectedMessage.id, !selectedMessage.isStarred)}
            >
              <Star className={`w-4 h-4 mr-2 ${
                selectedMessage.isStarred ? 'text-yellow-500 fill-current' : ''
              }`} />
              {selectedMessage.isStarred ? 'Unstar' : 'Star'}
            </Button>
            <Button variant="outline" size="sm">
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: selectedMessage.body }} />
        </div>

        <div className="flex items-center gap-2 pt-4 border-t">
          <Button>
            <Reply className="w-4 h-4 mr-2" />
            Reply
          </Button>
          <Button variant="outline">
            <ReplyAll className="w-4 h-4 mr-2" />
            Reply All
          </Button>
          <Button variant="outline">
            <Forward className="w-4 h-4 mr-2" />
            Forward
          </Button>
        </div>
      </div>
    );
  };

  const renderComposeEmail = () => (
    <Card>
      <CardHeader>
        <CardTitle>Compose New Email</CardTitle>
        <CardDescription>
          Send a new email from your connected account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">From Account</label>
            <select className="w-full p-2 border rounded-md">
              {emailAccounts.filter(acc => acc.connected).map(account => (
                <option key={account.id} value={account.id}>
                  {account.email} ({account.provider === 'google' ? 'Gmail' : 'Outlook'})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            <Input placeholder="recipient@email.com" />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Subject</label>
          <Input placeholder="Email subject..." />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Message</label>
          <textarea 
            className="w-full h-32 p-3 border rounded-md resize-none"
            placeholder="Type your email message here..."
          />
        </div>

        <div className="flex items-center justify-between">
          <Button variant="outline">
            <Paperclip className="w-4 h-4 mr-2" />
            Attach File
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              Save Draft
            </Button>
            <Button disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send Email
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Management</h1>
          <p className="text-muted-foreground">
            Manage emails from your connected Google and Microsoft accounts
          </p>
        </div>
        <Button>
          <Mail className="w-4 h-4 mr-2" />
          Connect New Account
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {renderEmailAccounts()}
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Send className="w-4 h-4 mr-2" />
                Compose Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Archive className="w-4 h-4 mr-2" />
                Archive All
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="inbox">Inbox</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="drafts">Drafts</TabsTrigger>
              <TabsTrigger value="compose">Compose</TabsTrigger>
            </TabsList>
            
            <TabsContent value="inbox" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Email List</CardTitle>
                    <CardDescription>
                      {filteredMessages.length} messages found
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderEmailList()}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Email Viewer</CardTitle>
                    <CardDescription>
                      Select a message to view its contents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderEmailViewer()}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="sent">
              <Card>
                <CardHeader>
                  <CardTitle>Sent Emails</CardTitle>
                  <CardDescription>
                    View your sent email messages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Send className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Sent emails will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="drafts">
              <Card>
                <CardHeader>
                  <CardTitle>Draft Emails</CardTitle>
                  <CardDescription>
                    View your draft email messages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Draft emails will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="compose">
              {renderComposeEmail()}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EmailManagementInterface;
