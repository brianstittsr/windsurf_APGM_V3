'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAlertDialog } from '@/components/ui/alert-dialog';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

interface SocialPost {
  id: string;
  content: string;
  platforms: ('instagram' | 'facebook' | 'tiktok' | 'pinterest')[];
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduledAt?: string;
  publishedAt?: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
  };
  createdAt: string;
}

interface PlatformStats {
  platform: string;
  icon: string;
  color: string;
  followers: number;
  posts: number;
  engagement: number;
  connected: boolean;
}

const platformConfig: PlatformStats[] = [
  { platform: 'Instagram', icon: 'fab fa-instagram', color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400', followers: 0, posts: 0, engagement: 0, connected: false },
  { platform: 'Facebook', icon: 'fab fa-facebook', color: 'bg-blue-600', followers: 0, posts: 0, engagement: 0, connected: false },
  { platform: 'TikTok', icon: 'fab fa-tiktok', color: 'bg-black', followers: 0, posts: 0, engagement: 0, connected: false },
  { platform: 'Pinterest', icon: 'fab fa-pinterest', color: 'bg-red-600', followers: 0, posts: 0, engagement: 0, connected: false }
];

export default function SocialMediaDashboard() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [platforms, setPlatforms] = useState<PlatformStats[]>(platformConfig);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'calendar' | 'posts' | 'analytics' | 'compose'>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { showAlert, showConfirm, AlertDialogComponent } = useAlertDialog();

  // Compose form
  const [composeForm, setComposeForm] = useState({
    content: '',
    platforms: [] as string[],
    mediaUrl: '',
    scheduledAt: ''
  });

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const db = getDb();
      const postsRef = collection(db, 'socialPosts');
      const snapshot = await getDocs(query(postsRef, orderBy('createdAt', 'desc')));
      
      const loadedPosts: SocialPost[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedPosts.push({
          id: doc.id,
          content: data.content || '',
          platforms: data.platforms || [],
          mediaUrl: data.mediaUrl,
          mediaType: data.mediaType,
          status: data.status || 'draft',
          scheduledAt: data.scheduledAt,
          publishedAt: data.publishedAt,
          engagement: data.engagement,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      });
      setPosts(loadedPosts);
    } catch (error) {
      console.error('Error loading social posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePost = async (status: 'draft' | 'scheduled') => {
    if (!composeForm.content || composeForm.platforms.length === 0) {
      await showAlert({
        title: 'Missing Information',
        description: 'Please add content and select at least one platform',
        variant: 'warning'
      });
      return;
    }

    try {
      const db = getDb();
      const postData = {
        content: composeForm.content,
        platforms: composeForm.platforms,
        mediaUrl: composeForm.mediaUrl || null,
        status: status,
        scheduledAt: composeForm.scheduledAt || null,
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'socialPosts'), postData);

      await showAlert({
        title: status === 'draft' ? 'Draft Saved' : 'Post Scheduled',
        description: status === 'draft' 
          ? 'Your post has been saved as a draft.'
          : `Your post will be published on ${new Date(composeForm.scheduledAt).toLocaleString()}`,
        variant: 'success'
      });

      setComposeForm({ content: '', platforms: [], mediaUrl: '', scheduledAt: '' });
      loadData();
    } catch (error) {
      console.error('Error saving post:', error);
      await showAlert({
        title: 'Error',
        description: 'Failed to save post',
        variant: 'destructive'
      });
    }
  };

  const deletePost = async (postId: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Post',
      description: 'Are you sure you want to delete this post?',
      confirmText: 'Delete',
      variant: 'destructive'
    });

    if (!confirmed) return;

    try {
      const db = getDb();
      await deleteDoc(doc(db, 'socialPosts', postId));
      await showAlert({
        title: 'Post Deleted',
        description: 'The post has been deleted.',
        variant: 'success'
      });
      loadData();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const togglePlatform = (platform: string) => {
    setComposeForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty days for padding
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getPostsForDate = (date: Date) => {
    return posts.filter(post => {
      const postDate = post.scheduledAt ? new Date(post.scheduledAt) : new Date(post.createdAt);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <i className="fas fa-share-alt text-[#AD6269]"></i>
            Social Media Management
          </h2>
          <p className="text-gray-500 text-sm mt-1">Schedule and manage your social media content</p>
        </div>
        <Button
          className="bg-[#AD6269] hover:bg-[#9d5860]"
          onClick={() => setActiveTab('compose')}
        >
          <i className="fas fa-plus mr-2"></i>
          Create Post
        </Button>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {platforms.map((platform) => (
          <div
            key={platform.platform}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${platform.color} rounded-full flex items-center justify-center`}>
                <i className={`${platform.icon} text-white text-lg`}></i>
              </div>
              {platform.connected ? (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Connected</span>
              ) : (
                <Button size="sm" variant="outline" className="text-xs">
                  Connect
                </Button>
              )}
            </div>
            <h3 className="font-semibold text-gray-900">{platform.platform}</h3>
            <div className="mt-2 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-gray-900">{platform.followers}</p>
                <p className="text-xs text-gray-500">Followers</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{platform.posts}</p>
                <p className="text-xs text-gray-500">Posts</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{platform.engagement}%</p>
                <p className="text-xs text-gray-500">Engage</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {[
          { id: 'calendar', label: 'Content Calendar', icon: 'fas fa-calendar' },
          { id: 'posts', label: 'All Posts', icon: 'fas fa-list' },
          { id: 'analytics', label: 'Analytics', icon: 'fas fa-chart-line' },
          { id: 'compose', label: 'Compose', icon: 'fas fa-edit' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#AD6269] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <i className={`${tab.icon} mr-2`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <h3 className="text-lg font-semibold text-gray-900">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
            {getDaysInMonth(currentMonth).map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-24 bg-gray-50 rounded-lg"></div>;
              }
              const dayPosts = getPostsForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={date.toISOString()}
                  className={`h-24 p-2 rounded-lg border ${
                    isToday ? 'border-[#AD6269] bg-[#AD6269]/5' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className={`text-sm font-medium ${isToday ? 'text-[#AD6269]' : 'text-gray-900'}`}>
                    {date.getDate()}
                  </div>
                  <div className="mt-1 space-y-1 overflow-hidden">
                    {dayPosts.slice(0, 2).map((post) => (
                      <div
                        key={post.id}
                        className="text-xs px-1 py-0.5 bg-[#AD6269]/10 text-[#AD6269] rounded truncate"
                      >
                        {post.platforms.map(p => p[0].toUpperCase()).join(', ')}
                      </div>
                    ))}
                    {dayPosts.length > 2 && (
                      <div className="text-xs text-gray-400">+{dayPosts.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-share-alt text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 mb-4">No posts yet</p>
              <Button
                className="bg-[#AD6269] hover:bg-[#9d5860]"
                onClick={() => setActiveTab('compose')}
              >
                Create Your First Post
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {posts.map((post) => (
                <div key={post.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    {post.mediaUrl && (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {post.platforms.map((platform) => (
                          <i
                            key={platform}
                            className={`fab fa-${platform} text-gray-400`}
                          ></i>
                        ))}
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(post.status)}`}>
                          {post.status}
                        </span>
                      </div>
                      <p className="text-gray-900 line-clamp-2">{post.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {post.scheduledAt 
                          ? `Scheduled: ${new Date(post.scheduledAt).toLocaleString()}`
                          : `Created: ${new Date(post.createdAt).toLocaleString()}`
                        }
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-gray-400 hover:text-blue-600">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="text-gray-400 hover:text-red-600"
                        onClick={() => deletePost(post.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Engagement Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">{posts.length}</p>
                <p className="text-sm text-gray-500">Total Posts</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">
                  {posts.reduce((sum, p) => sum + (p.engagement?.likes || 0), 0)}
                </p>
                <p className="text-sm text-gray-500">Total Likes</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">
                  {posts.reduce((sum, p) => sum + (p.engagement?.comments || 0), 0)}
                </p>
                <p className="text-sm text-gray-500">Total Comments</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">
                  {posts.reduce((sum, p) => sum + (p.engagement?.shares || 0), 0)}
                </p>
                <p className="text-sm text-gray-500">Total Shares</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Best Posting Times</h3>
            <div className="h-48 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <i className="fas fa-chart-bar text-4xl mb-2"></i>
                <p>Connect your accounts to see analytics</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compose Tab */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Create Post</h3>
            <div className="space-y-4">
              {/* Platform Selection */}
              <div>
                <Label>Select Platforms</Label>
                <div className="flex gap-2 mt-2">
                  {platforms.map((platform) => (
                    <button
                      key={platform.platform}
                      onClick={() => togglePlatform(platform.platform.toLowerCase())}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                        composeForm.platforms.includes(platform.platform.toLowerCase())
                          ? `${platform.color} text-white`
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <i className={`${platform.icon} text-xl`}></i>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <Label htmlFor="content">Post Content</Label>
                <textarea
                  id="content"
                  value={composeForm.content}
                  onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                  className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent resize-none"
                  placeholder="What's on your mind?"
                  maxLength={2200}
                />
                <p className="text-xs text-gray-400 text-right">{composeForm.content.length}/2200</p>
              </div>

              {/* Media */}
              <div>
                <Label htmlFor="mediaUrl">Media URL (optional)</Label>
                <Input
                  id="mediaUrl"
                  value={composeForm.mediaUrl}
                  onChange={(e) => setComposeForm({ ...composeForm, mediaUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Schedule */}
              <div>
                <Label htmlFor="scheduledAt">Schedule (optional)</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  value={composeForm.scheduledAt}
                  onChange={(e) => setComposeForm({ ...composeForm, scheduledAt: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => savePost('draft')}
                >
                  <i className="fas fa-save mr-2"></i>
                  Save Draft
                </Button>
                <Button
                  className="flex-1 bg-[#AD6269] hover:bg-[#9d5860]"
                  onClick={() => savePost('scheduled')}
                >
                  <i className="fas fa-paper-plane mr-2"></i>
                  {composeForm.scheduledAt ? 'Schedule' : 'Post Now'}
                </Button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#AD6269] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AG</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">A Pretty Girl Matter</p>
                    <p className="text-xs text-gray-500">Just now</p>
                  </div>
                </div>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {composeForm.content || 'Your post content will appear here...'}
                </p>
                {composeForm.mediaUrl && (
                  <div className="mt-3 rounded-lg overflow-hidden">
                    <img src={composeForm.mediaUrl} alt="" className="w-full" />
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 px-4 py-2 flex gap-6 text-gray-500">
                <button className="flex items-center gap-1 hover:text-red-500">
                  <i className="far fa-heart"></i> Like
                </button>
                <button className="flex items-center gap-1 hover:text-blue-500">
                  <i className="far fa-comment"></i> Comment
                </button>
                <button className="flex items-center gap-1 hover:text-green-500">
                  <i className="far fa-share-square"></i> Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {AlertDialogComponent}
    </div>
  );
}
