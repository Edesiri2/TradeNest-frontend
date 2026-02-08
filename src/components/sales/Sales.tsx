import React, { useState } from 'react';
import { ShoppingCart, History, BarChart, Users } from 'lucide-react';
import { Button } from '../ui';
import PosInterface from './PosInterface';
import SalesHistory from './SalesHistory';
import './sales.css';

type SalesView = 'pos' | 'history' | 'customers' | 'analytics';

const Sales: React.FC = () => {
  const [currentView, setCurrentView] = useState<SalesView>('pos');

  const renderView = () => {
    switch (currentView) {
      case 'pos':
        return <PosInterface />;
      case 'history':
        return <SalesHistory />;
      case 'customers':
        return (
          <div className="sales">
            <div className="sales__header">
              <h1 className="sales__title">Customer Management</h1>
              <p className="sales__subtitle">
                Manage your customers and loyalty programs
              </p>
            </div>
            <div className="sales-empty">
              <div className="sales-empty__icon">👥</div>
              <p className="sales-empty__text">Customer Management</p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Customer management features coming soon
              </p>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="sales">
            <div className="sales__header">
              <h1 className="sales__title">Sales Analytics</h1>
              <p className="sales__subtitle">
                Detailed insights and sales performance metrics
              </p>
            </div>
            <div className="sales-empty">
              <div className="sales-empty__icon">📈</div>
              <p className="sales-empty__text">Sales Analytics</p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Analytics dashboard coming soon
              </p>
            </div>
          </div>
        );
      default:
        return <PosInterface />;
    }
  };

  return (
    <div>
      {/* View Navigation */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        padding: '0 1.5rem',
        flexWrap: 'wrap'
      }}>
        <Button
          variant={currentView === 'pos' ? 'primary' : 'outline'}
          icon={ShoppingCart}
          onClick={() => setCurrentView('pos')}
        >
          POS
        </Button>
        <Button
          variant={currentView === 'history' ? 'primary' : 'outline'}
          icon={History}
          onClick={() => setCurrentView('history')}
        >
          Sales History
        </Button>
        <Button
          variant={currentView === 'customers' ? 'primary' : 'outline'}
          icon={Users}
          onClick={() => setCurrentView('customers')}
        >
          Customers
        </Button>
        <Button
          variant={currentView === 'analytics' ? 'primary' : 'outline'}
          icon={BarChart}
          onClick={() => setCurrentView('analytics')}
        >
          Analytics
        </Button>
      </div>

      {/* Current View */}
      {renderView()}
    </div>
  );
};

export default Sales;