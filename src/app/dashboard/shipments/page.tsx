"use client";

import { useEffect, useState } from 'react';
import { OrderDataTable } from '@/components/OrderDataTable';

export default function ShipmentsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.orders.filter((o: any) => o.currentStage === 'MATERIAL_SHIPMENT'));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpdateStage = (orderId: string, newStage: string) => {
    if (newStage !== 'MATERIAL_SHIPMENT') {
      setOrders(prev => prev.filter((o: any) => o.id !== orderId));
    }
  };

  return (
    <div>
      <OrderDataTable 
        orders={orders} 
        loading={loading} 
        title="Material Shipments" 
        subtitle="Manage orders that are ready for or currently in material shipment."
        onUpdateStage={handleUpdateStage}
      />
    </div>
  );
}
