import { SYSTEM_PROMPT, buildCarouselPrompt } from '../../../lib/prompt';

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

function normalizeCarousel(carousel) {
  if (!Array.isArray(carousel)) {
    return [];
  }

  return carousel
    .map((item, index) => ({
      slide: Number(item?.slide) || index + 1,
      title: `${item?.title || `Slide ${index + 1}`}`.trim(),
      content: `${item?.content || ''}`.trim()
    }))
    .filter((item) => item.content)
    .slice(0, 5);
}

export async function POST(request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return Response.json(
        { error: 'Missing GROQ_API_KEY in environment variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { topic, niche, tone } = body || {};

    if (!topic || !niche || !tone) {
      return Response.json({ error: 'Missing required fields: topic, niche, tone' }, { status: 400 });
    }

    const userPrompt = buildCarouselPrompt({ topic, niche, tone });
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
        max_completion_tokens: 800,
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
      return Response.json({ error: 'Model returned invalid JSON.', raw: content }, { status: 422 });
    }

    return Response.json({ data: { carousel: normalizeCarousel(parsed?.carousel) } });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return Response.json({ error: 'Carousel generation timed out.' }, { status: 504 });
    }

    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown server error' },
      { status: 500 }
    );
  }
}
