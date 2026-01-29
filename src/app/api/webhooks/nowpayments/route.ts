import { NextResponse } from 'next/server';
import { createRobuxOrder } from '@/lib/api-services';
import crypto from 'crypto';

// ============================================================================
// NowPayments Webhook Handler
// Documentation: https://nowpayments.io/help/ipn
// Receives payment confirmations and triggers RBXCrate order creation
// ============================================================================

// Verify NowPayments signature (HMAC SHA-512)
// The signature is sent in the x-nowpayments-sig header
function verifySignature(body: Record<string, unknown>, signature: string): boolean {
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
  
  if (!ipnSecret) {
    console.warn('[NowPayments Webhook] IPN secret not configured - skipping verification');
    return true; // Allow in development without secret
  }
  
  // Sort the body keys alphabetically and create JSON string
  const sortedKeys = Object.keys(body).sort();
  const sortedBody: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    sortedBody[key] = body[key];
  }
  const jsonString = JSON.stringify(sortedBody);
  
  // Create HMAC SHA-512 signature
  const expectedSignature = crypto
    .createHmac('sha512', ipnSecret)
    .update(jsonString)
    .digest('hex');
  
  return expectedSignature === signature;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Verify signature if IPN secret is configured
    const signature = request.headers.get('x-nowpayments-sig');
    if (signature && !verifySignature(body, signature)) {
      console.error('[NowPayments Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
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
    
    // Validate order ID format: "ORD|USERNAME|ROBUX_AMOUNT|PLACE_ID|TIMESTAMP"
    if (!order_id || typeof order_id !== 'string') {
      console.error('[NowPayments Webhook] Missing order_id');
      return NextResponse.json({ error: 'Invalid Order ID' }, { status: 400 });
    }

    const parts = order_id.split('|');
    if (parts.length < 4 || parts[0] !== 'ORD') {
      console.error('[NowPayments Webhook] Invalid order_id format:', order_id);
      return NextResponse.json({ error: 'Invalid Order ID Format' }, { status: 400 });
    }

    const roblox_username = parts[1];
    const robux_amount = parseInt(parts[2]);
    const place_id = parseInt(parts[3]);

    if (isNaN(robux_amount) || robux_amount <= 0) {
      console.error('[NowPayments Webhook] Invalid robux amount:', parts[2]);
      return NextResponse.json({ error: 'Invalid Robux amount' }, { status: 400 });
    }

    if (isNaN(place_id) || place_id <= 0) {
      console.error('[NowPayments Webhook] Invalid place_id:', parts[3]);
      return NextResponse.json({ error: 'Invalid Place ID' }, { status: 400 });
    }

    // Process payment based on status
    // NowPayments statuses: waiting, confirming, confirmed, sending, partially_paid, finished, failed, refunded, expired
    if (payment_status === 'confirmed' || payment_status === 'finished') {
      console.log('[NowPayments Webhook] ✅ Payment confirmed, creating order:', {
        roblox_username,
        robux_amount,
        place_id,
        order_id
      });

      const delivery = await createRobuxOrder(robux_amount, roblox_username, place_id, order_id);

      
      if (delivery.success) {
        console.log('[NowPayments Webhook] Order created:', delivery);
      } else {
        console.error('[NowPayments Webhook] Order creation failed:', delivery);
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
