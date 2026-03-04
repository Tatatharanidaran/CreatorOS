import { buildReelIdeasPrompt, buildReelScriptPrompt } from '../../../utils/reelPromptBuilder';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const GROQ_BASE_URL = (process.env.GROQ_BASE_URL || 'https://api.groq.com').replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = 45000;

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function callGroq(prompt) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const response = await fetch(`${GROQ_BASE_URL}/openai/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are an Instagram reel planning assistant. Return valid JSON only. No markdown.'
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_completion_tokens: 900,
      stream: false
    }),
    signal: controller.signal
  }).finally(() => clearTimeout(timeoutId));

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq request failed: ${errorText}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content || '';
  const parsed = safeJsonParse(content);
  if (!parsed) {
    throw new Error('Model returned invalid JSON.');
  }

  return parsed;
}

export async function POST(request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return Response.json({ error: 'Missing GROQ_API_KEY.' }, { status: 500 });
    }

    const body = await request.json();
    const { mode } = body || {};

    if (mode === 'ideas') {
      const { topic, niche, tone } = body;
      if (!topic || !niche || !tone) {
        return Response.json({ error: 'Missing fields: topic, niche, tone' }, { status: 400 });
      }
      const prompt = buildReelIdeasPrompt({ topic, niche, tone });
      const result = await callGroq(prompt);
      return Response.json({ data: { ideas: Array.isArray(result.ideas) ? result.ideas.slice(0, 5) : [] } });
    }

    if (mode === 'script') {
      const { ideaTitle, ideaDescription, niche, tone } = body;
      if (!ideaTitle || !ideaDescription || !niche || !tone) {
        return Response.json({ error: 'Missing fields: ideaTitle, ideaDescription, niche, tone' }, { status: 400 });
      }
      const prompt = buildReelScriptPrompt({ ideaTitle, ideaDescription, niche, tone });
      const result = await callGroq(prompt);
      return Response.json({
        data: {
          script: result.script || {},
          shotList: Array.isArray(result.shotList) ? result.shotList : [],
          caption: `${result.caption || ''}`,
          hashtags: result.hashtags || { broad: [], medium: [], niche: [] }
        }
      });
    }

    return Response.json({ error: 'Invalid mode. Use ideas or script.' }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return Response.json({ error: 'Request timed out.' }, { status: 504 });
    }
    return Response.json({ error: error instanceof Error ? error.message : 'Unknown server error' }, { status: 500 });
  }
}
