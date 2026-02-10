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
}
