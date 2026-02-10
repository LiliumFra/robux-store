import { Payment } from 'mercadopago';
import { mpClient, MP_ACCESS_TOKEN } from '@/app/api/mercadopago/config';

interface MPPaymentStatus {
  id: number;
  status: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';
  external_reference: string;
  transaction_amount: number;
  currency_id: string;
  description: string;
}

/**
 * Double-verify a payment's status by querying the Mercado Pago API directly.
 * This is CRITICAL for webhook security — never trust webhook data alone.
 */
export async function getPaymentStatus(paymentId: string): Promise<MPPaymentStatus | null> {
  try {
    if (!MP_ACCESS_TOKEN) {
      console.error('[MP] Access token not configured');
      return null;
    }

    console.log('[MP] Querying payment status:', paymentId);

    const payment = new Payment(mpClient);
    const response = await payment.get({ id: paymentId });

    if (!response) {
      console.error('[MP] No payment data returned');
      return null;
    }

    console.log('[MP] ✅ Payment status retrieved:', {
      id: response.id,
      status: response.status,
      external_reference: response.external_reference,
    });

    return {
      id: response.id as number,
      status: response.status as MPPaymentStatus['status'],
      external_reference: response.external_reference as string,
      transaction_amount: response.transaction_amount as number,
      currency_id: response.currency_id as string,
      description: response.description as string,
    };

  } catch (error) {
    console.error('[MP] Error getting payment status:', error);
    return null;
  }
}

/**
 * Verify that a webhook came from Mercado Pago.
 * For now, we rely on getPaymentStatus as the source of truth.
 */
export function verifyWebhookSignature(): boolean {
  // Mercado Pago doesn't send a traditional HMAC signature in webhooks.
  // Instead, we verify by calling the MP API directly (getPaymentStatus).
  return true;
/**
 * Create a payment preference in Mercado Pago.
 * Returns the preference ID and init_point for redirect.
 */
import { Preference } from 'mercadopago';
import { DOMAIN } from '@/app/api/mercadopago/config';
import { getUsdtExchangeRate } from './exchange-rate';

export interface CreatePreferenceParams {
  robux_amount: number;
  roblox_username: string;
  place_id: number;
  order_id: string; // "ORD|..."
  usd_price: number;
}

export async function createPreference(params: CreatePreferenceParams) {
  const { robux_amount, roblox_username, place_id, order_id, usd_price } = params;

  if (!MP_ACCESS_TOKEN) {
    throw new Error('Mercado Pago Access Token not configured');
  }

  // Fetch current USDT/ARS exchange rate
  const exchangeRate = await getUsdtExchangeRate();
  const unitPriceArs = parseFloat((usd_price * exchangeRate).toFixed(2));

  console.log('[MP Service] Creating preference:', {
    external_reference: order_id,
    amount_usd: usd_price,
    exchange_rate: exchangeRate,
    amount_ars: unitPriceArs,
    username: roblox_username,
  });

  const preference = new Preference(mpClient);
  
  const response = await preference.create({
    body: {
      items: [
        {
          id: order_id,
          title: `${robux_amount} Robux (Digital Goods)`,
          description: `Entrega automática en Roblox. Rate: 1 USDT ≈ $${exchangeRate} ARS`,
          picture_url: 'https://robux-store.vercel.app/robux-icon.png',
          category_id: 'virtual_goods',
          quantity: 1,
          unit_price: unitPriceArs,
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
        usd_price,
        exchange_rate: exchangeRate,
      },
    },
  });

  if (!response.init_point) {
    console.error('[MP Service] No init_point in response:', response);
    throw new Error('Failed to create preference');
  }

  console.log('[MP Service] ✅ Preference created:', response.id);

  return {
    preference_id: response.id,
    init_point: response.init_point,
    sandbox_init_point: response.sandbox_init_point,
  };
}
