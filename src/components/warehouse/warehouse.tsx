import React, { useState, useEffect } from 'react';
import { useWarehouseStore } from '../../lib/store/warehouseStore';
import './warehouse.css';

// Update the Warehouse interface to match backend
interface Warehouse {
  _id: string;
  id: string;
  name: string;
  code: string;
  address: {
    street?: string;
    city: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    manager?: string;
  };
  capacity: number;
  currentUtilization: number;
  isActive: boolean;
  outlets: any[];
  totalValue?: number;
  itemCount?: number;
}

const WarehouseModule: React.FC = () => {
  const {
    warehouses,
    selectedWarehouse,
    loading,
    error,
    fetchWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    setSelectedWarehouse
  } = useWarehouseStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'outlets'>('overview');
  const [showCreateWarehouse, setShowCreateWarehouse] = useState(false);
  const [showEditWarehouse, setShowEditWarehouse] = useState(false);

  // Fetch warehouses on component mount
  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  // Set first warehouse as selected by default
  useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouse) {
      setSelectedWarehouse(warehouses[0]);
    }
  }, [warehouses, selectedWarehouse, setSelectedWarehouse]);

  const handleCreateWarehouse = async (warehouseData: any) => {
    try {
      await createWarehouse(warehouseData);
      setShowCreateWarehouse(false);
    } catch (error) {
      console.error('Failed to create warehouse:', error);
    }
  };

  const handleUpdateWarehouse = async (id: string, warehouseData: any) => {
    try {
      await updateWarehouse(id, warehouseData);
      setShowEditWarehouse(false);
    } catch (error) {
      console.error('Failed to update warehouse:', error);
    }
  };

  const handleDeleteWarehouse = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      try {
        await deleteWarehouse(id);
      } catch (error) {
        console.error('Failed to delete warehouse:', error);
      }
    }
  };

  if (loading && warehouses.length === 0) {
    return <div className="loading">Loading warehouses...</div>;
  }

  return (
    <div className="warehouse-module">
      {/* Header */}
      <div className="warehouse-header">
        <div className="header-content">
          <h1>Warehouse Management</h1>
          <div className="header-actions">
            <select 
              value={selectedWarehouse?.id || ''} 
              onChange={(e) => {
                const warehouse = warehouses.find(w => w.id === e.target.value);
                setSelectedWarehouse(warehouse || null);
              }}
              className="warehouse-selector"
            >
              <option value="">Select Warehouse</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.id}>
                  {wh.name} ({wh.code})
                </option>
              ))}
            </select>
            <button 
              className="btn-primary"
              onClick={() => setShowCreateWarehouse(true)}
            >
              + New Warehouse
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="warehouse-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
        </button>
        <button
          className={`tab ${activeTab === 'outlets' ? 'active' : ''}`}
          onClick={() => setActiveTab('outlets')}
        >
          Outlets
        </button>
      </div>

      {/* Main Content */}
      <div className="warehouse-content">
        {activeTab === 'overview' && (
          <OverviewTab 
            warehouse={selectedWarehouse}
            onEdit={() => setShowEditWarehouse(true)}
            onDelete={handleDeleteWarehouse}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab warehouse={selectedWarehouse} />
        )}

        {activeTab === 'outlets' && (
          <OutletsTab warehouse={selectedWarehouse} />
        )}
      </div>

      {/* Create Warehouse Modal */}
      {showCreateWarehouse && (
        <WarehouseModal 
          mode="create"
          onClose={() => setShowCreateWarehouse(false)}
          onSubmit={handleCreateWarehouse}
        />
      )}

      {/* Edit Warehouse Modal */}
      {showEditWarehouse && selectedWarehouse && (
        <WarehouseModal 
          mode="edit"
          warehouse={selectedWarehouse}
          onClose={() => setShowEditWarehouse(false)}
          onSubmit={(data) => handleUpdateWarehouse(selectedWarehouse.id, data)}
        />
      )}
    </div>
  );
};

// Updated OverviewTab Component
const OverviewTab: React.FC<{ 
  warehouse: Warehouse | null;
  onEdit: () => void;
  onDelete: (id: string) => void;
}> = ({ warehouse, onEdit, onDelete }) => {
  if (!warehouse) return <div className="no-data">No warehouse selected</div>;

  const utilizationPercentage = (warehouse.currentUtilization / warehouse.capacity) * 100;

  return (
    <div className="overview-tab">
      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn-secondary" onClick={onEdit}>
          Edit Warehouse
        </button>
        <button 
          className="btn-danger" 
          onClick={() => onDelete(warehouse.id)}
        >
          Delete Warehouse
        </button>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{warehouse.capacity.toLocaleString()}</div>
          <div className="metric-label">Total Capacity</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{warehouse.currentUtilization.toLocaleString()}</div>
          <div className="metric-label">Current Utilization</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{utilizationPercentage.toFixed(1)}%</div>
          <div className="metric-label">Utilization Rate</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{warehouse.outlets?.length || 0}</div>
          <div className="metric-label">Assigned Outlets</div>
        </div>
      </div>

      {/* Warehouse Details */}
      <div className="details-section">
        <div className="detail-card">
          <h3>Warehouse Information</h3>
          <div className="detail-item">
            <label>Code:</label>
            <span>{warehouse.code}</span>
          </div>
          <div className="detail-item">
            <label>Manager:</label>
            <span>{warehouse.contact.manager || 'Not specified'}</span>
          </div>
          <div className="detail-item">
            <label>Contact:</label>
            <span>
              {warehouse.contact.phone || 'No phone'} • {warehouse.contact.email || 'No email'}
            </span>
          </div>
          <div className="detail-item">
            <label>Address:</label>
            <span>
              {[
                warehouse.address.street,
                warehouse.address.city,
                warehouse.address.state,
                warehouse.address.postalCode
              ].filter(Boolean).join(', ')}
            </span>
          </div>
          <div className="detail-item">
            <label>Status:</label>
            <span className={`status-badge ${warehouse.isActive ? 'active' : 'inactive'}`}>
              {warehouse.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Updated InventoryTab Component (You'll need to create inventory API)
const InventoryTab: React.FC<{
  warehouse: Warehouse | null;
}> = ({ warehouse }) => {
  if (!warehouse) return <div className="no-data">No warehouse selected</div>;

  return (
    <div className="inventory-tab">
      <div className="section-header">
        <h2>Inventory Management - {warehouse.name}</h2>
        <button className="btn-secondary">Export Report</button>
      </div>

      <div className="no-data">
        Inventory management features coming soon...
      </div>
    </div>
  );
};

// New OutletsTab Component
const OutletsTab: React.FC<{
  warehouse: Warehouse | null;
}> = ({ warehouse }) => {
  if (!warehouse) return <div className="no-data">No warehouse selected</div>;

  return (
    <div className="outlets-tab">
      <div className="section-header">
        <h2>Assigned Outlets - {warehouse.name}</h2>
        <button className="btn-primary">+ Add Outlet</button>
      </div>

      {warehouse.outlets && warehouse.outlets.length > 0 ? (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Outlet Code</th>
                <th>Name</th>
                <th>Type</th>
                <th>City</th>
                <th>Contact</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {warehouse.outlets.map((outlet: any) => (
                <tr key={outlet._id}>
                  <td>{outlet.code}</td>
                  <td>{outlet.name}</td>
                  <td>{outlet.type}</td>
                  <td>{outlet.address?.city}</td>
                  <td>{outlet.contact?.phone || 'No contact'}</td>
                  <td>
                    <span className={`status-badge ${outlet.isActive ? 'active' : 'inactive'}`}>
                      {outlet.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-data">
          No outlets assigned to this warehouse
        </div>
      )}
    </div>
  );
};

// Updated WarehouseModal Component for both Create and Edit
interface WarehouseModalProps {
  mode: 'create' | 'edit';
  warehouse?: Warehouse;
  onClose: () => void;
  onSubmit: (warehouseData: any) => void;
}

const WarehouseModal: React.FC<WarehouseModalProps> = ({ mode, warehouse, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: warehouse?.name || '',
    code: warehouse?.code || '',
    address: {
      street: warehouse?.address.street || '',
      city: warehouse?.address.city || '',
      state: warehouse?.address.state || '',
      country: warehouse?.address.country || 'Nigeria',
      postalCode: warehouse?.address.postalCode || ''
    },
    contact: {
      phone: warehouse?.contact.phone || '',
      email: warehouse?.contact.email || '',
      manager: warehouse?.contact.manager || ''
    },
    capacity: warehouse?.capacity || 1000,
    isActive: warehouse?.isActive ?? true
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else if (name.startsWith('contact.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact: { ...prev.contact, [field]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'capacity' ? Number(value) : 
                name === 'isActive' ? value === 'true' : value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{mode === 'create' ? 'Create New Warehouse' : 'Edit Warehouse'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-content">
          <form onSubmit={handleSubmit} className="warehouse-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Warehouse Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Enter warehouse name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Warehouse Code *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="e.g., WH_LAG"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Capacity *</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  min="1"
                  placeholder="Enter capacity"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Manager</label>
                <input
                  type="text"
                  name="contact.manager"
                  value={formData.contact.manager}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter manager name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="contact.email"
                  value={formData.contact.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  name="contact.phone"
                  value={formData.contact.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="isActive"
                  value={formData.isActive.toString()}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter street address"
                />
              </div>

              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  placeholder="Enter city"
                />
              </div>

              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter state"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input
                  type="text"
                  name="address.postalCode"
                  value={formData.address.postalCode}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter postal code"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {mode === 'create' ? 'Create Warehouse' : 'Update Warehouse'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WarehouseModule;