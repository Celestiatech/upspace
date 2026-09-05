import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { floorId, action } = body;

    if (!floorId) {
      return NextResponse.json({ success: false, error: 'floorId required' }, { status: 400 });
    }

    try {
      const supabase = createClient();
      
      // Fetch current floor record
      const { data: floor, error } = await supabase
        .from('floors')
        .select('clicks_delivered, impressions_weekly')
        .eq('id', floorId)
        .maybeSingle();

      if (!error && floor) {
        if (action === 'website_visit' || action === 'click') {
          const newClicks = (floor.clicks_delivered || 0) + 1;
          const newImpressions = Math.max((floor.impressions_weekly || 0), newClicks);
          const newCtr = Number(((newClicks / Math.max(1, newImpressions)) * 100).toFixed(2));

          await supabase
            .from('floors')
            .update({
              clicks_delivered: newClicks,
              impressions_weekly: newImpressions,
              ctr: newCtr,
              updated_at: new Date().toISOString(),
            })
            .eq('id', floorId);

          return NextResponse.json({ success: true, websiteVisits: newClicks, floorClicks: newImpressions, ctr: newCtr });
        } else if (action === 'floor_click' || action === 'impression') {
          const currentClicks = floor.clicks_delivered || 0;
          const newImpressions = Math.max((floor.impressions_weekly || 0) + 1, currentClicks);
          const newCtr = Number(((currentClicks / Math.max(1, newImpressions)) * 100).toFixed(2));

          await supabase
            .from('floors')
            .update({
              impressions_weekly: newImpressions,
              ctr: newCtr,
              updated_at: new Date().toISOString(),
            })
            .eq('id', floorId);

          return NextResponse.json({ success: true, floorClicks: newImpressions, ctr: newCtr });
        }
      }
    } catch (dbErr) {
      console.warn('Click/impression telemetry note:', dbErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
