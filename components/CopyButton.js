'use client';

import { useState } from 'react';
import { copyToClipboard } from '../utils/copyToClipboard';

export default function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const ok = await copyToClipboard(text);
    setCopied(ok);
    if (ok) {
      setTimeout(() => setCopied(false), 1200);
    }
  }

  return (
    <button type="button" className="copy-btn" onClick={handleCopy}>
      {copied ? 'Copied' : label}
    </button>
  );
}
