import { TEMPLATE_PRESETS } from '../../utils/slideManager';

export default function CarouselTemplateLoader({ selectedTemplate, onSelectTemplate }) {
  const order = ['title_content', 'image_center', 'quote', 'tip_list', 'custom'];

  return (
    <div className="template-grid">
      {order.map((key) => {
        const template = TEMPLATE_PRESETS[key];
        return (
          <button
            key={key}
            type="button"
            className={`template-card ${selectedTemplate === key ? 'active-template' : ''}`}
            onClick={() => onSelectTemplate(key)}
          >
            <strong>{template.name}</strong>
            <span>{template.description}</span>
          </button>
        );
      })}
    </div>
  );
}
