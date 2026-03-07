import React, { useEffect, useMemo, useState } from 'react';
import { Download, Eye, Search } from 'lucide-react';
import { useSalesStore } from '../../lib/store/salesStore';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { formatCurrency, formatDate } from '../../lib/utils/utils';
import Receipt from './Receipt';
import './sales.css';

const getDateRange = (dateFilter: string) => {
  const now = new Date();

  if (dateFilter === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return { startDate: start, endDate: now };
  }

  if (dateFilter === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return { startDate: start, endDate: now };
  }

  if (dateFilter === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { startDate: start, endDate: now };
  }

  return {};
};

interface SalesHistoryProps {
  outletId?: string;
}

const SalesHistory: React.FC<SalesHistoryProps> = ({ outletId }) => {
  const { user } = useAuthStore();
  const { sales, loading, pagination, fetchSales } = useSalesStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const isSuperAdmin = user?.role?.name === 'super_admin';
  const activeOutletId = isSuperAdmin ? outletId : user?.outletId;

  useEffect(() => {
    if (!activeOutletId && !isSuperAdmin) {
      return;
    }

    const dateRange = getDateRange(dateFilter);
    void fetchSales({
      outletId: activeOutletId || undefined,
      paymentMethod: paymentFilter === 'all' ? undefined : paymentFilter,
      ...dateRange,
      page: currentPage,
      limit: 20,
      search: searchTerm || undefined
    });
  }, [activeOutletId, currentPage, dateFilter, fetchSales, isSuperAdmin, paymentFilter, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter, paymentFilter, outletId]);

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return '💵';
      case 'card': return '💳';
      case 'transfer': return '📲';
      case 'mobile': return '📱';
      default: return '💰';
    }
  };

  const exportRows = useMemo(
    () =>
      sales.map((sale) => ({
        id: sale.id,
        total: sale.totalAmount,
        paymentMethod: sale.paymentMethod,
        date: sale.createdAt instanceof Date ? sale.createdAt.toISOString() : sale.createdAt
      })),
    [sales]
  );

  const handleViewReceipt = (sale: any) => {
    setSelectedSale(sale);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(exportRows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sales-history-page-${pagination.currentPage || 1}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="sales">
      <div className="sales__header">
        <h1 className="sales__title">Sales History</h1>
        <p className="sales__subtitle">View and manage all sales transactions</p>
      </div>

      <div className="sales-history">
        <div className="sales-history__header">
          <h3 className="sales-history__title">
            Recent Transactions ({pagination.totalSales || sales.length})
          </h3>
          <div className="sales-history__filters">
            <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280'
                }}
              />
              <input
                type="text"
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  border: '1px solid var(--sales-border)',
                  borderRadius: '0.75rem',
                  backgroundColor: '#f8fafc',
                  fontSize: '0.875rem'
                }}
              />
            </div>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="sales-history__filter"
            >
              <option value="all">All Payments</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="transfer">Transfer</option>
              <option value="mobile">Mobile</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="sales-history__filter"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            <button
              onClick={handleExport}
              className="sales-history__filter"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {!activeOutletId && !isSuperAdmin ? (
          <div className="sales-empty">
            <p className="sales-empty__text">Select an outlet to load sales</p>
          </div>
        ) : loading && sales.length === 0 ? (
          <div className="sales-empty">
            <p className="sales-empty__text">Loading sales...</p>
          </div>
        ) : sales.length > 0 ? (
          <>
            <table className="sales-history__table">
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Products</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {sale.id}
                    </td>
                    <td>
                      <div style={{ maxWidth: '200px' }}>
                        <div
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {sale.items[0]?.productName}
                        </div>
                        {sale.items.length > 1 && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            +{sale.items.length - 1} more items
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{sale.items.reduce((total, item) => total + item.quantity, 0)}</td>
                    <td style={{ fontWeight: '600' }}>{formatCurrency(sale.totalAmount)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{getPaymentMethodIcon(sale.paymentMethod)}</span>
                        <span style={{ textTransform: 'capitalize' }}>{sale.paymentMethod}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {formatDate(new Date(sale.createdAt))}
                    </td>
                    <td>
                      <button
                        onClick={() => handleViewReceipt(sale)}
                        style={{
                          padding: '0.5rem',
                          border: '1px solid var(--sales-border)',
                          borderRadius: '0.5rem',
                          background: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.75rem'
                        }}
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={!pagination.hasPrev || loading}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  className="pagination-btn"
                  disabled={!pagination.hasNext || loading}
                  onClick={() => setCurrentPage((page) => page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="sales-empty">
            <div className="sales-empty__icon">📊</div>
            <p className="sales-empty__text">No sales found</p>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              Try adjusting your search filters
            </p>
          </div>
        )}
      </div>

      {selectedSale && (
        <div className="sales-modal-backdrop" onClick={() => setSelectedSale(null)}>
          <div className="sales-modal-content" onClick={(event) => event.stopPropagation()}>
            <Receipt
              sale={{
                id: selectedSale.id,
                items: selectedSale.items,
                totalAmount: selectedSale.totalAmount,
                taxAmount: selectedSale.taxAmount,
                discountAmount: selectedSale.discountAmount,
                paymentMethod: selectedSale.paymentMethod,
                createdAt: new Date(selectedSale.createdAt)
              }}
              onClose={() => setSelectedSale(null)}
              onPrint={() => setSelectedSale(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
