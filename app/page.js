'use client';

import { useMemo, useState } from 'react';
import CopyButton from '../components/CopyButton';
import OutputBlock from '../components/OutputBlock';

const NICHES = ['Fitness', 'Travel', 'Coding', 'Business', 'Lifestyle', 'Food', 'Fashion'];
const TONES = ['Motivational', 'Funny', 'Bold', 'Educational', 'Emotional', 'Minimalist'];
const CONTENT_TYPES = ['Reel', 'Post', 'Carousel'];

const EMPTY_OUTPUT = {
  hooks: [],
  captions: [],
  ctas: [],
  hashtags: { small: [], medium: [], broad: [] }
};

export default function Home() {
  const [form, setForm] = useState({
    imageDescription: '',
    niche: 'Fitness',
    tone: 'Motivational',
    contentType: 'Reel'
  });
  const [result, setResult] = useState(EMPTY_OUTPUT);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const hashtagsAsText = useMemo(
    () =>
      [
        `Small: ${result.hashtags.small.join(' ')}`,
        `Medium: ${result.hashtags.medium.join(' ')}`,
        `Broad: ${result.hashtags.broad.join(' ')}`
      ].join('\n'),
    [result.hashtags]
  );

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Request failed');
      }

      setResult(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="chip">Zero-Budget Creator Stack</p>
        <h1>Insta Creator Helper</h1>
        <p className="subtitle">Your daily Instagram writing co-pilot. Idea to ready captions in under 60 seconds.</p>
        <div className="pillars">
          <span>Fast drafts</span>
          <span>Structured outputs</span>
          <span>Free API powered</span>
        </div>
      </section>

      <section className="grid">
        <form className="panel form-panel" onSubmit={handleSubmit}>
          <h2>Generate Content</h2>
          <label>
            Describe your image/post
            <textarea
              name="imageDescription"
              value={form.imageDescription}
              onChange={updateField}
              rows={4}
              placeholder="I am holding a laptop in a cafe sharing 3 coding productivity tips..."
              required
            />
          </label>

          <div className="inline-fields">
            <label>
              Niche
              <select name="niche" value={form.niche} onChange={updateField}>
                {NICHES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              Tone
              <select name="tone" value={form.tone} onChange={updateField}>
                {TONES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              Content type
              <select name="contentType" value={form.contentType} onChange={updateField}>
                {CONTENT_TYPES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Generating...' : 'Generate 4 Tool Outputs'}
          </button>

          {error ? <p className="error">{error}</p> : null}
        </form>

        <section className="panel results">
          <div className="results-head">
            <h2>Results</h2>
            <span>Copy-ready blocks</span>
          </div>

          {result.hooks.length === 0 ? (
            <p className="empty">No output yet. Fill the form and generate.</p>
          ) : (
            <>
              <OutputBlock title="Hooks" items={result.hooks} />
              <OutputBlock title="Captions" items={result.captions} />
              <OutputBlock title="CTAs" items={result.ctas} />

              <section className="output-block">
                <div className="output-head">
                  <h3>Hashtag Packs</h3>
                  <CopyButton text={hashtagsAsText} label="Copy all" />
                </div>
                <div className="hashtags-grid">
                  <article>
                    <h4>Small</h4>
                    <p>{result.hashtags.small.join(' ')}</p>
                    <CopyButton text={result.hashtags.small.join(' ')} label="Copy" />
                  </article>
                  <article>
                    <h4>Medium</h4>
                    <p>{result.hashtags.medium.join(' ')}</p>
                    <CopyButton text={result.hashtags.medium.join(' ')} label="Copy" />
                  </article>
                  <article>
                    <h4>Broad</h4>
                    <p>{result.hashtags.broad.join(' ')}</p>
                    <CopyButton text={result.hashtags.broad.join(' ')} label="Copy" />
                  </article>
                </div>
              </section>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
