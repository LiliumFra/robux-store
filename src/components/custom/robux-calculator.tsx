'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calculator, Info } from 'lucide-react';
// import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

export function RobuxCalculator() {
  const [robuxAmount, setRobuxAmount] = useState<number>(1000);
  const [usdPrice, setUsdPrice] = useState<number>(0);
  // const { user } = useAuthStore();
  const router = useRouter();

  // Price Calculation Logic
  // 1000 Robux = $7 USD
  // Tax logic: To receive 1000, user buys 1300 (approx, if tax included in logic)
  // Prompt says: $7 USD = 1000 Robux (Received). Tax is 30%.
  // So to receive X, we send X / 0.7 ? Or does the user buy Y and receive Y * 0.7?
  // Prompt says: "Total a comprar: 1,300" -> "Desglose: Robux que recibirás: 1,000"
  // This implies the USER inputs "1000" (what they want) and we calculate "Total to buy" (gross).
  // Formula: Desired / 0.7 (approx) or Desired + 30%?
  // Actually, Roblox takes 30% of the *gross*. So if you buy 1429, you get 1000. (1429 * 0.7 = 1000.3)
  // Let's check the prompt example: "Robux que recibirás: 1,000", "Tax de Roblox (30%): +300", "Total a comprar: 1,300".
  // Note: 1300 * 0.7 = 910. So the math in the prompt is simplified (30% of 1000 is 300, added on top).
  // "Price: $9.10 USD".
  // If 1000 Robux = $7 USD (base rate), then 1300 Robux = $9.10. ($7 * 1.3 = $9.10).
  // So the logic is: Price = (Desired_Amount * 1.3) * ($7 / 1000).
  
  // const ROB_RATE = 6.5 / 1000; // Legacy rate

  useEffect(() => {
    // Validate minimum
    if (robuxAmount < 100) return;
    
    // Calculate total needed to cover tax
    // Formula: Desired / 0.7
    const totalToBuy = Math.ceil(robuxAmount / 0.7);
    
    // Price: $6.50 per 1000 (Based on DESIRED amount)
    const price = (robuxAmount / 1000) * 6.5;
    setUsdPrice(Number(price.toFixed(2)));
  }, [robuxAmount]);

  const handleBuy = () => {
    // Pass amount to dashboard or checkout immediately
    router.push(`/dashboard?amount=${robuxAmount}`);
  };

  return (
    <Card className="w-full max-w-md border-indigo-100 bg-white/95 shadow-xl backdrop-blur">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between text-indigo-900">
          <h3 className="flex items-center gap-2 font-bold text-lg">
            <Calculator className="h-5 w-5" />
            Calculadora
          </h3>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
            Mejor Precio
          </span>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              ¿Cuántos Robux necesitas?
            </label>
            <div className="relative">
              <Input
                type="number"
                min="100"
                value={robuxAmount}
                onChange={(e) => setRobuxAmount(Number(e.target.value))}
                className="h-12 border-2 border-indigo-100 text-lg font-bold text-gray-900 focus:border-indigo-500"
              />
              <span className="absolute right-4 top-3 text-sm font-bold text-gray-400">
                Robux
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span className="flex items-center gap-1">
                Recibirás <Info className="h-3 w-3" />
              </span>
              <span className="font-bold text-gray-900">{robuxAmount.toLocaleString()} R$</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Tax de Roblox (30%)</span>
              <span>+{Math.ceil((robuxAmount / 0.7) - robuxAmount).toLocaleString()} R$</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-indigo-900">
              <span>Total a comprar</span>
              <span>{Math.ceil(robuxAmount / 0.7).toLocaleString()} R$</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
             <div className="text-left">
                <p className="text-sm text-gray-500">Precio Total</p>
                <p className="text-3xl font-bold text-green-600">${usdPrice} USD</p>
             </div>
             <Button 
                onClick={handleBuy}
                className="h-12 bg-indigo-600 px-8 text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200"
             >
                Comprar <ArrowRight className="ml-2 h-5 w-5" />
             </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
