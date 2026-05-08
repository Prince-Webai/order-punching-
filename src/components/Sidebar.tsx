"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Wallet, Truck, Wrench, Zap, LogOut, PlusCircle, Users, X, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import styles from './Sidebar.module.css';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, allowedRoles: ['ADMIN', 'SALESPERSON', 'PROJECT_MANAGER', 'LOAN_PARTNER', 'LOAN_EXECUTIVE', 'INSTALLER'], group: 'MANAGEMENT' },
  { name: 'All Leads', href: '/dashboard/leads', icon: Users, allowedRoles: ['ADMIN', 'SALESPERSON', 'PROJECT_MANAGER', 'LOAN_PARTNER', 'LOAN_EXECUTIVE'], group: 'MANAGEMENT' },
  { name: 'User Management', href: '/dashboard/users', icon: Users, allowedRoles: ['ADMIN', 'PROJECT_MANAGER'], group: 'MANAGEMENT' },
  
  { name: 'Punch Order', href: '/dashboard/orders/new', icon: PlusCircle, allowedRoles: ['ADMIN', 'SALESPERSON'], group: 'OPERATIONS' },
  { name: 'Pipeline', href: '/dashboard/pipeline', icon: ClipboardList, allowedRoles: ['ADMIN', 'SALESPERSON', 'PROJECT_MANAGER', 'LOAN_EXECUTIVE'], group: 'OPERATIONS' },
  
  { name: 'Payments', href: '/dashboard/payments', icon: Wallet, allowedRoles: ['ADMIN', 'PROJECT_MANAGER'], group: 'FINANCE' },
  
  { name: 'Shipments', href: '/dashboard/shipments', icon: Truck, allowedRoles: ['ADMIN', 'PROJECT_MANAGER'], group: 'EXECUTION' },
  { name: 'BOM Management', href: '/dashboard/bom', icon: ClipboardList, allowedRoles: ['ADMIN', 'PROJECT_MANAGER'], group: 'EXECUTION' },
  { name: 'Installations', href: '/dashboard/installations', icon: Wrench, allowedRoles: ['ADMIN', 'PROJECT_MANAGER', 'INSTALLER'], group: 'EXECUTION' },
  { name: 'EB & Net Meter', href: '/dashboard/eb-net-meter', icon: Zap, allowedRoles: ['ADMIN', 'PROJECT_MANAGER'], group: 'EXECUTION' },
  
  { name: 'Settings', href: '/dashboard/settings', icon: Users, allowedRoles: ['ADMIN', 'SALESPERSON', 'PROJECT_MANAGER', 'LOAN_PARTNER', 'LOAN_EXECUTIVE', 'INSTALLER'], group: 'SYSTEM' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { activeUser, logout, loading } = useAuth();
  const pathname = usePathname();

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logoContainer}>
          <div className={styles.logoWrapper}>
            <div className={styles.logoGlow}></div>
            <Zap size={22} fill="white" stroke="white" strokeWidth={3} style={{ position: 'relative', zIndex: 2 }} />
          </div>
          <div>
            <h1 className={styles.logoText}>SOLAR<span style={{ color: '#10b981' }}>CRM</span></h1>
            <p style={{ margin: 0, fontSize: '9px', fontWeight: 800, color: '#34d399', letterSpacing: '0.15em', opacity: 0.8 }}>ENTERPRISE OS</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          {['MANAGEMENT', 'OPERATIONS', 'FINANCE', 'EXECUTION', 'SYSTEM'].map((group) => {
            const groupItems = navItems.filter(item => item.group === group && item.allowedRoles.includes(activeUser?.role || ''));
            if (groupItems.length === 0) return null;

            return (
              <div key={group} className={styles.navGroup}>
                <span className={styles.navLabel}>{group.charAt(0) + group.slice(1).toLowerCase()}</span>
                {groupItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={item.name} 
                      href={item.href} 
                      className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                      onClick={onClose}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                      <span>{item.name}</span>
                      {isActive && <ChevronRight size={14} className={styles.activeIndicator} />}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className={styles.footer}>
          {!loading && activeUser && (
            <div className={styles.profileSection}>
              <div className={styles.avatar}>
                {activeUser.name.charAt(0)}
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{activeUser.name}</span>
                <span className={styles.userRole}>{activeUser.role}</span>
              </div>
              <button onClick={logout} className={styles.logoutBtn} title="Sign Out">
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
