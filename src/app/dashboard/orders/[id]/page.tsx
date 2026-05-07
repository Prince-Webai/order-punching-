"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, X, Upload, CheckCircle, AlertCircle, Loader2, Package, Receipt, CreditCard, Shield } from 'lucide-react';
import { TransitionModal } from '@/components/TransitionModal';
import styles from '../new/new-order.module.css';

import { LOAN_STAGES } from '@/lib/loanStages';

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
  const [transitionTarget, setTransitionTarget] = useState<string | null>(null);
  const [loanUpdateLoading, setLoanUpdateLoading] = useState(false);

  const fetchOrder = () => {
    fetch(`/api/orders/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrder(data.order);
        }
        setLoading(false);
      });
  };

  const updateLoanStage = async (stage: string, subStage: string) => {
    setLoanUpdateLoading(true);
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loanStage: stage, loanSubStage: subStage })
      });
      if (res.ok) fetchOrder();
    } catch (e) {
      alert("Failed to update loan status");
    } finally {
      setLoanUpdateLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const handleStageChange = (newStage: string) => {
    const currentIndex = STAGES.indexOf(order.currentStage);
    const newIndex = STAGES.indexOf(newStage);

    if (newIndex < currentIndex) {
      alert("Workflow is forward-only. Cannot move back to previous stage.");
      return;
    }

    setTransitionTarget(newStage);
  };

  if (loading) return <div style={{ padding: '24px' }}><Loader2 className="animate-spin" /> Loading details...</div>;
  if (!order) return <div style={{ padding: '24px' }}>Order not found.</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <Link href="/dashboard" className="btn btn-secondary">
          <ArrowLeft size={16} style={{ marginRight: '8px' }} />
          Back to Pipeline
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Order #{order.id.slice(0,8)}</h1>
          <span className="badge badge-primary">{order.currentStage}</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.formGrid}>
          {/* LOAN SECTION (IF APPLICABLE) */}
          {order.paymentType === 'LOAN' && (
            <div className="card" style={{ gridColumn: '1 / -1', border: '2px solid #3b82f622', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0, color: '#2563eb' }}><Shield size={20} /> Bajaj Finance Progress</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <span className={styles.currentLoanStatus}>Current: <strong>{order.loanStage}</strong> ({order.loanSubStage})</span>
                   {loanUpdateLoading && <Loader2 className="animate-spin" size={16} />}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                {Object.entries(LOAN_STAGES).map(([stage, subStages]) => (
                  <div key={stage} className={styles.loanGroup}>
                    <h4 style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                      {stage.replace(/_/g, ' ')}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(subStages as string[]).map(sub => {
                        const isActive = order.loanStage === stage && order.loanSubStage === sub;
                        return (
                          <button 
                            key={sub}
                            onClick={() => updateLoanStage(stage, sub)}
                            className={`${styles.loanSubBtn} ${isActive ? styles.loanSubActive : ''}`}
                            disabled={loanUpdateLoading}
                          >
                            {isActive && <CheckCircle size={12} />}
                            {sub}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
              <span>₹{order.quotationAmount?.toLocaleString()}</span>
            </div>
            <div className={styles.row} style={{ marginBottom: '12px' }}>
              <strong style={{ width: '150px' }}>Salesperson:</strong>
              <span>{order.salesperson?.name || 'Unknown'}</span>
            </div>
          </div>

          <div className="card">
            <h2 className={styles.sectionTitle}>Summary & Finance</h2>
            <div className={styles.row} style={{ marginBottom: '12px' }}>
              <strong style={{ width: '150px' }}>Payment Type:</strong>
              <span className="badge badge-primary">{order.paymentType || 'Not Provided'}</span>
            </div>
            <div className={styles.row} style={{ marginBottom: '12px' }}>
              <strong style={{ width: '150px' }}>Total Paid:</strong>
              <span style={{ fontWeight: 800, color: '#059669', fontSize: '18px' }}>
                ₹{order.totalPaidAmount?.toLocaleString()}
              </span>
            </div>
            <div className={styles.row} style={{ marginBottom: '12px' }}>
              <strong style={{ width: '150px' }}>Balance:</strong>
              <span style={{ fontWeight: 800, color: '#dc2626' }}>
                ₹{(order.quotationAmount - (order.totalPaidAmount || 0)).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Ledger */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Payment Ledger</h2>
              <button className="btn btn-primary" onClick={() => setTransitionTarget('PAYMENT')}>
                <CreditCard size={14} style={{ marginRight: '6px' }} />
                Add Installment
              </button>
            </div>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Date</th>
                  <th style={{ padding: '12px' }}>Mode</th>
                  <th style={{ padding: '12px' }}>Reference #</th>
                  <th style={{ padding: '12px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.payments?.length > 0 ? order.payments.map((p: any) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px' }}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}><span className="badge">{p.paymentMode}</span></td>
                    <td style={{ padding: '12px' }}>{p.referenceNumber}</td>
                    <td style={{ padding: '12px', fontWeight: 700 }}>₹{p.amount?.toLocaleString()}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No payments recorded.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Shipment Details */}
          {order.shipment && (
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <h2 className={styles.sectionTitle}>Logistics Info</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Vehicle Number</label>
                  <strong style={{ fontSize: '16px' }}>{order.shipment.vehicleNumber}</strong>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Driver Name</label>
                  <strong style={{ fontSize: '16px' }}>{order.shipment.driverName}</strong>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Sent Date</label>
                  <strong style={{ fontSize: '16px' }}>{new Date(order.shipment.sentDate).toLocaleDateString()}</strong>
                </div>
              </div>
            </div>
          )}

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h2 className={styles.sectionTitle}>Pipeline Management</h2>
            <p className={styles.sectionDesc}>Move this order to the next stage. Proof will be required for specific transitions.</p>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {STAGES.map((stage) => {
                const currentIndex = STAGES.indexOf(order.currentStage);
                const stageIndex = STAGES.indexOf(stage);
                const isCompleted = stageIndex < currentIndex;
                const isCurrent = stageIndex === currentIndex;

                return (
                  <button 
                    key={stage}
                    onClick={() => handleStageChange(stage)}
                    disabled={isCompleted || isCurrent}
                    className={`btn ${isCurrent ? 'btn-primary' : isCompleted ? 'btn-success' : 'btn-secondary'}`}
                    style={{ 
                      opacity: isCompleted ? 0.7 : 1,
                      cursor: isCompleted ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isCompleted && <CheckCircle size={14} style={{ marginRight: '6px' }} />}
                    {isCurrent && <Loader2 size={14} className="animate-spin" style={{ marginRight: '6px' }} />}
                    {stage.replace(/_/g, ' ')}
                  </button>
                );
              })}
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
                      <p className={styles.timelineSubStage}>{log.subStage}</p>
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

      {transitionTarget && (
        <TransitionModal 
          isOpen={true}
          order={order}
          targetStage={transitionTarget}
          onClose={() => setTransitionTarget(null)}
          onSuccess={() => {
            setTransitionTarget(null);
            fetchOrder();
          }}
        />
      )}
    </div>
  );
}
