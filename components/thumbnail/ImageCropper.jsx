'use client';

import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
}

async function getCroppedDataUrl(imageSrc, cropPixels) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = cropPixels.width;
  canvas.height = cropPixels.height;

  context.drawImage(
    image,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height
  );

  return canvas.toDataURL('image/jpeg', 0.92);
}

export default function ImageCropper({ imageSrc, onComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropPixels, setCropPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleCropComplete = useCallback((_, pixels) => {
    setCropPixels(pixels);
  }, []);

  async function applyCrop() {
    if (!cropPixels) {
      return;
    }

    setProcessing(true);
    try {
      const cropped = await getCroppedDataUrl(imageSrc, cropPixels);
      onComplete(cropped);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="cropper-shell">
      <div className="cropper-area">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={handleCropComplete}
        />
      </div>
      <div className="cropper-controls">
        <label>
          Zoom
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          />
        </label>
        <button type="button" className="copy-btn" onClick={applyCrop} disabled={processing}>
          {processing ? 'Applying...' : 'Apply Crop'}
        </button>
      </div>
    </div>
  );
}
