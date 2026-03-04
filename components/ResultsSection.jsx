export default function ResultsSection({ id, title, actions, children }) {
  return (
    <section id={id} className="output-block results-section">
      <div className="output-head">
        <h3>{title}</h3>
        {actions ? <div className="group-actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
