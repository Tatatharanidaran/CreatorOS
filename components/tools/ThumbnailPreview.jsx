'use client';

import { useMemo, useState } from 'react';
import ImageCropper from './ImageCropper';
import { downloadThumbnailPng } from '../../utils/canvasDownload';

export default function ThumbnailPreview() {
  const [imageSrc, setImageSrc] = useState('');
  const [croppedSrc, setCroppedSrc] = useState('');
  const [overlayText, setOverlayText] = useState('');
  const [activeCell, setActiveCell] = useState(4);
  const [repositionMode, setRepositionMode] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [gridImages, setGridImages] = useState(() => Array(9).fill(''));

  function onFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = `${reader.result || ''}`;
      setImageSrc(result);
      setCroppedSrc('');
    };
    reader.readAsDataURL(file);
  }

  const previewSrc = useMemo(() => croppedSrc || imageSrc, [croppedSrc, imageSrc]);

  function handleCropComplete(dataUrl) {
    setCroppedSrc(dataUrl);
    setGridImages((prev) => {
      const next = [...prev];
      next[activeCell] = dataUrl;
      return next;
    });
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadThumbnailPng({ imageSrc: previewSrc, overlayText });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="output-block">
      <div className="output-head">
        <h3>Thumbnail Preview</h3>
      </div>

      <label className="upload-label">
        Upload image
        <input type="file" accept="image/*" onChange={onFileChange} />
      </label>

      <label>
        Optional text overlay
        <input
          type="text"
          value={overlayText}
          onChange={(event) => setOverlayText(event.target.value)}
          placeholder="Add headline text on thumbnail"
        />
      </label>

      {imageSrc ? <ImageCropper imageSrc={imageSrc} onComplete={handleCropComplete} /> : null}

      <div className="thumb-preview">
        <div className="thumb-preview-head">
          <h4>Feed Grid Preview (1:1)</h4>
          <div className="group-actions">
            <button type="button" className="copy-btn" onClick={() => setRepositionMode((prev) => !prev)}>
              {repositionMode ? 'Cancel Move' : 'Change Position'}
            </button>
            <button type="button" className="copy-btn" onClick={handleDownload} disabled={!previewSrc || downloading}>
              {downloading ? 'Downloading...' : 'Download Thumbnail'}
            </button>
          </div>
        </div>
        <p className="thumb-note">
          {repositionMode ? 'Tap a cell to place the thumbnail.' : 'Position is locked to avoid accidental moves.'}
        </p>
        <div className="thumb-grid">
          {Array.from({ length: 9 }).map((_, index) => {
            const isActive = activeCell === index;
            return (
              <button
                key={`cell-${index}`}
                type="button"
                className={`thumb-cell ${isActive ? 'active' : 'muted'} ${repositionMode ? 'selectable' : ''}`}
                onClick={() => {
                  if (!repositionMode) {
                    return;
                  }
                  setActiveCell(index);
                  setRepositionMode(false);
                }}
              >
                {(() => {
                  const cellImage = gridImages[index];
                  const activePreview = isActive ? previewSrc : '';
                  const imageToShow = activePreview || cellImage;

                  if (imageToShow) {
                    return <img src={imageToShow} alt="Thumbnail preview" />;
                  }
                  return isActive ? <span>No preview yet</span> : null;
                })()}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
