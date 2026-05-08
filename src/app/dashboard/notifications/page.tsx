"use client";

import { Bell, Mail, Info, AlertTriangle, CheckCircle, Search, Filter, Trash2, Clock, Zap, Shield } from 'lucide-react';
import styles from '../settings/settings.module.css';

export default function NotificationsPage() {
  return (
    <div className={styles.container + " fade-in"}>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              <div style={{ padding: '10px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', borderRadius: '14px', boxShadow: '0 8px 16px rgba(217, 119, 6, 0.2)' }}>
                <Bell size={24} />
              </div>
              <h1>Smart Inbox</h1>
            </div>
            <p className={styles.headerDesc}>Real-time oversight of project milestones and security events.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" style={{ borderRadius: '12px' }}>
              <Trash2 size={16} style={{ marginRight: '8px' }} /> Clear All
            </button>
            <button className="btn btn-primary" style={{ borderRadius: '12px' }}>
              <Filter size={16} style={{ marginRight: '8px' }} /> Filter Feed
            </button>
          </div>
        </div>
      </header>

      <div className={styles.settingsGrid}>
        <aside className={styles.settingsSidebar}>
          <div className={`${styles.sidebarItem} ${styles.sidebarItemActive}`}>
            <Zap size={18} />
            <span>All Activity</span>
            <span style={{ marginLeft: 'auto', background: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '100px', fontSize: '10px', fontWeight: 800 }}>12</span>
          </div>
          <div className={styles.sidebarItem}>
            <AlertTriangle size={18} />
            <span>Critical Alerts</span>
          </div>
          <div className={styles.sidebarItem}>
            <CheckCircle size={18} />
            <span>Project Milestones</span>
          </div>
          <div className={styles.sidebarItem}>
            <Shield size={18} />
            <span>Security Logs</span>
          </div>
          <div className={styles.sidebarItem}>
            <Clock size={18} />
            <span>System Updates</span>
          </div>
        </aside>

        <main style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { icon: Zap, title: 'New Order Punched', desc: 'Sales user "Suresh K" has punched a new 5kW Residential order for client Amit Singh.', time: '2 mins ago', type: 'SALE', color: '#10b981', bg: '#ecfdf5' },
            { icon: Shield, title: 'Bajaj Loan Approved', desc: 'The ₹4.5L loan application for project #SR-9921 has been successfully verified and approved.', time: '45 mins ago', type: 'LOAN', color: '#2563eb', bg: '#eff6ff' },
            { icon: CheckCircle, title: 'Site Survey Verified', desc: 'Engineering team has confirmed structural feasibility for the "Priya S" installation site.', time: '2 hours ago', type: 'SURVEY', color: '#7c3aed', bg: '#f5f3ff' },
            { icon: Mail, title: 'Document Alert: EB Bill', desc: 'Customer has uploaded a new EB Bill for project verification. Pending admin review.', time: '5 hours ago', type: 'DOCS', color: '#f59e0b', bg: '#fef3c7' },
            { icon: AlertTriangle, title: 'Payment Overdue', desc: 'The second milestone payment for client "Rajesh V" is now 3 days overdue. System alert triggered.', time: 'Yesterday', type: 'FINANCE', color: '#dc2626', bg: '#fef2f2' }
          ].map((item, i) => (
            <div key={i} className={styles.notificationCard}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: item.bg, 
                color: item.color, 
                borderRadius: '14px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <item.icon size={22} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{item.title}</h3>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>{item.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b', lineHeight: 1.5 }}>{item.desc}</p>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', background: item.bg, color: item.color, borderRadius: '4px', textTransform: 'uppercase' }}>{item.type}</span>
                  <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', background: '#f1f5f9', color: '#64748b', borderRadius: '4px', textTransform: 'uppercase' }}>MARK AS READ</span>
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
