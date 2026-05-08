"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, MoreHorizontal, Calendar, User, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import styles from './pipeline.module.css';

const STAGES = [
  { id: 'ORDER', name: 'New Leads', color: 'hsl(82, 85%, 45%)' },
  { id: 'PAYMENT', name: 'Payment', color: 'hsl(45, 93%, 47%)' },
  { id: 'MATERIAL_SHIPMENT', name: 'Shipment', color: 'hsl(199, 89%, 48%)' },
  { id: 'INSTALLATION', name: 'Installation', color: '#a855f7' },
  { id: 'PROJECT_COMPLETION', name: 'Completion', color: '#10b981' },
  { id: 'EB_NET_METER', name: 'Net Metering', color: '#f97316' },
];

export default function PipelinePage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.orders);
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
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('orderId');
    if (!orderId) return;

    setOrders((prev: any[]) => prev.map(o => o.id === orderId ? { ...o, currentStage: newStage } : o));

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });
    } catch (error) {
      console.error(error);
      fetch('/api/orders').then(r => r.json()).then(d => { if(d.success) setOrders(d.orders) });
    }
  };

  return (
    <div className={`${styles.container} fade-in`}>
      <header className={styles.header}>
        <div>
          <h1>Pipeline</h1>
          <p className={styles.subtitle}>Track your solar projects from lead to commissioning</p>
        </div>
        <Link href="/dashboard/orders/new" className="btn btn-primary">
          <Plus size={18} />
          <span>New Lead</span>
        </Link>
      </header>

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
              <div className={styles.columnHeader} style={{ borderTopColor: stage.color }}>
                <div className={styles.columnTitleArea}>
                  <h3 className={styles.columnTitle}>{stage.name}</h3>
                  <span className={styles.countBadge}>{stageOrders.length}</span>
                </div>
                <button className={styles.columnAction}><MoreHorizontal size={14} /></button>
              </div>
              
              <div className={styles.columnContent}>
                {stageOrders.map(order => {
                  const updatedDate = new Date(order.lastStageUpdatedAt);
                  const diffDays = Math.floor((new Date().getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
                  const isStuck = diffDays > 3;

                  return (
                    <div 
                      key={order.id} 
                      className={`${styles.orderCard} ${isStuck ? styles.stuckCard : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, order.id)}
                    >
                      <div className={styles.cardHeader}>
                        <Link href={`/dashboard/orders/${order.id}`} className={styles.clientName}>
                          {order.clientName}
                        </Link>
                        <span className={styles.sizeBadge}>{order.systemSizeKw}kW</span>
                      </div>
                      
                      <div className={styles.cardBody}>
                        <div className={styles.cardMeta}>
                          <User size={12} />
                          <span>{order.mobileNumber}</span>
                        </div>
                        <div className={styles.cardMeta}>
                          <Calendar size={12} />
                          <span className={isStuck ? styles.stuckText : ''}>
                            {diffDays} days in stage
                          </span>
                        </div>
                      </div>
                      
                      <div className={styles.cardFooter}>
                        <div className={styles.priceTag}>₹{(order.quotationAmount / 1000).toFixed(1)}k</div>
                        <Link href={`/dashboard/orders/${order.id}`} className={styles.cardAction}>
                          Open <ArrowRight size={12} />
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
    </div>
  );
}
