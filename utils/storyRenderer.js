import { loadGoogleFont } from './fontLoader';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getCoverBaseScale({ frameWidth, frameHeight, imageWidth, imageHeight }) {
  if (!frameWidth || !frameHeight || !imageWidth || !imageHeight) {
    return 1;
  }
  return Math.max(frameWidth / imageWidth, frameHeight / imageHeight);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    if (!src) {
      resolve(null);
      return;
    }
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function wrapText(context, text, x, y, maxWidth, lineHeight, align = 'left') {
  const words = `${text || ''}`.split(/\s+/);
  const lines = [];
  let line = '';

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (context.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }

  if (line) {
    lines.push(line);
  }

  const baseX = align === 'center' ? x + maxWidth / 2 : x;
  context.textAlign = align === 'center' ? 'center' : 'left';
  lines.forEach((item, index) => context.fillText(item, baseX, y + index * lineHeight));
}

function drawRotatedImage(ctx, image, box) {
  const rotation = box.rotation || 0;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(image, -box.width / 2, -box.height / 2, box.width, box.height);
  ctx.restore();
}

function drawRotatedImageFrame(ctx, image, { box, frame }) {
  if (!box) {
    return;
  }
  const rotation = box.rotation || 0;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  const zoom = frame?.zoom || 1;
  const imageWidth = frame?.imageWidth || image.naturalWidth || image.width || 0;
  const imageHeight = frame?.imageHeight || image.naturalHeight || image.height || 0;
  const baseScale = getCoverBaseScale({ frameWidth: box.width, frameHeight: box.height, imageWidth, imageHeight });
  const scale = baseScale * zoom;

  const scaledWidth = imageWidth * scale;
  const scaledHeight = imageHeight * scale;

  const minX = box.width - scaledWidth;
  const minY = box.height - scaledHeight;

  const offsetX = clamp(frame?.offsetX ?? (box.width - scaledWidth) / 2, minX, 0);
  const offsetY = clamp(frame?.offsetY ?? (box.height - scaledHeight) / 2, minY, 0);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotation * Math.PI) / 180);

  ctx.beginPath();
  ctx.rect(-box.width / 2, -box.height / 2, box.width, box.height);
  ctx.clip();

  ctx.drawImage(
    image,
    -box.width / 2 + offsetX,
    -box.height / 2 + offsetY,
    scaledWidth,
    scaledHeight
  );

  ctx.restore();
}

function drawShape(ctx, shape) {
  const rotation = shape.rotation || 0;
  const radius = Math.max(0, shape.radius || 0);
  const cx = shape.x + shape.width / 2;
  const cy = shape.y + shape.height / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.globalAlpha = shape.opacity ?? 0.5;
  ctx.fillStyle = shape.color || '#ffffff';

  const x = -shape.width / 2;
  const y = -shape.height / 2;
  const width = shape.width;
  const height = shape.height;

  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawRotatedEmoji(ctx, emoji) {
  const size = emoji.size || 72;
  const x = emoji.x || 100;
  const y = emoji.y || 100;
  const rotation = emoji.rotation || 0;

  ctx.save();
  ctx.translate(x + size / 2, y - size / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.font = `${size}px sans-serif`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(emoji.char || '✨', -size / 2, size / 2);
  ctx.restore();
}

export async function renderStoryDataUrl(story) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1080;
  canvas.height = 1920;

  const bg = story.background || {};
  if (bg.type === 'image' && bg.src) {
    const bgImage = await loadImage(bg.src).catch(() => null);
    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, 1080, 1920);
    } else {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 1080, 1920);
    }
  } else if (bg.type === 'gradient') {
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
    gradient.addColorStop(0, bg.from || '#fbcfe8');
    gradient.addColorStop(1, bg.to || '#c4b5fd');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);
  } else {
    ctx.fillStyle = bg.color || '#f8fafc';
    ctx.fillRect(0, 0, 1080, 1920);
  }

  if (bg.overlay) {
    ctx.fillStyle = bg.overlay;
    ctx.fillRect(0, 0, 1080, 1920);
  }

  for (const shape of story.shapes || []) {
    drawShape(ctx, shape);
  }

  const image = await loadImage(story.image?.src).catch(() => null);
  if (image && story.image?.box) {
    drawRotatedImageFrame(ctx, image, { box: story.image.box, frame: story.image.frame });
  }

  for (const asset of story.assets || []) {
    const decorativeImage = await loadImage(asset.src).catch(() => null);
    if (decorativeImage) {
      drawRotatedImage(ctx, decorativeImage, asset);
    }
  }

  for (const textItem of story.textLayers || []) {
    await loadGoogleFont(textItem.fontFamily || 'Poppins');
    ctx.fillStyle = textItem.color || '#111827';
    const italic = textItem.italic ? 'italic ' : '';
    const weight = textItem.weight || 700;
    const size = textItem.size || 64;
    ctx.font = `${italic}${weight} ${size}px "${textItem.fontFamily || 'Poppins'}", sans-serif`;
    wrapText(ctx, textItem.text, textItem.x, textItem.y, textItem.width || 860, size + 10, textItem.align || 'left');
  }

  for (const emoji of story.emojis || []) {
    drawRotatedEmoji(ctx, emoji);
  }

  return canvas.toDataURL('image/png');
}

export async function downloadStory(story) {
  const data = await renderStoryDataUrl(story);
  const link = document.createElement('a');
  link.download = `instagram_story_template_${Date.now()}.png`;
  link.href = data;
  link.click();
}
