import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useWarehouseStore } from '../../lib/store/warehouseStore';
import { Button, ConfirmDialog, Modal, Table } from '../ui';
import './warehouse.css';
import { toast } from 'sonner';

interface WarehouseAddress {
  street?: string;
  city: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

interface WarehouseContact {
  phone?: string;
  email?: string;
  manager?: string;
}

interface Outlet {
  _id?: string;
  id?: string;
  code?: string;
  name?: string;
  type?: string;
  address?: {
    city?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
  };
  isActive?: boolean;
}

interface InventoryItem {
  id: string;
  sku: string;
  productName: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  unitPrice: number;
  totalValue: number;
}

interface Warehouse {
  _id: string;
  id: string;
  name: string;
  code: string;
  address: WarehouseAddress;
  contact: WarehouseContact;
  capacity: number;
  currentUtilization: number;
  isActive: boolean;
  outlets: Outlet[];
  inventory?: unknown[];
  itemCount?: number;
  totalValue?: number;
}

interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, record: T) => React.ReactNode;
}

interface ApiErrorWithDetails extends Error {
  details?: {
    linkedOutlets?: number;
    linkedProducts?: number;
    [key: string]: unknown;
  };
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
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [detailWarehouse, setDetailWarehouse] = useState<Warehouse | null>(null);
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  useEffect(() => {
    if (warehouses.length > 0 && !selectedWarehouse) {
      setSelectedWarehouse(warehouses[0]);
    }
  }, [warehouses, selectedWarehouse, setSelectedWarehouse]);

  const refreshWarehouses = async (preferredWarehouseId?: string) => {
    await fetchWarehouses();
    const latestWarehouses = useWarehouseStore.getState().warehouses as Warehouse[];

    if (latestWarehouses.length === 0) {
      setSelectedWarehouse(null);
      return;
    }

    const preferredWarehouse = preferredWarehouseId
      ? latestWarehouses.find((warehouse) => warehouse.id === preferredWarehouseId)
      : null;

    setSelectedWarehouse(preferredWarehouse || latestWarehouses[0]);
  };

  const handleCreateWarehouse = async (warehouseData: Record<string, unknown>) => {
    try {
      await createWarehouse(warehouseData);
      await refreshWarehouses();
      setShowCreateWarehouse(false);
    } catch (createError) {
      console.error('Failed to create warehouse:', createError);
    }
  };

  const handleUpdateWarehouse = async (id: string, warehouseData: Record<string, unknown>) => {
    try {
      await updateWarehouse(id, warehouseData);
      await refreshWarehouses(id);
      setShowEditWarehouse(false);
      setEditingWarehouse(null);
    } catch (updateError) {
      console.error('Failed to update warehouse:', updateError);
    }
  };

  const handleConfirmDelete = async () => {
    if (!warehouseToDelete) {
      return;
    }

    setDeleteErrorMessage(null);
    setDeleteLoading(true);
    try {
      const nextSelectionId =
        selectedWarehouse?.id && selectedWarehouse.id !== warehouseToDelete.id
          ? selectedWarehouse.id
          : undefined;

      await deleteWarehouse(warehouseToDelete.id);
      await refreshWarehouses(nextSelectionId);
      setWarehouseToDelete(null);
      setDeleteErrorMessage(null);
    } catch (deleteError) {
      setDeleteErrorMessage(getWarehouseDeleteErrorMessage(deleteError));
      console.error('Failed to delete warehouse:', deleteError);
      toast.error(getWarehouseDeleteErrorMessage(deleteError) || 'Failed to delete warehouse');
    } finally {
      setDeleteLoading(false);
    }
  };

  const selectedInventory = useMemo(
    () => getInventoryItems(selectedWarehouse as Warehouse | null),
    [selectedWarehouse]
  );

  if (loading && warehouses.length === 0) {
    return <div className="loading">Loading warehouses...</div>;
  }

  return (
    <div className="warehouse-module">
      <div className="warehouse-header">
        <div className="header-content">
          <h1>Warehouse Management</h1>
          <div className="header-actions">
            <select
              value={selectedWarehouse?.id || ''}
              onChange={(event) => {
                const warehouse = warehouses.find((item) => item.id === event.target.value);
                setSelectedWarehouse(warehouse || null);
              }}
              className="warehouse-selector"
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} ({warehouse.code})
                </option>
              ))}
            </select>
            <Button variant="primary" onClick={() => setShowCreateWarehouse(true)}>
              New Warehouse
            </Button>
          </div>
        </div>
      </div>

      {(error || deleteErrorMessage) && (
        <div className="error-banner">{deleteErrorMessage || error}</div>
      )}

      <div className="warehouse-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Warehouses
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
          Linked Outlets
        </button>
      </div>

      <div className="warehouse-content">
        {activeTab === 'overview' && (
          <OverviewTab
            warehouses={warehouses as Warehouse[]}
            loading={loading}
            onView={(warehouse) => {
              setSelectedWarehouse(warehouse);
              setDetailWarehouse(warehouse);
            }}
            onEdit={(warehouse) => {
              setSelectedWarehouse(warehouse);
              setEditingWarehouse(warehouse);
              setShowEditWarehouse(true);
            }}
            onDelete={(warehouse) => setWarehouseToDelete(warehouse)}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab
            warehouse={selectedWarehouse as Warehouse | null}
            inventory={selectedInventory}
            loading={loading}
          />
        )}

        {activeTab === 'outlets' && (
          <OutletsTab warehouse={selectedWarehouse as Warehouse | null} loading={loading} />
        )}
      </div>

      <WarehouseModal
        isOpen={showCreateWarehouse}
        mode="create"
        onClose={() => setShowCreateWarehouse(false)}
        onSubmit={handleCreateWarehouse}
      />

      <WarehouseModal
        isOpen={showEditWarehouse}
        mode="edit"
        warehouse={editingWarehouse || undefined}
        onClose={() => {
          setShowEditWarehouse(false);
          setEditingWarehouse(null);
        }}
        onSubmit={(data) => {
          if (editingWarehouse) {
            return handleUpdateWarehouse(editingWarehouse.id, data);
          }
        }}
      />

      <WarehouseDetailsModal
        warehouse={detailWarehouse}
        onClose={() => setDetailWarehouse(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(warehouseToDelete)}
        title="Delete Warehouse"
        message={`Delete "${warehouseToDelete?.name || ''}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteLoading}
        onCancel={() => {
          setWarehouseToDelete(null);
          setDeleteErrorMessage(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

const OverviewTab: React.FC<{
  warehouses: Warehouse[];
  loading: boolean;
  onView: (warehouse: Warehouse) => void;
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
}> = ({ warehouses, loading, onView, onEdit, onDelete }) => {
  const activeCount = warehouses.filter((warehouse) => warehouse.isActive).length;
  const totalCapacity = warehouses.reduce((sum, warehouse) => sum + (warehouse.capacity || 0), 0);
  const totalUtilization = warehouses.reduce(
    (sum, warehouse) => sum + (warehouse.currentUtilization || 0),
    0
  );

  const columns: TableColumn<Warehouse>[] = [
    {
      key: 'name',
      title: 'Warehouse'
    },
    {
      key: 'code',
      title: 'Code'
    },
    {
      key: 'city',
      title: 'City',
      render: (_value, record) => record.address?.city || '-'
    },
    {
      key: 'manager',
      title: 'Manager',
      render: (_value, record) => record.contact?.manager || '-'
    },
    {
      key: 'capacity',
      title: 'Capacity',
      align: 'right',
      render: (_value, record) => record.capacity?.toLocaleString() || '0'
    },
    {
      key: 'utilization',
      title: 'Utilization',
      align: 'right',
      render: (_value, record) => {
        const utilizationPercent = record.capacity
          ? ((record.currentUtilization / record.capacity) * 100).toFixed(1)
          : '0.0';
        return `${utilizationPercent}%`;
      }
    },
    {
      key: 'status',
      title: 'Status',
      render: (_value, record) => (
        <span className={`status-badge ${record.isActive ? 'active' : 'inactive'}`}>
          {record.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_value, record) => (
        <div className="row-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={() => onView(record)}
            title="View details"
            aria-label="View details"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => onEdit(record)}
            title="Edit warehouse"
            aria-label="Edit warehouse"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            className="icon-btn icon-btn-danger"
            onClick={() => onDelete(record)}
            title="Delete warehouse"
            aria-label="Delete warehouse"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="overview-tab">
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{warehouses.length}</div>
          <div className="metric-label">Total Warehouses</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{activeCount}</div>
          <div className="metric-label">Active Warehouses</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{totalCapacity.toLocaleString()}</div>
          <div className="metric-label">Total Capacity</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{totalUtilization.toLocaleString()}</div>
          <div className="metric-label">Current Utilization</div>
        </div>
      </div>

      <Table
        columns={columns as any[]}
        data={warehouses}
        loading={loading}
        striped
        emptyText="No warehouses available."
      />
    </div>
  );
};

const InventoryTab: React.FC<{
  warehouse: Warehouse | null;
  inventory: InventoryItem[];
  loading: boolean;
}> = ({ warehouse, inventory, loading }) => {
  if (!warehouse) {
    return <div className="no-data">No warehouse selected</div>;
  }

  const totalUnits = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockCount = inventory.filter((item) => item.quantity <= item.reorderLevel).length;

  const columns: TableColumn<InventoryItem>[] = [
    {
      key: 'sku',
      title: 'SKU',
      render: (value) => <span className="sku">{String(value || '-')}</span>
    },
    {
      key: 'productName',
      title: 'Product'
    },
    {
      key: 'category',
      title: 'Category'
    },
    {
      key: 'quantity',
      title: 'Quantity',
      align: 'right',
      render: (value, record) => (
        <span className={record.quantity <= record.reorderLevel ? 'quantity low-stock' : 'quantity'}>
          {Number(value || 0).toLocaleString()}
        </span>
      )
    },
    {
      key: 'reorderLevel',
      title: 'Reorder Level',
      align: 'right',
      render: (value) => Number(value || 0).toLocaleString()
    },
    {
      key: 'unitPrice',
      title: 'Unit Price',
      align: 'right',
      render: (value) => formatCurrency(Number(value || 0))
    },
    {
      key: 'totalValue',
      title: 'Total Value',
      align: 'right',
      render: (value) => <span className="value">{formatCurrency(Number(value || 0))}</span>
    },
    {
      key: 'status',
      title: 'Status',
      render: (_value, record) => (
        <span className={`status-badge ${record.quantity <= record.reorderLevel ? 'warning' : 'active'}`}>
          {record.quantity <= record.reorderLevel ? 'Low' : 'Healthy'}
        </span>
      )
    }
  ];

  return (
    <div className="inventory-tab">
      <div className="section-header">
        <h2>Inventory - {warehouse.name}</h2>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{inventory.length}</div>
          <div className="metric-label">SKUs</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{totalUnits.toLocaleString()}</div>
          <div className="metric-label">Total Units</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{formatCurrency(totalValue)}</div>
          <div className="metric-label">Stock Value</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{lowStockCount}</div>
          <div className="metric-label">Low Stock Items</div>
        </div>
      </div>

      <Table
        columns={columns as any[]}
        data={inventory}
        striped
        loading={loading}
        emptyText="No inventory records found for this warehouse."
      />
    </div>
  );
};

const OutletsTab: React.FC<{
  warehouse: Warehouse | null;
  loading: boolean;
}> = ({ warehouse, loading }) => {
  if (!warehouse) {
    return <div className="no-data">No warehouse selected</div>;
  }

  const outlets = warehouse.outlets || [];
  const columns: TableColumn<Outlet>[] = [
    {
      key: 'code',
      title: 'Outlet Code',
      render: (value) => String(value || '-')
    },
    {
      key: 'name',
      title: 'Name',
      render: (value) => String(value || '-')
    },
    {
      key: 'type',
      title: 'Type',
      render: (value) => String(value || '-')
    },
    {
      key: 'city',
      title: 'City',
      render: (_value, record) => record.address?.city || '-'
    },
    {
      key: 'contact',
      title: 'Contact',
      render: (_value, record) => record.contact?.phone || record.contact?.email || '-'
    },
    {
      key: 'status',
      title: 'Status',
      render: (_value, record) => (
        <span className={`status-badge ${record.isActive ? 'active' : 'inactive'}`}>
          {record.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  return (
    <div className="outlets-tab">
      <div className="section-header">
        <h2>Linked Outlets - {warehouse.name}</h2>
      </div>

      <Table
        columns={columns as any[]}
        data={outlets}
        striped
        loading={loading}
        emptyText="No outlets linked to this warehouse."
      />
    </div>
  );
};

interface WarehouseModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  warehouse?: Warehouse;
  onClose: () => void;
  onSubmit: (warehouseData: Record<string, unknown>) => void | Promise<void>;
}

const WarehouseModal: React.FC<WarehouseModalProps> = ({
  isOpen,
  mode,
  warehouse,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: warehouse?.name || '',
    code: warehouse?.code || '',
    address: {
      street: warehouse?.address?.street || '',
      city: warehouse?.address?.city || '',
      state: warehouse?.address?.state || '',
      country: warehouse?.address?.country || 'Nigeria',
      postalCode: warehouse?.address?.postalCode || ''
    },
    contact: {
      phone: warehouse?.contact?.phone || '',
      email: warehouse?.contact?.email || '',
      manager: warehouse?.contact?.manager || ''
    },
    capacity: warehouse?.capacity || 1000,
    isActive: warehouse?.isActive ?? true
  });

  useEffect(() => {
    setFormData({
      name: warehouse?.name || '',
      code: warehouse?.code || '',
      address: {
        street: warehouse?.address?.street || '',
        city: warehouse?.address?.city || '',
        state: warehouse?.address?.state || '',
        country: warehouse?.address?.country || 'Nigeria',
        postalCode: warehouse?.address?.postalCode || ''
      },
      contact: {
        phone: warehouse?.contact?.phone || '',
        email: warehouse?.contact?.email || '',
        manager: warehouse?.contact?.manager || ''
      },
      capacity: warehouse?.capacity || 1000,
      isActive: warehouse?.isActive ?? true
    });
  }, [warehouse, mode, isOpen]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;

    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData((previous) => ({
        ...previous,
        address: { ...previous.address, [field]: value }
      }));
      return;
    }

    if (name.startsWith('contact.')) {
      const field = name.split('.')[1];
      setFormData((previous) => ({
        ...previous,
        contact: { ...previous.contact, [field]: value }
      }));
      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]:
        name === 'capacity'
          ? Number(value)
          : name === 'isActive'
          ? value === 'true'
          : value
    }));
  };

  const formId = `warehouse-form-${mode}`;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create New Warehouse' : 'Edit Warehouse'}
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" form={formId}>
            {mode === 'create' ? 'Create Warehouse' : 'Update Warehouse'}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="warehouse-form">
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
              placeholder="e.g., WH-LAG"
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
      </form>
    </Modal>
  );
};

const WarehouseDetailsModal: React.FC<{
  warehouse: Warehouse | null;
  onClose: () => void;
}> = ({ warehouse, onClose }) => {
  return (
    <Modal isOpen={Boolean(warehouse)} onClose={onClose} title="Warehouse Details" size="md">
      {warehouse ? (
        <div className="details-section">
          <div className="detail-card">
            <div className="detail-item">
              <label>Name:</label>
              <span>{warehouse.name}</span>
            </div>
            <div className="detail-item">
              <label>Code:</label>
              <span>{warehouse.code}</span>
            </div>
            <div className="detail-item">
              <label>Manager:</label>
              <span>{warehouse.contact?.manager || '-'}</span>
            </div>
            <div className="detail-item">
              <label>Contact:</label>
              <span>
                {warehouse.contact?.phone || 'No phone'} | {warehouse.contact?.email || 'No email'}
              </span>
            </div>
            <div className="detail-item">
              <label>Address:</label>
              <span>
                {[
                  warehouse.address?.street,
                  warehouse.address?.city,
                  warehouse.address?.state,
                  warehouse.address?.postalCode
                ]
                  .filter(Boolean)
                  .join(', ') || 'No address information'}
              </span>
            </div>
            <div className="detail-item">
              <label>Status:</label>
              <span className={`status-badge ${warehouse.isActive ? 'active' : 'inactive'}`}>
                {warehouse.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="detail-item">
              <label>Capacity:</label>
              <span>{warehouse.capacity.toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <label>Current Utilization:</label>
              <span>{warehouse.currentUtilization.toLocaleString()}</span>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};

const getInventoryItems = (warehouse: Warehouse | null): InventoryItem[] => {
  if (!warehouse) {
    return [];
  }

  const rawInventory = Array.isArray((warehouse as { inventory?: unknown[] }).inventory)
    ? ((warehouse as { inventory: unknown[] }).inventory ?? [])
    : [];

  return rawInventory.map((rawItem, index) => {
    const item = rawItem as Record<string, unknown>;
    const product = (item.product || {}) as Record<string, unknown>;
    const quantity = numberValue(item.quantity ?? item.stock ?? item.currentStock);
    const unitPrice = numberValue(item.unitPrice ?? item.price ?? item.costPrice);
    const reorderLevel = numberValue(item.reorderLevel ?? item.minStock);

    return {
      id: stringValue(item._id ?? item.id, `inventory-${index}`),
      sku: stringValue(item.sku ?? product.sku, `SKU-${index + 1}`),
      productName: stringValue(item.name ?? product.name, 'Unnamed Item'),
      category: stringValue(item.category ?? product.category, 'General'),
      quantity,
      reorderLevel,
      unitPrice,
      totalValue: numberValue(item.totalValue, quantity * unitPrice)
    };
  });
};

const stringValue = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.trim().length > 0 ? value : fallback;

const numberValue = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);

const getWarehouseDeleteErrorMessage = (error: unknown): string => {
  const typedError = error as ApiErrorWithDetails;
  const baseMessage =
    typedError?.message ||
    'Cannot delete warehouse. Remove all linked outlets and products first.';
  const linkedOutlets = typedError?.details?.linkedOutlets;
  const linkedProducts = typedError?.details?.linkedProducts;

  if (typeof linkedOutlets === 'number' || typeof linkedProducts === 'number') {
    const outletsCount = typeof linkedOutlets === 'number' ? linkedOutlets : 0;
    const productsCount = typeof linkedProducts === 'number' ? linkedProducts : 0;
    return `${baseMessage} Linked outlets: ${outletsCount}, linked products: ${productsCount}.`;
  }

  return baseMessage;
};

export default WarehouseModule;
