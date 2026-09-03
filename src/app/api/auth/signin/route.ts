import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: new URL('/auth/callback', siteUrl).toString(),
    },
  });

  if (error || !data?.url) {
    return NextResponse.json({ error: error?.message ?? 'Failed to start Google sign-in' }, { status: 400 });
  }

  return NextResponse.json({ url: data.url });
}
