import CopyButton from './CopyButton';

export default function HashtagGroup({ title, tags }) {
  const groupLine = tags.join(' ');
  const firstComment = `${groupLine}\n.\n.\n.`;

  return (
    <article className="hashtag-card">
      <div className="hashtag-card-head">
        <h4>{title}</h4>
      </div>
      <p>{groupLine}</p>
      <div className="hashtag-actions">
        <CopyButton text={groupLine} label="Copy group" />
        <CopyButton text={firstComment} label="Use as first comment" />
      </div>
    </article>
  );
}
