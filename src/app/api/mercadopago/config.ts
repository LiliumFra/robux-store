import { MercadoPagoConfig } from 'mercadopago';

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';
const MP_WEBHOOK_TOKEN = process.env.MP_WEBHOOK_TOKEN || '';
const DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'https://robux-store.vercel.app';

if (!MP_ACCESS_TOKEN) {
  console.error('[MP] Access token not configured — Mercado Pago will not work');
}

// MercadoPago SDK v2 configuration
const mpClient = new MercadoPagoConfig({
  accessToken: MP_ACCESS_TOKEN,
});

export { mpClient, MP_ACCESS_TOKEN, MP_WEBHOOK_TOKEN, DOMAIN };
