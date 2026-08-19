import { useState, useRef, useCallback } from 'react';
import { FaUpload, FaTimes, FaImage, FaCrop } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient';
import ImageCropModal from './ImageCropModal';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  placeholder?: string;
}

const ImageUpload = ({ currentImage, onImageChange }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read the picked file into a data URL and open the crop modal. Actual
  // upload happens after the user confirms the crop.
  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCropSrc(dataUrl);
    };
    reader.onerror = () => alert('Could not read file. Please try again.');
    reader.readAsDataURL(file);
  }, []);

  // Upload the cropped Blob produced by ImageCropModal.
  const uploadCroppedBlob = useCallback(async (blob: Blob) => {
    setCropSrc(null);
    setUploading(true);

    // Show local preview while uploading.
    const previewUrl = URL.createObjectURL(blob);
    setPreview(previewUrl);

    try {
      const path = `players/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('game-photos')
        .upload(path, blob, { upsert: false, contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('game-photos')
        .getPublicUrl(path);

      URL.revokeObjectURL(previewUrl);
      setPreview(publicUrl);
      onImageChange(publicUrl);
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert('Upload failed: ' + (error?.message || 'Please try again.'));
      URL.revokeObjectURL(previewUrl);
      setPreview(currentImage || '');
    } finally {
      setUploading(false);
    }
  }, [currentImage, onImageChange]);

  // Re-open the crop modal for the existing image (lets the admin reposition
  // a photo without re-uploading from disk).
  const openRecrop = useCallback(() => {
    if (!preview) return;
    setCropSrc(preview);
  }, [preview]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, [processFile]);

  const handleRemove = () => {
    setPreview('');
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (url: string) => {
    setPreview(url);
    onImageChange(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <div 
          className="relative"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className={`w-32 h-32 rounded-full object-cover border-4 transition-all ${
                  isDragOver
                    ? 'border-steel-blue border-dashed scale-105'
                    : 'border-gray-200'
                }`}
              />
              <button
                type="button"
                onClick={openRecrop}
                title="Reposition / re-crop"
                className="absolute -top-2 -left-2 bg-steel-blue text-white rounded-full p-2 hover:bg-blue-600 transition-colors shadow"
              >
                <FaCrop className="text-xs" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
              {isDragOver && (
                <div className="absolute inset-0 rounded-full bg-steel-blue bg-opacity-20 flex items-center justify-center">
                  <FaUpload className="text-steel-blue text-xl" />
                </div>
              )}
            </div>
          ) : (
            <div 
              className={`w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center transition-all cursor-pointer ${
                isDragOver 
                  ? 'border-steel-blue bg-blue-50 scale-105' 
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {isDragOver ? (
                <FaUpload className="text-steel-blue text-2xl" />
              ) : (
                <div className="text-center">
                  <FaImage className="text-gray-400 text-2xl mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Drop image here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Photo
          </label>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-steel-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaUpload className="text-sm" />
              {uploading ? 'Uploading...' : 'Choose File'}
            </button>
            <span className="text-sm text-gray-500">
              Max 5MB, JPG/PNG
            </span>
          </div>
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or enter image URL
          </label>
          <input
            type="text"
            value={preview}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-steel-blue focus:border-transparent outline-none"
            placeholder="https://example.com/photo.jpg"
          />
        </div>
      </div>

      {uploading && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-steel-blue">
            <div className="w-4 h-4 border-2 border-steel-blue border-t-transparent rounded-full animate-spin"></div>
            Uploading image...
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-md">
        <strong>💡 Tip:</strong> Drop or pick an image, then drag and zoom to position it. Tap the crop icon on an existing photo to reposition without re-uploading.
      </div>

      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          onCancel={() => setCropSrc(null)}
          onConfirm={uploadCroppedBlob}
        />
      )}
    </div>
  );
};

export default ImageUpload;