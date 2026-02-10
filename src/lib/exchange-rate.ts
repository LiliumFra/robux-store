import { unstable_cache } from 'next/cache';

interface CryptoRate {
  moneda: string;
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

// Fallback rate in case API fails (approximate safe value to prevent zero price)
const FALLBACK_USDT_ARS = 1400;

/**
 * Fetches the current USDT to ARS exchange rate (Venta/Ask price).
 * Uses DolarAPI.com as the source.
 * Caches the result for 60 seconds to prevent rate limiting.
 */
export const getUsdtExchangeRate = unstable_cache(
  async (): Promise<number> => {
    try {
      // Fetch USDT rate (Cripto dollar)
      // DolarAPI endpoint for crypto dollar (USDT equivalent)
      const response = await fetch('https://dolarapi.com/v1/dolares/cripto', {
        next: { revalidate: 60 }, // Cache for 60 seconds
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'RobuxStore/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rate: ${response.statusText}`);
      }

      const data: CryptoRate = await response.json();

      // We use 'venta' because that's the price the user would pay to buy USDT
      // (or the value we are "selling" our goods for in ARS equivalent)
      if (!data.venta || isNaN(data.venta)) {
        throw new Error('Invalid exchange rate data');
      }

      console.log(`[Exchange Rate] USDT/ARS: ${data.venta}`);
      return data.venta;

    } catch (error) {
      console.error('[Exchange Rate] Error fetching rate, using fallback:', error);
      return FALLBACK_USDT_ARS;
    }
  },
  ['usdt-exchange-rate'],
  { revalidate: 60, tags: ['exchange-rate'] }
);
