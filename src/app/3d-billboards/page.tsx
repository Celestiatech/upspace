import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';

export const metadata: Metadata = { title: '3D Billboards', description: 'Discover interactive 3D billboard advertising for brands, websites, and startups.' };

export default function Page() {
  return <SeoLandingPage eyebrow="3D advertising" title="3D Billboards for the Digital Skyline" description="Get your brand seen on an interactive 3D billboard built for modern businesses, creators, and startups." points={['Interactive 3D brand placement', 'Premium digital skyline visibility', 'Campaigns for websites and products', 'A memorable alternative to flat advertising']} />;
}
