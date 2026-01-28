import { NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';
// import { getSession } from '@/lib/auth';
import { orderSchema } from '@/lib/validators';
import { createPayment } from '@/lib/api-services';

export async function GET() {
  // GET orders is less useful without user context, maybe return empty or all?
  // Returning empty for anonymous for now
  const orders: any[] = []; 
  
  // To allow checking status by ID, we might need a specific endpoint /api/orders/[id]
  // But for this list, we'll return empty or all (admin style). 
  // Let's return empty to be safe or list last 5 public orders?
  // User asked to remove login, so "Order History" is hard. 
  // We'll return empty array to prevent errors.
  /*
  const orders = await prisma.order.findMany({
    orderBy: { created_at: 'desc' },
  });
  */

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = orderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { robux_amount, roblox_username, crypto_currency } = result.data;

    // Calculate details
    // Formula: Price = (Desired_Amount / 1000) * 6.5
    // Tax: To receive X, we need to send X / 0.7
    const robux_with_tax = Math.ceil(robux_amount / 0.7); 
    const usd_price = parseFloat(((robux_amount / 1000) * 6.5).toFixed(2));
    
    // Generate stateless Order ID: "ORD|USERNAME|GROSS_AMOUNT|TIMESTAMP"
    // We pass the GROSS amount (robux_with_tax) so the webhook tells RBXCrate to buy the correct GP price.
    const safeUsername = roblox_username.replace(/\|/g, '');
    const order_number = `ORD|${safeUsername}|${robux_with_tax}|${Date.now()}`;

    // Create Payment Aggregator Request
    const paymentData = await createPayment({
        usdAmount: usd_price,
        selectedCrypto: crypto_currency,
        orderId: order_number, // This ID carries the data
        robloxUsername: roblox_username,
        robuxAmount: robux_amount
    });

    return NextResponse.json({ 
        order: {
            id: order_number,
            order_number,
            roblox_username,
            robux_amount,
            usd_price,
            status: 'PENDING',
            crypto_currency
        },
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
