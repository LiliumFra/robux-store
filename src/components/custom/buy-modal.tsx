'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Bitcoin, CheckCircle } from 'lucide-react'; // Icons
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store';

const CRYPTO_OPTIONS = [
  { id: 'btc', name: 'Bitcoin', icon: '₿', network: 'Bitcoin' },
  { id: 'eth', name: 'Ethereum', icon: 'Ξ', network: 'ERC20' },
  { id: 'usdt', name: 'USDT', icon: '₮', network: 'TRC20' },
  { id: 'ltc', name: 'Litecoin', icon: 'Ł', network: 'Litecoin' },
];

export function BuyModal({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(1000);
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const handleCreateOrder = async () => {
    if (!selectedCrypto) return toast.error('Selecciona una criptomoneda');
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          robux_amount: amount,
          roblox_username: user?.roblox_username,
          crypto_currency: selectedCrypto,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setOrderDetails(data);
      setStep(3); // Go to Payment
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Comprar Robux</DialogTitle>
          <DialogDescription>
            Sigue los pasos para recibir tus Robux automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Usuario de Roblox</Label>
                <Input value={user?.roblox_username || ''} disabled readOnly className="bg-gray-100" />
              </div>
              <div className="space-y-2">
                <Label>Cantidad de Robux</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={100}
                />
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-sm">
                <div className="flex justify-between">
                  <span>Precio Estimado:</span>
                  <span className="font-bold text-green-600">
                    ${((amount * 1.3) * 0.007).toFixed(2)} USD
                  </span>
                </div>
              </div>
              <Button className="w-full bg-indigo-600" onClick={() => setStep(2)}>
                Continuar
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Selecciona Criptomoneda:</h3>
              <div className="grid grid-cols-2 gap-2">
                {CRYPTO_OPTIONS.map((crypto) => (
                  <div
                    key={crypto.id}
                    onClick={() => setSelectedCrypto(crypto.id)}
                    className={`cursor-pointer rounded-lg border p-3 flex flex-col items-center hover:bg-gray-50 ${
                      selectedCrypto === crypto.id ? 'border-indigo-600 bg-indigo-50' : ''
                    }`}
                  >
                    <span className="text-2xl">{crypto.icon}</span>
                    <span className="text-sm font-bold">{crypto.name}</span>
                    <span className="text-xs text-gray-500">{crypto.network}</span>
                  </div>
                ))}
              </div>
              <Button
                className="w-full bg-indigo-600"
                disabled={!selectedCrypto || loading}
                onClick={handleCreateOrder}
              >
                {loading ? 'Generando...' : 'Generar Pago'}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep(1)}>
                Atrás
              </Button>
            </div>
          )}

          {step === 3 && orderDetails && (
            <div className="space-y-4 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="font-bold text-lg">¡Orden Creada!</h3>
              <p className="text-sm text-gray-600">
                Envía exactamente la cantidad indicada a la siguiente dirección:
              </p>
              
              <div className="rounded-lg bg-gray-100 p-4 break-all text-xs font-mono">
                {orderDetails.payment_details.address}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigator.clipboard.writeText(orderDetails.payment_details.address)}
              >
                Copiar Dirección
              </Button>

              <div className="my-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-sm font-bold text-yellow-800">
                  Monto: {orderDetails.payment_details.amount} {orderDetails.payment_details.currency.toUpperCase()}
                </p>
              </div>

              <div className="text-xs text-gray-500">
                Tu pago se confirmará automáticamente en unos minutos.
              </div>

              <Button 
                className="w-full bg-indigo-600"
                onClick={() => window.location.reload()} // Reload to show in history
              >
                Entendido, ver historial
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
