import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain')?.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
  const urlParam = searchParams.get('url')?.trim();

  let targetUrl = '';
  if (urlParam && urlParam.startsWith('http')) {
    targetUrl = urlParam;
  } else if (domain) {
    targetUrl = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${encodeURIComponent(domain)}&size=128`;
  }

  if (!targetUrl) {
    return new NextResponse('Missing domain or url parameter', { status: 400 });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return new NextResponse('Failed to fetch image', { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'image/png';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new NextResponse(err.message || 'Error fetching logo', { status: 500 });
  }
}
