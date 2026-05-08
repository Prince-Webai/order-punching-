"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Zap, 
  CheckCircle, 
  ArrowRight, 
  PlusCircle, 
  Calendar, 
  Activity, 
  Clock, 
  Package, 
  Truck 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Cell,
  LabelList
} from 'recharts';
import { useAuth } from '@/lib/AuthContext';
import { OrderDataTable } from '@/components/OrderDataTable';
import styles from './dashboard-home.module.css';

// Custom Bar Component for rounded corners and premium look
const CustomBar = (props: any) => {
  const { x, y, width, height, fill } = props;
  return (
    <rect 
      x={x} 
      y={y} 
      width={width} 
      height={height} 
      fill={fill} 
      rx={8} 
      ry={8} 
      className="bar-shadow"
    />
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.tooltipContainer}>
        <p className={styles.tooltipLabel}>{label}</p>
        <p className={styles.tooltipValue}>
          ₹{Number(payload[0].value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardHomePage() {
  const { activeUser } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          let filtered = data.orders;
          if (activeUser?.role === 'LOAN_PARTNER') {
            filtered = data.orders.filter((o: any) => o.paymentType === 'LOAN');
          }
          setOrders(filtered);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeUser]);

  const handleUpdateStage = (orderId: string, updatedOrder: any) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updatedOrder } : o));
  };

  const handleUpdateLoanStage = (orderId: string, loanStage: string, loanSubStage: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, loanStage, loanSubStage } : o));
  };

  const totalRevenue = orders.reduce((sum, order) => sum + (order.quotationAmount || 0), 0);
  const totalCollected = orders.reduce((sum, order) => {
    const orderPayments = order.payments?.reduce((pSum: number, p: any) => pSum + (p.amount || 0), 0) || 0;
    return sum + orderPayments;
  }, 0);
  const totalOutstanding = totalRevenue - totalCollected;
  const totalSystemSize = orders.reduce((sum, order) => sum + (order.systemSizeKw || 0), 0);
  const activePipeline = orders.filter(o => o.currentStage !== 'EB_NET_METER').length;
  const completedProjects = orders.filter(o => o.currentStage === 'EB_NET_METER').length;

  // Calculate monthly revenue from orders
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIndex = new Date().getMonth();
  
  const chartData = months.slice(0, currentMonthIndex + 1).map((month, index) => {
    const monthlyRevenue = orders
      .filter(order => new Date(order.createdAt).getMonth() === index)
      .reduce((sum, order) => sum + (order.quotationAmount || 0), 0);
    
    // Fallback for demo if DB is empty for past months
    const fallbackData = [400000, 600000, 500000, 900000, 750000];
    return {
      name: month,
      revenue: monthlyRevenue > 0 ? monthlyRevenue : (fallbackData[index] || 0)
    };
  });  const isSales = activeUser?.role === 'SALESPERSON';
  const isLoanPartner = activeUser?.role === 'LOAN_PARTNER';
  const isProjectManager = activeUser?.role === 'PROJECT_MANAGER';
  const isLoanExecutive = activeUser?.role === 'LOAN_EXECUTIVE';
  const isInstaller = activeUser?.role === 'INSTALLER';
  const isAdmin = activeUser?.role === 'ADMIN';

  // Specific stats for roles
  const loanLeadsCount = orders.filter(o => o.paymentType === 'LOAN').length;
  const inProcessLoans = orders.filter(o => o.paymentType === 'LOAN' && o.loanStage !== 'DISBURSED').length;
  const approvedLoans = orders.filter(o => o.paymentType === 'LOAN' && o.loanStage === 'DISBURSED').length;

  const projectStats = {
    total: orders.length,
    active: orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.currentStage)).length,
    delayed: orders.filter(o => {
      const lastUpdate = new Date(o.lastStageUpdatedAt);
      const daysSinceUpdate = (new Date().getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24);
      return daysSinceUpdate > 7 && !['COMPLETED', 'CANCELLED'].includes(o.currentStage);
    }).length
  };

  const installStats = {
    ready: orders.filter(o => o.currentStage === 'READY_FOR_INSTALL').length,
    inProgress: orders.filter(o => o.currentStage === 'INSTALLATION_IN_PROGRESS').length,
    completed: orders.filter(o => o.currentStage === 'COMPLETED').length
  };

  return (
    <div className={`${styles.container} fade-in`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>
            {(isLoanPartner || isLoanExecutive) && !isAdmin ? 'Loan Pipeline Overview' : 
             isProjectManager ? 'Project Control Center' :
             isInstaller ? 'Installation Schedule' :
             isSales ? 'Sales Pipeline Overview' : 'System Administration'}
          </h1>
          <div className={styles.breadcrumb}>
            <span>{(isLoanPartner || isLoanExecutive) && !isAdmin ? 'Partner Desk' : isProjectManager ? 'Operations' : isInstaller ? 'Site Work' : isSales ? 'Pipeline' : 'Management'}</span>
            <ArrowRight size={14} />
            <span className={styles.activePath}>
              {(isLoanPartner || isLoanExecutive) && !isAdmin ? 'Application Tracking' : isProjectManager ? 'Master View' : isInstaller ? 'Job List' : isSales ? 'Lead Management' : 'Global Overview'}
            </span>
          </div>
        </div>
        <div className={styles.headerActions}>
          {(!isLoanPartner && !isInstaller) && (
            <Link href="/dashboard/orders/new" className="btn btn-primary">
              <PlusCircle size={18} />
              <span>Punch Order</span>
            </Link>
          )}
        </div>
      </header>

      {/* Role-Specific Stats Grid */}
      <div className={styles.statsGrid}>
        {(isLoanPartner || isLoanExecutive || isAdmin) && (
          <>
            <div className={`${styles.statCard} glass`} style={{ borderLeft: '4px solid #3b82f6' }}>
              <div className={styles.statIcon} style={{ background: 'hsla(217, 91%, 60%, 0.1)', color: '#3b82f6' }}>
                <Zap size={24} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Total Applications</p>
                <h3 className={styles.statValue}>{loanLeadsCount}</h3>
                <span className={styles.statTrend} style={{ color: '#64748b' }}>Assigned Leads</span>
              </div>
            </div>
            <div className={`${styles.statCard} glass`} style={{ borderLeft: '4px solid #f59e0b' }}>
              <div className={styles.statIcon} style={{ background: 'hsla(38, 92%, 50%, 0.1)', color: '#f59e0b' }}>
                <Activity size={24} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>In-Process</p>
                <h3 className={styles.statValue}>{inProcessLoans}</h3>
                <span className={styles.statTrend} style={{ color: '#d97706' }}>Awaiting Approval</span>
              </div>
            </div>
            <div className={`${styles.statCard} glass`} style={{ borderLeft: '4px solid #10b981' }}>
              <div className={styles.statIcon} style={{ background: 'hsla(161, 94%, 30%, 0.1)', color: '#10b981' }}>
                <CheckCircle size={24} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Disbursed Success</p>
                <h3 className={styles.statValue}>{approvedLoans}</h3>
                <span className={styles.statTrend} style={{ color: '#059669' }}>Completed Loans</span>
              </div>
            </div>
          </>
        )}

        {isProjectManager && (
          <>
            <div className={`${styles.statCard} glass`} style={{ borderLeft: '4px solid #10b981' }}>
              <div className={styles.statIcon} style={{ background: 'hsla(161, 94%, 30%, 0.1)', color: '#10b981' }}>
                <Activity size={24} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Active Projects</p>
                <h3 className={styles.statValue}>{projectStats.active}</h3>
                <span className={styles.statTrend} style={{ color: '#059669' }}>In the pipeline</span>
              </div>
            </div>
            <div className={`${styles.statCard} glass`} style={{ borderLeft: '4px solid #ef4444' }}>
              <div className={styles.statIcon} style={{ background: 'hsla(0, 84%, 60%, 0.1)', color: '#ef4444' }}>
                <Clock size={24} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Stalled/Delayed</p>
                <h3 className={styles.statValue}>{projectStats.delayed}</h3>
                <span className={styles.statTrend} style={{ color: '#dc2626' }}>{'>'} 7 days inactivity</span>
              </div>
            </div>
            <div className={`${styles.statCard} glass`} style={{ borderLeft: '4px solid #3b82f6' }}>
              <div className={styles.statIcon} style={{ background: 'hsla(217, 91%, 60%, 0.1)', color: '#3b82f6' }}>
                <Package size={24} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Total Projects</p>
                <h3 className={styles.statValue}>{projectStats.total}</h3>
                <span className={styles.statTrend} style={{ color: '#64748b' }}>Lifetime count</span>
              </div>
            </div>
          </>
        )}

        {isInstaller && (
          <>
            <div className={`${styles.statCard} glass`} style={{ borderLeft: '4px solid #f59e0b' }}>
              <div className={styles.statIcon} style={{ background: 'hsla(38, 92%, 50%, 0.1)', color: '#f59e0b' }}>
                <Truck size={24} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Ready for Install</p>
                <h3 className={styles.statValue}>{installStats.ready}</h3>
                <span className={styles.statTrend} style={{ color: '#d97706' }}>Pending dispatch</span>
              </div>
            </div>
            <div className={`${styles.statCard} glass`} style={{ borderLeft: '4px solid #3b82f6' }}>
              <div className={styles.statIcon} style={{ background: 'hsla(217, 91%, 60%, 0.1)', color: '#3b82f6' }}>
                <Activity size={24} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>In-Progress Site</p>
                <h3 className={styles.statValue}>{installStats.inProgress}</h3>
                <span className={styles.statTrend} style={{ color: '#2563eb' }}>Work ongoing</span>
              </div>
            </div>
            <div className={`${styles.statCard} glass`} style={{ borderLeft: '4px solid #10b981' }}>
              <div className={styles.statIcon} style={{ background: 'hsla(161, 94%, 30%, 0.1)', color: '#10b981' }}>
                <CheckCircle size={24} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Completed Installs</p>
                <h3 className={styles.statValue}>{installStats.completed}</h3>
                <span className={styles.statTrend} style={{ color: '#059669' }}>Handed over</span>
              </div>
            </div>
          </>
        )}

        {(!isLoanPartner && !isLoanExecutive && !isProjectManager && !isInstaller && !isSales) && (
          <>
            <div className={`${styles.statCard} glass`} style={{ borderLeft: '4px solid #10b981' }}>
              <div className={styles.statIcon} style={{ background: 'hsla(161, 94%, 30%, 0.1)', color: '#10b981' }}>
                <TrendingUp size={24} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Cash Collected</p>
                <h3 className={styles.statValue}>
                  {loading ? '...' : `₹${(totalCollected / 100000).toFixed(2)}L`}
                </h3>
                <span className={styles.statTrend} style={{ color: '#059669' }}>Realized Revenue</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className={styles.mainGrid}>
        <div className={`${styles.chartSection} card`}>
          <div className={styles.chartHeader}>
            <div>
              <h3>{isLoanPartner || isLoanExecutive ? 'Loan Pipeline' : isProjectManager ? 'Project Status Distribution' : isInstaller ? 'Installation Flow' : 'Revenue Trends'}</h3>
              <p>Operational performance tracking</p>
            </div>
          </div>
            <div className={styles.chartArea}>
              <ResponsiveContainer width="100%" height="100%">
                {(isLoanPartner || isLoanExecutive || isAdmin) ? (
                  <BarChart 
                    data={[
                      { name: 'Eligibility', count: orders.filter(o => o.loanStage === 'PRE_SALES' && o.loanSubStage === 'ELIGIBILITY_CHECK').length, color: '#3b82f6' },
                      { name: 'Login', count: orders.filter(o => o.loanSubStage === 'LOGGED_IN').length, color: '#6366f1' },
                      { name: 'Sanction', count: orders.filter(o => o.loanStage === 'SANCTIONED').length, color: '#8b5cf6' },
                      { name: 'Disbursed', count: orders.filter(o => o.loanStage === 'DISBURSED').length, color: '#10b981' }
                    ]} 
                    margin={{ top: 30, right: 10, left: 0, bottom: 0 }}
                    barSize={60}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                    <YAxis hide />
                    <RechartsTooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="count" shape={<CustomBar />}>
                      <LabelList dataKey="count" position="top" style={{ fill: '#1e293b', fontSize: 12, fontWeight: 700 }} />
                      {[0, 1, 2, 3].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#6366f1', '#8b5cf6', '#10b981'][index]} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : isProjectManager ? (
                  <BarChart 
                    data={[
                      { name: 'Order', count: orders.filter(o => o.currentStage === 'ORDER').length },
                      { name: 'Payment', count: orders.filter(o => o.currentStage === 'PAYMENT').length },
                      { name: 'BOM', count: orders.filter(o => o.currentStage === 'BOM_AND_PLANNING').length },
                      { name: 'Shipment', count: orders.filter(o => o.currentStage === 'MATERIAL_SHIPMENT').length },
                      { name: 'Install', count: orders.filter(o => o.currentStage === 'INSTALLATION').length }
                    ]} 
                    margin={{ top: 30, right: 10, left: 0, bottom: 0 }}
                    barSize={60}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                    <YAxis hide />
                    <RechartsTooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="count" fill="#3b82f6" shape={<CustomBar />}>
                      <LabelList dataKey="count" position="top" style={{ fill: '#1e293b', fontSize: 12, fontWeight: 700 }} />
                    </Bar>
                  </BarChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 30, right: 10, left: 0, bottom: 0 }} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                    <YAxis hide />
                    <RechartsTooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="revenue" fill="#10b981" shape={<CustomBar />}>
                      <LabelList dataKey="revenue" position="top" formatter={(val: any) => `₹${val}L`} style={{ fill: '#059669', fontSize: 11, fontWeight: 700 }} />
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
        </div>

        <div className={`${styles.recentActivity} card`}>
          <div className={styles.activityHeader}>
            <h3>Critical Leads</h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Needs attention</p>
          </div>
          <div className={styles.activityList}>
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className={styles.activityItem}>
                <div className={styles.activityAvatar} style={{ background: 'hsla(45, 93%, 47%, 0.1)', color: 'hsl(45, 93%, 47%)' }}>
                  <Zap size={14} />
                </div>
                <div className={styles.activityInfo}>
                  <p className={styles.activityName}>{order.clientName}</p>
                  <p className={styles.activityMeta}>{order.currentStage} • {order.paymentType}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '32px' }}>
        <OrderDataTable 
          orders={orders} 
          loading={loading} 
          title="Active Order Pipeline" 
          subtitle="Manage and track the progress of your latest solar installations."
          userRole={activeUser?.role}
          onUpdateStage={handleUpdateStage}
          onUpdateLoanStage={handleUpdateLoanStage}
        />
      </div>
    </div>
  );
}
