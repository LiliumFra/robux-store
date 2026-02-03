'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, Clock, CheckCircle, AlertCircle, Loader2, ExternalLink, XCircle, ArrowLeft, Clipboard } from 'lucide-react';
import { useI18n } from '@/i18n';
import Link from 'next/link';

interface OrderStatus {
  orderId: string;
  paymentId?: number;
  status: 'pending' | 'confirming' | 'completed' | 'failed' | 'expired' | 'not_found';
  rawStatus?: string;
  statusText: string;
  username?: string;
  robuxAmount?: number;
  paidAmount?: number;
  expectedAmount?: number;
  currency?: string;
  payAddress?: string;
  createdAt?: string;
  updatedAt?: string;
  message?: string;
}

export default function CheckOrderPage() {
  const { locale } = useI18n();
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null);
  const [error, setError] = useState('');

  const handleCheckOrder = async () => {
    if (!orderId.trim()) {
      setError(locale === 'es' ? 'Ingresa el número de orden' : 'Enter order number');
      return;
    }

    setLoading(true);
    setError('');
    setOrderStatus(null);

    try {
      const response = await fetch(`/api/orders/status?orderId=${encodeURIComponent(orderId.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || (locale === 'es' ? 'Error al verificar' : 'Failed to verify'));
        return;
      }

      setOrderStatus(data);
    } catch {
      setError(locale === 'es' ? 'Error de conexión' : 'Connection error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-12 w-12 text-yellow-500" />;
      case 'confirming':
        return <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'failed':
      case 'expired':
        return <XCircle className="h-12 w-12 text-red-500" />;
      case 'not_found':
        return <AlertCircle className="h-12 w-12 text-gray-500" />;
      default:
        return <Clock className="h-12 w-12 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 dark:bg-yellow-950/50 border-yellow-300 dark:border-yellow-700';
      case 'confirming':
        return 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700';
      case 'completed':
        return 'bg-green-50 dark:bg-green-950/50 border-green-300 dark:border-green-700';
      case 'failed':
      case 'expired':
        return 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-700';
      default:
        return 'bg-gray-50 dark:bg-gray-950/50 border-gray-300 dark:border-gray-700';
    }
  };

  // Progress steps
  const getStepStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return { current: 1, completed: 0 };
      case 'confirming':
        return { current: 2, completed: 1 };
      case 'completed':
        return { current: 3, completed: 3 };
      default:
        return { current: 0, completed: 0 };
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/30 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Back to Home */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {locale === 'es' ? 'Volver al inicio' : 'Back to home'}
        </Link>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Search className="h-6 w-6 text-indigo-600" />
              {locale === 'es' ? 'Verificar Pedido' : 'Check Order'}
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              {locale === 'es' 
                ? 'Ingresa tu número de orden para ver el estado de tu pedido'
                : 'Enter your order number to check your order status'}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Search Form */}
            <div className="space-y-2">
              <Label>{locale === 'es' ? 'Número de Orden' : 'Order Number'}</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="ORD|username|1000|12345|..."
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="font-mono text-xs sm:text-sm"
                />
                <Button 
                  onClick={handleCheckOrder}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 shrink-0 w-full sm:w-auto"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>

            {/* Order Status Result */}
            {orderStatus && (
              <div className={`rounded-lg border-2 p-6 ${getStatusColor(orderStatus.status)}`}>
                {/* Status Icon & Text */}
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-3">
                    {getStatusIcon(orderStatus.status)}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    {orderStatus.statusText}
                  </h3>
                  {orderStatus.message && (
                    <p className="text-sm text-muted-foreground mt-2">{orderStatus.message}</p>
                  )}
                </div>

                {/* Progress Indicator for active orders */}
                {orderStatus.status !== 'not_found' && orderStatus.status !== 'failed' && orderStatus.status !== 'expired' && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      {[
                        { step: 1, label: locale === 'es' ? 'Pendiente' : 'Pending' },
                        { step: 2, label: locale === 'es' ? 'Confirmando' : 'Confirming' },
                        { step: 3, label: locale === 'es' ? 'Completado' : 'Completed' }
                      ].map((item, index) => {
                        const stepStatus = getStepStatus(orderStatus.status);
                        const isCompleted = item.step <= stepStatus.completed;
                        const isCurrent = item.step === stepStatus.current;
                        
                        return (
                          <div key={item.step} className="flex items-center">
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                                isCompleted 
                                  ? 'bg-green-500 text-white' 
                                  : isCurrent 
                                    ? 'bg-indigo-600 text-white animate-pulse'
                                    : 'bg-muted text-muted-foreground'
                              }`}>
                                {isCompleted ? <CheckCircle className="w-4 h-4" /> : item.step}
                              </div>
                              <span className="text-xs mt-1 text-muted-foreground">{item.label}</span>
                            </div>
                            {index < 2 && (
                              <div className={`w-12 h-1 mx-2 rounded ${
                                item.step < stepStatus.current || isCompleted ? 'bg-green-500' : 'bg-muted'
                              }`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Order Details */}
                {orderStatus.username && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {locale === 'es' ? 'Usuario' : 'Username'}:
                      </span>
                      <span className="font-medium">{orderStatus.username}</span>
                    </div>
                    {orderStatus.robuxAmount && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Robux:</span>
                        <span className="font-medium">{orderStatus.robuxAmount.toLocaleString()} R$</span>
                      </div>
                    )}
                    {orderStatus.expectedAmount && orderStatus.currency && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {locale === 'es' ? 'Monto' : 'Amount'}:
                        </span>
                        <span className="font-medium">
                          {orderStatus.paidAmount || 0} / {orderStatus.expectedAmount} {orderStatus.currency}
                        </span>
                      </div>
                    )}
                    {orderStatus.payAddress && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-muted-foreground mb-1">
                          {locale === 'es' ? 'Dirección de pago' : 'Payment address'}:
                        </p>
                        <p className="font-mono text-xs break-all bg-muted p-2 rounded">
                          {orderStatus.payAddress}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Roblox Transactions Link for completed orders */}
                {orderStatus.status === 'completed' && (
                  <div className="mt-4 pt-4 border-t border-border text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      {locale === 'es' 
                        ? '¡Revisa tus transacciones en Roblox!'
                        : 'Check your Roblox transactions!'}
                    </p>
                    <a 
                      href="https://www.roblox.com/transactions" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {locale === 'es' ? 'Ver Transacciones' : 'View Transactions'}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Help Text */}
            {/* Instructions */}
            <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clipboard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-semibold text-foreground">
                  {locale === 'es' ? 'Cómo rastrear tu pedido' : 'How to track your order'}
                </h3>
              </div>
              
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm text-muted-foreground">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">1</span>
                  <span>
                    {locale === 'es' 
                      ? 'Después del pago, busca el ID de Orden en la pantalla de confirmación.' 
                      : 'After payment, look for the Order ID on the confirmation screen.'}
                  </span>
                </li>
                <li className="flex gap-3 text-sm text-muted-foreground">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">2</span>
                  <span>
                    {locale === 'es'
                      ? <span>Comienza con <code className="bg-muted px-1 py-0.5 rounded font-mono text-foreground font-semibold">ORD|</code> seguido de tu usuario.</span>
                      : <span>It starts with <code className="bg-muted px-1 py-0.5 rounded font-mono text-foreground font-semibold">ORD|</code> followed by your username.</span>}
                  </span>
                </li>
                <li className="flex gap-3 text-sm text-muted-foreground">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">3</span>
                  <span>
                    {locale === 'es'
                      ? 'Copia el ID completo y pégalo arriba.'
                      : 'Copy the full ID and paste it above.'}
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
