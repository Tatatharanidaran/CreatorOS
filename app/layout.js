import { Bebas_Neue, DM_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';

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
  description: 'Generate Instagram captions and build thumbnails and carousel slides with free tools.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${body.variable}`}>
        <Navbar />
        {children}
        <footer className="site-footer">
          <p>Insta Creator Helper - Zero budget tools for small creators.</p>
        </footer>
      </body>
    </html>
  );
}
