'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ServiceImageService } from '@/services/database';
import { ServiceImage } from '@/types/database';
import { Button } from '@/components/ui/button';

interface ImageManagerProps {
  selectedImage: string;
  onSelect: (base64Image: string) => void;
}

const MAX_FILE_SIZE_MB = 2;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];

export default function ImageManager({ selectedImage, onSelect }: ImageManagerProps) {
  const [images, setImages] = useState<ServiceImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allImages = await ServiceImageService.getAllImages();
      setImages(allImages);
    } catch (err) {
      console.error('Error loading images:', err);
      setError('Failed to load images');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only PNG, JPG, WebP, and GIF images are allowed');
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`Image must be smaller than ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const base64 = await fileToBase64(file);
      const id = await ServiceImageService.createImage({
        name: file.name,
        base64,
        mimeType: file.type,
        size: file.size
      });
      console.log('Uploaded image:', id);
      onSelect(base64);
      await loadImages();
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent, image: ServiceImage) => {
    e.stopPropagation();
    if (!confirm(`Delete "${image.name}"? This cannot be undone.`)) return;

    try {
      await ServiceImageService.deleteImage(image.id);
      if (selectedImage === image.base64) {
        onSelect('');
      }
      await loadImages();
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete image');
    }
  };

  const isSelected = (image: ServiceImage) => selectedImage === image.base64;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AD6269]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Upload area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
          onChange={handleFileChange}
          className="hidden"
          id="image-upload-input"
        />
        <label
          htmlFor="image-upload-input"
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <i className="fas fa-cloud-upload-alt text-3xl text-[#AD6269] mb-2"></i>
          <span className="font-semibold text-gray-700">
            {uploading ? 'Uploading...' : 'Click to upload image'}
          </span>
          <span className="text-xs text-gray-500 mt-1">
            PNG, JPG, WebP, GIF up to {MAX_FILE_SIZE_MB}MB
          </span>
        </label>
      </div>

      {/* Image grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-white">
          {images.map((image) => (
            <div
              key={image.id}
              onClick={() => onSelect(isSelected(image) ? '' : image.base64)}
              className={`relative aspect-square rounded-lg border-2 cursor-pointer overflow-hidden group ${
                isSelected(image)
                  ? 'border-[#AD6269] ring-2 ring-[#AD6269] ring-opacity-50'
                  : 'border-gray-200 hover:border-[#AD6269]'
              }`}
            >
              <img
                src={image.base64}
                alt={image.name}
                className="w-full h-full object-cover"
              />
              {isSelected(image) && (
                <div className="absolute top-1 right-1 bg-[#AD6269] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  <i className="fas fa-check"></i>
                </div>
              )}
              <button
                type="button"
                onClick={(e) => handleDelete(e, image)}
                className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete image"
              >
                <i className="fas fa-trash"></i>
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate">
                {image.name}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <i className="fas fa-images text-2xl mb-2"></i>
          <p className="text-sm">No images yet. Upload one above.</p>
        </div>
      )}

      {selectedImage && (
        <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
          <p className="text-sm font-semibold text-gray-700 mb-2">Selected Preview</p>
          <img
            src={selectedImage}
            alt="Selected service image"
            className="h-24 w-auto rounded object-cover border border-gray-200"
          />
        </div>
      )}
    </div>
  );
}
