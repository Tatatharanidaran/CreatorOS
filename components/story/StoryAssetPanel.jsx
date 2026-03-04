import { useState } from 'react';
import StoryTemplateAssets from './StoryTemplateAssets';

export default function StoryAssetPanel({ onAddAsset, onSetBackground }) {
  const [tab, setTab] = useState('decorative');

  function onPick(item, mode) {
    if (mode === 'background') {
      onSetBackground(item);
      return;
    }
    onAddAsset(item);
  }

  return (
    <div className="story-asset-panel">
      <div className="asset-tabs">
        <button type="button" className={tab === 'decorative' ? 'active' : ''} onClick={() => setTab('decorative')}>
          Decorative
        </button>
        <button type="button" className={tab === 'background' ? 'active' : ''} onClick={() => setTab('background')}>
          Backgrounds
        </button>
      </div>
      <StoryTemplateAssets mode={tab} onPick={onPick} />
    </div>
  );
}
