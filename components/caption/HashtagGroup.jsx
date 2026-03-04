import CopyButton from '../CopyButton';

export default function HashtagGroup({ title, tags }) {
  const line = tags.join(' ');

  return (
    <article className="hashtag-card">
      <div className="hashtag-card-head">
        <h4>{title}</h4>
      </div>
      <p>{line}</p>
      <div className="hashtag-actions">
        <CopyButton text={line} label="Copy group" />
      </div>
    </article>
  );
}
