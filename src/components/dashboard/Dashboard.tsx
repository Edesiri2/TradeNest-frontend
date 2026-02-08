import React from 'react';
import { Plus, Package, Users, BarChart, ShoppingCart, Truck, DollarSign } from 'lucide-react';
import { useAuthStore } from '../../lib/store';
import StatsCards from './StatsCards';
import RecentSales from './RecentSales';
import LowStockAlerts from './LowStockAlerts';
import './dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();

  const quickActions = [
    {
      label: 'New Sale',
      icon: ShoppingCart,
      color: '#3b82f6',
      action: () => console.log('New sale')
    },
    {
      label: 'Add Product',
      icon: Plus,
      color: '#10b981',
      action: () => console.log('Add product')
    },
    {
      label: 'Inventory',
      icon: Package,
      color: '#8b5cf6',
      action: () => console.log('View inventory')
    },
    {
      label: 'Suppliers',
      icon: Users,
      color: '#f59e0b',
      action: () => console.log('Manage suppliers')
    },
    {
      label: 'Reports',
      icon: BarChart,
      color: '#06b6d4',
      action: () => console.log('View reports')
    },
    {
      label: 'Stock Transfer',
      icon: Truck,
      color: '#ef4444',
      action: () => console.log('Transfer stock')
    }
  ];

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard__header">
        <h1 className="dashboard__title">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="dashboard__subtitle">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3 className="quick-actions__title">Quick Actions</h3>
        <div className="quick-actions__grid">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="quick-action"
              onClick={action.action}
            >
              <div 
                className="quick-action__icon"
                style={{ 
                  background: `linear-gradient(135deg, ${action.color}20, ${action.color}40)`,
                  color: action.color
                }}
              >
                <action.icon size={20} />
              </div>
              <p className="quick-action__label">{action.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard__grid-2">
        <RecentSales />
        <LowStockAlerts />
      </div>

      {/* Additional Stats Section */}
      <div className="dashboard__grid-3">
        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__info">
              <p className="stat-card__label">Total Customers</p>
              <h3 className="stat-card__value">1,248</h3>
              <div className="stat-card__change stat-card__change--positive">
                +8.5%
              </div>
              <p className="stat-card__trend">From last month</p>
            </div>
            <div className="stat-card__icon stat-card__icon--customers">
              <Users size={20} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__info">
              <p className="stat-card__label">Order Accuracy</p>
              <h3 className="stat-card__value">98.2%</h3>
              <div className="stat-card__change stat-card__change--positive">
                +1.2%
              </div>
              <p className="stat-card__trend">Perfect orders</p>
            </div>
            <div className="stat-card__icon stat-card__icon--sales">
              <BarChart size={20} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card__content">
            <div className="stat-card__info">
              <p className="stat-card__label">Avg. Order Value</p>
              <h3 className="stat-card__value">₦45,250</h3>
              <div className="stat-card__change stat-card__change--positive">
                +5.8%
              </div>
              <p className="stat-card__trend">From last quarter</p>
            </div>
            <div className="stat-card__icon stat-card__icon--revenue">
              <DollarSign size={20} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;