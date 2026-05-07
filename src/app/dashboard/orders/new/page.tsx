"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, CheckCircle, User, Zap, CreditCard, FileText } from 'lucide-react';
import Link from 'next/link';
import styles from './new-order.module.css';

export default function NewOrderPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [leadSource, setLeadSource] = useState<'NEW' | 'EXISTING'>('NEW');
  const [searchQuery, setSearchQuery] = useState('');
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch leads for existing lead selection
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const uniqueLeads = Array.from(new Map(data.orders.map((o: any) => [o.mobileNumber, o])).values());
          setLeads(uniqueLeads);
        }
      });

    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const salespersons = data.users.filter((u: any) => u.role === 'SALESPERSON');
          setAvailableUsers(salespersons);
        }
      });
  }, []);

  const handleLeadSelect = (lead: any) => {
    setFormData({
      ...formData,
      clientName: lead.clientName,
      mobileNumber: lead.mobileNumber,
      emailId: lead.emailId
    });
    setLeadSource('NEW');
  };

  const filteredLeads = leads.filter(l => 
    l.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.mobileNumber.includes(searchQuery)
  );

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

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
        const data = await res.json();
        alert(data.error || 'Failed to save order');
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
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className={styles.sectionTitle} style={{ margin: 0 }}><User size={20} /> Client Information</h2>
              <div className={styles.toggle}>
                <button 
                  className={leadSource === 'NEW' ? styles.activeToggle : ''} 
                  onClick={() => setLeadSource('NEW')}
                >New</button>
                <button 
                  className={leadSource === 'EXISTING' ? styles.activeToggle : ''} 
                  onClick={() => setLeadSource('EXISTING')}
                >Existing</button>
              </div>
            </div>

            {leadSource === 'EXISTING' ? (
              <div className={styles.leadSearch}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Search by name or phone..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className={styles.leadResults}>
                  {filteredLeads.map(lead => (
                    <div key={lead.id} className={styles.leadItem} onClick={() => handleLeadSelect(lead)}>
                      <strong>{lead.clientName}</strong>
                      <span>{lead.mobileNumber}</span>
                    </div>
                  ))}
                  {filteredLeads.length === 0 && <p className={styles.noResults}>No leads found.</p>}
                </div>
              </div>
            ) : (
              <>
                <div className="input-group">
                  <label className="input-label">Assigned Salesperson</label>
                  <select className="input-field" name="salespersonId" value={formData.salespersonId} onChange={handleInputChange}>
                    <option value="">Select from team</option>
                    {availableUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Customer Name</label>
                  <input className="input-field" name="clientName" placeholder="Enter full name" value={formData.clientName} onChange={handleInputChange} />
                </div>
                <div className={styles.row}>
                  <div className="input-group">
                    <label className="input-label">Phone</label>
                    <input className="input-field" name="mobileNumber" placeholder="9876543210" value={formData.mobileNumber} onChange={handleInputChange} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email</label>
                    <input className="input-field" name="emailId" placeholder="client@email.com" value={formData.emailId} onChange={handleInputChange} />
                  </div>
                </div>
              </>
            )}
          </div>

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
          <div className="card">
            <h2 className={styles.sectionTitle}><CreditCard size={20} /> Payment Method</h2>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <CreditCard size={24} />
                <input type="radio" name="paymentType" value="FULL_PAYMENT" checked={formData.paymentType === 'FULL_PAYMENT'} onChange={handleInputChange} />
                Full Payment
              </label>
              <label className={styles.radioLabel}>
                <Zap size={24} />
                <input type="radio" name="paymentType" value="LOAN" checked={formData.paymentType === 'LOAN'} onChange={handleInputChange} />
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

          <section className="card" style={{ gridColumn: '1 / -1' }}>
            <h2 className={styles.sectionTitle}><FileText size={20} /> Required Documentation</h2>
            <div className={styles.uploadGrid}>
              {[
                { id: 'site_survey', label: 'Site Survey Photos' },
                { id: 'aadhar_front', label: 'Aadhar Card Front' },
                { id: 'aadhar_back', label: 'Aadhar Card Back' },
                { id: 'pan_card', label: 'PAN Card' },
                { id: 'bank_card', label: 'Bank Card' },
                { id: 'bank_passbook', label: 'Bank Passbook' },
                { id: 'eb_bill', label: 'Latest EB Bill' },
                { id: 'invoice', label: 'Invoice' },
                { id: 'payment_receipt', label: 'Payment Receipt' },
                { id: 'solar_plant', label: 'Solar Plant Photo' },
                { id: 'work_completion', label: 'Work Completion Report' }
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
