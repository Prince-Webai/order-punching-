"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';
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
    // Fetch mock users for the dropdown
    fetch('/api/users/mock')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const salespersons = data.users.filter((u: any) => u.role === 'SALESPERSON');
          setAvailableUsers(salespersons);
          // Set default to first salesperson or from cookie
          const cookieMatch = document.cookie.match(/(?:^|;\s*)mock_user_id=([^;]*)/);
          const activeUserId = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
          if (activeUserId) {
            setFormData(prev => ({ ...prev, salespersonId: activeUserId }));
          } else if (salespersons.length > 0) {
            setFormData(prev => ({ ...prev, salespersonId: salespersons[0].id }));
          }
        }
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.salespersonId) newErrors.salespersonId = 'Salesperson is required';
    if (!formData.clientName) newErrors.clientName = 'Client Name is required';
    if (!formData.mobileNumber) newErrors.mobileNumber = 'Mobile Number is required';
    if (!formData.systemSizeKw) newErrors.systemSizeKw = 'System Size is required';
    if (!formData.quotationAmount) newErrors.quotationAmount = 'Quotation Amount is required';
    
    // Strict Validation Logic
    if (formData.paymentType === 'FULL_PAYMENT') {
      const amount = parseFloat(formData.paymentAmountCollected);
      if (isNaN(amount) || amount < 5000) {
        newErrors.paymentAmountCollected = 'Minimum ₹5000 required for Full Payment';
      }
    } else if (formData.paymentType === 'LOAN') {
      if (!formData.loanType) {
        newErrors.loanType = 'Please select a Loan Type';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await res.json();
        
        if (res.ok) {
          alert('Order created successfully!');
          router.push('/dashboard/pipeline');
        } else {
          alert(data.error || 'Failed to create order');
        }
      } catch (error) {
        alert('Server error. Database might not be connected.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <Link href="/dashboard" className="btn btn-secondary">
          <ArrowLeft size={16} style={{ marginRight: '8px' }} />
          Back to Pipeline
        </Link>
        <h1 className="page-title" style={{ margin: 0 }}>Create New Order</h1>
        <button onClick={handleSubmit} className="btn btn-primary" disabled={isSubmitting}>
          <CheckCircle size={16} style={{ marginRight: '8px' }} />
          {isSubmitting ? 'Submitting...' : 'Submit Order'}
        </button>
      </div>

      <div className={styles.content}>
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          {/* Basic Details */}
          <div className="card">
            <h2 className={styles.sectionTitle}>Basic Details</h2>
            
            <div className="input-group">
              <label className="input-label">Salesperson</label>
              <select 
                className="input-field" 
                name="salespersonId"
                value={formData.salespersonId}
                onChange={handleInputChange}
              >
                <option value="">Select Salesperson</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
              {errors.salespersonId && <span className={styles.errorText}>{errors.salespersonId}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Client Name</label>
              <input 
                type="text" 
                className="input-field" 
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                placeholder="John Doe"
              />
              {errors.clientName && <span className={styles.errorText}>{errors.clientName}</span>}
            </div>

            <div className={styles.row}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Mobile Number</label>
                <input 
                  type="tel" 
                  className="input-field" 
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                />
                {errors.mobileNumber && <span className={styles.errorText}>{errors.mobileNumber}</span>}
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Email ID (Optional)</label>
                <input 
                  type="email" 
                  className="input-field" 
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Proposed System Size (kW)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  name="systemSizeKw"
                  value={formData.systemSizeKw}
                  onChange={handleInputChange}
                  placeholder="5"
                />
                {errors.systemSizeKw && <span className={styles.errorText}>{errors.systemSizeKw}</span>}
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Quotation Amount (₹)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  name="quotationAmount"
                  value={formData.quotationAmount}
                  onChange={handleInputChange}
                  placeholder="300000"
                />
                {errors.quotationAmount && <span className={styles.errorText}>{errors.quotationAmount}</span>}
              </div>
            </div>
          </div>

          {/* Payment Section (STRICT LOGIC) */}
          <div className="card">
            <h2 className={styles.sectionTitle}>Payment Details</h2>
            <p className={styles.sectionDesc}>This will determine the initial pipeline stage.</p>
            
            <div className="input-group">
              <label className="input-label">Payment Type</label>
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="paymentType" 
                    value="FULL_PAYMENT" 
                    checked={formData.paymentType === 'FULL_PAYMENT'}
                    onChange={handleInputChange}
                  />
                  Full Payment
                </label>
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="paymentType" 
                    value="LOAN" 
                    checked={formData.paymentType === 'LOAN'}
                    onChange={handleInputChange}
                  />
                  Loan
                </label>
              </div>
            </div>

            {formData.paymentType === 'FULL_PAYMENT' && (
              <div className="input-group">
                <label className="input-label">Amount Collected (₹)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  name="paymentAmountCollected"
                  value={formData.paymentAmountCollected}
                  onChange={handleInputChange}
                  placeholder="Minimum ₹5000"
                />
                {errors.paymentAmountCollected && <span className={styles.errorText}>{errors.paymentAmountCollected}</span>}
              </div>
            )}

            {formData.paymentType === 'LOAN' && (
              <div className="input-group">
                <label className="input-label">Loan Type</label>
                <select 
                  className="input-field" 
                  name="loanType"
                  value={formData.loanType}
                  onChange={handleInputChange}
                >
                  <option value="">Select Loan Type</option>
                  <option value="BAJAJ">Bajaj Loan (NBFC)</option>
                  <option value="GOVT">Government Bank Loan</option>
                </select>
                {errors.loanType && <span className={styles.errorText}>{errors.loanType}</span>}
              </div>
            )}
          </div>

          {/* Documents Upload */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h2 className={styles.sectionTitle}>Required Documents</h2>
            
            <div className={styles.uploadGrid}>
              {['Site Survey Photos', 'Aadhar Card Front', 'Aadhar Card Back', 'Bank Card', 'Bank Passbook', 'EB Bill'].map((doc) => (
                <div key={doc} className={styles.uploadBox}>
                  <Upload size={24} className={styles.uploadIcon} />
                  <span className={styles.uploadLabel}>{doc}</span>
                  <input type="file" className={styles.fileInput} />
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
