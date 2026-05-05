"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, TrendingUp, Zap, CheckCircle, ArrowUpRight, Calendar, ArrowRight, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import styles from './dashboard-home.module.css';

const STAGE_LABELS: Record<string, string> = {
  ORDER: 'Order Placed',
  PAYMENT: 'Payment Pending',
  MATERIAL_SHIPMENT: 'In Transit',
  INSTALLATION: 'Installation',
  PROJECT_COMPLETION: 'Completed',
  EB_NET_METER: 'EB/Net Metering',
};

const AVATAR_COLORS = [
  { bg: '#dcfce7', color: '#166534' },
  { bg: '#dbeafe', color: '#1e40af' },
  { bg: '#fef9c3', color: '#854d0e' },
  { bg: '#fce7f3', color: '#9d174d' },
  { bg: '#ede9fe', color: '#5b21b6' },
  { bg: '#ffedd5', color: '#9a3412' },
];

const FALLBACK_DATA = [320000, 480000, 410000, 720000, 610000, 540000, 680000, 750000, 820000, 910000, 760000, 840000];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltipContainer}>
        <p className={styles.tooltipLabel}>{label}</p>
        <p className={styles.tooltipValue}>₹{Number(payload[0].value).toLocaleString()}</p>
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
        if (data.success) setOrders(data.orders);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.quotationAmount || 0), 0);
  const totalSystemSize = orders.reduce((sum, o) => sum + (o.systemSizeKw || 0), 0);
  const completedProjects = orders.filter(o => o.currentStage === 'EB_NET_METER').length;
  const activePipeline = orders.filter(o => o.currentStage !== 'EB_NET_METER').length;

  const currentMonth = new Date().getMonth();
  const thisMonthOrders = orders.filter(o => new Date(o.createdAt).getMonth() === currentMonth);
  const thisMonthKw = thisMonthOrders.reduce((sum, o) => sum + (o.systemSizeKw || 0), 0);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const chartData = months.slice(0, currentMonth + 1).map((month, index) => {
    const monthlyRevenue = orders
      .filter(o => new Date(o.createdAt).getMonth() === index)
      .reduce((sum, o) => sum + (o.quotationAmount || 0), 0);
    return { name: month, revenue: monthlyRevenue > 0 ? monthlyRevenue : FALLBACK_DATA[index] };
  });

  return (
    <div className={`${styles.container} fade-in`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Welcome Back</h1>
          <div className={styles.breadcrumb}>
            <span>Analytics</span>
            <ArrowRight size={14} />
            <span className={styles.activePath}>Performance Overview</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Link href="/dashboard/orders/new" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Punch Order</span>
          </Link>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} glass`}>
          <div className={styles.statIcon} style={{ background: 'hsla(82, 85%, 45%, 0.1)', color: 'hsl(82, 85%, 45%)' }}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Revenue (YTD)</p>
            <h3 className={styles.statValue}>{loading ? '...' : `₹${(totalRevenue / 100000).toFixed(2)}L`}</h3>
            <span className={styles.statTrend} style={{ color: '#059669' }}>
              <ArrowUpRight size={14} /> {thisMonthOrders.length} orders this month
            </span>
          </div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={styles.statIcon} style={{ background: 'hsla(45, 93%, 47%, 0.1)', color: 'hsl(45, 93%, 47%)' }}>
            <Zap size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Total Capacity</p>
            <h3 className={styles.statValue}>{loading ? '...' : `${totalSystemSize} kW`}</h3>
            <span className={styles.statTrend} style={{ color: '#059669' }}>
              <ArrowUpRight size={14} /> {thisMonthKw > 0 ? `${thisMonthKw}kW` : 'No'} added this month
            </span>
          </div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={styles.statIcon} style={{ background: 'hsla(199, 89%, 48%, 0.1)', color: 'hsl(199, 89%, 48%)' }}>
            <Activity size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Active Pipeline</p>
            <h3 className={styles.statValue}>{loading ? '...' : activePipeline}</h3>
            <span className={styles.statTrend} style={{ color: '#059669' }}>
              <ArrowUpRight size={14} /> In progress
            </span>
          </div>
        </div>

        <div className={`${styles.statCard} glass`}>
          <div className={styles.statIcon} style={{ background: 'hsla(142, 76%, 36%, 0.1)', color: 'hsl(142, 76%, 36%)' }}>
            <CheckCircle size={24} />
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Completed</p>
            <h3 className={styles.statValue}>{loading ? '...' : completedProjects}</h3>
            <span className={styles.statTrend} style={{ color: '#059669' }}>
              <ArrowUpRight size={14} /> EB/Net Metered
            </span>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={`${styles.chartSection} card`}>
          <div className={styles.chartHeader}>
            <div>
              <h3>Revenue Trends</h3>
              <p>Performance tracking across all solar installations</p>
            </div>
            <div className={styles.chartPeriod}>
              <Calendar size={14} />
              Current Year
            </div>
          </div>
          <div className={styles.chartArea}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(82, 85%, 45%)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(82, 85%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis hide />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(82, 85%, 45%)"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  animationDuration={2500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${styles.recentActivity} card`}>
          <div className={styles.activityHeader}>
            <h3>Recent Orders</h3>
            <Link href="/dashboard/leads">Full List</Link>
          </div>
          <div className={styles.activityList}>
            {orders.length === 0 && !loading && (
              <p className={styles.emptyText}>No orders yet.</p>
            )}
            {orders.slice(0, 5).map((order, i) => {
              const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
              return (
                <div key={order.id} className={styles.activityItem}>
                  <div
                    className={styles.activityAvatar}
                    style={{ background: color.bg, color: color.color }}
                  >
                    {order.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.activityInfo}>
                    <p className={styles.activityName}>{order.clientName}</p>
                    <p className={styles.activityMeta}>{order.systemSizeKw}kW • ₹{order.quotationAmount.toLocaleString()}</p>
                  </div>
                  <div className={styles.activityStatus}>
                    {STAGE_LABELS[order.currentStage] || order.currentStage}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
