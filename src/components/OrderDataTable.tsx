import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Eye, Filter, MoreHorizontal, Download, Loader2, AlertCircle } from 'lucide-react';
import { TransitionModal } from './TransitionModal';
import { useAuth } from '@/lib/AuthContext';
import styles from './OrderDataTable.module.css';

interface Order {
  id: string;
  clientName: string;
  mobileNumber: string;
  systemSizeKw: number;
  quotationAmount: number;
  currentStage: string;
  totalPaidAmount: number;
  paymentType?: string;
  loanStage?: string;
  loanSubStage?: string;
  createdAt: string;
}

interface OrderDataTableProps {
  orders: Order[];
  loading: boolean;
  title: string;
  subtitle?: string;
  userRole?: string;
  onUpdateStage?: (orderId: string, newStage: string) => void;
  onUpdateLoanStage?: (orderId: string, loanStage: string, loanSubStage: string) => void;
}

const STAGE_LABELS: Record<string, string> = {
  'ORDER': 'Order Placed',
  'PAYMENT': 'Payment Pending',
  'MATERIAL_SHIPMENT': 'In Transit',
  'INSTALLATION': 'Installation',
  'PROJECT_COMPLETION': 'Completed',
  'EB_NET_METER': 'EB/Net Metering'
};

const STAGE_ORDER = ['ORDER', 'PAYMENT', 'MATERIAL_SHIPMENT', 'INSTALLATION', 'PROJECT_COMPLETION', 'EB_NET_METER'];

const LOAN_STAGES: Record<string, { label: string; subStages: string[] }> = {
  'PRE_SALES': {
    label: 'Pre-sales',
    subStages: ['Waiting for Bank Approval', 'Eligibility came', 'Case Rejected', 'Waiting for customer response']
  },
  'PRE_DISBURSAL': {
    label: 'Pre Disbursal',
    subStages: ['Waiting for scheme confirmation', 'Scheme sent to customer and Dealer', 'Scheme selected']
  },
  'PRE_OPS': {
    label: 'Pre OPS',
    subStages: ['Case sent to HO']
  },
  'LINE_CREATION': {
    label: 'Line Creation',
    subStages: ['Case still not come to line creation', 'Case come to line creation']
  },
  'ASSET_SOLO': {
    label: 'Asset solo',
    subStages: ['Bank process going on', 'Customer link not completed', 'Customer link completed']
  },
  'DISPATCH': {
    label: 'Dispatch',
    subStages: ['Not Done', 'Done']
  }
};

export function OrderDataTable({ orders, loading, title, subtitle, userRole, onUpdateStage, onUpdateLoanStage }: OrderDataTableProps) {
  const { activeUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Transition Modal State
  const [transitionTarget, setTransitionTarget] = useState<{order: any, stage: string} | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => 
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.mobileNumber.includes(searchTerm)
    );
  }, [orders, searchTerm]);

  const isLoanPartner = userRole === 'LOAN_PARTNER';

  const columns = [
    { header: 'Client', key: 'clientName' },
    { header: 'Phone', key: 'mobileNumber' },
    { header: 'System', key: 'systemSizeKw', render: (val: any) => `${val} kW` },
    { 
      header: isLoanPartner ? 'Loan Stage' : 'Project Stage', 
      key: isLoanPartner ? 'loanStage' : 'currentStage',
      render: (val: string, order: any) => (
        <div className={styles.stageCell}>
          <span className={`badge ${isLoanPartner ? 'badge-info' : 'badge-primary'}`}>
            {(val || 'PENDING').replace(/_/g, ' ')}
          </span>
          {isLoanPartner && order.loanSubStage && (
            <span className={styles.subStageLabel}>{order.loanSubStage}</span>
          )}
        </div>
      )
    },
    { header: 'Quotation', key: 'quotationAmount', render: (val: any) => `₹${val?.toLocaleString()}` },
  ];

  const handleStageChange = (order: any, newStage: string) => {
    // If loan partner, we don't enforce project forward-only for them
    if (!isLoanPartner) {
      const STAGES = ['ORDER', 'PAYMENT', 'MATERIAL_SHIPMENT', 'INSTALLATION', 'PROJECT_COMPLETION', 'EB_NET_METER'];
      const currentIndex = STAGES.indexOf(order.currentStage);
      const newIndex = STAGES.indexOf(newStage);

      if (newIndex < currentIndex) {
        alert("Workflow is forward-only. You cannot move a project back to a previous stage.");
        return;
      }
    }

    setTransitionTarget({ order, stage: newStage });
  };

  const handleLoanStageChange = async (orderId: string, loanStage: string, loanSubStage: string) => {
    // If it's a rejection, ask for a reason
    let reason = '';
    if (loanSubStage === 'Case Rejected') {
      reason = prompt('Please enter the reason for rejection:') || 'No reason provided';
    }

    // OPTIMISTIC UPDATE: Update UI immediately
    if (onUpdateLoanStage) onUpdateLoanStage(orderId, loanStage, loanSubStage);
    
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          loanStage, 
          loanSubStage,
          rejectionReason: reason 
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        alert("Server Error: " + (errorData.error || "Failed to update loan status"));
      }
    } catch(e: any) {
      alert("Network Error: Could not reach the server.");
      console.error("Error updating loan stage:", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const showLoanStatus = activeUser?.role === 'ADMIN' || activeUser?.role === 'PROJECT_MANAGER' || activeUser?.role === 'LOAN_PARTNER';

  return (
    <div className={`${styles.tableCard} card fade-in`}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        
        <div className={styles.controls}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className={styles.iconBtn}><Filter size={18} /></button>
          <button className={styles.iconBtn}><Download size={18} /></button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkCol}><input type="checkbox" className={styles.checkbox} /></th>
              <th>LEAD NAME</th>
              <th>PROJECT STAGE</th>
              {showLoanStatus && <th>LOAN STATUS</th>}
              <th>CAPACITY</th>
              <th>VALUE</th>
              <th>DATE</th>
              <th className={styles.actionCol}></th>
            </tr>
          </thead>
          <tbody>
            {!loading && filteredOrders.map(order => (
              <tr key={order.id} className={styles.tableRow}>
                <td className={styles.checkCol}><input type="checkbox" className={styles.checkbox} /></td>
                <td>
                  <div className={styles.clientCell}>
                    <div className={styles.avatar} style={{ 
                      background: 'var(--primary)',
                      color: '#000'
                    }}>
                      {order.clientName.charAt(0)}
                    </div>
                    <div className={styles.clientInfo}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Link href={`/dashboard/orders/${order.id}`} className={styles.clientName}>
                          {order.clientName}
                        </Link>
                        {order.systemSizeKw >= 50 && (
                          <span style={{ fontSize: '10px', background: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            HIGH VALUE
                          </span>
                        )}
                      </div>
                      <span className={styles.clientMeta}>{order.mobileNumber}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={`${styles.stageBadge} ${styles['badge-' + order.currentStage.toLowerCase()]}`}>
                    <select 
                      value={order.currentStage}
                      onChange={(e) => handleStageChange(order, e.target.value)}
                      disabled={updatingId === order.id || isLoanPartner}
                      className={styles.stageSelect}
                    >
                      {Object.entries(STAGE_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                </td>
                {showLoanStatus && (
                  <td>
                    <div className={styles.loanStageArea}>
                      <select 
                        value={order.loanStage || 'PRE_SALES'}
                        onChange={(e) => handleLoanStageChange(order.id, e.target.value, LOAN_STAGES[e.target.value].subStages[0])}
                        className={styles.loanSelect}
                      >
                        {Object.entries(LOAN_STAGES).map(([val, { label }]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <select 
                          value={order.loanSubStage || ''}
                          onChange={(e) => handleLoanStageChange(order.id, order.loanStage || 'PRE_SALES', e.target.value)}
                          className={styles.loanSubSelect}
                        >
                          {LOAN_STAGES[order.loanStage || 'PRE_SALES']?.subStages.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                        {order.loanSubStage === 'Case Rejected' && order.rejectionReason && (
                          <div title={`Reason: ${order.rejectionReason}`} style={{ cursor: 'help', color: '#ef4444' }}>
                            <AlertCircle size={16} />
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                )}
                <td className={styles.monoCell}>{order.systemSizeKw} kW</td>
                <td className={styles.valueCell}>₹{order.quotationAmount.toLocaleString()}</td>
                <td className={styles.dateCell}>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className={styles.actionCol}>
                  <div className={styles.rowActions}>
                    <Link href={`/dashboard/orders/${order.id}`} className={styles.viewBtn}>
                      View
                    </Link>
                    <button className={styles.moreBtn}><MoreHorizontal size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transitionTarget && (
        <TransitionModal 
          isOpen={true}
          order={transitionTarget.order}
          targetStage={transitionTarget.stage}
          onClose={() => setTransitionTarget(null)}
          onSuccess={(updatedOrder) => {
            setTransitionTarget(null);
            if (onUpdateStage && updatedOrder) {
              onUpdateStage(updatedOrder.id, updatedOrder);
            }
          }}
        />
      )}
    </div>
  );
}
