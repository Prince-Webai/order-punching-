"use client";

import { useEffect, useState } from 'react';
import { OrderDataTable } from '@/components/OrderDataTable';

export default function InstallationsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.orders.filter((o: any) => o.currentStage === 'INSTALLATION'));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpdateStage = (orderId: string, updatedOrder: any) => {
    if (updatedOrder.currentStage !== 'INSTALLATION') {
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
        title="Active Installations" 
        subtitle="Manage orders that are currently undergoing site installation."
        onUpdateStage={handleUpdateStage}
      />
    </div>
  );
}
