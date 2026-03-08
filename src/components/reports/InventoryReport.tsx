import React, { useEffect, useState } from 'react';
import { reportApi } from '../../lib/api/reportApi';
import { formatCurrency } from '../../lib/utils/utils';
import type { InventoryReportData, ReportFilters } from '../../types/reports';
import './reports.css';

interface InventoryReportProps {
  filters: ReportFilters;
}

const emptyState: InventoryReportData = {
  totalProducts: 0,
  lowStockCount: 0,
  outOfStockCount: 0,
  totalValue: 0,
  categoryBreakdown: []
};

const InventoryReport: React.FC<InventoryReportProps> = ({ filters }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<InventoryReportData>(emptyState);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        const response = await reportApi.getInventoryReport(filters);
        setReport({ ...emptyState, ...(response.data || {}) });
      } catch (error) {
        console.error('Failed to load inventory report:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadReport();
  }, [filters.endDate, filters.outletId, filters.period, filters.startDate]);

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1 className="reports-title">Inventory Report</h1>
        <p className="reports-subtitle">Stock value, low stock exposure, and category distribution.</p>
      </div>

      {loading ? (
        <div className="reports-empty">
          <h3 className="reports-empty-text">Loading inventory report...</h3>
        </div>
      ) : (
        <>
          <div className="report-cards">
            <div className="report-card">
              <div className="report-card-content">
                <div className="report-card-info">
                  <p className="report-card-label">Inventory Value</p>
                  <h3 className="report-card-value">{formatCurrency(report.totalValue)}</h3>
                </div>
                <div className="report-card-icon inventory">📦</div>
              </div>
            </div>
            <div className="report-card sales">
              <div className="report-card-content">
                <div className="report-card-info">
                  <p className="report-card-label">Total Products</p>
                  <h3 className="report-card-value">{report.totalProducts}</h3>
                </div>
                <div className="report-card-icon sales">🏷️</div>
              </div>
            </div>
            <div className="report-card profit">
              <div className="report-card-content">
                <div className="report-card-info">
                  <p className="report-card-label">Low / Out of Stock</p>
                  <h3 className="report-card-value">{report.lowStockCount} / {report.outOfStockCount}</h3>
                </div>
                <div className="report-card-icon profit">⚠️</div>
              </div>
            </div>
          </div>

          <div className="data-table-section">
            <div className="table-header">
              <h3 className="table-title">Category Breakdown</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Count</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {report.categoryBreakdown.map((entry) => (
                  <tr key={entry.category}>
                    <td>{entry.category}</td>
                    <td>{entry.count}</td>
                    <td>{formatCurrency(entry.value)}</td>
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

export default InventoryReport;
