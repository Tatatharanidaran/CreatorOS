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
  "captions": ["", "", "", "", ""],
  "cta": ["", "", ""],
  "hashtags": {
    "broad": ["", "", "", "", "", "", "", ""],
    "medium": ["", "", "", "", "", "", "", ""],
    "niche": ["", "", "", "", "", "", "", ""]
  },
  "carousel": [
    { "slide": 1, "title": "Hook", "content": "" },
    { "slide": 2, "title": "Key Insight", "content": "" },
    { "slide": 3, "title": "Explanation", "content": "" },
    { "slide": 4, "title": "Value / Tips", "content": "" },
    { "slide": 5, "title": "Call To Action", "content": "" }
  ]
}

Rules:
- Hooks: 6-12 words each.
- Captions: 2-5 short lines each.
- Create 5 distinct captions.
- CTA lines: action-focused and concise.
- Hashtags: include # symbol, no duplicates, niche-relevant.
- broad = high reach general tags.
- medium = balanced reach tags.
- niche = low competition targeted tags.
- 8-12 hashtags per group.
- Carousel must contain exactly 5 slides with useful progression.
- English only.`;
}

export function buildCarouselPrompt({ topic, niche, tone }) {
  return `Create Instagram carousel slide copy for:
- topic: ${topic}
- niche: ${niche}
- tone: ${tone}

Return exactly this JSON shape:
{
  "carousel": [
    { "slide": 1, "title": "Hook", "content": "" },
    { "slide": 2, "title": "Key Insight", "content": "" },
    { "slide": 3, "title": "Explanation", "content": "" },
    { "slide": 4, "title": "Value / Tips", "content": "" },
    { "slide": 5, "title": "Call To Action", "content": "" }
  ]
}

Rules:
- Exactly 5 slides.
- Each content should be 1-3 short lines.
- Slide flow must be logical and skimmable.
- No markdown.`;
}

export { SYSTEM_PROMPT };
