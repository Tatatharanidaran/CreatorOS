'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/caption', label: 'Caption Generator' },
  { href: '/thumbnail', label: 'Thumbnail Creator' },
  { href: '/carousel', label: 'Carousel Builder' },
  { href: '/story', label: 'Story Creator' },
  { href: '/reels', label: 'Reels Planner' }
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="top-nav-wrap">
      <nav className="top-nav">
        <Link href="/" className="brand">
          Insta Creator Helper
        </Link>
        <button type="button" className="menu-btn" onClick={() => setOpen((prev) => !prev)}>
          {open ? 'Close' : 'Menu'}
        </button>
        <div className={`nav-links ${open ? 'open' : ''}`}>
          {LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
