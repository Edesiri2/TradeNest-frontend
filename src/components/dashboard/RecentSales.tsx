import React from 'react';
import { formatCurrency, formatDate } from '../../lib/utils/utils';
import type { Sale } from '../../types/sales';
import './dashboard.css';

interface RecentSalesProps {
  sales: Sale[];
}

const RecentSales: React.FC<RecentSalesProps> = ({ sales }) => {
  const recentSales = sales.slice(0, 5);

  if (recentSales.length === 0) {
    return (
      <div className="recent-sales">
        <div className="recent-sales__header">
          <h3 className="recent-sales__title">Recent Sales</h3>
        </div>
        <div className="dashboard-empty">
          <p className="dashboard-empty__text">No sales yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recent-sales">
      <div className="recent-sales__header">
        <h3 className="recent-sales__title">Recent Sales</h3>
      </div>
      <ul className="recent-sales__list">
        {recentSales.map((sale, index) => (
          <li key={sale.id} className="recent-sales__item">
            <div className="recent-sales__product">
              <div className="recent-sales__product-icon" style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.12), rgba(124,58,237,0.2))', color: 'var(--brand-primary-from)' }}>
                {(sale.items[0]?.productName || 'S').charAt(0).toUpperCase()}
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
              <div className="recent-sales__amount">{formatCurrency(sale.totalAmount)}</div>
              <div className="recent-sales__date">{sale.items.reduce((total, item) => total + item.quantity, 0)} items</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentSales;
