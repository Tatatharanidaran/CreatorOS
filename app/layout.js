import { Bebas_Neue, DM_Sans } from 'next/font/google';
import './globals.css';

const heading = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: '400'
});

const body = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '700']
});

export const metadata = {
  title: 'Insta Creator Helper',
  description: 'Generate Instagram hooks, captions, CTAs, and hashtags with local Ollama models.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
