import React, { useEffect, useMemo, useState } from 'react';
import { X, CreditCard, Smartphone, Banknote, SmartphoneCharging, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useSalesStore } from '../../lib/store/salesStore';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { useSettingsStore } from '../../lib/store/useSettingsStore';
import { useCustomerStore } from '../../lib/store/useCustomerStore';
import { computeCheckoutSummary } from '../../lib/utils/checkout';
import { formatCurrency } from '../../lib/utils/utils';
import { Button } from '../ui';
import Receipt from './Receipt';
import './sales.css';

interface PaymentModalProps {
  totalAmount: number;
  onClose: () => void;
  onPaymentComplete: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, onPaymentComplete }) => {
  const { user } = useAuthStore();
  const { settings, fetchSettings } = useSettingsStore();
  const { findByLoyaltyNumber } = useCustomerStore();
  const { cart, createSale, clearCart, selectedCustomer, loading } = useSalesStore();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentSale, setCurrentSale] = useState<any>(null);
  const [loyaltyNumber, setLoyaltyNumber] = useState('');
  const [loyaltyCustomer, setLoyaltyCustomer] = useState<any>(null);
  const [loyaltyLookupLoading, setLoyaltyLookupLoading] = useState(false);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  const summary = useMemo(
    () => computeCheckoutSummary(cart, settings, Boolean(loyaltyCustomer || selectedCustomer)),
    [cart, loyaltyCustomer, selectedCustomer, settings]
  );

  const paymentMethods = [
    { id: 'cash', name: 'Cash', icon: Banknote, color: '#10b981' },
    { id: 'card', name: 'Card', icon: CreditCard, color: '#3b82f6' },
    { id: 'transfer', name: 'Transfer', icon: SmartphoneCharging, color: '#8b5cf6' },
    { id: 'mobile', name: 'Mobile Money', icon: Smartphone, color: '#f59e0b' }
  ];

  const activeCustomer = loyaltyCustomer || selectedCustomer;

  const handleLoyaltyLookup = async () => {
    if (!loyaltyNumber.trim()) {
      toast.error('Enter a loyalty number first');
      return;
    }

    setLoyaltyLookupLoading(true);
    const customer = await findByLoyaltyNumber(loyaltyNumber.trim());
    setLoyaltyLookupLoading(false);

    if (!customer) {
      toast.error('No customer found for this loyalty number');
      return;
    }

    setLoyaltyCustomer(customer);
    toast.success(`Loyalty customer loaded: ${customer.name}`);
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method');
      return;
    }

    if (!user?.id || !user?.outletId) {
      toast.error('User outlet information is missing.');
      return;
    }

    try {
      const sale = await createSale({
        outletId: user.outletId,
        userId: user.id,
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: summary.lines[item.productId]?.total || item.total,
          subtotal: summary.lines[item.productId]?.subtotal || item.total,
          vatAmount: summary.lines[item.productId]?.vatAmount || 0,
          isVatable: item.isVatable,
          isVatInclusive: item.isVatInclusive
        })),
        totalAmount: summary.total,
        taxAmount: summary.totalVat,
        discountAmount: 0,
        paymentMethod: selectedMethod as 'cash' | 'card' | 'transfer' | 'mobile',
        customerId: activeCustomer?.id,
        loyaltyNumber: activeCustomer?.loyaltyNumber || loyaltyNumber || undefined,
        loyaltyBonusAmount: summary.loyaltyBonusAmount,
        vatableAmount: summary.vatableSubtotal,
        nonVatableAmount: summary.nonVatableSubtotal,
        notes: `Payment completed via ${selectedMethod}`
      });

      setCurrentSale(sale);
      setShowReceipt(true);
      clearCart();
    } catch (error: any) {
      toast.error(error.message || 'Payment failed. Please try again.');
    }
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    onPaymentComplete();
  };

  if (showReceipt && currentSale) {
    return (
      <div className="sales-modal-backdrop">
        <div className="sales-modal-content">
          <Receipt sale={currentSale} onClose={handleReceiptClose} onPrint={handleReceiptClose} />
        </div>
      </div>
    );
  }

  return (
    <div className="sales-modal-backdrop">
      <div className="payment-modal">
        <div className="payment-modal__header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 className="payment-modal__title">Complete Payment</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', padding: '0.5rem', color: '#6b7280', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="payment-modal__content">
          <div className="payment-modal__amount">
            <p className="payment-modal__amount-label">Total Amount</p>
            <h3 className="payment-modal__amount-value">{formatCurrency(summary.total)}</h3>
            <p className="payment-modal__amount-label">
              VAT: {formatCurrency(summary.totalVat)} • Vatable: {formatCurrency(summary.vatableSubtotal)} • Non-vatable: {formatCurrency(summary.nonVatableSubtotal)}
            </p>
          </div>

          <div style={{ marginBottom: '1.25rem', display: 'grid', gap: '0.75rem' }}>
            {cart.map((item) => {
              const line = summary.lines[item.productId];
              return (
                <div key={item.productId} style={{ border: '1px solid var(--sales-border)', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.productName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        {item.isVatable ? (item.isVatInclusive ? 'Vatable • VAT Inclusive' : 'Vatable • VAT Exclusive') : 'Non-vatable'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '0.875rem' }}>
                      <div>{formatCurrency(line?.total || item.total)}</div>
                      <div style={{ color: '#6b7280' }}>VAT {formatCurrency(line?.vatAmount || 0)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {settings.sales.loyaltyEnabled && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="product-form__label">Loyalty Number</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="text"
                  value={loyaltyNumber}
                  onChange={(event) => setLoyaltyNumber(event.target.value)}
                  className="product-form__input"
                  placeholder="Enter loyalty number"
                />
                <Button type="button" variant="outline" onClick={handleLoyaltyLookup} disabled={loyaltyLookupLoading}>
                  <Search size={16} />
                  {loyaltyLookupLoading ? 'Checking...' : 'Lookup'}
                </Button>
              </div>
              {activeCustomer && (
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#16a34a' }}>
                  Loyalty customer: {activeCustomer.name} • Bonus {settings.sales.loyaltyBonusPercentage}%
                </p>
              )}
            </div>
          )}

          <div className="payment-modal__methods">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                className={`payment-modal__method ${selectedMethod === method.id ? 'payment-modal__method--selected' : ''}`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <method.icon size={24} className="payment-modal__method-icon" style={{ color: method.color }} />
                <span className="payment-modal__method-name">{method.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="payment-modal__footer">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePayment} disabled={!selectedMethod || loading}>
            {loading ? 'Processing...' : 'Complete Payment'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
