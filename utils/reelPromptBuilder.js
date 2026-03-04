export function buildReelIdeasPrompt({ topic, niche, tone }) {
  return `Create 5 Instagram reel ideas.
Input:
- topic: ${topic}
- niche: ${niche}
- tone: ${tone}

Return JSON:
{
  "ideas": [
    { "title": "", "description": "" },
    { "title": "", "description": "" },
    { "title": "", "description": "" },
    { "title": "", "description": "" },
    { "title": "", "description": "" }
  ]
}
Rules:
- concise ideas
- practical filming angle
- no markdown`;
}

export function buildReelScriptPrompt({ ideaTitle, ideaDescription, niche, tone }) {
  return `Generate an Instagram reel plan for:
- title: ${ideaTitle}
- description: ${ideaDescription}
- niche: ${niche}
- tone: ${tone}

Return JSON only:
{
  "script": {
    "hook": "",
    "body": "",
    "value": "",
    "cta": ""
  },
  "shotList": [
    { "scene": 1, "description": "" },
    { "scene": 2, "description": "" },
    { "scene": 3, "description": "" },
    { "scene": 4, "description": "" }
  ],
  "caption": "",
  "hashtags": {
    "broad": ["", "", "", "", "", "", "", ""],
    "medium": ["", "", "", "", "", "", "", ""],
    "niche": ["", "", "", "", "", "", "", ""]
  }
}
Rules:
- hook for first 3 seconds
- body concise
- value actionable
- CTA clear
- hashtags with # prefix`;
}
