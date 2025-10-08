/**
 * Image compression and optimization utilities
 * Automatically resizes and compresses images for web use
 */

export interface CompressedImageResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: 'image/jpeg' | 'image/webp' | 'image/png';
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.80, // Reduced from 0.85 for better compression
  outputFormat: 'image/jpeg',
};

// Skip compression if file is already small enough
const SKIP_COMPRESSION_THRESHOLD = 300 * 1024; // 300KB

/**
 * Compress a single image file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedImageResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const originalSize = file.size;

  // If file is already small and optimized, skip compression
  if (originalSize < SKIP_COMPRESSION_THRESHOLD && file.type === 'image/jpeg') {
    console.log(`Skipping compression for ${file.name} - already optimized (${formatFileSize(originalSize)})`);
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
    };
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read file'));

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error('Failed to load image'));

      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let { width, height } = img;

          if (width > opts.maxWidth || height > opts.maxHeight) {
            const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Use better image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw image
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'));
                return;
              }

              const compressedSize = blob.size;

              // If compressed version is larger or not significantly smaller, use original
              if (compressedSize >= originalSize * 0.95) {
                console.log(`Compression didn't help for ${file.name} - using original`);
                console.log(`Original: ${formatFileSize(originalSize)}, Compressed: ${formatFileSize(compressedSize)}`);

                resolve({
                  file,
                  originalSize,
                  compressedSize: originalSize,
                  compressionRatio: 0,
                });
                return;
              }

              // Create new file from blob
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, '.jpg'), // Change extension to .jpg
                {
                  type: opts.outputFormat,
                  lastModified: Date.now(),
                }
              );

              console.log(`Compressed ${file.name}: ${formatFileSize(originalSize)} → ${formatFileSize(compressedSize)} (${Math.round((1 - compressedSize / originalSize) * 100)}% reduction)`);

              resolve({
                file: compressedFile,
                originalSize,
                compressedSize,
                compressionRatio: Math.round((1 - compressedSize / originalSize) * 100),
              });
            },
            opts.outputFormat,
            opts.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress multiple images
 */
export async function compressMultipleImages(
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (current: number, total: number) => void
): Promise<CompressedImageResult[]> {
  const results: CompressedImageResult[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await compressImage(files[i], options);
      results.push(result);

      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    } catch (error) {
      console.error(`Failed to compress ${files[i].name}:`, error);
      // Continue with other files even if one fails
    }
  }

  return results;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate if file is an image
 */
export function isValidImage(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Validate file size (default max 10MB before compression)
 */
export function isValidFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}
