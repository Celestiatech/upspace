import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import { AuthProvider } from '@/components/auth/AuthProvider';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://get3dbillboards.com'),
  title: 'Get3DBillboards — Own Your Place in the Digital Skyline',
  description:
    'Claim the top floor of the internet’s tallest interactive 3D tower. Outbid competitors, promote your startup to thousands of global founders and investors, and own the digital skyline.',
  keywords: ['3D billboard', '3D advertising', 'digital billboard', 'virtual billboard', 'interactive billboard', 'metaverse advertising', 'virtual real estate', 'Get3DBillboards'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: 'https://get3dbillboards.com',
    siteName: 'Get3DBillboards',
    title: 'Get3DBillboards — Own Your Place in the Digital Skyline',
    description: 'Claim a premium 3D billboard on the interactive digital skyscraper.',
    images: [{ url: '/brand/upspace-mark.png', width: 512, height: 512, alt: 'Get3DBillboards digital skyline' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get3DBillboards — Own Your Place in the Digital Skyline',
    description: 'Claim a premium 3D billboard on the interactive digital skyscraper.',
    images: ['/brand/upspace-mark.png'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: { icon: '/brand/upspace-mark.png', shortcut: '/brand/upspace-mark.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${bricolage.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#e89163] text-slate-900 dark:text-slate-100 overflow-x-hidden select-none font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
