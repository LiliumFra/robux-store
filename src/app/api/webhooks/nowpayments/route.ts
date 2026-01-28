import { NextResponse } from 'next/server';
import { createRobuxOrder } from '@/lib/api-services';

// ============================================================================
// NowPayments Webhook Handler
// Receives payment confirmations and triggers RBXCrate order creation
// ============================================================================

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      order_id, 
      payment_status, 
      pay_amount, 
      actually_paid,
      payment_id 
    } = body;

    console.log('[NowPayments Webhook] Received:', {
      payment_id,
      order_id,
      payment_status,
      pay_amount,
      actually_paid
    });
    
    // Validate order ID format: "ORD|USERNAME|ROBUX_AMOUNT|TIMESTAMP"
    if (!order_id || typeof order_id !== 'string') {
      console.error('[NowPayments Webhook] Missing order_id');
      return NextResponse.json({ error: 'Invalid Order ID' }, { status: 400 });
    }

    const parts = order_id.split('|');
    if (parts.length < 3 || parts[0] !== 'ORD') {
      console.error('[NowPayments Webhook] Invalid order_id format:', order_id);
      return NextResponse.json({ error: 'Invalid Order ID Format' }, { status: 400 });
    }

    const roblox_username = parts[1];
    const robux_amount = parseInt(parts[2]);

    if (isNaN(robux_amount) || robux_amount <= 0) {
      console.error('[NowPayments Webhook] Invalid robux amount:', parts[2]);
      return NextResponse.json({ error: 'Invalid Robux amount' }, { status: 400 });
    }

    // Process payment based on status
    // NowPayments statuses: waiting, confirming, confirmed, sending, partially_paid, finished, failed, refunded, expired
    if (payment_status === 'confirmed' || payment_status === 'finished') {
      console.log('[NowPayments Webhook] ✅ Payment confirmed, creating RBXCrate order:', {
        roblox_username,
        robux_amount,
        order_id
      });

      const delivery = await createRobuxOrder(robux_amount, roblox_username, order_id);
      
      if (delivery.success) {
        console.log('[NowPayments Webhook] RBXCrate order created:', delivery);
      } else {
        console.error('[NowPayments Webhook] RBXCrate order failed:', delivery);
      }
    } else {
      console.log('[NowPayments Webhook] Payment status:', payment_status, '- No action taken');
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[NowPayments Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    service: 'NowPayments Webhook Handler',
    timestamp: new Date().toISOString()
  });
}
