import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Eye } from 'lucide-react';
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
      } else {
        alert("Failed to update stage");
      }
    } catch(e) {
      alert("Error updating stage");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className={styles.tableContainer}>
      <div className={styles.header}>
        <div>
          <h2 className="page-title" style={{ marginBottom: '4px' }}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search clients or mobile..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '40px', padding: '16px 12px' }}><input type="checkbox" className={styles.checkbox} /></th>
              <th>Order ID</th>
              <th>Client Details</th>
              <th>System Size</th>
              <th>Value</th>
              <th>Stage</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className={styles.emptyState}>Loading data...</td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyState}>No orders found.</td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} className={styles.tableRow}>
                  <td style={{ padding: '16px 12px' }}><input type="checkbox" className={styles.checkbox} /></td>
                  <td className={styles.idCell}>#{order.id.slice(0, 6).toUpperCase()}</td>
                  <td>
                    <div className={styles.clientCell}>
                      <div className={styles.avatar}>
                        {order.clientName.charAt(0)}
                      </div>
                      <div>
                        <div className={styles.clientName}>{order.clientName}</div>
                        <div className={styles.clientPhone}>{order.mobileNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td>{order.systemSizeKw} kW</td>
                  <td className={styles.valueCell}>₹{order.quotationAmount.toLocaleString()}</td>
                  <td>
                    <div className={`${styles.badge} ${styles['badge-' + order.currentStage.toLowerCase()]}`}>
                      <select 
                        value={order.currentStage}
                        onChange={(e) => handleStageChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                        className={styles.stageSelect}
                      >
                        <option value="ORDER">Order</option>
                        <option value="PAYMENT">Payment</option>
                        <option value="MATERIAL_SHIPMENT">Shipment</option>
                        <option value="INSTALLATION">Installation</option>
                        <option value="PROJECT_COMPLETION">Completion</option>
                        <option value="EB_NET_METER">EB / Net Meter</option>
                      </select>
                    </div>
                  </td>
                  <td className={styles.dateCell}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className={styles.rowActions}>
                      <Link href={`/dashboard/orders/${order.id}`} className={styles.actionBtn}>
                        <Eye size={16} />
                        <span>View</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
