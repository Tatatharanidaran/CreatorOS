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
  },
  {
    title: 'Story Creator',
    description: 'Design 1080x1920 story slides with editable templates, emojis, and quick exports.',
    href: '/story'
  },
  {
    title: 'Reels Planner',
    description: 'Generate reel ideas, scripts, shot lists, captions, and hashtag sets for filming.',
    href: '/reels'
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
