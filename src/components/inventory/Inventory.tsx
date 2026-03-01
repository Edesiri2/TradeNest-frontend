import React, { useEffect, useState } from 'react';
import { List, Plus, Clock } from 'lucide-react';
import { Button } from '../ui';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import StockTransfer from './StockTransfer';
import PendingProducts from './PendingProducts';
import { locationAPI } from '../../lib/api/locationApi';
import { useAuthStore } from '../../lib/store/useAuthStore';
import './inventory.css';

type InventoryView = 'list' | 'add' | 'edit' | 'transfer' | 'pending';

interface LocationOption {
  id: string;
  name: string;
  code: string;
}

const Inventory: React.FC = () => {
  const { user } = useAuthStore();
  const [currentView, setCurrentView] = useState<InventoryView>('list');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [locationTypeFilter, setLocationTypeFilter] = useState<'all' | 'warehouse' | 'outlet'>('outlet');
  const [locationIdFilter, setLocationIdFilter] = useState('all');
  const [warehouses, setWarehouses] = useState<LocationOption[]>([]);
  const [outlets, setOutlets] = useState<LocationOption[]>([]);

  const selectedLocations = locationTypeFilter === 'warehouse' ? warehouses : outlets;
  const userOutletId = user?.outletId || user?.outlet?.id || '';
  const isSuperAdmin = user?.role?.name === 'super_admin';
  const isOutletScopedUser = Boolean(userOutletId) && !isSuperAdmin;

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const [warehousesResponse, outletsResponse] = await Promise.all([
          locationAPI.getWarehouses(),
          locationAPI.getOutlets()
        ]);

        setWarehouses(
          (warehousesResponse.data || [])
            .filter((warehouse: any) => warehouse.isActive)
            .map((warehouse: any) => ({
              id: warehouse._id,
              name: warehouse.name,
              code: warehouse.code
            }))
        );

        setOutlets(
          (outletsResponse.data || [])
            .filter((outlet: any) => outlet.isActive)
            .map((outlet: any) => ({
              id: outlet._id,
              name: outlet.name,
              code: outlet.code
            }))
        );
      } catch (locationError) {
        console.error('Failed to load inventory locations:', locationError);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    if (isOutletScopedUser) {
      setLocationTypeFilter('outlet');
      setLocationIdFilter(userOutletId);
    }
  }, [isOutletScopedUser, userOutletId]);

  useEffect(() => {
    if (isOutletScopedUser) {
      return;
    }
    setLocationIdFilter('all');
  }, [locationTypeFilter, isOutletScopedUser]);

  const handleEditProduct = (product: any) => {
    console.log('Editing product:', product);
    setSelectedProduct(product);
    setCurrentView('edit');
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setCurrentView('add');
  };

  const handleSaveProduct = () => {
    setCurrentView('list');
    setSelectedProduct(null);
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedProduct(null);
  };

  const renderView = () => {
    switch (currentView) {
      case 'list':
        return (
          <ProductList
            onEditProduct={handleEditProduct}
            onAddProduct={handleAddProduct}
            locationTypeFilter={locationTypeFilter}
            locationIdFilter={locationIdFilter}
          />
        );
      case 'add':
      case 'edit':
        return (
          <ProductForm
            product={selectedProduct}
            onSave={handleSaveProduct}
            onCancel={handleCancel}
          />
        );
      case 'transfer':
        return <StockTransfer />;
      case 'pending':
        return <PendingProducts />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* View Navigation */}
      {(currentView === 'list' || currentView === 'pending') && (
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '0 1.5rem'
        }}>
          <Button
            variant={currentView === 'list' ? 'primary' : 'outline'}
            icon={List}
            onClick={() => setCurrentView('list')}
          >
            Product List
          </Button>
          <Button
            variant={currentView === 'pending' ? 'primary' : 'outline'}
            icon={Clock}
            onClick={() => setCurrentView('pending')}
          >
            Pending Approval
          </Button>
          {/* <Button
            variant={currentView === 'list' ? 'primary' : 'outline'}
            icon={Truck}
            onClick={() => setCurrentView('list')}
          >
            Stock Transfer
          </Button> */}
          <div style={{ flex: 1 }} />
          {currentView === 'list' && (
            <>
              {/* <select
                value={locationTypeFilter}
                onChange={(event) =>
                  setLocationTypeFilter(event.target.value as 'all' | 'warehouse' | 'outlet')
                }
                className="inventory__filter-select"
              >
                <option value="all">All Location Types</option>
                <option value="warehouse">Warehouse</option>
                <option value="outlet">Outlet</option>
              </select> */}

              <select
                value={locationIdFilter}
                onChange={(event) => setLocationIdFilter(event.target.value)}
                className="inventory__filter-select"
                disabled={locationTypeFilter === 'all' || isOutletScopedUser}
              >
                {!isOutletScopedUser && <option value="all">All Locations</option>}
                {selectedLocations
                  .filter((location) => !isOutletScopedUser || location.id === userOutletId)
                  .map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name} ({location.code})
                    </option>
                  ))}
              </select>
            </>
          )}
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleAddProduct}
          >
            Add Product
          </Button>
        </div>
      )}

      {/* Current View */}
      {renderView()}
    </div>
  );
};

export default Inventory;
