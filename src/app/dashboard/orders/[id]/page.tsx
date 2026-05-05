"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import styles from '../new/new-order.module.css';

const STAGES = [
  'ORDER',
  'PAYMENT',
  'MATERIAL_SHIPMENT',
  'INSTALLATION',
  'PROJECT_COMPLETION',
  'EB_NET_METER'
];

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrder(data.order);
        }
        setLoading(false);
      });
  }, [params.id]);

  const handleStageChange = async (newStage: string) => {
    setUpdating(true);
    const res = await fetch(`/api/orders/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage })
    });
    const data = await res.json();
    if (data.success) {
      setOrder(data.order);
      alert('Stage updated successfully!');
    }
    setUpdating(false);
  };

  if (loading) return <div style={{ padding: '24px' }}>Loading details...</div>;
  if (!order) return <div style={{ padding: '24px' }}>Order not found.</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <Link href="/dashboard/pipeline" className="btn btn-secondary">
          <ArrowLeft size={16} style={{ marginRight: '8px' }} />
          Back to Pipeline
        </Link>
        <h1 className="page-title" style={{ margin: 0 }}>Order #{order.id.slice(0,8)}</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.formGrid}>
          {/* Basic Details */}
          <div className="card">
            <h2 className={styles.sectionTitle}>Client Details</h2>
            
            <div className={styles.row} style={{ marginBottom: '12px' }}>
              <strong style={{ width: '150px' }}>Client Name:</strong>
              <span>{order.clientName}</span>
            </div>
            <div className={styles.row} style={{ marginBottom: '12px' }}>
              <strong style={{ width: '150px' }}>Mobile Number:</strong>
              <span>{order.mobileNumber}</span>
            </div>
            <div className={styles.row} style={{ marginBottom: '12px' }}>
              <strong style={{ width: '150px' }}>System Size:</strong>
              <span>{order.systemSizeKw} kW</span>
            </div>
            <div className={styles.row} style={{ marginBottom: '12px' }}>
              <strong style={{ width: '150px' }}>Quotation Amount:</strong>
              <span>₹{order.quotationAmount}</span>
            </div>
            <div className={styles.row} style={{ marginBottom: '12px' }}>
              <strong style={{ width: '150px' }}>Salesperson:</strong>
              <span>{order.salesperson?.name || 'Unknown'}</span>
            </div>
          </div>

          <div className="card">
            <h2 className={styles.sectionTitle}>Payment Details</h2>
            <div className={styles.row} style={{ marginBottom: '12px' }}>
              <strong style={{ width: '150px' }}>Payment Type:</strong>
              <span>{order.paymentType || 'Not Provided'}</span>
            </div>
            {order.paymentType === 'FULL_PAYMENT' && (
              <div className={styles.row} style={{ marginBottom: '12px' }}>
                <strong style={{ width: '150px' }}>Amount Collected:</strong>
                <span style={{ color: order.paymentAmountCollected >= 5000 ? 'green' : 'red' }}>
                  ₹{order.paymentAmountCollected}
                </span>
              </div>
            )}
            {order.paymentType === 'LOAN' && (
              <div className={styles.row} style={{ marginBottom: '12px' }}>
                <strong style={{ width: '150px' }}>Loan Type:</strong>
                <span>{order.loanType}</span>
              </div>
            )}
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h2 className={styles.sectionTitle}>Pipeline Management</h2>
            <p className={styles.sectionDesc}>Move this order to the next stage of the pipeline.</p>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {STAGES.map((stage) => (
                <button 
                  key={stage}
                  onClick={() => handleStageChange(stage)}
                  disabled={updating || order.currentStage === stage}
                  className={`btn ${order.currentStage === stage ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {order.currentStage === stage && <CheckCircle size={14} style={{ marginRight: '6px' }} />}
                  {stage.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h2 className={styles.sectionTitle}>Activity Log</h2>
            <div className={styles.timeline}>
              {order.stageTrackings?.length > 0 ? (
                order.stageTrackings.map((log: any) => (
                  <div key={log.id} className={styles.timelineItem}>
                    <div className={styles.timelineBadge}></div>
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineHeader}>
                        <strong>{log.stage.replace(/_/g, ' ')}</strong>
                        <span className={styles.timelineDate}>
                          {new Date(log.updatedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className={styles.timelineUser}>Updated by: {log.updatedBy?.name || 'System'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className={styles.sectionDesc}>No activity recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
