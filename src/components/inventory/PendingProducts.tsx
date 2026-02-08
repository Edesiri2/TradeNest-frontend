import React, { useState, useEffect } from 'react';
import { Search, Check, X, Package } from 'lucide-react';
import { productStore } from '../../lib/store/productStore';
import { locationAPI } from '../../lib/api/locationApi'; // NEW IMPORT
import { Button } from '../ui';
import './inventory.css';

interface Product {
  _id: string;
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  lowStockAlert: number;
  supplierId?: string;
  warehouseId: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  status?: 'pending' | 'approved' | 'rejected';
  locationType?: 'warehouse' | 'outlet';
  locationId?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

interface Location {
  _id: string;
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

interface PendingProductsProps {}

const PendingProducts: React.FC<PendingProductsProps> = () => {
  const { 
    pendingProducts, 
    loading, 
    error, 
    fetchPendingProducts, 
    approveProduct, 
    rejectProduct 
  } = productStore();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [warehouses, setWarehouses] = useState<Location[]>([]);
  const [outlets, setOutlets] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState<boolean>(false); // NEW LOADING STATE
  const [locationsError, setLocationsError] = useState<string | null>(null); // NEW ERROR STATE

  useEffect(() => {
    fetchPendingProducts();
    fetchLocations();
  }, [fetchPendingProducts]);

  // NEW FUNCTION TO FETCH LOCATIONS FROM ACTUAL API
  const fetchLocations = async () => {
    setLocationsLoading(true);
    setLocationsError(null);
    try {
      // Fetch warehouses from actual API
      const warehousesResponse = await locationAPI.getWarehouses();
      const activeWarehouses = warehousesResponse.data
        .filter((warehouse: any) => warehouse.isActive)
        .map((warehouse: any) => ({
          _id: warehouse._id,
          id: warehouse._id,
          name: warehouse.name,
          code: warehouse.code,
          isActive: warehouse.isActive
        }));
      setWarehouses(activeWarehouses);

      // Fetch outlets from actual API
      const outletsResponse = await locationAPI.getOutlets();
      const activeOutlets = outletsResponse.data
        .filter((outlet: any) => outlet.isActive)
        .map((outlet: any) => ({
          _id: outlet._id,
          id: outlet._id,
          name: outlet.name,
          code: outlet.code,
          isActive: outlet.isActive
        }));
      setOutlets(activeOutlets);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      setLocationsError('Failed to load locations. Please try again.');
    } finally {
      setLocationsLoading(false);
    }
  };

  const handleApprove = async (productId: string) => {
    if (window.confirm('Are you sure you want to approve this product?')) {
      try {
        await approveProduct(productId);
        fetchPendingProducts(); // Refresh the list
      } catch (error) {
        console.error('Failed to approve product:', error);
      }
    }
  };

  const handleReject = async (productId: string) => {
    const reason = rejectionReasons[productId] || '';
    if (!reason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    if (window.confirm('Are you sure you want to reject this product?')) {
      try {
        await rejectProduct(productId, reason);
        setRejectionReasons(prev => ({ ...prev, [productId]: '' }));
        fetchPendingProducts(); // Refresh the list
      } catch (error) {
        console.error('Failed to reject product:', error);
      }
    }
  };

  const getLocationName = (product: Product): string => {
    if (!product.locationType || !product.locationId) return 'Not assigned';
    
    if (locationsLoading) return 'Loading...';
    if (locationsError) return 'Error loading location';
    
    if (product.locationType === 'warehouse') {
      const warehouse = warehouses.find(w => w._id === product.locationId);
      return warehouse ? `${warehouse.name} (${warehouse.code})` : 'Warehouse not found';
    } else {
      const outlet = outlets.find(o => o._id === product.locationId);
      return outlet ? `${outlet.name} (${outlet.code})` : 'Outlet not found';
    }
  };

  // Filter products based on search term
  const filteredProducts = pendingProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && pendingProducts.length === 0) {
    return <div className="loading">Loading pending products...</div>;
  }

  return (
    <div className="inventory">
      {/* Header */}
      <div className="inventory__header">
        <h1 className="inventory__title">Pending Product Approval</h1>
        <p className="inventory__subtitle">
          Review and approve or reject new product submissions
        </p>
      </div>

      {/* Search */}
      <div className="inventory__actions">
        <div className="inventory__search">
          <Search className="inventory__search-icon" size={20} />
          <input
            type="text"
            placeholder="Search pending products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="inventory__search-input"
          />
        </div>
      </div>

      {/* Error Display */}
      {(error || locationsError) && (
        <div className="error-banner">
          {error || locationsError}
        </div>
      )}

      {/* Pending Products Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Location Type</th>
              <th>Destination</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product: Product) => (
              <tr key={product.id}>
                <td className="product-name">
                  <div className="product-name__primary">{product.name}</div>
                  {product.description && (
                    <div className="product-name__description">
                      {product.description}
                    </div>
                  )}
                  <div className="sku" style={{ marginTop: '0.25rem' }}>
                    SKU: {product.sku}
                  </div>
                </td>
                <td>{product.category}</td>
                <td>{product.brand}</td>
                <td>
                  <span className="location-type">
                    {product.locationType ? 
                      product.locationType.charAt(0).toUpperCase() + product.locationType.slice(1) 
                      : 'Not set'
                    }
                  </span>
                </td>
                <td className="location-display">
                  {getLocationName(product)}
                  {locationsLoading && (
                    <span className="loading-text">Loading...</span>
                  )}
                </td>
                <td>
                  {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleApprove(product.id)}
                      className="action-btn approve"
                      title="Approve product"
                      disabled={loading || locationsLoading}
                    >
                      <Check size={16} />
                    </button>
                    <div className="reject-section">
                      <input
                        type="text"
                        placeholder="Rejection reason"
                        value={rejectionReasons[product.id] || ''}
                        onChange={(e) => setRejectionReasons(prev => ({
                          ...prev,
                          [product.id]: e.target.value
                        }))}
                        className="rejection-input"
                        disabled={loading || locationsLoading}
                      />
                      <button
                        onClick={() => handleReject(product.id)}
                        className="action-btn reject"
                        title="Reject product"
                        disabled={loading || locationsLoading}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty State */}
        {filteredProducts.length === 0 && !loading && (
          <div className="empty-state">
            <Package size={48} className="empty-state__icon" />
            <h3 className="empty-state__title">
              {searchTerm ? 'No matching products found' : 'No pending products'}
            </h3>
            <p className="empty-state__description">
              {searchTerm 
                ? 'Try adjusting your search criteria'
                : 'All products have been reviewed and processed'
              }
            </p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {(loading || locationsLoading) && pendingProducts.length > 0 && (
        <div className="loading" style={{ textAlign: 'center', padding: '1rem' }}>
          {locationsLoading ? 'Loading locations...' : 'Processing...'}
        </div>
      )}
    </div>
  );
};

export default PendingProducts;