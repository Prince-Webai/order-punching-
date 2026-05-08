"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { Menu, X, Bell, Settings } from "lucide-react";
import styles from "./layout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={styles.layoutContainer}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className={styles.mainWrapper}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button 
              className={styles.mobileMenuBtn} 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className={styles.searchBox}>
              <input 
                type="text" 
                placeholder="Universal search..." 
                className={styles.topInput}
              />
            </div>
          </div>
          
          <div className={styles.topbarRight}>
            <Link href="/dashboard/notifications" className={styles.iconBtn} title="Notifications">
              <Bell size={20} />
              <span className={styles.notificationBadge}></span>
            </Link>
            <Link href="/dashboard/settings" className={styles.iconBtn} title="Settings">
              <Settings size={20} />
            </Link>
          </div>
        </header>

        <main className={styles.pageContent}>
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
