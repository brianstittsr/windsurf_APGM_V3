'use client';

import { useState, useEffect } from 'react';
import { HeroSlide, HeroSlideFormData, defaultHeroSlideFormData, SlideStyleType } from '@/types/heroSlide';
import { HeroSlideService } from '@/services/heroSlideService';
import { GoogleReviewsService, GoogleReview, PlaceDetails } from '@/services/googleReviewsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAlertDialog } from '@/components/ui/alert-dialog';

// Wizard steps configuration
const WIZARD_STEPS = [
  { id: 1, title: 'Style Type', description: 'Choose slide layout' },
  { id: 2, title: 'Content', description: 'Add your slide text' },
  { id: 3, title: 'Media', description: 'Upload background image/video' },
  { id: 4, title: 'Button & Style', description: 'Configure button and appearance' },
  { id: 5, title: 'Review', description: 'Preview and publish' }
];

export default function HeroCarouselManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState<HeroSlideFormData>(defaultHeroSlideFormData);
  const [submitting, setSubmitting] = useState(false);
  const [previewSlide, setPreviewSlide] = useState<HeroSlideFormData | null>(null);
  const [wizardStep, setWizardStep] = useState(1);
  const { showAlert, showConfirm, AlertDialogComponent } = useAlertDialog();
  
  // Google Reviews state
  const [googleReviews, setGoogleReviews] = useState<GoogleReview[]>([]);
  const [googlePlaceDetails, setGooglePlaceDetails] = useState<PlaceDetails | null>(null);
  const [loadingGoogleReviews, setLoadingGoogleReviews] = useState(false);
  const [showGoogleReviewPicker, setShowGoogleReviewPicker] = useState(false);

  useEffect(() => {
    loadSlides();
  }, []);

  // Load Google Reviews when selecting google-review style
  const loadGoogleReviews = async () => {
    setLoadingGoogleReviews(true);
    const result = await GoogleReviewsService.getReviews();
    if (result.success && result.data) {
      setGooglePlaceDetails(result.data);
      setGoogleReviews(result.data.reviews || []);
    }
    setLoadingGoogleReviews(false);
  };

  // Handle selecting a Google Review to populate form
  const handleSelectGoogleReview = (review: GoogleReview) => {
    setFormData({
      ...formData,
      reviewerName: review.author_name,
      reviewRating: review.rating,
      reviewDate: new Date(review.time * 1000).toISOString().split('T')[0],
      reviewText: review.text,
      afterPhoto: review.profile_photo_url || '',
      title: 'What Our Clients Say'
    });
    setShowGoogleReviewPicker(false);
  };

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
    setWizardStep(1);
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
      order: slide.order,
      styleType: slide.styleType || 'standard',
      reviewerName: slide.reviewerName || '',
      reviewRating: slide.reviewRating || 5,
      reviewDate: slide.reviewDate || '',
      reviewText: slide.reviewText || '',
      afterPhoto: slide.afterPhoto || '',
      certificationName: slide.certificationName || '',
      certificationOrg: slide.certificationOrg || '',
      certificationYear: slide.certificationYear || '',
      certificationBadge: slide.certificationBadge || ''
    });
    setWizardStep(1);
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
                        order: slide.order,
                        styleType: slide.styleType || 'standard',
                        reviewerName: slide.reviewerName || '',
                        reviewRating: slide.reviewRating || 5,
                        reviewDate: slide.reviewDate || '',
                        reviewText: slide.reviewText || '',
                        afterPhoto: slide.afterPhoto || '',
                        certificationName: slide.certificationName || '',
                        certificationOrg: slide.certificationOrg || '',
                        certificationYear: slide.certificationYear || '',
                        certificationBadge: slide.certificationBadge || ''
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

      {/* Create/Edit Wizard Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingSlide ? 'Edit Slide' : 'Create New Slide'}
              </h3>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={closeModal}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Wizard Progress Bar */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                {WIZARD_STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                          wizardStep > step.id 
                            ? 'bg-green-500 text-white' 
                            : wizardStep === step.id 
                            ? 'bg-[#AD6269] text-white' 
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {wizardStep > step.id ? <i className="fas fa-check"></i> : step.id}
                      </div>
                      <div className="mt-2 text-center">
                        <p className={`text-xs font-medium ${wizardStep >= step.id ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-400 hidden sm:block">{step.description}</p>
                      </div>
                    </div>
                    {index < WIZARD_STEPS.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 rounded ${wizardStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Wizard Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Step 1: Style Type */}
              {wizardStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#AD6269]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-layer-group text-2xl text-[#AD6269]"></i>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900">Choose Slide Style</h4>
                    <p className="text-gray-500 text-sm">Select the type of content you want to showcase</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Standard Slide */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, styleType: 'standard' })}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        formData.styleType === 'standard' 
                          ? 'border-[#AD6269] bg-[#AD6269]/5 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-image text-xl text-gray-600"></i>
                      </div>
                      <h5 className="font-semibold text-gray-900 mb-1">Standard</h5>
                      <p className="text-sm text-gray-500">Classic hero slide with title, subtitle, and call-to-action button</p>
                    </button>

                    {/* Google Review Slide */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, styleType: 'google-review' })}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        formData.styleType === 'google-review' 
                          ? 'border-[#AD6269] bg-[#AD6269]/5 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-star text-xl text-yellow-500"></i>
                      </div>
                      <h5 className="font-semibold text-gray-900 mb-1">Google Review</h5>
                      <p className="text-sm text-gray-500">Showcase a client review with star rating, after photo, and testimonial</p>
                    </button>

                    {/* Certification Slide */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, styleType: 'certification' })}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        formData.styleType === 'certification' 
                          ? 'border-[#AD6269] bg-[#AD6269]/5 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <i className="fas fa-certificate text-xl text-blue-600"></i>
                      </div>
                      <h5 className="font-semibold text-gray-900 mb-1">Certification</h5>
                      <p className="text-sm text-gray-500">Highlight your PMU certifications and professional credentials</p>
                    </button>
                  </div>

                  {/* Style-specific preview hint */}
                  <div className="bg-gray-50 rounded-lg p-4 mt-6">
                    <h6 className="font-medium text-gray-700 mb-2">
                      {formData.styleType === 'standard' && '📷 Standard Slide'}
                      {formData.styleType === 'google-review' && '⭐ Google Review Slide'}
                      {formData.styleType === 'certification' && '🏆 Certification Slide'}
                    </h6>
                    <p className="text-sm text-gray-500">
                      {formData.styleType === 'standard' && 'Perfect for promotional content, announcements, or general branding.'}
                      {formData.styleType === 'google-review' && 'Display a real client review with their before/after photo and star rating to build trust.'}
                      {formData.styleType === 'certification' && 'Showcase your professional certifications to establish credibility and expertise.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Step 2: Content */}
              {wizardStep === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#AD6269]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-heading text-2xl text-[#AD6269]"></i>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {formData.styleType === 'google-review' ? 'Review Details' : 
                       formData.styleType === 'certification' ? 'Certification Details' : 
                       'Add Your Content'}
                    </h4>
                    <p className="text-gray-500 text-sm">
                      {formData.styleType === 'google-review' ? 'Enter the review information' : 
                       formData.styleType === 'certification' ? 'Enter your certification details' : 
                       'Enter the text that will appear on your hero slide'}
                    </p>
                  </div>

                  {/* Standard Content Fields */}
                  {formData.styleType === 'standard' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="WAKE UP FLAWLESS EVERY DAY!"
                          className="text-lg"
                        />
                        <p className="text-xs text-gray-400">This is the main headline of your slide</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="subtitle">Subtitle (colored)</Label>
                          <Input
                            id="subtitle"
                            value={formData.subtitle}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, subtitle: e.target.value })}
                            placeholder="SOFT NATURAL"
                          />
                          <p className="text-xs text-gray-400">Appears in brand color above title</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="highlightText">Highlight Text</Label>
                          <Input
                            id="highlightText"
                            value={formData.highlightText}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, highlightText: e.target.value })}
                            placeholder="PERMANENT MAKEUP"
                          />
                          <p className="text-xs text-gray-400">Appears after subtitle</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <textarea
                          id="description"
                          className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent resize-none"
                          rows={3}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Add a brief description or tagline..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Google Review Content Fields */}
                  {formData.styleType === 'google-review' && (
                    <div className="space-y-4">
                      {/* Import from Google Button */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
                            <div>
                              <p className="font-medium text-gray-900">Import from Google Reviews</p>
                              <p className="text-sm text-gray-500">Pull in real reviews from your Google Business Profile</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            onClick={() => {
                              setShowGoogleReviewPicker(true);
                              if (googleReviews.length === 0) {
                                loadGoogleReviews();
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <i className="fab fa-google mr-2"></i>Import Review
                          </Button>
                        </div>
                      </div>

                      {/* Google Review Picker Modal */}
                      {showGoogleReviewPicker && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
                          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
                                <h3 className="font-semibold text-gray-900">Select a Google Review</h3>
                              </div>
                              <button
                                onClick={() => setShowGoogleReviewPicker(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <i className="fas fa-times text-gray-500"></i>
                              </button>
                            </div>
                            
                            <div className="p-4 overflow-y-auto max-h-[60vh]">
                              {loadingGoogleReviews ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                                  <p className="text-gray-500">Loading Google Reviews...</p>
                                </div>
                              ) : googleReviews.length > 0 ? (
                                <div className="space-y-3">
                                  {googlePlaceDetails && (
                                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                      <p className="font-medium text-gray-900">{googlePlaceDetails.name}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <div className="flex gap-0.5">
                                          {[1,2,3,4,5].map(s => (
                                            <i key={s} className={`fas fa-star text-xs ${s <= googlePlaceDetails.rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                                          ))}
                                        </div>
                                        <span className="text-sm text-gray-500">{googlePlaceDetails.rating} ({googlePlaceDetails.user_ratings_total} reviews)</span>
                                      </div>
                                    </div>
                                  )}
                                  {googleReviews.filter(r => r.rating >= 4).map((review, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => handleSelectGoogleReview(review)}
                                      className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all"
                                    >
                                      <div className="flex items-start gap-3">
                                        {review.profile_photo_url ? (
                                          <img src={review.profile_photo_url} alt="" className="w-10 h-10 rounded-full" />
                                        ) : (
                                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                            <i className="fas fa-user text-gray-400"></i>
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-gray-900">{review.author_name}</span>
                                            <span className="text-xs text-gray-500">{review.relative_time_description}</span>
                                          </div>
                                          <div className="flex gap-0.5 mb-2">
                                            {[1,2,3,4,5].map(s => (
                                              <i key={s} className={`fas fa-star text-xs ${s <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                                            ))}
                                          </div>
                                          <p className="text-sm text-gray-600 line-clamp-2">{review.text}</p>
                                        </div>
                                        <i className="fas fa-chevron-right text-gray-400 mt-3"></i>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-12">
                                  <i className="fas fa-exclamation-circle text-4xl text-gray-300 mb-4"></i>
                                  <p className="text-gray-500 mb-2">No Google Reviews available</p>
                                  <p className="text-sm text-gray-400">Make sure your Google Places API is configured in .env.local</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-3 bg-white text-gray-500">or enter manually</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reviewerName">Reviewer Name <span className="text-red-500">*</span></Label>
                        <Input
                          id="reviewerName"
                          value={formData.reviewerName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, reviewerName: e.target.value })}
                          placeholder="Sarah M."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="reviewRating">Star Rating</Label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setFormData({ ...formData, reviewRating: star })}
                                className="p-2 transition-colors"
                              >
                                <i className={`fas fa-star text-2xl ${star <= formData.reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reviewDate">Review Date</Label>
                          <Input
                            id="reviewDate"
                            type="date"
                            value={formData.reviewDate}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, reviewDate: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reviewText">Review Text <span className="text-red-500">*</span></Label>
                        <textarea
                          id="reviewText"
                          className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent resize-none"
                          rows={4}
                          value={formData.reviewText}
                          onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                          placeholder="Victoria is absolutely amazing! My brows look so natural and I wake up every day feeling confident..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title">Slide Title (optional)</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="What Our Clients Say"
                        />
                        <p className="text-xs text-gray-400">Optional headline above the review</p>
                      </div>
                    </div>
                  )}

                  {/* Certification Content Fields */}
                  {formData.styleType === 'certification' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="certificationName">Certification Name <span className="text-red-500">*</span></Label>
                        <Input
                          id="certificationName"
                          value={formData.certificationName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, certificationName: e.target.value })}
                          placeholder="Master PMU Artist Certification"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="certificationOrg">Issuing Organization</Label>
                          <Input
                            id="certificationOrg"
                            value={formData.certificationOrg}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, certificationOrg: e.target.value })}
                            placeholder="PhiBrows Academy"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="certificationYear">Year Obtained</Label>
                          <Input
                            id="certificationYear"
                            value={formData.certificationYear}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, certificationYear: e.target.value })}
                            placeholder="2023"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title">Slide Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Certified Excellence"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                          id="description"
                          className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#AD6269] focus:border-transparent resize-none"
                          rows={3}
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Trained and certified by industry-leading professionals..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Media */}
              {wizardStep === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#AD6269]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-image text-2xl text-[#AD6269]"></i>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900">Add Background Media</h4>
                    <p className="text-gray-500 text-sm">Upload an image or video for your slide background</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="backgroundImage">Background Image URL <span className="text-red-500">*</span></Label>
                      <Input
                        id="backgroundImage"
                        value={formData.backgroundImage}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, backgroundImage: e.target.value })}
                        placeholder="/images/hero/your-image.jpg"
                      />
                      <p className="text-xs text-gray-400">Enter the path to your image file (e.g., /images/hero/slide1.jpg)</p>
                      {formData.backgroundImage && (
                        <div className="mt-3 h-48 rounded-lg bg-cover bg-center border-2 border-dashed border-gray-300 relative overflow-hidden" style={{ backgroundImage: `url(${formData.backgroundImage})` }}>
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded">Preview</span>
                          </div>
                        </div>
                      )}
                      {!formData.backgroundImage && (
                        <div className="mt-3 h-48 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                          <div className="text-center">
                            <i className="fas fa-image text-4xl text-gray-300 mb-2"></i>
                            <p className="text-gray-400 text-sm">Image preview will appear here</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* After Photo for Google Review */}
                    {formData.styleType === 'google-review' && (
                      <div className="space-y-2">
                        <Label htmlFor="afterPhoto">After Photo URL <span className="text-red-500">*</span></Label>
                        <Input
                          id="afterPhoto"
                          value={formData.afterPhoto}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, afterPhoto: e.target.value })}
                          placeholder="/images/reviews/client-after.jpg"
                        />
                        <p className="text-xs text-gray-400">The client&apos;s after photo to display with the review</p>
                        {formData.afterPhoto && (
                          <div className="mt-3 h-32 w-32 rounded-full bg-cover bg-center border-4 border-white shadow-lg mx-auto" style={{ backgroundImage: `url(${formData.afterPhoto})` }} />
                        )}
                      </div>
                    )}

                    {/* Certification Badge for Certification */}
                    {formData.styleType === 'certification' && (
                      <div className="space-y-2">
                        <Label htmlFor="certificationBadge">Certification Badge/Logo URL</Label>
                        <Input
                          id="certificationBadge"
                          value={formData.certificationBadge}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, certificationBadge: e.target.value })}
                          placeholder="/images/certifications/badge.png"
                        />
                        <p className="text-xs text-gray-400">Optional: Add a certification badge or logo image</p>
                        {formData.certificationBadge && (
                          <div className="mt-3 h-24 w-24 rounded-lg bg-contain bg-center bg-no-repeat border border-gray-200 mx-auto" style={{ backgroundImage: `url(${formData.certificationBadge})` }} />
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="backgroundVideo">Background Video URL (optional)</Label>
                      <Input
                        id="backgroundVideo"
                        value={formData.backgroundVideo}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, backgroundVideo: e.target.value })}
                        placeholder="/videos/hero-video.mp4"
                      />
                      <p className="text-xs text-gray-400">Optional: Add a video that will play behind the content. Image will be used as fallback.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Button & Style */}
              {wizardStep === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#AD6269]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-palette text-2xl text-[#AD6269]"></i>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900">Button & Styling</h4>
                    <p className="text-gray-500 text-sm">Configure the call-to-action button and visual appearance</p>
                  </div>

                  <div className="space-y-6">
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

                    <div className="space-y-2">
                      <Label>Button Style</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['primary', 'secondary', 'outline'] as const).map((style) => (
                          <button
                            key={style}
                            type="button"
                            onClick={() => setFormData({ ...formData, buttonStyle: style })}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              formData.buttonStyle === style 
                                ? 'border-[#AD6269] bg-[#AD6269]/5' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`px-4 py-2 rounded-full text-sm font-medium mx-auto w-fit ${
                              style === 'primary' 
                                ? 'bg-[#AD6269] text-white' 
                                : style === 'secondary'
                                ? 'bg-white text-gray-900 border border-gray-300'
                                : 'bg-transparent border-2 border-gray-400 text-gray-600'
                            }`}>
                              {style.charAt(0).toUpperCase() + style.slice(1)}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Text Alignment</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['left', 'center', 'right'] as const).map((align) => (
                          <button
                            key={align}
                            type="button"
                            onClick={() => setFormData({ ...formData, textAlignment: align })}
                            className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                              formData.textAlignment === align 
                                ? 'border-[#AD6269] bg-[#AD6269]/5' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <i className={`fas fa-align-${align} text-xl ${formData.textAlignment === align ? 'text-[#AD6269]' : 'text-gray-400'}`}></i>
                            <span className="text-sm font-medium capitalize">{align}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="overlayOpacity">Overlay Darkness: {formData.overlayOpacity}%</Label>
                      <input
                        type="range"
                        id="overlayOpacity"
                        min="0"
                        max="100"
                        value={formData.overlayOpacity}
                        onChange={(e) => setFormData({ ...formData, overlayOpacity: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#AD6269]"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>No overlay</span>
                        <span>Full dark</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Review */}
              {wizardStep === 5 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-check-circle text-2xl text-green-600"></i>
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900">Review & Publish</h4>
                    <p className="text-gray-500 text-sm">Preview your slide and publish when ready</p>
                  </div>

                  {/* Mini Preview - Standard */}
                  {formData.styleType === 'standard' && (
                    <div 
                      className="relative h-64 rounded-xl overflow-hidden bg-cover bg-center"
                      style={{ backgroundImage: `url(${formData.backgroundImage})` }}
                    >
                      <div className="absolute inset-0 bg-black" style={{ opacity: formData.overlayOpacity / 100 }} />
                      <div className={`absolute inset-0 flex items-center p-8 ${
                        formData.textAlignment === 'left' ? 'justify-start text-left' : 
                        formData.textAlignment === 'right' ? 'justify-end text-right' : 
                        'justify-center text-center'
                      }`}>
                        <div className="max-w-md">
                          {formData.subtitle && (
                            <p className="text-white/80 text-sm mb-1">
                              <span className="text-[#AD6269]">{formData.subtitle}</span>
                              {formData.highlightText && ` ${formData.highlightText}`}
                            </p>
                          )}
                          <h3 className="text-white text-2xl font-bold mb-2">{formData.title || 'Your Title Here'}</h3>
                          {formData.description && <p className="text-white/70 text-sm mb-3">{formData.description}</p>}
                          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-medium ${
                            formData.buttonStyle === 'secondary' 
                              ? 'bg-white text-gray-900' 
                              : formData.buttonStyle === 'outline'
                              ? 'border border-white text-white'
                              : 'bg-[#AD6269] text-white'
                          }`}>
                            {formData.buttonText || 'Book Now'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mini Preview - Google Review */}
                  {formData.styleType === 'google-review' && (
                    <div 
                      className="relative h-72 rounded-xl overflow-hidden bg-cover bg-center"
                      style={{ backgroundImage: `url(${formData.backgroundImage})` }}
                    >
                      <div className="absolute inset-0 bg-black" style={{ opacity: formData.overlayOpacity / 100 }} />
                      <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="bg-white/95 rounded-2xl p-6 max-w-lg shadow-xl">
                          <div className="flex items-start gap-4">
                            {formData.afterPhoto && (
                              <div className="w-20 h-20 rounded-full bg-cover bg-center flex-shrink-0 border-4 border-[#AD6269]" style={{ backgroundImage: `url(${formData.afterPhoto})` }} />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">{formData.reviewerName || 'Client Name'}</span>
                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                              </div>
                              <div className="flex gap-0.5 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <i key={star} className={`fas fa-star text-sm ${star <= formData.reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                                ))}
                                <span className="text-xs text-gray-500 ml-2">{formData.reviewDate}</span>
                              </div>
                              <p className="text-gray-700 text-sm line-clamp-3">&ldquo;{formData.reviewText || 'Review text...'}&rdquo;</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mini Preview - Certification */}
                  {formData.styleType === 'certification' && (
                    <div 
                      className="relative h-72 rounded-xl overflow-hidden bg-cover bg-center"
                      style={{ backgroundImage: `url(${formData.backgroundImage})` }}
                    >
                      <div className="absolute inset-0 bg-black" style={{ opacity: formData.overlayOpacity / 100 }} />
                      <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="text-center">
                          {formData.certificationBadge && (
                            <div className="w-24 h-24 mx-auto mb-4 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${formData.certificationBadge})` }} />
                          )}
                          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                            <i className="fas fa-certificate text-3xl text-[#AD6269] mb-3"></i>
                            <h3 className="text-white text-xl font-bold mb-1">{formData.certificationName || 'Certification Name'}</h3>
                            <p className="text-white/80 text-sm">{formData.certificationOrg}</p>
                            {formData.certificationYear && <p className="text-white/60 text-xs mt-1">Certified {formData.certificationYear}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => openPreview()}
                    className="w-full py-3 rounded-lg border-2 border-purple-200 text-purple-600 font-medium hover:bg-purple-50 transition-colors"
                  >
                    <i className="fas fa-expand mr-2"></i>View Full Screen Preview
                  </button>

                  {/* Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <h5 className="font-medium text-gray-900 mb-3">Slide Summary</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-gray-500">Style:</span> <span className="font-medium capitalize">{formData.styleType.replace('-', ' ')}</span></div>
                      <div><span className="text-gray-500">Button:</span> <span className="font-medium">{formData.buttonText} → {formData.buttonLink}</span></div>
                      <div><span className="text-gray-500">Alignment:</span> <span className="font-medium capitalize">{formData.textAlignment}</span></div>
                      <div><span className="text-gray-500">Overlay:</span> <span className="font-medium">{formData.overlayOpacity}%</span></div>
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <label className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded border-gray-300 text-[#AD6269] focus:ring-[#AD6269]"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <div>
                      <span className="font-medium text-gray-900">Publish slide immediately</span>
                      <p className="text-sm text-gray-500">When enabled, this slide will be visible on the website</p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div>
                {wizardStep > 1 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setWizardStep(wizardStep - 1)}
                  >
                    <i className="fas fa-arrow-left mr-2"></i>Back
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                {wizardStep < 5 ? (
                  <Button 
                    type="button" 
                    className="bg-[#AD6269] hover:bg-[#9d5860]"
                    onClick={() => {
                      // Validation based on step and style type
                      if (wizardStep === 2) {
                        if (formData.styleType === 'standard' && !formData.title) {
                          showAlert({ title: 'Required Field', description: 'Please enter a title for your slide', variant: 'warning' });
                          return;
                        }
                        if (formData.styleType === 'google-review' && (!formData.reviewerName || !formData.reviewText)) {
                          showAlert({ title: 'Required Field', description: 'Please enter the reviewer name and review text', variant: 'warning' });
                          return;
                        }
                        if (formData.styleType === 'certification' && !formData.certificationName) {
                          showAlert({ title: 'Required Field', description: 'Please enter the certification name', variant: 'warning' });
                          return;
                        }
                      }
                      if (wizardStep === 3 && !formData.backgroundImage) {
                        showAlert({ title: 'Required Field', description: 'Please enter a background image URL', variant: 'warning' });
                        return;
                      }
                      if (wizardStep === 3 && formData.styleType === 'google-review' && !formData.afterPhoto) {
                        showAlert({ title: 'Required Field', description: 'Please enter an after photo URL for the review', variant: 'warning' });
                        return;
                      }
                      setWizardStep(wizardStep + 1);
                    }}
                  >
                    Next<i className="fas fa-arrow-right ml-2"></i>
                  </Button>
                ) : (
                  <Button 
                    type="button"
                    className="bg-[#AD6269] hover:bg-[#9d5860]" 
                    disabled={submitting}
                    onClick={handleSubmit}
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check mr-2"></i>
                        {editingSlide ? 'Update Slide' : 'Create Slide'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
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
