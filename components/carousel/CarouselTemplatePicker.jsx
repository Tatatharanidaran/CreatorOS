import { TEMPLATE_PRESETS } from '../../utils/slideManager';

export default function CarouselTemplatePicker({ onPick }) {
  return (
    <div className="template-grid">
      {Object.entries(TEMPLATE_PRESETS).map(([key, template]) => (
        <button key={key} type="button" className="template-card" onClick={() => onPick(key)}>
          <strong>{template.name}</strong>
          <span>{key === 'custom' ? 'Build your own arrangement.' : 'Apply preset layout.'}</span>
        </button>
      ))}
    </div>
  );
}
