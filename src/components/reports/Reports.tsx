import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Package, DollarSign, TrendingUp, Download } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { locationAPI } from '../../lib/api/locationApi';
import { useAuthStore } from '../../lib/store/useAuthStore';
import OperationalCosts from './OperationalCosts';
import CustomerAnalyticsReport from './CustomerAnalyticsReport';
import SalesReport from './SalesReport';
import InventoryReport from './InventoryReport';
import ProfitLoss from './ProfitLoss';
import './reports.css';

type ReportView = 'sales' | 'inventory' | 'profit' | 'customers' | 'costs';

const Reports: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const pathToView = useMemo<Record<string, ReportView>>(
    () => ({
      '/reports/sales': 'sales',
      '/reports/inventory': 'inventory',
      '/reports/profit-loss': 'profit',
      '/reports/customers': 'customers',
      '/reports/operational-costs': 'costs'
    }),
    []
  );
  const [currentView, setCurrentView] = useState<ReportView>(pathToView[location.pathname] || 'sales');
  const [selectedOutletId, setSelectedOutletId] = useState(user?.outletId || '');
  const [period, setPeriod] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [outlets, setOutlets] = useState<Array<{ id: string; name: string; code: string }>>([]);
  const isSuperAdmin = user?.role?.name === 'super_admin';

  useEffect(() => {
    setCurrentView(pathToView[location.pathname] || 'sales');
  }, [location.pathname, pathToView]);

  useEffect(() => {
    if (!isSuperAdmin) {
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
        console.error('Failed to load report outlets:', error);
      }
    };

    void loadOutlets();
  }, [isSuperAdmin]);

  const effectiveOutletId = isSuperAdmin ? selectedOutletId : user?.outletId || '';
  const filters = {
    outletId: effectiveOutletId || undefined,
    period,
    startDate: period === 'custom' ? startDate || undefined : undefined,
    endDate: period === 'custom' ? endDate || undefined : undefined
  };

  const renderReport = () => {
    switch (currentView) {
      case 'sales':
        return <SalesReport filters={filters} />;
      case 'inventory':
        return <InventoryReport filters={filters} />;
      case 'profit':
        return <ProfitLoss filters={filters} />;
      case 'customers':
        return <CustomerAnalyticsReport filters={filters} />;
      case 'costs':
        return <OperationalCosts filters={filters} />;
      default:
        return <SalesReport filters={filters} />;
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div className="reports-nav">
          <button className={`report-tab ${currentView === 'sales' ? 'active' : ''}`} onClick={() => navigate('/reports/sales')}>
            <BarChart3 size={18} />
            Sales Report
          </button>

          <button className={`report-tab ${currentView === 'inventory' ? 'active' : ''}`} onClick={() => navigate('/reports/inventory')}>
            <Package size={18} />
            Inventory Report
          </button>

          <button className={`report-tab ${currentView === 'profit' ? 'active' : ''}`} onClick={() => navigate('/reports/profit-loss')}>
            <DollarSign size={18} />
            Profit &amp; Loss
          </button>

          <button className={`report-tab ${currentView === 'customers' ? 'active' : ''}`} onClick={() => navigate('/reports/customers')}>
            <TrendingUp size={18} />
            Customer Analytics
          </button>
          <button className={`report-tab ${currentView === 'costs' ? 'active' : ''}`} onClick={() => navigate('/reports/operational-costs')}>
            <DollarSign size={18} />
            Operational Costs
          </button>
        </div>

        <div className="reports-nav">
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

          {isSuperAdmin && (
            <select
              value={selectedOutletId}
              onChange={(event) => setSelectedOutletId(event.target.value)}
              className="sales-history__filter"
              style={{ minWidth: '220px' }}
            >
              <option value="">All Outlets</option>
              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name} ({outlet.code})
                </option>
              ))}
            </select>
          )}

          <div style={{ flex: 1 }} />

          <button className="report-tab" style={{ background: '#10b981', color: 'white', borderColor: '#10b981' }}>
            <Download size={18} />
            Export All
          </button>
        </div>
      </div>

      {renderReport()}
    </div>
  );
};

export default Reports;
