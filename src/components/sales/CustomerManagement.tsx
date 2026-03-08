import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useCustomerStore } from '../../lib/store/useCustomerStore';
import './sales.css';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  address: ''
};

const CustomerManagement: React.FC = () => {
  const { customers, loading, saving, fetchCustomers, createCustomer, updateCustomer, deleteCustomer } = useCustomerStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    void fetchCustomers({ search: searchTerm, limit: 50 });
  }, [fetchCustomers, searchTerm]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (editingId) {
        await updateCustomer(editingId, formData);
        toast.success('Customer updated');
      } else {
        await createCustomer({ ...formData, loyaltyPoints: 0 });
        toast.success('Customer created');
      }
      setFormData(initialForm);
      setEditingId(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save customer');
    }
  };

  const handleEdit = (customer: any) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || ''
    });
  };

  const handleDelete = async (customerId: string) => {
    if (!window.confirm('Delete this customer?')) {
      return;
    }
    try {
      await deleteCustomer(customerId);
      toast.success('Customer deleted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete customer');
    }
  };

  return (
    <div className="sales">
      <div className="sales__header">
        <h1 className="sales__title">Customer Management</h1>
        <p className="sales__subtitle">Manage customer profiles, loyalty numbers, and bonus eligibility.</p>
      </div>

      <div className="reports-container">
        <div className="chart-card" style={{ marginBottom: '1.5rem' }}>
          <div className="chart-header">
            <h3 className="chart-title">{editingId ? 'Edit Customer' : 'New Customer'}</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="product-form__grid">
              <div className="product-form__group">
                <label className="product-form__label">Name</label>
                <input className="product-form__input" value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} />
              </div>
              <div className="product-form__group">
                <label className="product-form__label">Email</label>
                <input className="product-form__input" value={formData.email} onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))} />
              </div>
              <div className="product-form__group">
                <label className="product-form__label">Phone</label>
                <input className="product-form__input" value={formData.phone} onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))} />
              </div>
              {editingId && (
                <div className="product-form__group">
                  <label className="product-form__label">Loyalty Number</label>
                  <input
                    className="product-form__input"
                    value={customers.find((customer) => customer.id === editingId)?.loyaltyNumber || 'Generated automatically'}
                    disabled
                  />
                </div>
              )}
            </div>
            <div className="product-form__group" style={{ marginTop: '1rem' }}>
              <label className="product-form__label">Address</label>
              <textarea className="product-form__textarea" rows={3} value={formData.address} onChange={(event) => setFormData((current) => ({ ...current, address: event.target.value }))} />
            </div>
            <div className="product-form__footer">
              <button type="submit" className="pos-cart__action-btn pos-cart__action-btn--primary" disabled={saving}>
                {editingId ? <Save size={16} /> : <Plus size={16} />}
                {saving ? 'Saving...' : editingId ? 'Update Customer' : 'Create Customer'}
              </button>
            </div>
          </form>
        </div>

        <div className="sales-history">
          <div className="sales-history__header">
            <h3 className="sales-history__title">Customers</h3>
            <input
              type="text"
              className="product-form__input"
              style={{ maxWidth: '280px' }}
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          {loading ? (
            <div className="sales-empty">
              <p className="sales-empty__text">Loading customers...</p>
            </div>
          ) : (
            <table className="sales-history__table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Loyalty Number</th>
                  <th>Points</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.name}</td>
                    <td>{customer.email || customer.phone || '-'}</td>
                    <td>{customer.loyaltyNumber || '-'}</td>
                    <td>{customer.loyaltyPoints}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="pagination-btn" onClick={() => handleEdit(customer)}>Edit</button>
                        <button className="pagination-btn" onClick={() => handleDelete(customer.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement;
