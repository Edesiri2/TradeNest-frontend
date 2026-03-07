import React, { useEffect, useMemo, useState } from 'react';
import { useSalesStore } from '../../lib/store/salesStore';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { formatCurrency } from '../../lib/utils/utils';
import './sales.css';

interface SalesAnalyticsProps {
  outletId?: string;
}

const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({ outletId }) => {
  const { user } = useAuthStore();
  const { analytics, loading, fetchSalesAnalytics } = useSalesStore();
  const [period, setPeriod] = useState('month');
  const isSuperAdmin = user?.role?.name === 'super_admin';
  const activeOutletId = isSuperAdmin ? outletId : user?.outletId;

  useEffect(() => {
    if (!activeOutletId && !isSuperAdmin) {
      return;
    }

    void fetchSalesAnalytics({
      period,
      outletId: activeOutletId || undefined
    });
  }, [activeOutletId, fetchSalesAnalytics, isSuperAdmin, period]);

  const totalRevenue = useMemo(
    () => (analytics?.salesByPayment || []).reduce((sum, item) => sum + Number(item.totalAmount || 0), 0),
    [analytics]
  );
  const totalSalesCount = useMemo(
    () => (analytics?.salesByPayment || []).reduce((sum, item) => sum + Number(item.count || 0), 0),
    [analytics]
  );
  const averageSale = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

  return (
    <div className="sales">
      <div className="sales__header">
        <h1 className="sales__title">Sales Analytics</h1>
        <p className="sales__subtitle">Detailed insights and sales performance metrics</p>
      </div>

      <div className="sales-history">
        <div className="sales-history__header">
          <h3 className="sales-history__title">Analytics Overview</h3>
          <div className="sales-history__filters">
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="sales-history__filter"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {!activeOutletId && !isSuperAdmin ? (
          <div className="sales-empty">
            <p className="sales-empty__text">Select an outlet to load analytics</p>
          </div>
        ) : loading && !analytics ? (
          <div className="sales-empty">
            <p className="sales-empty__text">Loading analytics...</p>
          </div>
        ) : analytics ? (
          <>
            <div className="summary-cards">
              <div className="summary-card">
                <div className="summary-card__value">{totalSalesCount}</div>
                <div className="summary-card__label">Sales Count</div>
              </div>
              <div className="summary-card">
                <div className="summary-card__value">{formatCurrency(totalRevenue)}</div>
                <div className="summary-card__label">Revenue</div>
              </div>
              <div className="summary-card">
                <div className="summary-card__value">{formatCurrency(averageSale)}</div>
                <div className="summary-card__label">Average Sale</div>
              </div>
              <div className="summary-card">
                <div className="summary-card__value">{analytics.dailySales?.length || 0}</div>
                <div className="summary-card__label">Active Days</div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h4>
              {analytics.topProducts?.length ? (
                <div className="space-y-3">
                  {analytics.topProducts.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{product.productName}</div>
                        <div className="text-sm text-gray-500">
                          {product.totalQuantity} units sold
                        </div>
                      </div>
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(product.totalRevenue)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sales-empty">
                  <p className="sales-empty__text">No product analytics available</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Sales by Payment</h4>
              {(analytics.salesByPayment || []).length ? (
                <div className="space-y-3">
                  {analytics.salesByPayment.map((entry) => (
                    <div key={entry._id} className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
                      <div className="capitalize font-medium text-gray-900">{entry._id}</div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatCurrency(entry.totalAmount)}</div>
                        <div className="text-sm text-gray-500">{entry.count} sales</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sales-empty">
                  <p className="sales-empty__text">No payment analytics available</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="sales-empty">
            <p className="sales-empty__text">No analytics data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesAnalytics;
