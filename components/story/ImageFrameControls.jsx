export default function ImageFrameControls({
  hasImage,
  zoom,
  onReplace,
  onRemove,
  onZoomChange,
  onReset
}) {
  return (
    <div className="editor-grid">
      <button type="button" className="copy-btn" onClick={onReplace}>
        Replace Image
      </button>
      <button type="button" className="ghost-link" onClick={onRemove} disabled={!hasImage}>
        Remove Image
      </button>

      <label>
        Zoom
        <input
          type="range"
          min={1}
          max={4}
          step={0.01}
          value={zoom || 1}
          onChange={(event) => onZoomChange?.(Number(event.target.value))}
          disabled={!hasImage}
        />
      </label>

      <button type="button" className="copy-btn" onClick={onReset} disabled={!hasImage}>
        Reset Position
      </button>
    </div>
  );
}
