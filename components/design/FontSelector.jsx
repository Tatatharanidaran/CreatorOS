'use client';

import { useEffect } from 'react';
import { SUPPORTED_FONTS, loadGoogleFont } from '../../utils/fontLoader';

export default function FontSelector({ value, onChange }) {
  useEffect(() => {
    loadGoogleFont(value);
  }, [value]);

  return (
    <label>
      Font family
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {SUPPORTED_FONTS.map((font) => (
          <option key={font} value={font}>
            {font}
          </option>
        ))}
      </select>
    </label>
  );
}
