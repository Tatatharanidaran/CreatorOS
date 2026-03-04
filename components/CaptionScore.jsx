export default function CaptionScore({ scoreData }) {
  if (!scoreData) {
    return null;
  }

  const { score, quality, suggestions } = scoreData;

  return (
    <div className="caption-score">
      <div className="score-top">
        <span className="score-value">{score}/100</span>
        <span className="score-quality">{quality}</span>
      </div>
      {suggestions.length > 0 ? (
        <ul className="score-suggestions">
          {suggestions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="score-note">Caption quality looks strong.</p>
      )}
    </div>
  );
}
