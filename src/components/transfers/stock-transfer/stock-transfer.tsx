import React, { useState, useEffect } from 'react';
import './stockTransferModule.css';
import { locationAPI } from '../../../lib/api/locationApi';
import { productAPI } from '../../../lib/api/productApi';
import { stockTransferApi } from '../../../lib/api/stockTransferApi';
import { userAPI } from '../../../lib/api/userApi';
import { useAuthStore } from '../../../lib/store/useAuthStore';
import { Button } from '../../ui';
import ConfirmDialog from '../../ui/ConfirmDialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  costPrice: number;
  category: string;
  location: string;
  minStock: number;
  maxStock: number;
  supplier?: string;
  batchNumber?: string;
  expiryDate?: string;
}

interface StockTransfer {
  id: string;
  transferNumber: string;
  fromLocation: string;
  fromLocationType: 'warehouse' | 'outlet';
  toLocation: string;
  toLocationType: 'warehouse' | 'outlet';
  products: {
    product: Product;
    quantity: number;
    costValue: number;
  }[];
  totalValue: number;
  totalCostValue: number;
  status: 'pending' | 'approved' | 'confirmed' | 'in-transit' | 'completed' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requestedBy: string;
  requestedDate: string;
  approvedBy?: string;
  approvedDate?: string;
  completedDate?: string;
  estimatedDelivery?: string;
  notes?: string;
  rejectionReason?: string;
}

interface Location {
  id: string;
  name: string;
  type: 'warehouse' | 'outlet';
  code: string;
  address: string;
  manager: string;
  status: 'active' | 'inactive';
}

interface UserOption {
  id: string;
  fullName: string;
}

interface TransferPagination {
  currentPage: number;
  totalPages: number;
  totalTransfers: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const normalizeLocation = (location: any, type: 'warehouse' | 'outlet'): Location => ({
  id: location._id || location.id,
  name: location.name,
  type,
  code: location.code || '',
  address: location.address || '',
  manager: location.manager?.fullName || location.manager?.name || '',
  status: location.isActive === false ? 'inactive' : 'active'
});

const normalizeProduct = (product: any): Product => ({
  id: product._id || product.id,
  name: product.name || 'Unnamed Product',
  sku: product.sku || '',
  quantity: Number(product.currentStock ?? product.quantity ?? 0),
  price: Number(product.sellingPrice ?? product.price ?? 0),
  costPrice: Number(product.costPrice ?? 0),
  category:
    typeof product.category === 'string'
      ? product.category
      : product.category?.name || product.category?.category || '',
  location: product.locationId || product.outletId || product.warehouseId || '',
  minStock: Number(product.lowStockAlert ?? product.minStock ?? 0),
  maxStock: Number(product.maxStock ?? product.currentStock ?? product.quantity ?? 0),
  supplier: product.supplier?.name || product.supplier || '',
  batchNumber: product.batchNumber,
  expiryDate: product.expiryDate
});

const normalizeTransfer = (transfer: any): StockTransfer => ({
  id: transfer._id || transfer.id,
  transferNumber: transfer.transferNumber || '',
  fromLocation: transfer.fromLocation?._id || transfer.fromLocation?.id || transfer.fromLocation || '',
  fromLocationType: transfer.fromLocationType || transfer.fromLocation?.type || 'warehouse',
  toLocation: transfer.toLocation?._id || transfer.toLocation?.id || transfer.toLocation || '',
  toLocationType: transfer.toLocationType || transfer.toLocation?.type || 'warehouse',
  products: (transfer.products || []).map((item: any) => ({
    product: normalizeProduct(item.product || {}),
    quantity: Number(item.quantity || 0),
    costValue: Number(item.costValue || 0)
  })),
  totalValue: Number(transfer.totalValue || 0),
  totalCostValue: Number(transfer.totalCostValue || 0),
  status: transfer.status || 'pending',
  priority: transfer.priority || 'medium',
  requestedBy:
    typeof transfer.requestedBy === 'string'
      ? transfer.requestedBy
      : transfer.requestedBy?.fullName || transfer.requestedBy?.name || '',
  requestedDate: transfer.requestedDate || transfer.createdAt || '',
  approvedBy:
    typeof transfer.approvedBy === 'string'
      ? transfer.approvedBy
      : transfer.approvedBy?.fullName || transfer.approvedBy?.name,
  approvedDate: transfer.approvedDate,
  completedDate: transfer.completedDate,
  estimatedDelivery: transfer.estimatedDelivery,
  notes: transfer.notes,
  rejectionReason: transfer.rejectionReason
});

const StockTransferModule: React.FC = () => {
  const { user, token } = useAuthStore();
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [warehouses, setWarehouses] = useState<Location[]>([]);
  const [outlets, setOutlets] = useState<Location[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'confirmed' | 'in-transit' | 'completed' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingTransfers, setIsLoadingTransfers] = useState(false);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [actionTransferId, setActionTransferId] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const isSuperAdmin = user?.role?.name === 'super_admin';
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<TransferPagination>({
    currentPage: 1,
    totalPages: 0,
    totalTransfers: 0,
    hasNext: false,
    hasPrev: false
  });

  const [formData, setFormData] = useState({
    fromLocation: '',
    fromLocationType: 'warehouse' as 'warehouse' | 'outlet',
    toLocation: '',
    toLocationType: 'warehouse' as 'warehouse' | 'outlet',
    requestedById: user?.id || '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    estimatedDelivery: '',
    notes: ''
  });

  const [selectedProducts, setSelectedProducts] = useState<{
    productId: string; 
    quantity: number;
    availableStock: number;
  }[]>([]);
  const [transferToDelete, setTransferToDelete] = useState<StockTransfer | null>(null);

  const reloadTransfers = async (page = currentPage) => {
    const response = await stockTransferApi.getTransfers({
      search: searchTerm || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      page,
      limit: 10
    });

    setTransfers((response.data || []).map((transfer: any) => normalizeTransfer(transfer)));
    setPagination({
      currentPage: response.pagination?.currentPage || page,
      totalPages: response.pagination?.totalPages || 0,
      totalTransfers: response.pagination?.totalTransfers || response.pagination?.totalItems || 0,
      hasNext: response.pagination?.hasNext || false,
      hasPrev: response.pagination?.hasPrev || false
    });
  };

  useEffect(() => {
    const loadTransfers = async () => {
      setIsLoadingTransfers(true);
      try {
        await reloadTransfers(currentPage);
      } catch (error: any) {
        console.error('Failed to load transfers:', error);
        toast.error(error?.message || 'Failed to load transfers');
      } finally {
        setIsLoadingTransfers(false);
      }
    };

    void loadTransfers();
  }, [searchTerm, statusFilter, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const loadLocations = async () => {
      setIsLoadingLocations(true);
      try {
        const [warehouseResponse, outletResponse] = await Promise.all([
          locationAPI.getWarehouses(),
          locationAPI.getOutlets()
        ]);

        setWarehouses(
          (warehouseResponse.data || [])
            .filter((location: any) => location.isActive !== false)
            .map((location: any) => normalizeLocation(location, 'warehouse'))
        );
        setOutlets(
          (outletResponse.data || [])
            .filter((location: any) => location.isActive !== false)
            .map((location: any) => normalizeLocation(location, 'outlet'))
        );
      } catch (error) {
        console.error('Failed to load transfer locations:', error);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    loadLocations();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      if (!token) return;

      try {
        const response = await userAPI.getUsers(token, { limit: 200, isActive: 'true' });
        const nextUsers = (response.data || []).map((entry: any) => ({
          id: entry._id || entry.id,
          fullName: entry.fullName || `${entry.firstName || ''} ${entry.lastName || ''}`.trim() || entry.email || 'Unknown User'
        }));
        const currentUserOption = user
          ? [{ id: user.id, fullName: user.fullName || `${user.firstName} ${user.lastName}`.trim() }]
          : [];
        const mergedUsers = [...currentUserOption, ...nextUsers].filter(
          (entry, index, allEntries) => allEntries.findIndex((item) => item.id === entry.id) === index
        );

        setUsers(mergedUsers);
      } catch (error) {
        console.error('Failed to load users for transfer requester:', error);
      }
    };

    loadUsers();
  }, [token, user]);

  useEffect(() => {
    if (!showForm || isSuperAdmin) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      requestedById: user?.id || prev.requestedById
    }));
  }, [showForm, isSuperAdmin, user?.id]);

  useEffect(() => {
    const loadProducts = async () => {
      if (!formData.fromLocation) {
        setProducts([]);
        setFilteredProducts([]);
        return;
      }

      setIsLoadingProducts(true);
      try {
        const response = await productAPI.getProducts({
          locationId: formData.fromLocation,
          locationType: formData.fromLocationType
        });
        const locationProducts = (response.data || [])
          .map((product: any) => normalizeProduct(product))
          .filter((product: Product) => product.quantity > 0);

        setProducts(locationProducts);
        setFilteredProducts(locationProducts);
      } catch (error) {
        console.error('Failed to load source products:', error);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, [formData.fromLocation, formData.fromLocationType]);

  const getLocationName = (locationId: string) => {
    const allLocations = [...warehouses, ...outlets];
    const location = allLocations.find(loc => loc.id === locationId);
    return location ? `${location.name} (${location.code})` : 'Unknown';
  };

  const getLocationType = (locationId: string): 'warehouse' | 'outlet' => {
    const allLocations = [...warehouses, ...outlets];
    const location = allLocations.find(loc => loc.id === locationId);
    return location?.type || 'warehouse';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const nextState = {
        ...prev,
        [name]: value
      };

      if (name === 'fromLocation') {
        nextState.fromLocationType = getLocationType(value);
      }

      if (name === 'toLocation') {
        nextState.toLocationType = getLocationType(value);
      }

      return nextState;
    });

    if (name === 'fromLocation' || name === 'fromLocationType') {
      setSelectedProducts([]);
    }
  };

  const handleAddProduct = () => {
    setSelectedProducts(prev => [...prev, { productId: '', quantity: 0, availableStock: 0 }]);
  };

  const handleProductChange = (index: number, field: string, value: string) => {
    setSelectedProducts(prev => prev.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: field === 'quantity' ? Number(value) : value };
        
        if (field === 'productId' && value) {
          const product = filteredProducts.find(p => p.id === value);
          if (product) {
            updatedItem.availableStock = product.quantity;
            updatedItem.quantity = updatedItem.quantity > 0 ? Math.min(updatedItem.quantity, product.quantity) : 1;
          }
        }

        if (field === 'quantity') {
          updatedItem.quantity = Math.max(1, Math.min(Number(value), item.availableStock || 0));
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
  };

  const validateTransfer = () => {
    if (!formData.fromLocation || !formData.toLocation) {
      toast.error('Please select both source and destination locations');
      return false;
    }

    if (formData.fromLocation === formData.toLocation) {
      toast.error('Source and destination cannot be the same');
      return false;
    }

    if (selectedProducts.length === 0) {
      toast.error('Please add at least one product to transfer');
      return false;
    }

    for (const selectedProduct of selectedProducts) {
      if (selectedProduct.quantity > selectedProduct.availableStock) {
        toast.error(`Insufficient stock for ${products.find(p => p.id === selectedProduct.productId)?.name}. Available: ${selectedProduct.availableStock}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTransfer()) return;

    setIsSubmittingTransfer(true);
    try {
      await stockTransferApi.createTransfer({
        fromLocation: formData.fromLocation,
        fromLocationType: getLocationType(formData.fromLocation),
        toLocation: formData.toLocation,
        toLocationType: getLocationType(formData.toLocation),
        requestedById: formData.requestedById,
        priority: formData.priority,
        estimatedDelivery: formData.estimatedDelivery || undefined,
        notes: formData.notes || undefined,
        products: selectedProducts
          .filter(item => item.productId && item.quantity > 0)
          .map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
      });

      setCurrentPage(1);
      await reloadTransfers(1);
      toast.success('Transfer created successfully');
      setShowForm(false);
      resetForm();
    } catch (error: any) {
      console.error('Failed to create transfer:', error);
      toast.error(error?.message || 'Failed to create transfer');
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fromLocation: '',
      fromLocationType: 'warehouse',
      toLocation: '',
      toLocationType: 'warehouse',
      requestedById: user?.id || '',
      priority: 'medium',
      estimatedDelivery: '',
      notes: ''
    });
    setProducts([]);
    setFilteredProducts([]);
    setSelectedProducts([]);
  };

  const handleStatusUpdate = async (transferId: string, newStatus: StockTransfer['status']) => {
    setActionTransferId(transferId);
    try {
      if (newStatus === 'approved') {
        await stockTransferApi.approveTransfer(transferId);
      } else if (newStatus === 'rejected') {
        const rejectionReason = window.prompt('Enter rejection reason')?.trim();
        if (!rejectionReason) {
          return;
        }
        await stockTransferApi.rejectTransfer(transferId, rejectionReason);
      } else if (newStatus === 'confirmed') {
        await stockTransferApi.confirmTransfer(transferId);
      } else if (newStatus === 'in-transit') {
        await stockTransferApi.markInTransit(transferId);
      } else if (newStatus === 'completed') {
        await stockTransferApi.completeTransfer(transferId);
      }

      await reloadTransfers();
      toast.success(`Transfer ${newStatus.replace('-', ' ')} successfully`);
    } catch (error: any) {
      console.error(`Failed to update transfer status to ${newStatus}:`, error);
      toast.error(error?.message || 'Failed to update transfer');
    } finally {
      setActionTransferId(null);
    }
  };

  const handleDeleteTransfer = async () => {
    if (!transferToDelete) return;

    setDeleteSubmitting(true);
    try {
      await stockTransferApi.deleteTransfer(transferToDelete.id);
      await reloadTransfers();
      setTransferToDelete(null);
      toast.success('Transfer deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete transfer:', error);
      toast.error(error?.message || 'Failed to delete transfer');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'confirmed': return '#06b6d4';
      case 'in-transit': return '#f59e0b';
      case 'approved': return '#3b82f6';
      case 'pending': return '#8b5cf6';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="stock-transfer-module">
      {/* Header */}
      <div className="transfer-header">
        <div className="header-main">
          <h1>Stock Transfers</h1>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowForm(true)}
          >
            New Transfer
          </Button>
        </div>

        {/* Filters */}
        <div className="filters-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search transfers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="status-filter"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="confirmed">Confirmed</option>
            <option value="in-transit">In Transit</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Transfers List */}
      <div className="transfers-list">
        {isLoadingTransfers ? (
          <div className="empty-state">
            <h3>Loading transfers...</h3>
          </div>
        ) : transfers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No transfers found</h3>
            <p>Create your first transfer or adjust your search criteria.</p>
          </div>
        ) : (
          <div className="transfers-grid">
            {transfers.map(transfer => (
              <div key={transfer.id} className="transfer-card">
                <div className="transfer-header">
                  <div className="transfer-meta">
                    <div className="transfer-number">{transfer.transferNumber}</div>
                    <div className="transfer-requester">By {transfer.requestedBy}</div>
                    <div className="transfer-date">{transfer.requestedDate}</div>
                  </div>
                  <div className="transfer-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(transfer.status) }}
                    >
                      {transfer.status}
                    </span>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(transfer.priority) }}
                    >
                      {transfer.priority}
                    </span>
                  </div>
                </div>

                <div className="transfer-route">
                  <div className="route-section">
                    <span className="route-label">From:</span>
                    <span className="route-value">{getLocationName(transfer.fromLocation)}</span>
                    <span className="route-type">{transfer.fromLocationType}</span>
                  </div>
                  <div className="route-arrow">→</div>
                  <div className="route-section">
                    <span className="route-label">To:</span>
                    <span className="route-value">{getLocationName(transfer.toLocation)}</span>
                    <span className="route-type">{transfer.toLocationType}</span>
                  </div>
                </div>

                <div className="transfer-products">
                  {transfer.products.map((item, index) => (
                    <div key={index} className="product-item">
                      <span className="product-name">{item.product.name}</span>
                      <span className="product-quantity">{item.quantity} units</span>
                      <span className="product-value">${(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="transfer-footer">
                  <div className="transfer-total">
                    Total: ${transfer.totalValue.toLocaleString()}
                  </div>
                  <div className="transfer-actions">
                    {transfer.status === 'pending' && (
                      <>
                        <button 
                          className="btn-action success"
                          onClick={() => handleStatusUpdate(transfer.id, 'approved')}
                          disabled={actionTransferId === transfer.id}
                          title="Approve Transfer"
                        >
                          Approve
                        </button>
                        <button 
                          className="btn-action danger"
                          onClick={() => handleStatusUpdate(transfer.id, 'rejected')}
                          disabled={actionTransferId === transfer.id}
                          title="Reject Transfer"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {transfer.status === 'approved' && (
                      <button 
                        className="btn-action primary"
                        onClick={() => handleStatusUpdate(transfer.id, 'confirmed')}
                        disabled={actionTransferId === transfer.id}
                        title="Confirm Transfer"
                      >
                        Confirm
                      </button>
                    )}
                    {transfer.status === 'confirmed' && (
                      <button 
                        className="btn-action warning"
                        onClick={() => handleStatusUpdate(transfer.id, 'in-transit')}
                        disabled={actionTransferId === transfer.id}
                        title="Mark In Transit"
                      >
                        Ship
                      </button>
                    )}
                    {transfer.status === 'in-transit' && (
                      <button 
                        className="btn-action success"
                        onClick={() => handleStatusUpdate(transfer.id, 'completed')}
                        disabled={actionTransferId === transfer.id}
                        title="Mark Completed"
                      >
                        Complete
                      </button>
                    )}
                    {(transfer.status === 'pending' || transfer.status === 'approved') && (
                        <button 
                          className="btn-action danger"
                          onClick={() => setTransferToDelete(transfer)}
                          title="Delete Transfer"
                        >
                          Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={!pagination.hasPrev || isLoadingTransfers}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            Previous
          </button>

          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
            {pagination.totalTransfers > 0 ? ` • ${pagination.totalTransfers} total` : ''}
          </span>

          <button
            className="pagination-btn"
            disabled={!pagination.hasNext || isLoadingTransfers}
            onClick={() => setCurrentPage((page) => page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Create Transfer Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Transfer</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="transfer-form">
              <div className="form-section">
                <h3>Transfer Details</h3>
                <div className="form-grid">
	                  <div className="form-group">
	                    <label className="form-label">From Location *</label>
	                    <select
	                      name="fromLocation"
	                      value={formData.fromLocation}
	                      onChange={handleInputChange}
	                      className="form-select"
                          disabled={isLoadingLocations}
	                      required
	                    >
	                      <option value="">{isLoadingLocations ? 'Loading locations...' : 'Select source location'}</option>
                      <optgroup label="Warehouses">
                        {warehouses.map(wh => (
                          <option key={wh.id} value={wh.id} disabled={wh.status !== 'active'}>
                            {wh.name} ({wh.code})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Outlets">
                        {outlets.map(outlet => (
                          <option key={outlet.id} value={outlet.id} disabled={outlet.status !== 'active'}>
                            {outlet.name} ({outlet.code})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">To Location *</label>
	                    <select
	                      name="toLocation"
	                      value={formData.toLocation}
	                      onChange={handleInputChange}
	                      className="form-select"
                          disabled={isLoadingLocations}
	                      required
	                    >
	                      <option value="">{isLoadingLocations ? 'Loading locations...' : 'Select destination location'}</option>
                      <optgroup label="Warehouses">
                        {warehouses.map(wh => (
                          <option
                            key={wh.id}
                            value={wh.id}
                            disabled={wh.id === formData.fromLocation || wh.status !== 'active'}
                          >
                            {wh.name} ({wh.code})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Outlets">
                        {outlets.map(outlet => (
                          <option
                            key={outlet.id}
                            value={outlet.id}
                            disabled={outlet.id === formData.fromLocation || outlet.status !== 'active'}
                          >
                            {outlet.name} ({outlet.code})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

		                  <div className="form-group">
		                    <label className="form-label">Requested By *</label>
		                    <select
		                      name="requestedById"
		                      value={formData.requestedById}
		                      onChange={handleInputChange}
		                      className="form-select"
	                          disabled={!isSuperAdmin}
		                      required
		                    >
	                          <option value="">Select requester</option>
	                          {users.map((requester) => (
	                            <option key={requester.id} value={requester.id}>
	                              {requester.fullName}
	                            </option>
	                          ))}
		                    </select>
		                  </div>

                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Estimated Delivery</label>
                    <input
                      type="date"
                      name="estimatedDelivery"
                      value={formData.estimatedDelivery}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="section-header">
                  <h3>Products</h3>
	                  <button 
	                    type="button" 
	                    className="btn-outline"
	                    onClick={handleAddProduct}
	                    disabled={!formData.fromLocation || isLoadingProducts}
	                  >
	                    + Add Product
	                  </button>
	                </div>

	                {!formData.fromLocation && (
	                  <div className="form-alert">
	                    Please select a source location first to view available products
	                  </div>
	                )}

	                {formData.fromLocation && isLoadingProducts && (
	                  <div className="form-alert">
	                    Loading products for the selected source location...
	                  </div>
	                )}

	                {selectedProducts.map((selectedProduct, index) => (
	                  <div key={index} className="product-row">
	                    <select
                      value={selectedProduct.productId}
                      onChange={(e) => handleProductChange(index, 'productId', e.target.value)}
                      className="form-select"
                      required
	                    >
	                      <option value="">Select Product</option>
	                      {filteredProducts.map(product => {
                          const selectedInOtherRow = selectedProducts.some(
                            (item, rowIndex) => rowIndex !== index && item.productId === product.id
                          );

                          return (
	                        <option 
	                          key={product.id} 
	                          value={product.id}
	                          disabled={product.quantity === 0 || selectedInOtherRow}
	                        >
	                          {product.name} - Stock: {product.quantity} - ${product.price}
	                        </option>
                          );
                        })}
	                    </select>
	                    
	                    <div className="quantity-group">
	                      <input
	                        type="number"
	                        placeholder="Qty"
	                        value={selectedProduct.quantity || ''}
	                        onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
	                        className="form-input"
	                        min="1"
	                        max={selectedProduct.availableStock || 1}
                          disabled={!selectedProduct.productId}
	                        required
	                      />
	                      <span className="quantity-hint">
	                        Max: {selectedProduct.availableStock || 0}
	                      </span>
	                    </div>

                    <button 
                      type="button" 
                      className="btn-remove"
                      onClick={() => handleRemoveProduct(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="form-textarea"
                  rows={3}
                  placeholder="Add any additional notes..."
                />
              </div>

              {selectedProducts.length > 0 && (
                <div className="transfer-summary">
                  <h4>Transfer Summary</h4>
                  <div className="summary-items">
                    <div className="summary-item">
                      <span>Total Items:</span>
                      <span>{selectedProducts.reduce((sum, sp) => sum + sp.quantity, 0)}</span>
                    </div>
                    <div className="summary-item">
                      <span>Total Products:</span>
                      <span>{selectedProducts.length}</span>
                    </div>
                    <div className="summary-item">
                      <span>Total Value:</span>
                      <span>
                        ${selectedProducts.reduce((sum, sp) => {
                          const product = products.find(p => p.id === sp.productId);
                          return sum + (product ? product.price * sp.quantity : 0);
                        }, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={isSubmittingTransfer}>
                  {isSubmittingTransfer ? 'Creating...' : 'Create Transfer'}
                </button>
                <button 
                  type="button" 
                  className="btn-outline"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={Boolean(transferToDelete)}
        title="Delete Transfer"
        message={
          transferToDelete
            ? `Are you sure you want to delete ${transferToDelete.transferNumber}? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Transfer"
        isLoading={deleteSubmitting}
        onConfirm={handleDeleteTransfer}
        onCancel={() => setTransferToDelete(null)}
      />
    </div>
  );
};

export default StockTransferModule;
