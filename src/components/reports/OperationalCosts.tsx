import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { reportApi } from '../../lib/api/reportApi';
import type { OperationalCost, ReportFilters } from '../../types/reports';
import { formatCurrency } from '../../lib/utils/utils';
import './reports.css';

interface OperationalCostsProps {
  filters: ReportFilters;
}

const initialForm = {
  name: '',
  amount: '',
  category: 'operations',
  notes: '',
  startDate: '',
  endDate: ''
};

const normalizeOperationalCost = (item: any): OperationalCost => ({
  id: item._id || item.id,
  name: item.name,
  amount: Number(item.amount || 0),
  category: item.category || 'operations',
  notes: item.notes,
  startDate: item.startDate,
  endDate: item.endDate,
  createdAt: item.createdAt
});

const OperationalCosts: React.FC<OperationalCostsProps> = ({ filters }) => {
  const [costs, setCosts] = useState<OperationalCost[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const loadCosts = async () => {
    setLoading(true);
    try {
      const response = await reportApi.getOperationalCosts(filters);
      setCosts((response.data || []).map(normalizeOperationalCost));
    } catch (error) {
      console.error('Failed to load operational costs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCosts();
  }, [filters.endDate, filters.outletId, filters.startDate]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await reportApi.getOperationalCostCategories();
        const nextCategories = (response.data || [])
          .filter((category: any) => category.isActive !== false)
          .map((category: any) => ({
            id: category._id || category.id || category.name,
            name: category.name
          }));
        setCategories(nextCategories);
        setFormData((current) => ({
          ...current,
          category: current.category || nextCategories[0]?.name || ''
        }));
      } catch (error) {
        console.error('Failed to load operational cost categories:', error);
      }
    };

    void loadCategories();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await reportApi.createOperationalCost({
        ...formData,
        amount: Number(formData.amount),
        outletId: filters.outletId || undefined
      });
      setFormData(initialForm);
      toast.success('Operational cost saved');
      await loadCosts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save operational cost');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this operational cost?')) {
      return;
    }
    try {
      await reportApi.deleteOperationalCost(id);
      toast.success('Operational cost deleted');
      await loadCosts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete operational cost');
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1 className="reports-title">Operational Costs</h1>
        <p className="reports-subtitle">Manage operating expenses that affect profit and loss.</p>
      </div>

      <div className="chart-card" style={{ marginBottom: '1.5rem' }}>
        <div className="chart-header">
          <h3 className="chart-title">Add Operational Cost</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="product-form__grid">
            <div className="product-form__group">
              <label className="product-form__label">Name</label>
              <input className="product-form__input" value={formData.name} onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))} />
            </div>
            <div className="product-form__group">
              <label className="product-form__label">Amount</label>
              <input type="number" step="0.01" className="product-form__input" value={formData.amount} onChange={(event) => setFormData((current) => ({ ...current, amount: event.target.value }))} />
            </div>
            <div className="product-form__group">
              <label className="product-form__label">Category</label>
              <select className="product-form__select" value={formData.category} onChange={(event) => setFormData((current) => ({ ...current, category: event.target.value }))}>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="product-form__group">
              <label className="product-form__label">Start Date</label>
              <input type="date" className="product-form__input" value={formData.startDate} onChange={(event) => setFormData((current) => ({ ...current, startDate: event.target.value }))} />
            </div>
            <div className="product-form__group">
              <label className="product-form__label">End Date</label>
              <input type="date" className="product-form__input" value={formData.endDate} onChange={(event) => setFormData((current) => ({ ...current, endDate: event.target.value }))} />
            </div>
          </div>
          <div className="product-form__group" style={{ marginTop: '1rem' }}>
            <label className="product-form__label">Notes</label>
            <textarea className="product-form__textarea" rows={3} value={formData.notes} onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))} />
          </div>
          <div className="product-form__footer">
            <button type="submit" className="pos-cart__action-btn pos-cart__action-btn--primary" disabled={saving}>
              <Plus size={16} />
              {saving ? 'Saving...' : 'Add Cost'}
            </button>
          </div>
        </form>
      </div>

      <div className="data-table-section">
        <div className="table-header">
          <h3 className="table-title">Operational Cost Entries</h3>
        </div>
        {loading ? (
          <div className="reports-empty">
            <h3 className="reports-empty-text">Loading operational costs...</h3>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Period</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {costs.map((cost) => (
                <tr key={cost.id}>
                  <td>{cost.name}</td>
                  <td>{cost.category}</td>
                  <td>{formatCurrency(cost.amount)}</td>
                  <td>{cost.startDate || '-'} {cost.endDate ? `to ${cost.endDate}` : ''}</td>
                  <td>
                    <button className="pagination-btn" onClick={() => handleDelete(cost.id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OperationalCosts;
