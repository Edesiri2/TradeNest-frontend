import React from 'react';
import { TrendingUp, DollarSign, Package, AlertTriangle, Users } from 'lucide-react';
import { formatCurrency } from '../../lib/utils/utils';
import type { DashboardSummary } from '../../types/reports';
import './dashboard.css';

interface StatsCardsProps {
  summary: DashboardSummary;
  loading: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="stat-card loading">
            <div className="stat-card__skeleton"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Today's Revenue",
      value: formatCurrency(summary.revenue.total),
      description: `${summary.sales.count} sales`,
      icon: DollarSign,
      type: 'revenue'
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(summary.inventory.totalValue),
      description: `${summary.inventory.totalProducts} products`,
      icon: Package,
      type: 'inventory'
    },
    {
      title: 'Low Stock',
      value: String(summary.inventory.lowStockCount),
      description: 'Need restocking',
      icon: AlertTriangle,
      type: 'alerts'
    },
    {
      title: 'Customers',
      value: String(summary.customers.total),
      description: `${summary.customers.loyaltyMembers} loyalty members`,
      icon: Users,
      type: 'customers'
    }
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <div key={stat.title} className={`stat-card stat-card--${stat.type}`}>
          <div className="stat-card__content">
            <div className="stat-card__info">
              <p className="stat-card__label">{stat.title}</p>
              <h3 className="stat-card__value">{stat.value}</h3>
              <div className="stat-card__change stat-card__change--positive">
                <TrendingUp size={14} />
                {stat.description}
              </div>
            </div>
            <div className={`stat-card__icon stat-card__icon--${stat.type}`}>
              <stat.icon size={20} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
