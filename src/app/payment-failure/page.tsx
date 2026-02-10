'use client';

import { useI18n } from '@/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function PaymentFailurePage() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-red-50 to-rose-100 dark:from-gray-900 dark:to-gray-950">
      <Card className="w-full max-w-md shadow-xl border-red-200 dark:border-red-800">
        <CardContent className="p-6 sm:p-8 text-center space-y-6">
          {/* Failure Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-red-700 dark:text-red-300">
            {t.paymentFailure?.title || 'Pago Rechazado'}
          </h1>

          <p className="text-muted-foreground text-sm">
            {t.paymentFailure?.message || 'Tu pago no pudo ser procesado. Esto puede deberse a fondos insuficientes, datos incorrectos, o una tarjeta bloqueada.'}
          </p>

          {/* Tips */}
          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 p-4 text-left">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
              {t.paymentFailure?.tipsTitle || '💡 Sugerencias:'}
            </p>
            <ul className="text-xs text-amber-700 dark:text-amber-300 list-disc list-inside space-y-1">
              <li>{t.paymentFailure?.tip1 || 'Verifica que tengas fondos suficientes'}</li>
              <li>{t.paymentFailure?.tip2 || 'Prueba con otro método de pago'}</li>
              <li>{t.paymentFailure?.tip3 || 'Contacta a tu banco si el problema persiste'}</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Link href="/">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                <RefreshCw className="mr-2 h-4 w-4" />
                {t.paymentFailure?.retry || 'Intentar de Nuevo'}
              </Button>
            </Link>
            <a href="mailto:support@robuxstore.com">
              <Button variant="outline" className="w-full">
                {t.paymentFailure?.contactSupport || 'Contactar Soporte'}
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
