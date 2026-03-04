let slideCounter = 1;

export const TEMPLATE_PRESETS = {
  title_content: {
    name: 'Template 1 - Title + Content',
    description: 'Title slide + content slide flow.',
    backgroundColor: '#fff7e8',
    grid: '12-column top-title',
    textBox: { x: 70, y: 100, width: 940, height: 280, fontSize: 64 },
    imageBox: { x: 90, y: 390, width: 900, height: 620 }
  },
  image_center: {
    name: 'Template 2 - Image + Caption Block',
    description: 'Image centered with caption block.',
    backgroundColor: '#f3f9ff',
    grid: 'centered image + top caption',
    textBox: { x: 80, y: 80, width: 920, height: 170, fontSize: 50 },
    imageBox: { x: 140, y: 260, width: 800, height: 760 }
  },
  quote: {
    name: 'Template 3 - Quote Style',
    description: 'Large quote block with supporting image.',
    backgroundColor: '#fdf4ff',
    grid: 'quote focus',
    textBox: { x: 90, y: 190, width: 900, height: 420, fontSize: 60 },
    imageBox: { x: 120, y: 690, width: 840, height: 300 }
  },
  tip_list: {
    name: 'Template 4 - Tips List',
    description: 'Tip bullets with visual support image.',
    backgroundColor: '#f0fff4',
    grid: 'tips + media',
    textBox: { x: 80, y: 90, width: 920, height: 520, fontSize: 44 },
    imageBox: { x: 80, y: 640, width: 920, height: 360 }
  },
  custom: {
    name: 'Custom Template',
    description: 'Create your own placement freely.',
    backgroundColor: '#f6f7fb',
    grid: 'free-form',
    textBox: { x: 110, y: 150, width: 860, height: 340, fontSize: 54 },
    imageBox: { x: 170, y: 540, width: 740, height: 430 }
  }
};

function nextId() {
  slideCounter += 1;
  return `slide-${Date.now()}-${slideCounter}`;
}

export function createSlide(templateKey = 'title_content', index = 1) {
  const preset = TEMPLATE_PRESETS[templateKey] || TEMPLATE_PRESETS.title_content;
  return {
    id: nextId(),
    template: templateKey,
    title: `Slide ${index}`,
    body: 'Add your content here.',
    backgroundColor: preset.backgroundColor,
    textBox: { ...preset.textBox },
    imageBox: { ...preset.imageBox },
    textStyle: {
      fontFamily: 'Poppins',
      fontSize: preset.textBox.fontSize,
      fontWeight: 700,
      italic: false,
      color: '#111827',
      align: 'left',
      uppercase: false,
      highlight: false,
      gradient: false
    },
    imageSrc: '',
    backgroundImage: ''
  };
}

export function createSlides(count = 5, templateKey = 'title_content') {
  return Array.from({ length: count }).map((_, index) => createSlide(templateKey, index + 1));
}

export function applyTemplateToSlide(slide, templateKey) {
  const preset = TEMPLATE_PRESETS[templateKey] || TEMPLATE_PRESETS.title_content;
  return {
    ...slide,
    template: templateKey,
    backgroundColor: preset.backgroundColor,
    textBox: { ...preset.textBox },
    imageBox: { ...preset.imageBox },
    textStyle: {
      ...slide.textStyle,
      fontSize: preset.textBox.fontSize
    }
  };
}

export function duplicateSlide(slides, id) {
  const source = slides.find((slide) => slide.id === id);
  if (!source) {
    return slides;
  }

  const clone = {
    ...source,
    id: nextId(),
    title: `${source.title} Copy`
  };

  const index = slides.findIndex((slide) => slide.id === id);
  const next = [...slides];
  next.splice(index + 1, 0, clone);
  return next;
}

export function deleteSlide(slides, id) {
  const next = slides.filter((slide) => slide.id !== id);
  return next.length ? next : [createSlide()];
}

export function moveSlide(slides, id, direction) {
  const index = slides.findIndex((slide) => slide.id === id);
  if (index < 0) {
    return slides;
  }

  const target = direction === 'left' ? index - 1 : index + 1;
  if (target < 0 || target >= slides.length) {
    return slides;
  }

  const next = [...slides];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

export function reorderSlides(slides, sourceId, targetId) {
  const sourceIndex = slides.findIndex((item) => item.id === sourceId);
  const targetIndex = slides.findIndex((item) => item.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return slides;
  }

  const next = [...slides];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}
