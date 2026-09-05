import { NextResponse } from 'next/server';
import { sendEmail } from '@/utils/email/sender';
import {
  getOrderConfirmationHtml,
  getViewMilestoneHtml,
  getOutbidAlertHtml,
  getAnalyticsDigestHtml,
  getSkylineRecommendationHtml,
} from '@/utils/email/templates';

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { type, email, data } = body;

    if (!email || !type) {
      return NextResponse.json(
        { success: false, error: 'Recipient email and notification type are required' },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://upspace.live';
    let subject = 'UpSpace 3D Skyline Notification';
    let html = '';

    switch (type) {
      case 'order_confirmation':
        subject = `🎉 Payment Confirmed: Level #${data?.displayLevel || 1} (${data?.brandTitle || 'Campaign'}) is Now Live!`;
        html = getOrderConfirmationHtml({
          buyerName: data?.buyerName || 'Citizen',
          brandTitle: data?.brandTitle || 'Brand',
          targetUrl: data?.targetUrl || siteUrl,
          displayLevel: Number(data?.displayLevel) || 1,
          amount: Number(data?.amount) || 10000,
          paymentId: data?.paymentId || 'pay_manual',
          orderId: data?.orderId || 'order_manual',
          claimCode: data?.claimCode || 'UPS-CLAIM-TOKEN',
          siteUrl,
        });
        break;

      case 'view_milestone':
        subject = `🔥 Level #${data?.displayLevel || 1} Milestone: ${data?.floorClicks || 10} Views & ${data?.websiteVisits || 1} Clicks!`;
        html = getViewMilestoneHtml({
          buyerName: data?.buyerName || 'Citizen',
          brandTitle: data?.brandTitle || 'Brand',
          displayLevel: Number(data?.displayLevel) || 1,
          floorClicks: Number(data?.floorClicks) || 10,
          websiteVisits: Number(data?.websiteVisits) || 1,
          ctr: Number(data?.ctr) || 10,
          siteUrl,
        });
        break;

      case 'outbid_alert':
        subject = `⚠️ Skyline Alert: You were outbid by ${data?.newTopBidder || 'a new brand'}!`;
        html = getOutbidAlertHtml({
          buyerName: data?.buyerName || 'Citizen',
          brandTitle: data?.brandTitle || 'Brand',
          currentLevel: Number(data?.currentLevel) || 1,
          newTopLevel: Number(data?.newTopLevel) || 2,
          newTopBidder: data?.newTopBidder || 'New Sponsor',
          nextRequiredBid: Number(data?.nextRequiredBid) || 20000,
          siteUrl,
        });
        break;

      case 'analytics_digest':
        subject = `📊 Your ${data?.period || 'Weekly'} Skyline Analytics Report for ${data?.brandTitle || 'Campaign'}`;
        html = getAnalyticsDigestHtml({
          buyerName: data?.buyerName || 'Citizen',
          brandTitle: data?.brandTitle || 'Brand',
          displayLevel: Number(data?.displayLevel) || 1,
          period: data?.period || 'Weekly',
          totalImpressions: Number(data?.totalImpressions) || 12500,
          floorClicks: Number(data?.floorClicks) || 85,
          websiteVisits: Number(data?.websiteVisits) || 12,
          ctr: Number(data?.ctr) || 14.1,
          siteUrl,
        });
        break;

      case 'skyline_recommendation':
        subject = `👑 Top Floor Opportunity: Claim Level #${data?.recommendedLevel || 5} on the Skyline`;
        html = getSkylineRecommendationHtml({
          userName: data?.userName || 'Citizen',
          recommendedLevel: Number(data?.recommendedLevel) || 5,
          topBrand: data?.topBrand || 'Top Sponsor',
          nextBidPrice: Number(data?.nextBidPrice) || 50000,
          siteUrl,
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unsupported notification type: ${type}` },
          { status: 400 }
        );
    }

    const result = await sendEmail({
      to: email,
      subject,
      html,
    });

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to dispatch notification' },
      { status: 500 }
    );
  }
}
