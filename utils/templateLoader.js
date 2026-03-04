import templates from '../templates/storyTemplates.json';

const CATEGORY_LABELS = {
  birthday: 'Birthday',
  aesthetic: 'Aesthetic',
  minimal: 'Minimal',
  quote: 'Quote',
  poll: 'Poll',
  engagement: 'Engagement',
  promotional: 'Promo'
};

const DEFAULT_IMAGE_BOX = { x: 90, y: 620, width: 900, height: 860, rotation: 0 };

function categoryLabel(category) {
  return CATEGORY_LABELS[category] || category;
}

function getStoryTemplates() {
  return templates;
}

function getTemplateCategories() {
  const categories = Array.from(new Set(templates.map((template) => template.category)));
  return ['all', ...categories];
}

function getTemplatesByCategory(category = 'all') {
  if (category === 'all') {
    return templates;
  }
  return templates.filter((template) => template.category === category);
}

function buildStoryFromTemplate(template) {
  const textLayers = [];
  const emojis = [];
  const assets = [];
  const shapes = [];

  const story = {
    templateId: template.id,
    templateName: template.name,
    category: template.category,
    background: {
      type: 'image',
      src: template.background,
      overlay: template.overlay || 'rgba(255,255,255,0.02)'
    },
    image: {
      id: 'story-image',
      src: '',
      box: { ...DEFAULT_IMAGE_BOX },
      frame: {
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
        imageWidth: 0,
        imageHeight: 0
      }
    },
    textLayers,
    emojis,
    assets,
    shapes
  };

  (template.elements || []).forEach((element, index) => {
    const baseId = `${template.id}-${element.type}-${index}`;

    if (element.type === 'text') {
      textLayers.push({
        id: `text-${baseId}`,
        text: element.content || 'Text',
        x: element.x ?? 90,
        y: element.y ?? 250,
        width: element.width ?? 900,
        size: element.fontSize ?? 74,
        color: element.color || '#111827',
        fontFamily: element.font || 'Poppins',
        weight: element.weight || 700,
        align: element.align || 'left',
        italic: Boolean(element.italic)
      });
      return;
    }

    if (element.type === 'emoji') {
      emojis.push({
        id: `emoji-${baseId}`,
        char: element.content || '✨',
        x: element.x ?? 120,
        y: element.y ?? 140,
        size: element.size ?? 84,
        rotation: element.rotation || 0
      });
      return;
    }

    if (element.type === 'shape') {
      shapes.push({
        id: `shape-${baseId}`,
        type: 'rounded',
        x: element.x ?? 80,
        y: element.y ?? 180,
        width: element.width ?? 900,
        height: element.height ?? 280,
        color: element.color || '#ffffff',
        opacity: element.opacity ?? 0.4,
        radius: element.radius ?? 34,
        rotation: element.rotation || 0
      });
      return;
    }

    if (element.type === 'image') {
      const imagePayload = {
        x: element.x ?? 90,
        y: element.y ?? 620,
        width: element.width ?? 900,
        height: element.height ?? 860,
        rotation: element.rotation || 0
      };

      if (element.role === 'photo') {
        story.image = {
          ...story.image,
          src: element.src || '',
          box: imagePayload
        };
        return;
      }

      assets.push({
        id: `asset-${baseId}`,
        assetId: `asset-${index}`,
        src: element.src || '',
        name: element.name || 'Decorative Asset',
        ...imagePayload
      });
    }
  });

  if (!textLayers.length) {
    textLayers.push({
      id: `text-${template.id}-fallback`,
      text: template.name,
      x: 90,
      y: 250,
      width: 900,
      size: 76,
      color: '#111827',
      fontFamily: 'Poppins',
      weight: 700,
      align: 'center',
      italic: false
    });
  }

  return story;
}

function getDefaultStory() {
  return buildStoryFromTemplate(templates[0]);
}

export {
  categoryLabel,
  getStoryTemplates,
  getTemplateCategories,
  getTemplatesByCategory,
  buildStoryFromTemplate,
  getDefaultStory
};
