function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const words = (text || '').split(' ');
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

export async function downloadThumbnailPng({ imageSrc, overlayText }) {
  if (!imageSrc) {
    return;
  }

  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = 1080;
  canvas.height = 1080;

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  if (overlayText && overlayText.trim()) {
    context.fillStyle = 'rgba(0, 0, 0, 0.45)';
    context.fillRect(0, 760, 1080, 320);

    context.fillStyle = '#ffffff';
    context.font = 'bold 56px sans-serif';
    context.textAlign = 'left';
    wrapText(context, overlayText.trim(), 60, 860, 960, 68);
  }

  const link = document.createElement('a');
  const timestamp = Date.now();
  link.download = `instagram_thumbnail_${timestamp}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
