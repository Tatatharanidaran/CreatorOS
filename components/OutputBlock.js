import CopyButton from './CopyButton';

export default function OutputBlock({ title, items }) {
  return (
    <section className="output-block">
      <div className="output-head">
        <h3>{title}</h3>
        <CopyButton text={items.join('\n\n')} label="Copy all" />
      </div>
      <ol>
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>
            <p>{item}</p>
            <CopyButton text={item} label="Copy" />
          </li>
        ))}
      </ol>
    </section>
  );
}
