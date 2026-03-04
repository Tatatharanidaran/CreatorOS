import Link from 'next/link';

export default function FeatureCard({ title, description, href }) {
  return (
    <article className="feature-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <Link href={href} className="copy-btn feature-link">
        Launch Tool
      </Link>
    </article>
  );
}
