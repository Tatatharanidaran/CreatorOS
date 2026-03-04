'use client';

import { useState } from 'react';

export default function ReelIdeaGenerator({ onIdeas, onError }) {
  const [form, setForm] = useState({ topic: '', niche: 'Lifestyle', tone: 'Educational' });
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function generateIdeas() {
    if (!form.topic.trim()) {
      onError('Please add a topic first.');
      return;
    }

    onError('');
    setLoading(true);
    try {
      const response = await fetch('/api/reels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'ideas', ...form })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to generate ideas');
      }
      onIdeas(payload.data?.ideas || [], form);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to generate ideas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel">
      <h2>Reel Idea Generator</h2>
      <label>
        Topic
        <textarea name="topic" rows={3} value={form.topic} onChange={updateField} placeholder="Example: Beginner gym mistakes" />
      </label>
      <div className="inline-fields">
        <label>
          Niche
          <input name="niche" value={form.niche} onChange={updateField} />
        </label>
        <label>
          Tone
          <input name="tone" value={form.tone} onChange={updateField} />
        </label>
      </div>
      <button type="button" className="primary-btn" onClick={generateIdeas} disabled={loading}>
        {loading ? 'Generating ideas...' : 'Generate 5 Reel Ideas'}
      </button>
    </section>
  );
}
