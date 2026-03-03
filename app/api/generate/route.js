import { SYSTEM_PROMPT, buildUserPrompt } from '../../../lib/prompt';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';
const REQUEST_TIMEOUT_MS = 45000;

function getOllamaUrl() {
  const configured = process.env.OLLAMA_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, '');
  }

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return 'http://localhost:11434';
}

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
    const ollamaUrl = getOllamaUrl();
    if (!ollamaUrl) {
      return Response.json(
        {
          error:
            'Missing OLLAMA_URL in production. Set OLLAMA_URL to a public/reachable Ollama server URL in your deployment environment.'
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

    const prompt = buildUserPrompt({ imageDescription, niche, tone, contentType });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const ollamaResponse = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        system: SYSTEM_PROMPT,
        prompt,
        stream: false,
        options: {
          temperature: 0.8,
          top_p: 0.9
        }
      }),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      return Response.json(
        { error: `Ollama request failed: ${errorText}` },
        { status: ollamaResponse.status }
      );
    }

    const payload = await ollamaResponse.json();
    const parsed = safeJsonParse(payload?.response || '');

    if (!parsed) {
      return Response.json(
        {
          error: 'Model returned invalid JSON. Try again or switch model.',
          raw: payload?.response || ''
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
