# Insta Creator Helper (V1)

A simple Instagram Creator Helper for small creators (0-20k followers).

It generates in one run:
- 3 Hooks
- 3 Captions
- 3 CTAs
- 3 Hashtag groups (small, medium, broad)

Built with:
- Next.js (App Router)
- Local Ollama models (no paid API)

## Why this exists
Small creators do not need enterprise tooling. They need quick, structured outputs they can copy and post.

## Quick start (one command)

```bash
chmod +x run_project.sh
./run_project.sh
```

What this script does:
- Installs `nvm` if missing
- Installs and uses Node 20 LTS
- Tries to install Ollama if missing
- Creates `.env` from `.env.example`
- Installs npm dependencies
- Starts Ollama server (if not already running)
- Pulls model `llama3.2:3b` (or `OLLAMA_MODEL`)
- Starts Next.js dev server at `http://localhost:3000`

If automatic Ollama install fails, install it manually from `https://ollama.com/download` and re-run.

## Deploy to Vercel

Important:
- Vercel cannot use Ollama running on your laptop `localhost`.
- For production, host Ollama on a reachable server/VPS and use that URL.

### Steps
1. Push this repo to GitHub.
2. Import the repo in Vercel.
3. Set environment variables in Vercel Project Settings:
   - `OLLAMA_URL=https://your-public-ollama-host`
   - `OLLAMA_MODEL=llama3.2:3b`
4. Deploy.

If `OLLAMA_URL` is missing in production, the API route now returns a clear configuration error.

## Input
- image description (1-2 sentences)
- niche
- tone
- content type (Reel / Post / Carousel)

## Output shape

```json
{
  "hooks": ["...", "...", "..."],
  "captions": ["...", "...", "..."],
  "ctas": ["...", "...", "..."],
  "hashtags": {
    "small": ["#...", "#...", "#...", "#...", "#..."],
    "medium": ["#...", "#...", "#...", "#...", "#..."],
    "broad": ["#...", "#...", "#...", "#...", "#..."]
  }
}
```

## API
`POST /api/generate`

Request body:

```json
{
  "imageDescription": "string",
  "niche": "Fitness | Travel | Coding | ...",
  "tone": "Motivational | Funny | Bold | ...",
  "contentType": "Reel | Post | Carousel"
}
```

## Notes
- If JSON parsing fails on weaker models, retry once or switch model.
- Default model is `llama3.2:3b`, configurable via `OLLAMA_MODEL`.
