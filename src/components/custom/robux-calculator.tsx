'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowRight, Calculator, Info, CheckCircle, Loader2, Copy, ExternalLink, AlertTriangle, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from '@/i18n';
import { requestNotificationPermission, sendPurchaseNotification } from '@/lib/notifications';
import Link from 'next/link';

// ============================================================================
// Supported Cryptocurrencies with Network Information
// Based on NowPayments API documentation
// ============================================================================
const CRYPTO_OPTIONS = [
  // Popular / Fast options
  { id: 'ltc', name: 'Litecoin', icon: 'Ł', network: 'LTC Network', networkShort: 'LTC', popular: true, fast: true },
  { id: 'usdttrc20', name: 'USDT', icon: '₮', network: 'Tron Network (TRC20)', networkShort: 'TRC20', popular: true, lowFee: true },
  { id: 'btc', name: 'Bitcoin', icon: '₿', network: 'Bitcoin Mainnet', networkShort: 'BTC', popular: true },
  { id: 'eth', name: 'Ethereum', icon: 'Ξ', network: 'Ethereum Mainnet (ERC20)', networkShort: 'ERC20', popular: true },
  // Additional options
  { id: 'usdterc20', name: 'USDT', icon: '₮', network: 'Ethereum (ERC20)', networkShort: 'ERC20' },
  { id: 'usdtbsc', name: 'USDT', icon: '₮', network: 'BNB Smart Chain (BEP20)', networkShort: 'BEP20', lowFee: true },
  { id: 'usdtsol', name: 'USDT', icon: '₮', network: 'Solana Network', networkShort: 'SOL', fast: true, lowFee: true },
  { id: 'bnbmainnet', name: 'BNB', icon: '🟡', network: 'BNB Smart Chain', networkShort: 'BEP20', fast: true },
  { id: 'sol', name: 'Solana', icon: '◎', network: 'Solana Network', networkShort: 'SOL', fast: true, lowFee: true },
  { id: 'trx', name: 'TRON', icon: '⟐', network: 'Tron Network', networkShort: 'TRX', lowFee: true },
  { id: 'doge', name: 'Dogecoin', icon: 'Ð', network: 'Dogecoin Network', networkShort: 'DOGE', fast: true },
  { id: 'xrp', name: 'XRP', icon: '✕', network: 'XRP Ledger', networkShort: 'XRP', requiresMemo: true, fast: true },
  { id: 'usdc', name: 'USDC', icon: '$', network: 'Ethereum (ERC20)', networkShort: 'ERC20' },
];

export function RobuxCalculator() {
  const { t, locale } = useI18n();
  const [robuxAmount, setRobuxAmount] = useState<number>(1000);
  const [usdPrice, setUsdPrice] = useState<number>(0);
  const [step, setStep] = useState(1);
  const [robloxUsername, setRobloxUsername] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('ltc');
  const [loading, setLoading] = useState(false);
  const [showAllCrypto, setShowAllCrypto] = useState(false);
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

  // Request notification permission on dialog open
  useEffect(() => {
    if (dialogOpen) {
      requestNotificationPermission();
    }
  }, [dialogOpen]);

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
    // Send push notification
    sendPurchaseNotification(robuxAmount, locale as 'es' | 'en');
    setStep(3); // Go to confirmation step
  };

  const resetFlow = () => {
    setStep(1);
    setOrderDetails(null);
    setRobloxUsername('');
    setPlaceId('');
    setDialogOpen(false);
    setAddressCopied(false);
    setShowAllCrypto(false);
  };

  const startNewOrder = () => {
    setStep(1);
    setOrderDetails(null);
    setAddressCopied(false);
    setShowAllCrypto(false);
    // Keep username and placeId for convenience
  };

  // Get selected crypto details
  const selectedCryptoDetails = CRYPTO_OPTIONS.find(c => c.id === selectedCrypto);
  
  // Filter crypto options
  const popularCrypto = CRYPTO_OPTIONS.filter(c => c.popular);
  const displayedCrypto = showAllCrypto ? CRYPTO_OPTIONS : popularCrypto;

  // Step indicator component
  const StepIndicator = ({ currentStep }: { currentStep: number }) => (
    <div className="flex items-center justify-center gap-2 mb-4">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            s === currentStep 
              ? 'bg-indigo-600 text-white' 
              : s < currentStep 
                ? 'bg-green-500 text-white'
                : 'bg-muted text-muted-foreground'
          }`}>
            {s < currentStep ? <CheckCircle className="w-4 h-4" /> : s}
          </div>
          {s < 3 && (
            <div className={`w-8 sm:w-12 h-1 mx-1 rounded ${
              s < currentStep ? 'bg-green-500' : 'bg-muted'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

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

      {/* Purchase Dialog - Responsive */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        // Only allow closing if on step 1, otherwise show warning
        if (!open && step > 1 && step < 3) {
          // User trying to close during payment - don't close automatically
          return;
        }
        setDialogOpen(open);
      }}>
        <DialogContent 
          className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto" 
          onPointerDownOutside={(e) => {
            // Prevent closing by clicking outside during payment
            if (step === 2) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-center sm:text-left">
              {t.dialog.buying} {robuxAmount.toLocaleString()} {t.dialog.robux}
            </DialogTitle>
            <DialogDescription className="text-center sm:text-left">
              {t.dialog.price}: ${usdPrice} USD
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {/* Step Indicator */}
            <StepIndicator currentStep={step} />

            {/* Step 1: Enter Details */}
            {step === 1 && (
              <div className="space-y-4">
                {/* Step Title */}
                <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg">
                  <h4 className="font-bold text-indigo-700 dark:text-indigo-300">
                    {t.payment?.step1Title || "Step 1: Enter your details"}
                  </h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                    {t.payment?.step1Desc || "Complete your Roblox username and Gamepass Place ID"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{t.dialog.robloxUsername}</Label>
                  <Input 
                    placeholder={t.dialog.enterUsername}
                    value={robloxUsername}
                    onChange={(e) => setRobloxUsername(e.target.value)}
                    className="h-12"
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
                    className="h-12"
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

                {/* Cryptocurrency Selection */}
                <div className="space-y-2">
                  <Label>{t.payment?.selectPaymentMethod || t.dialog.selectCrypto}</Label>
                  
                  {/* Crypto Grid - Responsive */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {displayedCrypto.map((crypto) => (
                      <div
                        key={crypto.id}
                        onClick={() => setSelectedCrypto(crypto.id)}
                        className={`cursor-pointer rounded-lg border p-2 sm:p-3 flex flex-col items-center hover:bg-accent transition-colors ${
                          selectedCrypto === crypto.id ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 ring-2 ring-indigo-600' : 'border-border'
                        }`}
                      >
                        <span className="text-xl sm:text-2xl">{crypto.icon}</span>
                        <span className="text-xs sm:text-sm font-bold">{crypto.name}</span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground">{crypto.networkShort}</span>
                        {/* Badges */}
                        <div className="flex gap-1 mt-1 flex-wrap justify-center">
                          {crypto.fast && (
                            <span className="text-[8px] px-1 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                              {t.payment?.fastTransaction || '⚡ Fast'}
                            </span>
                          )}
                          {crypto.lowFee && (
                            <span className="text-[8px] px-1 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                              {t.payment?.lowFees || '💰 Low'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Show More Options */}
                  {!showAllCrypto && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-xs"
                      onClick={() => setShowAllCrypto(true)}
                    >
                      {t.payment?.allOptions || "Show all options"} ({CRYPTO_OPTIONS.length} {t.payment?.availableCurrencies || "currencies"})
                    </Button>
                  )}
                </div>

                <Button
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-base"
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
                {/* Step Title */}
                <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg">
                  <h4 className="font-bold text-indigo-700 dark:text-indigo-300">
                    {t.payment?.step2Title || "Step 2: Make payment"}
                  </h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                    {t.payment?.step2Desc || "Send the exact amount to the indicated address"}
                  </p>
                </div>

                {/* Network Warning - VERY PROMINENT */}
                <div className="rounded-lg border-2 border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                    <span className="font-bold text-red-700 dark:text-red-300">
                      {t.payment?.networkWarning || "⚠️ Send ONLY on the"} {selectedCryptoDetails?.networkShort} {t.payment?.network || "network"}
                    </span>
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {selectedCryptoDetails?.network}
                  </p>
                  <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">
                    {t.payment?.wrongNetwork || "If you send on another network, your payment may be lost"}
                  </p>
                </div>

                {/* Memo Warning for XRP, XLM, etc */}
                {selectedCryptoDetails?.requiresMemo && (
                  <div className="rounded-lg border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      <span className="font-bold text-amber-700 dark:text-amber-300">
                        {t.payment?.memoRequired || "⚠️ MEMO/TAG required"}
                      </span>
                    </div>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      {t.payment?.memoWarning || "This payment requires a Memo or Destination Tag. Without it, your payment won't be detected."}
                    </p>
                  </div>
                )}
                
                {/* Payment Address */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    {t.payment?.paymentAddress || "Payment address"} ({selectedCryptoDetails?.networkShort})
                  </Label>
                  <div className="rounded-lg bg-muted p-3 break-all text-xs font-mono text-center border-2 border-dashed border-border">
                    {orderDetails.payment_details.address}
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full h-10"
                  onClick={handleCopyAddress}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {addressCopied ? '✓' : ''} {t.orderCreated.copyAddress}
                </Button>

                {/* Amount to Send */}
                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg border-2 border-yellow-300 dark:border-yellow-700 text-center">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-1">
                    {t.orderCreated.exactAmount}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-800 dark:text-yellow-200">
                    {orderDetails.payment_details.amount} {orderDetails.payment_details.currency.toUpperCase()}
                  </p>
                </div>

                <div className="text-xs text-muted-foreground text-center">
                  {t.orderCreated.autoConfirm}
                </div>

                <Button 
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-base"
                  onClick={handlePaymentSent}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {t.orderCreated.understood}
                </Button>
              </div>
            )}

            {/* Step 3: Order Confirmation */}
            {step === 3 && orderDetails && (
              <div className="space-y-4 text-center">
                {/* Step Title */}
                <div className="p-3 bg-green-50 dark:bg-green-950/50 rounded-lg">
                  <h4 className="font-bold text-green-700 dark:text-green-300">
                    {t.payment?.step3Title || "Step 3: Payment confirmed"}
                  </h4>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {t.payment?.step3Desc || "Your order is being processed!"}
                  </p>
                </div>

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                
                <h3 className="font-bold text-xl text-foreground">{t.orderCreated.successTitle}</h3>
                
                <p className="text-muted-foreground text-sm">
                  {t.orderCreated.successMessage}
                </p>

                <div className="rounded-lg bg-muted p-4">
                  <p className="text-xs text-muted-foreground">{t.orderCreated.orderNumber}</p>
                  <p className="font-mono text-sm font-bold text-foreground break-all">
                    {orderDetails.order.order_number.split('|')[4] || orderDetails.order.id}
                  </p>
                </div>

                {/* Roblox Transactions Link */}
                <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 p-4">
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-2">
                    {t.payment?.checkTransactions || "Check your Robux at"}:
                  </p>
                  <a 
                    href="https://www.roblox.com/transactions" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {t.payment?.robloxTransactions || "Roblox Transactions"}
                  </a>
                </div>

                {/* Check Order Link */}
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 p-4 text-center">
                  <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
                    {locale === 'es'
                      ? '¿Cerraste la página? Puedes verificar tu pedido después:'
                      : 'Closed the page? You can check your order later:'}
                  </p>
                  <Link 
                    href="/check-order"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Search className="h-4 w-4" />
                    {locale === 'es' ? 'Verificar Pedido' : 'Check Order Status'}
                  </Link>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline"
                    className="flex-1 h-10"
                    onClick={startNewOrder}
                  >
                    {t.orderCreated.newOrder}
                  </Button>
                  <Button 
                    className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700"
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
