'use client';

import CarouselSlide from './CarouselSlide';

export default function CarouselSlideManager({ slides, selectedId, onSelect, onReorder }) {
  function dragStart(event, id) {
    event.dataTransfer.setData('text/plain', id);
    event.dataTransfer.effectAllowed = 'move';
  }

  function drop(event, targetId) {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) {
      return;
    }
    onReorder(sourceId, targetId);
  }

  return (
    <div className="slides-row bottom-strip">
      {slides.map((slide) => (
        <div
          key={slide.id}
          draggable
          onDragStart={(event) => dragStart(event, slide.id)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => drop(event, slide.id)}
        >
          <CarouselSlide slide={slide} active={slide.id === selectedId} onSelect={() => onSelect(slide.id)} />
        </div>
      ))}
    </div>
  );
}
