import React, { useEffect, useState } from 'react';
import { Download, TrendingUp } from 'lucide-react';
import { reportApi } from '../../lib/api/reportApi';
import { formatCurrency } from '../../lib/utils/utils';
import type { ReportFilters, SalesReportData } from '../../types/reports';
import './reports.css';

interface SalesReportProps {
  filters: ReportFilters;
}

const emptyState: SalesReportData = {
  totalRevenue: 0,
  totalOrders: 0,
  averageOrderValue: 0,
  salesByPayment: [],
  topProducts: []
};

const SalesReport: React.FC<SalesReportProps> = ({ filters }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<SalesReportData>(emptyState);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        const response = await reportApi.getSalesReport(filters);
        setReport({ ...emptyState, ...(response.data || {}) });
      } catch (error) {
        console.error('Failed to load sales report:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadReport();
  }, [filters.endDate, filters.outletId, filters.period, filters.startDate]);

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1 className="reports-title">Sales Report</h1>
        <p className="reports-subtitle">Revenue, payment mix, and top selling products.</p>
      </div>

      {loading ? (
        <div className="reports-empty">
          <h3 className="reports-empty-text">Loading sales report...</h3>
        </div>
      ) : (
        <>
          <div className="report-cards">
            <div className="report-card sales">
              <div className="report-card-content">
                <div className="report-card-info">
                  <p className="report-card-label">Total Revenue</p>
                  <h3 className="report-card-value">{formatCurrency(report.totalRevenue)}</h3>
                  <div className="report-card-change positive">
                    <TrendingUp size={14} />
                    {report.totalOrders} orders
                  </div>
                </div>
                <div className="report-card-icon sales">💳</div>
              </div>
            </div>
            <div className="report-card">
              <div className="report-card-content">
                <div className="report-card-info">
                  <p className="report-card-label">Average Order</p>
                  <h3 className="report-card-value">{formatCurrency(report.averageOrderValue)}</h3>
                </div>
                <div className="report-card-icon inventory">📈</div>
              </div>
            </div>
            <div className="report-card profit">
              <div className="report-card-content">
                <div className="report-card-info">
                  <p className="report-card-label">Payment Channels</p>
                  <h3 className="report-card-value">{report.salesByPayment.length}</h3>
                </div>
                <div className="report-card-icon profit">🏦</div>
              </div>
            </div>
          </div>

          <div className="data-table-section">
            <div className="table-header">
              <h3 className="table-title">Sales by Payment</h3>
              <button className="export-btn">
                <Download size={16} />
                Export
              </button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment Method</th>
                  <th>Transactions</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {report.salesByPayment.map((entry) => (
                  <tr key={entry._id}>
                    <td style={{ textTransform: 'capitalize' }}>{entry._id}</td>
                    <td>{entry.count}</td>
                    <td>{formatCurrency(entry.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="data-table-section">
            <div className="table-header">
              <h3 className="table-title">Top Products</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {report.topProducts.map((product) => (
                  <tr key={product._id}>
                    <td>{product.productName}</td>
                    <td>{product.totalQuantity}</td>
                    <td>{formatCurrency(product.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesReport;
