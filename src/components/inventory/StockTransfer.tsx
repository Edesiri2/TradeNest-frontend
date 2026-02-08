import React, { useState } from 'react';
import { Truck, Plus, Minus, Search, Package, Trash2 } from 'lucide-react';
import { useInventoryStore } from '../../lib/store';
import { Button } from '../ui';
import './inventory.css';

const StockTransfer: React.FC = () => {
  const { products, warehouses, transferStock } = useInventoryStore();
  const [formData, setFormData] = useState({
    fromWarehouseId: '',
    toOutletId: '',
    notes: ''
  });
  const [transferItems, setTransferItems] = useState<Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
    availableStock: number;
  }>>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const availableProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addProductToTransfer = (product: any) => {
    if (transferItems.find(item => item.productId === product.id)) {
      alert('Product already added to transfer');
      return;
    }

    setTransferItems(prev => [...prev, {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      unitCost: product.costPrice,
      availableStock: product.currentStock
    }]);

    setSearchTerm('');
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const product = transferItems.find(item => item.productId === productId);
    if (product && newQuantity > product.availableStock) {
      alert(`Cannot transfer more than available stock (${product.availableStock})`);
      return;
    }

    setTransferItems(prev => prev.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeProduct = (productId: string) => {
    setTransferItems(prev => prev.filter(item => item.productId !== productId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fromWarehouseId || !formData.toOutletId) {
      alert('Please select source and destination');
      return;
    }

    if (transferItems.length === 0) {
      alert('Please add at least one product to transfer');
      return;
    }

    const transferData = {
      fromWarehouseId: formData.fromWarehouseId,
      toOutletId: formData.toOutletId,
      items: transferItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitCost: item.unitCost
      })),
      notes: formData.notes,
      status: 'pending'
      
    };

    transferStock(transferData);
    
    // Reset form
    setFormData({ fromWarehouseId: '', toOutletId: '', notes: '' });
    setTransferItems([]);
    setSearchTerm('');
    
    alert('Stock transfer created successfully!');
  };

  const totalItems = transferItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = transferItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

  return (
    <div className="stock-transfer">
      <div className="stock-transfer__header">
        <h2 className="stock-transfer__title">
          <Truck size={20} style={{ marginRight: '0.5rem' }} />
          Stock Transfer
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="stock-transfer__content">
          <div className="stock-transfer__grid">
            {/* Source and Destination */}
            <div className="stock-transfer__section">
              <h3 className="stock-transfer__section-title">Transfer Details</h3>
              
              <div className="product-form__group">
                <label className="product-form__label">From Warehouse *</label>
                <select
                  value={formData.fromWarehouseId}
                  onChange={(e) => setFormData(prev => ({ ...prev, fromWarehouseId: e.target.value }))}
                  className="product-form__select"
                  required
                >
                  <option value="">Select Source Warehouse</option>
                  {warehouses.map(warehouse => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name} - {warehouse.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="product-form__group">
                <label className="product-form__label">To Outlet *</label>
                <select
                  value={formData.toOutletId}
                  onChange={(e) => setFormData(prev => ({ ...prev, toOutletId: e.target.value }))}
                  className="product-form__select"
                  required
                >
                  <option value="">Select Destination Outlet</option>
                  <option value="1">Lagos Main Store</option>
                  <option value="2">Abuja Retail Store</option>
                </select>
              </div>

              <div className="product-form__group">
                <label className="product-form__label">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="product-form__textarea"
                  placeholder="Add any notes about this transfer..."
                  rows={2}
                />
              </div>
            </div>

            {/* Products Selection */}
            <div className="stock-transfer__section">
              <h3 className="stock-transfer__section-title">Products to Transfer</h3>
              
              {/* Search and Add Product */}
              <div className="stock-transfer__add-item">
                <div className="product-form__group" style={{ flex: 1 }}>
                  <label className="product-form__label">Add Product</label>
                  <div style={{ position: 'relative' }}>
                    <Search 
                      size={16} 
                      style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6b7280'
                      }} 
                    />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="product-form__input"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="Search products by name or SKU..."
                    />
                  </div>
                  
                  {/* Search Results */}
                  {searchTerm && availableProducts.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid var(--inventory-border)',
                      borderRadius: '0.5rem',
                      boxShadow: 'var(--card-shadow)',
                      zIndex: 10,
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}>
                      {availableProducts.map(product => (
                        <div
                          key={product.id}
                          onClick={() => addProductToTransfer(product)}
                          style={{
                            padding: '0.75rem 1rem',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--inventory-border)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{
                            width: '2rem',
                            height: '2rem',
                            borderRadius: '0.5rem',
                            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--inventory-primary)',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            {product.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                              {product.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                              {product.sku} • Stock: {product.currentStock}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Transfer Items List */}
              <div className="stock-transfer__items">
                {transferItems.map((item, index) => (
                  <div key={item.productId} className="stock-transfer__item">
                    <div className="stock-transfer__item-info">
                      <div className="stock-transfer__item-name">{item.productName}</div>
                      <div className="stock-transfer__item-sku">
                        Available: {item.availableStock} units
                      </div>
                    </div>
                    
                    <div className="stock-transfer__quantity">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="product-card__action"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                        className="stock-transfer__quantity-input"
                        min="1"
                        max={item.availableStock}
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="product-card__action"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeProduct(item.productId)}
                      className="product-card__action"
                      style={{ color: 'var(--inventory-error)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Transfer Summary */}
              {transferItems.length > 0 && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--inventory-border)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Items:</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{totalItems}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Value:</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                      ₦{totalValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="stock-transfer__footer">
          <Button type="button" variant="outline" onClick={() => {
            setFormData({ fromWarehouseId: '', toOutletId: '', notes: '' });
            setTransferItems([]);
          }}>
            Clear All
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            icon={Truck}
            disabled={transferItems.length === 0}
          >
            Create Transfer ({transferItems.length})
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StockTransfer;