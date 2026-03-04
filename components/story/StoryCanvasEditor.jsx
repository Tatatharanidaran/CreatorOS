'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import FontSelector from '../design/FontSelector';
import EmojiSelector from './EmojiSelector';
import StoryTemplatePicker from './StoryTemplatePicker';
import StoryAssetPanel from './StoryAssetPanel';
import StoryTemplateRenderer from './StoryTemplateRenderer';
import { downloadStory } from '../../utils/storyRenderer';
import { loadGoogleFont } from '../../utils/fontLoader';
import { MANUAL_ASSET_SOURCES } from '../../utils/assetLoader';
import { buildStoryFromTemplate, getDefaultStory } from '../../utils/templateLoader';

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;
const SCALE = 0.32;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getLayerLabel(layer) {
  if (!layer) {
    return 'None';
  }
  if (layer.type === 'text') {
    return 'Text';
  }
  if (layer.type === 'image') {
    return 'Image';
  }
  if (layer.type === 'emoji') {
    return 'Emoji';
  }
  if (layer.type === 'asset') {
    return 'Decorative Asset';
  }
  if (layer.type === 'shape') {
    return 'Shape';
  }
  return 'Layer';
}

function getInitialSelection(story) {
  if (story.textLayers?.length) {
    return { type: 'text', id: story.textLayers[0].id };
  }
  return { type: 'image', id: 'story-image' };
}

export default function StoryCanvasEditor() {
  const [story, setStory] = useState(() => getDefaultStory());
  const [selectedLayer, setSelectedLayer] = useState(() => getInitialSelection(getDefaultStory()));
  const [busy, setBusy] = useState(false);

  const stageRef = useRef(null);
  const inputRef = useRef(null);
  const interactionRef = useRef(null);

  const selectedText = useMemo(
    () => story.textLayers.find((item) => item.id === selectedLayer.id) || story.textLayers[0],
    [story.textLayers, selectedLayer]
  );

  const selectedEmoji = useMemo(
    () => story.emojis.find((item) => item.id === selectedLayer.id) || null,
    [story.emojis, selectedLayer]
  );

  const selectedAsset = useMemo(
    () => story.assets.find((item) => item.id === selectedLayer.id) || null,
    [story.assets, selectedLayer]
  );

  const selectedShape = useMemo(
    () => story.shapes.find((item) => item.id === selectedLayer.id) || null,
    [story.shapes, selectedLayer]
  );

  useEffect(() => {
    if (selectedText?.fontFamily) {
      loadGoogleFont(selectedText.fontFamily);
    }
  }, [selectedText]);

  useEffect(() => {
    function pointerToCanvas(event) {
      if (!stageRef.current) {
        return { x: 0, y: 0 };
      }
      const rect = stageRef.current.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) / SCALE,
        y: (event.clientY - rect.top) / SCALE
      };
    }

    function angleFromCenter(point, center) {
      return (Math.atan2(point.y - center.y, point.x - center.x) * 180) / Math.PI;
    }

    function onMove(event) {
      const interaction = interactionRef.current;
      if (!interaction || !stageRef.current) {
        return;
      }

      const pointer = pointerToCanvas(event);
      const x = pointer.x - (interaction.offsetX || 0);
      const y = pointer.y - (interaction.offsetY || 0);
      const dx = pointer.x - (interaction.startX || 0);
      const dy = pointer.y - (interaction.startY || 0);

      if (interaction.type === 'image') {
        setStory((prev) => {
          if (interaction.mode === 'drag') {
            const width = prev.image.box.width;
            const height = prev.image.box.height;
            return {
              ...prev,
              image: {
                ...prev.image,
                box: { ...prev.image.box, x: clamp(x, 0, CANVAS_WIDTH - width), y: clamp(y, 0, CANVAS_HEIGHT - height) }
              }
            };
          }

          if (interaction.mode === 'resize') {
            const width = clamp((interaction.baseWidth || prev.image.box.width) + dx, 120, CANVAS_WIDTH);
            const height = clamp((interaction.baseHeight || prev.image.box.height) + dy, 120, CANVAS_HEIGHT);
            return {
              ...prev,
              image: {
                ...prev.image,
                box: {
                  ...prev.image.box,
                  width,
                  height,
                  x: clamp(prev.image.box.x, 0, CANVAS_WIDTH - width),
                  y: clamp(prev.image.box.y, 0, CANVAS_HEIGHT - height)
                }
              }
            };
          }

          if (interaction.mode === 'rotate') {
            const angle = angleFromCenter(pointer, interaction.center);
            const rotation = (interaction.baseRotation || 0) + (angle - (interaction.startAngle || angle));
            return {
              ...prev,
              image: { ...prev.image, box: { ...prev.image.box, rotation: Math.round(rotation) } }
            };
          }

          return prev;
        });
        return;
      }

      if (interaction.type === 'emoji') {
        setStory((prev) => ({
          ...prev,
          emojis: prev.emojis.map((emoji) => {
            if (emoji.id !== interaction.id) {
              return emoji;
            }
            if (interaction.mode === 'drag') {
              return {
                ...emoji,
                x: clamp(x, 0, CANVAS_WIDTH - emoji.size),
                y: clamp(y, emoji.size, CANVAS_HEIGHT - 20)
              };
            }
            if (interaction.mode === 'resize') {
              const size = clamp((interaction.baseSize || emoji.size) + Math.max(dx, dy), 26, 260);
              return { ...emoji, size };
            }
            if (interaction.mode === 'rotate') {
              const angle = angleFromCenter(pointer, interaction.center);
              const rotation = (interaction.baseRotation || 0) + (angle - (interaction.startAngle || angle));
              return { ...emoji, rotation: Math.round(rotation) };
            }
            return emoji;
          })
        }));
        return;
      }

      if (interaction.type === 'asset') {
        setStory((prev) => ({
          ...prev,
          assets: prev.assets.map((asset) => {
            if (asset.id !== interaction.id) {
              return asset;
            }
            if (interaction.mode === 'drag') {
              return {
                ...asset,
                x: clamp(x, 0, CANVAS_WIDTH - asset.width),
                y: clamp(y, 0, CANVAS_HEIGHT - asset.height)
              };
            }
            if (interaction.mode === 'resize') {
              const width = clamp((interaction.baseWidth || asset.width) + dx, 60, CANVAS_WIDTH);
              const height = clamp((interaction.baseHeight || asset.height) + dy, 60, CANVAS_HEIGHT);
              return {
                ...asset,
                width,
                height,
                x: clamp(asset.x, 0, CANVAS_WIDTH - width),
                y: clamp(asset.y, 0, CANVAS_HEIGHT - height)
              };
            }
            if (interaction.mode === 'rotate') {
              const angle = angleFromCenter(pointer, interaction.center);
              const rotation = (interaction.baseRotation || 0) + (angle - (interaction.startAngle || angle));
              return { ...asset, rotation: Math.round(rotation) };
            }
            return asset;
          })
        }));
        return;
      }

      if (interaction.type === 'shape') {
        setStory((prev) => ({
          ...prev,
          shapes: prev.shapes.map((shape) => {
            if (shape.id !== interaction.id) {
              return shape;
            }
            if (interaction.mode === 'drag') {
              return {
                ...shape,
                x: clamp(x, 0, CANVAS_WIDTH - shape.width),
                y: clamp(y, 0, CANVAS_HEIGHT - shape.height)
              };
            }
            if (interaction.mode === 'resize') {
              const width = clamp((interaction.baseWidth || shape.width) + dx, 80, CANVAS_WIDTH);
              const height = clamp((interaction.baseHeight || shape.height) + dy, 80, CANVAS_HEIGHT);
              return {
                ...shape,
                width,
                height,
                x: clamp(shape.x, 0, CANVAS_WIDTH - width),
                y: clamp(shape.y, 0, CANVAS_HEIGHT - height)
              };
            }
            if (interaction.mode === 'rotate') {
              const angle = angleFromCenter(pointer, interaction.center);
              const rotation = (interaction.baseRotation || 0) + (angle - (interaction.startAngle || angle));
              return { ...shape, rotation: Math.round(rotation) };
            }
            return shape;
          })
        }));
        return;
      }

      if (interaction.type === 'text') {
        setStory((prev) => ({
          ...prev,
          textLayers: prev.textLayers.map((layer) => {
            if (layer.id !== interaction.id) {
              return layer;
            }
            if (interaction.mode === 'drag') {
              const nextX = clamp(x, 0, CANVAS_WIDTH - layer.width);
              const nextY = clamp(y, 0, CANVAS_HEIGHT - Math.max(90, layer.size * 3));
              return { ...layer, x: nextX, y: nextY };
            }
            return layer;
          })
        }));
      }
    }

    function onUp() {
      interactionRef.current = null;
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  function applyTemplate(template) {
    const nextStory = buildStoryFromTemplate(template);
    setStory(nextStory);
    setSelectedLayer(getInitialSelection(nextStory));
  }

  function patchSelectedText(data) {
    setStory((prev) => ({
      ...prev,
      textLayers: prev.textLayers.map((item) => (item.id === selectedText.id ? { ...item, ...data } : item))
    }));
  }

  function patchEmoji(id, data) {
    setStory((prev) => ({
      ...prev,
      emojis: prev.emojis.map((item) => (item.id === id ? { ...item, ...data } : item))
    }));
  }

  function patchAsset(id, data) {
    setStory((prev) => ({
      ...prev,
      assets: prev.assets.map((item) => (item.id === id ? { ...item, ...data } : item))
    }));
  }

  function patchShape(id, data) {
    setStory((prev) => ({
      ...prev,
      shapes: prev.shapes.map((item) => (item.id === id ? { ...item, ...data } : item))
    }));
  }

  function addEmoji(char) {
    const id = `emoji-${Date.now()}`;
    setStory((prev) => ({
      ...prev,
      emojis: [...prev.emojis, { id, char, x: 120, y: 170, size: 86, rotation: 0 }]
    }));
    setSelectedLayer({ type: 'emoji', id });
  }

  function addAsset(asset) {
    const id = `asset-${asset.id}-${Date.now()}`;
    setStory((prev) => ({
      ...prev,
      assets: [...prev.assets, { id, assetId: asset.id, name: asset.name, src: asset.src, x: 120, y: 1220, width: 260, height: 260, rotation: 0 }]
    }));
    setSelectedLayer({ type: 'asset', id });
  }

  function setBackground(item) {
    setStory((prev) => ({
      ...prev,
      background: { type: 'image', src: item.src, overlay: 'rgba(15, 23, 42, 0.1)' }
    }));
  }

  function openImagePicker() {
    if (inputRef.current) {
      inputRef.current.click();
    }
  }

  function onImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setStory((prev) => ({ ...prev, image: { ...prev.image, src: `${reader.result || ''}` } }));
      setSelectedLayer({ type: 'image', id: 'story-image' });
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setStory((prev) => ({ ...prev, image: { ...prev.image, src: '' } }));
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  function removeSelectedLayer() {
    if (selectedLayer.type === 'emoji') {
      setStory((prev) => ({ ...prev, emojis: prev.emojis.filter((item) => item.id !== selectedLayer.id) }));
      setSelectedLayer(getInitialSelection(story));
      return;
    }

    if (selectedLayer.type === 'asset') {
      setStory((prev) => ({ ...prev, assets: prev.assets.filter((item) => item.id !== selectedLayer.id) }));
      setSelectedLayer(getInitialSelection(story));
      return;
    }

    if (selectedLayer.type === 'shape') {
      setStory((prev) => ({ ...prev, shapes: prev.shapes.filter((item) => item.id !== selectedLayer.id) }));
      setSelectedLayer(getInitialSelection(story));
    }
  }

  function startTransform(event, type, id, mode, payload) {
    event.preventDefault();
    event.stopPropagation();

    if (!stageRef.current) {
      return;
    }

    const rect = stageRef.current.getBoundingClientRect();
    const pointerX = (event.clientX - rect.left) / SCALE;
    const pointerY = (event.clientY - rect.top) / SCALE;

    const baseWidth = payload.width || payload.size || 0;
    const baseHeight = payload.height || payload.size || 0;
    const center = {
      x: (payload.x || 0) + baseWidth / 2,
      y: (payload.y || 0) + baseHeight / 2
    };

    interactionRef.current = {
      type,
      id,
      mode,
      offsetX: pointerX - (payload.x || 0),
      offsetY: pointerY - (payload.y || 0),
      startX: pointerX,
      startY: pointerY,
      baseWidth: payload.width,
      baseHeight: payload.height,
      baseSize: payload.size,
      center,
      startAngle: (Math.atan2(pointerY - center.y, pointerX - center.x) * 180) / Math.PI,
      baseRotation: payload.rotation || 0
    };
  }

  async function download() {
    setBusy(true);
    try {
      await downloadStory(story);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel canva-shell story-shell">
      <div className="canva-left">
        <h3>Templates</h3>
        <StoryTemplatePicker onPick={applyTemplate} activeTemplateId={story.templateId} />

        <h3>Assets</h3>
        <StoryAssetPanel onAddAsset={addAsset} onSetBackground={setBackground} />

        <label>
          Upload image
          <input ref={inputRef} type="file" accept="image/*" onChange={onImageUpload} />
        </label>

        <h3>Emojis</h3>
        <EmojiSelector onPick={addEmoji} />

        <div className="asset-links">
          <strong>Free source links</strong>
          {MANUAL_ASSET_SOURCES.map((source) => (
            <a key={source.provider} href={source.url} target="_blank" rel="noreferrer">
              {source.provider}
            </a>
          ))}
        </div>
      </div>

      <div className="canva-center">
        <h3>Story Canvas (1080 x 1920)</h3>
        <StoryTemplateRenderer
          stageRef={stageRef}
          story={story}
          selectedLayer={selectedLayer}
          setSelectedLayer={setSelectedLayer}
          startTransform={startTransform}
          scale={SCALE}
        />
      </div>

      <div className="canva-right">
        <h3>Element settings</h3>
        <p className="layer-pill">Selected: {getLayerLabel(selectedLayer)}</p>

        {selectedLayer.type === 'text' && selectedText ? (
          <>
            <label>
              Text
              <textarea rows={3} value={selectedText.text} onChange={(event) => patchSelectedText({ text: event.target.value })} />
            </label>
            <FontSelector value={selectedText.fontFamily} onChange={(fontFamily) => patchSelectedText({ fontFamily })} />
            <div className="editor-grid">
              <label>
                Font size
                <input
                  type="range"
                  min={24}
                  max={140}
                  value={selectedText.size}
                  onChange={(event) => patchSelectedText({ size: Number(event.target.value) })}
                />
              </label>
              <label>
                Font color
                <input type="color" value={selectedText.color} onChange={(event) => patchSelectedText({ color: event.target.value })} />
              </label>
              <label>
                Text X
                <input type="range" min={20} max={960} value={selectedText.x} onChange={(event) => patchSelectedText({ x: Number(event.target.value) })} />
              </label>
              <label>
                Text Y
                <input
                  type="range"
                  min={40}
                  max={1840}
                  value={selectedText.y}
                  onChange={(event) => patchSelectedText({ y: Number(event.target.value) })}
                />
              </label>
              <label>
                Width
                <input
                  type="range"
                  min={220}
                  max={1000}
                  value={selectedText.width}
                  onChange={(event) => patchSelectedText({ width: Number(event.target.value) })}
                />
              </label>
              <label>
                Align
                <select value={selectedText.align} onChange={(event) => patchSelectedText({ align: event.target.value })}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                </select>
              </label>
            </div>
          </>
        ) : null}

        {selectedLayer.type === 'image' ? (
          <>
            <div className="editor-row">
              <button type="button" className="primary-btn" onClick={openImagePicker}>
                Replace Image
              </button>
              <button type="button" className="ghost-link" onClick={removeImage}>
                Remove Image
              </button>
            </div>
            <p className="transform-hint">Drag image on canvas to move. Use bottom-right handle to resize and top handle to rotate.</p>
          </>
        ) : null}

        {selectedLayer.type === 'emoji' && selectedEmoji ? (
          <>
            <p className="transform-hint">Drag emoji on canvas to move. Use bottom-right handle to scale and top handle to rotate.</p>
            <button type="button" className="ghost-link" onClick={removeSelectedLayer}>
              Remove Emoji
            </button>
          </>
        ) : null}

        {selectedLayer.type === 'asset' && selectedAsset ? (
          <>
            <p className="transform-hint">Drag asset on canvas to move. Use bottom-right handle to resize and top handle to rotate.</p>
            <button type="button" className="ghost-link" onClick={removeSelectedLayer}>
              Remove Asset
            </button>
          </>
        ) : null}

        {selectedLayer.type === 'shape' && selectedShape ? (
          <>
            <div className="editor-grid">
              <label>
                Color
                <input type="color" value={selectedShape.color} onChange={(event) => patchShape(selectedShape.id, { color: event.target.value })} />
              </label>
              <label>
                Opacity
                <input
                  type="range"
                  min={0.05}
                  max={0.95}
                  step={0.05}
                  value={selectedShape.opacity}
                  onChange={(event) => patchShape(selectedShape.id, { opacity: Number(event.target.value) })}
                />
              </label>
            </div>
            <p className="transform-hint">Drag shape on canvas to move. Use bottom-right handle to resize and top handle to rotate.</p>
            <button type="button" className="ghost-link" onClick={removeSelectedLayer}>
              Remove Shape
            </button>
          </>
        ) : null}

        <button type="button" className="primary-btn" onClick={download} disabled={busy}>
          {busy ? 'Downloading...' : 'Download Story'}
        </button>
      </div>
    </section>
  );
}
