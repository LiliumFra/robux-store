import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Preference } from 'mercadopago';
import { mpClient, DOMAIN } from '../config';

// Validate incoming request data
const paymentRequestSchema = z.object({
  robux_amount: z.number().min(100),
  roblox_username: z.string().min(3),
  place_id: z.number().positive(),
  order_id: z.string().startsWith('ORD|'),
  usd_price: z.number().positive(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate data
    const validation = paymentRequestSchema.safeParse(body);
    if (!validation.success) {
      console.error('[MP Create] Validation failed:', validation.error);
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    const { robux_amount, roblox_username, place_id, order_id, usd_price } = validation.data;

    console.log('[MP Create] Creating preference:', {
      external_reference: order_id,
      amount: usd_price,
      username: roblox_username,
    });

    // Create preference using SDK v2
    const preference = new Preference(mpClient);
    const response = await preference.create({
      body: {
        items: [
          {
            id: order_id,
            title: `${robux_amount} Robux para ${roblox_username}`,
            description: `Entrega automática en Place ID: ${place_id}`,
            unit_price: usd_price,
            quantity: 1,
            currency_id: 'ARS',
          },
        ],
        payer: {
          email: 'no-reply@robuxstore.com',
        },
        external_reference: order_id,
        notification_url: `${DOMAIN}/api/webhooks/mercadopago`,
        auto_return: 'approved',
        back_urls: {
          success: `${DOMAIN}/payment-success?order_id=${encodeURIComponent(order_id)}`,
          failure: `${DOMAIN}/payment-failure?order_id=${encodeURIComponent(order_id)}`,
          pending: `${DOMAIN}/payment-pending?order_id=${encodeURIComponent(order_id)}`,
        },
        binary_mode: true,
        statement_descriptor: 'ROBUXSTORE',
        metadata: {
          place_id,
          roblox_username,
          robux_amount,
        },
      },
    });

    if (!response.init_point) {
      console.error('[MP Create] No init_point in response:', response);
      throw new Error('Failed to create preference');
    }

    console.log('[MP Create] ✅ Preference created:', response.id);

    return NextResponse.json({
      success: true,
      preference_id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
      order_id,
    });

  } catch (error) {
    console.error('[MP Create] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payment' },
      { status: 500 }
    );
  }
}
