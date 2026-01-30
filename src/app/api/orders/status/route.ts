import { NextResponse } from 'next/server';

// ============================================================================
// Order Status Checker API
// Checks payment status from NowPayments using payment_id
// ============================================================================

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;

interface PaymentStatus {
  payment_id: number;
  payment_status: string;
  pay_address: string;
  pay_amount: number;
  actually_paid: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  created_at: string;
  updated_at: string;
}

// Map NowPayments status to our simplified status
function mapStatus(npStatus: string): 'pending' | 'confirming' | 'completed' | 'failed' | 'expired' {
  switch (npStatus) {
    case 'waiting':
    case 'partially_paid':
      return 'pending';
    case 'confirming':
    case 'sending':
      return 'confirming';
    case 'confirmed':
    case 'finished':
      return 'completed';
    case 'failed':
    case 'refunded':
      return 'failed';
    case 'expired':
      return 'expired';
    default:
      return 'pending';
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Validate order ID format
    if (!orderId.startsWith('ORD|')) {
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 });
    }

    // If no API key, return mock response for development
    if (!NOWPAYMENTS_API_KEY) {
      console.log('[Order Status] No API key configured, returning mock status');
      return NextResponse.json({
        orderId,
        status: 'pending',
        statusText: 'Waiting for payment',
        paidAmount: 0,
        expectedAmount: 0,
        currency: 'LTC',
        createdAt: new Date().toISOString(),
      });
    }

    // Query NowPayments for payment status by order_id
    // Note: NowPayments doesn't have a direct "get by order_id" endpoint,
    // so we need to list payments and filter
    const response = await fetch(
      `https://api.nowpayments.io/v1/payment/?limit=100&orderBy=created_at&sortBy=desc`,
      {
        headers: {
          'x-api-key': NOWPAYMENTS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error('[Order Status] NowPayments API error:', response.status);
      return NextResponse.json({ error: 'Failed to check payment status' }, { status: 500 });
    }

    const data = await response.json();
    const payments = data.data as PaymentStatus[];

    // Find payment matching our order ID
    const payment = payments.find((p: PaymentStatus) => p.order_id === orderId);

    if (!payment) {
      return NextResponse.json({
        orderId,
        status: 'not_found',
        statusText: 'Order not found or expired',
        message: 'This order may have expired or does not exist. Please create a new order.',
      });
    }

    // Parse order details from order_id
    const parts = orderId.split('|');
    const username = parts[1] || 'Unknown';
    const robuxAmount = parseInt(parts[2]) || 0;

    return NextResponse.json({
      orderId,
      paymentId: payment.payment_id,
      status: mapStatus(payment.payment_status),
      rawStatus: payment.payment_status,
      statusText: getStatusText(payment.payment_status),
      username,
      robuxAmount,
      paidAmount: payment.actually_paid,
      expectedAmount: payment.pay_amount,
      currency: payment.pay_currency?.toUpperCase(),
      payAddress: payment.pay_address,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
    });

  } catch (error) {
    console.error('[Order Status] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'waiting':
      return 'Waiting for payment';
    case 'confirming':
      return 'Payment received, confirming on blockchain';
    case 'confirmed':
      return 'Payment confirmed, delivering Robux';
    case 'sending':
      return 'Sending Robux to your account';
    case 'partially_paid':
      return 'Partial payment received';
    case 'finished':
      return 'Order completed! Check your Roblox transactions';
    case 'failed':
      return 'Payment failed';
    case 'refunded':
      return 'Payment refunded';
    case 'expired':
      return 'Order expired';
    default:
      return 'Processing...';
  }
}
