import { NextResponse } from 'next/server';
import crypto from 'crypto';

// ============================================================================
// RBXCrate Webhook Handler
// Documentation: https://rbxcrate-organization.gitbook.io/rbxcrate-api-docs/webhooks/webhook
// ============================================================================

// Types based on RBXCrate API documentation
type OrderType = 'gamepass_order' | 'vip_server';
type OrderStatus = 'Completed' | 'Pending' | 'Queued' | 'Queued_Deferred' | 'Error' | 'Cancelled';
type OrderErrorReason = 
  | 'gamepass_not_found' 
  | 'insufficient_customer_balance' 
  | 'unknown_error' 
  | 'vip_server_not_found' 
  | 'vip_server_wrong_price';

interface RBXCrateWebhookPayload {
  type: OrderType;
  uuid: string;
  orderId: string;
  price: number;
  rate: number;
  vendorId: string;
  robuxAmount: number;
  status: OrderStatus;
  robloxUserId: number;
  robloxUsername: string;
  buyerRobloxId: number | null;
  buyerRobloxUsername: string | null;
  error: { reason: OrderErrorReason; message: string | null } | null;
  sign: string;
}

// Verify webhook signature as per RBXCrate documentation
// Algorithm: MD5(base64(JSON.stringify(payloadWithoutSign)) + apiKey)
function verifySignature(payload: Omit<RBXCrateWebhookPayload, 'sign'>, receivedSign: string): boolean {
  const apiKey = process.env.RBXCRATE_API_KEY;
  if (!apiKey) {
    console.error('[RBXCrate Webhook] API key not configured');
    return false;
  }

  const payloadString = JSON.stringify(payload);
  const base64Payload = Buffer.from(payloadString).toString('base64');
  const expectedSign = crypto.createHash('md5').update(base64Payload + apiKey).digest('hex');

  return expectedSign === receivedSign;
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Handle "Check Callback" test from RBXCrate panel (sends empty object)
    if (Object.keys(body).length === 0) {
      console.log('[RBXCrate Webhook] Test callback received');
      return NextResponse.json({ success: true, message: 'Webhook endpoint active' });
    }

    const { sign, ...payloadWithoutSign } = body as RBXCrateWebhookPayload;

    console.log('[RBXCrate Webhook] Received:', {
      orderId: payloadWithoutSign.orderId,
      status: payloadWithoutSign.status,
      robuxAmount: payloadWithoutSign.robuxAmount,
      robloxUsername: payloadWithoutSign.robloxUsername
    });

    // Verify signature (recommended security check)
    if (sign && !verifySignature(payloadWithoutSign, sign)) {
      console.error('[RBXCrate Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Handle different order statuses
    switch (payloadWithoutSign.status) {
      case 'Completed':
        console.log('[RBXCrate Webhook] ✅ Order completed successfully:', {
          orderId: payloadWithoutSign.orderId,
          robuxAmount: payloadWithoutSign.robuxAmount,
          deliveredBy: payloadWithoutSign.buyerRobloxUsername || 'N/A'
        });
        // TODO: Store in database, send notification, etc.
        break;

      case 'Error':
        console.error('[RBXCrate Webhook] ❌ Order failed:', {
          orderId: payloadWithoutSign.orderId,
          error: payloadWithoutSign.error
        });
        // TODO: Handle error - notify admin, refund user, etc.
        break;

      case 'Cancelled':
        console.log('[RBXCrate Webhook] ⚠️ Order cancelled:', {
          orderId: payloadWithoutSign.orderId
        });
        // TODO: Handle cancellation
        break;

      default:
        // Pending, Queued, Queued_Deferred shouldn't reach webhook per docs
        console.log('[RBXCrate Webhook] Unexpected status:', payloadWithoutSign.status);
    }

    // Always respond 200 OK to acknowledge receipt
    return NextResponse.json({ 
      success: true,
      received: {
        orderId: payloadWithoutSign.orderId,
        status: payloadWithoutSign.status
      }
    });

  } catch (error) {
    console.error('[RBXCrate Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Optional: GET handler to check webhook is accessible
export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    service: 'RBXCrate Webhook Handler',
    timestamp: new Date().toISOString()
  });
}
