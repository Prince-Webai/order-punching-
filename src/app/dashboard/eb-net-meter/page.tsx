"use client";

import { useEffect, useState } from 'react';
import { OrderDataTable } from '@/components/OrderDataTable';

export default function EBNetMeterPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.orders.filter((o: any) => o.currentStage === 'EB_NET_METER'));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpdateStage = (orderId: string, updatedOrder: any) => {
    if (updatedOrder.currentStage !== 'EB_NET_METER') {
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
        title="EB & Net Metering" 
        subtitle="Manage orders pending electricity board approval and net meter installation."
        onUpdateStage={handleUpdateStage}
      />
    </div>
  );
}
