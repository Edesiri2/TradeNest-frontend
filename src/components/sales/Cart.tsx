import React from 'react';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useSalesStore } from '../../lib/store/salesStore';
import { formatCurrency } from '../../lib/utils/utils';
import './sales.css';

interface CartProps {
  onCheckout: () => void;
  onClearCart: () => void;
}

const Cart: React.FC<CartProps> = ({ onCheckout, onClearCart }) => {
  const { cart, updateCartItem, removeFromCart, getCartTotal, getCartItemCount } = useSalesStore();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateCartItem(productId, newQuantity);
    }
  };

  const subtotal = getCartTotal();
  const tax = subtotal * 0.075; // 7.5% VAT
  const total = subtotal + tax;

  if (cart.length === 0) {
    return (
      <div className="pos-cart">
        <div className="pos-cart__header">
          <h3 className="pos-cart__title">Shopping Cart</h3>
          <div className="pos-cart__customer">
            <ShoppingCart size={16} />
            <span>Cart is empty</span>
          </div>
        </div>
        <div className="sales-empty">
          <div className="sales-empty__icon">🛒</div>
          <p className="sales-empty__text">Your cart is empty</p>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
            Add products from the left to start a sale
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pos-cart">
      <div className="pos-cart__header">
        <h3 className="pos-cart__title">Shopping Cart</h3>
        <div className="pos-cart__customer">
          <ShoppingCart size={16} />
          <span>{getCartItemCount()} items</span>
        </div>
      </div>

      <ul className="pos-cart__items">
        {cart.map((item) => (
          <li key={item.productId} className="pos-cart__item">
            <div className="pos-cart__item-info">
              <h4 className="pos-cart__item-name">{item.productName}</h4>
              <p className="pos-cart__item-price">
                {formatCurrency(item.unitPrice)} each
              </p>
            </div>
            
            <div className="pos-cart__item-quantity">
              <button
                onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                className="pos-cart__quantity-btn"
              >
                <Minus size={14} />
              </button>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                className="pos-cart__quantity-input"
                min="1"
                max={item.stock}
              />
              <button
                onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                className="pos-cart__quantity-btn"
              >
                <Plus size={14} />
              </button>
            </div>
            
            <div className="pos-cart__item-total">
              {formatCurrency(item.total)}
            </div>
            
            <button
              onClick={() => removeFromCart(item.productId)}
              className="pos-cart__remove-btn"
              title="Remove item"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>

      <div className="pos-cart__summary">
        <div className="pos-cart__totals">
          <div className="pos-cart__total-row">
            <span className="pos-cart__total-label">Subtotal:</span>
            <span className="pos-cart__total-value">{formatCurrency(subtotal)}</span>
          </div>
          <div className="pos-cart__total-row">
            <span className="pos-cart__total-label">Tax (7.5%):</span>
            <span className="pos-cart__total-value">{formatCurrency(tax)}</span>
          </div>
          <div className="pos-cart__total-row pos-cart__total-row--grand">
            <span className="pos-cart__total-label">Total:</span>
            <span className="pos-cart__total-value">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="pos-cart__actions">
          <button
            onClick={onCheckout}
            className="pos-cart__action-btn pos-cart__action-btn--primary"
          >
            💳 Checkout ({formatCurrency(total)})
          </button>
          <button
            onClick={onClearCart}
            className="pos-cart__action-btn pos-cart__action-btn--secondary"
          >
            🗑️ Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;