"use client";

import { useEffect, useState } from 'react';
import { ClipboardList, Plus, Trash2, Save, Loader2, User, Package, IndianRupee, Search, X, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import styles from './bom.module.css';

interface BOMItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

export default function BOMPage() {
  const { activeUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [items, setItems] = useState<BOMItem[]>([{ productName: '', quantity: 1, unitPrice: 0 }]);
  const [batchName, setBatchName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.orders);
        }
        setLoading(false);
      });
  }, []);

  const filteredOrders = orders.filter((o: any) => 
    o.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.id.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 10);

  const toggleOrder = (orderId: string) => {
    if (selectedOrderIds.includes(orderId)) {
      setSelectedOrderIds(selectedOrderIds.filter(id => id !== orderId));
    } else {
      setSelectedOrderIds([...selectedOrderIds, orderId]);
      setSearchQuery('');
    }
  };

  const selectedLeads = orders.filter((o: any) => selectedOrderIds.includes(o.id));

  const addItem = () => {
    setItems([...items, { productName: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof BOMItem, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  const handleSave = async () => {
    if (selectedOrderIds.length === 0) return alert("Please select at least one lead/customer");
    setSaving(true);
    try {
      const res = await fetch('/api/bom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: selectedOrderIds, items, batchName })
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        setSelectedOrderIds([]);
        setItems([{ productName: '', quantity: 1, unitPrice: 0 }]);
        setBatchName('');
      }
    } catch (e) {
      alert("Failed to save BOM");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin inline mr-2" /> Loading...</div>;

  return (
    <div className="fade-in" style={{ padding: '24px' }}>
      <header style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ padding: '8px', background: '#eff6ff', color: '#3b82f6', borderRadius: '12px' }}>
            <ClipboardList size={24} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e293b', margin: 0 }}>Consolidated Shipment & BOM</h1>
        </div>
        <p style={{ color: '#64748b', margin: 0 }}>Group multiple leads into a single procurement batch</p>
      </header>

      <div className={styles.grid}>
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div style={{ marginBottom: '24px' }}>
             <h2 className={styles.sectionTitle}><Package size={18} /> Batch Name / Identifier</h2>
             <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. Truck #45 - Pune Route" 
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
             />
          </div>

          <h2 className={styles.sectionTitle}><User size={18} /> Step 1: Search & Add Leads</h2>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input 
              type="text" 
              placeholder="Search by client name or ID..." 
              className="input-field"
              style={{ paddingLeft: '40px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            {searchQuery && (
              <div className={styles.searchResults}>
                {filteredOrders.map((o: any) => (
                  <div key={o.id} className={styles.searchItem} onClick={() => toggleOrder(o.id)}>
                    <div>
                      <strong>{o.clientName}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px' }}>{o.systemSizeKw}kW • {o.currentStage}</span>
                    </div>
                    <Plus size={14} color="#3b82f6" />
                  </div>
                ))}
                {filteredOrders.length === 0 && <div className="p-3 text-center text-gray-400">No leads found.</div>}
              </div>
            )}
          </div>

          {selectedLeads.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>
                Selected Leads ({selectedLeads.length})
              </p>
              <div className={styles.selectedContainer}>
                {selectedLeads.map((o: any) => (
                  <div key={o.id} className={styles.selectedLead}>
                    <div className={styles.leadInfo}>
                      <strong>{o.clientName}</strong>
                      <span>{o.systemSizeKw}kW</span>
                    </div>
                    <button onClick={() => toggleOrder(o.id)} className={styles.removeBtn}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h2 className={styles.sectionTitle}><Package size={18} /> Step 2: Add Products & Quantities</h2>
          <div className={styles.itemGrid}>
            <div className={styles.gridHeader}>
              <span>Product Name</span>
              <span>Quantity</span>
              <span>Unit Price (₹)</span>
              <span>Total</span>
              <span></span>
            </div>
            {items.map((item, index) => (
              <div key={index} className={styles.gridRow}>
                <input 
                  type="text" 
                  placeholder="e.g. Adani 540Wp Panel" 
                  className="input-field"
                  value={item.productName}
                  onChange={(e) => updateItem(index, 'productName', e.target.value)}
                />
                <input 
                  type="number" 
                  className="input-field"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                />
                <input 
                  type="number" 
                  className="input-field"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                />
                <div className={styles.rowTotal}>
                  ₹{(item.quantity * item.unitPrice).toLocaleString()}
                </div>
                <button onClick={() => removeItem(index)} className={styles.deleteBtn}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <button className="btn btn-secondary" onClick={addItem} style={{ marginTop: '16px' }}>
            <Plus size={16} style={{ marginRight: '8px' }} />
            Add Item
          </button>
        </div>

        <div className="card">
          <h2 className={styles.sectionTitle}><IndianRupee size={18} /> Procurement Summary</h2>
          <div className={styles.summaryBox}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{totalCost.toLocaleString()}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Estimated Tax (Gst)</span>
              <span>₹{(totalCost * 0.12).toLocaleString()}</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total Cost</span>
              <span>₹{(totalCost * 1.12).toLocaleString()}</span>
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '24px', height: '48px', fontSize: '16px' }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="animate-spin" /> : success ? <CheckCircle /> : <Save style={{ marginRight: '8px' }} />}
            {success ? 'Allocated Successfully!' : 'Allocate Materials to Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}
