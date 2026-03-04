const FONT_QUERY = {
  Poppins: 'Poppins:wght@300;400;600;700',
  Montserrat: 'Montserrat:wght@300;400;600;700',
  'Bebas Neue': 'Bebas+Neue:wght@400',
  Oswald: 'Oswald:wght@300;400;600;700',
  'Playfair Display': 'Playfair+Display:wght@400;600;700',
  Anton: 'Anton:wght@400',
  Raleway: 'Raleway:wght@300;400;600;700',
  Lato: 'Lato:wght@300;400;700'
};

export const SUPPORTED_FONTS = Object.keys(FONT_QUERY);

const loaded = new Set();

export async function loadGoogleFont(fontName) {
  if (!fontName || loaded.has(fontName) || typeof document === 'undefined') {
    return;
  }

  const query = FONT_QUERY[fontName] || FONT_QUERY.Poppins;
  const id = `font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;

  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${query}&display=swap`;
    document.head.appendChild(link);
  }

  try {
    await document.fonts.load(`700 24px "${fontName}"`);
  } catch {
    // Ignore and fallback to default font.
  }

  loaded.add(fontName);
}
