import React, { useState } from 'react';
import { Search, Filter, Eye, Download } from 'lucide-react';
import { useSalesStore } from '../../lib/store/salesStore';
import { formatCurrency, formatDate } from '../../lib/utils/utils';
import './sales.css';

const SalesHistory: React.FC = () => {
  const { sales } = useSalesStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Filter sales
  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.items.some(item => 
                           item.productName.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesPayment = paymentFilter === 'all' || sale.paymentMethod === paymentFilter;
    
    // Simple date filtering (in real app, this would be more sophisticated)
    const matchesDate = dateFilter === 'all' || true; // Implement proper date filtering
    
    return matchesSearch && matchesPayment && matchesDate;
  });

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return '💵';
      case 'card': return '💳';
      case 'transfer': return '📲';
      case 'mobile': return '📱';
      default: return '💰';
    }
  };

  const handleViewReceipt = (sale: any) => {
    // This would open a receipt modal or page
    console.log('View receipt:', sale);
    alert(`Receipt for sale ${sale.id} would open here`);
  };

  const handleExport = () => {
    // This would export sales data
    alert('Export functionality would be implemented here');
  };

  return (
    <div className="sales">
      <div className="sales__header">
        <h1 className="sales__title">Sales History</h1>
        <p className="sales__subtitle">
          View and manage all sales transactions
        </p>
      </div>

      <div className="sales-history">
        <div className="sales-history__header">
          <h3 className="sales-history__title">
            Recent Transactions ({filteredSales.length})
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

        {filteredSales.length > 0 ? (
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
              {filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {sale.id}
                  </td>
                  <td>
                    <div style={{ maxWidth: '200px' }}>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {sale.items[0]?.productName}
                      </div>
                      {sale.items.length > 1 && (
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          +{sale.items.length - 1} more items
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {sale.items.reduce((total, item) => total + item.quantity, 0)}
                  </td>
                  <td style={{ fontWeight: '600' }}>
                    {formatCurrency(sale.totalAmount)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{getPaymentMethodIcon(sale.paymentMethod)}</span>
                      <span style={{ textTransform: 'capitalize' }}>
                        {sale.paymentMethod}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {formatDate(sale.createdAt)}
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
        ) : (
          <div className="sales-empty">
            <div className="sales-empty__icon">📊</div>
            <p className="sales-empty__text">No sales found</p>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              {sales.length === 0 
                ? 'Start making sales to see them here' 
                : 'Try adjusting your search filters'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesHistory;