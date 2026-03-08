import React, { useEffect, useMemo, useState } from 'react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { reportApi } from '../../lib/api/reportApi';
import { Button, ConfirmDialog, Input, Modal, Table } from '../ui';

interface OperationalCostCategory {
  _id?: string;
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const OperationalCostCategories: React.FC = () => {
  const [categories, setCategories] = useState<OperationalCostCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<OperationalCostCategory | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<OperationalCostCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportApi.getOperationalCostCategories();
      const mapped = (response.data || []).map((item: any) => ({
        id: item._id || item.id || item.name,
        _id: item._id,
        name: item.name,
        description: item.description || '',
        isActive: item.isActive ?? true,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));
      setCategories(mapped);
    } catch (loadError: any) {
      setError(loadError.message || 'Failed to load operational cost categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const term = search.toLowerCase();
    return categories.filter((category) =>
      category.name.toLowerCase().includes(term) ||
      (category.description || '').toLowerCase().includes(term)
    );
  }, [categories, search]);

  const resetForm = () => {
    setSelectedCategory(null);
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await reportApi.createOperationalCostCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive
      });
      setShowCreateModal(false);
      resetForm();
      await loadCategories();
    } catch (createError: any) {
      setError(createError.message || 'Failed to create operational cost category');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = async (category: OperationalCostCategory) => {
    setError(null);
    try {
      const response = await reportApi.getOperationalCostCategory(category.id);
      const item = response.data || category;
      const hydrated = {
        id: item._id || item.id || category.id,
        _id: item._id,
        name: item.name,
        description: item.description || '',
        isActive: item.isActive ?? true
      };
      setSelectedCategory(hydrated);
      setFormData({
        name: hydrated.name,
        description: hydrated.description || '',
        isActive: hydrated.isActive ?? true
      });
      setShowEditModal(true);
    } catch {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        isActive: category.isActive ?? true
      });
      setShowEditModal(true);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCategory || !formData.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await reportApi.updateOperationalCostCategory(selectedCategory.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive
      });
      setShowEditModal(false);
      resetForm();
      await loadCategories();
    } catch (updateError: any) {
      setError(updateError.message || 'Failed to update operational cost category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setError(null);
    try {
      await reportApi.deleteOperationalCostCategory(deleteTarget.id);
      setDeleteTarget(null);
      await loadCategories();
    } catch (deleteError: any) {
      setError(deleteError.message || 'Failed to delete operational cost category');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      title: 'Category',
      render: (value: string, record: OperationalCostCategory) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          {record.description && <div className="text-xs text-gray-500">{record.description}</div>}
        </div>
      )
    },
    {
      key: 'isActive',
      title: 'Status',
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs ${value ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'updatedAt',
      title: 'Updated',
      render: (value: string) => (value ? new Date(value).toLocaleDateString() : 'N/A')
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_value: unknown, record: OperationalCostCategory) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => openEdit(record)}>
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(record)}>
            <Trash2 size={16} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Operational Cost Categories</h1>
        <p className="text-gray-600">Create and maintain operational cost categories used in expense tracking.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            icon={Search}
          />
          <div />
          <div className="flex justify-end">
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
            >
              Add Category
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table columns={columns} data={filteredCategories} loading={loading} emptyText="No operational cost categories found" />
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Operational Cost Category"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} isLoading={saving}>Create</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Category Name" value={formData.name} onChange={(event) => setFormData((previous) => ({ ...previous, name: event.target.value }))} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(event) => setFormData((previous) => ({ ...previous, description: event.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={formData.isActive} onChange={(event) => setFormData((previous) => ({ ...previous, isActive: event.target.checked }))} />
            Active category
          </label>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Operational Cost Category"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleUpdate} isLoading={saving}>Save Changes</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Category Name" value={formData.name} onChange={(event) => setFormData((previous) => ({ ...previous, name: event.target.value }))} required />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(event) => setFormData((previous) => ({ ...previous, description: event.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={formData.isActive} onChange={(event) => setFormData((previous) => ({ ...previous, isActive: event.target.checked }))} />
            Active category
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={deleteTarget ? `Delete "${deleteTarget.name}"?` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default OperationalCostCategories;
