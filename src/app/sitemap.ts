import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '3d-billboards', 'buy-3d-billboard', '3d-website-billboard', 'virtual-skyscraper-advertising'];
  return pages.map((page, index) => ({
    url: `https://get3dbillboards.com/${page}`.replace(/\/$/, ''),
    lastModified: new Date(),
    changeFrequency: index === 0 ? 'daily' as const : 'weekly' as const,
    priority: index === 0 ? 1 : 0.8,
  }));
}
