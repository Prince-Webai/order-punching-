"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Wallet, Truck, Wrench, Zap, LogOut, PlusCircle, Users, X, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import styles from './Sidebar.module.css';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'All Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Pipeline', href: '/dashboard/pipeline', icon: ClipboardList },
  { name: 'Punch Order', href: '/dashboard/orders/new', icon: PlusCircle },
  { name: 'Payments', href: '/dashboard/payments', icon: Wallet },
  { name: 'Shipments', href: '/dashboard/shipments', icon: Truck },
  { name: 'Installations', href: '/dashboard/installations', icon: Wrench },
  { name: 'EB & Net Meter', href: '/dashboard/eb-net-meter', icon: Zap },
  { name: 'Settings', href: '/dashboard/settings', icon: Users, adminOnly: true },
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
            <Zap size={20} fill="currentColor" />
          </div>
          <h1 className={styles.logoText}>Solar CRM</h1>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navGroup}>
            <span className={styles.navLabel}>Management</span>
            {navItems.map((item) => {
              if (item.adminOnly && activeUser?.role !== 'ADMIN') return null;
              
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
