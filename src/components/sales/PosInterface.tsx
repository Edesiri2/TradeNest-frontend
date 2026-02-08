import React, { useState } from 'react';
import { Search, Package } from 'lucide-react';
import {productStore as useInventoryStore } from '../../lib/store/productStore';
import { useSalesStore } from '../../lib/store/salesStore';
import { formatCurrency } from '../../lib/utils/utils';
import Cart from './Cart';
import PaymentModal from './PaymentModal';
import './sales.css';

const PosInterface: React.FC = () => {
  const { products } = useInventoryStore();
  const { addToCart } = useSalesStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Get unique categories
  const categories = ['all', ...new Set(products.map(p => p.category))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: any) => {
    if (product.currentStock === 0) {
      alert('This product is out of stock');
      return;
    }

    addToCart({
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitPrice: product.sellingPrice,
      stock: product.currentStock
    });
  };

  const getProductIcon = (productName: string) => {
    return productName.charAt(0).toUpperCase();
  };

  const handleCheckout = () => {
    setShowPaymentModal(true);
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear the cart?')) {
      // This would be implemented in the store
      console.log('Clear cart functionality');
    }
  };

  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    // Clear cart or show success message
  };

  return (
    <div className="sales">
      <div className="sales__header">
        <h1 className="sales__title">Point of Sale</h1>
        <p className="sales__subtitle">
          Quick and easy sales transactions
        </p>
      </div>

      <div className="pos-interface">
        {/* Products Grid */}
        <div className="pos-products">
          <div className="pos-products__header">
            <h3 className="pos-products__title">Products</h3>
            <div className="pos-products__search">
              <Search className="pos-products__search-icon" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pos-products__search-input"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid var(--sales-border)',
                borderRadius: '0.75rem',
                backgroundColor: '#f8fafc',
                fontSize: '0.875rem'
              }}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          <div className="pos-products__grid">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`pos-product-card ${
                  product.currentStock === 0 ? 'pos-product-card--out-of-stock' : ''
                }`}
                onClick={() => handleAddToCart(product)}
              >
                <div className="pos-product-card__image">
                  {getProductIcon(product.name)}
                </div>
                <h4 className="pos-product-card__name">{product.name}</h4>
                <p className="pos-product-card__price">
                  {formatCurrency(product.sellingPrice)}
                </p>
                <p className="pos-product-card__stock">
                  {product.currentStock} in stock
                </p>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="sales-empty">
              <div className="sales-empty__icon">🔍</div>
              <p className="sales-empty__text">No products found</p>
              <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                Try adjusting your search or category filter
              </p>
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <Cart onCheckout={handleCheckout} onClearCart={handleClearCart} />
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          totalAmount={0} // This would come from cart total
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default PosInterface;