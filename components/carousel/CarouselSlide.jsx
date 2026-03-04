export default function CarouselSlide({ slide, active, onSelect }) {
  return (
    <button type="button" className={`slide-pill ${active ? 'active' : ''}`} onClick={onSelect}>
      <span>Slide</span>
      <strong>{slide.title || 'Untitled'}</strong>
    </button>
  );
}
