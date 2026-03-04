function cleanLine(line) {
  return `${line || ''}`.trim();
}

function splitSentences(text) {
  return `${text || ''}`
    .split(/(?<=[.!?])\s+/)
    .map(cleanLine)
    .filter(Boolean);
}

function applyLengthMode(lines, mode) {
  const lengths = {
    short: 2,
    medium: 4,
    long: 6
  };

  const target = lengths[mode] || lengths.medium;
  return lines.slice(0, target);
}

function emojiHint(mode) {
  if (mode === 'short') {
    return 'Try one emoji near the hook (optional).';
  }
  if (mode === 'long') {
    return 'Use 1-2 emojis to break sections.';
  }
  return 'Optional: add one emoji to the first or CTA line.';
}

export function formatCaption(caption, ctas = [], hashtags = [], lengthMode = 'medium') {
  const baseLines = splitSentences(caption);
  const selectedLines = applyLengthMode(baseLines, lengthMode);

  const ctaLine = cleanLine(ctas[0] || 'Tell me your take below.');
  const hashtagLine = hashtags.join(' ').trim();

  const chunks = [...selectedLines];
  if (ctaLine) {
    chunks.push('', ctaLine);
  }
  if (hashtagLine) {
    chunks.push('', hashtagLine);
  }

  return {
    text: chunks.join('\n'),
    emojiSuggestion: emojiHint(lengthMode)
  };
}
