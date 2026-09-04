import type { Metadata } from 'next';
import { AuthProvider } from '@/components/auth/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'UpSpace | 3D Virtual Advertising Skyline Marketplace',
  description:
    'Own advertising floors in iconic 3D virtual skyscrapers and metaverse arenas. The premier 3D WebGL advertising marketplace.',
  keywords: ['3D advertising', 'metaverse billboard', 'virtual real estate', 'UpSpace', 'Three.js'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="antialiased bg-transparent text-slate-100 overflow-x-hidden select-none">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
