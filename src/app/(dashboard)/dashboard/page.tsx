'use client';

// import { useAuthStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { StatsCards } from '@/components/custom/stats-cards';
import { OrderHistory, Order } from '@/components/custom/order-history';
import { BuyModal } from '@/components/custom/buy-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Navbar } from '@/components/custom/navbar';

export default function DashboardPage() {
  // const { user, logout, checkSession, isLoading } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // useEffect(() => {
  //   checkSession();
  // }, [checkSession]);

  useEffect(() => {
    // Fetch orders regardless of user
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingOrders(false);
    }
  }

  // No user check needed
  // if (isLoading) return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  // if (!user) return null;

  // Calculate stats
  const totalRobux = orders.reduce((acc: number, o: Order) => o.status === 'COMPLETED' ? acc + o.robux_amount : acc, 0);
  const totalSpent = orders.reduce((acc: number, o: Order) => o.status === 'COMPLETED' ? acc + o.usd_price : acc, 0);
  const totalOrders = orders.filter((o: Order) => o.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
             <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
             <p className="text-gray-600">Bienvenido a Robux Store</p>
          </div>
          <div className="flex gap-4">
             <BuyModal>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                   <Plus className="mr-2 h-4 w-4" /> Nueva Compra
                </Button>
             </BuyModal>
          </div>
        </div>
        
        <StatsCards totalRobux={totalRobux} totalSpent={totalSpent} totalOrders={totalOrders} />
        
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Historial de Órdenes</h2>
          {loadingOrders ? (
              <p>Cargando órdenes...</p>
          ) : (
              <OrderHistory orders={orders} />
          )}
        </div>
      </div>
    </div>
  );
}
