import { NextResponse } from 'next/server';
import { orderSchema } from '@/lib/validators';
import { createPayment } from '@/lib/api-services';

const DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'https://robux-store.vercel.app';

export async function GET() {
  const orders: unknown[] = [];
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = orderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const {
      robux_amount,
      roblox_username,
      place_id,
      crypto_currency,
      payment_method,
    } = result.data;

    // Calculate details
    // Formula: Price = (Desired_Amount / 1000) * 6.5
    // Tax: To receive X, we need to send X / 0.7
    const robux_with_tax = Math.ceil(robux_amount / 0.7);
    const usd_price = parseFloat(((robux_amount / 1000) * 6.5).toFixed(2));

    // Generate stateless Order ID: "ORD|USERNAME|GROSS_AMOUNT|PLACE_ID|TIMESTAMP"
    const safeUsername = roblox_username.replace(/\|/g, '');
    const order_number = `ORD|${safeUsername}|${robux_with_tax}|${place_id}|${Date.now()}`;

    // ⭐ ROUTER: Choose payment method
    if (payment_method === 'mercadopago') {
      // Create Mercado Pago preference
      const mpResponse = await fetch(`${DOMAIN}/api/mercadopago/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          robux_amount,
          roblox_username: safeUsername,
          place_id,
          order_id: order_number,
          usd_price,
        }),
      });

      const mpData = await mpResponse.json();

      if (!mpResponse.ok) {
        throw new Error(mpData.error || 'Failed to create Mercado Pago payment');
      }

      return NextResponse.json({
        order: {
          id: order_number,
          order_number,
          roblox_username: safeUsername,
          robux_amount,
          usd_price,
          status: 'PENDING',
          payment_method: 'mercadopago',
        },
        payment_details: {
          type: 'mercadopago',
          preference_id: mpData.preference_id,
          init_point: mpData.init_point,
          sandbox_init_point: mpData.sandbox_init_point,
        },
      });
    } else {
      // NowPayments (existing crypto flow)
      const paymentData = await createPayment({
        usdAmount: usd_price,
        selectedCrypto: crypto_currency || 'btc',
        orderId: order_number,
        robloxUsername: roblox_username,
        robuxAmount: robux_amount,
      });

      return NextResponse.json({
        order: {
          id: order_number,
          order_number,
          roblox_username,
          robux_amount,
          usd_price,
          status: 'PENDING',
          payment_method: 'crypto',
          crypto_currency,
        },
        payment_details: {
          address: paymentData.pay_address,
          amount: paymentData.pay_amount,
          currency: paymentData.pay_currency,
        },
      });
    }

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error creating order' },
      { status: 500 }
    );
  }
}
