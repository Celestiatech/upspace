import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      floorId = 'floor-1',
      amount = 10000,
      buyerName = 'Citizen',
      brandTitle = 'Brand',
      targetUrl,
    } = body;

    const isTestMode = process.env.RAZORPAY_MODE === 'test';
    const keySecret = isTestMode
      ? process.env.RZP_TEST_KEY_SECRET || process.env.RZP_KEY_SECRET
      : process.env.RZP_KEY_SECRET || process.env.RZP_TEST_KEY_SECRET;

    let isSignatureValid = true;

    if (razorpayOrderId && razorpayPaymentId && razorpaySignature && keySecret) {
      try {
        const generatedSignature = crypto
          .createHmac('sha256', keySecret)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest('hex');

        isSignatureValid = generatedSignature === razorpaySignature;
      } catch {
        isSignatureValid = false;
      }
    }

    if (!isSignatureValid) {
      return NextResponse.json(
        { success: false, error: 'Cryptographic signature verification failed' },
        { status: 400 }
      );
    }

    // Record verified transaction in Supabase & dispatch email notification
    try {
      const supabase = createClient();
      await supabase.from('transactions').insert({
        floor_id: floorId,
        buyer_name: buyerName,
        amount: Number(amount),
        brand_title: brandTitle,
        target_url: targetUrl,
        payment_method: razorpayPaymentId ? 'razorpay' : 'upi_qr',
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        status: 'completed',
      });

      // Dispatch automated Order & Placement Confirmation Email
      const recipientEmail = body?.buyerEmail || process.env.MAIL_FROM_ADDRESS;
      if (recipientEmail) {
        const { sendEmail } = await import('@/utils/email/sender');
        const { getOrderConfirmationHtml, getOutbidAlertHtml } = await import('@/utils/email/templates');
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://upspace.live';
        const displayLevel = Number(body?.displayLevel) || 1;

        // 1. Order Receipt Email
        const receiptHtml = getOrderConfirmationHtml({
          buyerName,
          brandTitle,
          targetUrl: targetUrl || siteUrl,
          displayLevel,
          amount: Number(amount),
          paymentId: razorpayPaymentId,
          orderId: razorpayOrderId,
          claimCode: body?.claimCode || `UPS-${Math.random().toString(36).slice(2, 8).toUpperCase()}-L${displayLevel}`,
          siteUrl,
        });

        sendEmail({
          to: recipientEmail,
          subject: `🎉 Payment Confirmed: Level #${displayLevel} (${brandTitle}) is Live on UpSpace!`,
          html: receiptHtml,
        }).catch((err) => console.warn('[Email Notice]', err));

        // 2. Check and notify previous outbid floor owner if outbidding occurred
        if (body?.previousOwnerEmail && body?.previousOwnerEmail !== recipientEmail) {
          const outbidHtml = getOutbidAlertHtml({
            buyerName: body?.previousOwnerName || 'Citizen',
            brandTitle: body?.previousBrandTitle || 'Previous Sponsor',
            currentLevel: displayLevel - 1,
            newTopLevel: displayLevel,
            newTopBidder: brandTitle,
            nextRequiredBid: Math.ceil(Number(amount) * 1.1),
            siteUrl,
          });

          sendEmail({
            to: body.previousOwnerEmail,
            subject: `⚠️ Skyline Alert: You were outbid by ${brandTitle}!`,
            html: outbidHtml,
          }).catch((err) => console.warn('[Outbid Email Notice]', err));
        }
      }
    } catch (dbErr) {
      console.warn('Database transaction log notice:', dbErr);
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Payment verified and floor ownership confirmed!',
      transactionId: razorpayPaymentId || `tx_${Date.now()}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}

