"use client";

import { useState } from "react";
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
            <button className={styles.iconBtn}><Bell size={20} /></button>
            <button className={styles.iconBtn}><Settings size={20} /></button>
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
