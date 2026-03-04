'use client';

import { useMemo, useState } from 'react';
import CopyButton from '../CopyButton';
import ResultsSection from '../ResultsSection';
import CaptionCard from '../CaptionCard';
import HooksList from './HooksList';
import HashtagGroup from './HashtagGroup';
import { formatCaption } from '../../utils/captionFormatter';
import { groupHashtags, allHashtagsAsLine } from '../../utils/hashtagGrouping';
import { scoreCaption } from '../../utils/captionScore';
import { scrollToResults } from '../../utils/scrollToResults';

const NICHES = ['Fitness', 'Travel', 'Coding', 'Business', 'Lifestyle', 'Food', 'Fashion'];
const TONES = ['Motivational', 'Funny', 'Bold', 'Educational', 'Emotional', 'Minimalist'];
const CONTENT_TYPES = ['Reel', 'Post', 'Carousel'];

const EMPTY_OUTPUT = {
  hooks: [],
  captions: [],
  cta: [],
  hashtags: { broad: [], medium: [], niche: [] }
};

export default function CaptionGenerator() {
  const [form, setForm] = useState({
    imageDescription: '',
    niche: 'Fitness',
    tone: 'Motivational',
    contentType: 'Reel'
  });
  const [lengthMode, setLengthMode] = useState('medium');
  const [result, setResult] = useState(EMPTY_OUTPUT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const groupedHashtags = useMemo(() => groupHashtags(result.hashtags), [result.hashtags]);
  const allHashtagsLine = useMemo(() => allHashtagsAsLine(groupedHashtags), [groupedHashtags]);
  const firstComment = useMemo(() => `${allHashtagsLine}\n.\n.\n.`, [allHashtagsLine]);

  const formattedCaptions = useMemo(() => {
    const hashtagArray = allHashtagsLine ? allHashtagsLine.split(' ') : [];
    return result.captions.map((caption, index) => {
      const cta = result.cta[index] || result.cta[0] || 'Drop your thoughts below.';
      const formatted = formatCaption(caption, [cta], hashtagArray, lengthMode);
      return {
        id: `${index}-${caption.slice(0, 12)}`,
        text: formatted.text,
        emojiSuggestion: formatted.emojiSuggestion,
        scoreData: scoreCaption({
          caption: formatted.text,
          hook: result.hooks[index % (result.hooks.length || 1)] || '',
          cta,
          hashtags: hashtagArray,
          lengthMode
        })
      };
    });
  }, [result.captions, result.cta, result.hooks, allHashtagsLine, lengthMode]);

  const allCaptionsText = useMemo(
    () => formattedCaptions.map((item, index) => `${index + 1}. ${item.text}`).join('\n\n'),
    [formattedCaptions]
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
      setHasGenerated(true);
      requestAnimationFrame(() => scrollToResults('caption-results'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="stack-layout">
      <form className="panel" onSubmit={handleSubmit}>
        <h2>Caption Generator</h2>
        <label>
          Describe your image/post
          <textarea
            name="imageDescription"
            value={form.imageDescription}
            onChange={updateField}
            rows={4}
            placeholder="Describe your post in 1-2 lines"
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
          {loading ? 'Generating AI content...' : 'Generate Content'}
        </button>

        {loading ? (
          <div className="loading-state" role="status" aria-live="polite">
            <span className="spinner" />
            <span>Generating AI content...</span>
          </div>
        ) : null}

        {error ? <p className="error">{error}</p> : null}
      </form>

      <section id="caption-results" className="panel results">
        <div className="results-head">
          <h2>Generated Results</h2>
          <span>Caption workflow</span>
        </div>

        {!hasGenerated ? <p className="empty">Generate content to see hooks, captions, CTAs, and hashtag groups.</p> : null}

        {hasGenerated ? (
          <>
            <ResultsSection title="Hooks" actions={<CopyButton text={result.hooks.join('\n')} label="Copy all hooks" />}>
              <HooksList hooks={result.hooks} />
            </ResultsSection>

            <ResultsSection title="Caption Variations" actions={<CopyButton text={allCaptionsText} label="Copy all captions" />}>
              <div className="mode-toggle" role="group" aria-label="Caption length mode">
                {['short', 'medium', 'long'].map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    className={`mode-btn ${lengthMode === mode ? 'active' : ''}`}
                    onClick={() => setLengthMode(mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <div className="caption-grid">
                {formattedCaptions.map((caption) => (
                  <CaptionCard
                    key={caption.id}
                    caption={caption.text}
                    tone={form.tone}
                    scoreData={caption.scoreData}
                    emojiSuggestion={caption.emojiSuggestion}
                  />
                ))}
              </div>
            </ResultsSection>

            <ResultsSection title="Call-To-Action Suggestions" actions={<CopyButton text={result.cta.join('\n')} label="Copy all CTAs" />}>
              <ol className="hooks-list">
                {result.cta.map((item, index) => (
                  <li key={`cta-${index}`} className="hook-item">
                    <p>{item}</p>
                    <CopyButton text={item} label="Copy" />
                  </li>
                ))}
              </ol>
            </ResultsSection>

            <ResultsSection
              title="Hashtag Groups"
              actions={
                <>
                  <CopyButton text={allHashtagsLine} label="Copy all hashtags" />
                  <CopyButton text={firstComment} label="Use as first comment" />
                </>
              }
            >
              <div className="hashtags-grid">
                <HashtagGroup title="Broad Reach" tags={groupedHashtags.broad} />
                <HashtagGroup title="Medium Competition" tags={groupedHashtags.medium} />
                <HashtagGroup title="Niche / Targeted" tags={groupedHashtags.niche} />
              </div>
            </ResultsSection>
          </>
        ) : null}
      </section>
    </section>
  );
}
