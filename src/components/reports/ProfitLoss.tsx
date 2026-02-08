import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Download, DollarSign } from 'lucide-react';
import { useSalesStore } from '../../lib/store/salesStore';
import { formatCurrency, getSalesTotal } from '../../lib/utils/utils';
import './reports.css';

const ProfitLoss: React.FC = () => {
  const { sales } = useSalesStore();
  const [dateRange, setDateRange] = useState('month');
  const [period, setPeriod] = useState('current');

  // Mock data for demonstration
  const totalRevenue = getSalesTotal(sales);
  const cogs = totalRevenue * 0.65; // 65% cost of goods sold
  const grossProfit = totalRevenue - cogs;
  
  const operatingExpenses = {
    rent: 150000,
    salaries: 450000,
    utilities: 75000,
    marketing: 120000,
    other: 50000
  };

  const totalExpenses = Object.values(operatingExpenses).reduce((sum, expense) => sum + expense, 0);
  const netProfit = grossProfit - totalExpenses;

  const previousPeriodData = {
    revenue: totalRevenue * 0.85,
    grossProfit: grossProfit * 0.88,
    netProfit: netProfit * 0.82
  };

  const getChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1 className="reports-title">Profit & Loss Statement</h1>
        <p className="reports-subtitle">
          Detailed breakdown of your revenue, costs, and profitability
        </p>
      </div>

      {/* Date Range Picker */}
      <div className="date-range-picker">
        <h3 className="date-range-title">Reporting Period</h3>
        <div className="date-range-options">
          {['month', 'quarter', 'year'].map((range) => (
            <button
              key={range}
              className={`date-option ${dateRange === range ? 'active' : ''}`}
              onClick={() => setDateRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
        <div className="date-range-options" style={{ marginTop: '0.5rem' }}>
          {['current', 'previous', 'ytd'].map((p) => (
            <button
              key={p}
              className={`date-option ${period === p ? 'active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {p === 'current' ? 'Current Period' : 
               p === 'previous' ? 'Previous Period' : 'Year to Date'}
            </button>
          ))}
        </div>
      </div>

      {/* Net Profit Summary */}
      <div className={`net-profit ${netProfit < 0 ? 'negative' : ''}`}>
        <p className="net-profit-label">Net Profit</p>
        <h2 className="net-profit-value">{formatCurrency(netProfit)}</h2>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          color: netProfit >= previousPeriodData.netProfit ? 'var(--reports-success)' : 'var(--reports-error)'
        }}>
          {netProfit >= previousPeriodData.netProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {Math.abs(getChange(netProfit, previousPeriodData.netProfit)).toFixed(1)}% from previous period
        </div>
      </div>

      {/* Income and Expenses */}
      <div className="profit-loss-grid">
        {/* Income Section */}
        <div className="income-section">
          <div className="section-header">
            <h3 className="section-title">Income</h3>
          </div>
          <div className="section-content">
            <div className="income-item">
              <span className="item-label">Total Revenue</span>
              <span className="item-value">{formatCurrency(totalRevenue)}</span>
            </div>
            <div className="income-item">
              <span className="item-label">Cost of Goods Sold</span>
              <span className="item-value">-{formatCurrency(cogs)}</span>
            </div>
            <div className="income-total">
              <span className="item-label">Gross Profit</span>
              <span className="item-value">{formatCurrency(grossProfit)}</span>
            </div>
            <div style={{ 
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--reports-text-light)',
              textAlign: 'center'
            }}>
              Gross Margin: {((grossProfit / totalRevenue) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="expenses-section">
          <div className="section-header">
            <h3 className="section-title">Operating Expenses</h3>
          </div>
          <div className="section-content">
            <div className="expense-item">
              <span className="item-label">Rent & Utilities</span>
              <span className="item-value">-{formatCurrency(operatingExpenses.rent + operatingExpenses.utilities)}</span>
            </div>
            <div className="expense-item">
              <span className="item-label">Salaries</span>
              <span className="item-value">-{formatCurrency(operatingExpenses.salaries)}</span>
            </div>
            <div className="expense-item">
              <span className="item-label">Marketing</span>
              <span className="item-value">-{formatCurrency(operatingExpenses.marketing)}</span>
            </div>
            <div className="expense-item">
              <span className="item-label">Other Expenses</span>
              <span className="item-value">-{formatCurrency(operatingExpenses.other)}</span>
            </div>
            <div className="expenses-total">
              <span className="item-label">Total Expenses</span>
              <span className="item-value">-{formatCurrency(totalExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="report-cards">
        <div className="report-card sales">
          <div className="report-card-content">
            <div className="report-card-info">
              <p className="report-card-label">Gross Profit Margin</p>
              <h3 className="report-card-value">{((grossProfit / totalRevenue) * 100).toFixed(1)}%</h3>
              <div className="report-card-change positive">
                <TrendingUp size={14} />
                2.1% improvement
              </div>
            </div>
            <div className="report-card-icon sales">
              📈
            </div>
          </div>
        </div>

        <div className="report-card">
          <div className="report-card-content">
            <div className="report-card-info">
              <p className="report-card-label">Operating Margin</p>
              <h3 className="report-card-value">{((netProfit / totalRevenue) * 100).toFixed(1)}%</h3>
              <div className="report-card-change positive">
                <TrendingUp size={14} />
                1.8% improvement
              </div>
            </div>
            <div className="report-card-icon inventory">
              💼
            </div>
          </div>
        </div>

        <div className="report-card profit">
          <div className="report-card-content">
            <div className="report-card-info">
              <p className="report-card-label">Expense Ratio</p>
              <h3 className="report-card-value">{((totalExpenses / totalRevenue) * 100).toFixed(1)}%</h3>
              <div className="report-card-change positive">
                <TrendingDown size={14} />
                1.2% reduction
              </div>
            </div>
            <div className="report-card-icon profit">
              📉
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Profitability Trend</h3>
            <p className="chart-subtitle">Monthly profit and loss progression</p>
          </div>
          <div className="chart-content">
            <div className="chart-placeholder">
              <div className="chart-placeholder-icon">💰</div>
              <p>Profitability trend chart</p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Line chart showing monthly P&L trends
              </p>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Expense Breakdown</h3>
            <p className="chart-subtitle">Distribution of operating expenses</p>
          </div>
          <div className="chart-content">
            <div className="chart-placeholder">
              <div className="chart-placeholder-icon">🍕</div>
              <p>Expense distribution</p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Pie chart showing expense categories
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Expense Breakdown */}
      <div className="data-table-section">
        <div className="table-header">
          <h3 className="table-title">Detailed Expense Analysis</h3>
          <div className="table-actions">
            <button className="export-btn">
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Expense Category</th>
              <th>Amount</th>
              <th>% of Revenue</th>
              <th>% of Expenses</th>
              <th>vs Previous</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(operatingExpenses).map(([category, amount]) => (
              <tr key={category}>
                <td style={{ textTransform: 'capitalize' }}>{category.replace(/([A-Z])/g, ' $1')}</td>
                <td>{formatCurrency(amount)}</td>
                <td>{((amount / totalRevenue) * 100).toFixed(1)}%</td>
                <td>{((amount / totalExpenses) * 100).toFixed(1)}%</td>
                <td style={{ 
                  color: amount <= (operatingExpenses as any)[category] * 0.95 ? 'var(--reports-success)' : 'var(--reports-error)',
                  fontWeight: '600'
                }}>
                  {amount <= (operatingExpenses as any)[category] * 0.95 ? '-5.2%' : '+3.8%'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfitLoss;