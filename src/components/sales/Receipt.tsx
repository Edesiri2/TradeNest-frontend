import React from 'react';
import { formatCurrency, formatDate } from '../../lib/utils/utils';
import './sales.css';

interface ReceiptProps {
  sale: {
    id: string;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    totalAmount: number;
    taxAmount: number;
    discountAmount: number;
    paymentMethod: string;
    createdAt: Date;
  };
  onClose?: () => void;
  onPrint?: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ sale, onClose, onPrint }) => {
  const subtotal = sale.totalAmount - sale.taxAmount + sale.discountAmount;

  const handlePrint = () => {
    window.print();
    onPrint?.();
  };

  return (
    <div className="receipt">
      <div className="receipt__header">
        <h2 className="receipt__title">TRADENEST</h2>
        <p className="receipt__info">Point of Sale Receipt</p>
        <p className="receipt__info">
          Sale #: {sale.id}<br />
          Date: {formatDate(sale.createdAt)}<br />
          Payment: {sale.paymentMethod}
        </p>
      </div>

      <div className="receipt__items">
        {sale.items.map((item, index) => (
          <div key={index} className="receipt__item">
            <div>
              <h4 className="receipt__item-name">{item.productName}</h4>
              <p className="receipt__item-details">
                {item.quantity} x {formatCurrency(item.unitPrice)}
              </p>
            </div>
            <div className="receipt__item-total">
              {formatCurrency(item.total)}
            </div>
          </div>
        ))}
      </div>

      <div className="receipt__totals">
        <div className="receipt__total-row">
          <span className="receipt__total-label">Subtotal:</span>
          <span className="receipt__total-value">{formatCurrency(subtotal)}</span>
        </div>
        
        {sale.discountAmount > 0 && (
          <div className="receipt__total-row">
            <span className="receipt__total-label">Discount:</span>
            <span className="receipt__total-value">-{formatCurrency(sale.discountAmount)}</span>
          </div>
        )}
        
        <div className="receipt__total-row">
          <span className="receipt__total-label">Tax (7.5%):</span>
          <span className="receipt__total-value">{formatCurrency(sale.taxAmount)}</span>
        </div>
        
        <div className="receipt__total-row receipt__total-row--grand">
          <span className="receipt__total-label">TOTAL:</span>
          <span className="receipt__total-value">{formatCurrency(sale.totalAmount)}</span>
        </div>
      </div>

      <div className="receipt__footer">
        <p className="receipt__thank-you">
          Thank you for your business!
        </p>
        <p className="receipt__contact">
          Contact: support@tradenest.com<br />
          Phone: +234 800 000 0000
        </p>
      </div>

      {(onClose || onPrint) && (
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginTop: '2rem',
          justifyContent: 'center' 
        }}>
          {onPrint && (
            <button
              onClick={handlePrint}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid var(--sales-primary)',
                borderRadius: '0.5rem',
                background: 'var(--sales-primary)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              🖨️ Print Receipt
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                border: '1px solid var(--sales-border)',
                borderRadius: '0.5rem',
                background: 'white',
                color: 'var(--sales-text)',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Close
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Receipt;