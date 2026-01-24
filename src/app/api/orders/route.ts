import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { orderSchema } from '@/lib/validators';
import { createPayment } from '@/lib/api-services';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { user_id: session.userId },
    orderBy: { created_at: 'desc' },
  });

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const result = orderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { robux_amount, roblox_username, crypto_currency } = result.data;

    // Calculate details
    // Formula: Price = Amount_Total * 0.007. Amount_Total = Amount_Desired * 1.3
    const robux_with_tax = Math.ceil(robux_amount * 1.3);
    const usd_price = parseFloat((robux_with_tax * 0.007).toFixed(2));
    const order_number = `ORD-${Date.now().toString().slice(-6)}`;

    // Create Order in DB first (Pending)
    const order = await prisma.order.create({
      data: {
        user_id: session.userId,
        order_number,
        roblox_username,
        robux_amount,
        robux_with_tax,
        usd_price,
        crypto_currency,
        status: 'PENDING',
        payment_status: 'WAITING',
      },
    });

    // Create Payment Aggregator Request
    const paymentData = await createPayment({
        usdAmount: usd_price,
        selectedCrypto: crypto_currency,
        orderId: order.id,
        robloxUsername: roblox_username,
        robuxAmount: robux_amount
    });

    // Update Order with payment details
    const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
            payment_id: paymentData.payment_id?.toString(),
            crypto_amount: paymentData.pay_amount?.toString(),
            // Store address? Schema doesn't have it, but we can return it to UI
        }
    });

    return NextResponse.json({ 
        order: updatedOrder,
        payment_details: {
            address: paymentData.pay_address,
            amount: paymentData.pay_amount,
            currency: paymentData.pay_currency
        }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
