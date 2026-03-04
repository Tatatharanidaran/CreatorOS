function containsQuestionOrExclamation(text) {
  return /[?!]/.test(text);
}

function lengthBand(mode) {
  if (mode === 'short') {
    return { min: 40, max: 150 };
  }
  if (mode === 'long') {
    return { min: 160, max: 420 };
  }
  return { min: 90, max: 280 };
}

export function scoreCaption({ caption = '', hook = '', cta = '', hashtags = [], lengthMode = 'medium' }) {
  const suggestions = [];
  const breakdown = {
    hookPresence: 0,
    lengthFit: 0,
    ctaPresence: 0,
    hashtagCount: 0
  };

  if (hook && (containsQuestionOrExclamation(hook) || hook.split(' ').length >= 6)) {
    breakdown.hookPresence = 25;
  } else {
    suggestions.push('Strengthen the opening hook with curiosity or a bold statement.');
  }

  const band = lengthBand(lengthMode);
  const count = caption.length;
  if (count >= band.min && count <= band.max) {
    breakdown.lengthFit = 25;
  } else {
    suggestions.push(`Adjust caption length for ${lengthMode} mode (${band.min}-${band.max} chars).`);
  }

  if ((cta || '').trim().length > 8) {
    breakdown.ctaPresence = 25;
  } else {
    suggestions.push('Add a clear CTA to encourage comments, saves, or shares.');
  }

  if (hashtags.length >= 8 && hashtags.length <= 12) {
    breakdown.hashtagCount = 25;
  } else {
    suggestions.push('Keep hashtag count between 8 and 12 for balanced reach.');
  }

  const score = Object.values(breakdown).reduce((sum, part) => sum + part, 0);
  const quality = score >= 80 ? 'Strong' : score >= 60 ? 'Good' : 'Needs Work';

  return {
    score,
    quality,
    breakdown,
    suggestions
  };
}
