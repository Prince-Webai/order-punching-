"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import styles from './pipeline.module.css';

const STAGES = [
  { id: 'ORDER', name: 'Order', badgeClass: 'badge-order' },
  { id: 'PAYMENT', name: 'Payment', badgeClass: 'badge-payment' },
  { id: 'MATERIAL_SHIPMENT', name: 'Shipment', badgeClass: 'badge-shipment' },
  { id: 'INSTALLATION', name: 'Installation', badgeClass: 'badge-installation' },
  { id: 'PROJECT_COMPLETION', name: 'Completion', badgeClass: 'badge-completion' },
  { id: 'EB_NET_METER', name: 'EB / Net Meter', badgeClass: 'badge-eb' },
];

export default function PipelinePage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => {
        if (!res.ok) throw new Error('Database not connected or failed to fetch orders');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setOrders(data.orders);
        } else {
          setError(data.error);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('orderId', orderId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('orderId');
    if (!orderId) return;

    // Optimistically update the UI
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, currentStage: newStage } : o));

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });
      if (!res.ok) {
        throw new Error('Failed to update stage in database');
      }
    } catch (error) {
      alert('Failed to update order stage. Reverting...');
      // Revert in case of error (for production, might want to re-fetch)
      fetch('/api/orders').then(r => r.json()).then(d => { if(d.success) setOrders(d.orders) });
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Pipeline</h1>
        <Link href="/dashboard/orders/new" className="btn btn-primary">
          <Plus size={16} style={{ marginRight: '8px' }} />
          New Order
        </Link>
      </div>

      {loading && <p>Loading orders from database...</p>}
      {error && (
        <div style={{ padding: '16px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '8px', marginBottom: '16px' }}>
          <strong>Error:</strong> {error}
          <p style={{ marginTop: '8px', fontSize: '14px' }}>Please ensure you have configured the IPv4 Connection Pooler URL in your .env file and run `npx prisma db push`.</p>
        </div>
      )}

      {!loading && !error && (
        <div className={styles.kanbanBoard}>
          {STAGES.map(stage => {
            const stageOrders = orders.filter(o => o.currentStage === stage.id);
            
            return (
              <div 
                key={stage.id} 
                className={styles.kanbanColumn}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                <div className={styles.columnHeader}>
                  <h3 className={styles.columnTitle}>{stage.name}</h3>
                  <span className={styles.countBadge}>{stageOrders.length}</span>
                </div>
                
                <div className={styles.columnContent}>
                  {stageOrders.length === 0 && (
                    <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', marginTop: '20px' }}>No orders</p>
                  )}
                  {stageOrders.map(order => {
                    // Calculate days in stage
                    const updatedDate = new Date(order.lastStageUpdatedAt);
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - updatedDate.getTime());
                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                    const isStuck = diffDays > 3;

                    return (
                      <div 
                        key={order.id} 
                        className={`${styles.orderCard} ${isStuck ? styles.stuckCard : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, order.id)}
                        style={{ cursor: 'grab' }}
                      >
                        <div className={styles.cardHeader}>
                          <h4 className={styles.clientName}>{order.clientName}</h4>
                          <span className={`badge ${stage.badgeClass}`}>{order.systemSizeKw} kW</span>
                        </div>
                        
                        <div className={styles.cardBody}>
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Mobile:</span>
                            <span className={styles.detailValue}>{order.mobileNumber}</span>
                          </div>
                          <div className={styles.detailRow}>
                            <span className={styles.detailLabel}>Time in Stage:</span>
                            <span className={`${styles.detailValue} ${isStuck ? styles.stuckText : ''}`}>
                              {diffDays} days
                            </span>
                          </div>
                        </div>
                        
                        <div className={styles.cardFooter}>
                          <Link href={`/dashboard/orders/${order.id}`} className={styles.viewBtn}>
                            View Details
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
