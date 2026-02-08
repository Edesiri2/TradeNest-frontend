import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Download, Filter } from 'lucide-react';
import { useSalesStore } from '../../lib/store/salesStore';
import { formatCurrency, getTodaySales, getSalesTotal, formatDate } from '../../lib/utils/utils';
import './reports.css';

const SalesReport: React.FC = () => {
  const { sales } = useSalesStore();
  const [dateRange, setDateRange] = useState('week');
  
  // Mock data for demonstration
  const salesData = {
    totalRevenue: getSalesTotal(sales),
    totalOrders: sales.length,
    averageOrder: sales.length > 0 ? getSalesTotal(sales) / sales.length : 0,
    todayRevenue: getSalesTotal(getTodaySales(sales)),
    growth: 12.5
  };

  const topProducts = [
    { name: 'Samsung Galaxy S23', quantity: 45, revenue: 2925000 },
    { name: 'iPhone 15 Pro', quantity: 32, revenue: 3040000 },
    { name: 'Nike Air Max 270', quantity: 28, revenue: 504000 },
    { name: 'Coca-Cola 24 Pack', quantity: 120, revenue: 300000 },
  ];

  const recentSales = sales.slice(0, 5);

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1 className="reports-title">Sales Report</h1>
        <p className="reports-subtitle">
          Comprehensive overview of your sales performance and revenue metrics
        </p>
      </div>

      {/* Date Range Picker */}
      <div className="date-range-picker">
        <h3 className="date-range-title">Date Range</h3>
        <div className="date-range-options">
          {['today', 'week', 'month', 'quarter', 'year'].map((range) => (
            <button
              key={range}
              className={`date-option ${dateRange === range ? 'active' : ''}`}
              onClick={() => setDateRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
        <div className="date-range-custom">
          <input type="date" className="date-input" />
          <span>to</span>
          <input type="date" className="date-input" />
          <button className="date-option">
            <Filter size={14} />
            Apply
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="report-cards">
        <div className="report-card sales">
          <div className="report-card-content">
            <div className="report-card-info">
              <p className="report-card-label">Total Revenue</p>
              <h3 className="report-card-value">{formatCurrency(salesData.totalRevenue)}</h3>
              <div className={`report-card-change ${salesData.growth > 0 ? 'positive' : 'negative'}`}>
                {salesData.growth > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(salesData.growth)}% from last period
              </div>
            </div>
            <div className="report-card-icon sales">
              💰
            </div>
          </div>
        </div>

        <div className="report-card">
          <div className="report-card-content">
            <div className="report-card-info">
              <p className="report-card-label">Total Orders</p>
              <h3 className="report-card-value">{salesData.totalOrders}</h3>
              <div className="report-card-change positive">
                <TrendingUp size={14} />
                8.2% from last period
              </div>
            </div>
            <div className="report-card-icon inventory">
              📦
            </div>
          </div>
        </div>

        <div className="report-card profit">
          <div className="report-card-content">
            <div className="report-card-info">
              <p className="report-card-label">Average Order</p>
              <h3 className="report-card-value">{formatCurrency(salesData.averageOrder)}</h3>
              <div className="report-card-change positive">
                <TrendingUp size={14} />
                5.7% from last period
              </div>
            </div>
            <div className="report-card-icon profit">
              📊
            </div>
          </div>
        </div>

        <div className="report-card customers">
          <div className="report-card-content">
            <div className="report-card-info">
              <p className="report-card-label">Today's Revenue</p>
              <h3 className="report-card-value">{formatCurrency(salesData.todayRevenue)}</h3>
              <div className="report-card-change positive">
                <TrendingUp size={14} />
                15.3% from yesterday
              </div>
            </div>
            <div className="report-card-icon customers">
              🎯
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Revenue Trend</h3>
            <p className="chart-subtitle">Daily revenue over the selected period</p>
          </div>
          <div className="chart-content">
            <div className="chart-placeholder">
              <div className="chart-placeholder-icon">📈</div>
              <p>Revenue chart visualization</p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Chart would show daily revenue trends here
              </p>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Sales by Category</h3>
            <p className="chart-subtitle">Revenue distribution across product categories</p>
          </div>
          <div className="chart-content">
            <div className="chart-placeholder">
              <div className="chart-placeholder-icon">🍕</div>
              <p>Category distribution chart</p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Pie chart showing sales by category
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="data-table-section">
        <div className="table-header">
          <h3 className="table-title">Top Selling Products</h3>
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
              <th>Quantity Sold</th>
              <th>Revenue</th>
              <th>% of Total</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((product, index) => (
              <tr key={index}>
                <td>{product.name}</td>
                <td>{product.quantity}</td>
                <td>{formatCurrency(product.revenue)}</td>
                <td>{((product.revenue / salesData.totalRevenue) * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Sales */}
      <div className="data-table-section">
        <div className="table-header">
          <h3 className="table-title">Recent Transactions</h3>
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
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Payment Method</th>
            </tr>
          </thead>
          <tbody>
            {recentSales.map((sale) => (
              <tr key={sale.id}>
                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {sale.id}
                </td>
                <td>{formatDate(sale.createdAt)}</td>
                <td>Walk-in Customer</td>
                <td style={{ fontWeight: '600' }}>
                  {formatCurrency(sale.totalAmount)}
                </td>
                <td>
                  <span style={{ textTransform: 'capitalize' }}>
                    {sale.paymentMethod}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesReport;