"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, TrendingUp, Users, Zap, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import styles from './dashboard-home.module.css';

// We will fetch orders and calculate stats dynamically
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltipContainer}>
        <p className={styles.tooltipTitle}>{payload[0].dataKey === 'revenue' ? 'Total Revenue' : 'Installations'}</p>
        <div className={styles.tooltipRow}>
          <div className={styles.tooltipDot} style={{ backgroundColor: payload[0].stroke }}></div>
          <p className={styles.tooltipLabel}>{label}</p>
        </div>
        <p className={styles.tooltipValue}>
          {payload[0].dataKey === 'revenue' ? '₹' : ''}
          {Number(payload[0].value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardHomePage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrders(data.orders);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Calculate live stats based on DB orders
  const totalRevenue = orders.reduce((sum, order) => sum + (order.quotationAmount || 0), 0);
  const totalSystemSize = orders.reduce((sum, order) => sum + (order.systemSizeKw || 0), 0);
  const activePipeline = orders.filter(o => o.currentStage !== 'EB_NET_METER').length;
  const completedProjects = orders.filter(o => o.currentStage === 'EB_NET_METER').length;

  // Placeholder for real chart data logic (grouping by month)
  const chartData = [
    { name: 'Latest', revenue: totalRevenue, installations: completedProjects }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '8px' }}>Dashboard Overview</h1>
          <p className={styles.subtitle}>Welcome back! Here is what is happening with your projects today.</p>
        </div>
        <Link href="/dashboard/orders/new" className="btn btn-primary">
          <PlusCircle size={18} style={{ marginRight: '8px' }} />
          Punch New Order
        </Link>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIconWrapper} style={{ backgroundColor: '#E0F2FE', color: '#0284C7' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className={styles.statValue}>
            {loading ? '...' : `₹${(totalRevenue / 100000).toFixed(2)}L`}
          </div>
          <div className={styles.statLabel}>Total Revenue (YTD)</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIconWrapper} style={{ backgroundColor: '#F3E8FF', color: '#7E22CE' }}>
              <Zap size={20} />
            </div>
          </div>
          <div className={styles.statValue}>
            {loading ? '...' : `${totalSystemSize} kW`}
          </div>
          <div className={styles.statLabel}>Total System Size</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIconWrapper} style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <Users size={20} />
            </div>
          </div>
          <div className={styles.statValue}>{loading ? '...' : activePipeline}</div>
          <div className={styles.statLabel}>Active Pipeline</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={styles.statIconWrapper} style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div className={styles.statValue}>{loading ? '...' : completedProjects}</div>
          <div className={styles.statLabel}>Completed Projects</div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className="card" style={{ padding: '24px' }}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Business Growth</h3>
            <p className={styles.chartSubtitle}>Revenue and Installation trends over current pipeline</p>
          </div>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis hide />
                <RechartsTooltip 
                  cursor={{ stroke: 'rgba(37, 99, 235, 0.2)', strokeWidth: 2 }} 
                  content={<CustomTooltip />} 
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--primary)" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: 'var(--primary)', strokeWidth: 3, stroke: '#fff' }}
                  activeDot={{ r: 8, fill: 'var(--primary)', stroke: '#fff', strokeWidth: 4 }} 
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
