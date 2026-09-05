import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    try {
      const supabase = createClient();
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (!error && Array.isArray(transactions)) {
        const formattedActivity = transactions.map((tx: any) => ({
          id: tx.id,
          type: 'claim',
          title: `${tx.buyer_name} claimed Floor ${tx.floor_id.replace(/[^0-9]/g, '') || 'Level'}`,
          detail: `Acquired for ₹${Number(tx.amount).toLocaleString('en-IN')}${tx.brand_title ? ` · "${tx.brand_title}"` : ''}`,
          amount: Number(tx.amount),
          timestamp: formatTimestamp(tx.created_at),
          rawTime: tx.created_at,
          status: tx.status,
          txHash: tx.razorpay_payment_id || `0x${tx.id.replace(/-/g, '').slice(0, 12)}`,
        }));

        return NextResponse.json({ success: true, activities: formattedActivity, source: 'supabase' });
      }
    } catch (dbErr) {
      console.warn('Supabase activity fetch fallback:', dbErr);
    }

    // Default empty activity feed
    return NextResponse.json({ success: true, activities: [], source: 'empty_db' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch activity feed' },
      { status: 500 }
    );
  }
}

function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
    return `${Math.floor(diffSec / 86400)} days ago`;
  } catch {
    return 'Recently';
  }
}
