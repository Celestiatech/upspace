import type { Metadata } from 'next';
import { SeoLandingPage } from '@/components/seo/SeoLandingPage';

export const metadata: Metadata = { title: '3D Website Billboard Advertising', description: 'Promote your website with an interactive 3D website billboard.' };

export default function Page() {
  return <SeoLandingPage eyebrow="Website promotion" title="Promote Your Website on a 3D Billboard" description="Turn your website into a destination people can discover from a visual, interactive billboard in the digital skyline." points={['Drive qualified visitors to your URL', 'Showcase your product or startup', 'Use a custom banner and message', 'Reach audiences beyond traditional ads']} />;
}
