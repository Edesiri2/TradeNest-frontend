import React from 'react';
import { AlertTriangle, Plus } from 'lucide-react';
import { useInventoryStore } from '../../lib/store';
import { getLowStockProducts } from '../../lib/utils/utils';
import './dashboard.css';

const LowStockAlerts: React.FC = () => {
  const { products } = useInventoryStore();
  const lowStockProducts = getLowStockProducts(products);

  const handleRestock = (productId: string) => {
    // In a real app, this would open a restock modal or navigate to inventory
    console.log('Restock product:', productId);
    alert(`Restock functionality for product ${productId} would open here`);
  };

  if (lowStockProducts.length === 0) {
    return (
      <div className="low-stock-alerts">
        <div className="low-stock-alerts__header">
          <h3 className="low-stock-alerts__title">Low Stock Alerts</h3>
          <span className="low-stock-alerts__count">0</span>
        </div>
        <div className="dashboard-empty">
          <div className="dashboard-empty__icon">📦</div>
          <p className="dashboard-empty__text">All products are well stocked</p>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
            Great job managing your inventory!
          </p>
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
        {lowStockProducts.slice(0, 5).map((product, index) => (
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
              <p className="low-stock-alerts__stock-level">
                {product.currentStock} left
              </p>
              <p className="low-stock-alerts__stock-label">
                Alert at {product.lowStockAlert}
              </p>
            </div>
            <button 
              className="low-stock-alerts__action"
              onClick={() => handleRestock(product.id)}
            >
              <Plus size={14} style={{ marginRight: '0.25rem' }} />
              Restock
            </button>
          </li>
        ))}
      </ul>
      {lowStockProducts.length > 5 && (
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f3f4f6' }}>
          <button className="recent-sales__view-all" style={{ width: '100%', textAlign: 'center' }}>
            View All {lowStockProducts.length} Low Stock Items
          </button>
        </div>
      )}
    </div>
  );
};

export default LowStockAlerts;