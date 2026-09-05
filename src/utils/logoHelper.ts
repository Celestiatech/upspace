export function getFloorLogoUrl(floor: {
  adBannerUrl?: string | null;
  logoUrl?: string | null;
  targetUrl?: string | null;
  brandTitle?: string | null;
}): string | null {
  if (floor.adBannerUrl && floor.adBannerUrl.trim()) {
    const banner = floor.adBannerUrl.trim();
    if (banner.startsWith('data:') || banner.startsWith('/')) {
      return banner;
    }
    return `/api/logo-proxy?url=${encodeURIComponent(banner)}`;
  }

  if (floor.logoUrl && floor.logoUrl.trim()) {
    const logo = floor.logoUrl.trim();
    if (logo.startsWith('data:') || logo.startsWith('/')) {
      return logo;
    }
    return `/api/logo-proxy?url=${encodeURIComponent(logo)}`;
  }

  const rawUrl = floor.targetUrl?.trim() || '';
  if (rawUrl) {
    const domain = rawUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();
    if (domain && domain.includes('.')) {
      return `/api/logo-proxy?domain=${encodeURIComponent(domain)}`;
    }
  }

  const brand = floor.brandTitle?.trim() || '';
  if (brand && brand.includes('.')) {
    const domain = brand.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();
    return `/api/logo-proxy?domain=${encodeURIComponent(domain)}`;
  }

  return null;
}
