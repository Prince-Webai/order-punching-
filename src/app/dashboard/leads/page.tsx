"use client";

import { useEffect, useState } from 'react';
import { OrderDataTable } from '@/components/OrderDataTable';

export default function LeadsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.orders);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpdateStage = (orderId: string, newStage: string) => {
    setOrders((prev: Order[]) => prev.map((o) => o.id === orderId ? { ...o, currentStage: newStage } : o));
  };

  return (
    <div>
      <OrderDataTable 
        orders={orders} 
        loading={loading} 
        title="All Leads / Orders" 
        subtitle="Manage and view all punched orders across your entire pipeline."
        onUpdateStage={handleUpdateStage}
      />
    </div>
  );
}
