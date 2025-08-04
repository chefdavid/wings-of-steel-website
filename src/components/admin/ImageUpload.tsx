import { useState, useRef, useCallback } from 'react';
import { FaUpload, FaTimes, FaImage } from 'react-icons/fa';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  placeholder?: string;
}

const ImageUpload = ({ currentImage, onImageChange }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string>(currentImage || '');
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Convert file to base64 for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
      };
      reader.readAsDataURL(file);

      // In a real application, you would upload to Supabase Storage
      // For now, we'll simulate an upload and use the file data URL
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use the file's data URL as the image URL
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onImageChange(dataUrl);
      };
      fileReader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
      setPreview(currentImage || '');
    } finally {
      setUploading(false);
    }
  }, [currentImage, onImageChange]);

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
        <strong>💡 Tip:</strong> You can drag and drop images directly onto the photo area, use the file picker, or enter an image URL.
        <br />
        <strong>Note:</strong> File uploads are simulated in this demo. In production, images would be stored in Supabase Storage.
      </div>
    </div>
  );
};

export default ImageUpload;