import React, { useState } from 'react';
import { AlertTriangle, Package, TrendingDown, Download } from 'lucide-react';
import { useInventoryStore } from '../../lib/store';
import { formatCurrency, getLowStockProducts, getTotalInventoryValue } from '../../lib/utils/utils';
import './reports.css';

const InventoryReport: React.FC = () => {
  const { products } = useInventoryStore();
  const [dateRange, setDateRange] = useState('month');

  const lowStockProducts = getLowStockProducts(products);
  const totalValue = getTotalInventoryValue(products);
  const totalProducts = products.length;
  const outOfStock = products.filter(p => p.currentStock === 0).length;
  
  const inventoryStats = {
    totalValue,
    totalProducts,
    lowStock: lowStockProducts.length,
    outOfStock,
    turnoverRate: 4.2 // Mock data
  };

  const categoryBreakdown = products.reduce((acc: any, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = { count: 0, value: 0 };
    }
    acc[category].count += 1;
    acc[category].value += product.costPrice * product.currentStock;
    return acc;
  }, {});

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1 className="reports-title">Inventory Report</h1>
        <p className="reports-subtitle">
          Complete overview of your inventory status, stock levels, and valuation
        </p>
      </div>

      {/* Date Range Picker */}
      <div className="date-range-picker">
        <h3 className="date-range-title">Report Period</h3>
        <div className="date-range-options">
          {['week', 'month', 'quarter', 'year'].map((range) => (
            <button
              key={range}
              className={`date-option ${dateRange === range ? 'active' : ''}`}
              onClick={() => setDateRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Level Overview */}
      <div className="inventory-stats">
        <div className="stock-level-card">
          <div className="stock-level-icon low">
            <AlertTriangle size={24} />
          </div>
          <h3 className="stock-level-count">{inventoryStats.lowStock}</h3>
          <p className="stock-level-label">Low Stock Items</p>
        </div>

        <div className="stock-level-card">
          <div className="stock-level-icon medium">
            <Package size={24} />
          </div>
          <h3 className="stock-level-count">{inventoryStats.outOfStock}</h3>
          <p className="stock-level-label">Out of Stock</p>
        </div>

        <div className="stock-level-card">
          <div className="stock-level-icon good">
            <TrendingDown size={24} />
          </div>
          <h3 className="stock-level-count">{inventoryStats.turnoverRate}x</h3>
          <p className="stock-level-label">Turnover Rate</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="report-cards">
        <div className="report-card">
          <div className="report-card-content">
            <div className="report-card-info">
              <p className="report-card-label">Total Inventory Value</p>
              <h3 className="report-card-value">{formatCurrency(inventoryStats.totalValue)}</h3>
              <div className="report-card-change positive">
                <TrendingDown size={14} />
                3.2% from last month
              </div>
            </div>
            <div className="report-card-icon inventory">
              💰
            </div>
          </div>
        </div>

        <div className="report-card">
          <div className="report-card-content">
            <div className="report-card-info">
              <p className="report-card-label">Total Products</p>
              <h3 className="report-card-value">{inventoryStats.totalProducts}</h3>
              <div className="report-card-change positive">
                <TrendingDown size={14} />
                12 new products
              </div>
            </div>
            <div className="report-card-icon sales">
              📦
            </div>
          </div>
        </div>

        <div className="report-card profit">
          <div className="report-card-content">
            <div className="report-card-info">
              <p className="report-card-label">Stock Turnover</p>
              <h3 className="report-card-value">{inventoryStats.turnoverRate}x</h3>
              <div className="report-card-change positive">
                <TrendingDown size={14} />
                0.8x improvement
              </div>
            </div>
            <div className="report-card-icon profit">
              🔄
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Inventory Value by Category</h3>
            <p className="chart-subtitle">Distribution of inventory value across categories</p>
          </div>
          <div className="chart-content">
            <div className="chart-placeholder">
              <div className="chart-placeholder-icon">📊</div>
              <p>Category value distribution</p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Chart showing inventory value by category
              </p>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Stock Movement</h3>
            <p className="chart-subtitle">Inventory changes over time</p>
          </div>
          <div className="chart-content">
            <div className="chart-placeholder">
              <div className="chart-placeholder-icon">📈</div>
              <p>Stock movement trends</p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Line chart showing inventory changes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="data-table-section">
        <div className="table-header">
          <h3 className="table-title">Low Stock Alerts ({lowStockProducts.length})</h3>
          <div className="table-actions">
            <button className="export-btn">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Current Stock</th>
              <th>Alert Level</th>
              <th>Category</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {lowStockProducts.slice(0, 10).map((product) => (
              <tr key={product.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertTriangle size={16} style={{ color: 'var(--reports-error)' }} />
                    {product.name}
                  </div>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {product.sku}
                </td>
                <td style={{ color: 'var(--reports-error)', fontWeight: '600' }}>
                  {product.currentStock}
                </td>
                <td>{product.lowStockAlert}</td>
                <td>{product.category}</td>
                <td>{formatCurrency(product.costPrice * product.currentStock)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Category Breakdown */}
      <div className="data-table-section">
        <div className="table-header">
          <h3 className="table-title">Category Breakdown</h3>
          <div className="table-actions">
            <button className="export-btn">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Number of Products</th>
              <th>Total Value</th>
              <th>% of Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(categoryBreakdown).map(([category, data]: [string, any]) => (
              <tr key={category}>
                <td>{category}</td>
                <td>{data.count}</td>
                <td>{formatCurrency(data.value)}</td>
                <td>{((data.value / totalValue) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryReport;