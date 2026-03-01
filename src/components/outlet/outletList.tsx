import React, { useEffect, useMemo, useState } from 'react';
import { Edit, Link2, Plus, Search, Store, Trash2, Unlink } from 'lucide-react';
import { warehouseAPI } from '../../lib/api/warehouseApi';
import { useOutletStore } from '../../lib/store/outletStore';
import { Button, ConfirmDialog, Modal, Table } from '../ui';
import './outlets.css';

interface OutletListProps {
  onEditOutlet: (outlet: any) => void;
  onAddOutlet: () => void;
}

interface WarehouseOption {
  id: string;
  name: string;
  code: string;
}

interface OutletRecord {
  id: string;
  name: string;
  code: string;
  type: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    manager?: string;
  };
  warehouse?: string | { id?: string; _id?: string; name?: string; code?: string } | null;
  operatingHours?: {
    open?: string;
    close?: string;
  };
  isActive: boolean;
}

interface TableColumn<T> {
  key: keyof T | string;
  title: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, record: T) => React.ReactNode;
}

const OutletList: React.FC<OutletListProps> = ({ onEditOutlet, onAddOutlet }) => {
  const {
    outlets,
    outletTypes,
    loading,
    error,
    pagination,
    fetchOutlets,
    updateOutlet,
    deleteOutlet,
    fetchOutletTypes
  } = useOutletStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);

  const [linkingOutlet, setLinkingOutlet] = useState<OutletRecord | null>(null);
  const [linkWarehouseId, setLinkWarehouseId] = useState('');
  const [linkSubmitting, setLinkSubmitting] = useState(false);
  const [unlinkOutlet, setUnlinkOutlet] = useState<OutletRecord | null>(null);
  const [unlinkSubmitting, setUnlinkSubmitting] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<OutletRecord | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const buildFetchParams = (page = 1) => {
    const params: Record<string, unknown> = { page };
    if (searchTerm) params.search = searchTerm;
    if (typeFilter !== 'all') params.type = typeFilter;
    if (warehouseFilter !== 'all') params.warehouse = warehouseFilter;
    return params;
  };

  const refreshList = async (page = currentPage) => {
    await fetchOutlets(buildFetchParams(page));
  };

  useEffect(() => {
    fetchOutletTypes();
  }, [fetchOutletTypes]);

  useEffect(() => {
    const loadWarehouses = async () => {
      try {
        const response = await warehouseAPI.getWarehouses({ limit: 1000, active: true });
        const warehouseOptions = (response.data || []).map((warehouse: any) => ({
          id: warehouse._id || warehouse.id,
          name: warehouse.name,
          code: warehouse.code
        }));
        setWarehouses(warehouseOptions);
      } catch (loadError) {
        console.error('Failed to load warehouses:', loadError);
      }
    };

    loadWarehouses();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchOutlets(buildFetchParams(1));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, typeFilter, warehouseFilter, fetchOutlets]);

  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage);
    await fetchOutlets(buildFetchParams(newPage));
  };

  const resolveWarehouseId = (outlet: OutletRecord): string => {
    if (!outlet.warehouse) return '';
    if (typeof outlet.warehouse === 'string') return outlet.warehouse;
    return outlet.warehouse.id || outlet.warehouse._id || '';
  };

  const resolveWarehouseName = (outlet: OutletRecord): string => {
    if (!outlet.warehouse) return 'Standalone';
    if (typeof outlet.warehouse === 'string') {
      const match = warehouses.find((warehouse) => warehouse.id === outlet.warehouse);
      return match ? `${match.name} (${match.code})` : outlet.warehouse;
    }
    return outlet.warehouse.name || 'Linked';
  };

  const openLinkModal = (outlet: OutletRecord) => {
    setLinkingOutlet(outlet);
    setLinkWarehouseId(resolveWarehouseId(outlet));
  };

  const handleLinkOutlet = async () => {
    if (!linkingOutlet || !linkWarehouseId) return;

    setLinkSubmitting(true);
    try {
      await updateOutlet(linkingOutlet.id, { warehouse: linkWarehouseId });
      await refreshList();
      setLinkingOutlet(null);
      setLinkWarehouseId('');
    } catch (linkError) {
      console.error('Failed to link outlet:', linkError);
    } finally {
      setLinkSubmitting(false);
    }
  };

  const handleUnlinkOutlet = async () => {
    if (!unlinkOutlet) return;

    setUnlinkSubmitting(true);
    try {
      await updateOutlet(unlinkOutlet.id, { warehouse: null });
      await refreshList();
      setUnlinkOutlet(null);
    } catch (unlinkError) {
      console.error('Failed to unlink outlet:', unlinkError);
    } finally {
      setUnlinkSubmitting(false);
    }
  };

  const handleDeleteOutlet = async () => {
    if (!deleteCandidate) return;

    setDeleteSubmitting(true);
    try {
      await deleteOutlet(deleteCandidate.id);
      await refreshList();
      setDeleteCandidate(null);
    } catch (deleteError) {
      console.error('Failed to delete outlet:', deleteError);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const outletRows = useMemo(() => outlets as OutletRecord[], [outlets]);

  const columns: TableColumn<OutletRecord>[] = [
    {
      key: 'name',
      title: 'Outlet',
      render: (_value, record) => (
        <div>
          <div className="outlet-cell-title">{record.name}</div>
          <div className="outlet-cell-subtitle">{record.code}</div>
        </div>
      )
    },
    {
      key: 'type',
      title: 'Type'
    },
    {
      key: 'city',
      title: 'Location',
      render: (_value, record) =>
        [record.address?.street, record.address?.city, record.address?.state].filter(Boolean).join(', ') || '-'
    },
    {
      key: 'contact',
      title: 'Contact',
      render: (_value, record) => record.contact?.phone || record.contact?.email || '-'
    },
    {
      key: 'warehouse',
      title: 'Warehouse',
      render: (_value, record) => (
        <span className={`warehouse-badge ${resolveWarehouseId(record) ? 'linked' : 'standalone'}`}>
          {resolveWarehouseName(record)}
        </span>
      )
    },
    {
      key: 'hours',
      title: 'Hours',
      render: (_value, record) =>
        record.operatingHours?.open && record.operatingHours?.close
          ? `${record.operatingHours.open} - ${record.operatingHours.close}`
          : '-'
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
        <div className="outlet-row-actions">
          <button className="outlet-card__action edit" onClick={() => onEditOutlet(record)} title="Edit outlet">
            <Edit size={16} />
          </button>
          <button className="outlet-card__action link" onClick={() => openLinkModal(record)} title="Link outlet">
            <Link2 size={16} />
          </button>
          <button
            className="outlet-card__action unlink"
            onClick={() => setUnlinkOutlet(record)}
            title="Unlink outlet"
            disabled={!resolveWarehouseId(record)}
          >
            <Unlink size={16} />
          </button>
          <button
            className="outlet-card__action delete"
            onClick={() => setDeleteCandidate(record)}
            title="Delete outlet"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  if (loading && outlets.length === 0) {
    return <div className="outlet-loading">Loading outlets...</div>;
  }

  return (
    <div className="outlets">
      <div className="outlets__header">
        <div className="outlets__header-content">
          <div className="outlets__title-section">
            <Store size={32} className="outlets__title-icon" />
            <div>
              <h1 className="outlets__title">Outlet Management</h1>
              <p className="outlets__subtitle">Create standalone outlets or link them to warehouses.</p>
            </div>
          </div>
          <Button onClick={onAddOutlet} icon={Plus} variant="primary" size="lg">
            Add Outlet
          </Button>
        </div>
      </div>

      <div className="outlets__filters">
        <div className="outlets__search">
          <Search className="outlets__search-icon" size={20} />
          <input
            type="text"
            placeholder="Search outlets by name, code, or city..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="outlets__search-input"
          />
        </div>

        <div className="outlets__filter-group">
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="outlets__filter-select"
          >
            <option value="all">All Types</option>
            {outletTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={warehouseFilter}
            onChange={(event) => setWarehouseFilter(event.target.value)}
            className="outlets__filter-select"
          >
            <option value="all">All Warehouses</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="outlet-error">Error: {error}</div>}

      <Table
        columns={columns as any[]}
        data={outletRows}
        striped
        loading={loading}
        emptyText={
          <div className="outlets-empty">
            <Store size={64} className="outlets-empty__icon" />
            <h3 className="outlets-empty__title">No outlets found</h3>
            <p className="outlets-empty__description">
              {searchTerm || typeFilter !== 'all' || warehouseFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first outlet.'}
            </p>
            {!searchTerm && typeFilter === 'all' && warehouseFilter === 'all' && (
              <Button onClick={onAddOutlet} icon={Plus} variant="primary">
                Add First Outlet
              </Button>
            )}
          </div>
        }
      />

      {pagination.totalPages > 1 && (
        <div className="outlets-pagination">
          <button
            className="outlets-pagination__btn"
            disabled={!pagination.hasPrev}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>

          <span className="outlets-pagination__info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            className="outlets-pagination__btn"
            disabled={!pagination.hasNext}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

      <Modal
        isOpen={Boolean(linkingOutlet)}
        onClose={() => {
          setLinkingOutlet(null);
          setLinkWarehouseId('');
        }}
        title={`Link Outlet${linkingOutlet ? ` - ${linkingOutlet.name}` : ''}`}
        size="sm"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setLinkingOutlet(null);
                setLinkWarehouseId('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleLinkOutlet}
              disabled={!linkWarehouseId}
              isLoading={linkSubmitting}
            >
              Link Outlet
            </Button>
          </>
        }
      >
        <div className="outlet-link-modal">
          <label className="outlet-form__label">Select Warehouse</label>
          <select
            value={linkWarehouseId}
            onChange={(event) => setLinkWarehouseId(event.target.value)}
            className="outlet-form__select"
          >
            <option value="">Choose a warehouse</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name} ({warehouse.code})
              </option>
            ))}
          </select>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(unlinkOutlet)}
        title="Unlink Outlet"
        message={`Unlink "${unlinkOutlet?.name || ''}" from its warehouse?`}
        confirmLabel="Unlink"
        isLoading={unlinkSubmitting}
        onCancel={() => setUnlinkOutlet(null)}
        onConfirm={handleUnlinkOutlet}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteCandidate)}
        title="Delete Outlet"
        message={`Delete "${deleteCandidate?.name || ''}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteSubmitting}
        onCancel={() => setDeleteCandidate(null)}
        onConfirm={handleDeleteOutlet}
      />
    </div>
  );
};

export default OutletList;
