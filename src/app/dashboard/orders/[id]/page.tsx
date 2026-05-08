"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, X, Upload, CheckCircle, AlertCircle, Loader2, Package, Receipt, CreditCard, Shield, FileText, Download, ClipboardList, User } from 'lucide-react';
import { TransitionModal } from '@/components/TransitionModal';
import { useAuth } from '@/lib/AuthContext';
import styles from '../new/new-order.module.css';

import { LOAN_STAGES } from '@/lib/loanStages';

const STAGES = [
  'ORDER',
  'PAYMENT',
  'BOM_AND_PLANNING',
  'MATERIAL_SHIPMENT',
  'INSTALLATION',
  'PROJECT_COMPLETION',
  'EB_NET_METER'
];

export default function OrderDetailsPage() {
  const { activeUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transitionTarget, setTransitionTarget] = useState<string | null>(null);
  const [loanUpdateLoading, setLoanUpdateLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchOrder = () => {
    fetch(`/api/orders/${params.id}`)
      .then(async res => {
        const data = await res.json();
        if (res.ok && data.success) {
          setOrder(data.order);
        } else {
          setError(data.error || `Error ${res.status}: Failed to fetch`);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Network error or server is down");
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
    if (params.id) {
      fetchOrder();
    }
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

  if (loading) return <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}><Loader2 className="animate-spin" /> Loading details...</div>;
  if (error) return <div style={{ padding: '24px', color: '#dc2626', fontWeight: 600 }}>Error: {error}</div>;
  if (!order) return <div style={{ padding: '24px' }}>No order data available.</div>;

  const isLoanPartner = activeUser?.role === 'LOAN_PARTNER';

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
          {/* LOAN SECTION (ONLY FOR ADMIN & BAJAJ) */}
          {(activeUser?.role === 'ADMIN' || activeUser?.role === 'LOAN_PARTNER') && order.paymentType === 'LOAN' && (
            <div className="card" style={{ gridColumn: '1 / -1', border: '2px solid #3b82f622', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0, color: '#2563eb' }}><Shield size={20} /> Bajaj Finance Progress</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <span className={styles.currentLoanStatus}>Current: <strong>{order.loanStage}</strong> ({order.loanSubStage})</span>
                   {loanUpdateLoading && <Loader2 className="animate-spin" size={16} />}
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                {Object.entries(LOAN_STAGES).map(([stage, subStages]: [string, any]) => (
                  <div key={stage} className={styles.loanGroup}>
                    <h4 style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                      {stage.replace(/_/g, ' ')}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {subStages.map((sub: string) => {
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
              {!isLoanPartner && (
                <button className="btn btn-primary" onClick={() => setTransitionTarget('PAYMENT')}>
                  <CreditCard size={14} style={{ marginRight: '6px' }} />
                  Add Installment
                </button>
              )}
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

          {!isLoanPartner && (
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
          )}

          {/* DOCUMENTATION SECTION */}
          <div className="card" style={{ gridColumn: '1 / -1', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: '#ecfdf5', color: '#059669', borderRadius: '10px' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className={styles.sectionTitle} style={{ margin: 0, fontSize: '18px' }}>Project Documentation</h2>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Technical reports, site photos, and legal IDs</p>
                </div>
              </div>
              {!isLoanPartner && (
                <button className="btn btn-secondary" style={{ borderRadius: '10px', padding: '8px 16px' }} onClick={() => alert("Secure Upload: Integration coming in next patch.")}>
                   <Upload size={14} style={{ marginRight: '8px' }} />
                   Upload New
                </button>
              )}
            </div>
            
            {order.documents && order.documents.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {order.documents.map((doc: any) => (
                  <div key={doc.id} className="doc-card" style={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '16px', 
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    background: '#fff',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'default'
                  }}>
                    <div style={{ 
                      height: '120px', 
                      background: '#f8fafc', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      overflow: 'hidden',
                      position: 'relative',
                      border: '1px solid #f1f5f9'
                    }}>
                      {doc.fileUrl.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                        <img src={doc.fileUrl} alt={doc.documentType} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                          <FileText size={40} strokeWidth={1.5} />
                          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>{doc.fileUrl.split('.').pop()}</span>
                        </div>
                      )}
                      <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(255,255,255,0.9)', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, color: '#475569', backdropFilter: 'blur(4px)', border: '1px solid rgba(0,0,0,0.05)' }}>
                        {doc.documentType.split('_')[0]}
                      </div>
                    </div>
                    <div style={{ padding: '0 4px' }}>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.documentType.replace(/_/g, ' ')}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={12} /> Verified • {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <a 
                      href={doc.fileUrl} 
                      download 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-secondary" 
                      style={{ 
                        marginTop: '4px',
                        padding: '10px', 
                        fontSize: '13px', 
                        justifyContent: 'center',
                        borderRadius: '10px',
                        background: '#f1f5f9',
                        border: 'none',
                        color: '#475569',
                        fontWeight: 600
                      }}
                    >
                      <Download size={14} style={{ marginRight: '8px' }} />
                      Download File
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px', 
                background: 'linear-gradient(to bottom, #f8fafc, #fff)', 
                borderRadius: '16px', 
                border: '2px dashed #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <div style={{ width: '64px', height: '64px', background: '#f1f5f9', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#94a3b8' }}>
                  <FileText size={32} strokeWidth={1.5} />
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#1e293b' }}>No documents available</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b', maxWidth: '300px' }}>Upload technical reports or site photos to start processing this project.</p>
              </div>
            )}
          </div>

          {/* ADMIN ONLY AUDIT LOG */}
          {order.auditLogs && activeUser?.role === 'ADMIN' && (
            <div className="card" style={{ gridColumn: '1 / -1', background: '#fffafa', border: '1px solid #fee2e2', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #fee2e2', paddingBottom: '16px' }}>
                <div style={{ padding: '8px', background: '#fee2e2', color: '#dc2626', borderRadius: '10px' }}>
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className={styles.sectionTitle} style={{ margin: 0, color: '#991b1b', fontSize: '18px' }}>Security Audit Trail</h2>
                  <p style={{ margin: 0, fontSize: '12px', color: '#b91c1c', opacity: 0.8 }}>Confidential internal action logs</p>
                </div>
              </div>
              <div className={styles.timeline} style={{ paddingLeft: '8px' }}>
                {order.auditLogs.length > 0 ? (
                  order.auditLogs.map((log: any) => (
                    <div key={log.id} className={styles.timelineItem} style={{ marginBottom: '24px', position: 'relative' }}>
                      <div className={styles.timelineBadge} style={{ backgroundColor: '#dc2626', width: '10px', height: '10px', left: '-5px', border: '2px solid #fff' }}></div>
                      <div className={styles.timelineContent} style={{ padding: '16px', background: '#fff', border: '1px solid #fee2e2', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div className={styles.timelineHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <strong style={{ color: '#1e293b', fontSize: '14px' }}>{log.action}</strong>
                          <span className={styles.timelineDate} style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p style={{ color: '#475569', fontSize: '13px', margin: '0 0 12px' }}>{log.details}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                          <div style={{ width: '20px', height: '20px', background: '#f1f5f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 800 }}>{log.userName.charAt(0)}</div>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>{log.userName}</span>
                          <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', textTransform: 'uppercase' }}>{log.userRole}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No security logs found.</p>
                )}
              </div>
            </div>
          )}

          <div className="card" style={{ gridColumn: '1 / -1', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
               <div style={{ padding: '8px', background: '#f1f5f9', color: '#475569', borderRadius: '10px' }}>
                  <ClipboardList size={20} />
                </div>
                <h2 className={styles.sectionTitle} style={{ margin: 0, fontSize: '18px' }}>Project Activity Timeline</h2>
            </div>
            <div className={styles.timeline} style={{ paddingLeft: '8px' }}>
              {order.stageTrackings?.length > 0 ? (
                order.stageTrackings.map((log: any) => (
                  <div key={log.id} className={styles.timelineItem} style={{ marginBottom: '20px' }}>
                    <div className={styles.timelineBadge} style={{ width: '8px', height: '8px', left: '-4px', background: '#3b82f6' }}></div>
                    <div className={styles.timelineContent} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                      <div className={styles.timelineHeader} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '14px', color: '#1e293b' }}>{log.stage.replace(/_/g, ' ')}</strong>
                        <span className={styles.timelineDate} style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {new Date(log.updatedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className={styles.timelineSubStage} style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px' }}>{log.subStage || 'Status Update'}</p>
                      <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={10} /> Updated by: <span style={{ fontWeight: 700, color: '#64748b' }}>{log.updatedBy?.name || 'System'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No project activities recorded.</p>
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
