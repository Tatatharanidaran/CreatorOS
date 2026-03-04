const FALLBACK_TAGS = {
  broad: ['#instagood', '#photooftheday', '#reels', '#creator', '#inspiration', '#lifestyle', '#daily', '#trending'],
  medium: ['#contentcreation', '#socialgrowth', '#creativeprocess', '#smallcreator', '#audiencegrowth', '#buildinpublic', '#instagramtips', '#personalbrand'],
  niche: ['#microcreatorlife', '#nicheaudience', '#intentionalcontent', '#creatorworkflow', '#captionstrategy', '#creatorconsistency', '#storydrivencontent', '#communityfirst']
};

function normalizeTag(tag) {
  const cleaned = `${tag || ''}`
    .trim()
    .replace(/\s+/g, '')
    .replace(/[^\w#]/g, '')
    .toLowerCase();
  if (!cleaned) {
    return '';
  }
  return cleaned.startsWith('#') ? cleaned : `#${cleaned}`;
}

function dedupe(tags) {
  const seen = new Set();
  const result = [];
  for (const tag of tags) {
    const normalized = normalizeTag(tag);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
}

function classifyTag(tag) {
  const core = tag.replace(/^#/, '');
  const hasNumber = /\d/.test(core);
  const hasUnderscore = core.includes('_');
  const isLong = core.length >= 14;

  if (hasUnderscore || isLong || hasNumber) {
    return 'niche';
  }
  if (core.length >= 10) {
    return 'medium';
  }
  return 'broad';
}

function enforceSize(tags, fallback) {
  const min = 8;
  const max = 12;
  const cleaned = dedupe(tags).slice(0, max);

  if (cleaned.length >= min) {
    return cleaned;
  }

  const combined = dedupe([...cleaned, ...fallback]);
  return combined.slice(0, min);
}

export function groupHashtags(rawHashtags) {
  const existing = rawHashtags || {};
  const directBroad = existing.broad || existing.Broad || [];
  const directMedium = existing.medium || existing.Medium || [];
  const directNiche = existing.niche || existing.Niche || existing.small || existing.Small || [];

  const pooled = dedupe([...directBroad, ...directMedium, ...directNiche]);

  const heuristicBuckets = { broad: [], medium: [], niche: [] };
  for (const tag of pooled) {
    heuristicBuckets[classifyTag(tag)].push(tag);
  }

  return {
    broad: enforceSize(dedupe([...directBroad, ...heuristicBuckets.broad]), FALLBACK_TAGS.broad),
    medium: enforceSize(dedupe([...directMedium, ...heuristicBuckets.medium]), FALLBACK_TAGS.medium),
    niche: enforceSize(dedupe([...directNiche, ...heuristicBuckets.niche]), FALLBACK_TAGS.niche)
  };
}

export function allHashtagsAsLine(groups) {
  return dedupe([...(groups?.broad || []), ...(groups?.medium || []), ...(groups?.niche || [])]).join(' ');
}
