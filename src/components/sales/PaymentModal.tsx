import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Banknote, SmartphoneCharging } from 'lucide-react';
import { useSalesStore } from '../../lib/store/salesStore';
import { formatCurrency } from '../../lib/utils/utils';
import { Button } from '../ui';
import Receipt from './Receipt';
import './sales.css';

interface PaymentModalProps {
  totalAmount: number;
  onClose: () => void;
  onPaymentComplete: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
  totalAmount, 
  onClose, 
  onPaymentComplete 
}) => {
  const { cart, createSale, clearCart, getCartTotal } = useSalesStore();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentSale, setCurrentSale] = useState<any>(null);

  const paymentMethods = [
    {
      id: 'cash',
      name: 'Cash',
      icon: Banknote,
      color: '#10b981'
    },
    {
      id: 'card',
      name: 'Card',
      icon: CreditCard,
      color: '#3b82f6'
    },
    {
      id: 'transfer',
      name: 'Transfer',
      icon: SmartphoneCharging,
      color: '#8b5cf6'
    },
    {
      id: 'mobile',
      name: 'Mobile Money',
      icon: Smartphone,
      color: '#f59e0b'
    }
  ];

 const handlePayment = async () => {
  if (!selectedMethod) {
    alert('Please select a payment method');
    return;
  }

  try {
    // Prepare sale data according to your CreateSaleData interface
    const saleData = {
      outletId: 'default-outlet', // TODO: Get from your app context
      userId: 'current-user',     // TODO: Get from authentication
      items: cart.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      totalAmount: totalAmount,
      taxAmount: 0, // Calculate this based on your business logic
      discountAmount: 0, // Calculate this based on your business logic
      paymentMethod: selectedMethod as 'cash' | 'card' | 'transfer' | 'mobile',
      customerId: undefined, // You can add customer selection to your UI
      notes: `Payment completed via ${selectedMethod}`,
    };

    const sale = await createSale(saleData);
    
    setCurrentSale(sale);
    setShowReceipt(true);
    clearCart();
    
  } catch (error) {
    alert('Payment failed. Please try again.');
    console.error('Payment error:', error);
  }
};

  const handleReceiptClose = () => {
    setShowReceipt(false);
    onPaymentComplete();
  };

  if (showReceipt && currentSale) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        zIndex: 1000
      }}>
        <Receipt 
          sale={currentSale} 
          onClose={handleReceiptClose}
          onPrint={handleReceiptClose}
        />
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 1000
    }}>
      <div className="payment-modal">
        <div className="payment-modal__header">
          <h2 className="payment-modal__title">Complete Payment</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              color: '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="payment-modal__content">
          <div className="payment-modal__amount">
            <p className="payment-modal__amount-label">Total Amount</p>
            <h3 className="payment-modal__amount-value">
              {formatCurrency(totalAmount)}
            </h3>
          </div>

          <div className="payment-modal__methods">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                className={`payment-modal__method ${
                  selectedMethod === method.id ? 'payment-modal__method--selected' : ''
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <method.icon 
                  size={24} 
                  className="payment-modal__method-icon"
                  style={{ color: method.color }}
                />
                <span className="payment-modal__method-name">{method.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="payment-modal__footer">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handlePayment}
            disabled={!selectedMethod}
          >
            Complete Payment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;