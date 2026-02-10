import { NextResponse } from 'next/server';
import { createRobuxOrder } from '@/lib/api-services';
import { getPaymentStatus } from '@/lib/mercadopago';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Mercado Pago notification types:
    // - payment: payment status changes
    // - plan, subscription, invoice, charge: other event types
    const { type, data, action } = body;

    console.log('[MP Webhook] Received:', {
      type,
      action,
      payment_id: data?.id,
    });

    // Only process payment events
    if (type !== 'payment') {
      console.log('[MP Webhook] Ignoring non-payment event:', type);
      return NextResponse.json({ success: true });
    }

    if (!data?.id) {
      console.error('[MP Webhook] Missing payment_id');
      return NextResponse.json({ error: 'Invalid payment data' }, { status: 400 });
    }

    // ⭐ DOUBLE VERIFICATION: Query MP API to confirm payment status
    // This is critical for security — never trust webhook data alone
    const paymentStatus = await getPaymentStatus(String(data.id));

    if (!paymentStatus) {
      console.error('[MP Webhook] Could not verify payment status');
      return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
    }

    console.log('[MP Webhook] Payment status verified:', {
      payment_id: data.id,
      status: paymentStatus.status,
      external_reference: paymentStatus.external_reference,
    });

    // ✅ Only process APPROVED payments
    if (paymentStatus.status !== 'approved') {
      console.log('[MP Webhook] Payment not approved:', paymentStatus.status);
      return NextResponse.json({
        success: true,
        status: paymentStatus.status,
        message: 'Payment not approved yet',
      });
    }

    // Extract order_id from external_reference
    const order_id = paymentStatus.external_reference;

    if (!order_id || !order_id.startsWith('ORD|')) {
      console.error('[MP Webhook] Invalid external_reference:', order_id);
      return NextResponse.json({ error: 'Invalid order reference' }, { status: 400 });
    }

    // Parse order_id: "ORD|USERNAME|ROBUX_AMOUNT|PLACE_ID|TIMESTAMP"
    const parts = order_id.split('|');
    if (parts.length < 4) {
      console.error('[MP Webhook] Invalid order_id format:', order_id);
      return NextResponse.json({ error: 'Invalid order format' }, { status: 400 });
    }

    const roblox_username = parts[1];
    const robux_amount = parseInt(parts[2]);
    const place_id = parseInt(parts[3]);

    if (isNaN(robux_amount) || isNaN(place_id)) {
      console.error('[MP Webhook] Invalid robux or place id:', parts);
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
    }

    console.log('[MP Webhook] ✅ Processing approved payment:', {
      order_id,
      roblox_username,
      robux_amount,
      place_id,
      payment_id: data.id,
    });

    // 🎮 DELIVER ROBUX via RBXCrate
    const delivery = await createRobuxOrder(
      robux_amount,
      roblox_username,
      place_id,
      order_id
    );

    if (delivery.success) {
      console.log('[MP Webhook] ✅ Order created successfully:', delivery);
      return NextResponse.json({ success: true, order: delivery });
    } else {
      console.error('[MP Webhook] ❌ Order creation failed:', delivery);
      // Return 200 to prevent MP from retrying — handle error manually
      return NextResponse.json({
        success: false,
        error: delivery.error,
        order_id,
      });
    }

  } catch (error) {
    console.error('[MP Webhook] Error:', error);
    // ⚠️ Always return 200 to prevent infinite retries from MP
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 200 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'Mercado Pago Webhook Handler',
    timestamp: new Date().toISOString(),
  });
}
