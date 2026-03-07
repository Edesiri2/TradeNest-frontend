import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Edit, Trash2, Package } from 'lucide-react';
import { productStore } from '../../lib/store/productStore';
import { useAuthStore } from '../../lib/store/useAuthStore';
import { formatCurrency } from '../../lib/utils/utils';
import { Button } from '../ui';
import './inventory.css';

interface ProductListProps {
  onEditProduct: (product: any) => void;
  onAddProduct: () => void;
  locationTypeFilter: 'all' | 'warehouse' | 'outlet';
  locationIdFilter: string;
}

const ProductList: React.FC<ProductListProps> = ({
  onEditProduct,
  onAddProduct,
  locationTypeFilter,
  locationIdFilter
}) => {
  const { user } = useAuthStore();
  const {
    products,
    categories,
    loading,
    error,
    pagination,
    summary,
    fetchProducts,
    deleteProduct,
    fetchCategories
  } = productStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const userLocationId = user?.outletId || user?.outlet?.id || '';
  const isSuperAdmin = user?.role?.name === 'super_admin';
  const enforcedLocationId = !isSuperAdmin && userLocationId ? userLocationId : locationIdFilter;
  const enforcedLocationType = !isSuperAdmin && userLocationId ? 'outlet' : locationTypeFilter;

  const categoryOptions = useMemo(
    () =>
      categories
        .map((category: any) => resolveCategoryName(category))
        .filter((name: string) => Boolean(name)),
    [categories]
  );

  const buildFetchParams = (page = 1) => {
    const params: any = { page };
    if (searchTerm) params.search = searchTerm;
    if (categoryFilter !== 'all') params.category = categoryFilter;
    if (statusFilter !== 'all') params.status = statusFilter;
    if (enforcedLocationType !== 'all') params.locationType = enforcedLocationType;
    if (enforcedLocationId !== 'all') params.locationId = enforcedLocationId;
    return params;
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts(buildFetchParams(currentPage));
  }, [fetchProducts, currentPage, searchTerm, categoryFilter, statusFilter, enforcedLocationType, enforcedLocationId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, enforcedLocationType, enforcedLocationId]);

  const handleDelete = async (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        await deleteProduct(productId);
        await fetchProducts(buildFetchParams(currentPage));
      } catch (deleteError) {
        console.error('Failed to delete product:', deleteError);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getStockLevel = (product: any) => {
    if (product.currentStock === 0) return 'out-of-stock';
    if (product.currentStock <= product.lowStockAlert) return 'low-stock';
    return 'normal';
  };

  if (loading && products.length === 0) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error-banner">Error: {error}</div>;
  }

  return (
    <div className="inventory">
      <div className="inventory__header">
        <h1 className="inventory__title">Product Management</h1>
        <p className="inventory__subtitle">Manage your products, stock, and location assignment.</p>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-card__value">{pagination.totalProducts}</div>
          <div className="summary-card__label">Total Products</div>
        </div>
        <div className="summary-card warning">
          <div className="summary-card__value">{summary.lowStockCount}</div>
          <div className="summary-card__label">Low Stock</div>
        </div>
        <div className="summary-card">
          <div className="summary-card__value">{formatCompactCurrency(summary.totalValue)}</div>
          <div className="summary-card__label">Total Value</div>
        </div>
      </div>

      <div className="inventory__actions">
        <div className="inventory__search">
          <Search className="inventory__search-icon" size={20} />
          <input
            type="text"
            placeholder="Search products by name, brand, or SKU..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="inventory__search-input"
          />
        </div>

        <div className="inventory__filters">
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="inventory__filter-select"
          >
            <option value="all">All Categories</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | 'in-stock' | 'out-of-stock')}
            className="inventory__filter-select"
          >
            <option value="all">All Status</option>
            <option value="in-stock">In Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>

          <Button onClick={onAddProduct} icon={Plus} variant="primary">
            Add Product
          </Button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Cost Price</th>
              <th>Selling Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: any) => {
              const stockLevel = getStockLevel(product);
              const status = resolveProductStatus(product);

              return (
                <tr key={product.id}>
                  <td className="sku">{product.sku}</td>
                  <td className="product-name">
                    <div className="product-name__primary">{product.name}</div>
                    {product.description && (
                      <div className="product-name__description">{product.description}</div>
                    )}
                  </td>
                  <td>{resolveCategoryName(product.category) || '-'}</td>
                  <td>{product.brand}</td>
                  <td className="price">{formatCurrency(product.costPrice)}</td>
                  <td className="price">{formatCurrency(product.sellingPrice)}</td>
                  <td>
                    <span className={`stock-level ${stockLevel}`}>
                      {product.currentStock}
                      {stockLevel === 'low-stock' && <span className="stock-alert"> (Low)</span>}
                      {stockLevel === 'out-of-stock' && <span className="stock-alert"> (Out)</span>}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${status === 'in-stock' ? 'active' : 'danger'}`}>
                      {status === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => onEditProduct(product)}
                        className="action-btn edit"
                        title="Edit product"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="action-btn delete"
                        title="Delete product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {products.length === 0 && !loading && (
          <div className="empty-state">
            <Package size={48} className="empty-state__icon" />
            <h3 className="empty-state__title">No products found</h3>
            <p className="empty-state__description">
              {searchTerm ||
              categoryFilter !== 'all' ||
              statusFilter !== 'all' ||
              enforcedLocationType !== 'all' ||
              enforcedLocationId !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first product'}
            </p>
            {!searchTerm &&
              categoryFilter === 'all' &&
              statusFilter === 'all' &&
              enforcedLocationType === 'all' &&
              enforcedLocationId === 'all' && (
                <Button onClick={onAddProduct} icon={Plus} variant="primary">
                  Add First Product
                </Button>
              )}
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={!pagination.hasPrev}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>

          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            className="pagination-btn"
            disabled={!pagination.hasNext}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const resolveProductStatus = (product: any): 'in-stock' | 'out-of-stock' => {
  if (product?.status === 'in-stock' || product?.status === 'out-of-stock') {
    return product.status;
  }
  return Number(product?.currentStock || 0) > 0 ? 'in-stock' : 'out-of-stock';
};

const resolveCategoryName = (category: unknown): string => {
  if (typeof category === 'string') return category;
  if (category && typeof category === 'object') {
    const categoryObject = category as { name?: string; category?: string };
    return categoryObject.name || categoryObject.category || '';
  }
  return '';
};

const formatCompactCurrency = (value: number): string => {
  const amount = Number(value || 0);
  const absolute = Math.abs(amount);

  if (absolute >= 1_000_000_000_000) return `N${(amount / 1_000_000_000_000).toFixed(2)}T`;
  if (absolute >= 1_000_000_000) return `N${(amount / 1_000_000_000).toFixed(2)}B`;
  if (absolute >= 1_000_000) return `N${(amount / 1_000_000).toFixed(2)}M`;
  if (absolute >= 1_000) return `N${(amount / 1_000).toFixed(2)}K`;

  return `N${amount.toFixed(2)}`;
};

export default ProductList;
