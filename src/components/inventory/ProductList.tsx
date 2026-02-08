import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Package } from 'lucide-react';
import { productStore} from '../../lib/store/productStore';
import { formatCurrency } from '../../lib/utils/utils';
import { Button } from '../ui';
import './inventory.css';

interface ProductListProps {
  onEditProduct: (product: any) => void;
  onAddProduct: () => void;
}

const ProductList: React.FC<ProductListProps> = ({ onEditProduct, onAddProduct }) => {
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
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch products and categories on component mount
  useEffect(() => {
    fetchProducts({ page: currentPage });
    fetchCategories();
  }, [fetchProducts, fetchCategories, currentPage]);

  // Handle search and filter changes
  useEffect(() => {
    const params: any = { page: 1 }; // Reset to page 1 when filters change
    if (searchTerm) params.search = searchTerm;
    if (categoryFilter !== 'all') params.category = categoryFilter;
    
    fetchProducts(params);
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, fetchProducts]);

  const handleDelete = async (productId: string, productName: string) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        await deleteProduct(productId);
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchProducts({ 
      page: newPage, 
      search: searchTerm, 
      category: categoryFilter !== 'all' ? categoryFilter : undefined 
    });
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
    return (
      <div className="error-banner">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="inventory">
      {/* Header */}
      <div className="inventory__header">
        <h1 className="inventory__title">Product Management</h1>
        <p className="inventory__subtitle">
          Manage your products, track stock levels, and monitor inventory
        </p>
      </div>

      {/* Summary Cards */}
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
          <div className="summary-card__value">₦{(summary.totalValue / 1000000).toFixed(1)}M</div>
          <div className="summary-card__label">Total Value</div>
        </div>
      </div>

      {/* Actions */}
      <div className="inventory__actions">
        <div className="inventory__search">
          <Search className="inventory__search-icon" size={20} />
          <input
            type="text"
            placeholder="Search products by name, brand, or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="inventory__search-input"
          />
        </div>

        <div className="inventory__filters">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="inventory__filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <Button onClick={onAddProduct} icon={Plus} variant="primary">
            Add Product
          </Button>
        </div>
      </div>

      {/* Products Table */}
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
            {products.map((product) => {
              const stockLevel = getStockLevel(product);
              
              return (
                <tr key={product.id}>
                  <td className="sku">{product.sku}</td>
                  <td className="product-name">
                    <div className="product-name__primary">{product.name}</div>
                    {product.description && (
                      <div className="product-name__description">
                        {product.description}
                      </div>
                    )}
                  </td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td className="price">{formatCurrency(product.costPrice)}</td>
                  <td className="price">{formatCurrency(product.sellingPrice)}</td>
                  <td>
                    <span className={`stock-level ${stockLevel}`}>
                      {product.currentStock}
                      {stockLevel === 'low-stock' && (
                        <span className="stock-alert"> (Low)</span>
                      )}
                      {stockLevel === 'out-of-stock' && (
                        <span className="stock-alert"> (Out)</span>
                      )}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
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

        {/* Empty State */}
        {products.length === 0 && !loading && (
          <div className="empty-state">
            <Package size={48} className="empty-state__icon" />
            <h3 className="empty-state__title">No products found</h3>
            <p className="empty-state__description">
              {searchTerm || categoryFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first product'
              }
            </p>
            {!searchTerm && categoryFilter === 'all' && (
              <Button onClick={onAddProduct} icon={Plus} variant="primary">
                Add First Product
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
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

export default ProductList;