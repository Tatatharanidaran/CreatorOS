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

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = `${text || ''}`.split(' ');
  const lines = [];
  let line = '';

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (context.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  }

  if (line) {
    lines.push(line);
  }

  lines.forEach((item, index) => {
    context.fillText(item, x, y + index * lineHeight);
  });
}

export async function exportThumbnail({ imageSrc, overlayText = '', textStyle = {} }) {
  if (!imageSrc) {
    return;
  }

  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = 1080;
  canvas.height = 1080;

  context.drawImage(image, 0, 0, 1080, 1080);

  if (overlayText.trim()) {
    const fontSize = textStyle.size || 58;
    const x = textStyle.x || 70;
    const y = textStyle.y || 880;
    const fontFamily = textStyle.fontFamily || 'Poppins';
    const fontWeight = textStyle.fontWeight || 700;
    const italic = textStyle.italic ? 'italic ' : '';
    await loadGoogleFont(fontFamily);

    context.fillStyle = 'rgba(0, 0, 0, 0.45)';
    context.fillRect(0, 740, 1080, 340);

    if (textStyle.gradient) {
      const gradient = context.createLinearGradient(0, y - 60, 980, y + 60);
      gradient.addColorStop(0, '#fb7185');
      gradient.addColorStop(0.5, '#a855f7');
      gradient.addColorStop(1, '#06b6d4');
      context.fillStyle = gradient;
    } else {
      context.fillStyle = textStyle.color || '#ffffff';
    }

    context.font = `${italic}${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
    context.textAlign = textStyle.align === 'center' ? 'center' : 'left';
    const finalText = textStyle.uppercase ? overlayText.toUpperCase() : overlayText;
    wrapText(context, finalText, textStyle.align === 'center' ? 540 : x, y, 940, fontSize + 12);
  }

  const link = document.createElement('a');
  link.download = `instagram_thumbnail_${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function renderSlideToDataUrl(slide) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 1080;
  canvas.height = 1080;

  context.fillStyle = slide.backgroundColor || '#ffffff';
  context.fillRect(0, 0, 1080, 1080);

  const background = await loadImage(slide.backgroundImage);
  if (background) {
    context.drawImage(background, 0, 0, 1080, 1080);
  }

  const image = await loadImage(slide.imageSrc);
  if (image && slide.imageBox) {
    context.drawImage(image, slide.imageBox.x, slide.imageBox.y, slide.imageBox.width, slide.imageBox.height);
  }

  if (slide.textBox) {
    context.fillStyle = '#121212';
    context.font = `700 ${slide.textBox.fontSize || 48}px sans-serif`;
    wrapText(
      context,
      `${slide.title || ''}\n${slide.body || ''}`,
      slide.textBox.x,
      slide.textBox.y,
      slide.textBox.width,
      (slide.textBox.fontSize || 48) + 10
    );
  }

  return canvas.toDataURL('image/png');
}

export async function downloadCurrentSlide(slide, index = 0) {
  const url = await renderSlideToDataUrl(slide);
  const link = document.createElement('a');
  link.download = `carousel_slide_${index + 1}.png`;
  link.href = url;
  link.click();
}

export async function downloadAllSlides(slides) {
  for (let index = 0; index < slides.length; index += 1) {
    const url = await renderSlideToDataUrl(slides[index]);
    const link = document.createElement('a');
    link.download = `carousel_slide_${index + 1}.png`;
    link.href = url;
    link.click();
  }
}
