# Insta Creator Helper (V1)

A simple Instagram Creator Helper for small creators (0-20k followers).

It generates in one run:
- 3 Hooks
- 3 Captions
- 3 CTAs
- 3 Hashtag groups (small, medium, broad)

Built with:
- Next.js (App Router)
- Groq API (free tier)

## Quick start (one command)

```bash
chmod +x run_project.sh
./run_project.sh
```

What this script does:
- Installs `nvm` if missing
- Installs and uses Node 20 LTS
- Creates `.env` from `.env.example`
- Prompts for your `GROQ_API_KEY` (if missing)
- Installs npm dependencies
- Clears stale `.next`
- Starts Next.js dev server at `http://localhost:3000`

## Create Groq API key

1. Go to `https://console.groq.com/keys`
2. Create a new API key
3. Copy the key
4. Add it in `.env`:

```env
GROQ_API_KEY=your_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

The `run_project.sh` script can ask for this key and write it into `.env` automatically.

## Deploy to Vercel

1. Push repo to GitHub.
2. Import the repo in Vercel.
3. Set Environment Variables in Vercel:
   - `GROQ_API_KEY=your_key_here`
   - `GROQ_MODEL=llama-3.1-8b-instant` (or any supported Groq model)
4. Deploy.

Vercel project settings:
- Root Directory: `Insta_Cont` (if your app lives in that subfolder)
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: leave empty

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
