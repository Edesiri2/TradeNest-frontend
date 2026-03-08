import React from 'react';
import { AlertTriangle } from 'lucide-react';
import './dashboard.css';

interface LowStockAlertsProps {
  products: Array<{
    id: string;
    name: string;
    sku: string;
    currentStock: number;
    lowStockAlert: number;
  }>;
}

const LowStockAlerts: React.FC<LowStockAlertsProps> = ({ products }) => {
  const lowStockProducts = products.filter((product) => product.currentStock <= product.lowStockAlert).slice(0, 5);

  if (lowStockProducts.length === 0) {
    return (
      <div className="low-stock-alerts">
        <div className="low-stock-alerts__header">
          <h3 className="low-stock-alerts__title">Low Stock Alerts</h3>
          <span className="low-stock-alerts__count">0</span>
        </div>
        <div className="dashboard-empty">
          <p className="dashboard-empty__text">All products are well stocked</p>
        </div>
      </div>
    );
  }

  return (
    <div className="low-stock-alerts">
      <div className="low-stock-alerts__header">
        <h3 className="low-stock-alerts__title">Low Stock Alerts</h3>
        <span className="low-stock-alerts__count">{lowStockProducts.length}</span>
      </div>
      <ul className="low-stock-alerts__list">
        {lowStockProducts.map((product) => (
          <li key={product.id} className="low-stock-alerts__item">
            <div className="low-stock-alerts__product">
              <div className="low-stock-alerts__product-icon">
                <AlertTriangle size={16} />
              </div>
              <div className="low-stock-alerts__product-info">
                <h4 className="low-stock-alerts__product-name">{product.name}</h4>
                <p className="low-stock-alerts__product-sku">{product.sku}</p>
              </div>
            </div>
            <div className="low-stock-alerts__stock">
              <p className="low-stock-alerts__stock-level">{product.currentStock} left</p>
              <p className="low-stock-alerts__stock-label">Alert at {product.lowStockAlert}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LowStockAlerts;
