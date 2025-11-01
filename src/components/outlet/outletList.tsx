import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Store, MapPin, Phone, Mail } from 'lucide-react';
import { useOutletStore } from '../../lib/store/outletStore';
import { Button } from '../ui';
import './outlets.css';

interface OutletListProps {
  onEditOutlet: (outlet: any) => void;
  onAddOutlet: () => void;
}

const OutletList: React.FC<OutletListProps> = ({ onEditOutlet, onAddOutlet }) => {
  const { 
    outlets, 
    outletTypes, 
    loading, 
    error, 
    pagination,
    fetchOutlets, 
    deleteOutlet,
    fetchOutletTypes 
  } = useOutletStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOutlets({ page: currentPage });
    fetchOutletTypes();
  }, [fetchOutlets, fetchOutletTypes, currentPage]);

  useEffect(() => {
    const params: any = { page: 1 };
    if (searchTerm) params.search = searchTerm;
    if (typeFilter !== 'all') params.type = typeFilter;
    if (warehouseFilter !== 'all') params.warehouse = warehouseFilter;
    
    fetchOutlets(params);
    setCurrentPage(1);
  }, [searchTerm, typeFilter, warehouseFilter, fetchOutlets]);

  const handleDelete = async (outletId: string, outletName: string) => {
    if (window.confirm(`Are you sure you want to delete "${outletName}"?`)) {
      try {
        await deleteOutlet(outletId);
      } catch (error) {
        console.error('Failed to delete outlet:', error);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchOutlets({ 
      page: newPage, 
      search: searchTerm, 
      type: typeFilter !== 'all' ? typeFilter : undefined,
      warehouse: warehouseFilter !== 'all' ? warehouseFilter : undefined
    });
  };

  const getWarehouses = () => {
    const warehouses = outlets
      .map(outlet => typeof outlet.warehouse === 'object' ? outlet.warehouse : null)
      .filter(Boolean)
      .reduce((unique: any[], warehouse) => {
        if (!unique.find(w => w.id === warehouse!.id)) {
          unique.push(warehouse);
        }
        return unique;
      }, []);
    
    return warehouses;
  };

  if (loading && outlets.length === 0) {
    return <div className="outlet-loading">Loading outlets...</div>;
  }

  if (error) {
    return (
      <div className="outlet-error">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="outlets">
      {/* Header */}
      <div className="outlets__header">
        <div className="outlets__header-content">
          <div className="outlets__title-section">
            <Store size={32} className="outlets__title-icon" />
            <div>
              <h1 className="outlets__title">Outlet Management</h1>
              <p className="outlets__subtitle">
                Manage your retail outlets, locations, and operations
              </p>
            </div>
          </div>
          <Button onClick={onAddOutlet} icon={Plus} variant="primary" size="lg">
            Add Outlet
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="outlets__filters">
        <div className="outlets__search">
          <Search className="outlets__search-icon" size={20} />
          <input
            type="text"
            placeholder="Search outlets by name, code, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outlets__search-input"
          />
        </div>

        <div className="outlets__filter-group">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="outlets__filter-select"
          >
            <option value="all">All Types</option>
            {outletTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="outlets__filter-select"
          >
            <option value="all">All Warehouses</option>
            {getWarehouses().map(warehouse => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Outlets Grid */}
      <div className="outlets-grid">
        {outlets.map((outlet) => (
          <div key={outlet.id} className="outlet-card">
            <div className="outlet-card__header">
              <div className="outlet-card__icon">
                <Store size={24} />
              </div>
              <div className="outlet-card__info">
                <h3 className="outlet-card__name">{outlet.name}</h3>
                <div className="outlet-card__meta">
                  <span className="outlet-card__code">{outlet.code}</span>
                  <span className={`outlet-card__type ${outlet.type.toLowerCase().replace(' ', '-')}`}>
                    {outlet.type}
                  </span>
                </div>
              </div>
            </div>

            <div className="outlet-card__content">
              <div className="outlet-card__detail">
                <MapPin size={16} />
                <span>
                  {[outlet.address.street, outlet.address.city, outlet.address.state]
                    .filter(Boolean).join(', ')}
                </span>
              </div>
              
              {outlet.contact.phone && (
                <div className="outlet-card__detail">
                  <Phone size={16} />
                  <span>{outlet.contact.phone}</span>
                </div>
              )}

              {outlet.contact.email && (
                <div className="outlet-card__detail">
                  <Mail size={16} />
                  <span>{outlet.contact.email}</span>
                </div>
              )}

              {outlet.contact.manager && (
                <div className="outlet-card__detail">
                  <span className="outlet-card__manager">Manager: {outlet.contact.manager}</span>
                </div>
              )}

              <div className="outlet-card__warehouse">
                <span className="outlet-card__warehouse-label">Warehouse:</span>
                <span className="outlet-card__warehouse-name">
                  {typeof outlet.warehouse === 'object' ? outlet.warehouse.name : 'N/A'}
                </span>
              </div>

              <div className="outlet-card__hours">
                <span>Hours: {outlet.operatingHours.open} - {outlet.operatingHours.close}</span>
              </div>
            </div>

            <div className="outlet-card__footer">
              <div className="outlet-card__status">
                <span className={`status-badge ${outlet.isActive ? 'active' : 'inactive'}`}>
                  {outlet.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="outlet-card__actions">
                <button
                  onClick={() => onEditOutlet(outlet)}
                  className="outlet-card__action edit"
                  title="Edit outlet"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(outlet.id, outlet.name)}
                  className="outlet-card__action delete"
                  title="Delete outlet"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {outlets.length === 0 && !loading && (
        <div className="outlets-empty">
          <Store size={64} className="outlets-empty__icon" />
          <h3 className="outlets-empty__title">No outlets found</h3>
          <p className="outlets-empty__description">
            {searchTerm || typeFilter !== 'all' || warehouseFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first outlet'
            }
          </p>
          {!searchTerm && typeFilter === 'all' && warehouseFilter === 'all' && (
            <Button onClick={onAddOutlet} icon={Plus} variant="primary">
              Add First Outlet
            </Button>
          )}
        </div>
      )}

      {/* Pagination */}
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
    </div>
  );
};

export default OutletList;