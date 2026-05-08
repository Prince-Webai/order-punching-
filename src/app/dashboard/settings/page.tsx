"use client";

import { User, Mail, Shield, Building2, MapPin, Hash, Save } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import styles from './settings.module.css';

export default function SettingsPage() {
  const { activeUser } = useAuth();

  return (
    <div className={styles.container + " fade-in"}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <div style={{ padding: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', borderRadius: '14px', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)' }}>
            <User size={24} />
          </div>
          <h1>Profile & Organization</h1>
        </div>
        <p className={styles.headerDesc}>Manage your personal credentials and enterprise company profile.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* User Information Section */}
        <div className="card" style={{ padding: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
            <div style={{ width: '80px', height: '80px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'white', fontSize: '32px', fontWeight: 800 }}>
              {activeUser?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>User Information</h3>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Your personal account credentials</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={14} /> FULL NAME
              </label>
              <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
                {activeUser?.name || 'Solar User'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} /> EMAIL ADDRESS
              </label>
              <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
                {activeUser?.email || 'user@tnsolarsolution.com'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={14} /> ACCOUNT ROLE
              </label>
              <div style={{ display: 'inline-flex', padding: '6px 12px', background: '#eff6ff', color: '#3b82f6', borderRadius: '8px', fontSize: '12px', fontWeight: 800, width: 'fit-content', textTransform: 'uppercase' }}>
                {activeUser?.role || 'Guest'}
              </div>
            </div>
          </div>
        </div>

        {/* Company Information Section */}
        <div className="card" style={{ padding: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
            <div style={{ width: '80px', height: '80px', background: 'hsla(161, 94%, 30%, 0.1)', color: '#10b981', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={40} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>Organization Details</h3>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Business identity and tax information</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={14} /> COMPANY NAME
              </label>
              <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
                TN Solar Solution Pvt Ltd
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Hash size={14} /> GSTIN NUMBER
              </label>
              <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
                33AAACT1234A1Z5
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} /> REGISTERED OFFICE
              </label>
              <div style={{ padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>
                123 Solar Heights, Energy Park,<br />
                Coimbatore, Tamil Nadu - 641001
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
        <button className="btn btn-primary" style={{ padding: '12px 24px', borderRadius: '12px' }}>
          <Save size={18} style={{ marginRight: '8px' }} /> Update Profile Settings
        </button>
      </div>
    </div>
  );
}
