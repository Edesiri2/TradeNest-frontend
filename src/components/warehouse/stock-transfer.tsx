import React, { useState, useEffect, useRef } from 'react';
import '../warehouse/stockTransferModule.css';

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

const StockTransferModule: React.FC = () => {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [warehouses, setWarehouses] = useState<Location[]>([]);
  const [outlets, setOutlets] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'confirmed' | 'in-transit' | 'completed' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    fromLocation: '',
    fromLocationType: 'warehouse' as 'warehouse' | 'outlet',
    toLocation: '',
    toLocationType: 'warehouse' as 'warehouse' | 'outlet',
    requestedBy: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    estimatedDelivery: '',
    notes: ''
  });

  const [selectedProducts, setSelectedProducts] = useState<{
    productId: string; 
    quantity: number;
    availableStock: number;
  }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMockData();
  }, []);

  useEffect(() => {
    if (formData.fromLocation) {
      const locationProducts = products.filter(p => 
        p.location === formData.fromLocation
      );
      setFilteredProducts(locationProducts);
    } else {
      setFilteredProducts(products);
    }
  }, [formData.fromLocation, products]);

  const loadMockData = () => {
    const mockWarehouses: Location[] = [
      { 
        id: 'wh1', 
        name: 'Main Distribution Center', 
        type: 'warehouse',
        code: 'WH-MAIN',
        address: '123 Industrial Ave, Tech City',
        manager: 'Sarah Johnson',
        status: 'active'
      },
      { 
        id: 'wh2', 
        name: 'West Coast Hub', 
        type: 'warehouse',
        code: 'WH-WEST',
        address: '456 Ocean Blvd, San Francisco',
        manager: 'Mike Chen',
        status: 'active'
      }
    ];

    const mockOutlets: Location[] = [
      { 
        id: 'out1', 
        name: 'Downtown Flagship Store', 
        type: 'outlet',
        code: 'OUT-DT',
        address: '789 Main Street, Downtown',
        manager: 'Emily Davis',
        status: 'active'
      },
      { 
        id: 'out2', 
        name: 'Westside Mall Store', 
        type: 'outlet',
        code: 'OUT-WS',
        address: '321 Mall Drive, Westside',
        manager: 'David Wilson',
        status: 'active'
      }
    ];

    const mockProducts: Product[] = [
      { 
        id: 'p1', 
        name: 'MacBook Pro 16"', 
        sku: 'MBP-16-001', 
        quantity: 100, 
        price: 2499, 
        costPrice: 1899,
        category: 'Electronics',
        location: 'wh1',
        minStock: 10,
        maxStock: 150,
        supplier: 'Apple Inc',
        batchNumber: 'BATCH-2024-001'
      },
      { 
        id: 'p2', 
        name: '4K Ultra HD Monitor', 
        sku: 'MON-4K-001', 
        quantity: 50, 
        price: 599, 
        costPrice: 399,
        category: 'Electronics',
        location: 'wh1',
        minStock: 5,
        maxStock: 80,
        supplier: 'Dell Technologies'
      },
      { 
        id: 'p3', 
        name: 'iPhone 15 Pro', 
        sku: 'IP15-PRO-001', 
        quantity: 200, 
        price: 1199, 
        costPrice: 899,
        category: 'Electronics',
        location: 'wh2',
        minStock: 20,
        maxStock: 250,
        supplier: 'Apple Inc',
        batchNumber: 'BATCH-2024-002'
      }
    ];

    const mockTransfers: StockTransfer[] = [
      {
        id: '1',
        transferNumber: 'TR-2024-001',
        fromLocation: 'wh1',
        fromLocationType: 'warehouse',
        toLocation: 'out1',
        toLocationType: 'outlet',
        products: [
          { 
            product: mockProducts[0], 
            quantity: 5,
            costValue: 9495
          },
          { 
            product: mockProducts[1], 
            quantity: 10,
            costValue: 3990
          }
        ],
        totalValue: 17495,
        totalCostValue: 13485,
        status: 'completed',
        priority: 'high',
        requestedBy: 'John Smith',
        requestedDate: '2024-01-15',
        approvedBy: 'Admin User',
        approvedDate: '2024-01-16',
        completedDate: '2024-01-18'
      },
      {
        id: '2',
        transferNumber: 'TR-2024-002',
        fromLocation: 'wh2',
        fromLocationType: 'warehouse',
        toLocation: 'out2',
        toLocationType: 'outlet',
        products: [
          { 
            product: mockProducts[2], 
            quantity: 15,
            costValue: 13485
          }
        ],
        totalValue: 17985,
        totalCostValue: 13485,
        status: 'pending',
        priority: 'medium',
        requestedBy: 'Sarah Johnson',
        requestedDate: '2024-01-18'
      },
      {
        id: '3',
        transferNumber: 'TR-2024-003',
        fromLocation: 'wh1',
        fromLocationType: 'warehouse',
        toLocation: 'wh2',
        toLocationType: 'warehouse',
        products: [
          { 
            product: mockProducts[0], 
            quantity: 2,
            costValue: 3798
          }
        ],
        totalValue: 4998,
        totalCostValue: 3798,
        status: 'approved',
        priority: 'low',
        requestedBy: 'Mike Wilson',
        requestedDate: '2024-01-17',
        approvedBy: 'Admin User',
        approvedDate: '2024-01-17'
      },
      {
        id: '4',
        transferNumber: 'TR-2024-004',
        fromLocation: 'out1',
        fromLocationType: 'outlet',
        toLocation: 'out2',
        toLocationType: 'outlet',
        products: [
          { 
            product: mockProducts[1], 
            quantity: 3,
            costValue: 1197
          }
        ],
        totalValue: 1797,
        totalCostValue: 1197,
        status: 'confirmed',
        priority: 'medium',
        requestedBy: 'Emily Davis',
        requestedDate: '2024-01-19'
      }
    ];

    setWarehouses(mockWarehouses);
    setOutlets(mockOutlets);
    setProducts(mockProducts);
    setTransfers(mockTransfers);
  };

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'fromLocation') {
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
          const product = products.find(p => p.id === value);
          if (product) {
            updatedItem.availableStock = product.quantity;
          }
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
      alert('Please select both source and destination locations');
      return false;
    }

    if (formData.fromLocation === formData.toLocation) {
      alert('Source and destination cannot be the same');
      return false;
    }

    if (selectedProducts.length === 0) {
      alert('Please add at least one product to transfer');
      return false;
    }

    for (const selectedProduct of selectedProducts) {
      if (selectedProduct.quantity > selectedProduct.availableStock) {
        alert(`Insufficient stock for ${products.find(p => p.id === selectedProduct.productId)?.name}. Available: ${selectedProduct.availableStock}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTransfer()) return;

    const transferProducts = selectedProducts
      .filter(sp => sp.productId && sp.quantity > 0)
      .map(sp => {
        const product = products.find(p => p.id === sp.productId);
        return product ? { 
          product, 
          quantity: sp.quantity,
          costValue: product.costPrice * sp.quantity
        } : null;
      })
      .filter(Boolean) as { product: Product; quantity: number; costValue: number }[];

    const totalValue = transferProducts.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );

    const totalCostValue = transferProducts.reduce((sum, item) => 
      sum + item.costValue, 0
    );

    const newTransfer: StockTransfer = {
      id: Date.now().toString(),
      transferNumber: `TR-${new Date().getFullYear()}-${String(transfers.length + 1).padStart(3, '0')}`,
      fromLocation: formData.fromLocation,
      fromLocationType: getLocationType(formData.fromLocation),
      toLocation: formData.toLocation,
      toLocationType: getLocationType(formData.toLocation),
      products: transferProducts,
      totalValue,
      totalCostValue,
      status: 'pending',
      priority: formData.priority,
      requestedBy: formData.requestedBy,
      requestedDate: new Date().toISOString().split('T')[0],
      estimatedDelivery: formData.estimatedDelivery,
      notes: formData.notes
    };

    setTransfers(prev => [...prev, newTransfer]);
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      fromLocation: '',
      fromLocationType: 'warehouse',
      toLocation: '',
      toLocationType: 'warehouse',
      requestedBy: '',
      priority: 'medium',
      estimatedDelivery: '',
      notes: ''
    });
    setSelectedProducts([]);
  };

  const handleStatusUpdate = (transferId: string, newStatus: StockTransfer['status']) => {
    setTransfers(prev => prev.map(transfer => 
      transfer.id === transferId 
        ? { 
            ...transfer, 
            status: newStatus,
            ...(newStatus === 'approved' && !transfer.approvedBy && {
              approvedBy: 'System Admin',
              approvedDate: new Date().toISOString().split('T')[0]
            }),
            ...(newStatus === 'confirmed' && !transfer.approvedBy && {
              approvedBy: 'System Admin',
              approvedDate: new Date().toISOString().split('T')[0]
            }),
            ...(newStatus === 'completed' && !transfer.completedDate && {
              completedDate: new Date().toISOString().split('T')[0]
            })
          }
        : transfer
    ));
  };

  const handleDeleteTransfer = (transferId: string) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      setTransfers(prev => prev.filter(transfer => transfer.id !== transferId));
    }
  };

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.transferNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.products.some(p => p.product.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
          <button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            <span className="btn-icon">+</span>
            New Transfer
          </button>
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
        {filteredTransfers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No transfers found</h3>
            <p>Create your first transfer or adjust your search criteria.</p>
          </div>
        ) : (
          <div className="transfers-grid">
            {filteredTransfers.map(transfer => (
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
                          title="Approve Transfer"
                        >
                          Approve
                        </button>
                        <button 
                          className="btn-action danger"
                          onClick={() => handleStatusUpdate(transfer.id, 'rejected')}
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
                        title="Confirm Transfer"
                      >
                        Confirm
                      </button>
                    )}
                    {transfer.status === 'confirmed' && (
                      <button 
                        className="btn-action warning"
                        onClick={() => handleStatusUpdate(transfer.id, 'in-transit')}
                        title="Mark In Transit"
                      >
                        Ship
                      </button>
                    )}
                    {transfer.status === 'in-transit' && (
                      <button 
                        className="btn-action success"
                        onClick={() => handleStatusUpdate(transfer.id, 'completed')}
                        title="Mark Completed"
                      >
                        Complete
                      </button>
                    )}
                    {(transfer.status === 'pending' || transfer.status === 'approved') && (
                      <button 
                        className="btn-action danger"
                        onClick={() => handleDeleteTransfer(transfer.id)}
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
                      required
                    >
                      <option value="">Select source location</option>
                      <optgroup label="Warehouses">
                        {warehouses.map(wh => (
                          <option key={wh.id} value={wh.id}>
                            {wh.name} ({wh.code})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Outlets">
                        {outlets.map(outlet => (
                          <option key={outlet.id} value={outlet.id}>
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
                      required
                    >
                      <option value="">Select destination location</option>
                      <optgroup label="Warehouses">
                        {warehouses.map(wh => (
                          <option key={wh.id} value={wh.id}>
                            {wh.name} ({wh.code})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Outlets">
                        {outlets.map(outlet => (
                          <option key={outlet.id} value={outlet.id}>
                            {outlet.name} ({outlet.code})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Requested By *</label>
                    <input
                      type="text"
                      name="requestedBy"
                      value={formData.requestedBy}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                      placeholder="Enter requester name"
                    />
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
                    disabled={!formData.fromLocation}
                  >
                    + Add Product
                  </button>
                </div>

                {!formData.fromLocation && (
                  <div className="form-alert">
                    Please select a source location first to view available products
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
                      {filteredProducts.map(product => (
                        <option 
                          key={product.id} 
                          value={product.id}
                          disabled={product.quantity === 0}
                        >
                          {product.name} - Stock: {product.quantity} - ${product.price}
                        </option>
                      ))}
                    </select>
                    
                    <div className="quantity-group">
                      <input
                        type="number"
                        placeholder="Qty"
                        value={selectedProduct.quantity || ''}
                        onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                        className="form-input"
                        min="1"
                        max={selectedProduct.availableStock}
                        required
                      />
                      <span className="quantity-hint">
                        Max: {selectedProduct.availableStock}
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
                <button type="submit" className="btn-primary">
                  Create Transfer
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
    </div>
  );
};

export default StockTransferModule;