import dynamic from 'next/dynamic';

const CarouselBuilder = dynamic(() => import('../../components/carousel/CarouselBuilder'), {
  loading: () => <p className="empty">Loading carousel builder...</p>
});

export default function CarouselPage() {
  return (
    <main className="page-shell">
      <CarouselBuilder />
    </main>
  );
}
