import CopyButton from './CopyButton';

export default function CarouselSlides({ slides = [] }) {
  return (
    <div className="carousel-grid">
      {slides.map((slide) => (
        <article key={`slide-${slide.slide}-${slide.title}`} className="carousel-card">
          <div className="carousel-head">
            <span className="tone-chip">Slide {slide.slide}</span>
            <CopyButton text={`${slide.title}\n${slide.content}`} label="Copy" />
          </div>
          <h4>{slide.title}</h4>
          <p>{slide.content}</p>
        </article>
      ))}
    </div>
  );
}
