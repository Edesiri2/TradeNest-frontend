import React, { useState, useEffect } from 'react';
import { X, Save, Package } from 'lucide-react';
import { productStore } from '../../lib/store/productStore';
import { PRODUCT_CATEGORIES } from '../../lib/constants';
import { generateSKU } from '../../lib/utils';
import { Button } from '../ui';
import { locationAPI } from '../../lib/locationApi'; // NEW IMPORT
import './inventory.css';

interface ProductFormProps {
  product?: any;
  onSave: () => void;
  onCancel: () => void;
}

interface Location {
  _id: string;
  id: string;
  name: string;
  code: string;
  isActive: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSave, onCancel }) => {
  const { addProduct, updateProduct, loading, error } = productStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    costPrice: '',
    sellingPrice: '',
    currentStock: '',
    lowStockAlert: '',
    supplierId: '',
    warehouseId: '1',
    locationType: '',
    locationId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [warehouses, setWarehouses] = useState<Location[]>([]);
  const [outlets, setOutlets] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState<boolean>(false); // NEW LOADING STATE

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        category: product.category,
        brand: product.brand,
        costPrice: product.costPrice.toString(),
        sellingPrice: product.sellingPrice.toString(),
        currentStock: product.currentStock.toString(),
        lowStockAlert: product.lowStockAlert.toString(),
        supplierId: product.supplierId || '',
        warehouseId: product.warehouseId,
        locationType: product.locationType || '',
        locationId: product.locationId || ''
      });
    } else {
      // Set default category for new product
      setFormData(prev => ({
        ...prev,
        category: PRODUCT_CATEGORIES[0],
        lowStockAlert: '5',
        currentStock: '0'
      }));
    }
  }, [product]);

  // UPDATED EFFECT TO FETCH LOCATIONS FROM ACTUAL API
  useEffect(() => {
    const fetchLocations = async () => {
      setLocationsLoading(true);
      try {
        // Fetch warehouses from actual API
        const warehousesResponse = await locationAPI.getWarehouses();
        const activeWarehouses = warehousesResponse.data
          .filter((warehouse: any) => warehouse.isActive)
          .map((warehouse: any) => ({
            _id: warehouse._id,
            id: warehouse._id,
            name: warehouse.name,
            code: warehouse.code,
            isActive: warehouse.isActive
          }));
        setWarehouses(activeWarehouses);

        // Fetch outlets from actual API
        const outletsResponse = await locationAPI.getOutlets();
        const activeOutlets = outletsResponse.data
          .filter((outlet: any) => outlet.isActive)
          .map((outlet: any) => ({
            _id: outlet._id,
            id: outlet._id,
            name: outlet.name,
            code: outlet.code,
            isActive: outlet.isActive
          }));
        setOutlets(activeOutlets);
      } catch (error) {
        console.error('Failed to fetch locations:', error);
        setFormError('Failed to load locations. Please try again.');
      } finally {
        setLocationsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) newErrors.costPrice = 'Valid cost price is required';
    if (!formData.sellingPrice || parseFloat(formData.sellingPrice) <= 0) newErrors.sellingPrice = 'Valid selling price is required';
    if (!formData.currentStock || parseInt(formData.currentStock) < 0) newErrors.currentStock = 'Valid stock quantity is required';
    if (!formData.lowStockAlert || parseInt(formData.lowStockAlert) <= 0) newErrors.lowStockAlert = 'Valid low stock alert is required';
    if (!formData.locationType) newErrors.locationType = 'Location type is required';
    if (!formData.locationId) newErrors.locationId = 'Location is required';

    if (parseFloat(formData.sellingPrice) < parseFloat(formData.costPrice)) {
      newErrors.sellingPrice = 'Selling price must be greater than cost price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!validateForm()) return;

    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      brand: formData.brand.trim(),
      costPrice: parseFloat(formData.costPrice),
      sellingPrice: parseFloat(formData.sellingPrice),
      currentStock: parseInt(formData.currentStock),
      lowStockAlert: parseInt(formData.lowStockAlert),
      supplierId: formData.supplierId || '',
      warehouseId: formData.warehouseId,
      locationType: formData.locationType,
      locationId: formData.locationId
    };

    try {
      if (product) {
        await updateProduct(product.id, productData);
      } else {
        await addProduct(productData);
      }
      onSave();
    } catch (error: any) {
      setFormError(error.message || 'Failed to save product');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear locationId when locationType changes
    if (field === 'locationType') {
      setFormData(prev => ({ ...prev, locationId: '' }));
      if (errors.locationId) {
        setErrors(prev => ({ ...prev, locationId: '' }));
      }
    }
    if (formError) {
      setFormError(null);
    }
  };

  return (
    <div className="product-form">
      <div className="product-form__header">
        <h2 className="product-form__title">
          <Package size={20} style={{ marginRight: '0.5rem' }} />
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
      </div>

      {/* Form Error */}
      {(error || formError) && (
        <div className="error-banner">
          {error || formError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="product-form__content">
          <div className="product-form__grid">
            <div className="product-form__group">
              <label className="product-form__label">Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="product-form__input"
                placeholder="Enter product name"
                disabled={loading}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="product-form__group">
              <label className="product-form__label">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="product-form__select"
                disabled={loading}
              >
                <option value="">Select Category</option>
                {PRODUCT_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && <span className="error-text">{errors.category}</span>}
            </div>

            <div className="product-form__group">
              <label className="product-form__label">Brand *</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                className="product-form__input"
                placeholder="Enter brand name"
                disabled={loading}
              />
              {errors.brand && <span className="error-text">{errors.brand}</span>}
            </div>

            <div className="product-form__group">
              <label className="product-form__label">Cost Price (₦) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => handleChange('costPrice', e.target.value)}
                className="product-form__input"
                placeholder="0.00"
                disabled={loading}
              />
              {errors.costPrice && <span className="error-text">{errors.costPrice}</span>}
            </div>

            <div className="product-form__group">
              <label className="product-form__label">Selling Price (₦) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.sellingPrice}
                onChange={(e) => handleChange('sellingPrice', e.target.value)}
                className="product-form__input"
                placeholder="0.00"
                disabled={loading}
              />
              {errors.sellingPrice && <span className="error-text">{errors.sellingPrice}</span>}
            </div>

            <div className="product-form__group">
              <label className="product-form__label">Current Stock *</label>
              <input
                type="number"
                value={formData.currentStock}
                onChange={(e) => handleChange('currentStock', e.target.value)}
                className="product-form__input"
                placeholder="0"
                disabled={loading}
              />
              {errors.currentStock && <span className="error-text">{errors.currentStock}</span>}
            </div>

            <div className="product-form__group">
              <label className="product-form__label">Low Stock Alert *</label>
              <input
                type="number"
                value={formData.lowStockAlert}
                onChange={(e) => handleChange('lowStockAlert', e.target.value)}
                className="product-form__input"
                placeholder="5"
                disabled={loading}
              />
              {errors.lowStockAlert && <span className="error-text">{errors.lowStockAlert}</span>}
            </div>

            {/* LOCATION FIELDS */}
            <div className="product-form__group">
              <label className="product-form__label">Location Type *</label>
              <select
                value={formData.locationType}
                onChange={(e) => handleChange('locationType', e.target.value)}
                className="product-form__select"
                disabled={loading || locationsLoading}
              >
                <option value="">Select Location Type</option>
                <option value="warehouse">Warehouse</option>
                <option value="outlet">Outlet</option>
              </select>
              {errors.locationType && <span className="error-text">{errors.locationType}</span>}
              {locationsLoading && <span className="loading-text">Loading locations...</span>}
            </div>

            <div className="product-form__group">
              <label className="product-form__label">
                {formData.locationType === 'warehouse' ? 'Warehouse' : 
                 formData.locationType === 'outlet' ? 'Outlet' : 'Location'} *
              </label>
              <select
                value={formData.locationId}
                onChange={(e) => handleChange('locationId', e.target.value)}
                className="product-form__select"
                disabled={loading || !formData.locationType || locationsLoading}
              >
                <option value="">Select {formData.locationType === 'warehouse' ? 'Warehouse' : 'Outlet'}</option>
                {formData.locationType === 'warehouse' && warehouses.map(warehouse => (
                  <option key={warehouse._id} value={warehouse._id}>
                    {warehouse.name} ({warehouse.code})
                  </option>
                ))}
                {formData.locationType === 'outlet' && outlets.map(outlet => (
                  <option key={outlet._id} value={outlet._id}>
                    {outlet.name} ({outlet.code})
                  </option>
                ))}
              </select>
              {errors.locationId && <span className="error-text">{errors.locationId}</span>}
              {formData.locationType && locationsLoading && (
                <span className="loading-text">Loading {formData.locationType}s...</span>
              )}
            </div>
          </div>

          <div className="product-form__group">
            <label className="product-form__label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="product-form__textarea"
              placeholder="Enter product description..."
              rows={3}
              disabled={loading}
            />
          </div>
        </div>

        <div className="product-form__footer">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            icon={X}
            disabled={loading || locationsLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            icon={Save}
            disabled={loading || locationsLoading}
          >
            {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;