'use client';

import { useEffect, useMemo, useState } from 'react';
import CarouselTemplateLoader from './CarouselTemplateLoader';
import CarouselSlideManager from './CarouselSlideManager';
import SlideEditor from './SlideEditor';
import SlideCounterModal from './SlideCounterModal';
import {
  applyTemplateToSlide,
  createSlide,
  createSlides,
  deleteSlide,
  moveSlide,
  reorderSlides
} from '../../utils/slideManager';
import { downloadSlide, downloadSlides } from '../../utils/carouselRenderer';

const CANVAS_SIZE = 580;
const SCALE = CANVAS_SIZE / 1080;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default function CarouselBuilder() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [slideCount, setSlideCount] = useState(5);
  const [slides, setSlides] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('title_content');
  const [busy, setBusy] = useState(false);
  const [dragState, setDragState] = useState(null);
  const [clipboardSlide, setClipboardSlide] = useState(null);
  const [history, setHistory] = useState([]);
  const [isUndoing, setIsUndoing] = useState(false);

  function startBuilder() {
    const initialSlides = createSlides(slideCount, 'title_content');
    setSlides(initialSlides);
    setSelectedId(initialSlides[0].id);
    setSelectedTemplate('title_content');
    setIsInitialized(true);
  }

  const selectedSlide = useMemo(() => slides.find((slide) => slide.id === selectedId) || slides[0], [slides, selectedId]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    if (isUndoing) {
      setIsUndoing(false);
      return;
    }
    setHistory((prev) => {
      const last = prev[prev.length - 1];
      if (last?.slides === slides && last?.selectedId === selectedId) {
        return prev;
      }
      return [...prev.slice(-49), { slides, selectedId }];
    });
  }, [slides, selectedId, isInitialized, isUndoing]);

  useEffect(() => {
    if (!slides.length) {
      return;
    }

    if (!slides.find((slide) => slide.id === selectedId)) {
      setSelectedId(slides[0].id);
    }
  }, [slides, selectedId]);

  function updateSlide(updated) {
    setSlides((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  }

  function patchSelected(patcher) {
    if (!selectedSlide) {
      return;
    }

    setSlides((prev) => prev.map((slide) => (slide.id === selectedSlide.id ? patcher(slide) : slide)));
  }

  function applyTemplate(templateKey) {
    setSelectedTemplate(templateKey);
    patchSelected((slide) => applyTemplateToSlide(slide, templateKey));
  }

  function onCanvasMouseDown(event, target) {
    if (!selectedSlide) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / SCALE;
    const offsetY = (event.clientY - rect.top) / SCALE;

    if (target === 'image-drag') {
      setDragState({
        type: 'move',
        startX: offsetX,
        startY: offsetY,
        baseX: selectedSlide.imageBox.x,
        baseY: selectedSlide.imageBox.y
      });
    }

    if (target === 'image-resize') {
      setDragState({
        type: 'resize',
        startX: offsetX,
        startY: offsetY,
        baseW: selectedSlide.imageBox.width,
        baseH: selectedSlide.imageBox.height
      });
    }
  }

  function onCanvasMouseMove(event) {
    if (!dragState || !selectedSlide) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / SCALE;
    const offsetY = (event.clientY - rect.top) / SCALE;

    if (dragState.type === 'move') {
      const nextX = clamp(dragState.baseX + (offsetX - dragState.startX), 0, 1080 - selectedSlide.imageBox.width);
      const nextY = clamp(dragState.baseY + (offsetY - dragState.startY), 0, 1080 - selectedSlide.imageBox.height);
      patchSelected((slide) => ({ ...slide, imageBox: { ...slide.imageBox, x: nextX, y: nextY } }));
    }

    if (dragState.type === 'resize') {
      const nextW = clamp(dragState.baseW + (offsetX - dragState.startX), 100, 1080);
      const nextH = clamp(dragState.baseH + (offsetY - dragState.startY), 100, 1080);
      patchSelected((slide) => ({ ...slide, imageBox: { ...slide.imageBox, width: nextW, height: nextH } }));
    }
  }

  function stopDrag() {
    setDragState(null);
  }

  function selectNextSlide(direction) {
    if (!slides.length || !selectedSlide) {
      return;
    }
    const currentIndex = slides.findIndex((slide) => slide.id === selectedSlide.id);
    if (currentIndex < 0) {
      return;
    }
    const targetIndex = clamp(currentIndex + direction, 0, slides.length - 1);
    setSelectedId(slides[targetIndex].id);
  }

  function copySelectedSlide() {
    if (!selectedSlide) {
      return;
    }
    setClipboardSlide(JSON.parse(JSON.stringify(selectedSlide)));
  }

  function pasteClipboardSlide() {
    if (!clipboardSlide || !selectedSlide) {
      return;
    }
    const nextId = createSlide(clipboardSlide.template || selectedTemplate, slides.length + 1).id;
    setSlides((prev) => {
      const index = prev.findIndex((item) => item.id === selectedSlide.id);
      const insertIndex = index < 0 ? prev.length : index + 1;
      const pasted = { ...clipboardSlide, id: nextId, title: `${clipboardSlide.title || 'Slide'} Copy` };
      const next = [...prev];
      next.splice(insertIndex, 0, pasted);
      return next;
    });
    setSelectedId(nextId);
  }

  function undoLastAction() {
    if (!history.length) {
      return;
    }
    const previous = history[history.length - 1];
    setIsUndoing(true);
    setHistory((prev) => prev.slice(0, -1));
    setSlides(previous.slides);
    setSelectedId(previous.selectedId);
  }

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    function isInputTarget(target) {
      if (!target) {
        return false;
      }
      const tag = target.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
    }

    function onKeyDown(event) {
      const withModifier = event.ctrlKey || event.metaKey;
      const typing = isInputTarget(event.target);
      const key = event.key.toLowerCase();

      if (withModifier && key === 'c' && !typing) {
        event.preventDefault();
        copySelectedSlide();
        return;
      }

      if (withModifier && key === 'v' && !typing) {
        event.preventDefault();
        pasteClipboardSlide();
        return;
      }

      if (withModifier && key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undoLastAction();
        return;
      }

      if (typing) {
        if (event.key === 'Escape') {
          event.target.blur();
        }
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        selectNextSlide(1);
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        selectNextSlide(-1);
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        stopDrag();
        return;
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        if (selectedSlide?.id) {
          setSlides((prev) => deleteSlide(prev, selectedSlide.id));
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isInitialized, slides, selectedSlide, clipboardSlide, history, selectedTemplate]);

  async function downloadCurrent() {
    if (!selectedSlide) {
      return;
    }

    const index = slides.findIndex((item) => item.id === selectedSlide.id);
    setBusy(true);
    try {
      await downloadSlide(selectedSlide, index + 1);
    } finally {
      setBusy(false);
    }
  }

  async function downloadAll() {
    setBusy(true);
    try {
      await downloadSlides(slides);
    } finally {
      setBusy(false);
    }
  }

  if (!isInitialized) {
    return <SlideCounterModal value={slideCount} onChange={setSlideCount} onStart={startBuilder} />;
  }

  return (
    <section className="stack-layout">
      <section className="panel canva-shell">
        <div className="canva-left">
          <h3>Templates</h3>
          <CarouselTemplateLoader selectedTemplate={selectedTemplate} onSelectTemplate={applyTemplate} />

          <h3>Slides</h3>
          <div className="slide-toolbar">
            <button type="button" className="copy-btn" onClick={() => {
              const newSlide = createSlide(selectedTemplate, slides.length + 1);
              setSlides((prev) => [...prev, newSlide]);
              setSelectedId(newSlide.id);
            }}>
              Add Slide
            </button>
            <button
              type="button"
              className="copy-btn"
              onClick={() => {
                const duplicatedId = createSlide(selectedTemplate, slides.length + 1).id;
                setSlides((prev) => {
                  const source = prev.find((slide) => slide.id === selectedSlide.id);
                  if (!source) {
                    return prev;
                  }
                  const clone = { ...source, id: duplicatedId, title: `${source.title} Copy` };
                  const index = prev.findIndex((slide) => slide.id === selectedSlide.id);
                  const next = [...prev];
                  next.splice(index + 1, 0, clone);
                  return next;
                });
                setSelectedId(duplicatedId);
              }}
            >
              Duplicate
            </button>
            <button
              type="button"
              className="copy-btn"
              onClick={() => setSlides((prev) => deleteSlide(prev, selectedSlide.id))}
            >
              Delete
            </button>
          </div>

          <h3>Elements</h3>
          <div className="slide-toolbar">
            <button type="button" className="copy-btn" onClick={() => setSlides((prev) => moveSlide(prev, selectedSlide.id, 'left'))}>
              Move Left
            </button>
            <button type="button" className="copy-btn" onClick={() => setSlides((prev) => moveSlide(prev, selectedSlide.id, 'right'))}>
              Move Right
            </button>
          </div>
        </div>

        <div className="canva-center">
          <h3>Canvas</h3>
          <p className="shortcut-hint">
            Shortcuts: Left/Right arrows navigate slides, Ctrl/Cmd+C copy slide, Ctrl/Cmd+V paste, Ctrl/Cmd+Z undo, Delete remove slide, Esc cancel drag.
          </p>
          <div
            className="canvas-stage"
            onMouseMove={onCanvasMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
            style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, backgroundColor: selectedSlide?.backgroundColor || '#fff' }}
          >
            {selectedSlide?.backgroundImage ? <img src={selectedSlide.backgroundImage} alt="Background" className="canvas-bg" /> : null}

            <div
              className="canvas-image-box"
              onMouseDown={(event) => onCanvasMouseDown(event, 'image-drag')}
              style={{
                left: `${selectedSlide.imageBox.x * SCALE}px`,
                top: `${selectedSlide.imageBox.y * SCALE}px`,
                width: `${selectedSlide.imageBox.width * SCALE}px`,
                height: `${selectedSlide.imageBox.height * SCALE}px`
              }}
            >
              {selectedSlide.imageSrc ? <img src={selectedSlide.imageSrc} alt="Slide" /> : <span>Upload image</span>}
              <button
                type="button"
                className="resize-handle"
                onMouseDown={(event) => {
                  event.stopPropagation();
                  onCanvasMouseDown(event, 'image-resize');
                }}
              >
                +
              </button>
            </div>

            <div
              className={`canvas-text-box ${selectedSlide.textStyle.align}`}
              style={{
                left: `${selectedSlide.textBox.x * SCALE}px`,
                top: `${selectedSlide.textBox.y * SCALE}px`,
                width: `${selectedSlide.textBox.width * SCALE}px`,
                height: `${selectedSlide.textBox.height * SCALE}px`,
                fontFamily: `"${selectedSlide.textStyle.fontFamily}", sans-serif`,
                fontSize: `${Math.max(14, selectedSlide.textStyle.fontSize * SCALE)}px`,
                fontStyle: selectedSlide.textStyle.italic ? 'italic' : 'normal',
                fontWeight: selectedSlide.textStyle.fontWeight,
                textTransform: selectedSlide.textStyle.uppercase ? 'uppercase' : 'none',
                color: selectedSlide.textStyle.gradient ? '#d946ef' : selectedSlide.textStyle.color,
                background: selectedSlide.textStyle.highlight ? 'rgba(0,0,0,0.45)' : 'transparent'
              }}
            >
              <strong>{selectedSlide.title}</strong>
              <p>{selectedSlide.body}</p>
            </div>
          </div>

          <div className="slide-toolbar">
            <button type="button" className="primary-btn" disabled={busy} onClick={downloadCurrent}>
              {busy ? 'Exporting...' : 'Download Current Slide'}
            </button>
            <button type="button" className="primary-btn" disabled={busy} onClick={downloadAll}>
              {busy ? 'Exporting...' : 'Download All Slides'}
            </button>
          </div>

          <CarouselSlideManager
            slides={slides}
            selectedId={selectedSlide?.id}
            onSelect={setSelectedId}
            onReorder={(sourceId, targetId) => setSlides((prev) => reorderSlides(prev, sourceId, targetId))}
          />
        </div>

        <div className="canva-right">
          <h3>Settings</h3>
          <SlideEditor slide={selectedSlide} onChange={updateSlide} />
        </div>
      </section>
    </section>
  );
}
