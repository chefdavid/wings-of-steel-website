import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { FaTimes, FaCheck } from 'react-icons/fa';

interface ImageCropModalProps {
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (croppedBlob: Blob) => void;
}

// Renders a 1:1 circular crop UI. Pan + pinch-zoom; on confirm, exports a
// cropped JPEG Blob ready to upload.
export default function ImageCropModal({ imageSrc, onCancel, onConfirm }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_: Area, areaPx: Area) => {
    setCroppedAreaPixels(areaPx);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setBusy(true);
    try {
      const blob = await getCroppedJpeg(imageSrc, croppedAreaPixels);
      onConfirm(blob);
    } catch (e: any) {
      console.error('Crop failed:', e);
      alert('Crop failed: ' + (e?.message || 'unknown error'));
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">Position & Crop Photo</h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
            disabled={busy}
          >
            <FaTimes />
          </button>
        </div>

        <div className="relative w-full" style={{ height: 420, background: '#1a1a1a' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 w-12">Zoom</span>
            <input
              type="range"
              min={1}
              max={4}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-steel-blue"
            />
            <span className="text-xs text-gray-500 w-10 text-right">{zoom.toFixed(2)}x</span>
          </div>
          <p className="text-xs text-gray-500">
            Drag to position, scroll or use the slider to zoom.
          </p>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy || !croppedAreaPixels}
            className="flex items-center gap-2 px-4 py-2 bg-steel-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            <FaCheck /> {busy ? 'Saving…' : 'Use this crop'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Render the cropped region of `imageSrc` (a data URL or object URL) into a
// canvas, then export as a JPEG Blob. JPEG (not PNG) keeps file size small
// and avatars don't need transparency.
async function getCroppedJpeg(imageSrc: string, area: Area): Promise<Blob> {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');

  // Cap output at 800px square — big enough for retina rendering, keeps the
  // file under ~150KB for typical photos.
  const target = 800;
  canvas.width = target;
  canvas.height = target;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  ctx.drawImage(
    img,
    area.x, area.y, area.width, area.height,
    0, 0, target, target
  );

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas was empty'))),
      'image/jpeg',
      0.9
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image for cropping'));
    img.src = src;
  });
}
