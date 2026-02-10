'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '@/i18n';

interface PaymentMethodSelectorProps {
  value: 'crypto' | 'mercadopago';
  onChange: (method: 'crypto' | 'mercadopago') => void;
}

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  const { t } = useI18n();

  const methods = [
    {
      id: 'crypto' as const,
      icon: '₿',
      title: t.paymentMethod?.crypto || 'Cryptocurrency',
      description: t.paymentMethod?.cryptoDesc || 'Bitcoin, Ethereum, Litecoin...',
      activeColor: 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 ring-2 ring-indigo-500',
    },
    {
      id: 'mercadopago' as const,
      icon: '💳',
      title: t.paymentMethod?.mercadopago || 'Mercado Pago',
      description: t.paymentMethod?.mercadopagoDesc || 'Card, debit, bank transfer...',
      activeColor: 'border-sky-500 bg-sky-50 dark:bg-sky-950 ring-2 ring-sky-500',
    },
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">
        {t.paymentMethod?.title || '¿Cómo deseas pagar?'}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {methods.map((method) => (
          <div key={method.id} onClick={() => onChange(method.id)} className="cursor-pointer">
            <Card className={`border-2 transition-all hover:shadow-md ${
              value === method.id ? method.activeColor : 'border-border hover:border-muted-foreground/40'
            }`}>
              <CardContent className="p-3 flex flex-col items-center text-center gap-1">
                <span className="text-2xl">{method.icon}</span>
                <span className="text-sm font-bold">{method.title}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{method.description}</span>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
