'use client';

import { useI18n } from '@/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Search } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PaymentPendingContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || '';

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-amber-50 to-yellow-100 dark:from-gray-900 dark:to-gray-950">
      <Card className="w-full max-w-md shadow-xl border-amber-200 dark:border-amber-800">
        <CardContent className="p-6 sm:p-8 text-center space-y-6">
          {/* Pending Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 animate-pulse">
            <Clock className="h-12 w-12 text-amber-600 dark:text-amber-400" />
          </div>

          <h1 className="text-2xl font-bold text-amber-700 dark:text-amber-300">
            {t.paymentPending?.title || 'Pago Pendiente'}
          </h1>

          <p className="text-muted-foreground text-sm">
            {t.paymentPending?.message || 'Tu pago está siendo procesado. Esto puede tardar unos minutos. Recibirás tus Robux una vez que se confirme.'}
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

          {/* Check Order Link */}
          <div className="rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 p-4">
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-2">
              {t.paymentPending?.checkLater || 'Puedes verificar el estado de tu pedido:'}
            </p>
            <Link
              href="/check-order"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Search className="h-4 w-4" />
              {t.checkOrder?.button || 'Check Order Status'}
            </Link>
          </div>

          {/* Back to Home */}
          <Link href="/">
            <Button variant="outline" className="w-full">
              {t.paymentPending?.backHome || 'Volver al Inicio'}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <PaymentPendingContent />
    </Suspense>
  );
}
