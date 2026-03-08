import React, { useEffect, useState } from 'react';
import { reportApi } from '../../lib/api/reportApi';
import { formatCurrency } from '../../lib/utils/utils';
import type { ProfitLossReportData, ReportFilters } from '../../types/reports';
import './reports.css';

interface ProfitLossProps {
  filters: ReportFilters;
}

const emptyState: ProfitLossReportData = {
  totalRevenue: 0,
  totalCost: 0,
  grossProfit: 0,
  operatingExpenses: 0,
  netProfit: 0,
  grossMargin: 0,
  netMargin: 0
};

const ProfitLoss: React.FC<ProfitLossProps> = ({ filters }) => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ProfitLossReportData>(emptyState);

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        const response = await reportApi.getProfitLossReport(filters);
        setReport({ ...emptyState, ...(response.data || {}) });
      } catch (error) {
        console.error('Failed to load profit and loss report:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadReport();
  }, [filters.endDate, filters.outletId, filters.period, filters.startDate]);

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1 className="reports-title">Profit &amp; Loss</h1>
        <p className="reports-subtitle">Revenue, cost, and margin tracking.</p>
      </div>

      {loading ? (
        <div className="reports-empty">
          <h3 className="reports-empty-text">Loading profit and loss report...</h3>
        </div>
      ) : (
        <>
          <div className="report-cards">
            <div className="report-card sales">
              <div className="report-card-content">
                <div className="report-card-info">
                  <p className="report-card-label">Revenue</p>
                  <h3 className="report-card-value">{formatCurrency(report.totalRevenue)}</h3>
                </div>
                <div className="report-card-icon sales">💰</div>
              </div>
            </div>
            <div className="report-card">
              <div className="report-card-content">
                <div className="report-card-info">
                  <p className="report-card-label">Gross Profit</p>
                  <h3 className="report-card-value">{formatCurrency(report.grossProfit)}</h3>
                  <div className="report-card-change positive">{report.grossMargin.toFixed(2)}% margin</div>
                </div>
                <div className="report-card-icon inventory">📊</div>
              </div>
            </div>
            <div className="report-card profit">
              <div className="report-card-content">
                <div className="report-card-info">
                  <p className="report-card-label">Net Profit</p>
                  <h3 className="report-card-value">{formatCurrency(report.netProfit)}</h3>
                  <div className="report-card-change positive">{report.netMargin.toFixed(2)}% margin</div>
                </div>
                <div className="report-card-icon profit">📉</div>
              </div>
            </div>
          </div>

          <div className="data-table-section">
            <table className="data-table">
              <tbody>
                <tr><td>Total Revenue</td><td>{formatCurrency(report.totalRevenue)}</td></tr>
                <tr><td>Total Cost</td><td>{formatCurrency(report.totalCost)}</td></tr>
                <tr><td>Gross Profit</td><td>{formatCurrency(report.grossProfit)}</td></tr>
                <tr><td>Operating Expenses</td><td>{formatCurrency(report.operatingExpenses)}</td></tr>
                <tr><td>Net Profit</td><td>{formatCurrency(report.netProfit)}</td></tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfitLoss;
