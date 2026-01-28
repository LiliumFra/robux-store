'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowRight, Calculator, Info, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const CRYPTO_OPTIONS = [
  { id: 'ltc', name: 'Litecoin', icon: 'Ł', network: 'Litecoin' },
  { id: 'btc', name: 'Bitcoin', icon: '₿', network: 'Bitcoin' },
  { id: 'eth', name: 'Ethereum', icon: 'Ξ', network: 'ERC20' },
  { id: 'usdttrc20', name: 'USDT', icon: '₮', network: 'TRC20' },
];

export function RobuxCalculator() {
  const [robuxAmount, setRobuxAmount] = useState<number>(1000);
  const [usdPrice, setUsdPrice] = useState<number>(0);
  const [step, setStep] = useState(1);
  const [robloxUsername, setRobloxUsername] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('ltc');
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{
    order: { id: string; order_number: string; robux_amount: number };
    payment_details: { address: string; amount: string; currency: string };
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Price: $6.50 per 1000 Robux (what user receives)
  useEffect(() => {
    if (robuxAmount < 100) return;
    const price = (robuxAmount / 1000) * 6.5;
    setUsdPrice(Number(price.toFixed(2)));
  }, [robuxAmount]);

  const handleStartPurchase = () => {
    if (robuxAmount < 100) {
      toast.error('El mínimo es 100 Robux');
      return;
    }
    setDialogOpen(true);
    setStep(1);
  };

  const handleCreateOrder = async () => {
    if (!robloxUsername || robloxUsername.length < 3) {
      toast.error('Ingresa tu usuario de Roblox');
      return;
    }
    if (!placeId || isNaN(parseInt(placeId)) || parseInt(placeId) <= 0) {
      toast.error('Ingresa un Place ID válido');
      return;
    }
    if (!selectedCrypto) {
      toast.error('Selecciona una criptomoneda');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Validate the Roblox username exists
      const userRes = await fetch(`/api/validate-user?username=${encodeURIComponent(robloxUsername)}`);
      const userData = await userRes.json();
      
      if (!userData.valid) {
        toast.error(userData.error || 'Usuario de Roblox no encontrado');
        setLoading(false);
        return;
      }

      // Use the correct username from Roblox (fixes case)
      const correctUsername = userData.user.name;
      if (correctUsername !== robloxUsername) {
        toast.info(`Usuario corregido: ${correctUsername}`);
      }

      // Step 2: Validate the Place ID exists on Roblox
      const validateRes = await fetch(`/api/validate-place?placeId=${placeId}`);
      const validateData = await validateRes.json();
      
      if (!validateData.valid) {
        toast.error(validateData.error || 'Place ID inválido - verifica que el juego existe');
        setLoading(false);
        return;
      }

      // Show game name for confirmation
      toast.success(`✅ Usuario: ${correctUsername} | Juego: ${validateData.game.name}`);

      // Step 3: Create the order with validated data
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          robux_amount: robuxAmount,
          roblox_username: correctUsername, // Use the corrected username
          place_id: parseInt(placeId),
          crypto_currency: selectedCrypto,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error creando orden');

      setOrderDetails(data);
      setStep(3);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setOrderDetails(null);
    setRobloxUsername('');
    setPlaceId('');
    setDialogOpen(false);
  };

  return (
    <>
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
                  onClick={handleStartPurchase}
                  className="h-12 bg-indigo-600 px-8 text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200"
               >
                  Comprar <ArrowRight className="ml-2 h-5 w-5" />
               </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Comprar {robuxAmount.toLocaleString()} Robux</DialogTitle>
            <DialogDescription>
              Precio: ${usdPrice} USD
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tu Usuario de Roblox</Label>
                  <Input 
                    placeholder="Ingresa tu usuario exacto" 
                    value={robloxUsername}
                    onChange={(e) => setRobloxUsername(e.target.value)}
                    className="bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Place ID de tu Gamepass</Label>
                  <Input 
                    placeholder="Ej: 1234567890" 
                    value={placeId}
                    onChange={(e) => setPlaceId(e.target.value.replace(/\D/g, ''))}
                    className="bg-white"
                    type="text"
                    inputMode="numeric"
                  />
                  <p className="text-xs text-gray-500">
                    Crea un gamepass con el precio correcto y pega el Place ID aquí
                  </p>
                </div>

                {/* Important warning about gamepass requirements */}
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm font-semibold text-amber-800">⚠️ Requisitos del Gamepass:</p>
                  <ul className="mt-1 text-xs text-amber-700 list-disc list-inside space-y-1">
                    <li>El gamepass debe estar en <strong>tu cuenta</strong></li>
                    <li>Precio del gamepass = {Math.ceil(robuxAmount / 0.7).toLocaleString()} R$ (con tax)</li>
                    <li><strong>Regional Pricing debe estar DESACTIVADO</strong></li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label>Selecciona Criptomoneda</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {CRYPTO_OPTIONS.map((crypto) => (
                      <div
                        key={crypto.id}
                        onClick={() => setSelectedCrypto(crypto.id)}
                        className={`cursor-pointer rounded-lg border p-3 flex flex-col items-center hover:bg-gray-50 transition-colors ${
                          selectedCrypto === crypto.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                        }`}
                      >
                        <span className="text-2xl">{crypto.icon}</span>
                        <span className="text-sm font-bold">{crypto.name}</span>
                        <span className="text-xs text-gray-500">{crypto.network}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  disabled={!robloxUsername || loading}
                  onClick={handleCreateOrder}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    'Generar Pago'
                  )}
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
                  onClick={() => {
                    navigator.clipboard.writeText(orderDetails.payment_details.address);
                    toast.success('Dirección copiada');
                  }}
                >
                  Copiar Dirección
                </Button>

                <div className="my-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-lg font-bold text-yellow-800">
                    {orderDetails.payment_details.amount} {orderDetails.payment_details.currency.toUpperCase()}
                  </p>
                  <p className="text-xs text-yellow-700">Monto exacto a enviar</p>
                </div>

                <div className="text-xs text-gray-500">
                  Tu pago se confirmará automáticamente y recibirás tus Robux en minutos.
                </div>

                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={resetFlow}
                >
                  Entendido
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
