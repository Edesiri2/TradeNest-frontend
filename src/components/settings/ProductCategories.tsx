import React, { useEffect, useMemo, useState } from 'react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { productAPI } from '../../lib/api/productApi';
import { Button, ConfirmDialog, Input, Modal, Table } from '../ui';

interface ProductCategory {
  _id?: string;
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const ProductCategories: React.FC = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductCategory | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productAPI.getProductCategories();
      const mapped = (response.data || []).map((item: any) => ({
        id: item._id || item.id || item.name,
        _id: item._id,
        name: item.name || item.category || '',
        description: item.description || '',
        isActive: item.isActive ?? true,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));
      setCategories(mapped);
    } catch (loadError: any) {
      setError(loadError.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
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
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
    setSelectedCategory(null);
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await productAPI.createProductCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive
      });
      setShowCreateModal(false);
      resetForm();
      await loadCategories();
    } catch (createError: any) {
      setError(createError.message || 'Failed to create category');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = async (category: ProductCategory) => {
    setError(null);
    try {
      const response = await productAPI.getProductCategory(category.id);
      const item = response.data || category;
      const hydrated: ProductCategory = {
        id: item._id || item.id || category.id,
        _id: item._id,
        name: item.name || category.name,
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
      await productAPI.updateProductCategory(selectedCategory.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive
      });
      setShowEditModal(false);
      resetForm();
      await loadCategories();
    } catch (updateError: any) {
      setError(updateError.message || 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    setError(null);
    try {
      await productAPI.deleteProductCategory(deleteTarget.id);
      setDeleteTarget(null);
      await loadCategories();
    } catch (deleteError: any) {
      setError(deleteError.message || 'Failed to delete category');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      title: 'Category',
      render: (value: string, record: ProductCategory) => (
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
      render: (_value: unknown, record: ProductCategory) => (
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
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Product Category</h1>
        <p className="text-gray-600">Create and maintain product categories used across inventory.</p>
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
        <Table
          columns={columns}
          data={filteredCategories}
          loading={loading}
          emptyText="No product categories found"
        />
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Product Category"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} isLoading={saving}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(event) => setFormData((previous) => ({ ...previous, name: event.target.value }))}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(event) => setFormData((previous) => ({ ...previous, description: event.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(event) => setFormData((previous) => ({ ...previous, isActive: event.target.checked }))}
            />
            Active category
          </label>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Product Category"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdate} isLoading={saving}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            value={formData.name}
            onChange={(event) => setFormData((previous) => ({ ...previous, name: event.target.value }))}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(event) => setFormData((previous) => ({ ...previous, description: event.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(event) => setFormData((previous) => ({ ...previous, isActive: event.target.checked }))}
            />
            Active category
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name || ''}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={deleteLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ProductCategories;
