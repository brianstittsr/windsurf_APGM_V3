'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAlertDialog } from '@/components/ui/alert-dialog';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';

interface Video {
  id: string;
  title: string;
  description: string;
  type: 'testimonial' | 'tutorial' | 'before-after' | 'promo' | 'other';
  url: string;
  thumbnailUrl?: string;
  platform: 'youtube' | 'vimeo' | 'tiktok' | 'instagram' | 'uploaded';
  views: number;
  likes: number;
  duration?: string;
  isPublished: boolean;
  createdAt: string;
}

export default function VideoMarketingDashboard() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'analytics'>('library');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const { showAlert, showConfirm, AlertDialogComponent } = useAlertDialog();

  // Upload form
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    type: 'testimonial' as Video['type'],
    url: '',
    thumbnailUrl: '',
    platform: 'youtube' as Video['platform']
  });

  // Stats
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalLikes: 0,
    publishedVideos: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const db = getDb();
      const videosRef = collection(db, 'videos');
      const snapshot = await getDocs(query(videosRef, orderBy('createdAt', 'desc')));
      
      const loadedVideos: Video[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedVideos.push({
          id: doc.id,
          title: data.title || 'Untitled Video',
          description: data.description || '',
          type: data.type || 'other',
          url: data.url || '',
          thumbnailUrl: data.thumbnailUrl,
          platform: data.platform || 'youtube',
          views: data.views || 0,
          likes: data.likes || 0,
          duration: data.duration,
          isPublished: data.isPublished !== false,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      });
      setVideos(loadedVideos);

      // Calculate stats
      setStats({
        totalVideos: loadedVideos.length,
        totalViews: loadedVideos.reduce((sum, v) => sum + v.views, 0),
        totalLikes: loadedVideos.reduce((sum, v) => sum + v.likes, 0),
        publishedVideos: loadedVideos.filter(v => v.isPublished).length
      });

    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addVideo = async () => {
    if (!uploadForm.title || !uploadForm.url) {
      await showAlert({
        title: 'Missing Information',
        description: 'Please provide a title and video URL',
        variant: 'warning'
      });
      return;
    }

    try {
      const db = getDb();
      const videoData = {
        title: uploadForm.title,
        description: uploadForm.description,
        type: uploadForm.type,
        url: uploadForm.url,
        thumbnailUrl: uploadForm.thumbnailUrl || extractThumbnail(uploadForm.url),
        platform: uploadForm.platform,
        views: 0,
        likes: 0,
        isPublished: true,
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'videos'), videoData);

      await showAlert({
        title: 'Video Added',
        description: 'Your video has been added to the library!',
        variant: 'success'
      });

      setUploadForm({
        title: '',
        description: '',
        type: 'testimonial',
        url: '',
        thumbnailUrl: '',
        platform: 'youtube'
      });
      setActiveTab('library');
      loadData();
    } catch (error) {
      console.error('Error adding video:', error);
      await showAlert({
        title: 'Error',
        description: 'Failed to add video',
        variant: 'destructive'
      });
    }
  };

  const deleteVideo = async (videoId: string) => {
    const confirmed = await showConfirm({
      title: 'Delete Video',
      description: 'Are you sure you want to delete this video?',
      confirmText: 'Delete',
      variant: 'destructive'
    });

    if (!confirmed) return;

    try {
      const db = getDb();
      await deleteDoc(doc(db, 'videos', videoId));
      setVideos(prev => prev.filter(v => v.id !== videoId));
      setSelectedVideo(null);
      await showAlert({
        title: 'Video Deleted',
        description: 'The video has been removed.',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  const extractThumbnail = (url: string): string => {
    // Extract YouTube thumbnail
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
    }
    return '';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'testimonial': return 'fas fa-quote-right';
      case 'tutorial': return 'fas fa-graduation-cap';
      case 'before-after': return 'fas fa-exchange-alt';
      case 'promo': return 'fas fa-bullhorn';
      default: return 'fas fa-video';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'testimonial': return 'bg-purple-100 text-purple-800';
      case 'tutorial': return 'bg-blue-100 text-blue-800';
      case 'before-after': return 'bg-green-100 text-green-800';
      case 'promo': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube': return 'fab fa-youtube text-red-600';
      case 'vimeo': return 'fab fa-vimeo text-blue-500';
      case 'tiktok': return 'fab fa-tiktok text-black';
      case 'instagram': return 'fab fa-instagram text-pink-600';
      default: return 'fas fa-video text-gray-600';
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
            <i className="fas fa-video text-[#AD6269]"></i>
            Video Marketing
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage and showcase your video content</p>
        </div>
        <Button
          className="bg-[#AD6269] hover:bg-[#9d5860]"
          onClick={() => setActiveTab('upload')}
        >
          <i className="fas fa-plus mr-2"></i>
          Add Video
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fas fa-video text-blue-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalVideos}</p>
              <p className="text-xs text-gray-500">Total Videos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-eye text-green-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Views</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <i className="fas fa-heart text-red-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLikes.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Likes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <i className="fas fa-check-circle text-purple-600"></i>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.publishedVideos}</p>
              <p className="text-xs text-gray-500">Published</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {[
          { id: 'library', label: 'Video Library', icon: 'fas fa-film' },
          { id: 'upload', label: 'Add Video', icon: 'fas fa-upload' },
          { id: 'analytics', label: 'Analytics', icon: 'fas fa-chart-line' }
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

      {/* Library Tab */}
      {activeTab === 'library' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl border border-gray-200 p-12 text-center">
              <i className="fas fa-video text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 mb-4">No videos yet</p>
              <Button
                className="bg-[#AD6269] hover:bg-[#9d5860]"
                onClick={() => setActiveTab('upload')}
              >
                Add Your First Video
              </Button>
            </div>
          ) : (
            videos.map((video) => (
              <div key={video.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-100">
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <i className="fas fa-video text-4xl text-gray-300"></i>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <i className="fas fa-play text-[#AD6269] text-2xl ml-1"></i>
                    </a>
                  </div>
                  <div className="absolute top-2 right-2">
                    <i className={`${getPlatformIcon(video.platform)} text-xl`}></i>
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                      {video.duration}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getTypeColor(video.type)}`}>
                      <i className={`${getTypeIcon(video.type)} mr-1`}></i>
                      {video.type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{video.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">{video.description}</p>
                  
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span><i className="fas fa-eye mr-1"></i>{video.views}</span>
                      <span><i className="fas fa-heart mr-1"></i>{video.likes}</span>
                    </div>
                    <button
                      onClick={() => deleteVideo(video.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Add New Video</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Video Title *</Label>
              <Input
                id="title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                placeholder="e.g., Client Testimonial - Sarah's Microblading Journey"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                rows={3}
                placeholder="Describe your video..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Video Type</Label>
                <select
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                >
                  <option value="testimonial">Testimonial</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="before-after">Before & After</option>
                  <option value="promo">Promotional</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label>Platform</Label>
                <select
                  value={uploadForm.platform}
                  onChange={(e) => setUploadForm({ ...uploadForm, platform: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269]"
                >
                  <option value="youtube">YouTube</option>
                  <option value="vimeo">Vimeo</option>
                  <option value="tiktok">TikTok</option>
                  <option value="instagram">Instagram</option>
                  <option value="uploaded">Direct Upload</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="url">Video URL *</Label>
              <Input
                id="url"
                value={uploadForm.url}
                onChange={(e) => setUploadForm({ ...uploadForm, url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
              <p className="text-xs text-gray-400 mt-1">Paste the video URL from YouTube, Vimeo, TikTok, or Instagram</p>
            </div>

            <div>
              <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
              <Input
                id="thumbnailUrl"
                value={uploadForm.thumbnailUrl}
                onChange={(e) => setUploadForm({ ...uploadForm, thumbnailUrl: e.target.value })}
                placeholder="https://example.com/thumbnail.jpg"
              />
              <p className="text-xs text-gray-400 mt-1">Leave blank to auto-extract from YouTube</p>
            </div>

            {uploadForm.url && uploadForm.platform === 'youtube' && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">Preview Thumbnail:</p>
                <img
                  src={extractThumbnail(uploadForm.url)}
                  alt="Thumbnail preview"
                  className="w-full max-w-xs rounded-lg"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setActiveTab('library')}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#AD6269] hover:bg-[#9d5860]"
                onClick={addVideo}
              >
                <i className="fas fa-plus mr-2"></i>
                Add Video
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Video Performance</h3>
            <div className="space-y-4">
              {videos.slice(0, 5).map((video, index) => (
                <div key={video.id} className="flex items-center gap-4">
                  <span className="w-6 h-6 bg-[#AD6269]/10 rounded-full flex items-center justify-center text-xs font-bold text-[#AD6269]">
                    {index + 1}
                  </span>
                  <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {video.thumbnailUrl && (
                      <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{video.title}</p>
                    <p className="text-xs text-gray-500">{video.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{video.views.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Videos by Type</h3>
              <div className="space-y-3">
                {['testimonial', 'tutorial', 'before-after', 'promo', 'other'].map((type) => {
                  const count = videos.filter(v => v.type === type).length;
                  const percentage = videos.length > 0 ? (count / videos.length) * 100 : 0;
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(type)}`}>
                        <i className={getTypeIcon(type)}></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600 capitalize">{type}</span>
                          <span className="text-sm font-medium text-gray-900">{count}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#AD6269] rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Platform Distribution</h3>
              <div className="space-y-3">
                {['youtube', 'tiktok', 'instagram', 'vimeo'].map((platform) => {
                  const count = videos.filter(v => v.platform === platform).length;
                  return (
                    <div key={platform} className="flex items-center gap-3">
                      <i className={`${getPlatformIcon(platform)} text-xl w-8`}></i>
                      <span className="flex-1 text-sm text-gray-600 capitalize">{platform}</span>
                      <span className="font-bold text-gray-900">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {AlertDialogComponent}
    </div>
  );
}
