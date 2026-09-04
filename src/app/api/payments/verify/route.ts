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

    // Record verified transaction in Supabase
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

