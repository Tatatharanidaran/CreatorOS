'use client';

import { useMemo, useState } from 'react';
import TemplatePreviewCard from './TemplatePreviewCard';
import { categoryLabel, getStoryTemplates, getTemplateCategories, getTemplatesByCategory } from '../../utils/templateLoader';

export default function StoryTemplatePicker({ onPick, activeTemplateId }) {
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => getTemplateCategories(), []);
  const templates = useMemo(() => getTemplatesByCategory(category), [category]);

  return (
    <div className="story-template-picker">
      <div className="template-filter-row">
        {categories.map((item) => (
          <button key={item} type="button" className={item === category ? 'active' : ''} onClick={() => setCategory(item)}>
            {categoryLabel(item)}
          </button>
        ))}
      </div>

      <p className="template-count">
        {templates.length} templates shown · {getStoryTemplates().length} total
      </p>

      <div className="story-template-list">
        <div className="template-grid">
          {templates.map((template) => (
            <TemplatePreviewCard key={template.id} template={template} onPick={onPick} active={activeTemplateId === template.id} />
          ))}
        </div>
      </div>
    </div>
  );
}
