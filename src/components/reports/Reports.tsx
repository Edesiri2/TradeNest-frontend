import React, { useState } from 'react';
import { BarChart3, Package, DollarSign, TrendingUp, Download } from 'lucide-react';
import SalesReport from './SalesReport';
import InventoryReport from './InventoryReport';
import ProfitLoss from './ProfitLoss';
import './reports.css';

type ReportView = 'sales' | 'inventory' | 'profit' | 'customers';

const Reports: React.FC = () => {
  const [currentView, setCurrentView] = useState<ReportView>('sales');

  const renderReport = () => {
    switch (currentView) {
      case 'sales':
        return <SalesReport />;
      case 'inventory':
        return <InventoryReport />;
      case 'profit':
        return <ProfitLoss />;
      case 'customers':
        return (
          <div className="reports-container">
            <div className="reports-header">
              <h1 className="reports-title">Customer Analytics</h1>
              <p className="reports-subtitle">
                Customer behavior, retention, and lifetime value analysis
              </p>
            </div>
            <div className="reports-empty">
              <div className="reports-empty-icon">👥</div>
              <h3 className="reports-empty-text">Customer Analytics</h3>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Customer analytics dashboard coming soon
              </p>
            </div>
          </div>
        );
      default:
        return <SalesReport />;
    }
  };

  return (
    <div>
      {/* Reports Navigation */}
      <div className="reports-nav">
        <button
          className={`report-tab ${currentView === 'sales' ? 'active' : ''}`}
          onClick={() => setCurrentView('sales')}
        >
          <BarChart3 size={18} />
          Sales Report
        </button>
        
        <button
          className={`report-tab ${currentView === 'inventory' ? 'active' : ''}`}
          onClick={() => setCurrentView('inventory')}
        >
          <Package size={18} />
          Inventory Report
        </button>
        
        <button
          className={`report-tab ${currentView === 'profit' ? 'active' : ''}`}
          onClick={() => setCurrentView('profit')}
        >
          <DollarSign size={18} />
          Profit & Loss
        </button>
        
        <button
          className={`report-tab ${currentView === 'customers' ? 'active' : ''}`}
          onClick={() => setCurrentView('customers')}
        >
          <TrendingUp size={18} />
          Customer Analytics
        </button>

        <div style={{ flex: 1 }} />

        <button className="report-tab" style={{ background: '#10b981', color: 'white', borderColor: '#10b981' }}>
          <Download size={18} />
          Export All
        </button>
      </div>

      {/* Current Report View */}
      {renderReport()}
    </div>
  );
};

export default Reports;