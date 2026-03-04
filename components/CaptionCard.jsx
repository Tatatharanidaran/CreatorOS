import CopyButton from './CopyButton';
import CaptionScore from './CaptionScore';

export default function CaptionCard({ caption, tone, scoreData, emojiSuggestion }) {
  const charCount = caption.length;

  return (
    <article className="caption-card">
      <div className="caption-card-head">
        <span className="tone-chip">Tone: {tone}</span>
        <span className="char-count">{charCount} chars</span>
      </div>
      <p className="caption-body">{caption}</p>
      <p className="emoji-hint">{emojiSuggestion}</p>
      <div className="caption-actions">
        <CopyButton text={caption} label="Copy" />
      </div>
      <CaptionScore scoreData={scoreData} />
    </article>
  );
}
