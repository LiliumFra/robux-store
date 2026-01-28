// RBXCrate API Integration
const RBXCRATE_API_KEY = process.env.RBXCRATE_API_KEY;
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const PLACE_ID = process.env.PLACE_ID || '123456789'; // Required: Your Roblox game Place ID
const DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'https://robux-store.vercel.app';

// ============================================================================
// RBXCrate - Create Robux Order
// Documentation: https://rbxcrate-organization.gitbook.io/rbxcrate-api-docs
// ============================================================================
export async function createRobuxOrder(robuxAmount: number, robloxUsername: string, orderId: string) {
  if (!RBXCRATE_API_KEY || RBXCRATE_API_KEY.includes('placeholder')) {
    console.log('[RBXCrate] Mock mode - API key not configured');
    return { success: true, id: `mock_order_${Date.now()}` };
  }

  try {
    // Endpoint: POST /api/orders/gamepass
    // Auth: api-key header
    const response = await fetch('https://rbxcrate.com/api/orders/gamepass', {
      method: 'POST',
      headers: {
        'api-key': RBXCRATE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderId: orderId,
        robloxUsername: robloxUsername,
        robuxAmount: robuxAmount,
        placeId: parseInt(PLACE_ID),
        isPreOrder: true,        // Recommended: Order will wait if no Robux available
        checkOwnership: false    // Set to false to support group gamepasses
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('[RBXCrate] API Error:', data);
      return { 
        success: false, 
        error: data.message || data.error || 'Unknown error',
        statusCode: response.status 
      };
    }

    console.log('[RBXCrate] Order created successfully:', data);
    return { success: true, ...data };
    
  } catch (error) {
    console.error('[RBXCrate] Network error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
}

// ============================================================================
// NowPayments - Create Crypto Payment Invoice
// ============================================================================
export async function createPayment(orderData: {
  usdAmount: number;
  selectedCrypto: string;
  orderId: string;
  robloxUsername: string;
  robuxAmount: number;
}) {
  if (!NOWPAYMENTS_API_KEY || NOWPAYMENTS_API_KEY.includes('placeholder')) {
    console.log('[NowPayments] Mock mode - API key not configured');
    return {
      payment_id: `mock_pay_${Date.now()}`,
      pay_address: 'bc1qmockaddress123456789abcdefghijklmnopqrstuvwxyz',
      pay_amount: (orderData.usdAmount / 60000).toFixed(6),
      pay_currency: orderData.selectedCrypto,
      order_id: orderData.orderId
    };
  }

  try {
    const response = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'x-api-key': NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        price_amount: orderData.usdAmount,
        price_currency: 'usd',
        pay_currency: orderData.selectedCrypto,
        order_id: orderData.orderId,
        order_description: `${orderData.robuxAmount} Robux para ${orderData.robloxUsername}`,
        ipn_callback_url: `${DOMAIN}/api/webhooks/nowpayments`,
        success_url: `${DOMAIN}/?status=success`,
        cancel_url: `${DOMAIN}/?status=cancelled`
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('[NowPayments] API Error:', data);
      throw new Error(data.message || 'Payment creation failed');
    }
    
    console.log('[NowPayments] Payment created:', data.payment_id);
    return data;
    
  } catch (error) {
    console.error('[NowPayments] Error:', error);
    throw error;
  }
}
