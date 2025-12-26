'use client';

import { useState, useEffect } from 'react';
import { HeroSlide, HeroSlideFormData, defaultHeroSlideFormData } from '@/types/heroSlide';
import { HeroSlideService } from '@/services/heroSlideService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAlertDialog } from '@/components/ui/alert-dialog';

export default function HeroCarouselManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState<HeroSlideFormData>(defaultHeroSlideFormData);
  const [submitting, setSubmitting] = useState(false);
  const [previewSlide, setPreviewSlide] = useState<HeroSlideFormData | null>(null);
  const { showAlert, showConfirm, AlertDialogComponent } = useAlertDialog();

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      const slidesData = await HeroSlideService.getAllSlides();
      setSlides(slidesData);
    } catch (error) {
      console.error('Error loading slides:', error);
      showAlert({ title: 'Error', description: 'Error loading hero slides', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.backgroundImage) {
      await showAlert({ title: 'Missing Information', description: 'Please fill in required fields (Title and Background Image)', variant: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      if (editingSlide) {
        await HeroSlideService.updateSlide(editingSlide.id, formData);
        await showAlert({ title: 'Success', description: 'Slide updated successfully!', variant: 'success' });
      } else {
        await HeroSlideService.createSlide({
          ...formData,
          order: slides.length
        });
        await showAlert({ title: 'Success', description: 'Slide created successfully!', variant: 'success' });
      }
      closeModal();
      loadSlides();
    } catch (error) {
      console.error('Error saving slide:', error);
      await showAlert({ title: 'Error', description: 'Error saving slide', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (slide: HeroSlide) => {
    const confirmed = await showConfirm({ title: 'Delete Slide', description: 'Are you sure you want to delete this slide?', confirmText: 'Delete', variant: 'destructive' });
    if (!confirmed) return;
    try {
      await HeroSlideService.deleteSlide(slide.id);
      await showAlert({ title: 'Success', description: 'Slide deleted successfully!', variant: 'success' });
      loadSlides();
    } catch (error) {
      console.error('Error deleting slide:', error);
      await showAlert({ title: 'Error', description: 'Error deleting slide', variant: 'destructive' });
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      await HeroSlideService.updateSlide(slide.id, { isActive: !slide.isActive });
      loadSlides();
    } catch (error) {
      console.error('Error toggling slide status:', error);
      showAlert({ title: 'Error', description: 'Error updating slide status', variant: 'destructive' });
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newSlides = [...slides];
    [newSlides[index - 1], newSlides[index]] = [newSlides[index], newSlides[index - 1]];
    try {
      await HeroSlideService.reorderSlides(newSlides.map(s => s.id));
      loadSlides();
    } catch (error) {
      console.error('Error reordering slides:', error);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === slides.length - 1) return;
    const newSlides = [...slides];
    [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
    try {
      await HeroSlideService.reorderSlides(newSlides.map(s => s.id));
      loadSlides();
    } catch (error) {
      console.error('Error reordering slides:', error);
    }
  };

  const openCreateModal = () => {
    setEditingSlide(null);
    setFormData({ ...defaultHeroSlideFormData, order: slides.length });
    setShowModal(true);
  };

  const openEditModal = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || '',
      highlightText: slide.highlightText || '',
      description: slide.description || '',
      backgroundImage: slide.backgroundImage,
      backgroundVideo: slide.backgroundVideo || '',
      buttonText: slide.buttonText,
      buttonLink: slide.buttonLink,
      buttonStyle: slide.buttonStyle || 'primary',
      textAlignment: slide.textAlignment || 'center',
      overlayOpacity: slide.overlayOpacity || 40,
      isActive: slide.isActive,
      order: slide.order
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSlide(null);
    setFormData(defaultHeroSlideFormData);
  };

  const openPreview = (data?: HeroSlideFormData) => {
    setPreviewSlide(data || formData);
    setShowPreview(true);
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
            <i className="fas fa-images text-[#AD6269]"></i>Hero Carousel
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage homepage hero slides</p>
        </div>
        <Button onClick={openCreateModal} className="bg-[#AD6269] hover:bg-[#9d5860]">
          <i className="fas fa-plus mr-2"></i>Add New Slide
        </Button>
      </div>

      {/* Slides List */}
      <div className="space-y-4">
        {slides.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <i className="fas fa-images text-5xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No hero slides yet</h3>
            <p className="text-gray-500 mb-4">Create your first hero slide to get started.</p>
            <Button onClick={openCreateModal} className="bg-[#AD6269] hover:bg-[#9d5860]">
              <i className="fas fa-plus mr-2"></i>Add First Slide
            </Button>
          </div>
        ) : (
          slides.map((slide, index) => (
            <div 
              key={slide.id} 
              className={`bg-white rounded-xl border ${slide.isActive ? 'border-green-200' : 'border-gray-200'} overflow-hidden hover:shadow-md transition-shadow`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Thumbnail */}
                <div 
                  className="w-full md:w-64 h-40 bg-cover bg-center relative flex-shrink-0"
                  style={{ backgroundImage: `url(${slide.backgroundImage})` }}
                >
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">#{index + 1}</span>
                  </div>
                  {!slide.isActive && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-gray-800 text-white text-xs rounded">
                      Hidden
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{slide.title}</h3>
                      {slide.subtitle && (
                        <p className="text-sm text-gray-500">
                          <span className="text-[#AD6269]">{slide.subtitle}</span>
                          {slide.highlightText && ` ${slide.highlightText}`}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${slide.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {slide.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                    <span><i className="fas fa-link mr-1"></i>{slide.buttonLink}</span>
                    <span><i className="fas fa-align-center mr-1"></i>{slide.textAlignment}</span>
                    <span><i className="fas fa-adjust mr-1"></i>Overlay: {slide.overlayOpacity}%</span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openPreview({
                        title: slide.title,
                        subtitle: slide.subtitle || '',
                        highlightText: slide.highlightText || '',
                        description: slide.description || '',
                        backgroundImage: slide.backgroundImage,
                        backgroundVideo: slide.backgroundVideo || '',
                        buttonText: slide.buttonText,
                        buttonLink: slide.buttonLink,
                        buttonStyle: slide.buttonStyle || 'primary',
                        textAlignment: slide.textAlignment || 'center',
                        overlayOpacity: slide.overlayOpacity || 40,
                        isActive: slide.isActive,
                        order: slide.order
                      })}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      <i className="fas fa-eye mr-1"></i>Preview
                    </button>
                    <button
                      onClick={() => openEditModal(slide)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <i className="fas fa-edit mr-1"></i>Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(slide)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        slide.isActive 
                          ? 'border-yellow-200 text-yellow-600 hover:bg-yellow-50' 
                          : 'border-green-200 text-green-600 hover:bg-green-50'
                      }`}
                    >
                      <i className={`fas ${slide.isActive ? 'fa-eye-slash' : 'fa-eye'} mr-1`}></i>
                      {slide.isActive ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fas fa-arrow-up"></i>
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === slides.length - 1}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fas fa-arrow-down"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(slide)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <i className="fas fa-trash mr-1"></i>Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingSlide ? 'Edit Slide' : 'Create New Slide'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openPreview()}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                >
                  <i className="fas fa-eye mr-1"></i>Preview
                </button>
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={closeModal}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="WAKE UP FLAWLESS EVERY DAY!"
                    required
                  />
                </div>

                {/* Subtitle & Highlight */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle (colored)</Label>
                    <Input
                      id="subtitle"
                      value={formData.subtitle}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="SOFT NATURAL"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="highlightText">Highlight Text</Label>
                    <Input
                      id="highlightText"
                      value={formData.highlightText}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, highlightText: e.target.value })}
                      placeholder="PERMANENT MAKEUP"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent resize-none"
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description text"
                  />
                </div>

                {/* Background Image */}
                <div className="space-y-2">
                  <Label htmlFor="backgroundImage">Background Image URL <span className="text-red-500">*</span></Label>
                  <Input
                    id="backgroundImage"
                    value={formData.backgroundImage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, backgroundImage: e.target.value })}
                    placeholder="/images/hero/your-image.jpg"
                    required
                  />
                  {formData.backgroundImage && (
                    <div className="mt-2 h-32 rounded-lg bg-cover bg-center border border-gray-200" style={{ backgroundImage: `url(${formData.backgroundImage})` }} />
                  )}
                </div>

                {/* Background Video */}
                <div className="space-y-2">
                  <Label htmlFor="backgroundVideo">Background Video URL (optional)</Label>
                  <Input
                    id="backgroundVideo"
                    value={formData.backgroundVideo}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, backgroundVideo: e.target.value })}
                    placeholder="/videos/hero-video.mp4"
                  />
                </div>

                {/* Button Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                      id="buttonText"
                      value={formData.buttonText}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, buttonText: e.target.value })}
                      placeholder="Book Now"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buttonLink">Button Link</Label>
                    <Input
                      id="buttonLink"
                      value={formData.buttonLink}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, buttonLink: e.target.value })}
                      placeholder="/book-now-custom"
                    />
                  </div>
                </div>

                {/* Style Settings */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buttonStyle">Button Style</Label>
                    <select
                      id="buttonStyle"
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                      value={formData.buttonStyle}
                      onChange={(e) => setFormData({ ...formData, buttonStyle: e.target.value as 'primary' | 'secondary' | 'outline' })}
                    >
                      <option value="primary">Primary (Rose)</option>
                      <option value="secondary">Secondary (White)</option>
                      <option value="outline">Outline</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="textAlignment">Text Alignment</Label>
                    <select
                      id="textAlignment"
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent"
                      value={formData.textAlignment}
                      onChange={(e) => setFormData({ ...formData, textAlignment: e.target.value as 'left' | 'center' | 'right' })}
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overlayOpacity">Overlay Opacity (%)</Label>
                    <Input
                      id="overlayOpacity"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.overlayOpacity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, overlayOpacity: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#AD6269] focus:ring-[#AD6269]"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">Active (visible on website)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl sticky bottom-0">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#AD6269] hover:bg-[#9d5860]" disabled={submitting}>
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      {editingSlide ? 'Update Slide' : 'Create Slide'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewSlide && (
        <div className="fixed inset-0 z-[60] bg-black">
          {/* Close Button */}
          <button
            onClick={() => setShowPreview(false)}
            className="absolute top-4 right-4 z-[70] w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all"
          >
            <i className="fas fa-times text-xl"></i>
          </button>

          {/* Preview Label */}
          <div className="absolute top-4 left-4 z-[70] px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-medium">
            <i className="fas fa-eye mr-2"></i>Preview Mode
          </div>

          {/* Preview Content */}
          <div className="relative w-full h-full flex items-center">
            {/* Background */}
            {previewSlide.backgroundVideo ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={previewSlide.backgroundVideo} type="video/mp4" />
              </video>
            ) : (
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${previewSlide.backgroundImage})` }}
              />
            )}

            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black" 
              style={{ opacity: previewSlide.overlayOpacity / 100 }}
            />

            {/* Content */}
            <div className="container mx-auto px-4 relative z-10">
              <div className={`flex flex-col ${
                previewSlide.textAlignment === 'left' ? 'items-start text-left' : 
                previewSlide.textAlignment === 'right' ? 'items-end text-right' : 
                'items-center text-center'
              }`}>
                <div className="max-w-2xl">
                  {previewSlide.subtitle && (
                    <p className="text-white text-lg mb-4">
                      <span className="text-[#AD6269]">{previewSlide.subtitle}</span>
                      {previewSlide.highlightText && ` ${previewSlide.highlightText}`}
                    </p>
                  )}
                  <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4">
                    {previewSlide.title}
                  </h1>
                  {previewSlide.description && (
                    <p className="text-white/80 text-lg mb-6">
                      {previewSlide.description}
                    </p>
                  )}
                  <button
                    className={`px-8 py-3 rounded-full text-base font-semibold transition-colors ${
                      previewSlide.buttonStyle === 'secondary' 
                        ? 'bg-white text-gray-900 hover:bg-gray-100' 
                        : previewSlide.buttonStyle === 'outline'
                        ? 'bg-transparent border-2 border-white text-white hover:bg-white/10'
                        : 'bg-[#AD6269] hover:bg-[#9d5860] text-white'
                    }`}
                  >
                    {previewSlide.buttonText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {AlertDialogComponent}
    </div>
  );
}
