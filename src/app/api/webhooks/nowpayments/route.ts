import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createRobuxOrder } from '@/lib/api-services';

// Mock webhook for now, or real layout.
// NowPayments sends JSON body with payment_status, order_id, etc.
export async function POST(request: Request) {
  try {
    // Verify HMAC signature here in production! (Skipped for simplicity/mock)
    
    const body = await request.json();
    const { order_id, payment_status, pay_amount, really_paid, price_amount, purchase_id } = body;

    console.log('Webhook Received:', body);

    const order = await prisma.order.findUnique({
      where: { id: order_id }
    });

    if (!order) return NextResponse.json({ message: 'Order not found' }, { status: 404 });

    // Status mapping
    // NowPayments: waiting, confirming, confirmed, sending, partially_paid, finished, failed, refunded, expired
    let newStatus = order.payment_status;
    let orderStatus = order.status;

    if (payment_status === 'confirmed' || payment_status === 'finished') {
        newStatus = 'CONFIRMED';
        orderStatus = 'PROCESSING';
        
        // Trigger RBXCrate Delivery if not already triggered
        if (order.status !== 'COMPLETED' && order.status !== 'PROCESSING') {
             // We could do this here or separately.
             // Let's assume we trigger it.
             const delivery = await createRobuxOrder(order.user_id, order.robux_amount, order.roblox_username, order.order_number);
             if (delivery.success) {
                 // RBXCrate might return success immediately or queue it
                 orderStatus = 'COMPLETED'; // Optimistic completion or wait for another webhook
             } else {
                 orderStatus = 'FAILED'; // Delivery failed
             }
             
             // Update transaction hash if provided? NowPayments sends it?
        }

    } else if (payment_status === 'confirming') {
        newStatus = 'CONFIRMING';
    } else if (payment_status === 'failed' || payment_status === 'expired') {
        newStatus = 'FAILED';
        orderStatus = 'FAILED';
    }

    await prisma.order.update({
        where: { id: order_id },
        data: {
            payment_status: newStatus,
            status: orderStatus,
            // completed_at: orderStatus === 'COMPLETED' ? new Date() : undefined
        }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
