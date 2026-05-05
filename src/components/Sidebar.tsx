import Link from 'next/link';
import { Home, ClipboardList, Wallet, Truck, Wrench, Zap, LogOut, PlusCircle, Users, X } from 'lucide-react';
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
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { activeUser, users, switchUser, loading } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className={styles.overlay} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logoContainer}>
          <div className={styles.logoIcon}><Zap size={20} color="#FFFFFF" /></div>
          <h1 className={styles.logoText}>Solar CRM</h1>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navGroup}>
            <span className={styles.navLabel}>MAIN MENU</span>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href} className={styles.navItem}>
                  <Icon size={18} className={styles.navIcon} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className={styles.footer}>
          <div className={styles.userProfile} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
            {loading ? (
              <div style={{ fontSize: '12px' }}>Loading roles...</div>
            ) : (
              <>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>VIEWING AS:</div>
                <select 
                  value={activeUser?.id || ''} 
                  onChange={(e) => switchUser(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--surface)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
