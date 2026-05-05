"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Menu, X } from "lucide-react";
import { AuthProvider } from "@/lib/AuthContext";
import styles from "./layout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <div className={styles.layoutContainer}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className={styles.mainContent}>
          <div className={styles.topbar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                className={styles.mobileMenuBtn} 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className={styles.searchContainer}>
                <input 
                  type="text" 
                  placeholder="Search orders, clients..." 
                  className="input-field" 
                  style={{ width: '300px', margin: 0 }}
                />
              </div>
            </div>
            <div className={styles.actions}>
              {/* Additional actions like notifications can go here */}
            </div>
          </div>
          <div className={styles.pageContent}>
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
