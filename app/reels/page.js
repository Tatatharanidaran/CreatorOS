'use client';

import { useMemo, useState } from 'react';
import CopyButton from '../../components/CopyButton';
import ReelIdeaGenerator from '../../components/reels/ReelIdeaGenerator';
import ReelScriptViewer from '../../components/reels/ReelScriptViewer';
import ShotListViewer from '../../components/reels/ShotListViewer';
import HashtagGroup from '../../components/caption/HashtagGroup';
import { allHashtagsAsLine, groupHashtags } from '../../utils/hashtagGrouping';

export default function ReelsPage() {
  const [ideas, setIdeas] = useState([]);
  const [ideaContext, setIdeaContext] = useState({ niche: '', tone: '' });
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [result, setResult] = useState({ script: null, shotList: [], caption: '', hashtags: {} });
  const [loadingScript, setLoadingScript] = useState(false);
  const [error, setError] = useState('');

  const grouped = useMemo(() => groupHashtags(result.hashtags), [result.hashtags]);
  const allTags = useMemo(() => allHashtagsAsLine(grouped), [grouped]);

  async function generateScript(idea) {
    setSelectedIdea(idea);
    setLoadingScript(true);
    setError('');

    try {
      const response = await fetch('/api/reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'script',
          ideaTitle: idea.title,
          ideaDescription: idea.description,
          niche: ideaContext.niche,
          tone: ideaContext.tone
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Script generation failed');
      }
      setResult(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Script generation failed');
    } finally {
      setLoadingScript(false);
    }
  }

  return (
    <main className="page-shell stack-layout">
      <ReelIdeaGenerator
        onError={setError}
        onIdeas={(generatedIdeas, context) => {
          setIdeas(generatedIdeas);
          setIdeaContext({ niche: context.niche, tone: context.tone });
          setSelectedIdea(null);
          setResult({ script: null, shotList: [], caption: '', hashtags: {} });
        }}
      />

      {error ? <p className="error">{error}</p> : null}

      <section className="panel">
        <h2>Reel Ideas</h2>
        {ideas.length === 0 ? (
          <p className="empty">Generate ideas to start planning.</p>
        ) : (
          <div className="idea-grid">
            {ideas.map((idea) => (
              <article key={idea.title} className="feature-card">
                <h3>{idea.title}</h3>
                <p>{idea.description}</p>
                <button type="button" className="copy-btn" onClick={() => generateScript(idea)} disabled={loadingScript}>
                  {loadingScript && selectedIdea?.title === idea.title ? 'Generating...' : 'Generate Script'}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Reels Script Planner</h2>
        <ReelScriptViewer script={result.script} />
        <ShotListViewer shotList={result.shotList} />

        <section className="output-block">
          <div className="output-head">
            <h3>Reel Caption</h3>
            <CopyButton text={result.caption} label="Copy caption" />
          </div>
          <p>{result.caption || 'Caption will appear after script generation.'}</p>
        </section>

        <section className="output-block">
          <div className="output-head">
            <h3>Reel Hashtags</h3>
            <CopyButton text={allTags} label="Copy all hashtags" />
          </div>
          <div className="hashtags-grid">
            <HashtagGroup title="Broad" tags={grouped.broad} />
            <HashtagGroup title="Medium" tags={grouped.medium} />
            <HashtagGroup title="Niche" tags={grouped.niche} />
          </div>
        </section>
      </section>
    </main>
  );
}
