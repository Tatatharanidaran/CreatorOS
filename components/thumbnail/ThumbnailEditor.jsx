'use client';

import { useEffect, useMemo, useState } from 'react';
import { exportThumbnail } from '../../utils/canvasExport';
import { loadGoogleFont } from '../../utils/fontLoader';
import FontSelector from '../design/FontSelector';
import TextStylePresets from '../design/TextStylePresets';
import ImageCropper from './ImageCropper';

export default function ThumbnailEditor() {
  const [imageSrc, setImageSrc] = useState('');
  const [croppedSrc, setCroppedSrc] = useState('');
  const [overlayText, setOverlayText] = useState('');
  const [style, setStyle] = useState({
    fontFamily: 'Poppins',
    size: 56,
    fontWeight: 700,
    italic: false,
    color: '#ffffff',
    uppercase: false,
    align: 'left',
    gradient: false,
    x: 70,
    y: 860
  });
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadGoogleFont(style.fontFamily);
  }, [style.fontFamily]);

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

  function removeImage() {
    setImageSrc('');
    setCroppedSrc('');
  }

  function patchStyle(data) {
    setStyle((prev) => ({ ...prev, ...data }));
  }

  const preview = useMemo(() => croppedSrc || imageSrc, [croppedSrc, imageSrc]);

  async function download() {
    if (!preview) {
      return;
    }

    setDownloading(true);
    try {
      await exportThumbnail({ imageSrc: preview, overlayText, textStyle: style });
    } finally {
      setDownloading(false);
    }
  }

  const previewText = style.uppercase ? overlayText.toUpperCase() : overlayText;

  return (
    <section className="stack-layout">
      <section className="panel">
        <h2>Thumbnail Creator</h2>
        <label>
          Upload image
          <input type="file" accept="image/*" onChange={onFileChange} />
        </label>
        <button type="button" className="copy-btn" onClick={removeImage} disabled={!imageSrc && !croppedSrc}>
          Remove image
        </button>

        <label>
          Overlay text (optional)
          <input value={overlayText} onChange={(event) => setOverlayText(event.target.value)} placeholder="Add title text" />
        </label>

        <FontSelector value={style.fontFamily} onChange={(fontFamily) => patchStyle({ fontFamily })} />

        <TextStylePresets
          onApply={(preset) =>
            patchStyle({
              fontFamily: preset.fontFamily,
              size: preset.fontSize,
              fontWeight: preset.fontWeight,
              italic: preset.italic,
              color: preset.color,
              uppercase: preset.uppercase,
              align: preset.align,
              gradient: preset.gradient
            })
          }
        />

        <div className="thumb-controls">
          <label>
            Text size
            <input type="range" min={24} max={96} value={style.size} onChange={(event) => patchStyle({ size: Number(event.target.value) })} />
          </label>
          <label>
            Text X
            <input type="range" min={20} max={900} value={style.x} onChange={(event) => patchStyle({ x: Number(event.target.value) })} />
          </label>
          <label>
            Text Y
            <input type="range" min={120} max={1040} value={style.y} onChange={(event) => patchStyle({ y: Number(event.target.value) })} />
          </label>
          <label>
            Color
            <input type="color" value={style.color} onChange={(event) => patchStyle({ color: event.target.value })} />
          </label>
          <label>
            Alignment
            <select value={style.align} onChange={(event) => patchStyle({ align: event.target.value })}>
              <option value="left">Left</option>
              <option value="center">Center</option>
            </select>
          </label>
        </div>

        <button type="button" className="primary-btn" onClick={download} disabled={!preview || downloading}>
          {downloading ? 'Downloading...' : 'Download Thumbnail'}
        </button>
      </section>

      <section className="panel">
        <h2>Preview</h2>
        {imageSrc ? <ImageCropper imageSrc={imageSrc} onComplete={setCroppedSrc} /> : <p className="empty">Upload image to start editing.</p>}
        <div className="thumbnail-preview-box">
          {preview ? (
            <div className="thumbnail-surface">
              <img src={preview} alt="Thumbnail preview" />
              {overlayText ? (
                <p
                  className="overlay-preview"
                  style={{
                    fontFamily: `"${style.fontFamily}", sans-serif`,
                    fontWeight: style.fontWeight,
                    fontStyle: style.italic ? 'italic' : 'normal',
                    color: style.gradient ? '#f9a8d4' : style.color,
                    textTransform: style.uppercase ? 'uppercase' : 'none',
                    textAlign: style.align,
                    fontSize: `${Math.max(16, style.size / 3)}px`,
                    left: `${(style.x / 1080) * 100}%`,
                    top: `${(style.y / 1080) * 100}%`
                  }}
                >
                  {previewText}
                </p>
              ) : null}
            </div>
          ) : (
            <p className="empty">No preview yet.</p>
          )}
        </div>
      </section>
    </section>
  );
}
