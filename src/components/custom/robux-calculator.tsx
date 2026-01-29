'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowRight, Calculator, Info, CheckCircle, Loader2, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from '@/i18n';

const CRYPTO_OPTIONS = [
  { id: 'ltc', name: 'Litecoin', icon: 'Ł', network: 'Litecoin' },
  { id: 'btc', name: 'Bitcoin', icon: '₿', network: 'Bitcoin' },
  { id: 'eth', name: 'Ethereum', icon: 'Ξ', network: 'ERC20' },
  { id: 'usdttrc20', name: 'USDT', icon: '₮', network: 'TRC20' },
];

export function RobuxCalculator() {
  const { t } = useI18n();
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
  const [addressCopied, setAddressCopied] = useState(false);

  // Price: $6.50 per 1000 Robux (what user receives)
  useEffect(() => {
    if (robuxAmount < 100) return;
    const price = (robuxAmount / 1000) * 6.5;
    setUsdPrice(Number(price.toFixed(2)));
  }, [robuxAmount]);

  const handleStartPurchase = () => {
    if (robuxAmount < 100) {
      toast.error(t.calculator.minimum);
      return;
    }
    setDialogOpen(true);
    setStep(1);
  };

  const handleCreateOrder = async () => {
    if (!robloxUsername || robloxUsername.length < 3) {
      toast.error(t.errors.usernameRequired);
      return;
    }
    if (!placeId || isNaN(parseInt(placeId)) || parseInt(placeId) <= 0) {
      toast.error(t.errors.placeIdRequired);
      return;
    }
    if (!selectedCrypto) {
      toast.error(t.dialog.selectCrypto);
      return;
    }

    setLoading(true);
    try {
      // Step 1: Validate the Roblox username exists
      const userRes = await fetch(`/api/validate-user?username=${encodeURIComponent(robloxUsername)}`);
      const userData = await userRes.json();
      
      if (!userData.valid) {
        toast.error(userData.error || t.toast.userNotFound);
        setLoading(false);
        return;
      }

      // Use the correct username from Roblox (fixes case)
      const correctUsername = userData.user.name;
      if (correctUsername !== robloxUsername) {
        toast.info(`${t.toast.userCorrected} ${correctUsername}`);
      }

      // Step 2: Validate the Place ID exists on Roblox
      const validateRes = await fetch(`/api/validate-place?placeId=${placeId}`);
      const validateData = await validateRes.json();
      
      if (!validateData.valid) {
        toast.error(validateData.error || t.toast.invalidPlaceId);
        setLoading(false);
        return;
      }

      // Show game name for confirmation
      toast.success(`${t.toast.validatedSuccess} ${correctUsername} | Game: ${validateData.game.name}`);

      // Step 3: Create the order with validated data
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          robux_amount: robuxAmount,
          roblox_username: correctUsername,
          place_id: parseInt(placeId),
          crypto_currency: selectedCrypto,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error creating order');

      setOrderDetails(data);
      setStep(2); // Go to payment step
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = () => {
    if (orderDetails) {
      navigator.clipboard.writeText(orderDetails.payment_details.address);
      setAddressCopied(true);
      toast.success(t.toast.copiedAddress);
      setTimeout(() => setAddressCopied(false), 3000);
    }
  };

  const handlePaymentSent = () => {
    setStep(3); // Go to confirmation step
  };

  const resetFlow = () => {
    setStep(1);
    setOrderDetails(null);
    setRobloxUsername('');
    setPlaceId('');
    setDialogOpen(false);
    setAddressCopied(false);
  };

  const startNewOrder = () => {
    setStep(1);
    setOrderDetails(null);
    setAddressCopied(false);
    // Keep username and placeId for convenience
  };

  return (
    <>
      <Card className="w-full max-w-md border-border bg-card shadow-xl">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-lg text-card-foreground">
              <Calculator className="h-5 w-5" />
              {t.calculator.title}
            </h3>
            <span className="rounded-full bg-indigo-100 dark:bg-indigo-900 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              {t.calculator.bestPrice}
            </span>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t.calculator.howManyRobux}
              </label>
              <div className="relative">
                <Input
                  type="number"
                  min="100"
                  value={robuxAmount}
                  onChange={(e) => setRobuxAmount(Number(e.target.value))}
                  className="h-12 border-2 text-lg font-bold focus:border-indigo-500"
                />
                <span className="absolute right-4 top-3 text-sm font-bold text-muted-foreground">
                  Robux
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span className="flex items-center gap-1">
                  {t.calculator.youWillReceive} <Info className="h-3 w-3" />
                </span>
                <span className="font-bold text-foreground">{robuxAmount.toLocaleString()} R$</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t.calculator.robloxTax}</span>
                <span>+{Math.ceil((robuxAmount / 0.7) - robuxAmount).toLocaleString()} R$</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-indigo-600 dark:text-indigo-400">
                <span>{t.calculator.totalToBuy}</span>
                <span>{Math.ceil(robuxAmount / 0.7).toLocaleString()} R$</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
               <div className="text-left">
                 <p className="text-sm text-muted-foreground">{t.calculator.totalPrice}</p>
                 <p className="text-3xl font-bold text-green-600 dark:text-green-400">${usdPrice} USD</p>
               </div>
               <Button 
                 onClick={handleStartPurchase}
                 className="h-12 bg-indigo-600 px-8 text-lg hover:bg-indigo-700 shadow-lg"
               >
                 {t.calculator.buy} <ArrowRight className="ml-2 h-5 w-5" />
               </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        // Only allow closing if on step 1, otherwise show warning
        if (!open && step > 1 && step < 3) {
          // User trying to close during payment - don't close automatically
          return;
        }
        setDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => {
          // Prevent closing by clicking outside during payment
          if (step === 2) e.preventDefault();
        }}>
          <DialogHeader>
            <DialogTitle>{t.dialog.buying} {robuxAmount.toLocaleString()} {t.dialog.robux}</DialogTitle>
            <DialogDescription>
              {t.dialog.price}: ${usdPrice} USD
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {/* Step 1: Enter Details */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.dialog.robloxUsername}</Label>
                  <Input 
                    placeholder={t.dialog.enterUsername}
                    value={robloxUsername}
                    onChange={(e) => setRobloxUsername(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t.dialog.placeId}</Label>
                  <Input 
                    placeholder={t.dialog.placeIdExample}
                    value={placeId}
                    onChange={(e) => setPlaceId(e.target.value.replace(/\D/g, ''))}
                    type="text"
                    inputMode="numeric"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t.dialog.placeIdHelp}
                  </p>
                </div>

                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 p-3">
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">{t.dialog.requirements}</p>
                  <ul className="mt-1 text-xs text-amber-700 dark:text-amber-300 list-disc list-inside space-y-1">
                    <li>{t.dialog.reqOwner}</li>
                    <li>{t.dialog.reqPrice} {Math.ceil(robuxAmount / 0.7).toLocaleString()} R$</li>
                    <li><strong>{t.dialog.reqPricing}</strong></li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label>{t.dialog.selectCrypto}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {CRYPTO_OPTIONS.map((crypto) => (
                      <div
                        key={crypto.id}
                        onClick={() => setSelectedCrypto(crypto.id)}
                        className={`cursor-pointer rounded-lg border p-3 flex flex-col items-center hover:bg-accent transition-colors ${
                          selectedCrypto === crypto.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950' : 'border-border'
                        }`}
                      >
                        <span className="text-2xl">{crypto.icon}</span>
                        <span className="text-sm font-bold">{crypto.name}</span>
                        <span className="text-xs text-muted-foreground">{crypto.network}</span>
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
                      {t.dialog.generating}
                    </>
                  ) : (
                    t.dialog.generatePayment
                  )}
                </Button>
              </div>
            )}

            {/* Step 2: Payment Details */}
            {step === 2 && orderDetails && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                    <ExternalLink className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">{t.orderCreated.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.orderCreated.sendExact}
                  </p>
                </div>
                
                <div className="rounded-lg bg-muted p-4 break-all text-xs font-mono text-center">
                  {orderDetails.payment_details.address}
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleCopyAddress}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {addressCopied ? '✓' : ''} {t.orderCreated.copyAddress}
                </Button>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border border-yellow-200 dark:border-yellow-800 text-center">
                  <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">
                    {orderDetails.payment_details.amount} {orderDetails.payment_details.currency.toUpperCase()}
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">{t.orderCreated.exactAmount}</p>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                  {t.orderCreated.autoConfirm}
                </div>

                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handlePaymentSent}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t.orderCreated.understood}
                </Button>
              </div>
            )}

            {/* Step 3: Order Confirmation */}
            {step === 3 && orderDetails && (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                
                <h3 className="font-bold text-xl text-foreground">{t.orderCreated.successTitle}</h3>
                
                <p className="text-muted-foreground">
                  {t.orderCreated.successMessage}
                </p>

                <div className="rounded-lg bg-muted p-4">
                  <p className="text-xs text-muted-foreground">{t.orderCreated.orderNumber}</p>
                  <p className="font-mono text-sm font-bold text-foreground break-all">
                    {orderDetails.order.order_number.split('|')[4] || orderDetails.order.id}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={startNewOrder}
                  >
                    {t.orderCreated.newOrder}
                  </Button>
                  <Button 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    onClick={resetFlow}
                  >
                    {t.orderCreated.understood}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
