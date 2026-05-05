"use client";

import { useEffect, useState } from 'react';
import { OrderDataTable } from '@/components/OrderDataTable';

export default function EBNetMeterPage() {
  const [orders, setOrders] = useState([]);
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

  const handleUpdateStage = (orderId: string, newStage: string) => {
    if (newStage !== 'EB_NET_METER') {
      setOrders(prev => prev.filter((o: any) => o.id !== orderId));
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
