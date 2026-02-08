import React, { useState } from 'react';
import { Package, List, Truck, Plus, Clock } from 'lucide-react';
import { Button } from '../ui';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import StockTransfer from './StockTransfer';
import PendingProducts from './PendingProducts';
import './inventory.css';

type InventoryView = 'list' | 'add' | 'edit' | 'transfer' | 'pending';
type CurrentViewType = 'list' | 'transfer' | 'pending';
const Inventory: React.FC = () => {
  const [currentView, setCurrentView] = useState<InventoryView>('list');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

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