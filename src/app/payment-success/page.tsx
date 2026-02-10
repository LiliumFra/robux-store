'use client';

import { useI18n } from '@/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ExternalLink, Search } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PaymentSuccessContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || '';

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-950">
      <Card className="w-full max-w-md shadow-xl border-green-200 dark:border-green-800">
        <CardContent className="p-6 sm:p-8 text-center space-y-6">
          {/* Success Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-2xl font-bold text-green-700 dark:text-green-300">
            {t.paymentSuccess?.title || '¡Pago Aprobado!'}
          </h1>

          <p className="text-muted-foreground text-sm">
            {t.paymentSuccess?.message || 'Tu orden está siendo procesada. Recibirás tus Robux en 1-5 minutos.'}
          </p>

          {/* Order ID */}
          {orderId && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-xs text-muted-foreground mb-1">{t.orderCreated?.orderNumber || 'Order Number'}</p>
              <p className="font-mono text-sm font-bold text-foreground break-all">
                {orderId.split('|')[4] || orderId}
              </p>
            </div>
          )}

          {/* Roblox Transactions Link */}
          <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 p-4">
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-2">
              {t.payment?.checkTransactions || 'Check your Robux at'}:
            </p>
            <a
              href="https://www.roblox.com/transactions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              {t.payment?.robloxTransactions || 'Roblox Transactions'}
            </a>
          </div>

          {/* Check Order Link */}
          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 p-4">
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-2">
              {t.checkOrder?.closedPagePrompt || 'You can check your order status:'}
            </p>
            <Link
              href="/check-order"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Search className="h-4 w-4" />
              {t.checkOrder?.button || 'Check Order Status'}
            </Link>
          </div>

          {/* Back to Home */}
          <Link href="/">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
              {t.paymentSuccess?.backHome || 'Volver al Inicio'}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
