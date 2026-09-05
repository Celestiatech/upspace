import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';

export const metadata: Metadata = { title: 'Virtual Skyscraper Advertising', description: 'Advertise your brand on an interactive virtual skyscraper and own a place in the digital skyline.' };

export default function Page() {
  return <SeoLandingPage eyebrow="Virtual skyline" title="Virtual Skyscraper Advertising" description="Claim a visible place in a living 3D building where brands, websites, and campaigns become part of an evolving digital skyline." points={['Persistent virtual brand presence', 'Interactive 3D discovery experience', 'Built for founders and global brands', 'A distinctive new advertising format']} />;
}
