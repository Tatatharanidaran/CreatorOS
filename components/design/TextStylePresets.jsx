'use client';

export const TEXT_STYLE_PRESETS = {
  bold_hook: {
    label: 'Bold Hook',
    values: {
      fontFamily: 'Anton',
      fontSize: 72,
      fontWeight: 700,
      italic: false,
      color: '#ffffff',
      uppercase: true,
      align: 'left',
      highlight: true,
      gradient: false
    }
  },
  creator_minimal: {
    label: 'Creator Minimal',
    values: {
      fontFamily: 'Raleway',
      fontSize: 44,
      fontWeight: 300,
      italic: false,
      color: '#111827',
      uppercase: false,
      align: 'left',
      highlight: false,
      gradient: false
    }
  },
  gradient_creator: {
    label: 'Gradient Creator',
    values: {
      fontFamily: 'Montserrat',
      fontSize: 64,
      fontWeight: 700,
      italic: false,
      color: '#ffffff',
      uppercase: false,
      align: 'left',
      highlight: false,
      gradient: true
    }
  },
  quote_style: {
    label: 'Quote Style',
    values: {
      fontFamily: 'Playfair Display',
      fontSize: 58,
      fontWeight: 600,
      italic: true,
      color: '#1f2937',
      uppercase: false,
      align: 'center',
      highlight: false,
      gradient: false
    }
  },
  modern_cta: {
    label: 'Modern CTA',
    values: {
      fontFamily: 'Poppins',
      fontSize: 56,
      fontWeight: 700,
      italic: false,
      color: '#ffffff',
      uppercase: false,
      align: 'center',
      highlight: true,
      gradient: false
    }
  }
};

export default function TextStylePresets({ onApply }) {
  return (
    <div className="preset-grid">
      {Object.entries(TEXT_STYLE_PRESETS).map(([key, preset]) => (
        <button key={key} type="button" className="template-card" onClick={() => onApply(preset.values)}>
          <strong>{preset.label}</strong>
          <span>Apply style preset</span>
        </button>
      ))}
    </div>
  );
}
