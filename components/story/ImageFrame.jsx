import { useEffect, useMemo, useRef, useState } from 'react';
import {
  clampOffsets,
  clampZoom,
  getCoverBaseScale,
  getDefaultFrameState,
  getScaledImageSize,
  getZoomAroundPoint
} from '../../utils/imageFrameHandler';

export default function ImageFrame({
  src,
  frameWidth,
  frameHeight,
  frame,
  selected,
  scale = 1,
  onChange,
  onRequestSelect,
  onRequestUpload
}) {
  const containerRef = useRef(null);
  const dragRef = useRef(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  const effectiveFrame = useMemo(() => {
    const imageWidth = frame?.imageWidth || naturalSize.width || 0;
    const imageHeight = frame?.imageHeight || naturalSize.height || 0;
    const zoom = frame?.zoom || 1;
    const offsetX = frame?.offsetX ?? 0;
    const offsetY = frame?.offsetY ?? 0;

    return {
      zoom,
      offsetX,
      offsetY,
      imageWidth,
      imageHeight
    };
  }, [frame, naturalSize.height, naturalSize.width]);

  useEffect(() => {
    if (!src) {
      return;
    }

    let alive = true;
    const image = new Image();
    image.onload = () => {
      if (!alive) {
        return;
      }
      const width = image.naturalWidth || 0;
      const height = image.naturalHeight || 0;
      setNaturalSize({ width, height });

      if (width && height && (!frame?.imageWidth || !frame?.imageHeight)) {
        const base = getDefaultFrameState({
          frameWidth,
          frameHeight,
          imageWidth: width,
          imageHeight: height
        });
        onChange?.(base);
      }
    };
    image.src = src;

    return () => {
      alive = false;
    };
  }, [src, frame?.imageHeight, frame?.imageWidth, frameHeight, frameWidth, onChange]);

  const computed = useMemo(() => {
    if (!src || !effectiveFrame.imageWidth || !effectiveFrame.imageHeight) {
      return null;
    }

    const baseScale = getCoverBaseScale({
      frameWidth,
      frameHeight,
      imageWidth: effectiveFrame.imageWidth,
      imageHeight: effectiveFrame.imageHeight
    });

    const { scaledWidth, scaledHeight } = getScaledImageSize({
      imageWidth: effectiveFrame.imageWidth,
      imageHeight: effectiveFrame.imageHeight,
      frameWidth,
      frameHeight,
      zoom: effectiveFrame.zoom
    });

    const normalized = clampOffsets({
      offsetX: effectiveFrame.offsetX,
      offsetY: effectiveFrame.offsetY,
      imageWidth: effectiveFrame.imageWidth,
      imageHeight: effectiveFrame.imageHeight,
      frameWidth,
      frameHeight,
      zoom: effectiveFrame.zoom
    });

    return {
      baseScale,
      scaledWidth,
      scaledHeight,
      offsetX: normalized.offsetX,
      offsetY: normalized.offsetY
    };
  }, [effectiveFrame, frameHeight, frameWidth, src]);

  function getPointerInFrame(event) {
    if (!containerRef.current) {
      return { x: 0, y: 0 };
    }
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / scale,
      y: (event.clientY - rect.top) / scale
    };
  }

  function onPointerDown(event) {
    if (!src) {
      onRequestSelect?.();
      return;
    }
    if (!selected) {
      onRequestSelect?.();
    }

    const pointer = getPointerInFrame(event);
    dragRef.current = {
      startX: pointer.x,
      startY: pointer.y,
      baseOffsetX: effectiveFrame.offsetX ?? 0,
      baseOffsetY: effectiveFrame.offsetY ?? 0
    };
  }

  useEffect(() => {
    function onMove(event) {
      if (!dragRef.current || !src) {
        return;
      }
      const pointer = getPointerInFrame(event);
      const dx = pointer.x - dragRef.current.startX;
      const dy = pointer.y - dragRef.current.startY;

      const next = clampOffsets({
        offsetX: (dragRef.current.baseOffsetX || 0) + dx,
        offsetY: (dragRef.current.baseOffsetY || 0) + dy,
        imageWidth: effectiveFrame.imageWidth,
        imageHeight: effectiveFrame.imageHeight,
        frameWidth,
        frameHeight,
        zoom: effectiveFrame.zoom
      });

      onChange?.({
        ...effectiveFrame,
        ...next
      });
    }

    function onUp() {
      dragRef.current = null;
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [effectiveFrame, frameHeight, frameWidth, onChange, scale, src]);

  function onWheel(event) {
    if (!selected || !src) {
      return;
    }

    event.preventDefault();
    const delta = event.deltaY;
    const direction = delta > 0 ? -1 : 1;
    const step = event.ctrlKey || event.metaKey ? 0.18 : 0.1;

    const nextZoom = clampZoom((effectiveFrame.zoom || 1) + direction * step);
    const pointer = getPointerInFrame(event);

    const anchored = getZoomAroundPoint({
      zoom: effectiveFrame.zoom || 1,
      nextZoom,
      offsetX: effectiveFrame.offsetX || 0,
      offsetY: effectiveFrame.offsetY || 0,
      pointerX: pointer.x,
      pointerY: pointer.y
    });

    const nextOffsets = clampOffsets({
      offsetX: anchored.offsetX,
      offsetY: anchored.offsetY,
      imageWidth: effectiveFrame.imageWidth,
      imageHeight: effectiveFrame.imageHeight,
      frameWidth,
      frameHeight,
      zoom: nextZoom
    });

    onChange?.({
      ...effectiveFrame,
      zoom: nextZoom,
      ...nextOffsets
    });
  }

  const imageStyle = useMemo(() => {
    if (!computed) {
      return null;
    }

    const x = computed.offsetX * scale;
    const y = computed.offsetY * scale;
    const width = computed.scaledWidth * scale;
    const height = computed.scaledHeight * scale;

    return {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${x}px, ${y}px)`
    };
  }, [computed, scale]);

  if (!src) {
    return (
      <div className={`image-frame ${selected ? 'active' : ''}`} ref={containerRef}>
        <div
          role="button"
          tabIndex={0}
          className="image-frame-placeholder"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onRequestUpload?.();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              onRequestUpload?.();
            }
          }}
        >
          <span>Tap Upload image to place a photo</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`image-frame ${selected ? 'active' : ''}`}
      ref={containerRef}
      onPointerDown={onPointerDown}
      onWheel={onWheel}
    >
      <img src={src} alt="Story" draggable={false} className="image-frame-img" style={imageStyle || undefined} />
    </div>
  );
}
