"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, ClipboardList, PlusCircle } from 'lucide-react';
import styles from './BottomNav.module.css';

const navItems = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Add', href: '/dashboard/orders/new', icon: PlusCircle, isPrimary: true },
  { name: 'Pipeline', href: '/dashboard/pipeline', icon: ClipboardList },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.container}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.name} 
            href={item.href} 
            className={`${styles.navItem} ${isActive ? styles.active : ''} ${item.isPrimary ? styles.primary : ''}`}
          >
            <Icon size={item.isPrimary ? 24 : 20} strokeWidth={isActive ? 2.5 : 2} />
            {!item.isPrimary && <span className={styles.label}>{item.name}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
