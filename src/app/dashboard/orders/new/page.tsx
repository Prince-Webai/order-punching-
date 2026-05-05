"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, CheckCircle, User, Zap, CreditCard, FileText } from 'lucide-react';
import Link from 'next/link';
import styles from './new-order.module.css';

export default function NewOrderPage() {
  const router = useRouter();
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    salespersonId: '',
    clientName: '',
    mobileNumber: '',
    emailId: '',
    systemSizeKw: '',
    quotationAmount: '',
    paymentType: '',
    loanType: '',
    paymentAmountCollected: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/users/mock')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const salespersons = data.users.filter((u: any) => u.role === 'SALESPERSON');
          setAvailableUsers(salespersons);
          const cookieMatch = document.cookie.match(/(?:^|;\s*)mock_user_id=([^;]*)/);
          const activeUserId = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
          if (activeUserId) {
            setFormData(prev => ({ ...prev, salespersonId: activeUserId }));
          }
        }
      });
  }, []);

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        router.push('/dashboard');
      } else {
        alert('Failed to save order');
      }
    } catch (error) {
      alert('Error saving order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${styles.pageContainer} fade-in`}>
      <header className={styles.header}>
        <div>
          <Link href="/dashboard" className={styles.breadcrumb}>
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <h1 className="page-title">Punch New Order</h1>
        </div>
        <button onClick={handleSubmit} className="btn btn-primary" disabled={isSubmitting}>
          <CheckCircle size={18} style={{ marginRight: '8px' }} />
          {isSubmitting ? 'Processing...' : 'Publish Order'}
        </button>
      </header>

      <main className={styles.formGrid}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* CARD 1: CUSTOMER INFO */}
          <div className="card">
            <h2 className={styles.sectionTitle}><User size={20} /> Client Information</h2>
            <div className="input-group">
              <label className="input-label">Assigned Salesperson</label>
              <select className="input-field" name="salespersonId" value={formData.salespersonId} onChange={handleInputChange}>
                <option value="">Select from team</option>
                {availableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Customer Name</label>
              <input className="input-field" name="clientName" placeholder="Enter full name" onChange={handleInputChange} />
            </div>
            <div className={styles.row}>
              <div className="input-group">
                <label className="input-label">Phone</label>
                <input className="input-field" name="mobileNumber" placeholder="9876543210" onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input className="input-field" name="emailId" placeholder="client@email.com" onChange={handleInputChange} />
              </div>
            </div>
          </div>

          {/* CARD 2: CONFIGURATION */}
          <div className="card">
            <h2 className={styles.sectionTitle}><Zap size={20} /> System Configuration</h2>
            <div className={styles.row}>
              <div className="input-group">
                <label className="input-label">Size (kW)</label>
                <input type="number" className="input-field" name="systemSizeKw" placeholder="e.g. 5" onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label className="input-label">Quotation Price (₹)</label>
                <input type="number" className="input-field" name="quotationAmount" placeholder="e.g. 350000" onChange={handleInputChange} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* CARD 3: PAYMENT */}
          <div className="card">
            <h2 className={styles.sectionTitle}><CreditCard size={20} /> Payment Method</h2>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <CreditCard size={24} />
                <input type="radio" name="paymentType" value="FULL_PAYMENT" onChange={handleInputChange} />
                Full Payment
              </label>
              <label className={styles.radioLabel}>
                <Zap size={24} />
                <input type="radio" name="paymentType" value="LOAN" onChange={handleInputChange} />
                Finance / Loan
              </label>
            </div>

            {formData.paymentType && (
              <div className="input-group" style={{ marginTop: '24px' }}>
                <label className="input-label">
                  {formData.paymentType === 'FULL_PAYMENT' ? 'Booking Amount' : 'Finance Partner'}
                </label>
                {formData.paymentType === 'FULL_PAYMENT' ? (
                  <input type="number" className="input-field" name="paymentAmountCollected" placeholder="Min ₹5000" onChange={handleInputChange} />
                ) : (
                  <select className="input-field" name="loanType" onChange={handleInputChange}>
                    <option value="">Select Partner</option>
                    <option value="BAJAJ">Bajaj Finance</option>
                    <option value="GOVT">Govt Bank</option>
                  </select>
                )}
              </div>
            )}
          </div>

          {/* SECTION: DOCUMENTS */}
        <section className="card" style={{ gridColumn: '1 / -1' }}>
          <h2 className={styles.sectionTitle}><FileText size={20} /> Required Documentation</h2>
          <div className={styles.uploadGrid}>
            {[
              { id: 'site_survey', label: 'Site Survey Photos' },
              { id: 'aadhar_front', label: 'Aadhar Card Front' },
              { id: 'aadhar_back', label: 'Aadhar Card Back' },
              { id: 'bank_card', label: 'Bank Card' },
              { id: 'bank_passbook', label: 'Bank Passbook' },
              { id: 'eb_bill', label: 'Latest EB Bill' }
            ].map(doc => (
              <div 
                key={doc.id} 
                className={styles.uploadBox}
                onClick={() => document.getElementById(`file-${doc.id}`)?.click()}
              >
                <input 
                  type="file" 
                  id={`file-${doc.id}`} 
                  className={styles.fileInput} 
                  style={{ display: 'none' }} 
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      const label = e.target.parentElement?.querySelector(`.${styles.uploadLabel}`);
                      if (label) label.textContent = 'Selected ✓';
                      e.target.parentElement?.classList.add(styles.uploaded);
                    }
                  }}
                />
                <Upload size={20} color="#94a3b8" className={styles.uploadIcon} />
                <span className={styles.uploadLabel}>{doc.label}</span>
              </div>
            ))}
          </div>
        </section>
        </div>
      </main>
    </div>
  );
}
