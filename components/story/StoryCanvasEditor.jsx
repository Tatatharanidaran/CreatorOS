'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import FontSelector from '../design/FontSelector';
import EmojiSelector from './EmojiSelector';
import StoryTemplatePicker from './StoryTemplatePicker';
import StoryAssetPanel from './StoryAssetPanel';
import StoryTemplateRenderer from './StoryTemplateRenderer';
import ImageFrameControls from './ImageFrameControls';
import { downloadStory } from '../../utils/storyRenderer';
import { loadGoogleFont } from '../../utils/fontLoader';
import { MANUAL_ASSET_SOURCES } from '../../utils/assetLoader';
import { buildStoryFromTemplate, getDefaultStory } from '../../utils/templateLoader';
import { clampOffsets, clampZoom, getDefaultFrameState } from '../../utils/imageFrameHandler';

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
  const [clipboardLayer, setClipboardLayer] = useState(null);
  const [history, setHistory] = useState([]);
  const [isUndoing, setIsUndoing] = useState(false);

  const stageRef = useRef(null);
  const inputRef = useRef(null);
  const interactionRef = useRef(null);

  function cloneData(value) {
    return JSON.parse(JSON.stringify(value));
  }

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
    setHistory([{ story: cloneData(story), selectedLayer: cloneData(selectedLayer) }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isUndoing) {
      setIsUndoing(false);
      return;
    }
    setHistory((prev) => {
      const entry = { story: cloneData(story), selectedLayer: cloneData(selectedLayer) };
      const last = prev[prev.length - 1];
      if (last && JSON.stringify(last.story) === JSON.stringify(entry.story)) {
        return prev;
      }
      return [...prev.slice(-79), entry];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story]);

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
                box: { ...prev.image.box, x, y }
              }
            };
          }

          if (interaction.mode === 'resize') {
            const width = Math.max(120, (interaction.baseWidth || prev.image.box.width) + dx);
            const height = Math.max(120, (interaction.baseHeight || prev.image.box.height) + dy);
            return {
              ...prev,
              image: {
                ...prev.image,
                box: {
                  ...prev.image.box,
                  width,
                  height,
                  x: prev.image.box.x,
                  y: prev.image.box.y
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
    if (!selectedText) {
      return;
    }
    setStory((prev) => ({
      ...prev,
      textLayers: prev.textLayers.map((item) => (item.id === selectedText.id ? { ...item, ...data } : item))
    }));
  }

  function addTextLayer() {
    const id = `text-${Date.now()}`;
    const base = selectedText || story.textLayers[0];
    const fallback = {
      text: 'New text',
      x: 90,
      y: 320,
      width: 760,
      size: 68,
      color: '#111827',
      fontFamily: 'Poppins',
      weight: 700,
      align: 'left',
      italic: false
    };
    const seed = base || fallback;

    setStory((prev) => ({
      ...prev,
      textLayers: [
        ...prev.textLayers,
        {
          ...seed,
          id,
          text: 'New text',
          x: clamp((seed.x || 90) + 24, 0, CANVAS_WIDTH - (seed.width || 760)),
          y: clamp((seed.y || 240) + 24, 0, CANVAS_HEIGHT - 120)
        }
      ]
    }));
    setSelectedLayer({ type: 'text', id });
  }

  function applyFontToAllTexts(fontFamily) {
    setStory((prev) => ({
      ...prev,
      textLayers: prev.textLayers.map((item) => ({ ...item, fontFamily }))
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

  function patchImageFrame(nextFrame) {
    setStory((prev) => {
      if (!prev.image) {
        return prev;
      }
      return {
        ...prev,
        image: {
          ...prev.image,
          frame: {
            ...(prev.image.frame || {}),
            ...(nextFrame || {})
          }
        }
      };
    });
  }

  function onImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setStory((prev) => ({
        ...prev,
        image: {
          ...prev.image,
          src: `${reader.result || ''}`,
          frame: {
            zoom: 1,
            offsetX: 0,
            offsetY: 0,
            imageWidth: 0,
            imageHeight: 0
          }
        }
      }));
      setSelectedLayer({ type: 'image', id: 'story-image' });
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setStory((prev) => ({
      ...prev,
      image: {
        ...prev.image,
        src: '',
        frame: {
          zoom: 1,
          offsetX: 0,
          offsetY: 0,
          imageWidth: 0,
          imageHeight: 0
        }
      }
    }));
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  function resetImageFrame() {
    setStory((prev) => {
      const image = prev.image;
      if (!image?.src) {
        return prev;
      }
      const w = image.frame?.imageWidth || 0;
      const h = image.frame?.imageHeight || 0;
      if (!w || !h) {
        return {
          ...prev,
          image: {
            ...image,
            frame: {
              zoom: 1,
              offsetX: 0,
              offsetY: 0,
              imageWidth: w,
              imageHeight: h
            }
          }
        };
      }
      const base = getDefaultFrameState({ frameWidth: image.box.width, frameHeight: image.box.height, imageWidth: w, imageHeight: h });
      return {
        ...prev,
        image: {
          ...image,
          frame: base
        }
      };
    });
  }

  function setImageZoom(nextZoom) {
    setStory((prev) => {
      const image = prev.image;
      if (!image?.src) {
        return prev;
      }
      const frame = image.frame || {};
      const zoom = clampZoom(nextZoom);
      const w = frame.imageWidth || 0;
      const h = frame.imageHeight || 0;
      if (!w || !h) {
        return {
          ...prev,
          image: {
            ...image,
            frame: {
              ...frame,
              zoom
            }
          }
        };
      }
      const nextOffsets = clampOffsets({
        offsetX: frame.offsetX || 0,
        offsetY: frame.offsetY || 0,
        imageWidth: w,
        imageHeight: h,
        frameWidth: image.box.width,
        frameHeight: image.box.height,
        zoom
      });

      return {
        ...prev,
        image: {
          ...image,
          frame: {
            ...frame,
            zoom,
            ...nextOffsets
          }
        }
      };
    });
  }

  function removeSelectedLayer() {
    setStory((prev) => {
      let next = prev;
      if (selectedLayer.type === 'text') {
        next = {
          ...prev,
          textLayers: prev.textLayers.filter((item) => item.id !== selectedLayer.id)
        };
      } else if (selectedLayer.type === 'emoji') {
        next = { ...prev, emojis: prev.emojis.filter((item) => item.id !== selectedLayer.id) };
      } else if (selectedLayer.type === 'asset') {
        next = { ...prev, assets: prev.assets.filter((item) => item.id !== selectedLayer.id) };
      } else if (selectedLayer.type === 'shape') {
        next = { ...prev, shapes: prev.shapes.filter((item) => item.id !== selectedLayer.id) };
      }
      queueMicrotask(() => setSelectedLayer(getInitialSelection(next)));
      return next;
    });
  }

  function copySelectedLayer() {
    if (selectedLayer.type === 'image') {
      setClipboardLayer({ type: 'image', payload: cloneData(story.image.box) });
      return;
    }
    if (selectedLayer.type === 'text' && selectedText) {
      setClipboardLayer({ type: 'text', payload: cloneData(selectedText) });
      return;
    }
    if (selectedLayer.type === 'emoji' && selectedEmoji) {
      setClipboardLayer({ type: 'emoji', payload: cloneData(selectedEmoji) });
      return;
    }
    if (selectedLayer.type === 'asset' && selectedAsset) {
      setClipboardLayer({ type: 'asset', payload: cloneData(selectedAsset) });
      return;
    }
    if (selectedLayer.type === 'shape' && selectedShape) {
      setClipboardLayer({ type: 'shape', payload: cloneData(selectedShape) });
    }
  }

  function pasteSelectedLayer() {
    if (!clipboardLayer) {
      return;
    }

    if (clipboardLayer.type === 'image') {
      setStory((prev) => ({
        ...prev,
        image: {
          ...prev.image,
          box: {
            ...prev.image.box,
            x: clamp((clipboardLayer.payload.x || 90) + 20, 0, CANVAS_WIDTH - prev.image.box.width),
            y: clamp((clipboardLayer.payload.y || 620) + 20, 0, CANVAS_HEIGHT - prev.image.box.height)
          }
        }
      }));
      setSelectedLayer({ type: 'image', id: 'story-image' });
      return;
    }

    if (clipboardLayer.type === 'text') {
      const id = `text-${Date.now()}`;
      const payload = clipboardLayer.payload;
      setStory((prev) => ({
        ...prev,
        textLayers: [
          ...prev.textLayers,
          {
            ...payload,
            id,
            x: clamp((payload.x || 90) + 20, 0, CANVAS_WIDTH - (payload.width || 300)),
            y: clamp((payload.y || 250) + 20, 0, CANVAS_HEIGHT - 120)
          }
        ]
      }));
      setSelectedLayer({ type: 'text', id });
      return;
    }

    if (clipboardLayer.type === 'emoji') {
      const id = `emoji-${Date.now()}`;
      const payload = clipboardLayer.payload;
      setStory((prev) => ({
        ...prev,
        emojis: [...prev.emojis, { ...payload, id, x: (payload.x || 100) + 20, y: (payload.y || 120) + 20 }]
      }));
      setSelectedLayer({ type: 'emoji', id });
      return;
    }

    if (clipboardLayer.type === 'asset') {
      const id = `asset-${Date.now()}`;
      const payload = clipboardLayer.payload;
      setStory((prev) => ({
        ...prev,
        assets: [...prev.assets, { ...payload, id, x: (payload.x || 100) + 20, y: (payload.y || 100) + 20 }]
      }));
      setSelectedLayer({ type: 'asset', id });
      return;
    }

    if (clipboardLayer.type === 'shape') {
      const id = `shape-${Date.now()}`;
      const payload = clipboardLayer.payload;
      setStory((prev) => ({
        ...prev,
        shapes: [...prev.shapes, { ...payload, id, x: (payload.x || 100) + 20, y: (payload.y || 100) + 20 }]
      }));
      setSelectedLayer({ type: 'shape', id });
    }
  }

  function undoLastAction() {
    setHistory((prev) => {
      if (prev.length < 2) {
        return prev;
      }
      const next = prev.slice(0, -1);
      const restore = next[next.length - 1];
      setIsUndoing(true);
      setStory(cloneData(restore.story));
      setSelectedLayer(cloneData(restore.selectedLayer));
      return next;
    });
  }

  useEffect(() => {
    function isTypingTarget(target) {
      if (!target) {
        return false;
      }
      const tag = target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
    }

    function onKeyDown(event) {
      const withModifier = event.ctrlKey || event.metaKey;
      const lowerKey = event.key.toLowerCase();

      if (withModifier && lowerKey === 'c') {
        if (!isTypingTarget(event.target)) {
          event.preventDefault();
          copySelectedLayer();
        }
        return;
      }

      if (withModifier && lowerKey === 'v') {
        if (!isTypingTarget(event.target)) {
          event.preventDefault();
          pasteSelectedLayer();
        }
        return;
      }

      if (withModifier && lowerKey === 'z') {
        if (!isTypingTarget(event.target)) {
          event.preventDefault();
          undoLastAction();
        }
        return;
      }

      if (isTypingTarget(event.target)) {
        if (event.key === 'Escape') {
          event.target.blur();
        }
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        interactionRef.current = null;
        return;
      }

      if (event.key !== 'Delete' && event.key !== 'Backspace') {
        return;
      }

      if (selectedLayer.type === 'image') {
        event.preventDefault();
        removeImage();
        return;
      }

      if (selectedLayer.type === 'text' || selectedLayer.type === 'asset' || selectedLayer.type === 'emoji' || selectedLayer.type === 'shape') {
        event.preventDefault();
        removeSelectedLayer();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedLayer, story, selectedText, selectedEmoji, selectedAsset, selectedShape, clipboardLayer]);

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
          openImagePicker={openImagePicker}
          patchImageFrame={patchImageFrame}
        />
      </div>

      <div className="canva-right">
        <h3>Element settings</h3>
        <p className="layer-pill">Selected: {getLayerLabel(selectedLayer)}</p>
        <div className="editor-row">
          <button type="button" className="copy-btn" onClick={addTextLayer}>
            Add Text
          </button>
        </div>

        {selectedLayer.type === 'text' && selectedText ? (
          <>
            <div className="editor-row">
              <button type="button" className="ghost-link" onClick={removeSelectedLayer}>
                Delete Text
              </button>
            </div>
            <label>
              Text
              <textarea rows={3} value={selectedText.text} onChange={(event) => patchSelectedText({ text: event.target.value })} />
            </label>
            <FontSelector value={selectedText.fontFamily} onChange={(fontFamily) => patchSelectedText({ fontFamily })} />
            <button type="button" className="copy-btn" onClick={() => applyFontToAllTexts(selectedText.fontFamily)}>
              Apply This Font To All Text
            </button>
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
            <ImageFrameControls
              hasImage={Boolean(story.image?.src)}
              zoom={story.image?.frame?.zoom || 1}
              onReplace={openImagePicker}
              onRemove={removeImage}
              onZoomChange={setImageZoom}
              onReset={resetImageFrame}
            />
            <p className="transform-hint">
              Drag inside the frame to reposition. Scroll or use the slider to zoom. Hold Alt and drag to move the whole frame. Use the handles to resize and rotate.
            </p>
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
