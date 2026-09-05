import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';

export const metadata: Metadata = { title: 'Buy a 3D Billboard', description: 'Buy a premium 3D billboard position and promote your business in the digital skyline.' };

export default function Page() {
  return <SeoLandingPage eyebrow="Buy billboard space" title="Buy a 3D Billboard for Your Brand" description="Reserve a premium position on the Get3DBillboards virtual skyscraper and put your campaign in front of a global digital audience." points={['Simple campaign setup', 'Custom brand title and banner', 'Verified destination URL', 'Transparent bid-based placement']} />;
}
