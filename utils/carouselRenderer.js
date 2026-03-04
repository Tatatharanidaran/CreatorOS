import { loadGoogleFont } from './fontLoader';

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

function getFontString(style, sizeFallback = 48) {
  const weight = style?.fontWeight || 700;
  const italic = style?.italic ? 'italic ' : '';
  const size = style?.fontSize || sizeFallback;
  const family = style?.fontFamily || 'Poppins';
  return `${italic}${weight} ${size}px "${family}", sans-serif`;
}

function fillTextWithWrap(context, text, box, style) {
  const words = `${text || ''}`.split(/\s+/);
  const lines = [];
  let line = '';

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (context.measureText(testLine).width > box.width && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }
  if (line) {
    lines.push(line);
  }

  const lineHeight = (style?.fontSize || 48) + 10;
  const startX = style?.align === 'center' ? box.x + box.width / 2 : box.x;
  context.textAlign = style?.align === 'center' ? 'center' : 'left';

  lines.forEach((item, index) => {
    context.fillText(item, startX, box.y + index * lineHeight);
  });
}

function applyTextFill(context, style, box) {
  if (style?.gradient) {
    const gradient = context.createLinearGradient(box.x, box.y, box.x + box.width, box.y + box.height);
    gradient.addColorStop(0, '#fb7185');
    gradient.addColorStop(0.5, '#a855f7');
    gradient.addColorStop(1, '#06b6d4');
    context.fillStyle = gradient;
  } else {
    context.fillStyle = style?.color || '#111827';
  }
}

export async function renderSlideDataUrl(slide) {
  if (slide?.textStyle?.fontFamily) {
    await loadGoogleFont(slide.textStyle.fontFamily);
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const context = canvas.getContext('2d');

  context.fillStyle = slide.backgroundColor || '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const bgImage = await loadImage(slide.backgroundImage);
  if (bgImage) {
    context.drawImage(bgImage, 0, 0, 1080, 1080);
  }

  const image = await loadImage(slide.imageSrc);
  if (image && slide.imageBox) {
    context.drawImage(image, slide.imageBox.x, slide.imageBox.y, slide.imageBox.width, slide.imageBox.height);
  }

  if (slide.textBox) {
    const box = slide.textBox;
    const style = slide.textStyle || {};

    if (style.highlight) {
      context.fillStyle = 'rgba(0, 0, 0, 0.45)';
      context.fillRect(box.x - 20, box.y - 60, Math.min(1040, box.width + 40), box.height + 120);
    }

    context.font = getFontString(style, box.fontSize);
    applyTextFill(context, style, box);

    const title = style.uppercase ? `${slide.title || ''}`.toUpperCase() : `${slide.title || ''}`;
    const body = style.uppercase ? `${slide.body || ''}`.toUpperCase() : `${slide.body || ''}`;
    fillTextWithWrap(context, `${title}\n${body}`, box, style);
  }

  return canvas.toDataURL('image/png');
}

export async function downloadSlide(slide, index = 1) {
  const url = await renderSlideDataUrl(slide);
  const link = document.createElement('a');
  link.download = `carousel_slide_${index}.png`;
  link.href = url;
  link.click();
}

export async function downloadSlides(slides) {
  for (let i = 0; i < slides.length; i += 1) {
    const url = await renderSlideDataUrl(slides[i]);
    const link = document.createElement('a');
    link.download = `carousel_slide_${i + 1}.png`;
    link.href = url;
    link.click();
  }
}
