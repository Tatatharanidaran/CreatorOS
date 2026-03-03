import { SYSTEM_PROMPT, buildUserPrompt } from '../../../lib/prompt';

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
      const maybeJson = text.slice(start, end + 1);
      try {
        return JSON.parse(maybeJson);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function normalizeOutput(data) {
  return {
    hooks: Array.isArray(data?.hooks) ? data.hooks.slice(0, 3) : [],
    captions: Array.isArray(data?.captions) ? data.captions.slice(0, 3) : [],
    ctas: Array.isArray(data?.ctas) ? data.ctas.slice(0, 3) : [],
    hashtags: {
      small: Array.isArray(data?.hashtags?.small) ? data.hashtags.small.slice(0, 5) : [],
      medium: Array.isArray(data?.hashtags?.medium) ? data.hashtags.medium.slice(0, 5) : [],
      broad: Array.isArray(data?.hashtags?.broad) ? data.hashtags.broad.slice(0, 5) : []
    }
  };
}

export async function POST(request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return Response.json(
        {
          error:
            'Missing GROQ_API_KEY. Add GROQ_API_KEY in your local .env or in Vercel Environment Variables.'
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { imageDescription, niche, tone, contentType } = body || {};

    if (!imageDescription || !niche || !tone || !contentType) {
      return Response.json(
        { error: 'Missing required fields: imageDescription, niche, tone, contentType' },
        { status: 400 }
      );
    }

    const userPrompt = buildUserPrompt({ imageDescription, niche, tone, contentType });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const groqResponse = await fetch(`${GROQ_BASE_URL}/openai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_completion_tokens: 900,
        stream: false
      }),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      return Response.json({ error: `Groq request failed: ${errorText}` }, { status: groqResponse.status });
    }

    const payload = await groqResponse.json();
    const content = payload?.choices?.[0]?.message?.content || '';
    const parsed = safeJsonParse(content);

    if (!parsed) {
      return Response.json(
        {
          error: 'Model returned invalid JSON. Try again or switch model.',
          raw: content
        },
        { status: 422 }
      );
    }

    return Response.json({ data: normalizeOutput(parsed) });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return Response.json(
        { error: 'Generation timed out. Please try again with a shorter description.' },
        { status: 504 }
      );
    }

    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown server error' },
      { status: 500 }
    );
  }
}
