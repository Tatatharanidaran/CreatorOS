import { categoryLabel } from '../../utils/templateLoader';

export default function TemplatePreviewCard({ template, onPick, active = false }) {
  const textCount = (template.elements || []).filter((element) => element.type === 'text').length;
  const imageCount = (template.elements || []).filter((element) => element.type === 'image').length;
  const emojiCount = (template.elements || []).filter((element) => element.type === 'emoji').length;

  return (
    <button type="button" className={`template-preview-card ${active ? 'active-template' : ''}`} onClick={() => onPick(template)}>
      <span className="template-preview-bg" style={{ backgroundImage: `url(${template.background})` }} />
      <strong>{template.name}</strong>
      <span>{categoryLabel(template.category)}</span>
      <small>
        {textCount} text · {imageCount} image · {emojiCount} emoji
      </small>
    </button>
  );
}
