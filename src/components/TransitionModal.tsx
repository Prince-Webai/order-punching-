"use client";

import { useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import styles from './TransitionModal.module.css';

interface TransitionModalProps {
  order: any;
  targetStage: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedOrder?: any) => void;
}

export function TransitionModal({ order, targetStage, isOpen, onClose, onSuccess }: TransitionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMode: 'UPI',
    referenceNumber: '',
    paymentDate: new Date().toISOString().split('T')[0],
    proofUrl: ''
  });

  const [shipmentData, setShipmentData] = useState({
    productDetails: '',
    vehicleNumber: '',
    driverName: '',
    sentDate: new Date().toISOString().split('T')[0],
    dispatchProofUrl: ''
  });

  if (!isOpen) return null;

  const handlePaymentSubmit = async () => {
    if (!paymentData.amount || !paymentData.referenceNumber) {
      setError("Please enter amount and reference number");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });
      if (res.ok) {
        const data = await res.json();
        onSuccess(data.order);
      } else setError("Failed to save payment");
    } catch (e) {
      setError("Error saving payment");
    } finally {
      setLoading(false);
    }
  };

  const handleShipmentSubmit = async () => {
    if (!shipmentData.vehicleNumber || !shipmentData.driverName) {
      setError("Please enter vehicle and driver details");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/shipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shipmentData)
      });
      if (res.ok) {
        const data = await res.json();
        onSuccess(data.order);
      } else setError("Failed to save shipment");
    } catch (e) {
      setError("Error saving shipment");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneralTransition = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: targetStage })
      });
      if (res.ok) {
        const data = await res.json();
        onSuccess(data.order);
      } else {
        const data = await res.json();
        setError(data.error || "Transition failed");
      }
    } catch (e) {
      setError("Error transitioning stage");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (targetStage) {
      case 'PAYMENT':
        return (
          <div className={styles.form}>
            <h3>Add Payment Proof</h3>
            <div className="input-group">
              <label className="input-label">Amount (₹)</label>
              <input 
                type="number" 
                className="input-field" 
                value={paymentData.amount} 
                onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Reference / Transaction ID</label>
              <input 
                type="text" 
                className="input-field" 
                value={paymentData.referenceNumber}
                onChange={(e) => setPaymentData({...paymentData, referenceNumber: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Payment Mode</label>
              <select 
                className="input-field" 
                value={paymentData.paymentMode}
                onChange={(e) => setPaymentData({...paymentData, paymentMode: e.target.value})}
              >
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={handlePaymentSubmit} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Save Payment & Update Status'}
            </button>
          </div>
        );
      case 'MATERIAL_SHIPMENT':
        return (
          <div className={styles.form}>
            <h3>Shipment Details</h3>
            <div className="input-group">
              <label className="input-label">Vehicle Number</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. MH 12 AB 1234"
                value={shipmentData.vehicleNumber}
                onChange={(e) => setShipmentData({...shipmentData, vehicleNumber: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Driver Name</label>
              <input 
                type="text" 
                className="input-field" 
                value={shipmentData.driverName}
                onChange={(e) => setShipmentData({...shipmentData, driverName: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Product/Material Details</label>
              <textarea 
                className="input-field" 
                rows={3}
                value={shipmentData.productDetails}
                onChange={(e) => setShipmentData({...shipmentData, productDetails: e.target.value})}
              />
            </div>
            <button className="btn btn-primary" onClick={handleShipmentSubmit} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Dispatch Material'}
            </button>
          </div>
        );
      case 'EB_NET_METER':
        const isPaid = order.totalPaidAmount >= order.quotationAmount;
        const isLoan = order.paymentType !== 'FULL_PAYMENT';
        const canProceed = isPaid || isLoan;

        return (
          <div className={styles.validationView}>
            <h3>Validation: EB Net Metering</h3>
            {!canProceed ? (
              <div className={styles.errorBox}>
                <AlertCircle size={24} />
                <p>Payment Incomplete. Full payment is required for self-funded customers before processing Net Metering.</p>
                <div className={styles.balanceInfo}>
                  <span>Total Paid: ₹{order.totalPaidAmount}</span>
                  <span>Required: ₹{order.quotationAmount}</span>
                </div>
              </div>
            ) : (
              <div className={styles.successBox}>
                <CheckCircle size={24} />
                <p>{isLoan ? 'Loan Customer Verified.' : 'Payment 100% Completed.'} You can proceed to Application Processing.</p>
              </div>
            )}
            <button 
              className="btn btn-primary" 
              onClick={handleGeneralTransition} 
              disabled={loading || !canProceed}
              style={{ marginTop: '20px', width: '100%' }}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Proceed to EB Net Metering'}
            </button>
          </div>
        );
      default:
        return (
          <div className={styles.general}>
            <h3>Move to {targetStage.replace('_', ' ')}?</h3>
            <p>Are you sure you want to advance this order? This action is forward-only.</p>
            <button className="btn btn-primary" onClick={handleGeneralTransition} disabled={loading} style={{ width: '100%' }}>
              {loading ? <Loader2 className="animate-spin" /> : 'Confirm Transition'}
            </button>
          </div>
        );
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        {error && <div className={styles.errorAlert}>{error}</div>}
        {renderContent()}
      </div>
    </div>
  );
}
