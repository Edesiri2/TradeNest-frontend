import React, { useState, useEffect } from 'react';
import { X, Save, Store, Clock } from 'lucide-react';
import { useOutletStore } from '../../lib/store/outletStore';
import { Button } from '../ui';
import './outlets.css';

interface OutletFormProps {
  outlet?: any;
  onSave: () => void;
  onCancel: () => void;
}

const OutletForm: React.FC<OutletFormProps> = ({ outlet, onSave, onCancel }) => {
  const { createOutlet, updateOutlet, loading, error, outletTypes } = useOutletStore();
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'Retail Store',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Nigeria',
      postalCode: ''
    },
    contact: {
      phone: '',
      email: '',
      manager: ''
    },
    warehouse: '',
    operatingHours: {
      open: '08:00',
      close: '18:00',
      timezone: 'WAT'
    },
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (outlet) {
      setFormData({
        name: outlet.name,
        code: outlet.code,
        type: outlet.type,
        address: {
          street: outlet.address.street || '',
          city: outlet.address.city,
          state: outlet.address.state || '',
          country: outlet.address.country || 'Nigeria',
          postalCode: outlet.address.postalCode || ''
        },
        contact: {
          phone: outlet.contact.phone || '',
          email: outlet.contact.email || '',
          manager: outlet.contact.manager || ''
        },
        warehouse: typeof outlet.warehouse === 'object' ? outlet.warehouse.id : outlet.warehouse,
        operatingHours: outlet.operatingHours,
        isActive: outlet.isActive
      });
    }
  }, [outlet]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Outlet name is required';
    if (!formData.code.trim()) newErrors.code = 'Outlet code is required';
    if (!formData.type) newErrors.type = 'Outlet type is required';
    if (!formData.warehouse) newErrors.warehouse = 'Warehouse assignment is required';
    if (!formData.address.city.trim()) newErrors.city = 'City is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!validateForm()) return;

    try {
      if (outlet) {
        await updateOutlet(outlet.id, formData);
      } else {
        await createOutlet(formData);
      }
      onSave();
    } catch (error: any) {
      setFormError(error.message || 'Failed to save outlet');
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }));
    } else if (field.startsWith('contact.')) {
      const contactField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact: { ...prev.contact, [contactField]: value }
      }));
    } else if (field.startsWith('operatingHours.')) {
      const hoursField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        operatingHours: { ...prev.operatingHours, [hoursField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (formError) {
      setFormError(null);
    }
  };

  return (
    <div className="outlet-form">
      <div className="outlet-form__header">
        <div className="outlet-form__title-section">
          <Store size={24} className="outlet-form__icon" />
          <h2 className="outlet-form__title">
            {outlet ? 'Edit Outlet' : 'Create New Outlet'}
          </h2>
        </div>
      </div>

      {(error || formError) && (
        <div className="outlet-form__error">
          {error || formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="outlet-form__content">
        <div className="outlet-form__section">
          <h3 className="outlet-form__section-title">Basic Information</h3>
          <div className="outlet-form__grid">
            <div className="outlet-form__group">
              <label className="outlet-form__label">Outlet Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="outlet-form__input"
                placeholder="Enter outlet name"
                disabled={loading}
              />
              {errors.name && <span className="outlet-form__error-text">{errors.name}</span>}
            </div>

            <div className="outlet-form__group">
              <label className="outlet-form__label">Outlet Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                className="outlet-form__input"
                placeholder="e.g., OUT_MALL"
                disabled={loading}
              />
              {errors.code && <span className="outlet-form__error-text">{errors.code}</span>}
            </div>

            <div className="outlet-form__group">
              <label className="outlet-form__label">Outlet Type *</label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="outlet-form__select"
                disabled={loading}
              >
                {outletTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.type && <span className="outlet-form__error-text">{errors.type}</span>}
            </div>

            <div className="outlet-form__group">
              <label className="outlet-form__label">Warehouse *</label>
              <input
                type="text"
                value={formData.warehouse}
                onChange={(e) => handleInputChange('warehouse', e.target.value)}
                className="outlet-form__input"
                placeholder="Enter warehouse ID"
                disabled={loading}
              />
              {errors.warehouse && <span className="outlet-form__error-text">{errors.warehouse}</span>}
            </div>
          </div>
        </div>

        <div className="outlet-form__section">
          <h3 className="outlet-form__section-title">Address Information</h3>
          <div className="outlet-form__grid">
            <div className="outlet-form__group">
              <label className="outlet-form__label">Street Address</label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                className="outlet-form__input"
                placeholder="Enter street address"
                disabled={loading}
              />
            </div>

            <div className="outlet-form__group">
              <label className="outlet-form__label">City *</label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
                className="outlet-form__input"
                placeholder="Enter city"
                disabled={loading}
              />
              {errors.city && <span className="outlet-form__error-text">{errors.city}</span>}
            </div>

            <div className="outlet-form__group">
              <label className="outlet-form__label">State</label>
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => handleInputChange('address.state', e.target.value)}
                className="outlet-form__input"
                placeholder="Enter state"
                disabled={loading}
              />
            </div>

            <div className="outlet-form__group">
              <label className="outlet-form__label">Postal Code</label>
              <input
                type="text"
                value={formData.address.postalCode}
                onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                className="outlet-form__input"
                placeholder="Enter postal code"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="outlet-form__section">
          <h3 className="outlet-form__section-title">Contact Information</h3>
          <div className="outlet-form__grid">
            <div className="outlet-form__group">
              <label className="outlet-form__label">Phone</label>
              <input
                type="tel"
                value={formData.contact.phone}
                onChange={(e) => handleInputChange('contact.phone', e.target.value)}
                className="outlet-form__input"
                placeholder="Enter phone number"
                disabled={loading}
              />
            </div>

            <div className="outlet-form__group">
              <label className="outlet-form__label">Email</label>
              <input
                type="email"
                value={formData.contact.email}
                onChange={(e) => handleInputChange('contact.email', e.target.value)}
                className="outlet-form__input"
                placeholder="Enter email address"
                disabled={loading}
              />
            </div>

            <div className="outlet-form__group">
              <label className="outlet-form__label">Manager</label>
              <input
                type="text"
                value={formData.contact.manager}
                onChange={(e) => handleInputChange('contact.manager', e.target.value)}
                className="outlet-form__input"
                placeholder="Enter manager name"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="outlet-form__section">
          <h3 className="outlet-form__section-title">
            <Clock size={18} style={{ marginRight: '0.5rem' }} />
            Operating Hours
          </h3>
          <div className="outlet-form__grid">
            <div className="outlet-form__group">
              <label className="outlet-form__label">Opening Time</label>
              <input
                type="time"
                value={formData.operatingHours.open}
                onChange={(e) => handleInputChange('operatingHours.open', e.target.value)}
                className="outlet-form__input"
                disabled={loading}
              />
            </div>

            <div className="outlet-form__group">
              <label className="outlet-form__label">Closing Time</label>
              <input
                type="time"
                value={formData.operatingHours.close}
                onChange={(e) => handleInputChange('operatingHours.close', e.target.value)}
                className="outlet-form__input"
                disabled={loading}
              />
            </div>

            <div className="outlet-form__group">
              <label className="outlet-form__label">Status</label>
              <select
                value={formData.isActive.toString()}
                onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
                className="outlet-form__select"
                disabled={loading}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="outlet-form__actions">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            icon={X}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            icon={Save}
            disabled={loading}
          >
            {loading ? 'Saving...' : (outlet ? 'Update Outlet' : 'Create Outlet')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OutletForm;