import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import {productStore as useInventoryStore } from '../../lib/store/productStore';
import { useSalesStore } from '../../lib/store/salesStore';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { formatCurrency } from '../../lib/utils/utils';
import Cart from './Cart';
import PaymentModal from './PaymentModal';
import './sales.css';

interface PosInterfaceProps {
  outletId?: string;
}

const PosInterface: React.FC<PosInterfaceProps> = ({ outletId }) => {
  const { user } = useAuthStore();
  const { products, fetchProducts, loading, pagination } = useInventoryStore();
  const { addToCart, clearCart, getCartTotal } = useSalesStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const isSuperAdmin = user?.role?.name === 'super_admin';
  const activeOutletId = isSuperAdmin ? outletId : user?.outletId;

  useEffect(() => {
    if (!activeOutletId && !isSuperAdmin) {
      return;
    }

    void fetchProducts({
      ...(activeOutletId
        ? {
            locationType: 'outlet' as const,
            locationId: activeOutletId
          }
        : {}),
      search: searchTerm || undefined,
      page: currentPage,
      limit: 10
    });
  }, [activeOutletId, currentPage, fetchProducts, isSuperAdmin, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, outletId]);

  // Get unique categories
  const categories = useMemo(
    () => ['all', ...new Set(products.map((product: any) => product.category).filter(Boolean))],
    [products]
  );

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesCategory;
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
      stock: product.currentStock,
      isVatable: product.isVatable,
      isVatInclusive: product.isVatInclusive,
      sku: product.sku
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
      clearCart();
    }
  };

  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    if (!activeOutletId && !isSuperAdmin) {
      return;
    }

    void fetchProducts({
      ...(activeOutletId
        ? {
            locationType: 'outlet' as const,
            locationId: activeOutletId
          }
        : {}),
      page: currentPage,
      limit: 10,
      search: searchTerm || undefined
    });
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

          {!activeOutletId && !isSuperAdmin ? (
            <div className="sales-empty">
              <p className="sales-empty__text">Select an outlet to load products</p>
            </div>
          ) : (
            <div className="pos-products__grid">
              {loading && products.length === 0 ? (
                <div className="sales-empty">
                  <p className="sales-empty__text">Loading products...</p>
                </div>
              ) : (
                filteredProducts.map((product) => (
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
                ))
              )}
            </div>
          )}

          {((activeOutletId && !isSuperAdmin) || isSuperAdmin) && pagination.totalPages > 1 && (
            <div className="pagination" style={{ padding: '0 1rem 1rem' }}>
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

          {((activeOutletId && !isSuperAdmin) || isSuperAdmin) && filteredProducts.length === 0 && !loading && (
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
          totalAmount={getCartTotal()}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default PosInterface;
