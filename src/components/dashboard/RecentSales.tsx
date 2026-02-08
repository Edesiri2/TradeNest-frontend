import React from 'react';
import { useSalesStore } from '../../lib/store/salesStore';

import { formatCurrency, formatDate } from '../../lib/utils/utils';
import './dashboard.css';

const RecentSales: React.FC = () => {
  const { sales } = useSalesStore();

  // Get last 5 sales
  const recentSales = sales.slice(0, 5);

  const getProductIcon = (productName: string) => {
    return productName.charAt(0).toUpperCase();
  };

  const getProductColor = (index: number) => {
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
    return colors[index % colors.length];
  };

  if (recentSales.length === 0) {
    return (
      <div className="recent-sales">
        <div className="recent-sales__header">
          <h3 className="recent-sales__title">Recent Sales</h3>
        </div>
        <div className="dashboard-empty">
          <div className="dashboard-empty__icon">💳</div>
          <p className="dashboard-empty__text">No sales yet</p>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
            Sales will appear here once you start making transactions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-sales">
      <div className="recent-sales__header">
        <h3 className="recent-sales__title">Recent Sales</h3>
        <button className="recent-sales__view-all">
          View All
        </button>
      </div>
      <ul className="recent-sales__list">
        {recentSales.map((sale, index) => (
          <li key={sale.id} className="recent-sales__item">
            <div className="recent-sales__product">
              <div 
                className="recent-sales__product-icon"
                style={{ 
                  background: `linear-gradient(135deg, ${getProductColor(index)}20, ${getProductColor(index)}40)`,
                  color: getProductColor(index)
                }}
              >
                {getProductIcon(sale.items[0]?.productName || 'P')}
              </div>
              <div className="recent-sales__product-info">
                <h4 className="recent-sales__product-name">
                  {sale.items[0]?.productName || 'Unknown Product'}
                  {sale.items.length > 1 && ` +${sale.items.length - 1} more`}
                </h4>
                <p className="recent-sales__product-meta">
                  {sale.paymentMethod} • {formatDate(new Date(sale.createdAt))}
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="recent-sales__amount">
                {formatCurrency(sale.totalAmount)}
              </div>
              <div className="recent-sales__date">
                {sale.items.reduce((total, item) => total + item.quantity, 0)} items
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentSales;