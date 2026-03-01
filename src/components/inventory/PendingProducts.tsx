import React, { useEffect, useState } from 'react';
import { Search, Check, X, Package } from 'lucide-react';
import { productStore } from '../../lib/store/productStore';
import { locationAPI } from '../../lib/api/locationApi';
import './inventory.css';

interface Product {
  _id: string;
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  sku: string;
  currentStock?: number;
  status?: 'in-stock' | 'out-of-stock' | 'pending' | 'approved' | 'rejected';
  locationType?: 'warehouse' | 'outlet';
  locationId?: string;
  createdAt?: string;
}

interface Location {
  _id: string;
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

const PendingProducts: React.FC = () => {
  const {
    pendingProducts,
    loading,
    error,
    fetchPendingProducts,
    approveProduct,
    rejectProduct
  } = productStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');
  const [locationTypeFilter, setLocationTypeFilter] = useState<'all' | 'warehouse' | 'outlet'>('all');
  const [locationIdFilter, setLocationIdFilter] = useState('all');
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [warehouses, setWarehouses] = useState<Location[]>([]);
  const [outlets, setOutlets] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState<string | null>(null);

  const selectedLocations = locationTypeFilter === 'warehouse' ? warehouses : outlets;

  const buildFetchParams = () => {
    const params: any = { page: 1 };
    if (searchTerm) params.search = searchTerm;
    if (statusFilter !== 'all') params.status = statusFilter;
    if (locationTypeFilter !== 'all') params.locationType = locationTypeFilter;
    if (locationIdFilter !== 'all') params.locationId = locationIdFilter;
    return params;
  };

  useEffect(() => {
    fetchPendingProducts(buildFetchParams());
  }, [fetchPendingProducts, searchTerm, statusFilter, locationTypeFilter, locationIdFilter]);

  useEffect(() => {
    setLocationIdFilter('all');
  }, [locationTypeFilter]);

  useEffect(() => {
    const fetchLocations = async () => {
      setLocationsLoading(true);
      setLocationsError(null);
      try {
        const [warehousesResponse, outletsResponse] = await Promise.all([
          locationAPI.getWarehouses(),
          locationAPI.getOutlets()
        ]);

        setWarehouses(
          (warehousesResponse.data || [])
            .filter((warehouse: any) => warehouse.isActive)
            .map((warehouse: any) => ({
              _id: warehouse._id,
              id: warehouse._id,
              name: warehouse.name,
              code: warehouse.code,
              isActive: warehouse.isActive
            }))
        );

        setOutlets(
          (outletsResponse.data || [])
            .filter((outlet: any) => outlet.isActive)
            .map((outlet: any) => ({
              _id: outlet._id,
              id: outlet._id,
              name: outlet.name,
              code: outlet.code,
              isActive: outlet.isActive
            }))
        );
      } catch (fetchError) {
        console.error('Failed to fetch locations:', fetchError);
        setLocationsError('Failed to load locations. Please try again.');
      } finally {
        setLocationsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const refreshPendingList = async () => {
    await fetchPendingProducts(buildFetchParams());
  };

  const handleApprove = async (productId: string) => {
    if (!window.confirm('Are you sure you want to approve this product?')) {
      return;
    }
    try {
      await approveProduct(productId);
      await refreshPendingList();
    } catch (approveError) {
      console.error('Failed to approve product:', approveError);
    }
  };

  const handleReject = async (productId: string) => {
    const reason = rejectionReasons[productId] || '';
    if (!reason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    if (!window.confirm('Are you sure you want to reject this product?')) {
      return;
    }

    try {
      await rejectProduct(productId, reason);
      setRejectionReasons((previous) => ({ ...previous, [productId]: '' }));
      await refreshPendingList();
    } catch (rejectError) {
      console.error('Failed to reject product:', rejectError);
    }
  };

  const getLocationName = (product: Product): string => {
    if (!product.locationType || !product.locationId) return 'Not assigned';
    if (locationsLoading) return 'Loading...';
    if (locationsError) return 'Error loading location';

    if (product.locationType === 'warehouse') {
      const warehouse = warehouses.find((item) => item._id === product.locationId);
      return warehouse ? `${warehouse.name} (${warehouse.code})` : 'Warehouse not found';
    }

    const outlet = outlets.find((item) => item._id === product.locationId);
    return outlet ? `${outlet.name} (${outlet.code})` : 'Outlet not found';
  };

  if (loading && pendingProducts.length === 0) {
    return <div className="loading">Loading pending products...</div>;
  }

  return (
    <div className="inventory">
      <div className="inventory__header">
        <h1 className="inventory__title">Pending Product Approval</h1>
        <p className="inventory__subtitle">Review and approve or reject new product submissions</p>
      </div>

      <div className="inventory__actions">
        <div className="inventory__search">
          <Search className="inventory__search-icon" size={20} />
          <input
            type="text"
            placeholder="Search pending products..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="inventory__search-input"
          />
        </div>

        <div className="inventory__filters">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | 'in-stock' | 'out-of-stock')}
            className="inventory__filter-select"
          >
            <option value="all">All Status</option>
            <option value="in-stock">In Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>

          <select
            value={locationTypeFilter}
            onChange={(event) => setLocationTypeFilter(event.target.value as 'all' | 'warehouse' | 'outlet')}
            className="inventory__filter-select"
          >
            <option value="all">All Location Types</option>
            <option value="warehouse">Warehouse</option>
            <option value="outlet">Outlet</option>
          </select>

          <select
            value={locationIdFilter}
            onChange={(event) => setLocationIdFilter(event.target.value)}
            className="inventory__filter-select"
            disabled={locationTypeFilter === 'all'}
          >
            <option value="all">All Locations</option>
            {selectedLocations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name} ({location.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {(error || locationsError) && <div className="error-banner">{error || locationsError}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Status</th>
              <th>Location Type</th>
              <th>Destination</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingProducts.map((product: Product) => (
              <tr key={product.id}>
                <td className="product-name">
                  <div className="product-name__primary">{product.name}</div>
                  {product.description && (
                    <div className="product-name__description">{product.description}</div>
                  )}
                  <div className="sku" style={{ marginTop: '0.25rem' }}>
                    SKU: {product.sku}
                  </div>
                </td>
                <td>{product.category}</td>
                <td>{product.brand}</td>
                <td>
                  <span className={`status-badge ${resolveProductStatus(product) === 'in-stock' ? 'active' : 'danger'}`}>
                    {resolveProductStatus(product) === 'in-stock' ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td>
                  <span className="location-type">
                    {product.locationType
                      ? product.locationType.charAt(0).toUpperCase() + product.locationType.slice(1)
                      : 'Not set'}
                  </span>
                </td>
                <td className="location-display">{getLocationName(product)}</td>
                <td>{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</td>
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
                        onChange={(event) =>
                          setRejectionReasons((previous) => ({
                            ...previous,
                            [product.id]: event.target.value
                          }))
                        }
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

        {pendingProducts.length === 0 && !loading && (
          <div className="empty-state">
            <Package size={48} className="empty-state__icon" />
            <h3 className="empty-state__title">
              {searchTerm ? 'No matching products found' : 'No pending products'}
            </h3>
            <p className="empty-state__description">
              {searchTerm ||
              statusFilter !== 'all' ||
              locationTypeFilter !== 'all' ||
              locationIdFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'All products have been reviewed and processed'}
            </p>
          </div>
        )}
      </div>

      {(loading || locationsLoading) && pendingProducts.length > 0 && (
        <div className="loading" style={{ textAlign: 'center', padding: '1rem' }}>
          {locationsLoading ? 'Loading locations...' : 'Processing...'}
        </div>
      )}
    </div>
  );
};

const resolveProductStatus = (product: Product): 'in-stock' | 'out-of-stock' => {
  if (product.status === 'in-stock' || product.status === 'out-of-stock') {
    return product.status;
  }
  return Number(product.currentStock || 0) > 0 ? 'in-stock' : 'out-of-stock';
};

export default PendingProducts;
