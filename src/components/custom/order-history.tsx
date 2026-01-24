'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface Order {
  id: string;
  order_number: string;
  robux_amount: number;
  usd_price: number;
  status: string;
  created_at: string;
}

interface OrderHistoryProps {
  orders: Order[];
}

export function OrderHistory({ orders }: OrderHistoryProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'PROCESSING': return 'bg-blue-500 hover:bg-blue-600';
      case 'COMPLETED': return 'bg-green-500 hover:bg-green-600';
      case 'FAILED': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
      switch(status) {
          case 'PENDING': return 'Pendiente';
          case 'PROCESSING': return 'Procesando';
          case 'COMPLETED': return 'Completado';
          case 'FAILED': return 'Fallido';
          default: return status;
      }
  }

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Orden #</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Robux</TableHead>
            <TableHead>Precio</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
             <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                   No tienes órdenes aún.
                </TableCell>
             </TableRow>
          ) : (
             orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{order.robux_amount.toLocaleString()} R$</TableCell>
                  <TableCell>${order.usd_price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                          Ver
                      </Button>
                  </TableCell>
                </TableRow>
              ))
          )}
        </TableBody>
      </Table>
      
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Orden #{selectedOrder.order_number}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Estado</span>
                        <Badge className={getStatusColor(selectedOrder.status)}>
                            {getStatusLabel(selectedOrder.status)}
                        </Badge>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Monto Robux</span>
                        <span className="font-bold">{selectedOrder.robux_amount.toLocaleString()} R$</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">Precio USD</span>
                        <span>${selectedOrder.usd_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                         <span className="text-gray-500">Fecha</span>
                         <span>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                    </div>
                     <div className="flex justify-between pt-2">
                         <span className="text-gray-500">ID Referencia</span>
                         <span className="font-mono text-xs">{selectedOrder.id}</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
