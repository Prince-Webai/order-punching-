import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Eye, Filter, MoreHorizontal, Download } from 'lucide-react';
import styles from './OrderDataTable.module.css';

interface Order {
  id: string;
  clientName: string;
  mobileNumber: string;
  systemSizeKw: number;
  quotationAmount: number;
  currentStage: string;
  paymentType?: string;
  createdAt: string;
}

interface OrderDataTableProps {
  orders: Order[];
  loading: boolean;
  title: string;
  subtitle?: string;
  onUpdateStage?: (orderId: string, newStage: string) => void;
}

const STAGE_LABELS: Record<string, string> = {
  'ORDER': 'Order Placed',
  'PAYMENT': 'Payment Pending',
  'MATERIAL_SHIPMENT': 'In Transit',
  'INSTALLATION': 'Installation',
  'PROJECT_COMPLETION': 'Completed',
  'EB_NET_METER': 'EB/Net Metering'
};

export function OrderDataTable({ orders, loading, title, subtitle, onUpdateStage }: OrderDataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => 
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.mobileNumber.includes(searchTerm)
    );
  }, [orders, searchTerm]);

  const handleStageChange = async (orderId: string, newStage: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage })
      });
      if (res.ok) {
        if (onUpdateStage) onUpdateStage(orderId, newStage);
      }
    } catch(e) {
      console.error("Error updating stage:", e);
    } finally {
      setUpdatingId(null);
    }
  };

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
              <th>STATUS</th>
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
                      <Link href={`/dashboard/orders/${order.id}`} className={styles.clientName}>
                        {order.clientName}
                      </Link>
                      <span className={styles.clientMeta}>{order.mobileNumber}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={`${styles.stageBadge} ${styles['badge-' + order.currentStage.toLowerCase()]}`}>
                    <select 
                      value={order.currentStage}
                      onChange={(e) => handleStageChange(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className={styles.stageSelect}
                    >
                      {Object.entries(STAGE_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                </td>
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
    </div>
  );
}
