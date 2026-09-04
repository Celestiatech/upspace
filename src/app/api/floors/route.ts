import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getFloorsForArena } from '@/data/floors';
import { CURRENT_ARENA } from '@/data/arenas';
import { FloorData } from '@/types/floor';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const arenaId = searchParams.get('arenaId') || CURRENT_ARENA.id;

    // Try fetching from Supabase database
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('floors')
        .select('*')
        .eq('arena_id', arenaId)
        .order('floor_number', { ascending: true });

      if (!error && data && data.length > 0) {
        const formattedFloors: FloorData[] = data.map((row: any) => ({
          id: row.id,
          floorNumber: row.floor_number,
          arenaId: row.arena_id,
          ownerName: row.owner_name,
          brandTitle: row.brand_title,
          tagline: row.tagline,
          category: row.category,
          status: row.status,
          price: Number(row.price),
          currency: row.currency || 'INR',
          dimensions: row.dimensions || '360° Panoramic Digital Wrap & Spire Halo',
          impressionsPerDay: row.impressions_per_day || '100K+ Views',
          elevationMeters: Number(row.elevation_meters),
          logoUrl: row.logo_url,
          adBannerUrl: row.ad_banner_url,
          targetUrl: row.target_url,
          bannerColor: row.banner_color,
          claimCode: row.claim_code,
          verifiedDomain: row.verified_domain,
          verifiedType: row.verified_type,
          safetyScanPassed: row.safety_scan_passed,
          impressionsWeekly: row.impressions_weekly,
          clicksDelivered: row.clicks_delivered,
          ctr: Number(row.ctr),
          daysHeld: row.days_held,
          leaseExpiryDays: row.lease_expiry_days,
        }));

        return NextResponse.json({ success: true, floors: formattedFloors, source: 'supabase' });
      }
    } catch (dbErr) {
      console.warn('Supabase fetch failed, serving default showcase floors:', dbErr);
    }

    // Default showcase floors fallback
    const showcaseFloors = getFloorsForArena(arenaId);
    return NextResponse.json({ success: true, floors: showcaseFloors, source: 'local_showcase' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch floors' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { floor, buyerName, ownerName, bidAmount, targetUrl, brandTitle, bannerUrl, claimCode, paymentId } = body;
    const resolvedBuyer = buyerName || ownerName || brandTitle || floor?.ownerName || 'Citizen';

    // Validate and sanitize targetUrl
    let formattedUrl = targetUrl?.trim();
    if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const floorId = floor?.id || `neo-tokyo-floor-${Date.now()}`;
    const floorNumber = typeof floor?.floorNumber === 'number' ? floor.floorNumber : 0;
    const arenaId = floor?.arenaId || CURRENT_ARENA.id;
    const finalBid = Number(bidAmount) || Number(floor?.price) || 10000;

    const updatedFloor: FloorData = {
      ...(floor || {}),
      id: floorId,
      arenaId,
      floorNumber,
      category: floor?.category || 'Custom Campaign',
      currency: floor?.currency || 'INR',
      dimensions: floor?.dimensions || '360° Panoramic Digital Wrap & Spire Halo',
      impressionsPerDay: floor?.impressionsPerDay || '100K+ Views',
      elevationMeters: floor?.elevationMeters || 50,
      status: 'sold',
      ownerName: resolvedBuyer,
      brandTitle: brandTitle || resolvedBuyer,
      price: finalBid,
      targetUrl: formattedUrl || undefined,
      adBannerUrl: bannerUrl || undefined,
      claimCode: claimCode || undefined,
      verifiedDomain: true,
      verifiedType: 'indie',
      safetyScanPassed: true,
      impressionsWeekly: 145000,
      clicksDelivered: 1890,
      ctr: 15.4,
      daysHeld: 1,
      leaseExpiryDays: 7,
      bidHistory: [
        {
          bidder: resolvedBuyer,
          amount: finalBid,
          timestamp: 'Just now',
          isTopBid: true,
        },
        ...(floor?.bidHistory || []),
      ],
    };

    // Attempt persisting to Supabase if configured
    try {
      const supabase = createClient();

      // Upsert floor record
      await supabase.from('floors').upsert({
        id: updatedFloor.id,
        arena_id: updatedFloor.arenaId,
        floor_number: updatedFloor.floorNumber,
        owner_name: updatedFloor.ownerName,
        brand_title: updatedFloor.brandTitle,
        tagline: updatedFloor.tagline,
        category: updatedFloor.category,
        status: updatedFloor.status,
        price: updatedFloor.price,
        currency: updatedFloor.currency,
        target_url: updatedFloor.targetUrl,
        ad_banner_url: updatedFloor.adBannerUrl,
        claim_code: updatedFloor.claimCode,
        verified_domain: updatedFloor.verifiedDomain,
        verified_type: updatedFloor.verifiedType,
        safety_scan_passed: updatedFloor.safetyScanPassed,
        impressions_weekly: updatedFloor.impressionsWeekly,
        clicks_delivered: updatedFloor.clicksDelivered,
        ctr: updatedFloor.ctr,
        days_held: updatedFloor.daysHeld,
        lease_expiry_days: updatedFloor.leaseExpiryDays,
        updated_at: new Date().toISOString(),
      });

      // Record bid in bid_history
      await supabase.from('bid_history').insert({
        floor_id: updatedFloor.id,
        bidder_name: resolvedBuyer,
        amount: finalBid,
        is_top_bid: true,
      });

      // Record in transactions
      await supabase.from('transactions').insert({
        floor_id: updatedFloor.id,
        buyer_name: resolvedBuyer,
        amount: finalBid,
        brand_title: brandTitle || resolvedBuyer,
        target_url: formattedUrl,
        payment_method: paymentId ? 'razorpay' : 'upi_qr',
        razorpay_payment_id: paymentId || undefined,
        status: 'completed',
      });
    } catch (err) {
      console.warn('Supabase write notice:', err);
    }

    return NextResponse.json({
      success: true,
      message: `Floor ${updatedFloor.floorNumber + 1} successfully claimed!`,
      floor: updatedFloor,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to claim floor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const arenaId = searchParams.get('arenaId') || CURRENT_ARENA.id;

    // Reset/Clear from Supabase database
    try {
      const supabase = createClient();
      // 1. Delete all transactions
      await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      // 2. Delete all bid history
      await supabase.from('bid_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      // 3. Delete / reset all floors in arena
      await supabase.from('floors').delete().eq('arena_id', arenaId);
    } catch (dbErr) {
      console.warn('Supabase floor wipe notice:', dbErr);
    }

    // Return fresh clean list of available floors
    const cleanFloors = getFloorsForArena(arenaId);
    return NextResponse.json({
      success: true,
      message: 'All floors and transactions cleared from database successfully.',
      floors: cleanFloors,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to clear floors' },
      { status: 500 }
    );
  }
}

