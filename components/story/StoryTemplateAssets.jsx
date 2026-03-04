import { BACKGROUND_ASSETS, DECORATIVE_ASSETS } from '../../utils/assetLoader';

export default function StoryTemplateAssets({ mode = 'decorative', onPick }) {
  const list = mode === 'background' ? BACKGROUND_ASSETS : DECORATIVE_ASSETS;

  return (
    <div className="story-asset-grid">
      {list.map((item) => (
        <button key={item.id} type="button" className="story-asset-card" onClick={() => onPick(item, mode)}>
          <img src={item.src} alt={item.name} />
          <strong>{item.name}</strong>
          <span>{item.category}</span>
        </button>
      ))}
    </div>
  );
}
