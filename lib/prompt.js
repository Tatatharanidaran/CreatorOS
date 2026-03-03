const SYSTEM_PROMPT = `You are an Instagram copy assistant for small creators.
Return only valid JSON. No markdown. No extra text.
Keep content concise, natural, and ready to post.
Avoid repeating lines across variations.`;

export function buildUserPrompt({ imageDescription, niche, tone, contentType }) {
  return `Create Instagram content for this input:
- image_description: ${imageDescription}
- niche: ${niche}
- tone: ${tone}
- content_type: ${contentType}

Return exactly this JSON shape:
{
  "hooks": ["", "", ""],
  "captions": ["", "", ""],
  "ctas": ["", "", ""],
  "hashtags": {
    "small": ["", "", "", "", ""],
    "medium": ["", "", "", "", ""],
    "broad": ["", "", "", "", ""]
  }
}

Rules:
- Hooks: 6-12 words each.
- Captions: 2-4 short lines each, include emojis only if tone suits.
- CTAs: clear action prompts.
- Hashtags: include # symbol, no duplicates, niche-relevant.
- small = low competition niche tags.
- medium = balanced reach tags.
- broad = high reach general tags.
- English only.`;
}

export { SYSTEM_PROMPT };
