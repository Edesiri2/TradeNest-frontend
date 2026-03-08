import React, { useEffect, useState } from 'react';
import { reportApi } from '../../lib/api/reportApi';
import type { CustomerAnalyticsData, ReportFilters } from '../../types/reports';
import './reports.css';

interface CustomerAnalyticsReportProps {
  filters: ReportFilters;
}

const emptyState: CustomerAnalyticsData = {
  totalCustomers: 0,
  loyaltyMembers: 0,
  totalLoyaltyPoints: 0,
  topCustomers: []
};

const CustomerAnalyticsReport: React.FC<CustomerAnalyticsReportProps> = ({ filters }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<CustomerAnalyticsData>(emptyState);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        const response = await reportApi.getCustomerAnalytics(filters);
        setReport({ ...emptyState, ...(response.data || {}) });
      } catch (error) {
        console.error('Failed to load customer analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadReport();
  }, [filters.endDate, filters.outletId, filters.period, filters.startDate]);

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1 className="reports-title">Customer Analytics</h1>
        <p className="reports-subtitle">Customer growth, loyalty adoption, and top customers.</p>
      </div>
      {loading ? (
        <div className="reports-empty">
          <h3 className="reports-empty-text">Loading customer analytics...</h3>
        </div>
      ) : (
        <>
          <div className="report-cards">
            <div className="report-card customers">
              <div className="report-card-content">
                <div className="report-card-info">
                  <p className="report-card-label">Customers</p>
                  <h3 className="report-card-value">{report.totalCustomers}</h3>
                </div>
                <div className="report-card-icon customers">👥</div>
              </div>
            </div>
            <div className="report-card sales">
              <div className="report-card-content">
                <div className="report-card-info">
                  <p className="report-card-label">Loyalty Members</p>
                  <h3 className="report-card-value">{report.loyaltyMembers}</h3>
                </div>
                <div className="report-card-icon sales">🎁</div>
              </div>
            </div>
            <div className="report-card profit">
              <div className="report-card-content">
                <div className="report-card-info">
                  <p className="report-card-label">Loyalty Points</p>
                  <h3 className="report-card-value">{report.totalLoyaltyPoints}</h3>
                </div>
                <div className="report-card-icon profit">⭐</div>
              </div>
            </div>
          </div>

          <div className="data-table-section">
            <div className="table-header">
              <h3 className="table-title">Top Customers</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Loyalty Number</th>
                  <th>Points</th>
                  <th>Total Purchases</th>
                </tr>
              </thead>
              <tbody>
                {report.topCustomers.map((customer) => (
                  <tr key={customer._id}>
                    <td>{customer.name}</td>
                    <td>{customer.loyaltyNumber || '-'}</td>
                    <td>{customer.loyaltyPoints}</td>
                    <td>{customer.totalPurchases || 0}</td>
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

export default CustomerAnalyticsReport;
