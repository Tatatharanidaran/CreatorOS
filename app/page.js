import HeroSection from '../components/HeroSection';
import FeatureCard from '../components/FeatureCard';

const FEATURES = [
  {
    title: 'Caption Generator',
    description: 'Generate hooks, caption variations, CTAs, and hashtag groups from one input.',
    href: '/caption'
  },
  {
    title: 'Thumbnail Creator',
    description: 'Upload, crop, add text overlays, and download Instagram-ready thumbnails.',
    href: '/thumbnail'
  },
  {
    title: 'Carousel Builder',
    description: 'Build multi-slide carousel posts with templates, custom layouts, and PNG export.',
    href: '/carousel'
  }
];

export default function HomePage() {
  return (
    <main className="page-shell">
      <HeroSection />
      <section className="feature-grid">
        {FEATURES.map((item) => (
          <FeatureCard key={item.title} title={item.title} description={item.description} href={item.href} />
        ))}
      </section>
    </main>
  );
}
