export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function getCoverBaseScale({ frameWidth, frameHeight, imageWidth, imageHeight }) {
  if (!frameWidth || !frameHeight || !imageWidth || !imageHeight) {
    return 1;
  }
  return Math.max(frameWidth / imageWidth, frameHeight / imageHeight);
}

export function getDefaultFrameState({ frameWidth, frameHeight, imageWidth, imageHeight }) {
  const baseScale = getCoverBaseScale({ frameWidth, frameHeight, imageWidth, imageHeight });
  const scaledWidth = imageWidth * baseScale;
  const scaledHeight = imageHeight * baseScale;
  const offsetX = (frameWidth - scaledWidth) / 2;
  const offsetY = (frameHeight - scaledHeight) / 2;

  return {
    zoom: 1,
    offsetX,
    offsetY,
    imageWidth,
    imageHeight
  };
}

export function getScaledImageSize({ imageWidth, imageHeight, frameWidth, frameHeight, zoom = 1 }) {
  const baseScale = getCoverBaseScale({ frameWidth, frameHeight, imageWidth, imageHeight });
  const scale = baseScale * (zoom || 1);
  return {
    scaledWidth: imageWidth * scale,
    scaledHeight: imageHeight * scale,
    scale
  };
}

export function clampOffsets({ offsetX, offsetY, imageWidth, imageHeight, frameWidth, frameHeight, zoom = 1 }) {
  const { scaledWidth, scaledHeight } = getScaledImageSize({ imageWidth, imageHeight, frameWidth, frameHeight, zoom });

  const minX = frameWidth - scaledWidth;
  const minY = frameHeight - scaledHeight;

  return {
    offsetX: clamp(offsetX, minX, 0),
    offsetY: clamp(offsetY, minY, 0)
  };
}

export function clampZoom(nextZoom, { minZoom = 1, maxZoom = 4 } = {}) {
  const value = Number(nextZoom);
  if (Number.isNaN(value)) {
    return minZoom;
  }
  return clamp(value, minZoom, maxZoom);
}

export function getZoomAroundPoint({
  zoom,
  nextZoom,
  offsetX,
  offsetY,
  pointerX,
  pointerY
}) {
  const currentZoom = zoom || 1;
  const z = nextZoom || 1;
  if (!currentZoom) {
    return { offsetX, offsetY };
  }

  const scale = z / currentZoom;
  return {
    offsetX: pointerX - (pointerX - offsetX) * scale,
    offsetY: pointerY - (pointerY - offsetY) * scale
  };
}
