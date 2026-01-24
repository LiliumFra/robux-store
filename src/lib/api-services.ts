const RBXCRATE_API_KEY = process.env.RBXCRATE_API_KEY;
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const PLACE_ID = process.env.PLACE_ID || '123456';
const DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// RBXCrate Integration
export async function createRobuxOrder(userId: string, robuxAmount: number, robloxUsername: string, orderId: string) {
  if (!RBXCRATE_API_KEY || RBXCRATE_API_KEY.includes('placeholder')) {
    console.log('Mocking RBXCrate Order Creation');
    return { success: true, id: `mock_rbx_${Date.now()}` };
  }

  const response = await fetch('https://api.rbxcrate.com/v1/orders/gamepass', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RBXCRATE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: robloxUsername,
      robux_amount: robuxAmount,
      place_id: PLACE_ID,
      order_id: orderId
    })
  });
  
  return await response.json();
}

// NowPayments Integration
export async function createPayment(orderData: {
  usdAmount: number;
  selectedCrypto: string;
  orderId: string;
  robloxUsername: string;
  robuxAmount: number;
}) {
  if (!NOWPAYMENTS_API_KEY || NOWPAYMENTS_API_KEY.includes('placeholder')) {
      // Mock result for demo without key
      return {
          payment_id: `mock_pay_${Date.now()}`,
          pay_address: 'bc1qblockchaingeneratedaddressmock123456',
          pay_amount: (orderData.usdAmount / 60000).toFixed(6), // Fake BTC conversion
          pay_currency: orderData.selectedCrypto,
          order_id: orderData.orderId
      };
  }

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
      success_url: `${DOMAIN}/dashboard`,
      cancel_url: `${DOMAIN}/dashboard`
    })
  });
  
  return await response.json();
}
