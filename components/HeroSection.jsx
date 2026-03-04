import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="hero">
      <p className="chip">Zero-Budget Creator Stack</p>
      <h1>Insta Creator Helper</h1>
      <p className="subtitle">Create captions, thumbnails, and carousel slides faster with free browser tools.</p>
      <div className="hero-actions">
        <Link href="/caption" className="primary-link">
          Open Caption Generator
        </Link>
        <Link href="/thumbnail" className="ghost-link">
          Open Thumbnail Creator
        </Link>
        <Link href="/carousel" className="ghost-link">
          Open Carousel Builder
        </Link>
      </div>
    </section>
  );
}
