import CopyButton from '../CopyButton';

export default function ReelScriptViewer({ script }) {
  if (!script) {
    return <p className="empty">Select an idea to generate script.</p>;
  }

  const copyText = `HOOK: ${script.hook}\n\nBODY: ${script.body}\n\nVALUE: ${script.value}\n\nCTA: ${script.cta}`;

  return (
    <section className="output-block">
      <div className="output-head">
        <h3>Reel Script</h3>
        <CopyButton text={copyText} label="Copy script" />
      </div>
      <p><strong>HOOK (0-3s):</strong> {script.hook}</p>
      <p><strong>BODY:</strong> {script.body}</p>
      <p><strong>VALUE:</strong> {script.value}</p>
      <p><strong>CTA:</strong> {script.cta}</p>
    </section>
  );
}
