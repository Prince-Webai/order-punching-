"use client";

import { useEffect, useState } from 'react';
import { OrderDataTable } from '@/components/OrderDataTable';

export default function PaymentsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.orders.filter((o: any) => o.currentStage === 'PAYMENT'));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpdateStage = (orderId: string, updatedOrder: any) => {
    if (updatedOrder.currentStage !== 'PAYMENT') {
      setOrders(prev => prev.filter((o: any) => o.id !== orderId));
    } else {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updatedOrder } : o));
    }
  };

  return (
    <div>
      <OrderDataTable 
        orders={orders} 
        loading={loading} 
        title="Pending Payments" 
        subtitle="Manage orders that are currently in the payment processing stage."
        onUpdateStage={handleUpdateStage}
      />
    </div>
  );
}
