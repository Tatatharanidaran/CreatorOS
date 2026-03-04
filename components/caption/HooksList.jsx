import CopyButton from '../CopyButton';

export default function HooksList({ hooks }) {
  return (
    <ol className="hooks-list">
      {hooks.map((hook, index) => (
        <li key={`hook-${index}`} className="hook-item">
          <p>{hook}</p>
          <CopyButton text={hook} label="Copy" />
        </li>
      ))}
    </ol>
  );
}
