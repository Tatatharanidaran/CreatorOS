import CopyButton from '../CopyButton';

export default function ShotListViewer({ shotList = [] }) {
  if (!shotList.length) {
    return <p className="empty">Shot list appears after script generation.</p>;
  }

  const fullText = shotList.map((item) => `Scene ${item.scene}: ${item.description}`).join('\n');

  return (
    <section className="output-block">
      <div className="output-head">
        <h3>Shot List</h3>
        <CopyButton text={fullText} label="Copy shot list" />
      </div>
      <ol className="hooks-list">
        {shotList.map((item) => (
          <li key={`scene-${item.scene}`} className="hook-item">
            <p><strong>Scene {item.scene}:</strong> {item.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
