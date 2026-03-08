import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Users, BarChart, ShoppingCart, Truck } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import { reportApi } from '../../lib/api/reportApi';
import { locationAPI } from '../../lib/api/locationApi';
import { productStore } from '../../lib/store/productStore';
import { useSalesStore } from '../../lib/store/salesStore';
import type { DashboardSummary } from '../../types/reports';
import StatsCards from './StatsCards';
import RecentSales from './RecentSales';
import LowStockAlerts from './LowStockAlerts';
import './dashboard.css';

const emptySummary: DashboardSummary = {
  revenue: { today: 0, month: 0 },
  sales: { count: 0, averageOrderValue: 0 },
  inventory: { totalProducts: 0, lowStockCount: 0, totalValue: 0 },
  customers: { total: 0, loyaltyMembers: 0 }
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { products, fetchProducts } = productStore();
  const { sales, fetchSales } = useSalesStore();
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [outlets, setOutlets] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const [selectedOutletId, setSelectedOutletId] = useState(user?.outletId || '');
  const isSuperAdmin = user?.role?.name === 'super_admin';

  useEffect(() => {
    if (!isSuperAdmin) {
      setSelectedOutletId(user?.outletId || '');
      return;
    }

    const loadOutlets = async () => {
      try {
        const response = await locationAPI.getOutlets();
        setOutlets(
          (response.data || []).map((outlet: any) => ({
            id: outlet._id || outlet.id,
            name: outlet.name,
            code: outlet.code
          }))
        );
      } catch (error) {
        console.error('Failed to load dashboard outlets:', error);
      }
    };

    void loadOutlets();
  }, [isSuperAdmin, user?.outletId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const outletId = isSuperAdmin ? selectedOutletId || undefined : user?.outletId || undefined;
        const [dashboardResponse] = await Promise.all([
          reportApi.getDashboardSummary({
            outletId,
            period,
            startDate: period === 'custom' ? startDate || undefined : undefined,
            endDate: period === 'custom' ? endDate || undefined : undefined
          }),
          fetchProducts(
            outletId
              ? { page: 1, limit: 20, locationType: 'outlet', locationId: outletId }
              : { page: 1, limit: 20 }
          ),
          fetchSales({ outletId, page: 1, limit: 10 })
        ]);
        setSummary({ ...emptySummary, ...(dashboardResponse.data || {}) });
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [endDate, fetchProducts, fetchSales, isSuperAdmin, period, selectedOutletId, startDate, user?.outletId]);

  const quickActions = useMemo(
    () => [
      { label: 'New Sale', icon: ShoppingCart, color: '#3b82f6', action: () => navigate('/sales/pos') },
      { label: 'Add Product', icon: Plus, color: '#10b981', action: () => navigate('/inventory/products') },
      { label: 'Inventory', icon: Package, color: '#8b5cf6', action: () => navigate('/inventory/products') },
      { label: 'Customers', icon: Users, color: '#f59e0b', action: () => navigate('/sales/pos') },
      { label: 'Reports', icon: BarChart, color: '#06b6d4', action: () => navigate('/reports/sales') },
      { label: 'Stock Transfer', icon: Truck, color: '#ef4444', action: () => navigate('/transfers/stock') }
    ],
    [navigate]
  );

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">Welcome back, {user?.firstName || 'User'}!</h1>
        <p className="dashboard__subtitle">Here is the current state of the business.</p>
      </div>

      <div className="reports-nav" style={{ marginBottom: '1.5rem' }}>
        <select value={period} onChange={(event) => setPeriod(event.target.value)} className="sales-history__filter" style={{ minWidth: '160px' }}>
          <option value="today">Today</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
          <option value="custom">Custom</option>
        </select>
        {period === 'custom' && (
          <>
            <input type="date" className="sales-history__filter" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            <input type="date" className="sales-history__filter" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </>
        )}
        <div style={{ flex: 1 }} />
        {isSuperAdmin && (
          <select value={selectedOutletId} onChange={(event) => setSelectedOutletId(event.target.value)} className="sales-history__filter" style={{ minWidth: '220px' }}>
            <option value="">All Outlets</option>
            {outlets.map((outlet) => (
              <option key={outlet.id} value={outlet.id}>
                {outlet.name} ({outlet.code})
              </option>
            ))}
          </select>
        )}
      </div>

      <StatsCards summary={summary} loading={loading} />

      <div className="quick-actions">
        <h3 className="quick-actions__title">Quick Actions</h3>
        <div className="quick-actions__grid">
          {quickActions.map((action) => (
            <button key={action.label} className="quick-action" onClick={action.action}>
              <div className="quick-action__icon" style={{ background: `linear-gradient(135deg, ${action.color}20, ${action.color}40)`, color: action.color }}>
                <action.icon size={20} />
              </div>
              <p className="quick-action__label">{action.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard__grid-2">
        <RecentSales sales={sales} />
        <LowStockAlerts products={products} />
      </div>
    </div>
  );
};

export default Dashboard;
