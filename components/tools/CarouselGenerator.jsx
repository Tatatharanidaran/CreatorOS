'use client';

import { useState } from 'react';

export default function CarouselGenerator({ niche, tone, onGenerated }) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate() {
    if (!topic.trim()) {
      setError('Add a topic to generate carousel slides.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, niche, tone })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Carousel generation failed');
      }

      onGenerated(payload.data.carousel || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Carousel generation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="carousel-generator">
      <label>
        Carousel topic
        <textarea
          rows={3}
          placeholder="Example: 5 mistakes beginners make in fitness progress..."
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
        />
      </label>
      <button type="button" className="copy-btn" onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating slides...' : 'Generate Carousel Ideas'}
      </button>
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
